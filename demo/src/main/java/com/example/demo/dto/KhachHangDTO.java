package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhachHangDTO {
    private String maKH;

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 100, message = "Tên khách hàng không được vượt quá 100 ký tự")
    private String tenKH;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 150, message = "Địa chỉ không được vượt quá 150 ký tự")
    private String diaChi;

    @Pattern(regexp = "^[0-9]{10}$", message = "Số điện thoại phải có 10 chữ số")
    private String sdt;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Pattern(regexp = "^[0-9]{10,13}$", message = "Mã số thuế phải có từ 10 đến 13 chữ số")
    private String maSoThue;

    @Size(max = 50, message = "Phân loại không được vượt quá 50 ký tự")
    private String phanLoai;
}