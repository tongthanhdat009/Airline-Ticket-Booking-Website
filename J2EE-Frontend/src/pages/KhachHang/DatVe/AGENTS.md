<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# DatVe

## Purpose
Booking flow steps for the customer site. Route order is `/chon-chuyen-bay` → `/chon-chuyen-bay-ve` (round trip only) → `/thong-tin-hanh-khach` → `/chon-dich-vu` → `/thanh-toan`; each step forwards its payload through `navigate(path, { state })`.

## Key Files
| File | Description |
|------|-------------|
| `ChonDichVu.jsx` | Step 3: per-passenger dịch vụ bổ sung and seat selection (`SlidePanel`, `PassengerServiceSelector`), forwards to `/thanh-toan` |
| `NhapThongTin.jsx` | Step 2: hành khách forms (giới tính, họ tên, ngày sinh, quốc gia, SĐT, email, CMND), per-passenger error state |
| `ThanhToan.jsx` | Step 4: price breakdown, mã khuyến mãi, thanh toán thường (internal) then redirect to `/payment-result` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ChonChuyenBay/` | Outbound / return flight selection (see `ChonChuyenBay/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- The step payload is React Router `location.state`; never persist it elsewhere. Each step reads `formData = useMemo(() => location.state, [location.state])` and spreads it forward.
- Every step guards against a missing `location.state` and redirects to `/` — keep that guard when adding a step. `BookingStepper currentStep` is 0 = chọn chuyến bay, 1 = thông tin hành khách, 2 = chọn dịch vụ, 3 = thanh toán.
- Thanh toán is INTERNAL "thanh toán thường": `POST /client/datcho/create` then `ThanhToanService.xacNhanThanhToan(maThanhToan, confirmToken)`. No external payment gateway redirect. `ThanhToan.jsx` uses a `payingRef` latch to stop double submits.

### Testing Requirements
- `pnpm lint` from `J2EE-Frontend/`; no unit tests for this tree.
- Manual: run the full flow from `/` (search → chọn chuyến bay → hành khách → dịch vụ → thanh toán) against the backend on 8080.

### Common Patterns
- Use `services/datVeServices.jsx` for flight search and `services/utils.jsx` for `formatCurrencyWithCommas` / `formatDate` / `formatTime`; no inline formatters.
- `ThanhToan.jsx` calls `apiClient` directly for `POST /client/datcho/create` because the bearer token is optional for guest customers — everything else goes through a service module.
- Seat ids are sent as `danhSachMaGhe` (array) with `maGhe` kept only for backward compatibility.

## Dependencies

### Internal
- `../../../components/KhachHang/Booking/` - `BookingStepper`, `DiscountCodeInput`, `PriceBreakdown`, `PassengerServiceSelector`; `../../../components/KhachHang/` - `HeaderTimKiemChuyen`, `ThongTinThanhToan`, `SlidePanel`
- `../../../services/datVeServices.jsx`, `../../../services/ThanhToanService.jsx` - booking and payment APIs; `../../../services/KhuyenMaiClientService.jsx` - coupon validation behind `DiscountCodeInput`
- `../../../hooks/useTitle`, `../../../utils/cookieUtils`, `../../../utils/phoneValidation`

### External
- react-router-dom - `useLocation` / `useNavigate` state hand-off
- react-i18next - booking step copy
- react-icons - UI icons

<!-- MANUAL: -->
