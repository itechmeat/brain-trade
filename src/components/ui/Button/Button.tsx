import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button'
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className} ${isDisabled ? styles.disabled : ''} ${loading ? styles.loading : ''}`}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <span className={styles.loadingContent}>
          <span className={styles.spinner} />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}