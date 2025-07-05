import React from 'react';
import { CookieIcon } from '@radix-ui/react-icons';
import { TokenBalance as TokenBalanceType } from '@/types/contracts';
import { formatTokenAmount } from '@/lib/blockchain/config';
import styles from './TokenBalance.module.scss';

interface TokenBalanceProps {
  /** Token balance data */
  balance?: TokenBalanceType | null;
  /** Whether balance is loading */
  loading?: boolean;
  /** Token symbol for display */
  symbol?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the balance as sufficient/insufficient */
  showAffordability?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show coin icon */
  showIcon?: boolean;
  /** Icon size */
  iconSize?: number;
}

export function TokenBalance({
  balance,
  loading = false,
  symbol,
  size = 'medium',
  showAffordability = false,
  loadingText = 'Loading...',
  className = '',
  showIcon = false,
  iconSize = 20,
}: TokenBalanceProps) {
  const displaySymbol = symbol || balance?.symbol || 'TOKEN';

  if (loading) {
    return (
      <div className={`${styles.tokenBalance} ${styles[size]} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>{loadingText}</span>
        </div>
      </div>
    );
  }

  const balanceAmount = balance ? formatTokenAmount(balance.balance) : '0';
  const canAfford = balance?.canAffordConsultation;

  return (
    <div
      className={`${styles.tokenBalance} ${styles[size]} ${className} ${showIcon ? styles.withIcon : ''}`}
    >
      <span
        className={`${styles.amount} ${
          showAffordability && canAfford !== undefined
            ? canAfford
              ? styles.sufficient
              : styles.insufficient
            : ''
        }`}
      >
        {balanceAmount} {displaySymbol}
      </span>
      {showIcon && <CookieIcon width={iconSize} height={iconSize} className={styles.coinIcon} />}
    </div>
  );
}
