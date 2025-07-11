import { useState, useEffect } from 'react'
import { updateAnswerStatistics } from '../utils/statistics'
import { 
  useSmartQuestionSelection,
  usePrefetchQuizQuestions
} from '../queries/questionQueries'
import {
  useRecordQuestionAttemptMutation,
  useCompleteQuizMutation
} from '../queries/userQueries'
import type { Question, QuizResults, QuizGameProps, QuestionAttempt } from '../types'

export default function QuizGame({ onComplete, user }: QuizGameProps) {
  // 🚀 Use Smart Question Selection with TanStack Query
  const { 
    questions, 
    isLoading: questionsLoading, 
    error: questionsError,
    algorithm 
  } = useSmartQuestionSelection(10)

  // TanStack Query Mutations
  const recordAttemptMutation = useRecordQuestionAttemptMutation()
  const completeQuizMutation = useCompleteQuizMutation()
  
  // Prefetch functionality for performance
  const { prefetchQuestions } = usePrefetchQuizQuestions()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)

  const currentQuestion = questions[currentQuestionIndex] || null

  // Create session when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !sessionId) {
      const currentTime = new Date().toISOString()
      const newSessionId = crypto.randomUUID()
      setStartTime(currentTime)
      setSessionId(newSessionId)
      
      // Prefetch next set of questions for better performance
      prefetchQuestions('difficulty', 10)
      
      console.log(`🎯 Quiz started with ${algorithm} algorithm`)
    }
  }, [questions.length, sessionId, prefetchQuestions, algorithm])

  // 🆕 Start timing when question loads
  useEffect(() => {
    if (questionStartTime === null && currentQuestion) {
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestionIndex, currentQuestion, questionStartTime])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleAnswerSelect(-1) // No answer selected
    }
  }, [timeLeft, showResult, gameOver])

  const handleAnswerSelect = async (answerIndex: number) => {
    if (showResult || !currentQuestion || !questionStartTime) return

    const responseTime = Date.now() - questionStartTime
    setResponseTimes(prev => [...prev, responseTime])
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer

    // 🎮 Track detailed attempt for later statistics
    setQuestionAttempts(prev => [...prev, {
      question: currentQuestion,
      selectedAnswer: answerIndex,
      isCorrect,
      responseTimeMs: responseTime
    }])

    // 🚀 Record the attempt using TanStack Query mutation
    if (sessionId && user?.id) {
      recordAttemptMutation.mutate({
        sessionId,
        userId: user.id,
        questionData: currentQuestion,
        selectedAnswer: answerIndex,
        responseTimeMs: responseTime
      })
      
      // Note: Questions are now read-only from cache, updateAnswerStatistics 
      // will be handled by the mutation and cache invalidation
    }

    if (answerIndex === currentQuestion.correctAnswer) {
      const points = currentQuestion.difficulty * 10
      setScore(prev => prev + points)
      setCorrectAnswers(prev => prev + 1)
      setCurrentStreak(prev => {
        const newStreak = prev + 1
        setBestStreak(current => Math.max(current, newStreak))
        return newStreak
      })
    } else {
      setCurrentStreak(0)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(10)
        setQuestionStartTime(null)
      } else {
        setGameOver(true)
        finishQuiz()
      }
    }, 2000)
  }

  const finishQuiz = async () => {
    if (!sessionId || !startTime) return

    const endTime = new Date().toISOString()
    const averageResponseTime = responseTimes.length > 0 ? 
      Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0

    const quizResults: QuizResults = {
      sessionId,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      startTime,
      endTime,
      attempts: questionAttempts,
      bestStreak,
      averageResponseTime
    }

    if (user?.id) {
      // 🚀 Complete quiz using TanStack Query mutation
      completeQuizMutation.mutate({ sessionId, quizResults })
    }

    onComplete(quizResults)
  }

  // 🆕 Calculate category performance breakdown
  const calculateCategoryBreakdown = (attempts: QuestionAttempt[]) => {
    const breakdown: Record<string, any> = {}
    
    attempts.forEach(attempt => {
      const category = attempt.question.category
      if (!breakdown[category]) {
        breakdown[category] = {
          correct: 0,
          total: 0,
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

  const getAnswerButtonClass = (answerIndex: number) => {
    if (!showResult) {
      return "w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-gray-200"
    }
    
    // Show results
    if (answerIndex === currentQuestion?.correctAnswer) {
      return "w-full text-left p-4 rounded-lg border-2 border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
    }
    
    if (answerIndex === selectedAnswer && answerIndex !== currentQuestion?.correctAnswer) {
      return "w-full text-left p-4 rounded-lg border-2 border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
    }
    
    return "w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 opacity-50"
  }

  // Handle loading states
  if (questionsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          <div className="text-center py-12">
            <div className="animate-spin text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              퀴즈를 준비하고 있습니다...
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              최적화된 문제를 선별하는 중입니다
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle error states
  if (questionsError || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              문제를 불러올 수 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              퀴즈 문제를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getTimerColor = () => {
    if (timeLeft <= 3) return 'text-red-600 dark:text-red-400'
    if (timeLeft <= 5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="text-xl">문제를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            퀴즈 완료! 🎉
          </h2>
          <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            {score}점
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {correctAnswers}/{questions.length} 문제 정답! (정답률: {Math.round((correctAnswers / questions.length) * 100)}%)
          </p>
        </div>
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                {currentQuestion?.category}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {currentQuestion?.subcategory}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-bold">
                {"★".repeat(currentQuestion?.difficulty || 1)}{"☆".repeat(5 - (currentQuestion?.difficulty || 1))}
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {(currentQuestion?.difficulty || 1) * 10}점
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold leading-relaxed">
            {currentQuestion?.question}
          </h2>
        </div>
        
        <div className="p-6">
          {currentQuestion?.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={getAnswerButtonClass(index)}
            >
              <span className="font-semibold mr-3">{index + 1}.</span>
              {option}
            </button>
          ))}
        </div>

        {/* Results section */}
        {showResult && currentQuestion?.totalCount && currentQuestion.totalCount > 0 && (
          <div className="border-t dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              총 {currentQuestion.totalCount}명이 이 문제를 풀었습니다
            </p>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    정답: {currentQuestion.correctAnswer + 1}. {currentQuestion.options[currentQuestion.correctAnswer]}
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 해설</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🌟 지식의 여운</h4>
                <p className="text-purple-800 dark:text-purple-200 text-sm italic leading-relaxed">
                  "{currentQuestion.reflection}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 