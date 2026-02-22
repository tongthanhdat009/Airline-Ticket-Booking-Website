package com.example.j2ee.dto;

import com.example.j2ee.model.HangVe;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho sơ đồ ghế của một chuyến bay.
 * Bao gồm tất cả ghế (cả đã đặt và còn trống) kèm trạng thái daDat.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoDoGheDTO {
    private int maGhe;
    private String soGhe;
    private Integer hang;
    private String cot;
    private String viTriGhe;
    private HangVe hangVe;
    /** true nếu ghế đã được đặt cho chuyến bay này */
    private boolean daDat;
}
