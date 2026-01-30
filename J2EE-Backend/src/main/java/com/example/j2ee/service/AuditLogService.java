package com.example.j2ee.service;

import com.example.j2ee.model.AuditLog;
import com.example.j2ee.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service cho AuditLog (Lịch sử thao tác)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Lấy tất cả audit log với phân trang
     */
    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    /**
     * Lấy audit log theo ID
     */
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy audit log với ID: " + id));
    }

    /**
     * Tìm kiếm audit log với nhiều điều kiện
     */
    public Page<AuditLog> searchAuditLogs(
            String loaiThaoTac,
            String bangAnhHuong,
            String loaiTaiKhoan,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            String search,
            Pageable pageable) {
        return auditLogRepository.searchAuditLogs(
                loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay, search, pageable);
    }

    /**
     * Tạo mới audit log
     */
    @Transactional
    public AuditLog createAuditLog(AuditLog auditLog) {
        if (auditLog.getThoiGian() == null) {
            auditLog.setThoiGian(LocalDateTime.now());
        }
        return auditLogRepository.save(auditLog);
    }

    /**
     * Xóa audit log theo ID
     */
    @Transactional
    public void deleteAuditLog(Long id) {
        auditLogRepository.deleteById(id);
    }

    /**
     * Lấy danh sách các loại thao tác
     */
    public List<String> getLoaiThaoTacList() {
        return auditLogRepository.findDistinctLoaiThaoTac();
    }

    /**
     * Lấy danh sách các bảng ảnh hưởng
     */
    public List<String> getBangAnhHuongList() {
        return auditLogRepository.findDistinctBangAnhHuong();
    }

    /**
     * Lấy thống kê tổng quan
     */
    public AuditLogStatistics getStatistics() {
        long totalLogs = auditLogRepository.count();
        long adminActions = auditLogRepository.countByLoaiTaiKhoan("ADMIN");
        long customerActions = auditLogRepository.countByLoaiTaiKhoan("CUSTOMER");
        long todayLogs = auditLogRepository.countTodayLogs();

        return new AuditLogStatistics(totalLogs, adminActions, customerActions, todayLogs);
    }

    /**
     * Ghi log thao tác tiện lợi
     */
    @Transactional
    public void logAction(
            String loaiThaoTac,
            String bangAnhHuong,
            int maBanGhi,
            String nguoiThucHien,
            String loaiTaiKhoan,
            String duLieuCu,
            String duLieuMoi,
            String moTa,
            String diaChiIp) {
        
        AuditLog logEntry = new AuditLog();
        logEntry.setLoaiThaoTac(loaiThaoTac);
        logEntry.setBangAnhHuong(bangAnhHuong);
        logEntry.setMaBanGhi(maBanGhi);
        logEntry.setNguoiThucHien(nguoiThucHien);
        logEntry.setLoaiTaiKhoan(loaiTaiKhoan);
        logEntry.setDuLieuCu(duLieuCu);
        logEntry.setDuLieuMoi(duLieuMoi);
        logEntry.setMoTa(moTa);
        logEntry.setDiaChiIp(diaChiIp);
        logEntry.setThoiGian(LocalDateTime.now());

        auditLogRepository.save(logEntry);
        log.debug("Đã ghi log: {} - {} - {}", loaiThaoTac, bangAnhHuong, nguoiThucHien);
    }

    /**
     * DTO cho thống kê audit log
     */
    public record AuditLogStatistics(
            long totalLogs,
            long adminActions,
            long customerActions,
            long todayLogs
    ) {}
}
