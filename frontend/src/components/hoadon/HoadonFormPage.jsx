import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, DatePicker, Select, Button, Table, InputNumber, Space, Card, Divider, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { formatCurrency } from '../../utils/format';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// CSS cho layout chính
const flexContainerStyle = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap'
};

const formSectionStyle = {
  flex: '1',
  minWidth: '300px',
  padding: '16px',
  border: '1px solid #eaeaea',
  borderRadius: '8px'
};

const fullWidthSectionStyle = {
  width: '100%',
  padding: '16px',
  border: '1px solid #eaeaea',
  borderRadius: '8px',
  marginTop: '20px'
};

const formGroupStyle = {
  marginBottom: '16px'
};

const formLabelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '500'
};

const requiredLabelStyle = {
  color: 'red',
  marginLeft: '4px'
};

const HoadonFormPage = () => {
  // Thay vì sử dụng Form.useForm()
  const [formValues, setFormValues] = useState({
    ngaylap: moment(),
    hinhthuctt: 'Tiền mặt',
    thuesuat: '10%',
    tiendt: 0,
    tienthue: 0,
    tienck: 0,
    tientt: 0
  });
  
  const navigate = useNavigate();
  const { soct } = useParams();
  const isEditing = !!soct;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [khachHangList, setKhachHangList] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [taiKhoanList, setTaiKhoanList] = useState([]);
  const [chiTietHoaDon, setChiTietHoaDon] = useState([]);
  
  // Các giá trị tính toán
  const [tongTienHang, setTongTienHang] = useState(0);
  const [tienThue, setTienThue] = useState(0);
  const [tienChietKhau, setTienChietKhau] = useState(0);
  const [tongThanhToan, setTongThanhToan] = useState(0);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách khách hàng
        const khRes = await axios.get('/api/v1/khachhang/');
        setKhachHangList(khRes.data);
        
        // Lấy danh sách sản phẩm/dịch vụ
        const spRes = await axios.get('/api/v1/sanpham/');
        setSanPhamList(spRes.data);
        
        // Lấy danh sách tài khoản kế toán
        const tkRes = await axios.get('/api/v1/tkkt/');
        setTaiKhoanList(tkRes.data);
        
        // Nếu đang chỉnh sửa, lấy dữ liệu hóa đơn
        if (isEditing) {
          const hdRes = await axios.get(`/api/v1/hoadon/${soct}`);
          const { hoa_don, chi_tiet } = hdRes.data;
          
          setFormValues({
            ...hoa_don,
            ngaylap: moment(hoa_don.ngaylap)
          });
          
          setChiTietHoaDon(chi_tiet.map((item, index) => ({
            ...item,
            key: index,
          })));
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEditing, soct]);

  // Tính toán các giá trị khi chi tiết hóa đơn thay đổi
  useEffect(() => {
    // Tính tổng tiền hàng
    const tongTien = chiTietHoaDon.reduce((total, item) => {
      return total + (item.soluong * item.dongia || 0);
    }, 0);
    setTongTienHang(tongTien);
    
    // Tính tiền thuế
    const thueStr = formValues.thuesuat || '0%';
    const thueSuat = parseInt(thueStr.replace('%', '')) / 100;
    const tienThueCalc = tongTien * thueSuat;
    setTienThue(tienThueCalc);
    
    // Tính tiền chiết khấu
    const tyleCK = formValues.tyleck || '0%';
    const ckSuat = parseInt(tyleCK.replace('%', '')) / 100;
    const tienCK = tongTien * ckSuat;
    setTienChietKhau(tienCK);
    
    // Tính tổng thanh toán
    const tongTT = tongTien + tienThueCalc - tienCK;
    setTongThanhToan(tongTT);
    
    // Cập nhật formValues
    setFormValues(prev => ({
      ...prev,
      tiendt: tongTien,
      tienthue: tienThueCalc,
      tienck: tienCK,
      tientt: tongTT
    }));
  }, [chiTietHoaDon, formValues.thuesuat, formValues.tyleck]);

  // Xử lý thay đổi giá trị form
  const handleFormChange = (name, value) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý khi chọn khách hàng
  const handleKhachHangChange = (makh) => {
    const khachHang = khachHangList.find(kh => kh.makh === makh);
    if (khachHang) {
      handleFormChange('makh', makh);
      handleFormChange('tenkh', khachHang.tenkh);
    }
  };

  // Xử lý khi thay đổi thuế suất hoặc tỷ lệ chiết khấu
  const handleRateChange = (name, value) => {
    handleFormChange(name, value);
  };

  // Thêm một dòng chi tiết hóa đơn mới
  const handleAddDetail = () => {
    const newDetail = {
      key: chiTietHoaDon.length,
      maspdv: '',
      tensp: '',
      dvt: '',
      soluong: 1,
      dongia: 0,
      thanhtien: 0
    };
    setChiTietHoaDon([...chiTietHoaDon, newDetail]);
  };

  // Xóa một dòng chi tiết hóa đơn
  const handleDeleteDetail = (key) => {
    setChiTietHoaDon(chiTietHoaDon.filter(item => item.key !== key));
  };

  // Cập nhật dữ liệu một dòng chi tiết
  const handleDetailChange = (key, field, value) => {
    const newData = [...chiTietHoaDon];
    const index = newData.findIndex(item => item.key === key);
    
    if (index > -1) {
      const item = newData[index];
      
      // Nếu thay đổi mã sản phẩm, cập nhật tên và đơn vị tính
      if (field === 'maspdv') {
        const sanPham = sanPhamList.find(sp => sp.maspdv === value);
        if (sanPham) {
          newData[index] = {
            ...item,
            maspdv: value,
            tensp: sanPham.tensp,
            dvt: sanPham.dvt,
            dongia: sanPham.dongia || item.dongia
          };
        }
      } else {
        newData[index] = { ...item, [field]: value };
      }
      
      // Tính lại thành tiền
      if (field === 'soluong' || field === 'dongia') {
        newData[index].thanhtien = newData[index].soluong * newData[index].dongia;
      }
      
      setChiTietHoaDon(newData);
    }
  };

  // Xử lý khi submit form
  const handleSubmit = async () => {
    if (chiTietHoaDon.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm vào hóa đơn');
      return;
    }
    
    setSaving(true);
    
    try {
      const hoaDonData = {
        ...formValues,
        ngaylap: formValues.ngaylap.format('YYYY-MM-DD HH:mm:ss'),
        chi_tiet: chiTietHoaDon.map(({ key, ...item }) => item) // Loại bỏ key
      };
      
      if (isEditing) {
        await axios.put(`/api/v1/hoadon/${soct}`, hoaDonData);
        message.success('Cập nhật hóa đơn thành công');
      } else {
        await axios.post('/api/v1/hoadon/', hoaDonData);
        message.success('Tạo hóa đơn mới thành công');
      }
      
      navigate('/hoadon');
    } catch (error) {
      message.error('Lỗi khi lưu hóa đơn: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Cấu hình bảng chi tiết hóa đơn
  const columns = [
    {
      title: 'Mã SP/DV',
      dataIndex: 'maspdv',
      key: 'maspdv',
      width: '15%',
      render: (text, record) => (
        <Select 
          style={{ width: '100%' }}
          value={text}
          onChange={(value) => handleDetailChange(record.key, 'maspdv', value)}
          showSearch
          optionFilterProp="children"
        >
          {sanPhamList.map(sp => (
            <Option key={sp.maspdv} value={sp.maspdv}>{sp.maspdv} - {sp.tensp}</Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Tên SP/DV',
      dataIndex: 'tensp',
      key: 'tensp',
      width: '25%'
    },
    {
      title: 'ĐVT',
      dataIndex: 'dvt',
      key: 'dvt',
      width: '10%'
    },
    {
      title: 'Số lượng',
      dataIndex: 'soluong',
      key: 'soluong',
      width: '10%',
      render: (text, record) => (
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          value={text}
          onChange={(value) => handleDetailChange(record.key, 'soluong', value)}
        />
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'dongia',
      key: 'dongia',
      width: '15%',
      render: (text, record) => (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          value={text}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          onChange={(value) => handleDetailChange(record.key, 'dongia', value)}
        />
      )
    },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhtien',
      key: 'thanhtien',
      width: '15%',
      render: (_, record) => formatCurrency(record.soluong * record.dongia || 0)
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleDeleteDetail(record.key)}
        />
      )
    }
  ];

  return (
    <Card loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/hoadon')}>
            Quay lại
          </Button>
          <Title level={2}>{isEditing ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới'}</Title>
        </Space>

        <div>
          {/* Layout chính với 3 phần */}
          <div style={flexContainerStyle}>
            {/* Phần 1: Thông tin chung */}
            <div style={formSectionStyle}>
              <Title level={4}>Thông tin chung</Title>
              
              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="ngaylap">
                  Ngày lập<span style={requiredLabelStyle}>*</span>
                </label>
                <DatePicker 
                  id="ngaylap"
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  disabled={isEditing}
                  value={formValues.ngaylap}
                  onChange={(date) => handleFormChange('ngaylap', date)}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="hinhthuctt">
                  Hình thức thanh toán<span style={requiredLabelStyle}>*</span>
                </label>
                <Select
                  id="hinhthuctt"
                  style={{ width: '100%' }}
                  value={formValues.hinhthuctt}
                  onChange={(value) => handleFormChange('hinhthuctt', value)}
                >
                  <Option value="Tiền mặt">Tiền mặt</Option>
                  <Option value="Chuyển khoản">Chuyển khoản</Option>
                  <Option value="Thẻ tín dụng">Thẻ tín dụng</Option>
                </Select>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="makh">
                  Khách hàng<span style={requiredLabelStyle}>*</span>
                </label>
                <Select
                  id="makh"
                  showSearch
                  placeholder="Chọn khách hàng"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  value={formValues.makh}
                  onChange={handleKhachHangChange}
                >
                  {khachHangList.map(kh => (
                    <Option key={kh.makh} value={kh.makh}>{kh.makh} - {kh.tenkh}</Option>
                  ))}
                </Select>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="tenkh">
                  Tên khách hàng<span style={requiredLabelStyle}>*</span>
                </label>
                <Input 
                  id="tenkh"
                  value={formValues.tenkh} 
                  onChange={(e) => handleFormChange('tenkh', e.target.value)}
                  disabled
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="nguoinhan">
                  Người nhận
                </label>
                <Input 
                  id="nguoinhan"
                  value={formValues.nguoinhan} 
                  onChange={(e) => handleFormChange('nguoinhan', e.target.value)}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="diachi">
                  Địa chỉ
                </label>
                <Input 
                  id="diachi"
                  value={formValues.diachi} 
                  onChange={(e) => handleFormChange('diachi', e.target.value)}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="dienthoai">
                  Điện thoại
                </label>
                <Input 
                  id="dienthoai"
                  value={formValues.dienthoai} 
                  onChange={(e) => handleFormChange('dienthoai', e.target.value)}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="diengiai">
                  Diễn giải
                </label>
                <TextArea 
                  id="diengiai"
                  rows={3} 
                  value={formValues.diengiai}
                  onChange={(e) => handleFormChange('diengiai', e.target.value)}
                  placeholder="Nội dung thanh toán..."
                />
              </div>
            </div>

            {/* Phần 2: Thông tin kế toán */}
            <div style={formSectionStyle}>
              <Title level={4}>Thông tin kế toán</Title>
              
              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="tkno">
                  TK Nợ<span style={requiredLabelStyle}>*</span>
                </label>
                <Select
                  id="tkno"
                  showSearch
                  placeholder="Chọn tài khoản nợ"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  value={formValues.tkno}
                  onChange={(value) => handleFormChange('tkno', value)}
                >
                  {taiKhoanList.map(tk => (
                    <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                  ))}
                </Select>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="tkcodt">
                  TK Có doanh thu<span style={requiredLabelStyle}>*</span>
                </label>
                <Select
                  id="tkcodt"
                  showSearch
                  placeholder="Chọn tài khoản có"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  value={formValues.tkcodt}
                  onChange={(value) => handleFormChange('tkcodt', value)}
                >
                  {taiKhoanList.map(tk => (
                    <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                  ))}
                </Select>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="tkcothue">
                  TK Có thuế<span style={requiredLabelStyle}>*</span>
                </label>
                <Select
                  id="tkcothue"
                  showSearch
                  placeholder="Chọn tài khoản thuế"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  value={formValues.tkcothue}
                  onChange={(value) => handleFormChange('tkcothue', value)}
                >
                  {taiKhoanList.map(tk => (
                    <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                  ))}
                </Select>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="thuesuat">
                  Thuế suất<span style={requiredLabelStyle}>*</span>
                </label>
                <Select
                  id="thuesuat"
                  style={{ width: '100%' }}
                  value={formValues.thuesuat}
                  onChange={(value) => handleRateChange('thuesuat', value)}
                >
                  <Option value="0%">0%</Option>
                  <Option value="5%">5%</Option>
                  <Option value="8%">8%</Option>
                  <Option value="10%">10%</Option>
                </Select>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle} htmlFor="tyleck">
                  Tỷ lệ chiết khấu
                </label>
                <Select
                  id="tyleck"
                  style={{ width: '100%' }}
                  value={formValues.tyleck}
                  onChange={(value) => handleRateChange('tyleck', value)}
                >
                  <Option value="">Không có</Option>
                  <Option value="5%">5%</Option>
                  <Option value="10%">10%</Option>
                  <Option value="15%">15%</Option>
                  <Option value="20%">20%</Option>
                </Select>
              </div>

              {formValues.tyleck && (
                <div style={formGroupStyle}>
                  <label style={formLabelStyle} htmlFor="tkchietkhau">
                    TK Chiết khấu
                  </label>
                  <Select
                    id="tkchietkhau"
                    showSearch
                    placeholder="Chọn tài khoản chiết khấu"
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    value={formValues.tkchietkhau}
                    onChange={(value) => handleFormChange('tkchietkhau', value)}
                  >
                    {taiKhoanList.map(tk => (
                      <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                    ))}
                  </Select>
                </div>
              )}

              <Divider />

              <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Tiền hàng:</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(formValues.tiendt)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Tiền thuế ({formValues.thuesuat}):</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(formValues.tienthue)}</span>
                </div>
                
                {formValues.tyleck && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Chiết khấu ({formValues.tyleck}):</span>
                    <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>- {formatCurrency(formValues.tienck)}</span>
                  </div>
                )}
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <span style={{ fontWeight: 'bold' }}>Tổng thanh toán:</span>
                  <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>{formatCurrency(formValues.tientt)}</span>
                </div>
              </div>
            </div>

            {/* Phần 3: Chi tiết hóa đơn */}
            <div style={fullWidthSectionStyle}>
              <Title level={4}>Chi tiết hóa đơn</Title>
              
              <Button 
                type="dashed" 
                onClick={handleAddDetail} 
                block 
                icon={<PlusOutlined />}
                style={{ marginBottom: '16px' }}
              >
                Thêm sản phẩm
              </Button>

              <Table
                columns={columns}
                dataSource={chiTietHoaDon}
                pagination={false}
                bordered
                size="small"
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => navigate('/hoadon')}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                icon={<SaveOutlined />} 
                loading={saving}
                size="large"
              >
                {isEditing ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn'}
              </Button>
            </Space>
          </div>
        </div>
      </Space>
    </Card>
  );
};

export default HoadonFormPage;