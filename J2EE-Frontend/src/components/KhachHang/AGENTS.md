<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# KhachHang

## Purpose
Customer-facing booking UI: the flight search form, the 30-day date strip, the trip summary header, the seat/service slide panel, the payment summary and the invoice detail modal.

## Key Files
| File | Description |
|------|-------------|
| `TimChuyenBayForm.jsx` | Flight search form: airport pickers grouped by country, `react-datepicker` dates, passenger count, one-way / round-trip toggle; navigates to the flight list. |
| `DanhSachNgayBay.jsx` | Horizontal 30-day strip from `ngayChon`, 5 days visible, arrow-scrolled; emits the selected date. |
| `HeaderTimKiemChuyen.jsx` | Trip summary bar (flight type, passengers, departure/arrival IATA) with step dots reflecting `data.state`. |
| `SlidePanel.jsx` | Exports `ChoNgoiPanel` — slide-in seat + service chooser; loads the seat map via `getSoDoGheByChuyenBay` and options via `getLuaChonByDichVuId`, tracks di/ve tabs. |
| `ThongTinThanhToan.jsx` | Payment review panel: expandable sections for giá vé, thuế phí, dịch vụ, thông tin hành khách with back-navigation callbacks. |
| `ModalDetailHoaDon.jsx` | Invoice detail modal (no imports — pure markup) with a paid/cancelled badge and PDF download / payment actions. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Booking/` | Booking-step widgets: stepper, discount code, per-passenger services, price breakdown (see `Booking/AGENTS.md`) |
| `FlightCard/` | Collapsible flight result card with per-fare-class prices (see `FlightCard/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Data comes from `services/datVeServices.jsx`; components here mostly receive it as props and never fetch on mount.
- Seat and service selection is per-passenger and per-leg (`di` / `ve`) — keep the two structures separate, they are merged only at checkout.
- Customer copy goes through `react-i18next`; Vietnamese is the primary locale.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Drive the flow with `pnpm dev` against the backend on port 8080.

### Common Patterns
- `SlidePanel.jsx` exports the component as `ChoNgoiPanel` while the file is named `SlidePanel` — import the default export, not the file name.
- `ThongTinThanhToan` receives one `cb` object holding the whole booking state; `ModalDetailHoaDon.jsx` has no import statements at all — keep both as they are.

## Dependencies

### Internal
- `../../services/datVeServices.jsx` - seat map, service options, airport lookups.
- `../../services/utils.jsx` - `formatCurrencyWithCommas`, `formatDateType`, `formatTime`.
- `../../config/api.config.js` - `getServiceImageUrl`, `getServiceOptionImageUrl`.
- `Booking/`, `FlightCard/` - the widgets used inside these screens.

### External
- react-i18next - translated labels.
- react-icons / react-datepicker / react-router-dom - icons, date picker and navigation.

<!-- MANUAL: -->
