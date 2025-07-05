/**
 * React hook for interacting with BrainTrade smart contracts
 *
 * This hook provides type-safe contract interactions using ethers.js
 * and integrates with Privy wallet for transaction signing.
 */

import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Contract, BrowserProvider } from 'ethers';
import {
  ExpertInfo,
  TokenBalance,
  ContractCallResult,
  EXPERT_TOKEN_ABI,
  EXPERT_FACTORY_ABI,
} from '@/types/contracts';
import {
  DEFAULT_NETWORK,
  isCorrectNetwork,
  formatTokenAmount,
  BLOCKCHAIN_ERRORS,
  BLOCKCHAIN_SUCCESS,
} from '@/lib/blockchain/config';
import { ethers } from 'ethers';
import { switchToCorrectNetwork, hasProviderSend } from '@/utils/network';

// Types for wallet provider methods (using imported utility)

/**
 * Hook for managing contract interactions
 */
export function useContracts() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // State management
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [signer, setSigner] = useState<any>(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [factoryContract, setFactoryContract] = useState<Contract | null>(null);
  const [experts, setExperts] = useState<ExpertInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expertsLoaded, setExpertsLoaded] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Global token balances cache
  const [tokenBalancesCache, setTokenBalancesCache] = useState<Map<string, TokenBalance>>(
    new Map(),
  );
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);

  /**
   * Initialize provider and signer when wallet is ready
   */
  useEffect(() => {
    async function initializeProvider() {
      if (!ready || !authenticated || wallets.length === 0) {
        return;
      }

      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();

        if (!provider) {
          throw new Error('No Ethereum provider found');
        }

        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const network = await ethersProvider.getNetwork();

        setProvider(ethersProvider);
        setSigner(signer);

        // Get user address and clear cache if user changed
        const userAddress = await signer.getAddress();
        if (currentUserAddress && currentUserAddress !== userAddress) {
          setTokenBalancesCache(new Map());
          console.log('🗑️ Cleared token balances cache for new user:', userAddress);
        }
        setCurrentUserAddress(userAddress);

        const isCorrect = isCorrectNetwork(Number(network.chainId));
        setIsCorrectChain(isCorrect);

        // Automatically switch to correct network if needed
        if (!isCorrect) {
          console.log('Wrong network detected, attempting auto-switch...');
          if (hasProviderSend(provider)) {
            const switched = await switchToCorrectNetwork(provider);
            if (switched) {
              setIsCorrectChain(true);
            }
          }
        }

        // Initialize factory contract if address is available
        const factoryAddress = DEFAULT_NETWORK.contracts.expertFactory;
        if (factoryAddress) {
          const factory = new Contract(factoryAddress, EXPERT_FACTORY_ABI, signer);
          setFactoryContract(factory);
        }
      } catch (err) {
        console.error('Failed to initialize provider:', err);
        setError('Failed to connect to blockchain');
      }
    }

    initializeProvider();
  }, [ready, authenticated, wallets, currentUserAddress]);

  /**
   * Load all experts from factory contract
   */
  const loadExperts = useCallback(async (): Promise<ContractCallResult<ExpertInfo[]>> => {
    if (expertsLoaded) {
      return { success: true, data: experts };
    }

    if (loading || initializationAttempted) {
      return { success: false, error: 'Load already in progress' };
    }

    try {
      setLoading(true);
      setError(null);
      setInitializationAttempted(true);

      // If factory contract exists, try to load from blockchain
      if (factoryContract) {
        try {
          // First test if contract exists and has code
          const code = await provider?.getCode(DEFAULT_NETWORK.contracts.expertFactory);

          if (!code || code === '0x') {
            throw new Error(
              `Factory contract not deployed at address: ${DEFAULT_NETWORK.contracts.expertFactory}`,
            );
          }

          // Now get all experts
          const result = await factoryContract.getAllExperts();

          // Handle different possible return formats
          let symbols, tokenAddresses, names, categories, tokensPerQuery, isActive;

          if (Array.isArray(result)) {
            if (result.length === 6) {
              [symbols, tokenAddresses, names, categories, tokensPerQuery, isActive] = result;
            } else if (result.length === 1 && typeof result[0] === 'object') {
              // Result might be wrapped in an object
              const data = result[0];
              symbols = data.symbols_ || data[0];
              tokenAddresses = data.tokenAddresses_ || data[1];
              names = data.names_ || data[2];
              categories = data.categories_ || data[3];
              tokensPerQuery = data.tokensPerQuery_ || data[4];
              isActive = data.isActive_ || data[5];
            } else {
              console.error('❌ Unexpected array format:', result);
              throw new Error('Invalid contract response format');
            }
          } else if (typeof result === 'object' && result !== null) {
            // Result is an object with named properties
            symbols = result.symbols_ || result[0];
            tokenAddresses = result.tokenAddresses_ || result[1];
            names = result.names_ || result[2];
            categories = result.categories_ || result[3];
            tokensPerQuery = result.tokensPerQuery_ || result[4];
            isActive = result.isActive_ || result[5];
          } else {
            console.error('❌ Unexpected result format:', result);
            throw new Error('Invalid contract response format');
          }
          console.log('✅ Parsed arrays:', {
            symbols: Array.isArray(symbols) ? symbols.length : 'not array',
            tokenAddresses: Array.isArray(tokenAddresses) ? tokenAddresses.length : 'not array',
            names: Array.isArray(names) ? names.length : 'not array',
          });

          const expertsData: ExpertInfo[] = symbols.map((symbol: string, index: number) => ({
            symbol,
            tokenAddress: tokenAddresses[index],
            name: names[index],
            category: categories[index],
            tokensPerQuery: Number(tokensPerQuery[index]),
            expertAddress: '', // Would need separate call to get this
            isActive: isActive[index],
            totalConsultations: 0, // Would need separate call
            totalRevenue: 0, // Would need separate call
          }));

          setExperts(expertsData);
          setExpertsLoaded(true);

          return {
            success: true,
            data: expertsData,
          };
        } catch (contractError) {
          console.error('Failed to load experts from blockchain:', contractError);

          return {
            success: false,
            error: `Failed to load experts: ${(contractError as Error).message}`,
          };
        }
      }

      console.error('❌ Factory contract not available');
      setError(
        'Factory contract not available. Please connect wallet and switch to correct network.',
      );

      return {
        success: false,
        error: 'Factory contract not available. Please connect wallet.',
      };
    } catch (err) {
      const errorMessage = (err as Error).message || BLOCKCHAIN_ERRORS.transactionFailed;
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [factoryContract, expertsLoaded, loading, experts, provider, initializationAttempted]);

  /**
   * Get expert token contract instance
   */
  const getExpertTokenContract = useCallback(
    (tokenAddress: string): Contract | null => {
      if (!signer || !tokenAddress) {
        return null;
      }

      try {
        const contract = new Contract(tokenAddress, EXPERT_TOKEN_ABI, signer);
        return contract;
      } catch (error) {
        console.error('Failed to create token contract:', error);
        return null;
      }
    },
    [signer],
  );

  /**
   * Get token balance for user
   */
  const getTokenBalance = useCallback(
    async (
      tokenAddress: string,
      userAddress?: string,
      forceRefresh?: boolean,
    ): Promise<ContractCallResult<TokenBalance>> => {
      try {
        // Get user address for cache key
        const address = userAddress || (signer ? await signer.getAddress() : null);

        // Check cache only if we have an address and not forcing refresh
        if (address && !forceRefresh) {
          const cacheKey = `${tokenAddress}_${address}`;
          const cachedBalance = tokenBalancesCache.get(cacheKey);
          // console.log('🔍 Cache check for', cacheKey, 'has cached:', !!cachedBalance);

          if (cachedBalance) {
            // console.log('🔄 Using cached balance for', cacheKey, ':', cachedBalance.balanceFormatted);
            return {
              success: true,
              data: cachedBalance,
            };
          }
          // console.log('🔍 No cached balance found for', cacheKey, 'loading from blockchain...');
        }

        // Try to use real contract if signer exists
        if (signer) {
          const tokenContract = getExpertTokenContract(tokenAddress);

          if (tokenContract) {
            try {
              const address = userAddress || (await signer.getAddress());

              // First check if contract exists
              const code = await provider?.getCode(tokenAddress);
              if (!code || code === '0x') {
                console.warn(`⚠️ Token contract not deployed at ${tokenAddress}`);
                return {
                  success: false,
                  error: `Token contract not deployed at address: ${tokenAddress}`,
                };
              }

              // Make calls individually to better handle errors
              let balance, name, symbol, canAfford;

              try {
                balance = await tokenContract.balanceOf(address);
              } catch (err) {
                console.error('❌ Failed to get balance:', err);
                balance = BigInt(0);
              }

              try {
                name = await tokenContract.name();
              } catch (err) {
                console.error('❌ Failed to get name:', err);
                name = 'Unknown Token';
              }

              try {
                symbol = await tokenContract.symbol();
              } catch (err) {
                console.error('❌ Failed to get symbol:', err);
                // Try to get symbol from expert info
                const expert = experts.find(e => e.tokenAddress === tokenAddress);
                symbol = expert?.symbol || 'UNKNOWN';
              }

              try {
                canAfford = await tokenContract.canAffordConsultation(address);
              } catch (err) {
                console.error('❌ Failed to check canAfford:', err);
                // Fallback: check if balance is enough based on expert info
                const expert = experts.find(e => e.tokenAddress === tokenAddress);
                const requiredTokens = expert
                  ? BigInt(expert.tokensPerQuery) * BigInt(10) ** BigInt(18)
                  : BigInt(0);
                canAfford = balance >= requiredTokens;
              }

              const tokenBalance: TokenBalance = {
                symbol,
                name,
                balance,
                balanceFormatted: formatTokenAmount(balance),
                tokenAddress,
                canAffordConsultation: canAfford,
              };

              // Save to cache
              if (address) {
                const cacheKey = `${tokenAddress}_${address}`;
                setTokenBalancesCache(prev => new Map(prev.set(cacheKey, tokenBalance)));
                console.log(
                  '💾 Cached balance for',
                  cacheKey,
                  ':',
                  tokenBalance.balanceFormatted,
                  tokenBalance.symbol,
                );
              }

              return {
                success: true,
                data: tokenBalance,
              };
            } catch (contractError) {
              console.error('❌ Contract call failed:', contractError);
              return {
                success: false,
                error: `Failed to read from token contract: ${(contractError as Error).message}`,
              };
            }
          }
        }

        console.error('❌ No signer available or contract not found');

        return {
          success: false,
          error:
            'Unable to connect to blockchain. Please connect wallet and switch to correct network.',
        };
      } catch (err) {
        return {
          success: false,
          error: (err as Error).message || BLOCKCHAIN_ERRORS.transactionFailed,
        };
      }
    },
    [signer, getExpertTokenContract, experts, provider, tokenBalancesCache],
  );

  /**
   * Purchase expert tokens
   */
  const purchaseTokens = useCallback(
    async (
      tokenAddress: string,
      tokenAmount: bigint,
      ethAmount: bigint,
    ): Promise<ContractCallResult> => {
      if (!signer) {
        return {
          success: false,
          error: BLOCKCHAIN_ERRORS.contractNotFound,
        };
      }

      try {
        setLoading(true);

        // Check ETH balance before transaction
        const userAddress = await signer.getAddress();
        const ethBalance = await provider?.getBalance(userAddress);

        if (ethBalance && ethBalance < ethers.parseEther('0.001')) {
          return {
            success: false,
            error: `Insufficient ETH for gas fees. Current balance: ${ethers.formatEther(ethBalance)} ETH. Please add at least 0.001 ETH to your wallet.`,
          };
        }

        const tokenContract = getExpertTokenContract(tokenAddress);
        console.log('🔍 PurchaseTokens debug:', {
          tokenAddress,
          tokenAmount: tokenAmount.toString(),
          ethAmount: ethAmount.toString(),
          tokenContract: !!tokenContract,
          signer: !!signer,
          userAddress,
          ethBalance: ethBalance ? ethers.formatEther(ethBalance) : 'unknown',
        });

        if (!tokenContract) {
          console.error('❌ Token contract not found for address:', tokenAddress);
          console.error(
            'Available experts:',
            experts.map(e => ({ symbol: e.symbol, address: e.tokenAddress })),
          );
          return {
            success: false,
            error: 'Token contract not found. Please check network connection.',
          };
        }

        const tx = await tokenContract.purchaseTokens(tokenAmount, {
          value: ethAmount,
        });

        const receipt = await tx.wait();

        // Clear cache for this token after purchase
        const address = await signer.getAddress();
        const cacheKey = `${tokenAddress}_${address}`;
        setTokenBalancesCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(cacheKey);
          return newCache;
        });
        console.log('🗑️ Cleared cache for', cacheKey, 'after token purchase');

        return {
          success: true,
          data: BLOCKCHAIN_SUCCESS.tokensPurchased,
          transaction: {
            hash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
          },
        };
      } catch (err) {
        const error = err as { code?: string; message?: string };
        let errorMessage = error.message || BLOCKCHAIN_ERRORS.transactionFailed;

        // Improve error messages for common issues
        if (error.code === 'ACTION_REJECTED') {
          errorMessage = BLOCKCHAIN_ERRORS.userRejected;
        } else if (error.message?.includes('insufficient funds')) {
          errorMessage =
            'Insufficient ETH for gas fees. Please add ETH to your wallet and try again.';
        }

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [signer, getExpertTokenContract, experts, provider],
  );

  /**
   * Start consultation with expert
   */
  const startConsultation = useCallback(
    async (tokenAddress: string, consultationId: string): Promise<ContractCallResult> => {
      if (!signer) {
        return {
          success: false,
          error: BLOCKCHAIN_ERRORS.contractNotFound,
        };
      }

      try {
        setLoading(true);
        const tokenContract = getExpertTokenContract(tokenAddress);

        if (!tokenContract) {
          return {
            success: false,
            error: BLOCKCHAIN_ERRORS.contractNotFound,
          };
        }

        // Convert consultation ID to number for contract
        const consultationIdNum = BigInt(consultationId.replace(/\D/g, '') || Date.now());

        const tx = await tokenContract.startConsultation(consultationIdNum);
        const receipt = await tx.wait();

        // Clear cache for this token after consultation
        const address = await signer.getAddress();
        const cacheKey = `${tokenAddress}_${address}`;
        setTokenBalancesCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(cacheKey);
          return newCache;
        });
        console.log('🗑️ Cleared cache for', cacheKey, 'after consultation');

        return {
          success: true,
          data: BLOCKCHAIN_SUCCESS.consultationStarted,
          transaction: {
            hash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
          },
        };
      } catch (err) {
        const error = err as Error;
        const errorMessage = error.message.includes('Insufficient token balance')
          ? BLOCKCHAIN_ERRORS.insufficientTokens
          : error.message || BLOCKCHAIN_ERRORS.transactionFailed;

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [signer, getExpertTokenContract],
  );

  /**
   * Switch to correct network
   */
  const switchNetwork = useCallback(async (): Promise<ContractCallResult> => {
    if (!provider) {
      return {
        success: false,
        error: 'No provider available',
      };
    }

    if (!hasProviderSend(provider)) {
      return {
        success: false,
        error: 'Provider does not support network switching',
      };
    }

    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}` },
      ]);
      setIsCorrectChain(true);
      return { success: true, data: 'Network switched successfully' };
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: `0x${DEFAULT_NETWORK.chainId.toString(16)}`,
              chainName: DEFAULT_NETWORK.name,
              rpcUrls: [DEFAULT_NETWORK.rpcUrl],
              blockExplorerUrls: [DEFAULT_NETWORK.blockExplorer],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            },
          ]);
          setIsCorrectChain(true);
          return { success: true, data: 'Network added and switched successfully' };
        } catch (addError: unknown) {
          const addErr = addError as { message?: string };
          return { success: false, error: addErr.message || 'Failed to add network' };
        }
      }
      return { success: false, error: error.message || 'Failed to switch network' };
    }
  }, [provider]);

  /**
   * Clear all cached token balances
   */
  const clearBalancesCache = useCallback(() => {
    setTokenBalancesCache(new Map());
    console.log('🗑️ Cleared all token balances cache');
  }, []);

  // Clear cache function for debugging
  const clearBalanceCache = useCallback(() => {
    console.log('🧹 Clearing balance cache...');
    tokenBalancesCache.clear();
    setExpertsLoaded(false);
  }, [tokenBalancesCache]);

  return {
    // State
    provider,
    signer,
    isCorrectChain,
    experts,
    loading,
    error,

    // Contract instances
    factoryContract,
    getExpertTokenContract,

    // Functions
    loadExperts,
    getTokenBalance,
    purchaseTokens,
    startConsultation,
    switchNetwork,
    clearBalancesCache,
    clearBalanceCache,

    // Cache state
    tokenBalancesCache,

    // Utilities
    isReady: ready && authenticated && !!signer,
    hasWallet: wallets.length > 0,
  };
}
