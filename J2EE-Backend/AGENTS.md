<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# J2EE-Backend

## Purpose
Spring Boot 3.5.5 / Java 21 REST API: auth (JWT + Google OAuth2), booking, thanh toán thường nội bộ, check-in, live chat + AI (Spring AI/OpenRouter), admin management, JasperReports, audit log. Builds with Maven wrapper.

## Key Files
| File | Description |
|------|-------------|
| `pom.xml` | Deps + build (Java 21, Spring Boot 3.5.5) |
| `mvnw` / `mvnw.cmd` | Maven wrapper, no local install needed |
| `src/main/resources/application.properties` | App config (DB, JWT, CORS, mail, OAuth2) |
| `test_data_simple.sql` | Local manual test data (not Flyway) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/main/java/com/example/j2ee/` | All code by layer (see `src/main/java/com/example/j2ee/AGENTS.md`) |
| `src/main/resources/` | Config, Flyway migrations, Jasper templates (see `src/main/resources/AGENTS.md`) |
| `src/test/` | JUnit 5 + Mockito tests (see `src/test/AGENTS.md`) |
| `uploads/` | Runtime-uploaded service images (gitignored-ish, do not document) |
| `target/` | Build output, never edit |

## For AI Agents

### Working In This Directory
- Layered: Controller → Service → Repository. DTO in/out, never expose entities.
- All API responses wrapped in `ApiResponse<T>` (`success/message/data`).
- Soft delete everywhere: `@SQLDelete` + `@SQLRestriction` on `da_xoa`/`deleted_at`.
- State-changing service methods get `@Transactional`.
- User-facing errors in Vietnamese. Constructor injection, Lombok.
- DB changes = new Flyway migration only, never edit applied `V*__` files.

### Testing Requirements
- `./mvnw test` (H2 in-memory). New service logic → JUnit 5 + Mockito test in `src/test/`.
- Needs MySQL `datvemaybay` + `.env` for `spring-boot:run`.

### Common Patterns
- `@RequirePermission` / `@RequireRole` + `PermissionAspect`; `@Auditable` + `AuditLogAspect`.
- JWT access 5min / refresh 30d with rotation (`jwt/`, `RefreshTokenService`).

## Dependencies

### Internal
- `J2EE-Frontend/src/services/` consumes this API (`VITE_API_BASE_URL`)

### External
- Spring Data JPA, Security, Validation, Mail, Cache/Caffeine, WebSocket STOMP, OAuth2 client; JJWT; Flyway; JasperReports; Apache POI; Spring AI OpenAI + WebFlux; thanh toán thường (`ThanhToanThuongService`)

<!-- MANUAL: -->
