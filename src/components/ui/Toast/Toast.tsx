import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

interface ToastProps {
  id: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Toast({ description, open, onOpenChange }: ToastProps) {
  return (
    <ToastPrimitive.Root className="toastRoot" open={open} onOpenChange={onOpenChange}>
      <ToastPrimitive.Description className="toastDescription">
        {description}
      </ToastPrimitive.Description>
    </ToastPrimitive.Root>
  );
}
