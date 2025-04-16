import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KhachhangListPage from './pages/khachhang/KhachhangListPage';
import KhachhangCreatePage from './pages/khachhang/KhachhangCreatePage';
import KhachhangEditPage from './pages/khachhang/KhachhangEditPage';
import HoadonListPage from './components/hoadon/HoadonListPage';
import HoadonFormPage from './components/hoadon/HoadonFormPage';
import HoadonDetailPage from './components/hoadon/HoadonDetailPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/khachhang"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <KhachhangListPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/khachhang/create"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <KhachhangCreatePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/khachhang/edit/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <KhachhangEditPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Các tuyến đường cho hóa đơn */}
                <Route
                  path="/hoadon"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HoadonListPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hoadon/create"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HoadonFormPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hoadon/edit/:soct"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HoadonFormPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hoadon/:soct"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HoadonDetailPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App; 