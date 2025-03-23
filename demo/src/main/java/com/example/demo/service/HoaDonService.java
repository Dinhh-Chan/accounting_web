package com.example.demo.service;

import com.example.demo.dto.CTHoaDonDTO;
import com.example.demo.dto.HoaDonDTO;
import com.example.demo.dto.HoaDonSearchDTO;
import com.example.demo.entity.CTHoaDon;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.KhachHang;
import com.example.demo.entity.SPDV;
import com.example.demo.repository.CTHoaDonRepository;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.KhachHangRepository;
import com.example.demo.repository.SPDVRepository;
import com.example.demo.repository.TKKTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final CTHoaDonRepository ctHoaDonRepository;
    private final KhachHangRepository khachHangRepository;
    private final SPDVRepository spdvRepository;
    private final TKKTRepository tkktRepository;
    private final BangGiaService bangGiaService;

    @Autowired
    public HoaDonService(
            HoaDonRepository hoaDonRepository,
            CTHoaDonRepository ctHoaDonRepository,
            KhachHangRepository khachHangRepository,
            SPDVRepository spdvRepository,
            TKKTRepository tkktRepository,
            BangGiaService bangGiaService) {
        this.hoaDonRepository = hoaDonRepository;
        this.ctHoaDonRepository = ctHoaDonRepository;
        this.khachHangRepository = khachHangRepository;
        this.spdvRepository = spdvRepository;
        this.tkktRepository = tkktRepository;
        this.bangGiaService = bangGiaService;
    }

    public List<HoaDon> getAllHoaDon() {
        return hoaDonRepository.findAll();
    }

    public Optional<HoaDon> getHoaDonById(String soCT) {
        return hoaDonRepository.findById(soCT);
    }

    public List<HoaDon> searchHoaDon(HoaDonSearchDTO searchDTO) {
        // Xử lý tìm kiếm linh hoạt dựa trên các tiêu chí
        if (searchDTO.getSoCT() != null && !searchDTO.getSoCT().isEmpty()) {
            return hoaDonRepository.findById(searchDTO.getSoCT())
                    .map(List::of)
                    .orElse(List.of());
        }
        
        if (searchDTO.getMaKH() != null && !searchDTO.getMaKH().isEmpty()) {
            if (searchDTO.getTuNgay() != null && searchDTO.getDenNgay() != null) {
                return hoaDonRepository.findByMaKHAndDateRange(
                        searchDTO.getMaKH(), searchDTO.getTuNgay(), searchDTO.getDenNgay());
            } else {
                return hoaDonRepository.findByMaKH(searchDTO.getMaKH());
            }
        }
        
        if (searchDTO.getTuNgay() != null && searchDTO.getDenNgay() != null) {
            return hoaDonRepository.findByNgayLapBetween(searchDTO.getTuNgay(), searchDTO.getDenNgay());
        }
        
        if (searchDTO.getHinhThucTT() != null && !searchDTO.getHinhThucTT().isEmpty()) {
            return hoaDonRepository.findByHinhThucTT(searchDTO.getHinhThucTT());
        }
        
        if (searchDTO.getTienTTMin() != null && searchDTO.getTienTTMax() != null) {
            return hoaDonRepository.findByAmountRange(searchDTO.getTienTTMin(), searchDTO.getTienTTMax());
        }
        
        // Mặc định trả về tất cả (có thể giới hạn số lượng nếu cần)
        return hoaDonRepository.findAll();
    }

    @Transactional
    public HoaDon createHoaDon(HoaDonDTO hoaDonDTO) {
        try {
            // 1. Kiểm tra dữ liệu đầu vào
            KhachHang khachHang = khachHangRepository.findById(hoaDonDTO.getMaKH())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với mã: " + hoaDonDTO.getMaKH()));
            
            validateTaiKhoan(hoaDonDTO);
            validateChiTiet(hoaDonDTO.getChiTietList());
            
            // 2. Tạo mã hóa đơn tự động nếu chưa có
            if (hoaDonDTO.getSoCT() == null || hoaDonDTO.getSoCT().isEmpty()) {
                String newSoCT = hoaDonRepository.generateNewSoCT();
                hoaDonDTO.setSoCT(newSoCT);
            } else if (hoaDonRepository.existsById(hoaDonDTO.getSoCT())) {
                throw new RuntimeException("Số chứng từ đã tồn tại: " + hoaDonDTO.getSoCT());
            }

            // 3. Tạo entity HoaDon
            HoaDon hoaDon = new HoaDon();
            hoaDon.setSoCT(hoaDonDTO.getSoCT());
            hoaDon.setNgayLap(hoaDonDTO.getNgayLap() != null ? hoaDonDTO.getNgayLap() : LocalDateTime.now());
            hoaDon.setMaKH(hoaDonDTO.getMaKH());
            hoaDon.setTenKH(khachHang.getTenKH());  // Lấy tên KH từ entity KhachHang
            hoaDon.setHinhThucTT(hoaDonDTO.getHinhThucTT());
            hoaDon.setTkNo(hoaDonDTO.getTkNo());
            hoaDon.setDienGiai(hoaDonDTO.getDienGiai());
            hoaDon.setTkCoDT(hoaDonDTO.getTkCoDT());
            hoaDon.setTkCoThue(hoaDonDTO.getTkCoThue());
            hoaDon.setThueSuat(hoaDonDTO.getThueSuat());
            hoaDon.setTyLeCK(hoaDonDTO.getTyLeCK());
            hoaDon.setTkChietKhau(hoaDonDTO.getTkChietKhau());
            
            // 4. Tạo các chi tiết hóa đơn
            List<CTHoaDon> chiTietList = new ArrayList<>();
            BigDecimal tongTienHang = BigDecimal.ZERO;
            
            for (CTHoaDonDTO ctDTO : hoaDonDTO.getChiTietList()) {
                SPDV spdv = spdvRepository.findById(ctDTO.getMaSPDV())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + ctDTO.getMaSPDV()));
                
                CTHoaDon ctHoaDon = new CTHoaDon();
                ctHoaDon.setSoCT(hoaDon.getSoCT());
                ctHoaDon.setMaSPDV(ctDTO.getMaSPDV());
                ctHoaDon.setSoLuong(ctDTO.getSoLuong());
                ctHoaDon.setDvt(ctDTO.getDvt() != null ? ctDTO.getDvt() : spdv.getDvt());
                
                // Sử dụng đơn giá nhập vào hoặc lấy từ bảng giá nếu chưa có
                if (ctDTO.getDonGia() == null || ctDTO.getDonGia().compareTo(BigDecimal.ZERO) == 0) {
                    bangGiaService.getLatestValidPrice(ctDTO.getMaSPDV(), hoaDon.getNgayLap())
                            .ifPresentOrElse(
                                    bangGia -> ctHoaDon.setDonGia(bangGia.getGiaBan()),
                                    () -> ctHoaDon.setDonGia(spdv.getDonGia())
                            );
                } else {
                    ctHoaDon.setDonGia(ctDTO.getDonGia());
                }
                
                // Tính thành tiền và cộng vào tổng tiền hàng
                BigDecimal thanhTien = ctHoaDon.getSoLuong().multiply(ctHoaDon.getDonGia());
                tongTienHang = tongTienHang.add(thanhTien);
                
                ctHoaDon.setHoaDon(hoaDon);
                chiTietList.add(ctHoaDon);
            }
            
            // 5. Tính toán các giá trị tài chính
            // 5.1. Tính tiền chiết khấu
            BigDecimal tienCK = BigDecimal.ZERO;
            if (hoaDonDTO.getTyLeCK() != null && !hoaDonDTO.getTyLeCK().isEmpty()) {
                try {
                    // Xử lý tỷ lệ CK có thể có dạng "10%" hoặc "10"
                    String tyLeCKStr = hoaDonDTO.getTyLeCK().replace("%", "");
                    BigDecimal tyLeCK = new BigDecimal(tyLeCKStr);
                    tienCK = tongTienHang.multiply(tyLeCK).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Tỷ lệ chiết khấu không hợp lệ: " + hoaDonDTO.getTyLeCK());
                }
            }
            
            // 5.2. Tính tiền thuế
            BigDecimal tienThue = BigDecimal.ZERO;
            if (hoaDonDTO.getThueSuat() != null && !hoaDonDTO.getThueSuat().isEmpty() && 
                    hoaDonDTO.getTkCoThue() != null && !hoaDonDTO.getTkCoThue().isEmpty()) {
                try {
                    // Xử lý thuế suất có thể có dạng "10%" hoặc "10"
                    String thueSuatStr = hoaDonDTO.getThueSuat().replace("%", "");
                    BigDecimal thueSuat = new BigDecimal(thueSuatStr);
                    BigDecimal tienSauCK = tongTienHang.subtract(tienCK);
                    tienThue = tienSauCK.multiply(thueSuat).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Thuế suất không hợp lệ: " + hoaDonDTO.getThueSuat());
                }
            }
            
            // 5.3. Tính tiền doanh thu và tiền thanh toán
            BigDecimal tienDT = tongTienHang.subtract(tienCK);
            BigDecimal tienTT = tienDT.add(tienThue);
            
            // 6. Cập nhật các giá trị tài chính vào hóa đơn
            hoaDon.setTienCK(tienCK);
            hoaDon.setTienThue(tienThue);
            hoaDon.setTienDT(tienDT);
            hoaDon.setTienTT(tienTT);
            
            // 7. Lưu hóa đơn và chi tiết
            hoaDon.setCtHoaDons(chiTietList);
            
            return hoaDonRepository.save(hoaDon);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu hóa đơn: " + e.getMessage());
        }
    }

    @Transactional
    public HoaDon updateHoaDon(String soCT, HoaDonDTO hoaDonDTO) {
        try {
            HoaDon hoaDon = hoaDonRepository.findById(soCT)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với số chứng từ: " + soCT));
            
            // Kiểm tra dữ liệu đầu vào
            validateTaiKhoan(hoaDonDTO);
            validateChiTiet(hoaDonDTO.getChiTietList());
            
            // Không cho phép thay đổi mã hóa đơn
            if (!soCT.equals(hoaDonDTO.getSoCT())) {
                throw new RuntimeException("Không thể thay đổi số chứng từ hóa đơn");
            }
            
            // Không cho phép thay đổi khách hàng
            if (!hoaDon.getMaKH().equals(hoaDonDTO.getMaKH())) {
                throw new RuntimeException("Không thể thay đổi khách hàng của hóa đơn");
            }

            // Cập nhật thông tin hóa đơn
            hoaDon.setNgayLap(hoaDonDTO.getNgayLap());
            hoaDon.setHinhThucTT(hoaDonDTO.getHinhThucTT());
            hoaDon.setTkNo(hoaDonDTO.getTkNo());
            hoaDon.setDienGiai(hoaDonDTO.getDienGiai());
            hoaDon.setTkCoDT(hoaDonDTO.getTkCoDT());
            hoaDon.setTkCoThue(hoaDonDTO.getTkCoThue());
            hoaDon.setThueSuat(hoaDonDTO.getThueSuat());
            hoaDon.setTyLeCK(hoaDonDTO.getTyLeCK());
            hoaDon.setTkChietKhau(hoaDonDTO.getTkChietKhau());
            
            // Xóa chi tiết hóa đơn cũ và tạo lại chi tiết mới
            hoaDon.getCtHoaDons().clear();
            
            // Tạo chi tiết mới và tính lại các giá trị tài chính
            BigDecimal tongTienHang = BigDecimal.ZERO;
            
            for (CTHoaDonDTO ctDTO : hoaDonDTO.getChiTietList()) {
                SPDV spdv = spdvRepository.findById(ctDTO.getMaSPDV())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + ctDTO.getMaSPDV()));
                
                CTHoaDon ctHoaDon = new CTHoaDon();
                ctHoaDon.setSoCT(hoaDon.getSoCT());
                ctHoaDon.setMaSPDV(ctDTO.getMaSPDV());
                ctHoaDon.setSoLuong(ctDTO.getSoLuong());
                ctHoaDon.setDvt(ctDTO.getDvt() != null ? ctDTO.getDvt() : spdv.getDvt());
                ctHoaDon.setDonGia(ctDTO.getDonGia() != null ? ctDTO.getDonGia() : spdv.getDonGia());
                
                // Tính thành tiền và cộng vào tổng tiền hàng
                BigDecimal thanhTien = ctHoaDon.getSoLuong().multiply(ctHoaDon.getDonGia());
                tongTienHang = tongTienHang.add(thanhTien);
                
                hoaDon.addCTHoaDon(ctHoaDon);
            }
            
            // Tính lại các giá trị tài chính
            // Tính tiền chiết khấu
            BigDecimal tienCK = BigDecimal.ZERO;
            if (hoaDonDTO.getTyLeCK() != null && !hoaDonDTO.getTyLeCK().isEmpty()) {
                try {
                    String tyLeCKStr = hoaDonDTO.getTyLeCK().replace("%", "");
                    BigDecimal tyLeCK = new BigDecimal(tyLeCKStr);
                    tienCK = tongTienHang.multiply(tyLeCK).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Tỷ lệ chiết khấu không hợp lệ: " + hoaDonDTO.getTyLeCK());
                }
            }
            
            // Tính tiền thuế
            BigDecimal tienThue = BigDecimal.ZERO;
            if (hoaDonDTO.getThueSuat() != null && !hoaDonDTO.getThueSuat().isEmpty() && 
                    hoaDonDTO.getTkCoThue() != null && !hoaDonDTO.getTkCoThue().isEmpty()) {
                try {
                    String thueSuatStr = hoaDonDTO.getThueSuat().replace("%", "");
                    BigDecimal thueSuat = new BigDecimal(thueSuatStr);
                    BigDecimal tienSauCK = tongTienHang.subtract(tienCK);
                    tienThue = tienSauCK.multiply(thueSuat).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Thuế suất không hợp lệ: " + hoaDonDTO.getThueSuat());
                }
            }
            
            // Tính tiền doanh thu và tiền thanh toán
            BigDecimal tienDT = tongTienHang.subtract(tienCK);
            BigDecimal tienTT = tienDT.add(tienThue);
            
            // Cập nhật các giá trị tài chính vào hóa đơn
            hoaDon.setTienCK(tienCK);
            hoaDon.setTienThue(tienThue);
            hoaDon.setTienDT(tienDT);
            hoaDon.setTienTT(tienTT);
            
            return hoaDonRepository.save(hoaDon);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu hóa đơn: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteHoaDon(String soCT) {
        try {
            HoaDon hoaDon = hoaDonRepository.findById(soCT)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với số chứng từ: " + soCT));
            
            // Kiểm tra xem hóa đơn đã có phiếu giảm giá hay chưa
            if (!hoaDon.getPhieuGiamGias().isEmpty()) {
                throw new RuntimeException("Không thể xóa hóa đơn đã có phiếu giảm giá!");
            }
            
            hoaDonRepository.delete(hoaDon);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi xóa hóa đơn: " + e.getMessage());
        }
    }
    
    // Các phương thức thống kê và báo cáo
    public Map<String, Object> getRevenueStatistics(LocalDateTime tuNgay, LocalDateTime denNgay) {
        Map<String, Object> result = new java.util.HashMap<>();
        
        BigDecimal totalRevenue = hoaDonRepository.getTotalRevenueByDateRange(tuNgay, denNgay);
        BigDecimal totalDiscount = hoaDonRepository.getTotalDiscountByDateRange(tuNgay, denNgay);
        BigDecimal totalTax = hoaDonRepository.getTotalTaxByDateRange(tuNgay, denNgay);
        
        result.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        result.put("totalDiscount", totalDiscount != null ? totalDiscount : BigDecimal.ZERO);
        result.put("totalTax", totalTax != null ? totalTax : BigDecimal.ZERO);
        
        return result;
    }
    
    public List<Map<String, Object>> getRevenueByCustomer(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> results = hoaDonRepository.getRevenueByCustomer(tuNgay, denNgay);
        
        return results.stream().map(row -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("maKH", row[0]);
            item.put("tenKH", row[1]);
            item.put("doanhThu", row[2]);
            return item;
        }).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getRevenueByProduct(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> results = hoaDonRepository.getRevenueByProduct(tuNgay, denNgay);
        
        return results.stream().map(row -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("maSPDV", row[0]);
            item.put("tenSPDV", row[1]);
            item.put("soLuong", row[2]);
            item.put("doanhThu", row[3]);
            return item;
        }).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getRevenueByPaymentMethod(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> results = hoaDonRepository.getRevenueByPaymentMethod(tuNgay, denNgay);
        
        return results.stream().map(row -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("hinhThucTT", row[0]);
            item.put("soLuong", row[1]);
            item.put("doanhThu", row[2]);
            return item;
        }).collect(Collectors.toList());
    }
    
    // Các phương thức hỗ trợ
    private void validateTaiKhoan(HoaDonDTO hoaDonDTO) {
        // Kiểm tra tài khoản nợ
        if (!tkktRepository.existsById(hoaDonDTO.getTkNo())) {
            throw new RuntimeException("Tài khoản nợ không tồn tại: " + hoaDonDTO.getTkNo());
        }
        
        // Kiểm tra tài khoản có doanh thu
        if (!tkktRepository.existsById(hoaDonDTO.getTkCoDT())) {
            throw new RuntimeException("Tài khoản có doanh thu không tồn tại: " + hoaDonDTO.getTkCoDT());
        }
        
        // Kiểm tra tài khoản có thuế (nếu có)
        if (hoaDonDTO.getTkCoThue() != null && !hoaDonDTO.getTkCoThue().isEmpty() && 
                !tkktRepository.existsById(hoaDonDTO.getTkCoThue())) {
            throw new RuntimeException("Tài khoản có thuế không tồn tại: " + hoaDonDTO.getTkCoThue());
        }
        
        // Kiểm tra tài khoản chiết khấu (nếu có)
        if (hoaDonDTO.getTkChietKhau() != null && !hoaDonDTO.getTkChietKhau().isEmpty() && 
                !tkktRepository.existsById(hoaDonDTO.getTkChietKhau())) {
            throw new RuntimeException("Tài khoản chiết khấu không tồn tại: " + hoaDonDTO.getTkChietKhau());
        }
    }
    
    private void validateChiTiet(List<CTHoaDonDTO> chiTietList) {
        // Kiểm tra danh sách chi tiết không được rỗng
        if (chiTietList == null || chiTietList.isEmpty()) {
            throw new RuntimeException("Hóa đơn phải có ít nhất một dòng chi tiết");
        }
        
        // Kiểm tra mỗi sản phẩm/dịch vụ trong chi tiết
        for (CTHoaDonDTO ctDTO : chiTietList) {
            if (!spdvRepository.existsById(ctDTO.getMaSPDV())) {
                throw new RuntimeException("Sản phẩm/dịch vụ không tồn tại: " + ctDTO.getMaSPDV());
            }
            
            if (ctDTO.getSoLuong() == null || ctDTO.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
        }
    }
}