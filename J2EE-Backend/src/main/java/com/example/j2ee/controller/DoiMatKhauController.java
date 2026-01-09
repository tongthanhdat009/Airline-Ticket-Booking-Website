package com.example.j2ee.controller;


import com.example.j2ee.service.DoiMatKhauService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController // Đánh dấu class này là REST controller, trả về JSON thay vì HTML
@RequestMapping // Gắn URL gốc (ở đây trống, nên sẽ mapping trực tiếp "/login")
@RequiredArgsConstructor // Lombok: tự động tạo constructor cho các field final
public class DoiMatKhauController {
    private final DoiMatKhauService doiMatKhauService;

    @PutMapping("thay-doi-mat-khau")


    // userDetails lấy ra usernam
    public ResponseEntity<?> thayDoiMatKhau(@AuthenticationPrincipal UserDetails userDetails
            , @RequestBody Map<String, String> body) {


        try{
            String email = userDetails.getUsername();
            String matKhauHienTai = body.get("matKhauHienTai");
            String matKhauMoi = body.get("matKhauMoi");
            String nhapLaiMatKhauMoi = body.get("nhapLaiMatKhauMoi");

            doiMatKhauService.thayDoiMatKhau(email, matKhauHienTai, matKhauMoi, nhapLaiMatKhauMoi );
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
