package com.example.demo.repository;

import com.example.demo.entity.PhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, String> {
    
    List<PhieuGiamGia> findByMaKH(String maKH);
    
    List<PhieuGiamGia> findBySoCT(String soCT);
    
    List<PhieuGiamGia> findByNgayLapBetween(LocalDateTime tuNgay, LocalDateTime denNgay);
    
    @Query("SELECT p FROM PhieuGiamGia p WHERE p.maKH = :maKH AND p.ngayLap BETWEEN :tuNgay AND :denNgay")
    List<PhieuGiamGia> findByMaKHAndDateRange(
            @Param("maKH") String maKH, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT p FROM PhieuGiamGia p WHERE p.tienDT BETWEEN :minAmount AND :maxAmount")
    List<PhieuGiamGia> findByAmountRange(
            @Param("minAmount") BigDecimal minAmount, 
            @Param("maxAmount") BigDecimal maxAmount);
    
    @Query("SELECT SUM(p.tienDT) FROM PhieuGiamGia p WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay")
    BigDecimal getTotalDiscountByDateRange(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT SUM(p.tienThue) FROM PhieuGiamGia p WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay")
    BigDecimal getTotalTaxByDateRange(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT p FROM PhieuGiamGia p JOIN p.ctPhieus ct WHERE ct.maSPDV = :maSPDV")
    List<PhieuGiamGia> findByProduct(@Param("maSPDV") String maSPDV);
    
    @Query("SELECT p FROM PhieuGiamGia p JOIN p.ctPhieus ct WHERE ct.maSPDV = :maSPDV AND p.ngayLap BETWEEN :tuNgay AND :denNgay")
    List<PhieuGiamGia> findByProductAndDateRange(
            @Param("maSPDV") String maSPDV, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query(value = "SELECT CONCAT('PH', RIGHT(REPLICATE('0', 4) + CAST(ISNULL(MAX(CAST(SUBSTRING(SoPhieu, 3, 10) AS INT)), 0) + 1 AS VARCHAR), 4)) FROM PHIEUGIAMGIA", nativeQuery = true)
    String generateNewSoPhieu();
    
    // Thống kê giảm trừ theo khách hàng
    @Query("SELECT p.maKH, p.khachHang.tenKH, SUM(p.tienDT) FROM PhieuGiamGia p WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay GROUP BY p.maKH, p.khachHang.tenKH")
    List<Object[]> getDiscountByCustomer(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    // Thống kê giảm trừ theo sản phẩm/dịch vụ
    @Query("SELECT ct.maSPDV, s.tenSPDV, SUM(ct.soLuong), SUM(ct.soLuong * ct.donGia) " +
           "FROM CTPhieu ct JOIN ct.phieuGiamGia p JOIN ct.spdv s " +
           "WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay " +
           "GROUP BY ct.maSPDV, s.tenSPDV")
    List<Object[]> getDiscountByProduct(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    // Thống kê giảm trừ theo hóa đơn
    @Query("SELECT p.soCT, COUNT(p), SUM(p.tienDT) FROM PhieuGiamGia p " +
           "WHERE p.ngayLap BETWEEN :tuNgay AND :denNgay " +
           "GROUP BY p.soCT")
    List<Object[]> getDiscountByInvoice(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
}