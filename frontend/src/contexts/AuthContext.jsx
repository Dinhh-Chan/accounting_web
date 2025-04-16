import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra xem có token không khi tải trang
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      // Gọi API lấy thông tin user từ token
      const response = await axiosInstance.get(API_ENDPOINTS.ME);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      // Nếu có lỗi (token hết hạn hoặc không hợp lệ), xóa token và đăng xuất
      logout();
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API đăng nhập
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, { email, password });
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.access_token);
      
      // Sau khi đăng nhập, lấy thông tin user
      await fetchUser();
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Xóa token và user
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};