<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# util

## Purpose
Static helpers for reading the current caller out of the Spring `SecurityContext`: identity, admin role/permission checks and customer ownership.

## Key Files
| File | Description |
|------|-------------|
| `SecurityUtil.java` | Current authentication, username, admin details, role/permission checks, admin id, customer email, `isSelf`/`isOwnerOf` ownership guards. |

## For AI Agents

### Working In This Directory
- Use `SecurityUtil` instead of reading `SecurityContextHolder` directly; the helpers already distinguish admin from customer principals.
- `getCurrentCustomerEmail()` returns null for admins — customer endpoints must therefore reject admin tokens explicitly.
- Ownership checks for guest bookings: prefer the linked `TaiKhoan.email`, fall back to `HanhKhach.email` (guest booked before registering).
- `isSelf` compares emails case-insensitively after trimming.

### Testing Requirements
- Extend `src/test/java/com/example/j2ee/util/SecurityUtilTest.java` for any new helper or changed comparison.
- Ownership changes must be re-verified in `src/test/java/com/example/j2ee/controller/ClientIdorTest.java`.

### Common Patterns
- All methods are static; the class is not a Spring bean and takes no constructor.
- `hasPermission` mirrors `AdminUserDetails.hasPermission`, including the `FEATURE_MANAGE` shortcut.
- Never leak `getCurrentCustomerEmail()` results to other users — it is the anchor for IDOR checks.

## Dependencies

### Internal
- `../security/AdminUserDetails.java` - admin roles/permissions read by the helpers.
- `../model/HanhKhach.java` - ownership target for `isOwnerOf`.

### External
- Spring Security core - `SecurityContextHolder`, `Authentication`.

<!-- MANUAL: -->
