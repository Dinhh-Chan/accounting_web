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
@Table(name = "CT_Phieu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(CTPhieuId.class)
public class CTPhieu implements Serializable {

    @Id
    @Column(name = "SoPhieu", length = 10)
    private String soPhieu;

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
    @JoinColumn(name = "SoPhieu", insertable = false, updatable = false)
    @ToString.Exclude
    private PhieuGiamGia phieuGiamGia;

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