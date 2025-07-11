import { supabase, optimizedQueries, cacheInvalidation } from './supabase'
import type { 
  Question, 
  QuizResults, 
  QuizStats, 
  QuizSession, 
  CategoryPerformance,
  QuestionAttempt,
  EngagementStats,
  PerformanceRating
} from '../types'

/**
 * Quiz Session Tracking Utilities
 * Handles creating, updating, and retrieving quiz progress data
 */

// Start a new quiz session
export const startQuizSession = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        start_time: new Date().toISOString(),
        completed: false
      })
      .select('id')
      .single()

    if (error) throw error

    console.log('Quiz session started:', data.id)
    return data.id
  } catch (error) {
    console.error('Error starting quiz session:', error)
    return null
  }
}

// 🚀 Optimized: Record individual question attempt with detailed tracking
export const recordQuestionAttempt = async (
  sessionId: string, 
  userId: string, 
  questionData: Question, 
  selectedAnswer: number, 
  responseTimeMs: number
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .rpc('record_question_attempt', {
        p_session_id: sessionId,
        p_user_id: userId,
        p_question_id: questionData.id,
        p_category: questionData.category,
        p_subcategory: questionData.subcategory || '',
        p_difficulty: questionData.difficulty,
        p_selected_answer: selectedAnswer,
        p_correct_answer: questionData.correctAnswer,
        p_response_time_ms: responseTimeMs
      })

    if (error) throw error

    console.log('Question attempt recorded:', data)
    return data
  } catch (error) {
    console.error('Error recording question attempt:', error)
    return null
  }
}

// 🆕 Batch record multiple question attempts for better performance
export const batchRecordQuestionAttempts = async (
  sessionId: string,
  userId: string,
  questionAttempts: Array<{
    question: Question
    selectedAnswer: number
    responseTimeMs: number
  }>
): Promise<any> => {
  try {
    const attempts = questionAttempts.map(attempt => ({
      sessionId,
      userId,
      questionId: attempt.question.id,
      category: attempt.question.category,
      subcategory: attempt.question.subcategory || '',
      difficulty: attempt.question.difficulty,
      selectedAnswer: attempt.selectedAnswer,
      correctAnswer: attempt.question.correctAnswer,
      responseTimeMs: attempt.responseTimeMs
    }))

    const result = await optimizedQueries.batchRecordQuestionAttempts(attempts)
    
    // Invalidate user caches after batch recording
    cacheInvalidation.invalidateUserCache(userId)
    
    console.log('Batch question attempts recorded:', result)
    return result
  } catch (error) {
    console.error('Error in batch recording question attempts:', error)
    return null
  }
}

