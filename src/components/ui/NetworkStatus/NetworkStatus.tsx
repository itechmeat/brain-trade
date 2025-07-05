/**
 * Network Status Component
 *
 * Shows current network status and provides network switching functionality
 */

import React from 'react';
import { Button } from '../Button/Button';
import styles from './NetworkStatus.module.scss';

interface NetworkStatusProps {
  /** Whether connected to correct network */
  isCorrectNetwork: boolean;
  /** Current network name */
  currentNetwork?: string;
  /** Target network name */
  targetNetwork: string;
  /** Function to switch networks */
  onSwitchNetwork?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

export function NetworkStatus({
  isCorrectNetwork,
  currentNetwork,
  targetNetwork,
  onSwitchNetwork,
  loading = false,
  size = 'medium',
}: NetworkStatusProps) {
  if (isCorrectNetwork) {
    return (
      <div className={`${styles.status} ${styles.correct} ${styles[size]}`}>
        <div className={styles.indicator} />
        <span>Connected to {targetNetwork}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.status} ${styles.incorrect} ${styles[size]}`}>
      <div className={styles.indicator} />
      <div className={styles.content}>
        <span>{currentNetwork ? `Connected to ${currentNetwork}` : 'Wrong network'}</span>
        {onSwitchNetwork && (
          <Button onClick={onSwitchNetwork} disabled={loading} size="sm" variant="primary">
            {loading ? 'Switching...' : `Switch to ${targetNetwork}`}
          </Button>
        )}
      </div>
    </div>
  );
}
