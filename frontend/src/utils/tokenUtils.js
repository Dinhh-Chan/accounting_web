/**
 * Lưu token vào localStorage
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  /**
   * Lấy token từ localStorage
   * @returns {string|null} - JWT token hoặc null nếu không có
   */
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  /**
   * Xóa token khỏi localStorage
   */
  export const removeToken = () => {
    localStorage.removeItem('token');
  };
  
  /**
   * Kiểm tra token có tồn tại hay không
   * @returns {boolean} - true nếu có token, ngược lại false
   */
  export const hasToken = () => {
    return !!getToken();
  };
  
  /**
   * Giải mã thông tin từ token JWT
   * @param {string} token - JWT token
   * @returns {object|null} - Thông tin đã giải mã hoặc null nếu token không hợp lệ
   */
  export const decodeToken = (token) => {
    if (!token) return null;
    
    try {
      // Lấy phần payload của token (phần thứ 2)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Giải mã Base64
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  /**
   * Kiểm tra token đã hết hạn chưa
   * @param {string} token - JWT token
   * @returns {boolean} - true nếu token đã hết hạn, ngược lại false
   */
  export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const decoded = decodeToken(token);
      if (!decoded) return true;
      
      // Kiểm tra exp (thời gian hết hạn)
      const currentTime = Date.now() / 1000; // Đổi sang giây
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };