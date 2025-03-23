package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BangGiaDTO {
    @NotBlank(message = "Mã sản phẩm/dịch vụ không được để trống")
    @Size(max = 10, message = "Mã sản phẩm/dịch vụ không được vượt quá 10 ký tự")
    private String maSPDV;
    
    @NotNull(message = "Ngày hiệu lực không được để trống")
    private LocalDateTime ngayHL;
    
    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal giaBan;
    
    // Thông tin về sản phẩm/dịch vụ (chỉ đọc)
    private String tenSPDV;
}