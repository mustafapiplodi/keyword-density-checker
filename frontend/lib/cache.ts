import type { AnalysisResults } from "@/types"

const CACHE_KEY_PREFIX = "seo_analysis_"
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 // 24 hours

interface CachedResult {
  data: AnalysisResults
  timestamp: number
  hash: string
}

/**
 * Generate a hash from request parameters for cache key
 */
export function generateCacheKey(text: string, options: Record<string, any> = {}): string {
  const normalizedText = text.substring(0, 500).trim() // Use first 500 chars
  const optionsString = JSON.stringify(options)
  const combined = `${normalizedText}_${optionsString}`

  // Simple hash function
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return `${CACHE_KEY_PREFIX}${Math.abs(hash)}`
}

/**
 * Get cached analysis result if available and not expired
 */
export function getCachedResult(cacheKey: string): AnalysisResults | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const parsedCache: CachedResult = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is expired
    if (now - parsedCache.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return parsedCache.data
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

/**
 * Save analysis result to cache
 */
export function setCachedResult(cacheKey: string, data: AnalysisResults): void {
  if (typeof window === 'undefined') return

  try {
    const cacheData: CachedResult = {
      data,
      timestamp: Date.now(),
      hash: cacheKey,
    }

    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error writing to cache:', error)
    // If quota exceeded, clear old entries
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheEntries()
      // Try again
      try {
        const cacheData: CachedResult = {
          data,
          timestamp: Date.now(),
          hash: cacheKey,
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      } catch (retryError) {
        console.error('Error writing to cache after cleanup:', retryError)
      }
    }
  }
}

/**
 * Clear expired cache entries
 */
export function clearOldCacheEntries(): void {
  if (typeof window === 'undefined') return

  try {
    const now = Date.now()
    const keysToRemove: string[] = []

    // Find all cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const cached = localStorage.getItem(key)
        if (cached) {
          try {
            const parsedCache: CachedResult = JSON.parse(cached)
            if (now - parsedCache.timestamp > CACHE_EXPIRY_MS) {
              keysToRemove.push(key)
            }
          } catch (error) {
            // Invalid cache entry, remove it
            keysToRemove.push(key)
          }
        }
      }
    }

    // Remove expired entries
    keysToRemove.forEach(key => localStorage.removeItem(key))

    console.log(`Cleared ${keysToRemove.length} expired cache entries`)
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Clear all cached analysis results
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return

  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))

    console.log(`Cleared all ${keysToRemove.length} cache entries`)
  } catch (error) {
    console.error('Error clearing all cache:', error)
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; totalSize: number } {
  if (typeof window === 'undefined') return { count: 0, totalSize: 0 }

  let count = 0
  let totalSize = 0

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        count++
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length
        }
      }
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
  }

  return { count, totalSize }
}
