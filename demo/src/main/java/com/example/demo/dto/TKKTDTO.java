package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TKKTDTO {
    
    @NotBlank(message = "Mã tài khoản không được để trống")
    @Pattern(regexp = "^[0-9\\.]+$", message = "Mã tài khoản phải chứa số và dấu chấm")
    @Size(max = 10, message = "Mã tài khoản không được vượt quá 10 ký tự")
    private String maTK;

    @NotBlank(message = "Tên tài khoản không được để trống")
    @Size(max = 100, message = "Tên tài khoản không được vượt quá 100 ký tự")
    private String tenTK;

    @NotNull(message = "Cấp tài khoản không được để trống")
    @Min(value = 1, message = "Cấp tài khoản tối thiểu là 1")
    @Max(value = 5, message = "Cấp tài khoản tối đa là 5")
    private Integer capTK;
}