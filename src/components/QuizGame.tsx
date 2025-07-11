import React, { useState, useEffect, useCallback } from 'react'
import { fetchRandomQuestions } from '../lib/fetchQuestions.js'
import { updateQuestionStats } from '../lib/updateQuestionStats.js'
import { 
  updateAnswerStatistics, 
  getAnswerPercentages, 
  saveStatistics, 
  loadStatistics 
} from '../utils/statistics.js'
import { startQuizSession, completeQuizSession, recordQuestionAttempt } from '../lib/quizTracking.js'
import { supabase } from '../lib/supabase.js'
import type { Question, QuizResults, User } from '../types'

// ✨ EXAMPLE: Clean auto-generated type syntax (from your database.types.ts)
// import { Database } from '../types/database.types'
// type Question = Database['public']['Tables']['questions']['Row']
// type QuizSession = Database['public']['Tables']['quiz_sessions']['Row'] 
// type QuestionAttempt = Database['public']['Tables']['question_attempts']['Row']
// Much cleaner than: Database['public']['Tables']['questions']['Row'] everywhere!

export default function QuizGame({ onComplete, user }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  
  // 🆕 Enhanced tracking state
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [responseTimes, setResponseTimes] = useState([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [questionAttempts, setQuestionAttempts] = useState([])

  // Function to randomly select 10 questions from all available questions
  const selectRandomQuestions = (allQuestions, count = 10) => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Load questions with statistics on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      try {
        // Fetch questions from Supabase
        const fetched = await fetchRandomQuestions(50) // grab up to 50 then shuffle
        // Merge local statistics (from localStorage) with fetched data
        const questionsWithStats = loadStatistics(fetched)
        const randomQuestions = selectRandomQuestions(questionsWithStats, 10)
        setQuestions(randomQuestions)
        
        // Start quiz session tracking
        if (user?.id) {
          const currentTime = new Date().toISOString()
          setStartTime(currentTime)
          const newSessionId = await startQuizSession(user.id)
          setSessionId(newSessionId)
        }
      } catch (error) {
        console.error("Failed to load questions:", error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [user?.id])

  // 🆕 Start timing when question loads
  useEffect(() => {
    if (questions.length > 0 && !isAnswered) {
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestionIndex, questions, isAnswered])

  const currentQuestion = questions[currentQuestionIndex]

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isAnswered) {
      // Time's up - show result and record as unanswered
      setIsAnswered(true)
      setShowResult(true)
      
      // Update stats for unanswered question
      handleAnswerSelect(null)
    }
  }, [timeLeft, isAnswered])

  const handleAnswerSelect = async (answerIndex) => {
    if (isAnswered) return
    
    // 🆕 Calculate response time
    const responseTime = questionStartTime ? Date.now() - questionStartTime : 0
    setResponseTimes(prev => [...prev, responseTime])
    
    setSelectedAnswer(answerIndex)
    setIsAnswered(true)
    setShowResult(true)
    
    // 🆕 Record detailed question attempt
    const isCorrect = answerIndex === currentQuestion.correctAnswer
    if (sessionId && user?.id) {
      await recordQuestionAttempt(
        sessionId,
        user.id,
        currentQuestion,
        answerIndex,
        responseTime
      )
    }
    
    // 🆕 Update streak tracking
    if (isCorrect) {
      const newStreak = currentStreak + 1
      setCurrentStreak(newStreak)
      setBestStreak(prev => Math.max(prev, newStreak))
    } else {
      setCurrentStreak(0)
    }
    
    // Store question attempt for summary
    setQuestionAttempts(prev => [...prev, {
      question: currentQuestion,
      selectedAnswer: answerIndex,
      isCorrect,
      responseTime
    }])
    
    // Update global statistics in Supabase (legacy support)
    try {
      await updateQuestionStats(currentQuestion.id, answerIndex)
      
      // Also update local state for immediate UI feedback
      const updatedQuestions = updateAnswerStatistics(questions, currentQuestion.id, answerIndex)
      setQuestions(updatedQuestions)
    } catch (error) {
      console.error('Failed to update question stats:', error)
      // Still update local state even if Supabase update fails
      const updatedQuestions = updateAnswerStatistics(questions, currentQuestion.id, answerIndex)
      setQuestions(updatedQuestions)
    }
    
    // Calculate score based on difficulty and track correct answers
    if (answerIndex === currentQuestion.correctAnswer) {
      const points = currentQuestion.difficulty * 10
      setScore(prev => prev + points)
      setCorrectAnswers(prev => prev + 1)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(10)
      setShowResult(false)
      setIsAnswered(false)
    } else {
      // 🆕 Calculate enhanced quiz metrics
      const averageResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : 0
      
      // Quiz completed - save session data
      if (sessionId && startTime) {
        const quizResults = {
          score,
          correctAnswers,
          totalQuestions: questions.length,
          startTime,
          // 🆕 Enhanced metrics
          bestStreak,
          averageResponseTime
        }
        
        await completeQuizSession(sessionId, quizResults)
      }
      
      // 🆕 Pass enhanced quiz data to completion handler
      onComplete({
        score,
        correctAnswers,
        totalQuestions: questions.length,
        accuracy: Math.round((correctAnswers / questions.length) * 100),
        // Enhanced metrics
        bestStreak,
        averageResponseTime,
        responseTimes,
        questionAttempts,
        categoryBreakdown: calculateCategoryBreakdown(questionAttempts)
      })
    }
  }

  // 🆕 Calculate category performance breakdown
  const calculateCategoryBreakdown = (attempts) => {
    const breakdown = {}
    attempts.forEach(attempt => {
      const category = attempt.question.category
      if (!breakdown[category]) {
        breakdown[category] = {
          total: 0,
          correct: 0,
          points: 0
        }
      }
      breakdown[category].total++
      if (attempt.isCorrect) {
        breakdown[category].correct++
        breakdown[category].points += attempt.question.difficulty * 10
      }
    })
    return breakdown
  }

  const getAnswerButtonClass = (answerIndex) => {
    let baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 "
    if (!showResult) {
      return baseClass +
        "border-gray-200 bg-white text-gray-900 hover:border-indigo-300 hover:bg-indigo-50 " +
        "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-indigo-400 dark:hover:bg-gray-600"
    }
    if (answerIndex === currentQuestion.correctAnswer) {
      return baseClass + "border-green-500 bg-green-100 text-green-800 dark:border-green-400 dark:bg-green-900 dark:text-green-200"
    } else if (answerIndex === selectedAnswer) {
      return baseClass + "border-red-500 bg-red-100 text-red-800 dark:border-red-400 dark:bg-red-900 dark:text-red-200"
    } else {
      return baseClass + "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  const getTimerColor = () => {
    if (timeLeft > 20) return "text-green-600 dark:text-green-400"
    if (timeLeft > 10) return "text-yellow-600 dark:text-yellow-300"
    return "text-red-600 dark:text-red-400"
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-10">
        <p className="text-lg text-gray-600 dark:text-gray-300">문제를 불러오는 중입니다...</p>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto text-center py-10">
        <p className="text-lg text-gray-600 dark:text-gray-300">문제가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100 bg-white/70 dark:bg-gray-700/70 px-3 py-1 rounded-full">
            문제 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <div className="flex items-center space-x-4">
            {/* 🆕 Current streak indicator */}
            {currentStreak > 0 && (
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                🔥 {currentStreak}연속
              </span>
            )}
            <span className={`text-2xl font-bold ${getTimerColor()} bg-white/70 dark:bg-gray-700/70 px-3 py-1 rounded-full`}>
              {timeLeft}초
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
          <div 
            className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                {currentQuestion?.category}
              </span>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {currentQuestion?.subcategory}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-yellow-500 text-lg">
                {/* Auto-generate stars from difficulty (1-5) */}
                {"★".repeat(currentQuestion?.difficulty || 1)}{"☆".repeat(5 - (currentQuestion?.difficulty || 1))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {(currentQuestion?.difficulty || 1) * 10}점
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {currentQuestion?.question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`${getAnswerButtonClass(index)}`}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + index)}. {option}
              </span>
            </button>
          ))}
        </div>

        {/* Statistics Summary */}
        {showResult && currentQuestion?.totalCount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              총 {currentQuestion.totalCount}명이 이 문제를 풀었습니다
            </div>
          </div>
        )}

        {/* Result Display */}
        {showResult && (
          <div className="mt-6">
            <div className="mb-4">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                정답: {currentQuestion.correctAnswer + 1}. {currentQuestion.options[currentQuestion.correctAnswer]}
              </span>
            </div>
            {/* 해설 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="font-bold text-gray-800 dark:text-gray-100 mb-1">해설</div>
              <div className="text-gray-700 dark:text-gray-200 text-sm">
                {currentQuestion.explanation}
              </div>
            </div>
            {/* 지식의 여운 */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-indigo-400 dark:border-indigo-600">
              <div className="font-bold text-gray-800 dark:text-gray-100 mb-1">지식의 여운</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                "{currentQuestion.reflection}"
              </div>
            </div>
            {/* Next Question Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleNextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-lg"
              >
                {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '완료'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 