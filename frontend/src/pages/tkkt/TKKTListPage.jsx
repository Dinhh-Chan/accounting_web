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
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import TKKTModal from '../../components/tkkt/TKKTModal';
import DeleteConfirmDialog from '../../components/tkkt/DeleteConfirmDialog';

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
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(3),
}));

const TKKTListPage = () => {
  const [tkktList, setTKKTList] = useState([]);
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // State cho filter theo cấp tài khoản
  const [filterLevel, setFilterLevel] = useState('');
  
  // State cho modal thêm/sửa tài khoản kế toán
  const [modalVisible, setModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Tải danh sách tài khoản kế toán
  const fetchTKKTList = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = API_ENDPOINTS.TKKT;
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };

      // Nếu có lọc theo cấp tài khoản
      if (filterLevel) {
        endpoint = `${API_ENDPOINTS.TKKT}/level/${filterLevel}`;
      }

      // Nếu có tìm kiếm
      if (searchTerm) {
        endpoint = `${API_ENDPOINTS.TKKT}/search`;
        params.keyword = searchTerm;
      }

      console.log('Gọi API:', endpoint, params);
      const response = await axiosInstance.get(endpoint, { params });
      
      // Xử lý response
      if (Array.isArray(response.data)) {
        setTKKTList(response.data);
        setTotalCount(response.data.length);
      } else if (response.data && Array.isArray(response.data.items)) {
        setTKKTList(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
      } else {
        console.warn('Dữ liệu không phải là mảng:', response.data);
        setTKKTList([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài khoản kế toán:', error);
      
      let errorMsg = 'Không thể tải danh sách tài khoản kế toán. Vui lòng thử lại sau.';
      
      if (error.response) {
        errorMsg = `Lỗi từ máy chủ: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'Không thể kết nối đến máy chủ.';
      } else {
        errorMsg = `Lỗi: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
      setTKKTList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterLevel]);

  useEffect(() => {
    fetchTKKTList();
  }, [fetchTKKTList]);

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
  
  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
      setPage(0);
      fetchTKKTList();
    }
  };

  const handleFilterChange = (event) => {
    setFilterLevel(event.target.value);
    setPage(0);
  };

  const handleAddClick = () => {
    setCurrentId(null);
    setModalVisible(true);
  };

  const handleEditClick = (item) => {
    setCurrentId(item.matk);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentId(null);
  };

  const handleModalSuccess = () => {
    fetchTKKTList();
    setSnackbar({
      open: true,
      message: currentId ? 'Cập nhật tài khoản kế toán thành công' : 'Thêm tài khoản kế toán mới thành công',
      severity: 'success'
    });
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteConfirmOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await axiosInstance.delete(`${API_ENDPOINTS.TKKT}/${selectedItem.matk}`);
      
      setSnackbar({
        open: true,
        message: 'Xóa tài khoản kế toán thành công',
        severity: 'success'
      });
      
      fetchTKKTList(); // Tải lại dữ liệu
      setDeleteConfirmOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản kế toán:', error);
      
      let errorMsg = 'Không thể xóa tài khoản kế toán. Vui lòng thử lại sau.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response) {
        errorMsg = `Lỗi từ máy chủ: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'Không thể kết nối đến máy chủ.';
      } else {
        errorMsg = `Lỗi: ${error.message}`;
      }
      
      setDeleteError(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDelete = () => {
    setDeleteConfirmOpen(false);
    setSelectedItem(null);
    setDeleteError(null);
  }

  const filterByLevel = (level) => {
    setFilterLevel(level);
    setPage(0);
  };

  const clearFilter = () => {
    setFilterLevel('');
    setSearchTerm('');
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Danh sách tài khoản kế toán
        </Typography>

        <SearchBox>
          <TextField
            placeholder="Tìm kiếm..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleSearchSubmit}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="filter-level-label">Cấp TK</InputLabel>
            <Select
              labelId="filter-level-label"
              id="filter-level"
              value={filterLevel}
              label="Cấp TK"
              onChange={handleFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">Cấp 1</MenuItem>
              <MenuItem value="2">Cấp 2</MenuItem>
              <MenuItem value="3">Cấp 3</MenuItem>
              <MenuItem value="4">Cấp 4</MenuItem>
              <MenuItem value="5">Cấp 5</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Thêm tài khoản
          </Button>
        </SearchBox>
      </HeaderBox>

      {(filterLevel || searchTerm) && (
        <Box sx={{ mb: 3 }}>
          {filterLevel && (
            <Chip
              label={`Lọc theo cấp: ${filterLevel}`}
              color="primary"
              onDelete={() => setFilterLevel('')}
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {searchTerm && (
            <Chip
              label={`Tìm kiếm: ${searchTerm}`}
              color="primary"
              onDelete={() => setSearchTerm('')}
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {(filterLevel || searchTerm) && (
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={clearFilter}
            >
              Xóa tất cả bộ lọc
            </Button>
          )}
        </Box>
      )}

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="15%">Mã tài khoản</TableCell>
              <TableCell>Tên tài khoản</TableCell>
              <TableCell align="center" width="15%">Cấp tài khoản</TableCell>
              <TableCell align="center" width={120}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : tkktList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    {filterLevel || searchTerm
                      ? 'Không tìm thấy dữ liệu phù hợp'
                      : 'Chưa có dữ liệu tài khoản kế toán'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tkktList.map((item) => (
                <TableRow key={item.matk} hover>
                  <TableCell>
                    <Chip
                      label={item.matk}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.tentk}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`Cấp ${item.captk}`}
                      color="default"
                      size="small"
                      onClick={() => filterByLevel(item.captk)}
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
          labelRowsPerPage="Dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </StyledTableContainer>

      {/* Modal TKKT */}
      <TKKTModal
        open={modalVisible}
        id={currentId}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tài khoản kế toán"
        content={selectedItem ? `Bạn có chắc chắn muốn xóa tài khoản "${selectedItem.matk} - ${selectedItem.tentk}"?` : ''}
        loading={deleteLoading}
        error={deleteError}
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

export default TKKTListPage;
