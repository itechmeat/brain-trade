/**
 * Token utility functions
 */

import { TokenBalance } from '@/types/contracts';
import { formatTokenAmount } from '@/lib/blockchain/config';

/**
 * Check if user can afford a consultation
 */
export function canAffordConsultation(balance: TokenBalance | null, cost: number): boolean {
  if (!balance) return false;
  return balance.canAffordConsultation || balance.balance >= BigInt(cost);
}

/**
 * Format token balance for display
 */
export function formatBalance(balance: TokenBalance | null, symbol?: string): string {
  if (!balance) return '0';
  const formatted = formatTokenAmount(balance.balance);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Calculate number of consultations available
 */
export function calculateConsultationsAvailable(
  balance: TokenBalance | null,
  costPerConsultation: number,
): number {
  if (!balance) return 0;
  return Math.floor(Number(formatTokenAmount(balance.balance)) / costPerConsultation);
}

/**
 * Check if balance is sufficient for a specific number of consultations
 */
export function canAffordMultipleConsultations(
  balance: TokenBalance | null,
  costPerConsultation: number,
  count: number,
): boolean {
  if (!balance) return false;
  const totalCost = costPerConsultation * count;
  return Number(formatTokenAmount(balance.balance)) >= totalCost;
}

/**
 * Get balance status for UI display
 */
export function getBalanceStatus(
  balance: TokenBalance | null,
  costPerConsultation: number,
): {
  canAfford: boolean;
  consultationsAvailable: number;
  status: 'sufficient' | 'insufficient' | 'empty';
} {
  if (!balance) {
    return {
      canAfford: false,
      consultationsAvailable: 0,
      status: 'empty',
    };
  }

  const consultationsAvailable = calculateConsultationsAvailable(balance, costPerConsultation);
  const canAfford = consultationsAvailable > 0;

  return {
    canAfford,
    consultationsAvailable,
    status: canAfford ? 'sufficient' : 'insufficient',
  };
}
