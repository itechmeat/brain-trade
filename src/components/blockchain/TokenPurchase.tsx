/**
 * Token Purchase Component
 *
 * Component for purchasing expert tokens
 */

import { useState, useCallback } from 'react';
import { useContracts } from '@/hooks/useContracts';
import { ExpertInfo } from '@/types/contracts';
import { Button, ConsultationCost } from '@/components/ui';
import { TOKEN_SETTINGS, formatTokenAmount } from '@/lib/blockchain/config';
import styles from './TokenPurchase.module.scss';

interface TokenPurchaseProps {
  /** Expert for token purchase */
  expert: ExpertInfo;
  /** Callback after successful purchase */
  onPurchaseSuccess?: () => void;
  /** Callback on error */
  onPurchaseError?: (error: string) => void;
}

/**
 * Token purchase component
 */
export function TokenPurchase({ expert, onPurchaseSuccess, onPurchaseError }: TokenPurchaseProps) {
  const { purchaseTokens, loading } = useContracts();

  const [selectedAmount, setSelectedAmount] = useState<bigint | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Token purchase
   */
  const handlePurchase = useCallback(
    async (amount: bigint) => {
      if (!amount || purchasing) return;

      setPurchasing(true);
      setError(null);

      try {
        // Simplified purchase for hackathon (without real ETH price)
        const result = await purchaseTokens(
          expert.tokenAddress,
          amount,
          BigInt(0), // In real implementation, ETH cost calculation would be here
        );

        if (result.success) {
          console.log('🎉 TokenPurchase: Purchase successful, calling onPurchaseSuccess');
          onPurchaseSuccess?.();
        } else {
          console.error('❌ TokenPurchase: Purchase failed:', result.error);
          setError(result.error || 'Purchase failed');
          onPurchaseError?.(result.error || 'Purchase failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
        setError(errorMessage);
        onPurchaseError?.(errorMessage);
      } finally {
        setPurchasing(false);
      }
    },
    [expert.tokenAddress, purchasing, purchaseTokens, onPurchaseSuccess, onPurchaseError],
  );


  return (
    <div className={styles.tokenPurchase}>
      <div className={styles.costInfo}>
        Consultation cost:{' '}
        <ConsultationCost
          cost={expert.tokensPerQuery}
          symbol={expert.symbol}
          isWeiFormat={true}
          size="medium"
        />
      </div>

      <div className={styles.suggestions}>
        <div className={styles.suggestionButtons}>
          {TOKEN_SETTINGS.purchaseSuggestions.map(suggestion => (
            <Button
              key={suggestion.label}
              variant={selectedAmount === suggestion.amount ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedAmount(suggestion.amount)}
              disabled={purchasing || loading}
            >
              {suggestion.label}
            </Button>
          ))}
        </div>

        {selectedAmount && (
          <div className={styles.selectedInfo}>
            <div className={styles.textInfo}>
              <p>
                Selected: {formatTokenAmount(selectedAmount)} {expert.symbol}
              </p>
              <p>
                Consultations:{' '}
                {Math.floor(Number(formatTokenAmount(selectedAmount)) / expert.tokensPerQuery)}
              </p>
            </div>
            <div className={styles.buyButton}>
              <Button
                onClick={() => handlePurchase(selectedAmount)}
                disabled={purchasing || loading}
                loading={purchasing}
              >
                Buy {formatTokenAmount(selectedAmount)} tokens
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorMessage}>
            <h4>❌ Purchase Failed</h4>
            <p>{error}</p>

            {error.includes('Insufficient ETH') && (
              <div className={styles.helpSection}>
                <h5>💡 How to fix this:</h5>
                <ol>
                  <li>You need ETH on Zircuit Testnet to pay for gas fees</li>
                  <li>
                    Get testnet ETH from the{' '}
                    <a href="https://faucet.zircuit.com/" target="_blank" rel="noopener noreferrer">
                      Zircuit Faucet
                    </a>
                  </li>
                  <li>Or contact support to fund your wallet</li>
                </ol>
                <p>
                  <strong>Your wallet address:</strong>{' '}
                  <code>{error.match(/0x[a-fA-F0-9]{40}/)?.[0] || 'Check browser console'}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
