package com.example.demo.service;

import com.example.demo.dto.CTPhieuDTO;
import com.example.demo.dto.PhieuGiamGiaDTO;
import com.example.demo.dto.PhieuGiamGiaSearchDTO;
import com.example.demo.entity.CTPhieu;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.KhachHang;
import com.example.demo.entity.PhieuGiamGia;
import com.example.demo.entity.SPDV;
import com.example.demo.repository.CTPhieuRepository;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.KhachHangRepository;
import com.example.demo.repository.PhieuGiamGiaRepository;
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
public class PhieuGiamGiaService {

    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final CTPhieuRepository ctPhieuRepository;
    private final KhachHangRepository khachHangRepository;
    private final SPDVRepository spdvRepository;
    private final TKKTRepository tkktRepository;
    private final HoaDonRepository hoaDonRepository;

    @Autowired
    public PhieuGiamGiaService(
            PhieuGiamGiaRepository phieuGiamGiaRepository,
            CTPhieuRepository ctPhieuRepository,
            KhachHangRepository khachHangRepository,
            SPDVRepository spdvRepository,
            TKKTRepository tkktRepository,
            HoaDonRepository hoaDonRepository) {
        this.phieuGiamGiaRepository = phieuGiamGiaRepository;
        this.ctPhieuRepository = ctPhieuRepository;
        this.khachHangRepository = khachHangRepository;
        this.spdvRepository = spdvRepository;
        this.tkktRepository = tkktRepository;
        this.hoaDonRepository = hoaDonRepository;
    }

    public List<PhieuGiamGia> getAllPhieuGiamGia() {
        return phieuGiamGiaRepository.findAll();
    }

    public Optional<PhieuGiamGia> getPhieuGiamGiaById(String soPhieu) {
        return phieuGiamGiaRepository.findById(soPhieu);
    }

    public List<PhieuGiamGia> searchPhieuGiamGia(PhieuGiamGiaSearchDTO searchDTO) {
        // Xử lý tìm kiếm linh hoạt dựa trên các tiêu chí
        if (searchDTO.getSoPhieu() != null && !searchDTO.getSoPhieu().isEmpty()) {
            return phieuGiamGiaRepository.findById(searchDTO.getSoPhieu())
                    .map(List::of)
                    .orElse(List.of());
        }
        
        if (searchDTO.getSoCT() != null && !searchDTO.getSoCT().isEmpty()) {
            return phieuGiamGiaRepository.findBySoCT(searchDTO.getSoCT());
        }
        
        if (searchDTO.getMaKH() != null && !searchDTO.getMaKH().isEmpty()) {
            if (searchDTO.getTuNgay() != null && searchDTO.getDenNgay() != null) {
                return phieuGiamGiaRepository.findByMaKHAndDateRange(
                        searchDTO.getMaKH(), searchDTO.getTuNgay(), searchDTO.getDenNgay());
            } else {
                return phieuGiamGiaRepository.findByMaKH(searchDTO.getMaKH());
            }
        }
        
        if (searchDTO.getTuNgay() != null && searchDTO.getDenNgay() != null) {
            return phieuGiamGiaRepository.findByNgayLapBetween(searchDTO.getTuNgay(), searchDTO.getDenNgay());
        }
        
        if (searchDTO.getTienGiamMin() != null && searchDTO.getTienGiamMax() != null) {
            return phieuGiamGiaRepository.findByAmountRange(searchDTO.getTienGiamMin(), searchDTO.getTienGiamMax());
        }
        
        // Mặc định trả về tất cả (có thể giới hạn số lượng nếu cần)
        return phieuGiamGiaRepository.findAll();
    }

