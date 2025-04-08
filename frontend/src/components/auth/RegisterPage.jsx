import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Link, 
  CircularProgress, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { 
  PersonAddOutlined as PersonAddIcon,
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const validationSchema = Yup.object({
  username: Yup.string()
    .required('Tên đăng nhập không được để trống')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự'),
  password: Yup.string()
    .required('Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được vượt quá 100 ký tự'),
  confirmPassword: Yup.string()
    .required('Xác nhận mật khẩu không được để trống')
    .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp'),
  fullName: Yup.string()
    .required('Họ tên không được để trống')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  role: Yup.string()
    .required('Vai trò không được để trống')
});

// Role options
const roles = [
  { value: 'Giám đốc', label: 'Giám đốc' },
  { value: 'Kế toán trưởng', label: 'Kế toán trưởng' },
  { value: 'Kế toán DTBH', label: 'Kế toán doanh thu bán hàng' },
  { value: 'Phòng KD', label: 'Phòng kinh doanh' },
  { value: 'KT công nợ', label: 'Kế toán công nợ' },
  { value: 'KT vốn bằng tiền', label: 'Kế toán vốn bằng tiền' }
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        const { confirmPassword, ...registerData } = values;
        await register(registerData);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{ 
            marginTop: 8, 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: '12px'
          }}
        >
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
          </Alert>
          <CircularProgress sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          marginTop: 8, 
          marginBottom: 8,
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: '12px'
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#6C5CE7' }}>
          <PersonAddIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Đăng ký tài khoản
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Tên đăng nhập"
                autoComplete="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                label="Họ và tên"
                autoComplete="name"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                error={formik.touched.role && Boolean(formik.errors.role)}
              >
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Vai trò"
                  sx={{ borderRadius: '8px' }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <FormHelperText>{formik.errors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="password"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  sx: { borderRadius: '8px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                InputProps={{
                  sx: { borderRadius: '8px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              borderRadius: '8px',
              bgcolor: '#6C5CE7',
              '&:hover': {
                bgcolor: '#5A4BD1'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: '#6C5CE7' }}>
                Đã có tài khoản? Đăng nhập
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;