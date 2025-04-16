import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CalendarMonth as CalendarIcon,
  FilterAlt as FilterIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(3),
}));

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  try {
    // Xử lý chuỗi ngày có thời gian
    let cleanDateString = dateString;
    
    // Nếu là chuỗi ISO với phần thời gian, lấy chỉ phần ngày
    if (typeof dateString === 'string' && dateString.includes('T')) {
      cleanDateString = dateString.split('T')[0];
    }
    
    const date = new Date(cleanDateString);
    if (isNaN(date.getTime())) {
      console.warn('Không thể chuyển đổi ngày:', dateString);
      return dateString;
    }
    
    return format(date, 'dd/MM/yyyy', { locale: vi });
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error);
    return dateString;
  }
};

const PhieugiamgiaListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phieugiamgia, setPhieugiamgia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);

  const fetchPhieugiamgia = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = API_ENDPOINTS.VOUCHERS;
      let params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };

      // Áp dụng filter nếu có
      if (startDate && endDate) {
        endpoint = `${API_ENDPOINTS.VOUCHERS}/by-date-range`;
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (customerFilter) {
        endpoint = `${API_ENDPOINTS.VOUCHERS}/by-customer/${customerFilter}`;
      } else if (invoiceFilter) {
        endpoint = `${API_ENDPOINTS.VOUCHERS}/by-invoice/${invoiceFilter}`;
      }

      console.log('Đang tải dữ liệu từ:', endpoint);
      const response = await axiosInstance.get(endpoint, { params });
      console.log('Dữ liệu phiếu giảm giá:', response.data);
      
      // Xử lý response
      if (Array.isArray(response.data)) {
        setPhieugiamgia(response.data);
        setTotalCount(response.data.length);
        return response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        setPhieugiamgia(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
        return response.data.items;
      } else {
        console.warn('Dữ liệu không phải là mảng:', response.data);
        setPhieugiamgia([]);
        setTotalCount(0);
        return [];
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phiếu giảm giá:', error);
      
      let errorMsg = 'Không thể tải danh sách phiếu giảm giá. Vui lòng thử lại sau.';
      
      if (error.response) {
        console.error('Lỗi từ server:', error.response.status, error.response.data);
        errorMsg = `Lỗi từ máy chủ: ${error.response.status}`;
      } else if (error.request) {
        console.error('Không nhận được phản hồi:', error.request);
        errorMsg = 'Không thể kết nối đến máy chủ.';
      } else {
        console.error('Lỗi thiết lập request:', error.message);
        errorMsg = `Lỗi: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
      setPhieugiamgia([]);
      setTotalCount(0);
      return []; // Trả về mảng rỗng trong trường hợp lỗi
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, startDate, endDate, customerFilter, invoiceFilter]);

  // Thêm hàm refresh dữ liệu có thể gọi bất cứ khi nào
  const refreshData = useCallback(() => {
    console.log('Làm mới dữ liệu phiếu giảm giá...');
    setLoading(true);
    fetchPhieugiamgia()
      .finally(() => {
        console.log('Đã làm mới xong dữ liệu.');
        setLoading(false);
      });
  }, [fetchPhieugiamgia]);

  useEffect(() => {
    fetchPhieugiamgia();
  }, [fetchPhieugiamgia]);

  // Kiểm tra location.state để xem có cần refresh data không
  useEffect(() => {
    if (location.state?.refreshData) {
      console.log('Phát hiện yêu cầu làm mới dữ liệu từ trang chỉnh sửa');
      if (location.state?.lastUpdated) {
        console.log('Timestamp cập nhật:', new Date(location.state.lastUpdated).toLocaleString());
      }
      refreshData();
      // Xóa state để tránh refresh liên tục
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refreshData, navigate, location.pathname]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Hỗ trợ tìm kiếm cơ bản
  const filteredItems = phieugiamgia.filter(item => {
    if (!searchTerm) return true;
    
    return (
      item.sophieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.makh && item.makh.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.soct && item.soct.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleAddClick = () => {
    navigate('/phieugiamgia/create');
  };

  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterApply = () => {
    setFilterApplied(true);
    setPage(0); // Reset về trang đầu tiên
    setFilterDialogOpen(false);
  };

  const handleFilterClear = () => {
    setStartDate('');
    setEndDate('');
    setCustomerFilter('');
    setInvoiceFilter('');
    setFilterApplied(false);
    setPage(0);
    setFilterDialogOpen(false);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      // URL để xóa phiếu giảm giá
      const url = API_ENDPOINTS.VOUCHER_DETAIL(selectedItem.sophieu);
      
      console.log('Xóa phiếu giảm giá:', url);
      
      await axiosInstance.delete(url);
      
      setSnackbar({
        open: true,
        message: 'Xóa phiếu giảm giá thành công',
        severity: 'success'
      });
      
      fetchPhieugiamgia(); // Tải lại dữ liệu
    } catch (error) {
      console.error('Lỗi khi xóa phiếu giảm giá:', error);
      
      let errorMsg = 'Không thể xóa phiếu giảm giá. Vui lòng thử lại sau.';
      
      if (error.response) {
        console.error('Lỗi từ server:', error.response.status, error.response.data);
        
        if (typeof error.response.data === 'object' && error.response.data !== null) {
          if (error.response.data.detail) {
            if (typeof error.response.data.detail === 'string') {
              errorMsg = error.response.data.detail;
            } else if (Array.isArray(error.response.data.detail)) {
              // Nếu detail là một mảng, lấy thông báo từ phần tử đầu tiên
              const firstError = error.response.data.detail[0];
              if (typeof firstError === 'string') {
                errorMsg = firstError;
              } else if (typeof firstError === 'object' && firstError !== null) {
                errorMsg = firstError.msg || 'Lỗi dữ liệu không hợp lệ';
              }
            }
          } else {
            errorMsg = `Lỗi từ máy chủ: ${error.response.status}`;
          }
        } else {
          errorMsg = `Lỗi từ máy chủ: ${error.response.status}`;
        }
      } else if (error.request) {
        console.error('Không nhận được phản hồi:', error.request);
        errorMsg = 'Không thể kết nối đến máy chủ.';
      } else {
        console.error('Lỗi thiết lập request:', error.message);
        errorMsg = `Lỗi: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedItem(null);
    }
  };

  const handleViewDetails = (sophieu) => {
    navigate(`/phieugiamgia/${sophieu}`);
  };

  const handleEditClick = (sophieu) => {
    navigate(`/phieugiamgia/edit/${sophieu}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Danh sách phiếu giảm giá
        </Typography>

        <SearchBox>
          <TextField
            placeholder="Tìm kiếm..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />

          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
          >
            Lọc
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Làm mới
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Thêm phiếu giảm giá
          </Button>
        </SearchBox>
      </HeaderBox>

      {filterApplied && (
        <Box sx={{ mb: 3 }}>
          {startDate && endDate && (
            <Chip
              label={`Khoảng thời gian: ${formatDate(startDate)} - ${formatDate(endDate)}`}
              color="primary"
              onDelete={handleFilterClear}
              variant="outlined"
            />
          )}
          {customerFilter && (
            <Chip
              label={`Khách hàng: ${customerFilter}`}
              color="primary"
              onDelete={handleFilterClear}
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
          {invoiceFilter && (
            <Chip
              label={`Hóa đơn: ${invoiceFilter}`}
              color="primary"
              onDelete={handleFilterClear}
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      )}

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Số phiếu</TableCell>
              <TableCell>Ngày lập</TableCell>
              <TableCell>Mã khách hàng</TableCell>
              <TableCell>Số hóa đơn</TableCell>
              <TableCell align="right">Tiền doanh thu</TableCell>
              <TableCell align="right">Tiền thuế</TableCell>
              <TableCell align="right">Tổng tiền</TableCell>
              <TableCell align="center" width={150}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    {filterApplied || searchTerm 
                      ? 'Không tìm thấy dữ liệu phù hợp' 
                      : 'Chưa có phiếu giảm giá nào. Hãy thêm phiếu mới.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.sophieu}>
                  <TableCell>{item.sophieu}</TableCell>
                  <TableCell>{formatDate(item.ngaylap)}</TableCell>
                  <TableCell>{item.makh}</TableCell>
                  <TableCell>{item.soct}</TableCell>
                  <TableCell align="right">{formatCurrency(item.tiendt)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.tienthue)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.tientt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewDetails(item.sophieu)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditClick(item.sophieu)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(item)}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </StyledTableContainer>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa phiếu giảm giá {selectedItem?.sophieu}? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog bộ lọc */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Lọc phiếu giảm giá</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Lọc theo khoảng thời gian
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Hoặc</Divider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mã khách hàng"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                fullWidth
                disabled={!!startDate || !!endDate || !!invoiceFilter}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Hoặc</Divider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Số hóa đơn"
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                fullWidth
                disabled={!!startDate || !!endDate || !!customerFilter}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterClear}>Xóa bộ lọc</Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={handleFilterApply} 
            variant="contained" 
            color="primary"
            disabled={
              (!startDate || !endDate) && 
              !customerFilter && 
              !invoiceFilter
            }
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhieugiamgiaListPage;
