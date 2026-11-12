<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto

## Purpose
Request/response payloads at the API boundary. Feature-specific payloads live in the subpackages below; only shared and cross-feature objects stay at this level. Entities are never returned directly.

## Key Files
| File | Description |
|------|-------------|
| `ApiResponse.java` | Universal envelope: `success`, `message`, `data`; static `success(...)` / `error(...)` factories. |
| `CheckInRequest.java` / `CheckInResponse.java` | Check-in lookup by booking code + passenger name, and the resulting booking info. |
| `AddServiceRequest.java` | Adds a booked dịch vụ lựa chọn to a booking (`maDatCho`, `maLuaChon`, `soLuong`). |
| `SoDoGheDTO.java` | Seat map entry: seat code, row, column, position, hạng vé, booked flag. |
| `ChuyenBayWithSeatsDTO.java` | Flight plus seat counters (`tongSoGhe`, `soGheDaDat`, `soGheTrong`, `conVe`). |
| `ChuyenBayKhachHangDTO.java` | Customer's flight summary with booked dịch vụ and total price. |
| `DichVuDaDatDTO.java` | A booked add-on service: option name, quantity, unit price. |
| `TaiKhoanDTO.java` / `TaiKhoanAdminDTO.java` / `TaiKhoanKhachHangDTO.java` | Account views for customers, admins and the lightweight customer variant. |
| `SuaGiaRequest.java` / `ThemGiaRequest.java` | Fare create/update payloads for a tuyến bay + hạng vé with validity window. |
| `UpdateKhachHangRequest.java` / `UpdateThongTinCaNhanRequest.java` / `DoiMatKhauRequest.java` | Customer profile and password update payloads. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `auth/` | Login, refresh, OTP, password reset payloads (see `auth/AGENTS.md`) |
| `chat/` | Live chat session, message and admin-assignment payloads (see `chat/AGENTS.md`) |
| `datcho/` | Booking creation, search, đổi ghế/chuyến bay payloads (see `datcho/AGENTS.md`) |
| `doi_soat/` | Reconciliation run/detail payloads (see `doi_soat/AGENTS.md`) |
| `donhang/` | Đơn hàng list, status, cancel and batch payloads (see `donhang/AGENTS.md`) |
| `hangve/` | Hạng vé create/update/response payloads (see `hangve/AGENTS.md`) |
| `hoadon/` | Hóa đơn create/update/cancel payloads (see `hoadon/AGENTS.md`) |
| `hoantien/` | Hoàn tiền request, approve/reject payloads (see `hoantien/AGENTS.md`) |
| `khuyenmai/` | Coupon create/update/validate/apply payloads (see `khuyenmai/AGENTS.md`) |
| `maybay/` | Máy bay and seat-layout payloads (see `maybay/AGENTS.md`) |
| `menu/` | Admin menu items, groups and action catalog (see `menu/AGENTS.md`) |
| `phanquyen/` | RBAC feature/action and permission-matrix payloads (see `phanquyen/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Put a new payload in the matching subpackage; keep this level for objects shared by several features.
- Controllers and services exchange DTOs only — never pass a JPA entity across the API boundary.

### Testing Requirements
- Validation constraints on DTOs are exercised through the controller; a failing case must surface as 400 with the field error map.

### Common Patterns
- Money is `BigDecimal`, dates are `LocalDate`/`LocalDateTime`; the `ThongKe*DTO` family (11 files) covers the dashboard statistics endpoints.
- Lombok `@Data`/`@Getter`/`@Setter` with `jakarta.validation` annotations is the house style.

## Dependencies

### Internal
- `../model/` - entities the DTOs are built from; `../exception/GlobalExceptionHandler.java` - maps DTO validation failures to 400.

### External
- Jackson - JSON binding (`../serializer/CustomLocalTimeDeserializer.java` handles `LocalTime`); Jakarta Validation - constraints.

<!-- MANUAL: -->
