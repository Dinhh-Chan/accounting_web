package com.example.demo.repository;

import com.example.demo.entity.SPDV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SPDVRepository extends JpaRepository<SPDV, String> {
    List<SPDV> findByTenSPDVContainingIgnoreCase(String tenSPDV);
    
    @Query(value = "SELECT CONCAT('SP', RIGHT(REPLICATE('0', 4) + CAST(ISNULL(MAX(CAST(SUBSTRING(MaSPDV, 3, 10) AS INT)), 0) + 1 AS VARCHAR), 4)) FROM SPDV", nativeQuery = true)
    String generateNewMaSPDV();
    
    boolean existsByTenSPDVIgnoreCase(String tenSPDV);
    
    List<SPDV> findByDvtIgnoreCase(String dvt);
}