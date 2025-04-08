import React from 'react';
import { Box, Typography, Grid, Divider, Chip, useTheme } from '@mui/material';
import { 
  LocalAtm as MoneyIcon, 
  Receipt as ReceiptIcon, 
  Summarize as SummarizeIcon, 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatUtils';

const SalesSummary = ({ 
  totalRevenue = 0, 
  totalInvoices = 0, 
  avgOrderValue = 0, 
  period = 'tháng này',
  revenueGrowth,
  invoiceGrowth 
}) => {
  const theme = useTheme();

  // Hiển thị tỉ lệ tăng trưởng nếu có
  const renderGrowth = (value) => {
    if (value === undefined || value === null) return null;
    
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const color = isPositive ? theme.palette.success.main : theme.palette.error.main;
    
    return (
      <Chip
        icon={<Icon style={{ color }} />}
        label={`${isPositive ? '+' : ''}${value.toFixed(1)}%`}
        size="small"
        sx={{
          bgcolor: isPositive ? 'success.light' : 'error.light',
          color: isPositive ? 'success.main' : 'error.main',
          fontWeight: 'bold',
          ml: 1
        }}
      />
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <SummarizeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Tổng quan bán hàng {period}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Thống kê doanh thu và đơn hàng trong {period}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MoneyIcon sx={{ color: 'primary.main', mr: 1.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tổng doanh thu
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(totalRevenue)}
                </Typography>
                {renderGrowth(revenueGrowth)}
              </Box>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ReceiptIcon sx={{ color: 'info.main', mr: 1.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tổng đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  {totalInvoices.toLocaleString('vi-VN')}
                </Typography>
                {renderGrowth(invoiceGrowth)}
              </Box>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MoneyIcon sx={{ color: 'success.main', mr: 1.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Giá trị đơn hàng trung bình
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(avgOrderValue)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
        Số liệu được cập nhật vào lúc {new Date().toLocaleTimeString('vi-VN')}
      </Typography>
    </Box>
  );
};

export default SalesSummary;