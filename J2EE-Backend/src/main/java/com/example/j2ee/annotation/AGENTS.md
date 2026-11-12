<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# annotation

## Purpose
Runtime marker annotations consumed by the AOP layer. They gate admin endpoints (`@RequirePermission`, `@RequireRole`) and trigger automatic audit-log writes (`@Auditable`) without adding logic to controller or service code.

## Key Files
| File | Description |
|------|-------------|
| `Auditable.java` | Method marker for auto audit logging: `action`, `table`, `paramName` (holds the record id), `description`, `accountType`. |
| `RequirePermission.java` | Requires one `FEATURE_ACTION` permission (e.g. `FLIGHT_VIEW`); `SUPER_ADMIN` bypasses the check. |
| `RequireRole.java` | Requires at least one admin role: `SUPER_ADMIN`, `QUAN_LY`, `NHAN_VIEN_VE`, `KE_TOAN`, `VAN_HANH`. |

## For AI Agents

### Working In This Directory
- Adding or renaming an attribute means editing the matching aspect in `../aspect/` in the same change — the aspect binds attributes by name.
- Permission strings are built as `feature + "_" + action`; they must match `chuc_nang.ma_code` + `hanh_dong.ma_hanh_dong` seeded in the DB.
- Put `@RequirePermission`/`@RequireRole` on controller methods (or the class); the aspect intercepts via `@within` and `@annotation`.
- Put `@Auditable` on public service methods only — self-invocation inside the same bean bypasses the Spring proxy, so no audit row is written.

### Testing Requirements
- Cover new attributes with a unit test under `src/test/java/com/example/j2ee/aspect/` if you add or rename them.
- A permission change is a behaviour change: assert 403 vs 200 for a non-owner role in `src/test/java/com/example/j2ee/controller/ClientIdorTest.java`.

### Common Patterns
- `@RequirePermission`/`@RequireRole` target METHOD and TYPE; `@Auditable` is METHOD-only, RUNTIME retention.
- The `SUPER_ADMIN` bypass exists only in the permission path; `@RequireRole` compares role names literally.
- `AuditLogAspect` resolves the record id from the parameter named `paramName` (default `id`), falling back to the first numeric argument.

## Dependencies

### Internal
- `../aspect/` - `PermissionAspect` and `AuditLogAspect` bind these annotations.
- `../model/AuditLog.java` - target table written by `AuditLogAspect`.

### External
- `org.springframework.stereotype` / Spring AOP - annotation types consumed via `@Aspect` advice binding.

<!-- MANUAL: -->
