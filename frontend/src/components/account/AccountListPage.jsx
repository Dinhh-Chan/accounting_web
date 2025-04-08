import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton, 
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../../services/api-service';
import AccountTable from './AccountTable';
import PageHeader from '../common/PageHeader';
import ConfirmDialog from '../common/ConfirmDialog';

const AccountListPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, level1, level2, etc.
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [activeSort, setActiveSort] = useState('code-asc'); // code-asc, code-desc, name-asc, name-desc

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await accountService.getAllAccounts();
        setAccounts(response.data.data);
        setFilteredAccounts(response.data.data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Không thể tải danh sách tài khoản. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Filter accounts based on search term
  useEffect(() => {
    let filtered = accounts;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.maTK.toLowerCase().includes(searchTerm.toLowerCase()) || 
        account.tenTK.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply level filter
    if (activeFilter !== 'all') {
      const level = parseInt(activeFilter.replace('level', ''));
      filtered = filtered.filter(account => account.capTK === level);
    }
    
    // Apply sorting
    const [sortField, sortDirection] = activeSort.split('-');
    filtered = [...filtered].sort((a, b) => {
      if (sortField === 'code') {
        return sortDirection === 'asc' 
          ? a.maTK.localeCompare(b.maTK) 
          : b.maTK.localeCompare(a.maTK);
      } else {
        return sortDirection === 'asc' 
          ? a.tenTK.localeCompare(b.tenTK) 
          : b.tenTK.localeCompare(a.tenTK);
      }
    });
    
    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, activeFilter, activeSort]);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await accountService.deleteAccount(accountToDelete.maTK);
      setAccounts(accounts.filter(account => account.maTK !== accountToDelete.maTK));
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Không thể xóa tài khoản. ' + (
        err.response?.data?.message || 'Vui lòng thử lại sau.'
      ));
    }
  };

  // Handle opening action menu
  const handleOpenActionMenu = (event, account) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAccount(account);
  };

  // Handle closing action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // Handle account edit
  const handleEditAccount = (account) => {
    navigate(`/accounts/edit/${account.maTK}`);
    handleCloseActionMenu();
  };

  // Handle account delete confirmation
  const handleConfirmDelete = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
    handleCloseActionMenu();
  };

  // Filter menu handlers
  const handleOpenFilterMenu = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    handleCloseFilterMenu();
  };

  // Sort menu handlers
  const handleOpenSortMenu = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortMenuAnchor(null);
  };

  const handleSortChange = (sort) => {
    setActiveSort(sort);
    handleCloseSortMenu();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Tài Khoản Kế Toán"
        subtitle="Quản lý hệ thống tài khoản kế toán"
        icon={<AccountIcon />}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm tài khoản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '35%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box>
            <Tooltip title="Lọc">
              <Button 
                variant="outlined" 
                color="inherit" 
                sx={{ mr: 1 }} 
                onClick={handleOpenFilterMenu}
                startIcon={<FilterListIcon />}
              >
                {activeFilter === 'all' ? 'Tất cả cấp' : `Cấp ${activeFilter.replace('level', '')}`}
              </Button>
            </Tooltip>
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={handleCloseFilterMenu}
            >
              <MenuItem 
                selected={activeFilter === 'all'} 
                onClick={() => handleFilterChange('all')}
              >
                <ListItemText primary="Tất cả cấp" />
              </MenuItem>
              <MenuItem 
                selected={activeFilter === 'level1'} 
                onClick={() => handleFilterChange('level1')}
              >
                <ListItemText primary="Cấp 1" />
              </MenuItem>
              <MenuItem 
                selected={activeFilter === 'level2'} 
                onClick={() => handleFilterChange('level2')}
              >
                <ListItemText primary="Cấp 2" />
              </MenuItem>
              <MenuItem 
                selected={activeFilter === 'level3'} 
                onClick={() => handleFilterChange('level3')}
              >
                <ListItemText primary="Cấp 3" />
              </MenuItem>
              <MenuItem 
                selected={activeFilter === 'level4'} 
                onClick={() => handleFilterChange('level4')}
              >
                <ListItemText primary="Cấp 4" />
              </MenuItem>
              <MenuItem 
                selected={activeFilter === 'level5'} 
                onClick={() => handleFilterChange('level5')}
              >
                <ListItemText primary="Cấp 5" />
              </MenuItem>
            </Menu>
            
            <Tooltip title="Sắp xếp">
              <Button 
                variant="outlined" 
                color="inherit" 
                sx={{ mr: 1 }} 
                onClick={handleOpenSortMenu}
                startIcon={<SortIcon />}
              >
                Sắp xếp
              </Button>
            </Tooltip>
            <Menu
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={handleCloseSortMenu}
            >
              <MenuItem 
                selected={activeSort === 'code-asc'} 
                onClick={() => handleSortChange('code-asc')}
              >
                <ListItemText primary="Mã tài khoản (A-Z)" />
              </MenuItem>
              <MenuItem 
                selected={activeSort === 'code-desc'} 
                onClick={() => handleSortChange('code-desc')}
              >
                <ListItemText primary="Mã tài khoản (Z-A)" />
              </MenuItem>
              <MenuItem 
                selected={activeSort === 'name-asc'} 
                onClick={() => handleSortChange('name-asc')}
              >
                <ListItemText primary="Tên tài khoản (A-Z)" />
              </MenuItem>
              <MenuItem 
                selected={activeSort === 'name-desc'} 
                onClick={() => handleSortChange('name-desc')}
              >
                <ListItemText primary="Tên tài khoản (Z-A)" />
              </MenuItem>
            </Menu>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/accounts/add')}
            >
              Thêm tài khoản
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AccountTable 
            accounts={filteredAccounts}
            onEdit={handleEditAccount}
            onDelete={handleConfirmDelete}
            onActionMenu={handleOpenActionMenu}
          />
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => handleEditAccount(selectedAccount)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleConfirmDelete(selectedAccount)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa tài khoản"
        content={`Bạn có chắc chắn muốn xóa tài khoản ${accountToDelete?.tenTK} (${accountToDelete?.maTK}) không? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
      />
    </Box>
  );
};

export default AccountListPage;