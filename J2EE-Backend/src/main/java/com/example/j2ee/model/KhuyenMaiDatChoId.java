package com.example.j2ee.model;

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
@EqualsAndHashCode
public class KhuyenMaiDatChoId implements Serializable {

    @Column(name = "makhuyenmai")
    private int maKhuyenMai;

    @Column(name = "madatcho")
    private int maDatCho;
}
