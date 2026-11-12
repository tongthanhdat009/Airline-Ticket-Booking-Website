<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# FlightCard

## Purpose
The collapsible flight result card shown in the chuyến bay search results. It lists a flight with its route and times and expands to reveal the available hạng vé with prices.

## Key Files
| File | Description |
|------|-------------|
| `FlightCard.jsx` | Renders one chuyến bay: departure/arrival, times, duration and the expandable `hangVes` list; each fare class calls `onHangVeClick`, and the parent receives the selection as `selectedTuyenBay`. |

## For AI Agents

### Working In This Directory
- The component is display-only: it holds only the expand/collapse flag, everything else arrives as props (`chuyenBay`, `sanBayDi`, `sanBayDen`, `hangVes`).
- `onHangVeClick` reports the chosen hạng vé; the parent owns the selection state and passes `selectedTuyenBay` back for the highlight.
- Currency and duration come from `services/utils.jsx` (`formatCurrency`, `formatTime`, `formatDateType`, `calcFlightDuration`) — reuse them.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Verify expansion and fare selection in the search results page via `pnpm dev`.

### Common Patterns
- A single file in this folder — keep new fare-display helpers inside `FlightCard.jsx` rather than adding sibling files.
- The card renders `hangVes` (fare classes) with prices and availability; it does not check seat inventory itself.

## Dependencies

### Internal
- `../../../services/utils.jsx` - currency, date, time and duration formatting.
- `../../../utils/tailwindColorUtils.js` - `twToCss` / `twGradientToCss` for the fare-class colour theme.

### External
- react-icons - plane, chevron and status icons.
- tailwindcss - layout and fare-class theming.

<!-- MANUAL: -->
