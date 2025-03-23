package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BangGiaId implements Serializable {
    private String maSPDV;
    private LocalDateTime ngayHL;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BangGiaId bangGiaId = (BangGiaId) o;
        return Objects.equals(maSPDV, bangGiaId.maSPDV) && 
               Objects.equals(ngayHL, bangGiaId.ngayHL);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maSPDV, ngayHL);
    }
}