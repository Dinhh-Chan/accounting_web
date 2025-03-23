package com.example.demo.repository;

import com.example.demo.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    
    List<HoaDon> findByMaKH(String maKH);
    
    List<HoaDon> findByNgayLapBetween(LocalDateTime tuNgay, LocalDateTime denNgay);
    
    List<HoaDon> findByHinhThucTT(String hinhThucTT);
    
    @Query("SELECT h FROM HoaDon h WHERE h.maKH = :maKH AND h.ngayLap BETWEEN :tuNgay AND :denNgay")
    List<HoaDon> findByMaKHAndDateRange(
            @Param("maKH") String maKH, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT h FROM HoaDon h WHERE h.tienTT BETWEEN :minAmount AND :maxAmount")
    List<HoaDon> findByAmountRange(
            @Param("minAmount") BigDecimal minAmount, 
            @Param("maxAmount") BigDecimal maxAmount);
    
    @Query("SELECT SUM(h.tienDT) FROM HoaDon h WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay")
    BigDecimal getTotalRevenueByDateRange(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT SUM(h.tienCK) FROM HoaDon h WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay")
    BigDecimal getTotalDiscountByDateRange(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT SUM(h.tienThue) FROM HoaDon h WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay")
    BigDecimal getTotalTaxByDateRange(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query("SELECT h FROM HoaDon h JOIN h.ctHoaDons ct WHERE ct.maSPDV = :maSPDV")
    List<HoaDon> findByProduct(@Param("maSPDV") String maSPDV);
    
    @Query("SELECT h FROM HoaDon h JOIN h.ctHoaDons ct WHERE ct.maSPDV = :maSPDV AND h.ngayLap BETWEEN :tuNgay AND :denNgay")
    List<HoaDon> findByProductAndDateRange(
            @Param("maSPDV") String maSPDV, 
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    @Query(value = "SELECT CONCAT('HD', RIGHT(REPLICATE('0', 4) + CAST(ISNULL(MAX(CAST(SUBSTRING(SoCT, 3, 10) AS INT)), 0) + 1 AS VARCHAR), 4)) FROM HoaDon", nativeQuery = true)
    String generateNewSoCT();
    
    // Thống kê doanh thu theo khách hàng
    @Query("SELECT h.maKH, h.tenKH, SUM(h.tienDT) FROM HoaDon h WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay GROUP BY h.maKH, h.tenKH")
    List<Object[]> getRevenueByCustomer(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    // Thống kê doanh thu theo sản phẩm/dịch vụ
    @Query("SELECT ct.maSPDV, s.tenSPDV, SUM(ct.soLuong), SUM(ct.soLuong * ct.donGia) " +
           "FROM CTHoaDon ct JOIN ct.hoaDon h JOIN ct.spdv s " +
           "WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay " +
           "GROUP BY ct.maSPDV, s.tenSPDV")
    List<Object[]> getRevenueByProduct(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
    
    // Thống kê doanh thu theo hình thức thanh toán
    @Query("SELECT h.hinhThucTT, COUNT(h), SUM(h.tienTT) FROM HoaDon h " +
           "WHERE h.ngayLap BETWEEN :tuNgay AND :denNgay " +
           "GROUP BY h.hinhThucTT")
    List<Object[]> getRevenueByPaymentMethod(
            @Param("tuNgay") LocalDateTime tuNgay, 
            @Param("denNgay") LocalDateTime denNgay);
}