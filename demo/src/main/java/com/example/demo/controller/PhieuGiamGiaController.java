package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.CTPhieuDTO;
import com.example.demo.dto.PhieuGiamGiaDTO;
import com.example.demo.dto.PhieuGiamGiaSearchDTO;
import com.example.demo.entity.CTPhieu;
import com.example.demo.entity.PhieuGiamGia;
import com.example.demo.entity.SPDV;
import com.example.demo.entity.TKKT;
import com.example.demo.service.PhieuGiamGiaService;
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
@RequestMapping("/phieu-giam-gia")
@CrossOrigin(origins = "*")
public class PhieuGiamGiaController {

    private final PhieuGiamGiaService phieuGiamGiaService;
    private final SPDVService spdvService;
    private final TKKTService tkktService;

    @Autowired
    public PhieuGiamGiaController(PhieuGiamGiaService phieuGiamGiaService, SPDVService spdvService, TKKTService tkktService) {
        this.phieuGiamGiaService = phieuGiamGiaService;
        this.spdvService = spdvService;
        this.tkktService = tkktService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuGiamGiaDTO>>> getAllPhieuGiamGia() {
        List<PhieuGiamGia> phieuGiamGias = phieuGiamGiaService.getAllPhieuGiamGia();
        List<PhieuGiamGiaDTO> phieuGiamGiaDTOs = phieuGiamGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(phieuGiamGiaDTOs, "Lấy danh sách phiếu giảm giá thành công"));
    }

    @GetMapping("/{soPhieu}")
    public ResponseEntity<ApiResponse<PhieuGiamGiaDTO>> getPhieuGiamGiaById(@PathVariable String soPhieu) {
        return phieuGiamGiaService.getPhieuGiamGiaById(soPhieu)
                .map(phieuGiamGia -> {
                    PhieuGiamGiaDTO dto = convertToDTO(phieuGiamGia);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin phiếu giảm giá thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy phiếu giảm giá với số phiếu: " + soPhieu)));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PhieuGiamGiaDTO>>> searchPhieuGiamGia(
            @RequestParam(required = false) String maKH,
            @RequestParam(required = false) String soPhieu,
            @RequestParam(required = false) String soCT,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            @RequestParam(required = false) BigDecimal tienGiamMin,
            @RequestParam(required = false) BigDecimal tienGiamMax) {
        
        PhieuGiamGiaSearchDTO searchDTO = new PhieuGiamGiaSearchDTO();
        searchDTO.setMaKH(maKH);
        searchDTO.setSoPhieu(soPhieu);
        searchDTO.setSoCT(soCT);
        searchDTO.setTuNgay(tuNgay);
        searchDTO.setDenNgay(denNgay);
        searchDTO.setTienGiamMin(tienGiamMin);
        searchDTO.setTienGiamMax(tienGiamMax);
        
        List<PhieuGiamGia> phieuGiamGias = phieuGiamGiaService.searchPhieuGiamGia(searchDTO);
        List<PhieuGiamGiaDTO> phieuGiamGiaDTOs = phieuGiamGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(phieuGiamGiaDTOs, "Tìm kiếm phiếu giảm giá thành công"));
    }
    
    @GetMapping("/khach-hang/{maKH}")
    public ResponseEntity<ApiResponse<List<PhieuGiamGiaDTO>>> getPhieuGiamGiaByKhachHang(@PathVariable String maKH) {
        PhieuGiamGiaSearchDTO searchDTO = new PhieuGiamGiaSearchDTO();
        searchDTO.setMaKH(maKH);
        
        List<PhieuGiamGia> phieuGiamGias = phieuGiamGiaService.searchPhieuGiamGia(searchDTO);
        List<PhieuGiamGiaDTO> phieuGiamGiaDTOs = phieuGiamGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(phieuGiamGiaDTOs, "Lấy danh sách phiếu giảm giá theo khách hàng thành công"));
    }
    
