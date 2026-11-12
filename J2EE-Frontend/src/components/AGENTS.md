<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# components

## Purpose
React UI components grouped by area. `common/` is shared between the customer site and the admin console; every other folder is feature-scoped.

## Key Files
| File | Description |
|------|-------------|
| `Admin/` | Admin console chrome: header, sidebar, permission guard (dormant — no page imports it) |
| `Auth/` | Login and registration screens for the customer site |
| `common/` | Shared widgets, route guards, toasts and layout helpers |
| `KhachHang/` | Customer booking UI: search, dates, seat panel, payment summary |
| `QuanLy/` | Admin feature area, one folder per management screen |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `common/` | Shared chrome, route guards, toasts and layout helpers (see `common/AGENTS.md`) |
| `Admin/` | Dormant admin header, sidebar and permission guard (see `Admin/AGENTS.md`) |
| `Auth/` | Login/register layout, banner column and forms (see `Auth/AGENTS.md`) |
| `KhachHang/` | Customer booking UI: search form, date strip, seat panel, payment summary (see `KhachHang/AGENTS.md`) |
| `KhachHang/Booking/` | Booking-step widgets: stepper, discount code, passenger services, price breakdown (see `KhachHang/Booking/AGENTS.md`) |
| `KhachHang/FlightCard/` | Collapsible flight result card with fare-class prices (see `KhachHang/FlightCard/AGENTS.md`) |
| `QuanLy/` | Admin feature area: shared cards and the hạng vé theme editor (see `QuanLy/AGENTS.md`) |
| `QuanLy/KhachHang/` | Customer card for the admin grid (see `QuanLy/KhachHang/AGENTS.md`) |
| `QuanLy/QuanLyChuyenBay/` | Flight cards and cancel/delay/edit/service modals (see `QuanLy/QuanLyChuyenBay/AGENTS.md`) |
| `QuanLy/QuanLyDatCho/` | Booking cards and check-in, seat, flight-change, refund modals (see `QuanLy/QuanLyDatCho/AGENTS.md`) |
| `QuanLy/QuanLyDichVu/` | Service cards, service modal and option modals (see `QuanLy/QuanLyDichVu/AGENTS.md`) |
| `QuanLy/QuanLyDoiSoat/` | Reconciliation note form (see `QuanLy/QuanLyDoiSoat/AGENTS.md`) |
| `QuanLy/QuanLyDonHang/` | Order cards and detail, filter, cancel, refund modals (see `QuanLy/QuanLyDonHang/AGENTS.md`) |
| `QuanLy/QuanLyGiaBay/` | Route pricing card and price detail modal (see `QuanLy/QuanLyGiaBay/AGENTS.md`) |
| `QuanLy/QuanLyHangVe/` | Fare-class card (see `QuanLy/QuanLyHangVe/AGENTS.md`) |
| `QuanLy/QuanLyHoaDon/` | Invoice card, detail modal and `index.js` barrel (see `QuanLy/QuanLyHoaDon/AGENTS.md`) |
| `QuanLy/QuanLyHoanTien/` | Refund card, detail modal and `index.js` barrel (see `QuanLy/QuanLyHoanTien/AGENTS.md`) |
| `QuanLy/QuanLyKhachHang/` | Customer detail tabs: profile, account, flight history (see `QuanLy/QuanLyKhachHang/AGENTS.md`) |
| `QuanLy/QuanLyKhuyenMai/` | Promotion card and promotion modal (see `QuanLy/QuanLyKhuyenMai/AGENTS.md`) |
| `QuanLy/QuanLyLichSuThaoTac/` | Audit-log card (see `QuanLy/QuanLyLichSuThaoTac/AGENTS.md`) |
| `QuanLy/QuanLyMayBay/` | Aircraft card, modal and seat-layout editor/viewer (see `QuanLy/QuanLyMayBay/AGENTS.md`) |
| `QuanLy/QuanLyMayBay/SeatGrid/` | Seat grid, legend, statistics and seat modals (see `QuanLy/QuanLyMayBay/SeatGrid/AGENTS.md`) |
| `QuanLy/QuanLyPhanQuyen/` | Permission card per role (see `QuanLy/QuanLyPhanQuyen/AGENTS.md`) |
| `QuanLy/QuanLySanBay/` | Airport card and airport modal (see `QuanLy/QuanLySanBay/AGENTS.md`) |
| `QuanLy/QuanLyThanhToan/` | Payment detail modal (see `QuanLy/QuanLyThanhToan/AGENTS.md`) |
| `QuanLy/QuanLyTKAdmin/` | Admin account card, account form and role assignment (see `QuanLy/QuanLyTKAdmin/AGENTS.md`) |
| `QuanLy/QuanLyTuyenBay/` | Route card and route modal (see `QuanLy/QuanLyTuyenBay/AGENTS.md`) |
| `QuanLy/QuanLyVaiTro/` | Role card (see `QuanLy/QuanLyVaiTro/AGENTS.md`) |
| `QuanLy/ThongKe/` | Chart and stat widgets for thống kê (see `QuanLy/ThongKe/AGENTS.md`) |
<!-- 2026-10-18: legacy `TaiKhoan/SignInForm|SignUpForm` + scratch `src/testAPI.jsx` deleted (unreferenced) -->

## For AI Agents

### Working In This Directory
- New shared widget → `common/`; feature-only UI → its area folder. Duplication between `common/` and `QuanLy/` is the common failure here.
- Admin screens: guard with `PermissionProtectedRoute` from `common/`, read permissions through `hooks/usePermission`, fetch through `services/`.
- `QuanLyMayBay/SeatGrid` owns seat-map rendering; reuse it for any seat UI instead of writing a new grid.
- `QuanLy/KhachHang/` and `QuanLy/QuanLyKhachHang/` are different screens — the first is a grid card, the second the detail tabs.

### Testing Requirements
- `pnpm lint` must pass. No unit tests in the frontend; verify visually with `pnpm dev` against the backend on port 8080.

### Common Patterns
- Add i18n keys to both `src/i18n/locales/en/` and `src/i18n/locales/vi/`; Vietnamese is the primary locale.
- Never call `axios` directly — go through `src/services/` on top of `apiClient.jsx`.

## Dependencies

### Internal
- `../services/` - API modules every component fetches through.
- `../hooks/` - `usePermission`, `useToast`, `useViewToggle` and friends.
- `../utils/` - cookie, permission, profile and Tailwind-colour helpers.
- `../config/api.config.js` - base URL and asset/image URL builders.
- `../i18n/locales/{en,vi}/` - translations for both locales.

### External
- react, react-router-dom, react-i18next - rendering, routing and copy.
- antd + @ant-design/icons, react-icons - UI kits used across the tree.
- tailwindcss - all styling.
- recharts, framer-motion, react-datepicker - charts, animation and date input.
- lucide-react - imported by `Admin/` but not installed (see `Admin/AGENTS.md`).

<!-- MANUAL: -->
