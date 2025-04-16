import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KhachhangListPage from './pages/khachhang/KhachhangListPage';
import KhachhangCreatePage from './pages/khachhang/KhachhangCreatePage';
import KhachhangEditPage from './pages/khachhang/KhachhangEditPage';

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
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 