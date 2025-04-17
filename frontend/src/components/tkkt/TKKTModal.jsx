import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Box,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Form, Input, InputNumber, Select, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const TKKTModal = ({ open, id, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isAddMode] = useState(!id);
  
  // Tải dữ liệu tài khoản kế toán khi mở modal để chỉnh sửa
  useEffect(() => {
    if (open && id) {
      setLoading(true);
      setError(null);
      
      axiosInstance.get(`${API_ENDPOINTS.TKKT}/${id}`)
        .then(response => {
          if (response.data) {
            form.setFieldsValue({
              matk: response.data.matk,
              tentk: response.data.tentk,
              captk: response.data.captk
            });
          }
        })
        .catch(err => {
          console.error('Lỗi khi tải dữ liệu tài khoản kế toán:', err);
          setError('Không thể tải dữ liệu tài khoản kế toán. Vui lòng thử lại.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (open) {
      // Reset form khi mở modal để thêm mới
      form.resetFields();
      // Đặt giá trị mặc định
      form.setFieldsValue({
        captk: 1
      });
    }
  }, [open, id, form]);

  // Kiểm tra mã tài khoản đã tồn tại
  const checkAccountCodeExists = async (code) => {
    if (!code || !isAddMode) return false;
    
    try {
      console.log('Kiểm tra mã tài khoản:', `${API_ENDPOINTS.TKKT}/check/${code}`);
      const response = await axiosInstance.get(`${API_ENDPOINTS.TKKT}/check/${code}`);
      return response.data?.exists || false;
    } catch (error) {
      console.error('Lỗi khi kiểm tra mã tài khoản:', error);
      return false;
    }
  };

  // Validate mã tài khoản
  const validateAccountCode = async (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mã tài khoản'));
    }
    
    // Kiểm tra định dạng: chỉ cho phép số và dấu chấm
    if (!/^[0-9.]+$/.test(value)) {
      return Promise.reject(new Error('Mã tài khoản chỉ được chứa số và dấu chấm'));
    }
    
    // Kiểm tra mã tài khoản đã tồn tại chưa (chỉ với chế độ thêm mới)
    if (isAddMode) {
      const exists = await checkAccountCodeExists(value);
      if (exists) {
        return Promise.reject(new Error('Mã tài khoản đã tồn tại'));
      }
    }
    
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('Lưu tài khoản:', values);
      if (isAddMode) {
        // Thêm mới tài khoản kế toán
        await axiosInstance.post(API_ENDPOINTS.TKKT, values);
      } else {
        // Cập nhật tài khoản kế toán
        await axiosInstance.put(`${API_ENDPOINTS.TKKT}/${id}`, values);
      }
      
      // Đóng modal và thông báo thành công
      onSuccess();
      onCancel();
    } catch (err) {
      console.error('Lỗi khi lưu tài khoản kế toán:', err);
      
      let errorMsg = 'Không thể lưu tài khoản kế toán. Vui lòng thử lại sau.';
      
      if (err.response && err.response.data && err.response.data.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response) {
        errorMsg = `Lỗi từ máy chủ: ${err.response.status}`;
      }
      
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <StyledDialogTitle>
        {id ? 'Chỉnh sửa tài khoản kế toán' : 'Thêm tài khoản kế toán mới'}
        <IconButton edge="end" color="inherit" onClick={onCancel} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <StyledDialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ConfigProvider locale={viVN} componentSize="large">
            <Box sx={{ 
              '& .ant-form-item': { mb: 2 },
              '& .ant-form-item-label': { pb: 0.5 },
              '& .ant-select': { width: '100%' },
              '& .ant-select-selector': { height: '40px !important', display: 'flex', alignItems: 'center' },
              '& .ant-input': { height: '40px' },
              '& .ant-input-number': { width: '100%' },
              '& .ant-input-number-input': { height: '38px' }
            }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                requiredMark={false}
                style={{ width: '100%' }}
              >
                <Form.Item
                  name="matk"
                  label="Mã tài khoản"
                  rules={[
                    { validator: validateAccountCode }
                  ]}
                >
                  <Input 
                    placeholder="Nhập mã tài khoản" 
                    disabled={!isAddMode}
                  />
                </Form.Item>
                
                <Form.Item
                  name="tentk"
                  label="Tên tài khoản"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên tài khoản' },
                    { max: 100, message: 'Tên tài khoản không được vượt quá 100 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập tên tài khoản" />
                </Form.Item>
                
                <Form.Item
                  name="captk"
                  label="Cấp tài khoản"
                  rules={[
                    { required: true, message: 'Vui lòng chọn cấp tài khoản' }
                  ]}
                >
                  <Select placeholder="Chọn cấp tài khoản" options={[
                    { value: 1, label: 'Cấp 1' },
                    { value: 2, label: 'Cấp 2' },
                    { value: 3, label: 'Cấp 3' },
                    { value: 4, label: 'Cấp 4' },
                    { value: 5, label: 'Cấp 5' }
                  ]} />
                </Form.Item>
              </Form>
            </Box>
          </ConfigProvider>
        )}
      </StyledDialogContent>
      
      <StyledDialogActions>
        <Button 
          onClick={onCancel} 
          color="inherit"
          disabled={saving}
        >
          Hủy
        </Button>
        <Button
          onClick={() => form.submit()}
          variant="contained"
          color="primary"
          disabled={loading || saving}
          startIcon={saving && <CircularProgress size={18} color="inherit" />}
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default TKKTModal;