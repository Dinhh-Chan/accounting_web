import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const HoadonListPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage, searchTerm, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Xây dựng query params
      const params = new URLSearchParams();
      params.append('skip', page * rowsPerPage);
      params.append('limit', rowsPerPage);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (startDate && endDate) {
        params.append('start_date', format(startDate, 'yyyy-MM-dd'));
        params.append('end_date', format(endDate, 'yyyy-MM-dd'));
      }
      
      // Gọi API với params đúng cách
      let endpoint = API_ENDPOINTS.INVOICES;
      if (startDate && endDate) {
        endpoint = API_ENDPOINTS.INVOICES + '/by-date-range';
      }
      
      const response = await axiosInstance.get(`${endpoint}?${params.toString()}`);
      
      // Kiểm tra dữ liệu response
      console.log('Invoice API response:', response.data);
      
      // Xử lý dữ liệu từ response
      if (response.data && Array.isArray(response.data)) {
        setInvoices(response.data);
        setTotalCount(response.data.length);
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        setInvoices(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
      } else {
        setInvoices([]);
        setTotalCount(0);
        console.warn('Invalid data format from API:', response.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setErrorMessage('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.');
      setShowError(true);
      setInvoices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = async (soct) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
      try {
        await axiosInstance.delete(API_ENDPOINTS.INVOICE_DETAIL(soct));
        fetchInvoices(); // Gọi lại API để cập nhật danh sách
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setErrorMessage('Không thể xóa hóa đơn. Vui lòng thử lại sau.');
        setShowError(true);
      }
    }
  };

  const handleAddClick = () => {
    navigate('/hoadon/create');
  };

  const handleViewClick = (soct) => {
    navigate(`/hoadon/${soct}`);
  };

  const handleEditClick = (soct) => {
    navigate(`/hoadon/edit/${soct}`);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleDateFilterClear = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Danh sách hóa đơn
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Tạo hóa đơn
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ width: { xs: '100%', sm: 250 } }}
        />
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <DatePicker
            label="Từ ngày"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
            slotProps={{ textField: { size: 'small' } }}
          />
          
          <DatePicker
            label="Đến ngày"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>
        
        {(startDate || endDate) && (
          <Button 
            variant="outlined" 
            onClick={handleDateFilterClear}
            size="small"
          >
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Số HĐ</TableCell>
                <TableCell>Ngày lập</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Hình thức TT</TableCell>
                <TableCell align="right">Tiền hàng</TableCell>
                <TableCell align="right">Thuế</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell width={120}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow hover key={invoice.soct}>
                    <TableCell>{invoice.soct}</TableCell>
                    <TableCell>
                      {new Date(invoice.ngaylap).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={invoice.makh}>
                        <span>{invoice.tenkh}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{invoice.hinhthuctt}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.tiendt)}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.tienthue)}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.tientt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleViewClick(invoice.soct)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(invoice.soct)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(invoice.soct)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : 'nhiều hơn ' + to}`}
        />
      </Paper>
    </Box>
  );
};

export default HoadonListPage; 