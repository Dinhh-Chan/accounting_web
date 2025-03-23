package com.example.demo.service;

import com.example.demo.entity.KhachHang;
import com.example.demo.repository.KhachHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;

    @Autowired
    public KhachHangService(KhachHangRepository khachHangRepository) {
        this.khachHangRepository = khachHangRepository;
    }

    public List<KhachHang> getAllKhachHang() {
        return khachHangRepository.findAll();
    }

    public Optional<KhachHang> getKhachHangById(String maKH) {
        return khachHangRepository.findById(maKH);
    }

    public Optional<KhachHang> getKhachHangByMaSoThue(String maSoThue) {
        return khachHangRepository.findByMaSoThue(maSoThue);
    }

    public List<KhachHang> findKhachHangByName(String tenKH) {
        return khachHangRepository.findByTenKHContainingIgnoreCase(tenKH);
    }

    @Transactional
    public KhachHang createKhachHang(KhachHang khachHang) {
        try {
            // Kiểm tra mã số thuế
            if (khachHang.getMaSoThue() != null && !khachHang.getMaSoThue().isEmpty()) {
                Optional<KhachHang> existingKH = khachHangRepository.findByMaSoThue(khachHang.getMaSoThue());
                if (existingKH.isPresent()) {
                    throw new RuntimeException("Mã số thuế đã tồn tại trong hệ thống!");
                }
            }

            // Tạo mã khách hàng tự động nếu chưa có
            if (khachHang.getMaKH() == null || khachHang.getMaKH().isEmpty()) {
                String newMaKH = khachHangRepository.generateNewMaKH();
                khachHang.setMaKH(newMaKH);
            }

            return khachHangRepository.save(khachHang);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu khách hàng: " + e.getMessage());
        }
    }

    @Transactional
    public KhachHang updateKhachHang(String maKH, KhachHang khachHangDetails) {
        try {
            KhachHang khachHang = khachHangRepository.findById(maKH)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với mã: " + maKH));

            // Kiểm tra mã số thuế nếu có thay đổi
            if (khachHangDetails.getMaSoThue() != null && !khachHangDetails.getMaSoThue().isEmpty() &&
                    !khachHangDetails.getMaSoThue().equals(khachHang.getMaSoThue())) {
                Optional<KhachHang> existingKH = khachHangRepository.findByMaSoThue(khachHangDetails.getMaSoThue());
                if (existingKH.isPresent() && !existingKH.get().getMaKH().equals(maKH)) {
                    throw new RuntimeException("Mã số thuế đã tồn tại trong hệ thống!");
                }
            }

            khachHang.setTenKH(khachHangDetails.getTenKH());
            khachHang.setDiaChi(khachHangDetails.getDiaChi());
            khachHang.setSdt(khachHangDetails.getSdt());
            khachHang.setEmail(khachHangDetails.getEmail());
            khachHang.setMaSoThue(khachHangDetails.getMaSoThue());
            khachHang.setPhanLoai(khachHangDetails.getPhanLoai());

            return khachHangRepository.save(khachHang);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu khách hàng: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteKhachHang(String maKH) {
        try {
            KhachHang khachHang = khachHangRepository.findById(maKH)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với mã: " + maKH));

            // Kiểm tra xem khách hàng có liên kết với hóa đơn hoặc phiếu giảm giá không
            if (!khachHang.getHoaDons().isEmpty() || !khachHang.getPhieuGiamGias().isEmpty()) {
                throw new RuntimeException("Không thể xóa khách hàng đã có giao dịch trong hệ thống!");
            }

            khachHangRepository.delete(khachHang);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi xóa khách hàng: " + e.getMessage());
        }
    }
}