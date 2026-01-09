package com.example.j2ee.dto;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DichVuDaDatDTO {
    private String tenLuaChon;
    private Integer soLuong;
    private BigDecimal donGia;
}