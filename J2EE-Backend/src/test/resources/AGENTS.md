<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# resources (test)

## Purpose
Test-only runtime configuration: an H2 in-memory datasource and throwaway JWT settings for the `test` Spring profile.

## Key Files
| File | Description |
|------|-------------|
| `application-test.properties` | H2 datasource (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL`, user `sa`), `spring.flyway.enabled=false`, `spring.jpa.hibernate.ddl-auto=create-drop` + `H2Dialect`, `spring.sql.init.mode=never`, a throwaway `jwt.secret` plus access/refresh expirations, and blank Google OAuth2 client id/secret. |

## For AI Agents

### Working In This Directory
- Activate it with `@ActiveProfiles("test")` — no test does today, so the file is currently inert and every suite runs without Spring.
- Never put a real credential here; `jwt.secret` is a disposable test string and the OAuth2 client id/secret stay empty.
- Flyway is off on purpose: the schema comes from Hibernate `create-drop`, not from `db/migration`.
- `MODE=MySQL` only relaxes dialect syntax — it does not make the MySQL-only migrations runnable.

### Testing Requirements
- `./mvnw test` from `J2EE-Backend/`.
- A new Spring-context integration test must activate this profile explicitly, otherwise it silently picks up the MySQL config from `src/main/resources/application.properties`.

### Common Patterns
- `ddl-auto=create-drop` recreates the schema on every run, so no data survives between tests.
- `DB_CLOSE_DELAY=-1` keeps the in-memory DB alive for the whole JVM run; drop it if a test wants a truly clean DB.
- Add test-only properties here, never in `src/main/resources/application.properties`.

## Dependencies

### Internal
- `src/main/resources/application.properties` - the production config this profile overrides.

### External
- `com.h2database:h2` (test scope) - in-memory datasource; Spring Boot property binding.

<!-- MANUAL: -->
