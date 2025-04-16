import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent,
  Typography, 
  TextField, 
  Button, 
  Grid, 
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
  FormHelperText,
  Snackbar
} from '@mui/material';
import { 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
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

const SPDVCreatePage = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    maspdv: '',
    tenspdv: '',
    dongia: '',
    dvt: '',
    mota: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMaSPDV, setLoadingMaSPDV] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchNextMaSPDV();
  }, []);

  // Lấy mã sản phẩm dịch vụ tiếp theo
  const fetchNextMaSPDV = async () => {
    setLoadingMaSPDV(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/next-id`);
      if (response.data && response.data.maspdv) {
        setFormState(prev => ({ ...prev, maspdv: response.data.maspdv }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy mã sản phẩm mới:', error);
      setAlert({
        show: true,
        message: 'Không thể lấy mã sản phẩm mới. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setLoadingMaSPDV(false);
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formState.maspdv.trim()) {
      newErrors.maspdv = 'Mã sản phẩm không được để trống';
    }
    
    if (!formState.tenspdv.trim()) {
      newErrors.tenspdv = 'Tên sản phẩm không được để trống';
    }
    
    if (!formState.dvt.trim()) {
      newErrors.dvt = 'Đơn vị tính không được để trống';
    }
    
    const price = parseFloat(formState.dongia);
    if (isNaN(price) || price <= 0) {
      newErrors.dongia = 'Đơn giá phải là số dương';
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
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
      // Định dạng dữ liệu để gửi
      const formData = {
        ...formState,
        dongia: parseFloat(formState.dongia)
      };
      
      // Gửi request tạo mới
      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS, formData);
      console.log('Sản phẩm đã được tạo:', response.data);
      
      // Hiển thị thông báo thành công
      setAlert({
        show: true,
        message: 'Thêm sản phẩm thành công!',
        severity: 'success'
      });
      
      // Quay lại trang danh sách ngay lập tức
      navigate('/spdv');
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      setAlert({
        show: true,
        message: error.response?.data?.detail || 'Lỗi khi tạo sản phẩm. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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
          <FormTitle variant="h5">Thêm sản phẩm/dịch vụ mới</FormTitle>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Nhập thông tin sản phẩm/dịch vụ
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/spdv')}
          variant="outlined"
        >
          Quay lại
        </Button>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã sản phẩm/dịch vụ"
                  name="maspdv"
                  value={formState.maspdv}
                  onChange={handleChange}
                  error={!!errors.maspdv}
                  helperText={errors.maspdv}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="caption" color="textSecondary">
                          ID:
                        </Typography>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={fetchNextMaSPDV} 
                          size="small"
                          disabled={loadingMaSPDV}
                        >
                          {loadingMaSPDV ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                  variant="outlined"
                  size="small"
                />
                <FormHelperText>
                  Mã được tạo tự động. Nhấn nút làm mới để lấy mã mới.
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Đơn vị tính"
                  name="dvt"
                  value={formState.dvt}
                  onChange={handleChange}
                  error={!!errors.dvt}
                  helperText={errors.dvt}
                  placeholder="VD: Cái, Kg, Thùng, ..."
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm/dịch vụ"
                  name="tenspdv"
                  value={formState.tenspdv}
                  onChange={handleChange}
                  error={!!errors.tenspdv}
                  helperText={errors.tenspdv}
                  placeholder="Nhập tên sản phẩm hoặc dịch vụ"
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Đơn giá"
                  name="dongia"
                  type="number"
                  value={formState.dongia}
                  onChange={handleChange}
                  error={!!errors.dongia}
                  helperText={errors.dongia}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                  }}
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="mota"
                  value={formState.mota}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Nhập mô tả cho sản phẩm/dịch vụ (không bắt buộc)"
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        <FormActions>
          <Button
            variant="outlined"
            onClick={() => navigate('/spdv')}
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
            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </Button>
        </FormActions>
      </form>
    </Box>
  );
};

export default SPDVCreatePage;
