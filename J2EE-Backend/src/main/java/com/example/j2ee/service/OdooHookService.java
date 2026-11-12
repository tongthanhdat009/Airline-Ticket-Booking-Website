package com.example.j2ee.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.TrangThaiThanhToan;

@Service
public class OdooHookService {
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${odoo.connector.url:http://localhost:8090}")
    private String connectorUrl;

    @Value("${odoo.webhook.secret:}")
    private String secret;

    @Value("${odoo.direct.url:http://localhost:8069}")
    private String directUrl;

    @Value("${odoo.direct.channel-key:}")
    private String channelKey;

    @Value("${odoo.direct.channel-code:airline}")
    private String channelCode;

    public void firePaidAsync(DonHang donHang, TrangThaiThanhToan tt) {
        // Fail closed: without a configured secret we would sign with a well-known
        // key, so skip the webhook instead of sending an unsigned/unknown-key request.
        if (secret == null || secret.isBlank()) {
            System.err.println("OdooHook skipped: odoo.webhook.secret is not configured");
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                List<Map<String, Object>> lines = new ArrayList<>();                if (donHang.getDanhSachDatCho() != null) {
                    for (DatCho d : donHang.getDanhSachDatCho()) {
                        Map<String, Object> l = new HashMap<>();
                        String cb = d.getChuyenBay() != null ? String.valueOf(d.getChuyenBay().getMaChuyenBay()) : "?";
                        String hv = d.getHangVe() != null ? String.valueOf(d.getHangVe().getMaHangVe()) : "?";
                        l.put("sku", "FLIGHT-" + cb + "-" + hv);
                        l.put("name", "Ve " + hv + " chuyen " + cb);
                        l.put("qty", 1);
                        l.put("unit_price_vnd", d.getGiaVe() == null ? 0 : d.getGiaVe().setScale(0, java.math.RoundingMode.HALF_UP).longValue());
                        l.put("is_service", true);
                        lines.add(l);
                    }
                }
                Map<String, Object> order = new HashMap<>();
                order.put("source", "airline");
                order.put("source_order_id", donHang.getPnr());
                order.put("customer_name", donHang.getHanhKhachNguoiDat() != null ? donHang.getHanhKhachNguoiDat().getHoVaTen() : "");
                order.put("customer_email", donHang.getEmailNguoiDat());
                order.put("customer_phone", donHang.getSoDienThoaiNguoiDat());
                order.put("address", "");
                order.put("lines", lines);
                order.put("discount_vnd", 0);
                order.put("shipping_vnd", 0);
                order.put("paid_vnd", donHang.getTongGia() == null ? 0 : donHang.getTongGia().setScale(0, java.math.RoundingMode.HALF_UP).longValue());
                order.put("payment_method", tt.getPhuongThucThanhToan());
                order.put("provider_ref", tt.getTransactionCode() == null ? "" : tt.getTransactionCode());
                order.put("origin_note", "airline:donhang:" + donHang.getMaDonHang());

                Map<String, Object> body = Map.of("event_id", donHang.getPnr(), "order", order);
                String json = mapper.writeValueAsString(body);
                String sig = hmac(json);
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(connectorUrl + "/ingest/airline"))
                        .header("Content-Type", "application/json")
                        .header("X-Signature", sig)
                        .POST(HttpRequest.BodyPublishers.ofString(json))
                        .build();
                http.send(req, HttpResponse.BodyHandlers.discarding());
            } catch (Exception e) {
                System.err.println("OdooHook failed: " + e.getMessage());
            }
            try {
                pushDirect(donHang);
            } catch (Exception e) {
                System.err.println("OdooDirect failed: " + e.getMessage());
            }
        });
    }

    /**
     * POST don ve sang Odoo {@code /api/channel/order_push} theo SYNC_CONTRACT
     * (repo odoo: custom_addons/multi_channel_base/SYNC_CONTRACT.md).
     * Idempotent theo (channel_code, pnr) — Odoo dedupe phia nhan.
     * HoaDon -&gt; account.move map phia Odoo khi sale.order confirm (standard flow).
     */
    void pushDirect(DonHang donHang) throws Exception {
        if (channelKey == null || channelKey.isBlank()) {
            System.err.println("OdooDirect skipped: odoo.direct.channel-key is not configured");
            return;
        }
        String json = mapper.writeValueAsString(buildDirectPayload(donHang));
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(directUrl + "/api/channel/order_push"))
                .header("Content-Type", "application/json")
                .header("X-Channel-Key", channelKey)
                .timeout(java.time.Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() < 200 || res.statusCode() >= 300) {
            throw new IllegalStateException("Odoo direct HTTP " + res.statusCode());
        }
    }

    static Map<String, Object> buildDirectPayload(DonHang donHang) {
        List<Map<String, Object>> items = new ArrayList<>();
        if (donHang.getDanhSachDatCho() != null) {
            for (DatCho d : donHang.getDanhSachDatCho()) {
                String cb = d.getChuyenBay() != null ? String.valueOf(d.getChuyenBay().getMaChuyenBay()) : "?";
                String hv = d.getHangVe() != null ? String.valueOf(d.getHangVe().getMaHangVe()) : "?";
                Map<String, Object> it = new HashMap<>();
                it.put("sku", "FLIGHT-" + cb + "-" + hv);
                it.put("qty", 1);
                it.put("price_vnd", d.getGiaVe() == null ? 0
                        : d.getGiaVe().setScale(0, java.math.RoundingMode.HALF_UP).longValue());
                items.add(it);
            }
        }
        Map<String, Object> customer = new HashMap<>();
        customer.put("name", donHang.getHanhKhachNguoiDat() != null
                ? donHang.getHanhKhachNguoiDat().getHoVaTen() : "");
        customer.put("phone", donHang.getSoDienThoaiNguoiDat());
        customer.put("email", donHang.getEmailNguoiDat());
        Map<String, Object> body = new HashMap<>();
        body.put("channel_code", "airline");
        body.put("external_id", donHang.getPnr());
        body.put("items", items);
        body.put("customer", customer);
        body.put("payment_method", "internal");
        return body;
    }

    private String hmac(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] h = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : h) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
