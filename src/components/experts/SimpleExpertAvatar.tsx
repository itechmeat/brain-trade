/**
 * Simple Expert Avatar Component
 *
 * Simplified expert avatar for tokenized chat
 */

import React from 'react';
import Image from 'next/image';
import { ExpertInfo } from '@/types/contracts';
import { getExpertMetadata } from '@/lib/expert-metadata';
import styles from './SimpleExpertAvatar.module.scss';

interface SimpleExpertAvatarProps {
  expert: ExpertInfo;
  size?: 'small' | 'medium' | 'large';
}

export function SimpleExpertAvatar({ expert, size = 'medium' }: SimpleExpertAvatarProps) {
  // Get expert metadata for photo
  const metadata = getExpertMetadata(expert.symbol);

  // Generate initials from name
  const initials = expert.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate color based on token symbol
  const getColorFromSymbol = (symbol: string) => {
    const colors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#f5576c',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#38f9d7',
      '#ffecd2',
      '#fcb69f',
      '#a8edea',
      '#fed6e3',
    ];

    const hash = symbol.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const backgroundColor = getColorFromSymbol(expert.symbol);

  return (
    <div className={`${styles.avatar} ${styles[size]}`} style={{ backgroundColor }}>
      {metadata?.photo ? (
        <Image
          src={metadata.photo}
          alt={expert.name}
          fill
          className={styles.photo}
          onError={e => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.removeAttribute('style');
          }}
        />
      ) : null}
      <span className={`${styles.initials} ${metadata?.photo ? styles.hidden : ''}`}>
        {initials}
      </span>
    </div>
  );
}
