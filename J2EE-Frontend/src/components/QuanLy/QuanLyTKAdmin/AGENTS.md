<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyTKAdmin

## Purpose
Admin widgets for tài khoản admin (staff accounts): the account card in the grid view, the create/edit form and the role-assignment modal.

## Key Files
| File | Description |
|------|-------------|
| `TaiKhoanAdminCard.jsx` | Memoized card showing the username, full name, email and assigned roles, with `onView` / `onEdit` / `onDelete` and `onAssignRoles` actions. |
| `AccountForm.jsx` | Create/edit form (`tenDangNhap`, `hoVaTen`, `email`, `matKhauBang`, `vaiTro[]`) with email and password field validation. |
| `RoleAssignmentModal.jsx` | Assigns vai trò to an account; multi-select over the `roles` list, seeded from `account.vaiTro`. |

## For AI Agents

### Working In This Directory
- Roles are a list of `maVaiTro` values — `vaiTro` is an array in `AccountForm` and in the card payload.
- `RoleAssignmentModal` re-seeds its selection from the `account` prop whenever the account changes; keep that effect or a stale selection is submitted.
- Admin credentials here are separate from customer accounts (`TaiKhoanService` vs `ClientAuthService`) — do not cross the two.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Create an admin account and assign it a role in `pnpm dev`.

### Common Patterns
- The password field is only meaningful when creating; it is optional when editing an existing account.
- Both the card and the modals use the same `roles` prop shape — the page loads it once and passes it down.

## Dependencies

### Internal
- `../../../services/QLTaiKhoanAdminServices.jsx` - admin account CRUD.
- `../../../services/VaiTroService.jsx` - role list for the assignment modal.
- `../../../pages/QuanLy/QuanLyTKAdmin.jsx` - the page that owns accounts, roles and mutations.

### External
- react-icons / react-icons `fa6` - user and shield icons.
- prop-types - runtime prop validation on `TaiKhoanAdminCard`.

<!-- MANUAL: -->
