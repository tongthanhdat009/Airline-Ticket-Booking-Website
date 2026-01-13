package com.example.j2ee.service;

import com.example.j2ee.model.VaiTro;
import com.example.j2ee.repository.VaiTroRepository;
import com.example.j2ee.repository.AdminVaiTroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VaiTroService {

    private final VaiTroRepository vaiTroRepository;
    private final AdminVaiTroRepository adminVaiTroRepository;

    public VaiTroService(VaiTroRepository vaiTroRepository, AdminVaiTroRepository adminVaiTroRepository) {
        this.vaiTroRepository = vaiTroRepository;
        this.adminVaiTroRepository = adminVaiTroRepository;
    }

    /**
     * Lấy tất cả vai trò
     */
    public List<VaiTro> getAllVaiTro() {
        return vaiTroRepository.findAll();
    }

    /**
     * Lấy vai trò theo ID
     */
    public Optional<VaiTro> getVaiTroById(int id) {
        return vaiTroRepository.findById(id);
    }

    /**
     * Tạo vai trò mới
     * - Validation: Tên vai trò không được để trống
     * - Trạng thái mặc định là Active (true)
     */
    @Transactional
    public VaiTro createVaiTro(VaiTro vaiTro) {
        // Validation: Tên vai trò không được để trống
        if (vaiTro.getTenVaiTro() == null || vaiTro.getTenVaiTro().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên vai trò không được để trống");
        }

        // Kiểm tra tên vai trò đã tồn tại chưa
        if (vaiTroRepository.existsByTenVaiTro(vaiTro.getTenVaiTro().trim())) {
            throw new IllegalArgumentException("Tên vai trò '" + vaiTro.getTenVaiTro() + "' đã tồn tại");
        }

        // Thiết lập trạng thái mặc định là Active (true)
        if (vaiTro.getTrangThai() == null) {
            vaiTro.setTrangThai(true);
        }

        // Thiết lập giá trị mặc định cho soft delete
        if (vaiTro.getDaXoa() == null) {
            vaiTro.setDaXoa(false);
        }

        // Trim tên vai trò
        vaiTro.setTenVaiTro(vaiTro.getTenVaiTro().trim());

        return vaiTroRepository.save(vaiTro);
    }

    /**
     * Cập nhật vai trò
     * - Validation: Tên vai trò không được để trống
     * - Không cho phép sửa vai trò SUPER_ADMIN
     */
    @Transactional
    public VaiTro updateVaiTro(int id, VaiTro vaiTro) {
        // Validation: Tên vai trò không được để trống
        if (vaiTro.getTenVaiTro() == null || vaiTro.getTenVaiTro().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên vai trò không được để trống");
        }

        VaiTro existingVaiTro = vaiTroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không tồn tại"));

        // Bảo vệ vai trò SUPER_ADMIN - không cho phép sửa
        if ("SUPER_ADMIN".equals(existingVaiTro.getTenVaiTro())) {
            throw new IllegalArgumentException("Không được phép sửa thông tin vai trò SUPER_ADMIN");
        }

        // Kiểm tra tên vai trò đã tồn tại chưa (trừ chính nó)
        if (!existingVaiTro.getTenVaiTro().equals(vaiTro.getTenVaiTro().trim())) {
            if (vaiTroRepository.existsByTenVaiTro(vaiTro.getTenVaiTro().trim())) {
                throw new IllegalArgumentException("Tên vai trò '" + vaiTro.getTenVaiTro() + "' đã tồn tại");
            }
        }

        // Cập nhật thông tin
        existingVaiTro.setTenVaiTro(vaiTro.getTenVaiTro().trim());
        existingVaiTro.setMoTa(vaiTro.getMoTa());
        existingVaiTro.setTrangThai(vaiTro.getTrangThai());

        return vaiTroRepository.save(existingVaiTro);
    }

    /**
     * Xóa vai trò (soft delete)
     * - Validation: Không được xóa vai trò khi đang có tài khoản sử dụng
     * - Không cho phép xóa vai trò SUPER_ADMIN
     */
    @Transactional
    public void deleteVaiTro(int id) {
        VaiTro vaiTro = vaiTroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không tồn tại"));

        // Bảo vệ vai trò SUPER_ADMIN - không cho phép xóa
        if ("SUPER_ADMIN".equals(vaiTro.getTenVaiTro())) {
            throw new IllegalArgumentException("Không được phép xóa vai trò SUPER_ADMIN");
        }

        // Kiểm tra xem vai trò có được sử dụng không (truy vấn vào admin_vai_tro)
        List<?> adminsUsingRole = adminVaiTroRepository.findById_MaVaiTro(id);
        if (adminsUsingRole != null && !adminsUsingRole.isEmpty()) {
            throw new IllegalArgumentException(
                    "Không thể xóa vai trò '" + vaiTro.getTenVaiTro() + "' vì đang có " +
                            adminsUsingRole.size() + " tài khoản sử dụng"
            );
        }

        // Thực hiện soft delete
        vaiTroRepository.delete(vaiTro);
    }

    /**
     * Lấy danh sách vai trò theo trạng thái
     */
    public List<VaiTro> getVaiTroByTrangThai(Boolean trangThai) {
        return vaiTroRepository.findByTrangThai(trangThai);
    }

    /**
     * Tìm kiếm vai trò theo tên
     */
    public List<VaiTro> searchVaiTro(String keyword) {
        return vaiTroRepository.findAll().stream()
                .filter(vt -> vt.getTenVaiTro().toLowerCase().contains(keyword.toLowerCase()) ||
                        (vt.getMoTa() != null && vt.getMoTa().toLowerCase().contains(keyword.toLowerCase())))
                .toList();
    }

    /**
     * Đếm số admin đang sử dụng vai trò
     */
    public long countAdminByVaiTro(int maVaiTro) {
        List<?> admins = adminVaiTroRepository.findById_MaVaiTro(maVaiTro);
        return admins != null ? admins.size() : 0;
    }
}