// 🚀 Optimized: Update quiz session with progress and invalidate caches
export const completeQuizSession = async (sessionId: string, quizResults: QuizResults): Promise<QuizSession | null> => {
  try {
    const endTime = new Date().toISOString()
    const duration = Math.round((new Date(endTime).getTime() - new Date(quizResults.startTime).getTime()) / 1000)

    const { data, error } = await supabase
      .from('quiz_sessions')
      .update({
        score: quizResults.score,
        correct_answers: quizResults.correctAnswers,
        questions_attempted: quizResults.totalQuestions,
        total_questions: quizResults.totalQuestions,
        end_time: endTime,
        duration_seconds: duration,
        completed: true,
        // 🆕 Add engagement metrics
        best_streak: quizResults.bestStreak || 0,
        average_response_time_ms: quizResults.averageResponseTime || 0
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    // 🔄 Invalidate user caches after quiz completion
    const userId = data.user_id
    if (userId) {
      cacheInvalidation.invalidateUserCache(userId)
    }

    console.log('Quiz session completed:', data)
    return data
  } catch (error) {
    console.error('Error completing quiz session:', error)
    return null
  }
}

// 🚀 Optimized: Get comprehensive user quiz statistics with caching
export const getUserQuizStats = async (userId: string, forceRefresh = false): Promise<QuizStats> => {
  try {
    const data = await optimizedQueries.getUserStats(userId, forceRefresh)

    // Handle case where user has no quiz attempts
    if (!data || !data.basic_stats || data.basic_stats.total_sessions === 0) {
      return {
        basic_stats: {
          total_sessions: 0,
          completed_sessions: 0,
          highest_score: 0,
          average_score: 0,
          overall_accuracy: 0,
          average_duration_minutes: 0,
          last_played: null
        },
        category_performance: [],
        engagement_stats: {
          current_streak: 0,
          longest_streak: 0,
          total_study_time_minutes: 0,
          level: 1,
          total_points: 0,
          achievements: []
        },
        time_performance: {
          best_performance_hour: null,
          average_response_time_ms: null,
          questions_by_difficulty: {}
        },
        achievements: {
          perfect_sessions: 0,
          questions_mastered: 0,
          difficulty_breakdown: {}
        }
      }
    }

    return data
  } catch (error) {
    console.error('Error fetching quiz stats:', error)
    return {
      basic_stats: {
        total_sessions: 0,
        completed_sessions: 0,
        highest_score: 0,
        average_score: 0,
        overall_accuracy: 0,
        average_duration_minutes: 0,
        last_played: null
      },
      category_performance: [],
      engagement_stats: {
        current_streak: 0,
        longest_streak: 0,
        total_study_time_minutes: 0,
        level: 1,
        total_points: 0,
        achievements: []
      },
      time_performance: {
        best_performance_hour: null,
        average_response_time_ms: null,
        questions_by_difficulty: {}
      },
      achievements: {
        perfect_sessions: 0,
        questions_mastered: 0,
        difficulty_breakdown: {}
      }
    }
  }
}

// 🚀 Optimized: Get category performance breakdown with caching
export const getCategoryPerformance = async (userId: string, forceRefresh = false): Promise<CategoryPerformance[]> => {
  try {
    const data = await optimizedQueries.getCategoryPerformance(userId, forceRefresh)
    return data
  } catch (error) {
    console.error('Error fetching category performance:', error)
    return []
  }
}

// 🆕 Get user engagement stats
export const getUserEngagementStats = async (userId: string): Promise<EngagementStats> => {
  try {
    const { data, error } = await supabase
      .from('user_engagement_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return data || {
      current_streak: 0,
      longest_streak: 0,
      total_study_time_minutes: 0,
      level: 1,
      total_points: 0,
      achievements: []
    }
  } catch (error) {
    console.error('Error fetching engagement stats:', error)
    return {
      current_streak: 0,
      longest_streak: 0,
      total_study_time_minutes: 0,
      level: 1,
      total_points: 0,
      achievements: []
    }
  }
}

// Get recent quiz sessions for detailed history
export const getRecentQuizSessions = async (userId: string, limit: number = 10): Promise<QuizSession[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching recent quiz sessions:', error)
    return []
  }
}

// Get quiz performance trends (last 30 days)
export const getQuizTrends = async (userId: string): Promise<any> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('score, correct_answers, total_questions, created_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching quiz trends:', error)
    return []
  }
}

// 🆕 Calculate user level based on total points (EXPONENTIAL GROWTH)
export const calculateUserLevel = (totalPoints: number): number => {
  // Exponential thresholds: each level doubles the requirement
  const levelThresholds = [
    0,     // Level 1: 0-99 points (100 needed)
    100,   // Level 2: 100-299 points (200 needed)
    300,   // Level 3: 300-699 points (400 needed)
    700,   // Level 4: 700-1499 points (800 needed)
    1500,  // Level 5: 1500-3099 points (1600 needed)
    3100,  // Level 6: 3100-6299 points (3200 needed)
    6300,  // Level 7: 6300-12699 points (6400 needed)
    12700, // Level 8: 12700-25499 points (12800 needed)
    25500, // Level 9: 25500-51099 points (25600 needed)
    51100, // Level 10: 51100-102299 points (51200 needed)
    102300, // Level 11: 102300-204699 points (102400 needed)
    204700, // Level 12: 204700-409499 points (204800 needed)
    409500  // Level 13: 409500+ points (409600 needed for 14)
  ]
  
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i]) {
      return i + 1
    }
  }
  
  return 1 // Fallback
}

