<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# KhachHang

## Purpose
Customer-facing site: home, auth, booking lookup, online check-in, booking management, transaction history. Every route is registered in `src/App.jsx` and reads the customer session from `utils/cookieUtils`.

## Key Files
| File | Description |
|------|-------------|
| `TrangChu.jsx` | Home: hero carousel, `TimChuyenBayForm` search widget, FAQ, advisor chat widget |
| `DangNhap.jsx` | Customer login (`AuthLayout` + `LoginForm`), Google OAuth redirect |
| `DangKy.jsx` | Customer registration; triggers the verification email |
| `QuenMatKhau.jsx` | Forgot password: email → 6-digit OTP → new password |
| `VerifyEmail.jsx` | Consumes `?token=` from the verification mail, then redirects |
| `HoanThienThongTin.jsx` | Profile completion (họ tên, SĐT, ngày sinh, quốc gia) required before booking |
| `CaNhan.jsx` | Profile page: `ProfileCard` sidebar + personal-info / security tabs |
| `TraCuuChuyenBay.jsx` | Guest booking lookup by mã đặt chỗ + tên hành khách |
| `OnlineCheckIn.jsx` | Online check-in lookup and seat assignment |
| `QuanLyChuyenBay.jsx` | "Chuyến bay của tôi": bookings, filters, live WebSocket updates |
| `LichSuGiaoDich.jsx` | Payment history, invoice detail modal, PDF download |
| `PaymentResult.jsx` | Landing page after thanh toán thường; parses `?success=&maThanhToan=` |
| `DichVuChuyenBay.jsx` | Add-on services (hành lý, suất ăn…) for an existing booking code |
| `DichVuKhac.jsx` | Static grid of other services (hotel, taxi, tour…); links are placeholders |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `CaNhan/` | Profile tab panels (see `CaNhan/AGENTS.md`) |
| `DatVe/` | Booking flow steps (see `DatVe/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Read the customer session via `utils/cookieUtils` (`getClientAccessToken`, `getClientUserEmail`); the access token is a cookie, the refresh token is in `localStorage` (see `services/apiClient.jsx`).
- API calls go through `services/` (`TaiKhoanService`, `DatChoService`, `ThanhToanService`, `CheckInService`, `ClientDichVuService`); no raw `axios` in a page. Set the title with `useTitle('… - Airline Booking')`.
- Validate SĐT with `utils/phoneValidation` (`isValidVnPhone`) — never inline a new regex.

### Testing Requirements
- `pnpm lint` from `J2EE-Frontend/`; this tree has no unit tests.
- Manual check via `pnpm dev` (5181) against the backend on 8080; guarded pages need a customer cookie.

### Common Patterns
- Guest pages (`TraCuuChuyenBay`, `OnlineCheckIn`, `DichVuChuyenBay`) must work without a token; logged-in pages redirect to `/dang-nhap-client`.
- `CaNhan/*` panels are presentational; fetching and validation stay in `CaNhan.jsx`. `/ca-nhan`, `/quan-ly-chuyen-bay`, `/lich-su-giao-dich`, `/payment-result` are wrapped in `RequireCompleteProfile` in `App.jsx`.

## Dependencies

### Internal
- `../../components/KhachHang/` - shared customer UI (booking stepper, payment summary, flight card)
- `../../services/` - per-feature API modules over `apiClient.jsx`; `../../hooks/` - `useTitle`, `useWebSocket`

### External
- react-i18next - en/vi i18n, only on pages that call `useTranslation`
- react-router-dom - navigation and query params
- framer-motion, react-icons - animation and icon set

<!-- MANUAL: -->
