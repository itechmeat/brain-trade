'use client';

import React, { createContext, useContext } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { Toast } from '@/components/ui/Toast/Toast';
import { useToast } from '@/hooks/useToast';

interface ToastContextType {
  showToast: (options: { title?: string; description: string; duration?: number }) => string;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, showToast, closeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            description={toast.description}
            open={toast.open}
            onOpenChange={open => {
              if (!open) {
                closeToast(toast.id);
              }
            }}
          />
        ))}

        <ToastPrimitive.Viewport className="toastViewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
