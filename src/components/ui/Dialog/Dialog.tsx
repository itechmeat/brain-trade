/**
 * Dialog Component using Radix UI
 *
 * Accessible modal dialog component following design system guidelines
 */

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Dialog.module.scss';

export interface DialogProps {
  /** Whether the dialog is open */
  open?: boolean;
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Dialog content */
  children: React.ReactNode;
  /** Whether to show close button */
  showCloseButton?: boolean;
}

/**
 * Dialog component with proper accessibility and styling
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  showCloseButton = true,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay />
        <DialogPrimitive.Content className={styles.content}>
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
              )}
              {showCloseButton && (
                <DialogPrimitive.Close className={styles.closeButton}>
                  ✕
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {description && (
            <DialogPrimitive.Description className={styles.description}>
              {description}
            </DialogPrimitive.Description>
          )}

          <div className={styles.body}>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// DialogProps is already exported inline above
