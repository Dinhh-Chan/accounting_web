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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Chip,
  Slider,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { vi } from 'date-fns/locale';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';

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
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const DinhmucckCreatePage = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    maspdv: '',
    ngayhl: new Date(),
    muctien: '',
    tyleck: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Tải danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
      console.log('API Response:', response.data);
      
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
      setAlert({
        show: true,
        message: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
        severity: 'error'
      });
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    // Tải danh sách sản phẩm khi component mount
    fetchProducts();
  }, [fetchProducts]);

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formState.maspdv) {
      newErrors.maspdv = 'Vui lòng chọn sản phẩm';
    }
    
    if (!formState.ngayhl) {
      newErrors.ngayhl = 'Vui lòng chọn ngày hiệu lực';
    }
    
    const thresholdAmount = parseFloat(formState.muctien);
    if (isNaN(thresholdAmount) || thresholdAmount <= 0) {
      newErrors.muctien = 'Mức tiền phải là số dương';
    }
    
    const discountRate = parseFloat(formState.tyleck);
    if (isNaN(discountRate) || discountRate <= 0 || discountRate > 100) {
      newErrors.tyleck = 'Tỷ lệ chiết khấu phải là số dương từ 0 đến 100';
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

    // Nếu thay đổi sản phẩm, cập nhật selectedProduct
    if (name === 'maspdv') {
      const product = products.find(p => p.maspdv === value);
      setSelectedProduct(product);
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

  // Xử lý thay đổi slider
  const handleSliderChange = (event, newValue) => {
    setFormState(prev => ({ ...prev, tyleck: newValue }));
    
    if (errors.tyleck) {
      setErrors(prev => ({ ...prev, tyleck: null }));
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
      // Lấy các thành phần ngày để định dạng chuẩn
      const year = formState.ngayhl.getFullYear();
      const month = String(formState.ngayhl.getMonth() + 1).padStart(2, '0');
      const day = String(formState.ngayhl.getDate()).padStart(2, '0');
      
      // Định dạng dữ liệu để gửi - chỉ gửi phần ngày, không có phần thời gian
      const formData = {
        maspdv: formState.maspdv,
        ngayhl: `${year}-${month}-${day}T00:00:00`, // Format: YYYY-MM-DDT00:00:00 theo chuẩn ISO
        muctien: parseFloat(formState.muctien),
        tyleck: parseFloat(formState.tyleck)
      };
      
      console.log("Gửi dữ liệu:", formData);
      
      // Gửi request tạo mới
      const response = await axiosInstance.post(API_ENDPOINTS.DISCOUNT_RATES, formData);
      console.log("Phản hồi API:", response.data);
      
      // Hiển thị thông báo thành công
      setAlert({
        show: true,
        message: 'Thêm định mức chiết khấu thành công!',
        severity: 'success'
      });
      
      // Quay lại trang danh sách sau 1 giây
      setTimeout(() => {
        navigate('/dinhmucck');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi tạo định mức chiết khấu:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMsg = 'Lỗi khi tạo định mức chiết khấu. Vui lòng thử lại.';
      
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

  const formatSliderValue = (value) => {
    return `${value}%`;
  };

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
          <FormTitle variant="h5">Thêm định mức chiết khấu mới</FormTitle>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Nhập thông tin định mức chiết khấu cho sản phẩm
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dinhmucck')}
          variant="outlined"
        >
          Quay lại
        </Button>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.maspdv}>
                  <InputLabel id="product-select-label">Sản phẩm/Dịch vụ</InputLabel>
                  <Select
                    labelId="product-select-label"
                    id="product-select"
                    value={formState.maspdv}
                    name="maspdv"
                    onChange={handleChange}
                    label="Sản phẩm/Dịch vụ"
                    disabled={loadingProducts}
                    required
                    size="medium"
                  >
                    {loadingProducts ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                      </MenuItem>
                    ) : (
                      [
                        <MenuItem key="placeholder" value="" disabled>
                          Chọn sản phẩm/dịch vụ
                        </MenuItem>,
                        ...(products && products.length > 0 ? products.map((product) => (
                          <MenuItem key={product.maspdv} value={product.maspdv}>
                            {product.tenspdv} ({product.maspdv})
                          </MenuItem>
                        )) : [])
                      ]
                    )}
                  </Select>
                  {errors.maspdv && <FormHelperText>{errors.maspdv}</FormHelperText>}
                </FormControl>
              </Grid>

              {selectedProduct && (
                <Grid item xs={12}>
                  <ProductInfo>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Thông tin sản phẩm đã chọn
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Mã sản phẩm:
                        </Typography>
                        <Chip 
                          label={selectedProduct.maspdv} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Đơn vị tính:
                        </Typography>
                        <Typography variant="body1">
                          {selectedProduct.dvt}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Tên sản phẩm:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedProduct.tenspdv}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Giá hiện tại:
                        </Typography>
                        <Typography variant="body1" color="primary" fontWeight={500}>
                          {formatCurrency(selectedProduct.dongia)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ProductInfo>
                </Grid>
              )}

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
                  Ngày áp dụng định mức chiết khấu cho sản phẩm
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mức tiền"
                  name="muctien"
                  type="number"
                  value={formState.muctien}
                  onChange={handleChange}
                  error={!!errors.muctien}
                  helperText={errors.muctien}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                  }}
                  required
                  variant="outlined"
                  size="medium"
                  placeholder="0"
                />
                <FormHelperText>
                  Mức tiền tối thiểu để áp dụng chiết khấu
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <Typography id="discount-rate-slider" gutterBottom>
                  Tỷ lệ chiết khấu: {isNaN(formState.tyleck) ? 0 : formState.tyleck}%
                </Typography>
                <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
                  <PercentIcon color="primary" fontSize="small" />
                  <Slider
                    aria-labelledby="discount-rate-slider"
                    value={isNaN(formState.tyleck) ? 0 : formState.tyleck}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatSliderValue}
                    step={0.5}
                    marks
                    min={0}
                    max={100}
                    color="primary"
                  />
                  <TextField
                    variant="outlined"
                    value={isNaN(formState.tyleck) ? 0 : formState.tyleck}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 100) {
                        setFormState(prev => ({ ...prev, tyleck: value }));
                      }
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{
                      step: 0.5,
                      min: 0,
                      max: 100,
                      type: 'number',
                    }}
                    size="small"
                    sx={{ width: 100 }}
                    error={!!errors.tyleck}
                  />
                </Stack>
                {errors.tyleck && <FormHelperText error>{errors.tyleck}</FormHelperText>}
                <FormHelperText>
                  Phần trăm chiết khấu áp dụng khi đạt mức tiền
                </FormHelperText>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        <FormActions>
          <Button
            variant="outlined"
            onClick={() => navigate('/dinhmucck')}
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
            {loading ? 'Đang lưu...' : 'Lưu định mức'}
          </Button>
        </FormActions>
      </form>
    </Box>
  );
};

export default DinhmucckCreatePage;
