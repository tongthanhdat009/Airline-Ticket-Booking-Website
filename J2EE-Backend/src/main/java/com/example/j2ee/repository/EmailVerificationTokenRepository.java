package com.example.j2ee.repository;

import com.example.j2ee.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByEmail(String email);
    
    void deleteByExpiryDateBefore(LocalDateTime now);
    
    void deleteByEmail(String email);
}
