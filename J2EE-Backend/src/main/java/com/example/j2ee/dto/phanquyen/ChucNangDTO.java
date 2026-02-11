package com.example.j2ee.dto.phanquyen;

import com.example.j2ee.model.ChucNang;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO cho Chức năng
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChucNangDTO {

    private int maChucNang;
    private String maCode;
    private String tenChucNang;
    private String nhom;

    public static ChucNangDTO fromEntity(ChucNang chucNang) {
        return ChucNangDTO.builder()
                .maChucNang(chucNang.getMaChucNang())
                .maCode(chucNang.getMaCode())
                .tenChucNang(chucNang.getTenChucNang())
                .nhom(chucNang.getNhom())
                .build();
    }
}
