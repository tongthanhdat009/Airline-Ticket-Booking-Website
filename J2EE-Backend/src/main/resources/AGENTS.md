<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# resources

## Purpose
Backend config + versioned schema + report templates. Flyway auto-runs `db/migration/` on startup.

## Key Files
| File | Description |
|------|-------------|
| `application.properties` | Reads `.env` via dotenv-java (DB, JWT, CORS, mail, OAuth2). Never commit secrets. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `db/migration/` | Flyway `V1__`–`V26__`: schema, seed, seat maps, chat + AI tables, seed repair, VNPay/support removal (see `db/migration/AGENTS.md`) |
| `db/devdata/` | Dev-only sample SQL, outside the Flyway path — applied by hand (see `db/devdata/AGENTS.md`) |
| `jasper/` | 4 `.jrxml` templates: `audit_log`, `invoice`, `revenue`, `ticket` (see `jasper/AGENTS.md`) |
| `static/` | Served service images (`AnhDichVuCungCap/`, `AnhLuaChonDichVu/`) (see `static/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Schema change = new `V{next}__` file. Never edit applied migrations; V22 pattern for seed repair.
- Filename needs a double underscore (`V27__Name.sql`). Anything else is skipped by Flyway without an error — that is how `V13_Test_data_thongke.sql` stayed inert for so long; it now lives in `db/devdata/`.
- Jasper template change → check the matching `Jasper*Service` in `service/`; parameter and field names are a contract with the Java side.
- `V19__Remove_Test_Data` scrubbed the test/demo rows from `hoadon`, `donhang`, `hanhkhach` — don't resurrect them.
- Secrets live in `.env` only. `application.properties` holds `${ENV:default}` placeholders — no literal keys.

### Testing Requirements
- Migration changes need a real MySQL run (`./mvnw spring-boot:run` against `datvemaybay`); the unit-test suite does not boot Flyway.
- Jasper template changes are covered by `InvoiceReportTemplateTest` — extend it for new templates.

### Common Patterns
- `server.servlet.context-path=/api` and `spring.jpa.hibernate.ddl-auto=validate` live here — Flyway owns DDL, Hibernate never creates it.
- `static/` mirrors the runtime upload dirs (`AnhDichVuCungCap/`, `AnhLuaChonDichVu/`); new upload categories need both.

## Dependencies

### Internal
- `../../java/com/example/j2ee/` - entities, services and controllers that read this config and these assets.

### External
- dotenv-java 3.0.0 - loads `.env`; Flyway 11.7.2 - schema versioning; JasperReports 6.21.3 - report templates.

<!-- MANUAL: -->
