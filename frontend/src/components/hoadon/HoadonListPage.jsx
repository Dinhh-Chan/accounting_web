import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Space, DatePicker, Input, Typography, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { formatCurrency, formatDateTime } from '../../utils/format';
import HoadonModal from './HoadonModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const HoadonListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoadonList, setHoadonList] = useState([]);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment()]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
  // Thêm trạng thái cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSoct, setCurrentSoct] = useState(null);
  
  // Tải danh sách hóa đơn
  const fetchData = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return;
    }
    
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const response = await axios.get(`/api/v1/hoadon/by-date-range?start_date=${startDate}&end_date=${endDate}`);
      
      setHoadonList(response.data.map(item => ({
        ...item,
        key: item.soct
      })));
      
      setFilteredData(response.data.map(item => ({
        ...item,
        key: item.soct
      })));
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [dateRange]);
  
  // Lọc dữ liệu theo ô tìm kiếm
  useEffect(() => {
    if (!searchText) {
      setFilteredData(hoadonList);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = hoadonList.filter(item => 
      item.soct.toLowerCase().includes(searchLower) ||
      item.tenkh.toLowerCase().includes(searchLower) ||
      (item.diengiai && item.diengiai.toLowerCase().includes(searchLower))
    );
    
    setFilteredData(filtered);
  }, [searchText, hoadonList]);
  
  // Xử lý thay đổi khoảng ngày
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  
  // Xem chi tiết hóa đơn
  const handleViewDetail = (soct) => {
    navigate(`/hoadon/${soct}`);
  };
  
  // Mở modal chỉnh sửa hóa đơn
  const handleEdit = (soct) => {
    setCurrentSoct(soct);
    setModalVisible(true);
  };
  
  // Tạo hóa đơn mới bằng modal
  const handleCreate = () => {
    setCurrentSoct(null);
    setModalVisible(true);
  };
  
  // Đóng modal
  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentSoct(null);
  };
  
  // Xử lý khi lưu hóa đơn thành công
  const handleModalSuccess = () => {
    fetchData();
  };
  
  // Xóa hóa đơn
  const handleDelete = async (soct) => {
    try {
      await axios.delete(`/api/v1/hoadon/${soct}`);
      message.success('Xóa hóa đơn thành công');
      fetchData();
    } catch (error) {
      message.error('Không thể xóa hóa đơn: ' + error.message);
    }
  };
  
  // Xuất hóa đơn PDF
  const handleExportPDF = async (soct) => {
    try {
      const response = await axios.get(`/api/v1/hoadon/${soct}/pdf`, {
        responseType: 'blob'
      });
      
      // Tạo URL cho blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Tạo link tải xuống
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${soct}.pdf`);
      
      // Thêm link vào document
      document.body.appendChild(link);
      
      // Click link để tải
      link.click();
      
      // Xóa link
      link.parentNode.removeChild(link);
    } catch (error) {
      message.error('Không thể xuất hóa đơn: ' + error.message);
    }
  };
  
  // Cấu hình bảng
  const columns = [
    {
      title: 'Số CT',
      dataIndex: 'soct',
      key: 'soct',
      width: '10%',
    },
    {
      title: 'Ngày lập',
      dataIndex: 'ngaylap',
      key: 'ngaylap',
      width: '15%',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => new Date(a.ngaylap) - new Date(b.ngaylap),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'tenkh',
      key: 'tenkh',
      width: '25%',
    },
    {
      title: 'Hình thức TT',
      dataIndex: 'hinhthuctt',
      key: 'hinhthuctt',
      width: '15%',
      render: (text) => {
        let color = 'blue';
        if (text === 'Tiền mặt') color = 'green';
        if (text === 'Thẻ tín dụng') color = 'orange';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Doanh thu',
      dataIndex: 'tiendt',
      key: 'tiendt',
      width: '15%',
      render: (text) => formatCurrency(text),
      sorter: (a, b) => a.tiendt - b.tiendt,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tientt',
      key: 'tientt',
      width: '15%',
      render: (text) => formatCurrency(text),
      sorter: (a, b) => a.tientt - b.tientt,
    },
    {
      title: '',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.soct)}
            title="Xem chi tiết"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.soct)}
            title="Chỉnh sửa"
          />
          <Button 
            type="text" 
            icon={<FilePdfOutlined />} 
            onClick={() => handleExportPDF(record.soct)}
            title="Xuất PDF"
          />
          <Popconfirm
            title="Xóa hóa đơn?"
            description="Bạn có chắc chắn muốn xóa hóa đơn này không?"
            onConfirm={() => handleDelete(record.soct)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={2}>Danh sách hóa đơn</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Tạo hóa đơn mới
          </Button>
        </Space>
        
        <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <RangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            locale={locale}
            style={{ marginRight: 8 }}
          />
          
          <Input
            placeholder="Tìm kiếm theo số CT, tên khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="soct"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} hóa đơn`,
          }}
          scroll={{ x: 1200 }}
        />
        
        {/* Modal form hóa đơn */}
        <HoadonModal
          open={modalVisible}
          soct={currentSoct}
          onCancel={handleModalCancel}
          onSuccess={handleModalSuccess}
        />
      </Space>
    </Card>
  );
};

export default HoadonListPage; 