package com.example.j2ee.dto;

import java.math.BigDecimal;

/**
 * DTO cho thống kê top chặng bay phổ biến nhất
 * Dùng cho Horizontal Bar Chart
 */
public class ThongKeChangBayDTO {
    private String sanBayDi;
    private String sanBayDen;
    private String changBay; // Format: "SAN_BAY_DI - SAN_BAY_DEN"
    private Long soVeBan;    // Số lượng vé đã bán
    private BigDecimal doanhThu; // Doanh thu

    public ThongKeChangBayDTO() {
    }

    public ThongKeChangBayDTO(String sanBayDi, String sanBayDen, String changBay, Long soVeBan, BigDecimal doanhThu) {
        this.sanBayDi = sanBayDi;
        this.sanBayDen = sanBayDen;
        this.changBay = changBay;
        this.soVeBan = soVeBan;
        this.doanhThu = doanhThu;
    }

    public String getSanBayDi() {
        return sanBayDi;
    }

    public void setSanBayDi(String sanBayDi) {
        this.sanBayDi = sanBayDi;
    }

    public String getSanBayDen() {
        return sanBayDen;
    }

    public void setSanBayDen(String sanBayDen) {
        this.sanBayDen = sanBayDen;
    }

    public String getChangBay() {
        return changBay;
    }

    public void setChangBay(String changBay) {
        this.changBay = changBay;
    }

    public Long getSoVeBan() {
        return soVeBan;
    }

    public void setSoVeBan(Long soVeBan) {
        this.soVeBan = soVeBan;
    }

    public BigDecimal getDoanhThu() {
        return doanhThu;
    }

    public void setDoanhThu(BigDecimal doanhThu) {
        this.doanhThu = doanhThu;
    }
}
