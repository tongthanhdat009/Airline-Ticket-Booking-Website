package com.example.j2ee.service;

import com.example.j2ee.dto.menu.*;
import com.example.j2ee.model.ChucNang;
import com.example.j2ee.model.HanhDong;
import com.example.j2ee.repository.ChucNangRepository;
import com.example.j2ee.repository.HanhDongRepository;
import com.example.j2ee.security.AdminUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuService {

    private final ChucNangRepository chucNangRepository;
    private final HanhDongRepository hanhDongRepository;

    /**
     * Lấy tất cả menu items (không filter theo permission)
     */
    public List<MenuItemDTO> getAllMenuItems() {
        return chucNangRepository.findAll()
                .stream()
                .filter(cn -> cn.getRoutePath() != null) // Chỉ lấy những chức năng có route_path
                .map(MenuItemDTO::fromEntity)
                .sorted(Comparator.comparing(MenuItemDTO::getDisplayOrder))
                .collect(Collectors.toList());
    }

    /**
     * Lấy menu items theo permissions của user hiện tại
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsForCurrentUser() {
        List<String> userPermissions = getCurrentUserPermissions();
        return filterMenuItemsByPermissions(getAllMenuItems(), userPermissions);
    }

    /**
     * Lấy menu items grouped theo nhóm chức năng
     */
    public Map<String, MenuGroupDTO> getMenuItemsGrouped() {
        List<String> userPermissions = getCurrentUserPermissions();
        List<MenuItemDTO> filteredItems = filterMenuItemsByPermissions(getAllMenuItems(), userPermissions);

        Map<String, MenuGroupDTO> grouped = new LinkedHashMap<>();

        for (MenuItemDTO item : filteredItems) {
            String groupName = item.getNhom() != null ? item.getNhom() : "Khác";

            grouped.putIfAbsent(groupName, MenuGroupDTO.builder()
                    .groupName(groupName)
                    .items(new ArrayList<>())
                    .color(item.getUiColor())
                    .icon(item.getUiIcon())
                    .build());

            grouped.get(groupName).getItems().add(item);
        }

        return grouped;
    }

    /**
     * Lấy toàn bộ config: menu + actions + permissions
     */
    @Transactional(readOnly = true)
    public MenuConfigResponse getMenuConfig() {
        List<String> userPermissions = getCurrentUserPermissions();
        List<MenuItemDTO> menuItems = filterMenuItemsByPermissions(getAllMenuItems(), userPermissions);
        List<ActionDTO> actions = getAllActions();
        Map<String, MenuGroupDTO> groups = getMenuItemsGrouped();

        return MenuConfigResponse.builder()
                .menuItems(menuItems)
                .actions(actions)
                .userPermissions(userPermissions)
                .groups(new ArrayList<>(groups.values()))
                .build();
    }

    /**
     * Lấy permissions của user hiện tại từ JWT
     */
    private List<String> getCurrentUserPermissions() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            if (principal instanceof AdminUserDetails) {
                AdminUserDetails adminDetails = (AdminUserDetails) principal;

                // Lấy permissions từ authorities
                return adminDetails.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        // Chỉ lấy permissions (không lấy ROLE_ prefix)
                        .filter(auth -> !auth.startsWith("ROLE_"))
                        .collect(Collectors.toList());
            }

            log.warn("User principal không phải AdminUserDetails: {}", principal.getClass().getName());
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Lỗi khi lấy permissions của user: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Filter menu items theo permissions
     */
    private List<MenuItemDTO> filterMenuItemsByPermissions(List<MenuItemDTO> items, List<String> permissions) {
        if (permissions.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
                .filter(item -> hasPermissionForMenu(item, permissions))
                .collect(Collectors.toList());
    }

    /**
     * Check xem user có permission để xem menu không
     */
    private boolean hasPermissionForMenu(MenuItemDTO item, List<String> permissions) {
        String featureCode = item.getMaCode();

        // Check MANAGE permission (có MANAGE thì có tất cả)
        if (permissions.contains(featureCode + "_MANAGE")) {
            return true;
        }

        // Check VIEW permission
        if (permissions.contains(featureCode + "_VIEW")) {
            return true;
        }

        // Check permissionKey
        if (item.getPermissionKey() != null && permissions.contains(item.getPermissionKey())) {
            return true;
        }

        return false;
    }

    /**
     * Lấy tất cả actions
     */
    private List<ActionDTO> getAllActions() {
        return hanhDongRepository.findAll()
                .stream()
                .map(ActionDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
