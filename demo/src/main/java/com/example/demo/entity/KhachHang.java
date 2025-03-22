package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "KHACHHANG")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhachHang {

    @Id
    @Column(name = "MaKH", length = 10)
    private String maKH;

    @NotNull
    @Size(max = 100)
    @Column(name = "TenKH", length = 100, nullable = false)
    private String tenKH;

    @NotNull
    @Size(max = 150)
    @Column(name = "DiaChi", length = 150, nullable = false)
    private String diaChi;

    @Size(max = 10)
    @Column(name = "SDT", length = 10)
    private String sdt;

    @Size(max = 100)
    @Column(name = "Email", length = 100)
    private String email;

    @Size(max = 15)
    @Column(name = "MaSoThue", length = 15)
    private String maSoThue;

    @Size(max = 50)
    @Column(name = "PhanLoai", length = 50)
    private String phanLoai;

    // @OneToMany(mappedBy = "khachHang", cascade = CascadeType.ALL)
    // private List<HoaDon> hoaDons;

    // @OneToMany(mappedBy = "khachHang", cascade = CascadeType.ALL)
    // private List<PhieuGiamGia> phieuGiamGias;
}