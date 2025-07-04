import React from 'react';
import styles from './Textarea.module.scss';

export interface TextareaProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  label?: string;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  id,
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  disabled = false,
  required = false,
  className = '',
  error,
  label,
  rows = 4,
  resize = 'vertical'
}, ref) {
  return (
    <div className={`${styles.textareaWrapper} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`${styles.textarea} ${styles[resize]} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});