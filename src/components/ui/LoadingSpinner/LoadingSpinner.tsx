/**
 * Loading Spinner Component
 *
 * Reusable loading spinner with different sizes and styles
 */

import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Loading text to display */
  text?: string;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingSpinner({
  size = 'medium',
  text,
  centered = false,
  className = '',
}: LoadingSpinnerProps) {
  const containerClasses = [styles.container, centered && styles.centered, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
}
