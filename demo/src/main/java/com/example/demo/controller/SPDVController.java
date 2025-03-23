package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.SPDVDTO;
import com.example.demo.entity.SPDV;
import com.example.demo.service.SPDVService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/spdv")
@CrossOrigin(origins = "*")
public class SPDVController {

    private final SPDVService spdvService;

    @Autowired
    public SPDVController(SPDVService spdvService) {
        this.spdvService = spdvService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SPDVDTO>>> getAllSPDV() {
        List<SPDV> spdvs = spdvService.getAllSPDV();
        List<SPDVDTO> spdvDTOs = spdvs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(spdvDTOs, "Lấy danh sách sản phẩm/dịch vụ thành công"));
    }

    @GetMapping("/{maSPDV}")
    public ResponseEntity<ApiResponse<SPDVDTO>> getSPDVById(@PathVariable String maSPDV) {
        return spdvService.getSPDVById(maSPDV)
                .map(spdv -> {
                    SPDVDTO dto = convertToDTO(spdv);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin sản phẩm/dịch vụ thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy sản phẩm/dịch vụ với mã: " + maSPDV)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SPDVDTO>> createSPDV(@Valid @RequestBody SPDVDTO spdvDTO) {
        try {
            SPDV spdv = convertToEntity(spdvDTO);
            SPDV savedSPDV = spdvService.createSPDV(spdv);
            SPDVDTO savedDTO = convertToDTO(savedSPDV);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedDTO, "Thêm mới sản phẩm/dịch vụ thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{maSPDV}")
    public ResponseEntity<ApiResponse<SPDVDTO>> updateSPDV(
            @PathVariable String maSPDV, 
            @Valid @RequestBody SPDVDTO spdvDTO) {
        try {
            SPDV spdv = convertToEntity(spdvDTO);
            SPDV updatedSPDV = spdvService.updateSPDV(maSPDV, spdv);
            SPDVDTO updatedDTO = convertToDTO(updatedSPDV);
            
            return ResponseEntity.ok(ApiResponse.success(updatedDTO, "Cập nhật sản phẩm/dịch vụ thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{maSPDV}")
    public ResponseEntity<ApiResponse<Void>> deleteSPDV(@PathVariable String maSPDV) {
        try {
            spdvService.deleteSPDV(maSPDV);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa sản phẩm/dịch vụ thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SPDVDTO>>> searchSPDV(@RequestParam String keyword) {
        List<SPDV> spdvs = spdvService.findSPDVByName(keyword);
        List<SPDVDTO> spdvDTOs = spdvs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(spdvDTOs, "Tìm kiếm sản phẩm/dịch vụ thành công"));
    }
    
    @GetMapping("/dvt/{dvt}")
    public ResponseEntity<ApiResponse<List<SPDVDTO>>> getSPDVByDVT(@PathVariable String dvt) {
        List<SPDV> spdvs = spdvService.findSPDVByDVT(dvt);
        List<SPDVDTO> spdvDTOs = spdvs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(spdvDTOs, "Lấy danh sách sản phẩm/dịch vụ theo đơn vị tính thành công"));
    }
    
    @GetMapping("/check-ten-spdv")
    public ResponseEntity<ApiResponse<Boolean>> checkTenSPDVExists(@RequestParam String tenSPDV) {
        boolean exists = !spdvService.findSPDVByName(tenSPDV).isEmpty();
        return ResponseEntity.ok(ApiResponse.success(exists, 
                exists ? "Tên sản phẩm/dịch vụ đã tồn tại" : "Tên sản phẩm/dịch vụ chưa tồn tại"));
    }

    private SPDVDTO convertToDTO(SPDV spdv) {
        SPDVDTO dto = new SPDVDTO();
        dto.setMaSPDV(spdv.getMaSPDV());
        dto.setTenSPDV(spdv.getTenSPDV());
        dto.setDonGia(spdv.getDonGia());
        dto.setDvt(spdv.getDvt());
        dto.setMoTa(spdv.getMoTa());
        return dto;
    }

    private SPDV convertToEntity(SPDVDTO dto) {
        SPDV spdv = new SPDV();
        spdv.setMaSPDV(dto.getMaSPDV());
        spdv.setTenSPDV(dto.getTenSPDV());
        spdv.setDonGia(dto.getDonGia());
        spdv.setDvt(dto.getDvt());
        spdv.setMoTa(dto.getMoTa());
        return spdv;
    }
}