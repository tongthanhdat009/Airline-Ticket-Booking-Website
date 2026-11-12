<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyThanhToan

## Purpose
The payment detail modal for the admin console: one modal that shows a thanh toán record with its hành khách, chuyến bay, dịch vụ and invoice file.

## Key Files
| File | Description |
|------|-------------|
| `ViewPaymentDetailModal.jsx` | Loads the payment with `getThanhToanChiTiet`, the booked dịch vụ with `getDichVuByMaDatCho`, and the service/option images with `fetchServiceImageByName` / `fetchOptionImageByName`; supports invoice download via `downloadInvoicePdf`. |

## For AI Agents

### Working In This Directory
- A single file in this folder — keep the payment view here rather than splitting it across new siblings.
- The modal keeps its own copy of the payment in `currentPayment` state and refetches on open; do not rely on the `payment` prop staying fresh.
- `formatCurrency`, `formatDate` and `getStatusBadge` are passed in from the page; reuse them instead of importing a second formatter.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. No admin route renders this modal yet, so verify it only after wiring it into a page.

### Common Patterns
- Payment is the internal "thanh toán thường" flow — there is no external gateway, no redirect, and no webhook handling in the frontend.
- Service images are fetched by name and resolved to URLs; a missing image must not break the modal.
- Nothing imports `ViewPaymentDetailModal` yet and `App.jsx` has no admin thanh toán route — wire it to a page before relying on it.

## Dependencies

### Internal
- `../../../services/QLThanhToanService.jsx` - `getThanhToanChiTiet`, `downloadInvoicePdf`.
- `../../../services/QLDichVuService.jsx` - `getDichVuByMaDatCho`, `fetchServiceImageByName`, `fetchOptionImageByName`.

### External
- react-icons - money, user, calendar, plane, service and PDF icons.

<!-- MANUAL: -->
