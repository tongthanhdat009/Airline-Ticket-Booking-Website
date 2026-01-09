package com.example.j2ee.controller;

import com.example.j2ee.service.ThongTinChuyenBayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping()
@RequiredArgsConstructor
public class ThongTinChuyenBayController {

    private final ThongTinChuyenBayService thongTinChuyenBayService;

    // lấy thông tin chuyến bay của khách hàng đã đăng nhập
    @GetMapping("/thong-tin-chuyen-bay-cua-toi")
    public ResponseEntity<List<Map<String, Object>>> myBookings(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails user) {

        if (user == null)
            return ResponseEntity.status(401).build();

        String email = user.getUsername();
        List<Map<String, Object>> bookings = thongTinChuyenBayService.getChuyenBayTheoKhachHang(email);
        return ResponseEntity.ok(bookings);
    }
}
