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
  Checkbox, 
  FormControlLabel, 
  CircularProgress, 
  Alert, 
  IconButton, 
  InputAdornment 
} from '@mui/material';
import { 
  LockOutlined as LockOutlinedIcon, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

// Validation schema
const validationSchema = Yup.object({
  username: Yup.string()
    .required('Tên đăng nhập không được để trống'),
  password: Yup.string()
    .required('Mật khẩu không được để trống')
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      remember: false
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const user = await login(values);
        
        // Store user data in localStorage if remember me is checked
        if (values.remember) {
          localStorage.setItem(config.storage.user, JSON.stringify(user));
        }
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        <Avatar sx={{ m: 1, bgcolor: '#6C5CE7' }}>
          <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Đăng nhập
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            autoFocus
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { borderRadius: '8px' }
            }}
          />
          
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { borderRadius: '8px' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                value="remember" 
                color="primary" 
                checked={formik.values.remember}
                onChange={() => formik.setFieldValue('remember', !formik.values.remember)}
              />
            }
            label="Ghi nhớ đăng nhập"
          />
          
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
            {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>
          
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link href="#" variant="body2" sx={{ color: '#6C5CE7' }}>
                Quên mật khẩu?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ color: '#6C5CE7' }}>
                {"Chưa có tài khoản? Đăng ký"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;