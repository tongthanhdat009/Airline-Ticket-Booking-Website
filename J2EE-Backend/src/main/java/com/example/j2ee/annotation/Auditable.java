package com.example.j2ee.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation để đánh dấu method cần ghi audit log tự động
 * Sử dụng với AOP Aspect để tự động ghi log trước và sau khi thực hiện method
 *
 * Ví dụ:
 * @Auditable(action = "HỦY_VÉ", table = "datcho", getMaBanGhi = "maDatCho")
 * public void huyDatCho(int maDatCho) { ... }
 *
 * @Auditable(action = "CẬP_NHẬT", table = "donhang", getMaBanGhi = "id")
 * public DonHangResponse updateTrangThai(int id, UpdateTrangThaiDonHangRequest request) { ... }
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /**
     * Loại thao tác (HỦY_VÉ, ĐỔI_GHẾ, ĐỔI_CHUYẾN_BAY, CHECK_IN, HOÀN_TIỀN, etc.)
     */
    String action();

    /**
     * Bảng bị ảnh hưởng (datcho, donhang, chitietchuyenbay, taikhoanadmin, etc.)
     */
    String table();

    /**
     * Tên tham số chứa mã bản ghi (mặc định là "id")
     * Nếu method có nhiều tham số, cần chỉ định tên tham số chứa ID
     */
    String paramName() default "id";

    /**
     * Mô tả thao tác (tùy chọn)
     */
    String description() default "";

    /**
     * Loại tài khoản thực hiện (ADMIN, CUSTOMER)
     * Mặc định là ADMIN cho các method trong admin service
     */
    String accountType() default "ADMIN";
}
