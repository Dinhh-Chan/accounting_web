package com.example.demo.repository;

import com.example.demo.entity.TKKT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TKKTRepository extends JpaRepository<TKKT, String> {
    
    List<TKKT> findByTenTKContainingIgnoreCase(String tenTK);
    
    List<TKKT> findByCapTK(Integer capTK);
    
    List<TKKT> findByMaTKStartingWith(String prefix);
    
    boolean existsByTenTKIgnoreCase(String tenTK);
    
    // Tìm tài khoản con của một tài khoản cha
    @Query("SELECT t FROM TKKT t WHERE t.maTK LIKE CONCAT(:parentTK, '.%')")
    List<TKKT> findChildAccounts(@Param("parentTK") String parentTK);
    
    // Kiểm tra tài khoản có đang được sử dụng trong giao dịch
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE " +
           "CASE WHEN COUNT(p) > 0 THEN true ELSE false END END FROM HoaDon h, PhieuGiamGia p " +
           "WHERE h.tkNo = :maTK OR h.tkCoDT = :maTK OR h.tkCoThue = :maTK OR h.tkChietKhau = :maTK " +
           "OR p.tkNoGiamTru = :maTK OR p.tkCoTT = :maTK OR p.tkNoThue = :maTK")
    boolean isAccountInUse(@Param("maTK") String maTK);
    
    // Tìm tài khoản có cấp ngay dưới cấp của tài khoản cụ thể
    @Query("SELECT t FROM TKKT t WHERE t.capTK = :capTK + 1 ORDER BY t.maTK")
    List<TKKT> findNextLevelAccounts(@Param("capTK") Integer capTK);
    
    // Tìm tài khoản theo cả mã và tên
    @Query("SELECT t FROM TKKT t WHERE (t.maTK LIKE %:keyword% OR t.tenTK LIKE %:keyword%)")
    List<TKKT> searchByKeyword(@Param("keyword") String keyword);
}