/**
 * Các hàm tiện ích để định dạng dữ liệu
 */

/**
 * Định dạng số thành chuỗi tiền tệ VND
 * @param {number} value - Giá trị cần định dạng
 * @param {string} currency - Ký hiệu tiền tệ (mặc định: đ)
 * @returns {string} Chuỗi đã định dạng (ví dụ: 1,234,567 đ)
 */
export const formatCurrency = (value, currency = 'đ') => {
  if (value === null || value === undefined) return '0 ' + currency;
  return new Intl.NumberFormat('vi-VN').format(value) + ' ' + currency;
};

/**
 * Định dạng ngày thành chuỗi ngày/tháng/năm
 * @param {Date|string} date - Đối tượng Date hoặc chuỗi ngày
 * @returns {string} Chuỗi đã định dạng (ví dụ: 31/12/2023)
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng ngày giờ thành chuỗi ngày/tháng/năm giờ:phút
 * @param {Date|string} date - Đối tượng Date hoặc chuỗi ngày
 * @returns {string} Chuỗi đã định dạng (ví dụ: 31/12/2023 15:30)
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}; 