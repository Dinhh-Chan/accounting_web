package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "HoaDon")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDon {

    @Id
    @Column(name = "SoCT", length = 10)
    private String soCT;

    @NotNull
    @Column(name = "NgayLap", nullable = false)
    private LocalDateTime ngayLap;

    @NotNull
    @Column(name = "MaKH", length = 10, nullable = false)
    private String maKH;

    @NotNull
    @Size(max = 150)
    @Column(name = "TenKH", length = 150, nullable = false)
    private String tenKH;

    @Size(max = 50)
    @Column(name = "HinhThucTT", length = 50)
    private String hinhThucTT;

    @NotNull
    @Column(name = "TKNo", length = 10, nullable = false)
    private String tkNo;

    @Size(max = 150)
    @Column(name = "DienGiai", length = 150)
    private String dienGiai;

    @NotNull
    @Column(name = "TKCoDT", length = 10, nullable = false)
    private String tkCoDT;

    @Column(name = "TKCoThue", length = 10)
    private String tkCoThue;

    @Size(max = 10)
    @Column(name = "ThueSuat", length = 10)
    private String thueSuat;

    @Column(name = "TienThue")
    private BigDecimal tienThue;

    @Size(max = 10)
    @Column(name = "TyLeCK", length = 10)
    private String tyLeCK;

    @Column(name = "TKChietKhau", length = 10)
    private String tkChietKhau;

    @Column(name = "TienCK")
    private BigDecimal tienCK;

    @NotNull
    @Column(name = "TienDT", nullable = false)
    private BigDecimal tienDT;

    @NotNull
    @Column(name = "TienTT", nullable = false)
    private BigDecimal tienTT;

    @ManyToOne
    @JoinColumn(name = "MaKH", insertable = false, updatable = false)
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "TKNo", insertable = false, updatable = false)
    private TKKT tkNoEntity;

    @ManyToOne
    @JoinColumn(name = "TKCoDT", insertable = false, updatable = false)
    private TKKT tkCoDTEntity;

    @ManyToOne
    @JoinColumn(name = "TKCoThue", insertable = false, updatable = false)
    private TKKT tkCoThueEntity;

    @ManyToOne
    @JoinColumn(name = "TKChietKhau", insertable = false, updatable = false)
    private TKKT tkChietKhauEntity;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CTHoaDon> ctHoaDons = new ArrayList<>();

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL)
    private List<PhieuGiamGia> phieuGiamGias = new ArrayList<>();
    
    // Helper method để quản lý quan hệ hai chiều
    public void addCTHoaDon(CTHoaDon ctHoaDon) {
        ctHoaDons.add(ctHoaDon);
        ctHoaDon.setHoaDon(this);
    }
    
    public void removeCTHoaDon(CTHoaDon ctHoaDon) {
        ctHoaDons.remove(ctHoaDon);
        ctHoaDon.setHoaDon(null);
    }
}