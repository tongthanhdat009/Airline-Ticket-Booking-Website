package com.example.j2ee.exception;

import com.example.j2ee.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler để xử lý các exception chung trong toàn bộ application.
 * Fix RC-A (D-6/D-8/D-15/D-34): mã trạng thái đúng (400/403/404 thay vì 500),
 * không lộ internals (tên quyền, stack message) ra response.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Fix D-8: ResponseStatusException từ PermissionAspect (@RequirePermission/
     * @RequireRole) PHẢI giữ nguyên status 403. Trước đây handler Exception
     * chung nuốt thành 500 kèm tên quyền trong message.
     * Message 403 được sanitize (không lộ tên quyền/vai trò nội bộ).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String message = ex.getReason();
        if (status == HttpStatus.FORBIDDEN) {
            message = "Bạn không có quyền thực hiện thao tác này";
        }
        if (message == null || message.isBlank()) {
            message = "Yêu cầu không được phép";
        }
        return ResponseEntity.status(status).body(ApiResponse.error(message));
    }

    /**
     * Fix D-6: lỗi @Valid → 400 với chi tiết từng field (thay vì 500 lộ internals).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<Map<String, String>>(false,
                        "Dữ liệu không hợp lệ: " + errors));
    }

    /**
     * Fix D-15/D-34: sai kiểu path variable (vd /chuyenbay/undefined/...) → 400.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.debug("Type mismatch: {} = {}", ex.getName(), ex.getValue());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Tham số '" + ex.getName() + "' không đúng định dạng"));
    }

    /**
     * Fix D-15: thiếu request param → 400.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Thiếu tham số bắt buộc: '" + ex.getParameterName() + "'"));
    }

    /**
     * Fix D-6: JSON body sai format → 400 (không lộ chi tiết parser).
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException ex) {
        log.debug("Unreadable request body", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Nội dung request không đúng định dạng JSON"));
    }

    /**
     * Fix D-6: vi phạm ràng buộc @Validated ở service/method → 400.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Dữ liệu không hợp lệ"));
    }

    /**
     * Fix D-15: path không tồn tại → 404 (khi MVC được cấu hình ném exception).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Không tìm thấy đường dẫn yêu cầu"));
    }

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
     * Fix D-30: lỗi unique phát sinh ở commit-time bị bọc trong TransactionSystemException /
     * JpaSystemException (không phải DataIntegrityViolationException trực tiếp).
     * Unwrap cause chain: Duplicate/UK_ → 409 sanitized; còn lại → 500 generic (không lộ SQL).
     */
    @ExceptionHandler({
            org.springframework.transaction.TransactionSystemException.class,
            org.springframework.orm.jpa.JpaSystemException.class,
            jakarta.persistence.PersistenceException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleTransactionWrappedConstraint(Exception ex) {
        Throwable t = ex;
        while (t != null) {
            String m = t.getMessage();
            if (m != null && (m.contains("Duplicate entry") || m.contains("UK_")
                    || m.contains("unique") || m.contains("Unique")
                    || t instanceof DataIntegrityViolationException
                    || t instanceof SQLIntegrityConstraintViolationException)) {
                log.warn("Wrapped unique-constraint violation: {}", m);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Dữ liệu bị trùng lặp, vui lòng kiểm tra lại thông tin"));
            }
            t = t.getCause();
        }
        log.error("Unhandled transaction exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"));
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
     * Xử lý các exception chưa được handle cụ thể.
     * Fix D-6/D-15: KHÔNG đưa ex.getMessage() ra response (lộ internals) —
     * chỉ log server-side, trả message chung.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"));
    }
}
