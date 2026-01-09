package com.example.j2ee.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter

public class SuaGiaRequest {
    private BigDecimal giaVe;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayApDungTu;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayApDungDen;
}