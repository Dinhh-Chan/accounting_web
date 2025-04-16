import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '& > svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const LabelTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  minWidth: 150,
}));

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 đ';
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

const PhieugiamgiaDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id ở đây là sophieu
  const [voucherData, setVoucherData] = useState(null);
  const [voucherItems, setVoucherItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVoucherDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.VOUCHER_DETAIL(id));
      console.log('Chi tiết phiếu giảm giá:', response.data);
      
      if (response.data) {
        // Tách dữ liệu phiếu và chi tiết phiếu từ response
        if (response.data.phieu_giam_gia) {
          setVoucherData(response.data.phieu_giam_gia);
        } else {
          setVoucherData(response.data);
        }
        
        if (response.data.chi_tiet && Array.isArray(response.data.chi_tiet)) {
          setVoucherItems(response.data.chi_tiet);
        }
      } else {
        setError('Không tìm thấy dữ liệu phiếu giảm giá');
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết phiếu giảm giá:', error);
      setError('Không thể tải thông tin phiếu giảm giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVoucherDetails();
  }, [fetchVoucherDetails]);

  const handleEdit = () => {
    navigate(`/phieugiamgia/edit/${id}`);
  };

  const handleDelete = () => {
    // Hiển thị xác nhận xóa (có thể sử dụng context hoặc state để quản lý dialog)
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu giảm giá ${id}?`)) {
      deleteVoucher();
    }
  };

  const deleteVoucher = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(API_ENDPOINTS.VOUCHER_DETAIL(id));
      navigate('/phieugiamgia', { 
        state: { refreshData: true },
        replace: true
      });
    } catch (error) {
      console.error('Lỗi khi xóa phiếu giảm giá:', error);
      setError('Không thể xóa phiếu giảm giá. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Chức năng in phiếu - có thể chuyển đến trang riêng để in
    window.print();
  };
  
  const handleBack = () => {
    navigate('/phieugiamgia');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  if (!voucherData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>Không tìm thấy dữ liệu phiếu giảm giá</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <HeaderBox>
        <Box>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Chi tiết phiếu giảm giá
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Thông tin chi tiết của phiếu giảm giá
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            In phiếu
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Xóa
          </Button>
        </Box>
      </HeaderBox>

      <Grid container spacing={3} className="print-content">
        {/* Thông tin chung về phiếu */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2" fontWeight={600} color="primary">
                  Thông tin phiếu
                </Typography>
                <Chip 
                  label={`Số phiếu: ${voucherData.sophieu}`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoRow>
                    <CalendarIcon fontSize="small" />
                    <LabelTypography variant="body2">Ngày lập:</LabelTypography>
                    <Typography variant="body1">{formatDate(voucherData.ngaylap)}</Typography>
                  </InfoRow>
                  
                  <InfoRow>
                    <PersonIcon fontSize="small" />
                    <LabelTypography variant="body2">Mã khách hàng:</LabelTypography>
                    <Typography variant="body1">{voucherData.makh}</Typography>
                  </InfoRow>
                  
                  <InfoRow>
                    <ReceiptIcon fontSize="small" />
                    <LabelTypography variant="body2">Số hóa đơn:</LabelTypography>
                    <Typography variant="body1">{voucherData.soct}</Typography>
                  </InfoRow>
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoRow>
                    <AccountBalanceIcon fontSize="small" />
                    <LabelTypography variant="body2">TK nợ giảm trừ:</LabelTypography>
                    <Typography variant="body1">{voucherData.tknogiamtru}</Typography>
                  </InfoRow>
                  
                  <InfoRow>
                    <AccountBalanceIcon fontSize="small" />
                    <LabelTypography variant="body2">TK có thanh toán:</LabelTypography>
                    <Typography variant="body1">{voucherData.tkcott}</Typography>
                  </InfoRow>
                  
                  <InfoRow>
                    <AccountBalanceIcon fontSize="small" />
                    <LabelTypography variant="body2">TK nợ thuế:</LabelTypography>
                    <Typography variant="body1">{voucherData.tknothue}</Typography>
                  </InfoRow>
                </Grid>
                <Grid item xs={12}>
                  <InfoRow>
                    <LabelTypography variant="body2">Diễn giải:</LabelTypography>
                    <Typography variant="body1">{voucherData.diengiai || "Không có diễn giải"}</Typography>
                  </InfoRow>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Bảng tổng hợp */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight={600} color="primary" sx={{ mb: 3 }}>
                Thông tin tài chính
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Tổng tiền doanh thu:</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatCurrency(voucherData.tiendt)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Thuế suất:</Typography>
                  <Typography variant="body1" fontWeight={500}>{voucherData.thuesuat}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Tiền thuế:</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatCurrency(voucherData.tienthue)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={600}>Tổng tiền:</Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">{formatCurrency(voucherData.tientt)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Chi tiết phiếu */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight={600} color="primary" sx={{ mb: 3 }}>
                Chi tiết phiếu giảm giá
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {voucherItems.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Mã sản phẩm</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell align="right">Đơn giá</TableCell>
                        <TableCell align="right">Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {voucherItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.maspdv}</TableCell>
                          <TableCell>{item.soluong}</TableCell>
                          <TableCell align="right">{formatCurrency(item.dongia)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.soluong * item.dongia)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                          Tổng cộng:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(voucherItems.reduce((sum, item) => sum + (item.soluong * item.dongia), 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Không có chi tiết phiếu giảm giá</Alert>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PhieugiamgiaDetailsPage;
