import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  ButtonGroup,
  Button,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as RevenueIcon,
  ReceiptLong as InvoiceIcon,
  LocalOffer as DiscountIcon,
  ShoppingCart as OrderIcon,
  CalendarToday as CalendarIcon,
  Today as DayIcon,
  DateRange as MonthIcon,
  ViewWeek as ViewWeekIcon,
  ViewQuilt as YearIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../../utils/formatUtils';

// Giả lập dữ liệu
const generateRevenueData = (period) => {
  if (period === 'day') {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      revenue: Math.floor(Math.random() * 5000000) + 500000,
    }));
  } else if (period === 'week') {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    return days.map(day => ({
      time: day,
      revenue: Math.floor(Math.random() * 20000000) + 5000000,
    }));
  } else if (period === 'month') {
    return Array.from({ length: 30 }, (_, i) => ({
      time: `${i + 1}`,
      revenue: Math.floor(Math.random() * 10000000) + 1000000,
    }));
  } else if (period === 'year') {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months.map(month => ({
      time: month,
      revenue: Math.floor(Math.random() * 100000000) + 20000000,
    }));
  }
  return [];
};

// Giả lập dữ liệu thống kê
const mockStats = {
  totalRevenue: 1256000000,
  totalInvoices: 278,
  totalOrders: 312,
  totalDiscounts: 45,
  revenueGrowth: 12.5,
  invoiceGrowth: 8.2,
  orderGrowth: 15.7,
  discountGrowth: -5.3,
  avgOrderValue: 4500000
};

const DashboardPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setData(generateRevenueData(timeRange));
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const handleRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Component thẻ thống kê
  const StatCard = ({ title, value, icon, growth, color }) => (
    <Card sx={{ 
      height: '100%', 
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 3
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${color}.light`,
              width: 48,
              height: 48,
              borderRadius: '50%',
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
          {growth !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: growth >= 0 ? 'success.light' : 'error.light',
                color: growth >= 0 ? 'success.main' : 'error.main',
                py: 0.5,
                px: 1,
                borderRadius: 1
              }}
            >
              {growth >= 0 ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
              <Typography variant="caption" fontWeight="bold">
                {Math.abs(growth).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
          {typeof value === 'number' && value >= 1000 ? value.toLocaleString('vi-VN') : value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  // Component tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 2 }}>
          <Typography variant="subtitle2">{`${label}`}</Typography>
          <Typography variant="body2" color="primary">
            Doanh thu: {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Format trục Y
  const formatYAxis = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} tr`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} k`;
    }
    return value;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bảng điều khiển
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tổng quan doanh thu và các số liệu kinh doanh
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(mockStats.totalRevenue)}
            icon={<RevenueIcon />}
            growth={mockStats.revenueGrowth}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng hóa đơn"
            value={mockStats.totalInvoices}
            icon={<InvoiceIcon />}
            growth={mockStats.invoiceGrowth}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đơn hàng"
            value={mockStats.totalOrders}
            icon={<OrderIcon />}
            growth={mockStats.orderGrowth}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Phiếu giảm giá"
            value={mockStats.totalDiscounts}
            icon={<DiscountIcon />}
            growth={mockStats.discountGrowth}
            color="warning"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Doanh thu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Biểu đồ thống kê doanh thu theo ${
                timeRange === 'day' ? 'ngày' : timeRange === 'week' ? 'tuần' : 
                timeRange === 'month' ? 'tháng' : 'năm'
              }`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ButtonGroup size="small" variant="outlined">
              <Button 
                onClick={() => handleChartTypeChange('line')} 
                variant={chartType === 'line' ? 'contained' : 'outlined'}
              >
                <TrendingUpIcon fontSize="small" />
              </Button>
              <Button 
                onClick={() => handleChartTypeChange('bar')} 
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
              >
                <ViewWeekIcon fontSize="small" />
              </Button>
            </ButtonGroup>
            
            <ButtonGroup size="small" variant="outlined">
              <Button 
                onClick={() => handleRangeChange('day')} 
                variant={timeRange === 'day' ? 'contained' : 'outlined'}
              >
                <DayIcon fontSize="small" sx={{ mr: 0.5 }} />
                Ngày
              </Button>
              <Button 
                onClick={() => handleRangeChange('week')} 
                variant={timeRange === 'week' ? 'contained' : 'outlined'}
              >
                <ViewWeekIcon fontSize="small" sx={{ mr: 0.5 }} />
                Tuần
              </Button>
              <Button 
                onClick={() => handleRangeChange('month')} 
                variant={timeRange === 'month' ? 'contained' : 'outlined'}
              >
                <MonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                Tháng
              </Button>
              <Button 
                onClick={() => handleRangeChange('year')} 
                variant={timeRange === 'year' ? 'contained' : 'outlined'}
              >
                <YearIcon fontSize="small" sx={{ mr: 0.5 }} />
                Năm
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ height: 400, width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    activeDot={{ r: 8 }}
                    name="Doanh thu"
                    strokeWidth={2}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill={theme.palette.primary.main}
                    name="Doanh thu"
                    barSize={timeRange === 'year' ? 30 : 15}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
          >
            <Tab label="Top 5 sản phẩm" />
            <Tab label="Top 5 khách hàng" />
            <Tab label="Tình hình bán hàng" />
          </Tabs>
        </Box>

        <Box sx={{ p: 1 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sản phẩm bán chạy nhất
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top 5 sản phẩm có doanh thu cao nhất
              </Typography>
              {/* Nội dung danh sách sản phẩm */}
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Khách hàng hàng đầu
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top 5 khách hàng có giá trị đơn hàng cao nhất
              </Typography>
              {/* Nội dung danh sách khách hàng */}
            </Box>
          )}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Tình hình bán hàng
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tỷ lệ chuyển đổi và hiệu suất bán hàng
              </Typography>
              {/* Nội dung tình hình bán hàng */}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardPage;