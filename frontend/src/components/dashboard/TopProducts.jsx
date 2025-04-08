import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  LinearProgress, 
  Grid, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  LocalAtm as RevenueIcon,
  Category as ProductIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatUtils';

const TopProducts = ({ products = [], onViewProduct, loading = false }) => {
  const theme = useTheme();

  // Tìm giá trị doanh thu cao nhất để tính tỷ lệ
  const maxRevenue = products.length > 0 ? 
    Math.max(...products.map(product => product.revenue)) : 0;

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          Đang tải dữ liệu...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <ProductIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          Không có dữ liệu sản phẩm
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sản phẩm</TableCell>
              <TableCell align="right">Doanh thu</TableCell>
              <TableCell align="right">SL</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => {
              // Tính phần trăm so với giá trị cao nhất
              const progressValue = maxRevenue ? (product.revenue / maxRevenue) * 100 : 0;
              
              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {product.maspdv || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(product.revenue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {product.quantity?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" padding="none">
                    {onViewProduct && (
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small" 
                          onClick={() => onViewProduct(product)}
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, px: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tỷ lệ doanh thu
        </Typography>
        
        {products.map((product, index) => {
          // Tính phần trăm so với giá trị cao nhất
          const progressValue = maxRevenue ? (product.revenue / maxRevenue) * 100 : 0;
          
          return (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" fontWeight="medium" noWrap sx={{ maxWidth: '70%' }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progressValue)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                sx={{ 
                  height: 6, 
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TopProducts;