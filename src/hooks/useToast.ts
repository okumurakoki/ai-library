import { useState, useCallback } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = useCallback((message: string, severity: ToastSeverity = 'info') => {
    setToast({
      open: true,
      message,
      severity,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };
};
