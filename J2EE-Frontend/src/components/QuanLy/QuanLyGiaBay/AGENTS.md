<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyGiaBay

## Purpose
Admin widgets for giá bay (route pricing): the pricing card in the grid view and the modal that lists and edits the per-hạng-vé prices of one tuyến bay.

## Key Files
| File | Description |
|------|-------------|
| `GiaBayCard.jsx` | Memoized card showing the route (`maTuyenBay`), airport names and the flight legs, with a single `onView` action. |
| `ViewPriceDetailModal.jsx` | Expandable price detail per hạng vé on a route; supports `onEdit`, `onDelete`, `onAddNew` and a manual `onRefresh` with its own `isRefreshing` spinner. |

## For AI Agents

### Working In This Directory
- `ViewPriceDetailModal` is fully controlled: the route, the format helpers and every mutation callback are supplied by the page.
- `formatCurrency` and `formatDate` are passed in as props rather than imported — the page owns the formatting convention.
- Expanding a hạng vé is local state (`expandedClassId`) and resets each time the modal opens.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Open a route and edit a price in `pnpm dev` against the backend on port 8080.

### Common Patterns
- Only one hạng vé row is expanded at a time (`expandedClassId` holds a single id) — keep the single-expansion behaviour.
- The refresh button re-fetches through the page's `onRefresh`; the modal only shows the spinner.
- The card exposes `onView` only — pricing is read-only at grid level, edits happen in the modal.

## Dependencies

### Internal
- `../../../services/QLGiaChuyenBayService.jsx` - route pricing endpoints.
- `../../../pages/QuanLy/QuanLyGiaBay.jsx` - the page that owns pricing data and mutations.

### External
- react-icons - plane, money and arrow icons.
- prop-types - runtime prop validation on `GiaBayCard`.

<!-- MANUAL: -->
