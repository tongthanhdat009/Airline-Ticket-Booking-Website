package com.example.j2ee.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ByteArrayResource;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendOTPEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Mã OTP đặt lại mật khẩu - JadT Airline");
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .otp-box { background: #fef3c7; border: 2px dashed #f59e0b; 
                                   padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; 
                                    letter-spacing: 8px; margin: 10px 0; }
                        .warning { background: #fee2e2; padding: 15px; border-radius: 8px; 
                                  border-left: 4px solid #dc2626; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                        .logo { font-size: 32px; font-weight: bold; }
                        .icon { font-size: 48px; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">✈️ JadT Airline</div>
                            <h2>Đặt lại mật khẩu</h2>
                        </div>
                        <div class="content">
                            <div style="text-align: center;">
                                <div class="icon">🔐</div>
                            </div>
                            
                            <p>Xin chào,</p>
                            
                            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>JadT Airline</strong>.</p>
                            
                            <p>Vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình đặt lại mật khẩu:</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; color: #666; font-size: 14px;">MÃ OTP CỦA BẠN</p>
                                <div class="otp-code">%s</div>
                                <p style="margin: 0; color: #666; font-size: 12px;">Nhập mã này vào trang đặt lại mật khẩu</p>
                            </div>
                            
                            <div class="warning">
                                <p style="margin: 0;"><strong>⚠️ Lưu ý quan trọng:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Mã OTP này có hiệu lực trong <strong>5 phút</strong></li>
                                    <li>Không chia sẻ mã này với bất kỳ ai</li>
                                    <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email</li>
                                </ul>
                            </div>
                            
                            <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
                            
                            <p style="margin-top: 30px;">
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                            <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
                            <p style="color: #999; margin-top: 10px;">
                                🌐 www.jadtairline.com.vn | ☎️ Hotline: 1900-xxxx | 📧 support@jadtairline.com.vn
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, otp);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Chào mừng đến với JadT Airline! ✈️");
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); 
                                 color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .feature { background: #fef3c7; padding: 15px; border-radius: 8px; 
                                  margin: 15px 0; border-left: 4px solid #f59e0b; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                        .logo { font-size: 48px; margin-bottom: 10px; }
                        .button { display: inline-block; padding: 15px 40px; background: #fbbf24; 
                                 color: #1f2937; text-decoration: none; border-radius: 8px; 
                                 font-weight: bold; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">✈️</div>
                            <h1 style="margin: 0;">Chào mừng đến với JadT Airline!</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Bay xa hơn, tiết kiệm hơn</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>🎉 Chúc mừng bạn đã trở thành thành viên của <strong>JadT Airline</strong>!</p>
                            
                            <p>Giờ đây bạn có thể:</p>
                            
                            <div class="feature">
                                <strong>✈️ Đặt vé nhanh chóng</strong><br>
                                <span style="color: #666; font-size: 14px;">Đặt vé máy bay chỉ với vài cú click</span>
                            </div>
                            
                            <div class="feature">
                                <strong>💰 Nhận ưu đãi độc quyền</strong><br>
                                <span style="color: #666; font-size: 14px;">Giảm giá đến 50%% cho thành viên mới</span>
                            </div>
                            
                            <div class="feature">
                                <strong>🎁 Tích điểm thưởng</strong><br>
                                <span style="color: #666; font-size: 14px;">Mỗi chuyến bay đều được tích điểm</span>
                            </div>
                            
                            <div class="feature">
                                <strong>📱 Quản lý chuyến bay dễ dàng</strong><br>
                                <span style="color: #666; font-size: 14px;">Check-in online, thay đổi lịch trình linh hoạt</span>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" class="button">BẮT ĐẦU ĐẶT VÉ NGAY</a>
                            </div>
                            
                            <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                <strong>💡 Mẹo:</strong> Đặt vé sớm để nhận được giá tốt nhất. 
                                Theo dõi email để không bỏ lỡ các chương trình khuyến mãi đặc biệt!
                            </p>
                            
                            <p>Nếu bạn có bất kỳ câu hỏi nào, đội ngũ hỗ trợ 24/7 của chúng tôi luôn sẵn sàng giúp đỡ.</p>
                            
                            <p style="margin-top: 30px;">
                                Chúc bạn có những chuyến bay tuyệt vời! ✈️<br><br>
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                            <p style="color: #999; margin-top: 10px;">
                                🌐 www.jadtairline.com.vn | ☎️ Hotline: 1900-xxxx | 📧 support@jadtairline.com.vn
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, name, frontendUrl);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email chào mừng: " + e.getMessage());
        }
    }
    
    public void sendPasswordResetSuccessEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Mật khẩu đã được đặt lại thành công - JadT Airline");
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #059669 0%%, #047857 100%%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .success-icon { font-size: 64px; margin-bottom: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                        .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; 
                                      border-left: 4px solid #f59e0b; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="success-icon">✅</div>
                            <h2>Đặt lại mật khẩu thành công!</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>Mật khẩu tài khoản <strong>JadT Airline</strong> của bạn đã được đặt lại thành công.</p>
                            
                            <p>Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
                            
                            <div class="warning-box">
                                <strong>⚠️ Lưu ý bảo mật:</strong>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với bộ phận hỗ trợ</li>
                                    <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                                    <li>Sử dụng mật khẩu mạnh và thay đổi định kỳ</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px;">
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, name);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email xác nhận: " + e.getMessage());
        }
    }

    /**
     * Send ticket confirmation email with PDF attachment
     */
    public void sendTicketEmail(String toEmail, String passengerName, String bookingCode, 
                                String flightNumber, String route, byte[] ticketPdf) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đặt vé thành công - JadT Airline ✈️");
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); 
                                 color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .ticket-info { background: #fef3c7; border: 2px solid #f59e0b; 
                                      padding: 20px; margin: 20px 0; border-radius: 8px; }
                        .info-row { display: flex; justify-content: space-between; 
                                   padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                        .info-label { font-weight: bold; color: #666; }
                        .info-value { color: #dc2626; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                        .logo { font-size: 48px; margin-bottom: 10px; }
                        .button { display: inline-block; padding: 15px 40px; background: #fbbf24; 
                                 color: #1f2937; text-decoration: none; border-radius: 8px; 
                                 font-weight: bold; margin: 20px 0; }
                        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; 
                                    border-left: 4px solid #3b82f6; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">✈️</div>
                            <h1 style="margin: 0;">Đặt vé thành công!</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Cảm ơn bạn đã tin tưởng JadT Airline</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>🎉 Chúc mừng! Vé máy bay của bạn đã được đặt thành công.</p>
                            
                            <div class="ticket-info">
                                <h3 style="margin-top: 0; color: #dc2626;">📋 Thông tin chuyến bay</h3>
                                <div class="info-row">
                                    <span class="info-label">Mã đặt chỗ:</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Số hiệu chuyến bay:</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row" style="border-bottom: none;">
                                    <span class="info-label">Hành trình:</span>
                                    <span class="info-value">%s</span>
                                </div>
                            </div>
                            
                            <div class="highlight">
                                <p style="margin: 0;"><strong>📎 Vé điện tử đính kèm</strong></p>
                                <p style="margin: 10px 0 0 0;">
                                    Vé điện tử của bạn đã được đính kèm trong email này. 
                                    Vui lòng in hoặc lưu trữ vé để xuất trình khi làm thủ tục.
                                </p>
                            </div>
                            
                            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; 
                                        border-left: 4px solid #dc2626; margin: 20px 0;">
                                <p style="margin: 0;"><strong>⚠️ Lưu ý quan trọng:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Vui lòng có mặt tại sân bay trước giờ bay ít nhất 2 giờ</li>
                                    <li>Mang theo CCCD/Hộ chiếu để làm thủ tục</li>
                                    <li>Kiểm tra kỹ hành lý theo quy định</li>
                                    <li>Check-in online để tiết kiệm thời gian</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" class="button">QUẢN LÝ ĐẶT CHỖ</a>
                            </div>
                            
                            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:</p>
                            <ul style="color: #666;">
                                <li>☎️ Hotline: 1900-xxxx (24/7)</li>
                                <li>📧 Email: support@jadtairline.com.vn</li>
                                <li>💬 Live chat trên website</li>
                            </ul>
                            
                            <p style="margin-top: 30px;">
                                Chúc bạn có chuyến bay an toàn và thoải mái! ✈️<br><br>
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                            <p style="color: #999; margin-top: 10px;">
                                🌐 www.jadtairline.com.vn | ☎️ Hotline: 1900-xxxx | 📧 support@jadtairline.com.vn
                            </p>
                            <p style="color: #999; font-size: 10px; margin-top: 10px;">
                                Email này được gửi tự động, vui lòng không phản hồi.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, passengerName, bookingCode, flightNumber, route, frontendUrl);
            
            helper.setText(htmlContent, true);
            
            // Attach PDF ticket
            if (ticketPdf != null && ticketPdf.length > 0) {
                ByteArrayResource pdfResource = new ByteArrayResource(ticketPdf);
                helper.addAttachment("VeMayBay_" + bookingCode + ".pdf", pdfResource);
            }
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email vé máy bay: " + e.getMessage());
        }
    }

    /**
     * Send ticket confirmation email with MULTIPLE PDF attachments
     * Used for round-trip bookings where both outbound and return tickets are sent in 1 email
     */
    public void sendTicketEmailWithMultiplePdfs(String toEmail, String passengerName, 
                                                String bookingCodes, String flightNumbers, 
                                                String routes, List<byte[]> ticketPdfs) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đặt vé thành công - JadT Airline ✈️");
            
            // Determine if round-trip
            int ticketCount = ticketPdfs.size();
            String tripType = ticketCount > 1 ? "Khứ hồi" : "Một chiều";
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); 
                                 color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .ticket-info { background: #fef3c7; border: 2px solid #f59e0b; 
                                      padding: 20px; margin: 20px 0; border-radius: 8px; }
                        .info-row { display: flex; justify-content: space-between; 
                                   padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                        .info-label { font-weight: bold; color: #666; }
                        .info-value { color: #dc2626; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                        .logo { font-size: 48px; margin-bottom: 10px; }
                        .button { display: inline-block; padding: 15px 40px; background: #fbbf24; 
                                 color: #1f2937; text-decoration: none; border-radius: 8px; 
                                 font-weight: bold; margin: 20px 0; }
                        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; 
                                    border-left: 4px solid #3b82f6; margin: 20px 0; }
                        .badge { display: inline-block; background: #10b981; color: white; 
                                padding: 5px 15px; border-radius: 20px; font-size: 12px; 
                                font-weight: bold; margin-left: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">✈️</div>
                            <h1 style="margin: 0;">Đặt vé thành công!</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Cảm ơn bạn đã tin tưởng JadT Airline</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>🎉 Chúc mừng! Vé máy bay của bạn đã được đặt thành công.</p>
                            
                            <div class="ticket-info">
                                <h3 style="margin-top: 0; color: #dc2626;">
                                    📋 Thông tin chuyến bay
                                    <span class="badge">%s</span>
                                </h3>
                                <div class="info-row">
                                    <span class="info-label">Mã đặt chỗ:</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Số hiệu chuyến bay:</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row" style="border-bottom: none;">
                                    <span class="info-label">Hành trình:</span>
                                    <span class="info-value">%s</span>
                                </div>
                            </div>
                            
                            <div class="highlight">
                                <p style="margin: 0;"><strong>📎 Vé điện tử đính kèm (%d vé)</strong></p>
                                <p style="margin: 10px 0 0 0;">
                                    %s
                                    Vui lòng in hoặc lưu trữ vé để xuất trình khi làm thủ tục.
                                </p>
                            </div>
                            
                            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; 
                                        border-left: 4px solid #dc2626; margin: 20px 0;">
                                <p style="margin: 0;"><strong>⚠️ Lưu ý quan trọng:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Vui lòng có mặt tại sân bay trước giờ bay ít nhất 2 giờ</li>
                                    <li>Mang theo CCCD/Hộ chiếu để làm thủ tục</li>
                                    <li>Kiểm tra kỹ hành lý theo quy định</li>
                                    <li>Check-in online để tiết kiệm thời gian</li>
                                    %s
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" class="button">QUẢN LÝ ĐẶT CHỖ</a>
                            </div>
                            
                            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:</p>
                            <ul style="color: #666;">
                                <li>☎️ Hotline: 1900-xxxx (24/7)</li>
                                <li>📧 Email: support@jadtairline.com.vn</li>
                                <li>💬 Live chat trên website</li>
                            </ul>
                            
                            <p style="margin-top: 30px;">
                                Chúc bạn có chuyến bay an toàn và thoải mái! ✈️<br><br>
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                            <p style="color: #999; margin-top: 10px;">
                                🌐 www.jadtairline.com.vn | ☎️ Hotline: 1900-xxxx | 📧 support@jadtairline.com.vn
                            </p>
                            <p style="color: #999; font-size: 10px; margin-top: 10px;">
                                Email này được gửi tự động, vui lòng không phản hồi.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, 
                passengerName, 
                tripType,
                bookingCodes, 
                flightNumbers, 
                routes,
                ticketCount,
                ticketCount > 1 ? 
                    "Tất cả vé điện tử (chiều đi và chiều về) của bạn đã được đính kèm trong email này. " : 
                    "Vé điện tử của bạn đã được đính kèm trong email này. ",
                ticketCount > 1 ? 
                    "<li>Lưu ý kiểm tra cả 2 vé (chiều đi và chiều về)</li>" : "",
                frontendUrl
            );
            
            helper.setText(htmlContent, true);
            
            // Attach all PDF tickets
            for (int i = 0; i < ticketPdfs.size(); i++) {
                byte[] ticketPdf = ticketPdfs.get(i);
                if (ticketPdf != null && ticketPdf.length > 0) {
                    ByteArrayResource pdfResource = new ByteArrayResource(ticketPdf);
                    String[] codes = bookingCodes.split(",");
                    String code = codes.length > i ? codes[i].trim() : "Ticket_" + (i + 1);
                    String label = ticketPdfs.size() > 1 ? 
                        (i == 0 ? "_ChieuDi" : "_ChieuVe") : "";
                    helper.addAttachment("VeMayBay_" + code + label + ".pdf", pdfResource);
                }
            }
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email vé máy bay: " + e.getMessage());
        }
    }

    /**
     * Gửi email thông báo đổi ghế
     */
    public void sendDoiGheNotification(String toEmail, String tenHanhKhach, String pnr, 
                                       String gheCu, String gheMoi, String chuyenBay, String lyDo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Thông báo thay đổi ghế - JadT Airline ✈️");
            
            String lyDoText = lyDo != null && !lyDo.isEmpty() ? 
                String.format("<p><strong>Lý do:</strong> %s</p>", lyDo) : "";
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #3b82f6 0%%, #1d4ed8 100%%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; 
                                   padding: 15px; margin: 15px 0; }
                        .change-box { background: #fef3c7; border: 2px solid #f59e0b; 
                                     padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                        .arrow { font-size: 24px; color: #f59e0b; margin: 10px 0; }
                        .seat-old { text-decoration: line-through; color: #ef4444; font-size: 20px; }
                        .seat-new { color: #10b981; font-size: 24px; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div style="font-size: 48px; margin-bottom: 10px;">✈️</div>
                            <h1 style="margin: 0;">Thông báo thay đổi ghế</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>Đặt chỗ của bạn đã được cập nhật ghế mới.</p>
                            
                            <div class="info-box">
                                <p style="margin: 5px 0;"><strong>Mã đặt chỗ (PNR):</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Chuyến bay:</strong> %s</p>
                            </div>
                            
                            <div class="change-box">
                                <p style="margin: 0; color: #666;">Thay đổi ghế</p>
                                <p class="seat-old">Ghế cũ: %s</p>
                                <div class="arrow">⬇️</div>
                                <p class="seat-new">Ghế mới: %s</p>
                            </div>
                            
                            %s
                            
                            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; 
                                        border-left: 4px solid #dc2626; margin: 20px 0;">
                                <p style="margin: 0;"><strong>⚠️ Lưu ý:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Vui lòng kiểm tra lại thông tin trên vé điện tử</li>
                                    <li>Có mặt tại sân bay trước giờ bay ít nhất 2 giờ</li>
                                    <li>Mang theo giấy tờ tùy thân hợp lệ</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px;">
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                            <p style="color: #999; margin-top: 10px;">
                                🌐 www.jadtairline.com.vn | ☎️ Hotline: 1900-xxxx | 📧 support@jadtairline.com.vn
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, tenHanhKhach, pnr, chuyenBay, gheCu, gheMoi, lyDoText);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email thông báo đổi ghế: " + e.getMessage());
        }
    }

    /**
     * Gửi email thông báo đổi chuyến bay
     */
    public void sendDoiChuyenBayNotification(String toEmail, String tenHanhKhach, String pnr, 
                                              com.example.j2ee.model.ChiTietChuyenBay chuyenBayCu,
                                              com.example.j2ee.model.ChiTietChuyenBay chuyenBayMoi, 
                                              String lyDo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@jadtairline.com");
            helper.setTo(toEmail);
            helper.setSubject("Thông báo thay đổi chuyến bay - JadT Airline ✈️");
            
            String lyDoText = lyDo != null && !lyDo.isEmpty() ? 
                String.format("<p><strong>Lý do thay đổi:</strong> %s</p>", lyDo) : "";
            
            String tuyenBayCu = chuyenBayCu.getTuyenBay() != null ? 
                String.format("%s → %s", 
                    chuyenBayCu.getTuyenBay().getSanBayDi() != null ? chuyenBayCu.getTuyenBay().getSanBayDi().getTenSanBay() : "",
                    chuyenBayCu.getTuyenBay().getSanBayDen() != null ? chuyenBayCu.getTuyenBay().getSanBayDen().getTenSanBay() : ""
                ) : "N/A";
            
            String tuyenBayMoi = chuyenBayMoi.getTuyenBay() != null ? 
                String.format("%s → %s", 
                    chuyenBayMoi.getTuyenBay().getSanBayDi() != null ? chuyenBayMoi.getTuyenBay().getSanBayDi().getTenSanBay() : "",
                    chuyenBayMoi.getTuyenBay().getSanBayDen() != null ? chuyenBayMoi.getTuyenBay().getSanBayDen().getTenSanBay() : ""
                ) : "N/A";
            
            String thoiGianCu = chuyenBayCu.getNgayDi() != null && chuyenBayCu.getGioDi() != null ?
                chuyenBayCu.getNgayDi().atTime(chuyenBayCu.getGioDi()).toString() : "N/A";
            
            String thoiGianMoi = chuyenBayMoi.getNgayDi() != null && chuyenBayMoi.getGioDi() != null ?
                chuyenBayMoi.getNgayDi().atTime(chuyenBayMoi.getGioDi()).toString() : "N/A";
            
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); 
                                 color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; }
                        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; 
                                   padding: 15px; margin: 15px 0; }
                        .flight-box { background: #fef3c7; border: 2px solid #f59e0b; 
                                     padding: 20px; margin: 15px 0; border-radius: 8px; }
                        .flight-old { background: #fee2e2; border-left: 4px solid #ef4444; }
                        .flight-new { background: #d1fae5; border-left: 4px solid #10b981; }
                        .arrow { font-size: 24px; color: #f59e0b; text-align: center; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; 
                                 font-size: 12px; padding: 20px; background: #f9f9f9; 
                                 border-radius: 0 0 10px 10px; }
                        .highlight { font-size: 18px; font-weight: bold; color: #dc2626; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div style="font-size: 48px; margin-bottom: 10px;">✈️</div>
                            <h1 style="margin: 0;">Thông báo thay đổi chuyến bay</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>Đặt chỗ của bạn đã được cập nhật chuyến bay mới.</p>
                            
                            <div class="info-box">
                                <p style="margin: 5px 0;"><strong>Mã đặt chỗ (PNR):</strong> %s</p>
                            </div>
                            
                            <div class="flight-box flight-old">
                                <p style="margin: 0; color: #666;">Chuyến bay cũ</p>
                                <p class="highlight" style="text-decoration: line-through; color: #ef4444;">%s</p>
                                <p style="margin: 5px 0;"><strong>Hành trình:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Thờ gian:</strong> %s</p>
                            </div>
                            
                            <div class="arrow">⬇️</div>
                            
                            <div class="flight-box flight-new">
                                <p style="margin: 0; color: #666;">Chuyến bay mới</p>
                                <p class="highlight" style="color: #10b981;">%s</p>
                                <p style="margin: 5px 0;"><strong>Hành trình:</strong> %s</p>
                                <p style="margin: 5px 0;"><strong>Thờ gian:</strong> %s</p>
                            </div>
                            
                            %s
                            
                            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; 
                                        border-left: 4px solid #dc2626; margin: 20px 0;">
                                <p style="margin: 0;"><strong>⚠️ Lưu ý quan trọng:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Vui lòng kiểm tra lại thông tin chuyến bay mới</li>
                                    <li>Cập nhật lịch trình của bạn</li>
                                    <li>Có mặt tại sân bay trước giờ bay ít nhất 2 giờ</li>
                                    <li>Mang theo giấy tờ tùy thân hợp lệ</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 30px;">
                                Trân trọng,<br>
                                <strong>Đội ngũ JadT Airline</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 JadT Airline. All rights reserved.</p>
                            <p style="color: #999; margin-top: 10px;">
                                🌐 www.jadtairline.com.vn | ☎️ Hotline: 1900-xxxx | 📧 support@jadtairline.com.vn
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, 
                tenHanhKhach, 
                pnr, 
                chuyenBayCu.getSoHieuChuyenBay(),
                tuyenBayCu,
                thoiGianCu,
                chuyenBayMoi.getSoHieuChuyenBay(),
                tuyenBayMoi,
                thoiGianMoi,
                lyDoText
            );
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email thông báo đổi chuyến bay: " + e.getMessage());
        }
    }
}