    @Transactional
    public PhieuGiamGia createPhieuGiamGia(PhieuGiamGiaDTO phieuGiamGiaDTO) {
        try {
            // 1. Kiểm tra dữ liệu đầu vào
            HoaDon hoaDon = hoaDonRepository.findById(phieuGiamGiaDTO.getSoCT())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với số chứng từ: " + phieuGiamGiaDTO.getSoCT()));
            
            // Kiểm tra khách hàng và đảm bảo khớp với hóa đơn
            if (!hoaDon.getMaKH().equals(phieuGiamGiaDTO.getMaKH())) {
                throw new RuntimeException("Mã khách hàng không khớp với hóa đơn!");
            }
            
            KhachHang khachHang = khachHangRepository.findById(phieuGiamGiaDTO.getMaKH())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với mã: " + phieuGiamGiaDTO.getMaKH()));
            
            validateTaiKhoan(phieuGiamGiaDTO);
            validateChiTiet(phieuGiamGiaDTO.getChiTietList());
            
            // 2. Tạo mã phiếu giảm giá tự động nếu chưa có
            if (phieuGiamGiaDTO.getSoPhieu() == null || phieuGiamGiaDTO.getSoPhieu().isEmpty()) {
                String newSoPhieu = phieuGiamGiaRepository.generateNewSoPhieu();
                phieuGiamGiaDTO.setSoPhieu(newSoPhieu);
            } else if (phieuGiamGiaRepository.existsById(phieuGiamGiaDTO.getSoPhieu())) {
                throw new RuntimeException("Số phiếu đã tồn tại: " + phieuGiamGiaDTO.getSoPhieu());
            }

            // 3. Tạo entity PhieuGiamGia
            PhieuGiamGia phieuGiamGia = new PhieuGiamGia();
            phieuGiamGia.setSoPhieu(phieuGiamGiaDTO.getSoPhieu());
            phieuGiamGia.setNgayLap(phieuGiamGiaDTO.getNgayLap() != null ? phieuGiamGiaDTO.getNgayLap() : LocalDateTime.now());
            phieuGiamGia.setMaKH(phieuGiamGiaDTO.getMaKH());
            phieuGiamGia.setDienGiai(phieuGiamGiaDTO.getDienGiai());
            phieuGiamGia.setTkNoGiamTru(phieuGiamGiaDTO.getTkNoGiamTru());
            phieuGiamGia.setTkCoTT(phieuGiamGiaDTO.getTkCoTT());
            phieuGiamGia.setSoCT(phieuGiamGiaDTO.getSoCT());
            phieuGiamGia.setThueSuat(phieuGiamGiaDTO.getThueSuat());
            phieuGiamGia.setTkNoThue(phieuGiamGiaDTO.getTkNoThue());
            
            // 4. Tạo các chi tiết phiếu
            List<CTPhieu> chiTietList = new ArrayList<>();
            BigDecimal tongTienGiam = BigDecimal.ZERO;
            
            for (CTPhieuDTO ctDTO : phieuGiamGiaDTO.getChiTietList()) {
                SPDV spdv = spdvRepository.findById(ctDTO.getMaSPDV())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + ctDTO.getMaSPDV()));
                
                // Kiểm tra xem sản phẩm/dịch vụ này có trong hóa đơn không
                boolean productInInvoice = hoaDon.getCtHoaDons().stream()
                        .anyMatch(ct -> ct.getMaSPDV().equals(ctDTO.getMaSPDV()));
                
                if (!productInInvoice) {
                    throw new RuntimeException("Sản phẩm/dịch vụ " + spdv.getTenSPDV() + " không có trong hóa đơn!");
                }
                
                CTPhieu ctPhieu = new CTPhieu();
                ctPhieu.setSoPhieu(phieuGiamGia.getSoPhieu());
                ctPhieu.setMaSPDV(ctDTO.getMaSPDV());
                ctPhieu.setSoLuong(ctDTO.getSoLuong());
                ctPhieu.setDvt(ctDTO.getDvt() != null ? ctDTO.getDvt() : spdv.getDvt());
                ctPhieu.setDonGia(ctDTO.getDonGia());
                
                // Tính thành tiền và cộng vào tổng tiền giảm
                BigDecimal thanhTien = ctPhieu.getSoLuong().multiply(ctPhieu.getDonGia());
                tongTienGiam = tongTienGiam.add(thanhTien);
                
                ctPhieu.setPhieuGiamGia(phieuGiamGia);
                chiTietList.add(ctPhieu);
            }
            
            // 5. Tính toán các giá trị tài chính
            // 5.1. Tính tiền thuế
            BigDecimal tienThue = BigDecimal.ZERO;
            if (phieuGiamGiaDTO.getThueSuat() != null && !phieuGiamGiaDTO.getThueSuat().isEmpty() && 
                    phieuGiamGiaDTO.getTkNoThue() != null && !phieuGiamGiaDTO.getTkNoThue().isEmpty()) {
                try {
                    // Xử lý thuế suất có thể có dạng "10%" hoặc "10"
                    String thueSuatStr = phieuGiamGiaDTO.getThueSuat().replace("%", "");
                    BigDecimal thueSuat = new BigDecimal(thueSuatStr);
                    tienThue = tongTienGiam.multiply(thueSuat).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Thuế suất không hợp lệ: " + phieuGiamGiaDTO.getThueSuat());
                }
            }
            
            // 5.2. Tính tiền doanh thu và tiền thanh toán
            BigDecimal tienDT = tongTienGiam;
            BigDecimal tienTT = tienDT.add(tienThue);
            
            // 6. Cập nhật các giá trị tài chính vào phiếu giảm giá
            phieuGiamGia.setTienThue(tienThue);
            phieuGiamGia.setTienDT(tienDT);
            phieuGiamGia.setTienTT(tienTT);
            
            // 7. Lưu phiếu giảm giá và chi tiết
            phieuGiamGia.setCtPhieus(chiTietList);
            
            return phieuGiamGiaRepository.save(phieuGiamGia);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu phiếu giảm giá: " + e.getMessage());
        }
    }

    @Transactional
    public PhieuGiamGia updatePhieuGiamGia(String soPhieu, PhieuGiamGiaDTO phieuGiamGiaDTO) {
        try {
            PhieuGiamGia phieuGiamGia = phieuGiamGiaRepository.findById(soPhieu)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giảm giá với số phiếu: " + soPhieu));
            
            // Kiểm tra dữ liệu đầu vào
            HoaDon hoaDon = hoaDonRepository.findById(phieuGiamGiaDTO.getSoCT())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với số chứng từ: " + phieuGiamGiaDTO.getSoCT()));
            
            // Kiểm tra khách hàng và đảm bảo khớp với hóa đơn
            if (!hoaDon.getMaKH().equals(phieuGiamGiaDTO.getMaKH())) {
                throw new RuntimeException("Mã khách hàng không khớp với hóa đơn!");
            }
            
            validateTaiKhoan(phieuGiamGiaDTO);
            validateChiTiet(phieuGiamGiaDTO.getChiTietList());
            
            // Không cho phép thay đổi mã phiếu
            if (!soPhieu.equals(phieuGiamGiaDTO.getSoPhieu())) {
                throw new RuntimeException("Không thể thay đổi số phiếu giảm giá");
            }
            
            // Không cho phép thay đổi hóa đơn
            if (!phieuGiamGia.getSoCT().equals(phieuGiamGiaDTO.getSoCT())) {
                throw new RuntimeException("Không thể thay đổi hóa đơn của phiếu giảm giá");
            }
            
            // Không cho phép thay đổi khách hàng
            if (!phieuGiamGia.getMaKH().equals(phieuGiamGiaDTO.getMaKH())) {
                throw new RuntimeException("Không thể thay đổi khách hàng của phiếu giảm giá");
            }

            // Cập nhật thông tin phiếu giảm giá
            phieuGiamGia.setNgayLap(phieuGiamGiaDTO.getNgayLap());
            phieuGiamGia.setDienGiai(phieuGiamGiaDTO.getDienGiai());
            phieuGiamGia.setTkNoGiamTru(phieuGiamGiaDTO.getTkNoGiamTru());
            phieuGiamGia.setTkCoTT(phieuGiamGiaDTO.getTkCoTT());
            phieuGiamGia.setThueSuat(phieuGiamGiaDTO.getThueSuat());
            phieuGiamGia.setTkNoThue(phieuGiamGiaDTO.getTkNoThue());
            
            // Xóa chi tiết phiếu cũ và tạo lại chi tiết mới
            phieuGiamGia.getCtPhieus().clear();
            
            // Tạo chi tiết mới và tính lại các giá trị tài chính
            BigDecimal tongTienGiam = BigDecimal.ZERO;
            
            for (CTPhieuDTO ctDTO : phieuGiamGiaDTO.getChiTietList()) {
                SPDV spdv = spdvRepository.findById(ctDTO.getMaSPDV())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + ctDTO.getMaSPDV()));
                
                // Kiểm tra xem sản phẩm/dịch vụ này có trong hóa đơn không
                boolean productInInvoice = hoaDon.getCtHoaDons().stream()
                        .anyMatch(ct -> ct.getMaSPDV().equals(ctDTO.getMaSPDV()));
                
                if (!productInInvoice) {
                    throw new RuntimeException("Sản phẩm/dịch vụ " + spdv.getTenSPDV() + " không có trong hóa đơn!");
                }
                
                CTPhieu ctPhieu = new CTPhieu();
                ctPhieu.setSoPhieu(phieuGiamGia.getSoPhieu());
                ctPhieu.setMaSPDV(ctDTO.getMaSPDV());
                ctPhieu.setSoLuong(ctDTO.getSoLuong());
                ctPhieu.setDvt(ctDTO.getDvt() != null ? ctDTO.getDvt() : spdv.getDvt());
                ctPhieu.setDonGia(ctDTO.getDonGia());
                
                // Tính thành tiền và cộng vào tổng tiền giảm
                BigDecimal thanhTien = ctPhieu.getSoLuong().multiply(ctPhieu.getDonGia());
                tongTienGiam = tongTienGiam.add(thanhTien);
                
                phieuGiamGia.addCTPhieu(ctPhieu);
            }
            
            // Tính lại các giá trị tài chính
            // Tính tiền thuế
            BigDecimal tienThue = BigDecimal.ZERO;
            if (phieuGiamGiaDTO.getThueSuat() != null && !phieuGiamGiaDTO.getThueSuat().isEmpty() && 
                    phieuGiamGiaDTO.getTkNoThue() != null && !phieuGiamGiaDTO.getTkNoThue().isEmpty()) {
                try {
                    String thueSuatStr = phieuGiamGiaDTO.getThueSuat().replace("%", "");
                    BigDecimal thueSuat = new BigDecimal(thueSuatStr);
                    tienThue = tongTienGiam.multiply(thueSuat).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Thuế suất không hợp lệ: " + phieuGiamGiaDTO.getThueSuat());
                }
            }
            
            // Tính tiền doanh thu và tiền thanh toán
            BigDecimal tienDT = tongTienGiam;
            BigDecimal tienTT = tienDT.add(tienThue);
            
            // Cập nhật các giá trị tài chính vào phiếu giảm giá
            phieuGiamGia.setTienThue(tienThue);
            phieuGiamGia.setTienDT(tienDT);
            phieuGiamGia.setTienTT(tienTT);
            
            return phieuGiamGiaRepository.save(phieuGiamGia);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu phiếu giảm giá: " + e.getMessage());
        }
    }

    @Transactional
    public void deletePhieuGiamGia(String soPhieu) {
        try {
            PhieuGiamGia phieuGiamGia = phieuGiamGiaRepository.findById(soPhieu)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu giảm giá với số phiếu: " + soPhieu));
            
            phieuGiamGiaRepository.delete(phieuGiamGia);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi xóa phiếu giảm giá: " + e.getMessage());
        }
    }
    
    // Các phương thức thống kê và báo cáo
    public Map<String, Object> getDiscountStatistics(LocalDateTime tuNgay, LocalDateTime denNgay) {
        Map<String, Object> result = new java.util.HashMap<>();
        
        BigDecimal totalDiscount = phieuGiamGiaRepository.getTotalDiscountByDateRange(tuNgay, denNgay);
        BigDecimal totalTax = phieuGiamGiaRepository.getTotalTaxByDateRange(tuNgay, denNgay);
        
        result.put("totalDiscount", totalDiscount != null ? totalDiscount : BigDecimal.ZERO);
        result.put("totalTax", totalTax != null ? totalTax : BigDecimal.ZERO);
        
        return result;
    }
    
    public List<Map<String, Object>> getDiscountByCustomer(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> results = phieuGiamGiaRepository.getDiscountByCustomer(tuNgay, denNgay);
        
        return results.stream().map(row -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("maKH", row[0]);
            item.put("tenKH", row[1]);
            item.put("giamTru", row[2]);
            return item;
        }).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getDiscountByProduct(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> results = phieuGiamGiaRepository.getDiscountByProduct(tuNgay, denNgay);
        
        return results.stream().map(row -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("maSPDV", row[0]);
            item.put("tenSPDV", row[1]);
            item.put("soLuong", row[2]);
            item.put("giamTru", row[3]);
            return item;
        }).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getDiscountByInvoice(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<Object[]> results = phieuGiamGiaRepository.getDiscountByInvoice(tuNgay, denNgay);
        
        return results.stream().map(row -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("soCT", row[0]);
            item.put("soLuongPhieu", row[1]);
            item.put("giamTru", row[2]);
            return item;
        }).collect(Collectors.toList());
    }
    
    // Các phương thức hỗ trợ
    private void validateTaiKhoan(PhieuGiamGiaDTO phieuGiamGiaDTO) {
        // Kiểm tra tài khoản nợ giảm trừ
        if (!tkktRepository.existsById(phieuGiamGiaDTO.getTkNoGiamTru())) {
            throw new RuntimeException("Tài khoản nợ giảm trừ không tồn tại: " + phieuGiamGiaDTO.getTkNoGiamTru());
        }
        
        // Kiểm tra tài khoản có thanh toán
        if (!tkktRepository.existsById(phieuGiamGiaDTO.getTkCoTT())) {
            throw new RuntimeException("Tài khoản có thanh toán không tồn tại: " + phieuGiamGiaDTO.getTkCoTT());
        }
        
        // Kiểm tra tài khoản nợ thuế (nếu có)
        if (phieuGiamGiaDTO.getTkNoThue() != null && !phieuGiamGiaDTO.getTkNoThue().isEmpty() && 
                !tkktRepository.existsById(phieuGiamGiaDTO.getTkNoThue())) {
            throw new RuntimeException("Tài khoản nợ thuế không tồn tại: " + phieuGiamGiaDTO.getTkNoThue());
        }
    }
    
    private void validateChiTiet(List<CTPhieuDTO> chiTietList) {
        // Kiểm tra danh sách chi tiết không được rỗng
        if (chiTietList == null || chiTietList.isEmpty()) {
            throw new RuntimeException("Phiếu giảm giá phải có ít nhất một dòng chi tiết");
        }
        
        // Kiểm tra mỗi sản phẩm/dịch vụ trong chi tiết
        for (CTPhieuDTO ctDTO : chiTietList) {
            if (!spdvRepository.existsById(ctDTO.getMaSPDV())) {
                throw new RuntimeException("Sản phẩm/dịch vụ không tồn tại: " + ctDTO.getMaSPDV());
            }
            
            if (ctDTO.getSoLuong() == null || ctDTO.getSoLuong().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
            
            if (ctDTO.getDonGia() == null || ctDTO.getDonGia().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Đơn giá phải lớn hơn hoặc bằng 0");
            }
        }
    }
}