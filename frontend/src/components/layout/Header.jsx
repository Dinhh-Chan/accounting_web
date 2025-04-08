import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  InputBase,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountCircle,
  MoreVert as MoreIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth ? useAuth() : { currentUser: null, logout: () => {} };
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  // Mẫu thông báo
  const notifications = [
    { id: 1, text: 'Hóa đơn mới #HD001 đã được tạo', time: '5 phút trước' },
    { id: 2, text: 'Khách hàng Công ty ABC đã thanh toán', time: '30 phút trước' },
    { id: 3, text: 'Sản phẩm SP001 sắp hết hàng', time: '2 giờ trước' },
  ];

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: 2,
          mt: 1,
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ 
            width: 56, 
            height: 56, 
            mb: 1, 
            bgcolor: theme.palette.primary.main 
          }}
        >
          {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          {currentUser?.full_name || 'Người dùng'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentUser?.email || 'user@example.com'}
        </Typography>
      </Box>
      
      <Divider />
      
      <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
        <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
        Thông tin cá nhân
      </MenuItem>
      
      <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
        <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
        Cài đặt
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
        <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
        Đăng xuất
      </MenuItem>
    </Menu>
  );

  const notificationsMenuId = 'notifications-menu';
  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={notificationsMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 300,
          maxWidth: 360,
          borderRadius: 2,
          mt: 1,
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Thông báo
        </Typography>
      </Box>
      
      <Divider />
      
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <MenuItem key={notification.id} onClick={handleNotificationsMenuClose} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body2">
                {notification.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))
      ) : (
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Không có thông báo mới
          </Typography>
        </Box>
      )}
      
      <Divider />
      
      <MenuItem onClick={handleNotificationsMenuClose} sx={{ justifyContent: 'center' }}>
        <Typography variant="body2" color="primary">
          Xem tất cả thông báo
        </Typography>
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleNotificationsMenuOpen}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Thông báo</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Tài khoản</p>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        background: 'white',
        color: 'text.primary'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
        >
          Quản lý doanh nghiệp
        </Typography>
        
        <Box sx={{ 
          position: 'relative',
          ml: 3,
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.common.black, 0.05),
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.black, 0.1),
          },
          width: '30%'
        }}>
          <Box sx={{ position: 'absolute', p: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Tìm kiếm..."
            sx={{
              pl: 5,
              pr: 1,
              py: 1,
              width: '100%',
              fontSize: '0.9rem'
            }}
          />
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Tooltip title="Thông báo">
            <IconButton 
              size="large" 
              color="inherit"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              ml: 2, 
              p: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.05),
              },
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: theme.palette.primary.main,
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ ml: 1.5, display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {currentUser?.full_name || 'Người dùng'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser?.is_superuser ? 'Quản trị viên' : 'Nhân viên'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {renderMobileMenu}
      {renderMenu}
      {renderNotificationsMenu}
    </AppBar>
  );
};

export default Header;