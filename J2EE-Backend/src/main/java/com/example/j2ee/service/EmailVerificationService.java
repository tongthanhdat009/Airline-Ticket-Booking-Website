package com.example.j2ee.service;

import com.example.j2ee.model.EmailVerificationToken;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.EmailVerificationTokenRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void sendVerificationEmail(String email) {
        // Check if email exists
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        // Delete old tokens for this email
        tokenRepository.deleteByEmail(email);

        // Generate verification token
        String token = UUID.randomUUID().toString();
        
        // Store token in database with 24 hours expiry
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, email, expiry);
        tokenRepository.save(verificationToken);
        
        // Send verification email
        sendVerificationEmailHTML(email, token, taiKhoan.getHanhKhach().getHoVaTen());
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token xác thực không hợp lệ hoặc đã hết hạn"));
        
        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Token xác thực đã hết hạn");
        }
        
        if (verificationToken.isUsed()) {
            throw new IllegalArgumentException("Token xác thực đã được sử dụng");
        }
        
        // Update account verification status
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(verificationToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));
        
        taiKhoan.setEmailVerified(true);
        taiKhoanRepository.save(taiKhoan);
        
        // Mark token as used
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        // Reuse the same logic as sendVerificationEmail
        sendVerificationEmail(email);
    }

    // Clean up expired tokens (can be called by a scheduled task)
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }

    private void sendVerificationEmailHTML(String toEmail, String token, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@sguairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Xác thực tài khoản SGU Airline");
            
            // Create verification URL (hỗ trợ cả dev và production)
            String verificationUrl = frontendUrl + "/verify-email?token=" + token;
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 15px 40px; background: #fbbf24; 
                                 color: #1f2937; text-decoration: none; border-radius: 8px; 
                                 font-weight: bold; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .logo { font-size: 32px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">✈️ SGU Airline</div>
                            <h2>Xác thực tài khoản của bạn</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>SGU Airline</strong>!</p>
                            
                            <p>Để hoàn tất quá trình đăng ký và bảo mật tài khoản của bạn, 
                               vui lòng click vào nút bên dưới để xác thực email:</p>
                            
                            <div style="text-align: center;">
                                <a href="%s" class="button">XÁC THỰC EMAIL</a>
                            </div>
                            
                            <p>Hoặc copy đường link sau vào trình duyệt:</p>
                            <p style="background: #fff; padding: 15px; border-radius: 5px; 
                                      word-break: break-all; font-size: 12px; color: #666;">
                                %s
                            </p>
                            
                            <p><strong>Lưu ý:</strong> Link xác thực này có hiệu lực trong vòng 24 giờ.</p>
                            
                            <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
                            
                            <p>Chúc bạn có những chuyến bay tuyệt vời! ✈️</p>
                            
                            <p style="margin-top: 30px;">
                                Trân trọng,<br>
                                <strong>Đội ngũ SGU Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 SGU Airline. All rights reserved.</p>
                            <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, userName, verificationUrl, verificationUrl);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email xác thực: " + e.getMessage());
        }
    }
}
