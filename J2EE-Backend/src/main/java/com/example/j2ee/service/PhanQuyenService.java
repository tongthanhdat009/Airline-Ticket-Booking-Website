package com.example.j2ee.service;

import com.example.j2ee.dto.phanquyen.*;
import com.example.j2ee.model.ChucNang;
import com.example.j2ee.model.HanhDong;
import com.example.j2ee.model.PhanQuyen;
import com.example.j2ee.model.VaiTro;
import com.example.j2ee.repository.ChucNangRepository;
import com.example.j2ee.repository.HanhDongRepository;
import com.example.j2ee.repository.PhanQuyenRepository;
import com.example.j2ee.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý logic phân quyền theo vai trò (RBAC)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PhanQuyenService {

    private final PhanQuyenRepository phanQuyenRepository;
    private final VaiTroRepository vaiTroRepository;
    private final ChucNangRepository chucNangRepository;
    private final HanhDongRepository hanhDongRepository;

    /**
     * Lấy tất cả chức năng trong hệ thống
     */
    public List<ChucNangDTO> getAllChucNang() {
        return chucNangRepository.findAll().stream()
                .map(ChucNangDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả chức năng theo nhóm
     */
    public Map<String, List<ChucNangDTO>> getAllChucNangGrouped() {
        List<ChucNang> allChucNang = chucNangRepository.findAll();
        return allChucNang.stream()
                .map(ChucNangDTO::fromEntity)
                .collect(Collectors.groupingBy(cn -> cn.getNhom() != null ? cn.getNhom() : "Khác"));
    }

    /**
     * Lấy tất cả hành động trong hệ thống
     */
    public List<HanhDongDTO> getAllHanhDong() {
        return hanhDongRepository.findAll().stream()
                .map(HanhDongDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách phân quyền của một vai trò
     */
    @Transactional(readOnly = true)
    public PhanQuyenResponse getPhanQuyenByVaiTro(int maVaiTro) {
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò với ID: " + maVaiTro));

        List<PhanQuyen> phanQuyenList = phanQuyenRepository.findByMaVaiTro(maVaiTro);
        
        // Lấy tất cả chức năng và hành động để map
        Map<Integer, ChucNang> chucNangMap = chucNangRepository.findAll().stream()
                .collect(Collectors.toMap(ChucNang::getMaChucNang, cn -> cn));
        Map<String, HanhDong> hanhDongMap = hanhDongRepository.findAll().stream()
                .collect(Collectors.toMap(HanhDong::getMaHanhDong, hd -> hd));

        List<PhanQuyenResponse.PermissionDetail> permissions = phanQuyenList.stream()
                .map(pq -> PhanQuyenResponse.PermissionDetail.fromEntity(
                        pq,
                        chucNangMap.get(pq.getMaChucNang()),
                        hanhDongMap.get(pq.getMaHanhDong())
                ))
                .collect(Collectors.toList());

        return PhanQuyenResponse.builder()
                .vaiTro(PhanQuyenResponse.VaiTroInfo.fromEntity(vaiTro))
                .permissions(permissions)
                .totalPermissions(permissions.size())
                .build();
    }

    /**
     * Lấy ma trận phân quyền - trả về map có key là "maChucNang-maHanhDong"
     */
    @Transactional(readOnly = true)
    public Map<String, Boolean> getPermissionMatrix(int maVaiTro) {
        List<PhanQuyen> phanQuyenList = phanQuyenRepository.findByMaVaiTro(maVaiTro);
        
        Map<String, Boolean> matrix = new HashMap<>();
        for (PhanQuyen pq : phanQuyenList) {
            String key = pq.getMaChucNang() + "-" + pq.getMaHanhDong();
            matrix.put(key, true);
        }
        
        return matrix;
    }

    /**
     * Kiểm tra vai trò có phải SUPER_ADMIN không
     */
    private boolean isSuperAdmin(int maVaiTro) {
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro).orElse(null);
        return vaiTro != null && "SUPER_ADMIN".equals(vaiTro.getTenVaiTro());
    }

    /**
     * Cập nhật phân quyền cho vai trò
     * - Không cho phép chỉnh sửa phân quyền của SUPER_ADMIN
     */
    @Transactional
    public PhanQuyenResponse updatePhanQuyen(PhanQuyenRequest request) {
        int maVaiTro = request.getMaVaiTro();

        // Kiểm tra vai trò tồn tại
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò với ID: " + maVaiTro));

        // KHÔNG CHO PHÉP CHỈNH SỬA PHÂN QUYỀN CỦA SUPER_ADMIN
        if ("SUPER_ADMIN".equals(vaiTro.getTenVaiTro())) {
            throw new IllegalArgumentException("Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN");
        }

        // Validate permissions
        if (request.getPermissions() == null) {
            throw new IllegalArgumentException("Danh sách phân quyền không được để trống");
        }

        // Lấy danh sách chức năng và hành động hợp lệ để validate
        Set<Integer> validChucNang = chucNangRepository.findAll().stream()
                .map(ChucNang::getMaChucNang)
                .collect(Collectors.toSet());
        Set<String> validHanhDong = hanhDongRepository.findAll().stream()
                .map(HanhDong::getMaHanhDong)
                .collect(Collectors.toSet());

        // Loại bỏ các permission trùng lặp bằng Set
        Set<String> uniquePermissionKeys = new HashSet<>();
        List<PhanQuyenRequest.PermissionItem> uniquePermissions = new ArrayList<>();
        
        for (PhanQuyenRequest.PermissionItem item : request.getPermissions()) {
            String key = item.getMaChucNang() + "-" + item.getMaHanhDong();
            if (!uniquePermissionKeys.contains(key)) {
                uniquePermissionKeys.add(key);
                uniquePermissions.add(item);
            }
        }

        // Validate và tạo danh sách phân quyền mới
        List<PhanQuyen> newPermissions = new ArrayList<>();
        for (PhanQuyenRequest.PermissionItem item : uniquePermissions) {
            // Validate chức năng
            if (!validChucNang.contains(item.getMaChucNang())) {
                throw new IllegalArgumentException("Chức năng không hợp lệ: " + item.getMaChucNang());
            }
            // Validate hành động
            if (!validHanhDong.contains(item.getMaHanhDong())) {
                throw new IllegalArgumentException("Hành động không hợp lệ: " + item.getMaHanhDong());
            }

            PhanQuyen pq = new PhanQuyen();
            pq.setMaVaiTro(maVaiTro);
            pq.setMaChucNang(item.getMaChucNang());
            pq.setMaHanhDong(item.getMaHanhDong());
            newPermissions.add(pq);
        }

        // Xóa tất cả phân quyền cũ của vai trò này và flush ngay lập tức
        List<PhanQuyen> existingPermissions = phanQuyenRepository.findByMaVaiTro(maVaiTro);
        if (!existingPermissions.isEmpty()) {
            phanQuyenRepository.deleteAll(existingPermissions);
            phanQuyenRepository.flush(); // Đảm bảo xóa xong trước khi insert
        }

        // Thêm các phân quyền mới
        phanQuyenRepository.saveAll(newPermissions);
        
        log.info("Cập nhật phân quyền cho vai trò {} thành công. Tổng số quyền: {}", 
                vaiTro.getTenVaiTro(), newPermissions.size());

        return getPhanQuyenByVaiTro(maVaiTro);
    }

    /**
     * Thêm một quyền cho vai trò
     * - Không cho phép chỉnh sửa phân quyền của SUPER_ADMIN
     */
    @Transactional
    public PhanQuyen addPermission(int maVaiTro, int maChucNang, String maHanhDong) {
        // Kiểm tra vai trò
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò với ID: " + maVaiTro));

        // KHÔNG CHO PHÉP CHỈNH SỬA PHÂN QUYỀN CỦA SUPER_ADMIN
        if ("SUPER_ADMIN".equals(vaiTro.getTenVaiTro())) {
            throw new IllegalArgumentException("Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN");
        }

        // Kiểm tra chức năng
        if (!chucNangRepository.existsById(maChucNang)) {
            throw new IllegalArgumentException("Không tìm thấy chức năng với ID: " + maChucNang);
        }

        // Kiểm tra hành động
        if (!hanhDongRepository.existsById(maHanhDong)) {
            throw new IllegalArgumentException("Không tìm thấy hành động: " + maHanhDong);
        }

        // Kiểm tra quyền đã tồn tại chưa
        if (phanQuyenRepository.existsByMaVaiTroAndMaChucNangAndMaHanhDong(maVaiTro, maChucNang, maHanhDong)) {
            throw new IllegalArgumentException("Quyền này đã tồn tại cho vai trò");
        }

        PhanQuyen pq = new PhanQuyen();
        pq.setMaVaiTro(maVaiTro);
        pq.setMaChucNang(maChucNang);
        pq.setMaHanhDong(maHanhDong);

        return phanQuyenRepository.save(pq);
    }

    /**
     * Xóa một quyền khỏi vai trò
     * - Không cho phép chỉnh sửa phân quyền của SUPER_ADMIN
     */
    @Transactional
    public void removePermission(int maVaiTro, int maChucNang, String maHanhDong) {
        // Kiểm tra vai trò
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò với ID: " + maVaiTro));

        // KHÔNG CHO PHÉP CHỈNH SỬA PHÂN QUYỀN CỦA SUPER_ADMIN
        if ("SUPER_ADMIN".equals(vaiTro.getTenVaiTro())) {
            throw new IllegalArgumentException("Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN");
        }

        List<PhanQuyen> existing = phanQuyenRepository.findByMaVaiTroAndMaChucNang(maVaiTro, maChucNang)
                .stream()
                .filter(pq -> pq.getMaHanhDong().equals(maHanhDong))
                .toList();

        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy quyền để xóa");
        }

        phanQuyenRepository.deleteAll(existing);
    }

    /**
     * Sao chép phân quyền từ vai trò này sang vai trò khác
     * - Không cho phép chỉnh sửa phân quyền của SUPER_ADMIN
     */
    @Transactional
    public PhanQuyenResponse copyPermissions(int fromVaiTro, int toVaiTro) {
        // Kiểm tra vai trò nguồn
        VaiTro sourceRole = vaiTroRepository.findById(fromVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò nguồn với ID: " + fromVaiTro));

        // Kiểm tra vai trò đích
        VaiTro targetRole = vaiTroRepository.findById(toVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò đích với ID: " + toVaiTro));

        // KHÔNG CHO PHÉP CHỈNH SỬA PHÂN QUYỀN CỦA SUPER_ADMIN (vai trò đích)
        if ("SUPER_ADMIN".equals(targetRole.getTenVaiTro())) {
            throw new IllegalArgumentException("Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN");
        }

        // Lấy tất cả quyền của vai trò nguồn
        List<PhanQuyen> sourcePermissions = phanQuyenRepository.findByMaVaiTro(fromVaiTro);

        // Xóa tất cả quyền cũ của vai trò đích
        phanQuyenRepository.deleteByMaVaiTro(toVaiTro);

        // Sao chép quyền
        List<PhanQuyen> newPermissions = sourcePermissions.stream()
                .map(pq -> {
                    PhanQuyen newPq = new PhanQuyen();
                    newPq.setMaVaiTro(toVaiTro);
                    newPq.setMaChucNang(pq.getMaChucNang());
                    newPq.setMaHanhDong(pq.getMaHanhDong());
                    return newPq;
                })
                .toList();

        phanQuyenRepository.saveAll(newPermissions);

        log.info("Sao chép {} quyền từ vai trò {} sang vai trò {}", 
                newPermissions.size(), sourceRole.getTenVaiTro(), targetRole.getTenVaiTro());

        return getPhanQuyenByVaiTro(toVaiTro);
    }

    /**
     * Lấy tất cả vai trò kèm thông tin có phải SUPER_ADMIN không
     */
    public List<PhanQuyenResponse.VaiTroInfo> getAllVaiTroWithSuperAdminFlag() {
        return vaiTroRepository.findAll().stream()
                .map(PhanQuyenResponse.VaiTroInfo::fromEntity)
                .collect(Collectors.toList());
    }
}
