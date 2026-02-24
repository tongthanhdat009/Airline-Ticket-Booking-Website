package com.example.j2ee.repository;

import com.example.j2ee.model.AISuggestionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AISuggestionLogRepository extends JpaRepository<AISuggestionLog, Long> {

    List<AISuggestionLog> findBySessionIdOrderByNgayTaoDesc(String sessionId);
}
