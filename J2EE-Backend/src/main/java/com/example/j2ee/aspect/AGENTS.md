<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# aspect

## Purpose
Spring AOP advisors that implement the cross-cutting policies declared in `../annotation/`: authorization checks on admin endpoints and automatic audit-log writes around business methods.

## Key Files
| File | Description |
|------|-------------|
| `PermissionAspect.java` | `@Before` advice for `@RequirePermission` and `@RequireRole`; throws `ResponseStatusException` (403) on failure. |
| `AuditLogAspect.java` | `@Around` advice for `@Auditable`; serializes args/result and persists an `AuditLog` row before rethrowing any exception. |

## For AI Agents

### Working In This Directory
- Both aspects are `@Component` + `@Aspect`; they only activate through the Spring proxy, so annotated methods must be called from another bean.
- Permission lookups prefer `AdminUserDetails` (admin token carries roles/permissions) and fall back to `Authentication.getAuthorities()` for plain users.
- `AuditLogAspect` swallows its own save failures (logs and continues) — a broken audit table must not break the business call.
- The business method's exception is logged, the audit row is still written, then the exception is rethrown unchanged.

### Testing Requirements
- Extend `src/test/java/com/example/j2ee/exception/GlobalExceptionHandlerTest.java` if you change the exception type thrown for a denied call (403 mapping lives there).
- Add an aspect unit test under `src/test/java/com/example/j2ee/aspect/` for new advice logic.

### Common Patterns
- Denied checks use `ResponseStatusException(FORBIDDEN, ...)`; `GlobalExceptionHandler` sanitises the 403 message so internal permission names never reach the client.
- The `SUPER_ADMIN` bypass is only in `checkPermission`, not in `checkRole`.
- `AuditLogAspect` reads the client IP from `X-FORWARDED-FOR`, falling back to `request.getRemoteAddr()`.

## Dependencies

### Internal
- `../annotation/` - `@RequirePermission`, `@RequireRole`, `@Auditable` definitions bound by these aspects.
- `../security/AdminUserDetails.java` - holds admin roles and permission strings.
- `../repository/AuditLogRepository.java` - persists audit rows.

### External
- Spring AOP (`@Aspect`, `@Around`, `@Before`) - advice weaving.
- Jackson `ObjectMapper` - serializes method args and results to JSON for the audit trail.

<!-- MANUAL: -->
