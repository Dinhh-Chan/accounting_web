package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BANGGIA")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BangGiaId.class)
public class BangGia implements Serializable {

    @Id
    @Column(name = "MaSPDV", length = 10)
    private String maSPDV;

    @Id
    @Column(name = "NgayHL")
    private LocalDateTime ngayHL;

    @Column(name = "GiaBan")
    private BigDecimal giaBan;

    @ManyToOne
    @JoinColumn(name = "MaSPDV", insertable = false, updatable = false)
    private SPDV spdv;
}