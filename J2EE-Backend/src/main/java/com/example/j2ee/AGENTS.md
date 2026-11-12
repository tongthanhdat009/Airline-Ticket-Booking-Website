<!-- Parent: ../../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# j2ee (backend code root)

## Purpose
All backend code, `com.example.j2ee`. 15 top-level packages + 12 feature subpackages under `dto/` + the Spring Boot entrypoint. Flow: `controller/` → `service/` → `repository/` → MySQL; `dto/` at boundaries, `model/` JPA entities.

## Key Files
| File | Description |
|------|-------------|
| `J2EeBackendApplication.java` | Spring Boot entrypoint |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `annotation/` | `@Auditable`, `@RequirePermission`, `@RequireRole` markers (see `annotation/AGENTS.md`) |
| `aspect/` | `PermissionAspect`, `AuditLogAspect` — the AOP that enforces those markers (see `aspect/AGENTS.md`) |
| `config/` | Security chain, CORS, WebSocket/STOMP, OAuth2 handlers, Caffeine cache, Flyway (see `config/AGENTS.md`) |
| `controller/` | 51 REST controllers; `Client*` = customer API, `QuanLy*` = admin API (see `controller/AGENTS.md`) |
| `dto/` | Request/response payloads, grouped per feature in subpackages (see `dto/AGENTS.md`) |
| `dto/auth/` | Login, refresh, OTP and password-reset payloads (see `dto/auth/AGENTS.md`) |
| `dto/chat/` | Live chat session and message payloads (see `dto/chat/AGENTS.md`) |
| `dto/datcho/` | Booking creation, search and đổi ghế/chuyến bay payloads (see `dto/datcho/AGENTS.md`) |
| `dto/doi_soat/` | Transaction reconciliation payloads (see `dto/doi_soat/AGENTS.md`) |
| `dto/donhang/` | Đơn hàng list, status, cancel and batch payloads (see `dto/donhang/AGENTS.md`) |
| `dto/hangve/` | Hạng vé CRUD payloads (see `dto/hangve/AGENTS.md`) |
| `dto/hoadon/` | Hóa đơn create/update/cancel payloads (see `dto/hoadon/AGENTS.md`) |
| `dto/hoantien/` | Hoàn tiền request, approve and reject payloads (see `dto/hoantien/AGENTS.md`) |
| `dto/khuyenmai/` | Coupon CRUD, validate and apply payloads (see `dto/khuyenmai/AGENTS.md`) |
| `dto/maybay/` | Máy bay and seat-layout payloads (see `dto/maybay/AGENTS.md`) |
| `dto/menu/` | Admin dynamic menu payloads (see `dto/menu/AGENTS.md`) |
| `dto/phanquyen/` | RBAC feature/action and permission-matrix payloads (see `dto/phanquyen/AGENTS.md`) |
| `exception/` | `GlobalExceptionHandler` (single file, all error mapping here) (see `exception/AGENTS.md`) |
| `jwt/` | `JwtFilter` + `JwtUtil` (access/refresh, rotation) (see `jwt/AGENTS.md`) |
| `model/` | 42 JPA entities, soft-delete via `@SQLDelete`/`@SQLRestriction` (see `model/AGENTS.md`) |
| `repository/` | 35 Spring Data JPA repos, one per entity (see `repository/AGENTS.md`) |
| `scheduler/` | Payment expiry, flight auto-generation, chat idle timeout, reconciliation (see `scheduler/AGENTS.md`) |
| `security/` | `DynamicAdminAuthorizationManager`, `AdminRoleVoter`, `AdminUserDetails` (DB-driven RBAC) (see `security/AGENTS.md`) |
| `serializer/` | `CustomLocalTimeDeserializer` (see `serializer/AGENTS.md`) |
| `service/` | 57 services, business logic + `@Transactional` boundaries (see `service/AGENTS.md`) |
| `util/` | `SecurityUtil` (current user, roles, client IP) (see `util/AGENTS.md`) |
| `validation/` | `@ValidDateRange` + `DateRangeValidator` (see `validation/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New endpoint: DTO in `dto/<feature>/` → controller → service → repo. Reuse existing DTOs/utils before adding.
- Admin endpoints: `@RequirePermission` (checked by `PermissionAspect` + `DynamicAdminAuthorizationManager`), not ad-hoc role checks.
- Audited entities: add `@Auditable`, don't hand-write audit rows.
- Vietnamese user messages; `ApiResponse<T>` wrapper; never return entities.
- Reuse `SecurityUtil` (current user/roles, client IP) — don't reimplement.

### Testing Requirements
- Mirror package under `src/test/`; JUnit 5 + Mockito, H2. Run `./mvnw test` from `J2EE-Backend/`.

### Common Patterns
- PNR order code on `donhang`; guest customers allowed (unique constraints removed, V8).
- Reconciliation fields on `hoadon` (V18); `vnpay_transaction_log` dropped in V24; TRANSACTION_LOG menu dropped in V25.
- Thanh toán is internal "thanh toán thường" (staff/customer confirmed, no external gateway); VNPay was added then dropped.

## Dependencies

### Internal
- `resources/db/migration/` for schema; `resources/jasper/` for report templates used by `Jasper*Service`.

### External
- Spring Boot 3.5.5 / Java 21, Spring Data JPA, Spring Security, JJWT, Flyway, JasperReports, Apache POI, Spring AI (OpenRouter).

<!-- MANUAL: -->
