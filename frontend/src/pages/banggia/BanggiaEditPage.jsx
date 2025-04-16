import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  FormHelperText,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Chip,
  Skeleton,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { vi } from 'date-fns/locale';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { format, parse } from 'date-fns';
import * as locales from 'date-fns/locale';
const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'visible',
}));

const FormHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 40,
    height: 3,
    bottom: -8,
    left: 0,
    backgroundColor: theme.palette.primary.main,
  },
}));

const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const ProductInfo = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const BanggiaEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL
  const [formState, setFormState] = useState({
    maspdv: '',
    ngayhl: new Date(),
    giaban: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  const [product, setProduct] = useState(null);

  // Tải thông tin sản phẩm
  const fetchProductData = async (productId) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin sản phẩm:', error);
      // Không chuyển hướng, chỉ hiển thị cảnh báo
      setAlert({
        show: true,
        message: 'Không thể tải thông tin sản phẩm.',
        severity: 'warning'
      });
    }
  };

  // Tải thông tin bảng giá theo id
  const fetchPriceData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRICE_LIST}/${id}`);
      const priceData = response.data;
      
      // Cập nhật state với dữ liệu từ API
      setFormState({
        maspdv: priceData.maspdv,
        ngayhl: parse(priceData.ngayhl, "yyyy-MM-dd", new Date()),
        giaban: priceData.giaban.toString()
      });
      
      setOriginalData(priceData);
      
      // Tải thông tin sản phẩm
      fetchProductData(priceData.maspdv);
    } catch (error) {
      console.error('Lỗi khi tải thông tin bảng giá:', error);
      setAlert({
        show: true,
        message: 'Không thể tải thông tin bảng giá. Vui lòng thử lại sau.',
        severity: 'error'
      });
      // Quay lại trang danh sách nếu không tìm thấy dữ liệu
      navigate('/banggia');
    } finally {
      setInitialLoading(false);
    }
  }, [id, navigate, fetchProductData]);

  useEffect(() => {
    // Tải thông tin bảng giá khi component mount
    if (id) {
      fetchPriceData();
    }
  }, [id, fetchPriceData]);

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formState.ngayhl) {
      newErrors.ngayhl = 'Vui lòng chọn ngày hiệu lực';
    }
    
    const price = parseFloat(formState.giaban);
    if (isNaN(price) || price <= 0) {
      newErrors.giaban = 'Giá bán phải là số dương';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (newDate) => {
    setFormState(prev => ({ ...prev, ngayhl: newDate }));
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors.ngayhl) {
      setErrors(prev => ({ ...prev, ngayhl: null }));
    }
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Xác thực form trước khi gửi
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Định dạng dữ liệu để gửi - Sử dụng đối tượng Date trực tiếp
      const formData = {
        ...originalData,
        ngayhl: formState.ngayhl, // Gửi đối tượng Date trực tiếp
        giaban: parseFloat(formState.giaban)
      };
      
      console.log("Gửi dữ liệu cập nhật:", formData);
      
      // Gửi request cập nhật
      const response = await axiosInstance.put(`${API_ENDPOINTS.PRICE_LIST}/${id}`, formData);
      console.log("Phản hồi API:", response.data);
      
      // Hiển thị thông báo thành công
      setAlert({
        show: true,
        message: 'Cập nhật bảng giá thành công!',
        severity: 'success'
      });
      
      // Quay lại trang danh sách sau 1 giây
      setTimeout(() => {
        navigate('/banggia');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi cập nhật bảng giá:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMsg = 'Lỗi khi cập nhật bảng giá. Vui lòng thử lại.';
      
      if (error.response) {
        // Lỗi có phản hồi từ server
        console.error('Lỗi từ server:', error.response.data);
        
        // Kiểm tra nếu error.response.data chứa đối tượng lỗi
        if (typeof error.response.data === 'object' && error.response.data !== null) {
          // Nếu có trường detail, sử dụng nó
          if (error.response.data.detail) {
            if (typeof error.response.data.detail === 'string') {
              errorMsg = error.response.data.detail;
            } else if (Array.isArray(error.response.data.detail)) {
              // Nếu detail là một mảng, lấy thông báo từ phần tử đầu tiên
              const firstError = error.response.data.detail[0];
              if (typeof firstError === 'string') {
                errorMsg = firstError;
              } else if (typeof firstError === 'object' && firstError !== null) {
                errorMsg = firstError.msg || 'Lỗi dữ liệu không hợp lệ';
              }
            } else if (typeof error.response.data.detail === 'object') {
              // Nếu detail là một đối tượng, chuyển đổi nó thành chuỗi
              errorMsg = JSON.stringify(error.response.data.detail);
            }
          } else {
            // Nếu không có detail, chuyển đổi toàn bộ đối tượng lỗi thành chuỗi
            errorMsg = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
              .join(', ');
          }
        } else {
          errorMsg = 'Lỗi từ server: ' + error.response.status;
        }
      } else if (error.request) {
        // Lỗi không nhận được phản hồi từ server
        console.error('Không nhận được phản hồi từ server');
        errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo máy chủ đang hoạt động.';
      } else {
        // Lỗi khi thiết lập request
        console.error('Lỗi khi thiết lập request:', error.message);
        errorMsg = 'Lỗi: ' + error.message;
      }
      
      setAlert({
        show: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị skeleton khi đang tải
  if (initialLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Skeleton variant="rectangular" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Snackbar
        open={alert.show}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, show: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, show: false })}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <FormHeader>
        <Box>
          <FormTitle variant="h5">Chỉnh sửa giá sản phẩm</FormTitle>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Cập nhật thông tin giá cho sản phẩm/dịch vụ
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/banggia')}
          variant="outlined"
        >
          Quay lại
        </Button>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {product && (
                <Grid item xs={12}>
                  <ProductInfo>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" color="primary" fontWeight={600}>
                        Thông tin sản phẩm
                      </Typography>
                      <Chip 
                        label={`Mã: ${product.maspdv}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h6" fontWeight={500} gutterBottom>
                          {product.tenspdv}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Đơn vị tính:
                        </Typography>
                        <Typography variant="body1">
                          {product.dvt}
                        </Typography>
                      </Grid>
                      {product.dongia !== undefined && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Giá hiện tại:
                          </Typography>
                          <Typography variant="body1" color="primary" fontWeight={500}>
                            {formatCurrency(product.dongia)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </ProductInfo>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle1" color="primary" gutterBottom display="flex" alignItems="center">
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Thông tin cần cập nhật
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Ngày hiệu lực"
                    value={formState.ngayhl}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.ngayhl,
                        helperText: errors.ngayhl,
                        size: "medium",
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton edge="end">
                                <CalendarIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
                <FormHelperText>
                  Ngày áp dụng giá mới cho sản phẩm
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Giá bán"
                  name="giaban"
                  type="number"
                  value={formState.giaban}
                  onChange={handleChange}
                  error={!!errors.giaban}
                  helperText={errors.giaban}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                  }}
                  required
                  variant="outlined"
                  size="medium"
                />
                <FormHelperText>
                  Giá bán chưa bao gồm thuế
                </FormHelperText>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        <FormActions>
          <Button
            variant="outlined"
            onClick={() => navigate('/banggia')}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
            color="primary"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </FormActions>
      </form>
    </Box>
  );
};

export default BanggiaEditPage; 