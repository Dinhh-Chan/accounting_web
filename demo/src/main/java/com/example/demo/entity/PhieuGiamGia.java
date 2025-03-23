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
@Table(name = "PHIEUGIAMGIA")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuGiamGia {

    @Id
    @Column(name = "SoPhieu", length = 10)
    private String soPhieu;

    @NotNull
    @Column(name = "NgayLap", nullable = false)
    private LocalDateTime ngayLap;

    @NotNull
    @Column(name = "MaKH", length = 10, nullable = false)
    private String maKH;

    @Size(max = 150)
    @Column(name = "DienGiai", length = 150)
    private String dienGiai;

    @NotNull
    @Column(name = "TKNoGiamTru", length = 10, nullable = false)
    private String tkNoGiamTru;

    @NotNull
    @Column(name = "TKCoTT", length = 10, nullable = false)
    private String tkCoTT;

    @NotNull
    @Column(name = "SoCT", length = 10, nullable = false)
    private String soCT;

    @Size(max = 10)
    @Column(name = "ThueSuat", length = 10)
    private String thueSuat;

    @Column(name = "TienThue")
    private BigDecimal tienThue;

    @Column(name = "TKNoThue", length = 10)
    private String tkNoThue;

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
    @JoinColumn(name = "SoCT", insertable = false, updatable = false)
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "TKNoGiamTru", insertable = false, updatable = false)
    private TKKT tkNoGiamTruEntity;

    @ManyToOne
    @JoinColumn(name = "TKCoTT", insertable = false, updatable = false)
    private TKKT tkCoTTEntity;

    @ManyToOne
    @JoinColumn(name = "TKNoThue", insertable = false, updatable = false)
    private TKKT tkNoThueEntity;

    @OneToMany(mappedBy = "phieuGiamGia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CTPhieu> ctPhieus = new ArrayList<>();
    
    // Helper method để quản lý quan hệ hai chiều
    public void addCTPhieu(CTPhieu ctPhieu) {
        ctPhieus.add(ctPhieu);
        ctPhieu.setPhieuGiamGia(this);
    }
    
    public void removeCTPhieu(CTPhieu ctPhieu) {
        ctPhieus.remove(ctPhieu);
        ctPhieu.setPhieuGiamGia(null);
    }
}