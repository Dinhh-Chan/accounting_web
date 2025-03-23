package com.example.demo.repository;

import com.example.demo.entity.BangGia;
import com.example.demo.entity.BangGiaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BangGiaRepository extends JpaRepository<BangGia, BangGiaId> {
    List<BangGia> findByMaSPDV(String maSPDV);
    
    @Query("SELECT bg FROM BangGia bg WHERE bg.maSPDV = :maSPDV ORDER BY bg.ngayHL DESC")
    List<BangGia> findByMaSPDVOrderByNgayHLDesc(@Param("maSPDV") String maSPDV);
    
    @Query("SELECT bg FROM BangGia bg WHERE bg.maSPDV = :maSPDV AND bg.ngayHL <= :ngayHienTai ORDER BY bg.ngayHL DESC")
    List<BangGia> findValidPrices(@Param("maSPDV") String maSPDV, @Param("ngayHienTai") LocalDateTime ngayHienTai);
    
    @Query(value = "SELECT * FROM BANGGIA bg WHERE bg.MaSPDV = :maSPDV AND bg.NgayHL <= :ngayHienTai ORDER BY bg.NgayHL DESC LIMIT 1", nativeQuery = true)
    Optional<BangGia> findLatestValidPrice(@Param("maSPDV") String maSPDV, @Param("ngayHienTai") LocalDateTime ngayHienTai);
    
    @Query("SELECT bg FROM BangGia bg WHERE bg.ngayHL BETWEEN :tuNgay AND :denNgay")
    List<BangGia> findByDateRange(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);
}