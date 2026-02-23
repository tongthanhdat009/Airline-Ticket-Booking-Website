package com.example.j2ee.repository;

import com.example.j2ee.model.VnPayTransactionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho VnPayTransactionLog (Lịch sử giao dịch VNPay)
 */
@Repository
public interface VnPayTransactionLogRepository extends JpaRepository<VnPayTransactionLog, Long> {

    /**
     * Tìm transaction log theo mã giao dịch VNPay (vnpTxnRef)
     */
    List<VnPayTransactionLog> findByVnpTxnRef(String vnpTxnRef);

    /**
     * Tìm transaction log theo số transaction của VNPay (vnpTransactionNo)
     */
    List<VnPayTransactionLog> findByVnpTransactionNo(String vnpTransactionNo);

    /**
     * Tìm transaction log theo mã ngân hàng (vnpBankCode)
     */
    List<VnPayTransactionLog> findByVnpBankCode(String vnpBankCode);

    /**
     * Tìm transaction log theo kết quả xử lý (SUCCESS, FAILED, CANCELLED, DUPLICATE)
     */
    List<VnPayTransactionLog> findByProcessingResult(String processingResult);

    /**
     * Tìm transaction log trong khoảng thời gian (theo ipnReceivedAt)
     */
    List<VnPayTransactionLog> findByIpnReceivedAtBetween(LocalDateTime tuNgay, LocalDateTime denNgay);

    /**
     * Tìm kiếm transaction log với nhiều điều kiện
     */
    @Query("SELECT t FROM VnPayTransactionLog t WHERE " +
           "(:vnpTxnRef IS NULL OR t.vnpTxnRef LIKE CONCAT('%', :vnpTxnRef, '%')) AND " +
           "(:vnpTransactionNo IS NULL OR t.vnpTransactionNo LIKE CONCAT('%', :vnpTransactionNo, '%')) AND " +
           "(:vnpBankCode IS NULL OR t.vnpBankCode = :vnpBankCode) AND " +
           "(:processingResult IS NULL OR t.processingResult = :processingResult) AND " +
           "(:tuNgay IS NULL OR t.ipnReceivedAt >= :tuNgay) AND " +
           "(:denNgay IS NULL OR t.ipnReceivedAt <= :denNgay) " +
           "ORDER BY t.ipnReceivedAt DESC")
    Page<VnPayTransactionLog> searchTransactionLogs(
            @Param("vnpTxnRef") String vnpTxnRef,
            @Param("vnpTransactionNo") String vnpTransactionNo,
            @Param("vnpBankCode") String vnpBankCode,
            @Param("processingResult") String processingResult,
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay,
            Pageable pageable);

    /**
     * Lấy danh sách các mã ngân hàng distinct
     */
    @Query("SELECT DISTINCT t.vnpBankCode FROM VnPayTransactionLog t WHERE t.vnpBankCode IS NOT NULL ORDER BY t.vnpBankCode")
    List<String> findDistinctVnpBankCode();

    /**
     * Đếm số lượng transaction log theo kết quả xử lý
     */
    long countByProcessingResult(String processingResult);

    /**
     * Đếm số lượng transaction log trong ngày hôm nay
     */
    @Query("SELECT COUNT(t) FROM VnPayTransactionLog t WHERE DATE(t.ipnReceivedAt) = CURRENT_DATE")
    long countTodayLogs();

    /**
     * Đếm số lượng transaction log theo kết quả xử lý trong khoảng thời gian
     */
    @Query("SELECT t.processingResult, COUNT(t) FROM VnPayTransactionLog t WHERE " +
           "(:tuNgay IS NULL OR t.ipnReceivedAt >= :tuNgay) AND " +
           "(:denNgay IS NULL OR t.ipnReceivedAt <= :denNgay) " +
           "GROUP BY t.processingResult")
    List<Object[]> countByProcessingResultAndDateRange(
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay);

    /**
     * Đếm số lượng transaction log theo mã ngân hàng trong khoảng thời gian
     */
    @Query("SELECT t.vnpBankCode, COUNT(t) FROM VnPayTransactionLog t WHERE " +
           "(:tuNgay IS NULL OR t.ipnReceivedAt >= :tuNgay) AND " +
           "(:denNgay IS NULL OR t.ipnReceivedAt <= :denNgay) " +
           "GROUP BY t.vnpBankCode ORDER BY COUNT(t) DESC")
    List<Object[]> countByBankCodeAndDateRange(
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay);

    /**
     * Tìm transaction log có thời gian trong khoảng thời gian, sắp xếp giảm dần
     */
    List<VnPayTransactionLog> findByIpnReceivedAtBetweenOrderByIpnReceivedAtDesc(
            LocalDateTime tuNgay, LocalDateTime denNgay);

    /**
     * Tìm transaction log gần nhất theo vnpTxnRef
     */
    @Query("SELECT t FROM VnPayTransactionLog t WHERE t.vnpTxnRef = :vnpTxnRef ORDER BY t.ipnReceivedAt DESC")
    List<VnPayTransactionLog> findByVnpTxnRefOrderByIpnReceivedAtDesc(@Param("vnpTxnRef") String vnpTxnRef);

    /**
     * Kiểm tra xem vnpTxnRef đã tồn tại chưa (dùng để detect duplicate)
     */
    boolean existsByVnpTxnRef(String vnpTxnRef);
}
