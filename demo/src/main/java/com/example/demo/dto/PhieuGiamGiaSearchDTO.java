package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGiaSearchDTO {
    private String maKH;
    private String soPhieu;
    private String soCT;
    private LocalDateTime tuNgay;
    private LocalDateTime denNgay;
    private BigDecimal tienGiamMin;
    private BigDecimal tienGiamMax;
}