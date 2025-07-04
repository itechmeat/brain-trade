import React from 'react';
import styles from './Checkbox.module.scss';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom styled checkbox component
 * @param id - Unique identifier for the checkbox
 * @param checked - Whether the checkbox is checked
 * @param onChange - Callback when checkbox state changes
 * @param label - Label text for the checkbox
 * @param disabled - Whether the checkbox is disabled
 * @param className - Additional CSS classes
 */
export function Checkbox({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`${styles.checkboxContainer} ${disabled ? styles.disabled : ''} ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.checkboxInput}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        <span className={styles.checkboxCustom}>
          {checked && (
            <svg
              className={styles.checkIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={styles.labelText}>{label}</span>
      </label>
    </div>
  );
}
