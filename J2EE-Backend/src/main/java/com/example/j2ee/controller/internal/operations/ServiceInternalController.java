package com.example.j2ee.controller.internal.operations;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.model.LuaChonDichVu;
import com.example.j2ee.service.DichVuCungCapService;
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

/**
 * Internal API Controller for Service Management
 * Base URL: /internal/services
 * 
 * Provides internal/admin APIs for managing airline services.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/services")
public class ServiceInternalController {

    private final DichVuCungCapService dichVuCungCapService;

    public ServiceInternalController(DichVuCungCapService dichVuCungCapService) {
        this.dichVuCungCapService = dichVuCungCapService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/services - Get all services
     */
    @GetMapping
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DichVuCungCap>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.success(dichVuCungCapService.getAllDichVuCungCap()));
    }

    /**
     * GET /internal/services/{id} - Get service by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<DichVuCungCap>> getServiceById(@PathVariable int id) {
        DichVuCungCap service = dichVuCungCapService.getDichVuCungCapById(id);
        if (service == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy dịch vụ"));
        }
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    /**
     * GET /internal/services/deleted - Get deleted services
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DichVuCungCap>>> getDeletedServices() {
        return ResponseEntity.ok(ApiResponse.success(dichVuCungCapService.getAllDeletedDichVu()));
    }

    /**
     * GET /internal/services/{id}/options - Get service options
     */
    @GetMapping("/{id}/options")
    @RequirePermission(feature = "SERVICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<LuaChonDichVu>>> getServiceOptions(@PathVariable int id) {
        List<LuaChonDichVu> options = dichVuCungCapService.getLuaChonByDichVuId(id);
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/services - Create new service
     */
    @PostMapping
    @RequirePermission(feature = "SERVICE", action = "CREATE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> createService(
            @RequestBody DichVuCungCap dichVuCungCap) {
        try {
            DichVuCungCap created = dichVuCungCapService.createDichVu(dichVuCungCap);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo dịch vụ thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/services/{id}/options - Add option to service
     */
    @PostMapping("/{id}/options")
    @RequirePermission(feature = "SERVICE", action = "CREATE")
    public ResponseEntity<ApiResponse<LuaChonDichVu>> addServiceOption(
            @PathVariable int id,
            @RequestBody LuaChonDichVu request) {
        if (request.getTenLuaChon() == null || request.getTenLuaChon().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tên lựa chọn không được để trống"));
        }
        try {
            LuaChonDichVu created = dichVuCungCapService.addLuaChonToDichVu(id, request);
            if (created == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy dịch vụ"));
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thêm lựa chọn thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/services/{id} - Update service
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> updateService(
            @PathVariable int id,
            @RequestBody DichVuCungCap dichVuCungCap) {
        try {
            DichVuCungCap updated = dichVuCungCapService.updateDichVu(id, dichVuCungCap);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy dịch vụ"));
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/services/{id}/options/{optionId} - Update service option
     */
    @PutMapping("/{id}/options/{optionId}")
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<LuaChonDichVu>> updateServiceOption(
            @PathVariable int id,
            @PathVariable int optionId,
            @RequestBody LuaChonDichVu request) {
        try {
            if (dichVuCungCapService.isLuaChonInUse(optionId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Lựa chọn đang được sử dụng trong chuyến bay, không thể sửa."));
            }
            LuaChonDichVu updated = dichVuCungCapService.updateLuaChon(id, optionId, request);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy lựa chọn hoặc dịch vụ."));
            }
            return ResponseEntity.ok(ApiResponse.success("Cập nhật lựa chọn thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /internal/services/{id}/restore - Restore deleted service
     */
    @PostMapping("/{id}/restore")
    @RequirePermission(feature = "SERVICE", action = "RESTORE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> restoreService(@PathVariable int id) {
        try {
            DichVuCungCap restored = dichVuCungCapService.restoreDichVu(id);
            return ResponseEntity.ok(ApiResponse.success("Khôi phục dịch vụ thành công", restored));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/services/{id} - Soft delete service
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "SERVICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable int id) {
        boolean deleted = dichVuCungCapService.deleteDichVu(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy dịch vụ"));
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Xóa dịch vụ thành công"));
    }

    /**
     * DELETE /internal/services/{id}/hard - Hard delete service (permanent)
     */
    @DeleteMapping("/{id}/hard")
    @RequirePermission(feature = "SERVICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> hardDeleteService(@PathVariable int id) {
        try {
            boolean deleted = dichVuCungCapService.hardDeleteDichVu(id);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy dịch vụ"));
            }
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa vĩnh viễn dịch vụ thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /internal/services/{id}/options/{optionId} - Delete service option
     */
    @DeleteMapping("/{id}/options/{optionId}")
    @RequirePermission(feature = "SERVICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteServiceOption(
            @PathVariable int id,
            @PathVariable int optionId) {
        try {
            if (dichVuCungCapService.isLuaChonInUse(optionId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Lựa chọn đang được sử dụng trong chuyến bay, không thể xóa."));
            }
            boolean deleted = dichVuCungCapService.deleteLuaChon(id, optionId);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy lựa chọn hoặc dịch vụ."));
            }
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa lựa chọn thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== IMAGE UPLOAD ENDPOINTS ====================

    /**
     * POST /internal/services/{id}/image - Upload service image
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<DichVuCungCap>> uploadServiceImage(
            @PathVariable("id") int serviceId,
            @RequestPart("image") MultipartFile image) {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn một file ảnh."));
        }
        try {
            DichVuCungCap updated = dichVuCungCapService.addOrUpdateAnh(serviceId, image);
            return ResponseEntity.ok(ApiResponse.success("Tải ảnh lên thành công", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lưu ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /internal/services/{id}/options/{optionId}/image - Upload option image
     */
    @PostMapping(value = "/{id}/options/{optionId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequirePermission(feature = "SERVICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<LuaChonDichVu>> uploadOptionImage(
            @PathVariable("id") int serviceId,
            @PathVariable("optionId") int optionId,
            @RequestPart("image") MultipartFile image) {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn một file ảnh."));
        }
        try {
            LuaChonDichVu updated = dichVuCungCapService.addOrUpdateAnhLuaChon(serviceId, optionId, image);
            return ResponseEntity.ok(ApiResponse.success("Tải ảnh lên thành công", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lưu ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== IMAGE SERVING (PUBLIC) ====================

    /**
     * GET /internal/services/images/{filename} - Get service image
     */
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getServiceImage(@PathVariable String filename) {
        try {
            Resource resource = new ClassPathResource("static/AnhDichVuCungCap/" + filename);
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
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * GET /internal/services/options/images/{filename} - Get option image
     */
    @GetMapping("/options/images/{filename:.+}")
    public ResponseEntity<Resource> getOptionImage(@PathVariable String filename) {
        try {
            Resource resource = new ClassPathResource("static/AnhLuaChonDichVu/" + filename);
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
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
