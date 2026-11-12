<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# J2EE-Backend

## Purpose
Spring Boot 3.5.5 / Java 21 REST API: auth (JWT + Google OAuth2), booking, thanh toán thường nội bộ, check-in, live chat + AI advisor (Spring AI / OpenRouter), admin management, JasperReports, audit log. Builds with Maven wrapper. Serves under context path `/api`.

## Key Files
| File | Description |
|------|-------------|
| `pom.xml` | Deps + build (Java 21, Spring Boot 3.5.5, Spring AI BOM 1.0.0) |
| `mvnw` / `mvnw.cmd` | Maven wrapper, no local install needed |
| `.mvn/wrapper/maven-wrapper.properties` | Wrapper Maven version |
| `src/main/resources/application.properties` | App config, all secrets as `${ENV:default}` placeholders |
| `.env.example` | Env template — copy to `.env` (dotenv-java loads it) |
| `test_data_simple.sql` | Local manual test data (not Flyway) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/main/java/com/example/j2ee/` | All code by layer (see `src/main/java/com/example/j2ee/AGENTS.md`) |
| `src/main/resources/` | Config, Flyway migrations, Jasper templates, static uploads (see `src/main/resources/AGENTS.md`) |
| `src/test/` | JUnit 5 + Mockito tests (see `src/test/AGENTS.md`) |
| `uploads/` | Runtime-uploaded service images (`UPLOAD_DIR`). Gitignored |
| `target/` | Build output, never edit or document |

## For AI Agents

### Working In This Directory
- Layered: Controller → Service → Repository. DTO in/out, never expose entities.
- All API responses wrapped in `ApiResponse<T>` (`success/message/data`).
- Soft delete everywhere: `@SQLDelete` + `@SQLRestriction` on `da_xoa`/`deleted_at`.
- State-changing service methods get `@Transactional`.
- User-facing errors in Vietnamese. Constructor injection, Lombok.
- DB changes = new Flyway migration only, never edit applied `V*__` files.
- `spring.jpa.hibernate.ddl-auto=validate` — Hibernate never creates schema. Flyway owns DDL.
- `server.servlet.context-path=/api` — controllers are mapped without the `/api` prefix; STOMP endpoint is `/api/ws`.

### Testing Requirements
- `./mvnw test` — plain JUnit 5 + Mockito, no Spring context. New service logic → test in `src/test/` mirroring the package.
- `J2EeBackendApplicationTests.java` is `@Disabled` (needs real MySQL). `src/test/resources/application-test.properties` is inert — no `@ActiveProfiles("test")` anywhere. H2 is on the classpath but unused.
- Needs MySQL `datvemaybay` + `.env` for `spring-boot:run`.

### Common Patterns
- `@RequirePermission` / `@RequireRole` + `PermissionAspect`; `@Auditable` + `AuditLogAspect`.
- JWT access 5 min / refresh 30 d with rotation (`jwt/`, `RefreshTokenService`); expiry comes from `JWT_ACCESS_EXPIRATION` / `JWT_REFRESH_EXPIRATION` (defaults 300000 / 2592000000).
- Mail vars are `EMAIL_SMTP_HOST` / `EMAIL_SMTP_PORT` / `EMAIL_USERNAME` / `EMAIL_PASSWORD` / `EMAIL_FROM` — `.env.example` matches them.
- Advisor LLM defaults to a local gateway (`ADVISOR_BASE_URL`, default `http://localhost:20128/v1`) — unreachable in prod unless overridden.
- AI suggestions use `ai.suggestion.trigger-on=customer-message-only` and a 20-message context window.
- The Odoo webhook secret (`ODOO_WEBHOOK_SECRET`) has no default: blank ⇒ `OdooHookService` skips the webhook instead of signing with a known key.

## Dependencies

### Internal
- `J2EE-Frontend/src/services/` consumes this API (`VITE_API_BASE_URL` + `/api` context path)
- `src/main/resources/db/migration/` = schema source of truth; `src/main/resources/jasper/` = report templates used by the `Jasper*Service` classes

### External
- Spring Data JPA, Spring Security, Spring Validation, Spring Mail, Spring Cache/Caffeine, Spring WebSocket (STOMP), Spring OAuth2 Client, Spring AI (OpenAI-compatible client + WebFlux); JJWT 0.11.5; Flyway; MySQL Connector/J; JasperReports 6.21.3; Apache POI 5.2.5; dotenv-java 3.0.0; H2 (test)

<!-- MANUAL: -->
