import { supabase } from './supabase'

// Maximum question ID from questions_export_results.txt
const MAX_QUESTION_ID = 52

// Super simple approach: generate random IDs and fetch those specific questions
export async function fetchRandomQuestions(count = 10) {
  try {
    // Generate random IDs between 1 and MAX_QUESTION_ID
    const randomIds = []
    const usedIds = new Set()
    
    while (randomIds.length < count && randomIds.length < MAX_QUESTION_ID) {
      const randomId = Math.floor(Math.random() * MAX_QUESTION_ID) + 1
      if (!usedIds.has(randomId)) {
        randomIds.push(randomId)
        usedIds.add(randomId)
      }
    }

    // Fetch questions by their IDs
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .in('id', randomIds)

    if (error) {
      console.error('Error fetching questions:', error)
      throw error
    }

    if (!questions || questions.length === 0) {
      console.warn('No questions found in database')
      return []
    }

    // Shuffle the results for good measure
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled

  } catch (error) {
    console.error('Error in fetchRandomQuestions:', error)
    throw error
  }
}

// Keep the same interface but use the simple approach
export async function fetchBalancedRandomQuestions(count = 10) {
  return await fetchRandomQuestions(count)
}

export async function fetchDifficultyBalancedQuestions(count = 10) {
  return await fetchRandomQuestions(count)
} 