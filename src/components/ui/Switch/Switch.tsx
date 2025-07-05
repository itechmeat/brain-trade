import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import styles from './Switch.module.scss';

interface SwitchProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ id, checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={`${styles.switchRoot} ${className || ''}`}
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    >
      <SwitchPrimitive.Thumb className={styles.switchThumb} />
    </SwitchPrimitive.Root>
  );
}
