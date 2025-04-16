import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Fade,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemText,
  List,
  ListItemButton,
  Avatar
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Description as DescriptionIcon, 
  AccountBalance as AccountIcon,
  ReceiptLong as ReceiptIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import styled from '@emotion/styled';

const paymentMethods = [
  { value: 'Tiền mặt', label: 'Tiền mặt' },
  { value: 'Chuyển khoản', label: 'Chuyển khoản' },
  { value: 'Thẻ tín dụng', label: 'Thẻ tín dụng' },
];

const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const calculateTotal = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => total + (item.soluong * item.dongia || 0), 0);
};

const calculateVAT = (amount, vatRate) => {
  if (!amount || !vatRate) return 0;
  return amount * (vatRate / 100);
};

const calculateDiscount = (amount, discountRate) => {
  if (!amount || !discountRate) return 0;
  return amount * (discountRate / 100);
};

const calculateGrandTotal = (amount, vat, discount) => {
  return amount + vat - discount;
};

const PageContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
  overflow: 'visible',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderTopLeftRadius: theme.spacing(1.5),
  borderTopRightRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const TableContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
  '& .MuiTableHead-root .MuiTableRow-root': {
    backgroundColor: 'transparent',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    fontWeight: 600,
    borderBottom: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
  },
  '& .MuiTableBody-root .MuiTableCell-root': {
    padding: theme.spacing(1.5),
    border: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const SummaryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  '&:not(:last-child)': {
    borderBottom: `1px dashed ${theme.palette.divider}`,
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  fontSize: '1.8rem',
  color: theme.palette.primary.main,
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

const TotalAmount = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: theme.palette.success.dark,
}));

const SearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    paddingRight: 0,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const CustomerListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.primary.lighter || 'rgba(0, 127, 255, 0.08)',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.lighter || 'rgba(0, 127, 255, 0.12)',
    '&:hover': {
      backgroundColor: theme.palette.primary.lighter || 'rgba(0, 127, 255, 0.18)',
    },
  },
}));

const CustomerAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 32,
  height: 32,
  fontSize: '1rem',
}));

const CustomerSelectionField = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 1.5),
  minHeight: '40px',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '&:focus': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    outline: 'none',
  },
}));

const HoadonFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // State for invoice header
  const [invoice, setInvoice] = useState({
    soct: '',
    ngaylap: new Date(),
    makh: '',
    tenkh: '',
    hinhthuctt: 'Tiền mặt',
    tkno: '',
    diengiai: '',
    tkcodt: '',
    tkcothue: '',
    thuesuat: '10',
    tyleck: '0',
    tkchietkhau: '',
  });

  // State for invoice line items
  const [items, setItems] = useState([
    { maspdv: '', soluong: 1, dvt: '', dongia: 0 }
  ]);

  // State for customers and products
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add dialog state for customer selection
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) => 
      customer.makh.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.tenkh.toLowerCase().includes(customerSearch.toLowerCase())
  );
  
  // Computed values
  const subtotal = calculateTotal(items);
  const vatAmount = calculateVAT(subtotal, parseFloat(invoice.thuesuat));
  const discountAmount = calculateDiscount(subtotal, parseFloat(invoice.tyleck));
  const grandTotal = calculateGrandTotal(subtotal, vatAmount, discountAmount);

  useEffect(() => {
    loadFormData();
    
    if (isEdit) {
      fetchInvoice();
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customerResponse = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
      if (Array.isArray(customerResponse.data)) {
        setCustomers(customerResponse.data);
      } else if (customerResponse.data && Array.isArray(customerResponse.data.items)) {
        setCustomers(customerResponse.data.items);
      }
      
      // Fetch products
      const productResponse = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
      if (Array.isArray(productResponse.data)) {
        setProducts(productResponse.data);
      } else if (productResponse.data && Array.isArray(productResponse.data.items)) {
        setProducts(productResponse.data.items);
      }
      
      // Fetch accounts
      const accountResponse = await axiosInstance.get(API_ENDPOINTS.ACCOUNTS);
      if (Array.isArray(accountResponse.data)) {
        setAccounts(accountResponse.data);
      } else if (accountResponse.data && Array.isArray(accountResponse.data.items)) {
        setAccounts(accountResponse.data.items);
      }
      
    } catch (error) {
      console.error('Error loading form data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.INVOICE_DETAIL(id));
      console.log('Invoice detail response:', response.data);
      
      if (response.data) {
        // Check if the API returns an object with hoa_don or the invoice directly
        const invoiceData = response.data.hoa_don || response.data;
        const invoiceItems = response.data.chi_tiet || [];
        
        setInvoice({
          soct: invoiceData.soct,
          ngaylap: new Date(invoiceData.ngaylap),
          makh: invoiceData.makh,
          tenkh: invoiceData.tenkh,
          hinhthuctt: invoiceData.hinhthuctt,
          tkno: invoiceData.tkno,
          diengiai: invoiceData.diengiai,
          tkcodt: invoiceData.tkcodt,
          tkcothue: invoiceData.tkcothue,
          thuesuat: invoiceData.thuesuat.toString(),
          tyleck: invoiceData.tyleck ? invoiceData.tyleck.toString() : '0',
          tkchietkhau: invoiceData.tkchietkhau || '',
        });
        
        if (invoiceItems.length > 0) {
          setItems(invoiceItems);
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError(`Không thể tải thông tin hóa đơn: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenCustomerDialog = () => {
    setCustomerDialogOpen(true);
    
    // If we already have a selected customer, find it in the list to pre-select
    if (invoice.makh) {
      const customer = customers.find(c => c.makh === invoice.makh);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  };
  
  const handleCloseCustomerDialog = () => {
    setCustomerDialogOpen(false);
  };
  
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setInvoice(prev => ({
      ...prev,
      makh: customer.makh,
      tenkh: customer.tenkh
    }));
    handleCloseCustomerDialog();
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    // If product is selected, update related fields
    if (field === 'maspdv' && value) {
      const product = products.find(p => p.maspdv === value);
      if (product) {
        updatedItems[index].dvt = product.dvt;
        updatedItems[index].dongia = product.dongia;
      }
    }
    
    setItems(updatedItems);
  };

  const addNewItem = () => {
    setItems([...items, { maspdv: '', soluong: 1, dvt: '', dongia: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Prepare data for submission
    const formData = {
      ...invoice,
      tiendt: subtotal,
      tienthue: vatAmount,
      tienck: discountAmount,
      tientt: grandTotal,
      chi_tiet: items
    };
    
    // Log data for debugging
    console.log('Submitting invoice data:', formData);
    
    try {
      let response;
      if (isEdit) {
        response = await axiosInstance.put(
          API_ENDPOINTS.INVOICE_DETAIL(id),
          formData
        );
        console.log('Update invoice response:', response.data);
        setSuccess('Cập nhật hóa đơn thành công');
      } else {
        response = await axiosInstance.post(
          API_ENDPOINTS.INVOICES,
          formData
        );
        console.log('Create invoice response:', response.data);
        setSuccess('Tạo hóa đơn thành công');
      }
      
      // Navigate after success
      setTimeout(() => {
        navigate('/hoadon');
      }, 1500);
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lưu hóa đơn'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer>
      <FormTitle variant="h5">
        {isEdit ? 'Chỉnh sửa hóa đơn' : 'Tạo hóa đơn mới'}
      </FormTitle>
      
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }} variant="filled">
            {error}
          </Alert>
        </Fade>
      )}
      
      {success && (
        <Fade in={!!success}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }} variant="filled">
            {success}
          </Alert>
        </Fade>
      )}
      
      <form onSubmit={handleSubmit}>
        <StyledCard>
          <CardHeader>
            <DescriptionIcon />
            <Typography variant="h6" fontWeight={600}>
              Thông tin hóa đơn
            </Typography>
          </CardHeader>
          
          <StyledCardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số chứng từ"
                  name="soct"
                  value={invoice.soct}
                  onChange={handleInvoiceChange}
                  disabled={loading || isEdit}
                  placeholder="Để trống để tự động tạo"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Ngày lập"
                    value={invoice.ngaylap}
                    onChange={(newValue) => setInvoice({...invoice, ngaylap: newValue})}
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        required: true 
                      } 
                    }}
                    disabled={loading}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel 
                    shrink 
                    htmlFor="customer-selection" 
                    sx={{ 
                      backgroundColor: 'background.paper',
                      padding: '0 8px',
                      transform: 'translate(14px, -9px) scale(0.75)'
                    }}
                  >
                    Khách hàng *
                  </InputLabel>
                  <CustomerSelectionField
                    id="customer-selection"
                    onClick={handleOpenCustomerDialog}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleOpenCustomerDialog()}
                    sx={{ 
                      borderColor: invoice.makh ? 'primary.main' : 'divider',
                      ...(invoice.makh ? { borderWidth: '1px' } : {})
                    }}
                  >
                    {invoice.makh ? (
                      <>
                        <CustomerAvatar>
                          {invoice.tenkh.charAt(0).toUpperCase()}
                        </CustomerAvatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">
                            {invoice.tenkh}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Mã KH: {invoice.makh}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography>Chọn khách hàng</Typography>
                      </Box>
                    )}
                  </CustomerSelectionField>
                </FormControl>
                
                {/* Customer selection dialog */}
                <Dialog 
                  open={customerDialogOpen} 
                  onClose={handleCloseCustomerDialog}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Chọn khách hàng</Typography>
                      <IconButton edge="end" onClick={handleCloseCustomerDialog} aria-label="close">
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </DialogTitle>
                  <DialogContent dividers>
                    <SearchField
                      fullWidth
                      placeholder="Tìm kiếm khách hàng theo mã hoặc tên..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: customerSearch && (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="clear search"
                              onClick={() => setCustomerSearch('')}
                              edge="end"
                              size="small"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      size="small"
                    />
                    
                    <Box sx={{ height: '400px', overflow: 'auto' }}>
                      <List>
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <CustomerListItem
                              key={customer.makh}
                              selected={selectedCustomer?.makh === customer.makh}
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <CustomerAvatar>
                                {customer.tenkh.charAt(0).toUpperCase()}
                              </CustomerAvatar>
                              <ListItemText
                                primary={customer.tenkh}
                                secondary={`Mã KH: ${customer.makh}`}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </CustomerListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText 
                              primary="Không tìm thấy khách hàng"
                              secondary="Thử tìm kiếm với từ khóa khác"
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseCustomerDialog}>Đóng</Button>
                    <Button 
                      variant="contained" 
                      disabled={!selectedCustomer}
                      onClick={() => selectedCustomer && handleSelectCustomer(selectedCustomer)}
                    >
                      Xác nhận
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="hinhthuctt-label">Hình thức thanh toán</InputLabel>
                  <Select
                    labelId="hinhthuctt-label"
                    name="hinhthuctt"
                    value={invoice.hinhthuctt}
                    onChange={handleInvoiceChange}
                    label="Hình thức thanh toán"
                    disabled={loading}
                  >
                    {paymentMethods.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tổng tiền"
                  value={formatCurrency(grandTotal)}
                  InputProps={{ 
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Chip 
                          label="Tổng" 
                          size="small" 
                          color="primary" 
                          sx={{ height: '24px' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      fontWeight: 'bold',
                      color: 'success.main',
                      fontSize: '1.1rem',
                      textAlign: 'right'
                    } 
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Diễn giải"
                  name="diengiai"
                  value={invoice.diengiai}
                  onChange={handleInvoiceChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  placeholder="Nội dung thanh toán, ghi chú..."
                />
              </Grid>
            </Grid>
          </StyledCardContent>
        </StyledCard>
        
        <StyledCard>
          <CardHeader>
            <ReceiptIcon />
            <Typography variant="h6" fontWeight={600}>
              Chi tiết hóa đơn
            </Typography>
          </CardHeader>
          
          <StyledCardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="35%">Sản phẩm/Dịch vụ</TableCell>
                    <TableCell align="center" width="15%">Số lượng</TableCell>
                    <TableCell align="center" width="15%">Đơn vị tính</TableCell>
                    <TableCell align="right" width="15%">Đơn giá</TableCell>
                    <TableCell align="right" width="15%">Thành tiền</TableCell>
                    <TableCell width="5%"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          value={item.maspdv}
                          onChange={(e) => handleItemChange(index, 'maspdv', e.target.value)}
                          fullWidth
                          size="small"
                          required
                          disabled={loading}
                          variant="outlined"
                        >
                          {products.map((product) => (
                            <MenuItem key={product.maspdv} value={product.maspdv}>
                              {product.maspdv} - {product.tenspdv}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.soluong}
                          onChange={(e) => handleItemChange(index, 'soluong', parseFloat(e.target.value))}
                          size="small"
                          inputProps={{ min: 0, step: "0.01" }}
                          required
                          disabled={loading}
                          fullWidth
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={item.dvt}
                          onChange={(e) => handleItemChange(index, 'dvt', e.target.value)}
                          size="small"
                          required
                          disabled={loading}
                          fullWidth
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.dongia}
                          onChange={(e) => handleItemChange(index, 'dongia', parseFloat(e.target.value))}
                          size="small"
                          inputProps={{ min: 0, step: "0.01" }}
                          required
                          disabled={loading}
                          fullWidth
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="500">
                          {formatCurrency(item.soluong * item.dongia)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1 || loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <AddButton
              startIcon={<AddIcon />}
              onClick={addNewItem}
              disabled={loading}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mt: 2 }}
            >
              Thêm dòng
            </AddButton>
          </StyledCardContent>
        </StyledCard>
        
        <StyledCard>
          <CardHeader>
            <AccountIcon />
            <Typography variant="h6" fontWeight={600}>
              Thông tin thuế và tổng tiền
            </Typography>
          </CardHeader>
          
          <StyledCardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Thuế suất (%)"
                      name="thuesuat"
                      value={invoice.thuesuat}
                      onChange={handleInvoiceChange}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      size="small"
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tỷ lệ chiết khấu (%)"
                      name="tyleck"
                      value={invoice.tyleck}
                      onChange={handleInvoiceChange}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      size="small"
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="TK Chiết khấu"
                      name="tkchietkhau"
                      value={invoice.tkchietkhau}
                      onChange={handleInvoiceChange}
                      fullWidth
                      size="small"
                      disabled={loading || parseFloat(invoice.tyleck) === 0}
                    >
                      {accounts.map((account) => (
                        <MenuItem key={account.matk} value={account.matk}>
                          {account.matk} - {account.tentk}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={7}>
                <SummaryContainer elevation={0}>
                  <SummaryRow>
                    <Typography variant="body1" fontWeight={500}>Tiền hàng:</Typography>
                    <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
                  </SummaryRow>
                  
                  <SummaryRow>
                    <Typography variant="body1" fontWeight={500}>
                      Tiền thuế ({invoice.thuesuat}%):
                    </Typography>
                    <Typography variant="body1">{formatCurrency(vatAmount)}</Typography>
                  </SummaryRow>
                  
                  {parseFloat(invoice.tyleck) > 0 && (
                    <SummaryRow>
                      <Typography variant="body1" fontWeight={500}>
                        Chiết khấu ({invoice.tyleck}%):
                      </Typography>
                      <Typography variant="body1" color="error.main">
                        - {formatCurrency(discountAmount)}
                      </Typography>
                    </SummaryRow>
                  )}
                  
                  <SummaryRow sx={{ pt: 2 }}>
                    <Typography variant="h6" fontWeight={600}>Tổng thanh toán:</Typography>
                    <TotalAmount>{formatCurrency(grandTotal)}</TotalAmount>
                  </SummaryRow>
                </SummaryContainer>
              </Grid>
            </Grid>
          </StyledCardContent>
        </StyledCard>
        
        <ActionButtons>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/hoadon')}
            sx={{ minWidth: '120px' }}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ minWidth: '120px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Lưu hóa đơn'}
          </Button>
        </ActionButtons>
      </form>
    </PageContainer>
  );
};

export default HoadonFormPage; 