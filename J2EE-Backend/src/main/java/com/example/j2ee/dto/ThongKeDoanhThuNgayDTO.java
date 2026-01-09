package com.example.j2ee.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeDoanhThuNgayDTO {
    private LocalDate ngay;
    private BigDecimal doanhThu;
}