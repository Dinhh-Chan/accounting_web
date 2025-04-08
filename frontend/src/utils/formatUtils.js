/**
 * Các hàm tiện ích để định dạng dữ liệu
 */

/**
 * Định dạng số tiền sang định dạng tiền tệ VND
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  /**
   * Định dạng số với số chữ số thập phân cụ thể
   * @param {number} number - Số cần định dạng
   * @param {number} decimals - Số chữ số thập phân (mặc định là 0)
   * @returns {string} Chuỗi đã định dạng
   */
  export const formatNumber = (number, decimals = 0) => {
    if (number === undefined || number === null) return '';
    
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  };
  
  /**
   * Định dạng phần trăm
   * @param {number} number - Số cần định dạng (đã ở dạng phần trăm, ví dụ: 12.5 cho 12.5%)
   * @param {number} decimals - Số chữ số thập phân (mặc định là 2)
   * @returns {string} Chuỗi đã định dạng
   */
  export const formatPercent = (number, decimals = 2) => {
    if (number === undefined || number === null) return '';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number / 100);
  };
  
  /**
   * Định dạng ngày tháng
   * @param {Date|string} date - Ngày cần định dạng
   * @returns {string} Chuỗi ngày đã định dạng (dd/mm/yyyy)
   */
  export const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };
  
  /**
   * Định dạng ngày giờ
   * @param {Date|string} date - Ngày giờ cần định dạng
   * @returns {string} Chuỗi ngày giờ đã định dạng (dd/mm/yyyy HH:MM)
   */
  export const formatDateTime = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  
  /**
   * Rút gọn văn bản nếu quá dài
   * @param {string} text - Văn bản cần rút gọn
   * @param {number} maxLength - Độ dài tối đa (mặc định: 50)
   * @returns {string} Văn bản đã rút gọn
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return `${text.substring(0, maxLength)}...`;
  };
  
  /**
   * Chuyển đổi giá trị null hoặc undefined thành chuỗi thay thế
   * @param {any} value - Giá trị cần kiểm tra
   * @param {string} placeholder - Chuỗi thay thế (mặc định: '-')
   * @returns {any} Giá trị gốc hoặc chuỗi thay thế
   */
  export const formatNullable = (value, placeholder = '-') => {
    if (value === null || value === undefined || value === '') {
      return placeholder;
    }
    return value;
  };
  
  /**
   * Định dạng số điện thoại
   * @param {string} phone - Số điện thoại cần định dạng
   * @returns {string} Số điện thoại đã định dạng
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Xóa tất cả các ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');
    
    // Kiểm tra độ dài và định dạng phù hợp
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
    }
    
    // Trả về số điện thoại gốc nếu không khớp với định dạng mong muốn
    return phone;
  };