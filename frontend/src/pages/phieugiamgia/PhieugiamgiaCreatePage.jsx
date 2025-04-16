import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Calculate as CalculateIcon
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
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const unformatCurrency = (formattedAmount) => {
  if (!formattedAmount) return 0;
  // Xóa tất cả ký tự không phải số và dấu thập phân
  const numericString = formattedAmount.replace(/[^\d,.]/g, '').replace(',', '.');
  return parseFloat(numericString);
};

const PhieugiamgiaCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  
  // State cho form phiếu giảm giá
  const [formState, setFormState] = useState({
    ngaylap: new Date(),
    makh: '',
    diengiai: '',
    tknogiamtru: '',
    tkcott: '',
    soct: '',
    thuesuat: 10,
    tienthue: 0,
    tknothue: '',
    tiendt: 0,
    tientt: 0
  });

  // State cho khách hàng đã chọn
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State cho danh sách tham chiếu
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  
  // State cho chi tiết phiếu
  const [voucherItems, setVoucherItems] = useState([{
    maspdv: '',
    soluong: 1,
    dongia: 0,
    id: Date.now() // Unique ID cho mỗi item
  }]);
  
  // State cho lỗi validation
  const [errors, setErrors] = useState({});

  // Lấy số phiếu tiếp theo
  const [nextVoucherNumber, setNextVoucherNumber] = useState('');
  
  // Tải số phiếu tiếp theo
  const fetchNextVoucherNumber = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.VOUCHERS}/next-id`);
      console.log('Số phiếu tiếp theo:', response.data);
      if (response.data && response.data.sophieu) {
        setNextVoucherNumber(response.data.sophieu);
      }
    } catch (error) {
      console.error('Lỗi khi lấy số phiếu tiếp theo:', error);
    }
  }, []);
  
  // Tải danh sách khách hàng
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
      console.log('Danh sách khách hàng:', response.data);
      
      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        setCustomers(response.data.items);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách hàng:', error);
      setAlert({
        show: true,
        message: 'Không thể tải danh sách khách hàng',
        severity: 'error'
      });
    }
  }, []);
  
  // Tải danh sách hóa đơn
  const fetchInvoices = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.INVOICES);
      console.log('Danh sách hóa đơn:', response.data);
      
      if (Array.isArray(response.data)) {
        setInvoices(response.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        setInvoices(response.data.items);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách hóa đơn:', error);
      setAlert({
        show: true,
        message: 'Không thể tải danh sách hóa đơn',
        severity: 'error'
      });
    }
  }, []);
  
  // Tải danh sách tài khoản kế toán
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ACCOUNTS);
      console.log('Danh sách tài khoản:', response.data);
      
      if (Array.isArray(response.data)) {
        setAccounts(response.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        setAccounts(response.data.items);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài khoản:', error);
      setAlert({
        show: true,
        message: 'Không thể tải danh sách tài khoản kế toán',
        severity: 'error'
      });
    }
  }, []);
  
  // Tải danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
      console.log('Danh sách sản phẩm:', response.data);
      
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        setProducts(response.data.items);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      setAlert({
        show: true,
        message: 'Không thể tải danh sách sản phẩm',
        severity: 'error'
      });
    }
  }, []);

  useEffect(() => {
    // Tải dữ liệu ban đầu
    Promise.all([
      fetchNextVoucherNumber(),
      fetchCustomers(),
      fetchInvoices(),
      fetchAccounts(),
      fetchProducts()
    ]).finally(() => {
      setInitialLoading(false);
    });
  }, [fetchNextVoucherNumber, fetchCustomers, fetchInvoices, fetchAccounts, fetchProducts]);
  
  // Xử lý thay đổi form chung
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Trường hợp chọn hóa đơn
    if (name === 'soct') {
      const selectedInvoice = invoices.find(invoice => invoice.soct === value);
      if (selectedInvoice) {
        // Tự động điền mã khách hàng từ hóa đơn
        setFormState(prev => ({
          ...prev,
          makh: selectedInvoice.makh || prev.makh
        }));
        
        // Tìm thông tin khách hàng
        const customer = customers.find(c => c.makh === selectedInvoice.makh);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    }
    
    // Trường hợp chọn khách hàng
    if (name === 'makh') {
      const customer = customers.find(c => c.makh === value);
      setSelectedCustomer(customer);
    }
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (newDate) => {
    setFormState(prev => ({ ...prev, ngaylap: newDate }));
    
    if (errors.ngaylap) {
      setErrors(prev => ({ ...prev, ngaylap: null }));
    }
  };

  // Xử lý thay đổi chi tiết phiếu
  const handleItemChange = (id, field, value) => {
    setVoucherItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    
    // Tính lại tổng tiền khi thay đổi chi tiết
    calculateTotals();
  };

  // Xóa một chi tiết phiếu
  const handleRemoveItem = (id) => {
    if (voucherItems.length > 1) {
      setVoucherItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Tính lại tổng tiền
      calculateTotals();
    } else {
      setAlert({
        show: true,
        message: 'Phiếu phải có ít nhất một chi tiết',
        severity: 'warning'
      });
    }
  };

  // Thêm một chi tiết phiếu mới
  const handleAddItem = () => {
    const newItem = {
      maspdv: '',
      soluong: 1,
      dongia: 0,
      id: Date.now()
    };
    
    setVoucherItems(prevItems => [...prevItems, newItem]);
  };

  // Tính toán tổng tiền
  const calculateTotals = () => {
    // Tính tổng tiền doanh thu
    const totalRevenue = voucherItems.reduce((sum, item) => {
      const amount = parseFloat(item.soluong) * parseFloat(item.dongia);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Tính tiền thuế
    const taxRate = parseFloat(formState.thuesuat) / 100;
    const taxAmount = totalRevenue * taxRate;
    
    // Tính tổng tiền
    const totalAmount = totalRevenue + taxAmount;
    
    setFormState(prev => ({
      ...prev,
      tiendt: totalRevenue,
      tienthue: taxAmount,
      tientt: totalAmount
    }));
  };
  
  useEffect(() => {
    // Tính lại tổng tiền khi thay đổi thuế suất
    const taxRate = parseFloat(formState.thuesuat) / 100;
    const taxAmount = formState.tiendt * taxRate;
    const totalAmount = formState.tiendt + taxAmount;
    
    setFormState(prev => ({
      ...prev,
      tienthue: taxAmount,
      tientt: totalAmount
    }));
  }, [formState.thuesuat, formState.tiendt]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formState.ngaylap) {
      newErrors.ngaylap = 'Vui lòng chọn ngày lập';
    }
    
    if (!formState.makh) {
      newErrors.makh = 'Vui lòng chọn khách hàng';
    }
    
    if (!formState.soct) {
      newErrors.soct = 'Vui lòng chọn hóa đơn';
    }
    
    if (!formState.tknogiamtru) {
      newErrors.tknogiamtru = 'Vui lòng chọn tài khoản nợ giảm trừ';
    }
    
    if (!formState.tkcott) {
      newErrors.tkcott = 'Vui lòng chọn tài khoản có thanh toán';
    }
    
    if (!formState.tknothue) {
      newErrors.tknothue = 'Vui lòng chọn tài khoản nợ thuế';
    }
    
    const invalidItems = voucherItems.filter(item => !item.maspdv || item.soluong <= 0 || item.dongia <= 0);
    if (invalidItems.length > 0) {
      newErrors.items = 'Vui lòng điền đầy đủ thông tin cho các chi tiết phiếu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({
        show: true,
        message: 'Vui lòng điền đầy đủ thông tin',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi
      const formData = {
        ngaylap: formState.ngaylap.toISOString(),
        makh: formState.makh,
        diengiai: formState.diengiai,
        tknogiamtru: formState.tknogiamtru,
        tkcott: formState.tkcott,
        soct: formState.soct,
        thuesuat: parseFloat(formState.thuesuat),
        tienthue: parseFloat(formState.tienthue),
        tknothue: formState.tknothue,
        tiendt: parseFloat(formState.tiendt),
        tientt: parseFloat(formState.tientt),
        chi_tiet: voucherItems.map(item => ({
          maspdv: item.maspdv,
          soluong: parseFloat(item.soluong),
          dongia: parseFloat(item.dongia)
        }))
      };
      
      console.log('Dữ liệu gửi đi:', formData);
      
      // Gọi API tạo phiếu giảm giá
      const response = await axiosInstance.post(API_ENDPOINTS.VOUCHERS, formData);
      console.log('Kết quả tạo phiếu:', response.data);
      
      setAlert({
        show: true,
        message: 'Tạo phiếu giảm giá thành công',
        severity: 'success'
      });
      
      // Sau 2 giây, chuyển về trang danh sách
      setTimeout(() => {
        navigate('/phieugiamgia', { state: { refreshData: true } });
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi tạo phiếu giảm giá:', error);
      
      let errorMsg = 'Không thể tạo phiếu giảm giá. Vui lòng thử lại sau.';
      
      if (error.response) {
        console.error('Lỗi từ server:', error.response.status, error.response.data);
        
        if (typeof error.response.data === 'object' && error.response.data !== null) {
          if (error.response.data.detail) {
            errorMsg = typeof error.response.data.detail === 'string'
              ? error.response.data.detail
              : JSON.stringify(error.response.data.detail);
          }
        }
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

  const handleBack = () => {
    navigate('/phieugiamgia');
  };

  // Render trang
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, show: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, show: false })}
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <HeaderBox>
        <Box>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Tạo phiếu giảm giá mới
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Nhập thông tin chi tiết để tạo phiếu giảm giá mới
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Quay lại
        </Button>
      </HeaderBox>

      <form onSubmit={handleSubmit}>
        {/* Thông tin chung */}
        <StyledCard>
          <CardContent>
            <Typography variant="h6" component="h2" fontWeight={600} color="primary" sx={{ mb: 3 }}>
              Thông tin chung
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Ngày lập *"
                    value={formState.ngaylap}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        fullWidth: true,
                        error: !!errors.ngaylap,
                        helperText: errors.ngaylap,
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.makh}>
                  <InputLabel id="customer-select-label">Khách hàng *</InputLabel>
                  <Select
                    labelId="customer-select-label"
                    id="customer-select"
                    name="makh"
                    value={formState.makh}
                    onChange={handleChange}
                    label="Khách hàng *"
                  >
                    <MenuItem value="">
                      <em>Chọn khách hàng</em>
                    </MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.makh} value={customer.makh}>
                        {customer.tenkh} ({customer.makh})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.makh && <FormHelperText>{errors.makh}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.soct}>
                  <InputLabel id="invoice-select-label">Hóa đơn *</InputLabel>
                  <Select
                    labelId="invoice-select-label"
                    id="invoice-select"
                    name="soct"
                    value={formState.soct}
                    onChange={handleChange}
                    label="Hóa đơn *"
                  >
                    <MenuItem value="">
                      <em>Chọn hóa đơn</em>
                    </MenuItem>
                    {invoices.map((invoice) => (
                      <MenuItem key={invoice.soct} value={invoice.soct}>
                        {invoice.soct} - {formatCurrency(invoice.sotien)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.soct && <FormHelperText>{errors.soct}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="diengiai"
                  label="Diễn giải"
                  value={formState.diengiai}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.tknogiamtru}>
                  <InputLabel id="tknogiamtru-select-label">TK nợ giảm trừ *</InputLabel>
                  <Select
                    labelId="tknogiamtru-select-label"
                    id="tknogiamtru-select"
                    name="tknogiamtru"
                    value={formState.tknogiamtru}
                    onChange={handleChange}
                    label="TK nợ giảm trừ *"
                  >
                    <MenuItem value="">
                      <em>Chọn tài khoản</em>
                    </MenuItem>
                    {accounts.map((account) => (
                      <MenuItem key={account.matk} value={account.matk}>
                        {account.matk} - {account.tentk}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tknogiamtru && <FormHelperText>{errors.tknogiamtru}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.tkcott}>
                  <InputLabel id="tkcott-select-label">TK có thanh toán *</InputLabel>
                  <Select
                    labelId="tkcott-select-label"
                    id="tkcott-select"
                    name="tkcott"
                    value={formState.tkcott}
                    onChange={handleChange}
                    label="TK có thanh toán *"
                  >
                    <MenuItem value="">
                      <em>Chọn tài khoản</em>
                    </MenuItem>
                    {accounts.map((account) => (
                      <MenuItem key={account.matk} value={account.matk}>
                        {account.matk} - {account.tentk}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tkcott && <FormHelperText>{errors.tkcott}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.tknothue}>
                  <InputLabel id="tknothue-select-label">TK nợ thuế *</InputLabel>
                  <Select
                    labelId="tknothue-select-label"
                    id="tknothue-select"
                    name="tknothue"
                    value={formState.tknothue}
                    onChange={handleChange}
                    label="TK nợ thuế *"
                  >
                    <MenuItem value="">
                      <em>Chọn tài khoản</em>
                    </MenuItem>
                    {accounts.map((account) => (
                      <MenuItem key={account.matk} value={account.matk}>
                        {account.matk} - {account.tentk}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tknothue && <FormHelperText>{errors.tknothue}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Chi tiết phiếu */}
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" fontWeight={600} color="primary">
                Chi tiết phiếu giảm giá
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                Thêm dòng
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {errors.items && (
              <Alert severity="error" sx={{ mb: 3 }}>{errors.items}</Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}>#</TableCell>
                    <TableCell>Sản phẩm/Dịch vụ *</TableCell>
                    <TableCell width={150}>Số lượng *</TableCell>
                    <TableCell width={200}>Đơn giá *</TableCell>
                    <TableCell width={200}>Thành tiền</TableCell>
                    <TableCell width={50}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {voucherItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`product-select-label-${item.id}`}>Sản phẩm</InputLabel>
                          <Select
                            labelId={`product-select-label-${item.id}`}
                            id={`product-select-${item.id}`}
                            value={item.maspdv}
                            onChange={(e) => handleItemChange(item.id, 'maspdv', e.target.value)}
                            label="Sản phẩm"
                          >
                            <MenuItem value="">
                              <em>Chọn sản phẩm</em>
                            </MenuItem>
                            {products.map((product) => (
                              <MenuItem key={product.maspdv} value={product.maspdv}>
                                {product.tenspdv} ({product.maspdv})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.soluong}
                          onChange={(e) => handleItemChange(item.id, 'soluong', e.target.value)}
                          inputProps={{ min: "1", step: "1" }}
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.dongia}
                          onChange={(e) => handleItemChange(item.id, 'dongia', e.target.value)}
                          inputProps={{ min: "0", step: "1000" }}
                          size="small"
                          fullWidth
                          InputProps={{
                            endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(item.soluong * item.dongia)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={voucherItems.length <= 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>

        {/* Thông tin thuế và tổng tiền */}
        <StyledCard>
          <CardContent>
            <Typography variant="h6" component="h2" fontWeight={600} color="primary" sx={{ mb: 3 }}>
              Thông tin thuế và tổng tiền
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tổng tiền doanh thu"
                  value={formatCurrency(formState.tiendt)}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalculateIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="thuesuat"
                  label="Thuế suất (%)"
                  type="number"
                  value={formState.thuesuat}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  inputProps={{ min: "0", max: "100", step: "1" }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Tiền thuế"
                  value={formatCurrency(formState.tienthue)}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Tổng tiền thanh toán"
                  value={formatCurrency(formState.tientt)}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      fontWeight: 'bold',
                      color: theme => theme.palette.primary.main
                    } 
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Nút lưu */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={handleBack}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu phiếu giảm giá'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PhieugiamgiaCreatePage;
