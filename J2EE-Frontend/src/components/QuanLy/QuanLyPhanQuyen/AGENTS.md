<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyPhanQuyen

## Purpose
The admin card for a vai trò (role) and its permission set — the phân quyền screen. Each card summarises what a role is allowed to do.

## Key Files
| File | Description |
|------|-------------|
| `PhanQuyenCard.jsx` | Memoized card showing the role name, description and the granted permissions (feature/action pairs) with `onView` / `onEdit` actions. |

## For AI Agents

### Working In This Directory
- Permission strings are `feature + "_" + action` (e.g. `FLIGHT_VIEW`) and must match the `chuc_nang.ma_code` / `hanh_dong.ma_hanh_dong` seeded in the backend.
- The card is display-only — the page owns the permission editor and the save call.
- `SUPER_ADMIN` bypasses the permission check server-side, so a super-admin card may show no explicit grants.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Open the phân quyền screen and edit a role's permissions in `pnpm dev`.

### Common Patterns
- Permission code format is shared with `../../common/RBACProtectedRoute.jsx` — change one, check the other.
- The permission list is long: the card summarises it rather than listing every grant in full.

## Dependencies

### Internal
- `../../../services/PhanQuyenService.jsx` - role and permission CRUD.
- `../../../services/VaiTroService.jsx` - role records.
- `../../../pages/QuanLy/QuanLyPhanQuyen.jsx` - the page that owns the role list.
- `../../common/RBACProtectedRoute.jsx` - consumes the same permission strings at runtime.

### External
- react-icons - key, shield, lock and list icons.
- prop-types - runtime prop validation.

<!-- MANUAL: -->
