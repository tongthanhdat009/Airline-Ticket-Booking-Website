package com.example.j2ee.dto.datcho;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Request DTO for creating a new booking with payment
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    
    /**
     * Passenger information list
     * Fix D-30: @Valid để kích hoạt kiểm tra độ dài từng hành khách (→ 400 thay vì 500 DB).
     */
    @NotEmpty(message = "Vui lòng cung cấp thông tin hành khách")
    @Valid
    private List<PassengerInfo> passengerInfo;

    /**
     * Flight information (outbound and optional return)
     */
    @NotNull(message = "Vui lòng cung cấp thông tin chuyến bay")
    @Valid
    private FlightInfo flightInfo;
    
    /**
     * Additional services selected per direction ("di" = outbound, "ve" = return)
     * Legacy format: shared services for all passengers in a direction
     */
    private Map<String, DirectionServices> services;

    /**
     * Per-passenger services (new format)
     * Each element corresponds to a passenger in passengerInfo by index
     */
    private List<PassengerServices> passengerServices;

    /**
     * Mã khuyến mãi (optional)
     */
    private String maKhuyenMai;
    
    /** 
     * Total amount for the booking
     */
    private BigDecimal totalAmount;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DirectionServices {
        private List<ServiceOption> options;
    }

    /**
     * Services for a single passenger (both directions)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerServices {
        private DirectionServices di;   // Dịch vụ chiều đi
        private DirectionServices ve;   // Dịch vụ chiều về (nếu có)
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceOption {
        private Integer maLuaChon;
        private String label;
        private BigDecimal price;
        private Integer quantity; // null for checkbox items (defaults to 1)
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerInfo {
        // Giới hạn khớp @Column hanhkhach: hovaten 50, email 100, sodienthoai 20, gioitinh 10, madinhdanh 50.
        // idNumber để optional (khách vãng lai không CCCD → NULL, không 500) — Fix D-30.
        @NotBlank(message = "Họ và tên không được để trống")
        @Size(max = 50, message = "Họ và tên tối đa 50 ký tự")
        private String fullName;
        @NotBlank(message = "Email không được để trống")
        @Size(max = 100, message = "Email tối đa 100 ký tự")
        @Email(message = "Định dạng email không hợp lệ")
        private String email;
        @NotBlank(message = "Số điện thoại không được để trống")
        @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
        private String phone;
        @Size(max = 10, message = "Giới tính tối đa 10 ký tự")
        private String gender;
        private String birthDate;
        @Size(max = 50, message = "Mã định danh tối đa 50 ký tự")
        private String idNumber;
        private boolean isFromAccount; // Flag to indicate if this passenger info comes from account
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightInfo {
        private FlightDetail outbound;
        private FlightDetail returnFlight; // nullable
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightDetail {
        private Integer maChuyenBay;
        private Integer maGhe; // Single seat (for backward compatibility)
        private List<Integer> danhSachMaGhe; // Multiple seats (for multiple passengers)
        private String hangVe;
    }
}
