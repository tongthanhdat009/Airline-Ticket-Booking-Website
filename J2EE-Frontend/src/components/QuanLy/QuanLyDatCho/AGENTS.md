<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyDatCho

## Purpose
Admin widgets for đặt chỗ (bookings): the booking card in the grid view and the modals for check-in, seat change, flight change, hạng vé change and ticket cancellation. This folder also exports an `index.js` barrel.

## Key Files
| File | Description |
|------|-------------|
| `DatChoCard.jsx` | Memoized card showing the booking code, hành khách, chuyến bay, seat, check-in and status, with row actions. |
| `ChiTietDatChoModal.jsx` | Full booking detail (hành khách, contact, flight, seat, check-in state) using the `getCheckInStatus` / `getTrangThaiDatCho` helpers passed from the page. |
| `CheckInModal.jsx` | Confirmation modal for performing check-in on a booking. |
| `DoiGheModal.jsx` | Seat-change modal: renders the seat map and colour-codes booked, current and newly selected seats. |
| `DoiChuyenModal.jsx` | Flight-change modal listing the available flights (`availableFlights`) with their status badges. |
| `DoiHangVeModal.jsx` | Fare-class change modal; loads the hạng vé list and computes the change fee (`phiDoiInfo`). |
| `HuyVeModal.jsx` | Ticket-cancellation modal with a fixed reason list (khách hàng yêu cầu hủy, thay đổi lịch trình, chuyến bay bị hủy, trùng chuyến bay, lý do khác). |
| `index.js` | Barrel re-exporting `ChiTietDatChoModal`, `CheckInModal`, `DoiGheModal`, `DoiChuyenModal`, `HuyVeModal`, `DoiHangVeModal`, `DatChoCard`. |

## For AI Agents

### Working In This Directory
- Import from `./index.js` (the barrel) or the explicit file — the admin page mixes both styles, so match the file you are editing.
- `DoiHangVeModal` is the only component here that fetches (hạng vé list and change fee via `QLDatChoService`); the rest receive their data as props.
- Each modal renders `null` while closed and takes `loading` / `loadingModal` flags for the submit button.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Exercise check-in, seat change and cancellation in `pnpm dev` against the backend on port 8080.

### Common Patterns
- Seat colours in `DoiGheModal` are status-driven: yellow = current seat, red = booked, blue = newly selected.
- Cancellation reasons are a fixed list, not free text — extend the list rather than adding a textarea; `HuyVeModal` only calls `onConfirm(lyDo)` when a reason is chosen.

## Dependencies

### Internal
- `../../../services/QLDatChoService.jsx` - hạng vé list and change-fee lookup.
- `../../../pages/QuanLy/QuanLyDatCho.jsx` - the page that owns booking data, check-in and the change mutations.
- `../../common/` - `Toast`, `ConfirmDialog` used by the page and modals.

### External
- react-icons - seat, check-in, exchange and cancel icons.
- prop-types - runtime prop validation on `DatChoCard`.

<!-- MANUAL: -->
