import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 400,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
  borderRadius: theme.shape.borderRadius
}));

const LoginForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, loading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <LoginContainer>
      <LoginPaper>
        <Typography variant="h5" component="h1" fontWeight={600} textAlign="center">
          Đăng nhập
        </Typography>
        
        {authError && (
          <Alert severity="error">{authError}</Alert>
        )}
        
        <LoginForm onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
          />
          
          <TextField
            label="Mật khẩu"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
          </Button>
        </LoginForm>
      </LoginPaper>
    </LoginContainer>
  );
};

export default LoginPage;