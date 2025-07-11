import { createClient } from '@supabase/supabase-js'

// Use environment variables for Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// 🚀 Enhanced Supabase client with performance optimizations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Optimize auth settings for better performance
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  },
  // Connection pooling and performance settings
  db: {
    schema: 'public',
  },
  // Realtime optimizations
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'apikey': supabaseAnonKey
    }
  }
})

// 🔥 Simple in-memory cache for frequently accessed data
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const cache = new SimpleCache()

// 🚀 Optimized query helpers with caching
export const optimizedQueries = {
  // Cached user stats with 5-minute TTL
  async getUserStats(userId: string, forceRefresh = false) {
    const cacheKey = `user_stats_${userId}`
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) return cached
    }

    const { data, error } = await supabase
      .rpc('get_user_quiz_stats', { target_user_id: userId })

    if (error) {
      console.error('Error fetching user stats:', error)
      return null
    }

    // Cache for 5 minutes
    cache.set(cacheKey, data, 5 * 60 * 1000)
    return data
  },

  // Cached category performance with 10-minute TTL
  async getCategoryPerformance(userId: string, forceRefresh = false) {
    const cacheKey = `category_performance_${userId}`
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) return cached
    }

    const { data, error } = await supabase
      .from('category_performance')
      .select('*')
      .eq('user_id', userId)
      .order('total_points', { ascending: false })

    if (error) {
      console.error('Error fetching category performance:', error)
      return []
    }

    // Cache for 10 minutes
    cache.set(cacheKey, data || [], 10 * 60 * 1000)
    return data || []
  },

  // Batch question attempts for better performance
  async batchRecordQuestionAttempts(attempts: Array<{
    sessionId: string
    userId: string
    questionId: number
    category: string
    subcategory: string
    difficulty: number
    selectedAnswer: number
    correctAnswer: number
    responseTimeMs: number
  }>) {
    try {
      // Use a single batch RPC call instead of multiple individual calls
      const { data, error } = await supabase
        .rpc('batch_record_question_attempts', {
          attempts_data: attempts
        })

      if (error) {
        console.error('Error in batch recording:', error)
        // Fallback to individual calls if batch fails
        const results = []
        for (const attempt of attempts) {
          const result = await supabase
            .rpc('record_question_attempt', {
              p_session_id: attempt.sessionId,
              p_user_id: attempt.userId,
              p_question_id: attempt.questionId,
              p_category: attempt.category,
              p_subcategory: attempt.subcategory,
              p_difficulty: attempt.difficulty,
              p_selected_answer: attempt.selectedAnswer,
              p_correct_answer: attempt.correctAnswer,
              p_response_time_ms: attempt.responseTimeMs
            })
          results.push(result)
        }
        return results
      }

      return data
    } catch (error) {
      console.error('Error in batch recording attempts:', error)
      return null
    }
  }
}

// 🔄 Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate user-specific caches
  invalidateUserCache(userId: string) {
    cache.delete(`user_stats_${userId}`)
    cache.delete(`category_performance_${userId}`)
  },

  // Invalidate all caches
  invalidateAllCaches() {
    cache.clear()
  }
}

// 📊 Connection monitoring (development only) - Privacy Safe
if (import.meta.env.DEV) {
  let connectionCount = 0
  const originalFrom = supabase.from.bind(supabase)
  const originalRpc = supabase.rpc.bind(supabase)

  supabase.from = function(table: string) {
    connectionCount++
    console.log(`[Supabase] Query #${connectionCount}: ${table}`)
    return originalFrom(table)
  }

  supabase.rpc = function(fn: string, args?: any) {
    connectionCount++
    // Only log function name, not sensitive arguments
    console.log(`[Supabase] RPC #${connectionCount}: ${fn}`)
    return originalRpc(fn, args)
  }
} 





