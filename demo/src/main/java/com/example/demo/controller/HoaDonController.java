package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.CTHoaDonDTO;
import com.example.demo.dto.HoaDonDTO;
import com.example.demo.dto.HoaDonSearchDTO;
import com.example.demo.entity.CTHoaDon;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.SPDV;
import com.example.demo.entity.TKKT;
import com.example.demo.service.HoaDonService;
import com.example.demo.service.SPDVService;
import com.example.demo.service.TKKTService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/hoa-don")
@CrossOrigin(origins = "*")
public class HoaDonController {

    private final HoaDonService hoaDonService;
    private final SPDVService spdvService;
    private final TKKTService tkktService;

    @Autowired
    public HoaDonController(HoaDonService hoaDonService, SPDVService spdvService, TKKTService tkktService) {
        this.hoaDonService = hoaDonService;
        this.spdvService = spdvService;
        this.tkktService = tkktService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HoaDonDTO>>> getAllHoaDon() {
        List<HoaDon> hoaDons = hoaDonService.getAllHoaDon();
        List<HoaDonDTO> hoaDonDTOs = hoaDons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(hoaDonDTOs, "Lấy danh sách hóa đơn thành công"));
    }

    @GetMapping("/{soCT}")
    public ResponseEntity<ApiResponse<HoaDonDTO>> getHoaDonById(@PathVariable String soCT) {
        return hoaDonService.getHoaDonById(soCT)
                .map(hoaDon -> {
                    HoaDonDTO dto = convertToDTO(hoaDon);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin hóa đơn thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy hóa đơn với số chứng từ: " + soCT)));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HoaDonDTO>>> searchHoaDon(
            @RequestParam(required = false) String maKH,
            @RequestParam(required = false) String soCT,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            @RequestParam(required = false) String hinhThucTT,
            @RequestParam(required = false) BigDecimal tienTTMin,
            @RequestParam(required = false) BigDecimal tienTTMax) {
        
        HoaDonSearchDTO searchDTO = new HoaDonSearchDTO();
        searchDTO.setMaKH(maKH);
        searchDTO.setSoCT(soCT);
        searchDTO.setTuNgay(tuNgay);
        searchDTO.setDenNgay(denNgay);
        searchDTO.setHinhThucTT(hinhThucTT);
        searchDTO.setTienTTMin(tienTTMin);
        searchDTO.setTienTTMax(tienTTMax);
        
        List<HoaDon> hoaDons = hoaDonService.searchHoaDon(searchDTO);
        List<HoaDonDTO> hoaDonDTOs = hoaDons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(hoaDonDTOs, "Tìm kiếm hóa đơn thành công"));
    }
    
    @GetMapping("/khach-hang/{maKH}")
    public ResponseEntity<ApiResponse<List<HoaDonDTO>>> getHoaDonByKhachHang(@PathVariable String maKH) {
        HoaDonSearchDTO searchDTO = new HoaDonSearchDTO();
        searchDTO.setMaKH(maKH);
        
        List<HoaDon> hoaDons = hoaDonService.searchHoaDon(searchDTO);
        List<HoaDonDTO> hoaDonDTOs = hoaDons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(hoaDonDTOs, "Lấy danh sách hóa đơn theo khách hàng thành công"));
    }
    
    @GetMapping("/thong-ke")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        Map<String, Object> statistics = hoaDonService.getRevenueStatistics(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê doanh thu thành công"));
    }
    
