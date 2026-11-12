<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyHoaDon

## Purpose
Admin widgets for hóa đơn (invoices): the invoice card in the grid view and the detail modal with PDF export. This folder also exports an `index.js` barrel.

## Key Files
| File | Description |
|------|-------------|
| `HoaDonCard.jsx` | Memoized card showing the invoice code, customer, issue date, amount and status, with `onView` and `onExportPdf` actions. |
| `HoaDonDetailModal.jsx` | Invoice detail modal; exports the invoice as PDF through the `onExportPdf` callback and disables the button while `exportLoading` is set. |
| `index.js` | Barrel re-exporting `HoaDonDetailModal` and `HoaDonCard`. |

## For AI Agents

### Working In This Directory
- PDF export is delegated to the page — the card and the modal only trigger `onExportPdf`; they do not build the file.
- Both components render `null` when closed or when the entity is missing, so the page can keep them mounted.
- Import through the barrel (`from './index.js'`) or the explicit file, matching the call site you edit.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Export one invoice to PDF in `pnpm dev` against the backend on port 8080.

### Common Patterns
- `exportLoading` is passed in from the page; never start the export inside the modal.
- The invoice number and status codes come from the backend — do not derive them from the order.

## Dependencies

### Internal
- `../../../services/hoaDonApi.jsx` - invoice list, detail and PDF export.
- `../../../pages/QuanLy/` - the invoice page that owns the data and export handler.
- `../../../config/api.config.js` - `getPdfUrl` for invoice file URLs.

### External
- react-icons - invoice, PDF and money icons.

<!-- MANUAL: -->
