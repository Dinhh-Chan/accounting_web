package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTHoaDonId implements Serializable {
    private String soCT;
    private String maSPDV;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CTHoaDonId that = (CTHoaDonId) o;
        return Objects.equals(soCT, that.soCT) && 
               Objects.equals(maSPDV, that.maSPDV);
    }

    @Override
    public int hashCode() {
        return Objects.hash(soCT, maSPDV);
    }
}