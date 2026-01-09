package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.SanBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.SanBayRepository;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightDataService {

    private static final Logger log = LoggerFactory.getLogger(FlightDataService.class);
    
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final GiaChuyenBayRepository giaChuyenBayRepository;
    private final SanBayRepository sanBayRepository;
    private final ObjectMapper objectMapper;

    public FlightDataService(
            ChiTietChuyenBayRepository chiTietChuyenBayRepository,
            GiaChuyenBayRepository giaChuyenBayRepository,
            SanBayRepository sanBayRepository
    ) {
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.giaChuyenBayRepository = giaChuyenBayRepository;
        this.sanBayRepository = sanBayRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Lấy thông tin các chuyến bay sắp tới (từ hôm nay trở đi)
     */
    public String getUpcomingFlights() {
        LocalDate today = LocalDate.now();
        List<ChiTietChuyenBay> flights = chiTietChuyenBayRepository.findAll()
                .stream()
                .filter(flight -> !flight.getNgayDi().isBefore(today))
                .filter(flight -> "Đang mở bán".equals(flight.getTrangThai()))
                .sorted((f1, f2) -> {
                    int dateCompare = f1.getNgayDi().compareTo(f2.getNgayDi());
                    if (dateCompare != 0) return dateCompare;
                    return f1.getGioDi().compareTo(f2.getGioDi());
                })
                .limit(20)
                .collect(Collectors.toList());

        return formatFlightsForAI(flights, "DANH SÁCH CHUYẾN BAY SẮP TỚI");
    }

    /**
     * Tìm kiếm chuyến bay theo điểm đi, điểm đến và ngày bay
     */
    public String searchFlights(String diemDi, String diemDen, LocalDate ngayDi) {
        log.info("🔍 Tìm kiếm chuyến bay: {} -> {}, ngày: {}", diemDi, diemDen, ngayDi);
        
        List<ChiTietChuyenBay> allFlights = chiTietChuyenBayRepository.findAll();
        
        List<ChiTietChuyenBay> matchedFlights = allFlights.stream()
                .filter(flight -> "Đang mở bán".equals(flight.getTrangThai()))
                .filter(flight -> {
                    // Nếu không có điểm đi/đến (tìm theo ngày), bỏ qua filter này
                    if ((diemDi == null || diemDi.isEmpty()) && (diemDen == null || diemDen.isEmpty())) {
                        return true;
                    }
                    
                    String sanBayDi = flight.getTuyenBay().getSanBayDi().getTenSanBay().toLowerCase();
                    String maDi = flight.getTuyenBay().getSanBayDi().getMaIATA().toLowerCase();
                    String thanhPhoDi = flight.getTuyenBay().getSanBayDi().getThanhPhoSanBay().toLowerCase();
                    
                    String sanBayDen = flight.getTuyenBay().getSanBayDen().getTenSanBay().toLowerCase();
                    String maDen = flight.getTuyenBay().getSanBayDen().getMaIATA().toLowerCase();
                    String thanhPhoDen = flight.getTuyenBay().getSanBayDen().getThanhPhoSanBay().toLowerCase();
                    
                    String searchDi = diemDi != null ? diemDi.toLowerCase() : "";
                    String searchDen = diemDen != null ? diemDen.toLowerCase() : "";
                    
                    boolean matchDi = searchDi.isEmpty() || sanBayDi.contains(searchDi) || maDi.contains(searchDi) || thanhPhoDi.contains(searchDi);
                    boolean matchDen = searchDen.isEmpty() || sanBayDen.contains(searchDen) || maDen.contains(searchDen) || thanhPhoDen.contains(searchDen);
                    
                    return matchDi && matchDen;
                })
                .filter(flight -> ngayDi == null || flight.getNgayDi().equals(ngayDi))
                .sorted((f1, f2) -> {
                    int dateCompare = f1.getNgayDi().compareTo(f2.getNgayDi());
                    if (dateCompare != 0) return dateCompare;
                    return f1.getGioDi().compareTo(f2.getGioDi());
                })
                .limit(15)
                .collect(Collectors.toList());

        if (matchedFlights.isEmpty()) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String dateStr = ngayDi != null ? " vào ngày " + ngayDi.format(dateFormatter) : "";
            String routeStr = "";
            
            if (diemDi != null && !diemDi.isEmpty() && diemDen != null && !diemDen.isEmpty()) {
                routeStr = String.format("từ %s đến %s", diemDi, diemDen);
            } else if (ngayDi != null) {
                routeStr = "trong ngày này";
            }
            
            return String.format("❌ Không tìm thấy chuyến bay nào %s%s.\n\n" +
                    "💡 Gợi ý:\n" +
                    "- Kiểm tra lại thông tin tìm kiếm\n" +
                    "- Thử tìm kiếm với ngày khác\n" +
                    "- Xem danh sách chuyến bay sắp tới", 
                    routeStr, dateStr);
        }

        log.info("✅ Tìm thấy {} chuyến bay phù hợp", matchedFlights.size());
        
        String title;
        if (diemDi != null && !diemDi.isEmpty() && diemDen != null && !diemDen.isEmpty()) {
            title = String.format("KẾT QUẢ TÌM KIẾM: %s → %s", diemDi.toUpperCase(), diemDen.toUpperCase());
        } else if (ngayDi != null) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            title = String.format("CHUYẾN BAY NGÀY %s", ngayDi.format(dateFormatter));
        } else {
            title = "KẾT QUẢ TÌM KIẾM CHUYẾN BAY";
        }
        
        return formatFlightsForAI(matchedFlights, title);
    }

    /**
     * Lấy thông tin giá vé theo tuyến bay
     */
    public String getPricesByRoute(String diemDi, String diemDen) {
        log.info("💰 Lấy thông tin giá vé: {} -> {}", diemDi, diemDen);
        
        List<ChiTietChuyenBay> flights = chiTietChuyenBayRepository.findAll().stream()
                .filter(flight -> {
                    String sanBayDi = flight.getTuyenBay().getSanBayDi().getTenSanBay().toLowerCase();
                    String sanBayDen = flight.getTuyenBay().getSanBayDen().getTenSanBay().toLowerCase();
                    return sanBayDi.contains(diemDi.toLowerCase()) && sanBayDen.contains(diemDen.toLowerCase());
                })
                .limit(1)
                .collect(Collectors.toList());

        if (flights.isEmpty()) {
            return String.format("❌ Không tìm thấy tuyến bay từ %s đến %s.", diemDi, diemDen);
        }

        ChiTietChuyenBay flight = flights.get(0);
        List<GiaChuyenBay> prices = getPricesForFlight(flight);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("💰 BẢNG GIÁ VÉ: %s → %s\n\n", 
            flight.getTuyenBay().getSanBayDi().getTenSanBay(),
            flight.getTuyenBay().getSanBayDen().getTenSanBay()));

        if (prices.isEmpty()) {
            sb.append("Hiện tại chưa có thông tin giá vé cho tuyến bay này.\n");
        } else {
            for (GiaChuyenBay price : prices) {
                sb.append(String.format("✈️ %s: %,.0f VNĐ\n",
                        price.getHangVe().getTenHangVe(),
                        price.getGiaVe()));
                
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                sb.append(String.format("   Áp dụng từ: %s", 
                    new java.sql.Date(price.getNgayApDungTu().getTime()).toLocalDate().format(dateFormatter)));
                
                if (price.getNgayApDungDen() != null) {
                    sb.append(String.format(" đến %s", 
                        new java.sql.Date(price.getNgayApDungDen().getTime()).toLocalDate().format(dateFormatter)));
                }
                sb.append("\n\n");
            }
        }

        return sb.toString();
    }

    /**
     * Lấy lịch bay trong khoảng thời gian
     */
    public String getFlightSchedule(String diemDi, String diemDen, LocalDate tuNgay, LocalDate denNgay) {
        log.info("📅 Lấy lịch bay: {} -> {} từ {} đến {}", diemDi, diemDen, tuNgay, denNgay);
        
        LocalDate startDate = tuNgay != null ? tuNgay : LocalDate.now();
        LocalDate endDate = denNgay != null ? denNgay : startDate.plusDays(7);

        List<ChiTietChuyenBay> flights = chiTietChuyenBayRepository.findAll().stream()
                .filter(flight -> "Đang mở bán".equals(flight.getTrangThai()))
                .filter(flight -> {
                    if (diemDi != null && diemDen != null) {
                        String sanBayDi = flight.getTuyenBay().getSanBayDi().getTenSanBay().toLowerCase();
                        String sanBayDen = flight.getTuyenBay().getSanBayDen().getTenSanBay().toLowerCase();
                        return sanBayDi.contains(diemDi.toLowerCase()) && sanBayDen.contains(diemDen.toLowerCase());
                    }
                    return true;
                })
                .filter(flight -> !flight.getNgayDi().isBefore(startDate) && !flight.getNgayDi().isAfter(endDate))
                .sorted((f1, f2) -> {
                    int dateCompare = f1.getNgayDi().compareTo(f2.getNgayDi());
                    if (dateCompare != 0) return dateCompare;
                    return f1.getGioDi().compareTo(f2.getGioDi());
                })
                .collect(Collectors.toList());

        if (flights.isEmpty()) {
            return String.format("❌ Không có chuyến bay nào trong khoảng thời gian từ %s đến %s.",
                    startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String title = diemDi != null && diemDen != null 
            ? String.format("LỊCH BAY: %s → %s (Từ %s đến %s)", 
                diemDi.toUpperCase(), diemDen.toUpperCase(),
                startDate.format(dateFormatter), endDate.format(dateFormatter))
            : String.format("LỊCH BAY TẤT CẢ TUYẾN (Từ %s đến %s)",
                startDate.format(dateFormatter), endDate.format(dateFormatter));

        return formatFlightsForAI(flights, title);
    }

    /**
     * Tư vấn chuyến bay phù hợp dựa trên yêu cầu
     */
    public String recommendFlights(String diemDi, String diemDen, LocalDate ngayDi, String hangVeMongMuon) {
        log.info("💡 Tư vấn chuyến bay: {} -> {}, ngày: {}, hạng: {}", diemDi, diemDen, ngayDi, hangVeMongMuon);
        
        List<ChiTietChuyenBay> flights = chiTietChuyenBayRepository.findAll().stream()
                .filter(flight -> "Đang mở bán".equals(flight.getTrangThai()))
                .filter(flight -> {
                    String sanBayDi = flight.getTuyenBay().getSanBayDi().getTenSanBay().toLowerCase();
                    String sanBayDen = flight.getTuyenBay().getSanBayDen().getTenSanBay().toLowerCase();
                    return sanBayDi.contains(diemDi.toLowerCase()) && sanBayDen.contains(diemDen.toLowerCase());
                })
                .filter(flight -> ngayDi == null || flight.getNgayDi().equals(ngayDi))
                .filter(flight -> !flight.getNgayDi().isBefore(LocalDate.now()))
                .sorted((f1, f2) -> {
                    int dateCompare = f1.getNgayDi().compareTo(f2.getNgayDi());
                    if (dateCompare != 0) return dateCompare;
                    return f1.getGioDi().compareTo(f2.getGioDi());
                })
                .limit(10)
                .collect(Collectors.toList());

        if (flights.isEmpty()) {
            return String.format("❌ Không tìm thấy chuyến bay phù hợp từ %s đến %s.", diemDi, diemDen);
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("💡 TƯ VẤN CHUYẾN BAY PHÙ HỢP: %s → %s\n\n", 
            diemDi.toUpperCase(), diemDen.toUpperCase()));

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        int count = 0;
        for (ChiTietChuyenBay flight : flights) {
            count++;
            List<GiaChuyenBay> prices = getPricesForFlight(flight);

            // Lọc theo hạng vé nếu có
            if (hangVeMongMuon != null && !hangVeMongMuon.isEmpty()) {
                prices = prices.stream()
                        .filter(p -> p.getHangVe().getTenHangVe().toLowerCase().contains(hangVeMongMuon.toLowerCase()))
                        .collect(Collectors.toList());
            }

            if (prices.isEmpty() && hangVeMongMuon != null) continue;

            sb.append(String.format("✈️ Lựa chọn %d: %s\n", count, flight.getSoHieuChuyenBay()));
            sb.append(String.format("   📍 %s → %s\n",
                    flight.getTuyenBay().getSanBayDi().getThanhPhoSanBay(),
                    flight.getTuyenBay().getSanBayDen().getThanhPhoSanBay()));
            sb.append(String.format("   📅 %s | ⏰ %s - %s\n",
                    flight.getNgayDi().format(dateFormatter),
                    flight.getGioDi().format(timeFormatter),
                    flight.getGioDen().format(timeFormatter)));

            if (!prices.isEmpty()) {
                sb.append("   💰 Giá vé:\n");
                for (GiaChuyenBay price : prices) {
                    sb.append(String.format("      • %s: %,.0f VNĐ\n",
                            price.getHangVe().getTenHangVe(),
                            price.getGiaVe()));
                }
            }

            // Thêm gợi ý
            if (flight.getGioDi().getHour() < 9) {
                sb.append("   💡 Chuyến bay sớm - phù hợp cho lịch trình công tác\n");
            } else if (flight.getGioDi().getHour() >= 18) {
                sb.append("   💡 Chuyến bay tối - tiết kiệm thời gian ban ngày\n");
            }

            sb.append("\n");
        }

        return sb.toString();
    }

    /**
     * Lấy thông tin tổng quan về tất cả các sân bay
     */
    public String getAllAirports() {
        List<SanBay> airports = sanBayRepository.findAll();
        
        StringBuilder sb = new StringBuilder();
        sb.append("🛫 DANH SÁCH SÂN BAY SGU AIRLINE:\n\n");
        
        for (SanBay airport : airports) {
            sb.append(String.format("• %s (%s)\n", airport.getTenSanBay(), airport.getMaIATA()));
            sb.append(String.format("  Địa điểm: %s, %s\n", 
                airport.getThanhPhoSanBay(), airport.getQuocGiaSanBay()));
            sb.append(String.format("  Trạng thái: %s\n\n", airport.getTrangThaiHoatDong()));
        }
        
        return sb.toString();
    }

    /**
     * Format thông tin chuyến bay thành chuỗi dễ đọc cho AI
     */
    private String formatFlightsForAI(List<ChiTietChuyenBay> flights, String title) {
        if (flights.isEmpty()) {
            return "Hiện tại không có chuyến bay nào đang mở bán.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(title).append("\n");
        sb.append("=".repeat(title.length())).append("\n\n");

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        for (int i = 0; i < flights.size(); i++) {
            ChiTietChuyenBay flight = flights.get(i);
            sb.append(String.format("✈️ %d. Chuyến bay %s\n", i + 1, flight.getSoHieuChuyenBay()));
            sb.append(String.format("   📍 Tuyến: %s (%s) → %s (%s)\n",
                    flight.getTuyenBay().getSanBayDi().getThanhPhoSanBay(),
                    flight.getTuyenBay().getSanBayDi().getMaIATA(),
                    flight.getTuyenBay().getSanBayDen().getThanhPhoSanBay(),
                    flight.getTuyenBay().getSanBayDen().getMaIATA()));
            sb.append(String.format("   📅 Khởi hành: %s lúc %s\n",
                    flight.getNgayDi().format(dateFormatter),
                    flight.getGioDi().format(timeFormatter)));
            sb.append(String.format("   🛬 Đến: %s lúc %s\n",
                    flight.getNgayDen().format(dateFormatter),
                    flight.getGioDen().format(timeFormatter)));
            sb.append(String.format("   ℹ️ Trạng thái: %s\n", flight.getTrangThai()));
            
            // Lấy giá vé cho chuyến bay này
            List<GiaChuyenBay> prices = getPricesForFlight(flight);

            if (!prices.isEmpty()) {
                sb.append("   💰 Giá vé:\n");
                for (GiaChuyenBay price : prices) {
                    sb.append(String.format("      • %s: %,.0f VNĐ\n",
                            price.getHangVe().getTenHangVe(),
                            price.getGiaVe()));
                }
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    /**
     * Lấy danh sách giá vé cho một chuyến bay cụ thể
     */
    private List<GiaChuyenBay> getPricesForFlight(ChiTietChuyenBay flight) {
        return giaChuyenBayRepository.findAll()
                .stream()
                .filter(gia -> gia.getTuyenBay().getMaTuyenBay() == flight.getTuyenBay().getMaTuyenBay())
                .filter(gia -> {
                    LocalDate ngayDi = flight.getNgayDi();
                    LocalDate ngayApDungTu = new java.sql.Date(gia.getNgayApDungTu().getTime()).toLocalDate();
                    LocalDate ngayApDungDen = gia.getNgayApDungDen() != null
                            ? new java.sql.Date(gia.getNgayApDungDen().getTime()).toLocalDate()
                            : LocalDate.MAX;
                    return !ngayDi.isBefore(ngayApDungTu) && !ngayDi.isAfter(ngayApDungDen);
                })
                .collect(Collectors.toList());
    }
}
