package com.example.j2ee.dto;

/**
 * DTO cho thống kê khung giờ đặt vé cao điểm
 * Dùng cho Heatmap Chart
 */
public class ThongKeKhungGioDTO {
    private Integer thu;            // Thứ trong tuần (1-7, 1 = Thứ 2)
    private String tenThu;          // Tên thứ (Thứ 2, Thứ 3, ...)
    private Integer gio;            // Giờ (0-23)
    private Long soLuong;           // Số lượng đặt chỗ

    public ThongKeKhungGioDTO() {
    }

    public ThongKeKhungGioDTO(Integer thu, String tenThu, Integer gio, Long soLuong) {
        this.thu = thu;
        this.tenThu = tenThu;
        this.gio = gio;
        this.soLuong = soLuong;
    }

    public Integer getThu() {
        return thu;
    }

    public void setThu(Integer thu) {
        this.thu = thu;
    }

    public String getTenThu() {
        return tenThu;
    }

    public void setTenThu(String tenThu) {
        this.tenThu = tenThu;
    }

    public Integer getGio() {
        return gio;
    }

    public void setGio(Integer gio) {
        this.gio = gio;
    }

    public Long getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Long soLuong) {
        this.soLuong = soLuong;
    }
}
