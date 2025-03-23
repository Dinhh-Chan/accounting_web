package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.TKKTDTO;
import com.example.demo.entity.TKKT;
import com.example.demo.service.TKKTService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tkkt")
@CrossOrigin(origins = "*")
public class TKKTController {

    private final TKKTService tkktService;

    @Autowired
    public TKKTController(TKKTService tkktService) {
        this.tkktService = tkktService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TKKTDTO>>> getAllTKKT() {
        List<TKKT> tkkts = tkktService.getAllTKKT();
        List<TKKTDTO> tkktDTOs = tkkts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(tkktDTOs, "Lấy danh sách tài khoản kế toán thành công"));
    }

    @GetMapping("/{maTK}")
    public ResponseEntity<ApiResponse<TKKTDTO>> getTKKTById(@PathVariable String maTK) {
        return tkktService.getTKKTById(maTK)
                .map(tkkt -> {
                    TKKTDTO dto = convertToDTO(tkkt);
                    return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin tài khoản kế toán thành công"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy tài khoản kế toán với mã: " + maTK)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TKKTDTO>> createTKKT(@Valid @RequestBody TKKTDTO tkktDTO) {
        try {
            TKKT tkkt = convertToEntity(tkktDTO);
            TKKT savedTKKT = tkktService.createTKKT(tkkt);
            TKKTDTO savedDTO = convertToDTO(savedTKKT);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedDTO, "Thêm mới tài khoản kế toán thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{maTK}")
    public ResponseEntity<ApiResponse<TKKTDTO>> updateTKKT(
            @PathVariable String maTK, 
            @Valid @RequestBody TKKTDTO tkktDTO) {
        try {
            TKKT tkkt = convertToEntity(tkktDTO);
            TKKT updatedTKKT = tkktService.updateTKKT(maTK, tkkt);
            TKKTDTO updatedDTO = convertToDTO(updatedTKKT);
            
            return ResponseEntity.ok(ApiResponse.success(updatedDTO, "Cập nhật tài khoản kế toán thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{maTK}")
    public ResponseEntity<ApiResponse<Void>> deleteTKKT(@PathVariable String maTK) {
        try {
            tkktService.deleteTKKT(maTK);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa tài khoản kế toán thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TKKTDTO>>> searchTKKT(@RequestParam String keyword) {
        List<TKKT> tkkts = tkktService.searchTKKT(keyword);
        List<TKKTDTO> tkktDTOs = tkkts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(tkktDTOs, "Tìm kiếm tài khoản kế toán thành công"));
    }
    
    @GetMapping("/cap/{capTK}")
    public ResponseEntity<ApiResponse<List<TKKTDTO>>> getTKKTByCapTK(@PathVariable Integer capTK) {
        List<TKKT> tkkts = tkktService.getTKKTByCapTK(capTK);
        List<TKKTDTO> tkktDTOs = tkkts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(tkktDTOs, "Lấy danh sách tài khoản kế toán theo cấp thành công"));
    }
    
    @GetMapping("/prefix/{prefix}")
    public ResponseEntity<ApiResponse<List<TKKTDTO>>> getTKKTByPrefix(@PathVariable String prefix) {
        List<TKKT> tkkts = tkktService.getTKKTByPrefix(prefix);
        List<TKKTDTO> tkktDTOs = tkkts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(tkktDTOs, "Lấy danh sách tài khoản kế toán theo tiền tố thành công"));
    }
    
    @GetMapping("/children/{parentTK}")
    public ResponseEntity<ApiResponse<List<TKKTDTO>>> getChildAccounts(@PathVariable String parentTK) {
        List<TKKT> childAccounts = tkktService.getChildAccounts(parentTK);
        List<TKKTDTO> childAccountDTOs = childAccounts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(childAccountDTOs, "Lấy danh sách tài khoản con thành công"));
    }
    
    @GetMapping("/next-level/{capTK}")
    public ResponseEntity<ApiResponse<List<TKKTDTO>>> getNextLevelAccounts(@PathVariable Integer capTK) {
        List<TKKT> nextLevelAccounts = tkktService.getNextLevelAccounts(capTK);
        List<TKKTDTO> nextLevelAccountDTOs = nextLevelAccounts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(nextLevelAccountDTOs, "Lấy danh sách tài khoản cấp tiếp theo thành công"));
    }
    
    @GetMapping("/check-in-use/{maTK}")
    public ResponseEntity<ApiResponse<Boolean>> checkAccountInUse(@PathVariable String maTK) {
        boolean inUse = tkktService.isAccountInUse(maTK);
        return ResponseEntity.ok(ApiResponse.success(inUse, 
                inUse ? "Tài khoản đang được sử dụng" : "Tài khoản chưa được sử dụng"));
    }

    private TKKTDTO convertToDTO(TKKT tkkt) {
        TKKTDTO dto = new TKKTDTO();
        dto.setMaTK(tkkt.getMaTK());
        dto.setTenTK(tkkt.getTenTK());
        dto.setCapTK(tkkt.getCapTK());
        return dto;
    }

    private TKKT convertToEntity(TKKTDTO dto) {
        TKKT tkkt = new TKKT();
        tkkt.setMaTK(dto.getMaTK());
        tkkt.setTenTK(dto.getTenTK());
        tkkt.setCapTK(dto.getCapTK());
        return tkkt;
    }
}