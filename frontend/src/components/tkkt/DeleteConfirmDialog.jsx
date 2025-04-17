import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  padding: theme.spacing(2, 3),
}));

const StyledDialogContentText = styled(DialogContentText)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const DeleteConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  content, 
  loading, 
  error 
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlineIcon />
          <Typography variant="h6" component="span">
            {title || 'Xác nhận xóa'}
          </Typography>
        </Box>
      </StyledDialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <StyledDialogContentText>
          {content || 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.'}
        </StyledDialogContentText>
      </DialogContent>
      
      <StyledDialogActions>
        <Button 
          onClick={onClose} 
          color="inherit" 
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {loading ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog; 