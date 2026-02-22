package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.Banner;
import com.example.j2ee.model.TinTuc;
import com.example.j2ee.service.BannerService;
import com.example.j2ee.service.TinTucService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLConnection;
import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
public class BannerTinTucController {

    private final BannerService bannerService;
    private final TinTucService tinTucService;

    public BannerTinTucController(BannerService bannerService, TinTucService tinTucService) {
        this.bannerService = bannerService;
        this.tinTucService = tinTucService;
    }

    // ==================== BANNER ENDPOINTS ====================

    @GetMapping("/banners")
    @RequirePermission(feature = "BANNER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<Banner>>> getAllBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getAllBanners()));
    }

    @GetMapping("/banners/{id}")
    @RequirePermission(feature = "BANNER", action = "VIEW")
    public ResponseEntity<ApiResponse<Banner>> getBannerById(@PathVariable int id) {
        Banner banner = bannerService.getBannerById(id);
        if (banner == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy banner"));
        }
        return ResponseEntity.ok(ApiResponse.success(banner));
    }

    @PostMapping("/banners")
    @RequirePermission(feature = "BANNER", action = "CREATE")
    public ResponseEntity<ApiResponse<Banner>> createBanner(@RequestBody Banner banner) {
        try {
            Banner created = bannerService.createBanner(banner);
            return ResponseEntity.ok(ApiResponse.success("Tạo banner thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/banners/{id}")
    @RequirePermission(feature = "BANNER", action = "UPDATE")
    public ResponseEntity<ApiResponse<Banner>> updateBanner(@PathVariable int id, @RequestBody Banner banner) {
        try {
            Banner updated = bannerService.updateBanner(id, banner);
            if (updated == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy banner"));
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật banner thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/banners/{id}")
    @RequirePermission(feature = "BANNER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable int id) {
        boolean deleted = bannerService.deleteBanner(id);
        if (!deleted) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy banner"));
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Xóa banner thành công"));
    }

    @PatchMapping("/banners/{id}/toggle-status")
    @RequirePermission(feature = "BANNER", action = "UPDATE")
    public ResponseEntity<ApiResponse<Banner>> toggleBannerStatus(@PathVariable int id) {
        try {
            Banner banner = bannerService.getBannerById(id);
            if (banner == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy banner"));
            }
            banner.setTrangThai(!banner.getTrangThai());
            Banner updated = bannerService.updateBanner(id, banner);
            return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái banner thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/banners/active")
    public ResponseEntity<ApiResponse<List<Banner>>> getActiveBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getActiveBanners()));
    }

    @GetMapping("/banners/position/{viTri}")
    public ResponseEntity<ApiResponse<List<Banner>>> getBannersByPosition(@PathVariable String viTri) {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getActiveBannersByViTri(viTri)));
    }

    // ==================== BANNER SOFT DELETE ENDPOINTS ====================

    @GetMapping("/banners/deleted")
    @RequirePermission(feature = "BANNER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<Banner>>> getDeletedBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getAllDeleted()));
    }

    @PostMapping("/banners/{id}/restore")
    @RequirePermission(feature = "BANNER", action = "RESTORE")
    public ResponseEntity<ApiResponse<Banner>> restoreBanner(@PathVariable int id) {
        try {
            bannerService.restoreBanner(id);
            Banner restored = bannerService.getBannerById(id);
            return ResponseEntity.ok(ApiResponse.success("Khôi phục banner thành công", restored));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/banners/{id}/hard")
    @RequirePermission(feature = "BANNER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> hardDeleteBanner(@PathVariable int id) {
        try {
            bannerService.hardDeleteBanner(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa vĩnh viễn banner thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== NEWS (TIN TUC) ENDPOINTS ====================

    @GetMapping("/tintuc")
    @RequirePermission(feature = "NEWS", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TinTuc>>> getAllTinTuc() {
        return ResponseEntity.ok(ApiResponse.success(tinTucService.getAllTinTuc()));
    }

    @GetMapping("/tintuc/{id}")
    @RequirePermission(feature = "NEWS", action = "VIEW")
    public ResponseEntity<ApiResponse<TinTuc>> getTinTucById(@PathVariable int id) {
        TinTuc tinTuc = tinTucService.getTinTucById(id);
        if (tinTuc == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy tin tức"));
        }
        return ResponseEntity.ok(ApiResponse.success(tinTuc));
    }

    @PostMapping("/tintuc")
    @RequirePermission(feature = "NEWS", action = "CREATE")
    public ResponseEntity<ApiResponse<TinTuc>> createTinTuc(@RequestBody TinTuc tinTuc) {
        try {
            TinTuc created = tinTucService.createTinTuc(tinTuc);
            return ResponseEntity.ok(ApiResponse.success("Tạo tin tức thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tintuc/{id}")
    @RequirePermission(feature = "NEWS", action = "UPDATE")
    public ResponseEntity<ApiResponse<TinTuc>> updateTinTuc(@PathVariable int id, @RequestBody TinTuc tinTuc) {
        try {
            TinTuc updated = tinTucService.updateTinTuc(id, tinTuc);
            if (updated == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy tin tức"));
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật tin tức thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/tintuc/{id}")
    @RequirePermission(feature = "NEWS", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteTinTuc(@PathVariable int id) {
        boolean deleted = tinTucService.deleteTinTuc(id);
        if (!deleted) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy tin tức"));
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Xóa tin tức thành công"));
    }

    @PatchMapping("/tintuc/{id}/publish")
    @RequirePermission(feature = "NEWS", action = "UPDATE")
    public ResponseEntity<ApiResponse<TinTuc>> publishTinTuc(@PathVariable int id) {
        try {
            TinTuc tinTuc = tinTucService.getTinTucById(id);
            if (tinTuc == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy tin tức"));
            }
            // Toggle between "da_xuat_ban" and "ban_nhap"
            String currentStatus = tinTuc.getTrangThai();
            if ("da_xuat_ban".equals(currentStatus)) {
                tinTuc.setTrangThai("ban_nhap");
            } else {
                tinTuc.setTrangThai("da_xuat_ban");
            }
            TinTuc updated = tinTucService.updateTinTuc(id, tinTuc);
            return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái xuất bản thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tintuc/danhmuc/{danhMuc}")
    public ResponseEntity<ApiResponse<List<TinTuc>>> getTinTucByDanhMuc(@PathVariable String danhMuc) {
        return ResponseEntity.ok(ApiResponse.success(tinTucService.getTinTucByDanhMuc(danhMuc)));
    }

    @GetMapping("/tintuc/trangthai/{trangThai}")
    public ResponseEntity<ApiResponse<List<TinTuc>>> getTinTucByTrangThai(@PathVariable String trangThai) {
        return ResponseEntity.ok(ApiResponse.success(tinTucService.getTinTucByTrangThai(trangThai)));
    }

    @PostMapping(value = "/tintuc/{id}/anh", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission(feature = "NEWS", action = "UPDATE")
    public ResponseEntity<ApiResponse<TinTuc>> uploadTinTucAnh(
            @PathVariable("id") int tinTucId,
            @RequestPart("anh") MultipartFile anh) {
        if (anh.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn một file ảnh."));
        }
        try {
            TinTuc updated = tinTucService.addOrUpdateAnh(tinTucId, anh);
            return ResponseEntity.ok(ApiResponse.success("Tải ảnh lên thành công", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lưu ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tintuc/anh/{filename:.+}")
    public ResponseEntity<Resource> getTinTucAnh(@PathVariable String filename) {
        try {
            Resource resource = new ClassPathResource("static/AnhTinTuc/" + filename);
            if (resource.exists() && resource.isReadable()) {
                String contentType = URLConnection.guessContentTypeFromName(filename);
                if (contentType == null) {
                    if (filename.toLowerCase().endsWith(".svg")) {
                        contentType = "image/svg+xml";
                    } else if (filename.toLowerCase().endsWith(".png")) {
                        contentType = "image/png";
                    } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (filename.toLowerCase().endsWith(".webp")) {
                        contentType = "image/webp";
                    } else {
                        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    }
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/tintuc/{id}/increment-view")
    public ResponseEntity<ApiResponse<TinTuc>> incrementLuotXem(@PathVariable int id) {
        try {
            TinTuc updated = tinTucService.incrementLuotXem(id);
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== NEWS (TIN TUC) SOFT DELETE ENDPOINTS ====================

    @GetMapping("/tintuc/deleted")
    @RequirePermission(feature = "NEWS", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TinTuc>>> getDeletedTinTuc() {
        return ResponseEntity.ok(ApiResponse.success(tinTucService.getAllDeletedTinTuc()));
    }

    @PostMapping("/tintuc/{id}/restore")
    @RequirePermission(feature = "NEWS", action = "RESTORE")
    public ResponseEntity<ApiResponse<TinTuc>> restoreTinTuc(@PathVariable int id) {
        try {
            TinTuc restored = tinTucService.restoreTinTuc(id);
            return ResponseEntity.ok(ApiResponse.success("Khôi phục tin tức thành công", restored));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/tintuc/{id}/hard")
    @RequirePermission(feature = "NEWS", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> hardDeleteTinTuc(@PathVariable int id) {
        try {
            tinTucService.hardDeleteTinTuc(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa vĩnh viễn tin tức thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
