package com.example.j2ee.service;

import com.example.j2ee.model.TinTuc;
import com.example.j2ee.repository.TinTucRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TinTucService {
    private final TinTucRepository tinTucRepository;

    private static final Path STORAGE_DIR = Paths.get("target", "classes", "static", "AnhTinTuc");

    public TinTucService(TinTucRepository tinTucRepository) {
        this.tinTucRepository = tinTucRepository;
    }

    public List<TinTuc> getAllTinTuc() {
        return tinTucRepository.findAll();
    }

    public TinTuc getTinTucById(int id) {
        return tinTucRepository.findById(id).orElse(null);
    }

    public TinTuc createTinTuc(TinTuc tinTuc) {
        if (tinTuc.getTieuDe() == null || tinTuc.getTieuDe().trim().isEmpty()) {
            throw new IllegalArgumentException("Không được để trống tiêu đề");
        }
        if (tinTuc.getNoiDung() == null || tinTuc.getNoiDung().trim().isEmpty()) {
            throw new IllegalArgumentException("Không được để trống nội dung");
        }
        if (tinTuc.getTacGia() == null || tinTuc.getTacGia().trim().isEmpty()) {
            throw new IllegalArgumentException("Không được để trống tác giả");
        }

        // Set default values
        if (tinTuc.getTrangThai() == null || tinTuc.getTrangThai().trim().isEmpty()) {
            tinTuc.setTrangThai("DRAFT");
        }
        if (tinTuc.getLuotXem() == null) {
            tinTuc.setLuotXem(0);
        }
        if (tinTuc.getNgayDang() == null) {
            tinTuc.setNgayDang(LocalDateTime.now());
        }

        return tinTucRepository.save(tinTuc);
    }

    public TinTuc updateTinTuc(int id, TinTuc tinTuc) {
        Optional<TinTuc> opt = tinTucRepository.findById(id);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Tin tức không tồn tại");
        }

        TinTuc existing = opt.get();

        if (tinTuc.getTieuDe() != null && !tinTuc.getTieuDe().trim().isEmpty()) {
            existing.setTieuDe(tinTuc.getTieuDe());
        }
        if (tinTuc.getTomTat() != null) {
            existing.setTomTat(tinTuc.getTomTat());
        }
        if (tinTuc.getNoiDung() != null && !tinTuc.getNoiDung().trim().isEmpty()) {
            existing.setNoiDung(tinTuc.getNoiDung());
        }
        if (tinTuc.getHinhAnh() != null) {
            existing.setHinhAnh(tinTuc.getHinhAnh());
        }
        if (tinTuc.getDanhMuc() != null) {
            existing.setDanhMuc(tinTuc.getDanhMuc());
        }
        if (tinTuc.getTrangThai() != null) {
            existing.setTrangThai(tinTuc.getTrangThai());
        }
        if (tinTuc.getNgayDang() != null) {
            existing.setNgayDang(tinTuc.getNgayDang());
        }
        if (tinTuc.getTacGia() != null) {
            existing.setTacGia(tinTuc.getTacGia());
        }
        if (tinTuc.getLuotXem() != null) {
            existing.setLuotXem(tinTuc.getLuotXem());
        }

        return tinTucRepository.save(existing);
    }

    public boolean deleteTinTuc(int id) {
        if (!tinTucRepository.existsById(id)) {
            return false;
        }
        tinTucRepository.deleteById(id);
        return true;
    }

    public TinTuc incrementLuotXem(int id) {
        Optional<TinTuc> opt = tinTucRepository.findById(id);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Tin tức không tồn tại");
        }

        TinTuc existing = opt.get();
        existing.setLuotXem(existing.getLuotXem() == null ? 1 : existing.getLuotXem() + 1);
        return tinTucRepository.save(existing);
    }

    public List<TinTuc> getTinTucByDanhMuc(String danhMuc) {
        return tinTucRepository.findAll().stream()
                .filter(tin -> danhMuc.equals(tin.getDanhMuc()))
                .toList();
    }

    public List<TinTuc> getTinTucByTrangThai(String trangThai) {
        return tinTucRepository.findAll().stream()
                .filter(tin -> trangThai.equals(tin.getTrangThai()))
                .toList();
    }

    public TinTuc addOrUpdateAnh(int tinTucId, MultipartFile fileAnh) throws IOException {
        TinTuc tinTuc = tinTucRepository.findById(tinTucId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tức với ID: " + tinTucId));

        // Xóa ảnh cũ nếu có
        deleteOldImageIfExists(tinTuc.getHinhAnh());

        // Lưu ảnh mới và lấy đường dẫn
        String newImagePath = storeImage(fileAnh);

        // Cập nhật đường dẫn và lưu lại
        tinTuc.setHinhAnh(newImagePath);
        return tinTucRepository.save(tinTuc);
    }

    private String storeImage(MultipartFile file) throws IOException {
        ensureStorageDir();
        String original = file.getOriginalFilename();
        String ext = extractExtension(original);
        String contentType = file.getContentType();
        if (!isAllowedImage(ext, contentType)) {
            throw new IOException("Định dạng ảnh không hợp lệ. Chỉ chấp nhận png, jpg, jpeg, webp, svg");
        }
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String safeName = (timestamp + "_" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext)).replaceAll("[^a-zA-Z0-9._-]", "");
        Path target = STORAGE_DIR.resolve(safeName);
        Files.copy(file.getInputStream(), target);
        return safeName;
    }

    private void ensureStorageDir() throws IOException {
        if (!Files.exists(STORAGE_DIR)) {
            Files.createDirectories(STORAGE_DIR);
        }
    }

    private String extractExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        if (idx == -1) return "";
        return filename.substring(idx + 1).toLowerCase();
    }

    private boolean isAllowedImage(String ext, String contentType) {
        if ("svg".equals(ext) || "image/svg+xml".equalsIgnoreCase(contentType)) return true;
        if ("png".equals(ext) || "jpg".equals(ext) || "jpeg".equals(ext) || "webp".equals(ext)) return true;
        if (contentType == null) return false;
        return contentType.startsWith("image/");
    }

    private void deleteOldImageIfExists(String relativePath) {
        try {
            if (relativePath == null || relativePath.trim().isEmpty()) return;
            Path p = STORAGE_DIR.resolve(relativePath);
            if (Files.exists(p)) Files.delete(p);
        } catch (Exception ignored) {}
    }

    // ==================== SOFT DELETE METHODS ====================

    /**
     * Lấy danh sách tất cả tin tức bao gồm cả đã xóa mềm
     */
    public List<TinTuc> getAllTinTucIncludingDeleted() {
        return tinTucRepository.findAllIncludingDeleted();
    }

    /**
     * Lấy danh sách tin tức đã xóa mềm
     */
    public List<TinTuc> getAllDeletedTinTuc() {
        return tinTucRepository.findAllDeleted();
    }

    /**
     * Khôi phục tin tức đã xóa mềm
     */
    public TinTuc restoreTinTuc(int id) {
        Optional<TinTuc> deletedTinTuc = tinTucRepository.findDeletedById(id);
        if (!deletedTinTuc.isPresent()) {
            throw new IllegalArgumentException("Không tìm thấy tin tức đã xóa với ID: " + id);
        }

        tinTucRepository.restoreById(id);

        // Trả về tin tức đã khôi phục
        return tinTucRepository.findById(id).orElse(null);
    }

    /**
     * Xóa cứng (vĩnh viễn) tin tức - CHỈ DÙNG KHI CẦN THIẾT
     */
    public boolean hardDeleteTinTuc(int id) {
        if (!tinTucRepository.findDeletedById(id).isPresent()) {
            throw new IllegalArgumentException("Chỉ có thể xóa cứng các tin tức đã bị xóa mềm");
        }

        tinTucRepository.hardDeleteById(id);
        return true;
    }
}
