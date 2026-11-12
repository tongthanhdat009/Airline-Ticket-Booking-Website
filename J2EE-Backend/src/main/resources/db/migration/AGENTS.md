<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# migration

## Purpose
Versioned Flyway SQL migrations. Flyway runs `classpath:db/migration` on startup and records applied versions in `flyway_schema_history`.

## Key Files
| File | Description |
|------|-------------|
| `V1__Initial_Schema.sql` | Creates every base table + constraints (sân bay, tuyến bay, máy bay, chuyến bay, hạng vé, hành khách, đặt chỗ, đơn hàng, hóa đơn, dịch vụ cung cấp). |
| `V2__Initial_Data.sql` | Seeds admin accounts, vai trò, phân quyền, menu `chuc_nang`, airports, máy bay, hạng vé, dịch vụ cung cấp (`anh` = `1.svg`..`5.svg`) and lựa chọn dịch vụ (`1.jpg`..`8.jpg`). |
| `V3__Sample_January_2026_Data.sql` | Sample đơn hàng + thanh toán for Jan 2026 so thống kê has rows in the current period. |
| `V18__Add_Reconciliation_Fields_To_HoaDon.sql` | Adds đối soát columns (`trangthai_doisoat`, `ghi_chu_doisoat`, ...) to `hoadon` through a stored procedure. |
| `V20__Create_Live_Chat_Tables.sql`, `V21__Create_AI_Suggestion_Log.sql` | Create `chat_session` + `chat_message` for live chat and `ai_suggestion_log` (session id, admin, số tin nhắn, thời gian ms). |
| `V23__Normalize_Blank_HanhKhach_Identifiers.sql` | Turns blank `madinhdanh`/`email`/`sodienthoai`/`diachi` into NULL so MySQL UNIQUE stops raising duplicate-key 500s. |
| `V24__Drop_VNPay_Transaction_Log.sql`, `V25__Remove_VNPay_Admin_Feature.sql` | Drop `vnpay_transaction_log` (thanh toán moved to the internal flow) then delete the orphaned `TRANSACTION_LOG` menu + permissions. |
| `V26__Remove_Support_Chat_Admin_Feature.sql` | Deletes the orphaned `SUPPORT` admin menu + permissions (chat moved to the AI advisor widget). |

## For AI Agents

### Working In This Directory
- Schema change = new `V{next}__Name.sql`. Never edit an applied migration — `spring.flyway.validate-on-migrate=false`, so a bad edit corrupts state silently.
- Next free version is `V27` and `spring.flyway.out-of-order=false`, so the new file must sort after every applied version.
- Use a double underscore `V27__Name.sql`. A file that does not match is skipped by Flyway as an invalid resource name, **without an error** — `V13_Test_data_thongke.sql` stayed invisible this way and now lives in `../devdata/`.
- Seed repair = idempotent `UPDATE` in a new version (see `V22__Repair_Seed_Data_D1_D2_D3.sql`); never re-edit V2.

### Testing Requirements
- Migrations are MySQL-only and `src/test/resources/application-test.properties` sets `spring.flyway.enabled=false`, so `./mvnw test` never exercises them — verify by booting against a scratch MySQL DB and reading `flyway_schema_history`.

### Common Patterns
- MySQL dialect only (stored procedure for `ADD COLUMN`, `DELIMITER`); H2 cannot run these files. Lowercase Vietnamese table/column names without diacritics (`hanhkhach`, `donhang`, `madinhdanh`).
- `hanhkhach` identifier columns are nullable since V23 — do not reintroduce NOT NULL on `madinhdanh`/`email`.

## Dependencies

### Internal
- `../application.properties` - Flyway locations, baseline and validation flags.

### External
- Flyway 11.7.2 (`flyway-core` + `flyway-mysql`) - versioned migration runner; MySQL 8 - target dialect.

<!-- MANUAL: -->
