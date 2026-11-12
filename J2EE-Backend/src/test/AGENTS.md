<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# src/test

## Purpose
Backend unit tests, JUnit 5 + Mockito. Plain unit tests — no Spring context, no H2 (the context test is `@Disabled`).

## Key Files
| File | Description |
|------|-------------|
| `java/com/example/j2ee/J2EeBackendApplicationTests.java` | Context-load smoke test, currently `@Disabled` (needs MySQL + the MySQL-specific `AuditLogRepository` queries) |
| `java/com/example/j2ee/service/DonHangServiceTest.java` | Đơn hàng service unit tests (reference example) |
| `java/com/example/j2ee/service/ForgotPasswordServiceTest.java` | Quên mật khẩu OTP: send cooldown, 5-attempt lockout, OTP burnt by reset |
| `java/com/example/j2ee/service/OAuth2CodeServiceTest.java` | One-time OAuth2 code create/consume |
| `java/com/example/j2ee/service/RateLimitServiceTest.java` | Login rate limiter: limit, per-key isolation, `clear()` |
| `java/com/example/j2ee/controller/ClientIdorTest.java` | Customer API auth/IDOR checks (D-9/D-10) |
| `java/com/example/j2ee/controller/DuplicateMessageTest.java` | Duplicate-key message mapping in `ClientDatChoController` |
| `java/com/example/j2ee/controller/InvoiceReportTemplateTest.java` | Fills and exports `jasper/invoice_report.jrxml` (D-11) |
| `java/com/example/j2ee/exception/GlobalExceptionHandlerTest.java` | Error mapping and no-leak checks (D-6/D-8/D-15) |
| `java/com/example/j2ee/scheduler/FlightAutoGenerationSchedulerTest.java` | Weekly flight-template generation, duplicate/conflict skips (P0-4) |
| `java/com/example/j2ee/util/SecurityUtilTest.java` | Ownership helper tests (D-9/D-10) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `java/` | Test sources mirroring the `src/main` package tree (see `java/com/example/j2ee/AGENTS.md`) |
| `resources/` | `application-test.properties` — **inert**: no test uses `@ActiveProfiles("test")` (see `resources/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New service logic → add/extend a test mirroring the `src/main` package. Run `./mvnw test` from `J2EE-Backend/`.
- Security-sensitive controller change → extend `ClientIdorTest`, don't add a new harness.
- Plain JUnit 5 + Mockito; no `@SpringBootTest` outside the disabled context test.
- Clear `SecurityContextHolder` in `@AfterEach` when a test fakes an authenticated principal.

### Testing Requirements
- `./mvnw test` from `J2EE-Backend/` — the CI gate.
- H2 is on the classpath but **unused**: there is no `@ActiveProfiles("test")` anywhere, so `application-test.properties` is never loaded. Don't assume an in-memory DB is available.

### Common Patterns
- `@ExtendWith(MockitoExtension.class)` + `@Mock` / `@InjectMocks`; schedulers are constructed by hand with a mocked repository rather than injected.
- A test that needs a real Spring context belongs to an integration profile, not here — the existing context test stays `@Disabled`.

## Dependencies

### Internal
- `../main/java/com/example/j2ee/` - the code under test; `resources/application-test.properties` - test profile config.

### External
- `spring-boot-starter-test` (JUnit 5 + Mockito) and `com.h2database:h2`, both `test` scope.

<!-- MANUAL: -->
