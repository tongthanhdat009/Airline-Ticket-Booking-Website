package com.example.j2ee.aspect;

import com.example.j2ee.annotation.Auditable;
import com.example.j2ee.model.AuditLog;
import com.example.j2ee.repository.AuditLogRepository;
import com.example.j2ee.util.VNPayUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.time.LocalDateTime;

/**
 * Aspect để xử lý ghi audit log tự động cho các method được đánh dấu @Auditable
 * Sử dụng @Around advice để lấy dữ liệu trước và sau khi thực hiện method
 */
@Aspect
@Component
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogAspect(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Xử lý audit log cho các method được đánh dấu @Auditable
     */
    @Around("@annotation(auditable)")
    public Object auditAround(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        Method method = methodSignature.getMethod();

        // Lấy thông tin từ annotation
        String action = auditable.action();
        String table = auditable.table();
        String paramName = auditable.paramName();
        String description = auditable.description();
        String accountType = auditable.accountType();

        // Lấy giá trị maBanGhi từ tham số
        int maBanGhi = extractMaBanGhi(joinPoint, paramName);

        // Lấy thông tin người thực hiện
        String nguoiThucHien = getCurrentUser();

        // Lấy IP address
        String ipAddress = getClientIpAddress();

        // Serialize dữ liệu đầu vào (nếu có)
        String duLieuCu = null;
        String duLieuMoi = null;

        Object[] args = joinPoint.getArgs();
        if (args != null && args.length > 0) {
            try {
                // Lưu dữ liệu đầu vào vào duLieuMoi (vì đây là dữ liệu mới sẽ được xử lý)
                Object dataToLog = args.length == 1 ? args[0] : args;
                duLieuMoi = objectMapper.writeValueAsString(dataToLog);
            } catch (Exception e) {
                log.warn("Không thể serialize dữ liệu đầu vào: {}", e.getMessage());
            }
        }

        // Thực hiện method
        Object result = null;
        Exception exception = null;
        try {
            result = joinPoint.proceed();

            // Nếu thành công và có kết quả, serialize kết quả
            if (result != null) {
                try {
                    duLieuMoi = objectMapper.writeValueAsString(result);
                } catch (Exception e) {
                    log.warn("Không thể serialize kết quả: {}", e.getMessage());
                }
            }

        } catch (Exception e) {
            exception = e;
            // Log lỗi nếu có
            log.error("Lỗi khi thực hiện method {}: {}", method.getName(), e.getMessage());
        }

        // Tạo mô tả chi tiết
        String moTa = buildDescription(description, action, table, maBanGhi, exception);

        // Tạo và lưu audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setLoaiThaoTac(action);
        auditLog.setBangAnhHuong(table);
        auditLog.setMaBanGhi(maBanGhi);
        auditLog.setNguoiThucHien(nguoiThucHien);
        auditLog.setLoaiTaiKhoan(accountType);
        auditLog.setDuLieuCu(duLieuCu);
        auditLog.setDuLieuMoi(duLieuMoi);
        auditLog.setMoTa(moTa);
        auditLog.setDiaChiIp(ipAddress);
        auditLog.setThoiGian(LocalDateTime.now());

        try {
            auditLogRepository.save(auditLog);
            log.debug("Đã ghi audit log: {} - {} - {}", action, table, nguoiThucHien);
        } catch (Exception e) {
            log.error("Không thể lưu audit log: {}", e.getMessage());
        }

        // Nếu có exception, throw lại
        if (exception != null) {
            throw exception;
        }

        return result;
    }

    /**
     * Trích xuất mã bản ghi từ tham số của method
     */
    private int extractMaBanGhi(ProceedingJoinPoint joinPoint, String paramName) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Parameter[] parameters = signature.getMethod().getParameters();
        Object[] args = joinPoint.getArgs();

        // Tìm tham số có tên khớp với paramName
        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].getName().equals(paramName) && args[i] != null) {
                try {
                    return Integer.parseInt(args[i].toString());
                } catch (NumberFormatException e) {
                    log.warn("Không thể parse maBanGhi từ tham số {}: {}", paramName, args[i]);
                }
            }
        }

        // Nếu không tìm thấy, thử lấy tham số đầu tiên là int
        for (Object arg : args) {
            if (arg instanceof Integer) {
                return (Integer) arg;
            }
            if (arg instanceof Number) {
                return ((Number) arg).intValue();
            }
        }

        return 0; // Giá trị mặc định
    }

    /**
     * Lấy thông tin user hiện tại từ SecurityContext
     */
    private String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "ANONYMOUS";
    }

    /**
     * Lấy IP address của client
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return VNPayUtil.getIpAddress(request);
            }
        } catch (Exception e) {
            log.warn("Không thể lấy IP address: {}", e.getMessage());
        }
        return "unknown";
    }

    /**
     * Xây dựng mô tả chi tiết cho audit log
     */
    private String buildDescription(String description, String action, String table, int maBanGhi, Exception exception) {
        StringBuilder sb = new StringBuilder();

        if (description != null && !description.isEmpty()) {
            sb.append(description);
        } else {
            sb.append(action).append(" ").append(table);
            if (maBanGhi > 0) {
                sb.append(" (ID: ").append(maBanGhi).append(")");
            }
        }

        if (exception != null) {
            sb.append(" - LỖI: ").append(exception.getMessage());
        }

        return sb.toString();
    }
}
