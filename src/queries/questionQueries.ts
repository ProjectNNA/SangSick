import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  fetchRandomQuestions,
  fetchBalancedRandomQuestions,
  fetchDifficultyBalancedQuestions 
} from '../lib/fetchQuestions'
import { updateQuestionStats } from '../lib/updateQuestionStats'
import type { Question } from '../types'

// Query Keys Factory for Questions
export const questionQueryKeys = {
  all: ['questions'] as const,
  random: (count: number, type?: 'balanced' | 'difficulty') => 
    [...questionQueryKeys.all, 'random', count, type] as const,
  category: (category: string) => [...questionQueryKeys.all, 'category', category] as const,
  difficulty: (difficulty: number) => [...questionQueryKeys.all, 'difficulty', difficulty] as const,
}

// 🎲 Random Questions Query - Basic random selection
export function useRandomQuestionsQuery(count: number = 10) {
  return useQuery({
    queryKey: questionQueryKeys.random(count),
    queryFn: async (): Promise<Question[]> => {
      return await fetchRandomQuestions(count)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - questions can be cached briefly
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Retry failed question fetches
  })
}

// ⚖️ Balanced Random Questions Query - Uses our advanced SQL function
export function useBalancedRandomQuestionsQuery(count: number = 10) {
  return useQuery({
    queryKey: questionQueryKeys.random(count, 'balanced'),
    queryFn: async (): Promise<Question[]> => {
      return await fetchBalancedRandomQuestions(count)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// 🎯 Difficulty Balanced Questions Query - 20% easy, 50% medium, 30% hard
export function useDifficultyBalancedQuestionsQuery(count: number = 10) {
  return useQuery({
    queryKey: questionQueryKeys.random(count, 'difficulty'),
    queryFn: async (): Promise<Question[]> => {
      return await fetchDifficultyBalancedQuestions(count)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  })
}

// 📊 Update Question Statistics Mutation
export function useUpdateQuestionStatsMutation() {
  const queryClient = useQueryClient()

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
      // Invalidate question queries to potentially get updated statistics
      queryClient.invalidateQueries({ 
        queryKey: questionQueryKeys.all 
      })
    },
    onError: (error) => {
      console.error('Failed to update question stats:', error)
    },
  })
}

// 🚀 Prefetch Quiz Questions - Called when user is about to start quiz
export function usePrefetchQuizQuestions() {
  const queryClient = useQueryClient()

  const prefetchQuestions = (type: 'random' | 'balanced' | 'difficulty' = 'difficulty', count: number = 10) => {
    switch (type) {
      case 'random':
        return queryClient.prefetchQuery({
          queryKey: questionQueryKeys.random(count),
          queryFn: () => fetchRandomQuestions(count),
          staleTime: 2 * 60 * 1000,
        })
      case 'balanced':
        return queryClient.prefetchQuery({
          queryKey: questionQueryKeys.random(count, 'balanced'),
          queryFn: () => fetchBalancedRandomQuestions(count),
          staleTime: 2 * 60 * 1000,
        })
      case 'difficulty':
        return queryClient.prefetchQuery({
          queryKey: questionQueryKeys.random(count, 'difficulty'),
          queryFn: () => fetchDifficultyBalancedQuestions(count),
          staleTime: 2 * 60 * 1000,
        })
    }
  }

  return { prefetchQuestions }
}

// 🎮 Smart Question Selection Hook - Automatically chooses best algorithm
export function useSmartQuestionSelection(count: number = 10) {
  // Use difficulty-balanced by default as it provides the best user experience
  const {
    data: questions,
    isLoading,
    error,
    refetch
  } = useDifficultyBalancedQuestionsQuery(count)

  // Fallback mechanisms
  const { data: balancedQuestions } = useBalancedRandomQuestionsQuery(count)
  const { data: randomQuestions } = useRandomQuestionsQuery(count)

  // Smart selection logic
  const finalQuestions = questions || balancedQuestions || randomQuestions || []

  return {
    questions: finalQuestions,
    isLoading,
    error,
    refetch,
    algorithm: questions ? 'difficulty-balanced' : 
               balancedQuestions ? 'category-balanced' : 
               randomQuestions ? 'random' : 'none'
  }
} 