import React from 'react';
import styles from './TransactionLink.module.scss';

interface TransactionLinkProps {
  /** Transaction hash */
  hash: string;
  /** Display text (optional) */
  text?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon */
  showIcon?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Transaction link component
 *
 * Displays a link to view a blockchain transaction on the block explorer
 */
export function TransactionLink({
  hash,
  text,
  size = 'sm',
  showIcon = true,
  className = '',
}: TransactionLinkProps) {
  if (!hash) return null;

  // Use environment variable with fallback to hardcoded URL
  const baseExplorerUrl =
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://explorer.garfield-testnet.zircuit.com';
  const explorerUrl = `${baseExplorerUrl}/tx/${hash}`;
  const displayText = text || `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.transactionLink} ${styles[size]} ${className}`}
      title={`View transaction ${hash} on Zircuit Testnet Explorer`}
    >
      {showIcon && <span className={styles.icon}>🔗</span>}
      <span className={styles.text}>{displayText}</span>
    </a>
  );
}

export type { TransactionLinkProps };