    @GetMapping("/thong-ke/khach-hang")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenueByCustomer(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        List<Map<String, Object>> statistics = hoaDonService.getRevenueByCustomer(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê doanh thu theo khách hàng thành công"));
    }
    
    @GetMapping("/thong-ke/san-pham")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenueByProduct(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        List<Map<String, Object>> statistics = hoaDonService.getRevenueByProduct(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê doanh thu theo sản phẩm thành công"));
    }
    
    @GetMapping("/thong-ke/hinh-thuc-tt")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenueByPaymentMethod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        List<Map<String, Object>> statistics = hoaDonService.getRevenueByPaymentMethod(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê doanh thu theo hình thức thanh toán thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HoaDonDTO>> createHoaDon(@Valid @RequestBody HoaDonDTO hoaDonDTO) {
        try {
            HoaDon hoaDon = hoaDonService.createHoaDon(hoaDonDTO);
            HoaDonDTO savedDTO = convertToDTO(hoaDon);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedDTO, "Tạo hóa đơn thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{soCT}")
    public ResponseEntity<ApiResponse<HoaDonDTO>> updateHoaDon(
            @PathVariable String soCT,
            @Valid @RequestBody HoaDonDTO hoaDonDTO) {
        try {
            HoaDon hoaDon = hoaDonService.updateHoaDon(soCT, hoaDonDTO);
            HoaDonDTO updatedDTO = convertToDTO(hoaDon);
            
            return ResponseEntity.ok(ApiResponse.success(updatedDTO, "Cập nhật hóa đơn thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{soCT}")
    public ResponseEntity<ApiResponse<Void>> deleteHoaDon(@PathVariable String soCT) {
        try {
            hoaDonService.deleteHoaDon(soCT);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa hóa đơn thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private HoaDonDTO convertToDTO(HoaDon hoaDon) {
        HoaDonDTO dto = new HoaDonDTO();
        dto.setSoCT(hoaDon.getSoCT());
        dto.setNgayLap(hoaDon.getNgayLap());
        dto.setMaKH(hoaDon.getMaKH());
        dto.setTenKH(hoaDon.getTenKH());
        dto.setHinhThucTT(hoaDon.getHinhThucTT());
        dto.setTkNo(hoaDon.getTkNo());
        dto.setDienGiai(hoaDon.getDienGiai());
        dto.setTkCoDT(hoaDon.getTkCoDT());
        dto.setTkCoThue(hoaDon.getTkCoThue());
        dto.setThueSuat(hoaDon.getThueSuat());
        dto.setTienThue(hoaDon.getTienThue());
        dto.setTyLeCK(hoaDon.getTyLeCK());
        dto.setTkChietKhau(hoaDon.getTkChietKhau());
        dto.setTienCK(hoaDon.getTienCK());
        dto.setTienDT(hoaDon.getTienDT());
        dto.setTienTT(hoaDon.getTienTT());
        
        // Thêm thông tin tên tài khoản
        if (hoaDon.getTkNoEntity() != null) {
            dto.setTenTKNo(hoaDon.getTkNoEntity().getTenTK());
        } else {
            tkktService.getTKKTById(hoaDon.getTkNo())
                    .ifPresent(tk -> dto.setTenTKNo(tk.getTenTK()));
        }
        
        if (hoaDon.getTkCoDTEntity() != null) {
            dto.setTenTKCoDT(hoaDon.getTkCoDTEntity().getTenTK());
        } else {
            tkktService.getTKKTById(hoaDon.getTkCoDT())
                    .ifPresent(tk -> dto.setTenTKCoDT(tk.getTenTK()));
        }
        
        if (hoaDon.getTkCoThueEntity() != null) {
            dto.setTenTKCoThue(hoaDon.getTkCoThueEntity().getTenTK());
        } else if (hoaDon.getTkCoThue() != null) {
            tkktService.getTKKTById(hoaDon.getTkCoThue())
                    .ifPresent(tk -> dto.setTenTKCoThue(tk.getTenTK()));
        }
        
        if (hoaDon.getTkChietKhauEntity() != null) {
            dto.setTenTKChietKhau(hoaDon.getTkChietKhauEntity().getTenTK());
        } else if (hoaDon.getTkChietKhau() != null) {
            tkktService.getTKKTById(hoaDon.getTkChietKhau())
                    .ifPresent(tk -> dto.setTenTKChietKhau(tk.getTenTK()));
        }
        
        // Chuyển đổi chi tiết hóa đơn
        List<CTHoaDonDTO> chiTietDTOs = new ArrayList<>();
        for (CTHoaDon ctHoaDon : hoaDon.getCtHoaDons()) {
            CTHoaDonDTO ctDTO = new CTHoaDonDTO();
            ctDTO.setSoCT(ctHoaDon.getSoCT());
            ctDTO.setMaSPDV(ctHoaDon.getMaSPDV());
            ctDTO.setSoLuong(ctHoaDon.getSoLuong());
            ctDTO.setDvt(ctHoaDon.getDvt());
            ctDTO.setDonGia(ctHoaDon.getDonGia());
            ctDTO.setThanhTien(ctHoaDon.getSoLuong().multiply(ctHoaDon.getDonGia()));
            
            // Thêm tên sản phẩm/dịch vụ
            if (ctHoaDon.getSpdv() != null) {
                ctDTO.setTenSPDV(ctHoaDon.getSpdv().getTenSPDV());
            } else {
                spdvService.getSPDVById(ctHoaDon.getMaSPDV())
                        .ifPresent(spdv -> ctDTO.setTenSPDV(spdv.getTenSPDV()));
            }
            
            chiTietDTOs.add(ctDTO);
        }
        dto.setChiTietList(chiTietDTOs);
        
        return dto;
    }
}