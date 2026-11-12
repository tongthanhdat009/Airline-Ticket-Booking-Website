<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyMayBay

## Purpose
Admin widgets for máy bay (aircraft): the aircraft card, the create/edit modal, and the seat-layout editor, viewer and compact preview for the sơ đồ ghế of one aircraft.

## Key Files
| File | Description |
|------|-------------|
| `MayBayCard.jsx` | Memoized card showing the aircraft code, name, type, manufacturer, year, seat count and status, with `onView` / `onEdit` / `onDelete` and `onViewSeatMap` actions. |
| `MayBayModal.jsx` | Create/edit form (`tenMayBay`, `loaiMayBay`, `hangMayBay`, `namKhaiThac`, `tongSoGhe`, `trangThai`, `soHieu`) with field-level validation. |
| `SeatLayoutEditor.jsx` | Full seat-map editor: loads seats via `SoDoGheService` and hạng vé via `QLHangVeService`, switches between grid and form view, and drives the `SeatGrid/` modals. |
| `SeatLayoutViewer.jsx` | Read-only seat map grouped by hạng vé, with a hover tooltip on each seat. |
| `SeatMapCompactPreview.jsx` | Small seat map shown inline (e.g. inside the aircraft card) without editing controls. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `SeatGrid/` | Seat grid renderer, legend, statistics and seat edit modals (see `SeatGrid/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `SeatLayoutViewer` and `SeatMapCompactPreview` import `SoDoGheService` dynamically to avoid a circular dependency — keep the `await import(...)` form.
- The editor owns seat persistence; the aircraft modal only handles the aircraft record itself.
- `SeatLayoutEditor` uses the shared `Toast` and `ConfirmDialog` from `../../common/` — reuse them instead of `window.confirm`.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Create an aircraft, generate its seat layout and edit a seat in `pnpm dev`.

### Common Patterns
- Seat data is keyed by `maMayBay`; every seat call goes through `SoDoGheService.getSeatsByAircraft(maMayBay)`.
- The editor supports two view modes (`grid` / `form`) — keep both in sync when adding a seat field.
- `MayBayModal` defaults `loaiMayBay` to `Commercial` and `trangThai` to `Active`; these are backend enum strings.

## Dependencies

### Internal
- `../../../services/SoDoGheService.jsx`, `../../../services/QLHangVeService.jsx` - seat layout CRUD and the hạng vé list used to label seats.
- `../../../services/QLMayBayService.jsx` - aircraft CRUD.
- `../../common/Toast.jsx`, `../../common/ConfirmDialog.jsx` - feedback and delete confirmation.
- `../../../constants/aircraftConfig.js` - seat positions and aircraft templates used by `SeatGrid/`.

### External
- react-icons - plane, chair, wrench and action icons.
- prop-types - runtime prop validation on `MayBayCard`.

<!-- MANUAL: -->
