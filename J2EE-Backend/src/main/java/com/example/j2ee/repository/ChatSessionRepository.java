package com.example.j2ee.repository;

import com.example.j2ee.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {

    /**
     * Tìm session đang hoạt động theo email (trong 24h gần nhất)
     */
    @Query("SELECT cs FROM ChatSession cs WHERE cs.email = :email " +
           "AND cs.trangThai NOT IN ('RESOLVED', 'CLOSED') " +
           "AND cs.ngayTao >= :since " +
           "ORDER BY cs.ngayTao DESC")
    List<ChatSession> findActiveSessionsByEmail(@Param("email") String email,
                                                 @Param("since") LocalDateTime since);

    /**
     * Tìm session theo email đã đóng trong 24h (để reopen)
     */
    @Query("SELECT cs FROM ChatSession cs WHERE cs.email = :email " +
           "AND cs.trangThai IN ('RESOLVED', 'CLOSED') " +
           "AND cs.ngayDong >= :since " +
           "ORDER BY cs.ngayDong DESC")
    List<ChatSession> findRecentClosedSessionsByEmail(@Param("email") String email,
                                                       @Param("since") LocalDateTime since);

    /**
     * Lấy danh sách sessions cho admin (tất cả trạng thái trừ CLOSED/RESOLVED lâu)
     */
    @Query("SELECT cs FROM ChatSession cs " +
           "WHERE cs.trangThai IN :statuses " +
           "ORDER BY CASE cs.trangThai " +
           "WHEN 'WAITING_FOR_ADMIN' THEN 1 " +
           "WHEN 'IN_PROGRESS' THEN 2 " +
           "WHEN 'WAITING_FOR_USER' THEN 3 " +
           "WHEN 'IDLE' THEN 4 " +
           "ELSE 5 END, cs.lastMessageAt DESC")
    List<ChatSession> findByTrangThaiIn(@Param("statuses") List<String> statuses);

    /**
     * Đếm sessions theo trạng thái
     */
    long countByTrangThai(String trangThai);

    /**
     * Tìm sessions idle (không có tin nhắn mới) để timeout
     */
    @Query("SELECT cs FROM ChatSession cs WHERE cs.trangThai IN ('IN_PROGRESS', 'WAITING_FOR_USER') " +
           "AND cs.lastMessageAt < :before AND cs.idleReminderSent = false")
    List<ChatSession> findSessionsNeedingReminder(@Param("before") LocalDateTime before);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.trangThai IN ('IN_PROGRESS', 'WAITING_FOR_USER') " +
           "AND cs.lastMessageAt < :before AND cs.idleReminderSent = true")
    List<ChatSession> findSessionsToMarkIdle(@Param("before") LocalDateTime before);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.trangThai = 'IDLE' " +
           "AND cs.lastMessageAt < :before")
    List<ChatSession> findSessionsToAutoClose(@Param("before") LocalDateTime before);
}
