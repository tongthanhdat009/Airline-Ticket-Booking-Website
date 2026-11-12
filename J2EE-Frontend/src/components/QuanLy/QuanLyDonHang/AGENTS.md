<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyDonHang

## Purpose
Admin widgets for đơn hàng (orders): the order card in the grid view, the detail modal, the filter modal, and the cancel / refund confirmation modals.

## Key Files
| File | Description |
|------|-------------|
| `DonHangCard.jsx` | Memoized card showing the order code, customer email, order date, amount and status, with `onView` / `onDelete` actions. |
| `DonHangDetailModal.jsx` | Order detail with the hủy / hoàn tiền actions, both disabled while `actionLoading` is set. |
| `FilterModal.jsx` | Filter form for the order list: edits the `filters` object through `onFilterChange`, then applies with `onApply` or clears with `onClear`. |
| `HuyDonHangModal.jsx` | Cancellation modal collecting a required `lyDoHuy` before calling `onConfirm`. |
| `HoanTienModal.jsx` | Refund modal for one or many orders (`donHangs` array); requires a `lyDoHoanTien` and calls `onConfirm`. |

## For AI Agents

### Working In This Directory
- Refunds and cancellations are triggered from the page, not from the card — the modals only collect the reason and call `onConfirm`.
- `HoanTienModal` supports bulk refunds: `donHangs` may hold several orders, so the modal must stay order-agnostic.
- Both reason fields reset when the modal opens (`useEffect` on `isVisible`) — keep that or stale reasons leak into the next order.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Cancel one order and refund another in `pnpm dev` against the backend on port 8080.

### Common Patterns
- `DonHangDetailModal` formats VND itself with `Intl.NumberFormat('vi-VN')`; other components in the tree use `services/utils.jsx` helpers — do not mix the two in one file.
- `FilterModal` is controlled: it mutates the shared `filters` object through `onFilterChange` and only applies on `onApply`.
- Order status and payment flags come from the backend as `Y`/`H` style codes; check the field before rendering a badge.

## Dependencies

### Internal
- `../../../services/donHangApi.jsx` - order list, cancel and refund endpoints.
- `../../../pages/QuanLy/QuanLyDonHang.jsx` - the page that owns orders, filters and mutations.
- `../../common/` - `CardView`, `ResponsiveTable`, `ConfirmDialog` used alongside these components.

### External
- react-icons - cart, calendar, money and status icons.
- prop-types - runtime prop validation on `DonHangCard`.

<!-- MANUAL: -->
