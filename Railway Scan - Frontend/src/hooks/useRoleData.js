import { useState, useEffect, useRef, useCallback } from 'react'
import { useRole } from './useRole'

/**
 * Global cache store for role-based data
 * Shared across all components to enable cache reuse
 */
const globalCache = {}
const cacheTimeouts = {}

/**
 * Role-based data caching hook
 *
 * Provides a lightweight caching mechanism for role-specific data without React Query.
 * Uses role-based cache keys to prevent data leakage between roles.
 *
 * @param {string} dataKey - Unique identifier for the data being cached
 * @param {Function} fetcher - Async function that fetches the data
 * @param {Object} options - Configuration options
 * @param {number} options.staleTime - Time in ms before data is considered stale (default: 5 minutes)
 * @param {number} options.cacheTime - Time in ms before cached data is removed (default: 10 minutes)
 * @param {boolean} options.enabled - Whether to fetch data automatically (default: true)
 * @param {Function} options.onSuccess - Callback when data is fetched successfully
 * @param {Function} options.onError - Callback when fetch fails
 *
 * @returns {Object} { data, isLoading, error, refetch, invalidate }
 */
export const useRoleData = (dataKey, fetcher, options = {}) => {
  const { role } = useRole()

  // Default options
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    enabled = true,
    onSuccess,
    onError,
  } = options

  // State
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ref to track if component is mounted
  const isMountedRef = useRef(true)

  // Generate role-specific cache key
  const getCacheKey = useCallback(() => {
    return `${role}:${dataKey}`
  }, [role, dataKey])

  /**
   * Check if cached data is still fresh
   */
  const isCacheFresh = useCallback(() => {
    const cacheKey = getCacheKey()
    const cachedEntry = globalCache[cacheKey]

    if (!cachedEntry) return false

    const now = Date.now()
    const age = now - cachedEntry.timestamp

    return age < staleTime
  }, [getCacheKey, staleTime])

  /**
   * Get data from cache
   */
  const getCachedData = useCallback(() => {
    const cacheKey = getCacheKey()
    return globalCache[cacheKey]?.data || null
  }, [getCacheKey])

  /**
   * Store data in cache
   */
  const setCachedData = useCallback(
    newData => {
      const cacheKey = getCacheKey()
      const timestamp = Date.now()

      globalCache[cacheKey] = {
        data: newData,
        timestamp,
      }

      // Clear existing timeout
      if (cacheTimeouts[cacheKey]) {
        clearTimeout(cacheTimeouts[cacheKey])
      }

      // Set up cache expiration
      cacheTimeouts[cacheKey] = setTimeout(() => {
        delete globalCache[cacheKey]
        delete cacheTimeouts[cacheKey]
      }, cacheTime)
    },
    [getCacheKey, cacheTime]
  )

  /**
   * Invalidate cache for this data key
   */
  const invalidate = useCallback(() => {
    const cacheKey = getCacheKey()
    delete globalCache[cacheKey]

    if (cacheTimeouts[cacheKey]) {
      clearTimeout(cacheTimeouts[cacheKey])
      delete cacheTimeouts[cacheKey]
    }
  }, [getCacheKey])

  /**
   * Fetch data from the fetcher function
   */
  const fetchData = useCallback(
    async (force = false) => {
      // Check if we should use cached data
      if (!force && isCacheFresh()) {
        const cachedData = getCachedData()
        if (cachedData !== null) {
          if (isMountedRef.current) {
            setData(cachedData)
            setError(null)
          }
          return cachedData
        }
      }

      if (isMountedRef.current) {
        setIsLoading(true)
        setError(null)
      }

      try {
        const result = await fetcher()

        if (isMountedRef.current) {
          setData(result)
          setCachedData(result)

          if (onSuccess) {
            onSuccess(result)
          }
        }

        return result
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data'

        if (isMountedRef.current) {
          setError(errorMessage)

          if (onError) {
            onError(err)
          }
        }

        throw err
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [fetcher, isCacheFresh, getCachedData, setCachedData, onSuccess, onError]
  )

  /**
   * Refetch data (bypasses cache)
   */
  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Initial fetch on mount or when dependencies change
  useEffect(() => {
    if (!enabled) return

    // Check if we have fresh cached data
    if (isCacheFresh()) {
      const cachedData = getCachedData()
      if (cachedData !== null) {
        setData(cachedData)
        return
      }
    }

    // Fetch fresh data
    fetchData()
  }, [enabled, fetchData, isCacheFresh, getCachedData])

  // Invalidate cache when role changes
  const prevRoleRef = useRef(role)
  useEffect(() => {
    if (prevRoleRef.current !== role) {
      invalidate()
      prevRoleRef.current = role
    }
  }, [role, invalidate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
  }
}

/**
 * Global cache store for role-based data
 * Allows cache invalidation across components
 */

/**
 * Invalidate all cached data for a specific role
 *
 * @param {string} role - Role to invalidate cache for
 */
export const invalidateRoleCache = role => {
  Object.keys(globalCache).forEach(key => {
    if (key.startsWith(`${role}:`)) {
      delete globalCache[key]

      if (cacheTimeouts[key]) {
        clearTimeout(cacheTimeouts[key])
        delete cacheTimeouts[key]
      }
    }
  })
}

/**
 * Invalidate all cached data
 */
export const invalidateAllCache = () => {
  Object.keys(globalCache).forEach(key => {
    delete globalCache[key]

    if (cacheTimeouts[key]) {
      clearTimeout(cacheTimeouts[key])
      delete cacheTimeouts[key]
    }
  })
}

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  const stats = {
    totalEntries: Object.keys(globalCache).length,
    byRole: {},
  }

  Object.keys(globalCache).forEach(key => {
    const [role] = key.split(':')
    stats.byRole[role] = (stats.byRole[role] || 0) + 1
  })

  return stats
}