    @GetMapping("/hoa-don/{soCT}")
    public ResponseEntity<ApiResponse<List<PhieuGiamGiaDTO>>> getPhieuGiamGiaByHoaDon(@PathVariable String soCT) {
        PhieuGiamGiaSearchDTO searchDTO = new PhieuGiamGiaSearchDTO();
        searchDTO.setSoCT(soCT);
        
        List<PhieuGiamGia> phieuGiamGias = phieuGiamGiaService.searchPhieuGiamGia(searchDTO);
        List<PhieuGiamGiaDTO> phieuGiamGiaDTOs = phieuGiamGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(phieuGiamGiaDTOs, "Lấy danh sách phiếu giảm giá theo hóa đơn thành công"));
    }
    
    @GetMapping("/thong-ke")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDiscountStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        Map<String, Object> statistics = phieuGiamGiaService.getDiscountStatistics(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê giảm trừ doanh thu thành công"));
    }
    
    @GetMapping("/thong-ke/khach-hang")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDiscountByCustomer(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        List<Map<String, Object>> statistics = phieuGiamGiaService.getDiscountByCustomer(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê giảm trừ doanh thu theo khách hàng thành công"));
    }
    
    @GetMapping("/thong-ke/san-pham")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDiscountByProduct(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        List<Map<String, Object>> statistics = phieuGiamGiaService.getDiscountByProduct(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê giảm trừ doanh thu theo sản phẩm thành công"));
    }
    
    @GetMapping("/thong-ke/hoa-don")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDiscountByInvoice(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        List<Map<String, Object>> statistics = phieuGiamGiaService.getDiscountByInvoice(tuNgay, denNgay);
        
        return ResponseEntity.ok(ApiResponse.success(statistics, "Lấy thống kê giảm trừ doanh thu theo hóa đơn thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuGiamGiaDTO>> createPhieuGiamGia(@Valid @RequestBody PhieuGiamGiaDTO phieuGiamGiaDTO) {
        try {
            PhieuGiamGia phieuGiamGia = phieuGiamGiaService.createPhieuGiamGia(phieuGiamGiaDTO);
            PhieuGiamGiaDTO savedDTO = convertToDTO(phieuGiamGia);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedDTO, "Tạo phiếu giảm giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{soPhieu}")
    public ResponseEntity<ApiResponse<PhieuGiamGiaDTO>> updatePhieuGiamGia(
            @PathVariable String soPhieu,
            @Valid @RequestBody PhieuGiamGiaDTO phieuGiamGiaDTO) {
        try {
            PhieuGiamGia phieuGiamGia = phieuGiamGiaService.updatePhieuGiamGia(soPhieu, phieuGiamGiaDTO);
            PhieuGiamGiaDTO updatedDTO = convertToDTO(phieuGiamGia);
            
            return ResponseEntity.ok(ApiResponse.success(updatedDTO, "Cập nhật phiếu giảm giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{soPhieu}")
    public ResponseEntity<ApiResponse<Void>> deletePhieuGiamGia(@PathVariable String soPhieu) {
        try {
            phieuGiamGiaService.deletePhieuGiamGia(soPhieu);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa phiếu giảm giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private PhieuGiamGiaDTO convertToDTO(PhieuGiamGia phieuGiamGia) {
        PhieuGiamGiaDTO dto = new PhieuGiamGiaDTO();
        dto.setSoPhieu(phieuGiamGia.getSoPhieu());
        dto.setNgayLap(phieuGiamGia.getNgayLap());
        dto.setMaKH(phieuGiamGia.getMaKH());
        dto.setDienGiai(phieuGiamGia.getDienGiai());
        dto.setTkNoGiamTru(phieuGiamGia.getTkNoGiamTru());
        dto.setTkCoTT(phieuGiamGia.getTkCoTT());
        dto.setSoCT(phieuGiamGia.getSoCT());
        dto.setThueSuat(phieuGiamGia.getThueSuat());
        dto.setTienThue(phieuGiamGia.getTienThue());
        dto.setTkNoThue(phieuGiamGia.getTkNoThue());
        dto.setTienDT(phieuGiamGia.getTienDT());
        dto.setTienTT(phieuGiamGia.getTienTT());
        
        // Thêm thông tin khách hàng
        if (phieuGiamGia.getKhachHang() != null) {
            dto.setTenKH(phieuGiamGia.getKhachHang().getTenKH());
        }
        
        // Thêm thông tin tên tài khoản
        if (phieuGiamGia.getTkNoGiamTruEntity() != null) {
            dto.setTenTKNoGiamTru(phieuGiamGia.getTkNoGiamTruEntity().getTenTK());
        } else {
            tkktService.getTKKTById(phieuGiamGia.getTkNoGiamTru())
                    .ifPresent(tk -> dto.setTenTKNoGiamTru(tk.getTenTK()));
        }
        
        if (phieuGiamGia.getTkCoTTEntity() != null) {
            dto.setTenTKCoTT(phieuGiamGia.getTkCoTTEntity().getTenTK());
        } else {
            tkktService.getTKKTById(phieuGiamGia.getTkCoTT())
                    .ifPresent(tk -> dto.setTenTKCoTT(tk.getTenTK()));
        }
        
        if (phieuGiamGia.getTkNoThueEntity() != null) {
            dto.setTenTKNoThue(phieuGiamGia.getTkNoThueEntity().getTenTK());
        } else if (phieuGiamGia.getTkNoThue() != null) {
            tkktService.getTKKTById(phieuGiamGia.getTkNoThue())
                    .ifPresent(tk -> dto.setTenTKNoThue(tk.getTenTK()));
        }
        
        if (phieuGiamGia.getHoaDon() != null) {
            dto.setSoHoaDon(phieuGiamGia.getHoaDon().getSoCT());
        }
        
        // Chuyển đổi chi tiết phiếu
        List<CTPhieuDTO> chiTietDTOs = new ArrayList<>();
        for (CTPhieu ctPhieu : phieuGiamGia.getCtPhieus()) {
            CTPhieuDTO ctDTO = new CTPhieuDTO();
            ctDTO.setSoPhieu(ctPhieu.getSoPhieu());
            ctDTO.setMaSPDV(ctPhieu.getMaSPDV());
            ctDTO.setSoLuong(ctPhieu.getSoLuong());
            ctDTO.setDvt(ctPhieu.getDvt());
            ctDTO.setDonGia(ctPhieu.getDonGia());
            ctDTO.setThanhTien(ctPhieu.getSoLuong().multiply(ctPhieu.getDonGia()));
            
            // Thêm tên sản phẩm/dịch vụ
            if (ctPhieu.getSpdv() != null) {
                ctDTO.setTenSPDV(ctPhieu.getSpdv().getTenSPDV());
            } else {
                spdvService.getSPDVById(ctPhieu.getMaSPDV())
                        .ifPresent(spdv -> ctDTO.setTenSPDV(spdv.getTenSPDV()));
            }
            
            chiTietDTOs.add(ctDTO);
        }
        dto.setChiTietList(chiTietDTOs);
        
        return dto;
    }
}