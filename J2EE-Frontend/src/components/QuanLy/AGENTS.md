<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLy

## Purpose
Admin feature area: one subdirectory per management screen (chuyến bay, đặt chỗ, hóa đơn, hoàn tiền, thống kê…), plus the shared card and hạng vé widgets that sit at this level. Each screen page in `pages/QuanLy/` owns the data and passes it down.

## Key Files
| File | Description |
|------|-------------|
| `CardChucNang.jsx` | Default export `Card` — white rounded panel with a title bar and blue accent bar, used to group widgets on admin pages. |
| `HangVeModal.jsx` | Editor modal for a hạng vé theme: colour presets, per-field Tailwind arbitrary values (`mauNen`, `mauVien`, `mauChu`, `mauHeader`…) and hex ⇄ Tailwind conversion. |
| `HangVeDetailModal.jsx` | Read-only preview of a hạng vé rendered with inline styles via `twToCss` / `twGradientToCss`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `KhachHang/` | Customer card for the admin grid (see `KhachHang/AGENTS.md`) |
| `QuanLyChuyenBay/` | Flight cards + cancel/delay/edit/service modals (see `QuanLyChuyenBay/AGENTS.md`) |
| `QuanLyDatCho/` | Booking cards + check-in, seat-change, flight-change, refund modals (see `QuanLyDatCho/AGENTS.md`) |
| `QuanLyDichVu/` | Service cards + service and option modals (see `QuanLyDichVu/AGENTS.md`) |
| `QuanLyDoiSoat/` | Reconciliation note form (see `QuanLyDoiSoat/AGENTS.md`) |
| `QuanLyDonHang/` | Order cards + detail, filter, cancel, refund modals (see `QuanLyDonHang/AGENTS.md`) |
| `QuanLyGiaBay/` | Route pricing cards + price detail modal (see `QuanLyGiaBay/AGENTS.md`) |
| `QuanLyHangVe/` | Fare-class cards (see `QuanLyHangVe/AGENTS.md`) |
| `QuanLyHoaDon/` | Invoice cards + detail modal (see `QuanLyHoaDon/AGENTS.md`) |
| `QuanLyHoanTien/` | Refund cards + detail modal (see `QuanLyHoanTien/AGENTS.md`) |
| `QuanLyKhachHang/` | Customer detail tabs: profile, account, flights (see `QuanLyKhachHang/AGENTS.md`) |
| `QuanLyKhuyenMai/` | Promotion cards + promotion modal (see `QuanLyKhuyenMai/AGENTS.md`) |
| `QuanLyLichSuThaoTac/` | Audit-log cards (see `QuanLyLichSuThaoTac/AGENTS.md`) |
| `QuanLyMayBay/` | Aircraft cards, modal and seat-layout editor/viewer (see `QuanLyMayBay/AGENTS.md`) |
| `QuanLyPhanQuyen/` | Permission cards per role (see `QuanLyPhanQuyen/AGENTS.md`) |
| `QuanLySanBay/` | Airport cards + airport modal (see `QuanLySanBay/AGENTS.md`) |
| `QuanLyThanhToan/` | Payment detail modal (see `QuanLyThanhToan/AGENTS.md`) |
| `QuanLyTKAdmin/` | Admin account card, account form, role assignment (see `QuanLyTKAdmin/AGENTS.md`) |
| `QuanLyTuyenBay/` | Route cards + route modal (see `QuanLyTuyenBay/AGENTS.md`) |
| `QuanLyVaiTro/` | Role cards (see `QuanLyVaiTro/AGENTS.md`) |
| `ThongKe/` | Recharts wrappers and stat cards (see `ThongKe/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- One folder per admin screen — put new UI for a screen in that screen's folder, not at this level.
- Cards are `React.memo` components that receive a `data` object plus `onView` / `onEdit` / `onDelete` callbacks; the page owns fetching and mutations.
- Guard new admin pages with `PermissionProtectedRoute` from `../common/` and read permissions through `hooks/usePermission`.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Check each screen in `pnpm dev` against the backend on port 8080 with an admin account.

### Common Patterns
- `KhachHang/` here and `QuanLyKhachHang/` both exist and serve different screens — the former is a grid card, the latter the detail tabs. Check which one the page imports before editing.
- Modals in this tree return `null` when closed rather than unmounting their children; keep that guard so state resets predictably.
- Three folders ship an `index.js` barrel (`QuanLyDatCho/`, `QuanLyHoaDon/`, `QuanLyHoanTien/`) — import from the barrel there, direct paths elsewhere.

## Dependencies

### Internal
- `../../services/` - per-feature API modules (`QL*Service.jsx`, `*Api.jsx`).
- `../../utils/tailwindColorUtils.js` - Tailwind ⇄ hex/gradient conversion for hạng vé theming.
- `../common/` - `Toast`, `ConfirmDialog`, `ResponsiveTable`, `CardView`, `ViewToggleButton`, `PermissionProtectedRoute`.
- `../../constants/aircraftConfig.js`, `../../pages/QuanLy/` - seat config and the route pages rendering this tree.

### External
- react-icons - card and modal iconography.
- antd - `message` toasts in the hạng vé editor.
- recharts - charts under `ThongKe/`.
- prop-types - runtime prop validation on the `*Card` components.

<!-- MANUAL: -->
