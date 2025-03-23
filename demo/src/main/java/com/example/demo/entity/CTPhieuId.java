package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTPhieuId implements Serializable {
    private String soPhieu;
    private String maSPDV;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CTPhieuId ctPhieuId = (CTPhieuId) o;
        return Objects.equals(soPhieu, ctPhieuId.soPhieu) && 
               Objects.equals(maSPDV, ctPhieuId.maSPDV);
    }

    @Override
    public int hashCode() {
        return Objects.hash(soPhieu, maSPDV);
    }
}