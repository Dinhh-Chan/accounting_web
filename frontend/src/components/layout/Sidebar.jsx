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
  Collapse,
  styled
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
  BarChart as ChartIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 260,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 260,
    boxSizing: 'border-box',
    border: 'none',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '8px',
  marginBottom: '4px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const StyledSubListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '8px',
  marginBottom: '4px',
  paddingLeft: theme.spacing(4),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSales, setOpenSales] = React.useState(false);
  const [openInventory, setOpenInventory] = React.useState(false);
  const [openFinance, setOpenFinance] = React.useState(false);

  const handleMenuClick = (title) => {
    switch (title) {
      case 'Bán hàng':
        setOpenSales(!openSales);
        break;
      case 'Kho hàng':
        setOpenInventory(!openInventory);
        break;
      case 'Tài chính':
        setOpenFinance(!openFinance);
        break;
      default:
        break;
    }
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
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/logo.png"
          alt="Logo"
          variant="rounded"
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: 'primary.main',
            '& .MuiAvatar-img': {
              objectFit: 'contain',
              padding: '4px'
            }
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Quản lý doanh nghiệp
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Business Management
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.subItems ? (
                <>
                  <ListItem disablePadding>
                    <StyledListItemButton
                      onClick={() => handleMenuClick(item.title)}
                      selected={
                        (item.title === 'Bán hàng' && openSales) ||
                        (item.title === 'Kho hàng' && openInventory) ||
                        (item.title === 'Tài chính' && openFinance)
                      }
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.title} />
                      {(item.title === 'Bán hàng' && openSales) ||
                       (item.title === 'Kho hàng' && openInventory) ||
                       (item.title === 'Tài chính' && openFinance) ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </StyledListItemButton>
                  </ListItem>
                  
                  <Collapse
                    in={
                      (item.title === 'Bán hàng' && openSales) ||
                      (item.title === 'Kho hàng' && openInventory) ||
                      (item.title === 'Tài chính' && openFinance)
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disablePadding>
                          <StyledSubListItemButton
                            selected={isRouteActive(subItem.path)}
                            onClick={() => navigate(subItem.path)}
                          >
                            <ListItemIcon>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.title} 
                              primaryTypographyProps={{ 
                                fontSize: '0.9rem',
                                fontWeight: isRouteActive(subItem.path) ? 'medium' : 'normal'
                              }}
                            />
                          </StyledSubListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding>
                  <StyledListItemButton
                    selected={isRouteActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      primaryTypographyProps={{ 
                        fontWeight: isRouteActive(item.path) ? 'medium' : 'normal' 
                      }}
                    />
                  </StyledListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;