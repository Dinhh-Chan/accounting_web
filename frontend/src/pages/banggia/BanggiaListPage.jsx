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
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { format as formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import BanggiaModal from '../../components/banggia/BanggiaModal';

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


const BanggiaListPage = () => {
  const navigate = useNavigate();
  const [banggia, setBanggia] = useState([]);
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

  // State cho modal thêm/sửa bảng giá
  const [modalVisible, setModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);

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

  const fetchBangGia = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = API_ENDPOINTS.PRICE_LIST;
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };

      // Nếu có lọc theo sản phẩm
      if (productFilter) {
        endpoint = `${API_ENDPOINTS.PRICE_LIST}/product/${productFilter}`;
      }

      console.log('Đang tải dữ liệu từ:', endpoint);
      const response = await axiosInstance.get(endpoint, { params });
      console.log('Dữ liệu bảng giá:', response.data);
      
      // Xử lý response
      if (Array.isArray(response.data)) {
        setBanggia(response.data);
        setTotalCount(response.data.length);
      } else if (response.data && Array.isArray(response.data.items)) {
        setBanggia(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
      } else {
        console.warn('Dữ liệu không phải là mảng:', response.data);
        setBanggia([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách bảng giá:', error);
      
      let errorMsg = 'Không thể tải danh sách bảng giá. Vui lòng thử lại sau.';
      
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
      setBanggia([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, productFilter, setSnackbar]);

  useEffect(() => {
    fetchBangGia();
    fetchProducts();
  }, [fetchBangGia, fetchProducts]);

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
  const filteredItems = banggia.filter(item => {
    const product = products.find(p => p.maspdv === item.maspdv);
    const productName = product ? product.tenspdv : '';
    
    if (!searchTerm) return true;
    
    return (
      item.maspdv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddClick = () => {
    setCurrentId(null);
    setModalVisible(true);
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
      // Sử dụng URL phù hợp để xóa bảng giá
      let url;
      if (selectedItem.id || selectedItem._id) {
        // Nếu có ID, sử dụng nó
        const id = selectedItem.id || selectedItem._id;
        url = `${API_ENDPOINTS.PRICE_LIST}/${id}`;
      } else {
        // Nếu không có ID, sử dụng mã sản phẩm và ngày hiệu lực
        // Chuyển đổi ngày thành đối tượng Date nếu là chuỗi
        const ngayhl = typeof selectedItem.ngayhl === 'string' 
          ? new Date(selectedItem.ngayhl) 
          : selectedItem.ngayhl;
        
        url = `${API_ENDPOINTS.PRICE_LIST}/${selectedItem.maspdv}/${ngayhl.toISOString()}`;
      }
      
      console.log('Xóa bảng giá:', url);
      
      await axiosInstance.delete(url);
      
      setSnackbar({
        open: true,
        message: 'Xóa bảng giá thành công',
        severity: 'success'
      });
      
      fetchBangGia(); // Tải lại dữ liệu
    } catch (error) {
      console.error('Lỗi khi xóa bảng giá:', error);
      
      let errorMsg = 'Không thể xóa bảng giá. Vui lòng thử lại sau.';
      
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
    const id = item.id || item._id;
    setCurrentId(id || `${item.maspdv}/${item.ngayhl}`);
    setModalVisible(true);
  };

  // Xử lý khi đóng modal
  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentId(null);
  };

  // Xử lý khi lưu thành công từ modal
  const handleModalSuccess = () => {
    fetchBangGia();
    setSnackbar({
      open: true,
      message: currentId ? 'Cập nhật bảng giá thành công' : 'Thêm bảng giá mới thành công',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Danh sách bảng giá
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
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Thêm giá mới
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
              <TableCell align="right">Giá bán</TableCell>
              <TableCell align="center" width={150}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    {productFilter || searchTerm 
                      ? 'Không tìm thấy dữ liệu phù hợp' 
                      : 'Chưa có dữ liệu bảng giá'}
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
                        label={formatDate(new Date(item.ngayhl), "dd/MM/yyyy")}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(item.giaban)}
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
        <DialogTitle>Lọc bảng giá</DialogTitle>
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
        <DialogTitle>Xác nhận xóa bảng giá</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedItem && `Bạn có chắc chắn muốn xóa giá sản phẩm "${selectedItem.maspdv}" áp dụng từ ngày ${formatDate(new Date(selectedItem.ngayhl), "dd/MM/yyyy")}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Banggia */}
      <BanggiaModal
        open={modalVisible}
        id={currentId}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />

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

export default BanggiaListPage;
