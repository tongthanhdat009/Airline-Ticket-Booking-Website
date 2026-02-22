package com.example.j2ee.service;

import com.example.j2ee.dto.SoDoGheDTO;
import com.example.j2ee.dto.maybay.SeatLayoutRequest;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.GheDaDat;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.repository.HangVeRepository;
import com.example.j2ee.repository.MayBayRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChiTietGheService {
    private final ChiTietGheRepository chiTietGheRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final MayBayRepository mayBayRepository;
    private final HangVeRepository hangVeRepository;

    public ChiTietGheService(ChiTietGheRepository chiTietGheRepository,
                             ChiTietChuyenBayRepository chiTietChuyenBayRepository,
                             GheDaDatRepository gheDaDatRepository,
                             MayBayRepository mayBayRepository,
                             HangVeRepository hangVeRepository) {
        this.chiTietGheRepository = chiTietGheRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.gheDaDatRepository = gheDaDatRepository;
        this.mayBayRepository = mayBayRepository;
        this.hangVeRepository = hangVeRepository;
    }

    public List<ChiTietGhe> getAllChiTietGhe() {
        return chiTietGheRepository.findAll();
    }

    /**
     * Lấy danh sách ghế của máy bay theo mã máy bay
     */
    public List<ChiTietGhe> getChiTietGheByMayBay(int maMayBay) {
        if(!mayBayRepository.existsById(maMayBay)) {
            return null;
        }
        return chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
    }
    
    /**
     * Lấy danh sách ghế khả dụng cho một chuyến bay
     * Dựa vào máy bay của chuyến bay và loại trừ ghế đã đặt
     */
    public List<ChiTietGhe> getAvailableSeatsForFlight(int maChuyenBay) {
        var chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (chuyenBay == null || chuyenBay.getMayBay() == null) {
            return null;
        }
        
        int maMayBay = chuyenBay.getMayBay().getMaMayBay();
        List<ChiTietGhe> allSeats = chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
        
        // Lấy danh sách ghế đã đặt cho chuyến bay này
        List<GheDaDat> bookedSeats = gheDaDatRepository.findByChuyenBay_MaChuyenBay(maChuyenBay);
        List<Integer> bookedSeatIds = bookedSeats.stream()
                .map(gdd -> gdd.getGhe().getMaGhe())
                .collect(Collectors.toList());
        
        // Trả về ghế chưa được đặt
        return allSeats.stream()
                .filter(seat -> !bookedSeatIds.contains(seat.getMaGhe()))
                .collect(Collectors.toList());
    }

    /**
     * Lấy toàn bộ sơ đồ ghế của một chuyến bay bao gồm cả ghế đã đặt.
     * Field daDat = true nếu ghế đó đã có người đặt cho chuyến bay này.
     */
    public List<SoDoGheDTO> getSoDoGheForFlight(int maChuyenBay) {
        var chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (chuyenBay == null || chuyenBay.getMayBay() == null) {
            return null;
        }

        int maMayBay = chuyenBay.getMayBay().getMaMayBay();
        List<ChiTietGhe> allSeats = chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);

        // Lấy danh sách ID của ghế đã được đặt cho chuyến bay này
        Set<Integer> bookedSeatIds = gheDaDatRepository
                .findByChuyenBay_MaChuyenBay(maChuyenBay)
                .stream()
                .map(gdd -> gdd.getGhe().getMaGhe())
                .collect(Collectors.toSet());

        return allSeats.stream()
                .map(seat -> new SoDoGheDTO(
                        seat.getMaGhe(),
                        seat.getSoGhe(),
                        seat.getHang(),
                        seat.getCot(),
                        seat.getViTriGhe(),
                        seat.getHangVe(),
                        bookedSeatIds.contains(seat.getMaGhe())
                ))
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra còn ghế trống cho hạng vé của chuyến bay
     * Dựa vào soluong_phanbo và soluong_daban trong giachuyenbay
     */
    public boolean coGheTrong(Long maChuyenBay, Long maHangVe, Integer soLuongNguoi) {
        var chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay.intValue()).orElse(null);
        if (chuyenBay == null || chuyenBay.getMayBay() == null) {
            return false;
        }

        int maMayBay = chuyenBay.getMayBay().getMaMayBay();

        // Đếm tổng số ghế của hạng vé trên máy bay
        long tongGhe = chiTietGheRepository.countByMayBay_MaMayBayAndHangVe_MaHangVe(maMayBay, maHangVe.intValue());

        // Đếm số ghế đã đặt cho hạng vé trên chuyến bay này
        long gheDaDat = gheDaDatRepository.countByChuyenBay_MaChuyenBayAndGhe_HangVe_MaHangVe(
                maChuyenBay.intValue(), maHangVe.intValue());

        long soGheConTrong = tongGhe - gheDaDat;
        return soGheConTrong >= soLuongNguoi;
    }

    /**
     * Thêm một ghế vào máy bay
     */
    @Transactional
    public ChiTietGhe addSeatToAircraft(int maMayBay, SeatLayoutRequest request) {
        MayBay mayBay = mayBayRepository.findById(maMayBay)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy máy bay với mã: " + maMayBay));

        HangVe hangVe = hangVeRepository.findById(request.getMaHangVe())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng vé với mã: " + request.getMaHangVe()));

        // Kiểm tra tổng số ghế không được vượt quá tổng số ghế của máy bay
        List<ChiTietGhe> existingSeats = chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
        int existingSeatsCount = existingSeats.size();
        int aircraftMaxSeats = mayBay.getTongSoGhe();

        if (existingSeatsCount >= aircraftMaxSeats) {
            int canAddMore = aircraftMaxSeats - existingSeatsCount;
            if (canAddMore <= 0) {
                throw new IllegalArgumentException(
                    String.format("Máy bay đã có đủ số ghế tối đa (%d ghế). Không thể thêm ghế mới.",
                            aircraftMaxSeats)
                );
            } else {
                throw new IllegalArgumentException(
                    String.format("Máy bay đã có %d ghế, chỉ có thể tạo thêm tối đa %d ghế nữa. Số ghế tối đa của máy bay là %d ghế.",
                            existingSeatsCount, canAddMore, aircraftMaxSeats)
                );
            }
        }

        ChiTietGhe chiTietGhe = new ChiTietGhe();
        chiTietGhe.setMayBay(mayBay);
        chiTietGhe.setHangVe(hangVe);
        chiTietGhe.setSoGhe(request.getSoGhe());
        chiTietGhe.setViTriGhe(request.getViTriGhe());
        chiTietGhe.setHang(request.getHang());
        chiTietGhe.setCot(request.getCot());

        return chiTietGheRepository.save(chiTietGhe);
    }

    /**
     * Cập nhật thông tin ghế
     */
    @Transactional
    public ChiTietGhe updateSeat(int maGhe, SeatLayoutRequest request) {
        ChiTietGhe chiTietGhe = chiTietGheRepository.findById(maGhe)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ghế với mã: " + maGhe));

        HangVe hangVe = hangVeRepository.findById(request.getMaHangVe())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng vé với mã: " + request.getMaHangVe()));

        chiTietGhe.setHangVe(hangVe);
        chiTietGhe.setSoGhe(request.getSoGhe());
        chiTietGhe.setViTriGhe(request.getViTriGhe());
        chiTietGhe.setHang(request.getHang());
        chiTietGhe.setCot(request.getCot());

        return chiTietGheRepository.save(chiTietGhe);
    }

    /**
     * Xóa một ghế
     */
    @Transactional
    public void deleteSeat(int maGhe) {
        if (!chiTietGheRepository.existsById(maGhe)) {
            throw new EntityNotFoundException("Không tìm thấy ghế với mã: " + maGhe);
        }
        chiTietGheRepository.deleteById(maGhe);
    }

    /**
     * Xóa tất cả ghế của một máy bay
     * Dùng khi muốn thiết lập lại sơ đồ ghế
     */
    @Transactional
    public void deleteAllSeatsByAircraft(int maMayBay) {
        if (!mayBayRepository.existsById(maMayBay)) {
            throw new EntityNotFoundException("Không tìm thấy máy bay với mã: " + maMayBay);
        }
        List<ChiTietGhe> seats = chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
        chiTietGheRepository.deleteAll(seats);
    }

    /**
     * Tạo sơ đồ ghế tự động cho máy bay
     * Chỉ thêm ghế mới vào vị trí trống, không ghi đè ghế đã có
     */
    @Transactional
    public List<ChiTietGhe> autoGenerateSeatLayout(int maMayBay, List<SeatConfig> seatConfigs) {
        MayBay mayBay = mayBayRepository.findById(maMayBay)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy máy bay với mã: " + maMayBay));

        // Lấy danh sách ghế hiện tại
        List<ChiTietGhe> existingSeats = chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
        int existingSeatsCount = existingSeats.size();

        // Tạo set chứa các vị trí đã có (row-col)
        java.util.Set<String> existingPositions = existingSeats.stream()
                .map(seat -> seat.getHang() + "-" + seat.getCot())
                .collect(java.util.stream.Collectors.toSet());

        // Tính số ghế mới sẽ tạo (chỉ tính ghế chưa tồn tại)
        int newSeatsToCreate = 0;
        for (SeatConfig config : seatConfigs) {
            int startRow = config.getStartRow();
            int endRow = config.getEndRow();
            List<String> columns = config.getColumns();

            for (int row = startRow; row <= endRow; row++) {
                for (String col : columns) {
                    String positionKey = row + "-" + col;
                    if (!existingPositions.contains(positionKey)) {
                        newSeatsToCreate++;
                    }
                }
            }
        }

        // Kiểm tra tổng số ghế không được vượt quá tổng số ghế của máy bay
        int totalSeatsAfterCreation = existingSeatsCount + newSeatsToCreate;
        int aircraftMaxSeats = mayBay.getTongSoGhe();

        if (totalSeatsAfterCreation > aircraftMaxSeats) {
            throw new IllegalArgumentException(
                    String.format("Tổng số ghế tạo (%d ghế) không được lớn hơn tổng số ghế máy bay hiện có (%d ghế). " +
                                    "Máy bay đã có %d ghế, chỉ có thể tạo thêm tối đa %d ghế nữa.",
                            totalSeatsAfterCreation, aircraftMaxSeats, existingSeatsCount, aircraftMaxSeats - existingSeatsCount)
            );
        }

        List<ChiTietGhe> createdSeats = new java.util.ArrayList<>();
        int duplicateCount = 0;
        int skippedCount = 0;

        for (SeatConfig config : seatConfigs) {
            HangVe hangVe = hangVeRepository.findById(config.getMaHangVe())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng vé với mã: " + config.getMaHangVe()));

            int startRow = config.getStartRow();
            int endRow = config.getEndRow();
            List<String> columns = config.getColumns();
            String viTriGhe = config.getViTriGhe();

            for (int row = startRow; row <= endRow; row++) {
                for (String col : columns) {
                    String positionKey = row + "-" + col;

                    // Kiểm tra xem vị trí này đã có ghế chưa
                    if (existingPositions.contains(positionKey)) {
                        duplicateCount++;
                        continue; // Bỏ qua vị trí đã có ghế
                    }

                    // Chỉ tạo ghế mới cho vị trí trống
                    ChiTietGhe ghe = new ChiTietGhe();
                    ghe.setMayBay(mayBay);
                    ghe.setHangVe(hangVe);
                    ghe.setSoGhe(row + col);
                    ghe.setViTriGhe(viTriGhe);
                    ghe.setHang(row);
                    ghe.setCot(col);

                    ChiTietGhe saved = chiTietGheRepository.save(ghe);
                    createdSeats.add(saved);
                    existingPositions.add(positionKey); // Thêm vào set để tránh trùng lặp trong cùng batch
                    skippedCount++;
                }
            }
        }

        return createdSeats;
    }

    /**
     * Inner class để cấu hình tạo ghế tự động
     */
    public static class SeatConfig {
        private Integer maHangVe;
        private int startRow;
        private int endRow;
        private List<String> columns;
        private String viTriGhe;

        public SeatConfig(Integer maHangVe, int startRow, int endRow, List<String> columns, String viTriGhe) {
            this.maHangVe = maHangVe;
            this.startRow = startRow;
            this.endRow = endRow;
            this.columns = columns;
            this.viTriGhe = viTriGhe;
        }

        public Integer getMaHangVe() { return maHangVe; }
        public int getStartRow() { return startRow; }
        public int getEndRow() { return endRow; }
        public List<String> getColumns() { return columns; }
        public String getViTriGhe() { return viTriGhe; }
    }
}
