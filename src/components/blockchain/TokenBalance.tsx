/**
 * Token Balance Component
 *
 * Displays user's expert token balances with purchase and consultation actions.
 * Integrates with smart contracts to show real-time balance data.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useContracts } from '@/hooks/useContracts';
import { TokenBalance as TokenBalanceType } from '@/types/contracts';
import { formatTokenAmount } from '@/lib/blockchain/config';
import styles from './TokenBalance.module.scss';

interface TokenBalanceProps {
  expertSymbol: string;
  tokenAddress: string;
  className?: string;
}

/**
 * Individual token balance display
 */
export function TokenBalance({ expertSymbol, tokenAddress, className }: TokenBalanceProps) {
  const { getTokenBalance, purchaseTokens, isReady, loading } = useContracts();
  const [balance, setBalance] = useState<TokenBalanceType | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load token balance
   */
  useEffect(() => {
    async function loadBalance() {
      if (!isReady || !tokenAddress) return;

      const result = await getTokenBalance(tokenAddress);
      if (result.success && result.data) {
        setBalance(result.data);
      } else {
        setError(result.error || 'Failed to load balance');
      }
    }

    loadBalance();
  }, [isReady, tokenAddress, getTokenBalance]);

  /**
   * Handle token purchase
   */
  const handlePurchase = async (tokenAmount: number) => {
    if (!tokenAddress) return;

    try {
      setPurchasing(true);
      setError(null);

      // Simple pricing: 0.001 ETH per 100 tokens
      const ethAmount = BigInt(Math.floor(tokenAmount * 0.00001 * 1e18));
      const tokenAmountBig = BigInt(tokenAmount * 1e18);

      const result = await purchaseTokens(tokenAddress, tokenAmountBig, ethAmount);

      if (result.success) {
        // Reload balance after purchase
        const balanceResult = await getTokenBalance(tokenAddress);
        if (balanceResult.success && balanceResult.data) {
          setBalance(balanceResult.data);
        }
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (err) {
      setError((err as Error).message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (!isReady) {
    return (
      <div className={`${styles.tokenBalance} ${className || ''}`}>
        <div className={styles.loading}>
          <span>🔗 Connecting to blockchain...</span>
        </div>
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className={`${styles.tokenBalance} ${className || ''}`}>
        <div className={styles.error}>
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.tokenBalance} ${className || ''}`}>
      <div className={styles.header}>
        <h3>{expertSymbol} Tokens</h3>
        {balance && (
          <div className={styles.balanceDisplay}>
            <span className={styles.amount}>{formatTokenAmount(balance.balance)}</span>
            <span className={styles.symbol}>{balance.symbol}</span>
          </div>
        )}
      </div>

      {balance && (
        <div className={styles.status}>
          <div className={styles.consultationStatus}>
            {balance.canAffordConsultation ? (
              <span className={styles.canAfford}>✅ Can afford consultation</span>
            ) : (
              <span className={styles.cannotAfford}>❌ Need more tokens</span>
            )}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <h4>Purchase Tokens</h4>
        <div className={styles.purchaseOptions}>
          {[100, 500, 1000].map(amount => (
            <button
              key={amount}
              onClick={() => handlePurchase(amount)}
              disabled={purchasing || loading}
              className={styles.purchaseButton}
            >
              {purchasing ? '⏳' : '💰'} Buy {amount} tokens
              <small>(~{(amount * 0.00001).toFixed(4)} ETH)</small>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span>❌ {error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * All Expert Tokens Balance Dashboard
 */
interface TokenBalanceDashboardProps {
  className?: string;
}

export function TokenBalanceDashboard({ className }: TokenBalanceDashboardProps) {
  const { experts, loadExperts, isReady, isCorrectChain, switchNetwork } = useContracts();
  const [loading, setLoading] = useState(false);

  /**
   * Load experts on mount
   */
  useEffect(() => {
    async function init() {
      if (!isReady) return;

      setLoading(true);
      await loadExperts();
      setLoading(false);
    }

    init();
  }, [isReady, loadExperts]);

  if (!isReady) {
    return (
      <div className={`${styles.dashboard} ${className || ''}`}>
        <div className={styles.loading}>
          <h2>🔗 Connecting to Blockchain...</h2>
          <p>Please connect your wallet to view token balances</p>
        </div>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className={`${styles.dashboard} ${className || ''}`}>
        <div className={styles.networkError}>
          <h2>🔧 Wrong Network</h2>
          <p>Please switch to Zircuit Testnet to use BrainTrade</p>
          <button onClick={switchNetwork} className={styles.switchButton}>
            🔄 Switch to Zircuit Testnet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${styles.dashboard} ${className || ''}`}>
        <div className={styles.loading}>
          <h2>⏳ Loading Expert Tokens...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${className || ''}`}>
      <div className={styles.header}>
        <h2>💰 Your Expert Token Balances</h2>
        <p>Purchase tokens to access AI consultations with experts</p>
      </div>

      {experts.length === 0 ? (
        <div className={styles.noExperts}>
          <h3>📭 No Experts Available</h3>
          <p>Expert tokens will appear here once they are deployed</p>
        </div>
      ) : (
        <div className={styles.tokenGrid}>
          {experts.map(expert => (
            <TokenBalance
              key={expert.symbol}
              expertSymbol={expert.symbol}
              tokenAddress={expert.tokenAddress}
              className={styles.tokenCard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
