import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, optimizedQueries, cacheInvalidation } from '../lib/supabase'
import type { QuizStats, CategoryPerformance, QuizSession } from '../types'

// Query Keys Factory - Organized query key management
export const userQueryKeys = {
  all: ['users'] as const,
  user: (userId: string) => [...userQueryKeys.all, userId] as const,
  stats: (userId: string) => [...userQueryKeys.user(userId), 'stats'] as const,
  categoryPerformance: (userId: string) => [...userQueryKeys.user(userId), 'categoryPerformance'] as const,
  recentSessions: (userId: string, limit?: number) => 
    [...userQueryKeys.user(userId), 'recentSessions', limit] as const,
}

// 🚀 User Stats Query - Uses our optimized RPC function
export function useUserStatsQuery(userId: string) {
  return useQuery({
    queryKey: userQueryKeys.stats(userId),
    queryFn: async (): Promise<QuizStats> => {
      return await optimizedQueries.getUserStats(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - fresh data
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: false,
  })
}

// 🎯 Category Performance Query - Uses our optimized cached function
export function useCategoryPerformanceQuery(userId: string) {
  return useQuery({
    queryKey: userQueryKeys.categoryPerformance(userId),
    queryFn: async (): Promise<CategoryPerformance[]> => {
      return await optimizedQueries.getCategoryPerformance(userId)
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - less frequently changing data
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// 📊 Recent Quiz Sessions Query
export function useRecentSessionsQuery(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: userQueryKeys.recentSessions(userId, limit),
    queryFn: async (): Promise<QuizSession[]> => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - recent activity changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// 🔄 Quiz Completion Mutation - Invalidates relevant caches
export function useCompleteQuizMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sessionId, quizResults }: { 
      sessionId: string
      quizResults: any 
    }) => {
      // Use our existing completeQuizSession function
      const { completeQuizSession } = await import('../lib/quizTracking')
      return await completeQuizSession(sessionId, quizResults)
    },
    onSuccess: (data) => {
      if (data?.user_id) {
        // Invalidate all user-related queries for this user
        queryClient.invalidateQueries({ 
          queryKey: userQueryKeys.user(data.user_id) 
        })
        
        // Also invalidate our simple cache
        cacheInvalidation.invalidateUserCache(data.user_id)
      }
    },
    onError: (error) => {
      console.error('Quiz completion failed:', error)
    },
  })
}

// 🎮 Record Question Attempt Mutation
export function useRecordQuestionAttemptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      userId,
      questionData,
      selectedAnswer,
      responseTimeMs
    }: {
      sessionId: string
      userId: string
      questionData: any
      selectedAnswer: number
      responseTimeMs: number
    }) => {
      const { recordQuestionAttempt } = await import('../lib/quizTracking')
      return await recordQuestionAttempt(
        sessionId,
        userId,
        questionData,
        selectedAnswer,
        responseTimeMs
      )
    },
    onSuccess: (_, variables) => {
      // Optimistically update recent sessions cache
      queryClient.setQueryData(
        userQueryKeys.recentSessions(variables.userId, 10),
        (oldData: QuizSession[] | undefined) => {
          // Don't invalidate immediately - let it aggregate
          return oldData
        }
      )
    },
  })
}

// 🏆 Prefetch User Data - For performance optimization
export function usePrefetchUserData(userId: string) {
  const queryClient = useQueryClient()

  const prefetchUserStats = () => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.stats(userId),
      queryFn: () => optimizedQueries.getUserStats(userId),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchCategoryPerformance = () => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.categoryPerformance(userId),
      queryFn: () => optimizedQueries.getCategoryPerformance(userId),
      staleTime: 10 * 60 * 1000,
    })
  }

  return {
    prefetchUserStats,
    prefetchCategoryPerformance,
  }
} 