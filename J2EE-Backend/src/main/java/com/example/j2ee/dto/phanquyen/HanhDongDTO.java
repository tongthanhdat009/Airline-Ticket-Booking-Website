package com.example.j2ee.dto.phanquyen;

import com.example.j2ee.model.HanhDong;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO cho Hành động
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HanhDongDTO {
    
    private String maHanhDong;
    private String moTa;
    
    public static HanhDongDTO fromEntity(HanhDong hanhDong) {
        return HanhDongDTO.builder()
                .maHanhDong(hanhDong.getMaHanhDong())
                .moTa(hanhDong.getMoTa())
                .build();
    }
}
