package com.example.j2ee.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminVaiTroId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "mataikhoan")
    private int mataikhoan;

    @Column(name = "ma_vai_tro")
    private int maVaiTro;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AdminVaiTroId that = (AdminVaiTroId) o;
        return mataikhoan == that.mataikhoan &&
               maVaiTro == that.maVaiTro;
    }

    @Override
    public int hashCode() {
        return Objects.hash(mataikhoan, maVaiTro);
    }
}
