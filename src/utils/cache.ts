/**
 * Cache management utilities
 */

/**
 * Generic cache manager with TTL support
 */
export class CacheManager<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();

  constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 5 minutes default

  /**
   * Set cache entry with optional TTL
   */
  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get cache entry if not expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Create cache key from multiple parts
 */
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join('_');
}

/**
 * User-specific cache key generator
 */
export function createUserCacheKey(userAddress: string, ...parts: (string | number)[]): string {
  return createCacheKey(userAddress, ...parts);
}
