package com.example.j2ee.model; // Thay đổi package cho phù hợp

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode // Rất quan trọng cho khóa chính phức hợp
public class DatChoDichVuId implements Serializable {

    @Column(name = "madatcho")
    private int maDatCho;

    @Column(name = "maluachon")
    private int maLuaChon;
}