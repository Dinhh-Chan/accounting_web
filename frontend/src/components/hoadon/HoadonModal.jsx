import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  Paper,
  Typography,
  Button as MuiButton,
  Grid,
  Box,
  CircularProgress,
  IconButton,
  Slide,
  Divider as MuiDivider
} from '@mui/material';
import { Form, Input, DatePicker, Select, Button, Table, InputNumber, Space, Divider, Typography as AntTypography, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import moment from 'moment';
import { formatCurrency } from '../../utils/format';

const { Title } = AntTypography;
const { TextArea } = Input;
const { Option } = Select;

// Hiệu ứng transition khi mở dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const HoadonModal = ({ open, soct, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
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
    if (!open) return;
    
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
          
          form.setFieldsValue({
            ...hoa_don,
            ngaylap: moment(hoa_don.ngaylap),
            makh: hoa_don.makh,
          });
          
          setChiTietHoaDon(chi_tiet.map((item, index) => ({
            ...item,
            key: index,
          })));
        } else {
          // Khởi tạo giá trị mặc định cho form
          form.setFieldsValue({
            ngaylap: moment(),
            hinhthuctt: 'Tiền mặt',
            thuesuat: '10%'
          });
          setChiTietHoaDon([]);
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [form, isEditing, soct, open]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setChiTietHoaDon([]);
    }
  }, [open, form]);

  // Tính toán các giá trị khi chi tiết hóa đơn thay đổi
  useEffect(() => {
    // Tính tổng tiền hàng
    const tongTien = chiTietHoaDon.reduce((total, item) => {
      return total + (item.soluong * item.dongia || 0);
    }, 0);
    setTongTienHang(tongTien);
    
    // Cập nhật form với tổng tiền hàng
    form.setFieldsValue({ tiendt: tongTien });
    
    // Tính tiền thuế từ tổng tiền hàng và thuế suất
    const thueStr = form.getFieldValue('thuesuat') || '0%';
    const thueSuat = parseInt(thueStr.replace('%', '')) / 100;
    const tienThueCalc = tongTien * thueSuat;
    setTienThue(tienThueCalc);
    form.setFieldsValue({ tienthue: tienThueCalc });
    
    // Tính tiền chiết khấu nếu có
    const tyleCK = form.getFieldValue('tyleck') || '0%';
    const ckSuat = parseInt(tyleCK.replace('%', '')) / 100;
    const tienCK = tongTien * ckSuat;
    setTienChietKhau(tienCK);
    form.setFieldsValue({ tienck: tienCK });
    
    // Tính tổng thanh toán = tổng tiền hàng + thuế - chiết khấu
    const tongTT = tongTien + tienThueCalc - tienCK;
    setTongThanhToan(tongTT);
    form.setFieldsValue({ tientt: tongTT });
    
  }, [chiTietHoaDon, form]);

  // Xử lý khi chọn khách hàng
  const handleKhachHangChange = (makh) => {
    const khachHang = khachHangList.find(kh => kh.makh === makh);
    if (khachHang) {
      form.setFieldsValue({ tenkh: khachHang.tenkh });
    }
  };

  // Xử lý khi thay đổi thuế suất hoặc tỷ lệ chiết khấu
  const handleRateChange = () => {
    // Gọi lại tính toán các giá trị
    const event = new Event('input', { bubbles: true });
    document.dispatchEvent(event);
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

  // Lưu hóa đơn
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (chiTietHoaDon.length === 0) {
        message.error('Vui lòng thêm ít nhất một sản phẩm vào hóa đơn');
        return;
      }
      
      setSaving(true);
      
      try {
        const hoaDonData = {
          ...values,
          ngaylap: values.ngaylap.format('YYYY-MM-DD HH:mm:ss'),
          chi_tiet: chiTietHoaDon.map(({ key, ...item }) => item) // Loại bỏ key
        };
        
        let result;
        if (isEditing) {
          result = await axios.put(`/api/v1/hoadon/${soct}`, hoaDonData);
          message.success('Cập nhật hóa đơn thành công');
        } else {
          result = await axios.post('/api/v1/hoadon/', hoaDonData);
          message.success('Tạo hóa đơn mới thành công');
        }
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        onCancel();
      } catch (error) {
        message.error('Lỗi khi lưu hóa đơn: ' + error.message);
      } finally {
        setSaving(false);
      }
    } catch (error) {
      console.log('Validate Failed:', error);
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
    <Dialog
      open={open}
      onClose={loading || saving ? undefined : onCancel}
      fullWidth
      maxWidth="lg"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" fontWeight="bold">
            {isEditing ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới'}
          </Typography>
          {!loading && !saving && (
            <IconButton edge="end" color="inherit" onClick={onCancel} aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ thuesuat: '10%', hinhthuctt: 'Tiền mặt' }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              {/* Phần 1: Thông tin chung */}
              <Box sx={{ flex: 1, bgcolor: '#f9f9f9', p: 2, borderRadius: 2, border: '1px solid #eaeaea' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Thông tin chung</Typography>
                
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="ngaylap"
                      label="Ngày lập"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày lập' }]}
                    >
                      <DatePicker 
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                        disabled={isEditing}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="hinhthuctt"
                      label="Hình thức thanh toán"
                      rules={[{ required: true, message: 'Vui lòng chọn hình thức thanh toán' }]}
                    >
                      <Select>
                        <Option value="Tiền mặt">Tiền mặt</Option>
                        <Option value="Chuyển khoản">Chuyển khoản</Option>
                        <Option value="Thẻ tín dụng">Thẻ tín dụng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="makh"
                      label="Khách hàng"
                      rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn khách hàng"
                        optionFilterProp="children"
                        onChange={handleKhachHangChange}
                      >
                        {khachHangList.map(kh => (
                          <Option key={kh.makh} value={kh.makh}>{kh.makh} - {kh.tenkh}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="tenkh"
                      label="Tên khách hàng"
                      rules={[{ required: true, message: 'Tên khách hàng không được để trống' }]}
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="diachi"
                      label="Địa chỉ"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="nguoinhan"
                      label="Người nhận"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="dienthoai"
                      label="Điện thoại"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="diengiai"
                      label="Diễn giải"
                    >
                      <TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
              </Box>

              {/* Phần 2: Thông tin kế toán */}
              <Box sx={{ flex: 1, bgcolor: '#f9f9f9', p: 2, borderRadius: 2, border: '1px solid #eaeaea' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Thông tin kế toán</Typography>
                
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="tkno"
                      label="TK Nợ"
                      rules={[{ required: true, message: 'Vui lòng chọn tài khoản nợ' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tài khoản nợ"
                        optionFilterProp="children"
                      >
                        {taiKhoanList.map(tk => (
                          <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="tkcodt"
                      label="TK Có doanh thu"
                      rules={[{ required: true, message: 'Vui lòng chọn TK có doanh thu' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tài khoản có"
                        optionFilterProp="children"
                      >
                        {taiKhoanList.map(tk => (
                          <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="tkcothue"
                      label="TK Có thuế"
                      rules={[{ required: true, message: 'Vui lòng chọn TK có thuế' }]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tài khoản thuế"
                        optionFilterProp="children"
                      >
                        {taiKhoanList.map(tk => (
                          <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="thuesuat"
                      label="Thuế suất"
                      rules={[{ required: true, message: 'Vui lòng chọn thuế suất' }]}
                    >
                      <Select onChange={handleRateChange}>
                        <Option value="0%">0%</Option>
                        <Option value="5%">5%</Option>
                        <Option value="8%">8%</Option>
                        <Option value="10%">10%</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="tyleck"
                      label="Tỷ lệ chiết khấu"
                    >
                      <Select defaultValue="0%" onChange={handleRateChange}>
                        <Option value="0%">0%</Option>
                        <Option value="5%">5%</Option>
                        <Option value="10%">10%</Option>
                        <Option value="15%">15%</Option>
                        <Option value="20%">20%</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="tkchietkhau"
                      label="TK Chiết khấu"
                      hidden={form.getFieldValue('tyleck') === '0%' || !form.getFieldValue('tyleck')}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tài khoản chiết khấu"
                        optionFilterProp="children"
                      >
                        {taiKhoanList.map(tk => (
                          <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <MuiDivider sx={{ my: 2 }} />

                <Box sx={{ bgcolor: '#f0f5ff', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tiền hàng:</Typography>
                    <Typography fontWeight="bold">{formatCurrency(tongTienHang)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tiền thuế ({form.getFieldValue('thuesuat')}):</Typography>
                    <Typography fontWeight="bold">{formatCurrency(tienThue)}</Typography>
                  </Box>
                  
                  {form.getFieldValue('tyleck') && form.getFieldValue('tyleck') !== '0%' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Chiết khấu ({form.getFieldValue('tyleck')}):</Typography>
                      <Typography fontWeight="bold" color="error">- {formatCurrency(tienChietKhau)}</Typography>
                    </Box>
                  )}
                  
                  <MuiDivider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="bold">Tổng thanh toán:</Typography>
                    <Typography fontWeight="bold" color="primary">{formatCurrency(tongThanhToan)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Phần 3: Chi tiết hóa đơn */}
            <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 2, border: '1px solid #eaeaea', mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Chi tiết hóa đơn</Typography>
              
              <Button 
                type="dashed" 
                onClick={handleAddDetail} 
                block 
                icon={<PlusOutlined />}
                style={{ marginBottom: 16 }}
              >
                Thêm sản phẩm
              </Button>

              <Table
                columns={columns}
                dataSource={chiTietHoaDon}
                pagination={false}
                bordered
                size="small"
                scroll={{ y: 300 }}
              />
            </Box>
          </Form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <MuiButton
          variant="outlined"
          onClick={onCancel}
          disabled={loading || saving}
          startIcon={<CloseIcon />}
        >
          Hủy
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          {isEditing ? 'Cập nhật' : 'Tạo hóa đơn'}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default HoadonModal;