import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Avatar,
  Divider, 
  LinearProgress, 
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  PeopleAlt as CustomersIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatUtils';

// Hàm tạo màu ngẫu nhiên nhưng nhất quán dựa trên chuỗi
const stringToColor = (string) => {
  if (!string) return '#1976d2';
  
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  
  return color;
};

// Hàm lấy chữ cái đầu của tên để hiển thị avatar
const stringToInitials = (string) => {
  if (!string) return '?';
  
  const words = string.split(' ');
  if (words.length === 1) {
    return string.substring(0, 1).toUpperCase();
  }
  
  return `${words[0].substring(0, 1)}${words[words.length - 1].substring(0, 1)}`.toUpperCase();
};

const TopCustomers = ({ customers = [], onViewCustomer, loading = false }) => {
  const theme = useTheme();

  // Tìm giá trị doanh thu cao nhất để tính tỷ lệ
  const maxRevenue = customers.length > 0 ? 
    Math.max(...customers.map(customer => customer.revenue)) : 0;

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          Đang tải dữ liệu...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CustomersIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          Không có dữ liệu khách hàng
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {customers.map((customer, index) => (
        <React.Fragment key={index}>
          <ListItem 
            alignItems="flex-start" 
            secondaryAction={
              onViewCustomer && (
                <IconButton 
                  edge="end" 
                  aria-label="view" 
                  onClick={() => onViewCustomer(customer)}
                >
                  <VisibilityIcon />
                </IconButton>
              )
            }
            sx={{ 
              py: 1.5,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: stringToColor(customer.name),
                  fontWeight: 'bold'
                }}
              >
                {stringToInitials(customer.name)}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 4 }}>
                  <Typography variant="subtitle2" component="span" noWrap>
                    {customer.name}
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    component="span" 
                    color="primary.main"
                    fontWeight="bold"
                  >
                    {formatCurrency(customer.revenue)}
                  </Typography>
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, mb: 1 }}>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {customer.makh || ''}
                    </Typography>
                    <Chip
                      label={`${customer.invoices || 0} hóa đơn`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                  
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={maxRevenue ? (customer.revenue / maxRevenue) * 100 : 0} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[100]
                      }}
                    />
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>
          {index < customers.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TopCustomers;