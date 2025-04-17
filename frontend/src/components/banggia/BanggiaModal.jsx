import React, { useState, useEffect, useCallback } from 'react';
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
  Divider as MuiDivider
} from '@mui/material';
import { Form, Input, DatePicker, Select, InputNumber, message, Row, Col, ConfigProvider } from 'antd';
import { CloseOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import moment from 'moment';
import { vi } from 'date-fns/locale';
import viVN from 'antd/locale/vi_VN'; // Thêm locale tiếng Việt cho Ant Design

const { Option } = Select;

// Hiệu ứng transition khi mở dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Format tiền tệ
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const BanggiaModal = ({ open, id, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Tải danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        setProducts(response.data.items);
      } else {
        console.error('Dữ liệu sản phẩm không đúng định dạng:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      message.error('Không thể tải danh sách sản phẩm');
    }
  }, []);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    if (!open) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tải danh sách sản phẩm
        await fetchProducts();
        
        // Nếu đang chỉnh sửa, lấy dữ liệu bảng giá
        if (isEditing) {
          const response = await axiosInstance.get(`${API_ENDPOINTS.PRICE_LIST}/${id}`);
          const priceData = response.data;
          
          form.setFieldsValue({
            maspdv: priceData.maspdv,
            ngayhl: moment(priceData.ngayhl),
            giaban: priceData.giaban
          });
          
          // Lấy thông tin sản phẩm đã chọn
          const product = products.find(p => p.maspdv === priceData.maspdv);
          setSelectedProduct(product);
        } else {
          // Khởi tạo giá trị mặc định cho form
          form.setFieldsValue({
            ngayhl: moment(),
            giaban: ''
          });
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải dữ liệu bảng giá');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [form, isEditing, id, open, fetchProducts]);
  
  // Cập nhật selectedProduct khi products thay đổi
  useEffect(() => {
    if (isEditing && products.length > 0 && form) {
      const maspdv = form.getFieldValue('maspdv');
      if (maspdv) {
        const product = products.find(p => p.maspdv === maspdv);
        if (product) {
          setSelectedProduct(product);
        }
      }
    }
  }, [products, form, isEditing]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedProduct(null);
    }
  }, [open, form]);

  // Xử lý khi chọn sản phẩm
  const handleProductChange = (value) => {
    const product = products.find(p => p.maspdv === value);
    setSelectedProduct(product);
  };

  // Lưu bảng giá
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setSaving(true);
      
      try {
        const formData = {
          ...values,
          ngayhl: values.ngayhl.format('YYYY-MM-DD'),
          giaban: parseFloat(values.giaban)
        };
        
        let result;
        if (isEditing) {
          result = await axiosInstance.put(`${API_ENDPOINTS.PRICE_LIST}/${id}`, formData);
          message.success('Cập nhật bảng giá thành công');
        } else {
          result = await axiosInstance.post(API_ENDPOINTS.PRICE_LIST, formData);
          message.success('Thêm bảng giá mới thành công');
        }
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        onCancel();
      } catch (error) {
        console.error('Lỗi khi lưu bảng giá:', error);
        
        if (error.response && error.response.data && error.response.data.detail) {
          message.error(error.response.data.detail);
        } else {
          message.error('Lỗi khi lưu bảng giá. Vui lòng thử lại.');
        }
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
            {isEditing ? 'Cập nhật bảng giá' : 'Thêm giá mới'}
          </Typography>
          {!loading && !saving && (
            <IconButton edge="end" color="inherit" onClick={onCancel} aria-label="close">
              <CloseOutlined />
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
          <ConfigProvider locale={viVN} componentSize="large">
            <Box className="ant-form-wrapper" sx={{ 
              '& .ant-row': { width: '100%' },
              '& .ant-col': { width: '100%' },
              '& .ant-form-item': { width: '100%' },
              '& .ant-picker': { width: '100%' },
              '& .ant-input-number': { width: '100%' },
              '& .ant-select': { width: '100%' }
            }}>
              <Form
                form={form}
                layout="vertical"
                style={{ width: '100%' }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="maspdv"
                      label="Sản phẩm/Dịch vụ"
                      rules={[{ required: true, message: 'Vui lòng chọn sản phẩm/dịch vụ' }]}
                    >
                      <Select
                        placeholder="Chọn sản phẩm/dịch vụ"
                        onChange={handleProductChange}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={products.map(product => ({
                          value: product.maspdv,
                          label: `${product.maspdv} - ${product.tenspdv}`
                        }))}
                        disabled={isEditing} // Không cho sửa mã sản phẩm nếu đang chỉnh sửa
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {selectedProduct && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Thông tin sản phẩm
                    </Typography>
                    <MuiDivider sx={{ mb: 2 }} />
                    <Row gutter={[16, 8]}>
                      <Col span={24}>
                        <Typography variant="body1" fontWeight={500}>{selectedProduct.tenspdv}</Typography>
                      </Col>
                      <Col span={12}>
                        <Typography variant="body2" color="textSecondary">Đơn vị tính:</Typography>
                        <Typography variant="body1">{selectedProduct.dvt}</Typography>
                      </Col>
                      {selectedProduct.dongia !== undefined && (
                        <Col span={12}>
                          <Typography variant="body2" color="textSecondary">Giá hiện tại:</Typography>
                          <Typography variant="body1" color="primary" fontWeight={500}>
                            {formatCurrency(selectedProduct.dongia)}
                          </Typography>
                        </Col>
                      )}
                    </Row>
                  </Box>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ngayhl"
                      label="Ngày hiệu lực"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày hiệu lực' }]}
                    >
                      <DatePicker 
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="giaban"
                      label="Giá bán"
                      rules={[
                        { required: true, message: 'Vui lòng nhập giá bán' },
                        { type: 'number', min: 0, message: 'Giá bán phải là số dương', transform: val => Number(val) }
                      ]}
                    >
                      <InputNumber
                        placeholder="Nhập giá bán"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        addonAfter="VND"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Box>
          </ConfigProvider>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <MuiButton
          variant="outlined"
          onClick={onCancel}
          disabled={loading || saving}
          startIcon={<CloseOutlined />}
        >
          Hủy
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveOutlined />}
        >
          {isEditing ? 'Cập nhật' : 'Lưu'}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default BanggiaModal; 