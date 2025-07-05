import { formatUnits, parseUnits } from 'ethers';

export interface TipCalculation {
  tipAmount: bigint;
  tipAmountFormatted: string;
  targetBalance: string;
  currentBalanceFormatted: string;
  canSendTip: boolean;
}

/**
 * Calculates tip amount to round down user balance to nearest multiple of 5
 * Minimum tip amount is 5 tokens
 * @param currentBalance - Current token balance in wei
 * @param tokenDecimals - Token decimal places (default 18)
 * @returns Tip calculation result or null if invalid
 */
export function calculateTipAmount(
  currentBalance: bigint,
  tokenDecimals: number = 18,
): TipCalculation | null {
  if (currentBalance <= 0) {
    return null;
  }

  // Convert balance to readable number
  const balanceNumber = Number(formatUnits(currentBalance, tokenDecimals));

  // If balance is too small (less than 5), no tip possible
  if (balanceNumber < 5) {
    return null;
  }

  // Calculate target balance (round down to nearest multiple of 5)
  let targetBalance = Math.floor(balanceNumber / 5) * 5;

  // Calculate tip amount
  let tipAmountNumber = balanceNumber - targetBalance;

  // If tip amount is less than 5 tokens, round down to lower multiple of 5
  if (tipAmountNumber < 5) {
    targetBalance = targetBalance - 5;
    tipAmountNumber = balanceNumber - targetBalance;
  }

  // Validate tip amount (minimum 5 tokens, ensure we have enough balance)
  if (tipAmountNumber < 5) {
    return null;
  }

  // Round to 2 decimal places
  const roundedTipAmount = Math.round(tipAmountNumber * 100) / 100;

  try {
    const tipAmount = parseUnits(roundedTipAmount.toFixed(tokenDecimals), tokenDecimals);

    return {
      tipAmount,
      tipAmountFormatted: roundedTipAmount.toFixed(2),
      targetBalance: targetBalance.toFixed(2),
      currentBalanceFormatted: balanceNumber.toFixed(2),
      canSendTip: roundedTipAmount >= 5 && balanceNumber >= roundedTipAmount,
    };
  } catch (error) {
    console.error('Error calculating tip amount:', error);
    return null;
  }
}

/**
 * Formats tip amount for display
 * @param tipAmount - Tip amount in wei
 * @param tokenDecimals - Token decimal places
 * @returns Formatted tip amount string
 */
export function formatTipAmount(tipAmount: bigint, tokenDecimals: number = 18): string {
  const formatted = formatUnits(tipAmount, tokenDecimals);
  const number = Number(formatted);
  return number.toFixed(2);
}

/**
 * Validates if user can send tip
 * @param currentBalance - Current token balance in wei
 * @param tipAmount - Tip amount in wei
 * @returns Whether user can send tip
 */
export function canSendTip(currentBalance: bigint, tipAmount: bigint): boolean {
  return currentBalance >= tipAmount && tipAmount > 0;
}
