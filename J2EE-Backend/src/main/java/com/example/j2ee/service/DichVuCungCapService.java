package com.example.j2ee.service;

import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.model.LuaChonDichVu;
import com.example.j2ee.repository.DichVuChuyenBayRepository;
import com.example.j2ee.repository.DichVuCungCapRepository;
import com.example.j2ee.repository.LuaChonDichVuRepository;
import com.example.j2ee.repository.DatChoDichVuRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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
public class DichVuCungCapService {
    private static final Logger log = LoggerFactory.getLogger(DichVuCungCapService.class);

    private final DichVuCungCapRepository dichVuCungCapRepository;
    private final LuaChonDichVuRepository luaChonDichVuRepository;
    private final DichVuChuyenBayRepository dichVuChuyenBayRepository;
    private final DatChoDichVuRepository datChoDichVuRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path storageDir;
    private Path storageDirLuaChon;

    public DichVuCungCapService(DichVuCungCapRepository dichVuCungCapRepository,
                                LuaChonDichVuRepository luaChonDichVuRepository,
                                DichVuChuyenBayRepository dichVuChuyenBayRepository,
                                DatChoDichVuRepository datChoDichVuRepository) {
        this.dichVuCungCapRepository = dichVuCungCapRepository;
        this.luaChonDichVuRepository = luaChonDichVuRepository;
        this.dichVuChuyenBayRepository = dichVuChuyenBayRepository;
        this.datChoDichVuRepository = datChoDichVuRepository;
    }

    @PostConstruct
    public void init() {
        try {
            // Tạo đường dẫn: project-root/uploads/AnhDichVuCungCap và project-root/uploads/AnhLuaChonDichVu
            Path baseUploadPath = Paths.get(System.getProperty("user.dir")).resolve(uploadDir);
            this.storageDir = baseUploadPath.resolve("AnhDichVuCungCap");
            this.storageDirLuaChon = baseUploadPath.resolve("AnhLuaChonDichVu");

            // Tạo thư mục nếu chưa có
            Files.createDirectories(storageDir);
            Files.createDirectories(storageDirLuaChon);
            log.info("Upload directory: {}", baseUploadPath.toAbsolutePath());
        } catch (IOException e) {
            log.error("Không thể tạo thư mục upload: {}", e.getMessage());
            // Fallback: dùng thư mục uploads tại project root
            Path fallback = Paths.get(System.getProperty("user.dir"), "uploads");
            this.storageDir = fallback.resolve("AnhDichVuCungCap");
            this.storageDirLuaChon = fallback.resolve("AnhLuaChonDichVu");
            try {
                Files.createDirectories(storageDir);
                Files.createDirectories(storageDirLuaChon);
            } catch (IOException ex) {
                log.error("Không thể tạo thư mục upload fallback: {}", ex.getMessage());
            }
        }
    }

    public Path getStorageDir() {
        return storageDir;
    }

    public Path getStorageDirLuaChon() {
        return storageDirLuaChon;
    }

    public List<DichVuCungCap> getAllDichVuCungCap(){
        return dichVuCungCapRepository.findAll();
    }

    public DichVuCungCap getDichVuCungCapById(int id){
        return dichVuCungCapRepository.findById(id).orElse(null);
    }

    public List<DichVuCungCap> getDichVuTheoChuyenBay(Integer maChuyenBay) {
        return dichVuCungCapRepository.findDichVuByChuyenBayId(maChuyenBay);
    }

    public DichVuCungCap createDichVu(DichVuCungCap dichVuCungCap) {
        if(dichVuCungCap.getTenDichVu() == null || dichVuCungCap.getTenDichVu().trim().isEmpty()){
            throw new IllegalArgumentException("Không được để trống tên dịch vụ");
        }
        if(dichVuCungCap.getMoTa() == null || dichVuCungCap.getMoTa().trim().isEmpty()){
            throw new IllegalArgumentException("Không được để trống mô tả dịch vụ");
        }
        if (isTenDichVuExists(dichVuCungCap.getTenDichVu())) {
            throw new IllegalArgumentException("Tên dịch vụ đã tồn tại");
        }

        return dichVuCungCapRepository.save(dichVuCungCap);
    }

