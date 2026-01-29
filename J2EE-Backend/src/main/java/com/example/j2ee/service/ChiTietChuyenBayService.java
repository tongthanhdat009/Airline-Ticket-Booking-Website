package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DichVuChuyenBay;
import com.example.j2ee.model.DichVuChuyenBayId;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.DichVuChuyenBayRepository;
import com.example.j2ee.repository.DichVuCungCapRepository;
import com.example.j2ee.repository.MayBayRepository;
import com.example.j2ee.repository.TuyenBayRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ChiTietChuyenBayService {
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final TuyenBayRepository tuyenBayRepository;
    private final MayBayRepository mayBayRepository;
    private final DichVuChuyenBayRepository dichVuChuyenBayRepository;
    private final DichVuCungCapRepository dichVuCungCapRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChiTietChuyenBayService(ChiTietChuyenBayRepository chiTietChuyenBayRepository,
            TuyenBayRepository tuyenBayRepository,
            MayBayRepository mayBayRepository,
            DichVuChuyenBayRepository dichVuChuyenBayRepository,
            DichVuCungCapRepository dichVuCungCapRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.tuyenBayRepository = tuyenBayRepository;
        this.mayBayRepository = mayBayRepository;
        this.dichVuChuyenBayRepository = dichVuChuyenBayRepository;
        this.dichVuCungCapRepository = dichVuCungCapRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<ChiTietChuyenBay> getAllChiTietChuyenBay() {
        return chiTietChuyenBayRepository.findAll();
    }

    public Optional<ChiTietChuyenBay> getChiTietChuyenBayById(int id) {
        if (!chiTietChuyenBayRepository.existsById(id)) {
            return Optional.empty();
        }
        return chiTietChuyenBayRepository.findById(id);
    }

    // Thêm chi tiết chuyến bay dùng model và trả thông báo
    public String createChiTietChuyenBay(ChiTietChuyenBay ct) {
        if (ct == null || ct.getTuyenBay() == null) {
            return "Chi tiết chuyến bay hoặc tuyến bay không hợp lệ";
        }
        validateNotNull(ct.getNgayDi(), "ngayDi");
        validateNotNull(ct.getGioDi(), "gioDi");
        validateNotNull(ct.getNgayDen(), "ngayDen");
        validateNotNull(ct.getGioDen(), "gioDen");

        // Kiểm tra ngày giờ đi không được sau ngày giờ đến
        try {
            validateTimeOrder(ct.getNgayDi(), ct.getGioDi(), ct.getNgayDen(), ct.getGioDen());
        } catch (IllegalArgumentException ex) {
            return ex.getMessage();
        }

        // Kiểm tra thời gian đến phải lớn hơn thời gian đi
        LocalDateTime timeDi = LocalDateTime.of(ct.getNgayDi(), ct.getGioDi());
        LocalDateTime timeDen = LocalDateTime.of(ct.getNgayDen(), ct.getGioDen());
        if (!timeDen.isAfter(timeDi)) {
            return "Thời gian đến phải sau thời gian đi";
        }

        // Kiểm tra thời gian đi và đến phải sau thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();
        if (!timeDi.isAfter(now)) {
            return "Thời gian đi phải sau thời gian hiện tại";
        }
        if (!timeDen.isAfter(now)) {
            return "Thời gian đến phải sau thời gian hiện tại";
        }

        int maTuyenBay = ct.getTuyenBay().getMaTuyenBay();
        TuyenBay tuyenBay = tuyenBayRepository.findById(maTuyenBay).orElse(null);
        if (tuyenBay == null) {
            return "Tuyến bay không tồn tại: " + maTuyenBay;
        }
        ct.setTuyenBay(tuyenBay);

        // Kiểm tra máy bay phải đang ở trạng thái Active
        if (ct.getMayBay() != null && ct.getMayBay().getMaMayBay() != 0) {
            int maMayBay = ct.getMayBay().getMaMayBay();
            MayBay mayBay = mayBayRepository.findById(maMayBay).orElse(null);
            if (mayBay == null) {
                return "Máy bay không tồn tại: " + maMayBay;
            }
            if (!"Active".equals(mayBay.getTrangThai())) {
                if ("Maintenance".equals(mayBay.getTrangThai())) {
                    return "Máy bay đang bảo trì không thể sử dụng. Hiện tại: " + mayBay.getTrangThai();
                }
                return "Máy bay phải ở trạng thái Active mới có thể tạo chuyến bay. Hiện tại: " + mayBay.getTrangThai();
            }

            // Kiểm tra máy bay phải có vị trí sân bay hiện tại
            if (mayBay.getSanBayHienTai() == null) {
                return "Máy bay chưa được gán vị trí sân bay hiện tại. Vui lòng cập nhật vị trí máy bay trước khi tạo chuyến bay.";
            }

            // Kiểm tra tuyến bay phải khởi hành từ sân bay hiện tại của máy bay
            if (tuyenBay.getSanBayDi().getMaSanBay() != mayBay.getSanBayHienTai().getMaSanBay()) {
                return "Tuyến bay không phù hợp. Máy bay đang ở " + mayBay.getSanBayHienTai().getTenSanBay()
                        + " (" + mayBay.getSanBayHienTai().getMaIATA() + ") nhưng tuyến bay khởi hành từ "
                        + tuyenBay.getSanBayDi().getTenSanBay() + " (" + tuyenBay.getSanBayDi().getMaIATA() + ").";
            }

            // Kiểm tra trùng lịch máy bay (với buffer 30 phút)
            long conflictCount = chiTietChuyenBayRepository.existsAircraftScheduleConflict(
                    maMayBay,
                    ct.getNgayDi(),
                    ct.getGioDi(),
                    ct.getNgayDen(),
                    ct.getGioDen(),
                    null // excludeMaChuyenBay = null khi tạo mới
            );

            if (conflictCount > 0) {
                return "Máy bay này đã được lịch bay trong khung thời gian này (cần buffer 30 phút giữa các chuyến). Vui lòng chọn khung giờ khác.";
            }

            ct.setMayBay(mayBay);
        }

        // Kiểm tra trùng theo số hiệu + lịch (ngày đi/giờ đi/ngày đến/giờ đến)
        boolean duplicate = chiTietChuyenBayRepository
                .existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
                        ct.getSoHieuChuyenBay(), ct.getNgayDi(), ct.getGioDi(), ct.getNgayDen(), ct.getGioDen());
        if (duplicate) {
            return "Bị trùng lịch: đã có chuyến với số hiệu và lịch này";
        }

        ct.setTrangThai("Đang mở bán");
        try {
            chiTietChuyenBayRepository.save(ct);
            return "Thêm chi tiết chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi thêm chi tiết chuyến bay: " + e.getMessage();
        }
    }

    // Sửa chi tiết chuyến bay dùng model và trả thông báo
    public String updateChiTietChuyenBay(ChiTietChuyenBay ctUpdate) {
        if (ctUpdate == null || ctUpdate.getMaChuyenBay() == 0) {
            return "Chi tiết chuyến bay không hợp lệ";
        }
        ChiTietChuyenBay ct = chiTietChuyenBayRepository.findById(ctUpdate.getMaChuyenBay()).orElse(null);
        if (ct == null) {
            return "Chi tiết chuyến bay không tồn tại: " + ctUpdate.getMaChuyenBay();
        }

        // Không cho sửa thông tin chuyến bay khi đang bay
        if ("Đang bay".equals(ct.getTrangThai())) {
            return "Không thể sửa thông tin chuyến bay khi đang bay. Chỉ có thể cập nhật trạng thái.";
        }

        boolean hasSeats = ct.getDanhSachGheDaDat() != null && !ct.getDanhSachGheDaDat().isEmpty();
        boolean changingRoute = ctUpdate.getTuyenBay() != null
                && ctUpdate.getTuyenBay().getMaTuyenBay() != 0
                && (ct.getTuyenBay() == null
                        || ct.getTuyenBay().getMaTuyenBay() != ctUpdate.getTuyenBay().getMaTuyenBay());
        boolean changingTime = (ctUpdate.getNgayDi() != null && !ctUpdate.getNgayDi().equals(ct.getNgayDi())) ||
                (ctUpdate.getGioDi() != null && !ctUpdate.getGioDi().equals(ct.getGioDi())) ||
                (ctUpdate.getNgayDen() != null && !ctUpdate.getNgayDen().equals(ct.getNgayDen())) ||
                (ctUpdate.getGioDen() != null && !ctUpdate.getGioDen().equals(ct.getGioDen()));

        if (hasSeats && (changingRoute || changingTime)) {
            return "Không thể sửa tuyến/ thời gian vì chuyến bay đã có dữ liệu liên quan (ghế).";
        }

        // Cập nhật tuyến bay nếu gửi lên
        if (ctUpdate.getTuyenBay() != null && ctUpdate.getTuyenBay().getMaTuyenBay() != 0) {
            int maTuyenBay = ctUpdate.getTuyenBay().getMaTuyenBay();
            TuyenBay tuyenBay = tuyenBayRepository.findById(maTuyenBay).orElse(null);
            if (tuyenBay == null) {
                return "Tuyến bay không tồn tại: " + maTuyenBay;
            }
            ct.setTuyenBay(tuyenBay);
        }

        // Cập nhật máy bay nếu gửi lên và kiểm tra trạng thái Active
        if (ctUpdate.getMayBay() != null && ctUpdate.getMayBay().getMaMayBay() != 0) {
            int maMayBay = ctUpdate.getMayBay().getMaMayBay();
            MayBay mayBay = mayBayRepository.findById(maMayBay).orElse(null);
            if (mayBay == null) {
                return "Máy bay không tồn tại: " + maMayBay;
            }
            if (!"Active".equals(mayBay.getTrangThai())) {
                if ("Maintenance".equals(mayBay.getTrangThai())) {
                    return "Máy bay đang bảo trì không thể sử dụng. Hiện tại: " + mayBay.getTrangThai();
                }
                return "Máy bay phải ở trạng thái Active mới có thể gán cho chuyến bay. Hiện tại: "
                        + mayBay.getTrangThai();
            }

            // Kiểm tra máy bay phải có vị trí sân bay hiện tại
            if (mayBay.getSanBayHienTai() == null) {
                return "Máy bay chưa được gán vị trí sân bay hiện tại. Vui lòng cập nhật vị trí máy bay trước khi gán cho chuyến bay.";
            }

            // Kiểm tra tuyến bay phải khởi hành từ sân bay hiện tại của máy bay
            TuyenBay tuyenBayToCheck = ct.getTuyenBay(); // dùng tuyến bay hiện tại hoặc đã được cập nhật ở trên
            if (tuyenBayToCheck.getSanBayDi().getMaSanBay() != mayBay.getSanBayHienTai().getMaSanBay()) {
                return "Tuyến bay không phù hợp. Máy bay đang ở " + mayBay.getSanBayHienTai().getTenSanBay()
                        + " (" + mayBay.getSanBayHienTai().getMaIATA() + ") nhưng tuyến bay khởi hành từ "
                        + tuyenBayToCheck.getSanBayDi().getTenSanBay() + " ("
                        + tuyenBayToCheck.getSanBayDi().getMaIATA() + ").";
            }

            // Kiểm tra trùng lịch máy bay khi thay đổi thời gian (loại trừ chuyến bay đang
            // sửa)
            boolean isChangingTime = (ctUpdate.getNgayDi() != null && !ctUpdate.getNgayDi().equals(ct.getNgayDi())) ||
                    (ctUpdate.getGioDi() != null && !ctUpdate.getGioDi().equals(ct.getGioDi())) ||
                    (ctUpdate.getNgayDen() != null && !ctUpdate.getNgayDen().equals(ct.getNgayDen())) ||
                    (ctUpdate.getGioDen() != null && !ctUpdate.getGioDen().equals(ct.getGioDen()));

            LocalDate ngayDiToCheck = ctUpdate.getNgayDi() != null ? ctUpdate.getNgayDi() : ct.getNgayDi();
            LocalTime gioDiToCheck = ctUpdate.getGioDi() != null ? ctUpdate.getGioDi() : ct.getGioDi();
            LocalDate ngayDenToCheck = ctUpdate.getNgayDen() != null ? ctUpdate.getNgayDen() : ct.getNgayDen();
            LocalTime gioDenToCheck = ctUpdate.getGioDen() != null ? ctUpdate.getGioDen() : ct.getGioDen();

            if (isChangingTime) {
                long conflictCount = chiTietChuyenBayRepository.existsAircraftScheduleConflict(
                        maMayBay,
                        ngayDiToCheck,
                        gioDiToCheck,
                        ngayDenToCheck,
                        gioDenToCheck,
                        ct.getMaChuyenBay() // exclude chuyến bay hiện tại
                );

                if (conflictCount > 0) {
                    return "Máy bay này đã được lịch bay trong khung thời gian này (cần buffer 30 phút giữa các chuyến). Vui lòng chọn khung giờ khác.";
                }
            }

            ct.setMayBay(mayBay);
        }

        // Cập nhật trường khác nếu có
        if (ctUpdate.getSoHieuChuyenBay() != null)
            ct.setSoHieuChuyenBay(ctUpdate.getSoHieuChuyenBay());
        if (ctUpdate.getNgayDi() != null)
            ct.setNgayDi(ctUpdate.getNgayDi());
        if (ctUpdate.getGioDi() != null)
            ct.setGioDi(ctUpdate.getGioDi());
        if (ctUpdate.getNgayDen() != null)
            ct.setNgayDen(ctUpdate.getNgayDen());
        if (ctUpdate.getGioDen() != null)
            ct.setGioDen(ctUpdate.getGioDen());

        // Kiểm tra ngày giờ đi không được sau ngày giờ đến sau khi áp dụng cập nhật
        try {
            validateTimeOrder(ct.getNgayDi(), ct.getGioDi(), ct.getNgayDen(), ct.getGioDen());
        } catch (IllegalArgumentException ex) {
            return ex.getMessage();
        }

        // Kiểm tra thời gian đến phải lớn hơn thời gian đi
        LocalDateTime timeDi = LocalDateTime.of(ct.getNgayDi(), ct.getGioDi());
        LocalDateTime timeDen = LocalDateTime.of(ct.getNgayDen(), ct.getGioDen());
        if (!timeDen.isAfter(timeDi)) {
            return "Thời gian đến phải sau thời gian đi";
        }

        // Kiểm tra thời gian đi và đến phải sau thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();
        if (!timeDi.isAfter(now)) {
            return "Thời gian đi phải sau thời gian hiện tại";
        }
        if (!timeDen.isAfter(now)) {
            return "Thời gian đến phải sau thời gian hiện tại";
        }

        // Kiểm tra trùng lịch (loại trừ chính bản ghi đang sửa)
        boolean duplicate = chiTietChuyenBayRepository
                .existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDenAndMaChuyenBayNot(
                        ct.getSoHieuChuyenBay(), ct.getNgayDi(), ct.getGioDi(), ct.getNgayDen(), ct.getGioDen(),
                        ct.getMaChuyenBay());
        if (duplicate) {
            return "Bị trùng lịch: đã có chuyến với số hiệu và lịch này";
        }

        try {
            chiTietChuyenBayRepository.save(ct);
            return "Sửa chi tiết chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi sửa chi tiết chuyến bay: " + e.getMessage();
        }
    }

    // Xóa chi tiết chuyến bay theo model và trả thông báo (soft delete)
    public String deleteChiTietChuyenBay(ChiTietChuyenBay ct) {
        if (ct == null || ct.getMaChuyenBay() == 0) {
            return "Chi tiết chuyến bay không hợp lệ";
        }
        int maChuyenBay = ct.getMaChuyenBay();
        ChiTietChuyenBay existing = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (existing == null) {
            return "Chi tiết chuyến bay không tồn tại: " + maChuyenBay;
        }

        // Chỉ cho phép xóa chuyến bay khi trạng thái là "Đã Huỷ"
        if (!"Đã Huỷ".equals(existing.getTrangThai())) {
            return "Chỉ được xóa chuyến bay khi có trạng thái 'Đã Huỷ'. Hiện tại: " + existing.getTrangThai();
        }

        // Kiểm tra dữ liệu liên quan: ghế đã đặt, đặt chỗ
        boolean hasSeats = existing.getDanhSachGheDaDat() != null && !existing.getDanhSachGheDaDat().isEmpty();
        // Nếu có bảng đặt chỗ tham chiếu ghế, nên kiểm tra thông qua quan hệ ghế -> đặt
        // chỗ (tùy model).
        if (hasSeats) {
            return "Không thể xóa vì chuyến bay đã phát sinh ghế/đặt chỗ đang được sử dụng.";
        }

        try {
            // Sử dụng soft delete - chỉ set flag và thời gian
            existing.setDaXoa(true);
            existing.setDeletedAt(LocalDateTime.now());

            chiTietChuyenBayRepository.save(existing);
            return "Xóa chi tiết chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi xóa chi tiết chuyến bay: " + e.getMessage();
        }
    }

    private void validateNotNull(Object value, String field) {
        if (value == null) {
            throw new IllegalArgumentException("Trường bắt buộc không được null: " + field);
        }
    }

    private void validateTimeOrder(LocalDate ngayDi, LocalTime gioDi, LocalDate ngayDen, LocalTime gioDen) {
        if (ngayDi.isAfter(ngayDen)) {
            throw new IllegalArgumentException("Ngày đến phải sau hoặc bằng ngày đi");
        }
        if (ngayDi.equals(ngayDen) && !gioDen.isAfter(gioDi)) {
            throw new IllegalArgumentException("Giờ đến phải sau giờ đi khi cùng ngày");
        }
    }

    @Transactional
    public String updateTrangThaiChuyenBay(int maChuyenBay, String trangThai) {
        ChiTietChuyenBay ct = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (ct == null) {
            return "Chi tiết chuyến bay không tồn tại: " + maChuyenBay;
        }

        String oldStatus = ct.getTrangThai();

        // Validation: Không cho hủy chuyến bay đã cất cánh
        if ("Đã Huỷ".equals(trangThai)) {
            if ("Đang bay".equals(oldStatus) || "Đã hạ cánh".equals(oldStatus) || "Đã bay".equals(oldStatus)) {
                return "Không thể hủy chuyến bay đã cất cánh. Trạng thái hiện tại: " + oldStatus;
            }
        }

        // Validation: Kiểm tra luồng chuyển trạng thái hợp lệ
        // Đang mở bán -> Đang check-in -> Đang bay -> Đã bay
        // Delay có thể chuyển sang Đang bay hoặc Đã bay
        if ("Đang check-in".equals(trangThai)) {
            if (!"Đang mở bán".equals(oldStatus) && oldStatus != null && !oldStatus.trim().isEmpty()) {
                return "Chỉ có thể chuyển sang 'Đang check-in' từ 'Đang mở bán'. Trạng thái hiện tại: " + oldStatus;
            }
        }

        if ("Đang bay".equals(trangThai)) {
            if (!"Đang check-in".equals(oldStatus) && !"Đang mở bán".equals(oldStatus) && !"Delay".equals(oldStatus)) {
                return "Chỉ có thể chuyển sang 'Đang bay' từ 'Đang check-in', 'Đang mở bán' hoặc 'Delay'. Trạng thái hiện tại: "
                        + oldStatus;
            }
            // Set thời gian khởi hành thực tế khi chuyển sang Đang bay
            if (ct.getThoiGianDiThucTe() == null) {
                ct.setThoiGianDiThucTe(LocalDateTime.now());
            }
        }

        ct.setTrangThai(trangThai);

        // Khi chuyển sang "Đã bay", tự động cập nhật thời gian thực tế nếu chưa có
        if ("Đã bay".equals(trangThai)) {
            if (ct.getThoiGianDiThucTe() == null) {
                LocalDateTime thoiGianDiDuKien = LocalDateTime.of(ct.getNgayDi(), ct.getGioDi());
                ct.setThoiGianDiThucTe(thoiGianDiDuKien);
            }
            if (ct.getThoiGianDenThucTe() == null) {
                LocalDateTime thoiGianDenDuKien = LocalDateTime.of(ct.getNgayDen(), ct.getGioDen());
                ct.setThoiGianDenThucTe(thoiGianDenDuKien);
            }

            // Cập nhật vị trí máy bay khi chuyến bay hoàn thành
            if (ct.getMayBay() != null && ct.getTuyenBay() != null) {
                MayBay mayBay = ct.getMayBay();
                mayBay.setSanBayHienTai(ct.getTuyenBay().getSanBayDen());
                mayBayRepository.save(mayBay);
            }
        }

        try {
            chiTietChuyenBayRepository.save(ct);

            // Gửi thông báo WebSocket sau khi cập nhật thành công
            sendFlightUpdate(ct, oldStatus);

            return "Cập nhật trạng thái chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi cập nhật trạng thái chuyến bay: " + e.getMessage();
        }
    }

    public String updateDelay(int maChuyenBay, String lyDoDelay, LocalDateTime thoiGianDiThucTe,
            LocalDateTime thoiGianDenThucTe) {
        ChiTietChuyenBay ct = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (ct == null) {
            return "Chi tiết chuyến bay không tồn tại: " + maChuyenBay;
        }

        // Kiểm tra thời gian đến phải lớn hơn thời gian đi
        if (thoiGianDiThucTe != null && thoiGianDenThucTe != null && !thoiGianDenThucTe.isAfter(thoiGianDiThucTe)) {
            return "Thời gian đến phải sau thời gian đi";
        }

        String oldStatus = ct.getTrangThai();
        ct.setTrangThai("Delay");
        ct.setLyDoDelay(lyDoDelay);
        ct.setThoiGianDiThucTe(thoiGianDiThucTe);
        ct.setThoiGianDenThucTe(thoiGianDenThucTe);

        try {
            chiTietChuyenBayRepository.save(ct);

            // Gửi thông báo WebSocket sau khi cập nhật thành công
            sendFlightUpdate(ct, oldStatus);

            return "Cập nhật delay thành công";
        } catch (Exception e) {
            return "Lỗi khi cập nhật delay: " + e.getMessage();
        }
    }

    public String updateCancel(int maChuyenBay, String lyDoHuy) {
        ChiTietChuyenBay ct = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (ct == null) {
            return "Chi tiết chuyến bay không tồn tại: " + maChuyenBay;
        }

        String oldStatus = ct.getTrangThai();

        // Validation: Không cho hủy chuyến bay đã cất cánh
        if ("Đang bay".equals(oldStatus) || "Đã hạ cánh".equals(oldStatus) || "Đã bay".equals(oldStatus)) {
            return "Không thể hủy chuyến bay đã cất cánh. Trạng thái hiện tại: " + oldStatus;
        }

        ct.setTrangThai("Đã Huỷ");
        ct.setLyDoDelay(lyDoHuy);

        try {
            chiTietChuyenBayRepository.save(ct);

            // Gửi thông báo WebSocket sau khi cập nhật thành công
            sendFlightUpdate(ct, oldStatus);

            return "Cập nhật hủy chuyến thành công";
        } catch (Exception e) {
            return "Lỗi khi cập nhật hủy chuyến: " + e.getMessage();
        }
    }

    // Lấy danh sách dịch vụ của chuyến bay
    public Set<DichVuCungCap> getDichVuByChuyenBay(int maChuyenBay) {
        ChiTietChuyenBay chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay với mã: " + maChuyenBay));
        return chuyenBay.getDichVuCungCap();
    }

    // Thêm dịch vụ vào chuyến bay
    public String addDichVuToChuyenBay(int maChuyenBay, int maDichVu) {
        ChiTietChuyenBay chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay với mã: " + maChuyenBay));

        DichVuCungCap dichVu = dichVuCungCapRepository.findById(maDichVu)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dịch vụ với mã: " + maDichVu));

        // Kiểm tra xem dịch vụ đã được thêm vào chuyến bay chưa
        DichVuChuyenBayId id = new DichVuChuyenBayId(maChuyenBay, maDichVu);
        if (dichVuChuyenBayRepository.existsById(id)) {
            return "Dịch vụ đã tồn tại trong chuyến bay này";
        }

        // Thêm dịch vụ vào chuyến bay
        DichVuChuyenBay dichVuChuyenBay = new DichVuChuyenBay();
        dichVuChuyenBay.setId(id);
        dichVuChuyenBay.setChiTietChuyenBay(chuyenBay);
        dichVuChuyenBay.setDichVuCungCap(dichVu);

        try {
            dichVuChuyenBayRepository.save(dichVuChuyenBay);
            return "Thêm dịch vụ vào chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi thêm dịch vụ: " + e.getMessage();
        }
    }

    // Xóa dịch vụ khỏi chuyến bay
    public String removeDichVuFromChuyenBay(int maChuyenBay, int maDichVu) {
        DichVuChuyenBayId id = new DichVuChuyenBayId(maChuyenBay, maDichVu);

        if (!dichVuChuyenBayRepository.existsById(id)) {
            return "Dịch vụ không tồn tại trong chuyến bay này";
        }

        try {
            dichVuChuyenBayRepository.deleteById(id);
            return "Xóa dịch vụ khỏi chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi xóa dịch vụ: " + e.getMessage();
        }
    }

    // === SOFT DELETE METHODS ===

    /**
     * Lấy danh sách tất cả các chuyến bay đã bị xóa (soft delete)
     */
    public List<ChiTietChuyenBay> getAllDeletedChiTietChuyenBay() {
        return chiTietChuyenBayRepository.findByDaXoaTrue();
    }

    /**
     * Khôi phục một chuyến bay đã bị xóa
     * 
     * @param maChuyenBay Mã chuyến bay cần khôi phục
     * @return Thông báo kết quả
     */
    public String restoreChiTietChuyenBay(int maChuyenBay) {
        if (!chiTietChuyenBayRepository.existsById(maChuyenBay)) {
            return "Chuyến bay không tồn tại: " + maChuyenBay;
        }

        ChiTietChuyenBay chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (chuyenBay == null) {
            return "Không tìm thấy chuyến bay";
        }

        if (!chuyenBay.getDaXoa()) {
            return "Chuyến bay này chưa bị xóa nên không cần khôi phục";
        }

        try {
            chuyenBay.setDaXoa(false);
            chuyenBay.setDeletedAt(null);

            chiTietChuyenBayRepository.save(chuyenBay);
            return "Khôi phục chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi khôi phục chuyến bay: " + e.getMessage();
        }
    }

    // === WEBSOCKET HELPER METHODS ===

    /**
     * Gửi thông báo cập nhật chuyến bay tới tất cả các client WebSocket
     */
    private void sendFlightUpdate(ChiTietChuyenBay flight, String oldStatus) {
        FlightStatusUpdate update = new FlightStatusUpdate(
                (long) flight.getMaChuyenBay(),
                oldStatus,
                flight.getTrangThai(),
                LocalDateTime.now(),
                flight.getThoiGianDiThucTe(),
                flight.getThoiGianDenThucTe(),
                flight.getLyDoDelay(),
                flight.getLyDoDelay() // lyDoHuy - có thể cần thêm field riêng nếu cần
        );

        // Gửi message tới tất cả client đang subscribe /topic/flight-updates
        messagingTemplate.convertAndSend("/topic/flight-updates", update);
    }

    // DTO class để chứa thông tin cập nhật chuyến bay
    public static class FlightStatusUpdate {
        private Long maChuyenBay;
        private String oldStatus;
        private String newStatus;
        private LocalDateTime timestamp;
        private LocalDateTime thoiGianDiThucTe;
        private LocalDateTime thoiGianDenThucTe;
        private String lyDoDelay;
        private String lyDoHuy;

        public FlightStatusUpdate(Long maChuyenBay, String oldStatus, String newStatus, LocalDateTime timestamp,
                LocalDateTime thoiGianDiThucTe, LocalDateTime thoiGianDenThucTe,
                String lyDoDelay, String lyDoHuy) {
            this.maChuyenBay = maChuyenBay;
            this.oldStatus = oldStatus;
            this.newStatus = newStatus;
            this.timestamp = timestamp;
            this.thoiGianDiThucTe = thoiGianDiThucTe;
            this.thoiGianDenThucTe = thoiGianDenThucTe;
            this.lyDoDelay = lyDoDelay;
            this.lyDoHuy = lyDoHuy;
        }

        // Getters
        public Long getMaChuyenBay() {
            return maChuyenBay;
        }

        public String getOldStatus() {
            return oldStatus;
        }

        public String getNewStatus() {
            return newStatus;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public LocalDateTime getThoiGianDiThucTe() {
            return thoiGianDiThucTe;
        }

        public LocalDateTime getThoiGianDenThucTe() {
            return thoiGianDenThucTe;
        }

        public String getLyDoDelay() {
            return lyDoDelay;
        }

        public String getLyDoHuy() {
            return lyDoHuy;
        }
    }
}