package com.example.demo.service;

import com.example.demo.entity.TKKT;
import com.example.demo.repository.TKKTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TKKTService {

    private final TKKTRepository tkktRepository;

    @Autowired
    public TKKTService(TKKTRepository tkktRepository) {
        this.tkktRepository = tkktRepository;
    }

    public List<TKKT> getAllTKKT() {
        return tkktRepository.findAll();
    }

    public Optional<TKKT> getTKKTById(String maTK) {
        return tkktRepository.findById(maTK);
    }

    public List<TKKT> getTKKTByCapTK(Integer capTK) {
        return tkktRepository.findByCapTK(capTK);
    }

    public List<TKKT> getTKKTByPrefix(String prefix) {
        return tkktRepository.findByMaTKStartingWith(prefix);
    }
    
    public List<TKKT> searchTKKT(String keyword) {
        return tkktRepository.searchByKeyword(keyword);
    }
    
    public List<TKKT> getChildAccounts(String parentTK) {
        return tkktRepository.findChildAccounts(parentTK);
    }
    
    public List<TKKT> getNextLevelAccounts(Integer capTK) {
        return tkktRepository.findNextLevelAccounts(capTK);
    }
    
    public boolean isAccountInUse(String maTK) {
        return tkktRepository.isAccountInUse(maTK);
    }

    @Transactional
    public TKKT createTKKT(TKKT tkkt) {
        try {
            // Kiểm tra mã TK đã tồn tại chưa
            if (tkktRepository.existsById(tkkt.getMaTK())) {
                throw new RuntimeException("Mã tài khoản đã tồn tại trong hệ thống!");
            }
            
            // Kiểm tra tên TK đã tồn tại chưa
            if (tkktRepository.existsByTenTKIgnoreCase(tkkt.getTenTK())) {
                throw new RuntimeException("Tên tài khoản đã tồn tại trong hệ thống!");
            }
            
            // Nếu là tài khoản con (capTK > 1), kiểm tra tài khoản cha có tồn tại không
            if (tkkt.getCapTK() > 1) {
                String parentCode = getParentAccountCode(tkkt.getMaTK());
                if (parentCode != null && !tkktRepository.existsById(parentCode)) {
                    throw new RuntimeException("Tài khoản cha không tồn tại!");
                }
            }

            return tkktRepository.save(tkkt);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu tài khoản: " + e.getMessage());
        }
    }

    @Transactional
    public TKKT updateTKKT(String maTK, TKKT tkktDetails) {
        try {
            TKKT tkkt = tkktRepository.findById(maTK)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản kế toán với mã: " + maTK));

            // Kiểm tra tên TK có trùng với tài khoản khác không
            if (!tkkt.getTenTK().equalsIgnoreCase(tkktDetails.getTenTK()) &&
                    tkktRepository.existsByTenTKIgnoreCase(tkktDetails.getTenTK())) {
                throw new RuntimeException("Tên tài khoản đã tồn tại trong hệ thống!");
            }
            
            // Không cho phép thay đổi mã TK
            if (!tkkt.getMaTK().equals(tkktDetails.getMaTK())) {
                throw new RuntimeException("Không thể thay đổi mã tài khoản!");
            }
            
            // Không cho phép thay đổi cấp TK nếu có tài khoản con
            if (!tkkt.getCapTK().equals(tkktDetails.getCapTK()) && 
                    !tkktRepository.findChildAccounts(tkkt.getMaTK()).isEmpty()) {
                throw new RuntimeException("Không thể thay đổi cấp tài khoản khi đã có tài khoản con!");
            }

            tkkt.setTenTK(tkktDetails.getTenTK());
            tkkt.setCapTK(tkktDetails.getCapTK());

            return tkktRepository.save(tkkt);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi cập nhật dữ liệu tài khoản: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteTKKT(String maTK) {
        try {
            TKKT tkkt = tkktRepository.findById(maTK)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản kế toán với mã: " + maTK));

            // Kiểm tra xem tài khoản có được sử dụng trong các hóa đơn hoặc phiếu giảm giá không
            if (tkktRepository.isAccountInUse(maTK)) {
                throw new RuntimeException("Không thể xóa tài khoản đã được sử dụng trong giao dịch!");
            }
            
            // Kiểm tra xem tài khoản có tài khoản con không
            List<TKKT> childAccounts = tkktRepository.findChildAccounts(maTK);
            if (!childAccounts.isEmpty()) {
                throw new RuntimeException("Không thể xóa tài khoản có tài khoản con. Xóa tài khoản con trước!");
            }

            tkktRepository.delete(tkkt);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Lỗi khi xóa tài khoản: " + e.getMessage());
        }
    }
    
    // Hàm hỗ trợ để lấy mã tài khoản cha từ mã tài khoản hiện tại
    private String getParentAccountCode(String accountCode) {
        int lastDotIndex = accountCode.lastIndexOf(".");
        if (lastDotIndex > 0) {
            return accountCode.substring(0, lastDotIndex);
        }
        return null;
    }
}