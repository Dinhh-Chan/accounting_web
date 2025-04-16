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
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  FilterAlt as FilterIcon,
  Percent as PercentIcon,
  TrendingUp as TrendingUpIcon,
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

const formatPercent = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(value);
};

const DinhmucckListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dinhmucck, setDinhmucck] = useState([]);
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
  
  // Chức năng lọc theo sản phẩm
  const [productFilter, setProductFilter] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        setProducts(response.data.items);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
  }, []);

  const fetchDinhmucck = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = API_ENDPOINTS.DISCOUNT_RATES;
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };

      // Nếu có lọc theo sản phẩm
      if (productFilter) {
        endpoint = API_ENDPOINTS.DISCOUNT_RATES_BY_PRODUCT(productFilter);
      }

      console.log('Đang tải dữ liệu từ:', endpoint);
      const response = await axiosInstance.get(endpoint, { params });
      console.log('Dữ liệu định mức chiết khấu:', response.data);
      
      // Xử lý response
      if (Array.isArray(response.data)) {
        setDinhmucck(response.data);
        setTotalCount(response.data.length);
        return response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        setDinhmucck(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
        return response.data.items;
      } else {
        console.warn('Dữ liệu không phải là mảng:', response.data);
        setDinhmucck([]);
        setTotalCount(0);
        return [];
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách định mức chiết khấu:', error);
      
      let errorMsg = 'Không thể tải danh sách định mức chiết khấu. Vui lòng thử lại sau.';
      
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
      setDinhmucck([]);
      setTotalCount(0);
      return []; // Trả về mảng rỗng trong trường hợp lỗi
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, productFilter, setSnackbar]);

  // Thêm hàm refresh dữ liệu có thể gọi bất cứ khi nào
  const refreshData = useCallback(() => {
    console.log('Làm mới dữ liệu định mức chiết khấu...');
    setLoading(true);
    fetchDinhmucck()
      .finally(() => {
        console.log('Đã làm mới xong dữ liệu.');
        setLoading(false);
      });
  }, [fetchDinhmucck]);

  useEffect(() => {
    fetchDinhmucck();
    fetchProducts();
  }, [fetchDinhmucck, fetchProducts]);

  // Kiểm tra location.state để xem có cần refresh data không
  useEffect(() => {
    if (location.state?.refreshData) {
      console.log('Phát hiện yêu cầu làm mới dữ liệu từ trang chỉnh sửa');
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

  // Hỗ trợ tìm kiếm theo tên sản phẩm khi filter chưa được áp dụng
  const filteredItems = dinhmucck.filter(item => {
    const product = products.find(p => p.maspdv === item.maspdv);
    const productName = product ? product.tenspdv : '';
    
    if (!searchTerm) return true;
    
    return (
      item.maspdv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddClick = () => {
    navigate('/dinhmucck/create');
  };

  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterApply = () => {
    setPage(0); // Reset về trang đầu tiên
    setFilterDialogOpen(false);
  };

  const handleFilterClear = () => {
    setProductFilter('');
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
      // Xử lý định dạng ngày
      let dateStr;
      try {
        // Phân tích chuỗi ngày từ dữ liệu
        let dateObj;
        
        if (typeof selectedItem.ngayhl === 'string') {
          if (selectedItem.ngayhl.includes('T')) {
            // Định dạng ISO
            dateObj = new Date(selectedItem.ngayhl);
          } else {
            // Định dạng không phải ISO, thử phân tích theo định dạng cụ thể
            const parts = selectedItem.ngayhl.split(/[-/]/);
            if (parts.length === 3) {
              // Kiểm tra xem định dạng có thể là dd/mm/yyyy hoặc yyyy-mm-dd
              if (parts[0].length === 4) {
                // yyyy-mm-dd
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              } else {
                // dd/mm/yyyy hoặc mm/dd/yyyy - thử cả hai
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (isNaN(dateObj.getTime())) {
                  dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
              }
            } else {
              throw new Error('Không thể phân tích chuỗi ngày');
            }
          }
        } else {
          // Đã là đối tượng Date
          dateObj = new Date(selectedItem.ngayhl);
        }
        
        if (isNaN(dateObj.getTime())) {
          throw new Error('Ngày không hợp lệ sau khi chuyển đổi');
        }
        
        // Định dạng chuẩn yyyy-MM-dd cho URL
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Lỗi xử lý ngày:', error);
        setSnackbar({
          open: true,
          message: 'Không thể xóa định mức chiết khấu do lỗi định dạng ngày.',
          severity: 'error'
        });
        setDeleteConfirmOpen(false);
        setSelectedItem(null);
        return;
      }
      
      // URL để xóa định mức chiết khấu
      const url = API_ENDPOINTS.DISCOUNT_RATE_DETAIL(selectedItem.maspdv, dateStr);
      
      console.log('Xóa định mức chiết khấu:', url);
      
      await axiosInstance.delete(url);
      
      setSnackbar({
        open: true,
        message: 'Xóa định mức chiết khấu thành công',
        severity: 'success'
      });
      
      fetchDinhmucck(); // Tải lại dữ liệu
    } catch (error) {
      console.error('Lỗi khi xóa định mức chiết khấu:', error);
      
      let errorMsg = 'Không thể xóa định mức chiết khấu. Vui lòng thử lại sau.';
      
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

  const handleEditClick = (item) => {
    // In ra thông tin chi tiết để debug
    console.log("Chi tiết item khi ấn nút sửa:", {
      maspdv: item.maspdv,
      ngayhl: item.ngayhl,
      'ngayhl type': typeof item.ngayhl,
      'Date converted': new Date(item.ngayhl),
      muctien: item.muctien,
      tiledk: item.tiledk,
      tyleck: item.tyleck
    });
    
    try {
      // Phân tích chuỗi ngày từ dữ liệu
      let dateObj;
      
      if (typeof item.ngayhl === 'string') {
        if (item.ngayhl.includes('T')) {
          // Định dạng ISO
          dateObj = new Date(item.ngayhl);
        } else {
          // Định dạng không phải ISO, thử phân tích theo định dạng cụ thể
          const parts = item.ngayhl.split(/[-/]/);
          if (parts.length === 3) {
            // Kiểm tra xem định dạng có thể là dd/mm/yyyy hoặc yyyy-mm-dd
            if (parts[0].length === 4) {
              // yyyy-mm-dd
              dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              // dd/mm/yyyy hoặc mm/dd/yyyy - thử cả hai
              dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              if (isNaN(dateObj.getTime())) {
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
              }
            }
          } else {
            throw new Error('Không thể phân tích chuỗi ngày');
          }
        }
      } else {
        // Đã là đối tượng Date
        dateObj = new Date(item.ngayhl);
      }
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Ngày không hợp lệ sau khi chuyển đổi');
      }
      
      // Định dạng chuẩn yyyy-MM-dd cho URL
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log("URL sẽ điều hướng đến:", `/dinhmucck/edit/${item.maspdv}/${dateStr}`);
      
      // Điều hướng đến trang chỉnh sửa
      navigate(`/dinhmucck/edit/${item.maspdv}/${dateStr}`);
    } catch (error) {
      console.error("Lỗi khi xử lý ngày:", error);
      // Hiển thị thông báo lỗi
      setSnackbar({
        open: true,
        message: 'Không thể chỉnh sửa mục này do định dạng ngày không hợp lệ. Chi tiết: ' + error.message,
        severity: 'error'
      });
    }
    
    // Khi ấn nút chỉnh sửa, kiểm tra xem item có trường tyleck hay không
    if (item.tiledk !== undefined && item.tyleck === undefined) {
      console.log("Cảnh báo: Dữ liệu có trường tiledk nhưng không có trường tyleck");
      console.log("Đang chuyển đổi tiledk thành tyleck để tương thích với backend");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Danh sách định mức chiết khấu
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
            Thêm định mức
          </Button>
        </SearchBox>
      </HeaderBox>

      {productFilter && (
        <Box sx={{ mb: 3 }}>
          <Chip
            label={`Lọc theo sản phẩm: ${productFilter}`}
            color="primary"
            onDelete={handleFilterClear}
            variant="outlined"
          />
        </Box>
      )}

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã sản phẩm</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell align="center">Ngày hiệu lực</TableCell>
              <TableCell align="right">Mức tiền</TableCell>
              <TableCell align="center">Tỷ lệ chiết khấu</TableCell>
              <TableCell align="center" width={150}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    {productFilter || searchTerm 
                      ? 'Không tìm thấy dữ liệu phù hợp' 
                      : 'Chưa có dữ liệu định mức chiết khấu'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => {
                // Tìm sản phẩm tương ứng để hiển thị tên
                const product = products.find(p => p.maspdv === item.maspdv);
                const productName = product ? product.tenspdv : 'Không xác định';
                
                return (
                  <TableRow key={`${item.maspdv}-${item.ngayhl}-${index}`} hover>
                    <TableCell>
                      <Chip
                        label={item.maspdv}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{productName}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<CalendarIcon fontSize="small" />}
                        label={formatDate(item.ngayhl)}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      <Chip
                        icon={<TrendingUpIcon fontSize="small" />}
                        label={formatCurrency(item.muctien)}
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<PercentIcon fontSize="small" />}
                        label={formatPercent((item.tyleck || item.tiledk) / 100)}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(item)}
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
                );
              })
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
          labelRowsPerPage="Dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </StyledTableContainer>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Lọc định mức chiết khấu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Sản phẩm/Dịch vụ"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 350, mb: 2 }}
            >
              {[
                <MenuItem key="all" value="">
                  <em>Tất cả sản phẩm</em>
                </MenuItem>,
                ...products.map((product) => (
                  <MenuItem key={product.maspdv} value={product.maspdv}>
                    {product.tenspdv}
                  </MenuItem>
                ))
              ]}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleFilterClear} color="error">Xóa bộ lọc</Button>
          <Button onClick={handleFilterApply} variant="contained">Áp dụng</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận xóa định mức chiết khấu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedItem && `Bạn có chắc chắn muốn xóa định mức chiết khấu của sản phẩm "${selectedItem.maspdv}" áp dụng từ ngày ${formatDate(selectedItem.ngayhl)}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default DinhmucckListPage;
