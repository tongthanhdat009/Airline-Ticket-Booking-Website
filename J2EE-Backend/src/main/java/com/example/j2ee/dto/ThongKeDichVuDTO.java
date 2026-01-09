package com.example.j2ee.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeDichVuDTO {
    private String tenDichVu;
    private BigDecimal tongDoanhThu;
}