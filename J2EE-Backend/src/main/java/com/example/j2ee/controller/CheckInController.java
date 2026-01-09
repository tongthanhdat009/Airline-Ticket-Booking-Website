package com.example.j2ee.controller;

import com.example.j2ee.dto.CheckInRequest;
import com.example.j2ee.dto.CheckInResponse;
import com.example.j2ee.service.CheckInService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkin")
public class CheckInController {
    
    private static final Logger logger = LoggerFactory.getLogger(CheckInController.class);
    
    @Autowired
    private CheckInService checkInService;
    
    /**
     * API tìm kiếm thông tin đặt chỗ để check-in
     * POST /api/checkin/search
     */
    @PostMapping("/search")
    public ResponseEntity<CheckInResponse> searchBooking(@RequestBody CheckInRequest request) {
        try {
            logger.info("Received check-in search request: {}", request);
            
            if (request.getMaDatCho() <= 0) {
                return ResponseEntity.badRequest()
                    .body(new CheckInResponse(false, "Mã đặt chỗ không hợp lệ", null));
            }
            
            if (request.getHoVaTen() == null || request.getHoVaTen().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new CheckInResponse(false, "Vui lòng nhập họ tên", null));
            }
            
            CheckInResponse response = checkInService.searchBooking(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error in check-in search: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new CheckInResponse(false, "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }
    
    /**
     * API xác nhận check-in
     * POST /api/checkin/confirm/{maDatCho}
     */
    @PostMapping("/confirm/{maDatCho}")
    public ResponseEntity<CheckInResponse> confirmCheckIn(@PathVariable int maDatCho) {
        try {
            logger.info("Confirming check-in for booking: {}", maDatCho);
            
            CheckInResponse response = checkInService.confirmCheckIn(maDatCho);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error confirming check-in: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new CheckInResponse(false, "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }
}
