import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h1" 
            color="primary" 
            sx={{ 
              fontSize: { xs: '8rem', md: '12rem' },
              fontWeight: 700,
              lineHeight: 1
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              mb: 2,
              mt: 1,
              fontWeight: 'bold'
            }}
          >
            Không tìm thấy trang
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}
          >
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            Vui lòng kiểm tra lại URL hoặc quay lại trang chính.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1.5 }}
          >
            Về trang chủ
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage;