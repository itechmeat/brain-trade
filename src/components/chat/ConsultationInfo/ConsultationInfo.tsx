import React from 'react';
import { Card, TokenBalance, ConsultationCost } from '@/components/ui';
import { ExpertInfo, TokenBalance as TokenBalanceType } from '@/types/contracts';
import { getBalanceStatus } from '@/utils/token';
import styles from './ConsultationInfo.module.scss';

interface ConsultationInfoProps {
  /** Expert information */
  expert: ExpertInfo;
  /** Token balance */
  balance: TokenBalanceType | null;
  /** Whether balance is loading */
  balanceLoading?: boolean;
  /** Additional actions */
  actions?: React.ReactNode;
  /** Show detailed information */
  showDetails?: boolean;
}

export function ConsultationInfo({
  expert,
  balance,
  balanceLoading = false,
  actions,
  showDetails = true,
}: ConsultationInfoProps) {
  const { canAfford, consultationsAvailable, status } = getBalanceStatus(
    balance,
    expert.tokensPerQuery,
  );

  return (
    <Card className={styles.consultationInfo}>
      <div className={styles.header}>
        <h4>Consultation Information</h4>
        {status && (
          <span className={`${styles.status} ${styles[status]}`}>
            {status === 'sufficient'
              ? 'Ready'
              : status === 'insufficient'
                ? 'Insufficient'
                : 'No balance'}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.row}>
          <span>Your balance:</span>
          <TokenBalance
            balance={balance}
            loading={balanceLoading}
            symbol={expert.symbol}
            size="small"
            showAffordability={true}
          />
        </div>

        <div className={styles.row}>
          <span>Consultation cost:</span>
          <ConsultationCost
            cost={expert.tokensPerQuery}
            symbol={expert.symbol}
            isWeiFormat={true}
            size="small"
          />
        </div>

        {showDetails && (
          <div className={styles.row}>
            <span>Consultations available:</span>
            <span
              className={`${styles.available} ${canAfford ? styles.sufficient : styles.insufficient}`}
            >
              {consultationsAvailable}
            </span>
          </div>
        )}

        {!canAfford && balance && (
          <div className={styles.warning}>
            <span>⚠️ Insufficient tokens for consultation</span>
          </div>
        )}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </Card>
  );
}
