<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# model

## Purpose
42 JPA entities mapped to the MySQL schema. Most tables use soft delete (`da_xoa` + `deleted_at`) via `@SQLDelete` / `@SQLRestriction`; composite-key tables ship an `@Embeddable` id class.

## Key Files
| File | Description |
|------|-------------|
| `DonHang.java` | Order (`pnr`), buyer, contact, `tongGia`, status, bookings and the payment row. |
| `DatCho.java` | One booking line: passenger, flight, seat, hạng vé, giá vé, check-in time, dịch vụ and coupon links. |
| `TrangThaiThanhToan.java` | Payment row: `daThanhToan` flag, method, expiry, amount, transaction code, linked order. |
| `HoaDon.java` | Invoice linked to an order, with VAT totals and the reconciliation fields added in V18. |
| `ChiTietChuyenBay.java` | A flight instance: route, aircraft, departure/arrival date+time, status, delay reason, booked seats, offered dịch vụ. |
| `ChiTietGhe.java` / `GheDaDat.java` | Physical seat of an aircraft (hạng vé, position `CỬA SỔ`/`LỐI ĐI`/`GIỮA`, row, column) and the seat-occupancy link (flight × seat × booking). |
| `HangVe.java` | Ticket class with its theme colours, rank, fares and seats. |
| `TaiKhoan.java` / `TaiKhoanAdmin.java` | Customer account (email, password hash, `oauth2Provider`, linked hành khách) and admin account (login name, roles). |
| `HanhKhach.java` | Passenger profile (name, gender, birth date, country, email, phone, ID, address) with optional account link. |

## For AI Agents

### Working In This Directory
- Soft delete is the default: `@SQLDelete` (UPDATE `da_xoa = 1`) plus `@SQLRestriction("da_xoa = 0")`. Entities without it are hard-deleted.
- Never expose an entity over the API — map it to a DTO in `../dto/`.
- Changing an entity means a new Flyway migration in `src/main/resources/db/migration/`; never edit an applied `V*__` file.

### Testing Requirements
- Mapping changes must still run against H2: `./mvnw test` from `J2EE-Backend/`.

### Common Patterns
- The remaining entities cover the rest of the schema: `SanBay`, `TuyenBay`, `MayBay`, `GiaChuyenBay` (reference data); `DichVuCungCap`, `LuaChonDichVu`, `DichVuChuyenBay`, `DatChoDichVu` (dịch vụ); `KhuyenMai`, `KhuyenMaiDatCho` (coupons); `HoanTien` (refunds); `VaiTro`, `PhanQuyen`, `ChucNang`, `HanhDong`, `AdminVaiTro` (RBAC); `ChatSession`, `ChatMessage`, `AuditLog`, `AISuggestionLog`, `Banner`, `TinTuc`, `RefreshToken`, `EmailVerificationToken`.
- Vietnamese column names (`madonhang`, `pnr`, `tongGia`); ids are `int` with `GenerationType.IDENTITY`.
- Status fields are plain strings, not enums: order `CHỜ THANH TOÁN`/`ĐÃ THANH TOÁN`/`ĐÃ HỦY`, invoice `DA_PHAT_HANH`/`DA_HUY`/`DIEU_CHINH`, reconciliation `PENDING`/`RESOLVED`/`IGNORED`. Deleting a row with a unique natural key renames it (`_deleted_<id>` suffix) so the key can be reused.

## Dependencies

### Internal
- `../repository/` - Spring Data repositories over these entities; `../dto/` - the response shapes they are mapped into.

### External
- Spring Data JPA / Hibernate - `@Entity`, `@SQLDelete`, `@SQLRestriction`, `@Embeddable`; Spring Boot Data Auditing - `createdAt`/`updatedAt`.

<!-- MANUAL: -->
