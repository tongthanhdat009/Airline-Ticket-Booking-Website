<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# db/devdata

## Purpose
Dev-only sample SQL. **Not** on the Flyway migration path (`spring.flyway.locations=classpath:db/migration`), so nothing here is ever executed automatically — not on startup, not in production.

## Key Files
| File | Description |
|------|-------------|
| `V13_Test_data_thongke.sql` | Fake analytics data: ~50 `hoadon`, ~30 `donhang`, ~100 `datcho`, plus seed rows for `sanbay`, `tuyenbay`, `maybay`. Uses `DELIMITER` + stored procedures. |

## For AI Agents

### Working In This Directory
- Apply manually, never via Flyway: `mysql -u root -p datvemaybay < src/main/resources/db/devdata/V13_Test_data_thongke.sql`.
- This file used to live in `db/migration/` as `V13_Test_data_thongke.sql`. Its single underscore did not match Flyway's `V<n>__<desc>.sql` convention, so Flyway **silently skipped** it — it had never run on any database. It was moved here so the intent is explicit instead of accidental.
- It inserts rows tagged `nguoi_lap = 'System'`, `email_nguoidat = 'test@example.com'`, `ghichu = 'Dữ liệu test'`. Never let it reach production.
- Cleanup for its data lives in `../migration/V19__Remove_Test_Data.sql` — but that migration scrubs rows `V18` inserted, not these; use the commented-out DELETE block at the bottom of this file.

### Testing Requirements
- No automated test touches this directory. Verify by running it against a scratch MySQL and checking the row counts the script prints.

### Common Patterns
- Prefix new dev scripts with what they seed (`sample_<topic>.sql`) and add a header stating they are manual-only.
- Keep the `DELIMITER` / `CREATE PROCEDURE` blocks self-contained — they create and drop their own procedures.

## Dependencies

### Internal
- `../migration/` - the Flyway-managed schema this script inserts into; `../../../../java/com/example/j2ee/` - the services that read the seeded rows.

### External
- MySQL 8 (requires `DELIMITER` support for the procedure bodies).

<!-- MANUAL: -->
