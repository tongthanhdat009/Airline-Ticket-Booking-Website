package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {
    private int maDatCho;  // Booking code
    private String hoVaTen; // Last name to verify
}
