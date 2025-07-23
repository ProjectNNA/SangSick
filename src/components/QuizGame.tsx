import { useState, useEffect } from 'react'
import { fetchRandomQuestions } from '../lib/fetchQuestions'
import { completeQuizSession, recordQuestionAttempt } from '../lib/quizTracking'
import { startQuizSession } from '../lib/quizTracking'
import { invalidateQuizStatsCache } from '../lib/hooks'
import type { QuizResults, QuizGameProps, QuestionAttempt } from '../types'

export default function QuizGame({ onComplete, user }: QuizGameProps) {
  // Use direct function calls instead of TanStack Query
  const [questions, setQuestions] = useState<any[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsError, setQuestionsError] = useState<Error | null>(null)
  const algorithm = 'simple-random'
  
  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true)
        const fetchedQuestions = await fetchRandomQuestions(10)
        setQuestions(fetchedQuestions)
      } catch (error) {
        setQuestionsError(error as Error)
      } finally {
        setQuestionsLoading(false)
      }
    }
    loadQuestions()
  }, [])

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
    if (questions.length > 0 && !sessionId && user?.id) {
      const initializeQuizSession = async () => {
        try {
          const currentTime = new Date().toISOString()
          const newSessionId = await startQuizSession(user.id)
          
          if (newSessionId) {
            setStartTime(currentTime)
            setSessionId(newSessionId)
            
            if (import.meta.env.DEV) {
              console.log(`🎯 Quiz started with ${algorithm} algorithm, session: ${newSessionId}`)
            }
          } else {
            console.error('Failed to create quiz session')
          }
        } catch (error) {
          console.error('Error initializing quiz session:', error)
        }
      }
      
      initializeQuizSession()
    }
      }, [questions.length, sessionId, algorithm, user?.id])

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

    // Record the attempt using direct function call
    if (sessionId && user?.id) {
      try {
        await recordQuestionAttempt(
          sessionId,
          user.id,
          currentQuestion,
          answerIndex,
          responseTime
        )
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to record question attempt:', error)
        }
      }
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

    // Remove automatic progression - user will click Next button
  }

  const handleNextQuestion = () => {
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
      // Complete quiz using direct function call
      try {
        await completeQuizSession(sessionId, quizResults)
        // Invalidate cache to update stats immediately
        invalidateQuizStatsCache(user.id)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to complete quiz:', error)
        }
      }
    }

    onComplete(quizResults)
  }

  const getAnswerButtonClass = (answerIndex: number) => {
    if (!showResult) {
      return "group relative w-4/5 text-left p-3 md:p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
    }
    
    // Show results
    if (answerIndex === currentQuestion?.correctAnswer) {
      return "group relative w-4/5 text-left p-3 md:p-6 rounded-2xl border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-lg transform scale-105 transition-all duration-300"
    }
    
    if (answerIndex === selectedAnswer && answerIndex !== currentQuestion?.correctAnswer) {
      return "group relative w-4/5 text-left p-3 md:p-6 rounded-2xl border-2 border-red-400 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 shadow-lg transform scale-105 transition-all duration-300"
    }
    
    return "group relative w-4/5 text-left p-3 md:p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-60 transition-all duration-300"
  }

  const getAnswerIcon = (answerIndex: number) => {
    if (!showResult) {
      return (
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-all duration-300 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {answerIndex + 1}
          </span>
        </div>
      )
    }
    
    if (answerIndex === currentQuestion?.correctAnswer) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }
    
    if (answerIndex === selectedAnswer && answerIndex !== currentQuestion?.correctAnswer) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    }
    
    return (
      <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 opacity-40 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-400">
          {answerIndex + 1}
        </span>
      </div>
    )
  }

  const getTimerDisplay = () => {
    const percentage = (timeLeft / 10) * 100
    const isUrgent = timeLeft <= 3
    const isWarning = timeLeft <= 5 && timeLeft > 3
    
    return (
      <div className="relative">
        <div className="flex items-center justify-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                className={`transition-all duration-1000 ${
                  isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${
                isUrgent ? 'text-red-600 dark:text-red-400' : 
                isWarning ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {isUrgent ? '⚡ 서둘러!' : isWarning ? '⚠️ 주의!' : '⏰ 시간'}
          </span>
        </div>
      </div>
    )
  }

  // Handle loading states
  if (questionsLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900">
        <div className="max-w-4xl mx-auto p-8 pt-20">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12">
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="animate-spin text-8xl mb-8">🎯</div>
                <div className="absolute inset-0 animate-ping">
                  <div className="w-24 h-24 bg-indigo-400 rounded-full opacity-20"></div>
                </div>
              </div>
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                 완벽한 퀴즈를 준비하고 있어요!
               </h3>
               <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
                 AI가 당신의 실력에 맞는 최적의 문제를 선별하는 중입니다
               </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle error states
  if (questionsError || questions.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-900">
        <div className="max-w-4xl mx-auto p-8 pt-20">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12">
            <div className="text-center py-16">
              <div className="text-8xl mb-8 animate-pulse">⚠️</div>
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                 앗! 문제를 불러올 수 없어요
               </h3>
               <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
                 서버에 일시적인 문제가 발생했어요. 잠시 후 다시 시도해 주세요.
               </p>
                             <button 
                 onClick={() => window.location.reload()} 
                 className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
               >
                🔄 다시 시도하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900">
        <div className="max-w-4xl mx-auto p-8 pt-20">
          <div className="text-center py-16">
            <div className="text-6xl animate-pulse">🤔</div>
                         <div className="text-lg font-bold text-gray-900 dark:text-white mt-8">
               문제를 불러오는 중...
             </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="h-full bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto p-4 pt-8 md:p-8 md:pt-20 flex items-center justify-center">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-12 text-center max-w-2xl w-full">
            <div className="text-6xl md:text-8xl mb-6 md:mb-8 animate-bounce">🎉</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
              퀴즈 완료!
            </h2>
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-6">
              {score}점
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-12">
              {correctAnswers}/{questions.length} 문제 정답! 
              <span className="block text-sm md:text-base mt-2">
                정답률: {Math.round((correctAnswers / questions.length) * 100)}%
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container h-full max-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900 p-2 md:p-4 pt-2 md:pt-4" style={{ touchAction: 'pan-y' }}>
      {/* Modern Progress Header */}
      <div className="mb-3 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-3 md:p-4">
            {/* Progress Info */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  문제
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {score}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  점수
                </div>
              </div>
              {currentStreak > 0 && (
                <>
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                      🔥 {currentStreak}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      연속
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center">
              {getTimerDisplay()}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-4">
          <div className="overflow-hidden">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-3 md:p-6 text-white rounded-2xl shadow-lg">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-3 md:mb-4">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                      📚 {currentQuestion?.category}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm">
                      {currentQuestion?.subcategory}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg md:text-xl">
                          {i < (currentQuestion?.difficulty || 1) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold">
                      💎 {(currentQuestion?.difficulty || 1) * 10}점
                    </div>
                  </div>
                </div>
                <h2 className="text-lg md:text-xl xl:text-2xl font-bold leading-relaxed">
                  {currentQuestion?.question}
                </h2>
              </div>
            </div>
            
                        {/* Answer Options */}
            <div className="p-3 md:p-6 space-y-2 md:space-y-3 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-2xl">
              {currentQuestion?.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={getAnswerButtonClass(index)}
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    {getAnswerIcon(index)}
                    <div className="flex-1">
                      <span className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                        {option}
                      </span>
                    </div>
                    {!showResult && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

                         {/* Results Section */}
             {showResult && (
               <div className="border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 md:p-6">
                 {(currentQuestion?.totalCount && currentQuestion.totalCount > 0) ? (
                   <div className="text-center mb-3 md:mb-6">
                     <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                       🎯 총 <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentQuestion.totalCount}명</span>이 이 문제에 도전했습니다!
                     </p>
                   </div>
                 ) : null}
                
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 md:p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-sm md:text-base">해설</h4>
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-sm md:text-base">
                      {currentQuestion.explanation || '이 문제에 대한 자세한 해설을 준비 중입니다.'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 md:p-4 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2 text-sm md:text-base">지식의 여운</h4>
                    <p className="text-purple-800 dark:text-purple-200 italic leading-relaxed text-sm md:text-base">
                      "{currentQuestion.reflection || '이 지식이 당신의 학습 여정에 새로운 영감을 주길 바랍니다.'}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            {showResult && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 md:p-6 text-center">
                <button
                  onClick={handleNextQuestion}
                  className="group relative px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm md:text-base font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600"
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>{currentQuestionIndex < questions.length - 1 ? '다음 문제로' : '퀴즈 완료'}</span>
                    <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
          </div>
        </div>
    </div>
  )
} 