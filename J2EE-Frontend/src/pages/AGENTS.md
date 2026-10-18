<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# pages

## Purpose
Route-level pages. `KhachHang/` = customer site, `QuanLy/` = admin console.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `KhachHang/` | Customer flow: `TrangChu`, `DatVe/` (6-step booking incl. `ChonChuyenBay/`), `DangNhap`, `DangKy`, `QuenMatKhau`, `VerifyEmail`, `HoanThienThongTin`, `CaNhan/` + `CaNhan.jsx`, `QuanLyChuyenBay`, `OnlineCheckIn`, `TraCuuChuyenBay`, `DichVuChuyenBay`, `DichVuKhac`, `LichSuGiaoDich`, `PaymentResult` |
| `KhachHang/DatVe/` | Booking steps (flight select → services → passengers → payment → result) |
| `KhachHang/CaNhan/` | Profile sub-pages |
| `QuanLy/` | 25+ admin screens: `TrangChuAdmin`, `QuanLy{ChuyenBay,DatCho,DonHang,HoaDon,HoanTien,KhachHang,KhuyenMai,MayBay,SanBay,TuyenBay,HangVe,GiaBay,DichVu,DoiSoatGiaoDich,Chat,BannerTinTuc,LichSuThaoTac,PhanQuyen,VaiTro,TKAdmin}`, `ThongKeDoanhThu`, `XuatBaoCao`, `ChinhSuaSoDoGhe`, `DangNhap` |
| `QuanLy/ChuyenBay/` | `ThemChuyenBay` / `SuaChuyenBay` forms |

## For AI Agents
- Page = thin composition of `components/` + `services/` + hooks. No raw axios, no business logic inline.
- Customer booking changes must preserve the 6-step order in `DatVe/`; payment step uses thanh toán thường nội bộ + coupon via `KhuyenMaiClientService`.
- Admin page → add to menu data (`data/adminMenuData.js` fallback + backend menu API) or it's unreachable.

<!-- MANUAL: -->
