import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { ToastState } from '../hooks/useToast';

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={toast.severity} sx={{ width: '100%', borderRadius: 0 }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
