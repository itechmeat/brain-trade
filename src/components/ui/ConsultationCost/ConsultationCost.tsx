/**
 * Consultation Cost Component
 *
 * Reusable component for displaying consultation costs with proper formatting
 */

import React from 'react';
import { formatTokenAmount } from '@/lib/blockchain/config';
import styles from './ConsultationCost.module.scss';

interface ConsultationCostProps {
  /** Cost in wei (from contract) or token units (from JSON) */
  cost: number | bigint;
  /** Token symbol */
  symbol: string;
  /** Whether the cost is already in wei format */
  isWeiFormat?: boolean;
  /** Display size */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
}

export function ConsultationCost({
  cost,
  symbol,
  isWeiFormat = true,
  size = 'medium',
  className = '',
}: ConsultationCostProps) {
  // Format the cost based on whether it's wei or token units
  const formattedCost = React.useMemo(() => {
    if (isWeiFormat) {
      // Cost is already in wei format from contract
      return formatTokenAmount(BigInt(cost));
    } else {
      // Cost is in token units (like 15, 20, 10)
      return cost.toString();
    }
  }, [cost, isWeiFormat]);

  return (
    <span className={`${styles.cost} ${styles[size]} ${className}`}>
      {formattedCost} {symbol}
    </span>
  );
}
