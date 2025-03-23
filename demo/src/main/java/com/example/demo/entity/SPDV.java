package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SPDV")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SPDV {

    @Id
    @Column(name = "MaSPDV", length = 10)
    private String maSPDV;

    @NotNull
    @Size(max = 100)
    @Column(name = "TenSPDV", length = 100, nullable = false)
    private String tenSPDV;

    @NotNull
    @Column(name = "DonGia", nullable = false)
    private BigDecimal donGia;

    @Size(max = 10)
    @Column(name = "DVT", length = 10)
    private String dvt;

    @Size(max = 200)
    @Column(name = "MoTa", length = 200)
    private String moTa;

    @OneToMany(mappedBy = "spdv", cascade = CascadeType.ALL)
    private List<BangGia> bangGias = new ArrayList<>();

    @OneToMany(mappedBy = "spdv", cascade = CascadeType.ALL)
    private List<DinhMucCK> dinhMucCKs = new ArrayList<>();

    @OneToMany(mappedBy = "spdv", cascade = CascadeType.ALL)
    private List<CTHoaDon> ctHoaDons = new ArrayList<>();

    @OneToMany(mappedBy = "spdv", cascade = CascadeType.ALL)
    private List<CTPhieu> ctPhieus = new ArrayList<>();
}