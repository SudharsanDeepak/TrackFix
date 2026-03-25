import { create } from 'zustand'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

export const useCacheStore = create((set, get) => ({
  cache: {},
  cacheStats: {
    hits: 0,
    misses: 0,
  },

  // Set cache entry with TTL
  setCache: (key, data) =>
    set(state => ({
      cache: {
        ...state.cache,
        [key]: {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + CACHE_TTL,
        },
      },
    })),

  // Get cache entry
  getCache: key => {
    const state = get()
    const entry = state.cache[key]

    if (!entry) {
      // Cache miss
      set(state => ({
        cacheStats: { ...state.cacheStats, misses: state.cacheStats.misses + 1 },
      }))
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      // Remove expired entry
      get().invalidateCache(key)
      set(state => ({
        cacheStats: { ...state.cacheStats, misses: state.cacheStats.misses + 1 },
      }))
      return null
    }

    // Cache hit
    set(state => ({
      cacheStats: { ...state.cacheStats, hits: state.cacheStats.hits + 1 },
    }))
    return entry.data
  },

  // Invalidate specific cache entry
  invalidateCache: key =>
    set(state => {
      const newCache = { ...state.cache }
      delete newCache[key]
      return { cache: newCache }
    }),

  // Invalidate cache entries matching pattern
  invalidateCachePattern: pattern =>
    set(state => {
      const newCache = { ...state.cache }
      Object.keys(newCache).forEach(key => {
        if (key.includes(pattern)) {
          delete newCache[key]
        }
      })
      return { cache: newCache }
    }),

  // Clear all cache
  clearCache: () => set({ cache: {} }),

  // Clean expired entries
  cleanExpiredCache: () =>
    set(state => {
      const now = Date.now()
      const newCache = {}
      Object.entries(state.cache).forEach(([key, entry]) => {
        if (now <= entry.expiresAt) {
          newCache[key] = entry
        }
      })
      return { cache: newCache }
    }),

  // Get cache statistics
  getCacheStats: () => get().cacheStats,

  // Reset cache statistics
  resetCacheStats: () =>
    set({
      cacheStats: {
        hits: 0,
        misses: 0,
      },
    }),
}))

// Auto-cleanup expired cache entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    useCacheStore.getState().cleanExpiredCache()
  }, 60000)
}
