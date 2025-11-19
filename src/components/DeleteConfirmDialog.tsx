import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #d32f2f',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid #e0e0e0',
          p: 2,
        }}
      >
        <WarningIcon sx={{ color: '#d32f2f', fontSize: '1.5rem' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          削除確認
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          以下のプロンプトを削除してもよろしいですか？
        </Typography>
        <Box
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', color: '#d32f2f', mt: 2 }}>
          ※この操作は取り消せません
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid #e0e0e0',
          p: 2,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 0,
            borderColor: '#000',
            color: '#000',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#000',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          sx={{
            borderRadius: 0,
            backgroundColor: '#d32f2f',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#c62828',
            },
          }}
        >
          削除する
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
