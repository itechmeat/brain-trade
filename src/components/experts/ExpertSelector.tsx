/**
 * Expert Selector Component
 *
 * Component for selecting an expert with token information display
 * and token purchase capability
 */

import { useEffect } from 'react';
import { useContracts } from '@/hooks/useContracts';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { ExpertInfo } from '@/types/contracts';
import { Card, Button, TokenBalance, ConsultationCost } from '@/components/ui';
import { SimpleExpertAvatar } from './SimpleExpertAvatar';
import styles from './ExpertSelector.module.scss';

interface ExpertSelectorProps {
  /** Currently selected expert */
  selectedExpert: ExpertInfo | null;
  /** Callback when expert is selected */
  onExpertSelect: (expert: ExpertInfo) => void;
  /** Whether to show token information */
  showTokenInfo?: boolean;
}

/**
 * Component for selecting an expert
 *
 * Displays list of experts with their tokens and user balances
 */
export function ExpertSelector({
  selectedExpert,
  onExpertSelect,
  showTokenInfo = true,
}: ExpertSelectorProps) {
  const { experts, loading, error, loadExperts, isReady } = useContracts();
  const { loadBalances, isLoaded, getBalance } = useTokenBalances();

  /**
   * Load experts on initialization
   */
  useEffect(() => {
    if (isReady && experts.length === 0 && !loading) {
      loadExperts();
    }
  }, [isReady, experts.length, loadExperts, loading]);

  /**
   * Load token balances when experts are available
   */
  useEffect(() => {
    if (experts.length > 0 && isReady) {
      console.log('🔄 Loading balances for', experts.length, 'experts');
      loadBalances(experts);
    }
  }, [experts, isReady, loadBalances]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading experts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.errorCard}>
        <h3>Error loading experts</h3>
        <p>{error}</p>
        <Button onClick={loadExperts} disabled={loading}>
          Try again
        </Button>
      </Card>
    );
  }

  // Show loading state if we're not ready yet or if we haven't loaded experts
  if (!isReady || (experts.length === 0 && !error)) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>{!isReady ? 'Connecting to blockchain...' : 'Loading experts...'}</span>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <Card className={styles.noExperts}>
        <h3>No experts found</h3>
        <p>No experts have been created yet</p>
        <Button onClick={loadExperts} disabled={loading}>
          Retry loading experts
        </Button>
      </Card>
    );
  }

  return (
    <div className={styles.expertSelector}>
      <h3>Select an expert for consultation</h3>

      <div className={styles.expertList}>
        {experts.map(expert => {
          const balance = getBalance(expert.symbol);
          const balanceLoaded = isLoaded(expert.symbol);
          const isSelected = selectedExpert?.symbol === expert.symbol;

          return (
            <div key={expert.symbol} className={styles.expertCardWrapper}>
              <button
                className={`${styles.expertCard} ${isSelected ? styles.selected : ''}`}
                onClick={() => {
                  console.log('🔥 Expert card clicked:', expert.name);
                  onExpertSelect(expert);
                }}
                type="button"
                aria-label={`Select ${expert.name} for consultation`}
              >
                <div className={styles.expertHeader}>
                  <SimpleExpertAvatar expert={expert} size="medium" />
                  <div className={styles.expertInfo}>
                    <h4>{expert.name}</h4>
                    <p className={styles.category}>{expert.category}</p>
                    <div className={styles.status}>
                      <span
                        className={`${styles.statusDot} ${expert.isActive ? styles.active : styles.inactive}`}
                      />
                      {expert.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {showTokenInfo && (
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenRow}>
                      <span>Consultation cost:</span>
                      <ConsultationCost
                        cost={expert.tokensPerQuery}
                        symbol={expert.symbol}
                        isWeiFormat={true}
                        size="small"
                      />
                    </div>

                    <div className={styles.tokenRow}>
                      <span>Your balance:</span>
                      <TokenBalance
                        balance={balance}
                        loading={!balanceLoaded}
                        symbol={expert.symbol}
                        size="small"
                        showAffordability={true}
                      />
                    </div>
                  </div>
                )}

                {isSelected && (
                  <div className={styles.selectedIndicator}>
                    <span>Selected</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
