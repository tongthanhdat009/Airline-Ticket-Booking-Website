<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyHoanTien

## Purpose
Admin widgets for hoàn tiền (refunds): the refund card in the grid view and the detail modal where an operator approves or rejects a refund request. This folder also exports an `index.js` barrel.

## Key Files
| File | Description |
|------|-------------|
| `HoanTienCard.jsx` | Memoized card showing the refund id, customer, amount, method and status, with `onView` / `onApprove` / `onReject` actions. |
| `RefundDetailModal.jsx` | Refund request detail with approve / reject buttons disabled while `actionLoading` runs; formatting helpers are passed in as props. |
| `index.js` | Barrel re-exporting `RefundDetailModal` and `HoanTienCard`. |

## For AI Agents

### Working In This Directory
- Approve and reject are decided by the page; the components only emit the callbacks and show the pending state.
- `formatCurrency`, `formatDateTime`, `getTrangThaiText` and `getPhuongThucText` arrive as props — reuse the page's helpers instead of importing a second formatter.
- The `actionLoading` flag must gate both approve and reject, otherwise a double click can approve twice.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Approve one refund request in `pnpm dev` against the backend on port 8080.

### Common Patterns
- Refund state is a backend enum rendered through `getTrangThaiText`; do not hardcode the labels.
- The refund amount mirrors the original order — keep the two in sync when the payment flow changes.

## Dependencies

### Internal
- `../../../services/hoanTienApi.jsx` - refund list, approve and reject endpoints.
- `../../../pages/QuanLy/QuanLyHoanTien.jsx` - the page that owns refund data and mutations.
- `../../common/CardView.jsx`, `../../common/ResponsiveTable.jsx` - the table/card switch used on the page.

### External
- react-icons - approve, reject, undo and money icons.
- prop-types - runtime prop validation on `HoanTienCard`.

<!-- MANUAL: -->
