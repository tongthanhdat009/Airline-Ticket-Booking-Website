package com.example.j2ee.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChuyenBayKhachHangDTO {
    private Integer maDatCho;
    private String soHieuChuyenBay;
    private String diemDi;
    private String diemDen;
    private LocalDate ngayDi;
    private BigDecimal tongTien;
    private List<DichVuDaDatDTO> dichVuDaDat;
}