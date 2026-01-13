package com.example.j2ee.service;

import com.example.j2ee.model.VaiTro;
import com.example.j2ee.repository.VaiTroRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service để quản lý roles động từ database
 * Load tất cả các admin roles còn active
 */
@Service
@Slf4j
public class AdminRoleService {

    private final VaiTroRepository vaiTroRepository;

    // Cache để lưu roles (tránh query DB liên tục)
    private Set<String> cachedRoleNames = new HashSet<>();
    private long lastCacheTime = 0;
    private final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5 phút

    public AdminRoleService(VaiTroRepository vaiTroRepository) {
        this.vaiTroRepository = vaiTroRepository;
    }

    /**
     * Lấy tất cả tên các roles đang active
     * Sử dụng cache để tối ưu performance
     */
    @Transactional(readOnly = true)
    public Set<String> getAllActiveRoleNames() {
        long now = System.currentTimeMillis();

        // Nếu cache còn hiệu quả, return cache
        if (now - lastCacheTime < CACHE_DURATION_MS && !cachedRoleNames.isEmpty()) {
            log.debug("Returning cached admin roles, count: {}", cachedRoleNames.size());
            return new HashSet<>(cachedRoleNames);
        }

        // Reload từ database
        List<VaiTro> activeRoles = vaiTroRepository.findByTrangThai(true);
        cachedRoleNames = new HashSet<>();

        for (VaiTro role : activeRoles) {
            cachedRoleNames.add(role.getTenVaiTro());
            log.debug("Loaded active role: {}", role.getTenVaiTro());
        }

        lastCacheTime = now;
        log.info("Loaded {} active admin roles from database", cachedRoleNames.size());

        return new HashSet<>(cachedRoleNames);
    }

    /**
     * Clear cache (force reload từ DB)
     * Gọi method này khi có thay đổi roles trong database
     */
    public void clearCache() {
        log.info("Clearing admin roles cache");
        cachedRoleNames.clear();
        lastCacheTime = 0;
    }

    /**
     * Kiểm tra một role có phải là admin role không
     */
    public boolean isAdminRole(String roleName) {
        Set<String> adminRoles = getAllActiveRoleNames();
        return adminRoles.contains(roleName);
    }

    /**
     * Lấy danh sách roles dưới dạng mảng String
     * Dùng cho hasAnyRole() trong SecurityConfig
     */
    public String[] getActiveRoleArray() {
        Set<String> roles = getAllActiveRoleNames();
        return roles.toArray(new String[0]);
    }
}
