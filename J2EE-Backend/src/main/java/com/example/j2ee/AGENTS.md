<!-- Parent: ../../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# j2ee (backend code root)

## Purpose
All backend code, `com.example.j2ee`. 16 single-purpose packages + Spring Boot entrypoint. Flow: `controller/` → `service/` → `repository/` → MySQL; `dto/` at boundaries, `model/` JPA entities.

## Key Files
| File | Description |
|------|-------------|
| `J2EeBackendApplication.java` | Spring Boot entrypoint |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `controller/` | 50+ REST controllers; `Client*` = customer API, `QuanLy*` = admin API |
| `service/` | 50+ services, business logic + `@Transactional` boundaries |
| `repository/` | 35 Spring Data JPA repos, one per entity |
| `model/` | 40+ JPA entities, soft-delete via `@SQLDelete`/`@SQLRestriction` |
| `dto/` | Request/response DTOs grouped by feature (`auth/`, `datcho/`, `hoadon/`, `payment/`, …) |
| `config/` | Security, WebSocket, OAuth2, Cache, Flyway, OpenRouter |
| `security/` | `DynamicAdminAuthorizationManager`, `AdminRoleVoter`, `AdminUserDetails` (DB-driven RBAC) |
| `jwt/` | `JwtFilter` + `JwtUtil` (access/refresh, rotation) |
| `scheduler/` | `PaymentExpiryScheduler`, `FlightAutoGenerationScheduler`, `ReconciliationScheduler`, `ChatIdleTimeoutScheduler` |
| `aspect/` + `annotation/` | `@RequirePermission`→`PermissionAspect`, `@Auditable`→`AuditLogAspect` |
| `exception/` | `GlobalExceptionHandler` (single file, all error mapping here) |
| `util/` | `SecurityUtil` (current user, roles, client IP) |
| `validation/` | `@ValidDateRange` + `DateRangeValidator` |
| `serializer/` | `CustomLocalTimeDeserializer` |

## For AI Agents

### Working In This Directory
- New endpoint: DTO in `dto/<feature>/` → controller → service → repo. Reuse existing DTOs/utils before adding.
- Admin endpoints: `@RequirePermission` (checked by `PermissionAspect` + `DynamicAdminAuthorizationManager`), not ad-hoc role checks.
- Audited entities: add `@Auditable`, don't hand-write audit rows.
- Vietnamese user messages; `ApiResponse<T>` wrapper; never return entities.
- Reuse `SecurityUtil` (current user/roles) (current user/roles, client IP) — don't reimplement.

### Testing Requirements
- Mirror package under `src/test/`; JUnit 5 + Mockito, H2. Run `./mvnw test` from `J2EE-Backend/`.

### Common Patterns
- PNR order code on `donhang`; guest customers allowed (unique constraints removed, V8).
- Reconciliation fields on `hoadon` (V18); `vnpay_transaction_log` dropped in V24; TRANSACTION_LOG menu dropped in V25.

## Dependencies
- `resources/db/migration/` for schema; `resources/jasper/` for report templates used by `Jasper*Service`.

<!-- MANUAL: -->
