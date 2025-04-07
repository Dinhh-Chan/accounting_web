import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

// Profile info tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Profile validation schema
const profileValidationSchema = Yup.object({
  fullName: Yup.string()
    .required('Họ tên không được để trống')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .max(100, 'Email không được vượt quá 100 ký tự'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
    .nullable()
});

// Password validation schema
const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Mật khẩu hiện tại không được để trống'),
  newPassword: Yup.string()
    .required('Mật khẩu mới không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được vượt quá 100 ký tự'),
  confirmPassword: Yup.string()
    .required('Xác nhận mật khẩu không được để trống')
    .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp')
});

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Profile form
  const profileFormik = useFormik({
    initialValues: {
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      role: currentUser?.role || ''
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      // Simulate API call
      setTimeout(() => {
        console.log('Profile update values:', values);
        setSuccess('Thông tin cá nhân đã được cập nhật thành công!');
        setEditMode(false);
        setLoading(false);
      }, 1000);
    },
  });

  // Password form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      // Simulate API call
      setTimeout(() => {
        console.log('Password update values:', values);
        setSuccess('Mật khẩu đã được cập nhật thành công!');
        passwordFormik.resetForm();
        setLoading(false);
      }, 1000);
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSuccess('');
    setError('');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Header with banner and avatar */}
        <Box
          sx={{
            height: '120px',
            bgcolor: '#6C5CE7',
            position: 'relative'
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            px: 4,
            pb: 2
          }}
        >
          <Box
            sx={{
              mt: -5,
              position: 'relative'
            }}
          >
            <Avatar
              src={avatarPreview}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                bgcolor: '#6C5CE7'
              }}
              alt={currentUser?.fullName || 'User'}
            >
              {getInitials(currentUser?.fullName)}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  bgcolor: 'white',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  }
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </label>
          </Box>
          <Box
            sx={{
              ml: { xs: 0, sm: 3 },
              mt: { xs: 2, sm: 1 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', sm: 'flex-start' }
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {currentUser?.fullName || 'User Name'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.role || 'Role'}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Tabs */}
        <Box sx={{ px: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                px: 3
              },
              '& .Mui-selected': {
                color: '#6C5CE7',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6C5CE7',
              }
            }}
          >
            <Tab
              icon={<PersonIcon />}
              label="Thông tin"
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
              iconPosition="start"
            />
            <Tab
              icon={<LockIcon />}
              label="Mật khẩu"
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Divider />

        <Box sx={{ p: 4 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Profile Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                variant={editMode ? "contained" : "outlined"}
                color={editMode ? "primary" : "secondary"}
                onClick={() => {
                  if (editMode) {
                    profileFormik.handleSubmit();
                  } else {
                    setEditMode(true);
                  }
                }}
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  bgcolor: editMode ? '#6C5CE7' : 'transparent',
                  borderColor: editMode ? '#6C5CE7' : '#9e9e9e',
                  color: editMode ? 'white' : '#757575',
                  '&:hover': {
                    bgcolor: editMode ? '#5A4BD1' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: editMode ? '#5A4BD1' : '#757575'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : (editMode ? 'Lưu thông tin' : 'Chỉnh sửa')}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Họ và tên"
                  variant="outlined"
                  value={profileFormik.values.fullName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.fullName && Boolean(profileFormik.errors.fullName)}
                  helperText={profileFormik.touched.fullName && profileFormik.errors.fullName}
                  disabled={!editMode || loading}
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                  helperText={profileFormik.touched.email && profileFormik.errors.email}
                  disabled={!editMode || loading}
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Số điện thoại"
                  variant="outlined"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
                  helperText={profileFormik.touched.phone && profileFormik.errors.phone}
                  disabled={!editMode || loading}
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="role"
                  name="role"
                  label="Vai trò"
                  variant="outlined"
                  value={profileFormik.values.role}
                  disabled={true}
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Password Tab Content */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={passwordFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="currentPassword"
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    type={showCurrentPassword ? "text" : "password"}
                    variant="outlined"
                    value={passwordFormik.values.currentPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                    helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                    disabled={loading}
                    InputProps={{
                      sx: { borderRadius: '8px' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle current password visibility"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="newPassword"
                    name="newPassword"
                    label="Mật khẩu mới"
                    type={showNewPassword ? "text" : "password"}
                    variant="outlined"
                    value={passwordFormik.values.newPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                    helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                    disabled={loading}
                    InputProps={{
                      sx: { borderRadius: '8px' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle new password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    value={passwordFormik.values.confirmPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                    helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                    disabled={loading}
                    InputProps={{
                      sx: { borderRadius: '8px' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ 
                        mt: 2, 
                        borderRadius: '8px',
                        bgcolor: '#6C5CE7',
                        '&:hover': {
                          bgcolor: '#5A4BD1'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Cập nhật mật khẩu'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;