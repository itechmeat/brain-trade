/**
 * Token Cache Hook
 *
 * Manages token balance caching with TTL and user-specific isolation
 */

import { useCallback, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { CacheManager, createUserCacheKey } from '@/utils/cache';
import { TokenBalance } from '@/types/contracts';

// Global cache instance
const tokenCache = new CacheManager<TokenBalance>(5 * 60 * 1000); // 5 minutes TTL

export function useTokenCache() {
  const { authenticated, user } = usePrivy();
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);

  // Get user address from embedded wallet
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      const userAddress = user.wallet.address;

      // Clear cache if user changed
      if (currentUserAddress && currentUserAddress !== userAddress) {
        tokenCache.clear();
        console.log('🔄 User changed, clearing token cache');
      }

      setCurrentUserAddress(userAddress);
    }
  }, [authenticated, user?.wallet?.address, currentUserAddress]);

  /**
   * Get token balance from cache
   */
  const getTokenBalance = useCallback(
    (tokenAddress: string): TokenBalance | null => {
      if (!currentUserAddress) return null;

      const cacheKey = createUserCacheKey(currentUserAddress, tokenAddress);
      return tokenCache.get(cacheKey);
    },
    [currentUserAddress],
  );

  /**
   * Set token balance in cache
   */
  const setTokenBalance = useCallback(
    (tokenAddress: string, balance: TokenBalance): void => {
      if (!currentUserAddress) return;

      const cacheKey = createUserCacheKey(currentUserAddress, tokenAddress);
      tokenCache.set(cacheKey, balance);
    },
    [currentUserAddress],
  );

  /**
   * Check if token balance is cached
   */
  const hasTokenBalance = useCallback(
    (tokenAddress: string): boolean => {
      if (!currentUserAddress) return false;

      const cacheKey = createUserCacheKey(currentUserAddress, tokenAddress);
      return tokenCache.has(cacheKey);
    },
    [currentUserAddress],
  );

  /**
   * Clear specific token balance
   */
  const clearTokenBalance = useCallback(
    (tokenAddress: string): void => {
      if (!currentUserAddress) return;

      const cacheKey = createUserCacheKey(currentUserAddress, tokenAddress);
      tokenCache.delete(cacheKey);
    },
    [currentUserAddress],
  );

  /**
   * Clear all token balances for current user
   */
  const clearAllTokenBalances = useCallback((): void => {
    if (!currentUserAddress) return;

    const stats = tokenCache.getStats();
    const userPrefix = `${currentUserAddress}_`;

    stats.keys.forEach(key => {
      if (key.startsWith(userPrefix)) {
        tokenCache.delete(key);
      }
    });

    console.log('🧹 Cleared all token balances for user');
  }, [currentUserAddress]);

  /**
   * Clear entire cache (all users)
   */
  const clearCache = useCallback((): void => {
    tokenCache.clear();
    console.log('🧹 Cleared entire token cache');
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const stats = tokenCache.getStats();
    const userPrefix = currentUserAddress ? `${currentUserAddress}_` : '';
    const userKeys = stats.keys.filter(key => key.startsWith(userPrefix));

    return {
      totalSize: stats.size,
      userSize: userKeys.length,
      userKeys,
      allKeys: stats.keys,
    };
  }, [currentUserAddress]);

  return {
    // Cache operations
    getTokenBalance,
    setTokenBalance,
    hasTokenBalance,
    clearTokenBalance,
    clearAllTokenBalances,
    clearCache,
    getCacheStats,

    // State
    currentUserAddress,
    isReady: !!currentUserAddress,
  };
}
