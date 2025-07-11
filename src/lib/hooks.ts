import { useState, useEffect, useRef } from 'react'
import { getUserRole } from './roleUtils'
import { getUserQuizStats } from './quizTracking'
import type { User, QuizStats } from '../types'

// Cache for user roles to prevent duplicate queries
const userRoleCache = new Map<string, { role: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Promise cache to prevent duplicate simultaneous queries
const activeRoleQueries = new Map<string, Promise<string>>()
const activeStatsQueries = new Map<string, Promise<QuizStats | null>>()

// Optimized hook for user role that prevents duplicate queries
export function useUserRole(user: User | null) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.id) {
        setUserRole(null)
        setLoading(false)
        return
      }

      // Check cache first
      const cached = userRoleCache.get(user.id)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Query Cache] User role served from cache for user ${user.id}`)
        setUserRole(cached.role)
        setLoading(false)
        return
      }

      try {
        // Check if there's already a query in progress for this user
        let rolePromise = activeRoleQueries.get(user.id)
        
        if (!rolePromise) {
          console.log(`[Query Start] Starting new user role query for user ${user.id}`)
          // Create new query promise
          rolePromise = getUserRole(user.id).then(role => {
            const roleValue = role || 'user'
            // Cache the result
            userRoleCache.set(user.id, { role: roleValue, timestamp: Date.now() })
            // Remove from active queries
            activeRoleQueries.delete(user.id)
            return roleValue
          }).catch(error => {
            console.error('Error loading user role:', error)
            // Remove from active queries on error
            activeRoleQueries.delete(user.id)
            return 'user'
          })
          
          activeRoleQueries.set(user.id, rolePromise)
        } else {
          console.log(`[Query Deduplication] Reusing existing user role query for user ${user.id}`)
        }

        const role = await rolePromise
        setUserRole(role)
      } catch (error) {
        console.error('Error loading user role:', error)
        setUserRole('user')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user?.id])

  return { userRole, loading }
}

// Cache for quiz stats to prevent duplicate queries
const quizStatsCache = new Map<string, { stats: QuizStats; timestamp: number }>()

// Optimized hook for quiz stats that prevents duplicate queries
export function useQuizStats(user: User | null) {
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuizStats() {
      if (!user?.id) {
        setQuizStats(null)
        setLoading(false)
        return
      }

      // Check cache first
      const cached = quizStatsCache.get(user.id)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Query Cache] Quiz stats served from cache for user ${user.id}`)
        setQuizStats(cached.stats)
        setLoading(false)
        return
      }

      try {
        // Check if there's already a query in progress for this user
        let statsPromise = activeStatsQueries.get(user.id)
        
        if (!statsPromise) {
          console.log(`[Query Start] Starting new quiz stats query for user ${user.id}`)
          // Create new query promise
          statsPromise = getUserQuizStats(user.id).then(stats => {
            // Cache the result
            if (stats) {
              quizStatsCache.set(user.id, { stats, timestamp: Date.now() })
            }
            // Remove from active queries
            activeStatsQueries.delete(user.id)
            return stats
          }).catch(error => {
            console.error('Error loading quiz stats:', error)
            // Remove from active queries on error
            activeStatsQueries.delete(user.id)
            return null
          })
          
          activeStatsQueries.set(user.id, statsPromise)
        } else {
          console.log(`[Query Deduplication] Reusing existing quiz stats query for user ${user.id}`)
        }

        const stats = await statsPromise
        setQuizStats(stats)
      } catch (error) {
        console.error('Error loading quiz stats:', error)
        setQuizStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizStats()
  }, [user?.id])

  return { quizStats, loading }
}

// Debounced hook to prevent excessive queries
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for preventing duplicate queries while one is in progress
export function useQueryDeduplication() {
  const activeQueries = useRef(new Set<string>())

  const executeQuery = async <T>(
    queryKey: string,
    queryFn: () => Promise<T>
  ): Promise<T | null> => {
    // If query is already in progress, skip
    if (activeQueries.current.has(queryKey)) {
      console.log(`[Query Deduplication] Skipping duplicate query: ${queryKey}`)
      return null
    }

    activeQueries.current.add(queryKey)
    
    try {
      const result = await queryFn()
      return result
    } catch (error) {
      console.error(`[Query Error] ${queryKey}:`, error)
      throw error
    } finally {
      activeQueries.current.delete(queryKey)
    }
  }

  return { executeQuery }
} 