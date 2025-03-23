package com.example.demo.repository;

import com.example.demo.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    Optional<KhachHang> findByMaSoThue(String maSoThue);
    List<KhachHang> findByTenKHContainingIgnoreCase(String tenKH);
    List<KhachHang> findByPhanLoai(String phanLoai);
    
    @Query(value = "SELECT CONCAT('KH', RIGHT(REPLICATE('0', 4) + CAST(ISNULL(MAX(CAST(SUBSTRING(MaKH, 3, 10) AS INT)), 0) + 1 AS VARCHAR), 4)) FROM KHACHHANG", nativeQuery = true)
    String generateNewMaKH();
}