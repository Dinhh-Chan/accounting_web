import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  MonetizationOn as MoneyIcon,
  Straighten as MeasureIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'visible',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 40,
    height: 3,
    bottom: -8,
    left: 0,
    backgroundColor: theme.palette.primary.main,
  },
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
}));

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const SPDVDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy mã SPDV từ URL
  const [spdv, setSPDV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSPDV();
  }, [id]);

  // Tải thông tin sản phẩm
  const fetchSPDV = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
      console.log('Sản phẩm data:', response.data);
      setSPDV(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin sản phẩm:', error);
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/spdv/edit/${id}`);
  };

  // Nếu đang tải dữ liệu, hiển thị spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography>Đang tải thông tin sản phẩm...</Typography>
      </Box>
    );
  }

  // Nếu có lỗi hoặc không tìm thấy sản phẩm
  if (error || !spdv) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || `Không tìm thấy sản phẩm với mã ${id}`}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/spdv')}
          variant="contained"
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <PageHeader>
        <Box>
          <PageTitle variant="h5">Thông tin sản phẩm/dịch vụ</PageTitle>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Chi tiết về sản phẩm/dịch vụ
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/spdv')}
            variant="outlined"
          >
            Quay lại
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={handleEdit}
            variant="contained"
            color="primary"
          >
            Chỉnh sửa
          </Button>
        </Box>
      </PageHeader>

      <StyledCard>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" fontSize="small" />
              <Typography variant="h6" color="primary">
                {spdv.tenspdv}
              </Typography>
            </Box>
            <Chip 
              label={spdv.maspdv} 
              color="primary"
              variant="outlined"
              size="medium"
            />
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>Thông tin giá</Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0 }}>
                        <DetailLabel>Đơn giá:</DetailLabel>
                      </TableCell>
                      <TableCell sx={{ border: 'none', pr: 0 }}>
                        <DetailValue>{formatCurrency(spdv.dongia)}</DetailValue>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <MeasureIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>Thông tin đơn vị</Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0 }}>
                        <DetailLabel>Đơn vị tính:</DetailLabel>
                      </TableCell>
                      <TableCell sx={{ border: 'none', pr: 0 }}>
                        <DetailValue>{spdv.dvt}</DetailValue>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            
            {spdv.mota && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Mô tả</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {spdv.mota}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default SPDVDetailPage; 