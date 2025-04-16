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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import CustomerFormDialog from './CustomerFormPage';

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // State cho dialog thêm/sửa khách hàng
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Xây dựng query params
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Gọi API với params đúng cách
      const response = await axiosInstance.get(`${API_ENDPOINTS.CUSTOMERS}?${params.toString()}`);
      
      // Kiểm tra dữ liệu response
      console.log('Customer API response:', response.data);
      
      // Xử lý dữ liệu từ response
      if (response.data && Array.isArray(response.data)) {
        // Trường hợp API trả về mảng trực tiếp
        setCustomers(response.data);
        setTotalCount(response.data.length);
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        // Trường hợp API trả về cấu trúc phân trang
        setCustomers(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
      } else {
        // Trường hợp không có dữ liệu hoặc dữ liệu không đúng format
        setCustomers([]);
        setTotalCount(0);
        console.warn('Invalid data format from API:', response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setErrorMessage('Không thể tải danh sách khách hàng. Vui lòng thử lại sau.');
      setShowError(true);
      setCustomers([]);
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

  const handleAddClick = () => {
    setSelectedCustomerId(null);
    setOpenDialog(true);
  };

  const handleEditClick = (id) => {
    setSelectedCustomerId(id);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
      try {
        await axiosInstance.delete(API_ENDPOINTS.CUSTOMER_DETAIL(id));
        fetchCustomers(); // Gọi lại API để cập nhật danh sách
      } catch (error) {
        console.error('Error deleting customer:', error);
        setErrorMessage('Không thể xóa khách hàng. Vui lòng thử lại sau.');
        setShowError(true);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleFormSuccess = () => {
    // Gọi lại API để cập nhật danh sách sau khi thêm/sửa thành công
    fetchCustomers();
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  // Function để debug trực tiếp trong UI
  const debugFetchCustomers = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
      console.log('Debug response:', response.data);
      alert(`Đã nhận ${response.data ? 
        (Array.isArray(response.data) ? response.data.length : 
         (response.data.items ? response.data.items.length : 0)) 
        : 0} khách hàng từ API`);
    } catch (error) {
      console.error('Debug error:', error);
      alert(`Lỗi: ${error.message}`);
    }
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
          Danh sách khách hàng
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={debugFetchCustomers}
            sx={{ mr: 1 }}
          >
            Kiểm tra API
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Thêm mới
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          fullWidth
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
          sx={{ maxWidth: 500 }}
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã KH</TableCell>
                <TableCell>Tên khách hàng</TableCell>
                <TableCell>Mã số thuế</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell width={100}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow hover key={customer.makh || customer.id || Math.random()}>
                    <TableCell>{customer.makh}</TableCell>
                    <TableCell>{customer.tenkh}</TableCell>
                    <TableCell>{customer.masothue}</TableCell>
                    <TableCell>{customer.diachi}</TableCell>
                    <TableCell>{customer.sdt}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(customer.makh)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(customer.makh)}
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

      {/* Dialog thêm/sửa khách hàng */}
      <CustomerFormDialog
        open={openDialog}
        onClose={handleDialogClose}
        customerId={selectedCustomerId}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default CustomerListPage;
