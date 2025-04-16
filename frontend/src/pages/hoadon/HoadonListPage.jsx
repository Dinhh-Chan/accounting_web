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
  Chip,
  styled,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  VisibilityOutlined as ViewIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(3),
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

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '300px',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'Chưa thanh toán':
      color = theme.palette.warning.main;
      break;
    case 'Đã thanh toán':
      color = theme.palette.success.main;
      break;
    case 'Hủy':
      color = theme.palette.error.main;
      break;
    default:
      color = theme.palette.info.main;
  }
  return {
    backgroundColor: color,
    color: '#fff',
    fontWeight: 500,
  };
});

const HoadonListPage = () => {
  const navigate = useNavigate();
  const [hoadons, setHoadons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null
  });

  useEffect(() => {
    fetchHoadons();
  }, [page, rowsPerPage, searchTerm]);

  const fetchHoadons = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      };
      
      const response = await axios.get(API_ENDPOINTS.INVOICES, { params });
      setHoadons(response.data.items || response.data);
      setTotalCount(response.data.totalItems || response.data.length);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hóa đơn:', error);
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

  const handleViewHoadon = (id) => {
    navigate(`/hoadon/${id}`);
  };

  const handleEditHoadon = (id) => {
    navigate(`/hoadon/edit/${id}`);
  };

  const handlePrintHoadon = (id) => {
    // Implement print functionality
    console.log(`In hóa đơn ${id}`);
  };

  const confirmDelete = (id, soct) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa hóa đơn',
      content: `Bạn có chắc chắn muốn xóa hóa đơn ${soct}? Thao tác này không thể hoàn tác.`,
      onConfirm: () => handleDeleteHoadon(id),
    });
  };

  const handleDeleteHoadon = async (id) => {
    try {
      await axios.delete(`${API_ENDPOINTS.INVOICES}/${id}`);
      fetchHoadons();
    } catch (error) {
      console.error('Lỗi khi xóa hóa đơn:', error);
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  return (
    <Box>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Danh sách hóa đơn
        </Typography>
        
        <SearchBox>
          <StyledTextField
            placeholder="Tìm kiếm hóa đơn..."
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
          />
          
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/hoadon/create')}
          >
            Tạo hóa đơn
          </ActionButton>
        </SearchBox>
      </HeaderBox>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã hoá đơn</TableCell>
              <TableCell>Ngày lập</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell align="right">Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : hoadons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có hóa đơn nào
                </TableCell>
              </TableRow>
            ) : (
              hoadons.map((hoadon) => (
                <TableRow key={hoadon.mahd} hover>
                  <TableCell>{hoadon.mahd}</TableCell>
                  <TableCell>{formatDate(hoadon.ngaylap)}</TableCell>
                  <TableCell>{hoadon.tenkh}</TableCell>
                  <TableCell align="right">{formatCurrency(hoadon.tongtien)}</TableCell>
                  <TableCell>
                    <StatusChip
                      label={hoadon.trangthai}
                      status={hoadon.trangthai}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" onClick={() => handleViewHoadon(hoadon.mahd)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => handleEditHoadon(hoadon.mahd)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="In hóa đơn">
                        <IconButton size="small" onClick={() => handlePrintHoadon(hoadon.mahd)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => confirmDelete(hoadon.mahd, hoadon.mahd)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </StyledTableContainer>
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        content={confirmDialog.content}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </Box>
  );
};

export default HoadonListPage;