// 🆕 Get level progress (points needed for next level) - EXPONENTIAL SYSTEM
export const getLevelProgress = (totalPoints: number) => {
  const currentLevel = calculateUserLevel(totalPoints)
  
  // Same exponential thresholds as calculateUserLevel
  const levelThresholds = [
    0,     // Level 1: 0-99 points (100 needed)
    100,   // Level 2: 100-299 points (200 needed)
    300,   // Level 3: 300-699 points (400 needed)
    700,   // Level 4: 700-1499 points (800 needed)
    1500,  // Level 5: 1500-3099 points (1600 needed)
    3100,  // Level 6: 3100-6299 points (3200 needed)
    6300,  // Level 7: 6300-12699 points (6400 needed)
    12700, // Level 8: 12700-25499 points (12800 needed)
    25500, // Level 9: 25500-51099 points (25600 needed)
    51100, // Level 10: 51100-102299 points (51200 needed)
    102300, // Level 11: 102300-204699 points (102400 needed)
    204700, // Level 12: 204700-409499 points (204800 needed)
    409500, // Level 13: 409500+ points (409600 needed for 14)
    819100  // Level 14: for calculation purposes
  ]
  
  if (currentLevel <= levelThresholds.length - 1) {
    const currentThreshold = levelThresholds[currentLevel - 1]
    const nextThreshold = levelThresholds[currentLevel]
    const progress = totalPoints - currentThreshold
    const needed = nextThreshold - currentThreshold
    return {
      level: currentLevel,
      progress,
      needed,
      percentage: Math.round((progress / needed) * 100)
    }
  } else {
    // For levels beyond our defined thresholds, continue exponential growth
    const baseThreshold = levelThresholds[levelThresholds.length - 1]
    const levelsAbove = currentLevel - levelThresholds.length
    const currentThreshold = baseThreshold + (Math.pow(2, levelsAbove) - 1) * 409600
    const nextThreshold = baseThreshold + Math.pow(2, levelsAbove) * 409600
    const progress = totalPoints - currentThreshold
    const needed = nextThreshold - currentThreshold
    return {
      level: currentLevel,
      progress,
      needed,
      percentage: Math.round((progress / needed) * 100)
    }
  }
}

// 🆕 Calculate current streak based on consecutive correct answers
export const calculateCurrentStreak = (attempts: any[]): number => {
  if (!attempts || attempts.length === 0) return 0
  
  let streak = 0
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].is_correct) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// Calculate accuracy rate for a quiz session
export const calculateAccuracy = (correctAnswers: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0
  return Math.round((correctAnswers / totalQuestions) * 100)
}

// Format duration in seconds to readable string
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}초`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}분 ${remainingSeconds}초`
}

// Get performance rating based on score
export const getPerformanceRating = (score: number): PerformanceRating => {
  if (score >= 80) return { rating: '우수', color: 'text-green-600', emoji: '🏆' }
  if (score >= 60) return { rating: '양호', color: 'text-blue-600', emoji: '👍' }
  if (score >= 40) return { rating: '보통', color: 'text-yellow-600', emoji: '👌' }
  if (score >= 20) return { rating: '미흡', color: 'text-orange-600', emoji: '📈' }
  return { rating: '부족', color: 'text-red-600', emoji: '💪' }
}

// Calculate score from correct answers and question difficulties
export const calculateQuizScore = (questions: Question[], userAnswers: number[]) => {
  let score = 0
  let correctCount = 0

  questions.forEach((question: Question, index: number) => {
    if (userAnswers[index] === question.correctAnswer) {
      score += question.difficulty * 10
      correctCount++
    }
  })

  return { score, correctCount }
}

// 🆕 Get category emoji for display
export const getCategoryEmoji = (category: string): string => {
  const categoryEmojis = {
    '과학': '🔬',
    '역사': '🏛️',
    '지리': '🌍',
    '문학': '📖',
    '스포츠': '⚽',
    '예술': '🎭'
  }
  return (categoryEmojis as Record<string, string>)[category] || '📚'
}

// 🆕 Format response time for display
export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}초`
} 