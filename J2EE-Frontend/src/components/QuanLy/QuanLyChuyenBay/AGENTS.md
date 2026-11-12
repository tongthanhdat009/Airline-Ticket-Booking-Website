<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyChuyenBay

## Purpose
Admin widgets for managing chuyến bay: the flight card in the grid view and the modals used to edit a flight, cancel it, record a delay, and attach dịch vụ to it.

## Key Files
| File | Description |
|------|-------------|
| `ChuyenBayCard.jsx` | Memoized card showing the flight code, route, aircraft, departure/arrival times and status, with `onView` / `onEdit` actions and a `getRouteInfo` helper. |
| `EditFlightModal.jsx` | Create/edit form for a chuyến bay: one-way vs khứ hành, dates (departure date cannot be in the past), aircraft, route and the assigned dịch vụ list. |
| `CancelFlightModal.jsx` | Cancellation modal collecting the reason and submitting it through `onSubmit` with `cancelData` / `onCancelDataChange`. |
| `DelayFlightModal.jsx` | Delay modal capturing `lyDoDelay` (max 255 chars) and the new time. |
| `FlightDetailModal.jsx` | Read-only flight details plus inline dịch vụ assignment through `QLDichVuChuyenBayService`. |
| `ManageServiceModal.jsx` | Full dịch vụ management for one flight: add/remove services via `addDichVuToChuyenBay` / `removeDichVuFromChuyenBay`. |

## For AI Agents

### Working In This Directory
- `FlightDetailModal` and `ManageServiceModal` are the two components that fetch; both call `getAllServices` and `getDichVuByChuyenBay` themselves and report through `showToast`.
- The modals are controlled: `formData` / `delayData` / `cancelData` live in the page, the modal emits changes through the matching `on*Change` callback.
- The API response envelope is unwrapped defensively — `res.data.data` and plain `res.data` are both handled. Keep that when touching the fetch code.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Exercise cancel, delay, edit and dịch vụ assignment in `pnpm dev` against the backend on port 8080.

### Common Patterns
- `ChuyenBayCard` and `ChuyenBayCard` consumers use `getRouteInfo` to render the route; the helper is passed in, not imported.
- Date validation compares `ngayDi` against today's midnight — a flight scheduled today is still valid.
- Both service modals duplicate the fetch pattern; if you change it, change both or factor the shared call.

## Dependencies

### Internal
- `../../../services/QLDichVuChuyenBayService.jsx`, `../../../services/QLDichVuService.jsx` - assign/unassign dịch vụ on a flight and list all dịch vụ.
- `../../../config/api.config.js` - `getServiceImageUrl` for dịch vụ thumbnails.
- `../../../pages/QuanLy/QuanLyChuyenBay.jsx` - the page that owns flight data and mutations.

### External
- react-icons - plane, clock, calendar and action icons.
- prop-types - runtime prop validation on `ChuyenBayCard`.

<!-- MANUAL: -->
