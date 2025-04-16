// Kiểm tra biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';

console.log('API Config:', { API_URL, API_VERSION });

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/${API_VERSION}/auth/login`,
  REGISTER: `${API_URL}/api/${API_VERSION}/auth/register`,
  ME: `${API_URL}/api/${API_VERSION}/users/me`,
  
  // Khách hàng
  CUSTOMERS: `${API_URL}/api/${API_VERSION}/khachhang`,
  CUSTOMER_DETAIL: (id) => `${API_URL}/api/${API_VERSION}/khachhang/${id}`,
  CUSTOMER_SEARCH: `${API_URL}/api/${API_VERSION}/khachhang/search`,
  
  // Sản phẩm dịch vụ
  PRODUCTS: `${API_URL}/api/${API_VERSION}/spdv`,
  PRODUCT_DETAIL: (id) => `${API_URL}/api/${API_VERSION}/spdv/${id}`,
  
  // Tài khoản kế toán
  ACCOUNTS: `${API_URL}/api/${API_VERSION}/tkkt`,
  ACCOUNT_DETAIL: (id) => `${API_URL}/api/${API_VERSION}/tkkt/${id}`,
  
  // Hóa đơn
  INVOICES: `${API_URL}/api/${API_VERSION}/hoadon`,
  INVOICE_DETAIL: (id) => `${API_URL}/api/${API_VERSION}/hoadon/${id}`,
  
  // Phiếu giảm giá
  VOUCHERS: `${API_URL}/api/${API_VERSION}/phieugiamgia`,
  VOUCHER_DETAIL: (id) => `${API_URL}/api/${API_VERSION}/phieugiamgia/${id}`,
  
  // Bảng giá
  PRICE_LIST: `${API_URL}/api/${API_VERSION}/banggia`,
  
  // Định mức chiết khấu - Sửa lại endpoint
  DISCOUNT_RATES: `${API_URL}/api/${API_VERSION}/dinhmucck`,
  // Thêm các hàm helper cho định mức chiết khấu
  DISCOUNT_RATE_DETAIL: (maspdv, date) => `${API_URL}/api/${API_VERSION}/dinhmucck/${maspdv}/${date}`,
  DISCOUNT_RATES_BY_PRODUCT: (maspdv) => `${API_URL}/api/${API_VERSION}/dinhmucck/product/${maspdv}`,
}; 