import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';

const CustomerFormDialog = ({ open, onClose, customerId, onSuccess }) => {
  const isEdit = Boolean(customerId);

  const [formData, setFormData] = useState({
    makh: '',
    tenkh: '',
    masothue: '',
    diachi: '',
    sdt: '',
    email: '',
    phanloai: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit && open && customerId) {
      fetchCustomer();
    } else if (open) {
      // Reset form khi mở dialog trong chế độ thêm mới
      setFormData({
        makh: '',
        tenkh: '',
        masothue: '',
        diachi: '',
        sdt: '',
        email: '',
        phanloai: ''
      });
      setError('');
      setSuccess('');
    }
  }, [isEdit, customerId, open]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching customer with ID:', customerId);
      const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER_DETAIL(customerId));
      console.log('Customer detail response:', response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError(`Không thể tải thông tin khách hàng: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Log dữ liệu trước khi gửi đi
    console.log('Submitting customer data:', formData);

    try {
      let response;
      if (isEdit) {
        response = await axiosInstance.put(
          API_ENDPOINTS.CUSTOMER_DETAIL(customerId), 
          formData
        );
        console.log('Update customer response:', response.data);
        setSuccess('Cập nhật khách hàng thành công');
      } else {
        response = await axiosInstance.post(
          API_ENDPOINTS.CUSTOMERS, 
          formData
        );
        console.log('Create customer response:', response.data);
        setSuccess('Thêm khách hàng thành công');
      }
      
      // Gọi hàm callback với dữ liệu khách hàng mới
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Đóng form sau 1.5 giây
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving customer:', error);
      // Hiển thị thông tin lỗi chi tiết hơn
      setError(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lưu thông tin'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEdit ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
          </Typography>
          {!loading && (
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form id="customer-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã khách hàng"
                name="makh"
                value={formData.makh}
                onChange={handleChange}
                required
                disabled={loading || isEdit}
                margin="normal"
                size="small"
                helperText={isEdit ? "Mã khách hàng không thể thay đổi" : "Nhập mã khách hàng"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên khách hàng"
                name="tenkh"
                value={formData.tenkh}
                onChange={handleChange}
                required
                disabled={loading}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã số thuế"
                name="masothue"
                value={formData.masothue}
                onChange={handleChange}
                disabled={loading}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="diachi"
                value={formData.diachi}
                onChange={handleChange}
                required
                disabled={loading}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                required
                disabled={loading}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phân loại"
                name="phanloai"
                value={formData.phanloai}
                onChange={handleChange}
                disabled={loading}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          form="customer-form"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerFormDialog;
