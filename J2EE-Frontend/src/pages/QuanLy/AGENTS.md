<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLy

## Purpose
Admin console: 24 routes under `/admin/dashboard/*`. `TrangChuAdmin.jsx` is the shell (sidebar + permission-driven menu + `<Outlet/>`); every other page is a CRUD or reporting screen behind `AdminProtectedRoute`.

## Key Files
| File | Description |
|------|-------------|
| `TrangChuAdmin.jsx` | Admin shell: `AdminSidebarProvider`, collapsible sidebar, menu grouped by `getMenuItemsGroupedByPermissions`, renders `<Outlet/>` |
| `DangNhap.jsx` | Admin login (username/password via `loginAdmin`), lands on `/admin/dashboard/ThongKe` |
| `ThongKeDoanhThu.jsx` | Revenue dashboard: Recharts line/pie/bar plus `StatCard`, heatmap and funnel charts |
| `XuatBaoCao.jsx` | Report export page (doanh thu, hành khách, chuyến bay …) with Excel/PDF options |
| `QuanLyChuyenBay.jsx` | Chuyến bay list: create/update, delay, cancel, soft-delete + restore, dịch vụ attach |
| `QuanLyTuyenBay.jsx` | Tuyến bay CRUD (origin/destination pair) |
| `QuanLyMayBay.jsx` | Máy bay CRUD plus seat-layout viewer |
| `ChinhSuaSoDoGhe.jsx` | Seat-map editor for one máy bay (`/admin/dashboard/MayBay/:maMayBay/ghe`): add/edit/delete/bulk/auto-generate seats |
| `QuanLySanBay.jsx` | Sân bay CRUD and active/inactive toggle |
| `QuanLyHangVe.jsx` | Hạng vé CRUD with soft-delete and restore |
| `QuanLyGiaBay.jsx` | Giá vé matrix per tuyến bay and hạng vé |
| `QuanLyDichVu.jsx` | Dịch vụ + dịch vụ option CRUD (image, price) |
| `QuanLyKhuyenMai.jsx` | Khuyến mãi CRUD (code, type, discount value) |
| `QuanLyKhachHang.jsx` | Hành khách list, create, delete |
| `QuanLyDatCho.jsx` | Đặt chỗ management with live check-in updates over WebSocket |
| `QuanLyDonHang.jsx` | Đơn hàng list with detail, filter, huỷ đơn hàng and hoàn tiền modals |
| `QuanLyHoaDon.jsx` | Hóa đơn list and invoice detail modal |
| `QuanLyHoanTien.jsx` | Hoàn tiền (refund) request queue and detail modal |
| `DoiSoatGiaoDich.jsx` | Đối soát giao dịch: reconcile payments per period, attach notes, export `.xlsx` |
| `QuanLyLichSuThaoTac.jsx` | Audit log (lịch sử thao tác) list and `.xlsx` export |
| `QuanLyBannerTinTuc.jsx` | Tin tức management (news-only; crawl RSS + LLM rewrite/dedup via "Crawl ngay", scheduler `TinTucCrawlScheduler` backend). Banner tab removed |
| `QuanLyTKAdmin.jsx` | Admin accounts: CRUD plus role assignment |
| `QuanLyVaiTro.jsx` | Vai trò CRUD (`services/VaiTroService.jsx`) |
| `QuanLyPhanQuyen.jsx` | Phân quyền: per-role feature/action permission matrix |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ChuyenBay/` | Standalone add/edit flight forms (see `ChuyenBay/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Every list page follows the same skeleton: `Card` + `ViewToggleButton` + `useViewToggle` for table/card view, `ResponsiveTable`, `CardView`, `Toast`, `ConfirmDialog`. Copy the shape of an existing page instead of inventing a new one.
- A new admin page is unreachable until it is registered in `src/App.jsx` AND in `src/data/adminMenuData.js` (backend menu API overrides the fallback).
- API calls go through `services/` (`QL*Service.jsx`, `hoaDonApi`, `donHangApi`, `hoanTienApi`, `doiSoatGiaoDichApi`, `ThongKeService`); no raw `axios` in a page. Admin auth uses the `admin_access_token` cookie, refresh token in `localStorage` (`services/apiClient.jsx`).

### Testing Requirements
- `pnpm lint` from `J2EE-Frontend/`; no unit tests exist for this tree.
- Manual: sign in at `/dang-nhap-admin` and walk the affected routes; check the sidebar entry still appears for your role.

### Common Patterns
- Column widths and Tailwind classes are inlined per page; `src/assets/css/TrangChuAdmin.css` is the only hand-written CSS. Destructive actions go through `ConfirmDialog`.
- Excel exports are server-generated blobs downloaded via `URL.createObjectURL` (`DoiSoatGiaoDich.jsx`, `QuanLyLichSuThaoTac.jsx`) — the `xlsx` package is not used client-side.

## Dependencies

### Internal
- `../../components/QuanLy/` - per-feature modals and cards (`CardChucNang`, `QuanLyChuyenBay/`, `QuanLyMayBay/SeatGrid/`, `ThongKe/`)
- `../../components/common/` - `Toast`, `ConfirmDialog`, `CardView`, `ResponsiveTable`, `ViewToggleButton`; `../../services/` - admin API modules over `apiClient.jsx`; `../../data/adminMenuData.js` - fallback permission-filtered sidebar menu

### External
- recharts - charts in `ThongKeDoanhThu.jsx`
- react-router-dom - `Outlet`, `useParams`, `useNavigate`
- react-icons - icon set

<!-- MANUAL: -->
