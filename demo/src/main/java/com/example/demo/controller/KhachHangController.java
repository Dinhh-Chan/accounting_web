package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.KhachHangDTO;
import com.example.demo.entity.KhachHang;
import com.example.demo.service.KhachHangService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/khach-hang")
@CrossOrigin(origins = "*")
public class KhachHangController {

    private final KhachHangService khachHangService;

    @Autowired
    public KhachHangController(KhachHangService khachHangService) {
        this.khachHangService = khachHangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<KhachHangDTO>>> getAllKhachHang() {
        List<KhachHang> khachHangs = khachHangService.getAllKhachHang();
        List<KhachHangDTO> khachHangDTOs = khachHangs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(khachHangDTOs, "Lấy danh sách khách hàng thành công"));
    }

    @GetMapping("/{maKH}")
    public ResponseEntity<ApiResponse<KhachHangDTO>> getKhachHangById(@PathVariable String maKH) {
        return khachHangService.getKhachHangById(maKH)
                .map(khachHang -> {
                    KhachHangDTO dto = convertToDTO(khachHang);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin khách hàng thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy khách hàng với mã: " + maKH)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KhachHangDTO>> createKhachHang(@Valid @RequestBody KhachHangDTO khachHangDTO) {
        try {
            KhachHang khachHang = convertToEntity(khachHangDTO);
            KhachHang savedKhachHang = khachHangService.createKhachHang(khachHang);
            KhachHangDTO savedDTO = convertToDTO(savedKhachHang);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedDTO, "Thêm mới khách hàng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{maKH}")
    public ResponseEntity<ApiResponse<KhachHangDTO>> updateKhachHang(
            @PathVariable String maKH, 
            @Valid @RequestBody KhachHangDTO khachHangDTO) {
        try {
            KhachHang khachHang = convertToEntity(khachHangDTO);
            KhachHang updatedKhachHang = khachHangService.updateKhachHang(maKH, khachHang);
            KhachHangDTO updatedDTO = convertToDTO(updatedKhachHang);
            
            return ResponseEntity.ok(ApiResponse.success(updatedDTO, "Cập nhật khách hàng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{maKH}")
    public ResponseEntity<ApiResponse<Void>> deleteKhachHang(@PathVariable String maKH) {
        try {
            khachHangService.deleteKhachHang(maKH);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa khách hàng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<KhachHangDTO>>> searchKhachHang(@RequestParam String keyword) {
        List<KhachHang> khachHangs = khachHangService.findKhachHangByName(keyword);
        List<KhachHangDTO> khachHangDTOs = khachHangs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(khachHangDTOs, "Tìm kiếm khách hàng thành công"));
    }
    
    @GetMapping("/check-ma-so-thue")
    public ResponseEntity<ApiResponse<Boolean>> checkMaSoThueExists(@RequestParam String maSoThue) {
        boolean exists = khachHangService.getKhachHangByMaSoThue(maSoThue).isPresent();
        return ResponseEntity.ok(ApiResponse.success(exists, 
                exists ? "Mã số thuế đã tồn tại" : "Mã số thuế chưa tồn tại"));
    }

    private KhachHangDTO convertToDTO(KhachHang khachHang) {
        KhachHangDTO dto = new KhachHangDTO();
        dto.setMaKH(khachHang.getMaKH());
        dto.setTenKH(khachHang.getTenKH());
        dto.setDiaChi(khachHang.getDiaChi());
        dto.setSdt(khachHang.getSdt());
        dto.setEmail(khachHang.getEmail());
        dto.setMaSoThue(khachHang.getMaSoThue());
        dto.setPhanLoai(khachHang.getPhanLoai());
        return dto;
    }

    private KhachHang convertToEntity(KhachHangDTO dto) {
        KhachHang khachHang = new KhachHang();
        khachHang.setMaKH(dto.getMaKH());
        khachHang.setTenKH(dto.getTenKH());
        khachHang.setDiaChi(dto.getDiaChi());
        khachHang.setSdt(dto.getSdt());
        khachHang.setEmail(dto.getEmail());
        khachHang.setMaSoThue(dto.getMaSoThue());
        khachHang.setPhanLoai(dto.getPhanLoai());
        return khachHang;
    }
}