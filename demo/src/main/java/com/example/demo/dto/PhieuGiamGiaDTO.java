package com.example.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaDTO {
    private String soPhieu;

    @NotNull(message = "Ngày lập không được để trống")
    private LocalDateTime ngayLap;

    @NotBlank(message = "Mã khách hàng không được để trống")
    @Size(max = 10, message = "Mã khách hàng không được vượt quá 10 ký tự")
    private String maKH;
    
    @Size(max = 150, message = "Diễn giải không được vượt quá 150 ký tự")
    private String dienGiai;

    @NotBlank(message = "Tài khoản nợ giảm trừ không được để trống")
    @Size(max = 10, message = "Tài khoản nợ giảm trừ không được vượt quá 10 ký tự")
    private String tkNoGiamTru;

    @NotBlank(message = "Tài khoản có thanh toán không được để trống")
    @Size(max = 10, message = "Tài khoản có thanh toán không được vượt quá 10 ký tự")
    private String tkCoTT;

    @NotBlank(message = "Số chứng từ hóa đơn không được để trống")
    @Size(max = 10, message = "Số chứng từ hóa đơn không được vượt quá 10 ký tự")
    private String soCT;

    @Size(max = 10, message = "Thuế suất không được vượt quá 10 ký tự")
    private String thueSuat;

    private BigDecimal tienThue;

    @Size(max = 10, message = "Tài khoản nợ thuế không được vượt quá 10 ký tự")
    private String tkNoThue;

    private BigDecimal tienDT;
    private BigDecimal tienTT;

    @NotEmpty(message = "Phiếu giảm giá phải có ít nhất một dòng chi tiết")
    @Valid
    private List<CTPhieuDTO> chiTietList = new ArrayList<>();
    
    // Thông tin bổ sung (chỉ đọc)
    private String tenKH;
    private String tenTKNoGiamTru;
    private String tenTKCoTT;
    private String tenTKNoThue;
    private String soHoaDon; // Thông tin hóa đơn liên quan
}
