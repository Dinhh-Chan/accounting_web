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
public class SPDVDTO {
    private String maSPDV;

    @NotBlank(message = "Tên sản phẩm/dịch vụ không được để trống")
    @Size(max = 100, message = "Tên sản phẩm/dịch vụ không được vượt quá 100 ký tự")
    private String tenSPDV;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Đơn giá phải lớn hơn hoặc bằng 0")
    private BigDecimal donGia;

    @Size(max = 10, message = "Đơn vị tính không được vượt quá 10 ký tự")
    private String dvt;

    @Size(max = 200, message = "Mô tả không được vượt quá 200 ký tự")
    private String moTa;
}