<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyVaiTro

## Purpose
The admin card for a vai trò (role) — the role list screen, distinct from the phân quyền screen which edits what each role may do.

## Key Files
| File | Description |
|------|-------------|
| `VaiTroCard.jsx` | Memoized card showing the role name, code, description and user count, with `onView` / `onEdit` / `onDelete` actions. |

## For AI Agents

### Working In This Directory
- A single file in this folder; the permission editor for the same role lives in `../QuanLyPhanQuyen/`.
- The card is display-only — the page owns the mutation.
- Role codes are compared literally by the backend (`SUPER_ADMIN`, `QUAN_LY`, `NHAN_VIEN_VE`, `KE_TOAN`, `VAN_HANH`) — do not translate them.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Open the vai trò list in card view in `pnpm dev`.

### Common Patterns
- `SUPER_ADMIN` bypasses the permission check on the server, so deleting or renaming it changes how every admin route behaves.
- The role list is the source for `RoleAssignmentModal` in `../QuanLyTKAdmin/`.

## Dependencies

### Internal
- `../../../services/VaiTroService.jsx` - role CRUD.
- `../../../pages/QuanLy/QuanLyVaiTro.jsx` - the page that owns the role list.

### External
- react-icons - shield, user and status icons.
- prop-types - runtime prop validation.

<!-- MANUAL: -->
