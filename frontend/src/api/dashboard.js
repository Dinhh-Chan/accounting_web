import api from './index';

/**
 * Lấy thống kê tổng quan cho dashboard
 * @param {Object} params - Các tham số lọc
 * @returns {Promise} - Promise chứa dữ liệu dashboard
 */
export const getDashboardStats = async (params = {}) => {
  try {
    const response = await api.get('/dashboard/stats', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Lấy dữ liệu doanh thu theo khoảng thời gian
 * @param {string} period - Khoảng thời gian (day, week, month, year)
 * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
 * @returns {Promise} - Promise chứa dữ liệu doanh thu
 */
export const getRevenueData = async (period = 'month', startDate = null, endDate = null) => {
  try {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/dashboard/revenue', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Lấy danh sách top sản phẩm
 * @param {number} limit - Số lượng sản phẩm cần lấy
 * @param {string} sortBy - Tiêu chí sắp xếp (revenue, quantity)
 * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
 * @returns {Promise} - Promise chứa danh sách sản phẩm
 */
export const getTopProducts = async (limit = 5, sortBy = 'revenue', startDate = null, endDate = null) => {
  try {
    const params = { limit, sortBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/dashboard/top-products', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Lấy danh sách top khách hàng
 * @param {number} limit - Số lượng khách hàng cần lấy
 * @param {string} sortBy - Tiêu chí sắp xếp (revenue, orders)
 * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
 * @returns {Promise} - Promise chứa danh sách khách hàng
 */
export const getTopCustomers = async (limit = 5, sortBy = 'revenue', startDate = null, endDate = null) => {
  try {
    const params = { limit, sortBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/dashboard/top-customers', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Lấy thống kê theo sản phẩm
 * @param {string} maspdv - Mã sản phẩm dịch vụ
 * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
 * @returns {Promise} - Promise chứa thống kê sản phẩm
 */
export const getProductStats = async (maspdv, startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(`/dashboard/product-stats/${maspdv}`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Lấy thống kê theo khách hàng
 * @param {string} makh - Mã khách hàng
 * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
 * @returns {Promise} - Promise chứa thống kê khách hàng
 */
export const getCustomerStats = async (makh, startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(`/dashboard/customer-stats/${makh}`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};