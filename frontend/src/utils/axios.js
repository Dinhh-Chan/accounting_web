import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Lấy API_URL từ API_ENDPOINTS
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';

// Tạo instance axios với URL cơ sở từ cấu hình
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Không sử dụng credentials vì không cần gửi cookie
  withCredentials: false,
  // Thiết lập timeout để tránh chờ quá lâu
  timeout: 10000, // 10 giây
  // Cho phép chuyển hướng
  maxRedirects: 5
});

// Thêm request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    // Nếu có token, thêm vào header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log thông tin request cho debug
    console.debug(`${config.method.toUpperCase()} ${config.url}`, config.data || '');
    
    // Cấu hình để không chuyển đổi Date thành chuỗi ISO khi gửi dữ liệu
    console.log('Gửi request:', config.url, config.data);
    
    return config;
  },
  (error) => {
    // Xử lý lỗi request
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Thêm response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Có thể xử lý response ở đây nếu cần
    return response;
  },
  (error) => {
    // Xử lý lỗi response
    if (error.response) {
      // Yêu cầu được thực hiện và server trả về status code nằm ngoài 2xx
      console.error('Response error:', error.response.status, error.response.data);
      
      // Xử lý lỗi 401 Unauthorized
      if (error.response.status === 401) {
        // Xóa token nếu hết hạn
        localStorage.removeItem('token');
        
        // Chuyển hướng về trang đăng nhập
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Yêu cầu được thực hiện nhưng không nhận được phản hồi
      console.error('No response received:', error.request);
    } else {
      // Có lỗi khi thiết lập request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 