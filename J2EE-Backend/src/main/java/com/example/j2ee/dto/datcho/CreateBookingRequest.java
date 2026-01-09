package com.example.j2ee.dto.datcho;

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
     */
    private List<PassengerInfo> passengerInfo;
    
    /**
     * Flight information (outbound and optional return)
     */
    private FlightInfo flightInfo;
    
    /**
     * Additional services selected
     */
    private Map<String, Object> services;
    
    /**
     * Total amount for the booking
     */
    private BigDecimal totalAmount;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerInfo {
        private String fullName;
        private String email;
        private String phone;
        private String gender;
        private String birthDate;
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
