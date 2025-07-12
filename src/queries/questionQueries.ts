import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRandomQuestions } from '../lib/fetchQuestions'
import { updateQuestionStats } from '../lib/quizTracking'
import type { Question } from '../types'

// Simple query keys
export const questionQueryKeys = {
  all: ['questions'] as const,
  random: (count: number) => [...questionQueryKeys.all, 'random', count] as const,
}

// Simple Questions Query - Just fetch and cache 100 questions
export function useQuestionsQuery(count: number = 10) {
  return useQuery({
    queryKey: questionQueryKeys.random(count),
    queryFn: async (): Promise<Question[]> => {
      return await fetchRandomQuestions(count)
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Keep the same interface for compatibility
export function useRandomQuestionsQuery(count: number = 10) {
  return useQuestionsQuery(count)
}

export function useBalancedRandomQuestionsQuery(count: number = 10) {
  return useQuestionsQuery(count)
}

export function useDifficultyBalancedQuestionsQuery(count: number = 10) {
  return useQuestionsQuery(count)
}

// 📊 Update Question Statistics Mutation
export function useUpdateQuestionStatsMutation() {
  return useMutation({
    mutationFn: async ({ 
      questionId, 
      selectedAnswer 
    }: { 
      questionId: number
      selectedAnswer: number 
    }) => {
      return await updateQuestionStats(questionId, selectedAnswer)
    },
    onSuccess: () => {
      console.log('Question stats updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update question stats:', error)
    },
  })
}

// Simple prefetch
export function usePrefetchQuizQuestions() {
  const queryClient = useQueryClient()

  const prefetchQuestions = (count: number = 10) => {
    return queryClient.prefetchQuery({
      queryKey: questionQueryKeys.random(count),
      queryFn: () => fetchRandomQuestions(count),
      staleTime: 1000 * 60 * 10,
    })
  }

  return { prefetchQuestions }
}

// Simplified Smart Question Selection
export function useSmartQuestionSelection(count: number = 10) {
  const { data: questions, isLoading, error, refetch } = useQuestionsQuery(count)

  return {
    questions: questions || [],
    isLoading,
    error,
    refetch,
    algorithm: 'simple-random'
  }
} 