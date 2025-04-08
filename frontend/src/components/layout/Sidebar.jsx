import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ReceiptLong as ReceiptIcon,
  LocalOffer as DiscountIcon,
  AccountBalance as AccountIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  BarChart as ChartIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const Sidebar = ({ open, width = 260, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSales, setOpenSales] = React.useState(false);
  const [openBackOffice, setOpenBackOffice] = React.useState(false);

  const handleSalesClick = () => {
    setOpenSales(!openSales);
  };

  const handleBackOfficeClick = () => {
    setOpenBackOffice(!openBackOffice);
  };

  const menuItems = [
    {
      title: 'Tổng quan',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      title: 'Bán hàng',
      icon: <TrendingUpIcon />,
      subItems: [
        {
          title: 'Khách hàng',
          path: '/khachhang',
          icon: <PeopleIcon fontSize="small" />,
        },
        {
          title: 'Hóa đơn',
          path: '/hoadon',
          icon: <ReceiptIcon fontSize="small" />,
        },
        {
          title: 'Phiếu giảm giá',
          path: '/phieugiamgia',
          icon: <DiscountIcon fontSize="small" />,
        }
      ]
    },
    {
      title: 'Kho hàng',
      icon: <BusinessIcon />,
      subItems: [
        {
          title: 'Sản phẩm & Dịch vụ',
          path: '/spdv',
          icon: <InventoryIcon fontSize="small" />,
        },
        {
          title: 'Bảng giá',
          path: '/banggia',
          icon: <MoneyIcon fontSize="small" />,
        },
        {
          title: 'Định mức chiết khấu',
          path: '/dinhmucck',
          icon: <ChartIcon fontSize="small" />,
        }
      ]
    },
    {
      title: 'Tài chính',
      icon: <AccountIcon />,
      subItems: [
        {
          title: 'Tài khoản kế toán',
          path: '/tkkt',
          icon: <AccountIcon fontSize="small" />,
        }
      ]
    },
    {
      title: 'Quản trị',
      path: '/settings',
      icon: <SettingsIcon />,
    },
  ];

  const isRouteActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/logo.png"
          alt="Logo"
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Quản lý doanh nghiệp
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.subItems ? (
                <>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={
                        item.title === 'Bán hàng'
                          ? handleSalesClick
                          : item.title === 'Kho hàng'
                          ? handleBackOfficeClick
                          : null
                      }
                      sx={{
                        borderRadius: '8px',
                        mb: 0.5,
                        color: (
                          item.title === 'Bán hàng' && openSales) || 
                          (item.title === 'Kho hàng' && openBackOffice
                        ) ? 'primary.main' : 'inherit',
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: (
                          item.title === 'Bán hàng' && openSales) || 
                          (item.title === 'Kho hàng' && openBackOffice
                        ) ? 'primary.main' : 'inherit' 
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.title} />
                      {item.title === 'Bán hàng' ? (
                        openSales ? <ExpandLess /> : <ExpandMore />
                      ) : item.title === 'Kho hàng' ? (
                        openBackOffice ? <ExpandLess /> : <ExpandMore />
                      ) : null}
                    </ListItemButton>
                  </ListItem>
                  
                  <Collapse
                    in={
                      (item.title === 'Bán hàng' && openSales) ||
                      (item.title === 'Kho hàng' && openBackOffice) ||
                      (item.title === 'Tài chính')
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disablePadding>
                          <ListItemButton
                            sx={{
                              pl: 4,
                              borderRadius: '8px',
                              mb: 0.5,
                              backgroundColor: isRouteActive(subItem.path)
                                ? 'rgba(25, 118, 210, 0.08)'
                                : 'transparent',
                              color: isRouteActive(subItem.path)
                                ? 'primary.main'
                                : 'inherit',
                            }}
                            onClick={() => navigate(subItem.path)}
                          >
                            <ListItemIcon sx={{
                              color: isRouteActive(subItem.path)
                                ? 'primary.main'
                                : 'inherit',
                            }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.title} 
                              primaryTypographyProps={{ 
                                fontSize: '0.9rem',
                                fontWeight: isRouteActive(subItem.path) ? 'medium' : 'normal'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      backgroundColor: isRouteActive(item.path)
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'transparent',
                      color: isRouteActive(item.path)
                        ? 'primary.main'
                        : 'inherit',
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon sx={{
                      color: isRouteActive(item.path)
                        ? 'primary.main'
                        : 'inherit',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      primaryTypographyProps={{ 
                        fontWeight: isRouteActive(item.path) ? 'medium' : 'normal' 
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;