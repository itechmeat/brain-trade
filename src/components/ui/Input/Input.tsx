import React from 'react';
import styles from './Input.module.scss';

export interface InputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Input({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  error,
  label,
  size = 'md'
}: InputProps) {
  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`${styles.input} ${styles[size]} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}