import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme, CssBaseline, styled } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  width: { md: `calc(100% - ${theme.spacing(26)})` },
  marginLeft: { md: theme.spacing(26) },
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <MainLayout>
      <CssBaseline />
      
      <Header 
        open={drawerOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      
      <Sidebar 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
      
      <MainContent>
        <Toolbar /> {/* Spacing for fixed app bar */}
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>
    </MainLayout>
  );
};

export default Layout;