package com.example.demo.repository;

import com.example.demo.entity.CTPhieu;
import com.example.demo.entity.CTPhieuId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CTPhieuRepository extends JpaRepository<CTPhieu, CTPhieuId> {
    
    List<CTPhieu> findBySoPhieu(String soPhieu);
    
    List<CTPhieu> findByMaSPDV(String maSPDV);
    
    @Query("SELECT ct FROM CTPhieu ct JOIN ct.phieuGiamGia p WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay")
    List<CTPhieu> findByDateRange(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT ct FROM CTPhieu ct JOIN ct.phieuGiamGia p WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay AND ct.maSPDV = :maSPDV")
    List<CTPhieu> findByProductAndDateRange(
            @Param("maSPDV") String maSPDV, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT SUM(ct.soLuong) FROM CTPhieu ct WHERE ct.maSPDV = :maSPDV AND ct.phieuGiamGia.ngayLap BETWEEN :tuNgay AND :denNgay")
    Long getTotalQuantityByProductAndDateRange(
            @Param("maSPDV") String maSPDV, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    void deleteBySoPhieu(String soPhieu);
}