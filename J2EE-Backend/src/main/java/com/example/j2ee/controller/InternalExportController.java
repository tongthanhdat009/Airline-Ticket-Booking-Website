package com.example.j2ee.controller;

import com.example.j2ee.service.OdooExportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Export read-only cho odoo-connector-service (batch reconcile).
 * GET /api/internal/export/donhang?since=...
 * Header: X-Source-Token (thiếu/sai => 401).
 * Response: { "success": true, "message": null, "data": [...], "cursor": "<ISO>" }
 */
@RestController
@RequestMapping("/internal/export")
public class InternalExportController {

    private final OdooExportService exportService;

    @Value("${odoo.export.token:}")
    private String sourceToken;

    public InternalExportController(OdooExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/donhang")
    public ResponseEntity<Map<String, Object>> donHang(
            @RequestHeader(value = "X-Source-Token", required = false) String token,
            @RequestParam(value = "since", required = false) String since) {

        if (!validToken(token)) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success", false);
            body.put("message", "Source token khong hop le");
            body.put("data", null);
            return ResponseEntity.status(401).body(body);
        }

        OdooExportService.ExportResult result = exportService.paidOrders(since);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", null);
        body.put("data", result.data());
        body.put("cursor", result.cursor());
        return ResponseEntity.ok(body);
    }

    /** So sánh constant-time; từ chối khi token phía server chưa cấu hình. */
    private boolean validToken(String provided) {
        if (sourceToken == null || sourceToken.isBlank() || provided == null || provided.isBlank()) {
            return false;
        }
        return MessageDigest.isEqual(sourceToken.getBytes(StandardCharsets.UTF_8), provided.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/hoantien")
    public ResponseEntity<Map<String, Object>> hoanTien(
            @RequestHeader(value = "X-Source-Token", required = false) String token,
            @RequestParam(value = "since", required = false) String since) {

        if (!validToken(token)) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success", false);
            body.put("message", "Source token khong hop le");
            body.put("data", null);
            return ResponseEntity.status(401).body(body);
        }

        OdooExportService.ExportResult result = exportService.refundedOrders(since);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", null);
        body.put("data", result.data());
        body.put("cursor", result.cursor());
        return ResponseEntity.ok(body);
    }
}
