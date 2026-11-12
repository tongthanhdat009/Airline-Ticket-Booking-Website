<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# controller

## Purpose
51 REST endpoints for the whole system: customer-facing APIs (`Client*`, `/checkin`, `/sanbay`, `/hangve`) and admin APIs (`QuanLy*`, `/admin/dashboard/**`). Every response is an `ApiResponse<T>`.

## Key Files
| File | Description |
|------|-------------|
| `SanBayController.java` | Public flight search: airports, route+date lookup, seat map, giá vé, dịch vụ per flight. |
| `ClientDatChoController.java` | Customer bookings: create (anonymous allowed), search by code+name, detail, cancel. |
| `ClientThanhToanController.java` | Customer payment history and xác nhận thanh toán thường (anonymous allowed with confirm token). |
| `DangNhapController.java` | Customer login, refresh, current-user, logout (single and all devices). |
| `DangNhapAdminController.java` | Admin login, refresh, current-user, logout, under `/admin`. |
| `LiveChatController.java` | Customer chat (`/chat/*`) and admin chat management (`/chat/admin/*`). |
| `QuanLyDonHangController.java` | Admin đơn hàng: filters, PNR lookup, status/cancel, restore, batch approve/refund. |
| `QuanLyDatChoController.java` | Admin bookings: đổi ghế, đổi chuyến bay, check-in, hủy vé, fee calculation. |
| `QuanLyHoaDonController.java` | Admin hóa đơn: CRUD, cancel, restore, numbering, statistics, PDF and Excel export. |
| `ThongKeController.java` | Dashboard statistics: revenue, bookings, cancellation rate, conversion funnel, PDF export. |

## For AI Agents

### Working In This Directory
- One controller per feature area; call a service, never a repository, and return `ApiResponse<T>`.
- Admin endpoints carry `@RequirePermission(feature, action)` or `@RequireRole`; the aspect enforces them, so do not hand-roll role checks.
- Ownership-sensitive customer endpoints must verify the caller with `SecurityUtil.getCurrentCustomerEmail()` / `isOwnerOf` before touching data; public customer write endpoints (create booking, xác nhận thanh toán) rely on a one-time confirm token or proof-of-knowledge instead.

### Testing Requirements
- Security-sensitive endpoints: extend `src/test/java/com/example/j2ee/controller/ClientIdorTest.java` rather than adding a new harness.

### Common Patterns
- The remaining controllers follow the same split: `Client*` (dịch vụ, invoice, khuyến mãi), `QuanLy*` (chuyến bay, máy bay, sơ đồ ghế, hạng vé, hành khách, hoàn tiền, phân quyền, vai trò, tài khoản admin, giá, tuyến bay, sân bay, tin tức/banner), plus `AuthController`, `OAuth2Controller`, `CheckInController`, `AdvisorChatController`, `AIChatController`, `AuditLogController`, `ThanhToanController`, `DoiSoatGiaoDichController`, `MenuController`.
- Vietnamese messages; errors are thrown as `IllegalArgumentException` or `ResponseStatusException` and mapped centrally in `../exception/GlobalExceptionHandler.java`. Bulk operations use dedicated batch endpoints (`/batch/approve`, `/batch/refund`) rather than looping from the frontend.

## Dependencies

### Internal
- `../service/` - all business logic; `../dto/` - payloads; `../annotation/` - `@RequirePermission`/`@RequireRole`; `../util/SecurityUtil.java` - caller and ownership checks.

### External
- Spring MVC (`@RestController`, mapping annotations) - HTTP layer; Jakarta Validation (`@Valid`) - request body validation.

<!-- MANUAL: -->
