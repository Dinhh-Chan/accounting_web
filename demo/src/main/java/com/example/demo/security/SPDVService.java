package com.example.demo.service;

import com.example.demo.entity.SPDV;
import com.example.demo.repository.SPDVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SPDVService {

    private final SPDVRepository spdvRepository;

    @Autowired
    public SPDVService(SPDVRepository spdvRepository) {
        this.spdvRepository = spdvRepository;
    }

    public List<SPDV> getAllSPDV() {
        return spdvRepository.findAll();
    }

    public Optional<SPDV> getSPDVById(String maSPDV) {
        return spdvRepository.findById(maSPDV);
    }

    public List<SPDV> findSPDVByName(String tenSPDV) {
        return spdvRepository.findByTenSPDVContainingIgnoreCase(tenSPDV);
    }
    
    public List<SPDV> findSPDVByDVT(String dvt) {
        return spdvRepository.findByDvtIgnoreCase(dvt);
    }

    @Transactional
    public SPDV createSPDV(SPDV spdv) {
        try {
            // Kiểm tra tên sản phẩm/dịch vụ đã tồn tại chưa
            boolean exists = spdvRepository.existsByTenSPDVIgnoreCase(spdv.getTenSPDV());
            if (exists) {
                throw new RuntimeException("Tên sản phẩm/dịch vụ đã tồn tại trong hệ thống!");
            }

            // Tạo mã SPDV tự động nếu chưa có
            if (spdv.getMaSPDV() == null || spdv.getMaSPDV().isEmpty()) {
                String newMaSPDV = spdvRepository.generateNewMaSPDV();
                spdv.setMaSPDV(newMaSPDV);
            }

            return spdvRepository.save(spdv);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu sản phẩm/dịch vụ: " + e.getMessage());
        }
    }

    @Transactional
    public SPDV updateSPDV(String maSPDV, SPDV spdvDetails) {
        try {
            SPDV spdv = spdvRepository.findById(maSPDV)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + maSPDV));

            // Kiểm tra tên sản phẩm/dịch vụ nếu có thay đổi
            if (!spdvDetails.getTenSPDV().equalsIgnoreCase(spdv.getTenSPDV())) {
                boolean exists = spdvRepository.existsByTenSPDVIgnoreCase(spdvDetails.getTenSPDV());
                if (exists) {
                    throw new RuntimeException("Tên sản phẩm/dịch vụ đã tồn tại trong hệ thống!");
                }
            }

            spdv.setTenSPDV(spdvDetails.getTenSPDV());
            spdv.setDonGia(spdvDetails.getDonGia());
            spdv.setDvt(spdvDetails.getDvt());
            spdv.setMoTa(spdvDetails.getMoTa());

            return spdvRepository.save(spdv);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu sản phẩm/dịch vụ: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteSPDV(String maSPDV) {
        try {
            SPDV spdv = spdvRepository.findById(maSPDV)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + maSPDV));

            // Kiểm tra các liên kết trước khi xóa
            if (!spdv.getBangGias().isEmpty() || !spdv.getDinhMucCKs().isEmpty() ||
                    !spdv.getCtHoaDons().isEmpty() || !spdv.getCtPhieus().isEmpty()) {
                throw new RuntimeException("Không thể xóa sản phẩm/dịch vụ đã được sử dụng trong hệ thống!");
            }

            spdvRepository.delete(spdv);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi xóa sản phẩm/dịch vụ: " + e.getMessage());
        }
    }
}