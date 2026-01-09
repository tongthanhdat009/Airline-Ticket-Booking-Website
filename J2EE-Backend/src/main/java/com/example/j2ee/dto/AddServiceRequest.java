package com.example.j2ee.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddServiceRequest {
    private int maDatCho;
    private int maLuaChon;
    private int soLuong = 1;
}
