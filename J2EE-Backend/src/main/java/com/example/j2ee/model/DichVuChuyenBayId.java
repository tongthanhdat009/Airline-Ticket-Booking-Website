package com.example.j2ee.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DichVuChuyenBayId implements Serializable {

    @Column(name = "machuyenbay")
    private int maChuyenBay;

    @Column(name = "madichvu")
    private int maDichVu;
}