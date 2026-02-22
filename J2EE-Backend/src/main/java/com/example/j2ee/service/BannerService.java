package com.example.j2ee.service;

import com.example.j2ee.model.Banner;
import com.example.j2ee.repository.BannerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    // ==================== BASIC CRUD METHODS ====================

    /**
     * Lấy tất cả banner
     */
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    /**
     * Lấy banner theo ID
     */
    public Banner getBannerById(int id) {
        return bannerRepository.findById(id).orElse(null);
    }

    /**
     * Tạo banner mới
     */
    public Banner createBanner(Banner banner) {
        // Validate tiêu đề
        if (banner.getTieuDe() == null || banner.getTieuDe().trim().isEmpty()) {
            throw new IllegalArgumentException("Không được để trống tiêu đề banner");
        }

        // Validate trạng thái
        if (banner.getTrangThai() == null) {
            banner.setTrangThai(true);
        }

        // Validate ngày
        if (banner.getNgayBatDau() != null && banner.getNgayKetThuc() != null) {
            if (banner.getNgayKetThuc().isBefore(banner.getNgayBatDau())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
            }
        }

        // Kiểm tra tiêu đề đã tồn tại chưa
        if (isTieuDeExists(banner.getTieuDe())) {
            throw new IllegalArgumentException("Tiêu đề banner đã tồn tại");
        }

        return bannerRepository.save(banner);
    }

    /**
     * Cập nhật banner
     */
    public Banner updateBanner(int id, Banner banner) {
        Optional<Banner> opt = bannerRepository.findById(id);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Banner không tồn tại");
        }

        Banner existing = opt.get();

        // Validate tiêu đề
        if (banner.getTieuDe() == null || banner.getTieuDe().trim().isEmpty()) {
            throw new IllegalArgumentException("Không được để trống tiêu đề banner");
        }

        // Kiểm tra tiêu đề đã tồn tại chưa (loại trừ bản thân)
        if (!existing.getTieuDe().equalsIgnoreCase(banner.getTieuDe()) && isTieuDeExists(banner.getTieuDe())) {
            throw new IllegalArgumentException("Tiêu đề banner đã tồn tại");
        }

        // Validate ngày
        if (banner.getNgayBatDau() != null && banner.getNgayKetThuc() != null) {
            if (banner.getNgayKetThuc().isBefore(banner.getNgayBatDau())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
            }
        }

        // Cập nhật thông tin
        existing.setTieuDe(banner.getTieuDe());
        existing.setMoTa(banner.getMoTa());
        existing.setHinhAnh(banner.getHinhAnh());
        existing.setLinkUrl(banner.getLinkUrl());
        existing.setViTri(banner.getViTri());
        existing.setThuTu(banner.getThuTu());
        existing.setTrangThai(banner.getTrangThai());
        existing.setNgayBatDau(banner.getNgayBatDau());
        existing.setNgayKetThuc(banner.getNgayKetThuc());

        return bannerRepository.save(existing);
    }

    /**
     * Xóa banner (soft delete)
     */
    public boolean deleteBanner(int id) {
        if (!bannerRepository.existsById(id)) {
            return false;
        }
        bannerRepository.deleteById(id);
        return true;
    }

    // ==================== BUSINESS QUERY METHODS ====================

    /**
     * Lấy banner theo vị trí hiển thị
     */
    public List<Banner> getBannersByViTri(String viTri) {
        return bannerRepository.findByViTri(viTri);
    }

    /**
     * Lấy banner theo trạng thái
     */
    public List<Banner> getBannersByTrangThai(Boolean trangThai) {
        return bannerRepository.findByTrangThai(trangThai);
    }

    /**
     * Lấy banner theo vị trí và trạng thái
     */
    public List<Banner> getBannersByViTriAndTrangThai(String viTri, Boolean trangThai) {
        return bannerRepository.findByViTriAndTrangThai(viTri, trangThai);
    }

    /**
     * Lấy các banner đang hoạt động trong khoảng thời gian hiện tại
     */
    public List<Banner> getActiveBanners() {
        List<Banner> allBanners = bannerRepository.findByTrangThai(true);
        LocalDate now = LocalDate.now();

        return allBanners.stream()
                .filter(banner -> {
                    // Nếu không có ngày bắt đầu và kết thúc, hiển thị luôn
                    if (banner.getNgayBatDau() == null && banner.getNgayKetThuc() == null) {
                        return true;
                    }
                    // Nếu có ngày bắt đầu, kiểm tra đã đến ngày chưa
                    if (banner.getNgayBatDau() != null && now.isBefore(banner.getNgayBatDau())) {
                        return false;
                    }
                    // Nếu có ngày kết thúc, kiểm tra đã hết hạn chưa
                    if (banner.getNgayKetThuc() != null && now.isAfter(banner.getNgayKetThuc())) {
                        return false;
                    }
                    return true;
                })
                .toList();
    }

    /**
     * Lấy các banner đang hoạt động theo vị trí
     */
    public List<Banner> getActiveBannersByViTri(String viTri) {
        List<Banner> banners = bannerRepository.findByViTriAndTrangThai(viTri, true);
        LocalDate now = LocalDate.now();

        return banners.stream()
                .filter(banner -> {
                    // Nếu không có ngày bắt đầu và kết thúc, hiển thị luôn
                    if (banner.getNgayBatDau() == null && banner.getNgayKetThuc() == null) {
                        return true;
                    }
                    // Nếu có ngày bắt đầu, kiểm tra đã đến ngày chưa
                    if (banner.getNgayBatDau() != null && now.isBefore(banner.getNgayBatDau())) {
                        return false;
                    }
                    // Nếu có ngày kết thúc, kiểm tra đã hết hạn chưa
                    if (banner.getNgayKetThuc() != null && now.isAfter(banner.getNgayKetThuc())) {
                        return false;
                    }
                    return true;
                })
                .toList();
    }

    // ==================== SOFT DELETE METHODS ====================

    /**
     * Lấy tất cả banner bao gồm cả đã xóa mềm
     */
    public List<Banner> getAllIncludingDeleted() {
        return bannerRepository.findAllIncludingDeleted();
    }

    /**
     * Lấy banner đã xóa mềm theo ID
     */
    public Banner getDeletedById(int id) {
        return bannerRepository.findDeletedById(id).orElse(null);
    }

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    public List<Banner> getAllDeleted() {
        return bannerRepository.findAllDeleted();
    }

    /**
     * Khôi phục banner đã xóa mềm
     */
    public void restoreBanner(int id) {
        Optional<Banner> deleted = bannerRepository.findDeletedById(id);
        if (!deleted.isPresent()) {
            throw new IllegalArgumentException("Banner đã xóa không tồn tại");
        }
        bannerRepository.restoreById(id);
    }

    /**
     * Xóa cứng (vĩnh viễn)
     */
    public void hardDeleteBanner(int id) {
        bannerRepository.hardDeleteById(id);
    }

    // ==================== VALIDATION HELPER METHODS ====================

    /**
     * Kiểm tra tiêu đề banner có tồn tại chưa
     */
    private boolean isTieuDeExists(String tieuDe) {
        return bannerRepository.existsByTieuDe(tieuDe);
    }
}
