import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './DashboardPage.css';

// Icons components
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
  </svg>
);

const RevenueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InvoiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const OrderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DiscountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const ViewWeekIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MonthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const YearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Utils function
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

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

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  // Component thẻ thống kê
  const StatCard = ({ title, value, icon, growth, colorClass }) => (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${colorClass}`}>
          {icon}
        </div>
        {growth !== undefined && (
          <div className={`growth-indicator ${growth >= 0 ? 'positive' : 'negative'}`}>
            {growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            <span className="growth-value">
              {Math.abs(growth).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="stat-card-value">
        {typeof value === 'number' && value >= 1000 ? value.toLocaleString('vi-VN') : value}
      </div>
      <div className="stat-card-title">
        {title}
      </div>
    </div>
  );

  // Component tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-value">
            Doanh thu: {formatCurrency(payload[0].value)}
          </p>
        </div>
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Bảng điều khiển
        </h1>
        <p className="dashboard-subtitle">
          Tổng quan doanh thu và các số liệu kinh doanh
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(mockStats.totalRevenue)}
            icon={<RevenueIcon />}
            growth={mockStats.revenueGrowth}
            colorClass="primary"
          />
        </div>
        <div className="stat-item">
          <StatCard
            title="Tổng hóa đơn"
            value={mockStats.totalInvoices}
            icon={<InvoiceIcon />}
            growth={mockStats.invoiceGrowth}
            colorClass="info"
          />
        </div>
        <div className="stat-item">
          <StatCard
            title="Đơn hàng"
            value={mockStats.totalOrders}
            icon={<OrderIcon />}
            growth={mockStats.orderGrowth}
            colorClass="success"
          />
        </div>
        <div className="stat-item">
          <StatCard
            title="Phiếu giảm giá"
            value={mockStats.totalDiscounts}
            icon={<DiscountIcon />}
            growth={mockStats.discountGrowth}
            colorClass="warning"
          />
        </div>
      </div>

      <div className="chart-panel">
        <div className="chart-header">
          <div className="chart-title-container">
            <h2 className="chart-title">
              Doanh thu
            </h2>
            <p className="chart-subtitle">
              {`Biểu đồ thống kê doanh thu theo ${
                timeRange === 'day' ? 'ngày' : timeRange === 'week' ? 'tuần' : 
                timeRange === 'month' ? 'tháng' : 'năm'
              }`}
            </p>
          </div>
          
          <div className="chart-controls">
            <div className="chart-type-buttons">
              <button 
                onClick={() => handleChartTypeChange('line')} 
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
              >
                <TrendingUpIcon />
              </button>
              <button 
                onClick={() => handleChartTypeChange('bar')} 
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
              >
                <ViewWeekIcon />
              </button>
            </div>
            
            <div className="time-range-buttons">
              <button 
                onClick={() => handleRangeChange('day')} 
                className={`time-range-btn ${timeRange === 'day' ? 'active' : ''}`}
              >
                <DayIcon />
                <span>Ngày</span>
              </button>
              <button 
                onClick={() => handleRangeChange('week')} 
                className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
              >
                <ViewWeekIcon />
                <span>Tuần</span>
              </button>
              <button 
                onClick={() => handleRangeChange('month')} 
                className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
              >
                <MonthIcon />
                <span>Tháng</span>
              </button>
              <button 
                onClick={() => handleRangeChange('year')} 
                className={`time-range-btn ${timeRange === 'year' ? 'active' : ''}`}
              >
                <YearIcon />
                <span>Năm</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="chart-divider"></div>
        
        <div className="chart-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
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
                    stroke="#3b82f6"
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
                    fill="#3b82f6"
                    name="Doanh thu"
                    barSize={timeRange === 'year' ? 30 : 15}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="tabs-panel">
        <div className="tabs-header">
          <button
            className={`tab-btn ${tabValue === 0 ? 'active' : ''}`}
            onClick={() => handleTabChange(0)}
          >
            Top 5 sản phẩm
          </button>
          <button
            className={`tab-btn ${tabValue === 1 ? 'active' : ''}`}
            onClick={() => handleTabChange(1)}
          >
            Top 5 khách hàng
          </button>
          <button
            className={`tab-btn ${tabValue === 2 ? 'active' : ''}`}
            onClick={() => handleTabChange(2)}
          >
            Tình hình bán hàng
          </button>
        </div>

        <div className="tab-content">
          {tabValue === 0 && (
            <div>
              <h3 className="tab-title">
                Sản phẩm bán chạy nhất
              </h3>
              <p className="tab-subtitle">
                Top 5 sản phẩm có doanh thu cao nhất
              </p>
              <div className="product-list">
                <div className="product-item">
                  <div className="product-info">
                    <h4 className="product-name">iPhone 15 Pro Max</h4>
                    <p className="product-category">Điện thoại</p>
                  </div>
                  <div className="product-stats">
                    <p className="product-revenue">{formatCurrency(285000000)}</p>
                    <p className="product-orders">57 đơn hàng</p>
                  </div>
                </div>
                <div className="product-item">
                  <div className="product-info">
                    <h4 className="product-name">MacBook Pro M3</h4>
                    <p className="product-category">Laptop</p>
                  </div>
                  <div className="product-stats">
                    <p className="product-revenue">{formatCurrency(212000000)}</p>
                    <p className="product-orders">42 đơn hàng</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tabValue === 1 && (
            <div>
              <h3 className="tab-title">
                Khách hàng hàng đầu
              </h3>
              <p className="tab-subtitle">
                Top 5 khách hàng có giá trị đơn hàng cao nhất
              </p>
              <div className="customer-list">
                <div className="customer-item">
                  <div className="customer-info">
                    <h4 className="customer-name">Công ty TNHH ABC</h4>
                    <p className="customer-email">abc@company.com</p>
                  </div>
                  <div className="customer-stats">
                    <p className="customer-revenue">{formatCurrency(125000000)}</p>
                    <p className="customer-orders">12 đơn hàng</p>
                  </div>
                </div>
                <div className="customer-item">
                  <div className="customer-info">
                    <h4 className="customer-name">Công ty CP XYZ</h4>
                    <p className="customer-email">xyz@corp.vn</p>
                  </div>
                  <div className="customer-stats">
                    <p className="customer-revenue">{formatCurrency(98000000)}</p>
                    <p className="customer-orders">8 đơn hàng</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tabValue === 2 && (
            <div>
              <h3 className="tab-title">
                Tình hình bán hàng
              </h3>
              <p className="tab-subtitle">
                Tỷ lệ chuyển đổi và hiệu suất bán hàng
              </p>
              <div className="sales-metrics">
                <div className="metric-item">
                  <p className="metric-label">Tỷ lệ chuyển đổi</p>
                  <p className="metric-value">23.5%</p>
                </div>
                <div className="metric-item">
                  <p className="metric-label">Giá trị đơn trung bình</p>
                  <p className="metric-value">{formatCurrency(4500000)}</p>
                </div>
                <div className="metric-item">
                  <p className="metric-label">Tỷ lệ hoàn thành</p>
                  <p className="metric-value success">92.7%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;