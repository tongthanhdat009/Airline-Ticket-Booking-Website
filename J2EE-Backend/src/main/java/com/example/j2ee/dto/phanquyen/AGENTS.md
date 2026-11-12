<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/phanquyen

## Purpose
Payloads for the RBAC admin screens: the feature catalog, the action catalog, permission updates per vai trò, and the resolved permission matrix.

## Key Files
| File | Description |
|------|-------------|
| `ChucNangDTO.java` | Feature row: `maChucNang`, `maCode`, `tenChucNang`, `nhom`. |
| `HanhDongDTO.java` | Action row: `maHanhDong` and its description. |
| `PhanQuyenRequest.java` | Permission update for one vai trò: `maVaiTro` plus a list of `{maChucNang, maHanhDong}` items. |
| `PhanQuyenResponse.java` | Permission view for one vai trò: role info, `isSuperAdmin` flag, per-permission detail and `totalPermissions`. |

## For AI Agents

### Working In This Directory
- A permission is the pair (feature, action); the effective string is `maCode + "_" + maHanhDong`, which is exactly what `AdminUserDetails.hasPermission` parses.
- The `SUPER_ADMIN` vai trò is read-only in the admin UI — the response flags it with `isSuperAdmin` so the frontend can disable editing.
- `maHanhDong` is a string code (e.g. `VIEW`, `CREATE`, `APPROVE`), not a number.

### Testing Requirements
- Permission matrix changes must keep `PermissionAspect` in sync — assert 403 for a removed permission in `src/test/java/com/example/j2ee/controller/ClientIdorTest.java`.
- Cover the SUPER_ADMIN protection path.

### Common Patterns
- `PhanQuyenResponse` nests `VaiTroInfo` and `PermissionDetail`; both carry the feature code and action description so the matrix can be rendered directly.
- `PhanQuyenService` owns the writes; this package only describes the shape.

## Dependencies

### Internal
- `../../service/PhanQuyenService.java` - reads and writes the permission matrix.
- `../../service/PermissionService.java` - resolves the permission strings of an admin.

### External
- Jakarta Validation - constraints on the update request.

<!-- MANUAL: -->
