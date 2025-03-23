package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTPhieuDTO {
    private String soPhieu;
    
    @NotBlank(message = "Mã sản phẩm/dịch vụ không được để trống")
    @Size(max = 10, message = "Mã sản phẩm/dịch vụ không được vượt quá 10 ký tự")
    private String maSPDV;
    
    @NotNull(message = "Số lượng không được để trống")
    @DecimalMin(value = "0.01", message = "Số lượng phải lớn hơn 0")
    private BigDecimal soLuong;
    
    @Size(max = 10, message = "Đơn vị tính không được vượt quá 10 ký tự")
    private String dvt;
    
    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0", inclusive = true, message = "Đơn giá phải lớn hơn hoặc bằng 0")
    private BigDecimal donGia;
    
    // Thông tin bổ sung (chỉ đọc)
    private String tenSPDV;
    private BigDecimal thanhTien;
}
