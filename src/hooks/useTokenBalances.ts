import { useState, useCallback, useEffect } from 'react';
import { ExpertInfo, TokenBalance } from '@/types/contracts';
import { useContracts } from './useContracts';

interface UseTokenBalancesReturn {
  /** Map of expert symbol to token balance */
  balances: Map<string, TokenBalance>;
  /** Set of symbols that are currently loading */
  loading: Set<string>;
  /** Set of symbols that have been loaded */
  loaded: Set<string>;
  /** Load balance for a specific expert */
  loadBalance: (expert: ExpertInfo, forceRefresh?: boolean) => Promise<void>;
  /** Load balances for multiple experts */
  loadBalances: (experts: ExpertInfo[], forceRefresh?: boolean) => Promise<void>;
  /** Clear all cached balances */
  clearBalances: () => void;
  /** Check if an expert's balance is loading */
  isLoading: (symbol: string) => boolean;
  /** Check if an expert's balance has been loaded */
  isLoaded: (symbol: string) => boolean;
  /** Get balance for a specific expert */
  getBalance: (symbol: string) => TokenBalance | undefined;
}

export function useTokenBalances(): UseTokenBalancesReturn {
  const { getTokenBalance, isReady, signer } = useContracts();

  const [balances, setBalances] = useState<Map<string, TokenBalance>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);

  /**
   * Clear balances when wallet changes
   */
  useEffect(() => {
    async function checkWalletChange() {
      if (signer) {
        const walletAddress = await signer.getAddress();
        if (currentWallet && currentWallet !== walletAddress) {
          console.log('🔄 Wallet changed, clearing token balances cache');
          setBalances(new Map());
          setLoaded(new Set());
          setLoading(new Set());
        }
        setCurrentWallet(walletAddress);
      } else {
        setCurrentWallet(null);
        setBalances(new Map());
        setLoaded(new Set());
        setLoading(new Set());
      }
    }

    checkWalletChange();
  }, [signer, currentWallet]);

  /**
   * Load balance for a specific expert
   */
  const loadBalance = useCallback(
    async (expert: ExpertInfo, forceRefresh = false): Promise<void> => {
      if (!isReady || !expert.tokenAddress) {
        console.log(
          `❌ Cannot load balance for ${expert.symbol}: isReady=${isReady}, tokenAddress=${expert.tokenAddress}`,
        );
        return;
      }

      // Skip if already loading (unless forcing refresh)
      if (!forceRefresh && loading.has(expert.symbol)) {
        return;
      }

      // Skip if already loaded (unless forcing refresh)
      if (!forceRefresh && loaded.has(expert.symbol)) {
        return;
      }

      console.log(`🔍 Loading balance for ${expert.symbol}`, { forceRefresh });

      // Mark as loading
      setLoading(prev => new Set(prev).add(expert.symbol));

      try {
        const result = await getTokenBalance(expert.tokenAddress, undefined, forceRefresh);

        console.log(`🔍 Balance result for ${expert.symbol}:`, {
          success: result.success,
          hasData: !!result.data,
          balanceFormatted: result.data?.balanceFormatted,
          error: result.error,
        });

        if (result.success && result.data) {
          setBalances(prev => new Map(prev).set(expert.symbol, result.data!));
          setLoaded(prev => new Set(prev).add(expert.symbol));
          console.log(`✅ Loaded balance for ${expert.symbol}:`, result.data.balanceFormatted);
        } else {
          console.log(`❌ Failed to load balance for ${expert.symbol}:`, result.error);
          setLoaded(prev => new Set(prev).add(expert.symbol));
        }
      } catch (err) {
        console.error(`Failed to load balance for ${expert.symbol}:`, err);
        setLoaded(prev => new Set(prev).add(expert.symbol));
      } finally {
        setLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(expert.symbol);
          return newSet;
        });
      }
    },
    [isReady, getTokenBalance, loading, loaded],
  );

  /**
   * Load balances for multiple experts
   */
  const loadBalances = useCallback(
    async (experts: ExpertInfo[], forceRefresh = false): Promise<void> => {
      const promises = experts
        .filter(expert => forceRefresh || !loaded.has(expert.symbol))
        .map(expert => loadBalance(expert, forceRefresh));

      await Promise.all(promises);
    },
    [loadBalance, loaded],
  );

  /**
   * Clear all cached balances
   */
  const clearBalances = useCallback(() => {
    console.log('🧹 Clearing all token balances');
    setBalances(new Map());
    setLoaded(new Set());
    setLoading(new Set());
  }, []);

  /**
   * Helper functions
   */
  const isLoading = useCallback((symbol: string) => loading.has(symbol), [loading]);
  const isLoaded = useCallback((symbol: string) => loaded.has(symbol), [loaded]);
  const getBalance = useCallback((symbol: string) => balances.get(symbol), [balances]);

  return {
    balances,
    loading,
    loaded,
    loadBalance,
    loadBalances,
    clearBalances,
    isLoading,
    isLoaded,
    getBalance,
  };
}
