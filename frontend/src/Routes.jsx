import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Khách hàng
import KhachhangListPage from './pages/khachhang/KhachhangListPage';
import KhachhangCreatePage from './pages/khachhang/KhachhangCreatePage';
import KhachhangEditPage from './pages/khachhang/KhachhangEditPage';

// Sản phẩm dịch vụ
import SPDVListPage from './pages/spdv/SPDVListPage';
import SPDVCreatePage from './pages/spdv/SPDVCreatePage';
import SPDVEditPage from './pages/spdv/SPDVEditPage';

// Bảng giá
import BanggiaListPage from './pages/banggia/BanggiaListPage';
import BanggiaCreatePage from './pages/banggia/BanggiaCreatePage';

// Định mức chiết khấu
import DinhmucckListPage from './pages/dinhmucck/DinhmucckListPage';
import DinhmucckCreatePage from './pages/dinhmucck/DinhmucckCreatePage';

// Hóa đơn
import HoadonListPage from './pages/hoadon/HoadonListPage';
import HoadonCreatePage from './pages/hoadon/HoadonCreatePage';
import HoadonDetailsPage from './pages/hoadon/HoadonDetailsPage';

// Phiếu giảm giá
import PhieugiamgiaListPage from './pages/phieugiamgia/PhieugiamgiaListPage';
import PhieugiamgiaCreatePage from './pages/phieugiamgia/PhieugiamgiaCreatePage';
import PhieugiamgiaDetailsPage from './pages/phieugiamgia/PhieugiamgiaDetailsPage';

// Tài khoản kế toán
import TKKTListPage from './pages/tkkt/TKKTListPage';
import TKKTCreatePage from './pages/tkkt/TKKTCreatePage';

// Cài đặt
import SettingsPage from './pages/settings/SettingsPage';

// Not Found
import NotFoundPage from './pages/NotFoundPage';

// Route Guard - Yêu cầu đăng nhập để truy cập
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth ? useAuth() : { isAuthenticated: true, loading: false };
  
  // Trong môi trường phát triển, bạn có thể bỏ qua xác thực
  // const isAuthenticated = true;
  // const loading = false;
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Khách hàng */}
        <Route path="khachhang">
          <Route index element={<KhachhangListPage />} />
          <Route path="create" element={<KhachhangCreatePage />} />
          <Route path="edit/:id" element={<KhachhangEditPage />} />
        </Route>
        
        {/* Sản phẩm dịch vụ */}
        <Route path="spdv">
          <Route index element={<SPDVListPage />} />
          <Route path="create" element={<SPDVCreatePage />} />
          <Route path="edit/:id" element={<SPDVEditPage />} />
        </Route>
        
        {/* Bảng giá */}
        <Route path="banggia">
          <Route index element={<BanggiaListPage />} />
          <Route path="create" element={<BanggiaCreatePage />} />
        </Route>
        
        {/* Định mức chiết khấu */}
        <Route path="dinhmucck">
          <Route index element={<DinhmucckListPage />} />
          <Route path="create" element={<DinhmucckCreatePage />} />
        </Route>
        
        {/* Hóa đơn */}
        <Route path="hoadon">
          <Route index element={<HoadonListPage />} />
          <Route path="create" element={<HoadonCreatePage />} />
          <Route path=":id" element={<HoadonDetailsPage />} />
        </Route>
        
        {/* Phiếu giảm giá */}
        <Route path="phieugiamgia">
          <Route index element={<PhieugiamgiaListPage />} />
          <Route path="create" element={<PhieugiamgiaCreatePage />} />
          <Route path=":id" element={<PhieugiamgiaDetailsPage />} />
        </Route>
        
        {/* Tài khoản kế toán */}
        <Route path="tkkt">
          <Route index element={<TKKTListPage />} />
          <Route path="create" element={<TKKTCreatePage />} />
        </Route>
        
        {/* Cài đặt */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Catch all - 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;