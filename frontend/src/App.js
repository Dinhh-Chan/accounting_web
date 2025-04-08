import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout component
import MainLayout from './components/layout/MainLayout';

// Auth pages
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfilePage from './components/auth/ProfilePage';

// Dashboard page
import DashboardPage from './components/dashboard/DashboardPage';

// Customer pages
import CustomerListPage from './components/customer/CustomerListPage';
import CustomerFormPage from './components/customer/CustomerFormPage';

// Product pages
import ProductListPage from './components/product/ProductListPage';
import ProductFormPage from './components/product/ProductFormPage';
import PriceListPage from './components/product/PriceListPage';

// Invoice pages
import InvoiceListPage from './components/invoice/InvoiceListPage';
import InvoiceFormPage from './components/invoice/InvoiceFormPage';
import InvoiceDetailPage from './components/invoice/InvoiceDetailPage';

// Discount pages
import DiscountListPage from './components/discount/DiscountListPage';
import DiscountFormPage from './components/discount/DiscountFormPage';
import DiscountDetailPage from './components/discount/DiscountDetailPage';

// Report pages
import ReportPage from './components/report/ReportPage';

// Account pages
import AccountListPage from './components/account/AccountListPage';
import AccountFormPage from './components/account/AccountFormPage';

// Error pages
import NotFoundPage from './components/common/NotFoundPage';

// Private route component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route (accessible only when not authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6C5CE7',
      light: '#8F7FF7',
      dark: '#5A4BD1',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF9F43',
      light: '#FFBE7A',
      dark: '#FF8510',
      contrastText: '#fff',
    },
    error: {
      main: '#EA5455',
      light: '#F08182',
      dark: '#E42728',
    },
    success: {
      main: '#28C76F',
      light: '#55D98D',
      dark: '#1F9D57',
    },
    background: {
      default: '#F8F8F8',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Customer routes */}
        <Route path="/customers" element={
          <PrivateRoute>
            <MainLayout>
              <CustomerListPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/customers/add" element={
          <PrivateRoute>
            <MainLayout>
              <CustomerFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/customers/edit/:id" element={
          <PrivateRoute>
            <MainLayout>
              <CustomerFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Product routes */}
        <Route path="/products" element={
          <PrivateRoute>
            <MainLayout>
              <ProductListPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/products/add" element={
          <PrivateRoute>
            <MainLayout>
              <ProductFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/products/edit/:id" element={
          <PrivateRoute>
            <MainLayout>
              <ProductFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/products/prices/:id" element={
          <PrivateRoute>
            <MainLayout>
              <PriceListPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Invoice routes */}
        <Route path="/invoices" element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceListPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/invoices/add" element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/invoices/edit/:id" element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/invoices/view/:id" element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceDetailPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Discount routes */}
        <Route path="/discounts" element={
          <PrivateRoute>
            <MainLayout>
              <DiscountListPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/discounts/add" element={
          <PrivateRoute>
            <MainLayout>
              <DiscountFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/discounts/edit/:id" element={
          <PrivateRoute>
            <MainLayout>
              <DiscountFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/discounts/view/:id" element={
          <PrivateRoute>
            <MainLayout>
              <DiscountDetailPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Report routes */}
        <Route path="/reports" element={
          <PrivateRoute>
            <MainLayout>
              <ReportPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Account routes */}
        <Route path="/accounts" element={
          <PrivateRoute>
            <MainLayout>
              <AccountListPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/accounts/add" element={
          <PrivateRoute>
            <MainLayout>
              <AccountFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/accounts/edit/:id" element={
          <PrivateRoute>
            <MainLayout>
              <AccountFormPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Profile route */}
        <Route path="/profile" element={
          <PrivateRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Default route redirects to dashboard if authenticated, login otherwise */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;