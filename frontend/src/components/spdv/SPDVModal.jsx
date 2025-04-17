import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  Typography, 
  Button as MuiButton,
  Box,
  CircularProgress,
  IconButton,
  Slide,
  Paper,
  Chip
} from '@mui/material';
import { 
  Form, 
  Input, 
  InputNumber, 
  Button,
  Space,
  Spin,
  Typography as AntTypography,
  Divider,
  Row,
  Col 
} from 'antd';
import { 
  SaveOutlined,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';

// Hiệu ứng transition khi mở dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const { TextArea } = Input;
const { Title } = AntTypography;

const SPDVModal = ({ open, maspdv, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const isEditing = !!maspdv;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMaSPDV, setLoadingMaSPDV] = useState(false);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    if (!open) return;
    
    if (isEditing) {
      fetchSPDV();
    } else {
      fetchNextMaSPDV();
    }
  }, [open, maspdv, isEditing]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // Lấy mã sản phẩm dịch vụ tiếp theo
  const fetchNextMaSPDV = async () => {
    setLoadingMaSPDV(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/next-id`);
      if (response.data && response.data.maspdv) {
        form.setFieldsValue({ maspdv: response.data.maspdv });
      }
    } catch (error) {
      console.error('Lỗi khi lấy mã sản phẩm mới:', error);
    } finally {
      setLoadingMaSPDV(false);
    }
  };

  // Tải thông tin sản phẩm hiện có
  const fetchSPDV = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/${maspdv}`);
      
      // Cập nhật form từ dữ liệu API
      form.setFieldsValue({
        maspdv: response.data.maspdv || '',
        tenspdv: response.data.tenspdv || '',
        dongia: response.data.dongia || 0,
        dvt: response.data.dvt || '',
        mota: response.data.mota || ''
      });
    } catch (error) {
      console.error('Lỗi khi tải thông tin sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setSaving(true);
      try {
        // Định dạng dữ liệu để gửi
        const formData = {
          ...values,
          dongia: parseFloat(values.dongia)
        };
        
        let response;
        if (isEditing) {
          // Gửi request cập nhật
          response = await axiosInstance.put(`${API_ENDPOINTS.PRODUCTS}/${maspdv}`, formData);
        } else {
          // Gửi request tạo mới
          response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS, formData);
        }
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        onCancel();
      } catch (error) {
        console.error('Lỗi khi lưu sản phẩm:', error);
      } finally {
        setSaving(false);
      }
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading || saving ? undefined : onCancel}
      fullWidth
      maxWidth="md"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" fontWeight="bold">
            {isEditing ? 'Sửa sản phẩm/dịch vụ' : 'Thêm sản phẩm/dịch vụ mới'}
          </Typography>
          {!loading && !saving && (
            <IconButton edge="end" color="inherit" onClick={onCancel} aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ 
              maspdv: '',
              tenspdv: '',
              dongia: 0,
              dvt: '',
              mota: ''
            }}
          >
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              {isEditing ? (
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500 }}>Mã sản phẩm:</span>
                  <Chip 
                    label={form.getFieldValue('maspdv')} 
                    color="primary" 
                    size="small"
                  />
                  <Form.Item name="maspdv" hidden>
                    <Input />
                  </Form.Item>
                </div>
              ) : (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="maspdv"
                      label="Mã sản phẩm/dịch vụ"
                      rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
                      extra="Mã được tạo tự động"
                    >
                      <Input 
                        readOnly
                        suffix={
                          loadingMaSPDV ? (
                            <Spin size="small" />
                          ) : (
                            <Button 
                              type="text" 
                              icon={<ReloadOutlined />} 
                              onClick={fetchNextMaSPDV}
                              size="small"
                            />
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="tenspdv"
                    label="Tên sản phẩm/dịch vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                  >
                    <Input placeholder="Nhập tên sản phẩm hoặc dịch vụ" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dvt"
                    label="Đơn vị tính"
                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]}
                  >
                    <Input placeholder="VD: Cái, Kg, Thùng, ..." />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dongia"
                    label="Đơn giá"
                    rules={[
                      { required: true, message: 'Vui lòng nhập đơn giá' },
                      { type: 'number', min: 0, message: 'Đơn giá phải là số dương' }
                    ]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="VND"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="mota"
                    label="Mô tả"
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Nhập mô tả cho sản phẩm/dịch vụ (không bắt buộc)"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <MuiButton
          variant="outlined"
          onClick={onCancel}
          disabled={loading || saving}
          startIcon={<CloseIcon />}
        >
          Hủy
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isEditing ? 'Cập nhật' : 'Tạo mới'}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default SPDVModal; 