    public DichVuCungCap updateDichVu(int id, DichVuCungCap dichVuCungCap) {
        Optional<DichVuCungCap> opt = dichVuCungCapRepository.findById(id);
        if (!opt.isPresent()){
            throw new IllegalArgumentException("Dịch vụ không tồn tại");
        }
        if (dichVuChuyenBayRepository.existsByDichVuCungCap_MaDichVu(id)) {
            throw new IllegalArgumentException("Dịch vụ đang được sử dụng trong chuyến bay, không thể sửa");
        }
        DichVuCungCap existing = opt.get();
        if (!existing.getTenDichVu().equalsIgnoreCase(dichVuCungCap.getTenDichVu()) && isTenDichVuExists(dichVuCungCap.getTenDichVu())) {
            throw new IllegalArgumentException("Tên dịch vụ đã tồn tại");
        }
        existing.setTenDichVu(dichVuCungCap.getTenDichVu());
        existing.setMoTa(dichVuCungCap.getMoTa());
        return dichVuCungCapRepository.save(existing);
    }

    public boolean deleteDichVu(int id) {
        if (!dichVuCungCapRepository.existsById(id)) return false;
        if (dichVuChuyenBayRepository.existsByDichVuCungCap_MaDichVu(id)) {
            throw new IllegalArgumentException("Dịch vụ đang được sử dụng trong chuyến bay, không thể xóa");
        }
        dichVuCungCapRepository.deleteById(id);
        return true;
    }

    public List<LuaChonDichVu> getLuaChonByDichVuId(int dichVuId) {
        return luaChonDichVuRepository.findByDichVuCungCap_MaDichVu(dichVuId);
    }

    public LuaChonDichVu addLuaChonToDichVu(int dichVuId, LuaChonDichVu luaChon) {
        DichVuCungCap dichVu = dichVuCungCapRepository.findById(dichVuId).orElse(null);
        if (dichVu == null) throw new IllegalArgumentException("Dịch vụ không tồn tại");
        if (luaChon.getTenLuaChon() == null || luaChon.getTenLuaChon().trim().isEmpty()) throw new IllegalArgumentException("Tên lựa chon không được để trống");
        if (luaChon.getGia() == null || luaChon.getGia().compareTo(new java.math.BigDecimal(0)) <= 0) throw new IllegalArgumentException("Giá lựa chọn phải lớn hơn 0");

        luaChon.setMaLuaChon(0);
        luaChon.setDichVuCungCap(dichVu);
        // Set anh nếu có
        if (luaChon.getAnh() != null) {
            luaChon.setAnh(luaChon.getAnh());
        }
        return luaChonDichVuRepository.save(luaChon);
    }

    public boolean isLuaChonInUse(int luachonId) {
        return datChoDichVuRepository.existsByLuaChonDichVu_MaLuaChon(luachonId);
    }

    public LuaChonDichVu updateLuaChon(int dichVuId, int luachonId, LuaChonDichVu request) {
        Optional<LuaChonDichVu> opt = luaChonDichVuRepository.findById(luachonId);
        if (!opt.isPresent()) {
            return null;
        }
        LuaChonDichVu existing = opt.get();
        if (existing.getDichVuCungCap().getMaDichVu() != dichVuId) {
            return null;
        }
        if (request.getTenLuaChon() != null && !request.getTenLuaChon().trim().isEmpty()) {
            existing.setTenLuaChon(request.getTenLuaChon());
        }
        if (request.getMoTa() != null) {
            existing.setMoTa(request.getMoTa());
        }
        if (request.getGia() != null && request.getGia().compareTo(new java.math.BigDecimal(0)) > 0) {
            existing.setGia(request.getGia());
        }
        if (request.getAnh() != null) {
            existing.setAnh(request.getAnh());
        }
        return luaChonDichVuRepository.save(existing);
    }

    public boolean deleteLuaChon(int dichVuId, int luachonId) {
        Optional<LuaChonDichVu> opt = luaChonDichVuRepository.findById(luachonId);
        if (!opt.isPresent()) {
            return false;
        }
        LuaChonDichVu existing = opt.get();
        if (existing.getDichVuCungCap().getMaDichVu() != dichVuId) {
            return false;
        }
        luaChonDichVuRepository.delete(existing);
        return true;
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
        Path target = storageDir.resolve(safeName);
        Files.copy(file.getInputStream(), target);
        return safeName;
    }

    private void ensureStorageDir() throws IOException {
        if (!Files.exists(storageDir)) {
            Files.createDirectories(storageDir);
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
            Path p = storageDir.resolve(relativePath);
            if (Files.exists(p)) Files.delete(p);
        } catch (Exception ignored) {}
    }

    private void deleteOldImageLuaChonIfExists(String relativePath) {
        try {
            if (relativePath == null || relativePath.trim().isEmpty()) return;
            Path p = storageDirLuaChon.resolve(relativePath);
            if (Files.exists(p)) Files.delete(p);
        } catch (Exception ignored) {}
    }

