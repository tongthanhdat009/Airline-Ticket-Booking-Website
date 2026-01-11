package com.example.j2ee.service;

import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.HangVeRepository;
import com.example.j2ee.repository.TuyenBayRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class GiaChuyenBayService {
    private final GiaChuyenBayRepository giaChuyenBayRepository;

    public GiaChuyenBayService(
            GiaChuyenBayRepository giaChuyenBayRepository,
            TuyenBayRepository tuyenBayRepository,
            HangVeRepository hangVeRepository
    )
    {
        this.giaChuyenBayRepository = giaChuyenBayRepository;
    }

    public List<GiaChuyenBay> getAllGiaChuyenBay() {
        return giaChuyenBayRepository.findAll();
    }

    // Thêm giá: nhận TuyenBay và HangVe model trực tiếp
    @Transactional
    public GiaChuyenBay themGia(TuyenBay tuyenBay, HangVe hangVe, BigDecimal giaVe, LocalDate ngayApDungTu, LocalDate ngayApDungDen) {
        validateGiaVe(giaVe);
        validateKhoangNgay(ngayApDungTu, ngayApDungDen);
        validateTuyenBayAndHangVe(tuyenBay, hangVe);

        // Kiểm tra chồng lấn theo model
        List<GiaChuyenBay> overlapped = giaChuyenBayRepository
                .findOverlappedByTuyenBayAndHangVe(
                        tuyenBay,
                        hangVe,
                        ngayApDungTu,
                        ngayApDungDen
                );
        if (!overlapped.isEmpty()) {
            throw new IllegalStateException("Khoảng thời gian áp dụng bị chồng lấn với vé cùng hạng.");
        }

        GiaChuyenBay entity = new GiaChuyenBay();
        entity.setTuyenBay(tuyenBay);
        entity.setHangVe(hangVe);
        entity.setGiaVe(giaVe);
        entity.setNgayApDungTu(ngayApDungTu);
        entity.setNgayApDungDen(ngayApDungDen);

        return giaChuyenBayRepository.save(entity);
    }

    // Sửa giá: nhận GiaChuyenBay model, cập nhật giá và khoảng thời gian
    @Transactional
    public GiaChuyenBay suaGia(GiaChuyenBay giaChuyenBay, BigDecimal giaVeMoi, LocalDate ngayApDungTuMoi, LocalDate ngayApDungDenMoi) {
        validateGiaVe(giaVeMoi);
        validateKhoangNgay(ngayApDungTuMoi, ngayApDungDenMoi);

        // Load entity từ DB để đảm bảo managed state
        GiaChuyenBay current = giaChuyenBayRepository.findById(giaChuyenBay.getMaGia())
                .orElseThrow(() -> new IllegalArgumentException("Gia chuyen bay khong ton tai: " + giaChuyenBay.getMaGia()));

        // Kiểm tra chồng lấn, loại trừ chính bản ghi đang sửa
        List<GiaChuyenBay> overlapped = giaChuyenBayRepository
                .findOverlappedByTuyenBayAndHangVeExcludingId(
                        current.getTuyenBay(),
                        current.getHangVe(),
                        ngayApDungTuMoi,
                        ngayApDungDenMoi,
                        current.getMaGia()
                );
        if (!overlapped.isEmpty()) {
            throw new IllegalStateException("Khoang thoi gian ap dung bi chong lan voi muc gia khac.");
        }

        current.setGiaVe(giaVeMoi);
        current.setNgayApDungTu(ngayApDungTuMoi);
        current.setNgayApDungDen(ngayApDungDenMoi);

        return giaChuyenBayRepository.save(current);
    }

    // Xóa: nhận GiaChuyenBay model, chỉ xóa khi KHÔNG đang trong thời gian áp dụng
    @Transactional
    public void xoaGia(int maGia) {
        // Load entity từ DB
        GiaChuyenBay current = giaChuyenBayRepository.findById(maGia)
                .orElseThrow(() -> new IllegalArgumentException("Gia chuyen bay khong ton tai: " + maGia));

        LocalDate today = LocalDate.now();
        LocalDate from = current.getNgayApDungTu();
        LocalDate to = current.getNgayApDungDen();

        boolean dangApDung = !today.isBefore(from) && (to == null || !today.isAfter(to));
        if (dangApDung) {
            throw new IllegalStateException("Khong the xoa muc gia dang trong thoi gian ap dung.");
        }

        // Xóa bằng ID thay vì delete entity để tránh lỗi UnsupportedOperationException
        giaChuyenBayRepository.deleteById(maGia);
    }

    // Helpers
    private static void validateGiaVe(BigDecimal giaVe) {
        if (giaVe == null || giaVe.scale() > 2 || giaVe.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Gia ve phai > 0 va toi da 2 chu so thap phan.");
        }
    }

    private static void validateKhoangNgay(LocalDate from, LocalDate to) {
        if (from == null) throw new IllegalArgumentException("Ngay ap dung tu khong duoc rong.");
        if (to != null && to.isBefore(from)) {
            throw new IllegalArgumentException("Ngay ap dung den phai >= ngay ap dung tu.");
        }
    }

    private static void validateTuyenBayAndHangVe(TuyenBay tuyenBay, HangVe hangVe) {
        if (tuyenBay == null || tuyenBay.getMaTuyenBay() <= 0) {
            throw new IllegalArgumentException("Tuyen bay khong hop le.");
        }
        if (hangVe == null || hangVe.getMaHangVe() <= 0) {
            throw new IllegalArgumentException("Hang ve khong hop le.");
        }
    }

    private static Date toDate(LocalDate d) {
        return Date.from(d.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private static Date toDateOrNull(LocalDate d) {
        return d == null ? null : toDate(d);
    }

    private static LocalDate toLocalDate(Date d) {
        // Xử lý java.sql.Date (không hỗ trợ toInstant())
        if (d instanceof java.sql.Date) {
            return ((java.sql.Date) d).toLocalDate();
        }
        // Xử lý java.util.Date
        return d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    public GiaChuyenBay getGiaVeByChuyenBayAndHangVe(long maChuyenBay, long maHangVe) {
        return giaChuyenBayRepository.findLatestGiaByHangVeAndChuyenBay(maChuyenBay, maHangVe);
    }
}