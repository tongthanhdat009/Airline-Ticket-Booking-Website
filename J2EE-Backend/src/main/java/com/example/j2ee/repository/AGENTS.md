<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# repository

## Purpose
35 Spring Data JPA repositories, one per entity. Derived query methods handle the common lookups; `@Query` is used for reporting and for the native soft-delete queries.

## Key Files
| File | Description |
|------|-------------|
| `DonHangRepository.java` | Order by PNR, by customer email/phone, and by buyer; also `JpaSpecificationExecutor` for the admin filters. |
| `DatChoRepository.java` | Bookings per order/passenger, name search, and the deleted-row helpers. |
| `TrangThaiThanhToanRepository.java` | Payment rows by paid flag plus soft-delete helpers. |
| `HoaDonRepository.java` | Invoice by number/order/status and date ranges; also `JpaSpecificationExecutor`. |
| `ChiTietChuyenBayRepository.java` | Flight search by route+date, free-seat lookup, duplicate flight-number check and aircraft schedule-conflict check. |
| `ChiTietGheRepository.java` / `GheDaDatRepository.java` | Seats per aircraft and per hạng vé (with a per-class seat count), and seat occupancy per flight/booking with the active-occupancy check used when booking. |
| `KhuyenMaiRepository.java` | Coupon by code, the pessimistic-lock lookup `findByMaKMWithLock`, and the active/quota checks. |
| `TaiKhoanRepository.java` | Customer account lookup by email, plus native deleted/restore/hard-delete helpers. |
| `PhanQuyenRepository.java` | Permission rows per vai trò / chức năng; delete-by-role and delete-by-feature used when reassigning. |

## For AI Agents

### Working In This Directory
- Keep query methods in the repository; controllers and services must not contain JPQL or SQL.
- Soft-deleted rows are invisible to derived queries (`@SQLRestriction`) — use the native `findAllIncludingDeleted` / `findDeletedById` / `restoreById` helpers when the admin UI needs them.
- `findByMaKMWithLock` is the only locked read; use it when mutating coupon usage to avoid overselling.
- `DonHangRepository` and `HoaDonRepository` implement `JpaSpecificationExecutor` — the admin filters build on it, so don't replace it with plain derived methods.

### Testing Requirements
- Repository changes run against H2 via `./mvnw test`; native MySQL-only queries need a MySQL check before merging.

### Common Patterns
- The other repositories follow the same shape: `TaiKhoanAdminRepository`, `HanhKhachRepository`, `AdminVaiTroRepository`, `VaiTroRepository`, `ChucNangRepository`, `HanhDongRepository` (identity + RBAC); `SanBayRepository`, `TuyenBayRepository`, `MayBayRepository`, `HangVeRepository`, `GiaChuyenBayRepository` (reference data); `DichVuCungCapRepository`, `LuaChonDichVuRepository`, `DichVuChuyenBayRepository`, `DatChoDichVuRepository` (dịch vụ); `HoanTienRepository`, `AuditLogRepository`, `ChatSessionRepository`, `ChatMessageRepository`, `AISuggestionLogRepository`, `BannerRepository`, `TinTucRepository`, `RefreshTokenRepository`, `EmailVerificationTokenRepository`.
- Native `@Query(value = ..., nativeQuery = true)` for soft-delete/restore/hard-delete and reporting aggregations; composite-key repositories extend `JpaRepository<Entity, IdClass>`.

## Dependencies

### Internal
- `../model/` - the entities these repositories query.

### External
- Spring Data JPA - `JpaRepository`, `JpaSpecificationExecutor`, `@Query`.

<!-- MANUAL: -->
