package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.model.LuaChonDichVu;
import com.example.j2ee.service.DichVuCungCapService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLConnection;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/dichvu")
public class DichVuCungCapController {
    private static final Logger log = LoggerFactory.getLogger(DichVuCungCapController.class);
    private final DichVuCungCapService dichVuCungCapService;

    public DichVuCungCapController(DichVuCungCapService dichVuCungCapService) {
        this.dichVuCungCapService = dichVuCungCapService;
    }

    @GetMapping
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DichVuCungCap>>> getAllDichVuCungCap() {
        return ResponseEntity.ok(ApiResponse.success(dichVuCungCapService.getAllDichVuCungCap()));
    }

    @GetMapping("/{id}")
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<DichVuCungCap>> getById(@PathVariable int id) {
        DichVuCungCap dv = dichVuCungCapService.getDichVuCungCapById(id);
        if (dv == null)
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy dịch vụ"));
        return ResponseEntity.ok(ApiResponse.success(dv));
    }

    @PostMapping
    @RequirePermission(feature = "SERVICE", action = "CREATE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> create(
            @RequestBody DichVuCungCap dichVuCungCap) {
        try {
            DichVuCungCap created = dichVuCungCapService.createDichVu(dichVuCungCap);
            return ResponseEntity.ok(ApiResponse.success("Tạo dịch vụ thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi lưu ảnh: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> update(
            @PathVariable int id,
            @RequestBody DichVuCungCap dichVuCungCap) {
        try {
            DichVuCungCap updated = dichVuCungCapService.updateDichVu(id, dichVuCungCap);
            if (updated == null)
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy dịch vụ"));
            return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi lưu ảnh: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}/anh", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> uploadAnh(
            @PathVariable("id") int dichVuId,
            @RequestPart("anh") MultipartFile anh) {
        if (anh.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn một file ảnh."));
        }
        try {
            DichVuCungCap updated = dichVuCungCapService.addOrUpdateAnh(dichVuId, anh);
            return ResponseEntity.ok(ApiResponse.success("Tải ảnh lên thành công", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lưu ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @RequirePermission(feature = "SERVICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable int id) {
        boolean ok = dichVuCungCapService.deleteDichVu(id);
        if (!ok)
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy dịch vụ"));
        return ResponseEntity.ok(ApiResponse.successMessage("Xóa dịch vụ thành công"));
    }

    @GetMapping("/{id}/luachon")
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<LuaChonDichVu>>> getLuaChon(@PathVariable int id) {
        List<LuaChonDichVu> options = dichVuCungCapService.getLuaChonByDichVuId(id);
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @PostMapping("/{id}/luachon")
    @RequirePermission(feature = "SERVICE", action = "CREATE")
    public ResponseEntity<ApiResponse<LuaChonDichVu>> addLuaChon(@PathVariable int id,
            @RequestBody LuaChonDichVu request) {
        if (request.getTenLuaChon() == null || request.getTenLuaChon().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tên lựa chọn không được để trống"));
        }
        try {
            LuaChonDichVu created = dichVuCungCapService.addLuaChonToDichVu(id, request);
            if (created == null)
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy dịch vụ"));
            return ResponseEntity.ok(ApiResponse.success("Thêm lựa chọn thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/luachon/{luachonId}")
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<LuaChonDichVu>> updateLuaChon(
            @PathVariable int id,
            @PathVariable int luachonId,
            @RequestBody LuaChonDichVu request) {
        try {
            if (dichVuCungCapService.isLuaChonInUse(luachonId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Lựa chọn đang được sử dụng trong chuyến bay, không thể sửa."));
            }
            LuaChonDichVu updated = dichVuCungCapService.updateLuaChon(id, luachonId, request);
            if (updated == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy lựa chọn hoặc dịch vụ."));
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật lựa chọn thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/luachon/{luachonId}")
    @RequirePermission(feature = "SERVICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteLuaChon(
            @PathVariable int id,
            @PathVariable int luachonId) {
        try {
            if (dichVuCungCapService.isLuaChonInUse(luachonId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Lựa chọn đang được sử dụng trong chuyến bay, không thể xóa."));
            }
            boolean deleted = dichVuCungCapService.deleteLuaChon(id, luachonId);
            if (!deleted) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy lựa chọn hoặc dịch vụ."));
            }
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa lựa chọn thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/anh/{filename:.+}")
    public ResponseEntity<Resource> getAnh(@PathVariable String filename) {
        try {
            Path storageDir = dichVuCungCapService.getStorageDir();
            Path filePath = storageDir.resolve(filename).normalize();

            log.debug("===========================================");
            log.debug("GET ANH REQUEST:");
            log.debug("Filename: {}", filename);
            log.debug("Storage dir: {}", storageDir.toAbsolutePath());
            log.debug("Full file path: {}", filePath.toAbsolutePath());
            log.debug("File exists: {}", java.nio.file.Files.exists(filePath));
            log.debug("File readable: {}", java.nio.file.Files.isReadable(filePath));
            log.debug("===========================================");

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = URLConnection.guessContentTypeFromName(filename);
                if (contentType == null) {
                    if (filename.toLowerCase().endsWith(".svg")) {
                        contentType = "image/svg+xml";
                    } else {
                        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    }
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }

            // Fallback: thử tìm trong classpath resources
            log.debug("File not found in uploads, trying classpath resources");
            Resource classpathResource = new ClassPathResource("static/images/dichvu/" + filename);
            if (classpathResource.exists() && classpathResource.isReadable()) {
                log.debug("Found in classpath: {}", classpathResource.getURL());
                String contentType = URLConnection.guessContentTypeFromName(filename);
                if (contentType == null) {
                    if (filename.toLowerCase().endsWith(".svg")) {
                        contentType = "image/svg+xml";
                    } else {
                        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    }
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(classpathResource);
            }

            log.warn("Image not found in uploads or classpath: {}", filename);
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            log.error("MalformedURLException when serving image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            log.error("Exception when serving image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping(value = "/{id}/luachon/{luachonId}/anh", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<LuaChonDichVu>> uploadAnhLuaChon(
            @PathVariable("id") int dichVuId,
            @PathVariable("luachonId") int luachonId,
            @RequestPart("anh") MultipartFile anh) {
        if (anh.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn một file ảnh."));
        }
        try {
            LuaChonDichVu updated = dichVuCungCapService.addOrUpdateAnhLuaChon(dichVuId, luachonId, anh);
            return ResponseEntity.ok(ApiResponse.success("Tải ảnh lên thành công", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lưu ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/luachon/anh/{filename:.+}")
    public ResponseEntity<Resource> getAnhLuaChon(@PathVariable String filename) {
        try {
            Path storageDirLuaChon = dichVuCungCapService.getStorageDirLuaChon();
            Path filePath = storageDirLuaChon.resolve(filename).normalize();

            log.debug("===========================================");
            log.debug("GET ANH LUA CHON REQUEST:");
            log.debug("Filename: {}", filename);
            log.debug("Storage dir (LuaChon): {}", storageDirLuaChon.toAbsolutePath());
            log.debug("Full file path: {}", filePath.toAbsolutePath());
            log.debug("File exists: {}", java.nio.file.Files.exists(filePath));
            log.debug("File readable: {}", java.nio.file.Files.isReadable(filePath));
            log.debug("===========================================");

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = URLConnection.guessContentTypeFromName(filename);
                if (contentType == null) {
                    if (filename.toLowerCase().endsWith(".svg")) {
                        contentType = "image/svg+xml";
                    } else if (filename.toLowerCase().endsWith(".png")) {
                        contentType = "image/png";
                    } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else {
                        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    }
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }

            // Fallback: thử tìm trong classpath resources
            log.debug("Lua chon image not found in uploads, trying classpath resources");
            Resource classpathResource = new ClassPathResource("static/images/luachon/" + filename);
            if (classpathResource.exists() && classpathResource.isReadable()) {
                log.debug("Found in classpath: {}", classpathResource.getURL());
                String contentType = URLConnection.guessContentTypeFromName(filename);
                if (contentType == null) {
                    if (filename.toLowerCase().endsWith(".svg")) {
                        contentType = "image/svg+xml";
                    } else if (filename.toLowerCase().endsWith(".png")) {
                        contentType = "image/png";
                    } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else {
                        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    }
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(classpathResource);
            }

            log.warn("Lua chon image not found in uploads or classpath: {}", filename);
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            log.error("MalformedURLException when serving lua chon image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            log.error("Exception when serving lua chon image: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    // ==================== SOFT DELETE ENDPOINTS ====================

    /**
     * Lấy danh sách dịch vụ đã xóa mềm
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DichVuCungCap>>> getDeletedDichVu() {
        return ResponseEntity.ok(ApiResponse.success(dichVuCungCapService.getAllDeletedDichVu()));
    }

    /**
     * Khôi phục dịch vụ đã xóa mềm
     */
    @PostMapping("/{id}/restore")
    @RequirePermission(feature = "SERVICE", action = "RESTORE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> restoreDichVu(@PathVariable int id) {
        try {
            DichVuCungCap restored = dichVuCungCapService.restoreDichVu(id);
            return ResponseEntity.ok(ApiResponse.success("Khôi phục dịch vụ thành công", restored));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa cứng (vĩnh viễn) dịch vụ - CHỈ DÙNG KHI CẦN THIẾT
     */
    @DeleteMapping("/{id}/hard")
    @RequirePermission(feature = "SERVICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> hardDeleteDichVu(@PathVariable int id) {
        try {
            boolean deleted = dichVuCungCapService.hardDeleteDichVu(id);
            if (!deleted) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy dịch vụ"));
            }
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa vĩnh viễn dịch vụ thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
