package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.menu.*;
import com.example.j2ee.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller quản lý menu động cho Admin Panel
 *
 * Endpoints:
 * - GET /admin/dashboard/menu/items - Lấy tất cả menu items (với permission filter)
 * - GET /admin/dashboard/menu/groups - Lấy menu theo nhóm
 * - GET /admin/dashboard/menu/config - Lấy toàn bộ config (menu + actions + permissions)
 */
@RestController
@RequestMapping("/admin/dashboard/menu")
@RequiredArgsConstructor
@Slf4j
public class MenuController {

    private final MenuService menuService;

    /**
     * Lấy tất cả menu items có quyền truy cập
     * GET /admin/dashboard/menu/items
     *
     * Response: List<MenuItemDTO> - Danh sách menu đã filter theo permissions
     */
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getMenuItems() {
        log.info("API: Lấy menu items cho user hiện tại");
        List<MenuItemDTO> items = menuService.getMenuItemsForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * Lấy menu items theo nhóm
     * GET /admin/dashboard/menu/groups
     *
     * Response: Map<String, MenuGroupDTO> - Menu grouped theo nhóm chức năng
     */
    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<Map<String, MenuGroupDTO>>> getMenuGroups() {
        log.info("API: Lấy menu groups cho user hiện tại");
        Map<String, MenuGroupDTO> groups = menuService.getMenuItemsGrouped();
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    /**
     * Lấy toàn bộ config: menu + actions + permissions
     * GET /admin/dashboard/menu/config
     *
     * Response: MenuConfigResponse {
     *   menuItems: [...],
     *   actions: [...],
     *   userPermissions: [...],
     *   groups: [...]
     * }
     *
     * Endpoint này trả về tất cả thông tin cần thiết cho frontend
     * khi khởi tạo admin panel (tương đương với adminMenuData.js)
     */
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<MenuConfigResponse>> getMenuConfig() {
        log.info("API: Lấy toàn bộ menu config cho user hiện tại");
        MenuConfigResponse config = menuService.getMenuConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }
}
