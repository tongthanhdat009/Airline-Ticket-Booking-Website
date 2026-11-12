<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# SeatGrid

## Purpose
The seat-map sub-widget of the máy bay screen: the grid renderer itself, the legend, the statistics panel, and the modals that add, edit or bulk-modify individual seats.

## Key Files
| File | Description |
|------|-------------|
| `SeatGridDisplay.jsx` | Renders the seat grid grouped by cabin/hạng vé; handles left click (`onSeatClick`), right click (`onSeatRightClick`) and row selection (`onToggleRow` / `onToggleRows`). |
| `SeatLegend.jsx` | Static legend mapping seat colours to First Class, Business, Economy and the exit-row icons. |
| `SeatStatistics.jsx` | Sidebar with totals by hạng vé, by position (CỬA SỔ / LỐI ĐI / GIỮA) and by row; collapsible. |
| `AddSeatModal.jsx` | Creates a seat (`soGhe`, `maHangVe`, `viTriGhe`, `hang`, `cot`) with its own toast state. |
| `EditSeatModal.jsx` | Edits an existing seat, loading the hạng vé list for the `maHangVe` picker. |
| `BulkEditModal.jsx` | Applies one change (hạng vé) to the `selectedCount` seats at once. |
| `AutoGenerateModal.jsx` | Generates a whole cabin of seats from the `AIRCRAFT_TEMPLATES` presets or a custom row/column configuration. |
| `ContextMenu.jsx` | Right-click menu over a seat with add / edit / delete actions, repositioned to stay on screen. |

## For AI Agents

### Working In This Directory
- Seat position values come from `SEAT_POSITIONS` in `constants/aircraftConfig.js` (CỬA SỔ / LỐI ĐI / GIỮA) — do not hardcode the strings.
- `AddSeatModal` and `EditSeatModal` keep their own `Toast` state instead of using a page-level toast; keep that consistent when adding a new modal here.
- `ContextMenu` clamps its position against the viewport; any new menu entry must not break that adjustment.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Generate a cabin, right-click a seat and bulk-edit a row in `pnpm dev`.

### Common Patterns
- `SeatGridDisplay` is dumb markup — it receives `seats`, `maxRow`, the selection and the click handlers from `../SeatLayoutEditor.jsx`.
- Auto-generation computes the starting row from the cabins already present, so it must be run on an aircraft without seats; `BulkEditModal` applies its change to `selectedCount` seats through `onSave`.

## Dependencies

### Internal
- `../../../../constants/aircraftConfig.js` - `SEAT_POSITIONS`, `AIRCRAFT_TEMPLATES`, `COMMON_EXIT_ROWS`.
- `../../../../services/QLHangVeService.jsx` - hạng vé list for the seat forms.
- `../../../common/Toast.jsx` - per-modal toast notifications.
- `../SeatLayoutEditor.jsx` - the parent that owns the seat state and persistence.

### External
- react-icons - seat, window, aisle and crown icons.
- tailwindcss - seat colour coding and grid layout.

<!-- MANUAL: -->
