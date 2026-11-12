<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Booking

## Purpose
Widgets for the four-step customer booking flow (chọn chuyến bay → thông tin → dịch vụ → thanh toán): the progress stepper, the mã giảm giá input, the per-passenger service picker and the price breakdown. Each is presentational and driven entirely by props.

## Key Files
| File | Description |
|------|-------------|
| `BookingStepper.jsx` | Four-step progress indicator (flight / info / services / payment); `currentStep` is 0-based and `onStepClick` fires when an earlier step is clicked. |
| `DiscountCodeInput.jsx` | Mã giảm giá input; validates the code against `KhuyenMaiClientService` using the current `tongGiaDonHang` and `soLuongVe`, then reports the applied discount through `onApply` / `onRemove`. |
| `PassengerServiceSelector.jsx` | Lists hành khách as tabs with their chosen dịch vụ; switches the active passenger via `onChangePassenger` and opens the detail panel through `onOpenPanel`. |
| `PriceBreakdown.jsx` | Itemised total: giá vé đi/ve × passengers, thuế phí (fixed `583000`), per-passenger dịch vụ and the discount delta. |

## For AI Agents

### Working In This Directory
- All four components are pure props-in / callbacks-out; never fetch here — the owning page holds the booking state.
- Money formatting always goes through `formatCurrencyWithCommas` from `services/utils.jsx`; do not format VND inline.
- Service totals are computed twice (in `PriceBreakdown` and in `../ThongTinThanhToan.jsx`) — keep both consistent when the pricing rule changes.

### Testing Requirements
- `pnpm lint` must pass; no unit tests exist. Check the breakdown against a real booking with `pnpm dev` and the backend on port 8080.

### Common Patterns
- `PriceBreakdown` hardcodes the passenger tax at `583000`; it is not returned by the API — do not silently change the number.
- `DiscountCodeInput` calls `KhuyenMaiClientService` directly, so it is the only file here with a network call.
- `BookingStepper` labels come from `booking.stepper.*` i18n keys with Vietnamese fallbacks.

## Dependencies

### Internal
- `../../../services/KhuyenMaiClientService.jsx` - mã giảm giá validation.
- `../../../services/utils.jsx` - `formatCurrencyWithCommas`.
- `../../../config/api.config.js` - service image URLs used by the passenger selector.
- `../../../i18n/locales/{en,vi}/` - `booking.*` keys for stepper and labels.

### External
- react-i18next - translated step labels.
- react-icons - step and tag icons.

<!-- MANUAL: -->
