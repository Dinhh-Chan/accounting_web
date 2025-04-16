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
  Chip
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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { vi } from 'date-fns/locale';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { v4 as uuidv4 } from 'uuid';
import { format, parse } from 'date-fns';
import API_ENDPOINTS from '../../config/api';
import axios from 'axios';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';

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

const PhieugiamgiaEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  const { id } = useParams(); // id là số phiếu
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  
  // State cho form phiếu giảm giá
  const [formState, setFormState] = useState({
    sophieu: '',
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
  const [voucherItems, setVoucherItems] = useState([
    {
      id: uuidv4(),
      maspdv: '',
      soluong: 1,
      dongia: 0,
    },
  ]);
  
  // State cho lỗi validation
  const [errors, setErrors] = useState({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        // Fetch customers
        const customersResponse = await axios.get(API_ENDPOINTS.CUSTOMER_LIST, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setCustomers(customersResponse.data.items || []);
        
        // Fetch accounts
        const accountsResponse = await axios.get(API_ENDPOINTS.ACCOUNT_LIST, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setAccounts(accountsResponse.data.items || []);
        
        // Fetch products
        const productsResponse = await axios.get(API_ENDPOINTS.PRODUCT_SERVICE_LIST, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setProducts(productsResponse.data.items || []);
        
        if (id) {
          // If editing, fetch voucher data
          const voucherResponse = await axios.get(`${API_ENDPOINTS.DISCOUNT_VOUCHER_DETAIL}/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          const voucherData = voucherResponse.data;
          setFormState({
            sophieu: voucherData.sophieu || '',
            ngaylap: voucherData.ngaylap ? parse(voucherData.ngaylap, 'dd/MM/yyyy', new Date()) : new Date(),
            makh: voucherData.makh || '',
            soct: voucherData.soct || '',
            diengiai: voucherData.diengiai || '',
            tiendt: voucherData.tiendt || 0,
            thuesuat: voucherData.thuesuat || 0,
            tienthue: voucherData.tienthue || 0,
            tientt: voucherData.tientt || 0,
            tknogiamtru: voucherData.tknogiamtru || '',
            tkcott: voucherData.tkcott || '',
            tknothue: voucherData.tknothue || ''
          });
          
          if (voucherData.items && Array.isArray(voucherData.items)) {
            setVoucherItems(voucherData.items.map(item => ({
              ...item,
              id: uuidv4() // Add unique ID for UI purposes
            })));
          }
          
          // If customer is selected, fetch related invoices
          if (voucherData.makh) {
            const invoicesResponse = await axios.get(`${API_ENDPOINTS.INVOICE_LIST}?makh=${voucherData.makh}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            setInvoices(invoicesResponse.data.items || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({
          show: true,
          message: `Lỗi khi tải dữ liệu: ${error.response?.data?.message || error.message}`,
          severity: 'error'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, accessToken]);

  // Handle customer change and fetch related invoices
  const handleCustomerChange = async (event) => {
    const customerId = event.target.value;
    setFormState(prev => ({ ...prev, makh: customerId }));
    
    if (customerId) {
      try {
        const response = await axios.get(`${API_ENDPOINTS.INVOICE_LIST}?makh=${customerId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setInvoices(response.data.items || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setAlert({
          show: true,
          message: `Lỗi khi tải hóa đơn: ${error.response?.data?.message || error.message}`,
          severity: 'error'
        });
      }
    } else {
      setInvoices([]);
      setFormState(prev => ({ ...prev, soct: '' }));
    }
  };

  // Handle invoice selection
  const handleInvoiceChange = (event) => {
    const invoiceId = event.target.value;
    setFormState(prev => ({ ...prev, soct: invoiceId }));
    
    // Find the selected invoice and auto-fill related data
    if (invoiceId) {
      const selectedInvoice = invoices.find(inv => inv.soct === invoiceId);
      if (selectedInvoice) {
        // Auto-fill data from the invoice if needed
      }
    }
  };

  // Add new item to voucher
  const handleAddItem = () => {
    setVoucherItems(prev => [
      ...prev,
      {
        id: uuidv4(),
        maspdv: '',
        tensp: '',
        dvt: '',
        soluong: 1,
        giaban: 0,
        tien: 0
      }
    ]);
  };

  // Remove item from voucher
  const handleRemoveItem = (itemId) => {
    setVoucherItems(prev => prev.filter(item => item.id !== itemId));
    updateTotals();
  };

  // Handle item change
  const handleItemChange = (id, field, value) => {
    setVoucherItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };
          
          // If changing product, auto-fill related data
          if (field === 'maspdv') {
            const selectedProduct = products.find(p => p.maspdv === value);
            if (selectedProduct) {
              updatedItem = {
                ...updatedItem,
                tensp: selectedProduct.tensp,
                dvt: selectedProduct.dvt,
                giaban: selectedProduct.giaban || 0
              };
            }
          }
          
          // Calculate item total
          if (field === 'soluong' || field === 'giaban') {
            updatedItem.tien = updatedItem.soluong * updatedItem.giaban;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
    
    updateTotals();
  };

  // Update total amounts
  const updateTotals = () => {
    const tiendt = voucherItems.reduce((sum, item) => sum + (item.tien || 0), 0);
    const tienthue = tiendt * (formState.thuesuat / 100);
    const tientt = tiendt + tienthue;
    
    setFormState(prev => ({
      ...prev,
      tiendt,
      tienthue,
      tientt
    }));
  };

  // Handle tax rate change
  const handleTaxRateChange = (event) => {
    const taxRate = parseFloat(event.target.value) || 0;
    const tienthue = formState.tiendt * (taxRate / 100);
    
    setFormState(prev => ({
      ...prev,
      thuesuat: taxRate,
      tienthue,
      tientt: prev.tiendt + tienthue
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    const newErrors = {};
    if (!formState.sophieu) newErrors.sophieu = 'Vui lòng nhập số phiếu';
    if (!formState.makh) newErrors.makh = 'Vui lòng chọn khách hàng';
    if (!formState.diengiai) newErrors.diengiai = 'Vui lòng nhập diễn giải';
    if (!formState.tknogiamtru) newErrors.tknogiamtru = 'Vui lòng chọn tài khoản nợ giảm trừ';
    if (!formState.tkcott) newErrors.tkcott = 'Vui lòng chọn tài khoản có thanh toán';
    
    if (formState.thuesuat > 0 && !formState.tknothue) {
      newErrors.tknothue = 'Vui lòng chọn tài khoản nợ thuế';
    }
    
    if (voucherItems.length === 0) {
      setAlert({
        show: true,
        message: 'Vui lòng thêm ít nhất một mục giảm giá',
        severity: 'error'
      });
      return;
    }
    
    for (let i = 0; i < voucherItems.length; i++) {
      const item = voucherItems[i];
      if (!item.maspdv) {
        setAlert({
          show: true,
          message: `Vui lòng chọn sản phẩm/dịch vụ cho mục ${i + 1}`,
          severity: 'error'
        });
        return;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Prepare data for submission
    const voucherData = {
      ...formState,
      ngaylap: format(formState.ngaylap, 'dd/MM/yyyy'),
      items: voucherItems.map(({ id, ...item }) => item) // Remove UI-only fields
    };

    setLoading(true);
    try {
      let response;
      if (id) {
        // Update existing voucher
        response = await axios.put(`${API_ENDPOINTS.DISCOUNT_VOUCHER_DETAIL}/${id}`, voucherData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        // Create new voucher
        response = await axios.post(API_ENDPOINTS.DISCOUNT_VOUCHER_CREATE, voucherData, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }

      setAlert({
        show: true,
        message: id ? 'Cập nhật phiếu giảm giá thành công' : 'Tạo phiếu giảm giá thành công',
        severity: 'success'
      });

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/phieugiamgia', { state: { refreshData: true } });
      }, 1500);
    } catch (error) {
      console.error("Error saving voucher:", error);
      setAlert({
        show: true,
        message: `Lỗi: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({ ...alert, show: false });
  };

  // Handle back button
  const handleBack = () => {
    navigate('/phieugiamgia');
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader 
        title={id ? "Sửa phiếu giảm giá" : "Tạo phiếu giảm giá mới"} 
        icon={<SaveIcon />}
        backButton={
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
          >
            Quay lại
          </Button>
        }
      />
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Thông tin phiếu */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin phiếu
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số phiếu"
              value={formState.sophieu}
              onChange={(e) => setFormState({ ...formState, sophieu: e.target.value })}
              error={!!errors.sophieu}
              helperText={errors.sophieu}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
              <DatePicker
                label="Ngày lập"
                value={formState.ngaylap}
                onChange={(newValue) => setFormState({ ...formState, ngaylap: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth />}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Khách hàng"
              value={formState.makh}
              onChange={handleCustomerChange}
              error={!!errors.makh}
              helperText={errors.makh}
            >
              <MenuItem value="">-- Chọn khách hàng --</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.makh} value={customer.makh}>
                  {customer.tenkh}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Hóa đơn liên quan"
              value={formState.soct}
              onChange={handleInvoiceChange}
              disabled={!formState.makh || invoices.length === 0}
            >
              <MenuItem value="">-- Chọn hóa đơn --</MenuItem>
              {invoices.map((invoice) => (
                <MenuItem key={invoice.soct} value={invoice.soct}>
                  {invoice.soct} - {format(new Date(invoice.ngaylap), 'dd/MM/yyyy')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Diễn giải"
              value={formState.diengiai}
              onChange={(e) => setFormState({ ...formState, diengiai: e.target.value })}
              error={!!errors.diengiai}
              helperText={errors.diengiai}
            />
          </Grid>
          
          {/* Chi tiết giảm giá */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Chi tiết giảm giá</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleAddItem}
              >
                Thêm mục
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm/dịch vụ</TableCell>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>ĐVT</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {voucherItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Chưa có mục giảm giá. Vui lòng thêm mục.
                      </TableCell>
                    </TableRow>
                  ) : (
                    voucherItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={item.maspdv}
                            onChange={(e) => handleItemChange(item.id, 'maspdv', e.target.value)}
                          >
                            <MenuItem value="">-- Chọn sản phẩm --</MenuItem>
                            {products.map((product) => (
                              <MenuItem key={product.maspdv} value={product.maspdv}>
                                {product.maspdv} - {product.tensp}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>{item.tensp}</TableCell>
                        <TableCell>{item.dvt}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.soluong}
                            onChange={(e) => handleItemChange(item.id, 'soluong', Number(e.target.value))}
                            inputProps={{ min: 1, step: 1 }}
                            sx={{ width: '80px' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.giaban}
                            onChange={(e) => handleItemChange(item.id, 'giaban', Number(e.target.value))}
                            inputProps={{ min: 0 }}
                            sx={{ width: '120px' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {(item.tien || 0).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Thông tin kế toán */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin kế toán
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="TK Nợ giảm trừ"
              value={formState.tknogiamtru}
              onChange={(e) => setFormState({ ...formState, tknogiamtru: e.target.value })}
              error={!!errors.tknogiamtru}
              helperText={errors.tknogiamtru}
            >
              <MenuItem value="">-- Chọn tài khoản --</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.sotk} value={account.sotk}>
                  {account.sotk} - {account.tentk}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="TK Có thanh toán"
              value={formState.tkcott}
              onChange={(e) => setFormState({ ...formState, tkcott: e.target.value })}
              error={!!errors.tkcott}
              helperText={errors.tkcott}
            >
              <MenuItem value="">-- Chọn tài khoản --</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.sotk} value={account.sotk}>
                  {account.sotk} - {account.tentk}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Thuế suất (%)"
              value={formState.thuesuat}
              onChange={handleTaxRateChange}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          
          {formState.thuesuat > 0 && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="TK Nợ thuế"
                value={formState.tknothue}
                onChange={(e) => setFormState({ ...formState, tknothue: e.target.value })}
                error={!!errors.tknothue}
                helperText={errors.tknothue}
              >
                <MenuItem value="">-- Chọn tài khoản --</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.sotk} value={account.sotk}>
                    {account.sotk} - {account.tentk}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          
          {/* Tổng cộng */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tổng cộng
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tiền doanh thu"
              value={formState.tiendt.toLocaleString('vi-VN')}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tiền thuế"
              value={formState.tienthue.toLocaleString('vi-VN')}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tổng thanh toán"
              value={formState.tientt.toLocaleString('vi-VN')}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          
          {/* Nút lưu */}
          <Grid item xs={12} sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Đang lưu...
                </>
              ) : (
                'Lưu phiếu giảm giá'
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar 
        open={alert.show} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhieugiamgiaEditPage; 