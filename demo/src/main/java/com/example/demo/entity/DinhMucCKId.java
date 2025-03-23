package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DinhMucCKId implements Serializable {
    private String maSPDV;
    private LocalDateTime ngayHL;
    private BigDecimal mucTien;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DinhMucCKId that = (DinhMucCKId) o;
        return Objects.equals(maSPDV, that.maSPDV) && 
               Objects.equals(ngayHL, that.ngayHL) && 
               Objects.equals(mucTien, that.mucTien);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maSPDV, ngayHL, mucTien);
    }
}