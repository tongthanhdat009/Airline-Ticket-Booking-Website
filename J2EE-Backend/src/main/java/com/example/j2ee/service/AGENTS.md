<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# service

## Purpose
57 service classes holding the business logic and transaction boundaries. Controllers call these; the repositories do the persistence. Money, bookings, seats and RBAC all live here.

## Key Files
| File | Description |
|------|-------------|
| `BookingService.java` | Creates a booking: passengers, seats, dịch vụ, khuyến mãi and the linked payment row. |
| `ThanhToanThuongService.java` | Internal thanh toán thường: confirms the payment, moves the order to `ĐÃ THANH TOÁN`, creates the hóa đơn and emails the vé PDF. |
| `DonHangService.java` | Order lifecycle: list, detail, status change, cancel, soft delete/restore, `taoHoaDon`. |
| `QuanLyDatChoService.java` | Admin bookings: đổi ghế, đổi chuyến bay, đổi hạng vé with fee calculation, check-in, hủy vé. |
| `DatChoService.java` | Customer bookings: list by hành khách, detail, cancel a booking. |
| `HoaDonService.java` / `HoanTienService.java` | Invoice CRUD, numbering, cancel, restore; refund request, processing, approve and reject. |
| `ThongKeService.java` | Dashboard statistics; the heavy queries are `@Cacheable` on the `thongKe*` caches. |
| `LiveChatService.java` / `AIChatRagService.java` | Chat session and message lifecycle; AI reply suggestions for admins, logged to `ai_suggestion_log`. |
| `EmailService.java` | Sends OTP, welcome, password-reset and ticket emails, including multi-PDF ticket confirmations. |
| `OdooHookService.java` | Fire-and-forget webhook to the Odoo connector on payment, signed with HMAC-SHA256. Skipped entirely when `ODOO_WEBHOOK_SECRET` is blank. |

## For AI Agents

### Working In This Directory
- Business rules live here, never in the controller. Annotate state-changing methods with `@Transactional`.
- Read the current caller with `SecurityUtil`; do not read `SecurityContextHolder` directly.
- Use `@Auditable` on money/booking mutations instead of writing audit rows by hand.

### Testing Requirements
- New service logic needs a JUnit 5 + Mockito test under `src/test/java/com/example/j2ee/service/` — `DonHangServiceTest.java` is the reference.

### Common Patterns
- The remaining services cover auth and RBAC (`DangNhapService`, `DangNhapAdminService`, `DangKyService`, `RefreshTokenService`, `PermissionService`, `PhanQuyenService`, `AdminRoleService`, `MenuService`, `XacThucNguoiDungService`, `XacThucQuanTriService`), reference data (`ChiTietChuyenBayService`, `ChiTietGheService`, `GiaChuyenBayService`, `HangVeService`, `MayBayService`, `SanBayService`, `TuyenBayService`, `VaiTroService`, `DichVuCungCapService`, `GheService`, `KhuyenMaiService`), reporting (`JasperHoaDonService`, `JasperInvoiceService`, `JasperRevenueReportService`, `JasperTicketService`, `ExcelExportService`), and the rest (`AdvisorChatService`, `EmailVerificationService`, `ForgotPasswordService`, `DoiMatKhauService`, `DoiSoatGiaoDichService`, `CheckInService`, `FlightDataService`, `FlightStatusScheduler`, `AuditLogService`, `AuditLogScheduler`, `RateLimitService`, `OAuth2CodeService`, `ThongTinCaNhanService`, `ThongTinChuyenBayService`, `TaiKhoanService`, `TaiKhoanAdminService`, `HanhKhachService`, `BannerService`, `TinTucService`).
- `@Cacheable`/`@CacheEvict` names must exist in `../config/CacheConfig.java`; evict them when the underlying data changes. Errors are thrown as `IllegalArgumentException` (400) or `ResponseStatusException` (403) and mapped in `../exception/GlobalExceptionHandler.java`.

## Dependencies

### Internal
- `../repository/` - all persistence; `../model/` - entities; `../dto/` - payloads; `../annotation/Auditable.java` + `../aspect/` - audit logging; `../util/SecurityUtil.java` - caller, roles and ownership.

### External
- Spring Data JPA / Hibernate - transactions and queries; Spring Mail, JasperReports 6.21.3, Apache POI 5.2.5, Spring AI (OpenRouter), JJWT.

<!-- MANUAL: -->
