import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { styled } from '@mui/material/styles';
import SPDVModal from '../../components/spdv/SPDVModal';

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

const SPDVListPage = () => {
  const navigate = useNavigate();
  const [spdvs, setSPDVs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSPDV, setSelectedSPDV] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMaspdv, setCurrentMaspdv] = useState(null);

  useEffect(() => {
    fetchSPDVs();
  }, [page, rowsPerPage, searchTerm]);

  const fetchSPDVs = async () => {
    setLoading(true);
    try {
      let endpoint = API_ENDPOINTS.PRODUCTS;
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
      };

      // Nếu có từ khóa tìm kiếm, sử dụng endpoint search
      if (searchTerm.trim()) {
        endpoint = `${API_ENDPOINTS.PRODUCTS}/search`;
        params.keyword = searchTerm;
      }

      const response = await axiosInstance.get(endpoint, { params });
      console.log('SPDV data:', response.data);

      // Xử lý response tùy thuộc vào cấu trúc API
      if (Array.isArray(response.data)) {
        setSPDVs(response.data);
        setTotalCount(response.data.length);
      } else if (response.data && Array.isArray(response.data.items)) {
        setSPDVs(response.data.items);
        setTotalCount(response.data.total || response.data.items.length);
      } else {
        setSPDVs([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching SPDVs:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
        severity: 'error'
      });
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

  // Mở modal thêm sản phẩm mới
  const handleAddClick = () => {
    setCurrentMaspdv(null);
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa sản phẩm
  const handleEditClick = (maspdv) => {
    setCurrentMaspdv(maspdv);
    setModalVisible(true);
  };

  // Đóng modal
  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentMaspdv(null);
  };
  
  // Xử lý khi lưu sản phẩm thành công
  const handleModalSuccess = () => {
    fetchSPDVs();
    setSnackbar({
      open: true,
      message: currentMaspdv ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm mới thành công',
      severity: 'success'
    });
  };

  const handleViewClick = (maspdv) => {
    navigate(`/spdv/${maspdv}`);
  };

  const handleDeleteClick = (spdv) => {
    setSelectedSPDV(spdv);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSPDV) return;

    try {
      await axiosInstance.delete(`${API_ENDPOINTS.PRODUCTS}/${selectedSPDV.maspdv}`);
      setSnackbar({
        open: true,
        message: 'Xóa sản phẩm thành công',
        severity: 'success'
      });
      fetchSPDVs();
    } catch (error) {
      console.error('Error deleting SPDV:', error);
      setSnackbar({
        open: true,
        message: 'Không thể xóa sản phẩm. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedSPDV(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Danh sách sản phẩm/dịch vụ
        </Typography>

        <SearchBox>
          <TextField
            placeholder="Tìm kiếm sản phẩm..."
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
            sx={{ minWidth: 300 }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Thêm sản phẩm
          </Button>
        </SearchBox>
      </HeaderBox>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SP/DV</TableCell>
              <TableCell>Tên sản phẩm/dịch vụ</TableCell>
              <TableCell align="center">Đơn vị tính</TableCell>
              <TableCell align="right">Đơn giá</TableCell>
              <TableCell align="center" width={140}>Thao tác</TableCell>
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
            ) : spdvs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm/dịch vụ nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              spdvs.map((spdv) => (
                <TableRow key={spdv.maspdv} hover>
                  <TableCell>
                    <Chip
                      label={spdv.maspdv}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{spdv.tenspdv}</TableCell>
                  <TableCell align="center">{spdv.dvt}</TableCell>
                  <TableCell align="right">{formatCurrency(spdv.dongia)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewClick(spdv.maspdv)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(spdv.maspdv)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(spdv)}
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

      {/* Modal sản phẩm */}
      <SPDVModal
        open={modalVisible}
        maspdv={currentMaspdv}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedSPDV && `Bạn có chắc chắn muốn xóa sản phẩm "${selectedSPDV.tenspdv}" không? Hành động này không thể hoàn tác.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SPDVListPage;
