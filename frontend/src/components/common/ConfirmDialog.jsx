import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

/**
 * Component hiển thị hộp thoại xác nhận
 * @param {Object} props - Props của component
 * @param {boolean} props.open - Trạng thái mở/đóng dialog
 * @param {string} props.title - Tiêu đề dialog
 * @param {string} props.content - Nội dung dialog
 * @param {Function} props.onConfirm - Hàm gọi khi xác nhận
 * @param {Function} props.onClose - Hàm gọi khi đóng dialog
 */
const ConfirmDialog = ({ open, title, content, onConfirm, onClose }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Hủy
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 