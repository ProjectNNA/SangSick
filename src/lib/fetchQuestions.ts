import { supabase } from './supabase'

export async function fetchRandomQuestions(count = 10) {
  // Fetch all questions (or first 1000) then shuffle client-side
  const { data, error } = await supabase
    .from('questions')
    .select('*')

  if (error) throw error
  if (!data) return []

  // Shuffle
  const shuffled = [...data].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
} 