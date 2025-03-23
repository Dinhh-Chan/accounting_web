package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DinhMucCK")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(DinhMucCKId.class)
public class DinhMucCK implements Serializable {

    @Id
    @Column(name = "MaSPDV", length = 10)
    private String maSPDV;

    @Id
    @Column(name = "NgayHL")
    private LocalDateTime ngayHL;

    @Id
    @Column(name = "MucTien")
    private BigDecimal mucTien;

    @Size(max = 10)
    @Column(name = "TyLeCK", length = 10)
    private String tyLeCK;

    @ManyToOne
    @JoinColumn(name = "MaSPDV", insertable = false, updatable = false)
    private SPDV spdv;
}