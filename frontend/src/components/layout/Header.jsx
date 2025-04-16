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
  alpha,
  styled
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

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  background: 'white',
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: 64,
  padding: theme.spacing(0, 2),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginLeft: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  width: '30%',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  padding: theme.spacing(1),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  paddingRight: theme.spacing(1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  width: '100%',
  fontSize: '0.9rem',
  '&::placeholder': {
    color: theme.palette.text.secondary,
  },
}));

const UserBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginLeft: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.05),
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: 200,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    boxShadow: theme.shadows[3],
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const Header = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Luôn gọi useAuth() không có điều kiện
  const authData = useAuth();
  
  // Sau khi gọi hook, kiểm tra dữ liệu trả về
  const currentUser = authData?.currentUser ?? null;
  const logout = authData?.logout ?? (() => {});
  
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
    <StyledMenu
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
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ 
            width: 56, 
            height: 56, 
            mb: 1, 
            bgcolor: theme.palette.primary.main,
            fontSize: '1.5rem',
            fontWeight: 'bold'
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
      
      <StyledMenuItem onClick={handleProfile}>
        <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
        Thông tin cá nhân
      </StyledMenuItem>
      
      <StyledMenuItem onClick={handleSettings}>
        <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
        Cài đặt
      </StyledMenuItem>
      
      <Divider />
      
      <StyledMenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
        <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
        Đăng xuất
      </StyledMenuItem>
    </StyledMenu>
  );

  const notificationsMenuId = 'notifications-menu';
  const renderNotificationsMenu = (
    <StyledMenu
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
        sx: {
          minWidth: 300,
          maxWidth: 360,
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
          <StyledMenuItem key={notification.id} onClick={handleNotificationsMenuClose}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body2">
                {notification.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </StyledMenuItem>
        ))
      ) : (
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Không có thông báo mới
          </Typography>
        </Box>
      )}
      
      <Divider />
      
      <StyledMenuItem onClick={handleNotificationsMenuClose} sx={{ justifyContent: 'center' }}>
        <Typography variant="body2" color="primary">
          Xem tất cả thông báo
        </Typography>
      </StyledMenuItem>
    </StyledMenu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <StyledMenu
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
      <StyledMenuItem onClick={handleNotificationsMenuOpen}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Typography variant="body2" sx={{ ml: 1 }}>Thông báo</Typography>
      </StyledMenuItem>
      <StyledMenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Typography variant="body2" sx={{ ml: 1 }}>Tài khoản</Typography>
      </StyledMenuItem>
    </StyledMenu>
  );

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
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
        
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Tìm kiếm..."
          />
        </SearchBox>
        
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
          
          <UserBox onClick={handleProfileMenuOpen}>
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
          </UserBox>
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
      </StyledToolbar>
      {renderMobileMenu}
      {renderMenu}
      {renderNotificationsMenu}
    </StyledAppBar>
  );
};

export default Header;