package com.example.j2ee.exception;

import com.example.j2ee.dto.ApiResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLIntegrityConstraintViolationException;

/**
 * Global Exception Handler để xử lý các exception chung trong toàn bộ application
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý lỗi trùng lặp từ database constraint
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        String userMessage = "Dữ liệu đã tồn tại trong hệ thống";

        // Phân tích lỗi để đưa ra thông báo cụ thể hơn
        if (message != null) {
            if (message.contains("UK_email_quantri") || message.contains("email")) {
                userMessage = "Email này đã được sử dụng bởi tài khoản khác";
            } else if (message.contains("UK_tendangnhap") || message.contains("tendangnhap")) {
                userMessage = "Tên đăng nhập này đã tồn tại trong hệ thống";
            } else if (message.contains("Duplicate entry")) {
                // Extract thông tin từ message nếu có thể
                userMessage = "Dữ liệu bị trùng lặp, vui lòng kiểm tra lại thông tin";
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(userMessage));
    }

    /**
     * Xử lý lỗi SQL constraint violation trực tiếp
     */
    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleSQLIntegrityConstraintViolationException(
            SQLIntegrityConstraintViolationException ex) {
        String message = ex.getMessage();
        String userMessage = "Dữ liệu đã tồn tại trong hệ thống";

        if (message != null) {
            if (message.contains("UK_email_quantri") || message.contains("email")) {
                userMessage = "Email này đã được sử dụng bởi tài khoản khác";
            } else if (message.contains("UK_tendangnhap") || message.contains("tendangnhap")) {
                userMessage = "Tên đăng nhập này đã tồn tại trong hệ thống";
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(userMessage));
    }

    /**
     * Xử lý IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Xử lý các exception chưa được handle cụ thể
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        ex.printStackTrace(); // Log để debug
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi: " + ex.getMessage()));
    }
}
