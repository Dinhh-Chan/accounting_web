package com.example.demo.repository;

import com.example.demo.entity.CTHoaDon;
import com.example.demo.entity.CTHoaDonId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CTHoaDonRepository extends JpaRepository<CTHoaDon, CTHoaDonId> {
    
    List<CTHoaDon> findBySoCT(String soCT);
    
    List<CTHoaDon> findByMaSPDV(String maSPDV);
    
    @Query("SELECT ct FROM CTHoaDon ct JOIN ct.hoaDon h WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay")
    List<CTHoaDon> findByDateRange(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT ct FROM CTHoaDon ct JOIN ct.hoaDon h WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay AND ct.maSPDV = :maSPDV")
    List<CTHoaDon> findByProductAndDateRange(
            @Param("maSPDV") String maSPDV, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT SUM(ct.soLuong) FROM CTHoaDon ct WHERE ct.maSPDV = :maSPDV AND ct.hoaDon.ngayLap BETWEEN :tuNgay AND :denNgay")
    Long getTotalQuantityByProductAndDateRange(
            @Param("maSPDV") String maSPDV, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    void deleteBySoCT(String soCT);
}