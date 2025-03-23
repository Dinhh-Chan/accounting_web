package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "CT_HoaDon")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(CTHoaDonId.class)
public class CTHoaDon implements Serializable {

    @Id
    @Column(name = "SoCT", length = 10)
    private String soCT;

    @Id
    @Column(name = "MaSPDV", length = 10)
    private String maSPDV;

    @Column(name = "SoLuong")
    private BigDecimal soLuong;

    @Size(max = 10)
    @Column(name = "DVT", length = 10)
    private String dvt;

    @Column(name = "DonGia")
    private BigDecimal donGia;

    @ManyToOne
    @JoinColumn(name = "SoCT", insertable = false, updatable = false)
    @ToString.Exclude
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "MaSPDV", insertable = false, updatable = false)
    private SPDV spdv;
    
    // Computed property - không được lưu trong database
    @Transient
    public BigDecimal getThanhTien() {
        if (soLuong != null && donGia != null) {
            return soLuong.multiply(donGia);
        }
        return BigDecimal.ZERO;
    }
}