import React from 'react';
import Image from 'next/image';
import { InvestmentExpert } from '@/types';
import styles from './ExpertAvatar.module.scss';

interface ExpertAvatarProps {
  expert: InvestmentExpert;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showFund?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ExpertAvatar({
  expert,
  size = 'md',
  showName = false,
  showFund = false,
  className = '',
  onClick,
}: ExpertAvatarProps) {
  const avatarClasses = [styles.expertAvatar, styles[size], onClick && styles.clickable, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={avatarClasses} onClick={onClick}>
      <div className={styles.imageContainer}>
        {expert.photo ? (
          <Image
            src={expert.photo}
            alt={expert.name}
            className={styles.image}
            width={80}
            height={80}
          />
        ) : (
          <div className={styles.fallback}>
            {expert.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()}
          </div>
        )}
      </div>

      {(showName || showFund) && (
        <div className={styles.info}>
          {showName && <div className={styles.name}>{expert.name.replace(' (RAG)', '')}</div>}
          {showFund && <div className={styles.fund}>{expert.fund}</div>}
        </div>
      )}
    </div>
  );
}
