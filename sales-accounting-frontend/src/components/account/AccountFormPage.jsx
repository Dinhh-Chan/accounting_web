import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { accountService } from '../../services/api-service';
import PageHeader from '../common/PageHeader';

// Validation schema
const validationSchema = Yup.object({
  maTK: Yup.string()
    .required('Mã tài khoản không được để trống')
    .matches(/^[0-9\\.]+$/, 'Mã tài khoản phải chứa số và dấu chấm')
    .max(10, 'Mã tài khoản không được vượt quá 10 ký tự'),
  tenTK: Yup.string()
    .required('Tên tài khoản không được để trống')
    .max(100, 'Tên tài khoản không được vượt quá 100 ký tự'),
  capTK: Yup.number()
    .required('Cấp tài khoản không được để trống')
    .min(1, 'Cấp tài khoản tối thiểu là 1')
    .max(5, 'Cấp tài khoản tối đa là 5')
});

const AccountFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parentAccounts, setParentAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedParent, setSelectedParent] = useState('');
  const isEditMode = Boolean(id);

  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      maTK: '',
      tenTK: '',
      capTK: 1
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');
      setSubmitting(true);

      try {
        if (isEditMode) {
          await accountService.updateAccount(id, values);
          setSuccess('Tài khoản đã được cập nhật thành công');
        } else {
          await accountService.createAccount(values);
          setSuccess('Tài khoản đã được tạo thành công');
          formik.resetForm();
          setSelectedParent('');
        }
      } catch (err) {
        console.error('Error saving account:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu tài khoản. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    }
  });

  // Fetch account data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchAccount = async () => {
        setFetchLoading(true);
        try {
          const response = await accountService.getAccountById(id);
          const account = response.data.data;
          
          // Set form values
          formik.setValues({
            maTK: account.maTK || '',
            tenTK: account.tenTK || '',
            capTK: account.capTK || 1
          });

          // If it's a child account, try to determine the parent
          if (account.capTK > 1) {
            const lastDotIndex = account.maTK.lastIndexOf('.');
            if (lastDotIndex > 0) {
              const parentCode = account.maTK.substring(0, lastDotIndex);
              setSelectedParent(parentCode);
            }
          }
        } catch (err) {
          console.error('Error fetching account:', err);
          setError('Không thể tải thông tin tài khoản. Vui lòng thử lại sau.');
        } finally {
          setFetchLoading(false);
        }
      };

      fetchAccount();
    }
  }, [id, isEditMode]);

  // Load parent accounts when capTK changes
  useEffect(() => {
    const fetchParentAccounts = async () => {
      if (formik.values.capTK === 1) {
        setParentAccounts([]);
        return;
      }

      try {
        const response = await accountService.getAccountsByLevel(formik.values.capTK - 1);
        setParentAccounts(response.data.data);
      } catch (err) {
        console.error('Error fetching parent accounts:', err);
      }
    };

    fetchParentAccounts();
  }, [formik.values.capTK]);

  // Helper function to handle account code based on level
  const handleAccountCodeChange = (e) => {
    let value = e.target.value;
    formik.setFieldValue('maTK', value);
  };

  // Handle parent account selection
  const handleParentChange = (e) => {
    const parentCode = e.target.value;
    setSelectedParent(parentCode);
    
    if (parentCode) {
      // Suggest a code format based on parent account
      const suggestedCode = `${parentCode}.`;
      formik.setFieldValue('maTK', suggestedCode);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title={isEditMode ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
        subtitle={isEditMode ? "Cập nhật thông tin tài khoản" : "Tạo mới một tài khoản kế toán"}
        icon={<AccountIcon />}
      />

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/accounts" underline="hover" color="inherit">
          Tài khoản kế toán
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}
        </Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {fetchLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ p: 3 }}>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Account Level */}
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.capTK && Boolean(formik.errors.capTK)}
                  disabled={isEditMode || loading}
                >
                  <InputLabel id="capTK-label">Cấp tài khoản</InputLabel>
                  <Select
                    labelId="capTK-label"
                    id="capTK"
                    name="capTK"
                    value={formik.values.capTK}
                    onChange={formik.handleChange}
                    label="Cấp tài khoản"
                  >
                    <MenuItem value={1}>Cấp 1</MenuItem>
                    <MenuItem value={2}>Cấp 2</MenuItem>
                    <MenuItem value={3}>Cấp 3</MenuItem>
                    <MenuItem value={4}>Cấp 4</MenuItem>
                    <MenuItem value={5}>Cấp 5</MenuItem>
                  </Select>
                  {formik.touched.capTK && formik.errors.capTK && (
                    <FormHelperText>{formik.errors.capTK}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Parent Account (for accounts level > 1) */}
              {formik.values.capTK > 1 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={isEditMode || loading}>
                    <InputLabel id="parentAccount-label">Tài khoản cha</InputLabel>
                    <Select
                      labelId="parentAccount-label"
                      id="parentAccount"
                      value={selectedParent}
                      label="Tài khoản cha"
                      onChange={handleParentChange}
                    >
                      <MenuItem value="" disabled>Chọn tài khoản cha</MenuItem>
                      {parentAccounts.map((account) => (
                        <MenuItem key={account.maTK} value={account.maTK}>
                          {account.maTK} - {account.tenTK}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {formik.values.capTK > 1 ? 'Chọn tài khoản cha để tạo cấu trúc tài khoản phù hợp' : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )}
              
              {/* Account Code */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="maTK"
                  name="maTK"
                  label="Mã tài khoản"
                  value={formik.values.maTK}
                  onChange={handleAccountCodeChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.maTK && Boolean(formik.errors.maTK)}
                  helperText={
                    (formik.touched.maTK && formik.errors.maTK) || 
                    "Mã tài khoản dùng số và dấu chấm (ví dụ: 111, 112.1)"
                  }
                  disabled={isEditMode || loading}
                />
              </Grid>
              
              {/* Account Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="tenTK"
                  name="tenTK"
                  label="Tên tài khoản"
                  value={formik.values.tenTK}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tenTK && Boolean(formik.errors.tenTK)}
                  helperText={formik.touched.tenTK && formik.errors.tenTK}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            {/* Help Box */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 3,
                mb: 3,
                border: '1px dashed #ccc',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '8px'
              }}
            >
              <Typography variant="subtitle2" gutterBottom color="primary.main">
                Hướng dẫn cấu trúc tài khoản
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - <strong>Cấp 1:</strong> Tài khoản tổng hợp có mã số như 111, 112, 131, v.v...<br />
                - <strong>Cấp 2:</strong> Tài khoản chi tiết của cấp 1, có mã số như 1111, 1112 hoặc 111.1, 111.2<br />
                - <strong>Cấp 3-5:</strong> Tài khoản chi tiết hơn nữa, có mã số như 111.11 hoặc 111.1.1, v.v...
              </Typography>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/accounts')}
                disabled={loading}
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading || submitting}
              >
                {loading || submitting ? <CircularProgress size={24} /> : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default AccountFormPage;