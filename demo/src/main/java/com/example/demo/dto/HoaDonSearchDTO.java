package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonSearchDTO {
    private String maKH;
    private String soCT;
    private LocalDateTime tuNgay;
    private LocalDateTime denNgay;
    private String hinhThucTT;
    private BigDecimal tienTTMin;
    private BigDecimal tienTTMax;
}