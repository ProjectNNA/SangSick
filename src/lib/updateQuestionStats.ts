import { supabase } from './supabase'

/**
 * Update global question statistics in Supabase
 * @param {number} questionId - ID of the question
 * @param {number} selectedAnswer - Index of selected answer (0-3, or null for unanswered)
 * @returns {Promise<boolean>} Success status
 */
export async function updateQuestionStats(questionId: number, selectedAnswer: number): Promise<boolean> {
  try {
    // Determine which answer index to increment
    let answerIndex = 4 // Default to "unanswered"
    if (selectedAnswer !== null && selectedAnswer !== undefined && selectedAnswer >= 0 && selectedAnswer <= 3) {
      answerIndex = selectedAnswer
    }

    // Use atomic SQL update to prevent race conditions
    const { error } = await supabase.rpc('increment_question_stats', {
      question_id: questionId,
      answer_index: answerIndex
    })

    if (error) {
      console.error('Error updating question stats:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error updating question stats:', error)
    return false
  }
} 