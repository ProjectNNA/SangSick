import { supabase } from './supabase'

export async function fetchRandomQuestions(count = 10) {
  // 🚀 Performance Optimization: Use SQL RANDOM() instead of fetching all questions
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('RANDOM()')  // Use database-level randomization
    .limit(count)       // Only fetch the number we need

  if (error) {
    console.error('Error fetching questions:', error)
    throw error
  }
  
  if (!data || data.length === 0) {
    console.warn('No questions found in database')
    return []
  }

  return data
}

// 🆕 Advanced: Fetch questions with category balance
export async function fetchBalancedRandomQuestions(count = 10) {
  try {
    // Get available categories
    const { data: categories, error: categoriesError } = await supabase
      .from('questions')
      .select('category')
      .neq('category', null)
      .limit(1000) // Reasonable limit for category sampling

    if (categoriesError) throw categoriesError

    // Get unique categories
    const uniqueCategories = [...new Set(categories?.map(q => q.category) || [])]
    
    if (uniqueCategories.length === 0) {
      // Fallback to regular random selection
      return await fetchRandomQuestions(count)
    }

    // Calculate questions per category for balanced distribution
    const questionsPerCategory = Math.max(1, Math.floor(count / uniqueCategories.length))
    const remainingQuestions = count - (questionsPerCategory * uniqueCategories.length)

    let allQuestions: any[] = []

    // Fetch questions from each category
    for (const category of uniqueCategories) {
      const categoryCount = questionsPerCategory + (remainingQuestions > 0 ? 1 : 0)
      const { data: categoryQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .order('RANDOM()')
        .limit(categoryCount)

      if (error) {
        console.error(`Error fetching questions for category ${category}:`, error)
        continue
      }

      allQuestions = [...allQuestions, ...(categoryQuestions || [])]
    }

    // If we don't have enough questions, fill with random ones
    if (allQuestions.length < count) {
      const additionalNeeded = count - allQuestions.length
      const { data: additionalQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .order('RANDOM()')
        .limit(additionalNeeded)

      if (!error && additionalQuestions) {
        allQuestions = [...allQuestions, ...additionalQuestions]
      }
    }

    // Final shuffle and limit
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)

  } catch (error) {
    console.error('Error in balanced question fetching:', error)
    // Fallback to simple random selection
    return await fetchRandomQuestions(count)
  }
}

// 🆕 Fetch questions with difficulty distribution
export async function fetchDifficultyBalancedQuestions(count = 10) {
  try {
    // Target distribution: 20% easy (1-2), 50% medium (3), 30% hard (4-5)
    const easyCount = Math.max(1, Math.floor(count * 0.2))
    const mediumCount = Math.max(1, Math.floor(count * 0.5))
    const hardCount = count - easyCount - mediumCount

    const fetchByDifficulty = async (difficulties: number[], targetCount: number) => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .in('difficulty', difficulties)
        .order('RANDOM()')
        .limit(targetCount)

      if (error) throw error
      return data || []
    }

    const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
      fetchByDifficulty([1, 2], easyCount),
      fetchByDifficulty([3], mediumCount),
      fetchByDifficulty([4, 5], hardCount)
    ])

    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
    
    // Final shuffle to randomize order
    return [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, count)

  } catch (error) {
    console.error('Error in difficulty-balanced question fetching:', error)
    return await fetchRandomQuestions(count)
  }
} 