<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# CaNhan

## Purpose
Tab panels of the customer profile page `../CaNhan.jsx`. All three are pure presentational components: they receive data and callbacks as props and hold no state of their own.

## Key Files
| File | Description |
|------|-------------|
| `ProfileCard.jsx` | Left sidebar: avatar, họ tên, email, OAuth2/verification badges, quick-action buttons (`/quan-ly-chuyen-bay`, `/lich-su-giao-dich`, `/ca-nhan`, `/`) |
| `PersonalInfoTab.jsx` | Edit form for họ tên, giới tính, ngày sinh, email (read-only), số điện thoại |
| `SecurityTab.jsx` | Account info plus change-password form; hidden when the account is OAuth2-only |

## For AI Agents

### Working In This Directory
- Never fetch here — `../CaNhan.jsx` owns `TaiKhoanService` calls, form state and validation; pass new values down as props.
- Keep the `activePage` prop on `ProfileCard` in sync with the current route so the matching quick action is highlighted.
- New tabs must be added in `../CaNhan.jsx` (tab button + render branch), not only here.

### Testing Requirements
- `pnpm lint` from `J2EE-Frontend/`; no unit tests for this tree.
- Manual check: sign in as a customer, open `/ca-nhan`, exercise both tabs and the sidebar links.

### Common Patterns
- Tailwind classes carry the whole style; the only hand-written CSS is in `src/assets/css/`.
- Error/success feedback arrives as the `updateError` / `updateSuccess` / `passwordError` / `passwordSuccess` string props and is rendered inline.
- Colour is the literal `#1E88E5` brand blue here, not a token from `constants/colorPalette.js` — keep local consistency when editing.

## Dependencies

### Internal
- `../CaNhan.jsx` - parent page that owns state and data
- `../../../components/common/` - shared UI used by the parent
- `react-icons/fa` - icons

### External
- react - presentational components only, no router or i18n usage

<!-- MANUAL: -->
