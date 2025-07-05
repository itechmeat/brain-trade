/**
 * TipButton component for sending tips to experts
 * Shows calculated tip amount and allows user to send tip using Radix UI Dialog
 */

import React, { useState, useEffect } from 'react';
import { Button, Dialog } from '@/components/ui';
import { ExpertInfo, TokenBalance } from '@/types/contracts';
import { calculateTipAmount } from '@/lib/utils/tipCalculations';
import { useContracts } from '@/hooks/useContracts';
import styles from './TipButton.module.scss';

interface TipButtonProps {
  expert: ExpertInfo;
  tokenBalance: TokenBalance | null;
  onTipSent?: () => void;
  disabled?: boolean;
}

export function TipButton({ expert, tokenBalance, onTipSent, disabled }: TipButtonProps) {
  const { sendTip, loading } = useContracts();
  const [tipCalculation, setTipCalculation] = useState<ReturnType<typeof calculateTipAmount>>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (tokenBalance && tokenBalance.balance > 0) {
      const calculation = calculateTipAmount(tokenBalance.balance);
      setTipCalculation(calculation);
    } else {
      setTipCalculation(null);
    }
  }, [tokenBalance]);

  const handleTipClick = () => {
    if (!tipCalculation) return;
    setIsDialogOpen(true);
  };

  const handleConfirmTip = async () => {
    if (!tipCalculation || !tokenBalance) return;

    try {
      setIsSending(true);
      const result = await sendTip(tokenBalance.tokenAddress, tipCalculation.tipAmount);

      if (result.success) {
        setIsDialogOpen(false);
        onTipSent?.();
      } else {
        console.error('Failed to send tip:', result.error);
        alert(`Failed to send tip: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Error sending tip');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelTip = () => {
    setIsDialogOpen(false);
  };

  // Always show the button, but disable it if no balance or can't send tip
  const canSendTip = tipCalculation && tipCalculation.canSendTip;
  const showTipAmount = tipCalculation && tokenBalance;

  return (
    <div className={styles.tipButtonContainer}>
      <Button
        onClick={handleTipClick}
        disabled={disabled || loading || !canSendTip}
        variant="outline"
        className={styles.tipButton}
      >
        💰 Tips{' '}
        {showTipAmount ? `(${tipCalculation.tipAmountFormatted} ${tokenBalance?.symbol})` : ''}
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Confirm Tip"
        description={`Send a tip to ${expert.name} for their expert consultation`}
        size="md"
      >
        {tipCalculation && (
          <div className={styles.tipDetails}>
            <div className={styles.expertInfo}>
              <h4>{expert.name}</h4>
              <p className={styles.category}>{expert.category}</p>
            </div>

            <div className={styles.tipAmount}>
              <div className={styles.amountRow}>
                <span>Tip Amount:</span>
                <strong>
                  {tipCalculation.tipAmountFormatted} {tokenBalance?.symbol || 'tokens'}
                </strong>
              </div>
              <div className={styles.amountRow}>
                <span>Your Balance After:</span>
                <span>
                  {tipCalculation.targetBalance} {tokenBalance?.symbol || 'tokens'}
                </span>
              </div>
            </div>

            <div className={styles.dialogActions}>
              <Button
                onClick={handleConfirmTip}
                disabled={isSending}
                loading={isSending}
                className={styles.confirmButton}
              >
                {isSending ? 'Sending...' : 'Send Tip'}
              </Button>
              <Button
                onClick={handleCancelTip}
                variant="outline"
                disabled={isSending}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
