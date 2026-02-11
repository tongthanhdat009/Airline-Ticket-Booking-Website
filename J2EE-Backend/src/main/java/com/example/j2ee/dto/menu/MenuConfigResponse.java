package com.example.j2ee.dto.menu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response cho API /menu/config
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuConfigResponse {
    private List<MenuItemDTO> menuItems;
    private List<ActionDTO> actions;
    private List<String> userPermissions;
    private List<MenuGroupDTO> groups;
}
