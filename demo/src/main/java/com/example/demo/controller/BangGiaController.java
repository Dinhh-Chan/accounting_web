package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.BangGiaDTO;
import com.example.demo.entity.BangGia;
import com.example.demo.entity.BangGiaId;
import com.example.demo.entity.SPDV;
import com.example.demo.service.BangGiaService;
import com.example.demo.service.SPDVService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bang-gia")
@CrossOrigin(origins = "*")
public class BangGiaController {

    private final BangGiaService bangGiaService;
    private final SPDVService spdvService;

    @Autowired
    public BangGiaController(BangGiaService bangGiaService, SPDVService spdvService) {
        this.bangGiaService = bangGiaService;
        this.spdvService = spdvService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BangGiaDTO>>> getAllBangGia() {
        List<BangGia> bangGias = bangGiaService.getAllBangGia();
        List<BangGiaDTO> bangGiaDTOs = bangGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(bangGiaDTOs, "Lấy danh sách bảng giá thành công"));
    }

    @GetMapping("/{maSPDV}/{ngayHL}")
    public ResponseEntity<ApiResponse<BangGiaDTO>> getBangGiaById(
            @PathVariable String maSPDV,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime ngayHL) {
        BangGiaId id = new BangGiaId(maSPDV, ngayHL);
        return bangGiaService.getBangGiaById(id)
                .map(bangGia -> {
                    BangGiaDTO dto = convertToDTO(bangGia);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin bảng giá thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy bảng giá với mã sản phẩm và ngày hiệu lực đã chọn")));
    }
    
    @GetMapping("/san-pham/{maSPDV}")
    public ResponseEntity<ApiResponse<List<BangGiaDTO>>> getBangGiaByMaSPDV(@PathVariable String maSPDV) {
        if (!spdvService.getSPDVById(maSPDV).isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy sản phẩm/dịch vụ với mã: " + maSPDV));
        }
        
        List<BangGia> bangGias = bangGiaService.getBangGiaByMaSPDV(maSPDV);
        List<BangGiaDTO> bangGiaDTOs = bangGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(bangGiaDTOs, 
                "Lấy danh sách bảng giá theo sản phẩm/dịch vụ thành công"));
    }
    
    @GetMapping("/valid/{maSPDV}")
    public ResponseEntity<ApiResponse<List<BangGiaDTO>>> getValidPrices(
            @PathVariable String maSPDV,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime ngayHienTai) {
        
        if (!spdvService.getSPDVById(maSPDV).isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy sản phẩm/dịch vụ với mã: " + maSPDV));
        }
        
        List<BangGia> validPrices = bangGiaService.getValidPrices(maSPDV, ngayHienTai);
        List<BangGiaDTO> validPriceDTOs = validPrices.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(validPriceDTOs, 
                "Lấy danh sách giá có hiệu lực thành công"));
    }
    
    @GetMapping("/latest/{maSPDV}")
    public ResponseEntity<ApiResponse<BangGiaDTO>> getLatestValidPrice(
            @PathVariable String maSPDV,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime ngayHienTai) {
        
        if (!spdvService.getSPDVById(maSPDV).isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy sản phẩm/dịch vụ với mã: " + maSPDV));
        }
        
        return bangGiaService.getLatestValidPrice(maSPDV, ngayHienTai)
                .map(bangGia -> {
                    BangGiaDTO dto = convertToDTO(bangGia);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy giá hiện tại thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy giá hiện tại cho sản phẩm/dịch vụ này")));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<BangGiaDTO>>> getBangGiaByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        if (tuNgay.isAfter(denNgay)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Ngày bắt đầu phải trước ngày kết thúc"));
        }
        
        List<BangGia> bangGias = bangGiaService.getBangGiaByDateRange(tuNgay, denNgay);
        List<BangGiaDTO> bangGiaDTOs = bangGias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(bangGiaDTOs, 
                "Lấy danh sách bảng giá theo khoảng thời gian thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BangGiaDTO>> createBangGia(@Valid @RequestBody BangGiaDTO bangGiaDTO) {
        try {
            BangGia bangGia = convertToEntity(bangGiaDTO);
            BangGia savedBangGia = bangGiaService.createBangGia(bangGia);
            BangGiaDTO savedDTO = convertToDTO(savedBangGia);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedDTO, "Thêm mới bảng giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{maSPDV}/{ngayHL}")
    public ResponseEntity<ApiResponse<BangGiaDTO>> updateBangGia(
            @PathVariable String maSPDV,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime ngayHL,
            @Valid @RequestBody BangGiaDTO bangGiaDTO) {
        try {
            BangGiaId id = new BangGiaId(maSPDV, ngayHL);
            BangGia bangGia = convertToEntity(bangGiaDTO);
            BangGia updatedBangGia = bangGiaService.updateBangGia(id, bangGia);
            BangGiaDTO updatedDTO = convertToDTO(updatedBangGia);
            
            return ResponseEntity.ok(ApiResponse.success(updatedDTO, "Cập nhật bảng giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{maSPDV}/{ngayHL}")
    public ResponseEntity<ApiResponse<Void>> deleteBangGia(
            @PathVariable String maSPDV,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime ngayHL) {
        try {
            BangGiaId id = new BangGiaId(maSPDV, ngayHL);
            bangGiaService.deleteBangGia(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa bảng giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private BangGiaDTO convertToDTO(BangGia bangGia) {
        BangGiaDTO dto = new BangGiaDTO();
        dto.setMaSPDV(bangGia.getMaSPDV());
        dto.setNgayHL(bangGia.getNgayHL());
        dto.setGiaBan(bangGia.getGiaBan());
        
        // Thêm thông tin sản phẩm/dịch vụ
        if (bangGia.getSpdv() != null) {
            dto.setTenSPDV(bangGia.getSpdv().getTenSPDV());
        } else {
            // Trường hợp entity không có spdv (lazy loading), thì cần lấy từ service
            Optional<SPDV> spdvOpt = spdvService.getSPDVById(bangGia.getMaSPDV());
            spdvOpt.ifPresent(spdv -> dto.setTenSPDV(spdv.getTenSPDV()));
        }
        
        return dto;
    }

    private BangGia convertToEntity(BangGiaDTO dto) {
        BangGia bangGia = new BangGia();
        bangGia.setMaSPDV(dto.getMaSPDV());
        bangGia.setNgayHL(dto.getNgayHL());
        bangGia.setGiaBan(dto.getGiaBan());
        return bangGia;
    }
}