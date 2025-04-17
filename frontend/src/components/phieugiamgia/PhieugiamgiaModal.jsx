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
  Slide
} from '@mui/material';
import { Form, Input, DatePicker, Select, Button, Table, InputNumber, Space, Divider, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import moment from 'moment';
import { formatCurrency } from '../../utils/format';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Hiệu ứng transition khi mở dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PhieugiamgiaModal = ({ open, sophieu, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const isEditing = !!sophieu;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [khachHangList, setKhachHangList] = useState([]);
  const [hoaDonList, setHoaDonList] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [taiKhoanList, setTaiKhoanList] = useState([]);
  const [chiTietPhieu, setChiTietPhieu] = useState([]);
  
  // Các giá trị tính toán
  const [tongTienHang, setTongTienHang] = useState(0);
  const [tienThue, setTienThue] = useState(0);
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
        
        // Lấy danh sách hóa đơn
        const hdRes = await axios.get('/api/v1/hoadon/');
        setHoaDonList(hdRes.data);
        
        // Lấy danh sách sản phẩm/dịch vụ
        const spRes = await axios.get('/api/v1/sanpham/');
        setSanPhamList(spRes.data);
        
        // Lấy danh sách tài khoản kế toán
        const tkRes = await axios.get('/api/v1/tkkt/');
        setTaiKhoanList(tkRes.data);
        
        // Nếu đang chỉnh sửa, lấy dữ liệu phiếu giảm giá
        if (isEditing) {
          const pgRes = await axios.get(`/api/v1/phieugiamgia/${sophieu}`);
          const { phieu_giam_gia, chi_tiet } = pgRes.data;
          
          form.setFieldsValue({
            ...phieu_giam_gia,
            ngaylap: moment(phieu_giam_gia.ngaylap),
            makh: phieu_giam_gia.makh,
            soct: phieu_giam_gia.soct,
          });
          
          setChiTietPhieu(chi_tiet.map((item, index) => ({
            ...item,
            key: index,
          })));
        } else {
          // Khởi tạo giá trị mặc định cho form
          form.setFieldsValue({
            ngaylap: moment(),
            thuesuat: 10
          });
          setChiTietPhieu([]);
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [form, isEditing, sophieu, open]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setChiTietPhieu([]);
    }
  }, [open, form]);

  // Tính toán các giá trị khi chi tiết phiếu thay đổi
  useEffect(() => {
    // Tính tổng tiền hàng
    const tongTien = chiTietPhieu.reduce((total, item) => {
      return total + (item.soluong * item.dongia || 0);
    }, 0);
    setTongTienHang(tongTien);
    
    // Cập nhật form với tổng tiền hàng
    form.setFieldsValue({ tiendt: tongTien });
    
    // Tính tiền thuế từ tổng tiền hàng và thuế suất
    const thueSuat = form.getFieldValue('thuesuat') || 0;
    const tienThueCalc = tongTien * (thueSuat / 100);
    setTienThue(tienThueCalc);
    form.setFieldsValue({ tienthue: tienThueCalc });
    
    // Tính tổng thanh toán = tổng tiền hàng + thuế
    const tongTT = tongTien + tienThueCalc;
    setTongThanhToan(tongTT);
    form.setFieldsValue({ tientt: tongTT });
    
  }, [chiTietPhieu, form]);

  // Xử lý khi chọn khách hàng
  const handleKhachHangChange = (makh) => {
    const khachHang = khachHangList.find(kh => kh.makh === makh);
    if (khachHang) {
      form.setFieldsValue({ tenkh: khachHang.tenkh });
    }
  };

  // Xử lý khi thay đổi thuế suất
  const handleThueChange = (value) => {
    // Gọi lại tính toán các giá trị
    const event = new Event('input', { bubbles: true });
    document.dispatchEvent(event);
  };

  // Thêm một dòng chi tiết phiếu mới
  const handleAddDetail = () => {
    const newDetail = {
      key: chiTietPhieu.length,
      maspdv: '',
      tensp: '',
      dvt: '',
      soluong: 1,
      dongia: 0,
      thanhtien: 0
    };
    setChiTietPhieu([...chiTietPhieu, newDetail]);
  };

  // Xóa một dòng chi tiết phiếu
  const handleDeleteDetail = (key) => {
    setChiTietPhieu(chiTietPhieu.filter(item => item.key !== key));
  };

  // Cập nhật dữ liệu một dòng chi tiết
  const handleDetailChange = (key, field, value) => {
    const newData = [...chiTietPhieu];
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
      
      setChiTietPhieu(newData);
    }
  };

  // Lưu phiếu giảm giá
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (chiTietPhieu.length === 0) {
        message.error('Vui lòng thêm ít nhất một sản phẩm vào phiếu giảm giá');
        return;
      }
      
      setSaving(true);
      
      try {
        const phieuData = {
          ...values,
          ngaylap: values.ngaylap.format('YYYY-MM-DD HH:mm:ss'),
          chi_tiet: chiTietPhieu.map(({ key, ...item }) => item) // Loại bỏ key
        };
        
        let result;
        if (isEditing) {
          result = await axios.put(`/api/v1/phieugiamgia/${sophieu}`, phieuData);
          message.success('Cập nhật phiếu giảm giá thành công');
        } else {
          result = await axios.post('/api/v1/phieugiamgia/', phieuData);
          message.success('Tạo phiếu giảm giá mới thành công');
        }
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        onCancel();
      } catch (error) {
        message.error('Lỗi khi lưu phiếu giảm giá: ' + error.message);
      } finally {
        setSaving(false);
      }
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  // Cấu hình bảng chi tiết phiếu
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
            {isEditing ? 'Sửa phiếu giảm giá' : 'Tạo phiếu giảm giá mới'}
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
            initialValues={{ thuesuat: 10 }}
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={12}>
                <Form.Item
                  name="soct"
                  label="Số hóa đơn"
                  rules={[{ required: true, message: 'Vui lòng chọn số hóa đơn' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn hóa đơn"
                    optionFilterProp="children"
                  >
                    {hoaDonList.map(hd => (
                      <Option key={hd.soct} value={hd.soct}>{hd.soct}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={8}>
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
              <Col xs={24} sm={16}>
                <Form.Item
                  name="tenkh"
                  label="Tên khách hàng"
                  rules={[{ required: true, message: 'Tên khách hàng không được để trống' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="tknogiamtru"
                  label="TK Nợ giảm trừ"
                  rules={[{ required: true, message: 'Vui lòng chọn tài khoản nợ giảm trừ' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn tài khoản nợ giảm trừ"
                    optionFilterProp="children"
                  >
                    {taiKhoanList.map(tk => (
                      <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="diengiai"
                  label="Diễn giải"
                >
                  <TextArea rows={1} />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Chi tiết phiếu giảm giá</Divider>

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
              dataSource={chiTietPhieu}
              pagination={false}
              bordered
              size="small"
              scroll={{ y: 300 }}
            />

            <Divider>Thông tin thanh toán</Divider>

            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tknothue"
                  label="TK Nợ thuế"
                  rules={[{ required: true, message: 'Vui lòng chọn TK nợ thuế' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn tài khoản nợ thuế"
                    optionFilterProp="children"
                  >
                    {taiKhoanList.map(tk => (
                      <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tkcott"
                  label="TK Có thanh toán"
                  rules={[{ required: true, message: 'Vui lòng chọn TK có thanh toán' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn tài khoản có thanh toán"
                    optionFilterProp="children"
                  >
                    {taiKhoanList.map(tk => (
                      <Option key={tk.matk} value={tk.matk}>{tk.matk} - {tk.tentk}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tiendt"
                  label="Tiền doanh thu"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="thuesuat"
                  label="Thuế suất (%)"
                  rules={[{ required: true, message: 'Vui lòng chọn thuế suất' }]}
                >
                  <Select onChange={handleThueChange}>
                    <Option value={0}>0%</Option>
                    <Option value={5}>5%</Option>
                    <Option value={8}>8%</Option>
                    <Option value={10}>10%</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tienthue"
                  label="Tiền thuế"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="tientt"
                  label="Tổng thanh toán"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
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
          {isEditing ? 'Cập nhật' : 'Tạo phiếu giảm giá'}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default PhieugiamgiaModal; 