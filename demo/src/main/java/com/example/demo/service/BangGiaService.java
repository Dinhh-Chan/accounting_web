package com.example.demo.service;

import com.example.demo.entity.BangGia;
import com.example.demo.entity.BangGiaId;
import com.example.demo.entity.SPDV;
import com.example.demo.repository.BangGiaRepository;
import com.example.demo.repository.SPDVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BangGiaService {

    private final BangGiaRepository bangGiaRepository;
    private final SPDVRepository spdvRepository;

    @Autowired
    public BangGiaService(BangGiaRepository bangGiaRepository, SPDVRepository spdvRepository) {
        this.bangGiaRepository = bangGiaRepository;
        this.spdvRepository = spdvRepository;
    }

    public List<BangGia> getAllBangGia() {
        return bangGiaRepository.findAll();
    }

    public Optional<BangGia> getBangGiaById(BangGiaId id) {
        return bangGiaRepository.findById(id);
    }

    public List<BangGia> getBangGiaByMaSPDV(String maSPDV) {
        return bangGiaRepository.findByMaSPDVOrderByNgayHLDesc(maSPDV);
    }
    
    public List<BangGia> getValidPrices(String maSPDV, LocalDateTime ngayHienTai) {
        if (ngayHienTai == null) {
            ngayHienTai = LocalDateTime.now();
        }
        return bangGiaRepository.findValidPrices(maSPDV, ngayHienTai);
    }
    
    public Optional<BangGia> getLatestValidPrice(String maSPDV, LocalDateTime ngayHienTai) {
        if (ngayHienTai == null) {
            ngayHienTai = LocalDateTime.now();
        }
        return bangGiaRepository.findLatestValidPrice(maSPDV, ngayHienTai);
    }
    
    public List<BangGia> getBangGiaByDateRange(LocalDateTime tuNgay, LocalDateTime denNgay) {
        return bangGiaRepository.findByDateRange(tuNgay, denNgay);
    }

    @Transactional
    public BangGia createBangGia(BangGia bangGia) {
        try {
            // Kiểm tra sản phẩm/dịch vụ có tồn tại không
            SPDV spdv = spdvRepository.findById(bangGia.getMaSPDV())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm/dịch vụ với mã: " + bangGia.getMaSPDV()));

            // Thiết lập ngày hiệu lực nếu chưa có
            if (bangGia.getNgayHL() == null) {
                bangGia.setNgayHL(LocalDateTime.now());
            }
            
            // Kiểm tra xem đã có giá cho sản phẩm/dịch vụ với ngày hiệu lực này chưa
            BangGiaId id = new BangGiaId(bangGia.getMaSPDV(), bangGia.getNgayHL());
            if (bangGiaRepository.existsById(id)) {
                throw new RuntimeException("Đã tồn tại giá bán cho sản phẩm/dịch vụ này vào ngày hiệu lực đã chọn");
            }

            return bangGiaRepository.save(bangGia);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu bảng giá: " + e.getMessage());
        }
    }

    @Transactional
    public BangGia updateBangGia(BangGiaId id, BangGia bangGiaDetails) {
        try {
            BangGia bangGia = bangGiaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng giá với mã sản phẩm và ngày hiệu lực đã chọn"));

            // Không cho phép thay đổi mã sản phẩm/dịch vụ và ngày hiệu lực (primary key)
            if (!bangGia.getMaSPDV().equals(bangGiaDetails.getMaSPDV()) || 
                !bangGia.getNgayHL().equals(bangGiaDetails.getNgayHL())) {
                throw new RuntimeException("Không thể thay đổi mã sản phẩm/dịch vụ hoặc ngày hiệu lực");
            }

            // Chỉ cập nhật giá bán
            bangGia.setGiaBan(bangGiaDetails.getGiaBan());

            return bangGiaRepository.save(bangGia);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu bảng giá: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteBangGia(BangGiaId id) {
        try {
            BangGia bangGia = bangGiaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bảng giá với mã sản phẩm và ngày hiệu lực đã chọn"));

            bangGiaRepository.delete(bangGia);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi xóa bảng giá: " + e.getMessage());
        }
    }
}