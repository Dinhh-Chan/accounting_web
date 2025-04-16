import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Descriptions, Table, Button, Space, Row, Col, Divider, Spin, Result } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import axios from 'axios';
import { formatCurrency, formatDateTime } from '../../utils/format';

const { Title, Text } = Typography;

const HoadonDetailPage = () => {
  const { soct } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [chiTiet, setChiTiet] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchHoaDon = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/hoadon/${soct}`);
        
        if (response.data) {
          setHoaDon(response.data.hoa_don);
          setChiTiet(response.data.chi_tiet.map((item, index) => ({
            ...item,
            key: index
          })));
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu hóa đơn:', err);
        setError('Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoaDon();
  }, [soct]);
  
  const handleBack = () => {
    navigate('/hoadon');
  };
  
  const handleEdit = () => {
    navigate(`/hoadon/edit/${soct}`);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPDF = async () => {
    try {
      const response = await axios.get(`/api/v1/hoadon/${soct}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${soct}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
    }
  };
  
  const columns = [
    {
      title: 'Mã SP/DV',
      dataIndex: 'maspdv',
      key: 'maspdv',
      width: '15%',
    },
    {
      title: 'Tên SP/DV',
      dataIndex: 'tensp',
      key: 'tensp',
      width: '35%',
    },
    {
      title: 'ĐVT',
      dataIndex: 'dvt',
      key: 'dvt',
      width: '10%',
    },
    {
      title: 'Số lượng',
      dataIndex: 'soluong',
      key: 'soluong',
      width: '10%',
      align: 'right',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'dongia',
      key: 'dongia',
      width: '15%',
      align: 'right',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Thành tiền',
      key: 'thanhtien',
      width: '15%',
      align: 'right',
      render: (_, record) => formatCurrency(record.soluong * record.dongia),
    },
  ];
  
  if (loading) {
    return (
      <Card style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin hóa đơn...</div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Result
        status="error"
        title="Lỗi khi tải dữ liệu"
        subTitle={error}
        extra={[
          <Button type="primary" key="back" onClick={handleBack}>
            Quay lại danh sách
          </Button>,
        ]}
      />
    );
  }
  
  if (!hoaDon) {
    return (
      <Result
        status="404"
        title="Không tìm thấy hóa đơn"
        subTitle="Hóa đơn bạn đang tìm kiếm không tồn tại."
        extra={[
          <Button type="primary" key="back" onClick={handleBack}>
            Quay lại danh sách
          </Button>,
        ]}
      />
    );
  }
  
  return (
    <Card className="invoice-detail-page">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>Chi tiết hóa đơn</Title>
          </Space>
          
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Chỉnh sửa
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint} type="primary">
              In hóa đơn
            </Button>
          </Space>
        </div>
        
        <Divider />
        
        <Row gutter={16} className="invoice-header">
          <Col span={12}>
            <Descriptions title="Thông tin hóa đơn" bordered column={1} size="small">
              <Descriptions.Item label="Số hóa đơn">{hoaDon.soct}</Descriptions.Item>
              <Descriptions.Item label="Ngày lập">{formatDateTime(hoaDon.ngaylap)}</Descriptions.Item>
              <Descriptions.Item label="Hình thức thanh toán">{hoaDon.hinhthuctt}</Descriptions.Item>
              <Descriptions.Item label="Diễn giải">{hoaDon.diengiai || '(Không có)'}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions title="Thông tin khách hàng" bordered column={1} size="small">
              <Descriptions.Item label="Mã khách hàng">{hoaDon.makh}</Descriptions.Item>
              <Descriptions.Item label="Tên khách hàng">{hoaDon.tenkh}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        
        <Divider orientation="left">Chi tiết sản phẩm</Divider>
        
        <Table
          columns={columns}
          dataSource={chiTiet}
          pagination={false}
          bordered
          size="small"
          summary={() => {
            const tongTienHang = chiTiet.reduce(
              (sum, item) => sum + item.soluong * item.dongia,
              0
            );
            
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={5} align="right">
                    <Text strong>Tiền hàng:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <Text strong>{formatCurrency(hoaDon.tiendt)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={5} align="right">
                    <Text strong>Thuế VAT ({hoaDon.thuesuat}):</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <Text strong>{formatCurrency(hoaDon.tienthue)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                
                {hoaDon.tienck > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={5} align="right">
                      <Text strong>Chiết khấu ({hoaDon.tyleck || '0%'}):</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <Text strong>{formatCurrency(hoaDon.tienck)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={5} align="right">
                    <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <Text strong style={{ fontSize: '16px' }}>{formatCurrency(hoaDon.tientt)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
        
        <Divider orientation="left">Thông tin kế toán</Divider>
        
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="TK Nợ">{hoaDon.tkno}</Descriptions.Item>
          <Descriptions.Item label="TK Có doanh thu">{hoaDon.tkcodt}</Descriptions.Item>
          <Descriptions.Item label="TK Có thuế">{hoaDon.tkcothue}</Descriptions.Item>
          {hoaDon.tkchietkhau && <Descriptions.Item label="TK Chiết khấu">{hoaDon.tkchietkhau}</Descriptions.Item>}
        </Descriptions>
      </Space>
      
      <style jsx="true">{`
        @media print {
          .ant-card-body {
            padding: 0;
          }
          
          .ant-btn,
          .ant-card-head {
            display: none !important;
          }
          
          body {
            font-size: 12pt;
          }
          
          .invoice-header {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </Card>
  );
};

export default HoadonDetailPage; 