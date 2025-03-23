package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TKKT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TKKT {

    @Id
    @Column(name = "MaTK", length = 10)
    private String maTK;

    @NotNull
    @Size(max = 100)
    @Column(name = "TenTK", length = 100, nullable = false)
    private String tenTK;

    @NotNull
    @Column(name = "CapTK", nullable = false)
    private Integer capTK;

    @OneToMany(mappedBy = "tkNoEntity")
    private List<HoaDon> hoaDonsTKNo = new ArrayList<>();

    @OneToMany(mappedBy = "tkCoDTEntity")
    private List<HoaDon> hoaDonsTKCoDT = new ArrayList<>();

    @OneToMany(mappedBy = "tkCoThueEntity")
    private List<HoaDon> hoaDonsTKCoThue = new ArrayList<>();

    @OneToMany(mappedBy = "tkChietKhauEntity")
    private List<HoaDon> hoaDonsTKChietKhau = new ArrayList<>();

    @OneToMany(mappedBy = "tkNoGiamTruEntity")
    private List<PhieuGiamGia> phieuGiamGiasTKNoGiamTru = new ArrayList<>();

    @OneToMany(mappedBy = "tkCoTTEntity")
    private List<PhieuGiamGia> phieuGiamGiasTKCoTT = new ArrayList<>();

    @OneToMany(mappedBy = "tkNoThueEntity")
    private List<PhieuGiamGia> phieuGiamGiasTKNoThue = new ArrayList<>();
}