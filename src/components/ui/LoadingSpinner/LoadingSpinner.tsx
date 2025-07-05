/**
 * Loading Spinner Component
 *
 * Reusable loading spinner with different sizes and styles
 */

import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  /** Main title text */
  title?: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingSpinner({
  title = 'Loading',
  subtitle = 'Please wait...',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`${styles.loadingSpinner} ${className}`}>
      <div className={styles.content}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
        </div>

        <div className={styles.textContent}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
