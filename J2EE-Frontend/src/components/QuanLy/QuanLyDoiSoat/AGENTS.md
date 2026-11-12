<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyDoiSoat

## Purpose
The only piece of the đối soát (reconciliation) admin screen: a form where an operator records how a mismatched transaction was resolved.

## Key Files
| File | Description |
|------|-------------|
| `ReconciliationNoteForm.jsx` | Form with `ghiChu`, `nguoiXuLy` and `trangThai` (default `RESOLVED`); posts through `doiSoatGiaoDichApi` and calls `onSuccess` / `onCancel`. |

## For AI Agents

### Working In This Directory
- The component owns the network call itself — this is the exception in the admin tree, where pages normally own mutations.
- `itemId` is the mã hóa đơn of the reconciled row; it is the key sent to the backend, not a local row id.
- `trangThai` is a backend enum string, not free text. `RESOLVED` is the default; check the backend enum before adding another value.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Resolve one reconciliation row in `pnpm dev` against the backend on port 8080.

### Common Patterns
- The form is inline in the table row rather than a modal — keep it self-contained and avoid a shared modal here.
- `onSuccess` is the only signal the page uses to refresh the row; call it after the POST resolves.
- `error` state is rendered inline; do not replace it with a toast.

## Dependencies

### Internal
- `../../../services/doiSoatGiaoDichApi.jsx` - reconciliation transaction API.
- `../../../pages/QuanLy/DoiSoatGiaoDich.jsx` - the page that renders the reconciliation table.

### External
- react-icons - save and cancel icons.

<!-- MANUAL: -->
