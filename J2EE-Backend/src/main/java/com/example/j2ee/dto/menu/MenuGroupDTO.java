package com.example.j2ee.dto.menu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho grouped menu (theo nhóm)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuGroupDTO {
    private String groupName;        // "Vận hành", "Bán vé"
    private List<MenuItemDTO> items;
    private String color;            // Color của group (từ item đầu tiên)
    private String icon;             // Icon của group (từ item đầu tiên)
}