    private void ensureStorageDirLuaChon() throws IOException {
        if (!Files.exists(storageDirLuaChon)) {
            Files.createDirectories(storageDirLuaChon);
        }
    }

    private String storeImageLuaChon(MultipartFile file) throws IOException {
        ensureStorageDirLuaChon();
        String original = file.getOriginalFilename();
        String ext = extractExtension(original);
        String contentType = file.getContentType();
        if (!isAllowedImage(ext, contentType)) {
            throw new IOException("Định dạng ảnh không hợp lệ. Chỉ chấp nhận png, jpg, jpeg, webp, svg");
        }
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String safeName = (timestamp + "_" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext)).replaceAll("[^a-zA-Z0-9._-]", "");
        Path target = storageDirLuaChon.resolve(safeName);
        Files.copy(file.getInputStream(), target);
        return safeName;
    }

    public LuaChonDichVu addOrUpdateAnhLuaChon(int dichVuId, int luachonId, MultipartFile fileAnh) throws IOException {
        // 1. Tìm lựa chọn đã tồn tại
        LuaChonDichVu luaChon = luaChonDichVuRepository.findById(luachonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lựa chọn với ID: " + luachonId));

        // Kiểm tra xem lựa chọn có thuộc dịch vụ không
        if (luaChon.getDichVuCungCap().getMaDichVu() != dichVuId) {
            throw new RuntimeException("Lựa chọn không thuộc dịch vụ này");
        }

        // 2. Xóa ảnh cũ nếu có
        deleteOldImageLuaChonIfExists(luaChon.getAnh());

        // 3. Lưu ảnh mới và lấy đường dẫn
        String newImagePath = storeImageLuaChon(fileAnh);

        // 4. Cập nhật đường dẫn và lưu lại
        luaChon.setAnh(newImagePath);
        return luaChonDichVuRepository.save(luaChon);
    }

    public DichVuCungCap addOrUpdateAnh(int dichVuId, MultipartFile fileAnh) throws IOException {
        // 1. Tìm dịch vụ đã tồn tại
        DichVuCungCap dichVu = dichVuCungCapRepository.findById(dichVuId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + dichVuId));

        // 2. Xóa ảnh cũ nếu có
        deleteOldImageIfExists(dichVu.getAnh());

        // 3. Lưu ảnh mới và lấy đường dẫn
        String newImagePath = storeImage(fileAnh);

        // 4. Cập nhật đường dẫn và lưu lại
        dichVu.setAnh(newImagePath);
        return dichVuCungCapRepository.save(dichVu);
    }

    private boolean isTenDichVuExists(String tenDichVu) {
        return dichVuCungCapRepository.existsByTenDichVu(tenDichVu);
    }

    // ==================== SOFT DELETE METHODS ====================

    /**
     * Lấy danh sách tất cả dịch vụ bao gồm cả đã xóa mềm
     */
    public List<DichVuCungCap> getAllDichVuIncludingDeleted() {
        return dichVuCungCapRepository.findAllIncludingDeleted();
    }

    /**
     * Lấy danh sách dịch vụ đã xóa mềm
     */
    public List<DichVuCungCap> getAllDeletedDichVu() {
        return dichVuCungCapRepository.findAllDeleted();
    }

    /**
     * Khôi phục dịch vụ đã xóa mềm
     */
    public DichVuCungCap restoreDichVu(int id) {
        Optional<DichVuCungCap> deletedDichVu = dichVuCungCapRepository.findDeletedById(id);
        if (!deletedDichVu.isPresent()) {
            throw new IllegalArgumentException("Không tìm thấy dịch vụ đã xóa với ID: " + id);
        }

        dichVuCungCapRepository.restoreById(id);

        // Trả về dịch vụ đã khôi phục
        return dichVuCungCapRepository.findById(id).orElse(null);
    }

    /**
     * Xóa cứng (vĩnh viễn) dịch vụ - CHỈ DÙNG KHI CẦN THIẾT
     */
    public boolean hardDeleteDichVu(int id) {
        if (!dichVuCungCapRepository.findDeletedById(id).isPresent()) {
            throw new IllegalArgumentException("Chỉ có thể xóa cứng các dịch vụ đã bị xóa mềm");
        }

        // Kiểm tra xem có đang được sử dụng không
        if (dichVuChuyenBayRepository.existsByDichVuCungCap_MaDichVu(id)) {
            throw new IllegalArgumentException("Không thể xóa cứng dịch vụ đang được sử dụng trong chuyến bay");
        }

        dichVuCungCapRepository.hardDeleteById(id);
        return true;
    }
}
