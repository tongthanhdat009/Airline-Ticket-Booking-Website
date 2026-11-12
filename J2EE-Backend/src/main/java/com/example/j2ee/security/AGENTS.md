<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# security

## Purpose
Database-driven RBAC for the admin panel: the admin principal type, the manager that answers "is this user an admin?", and the legacy voter kept for compatibility.

## Key Files
| File | Description |
|------|-------------|
| `AdminUserDetails.java` | `UserDetails` implementation carrying `TaiKhoanAdmin` + role set + permission set; `hasPermission` also honours `FEATURE_MANAGE`. |
| `DynamicAdminAuthorizationManager.java` | Spring Security 6 `AuthorizationManager` that grants admin URLs when the caller holds any active admin role from the DB. |
| `AdminRoleVoter.java` | Legacy `AccessDecisionVoter` with the same DB-backed role check; superseded by the authorization manager. |

## For AI Agents

### Working In This Directory
- Roles and permissions come from the DB (`vai_tro`, `phan_quyen`), never from a hardcoded enum — add a role via a Flyway seed, not in Java.
- Admin role names are `SUPER_ADMIN`, `QUAN_LY`, `NHAN_VIEN_VE`, `KE_TOAN`, `VAN_HANH`.
- `FEATURE_MANAGE` grants every action of that feature; `hasPermission` splits the string on the last underscore.
- `AdminRoleService.getAllActiveRoleNames()` is cached — call `clearCache()` after changing roles or permissions in the DB.

### Testing Requirements
- RBAC regressions: assert 403 for a role without the permission in `src/test/java/com/example/j2ee/controller/ClientIdorTest.java`.
- Add a unit test under `src/test/java/com/example/j2ee/security/` when changing `hasPermission` semantics.

### Common Patterns
- `ROLE_` prefix is stripped before comparing against DB role names.
- Admin principals are recognised by `instanceof AdminUserDetails`; customer principals fall back to `Authentication.getAuthorities()`.
- Prefer `DynamicAdminAuthorizationManager`; `AdminRoleVoter` exists only because `SecurityConfig` still references the voter pattern.

## Dependencies

### Internal
- `../service/AdminRoleService.java` - cached source of active role names.
- `../service/PermissionService.java` - resolves role and permission strings per admin id.
- `../model/TaiKhoanAdmin.java` - account behind the admin principal.

### External
- Spring Security core - `UserDetails`, `GrantedAuthority`, `AuthorizationManager`.

<!-- MANUAL: -->
