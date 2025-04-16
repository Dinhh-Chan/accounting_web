/**
 * Định dạng ngày từ chuỗi ISO hoặc đối tượng Date thành định dạng ngày Việt Nam
 * @param {string|Date} date - Chuỗi ISO hoặc đối tượng Date
 * @param {boolean} includeTime - Có hiển thị giờ hay không
 * @returns {string} Chuỗi ngày đã định dạng
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  let formattedDate = `${day}/${month}/${year}`;
  
  if (includeTime) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    formattedDate += ` ${hours}:${minutes}`;
  }
  
  return formattedDate;
};

/**
 * Định dạng số thành định dạng tiền tệ VND
 * @param {number|string} amount - Số tiền cần định dạng
 * @param {boolean} includeCurrency - Có hiển thị ký hiệu tiền tệ hay không
 * @returns {string} Chuỗi tiền tệ đã định dạng
 */
export const formatCurrency = (amount, includeCurrency = true) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '';
  }
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: includeCurrency ? 'currency' : 'decimal',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};

/**
 * Định dạng số nhà điện thoại Việt Nam
 * @param {string} phoneNumber - Số điện thoại cần định dạng
 * @returns {string} Số điện thoại đã định dạng
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Loại bỏ tất cả các ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Định dạng số điện thoại dựa vào độ dài
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  // Trả về số điện thoại gốc nếu không phù hợp với định dạng
  return phoneNumber;
};

/**
 * Cắt ngắn chuỗi với độ dài tối đa và thêm dấu ba chấm
 * @param {string} text - Chuỗi cần cắt ngắn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Chuỗi đã cắt ngắn
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Chuyển đổi từ số thành chữ đọc số tiền bằng tiếng Việt
 * @param {number|string} number - Số tiền cần chuyển đổi
 * @returns {string} Chuỗi chữ đọc số tiền
 */
export const numberToVietnameseWords = (number) => {
  if (isNaN(number) || number === null || number === undefined) return '';
  
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const positions = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  
  // Hàm đọc số có 3 chữ số
  const readThreeDigits = (number) => {
    const hundred = Math.floor(number / 100);
    const remainder = number % 100;
    const ten = Math.floor(remainder / 10);
    const unit = remainder % 10;
    
    let result = '';
    
    if (hundred > 0) {
      result += `${units[hundred]} trăm `;
    }
    
    if (ten > 0) {
      if (ten === 1) {
        result += 'mười ';
      } else {
        result += `${units[ten]} mươi `;
      }
    }
    
    if (unit > 0) {
      if (ten > 1 && unit === 1) {
        result += 'mốt';
      } else if (ten > 0 && unit === 5) {
        result += 'lăm';
      } else if (ten === 0 && hundred > 0 && unit > 0) {
        result += `lẻ ${units[unit]}`;
      } else {
        result += units[unit];
      }
    }
    
    return result.trim();
  };
  
  // Xử lý số âm
  let isNegative = false;
  if (number < 0) {
    isNegative = true;
    number = Math.abs(number);
  }
  
  // Chuyển số thành chuỗi và xóa số 0 ở đầu
  const numberStr = number.toString().replace(/^0+/, '');
  if (numberStr === '') return 'không';
  
  // Chia số thành các nhóm 3 chữ số
  const groups = [];
  for (let i = numberStr.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    groups.unshift(parseInt(numberStr.substring(start, i), 10));
  }
  
  let result = '';
  
  // Đọc từng nhóm 3 chữ số
  for (let i = 0; i < groups.length; i++) {
    const position = groups.length - i - 1;
    const group = groups[i];
    
    if (group > 0) {
      result += `${readThreeDigits(group)} ${positions[position]} `;
    }
  }
  
  result = result.trim();
  
  if (isNegative) {
    result = `âm ${result}`;
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
};
