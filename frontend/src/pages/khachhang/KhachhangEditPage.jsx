import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KhachhangEditPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Chuyển hướng về trang danh sách khách hàng
    navigate('/khachhang');
  }, [navigate]);
  
  return null;
};

export default KhachhangEditPage;
