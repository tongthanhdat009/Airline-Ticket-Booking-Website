<!-- Parent: ../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# j2ee (backend test root)

## Purpose
Root of the backend test tree. Mirrors the `src/main/java/com/example/j2ee` package layout so each test sits next to the package it covers. JUnit 5 + Mockito only — no Spring context is booted.

## Key Files
| File | Description |
|------|-------------|
| `J2EeBackendApplicationTests.java` | Context-load smoke test, currently `@Disabled` — it needs a real MySQL connection and the MySQL-specific `AuditLogRepository` queries. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `controller/` | Controller + template tests (see `controller/AGENTS.md`) |
| `exception/` | Global error-mapping tests (see `exception/AGENTS.md`) |
| `scheduler/` | Scheduler unit tests (see `scheduler/AGENTS.md`) |
| `service/` | Service unit tests (see `service/AGENTS.md`) |
| `util/` | Security helper tests (see `util/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New test goes in the package mirroring the class under test: `src/main/java/com/example/j2ee/service/X.java` → `src/test/java/com/example/j2ee/service/XTest.java`.
- Tests are plain JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`); do not add `@SpringBootTest`.
- There is no `@ActiveProfiles` anywhere, so `src/test/resources/application-test.properties` is not loaded by the current suite.

### Testing Requirements
- Run `./mvnw test` from `J2EE-Backend/`; a test that needs a real context belongs to an integration profile, not here — the existing context test stays `@Disabled`.

### Common Patterns
- `SecurityContextHolder` state leaks between tests — clear it in `@AfterEach` (see `controller/ClientIdorTest.java`, `util/SecurityUtilTest.java`).
- Assert the HTTP status *and* the `ApiResponse` body for controller and exception tests; Vietnamese message assertions are exact-match (`assertTrue(msg.contains("..."))`).

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/` - the code under test; `src/test/resources/application-test.properties` - H2/test profile config.

### External
- `spring-boot-starter-test` (JUnit 5 + Mockito + AssertJ on the classpath) and `com.h2database:h2` — both `test` scope.

<!-- MANUAL: -->
