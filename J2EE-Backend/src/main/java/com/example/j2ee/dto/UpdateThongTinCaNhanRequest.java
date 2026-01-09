package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

/**
 * DTO để nhận dữ liệu update thông tin cá nhân từ client.
 * Client không nhất thiết phải gửi tất cả field - có thể gửi một phần.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateThongTinCaNhanRequest {

    private String hoVaTen;
    private String gioiTinh;
    private Date ngaySinh;
    private String quocGia;
    private String soDienThoai;
    private String maDinhDanh;
    private String diaChi;

}
