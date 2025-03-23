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
public class HoaDonDTO {
    private String soCT;

    @NotNull(message = "Ngày lập không được để trống")
    private LocalDateTime ngayLap;

    @NotBlank(message = "Mã khách hàng không được để trống")
    @Size(max = 10, message = "Mã khách hàng không được vượt quá 10 ký tự")
    private String maKH;

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 150, message = "Tên khách hàng không được vượt quá 150 ký tự")
    private String tenKH;

    @Size(max = 50, message = "Hình thức thanh toán không được vượt quá 50 ký tự")
    private String hinhThucTT;

    @NotBlank(message = "Tài khoản nợ không được để trống")
    @Size(max = 10, message = "Tài khoản nợ không được vượt quá 10 ký tự")
    private String tkNo;

    @Size(max = 150, message = "Diễn giải không được vượt quá 150 ký tự")
    private String dienGiai;

    @NotBlank(message = "Tài khoản có doanh thu không được để trống")
    @Size(max = 10, message = "Tài khoản có doanh thu không được vượt quá 10 ký tự")
    private String tkCoDT;

    @Size(max = 10, message = "Tài khoản có thuế không được vượt quá 10 ký tự")
    private String tkCoThue;

    @Size(max = 10, message = "Thuế suất không được vượt quá 10 ký tự")
    private String thueSuat;

    private BigDecimal tienThue;

    @Size(max = 10, message = "Tỷ lệ chiết khấu không được vượt quá 10 ký tự")
    private String tyLeCK;

    @Size(max = 10, message = "Tài khoản chiết khấu không được vượt quá 10 ký tự")
    private String tkChietKhau;

    private BigDecimal tienCK;

    private BigDecimal tienDT;

    private BigDecimal tienTT;

    @NotEmpty(message = "Hóa đơn phải có ít nhất một dòng chi tiết")
    @Valid
    private List<CTHoaDonDTO> chiTietList = new ArrayList<>();
    
    // Thông tin bổ sung (chỉ đọc)
    private String tenTKNo;
    private String tenTKCoDT;
    private String tenTKCoThue;
    private String tenTKChietKhau;
}