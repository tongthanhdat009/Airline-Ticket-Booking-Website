<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# resources

## Purpose
Backend config + versioned schema + report templates. Flyway auto-runs `db/migration/` on startup.

## Key Files
| File | Description |
|------|-------------|
| `application.properties` | Reads `.env` (DB, JWT, CORS, mail, VNPay, OAuth2). Never commit secrets. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `db/migration/` | Flyway `V1__`–`V22__` (schema, seed, seat maps, chat tables, AI log, V22 seed repair) |
| `jasper/` | 4 `.jrxml` templates: `audit_log`, `invoice`, `revenue`, `ticket` |
| `static/` | Served service images (`AnhDichVuCungCap/`, `AnhLuaChonDichVu/`) |

## For AI Agents
- Schema change = new `V{next}__` file. Never edit applied migrations; V22 pattern for seed repair.
- `V13_Test_data_thongke` + `V19__Remove_Test_Data`: test data added then removed — don't resurrect.
- Jasper template change → check matching `Jasper*Service` in `service/`.

<!-- MANUAL: -->
