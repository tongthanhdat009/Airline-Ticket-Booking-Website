<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# components

## Purpose
React UI components grouped by area. `common/` shared; rest feature-scoped.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `common/` | Shared: `Navbar`, `Footer`, `Toast`, `ProtectedRoute`/`RBACProtectedRoute`, `RequireCompleteProfile`, `ChatWindow`, `LiveChatWidget`, `ResponsiveTable`, `ConfirmDialog`, `ErrorBoundary`, misc |
| `Admin/` | Admin shell: `Header`, `Sidebar`, `PermissionProtectedRoute` |
| `Auth/` | Login/register layout + forms (`AuthLayout`, `LoginForm`, `RegisterForm`, `BannerContent`) |
| `KhachHang/` | Customer booking UI (`Booking/`, `FlightCard/`) |
| `QuanLy/` | 20+ admin management blocks, one dir per screen (`QuanLyDatCho`, `QuanLyDonHang`, `QuanLyGiaBay`, `QuanLyMayBay/SeatGrid`, `ThongKe`, …) |
<!-- 2026-10-18: legacy `TaiKhoan/SignInForm|SignUpForm` + scratch `src/testAPI.jsx` deleted (unreferenced) -->

## For AI Agents
- New shared widget → `common/`; feature-only → its area dir. Check `common/` + `QuanLy/` first, duplication is the common failure here.
- Admin block: guard with `PermissionProtectedRoute`, permissions via `usePermission`, data via `services/`.
- `QuanLyMayBay/SeatGrid` owns seat-map rendering; reuse for any seat UI.

<!-- MANUAL: -->
