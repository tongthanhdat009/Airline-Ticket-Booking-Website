package com.example.j2ee.dto.datcho;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.HanhKhach;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DatChoDetailResponse {
    private Integer maDatCho;
    private LocalDateTime ngayDatCho;
    private HanhKhach hanhKhach;
    private ChiTietGhe chiTietGhe;
    private ThanhToanInfo thanhToan;
}
