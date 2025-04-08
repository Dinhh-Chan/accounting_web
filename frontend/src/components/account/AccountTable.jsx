import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Color mapping for account levels
const levelColors = {
  1: { bg: '#EAE8FD', text: '#6C5CE7' },
  2: { bg: '#DEF7EC', text: '#28C76F' },
  3: { bg: '#FFF4DE', text: '#FF9F43' },
  4: { bg: '#FCE4E4', text: '#EA5455' },
  5: { bg: '#E4F1FF', text: '#0396FF' }
};

const AccountTable = ({ accounts, onEdit, onDelete, onActionMenu }) => {
  // Function to get account level chip color
  const getLevelColor = (level) => {
    return levelColors[level] || { bg: '#f5f5f5', text: '#757575' };
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: 'none' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã tài khoản</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên tài khoản</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Cấp</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Không có dữ liệu tài khoản
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => {
              const levelColor = getLevelColor(account.capTK);
              
              return (
                <TableRow 
                  key={account.maTK}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '& td': { py: 1.5 }
                  }}
                >
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      sx={{ 
                        paddingLeft: `${(account.capTK - 1) * 16}px`,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {account.maTK}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {account.tenTK}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`Cấp ${account.capTK}`}
                      size="small"
                      sx={{ 
                        backgroundColor: levelColor.bg,
                        color: levelColor.text,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: '24px'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(account)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small" 
                          onClick={() => onDelete(account)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Tùy chọn">
                        <IconButton 
                          size="small"
                          onClick={(e) => onActionMenu(e, account)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountTable;