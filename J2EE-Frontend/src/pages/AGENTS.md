<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# pages

## Purpose
Route-level pages. `KhachHang/` = customer site, `QuanLy/` = admin console. Pages are thin compositions of `components/` + `services/` + hooks.

## Key Files
| File | Description |
|------|-------------|
| `KhachHang/DatVe/` | Booking flow: `ChonChuyenBay/` (step 0) → `NhapThongTin.jsx` (step 1) → `ChonDichVu.jsx` (step 2) → `ThanhToan.jsx` (step 3) |
| `QuanLy/DoiSoatGiaoDich.jsx` | Admin reconciliation page (top level — there is no `QuanLyChat.jsx`; chat is a customer widget) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `KhachHang/` | Customer flow: `TrangChu`, `DatVe/` (4-step booking incl. `ChonChuyenBay/`), `DangNhap`, `DangKy`, `QuenMatKhau`, `VerifyEmail`, `HoanThienThongTin`, `CaNhan/` + `CaNhan.jsx`, `QuanLyChuyenBay`, `OnlineCheckIn`, `TraCuuChuyenBay`, `DichVuChuyenBay`, `DichVuKhac`, `LichSuGiaoDich`, `PaymentResult` (see `KhachHang/AGENTS.md`) |
| `KhachHang/CaNhan/` | Profile tab panels (see `KhachHang/CaNhan/AGENTS.md`) |
| `KhachHang/DatVe/` | Booking steps: chọn chuyến bay → hành khách → dịch vụ → thanh toán (see `KhachHang/DatVe/AGENTS.md`) |
| `KhachHang/DatVe/ChonChuyenBay/` | Outbound / return flight selection (see `KhachHang/DatVe/ChonChuyenBay/AGENTS.md`) |
| `QuanLy/` | 24 admin routes: `TrangChuAdmin`, `QuanLy{ChuyenBay,DatCho,DonHang,HoaDon,HoanTien,KhachHang,KhuyenMai,MayBay,SanBay,TuyenBay,HangVe,GiaBay,DichVu,BannerTinTuc,LichSuThaoTac,PhanQuyen,VaiTro,TKAdmin}`, `DoiSoatGiaoDich`, `ThongKeDoanhThu`, `XuatBaoCao`, `ChinhSuaSoDoGhe`, `DangNhap` (see `QuanLy/AGENTS.md`) |
| `QuanLy/ChuyenBay/` | `ThemChuyenBay` / `SuaChuyenBay` forms (see `QuanLy/ChuyenBay/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Page = thin composition of `components/` + `services/` + hooks. No raw axios, no business logic inline.
- Customer booking changes must preserve the 4-step order in `DatVe/` and the `BookingStepper` indices (0 chuyến bay, 1 hành khách, 2 dịch vụ, 3 thanh toán).
- Payment step uses thanh toán thường nội bộ + coupon via `KhuyenMaiClientService`.
- Admin page → add to menu data (`data/adminMenuData.js` fallback + backend menu API) or it's unreachable.

### Testing Requirements
- No unit-test infra. Verify via `pnpm lint` + `pnpm build`, then click through the route in `pnpm dev` against the backend on 8080.

### Common Patterns
- Customer and admin routes live in separate trees; the guard differs (`ProtectedRoute` vs `AdminProtectedRoute`).
- Admin list pages share a common skeleton — follow an existing page rather than inventing a new layout.

## Dependencies

### Internal
- `../components/` — UI building blocks; `../services/` — API calls; `../hooks/` — auth/permission/toast state; `../data/adminMenuData.js` — admin menu fallback.

### External
- react-router-dom 7, antd 5, recharts, react-i18next.

<!-- MANUAL: -->
