import { useState, useEffect } from 'react';

/**
 * Custom hook để lấy dữ liệu tổng quan cho Dashboard
 * @param {string} period - Khoảng thời gian (day, week, month, year)
 * @returns {Object} Dữ liệu dashboard, trạng thái loading và lỗi
 */
export const useDashboardData = (period = 'month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Trong môi trường thực tế, đây sẽ là API call
        // await api.get('/dashboard/stats')
        
        // Giả lập API call với dữ liệu mẫu
        setTimeout(() => {
          // Dữ liệu mẫu
          const mockData = {
            totalCustomers: 158,
            totalProducts: 97,
            totalInvoices: 243,
            totalDiscounts: 42,
            totalRevenue: 1256000000,
            avgOrderValue: 5000000,
            revenueByMonth: [
              { month: 'T1', value: 95000000 },
              { month: 'T2', value: 110000000 },
              { month: 'T3', value: 105000000 },
              { month: 'T4', value: 120000000 },
              { month: 'T5', value: 125000000 },
              { month: 'T6', value: 135000000 },
              { month: 'T7', value: 115000000 },
              { month: 'T8', value: 130000000 },
              { month: 'T9', value: 145000000 },
              { month: 'T10', value: 155000000 },
              { month: 'T11', value: 165000000 },
              { month: 'T12', value: 180000000 },
            ],
            topProducts: [
              { name: 'Sản phẩm A', revenue: 352000000, quantity: 58 },
              { name: 'Sản phẩm B', revenue: 287000000, quantity: 42 },
              { name: 'Sản phẩm C', revenue: 254000000, quantity: 35 },
              { name: 'Sản phẩm D', revenue: 198000000, quantity: 27 },
              { name: 'Sản phẩm E', revenue: 156000000, quantity: 21 },
            ],
            topCustomers: [
              { makh: 'KH001', name: 'Công ty X', revenue: 487000000, invoices: 15 },
              { makh: 'KH012', name: 'Công ty Y', revenue: 354000000, invoices: 12 },
              { makh: 'KH045', name: 'Công ty Z', revenue: 298000000, invoices: 8 },
              { makh: 'KH023', name: 'Công ty W', revenue: 225000000, invoices: 7 },
              { makh: 'KH037', name: 'Công ty V', revenue: 192000000, invoices: 6 },
            ],
            revenueGrowth: 12.5,
            customerGrowth: 8.2,
            productGrowth: 3.7,
            invoiceGrowth: 15.3
          };

          setData(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  return { data, loading, error };
};

/**
 * Custom hook để lấy dữ liệu chi tiết về doanh thu
 * @param {string} period - Khoảng thời gian (day, week, month, year)
 * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
 * @returns {Object} Dữ liệu doanh thu, trạng thái loading và lỗi
 */
export const useRevenueData = (period = 'month', startDate = null, endDate = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Trong môi trường thực tế, đây sẽ là API call với params
        // await api.get('/dashboard/revenue', { params: { period, startDate, endDate } })
        
        // Giả lập API call với dữ liệu mẫu
        setTimeout(() => {
          let mockData = [];
          
          if (period === 'day') {
            // Dữ liệu theo giờ trong ngày
            mockData = Array.from({ length: 24 }, (_, i) => ({
              time: `${i}h`,
              revenue: Math.floor(Math.random() * 5000000) + 500000,
            }));
          } else if (period === 'week') {
            // Dữ liệu theo ngày trong tuần
            const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
            mockData = days.map(day => ({
              time: day,
              revenue: Math.floor(Math.random() * 20000000) + 5000000,
            }));
          } else if (period === 'month') {
            // Dữ liệu theo ngày trong tháng
            mockData = Array.from({ length: 30 }, (_, i) => ({
              time: `${i + 1}`,
              revenue: Math.floor(Math.random() * 10000000) + 1000000,
            }));
          } else if (period === 'year') {
            // Dữ liệu theo tháng trong năm
            const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            mockData = months.map(month => ({
              time: month,
              revenue: Math.floor(Math.random() * 100000000) + 20000000,
            }));
          }

          setData(mockData);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period, startDate, endDate]);

  return { data, loading, error };
};