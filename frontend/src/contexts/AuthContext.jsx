import React, { createContext, useState, useEffect } from 'react';
import { login as loginApi, getCurrentUser } from '../api/auth';
import { saveToken, getToken, removeToken } from '../utils/tokenUtils';

// Tạo context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra và tải thông tin người dùng khi component mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      
      if (token) {
        try {
          setLoading(true);
          // Thực tế sẽ gọi API để lấy thông tin người dùng hiện tại
          // const userData = await getCurrentUser();
          
          // Trong quá trình phát triển, tạo user mẫu
          const userData = {
            id: 1,
            email: 'admin@example.com',
            full_name: 'Quản trị viên',
            phone_number: '0901234567',
            is_active: true,
            is_superuser: true,
            last_login: new Date().toISOString()
          };
          
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to load user:', err);
          removeToken();
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setIsAuthenticated(false);
      }
    };

    loadUser();
  }, []);

  // Hàm đăng nhập
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Thực tế sẽ gọi API để đăng nhập
      // const data = await loginApi(credentials);
      
      // Trong quá trình phát triển, tạo phản hồi mẫu
      const data = {
        access_token: 'fake_jwt_token_' + Math.random().toString(36).substring(2),
        token_type: 'bearer',
        expires_in: 3600,
        user_id: 1,
        is_superuser: true
      };
      
      if (data.access_token) {
        saveToken(data.access_token);
        
        // Tạo user mẫu (trong quá trình phát triển)
        const userData = {
          id: 1,
          email: credentials.email || 'admin@example.com',
          full_name: 'Quản trị viên',
          phone_number: '0901234567',
          is_active: true,
          is_superuser: true,
          last_login: new Date().toISOString()
        };
        
        setCurrentUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    removeToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Các giá trị được cung cấp qua context
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};