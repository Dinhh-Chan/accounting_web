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
  Slider,
  Stack,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Percent as PercentIcon,
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
import { format, parseISO } from 'date-fns';

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

const DinhmucckEditPage = () => {
  const navigate = useNavigate();
  const { maspdv, date } = useParams(); // Lấy tham số từ URL trực tiếp
  const [formState, setFormState] = useState({
    maspdv: '',
    ngayhl: new Date(),
    muctien: '',
    tyleck: 0
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
      setAlert({
        show: true,
        message: 'Không thể tải thông tin sản phẩm.',
        severity: 'warning'
      });
    }
  };

  // Tải thông tin định mức chiết khấu theo id
  const fetchDiscountData = useCallback(async () => {
    setInitialLoading(true);
    try {
      if (!maspdv || !date) {
        throw new Error('Thiếu tham số sản phẩm hoặc ngày');
      }
      
      console.log("Thông số đầu vào:", { maspdv, date });
      
      // Phân tích chuỗi ngày từ URL (yyyy-MM-dd) thành các phần
      const dateParts = date.split('-');
      if (dateParts.length !== 3) {
        throw new Error('Định dạng ngày không hợp lệ, cần định dạng yyyy-MM-dd');
      }
      
      // Tạo đối tượng ngày từ các phần tách ra
      // Chú ý: tháng trong JavaScript bắt đầu từ 0 nên phải trừ 1
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error('Các thành phần ngày không hợp lệ');
      }
      
      // Tạo đối tượng Date
      const dateObj = new Date(year, month, day);
      
      // Kiểm tra tính hợp lệ của ngày
      if (isNaN(dateObj.getTime())) {
        throw new Error('Ngày không hợp lệ sau khi chuyển đổi');
      }
      
      // Format ngày theo định dạng YYYY-MM-DD
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Sử dụng helper function để tạo URL API
      const apiUrl = API_ENDPOINTS.DISCOUNT_RATE_DETAIL(maspdv, formattedDate);
      console.log("API URL:", apiUrl);
      
      // Gọi API endpoint trực tiếp
      const response = await axiosInstance.get(apiUrl);
      const discountData = response.data;
      
      console.log("Dữ liệu nhận được từ API:", discountData);
      
      // Cập nhật state với dữ liệu từ API
      setFormState({
        maspdv: discountData.maspdv,
        ngayhl: discountData.ngayhl ? parseISO(discountData.ngayhl) : new Date(year, month, day),
        muctien: discountData.muctien?.toString() || '0',
        tyleck: parseFloat(discountData.tyleck || discountData.tiledk) || 0
      });
      
      setOriginalData(discountData);
      
      // Tải thông tin sản phẩm
      await fetchProductData(discountData.maspdv);
    } catch (error) {
      console.error('Lỗi khi tải thông tin định mức chiết khấu:', error);
      console.error('Chi tiết lỗi:', error.message || 'Không có thông tin chi tiết');
      
      if (error.response) {
        console.error('Mã lỗi:', error.response.status);
        console.error('Dữ liệu phản hồi:', error.response.data);
      }
      
      setAlert({
        show: true,
        message: `Không thể tải thông tin định mức chiết khấu: ${error.response?.data?.detail || error.message || 'Vui lòng thử lại sau hoặc quay lại danh sách.'}`,
        severity: 'error'
      });
    } finally {
      setInitialLoading(false);
    }
  }, [maspdv, date]);

  useEffect(() => {
    // Tải thông tin định mức khi component mount
    if (maspdv && date) {
      fetchDiscountData();
    }
  }, [maspdv, date, fetchDiscountData]);

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
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
      if (!originalData || !originalData.maspdv) {
        throw new Error('Không có dữ liệu gốc để cập nhật');
      }
      
      // Lấy các thành phần ngày để định dạng chuẩn
      const year = formState.ngayhl.getFullYear();
      const month = String(formState.ngayhl.getMonth() + 1).padStart(2, '0');
      const day = String(formState.ngayhl.getDate()).padStart(2, '0');
      
      // Định dạng dữ liệu để gửi
      const formData = {
        maspdv: originalData.maspdv,
        ngayhl: `${year}-${month}-${day}`, // Format: YYYY-MM-DD
        muctien: parseFloat(formState.muctien),
        tyleck: parseFloat(formState.tyleck)
      };
      
      console.log("Gửi dữ liệu cập nhật:", formData);
      
      // Tạo URL cho API update sử dụng ngày gốc và mã sản phẩm gốc
      let originalDateStr;
      
      if (typeof originalData.ngayhl === 'string') {
        if (originalData.ngayhl.includes('T')) {
          // Nếu là định dạng ISO, trích xuất phần ngày
          originalDateStr = originalData.ngayhl.split('T')[0];
        } else {
          // Nếu là chuỗi ngày khác, chuyển đổi qua Date rồi định dạng lại
          const origDate = new Date(originalData.ngayhl);
          if (!isNaN(origDate.getTime())) {
            originalDateStr = `${origDate.getFullYear()}-${String(origDate.getMonth() + 1).padStart(2, '0')}-${String(origDate.getDate()).padStart(2, '0')}`;
          } else {
            // Nếu không thể chuyển đổi, sử dụng chuỗi nguyên gốc
            originalDateStr = originalData.ngayhl;
          }
        }
      } else {
        // Nếu là đối tượng Date
        const origDate = new Date(originalData.ngayhl);
        originalDateStr = `${origDate.getFullYear()}-${String(origDate.getMonth() + 1).padStart(2, '0')}-${String(origDate.getDate()).padStart(2, '0')}`;
      }
      
      // Sử dụng helper function để tạo URL API cập nhật
      const updateUrl = API_ENDPOINTS.DISCOUNT_RATE_DETAIL(originalData.maspdv, originalDateStr);
      
      console.log("API URL cập nhật:", updateUrl);
      
      // Gửi request cập nhật
      const response = await axiosInstance.put(updateUrl, formData);
      console.log("Phản hồi API:", response.data);
      
      // Hiển thị thông báo thành công
      setAlert({
        show: true,
        message: 'Cập nhật định mức chiết khấu thành công!',
        severity: 'success'
      });
      
      // Quay lại trang danh sách sau 1 giây
      setTimeout(() => {
        navigate('/dinhmucck');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi cập nhật định mức chiết khấu:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMsg = 'Lỗi khi cập nhật định mức chiết khấu. Vui lòng thử lại.';
      
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
  
  // Hiển thị thông báo lỗi nếu không tải được dữ liệu và không có originalData
  if (alert.show && alert.severity === 'error' && !originalData) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert 
          severity="error" 
          variant="filled" 
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" gutterBottom>
            Không thể tải dữ liệu định mức chiết khấu.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dinhmucck')}
            sx={{ mt: 2 }}
          >
            Quay lại danh sách
          </Button>
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
          <FormTitle variant="h5">Chỉnh sửa định mức chiết khấu</FormTitle>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Cập nhật thông tin định mức chiết khấu cho sản phẩm
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
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </FormActions>
      </form>
    </Box>
  );
};

export default DinhmucckEditPage; 