package com.example.j2ee.dto.datcho;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToanInfo {
    private BigDecimal soTien;
    private Character daThanhToan; // 'Y' or 'N'
    private Date ngayHetHan;
}
