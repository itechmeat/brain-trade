import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string; open: boolean }>>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { ...options, id, open: true };

    setToasts(prev => [...prev, toast]);

    // Auto-close after duration
    const duration = options.duration || 3000;
    setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, open: false } : t)));

      // Remove from array after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 150);
    }, duration);

    return id;
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, open: false } : t)));

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 150);
  }, []);

  return {
    toasts,
    showToast,
    closeToast,
  };
}
