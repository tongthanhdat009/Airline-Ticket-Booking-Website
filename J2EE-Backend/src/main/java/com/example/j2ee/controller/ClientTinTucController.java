package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TinTuc;
import com.example.j2ee.service.TinTucService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API tin tức công khai cho trang customer (không cần đăng nhập).
 * Chỉ phục vụ bài đã xuất bản; bản nháp luôn 404.
 */
@RestController
@RequestMapping("/tintuc")
public class ClientTinTucController {

    private final TinTucService tinTucService;

    public ClientTinTucController(TinTucService tinTucService) {
        this.tinTucService = tinTucService;
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<TinTuc>>> getPublished() {
        return ResponseEntity.ok(ApiResponse.success(tinTucService.getPublishedTinTuc()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TinTuc>> getPublishedById(@PathVariable int id) {
        TinTuc tinTuc = tinTucService.getPublishedById(id);
        if (tinTuc == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy bài viết"));
        }
        return ResponseEntity.ok(ApiResponse.success(tinTuc));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<TinTuc>> incrementView(@PathVariable int id) {
        TinTuc tinTuc = tinTucService.getPublishedById(id);
        if (tinTuc == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy bài viết"));
        }
        return ResponseEntity.ok(ApiResponse.success(tinTucService.incrementLuotXem(id)));
    }
}
