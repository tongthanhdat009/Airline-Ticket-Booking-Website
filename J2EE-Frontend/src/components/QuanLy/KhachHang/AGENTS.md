<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# KhachHang

## Purpose
The customer card used in the admin grid view. It renders one hành khách record with the fields an admin needs at a glance and the row actions.

## Key Files
| File | Description |
|------|-------------|
| `KhachHangCard.jsx` | Memoized card showing `maHanhKhach`, họ tên, email, số điện thoại, giới tính, ngày sinh, CCCD and địa chỉ, with `onView` / `onEdit` / `onDelete` buttons. |

## For AI Agents

### Working In This Directory
- The card is display-only: it destructures the `data` prop and returns `null` when `data` is falsy.
- Actions are callbacks (`onView`, `onEdit`, `onDelete`) — the owning page in `pages/QuanLy/` performs the mutation and confirms it.
- Keep the `PropTypes` shape in sync with the backend `khach_hang` columns when fields are added.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Switch the customer list to card view in `pnpm dev` to verify.

### Common Patterns
- This folder is the grid card for customers; the customer detail tabs live in `../QuanLyKhachHang/` — do not merge them.
- Rendering is skipped for a missing `data` rather than throwing, so the grid can render placeholders.

## Dependencies

### Internal
- `../../../pages/QuanLy/QuanLyKhachHang.jsx` - the page that owns the customer list and passes `data` plus the callbacks.
- `../../common/CardView.jsx` - renders this card inside the responsive grid.

### External
- react-icons - user, mail, phone, gender, birthday, ID card and address icons.
- prop-types - runtime prop validation.

<!-- MANUAL: -->
