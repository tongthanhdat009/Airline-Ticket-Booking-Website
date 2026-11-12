<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLySanBay

## Purpose
Admin widgets for sân bay (airports): the airport card in the grid view and the create/edit modal that looks an airport up by ICAO code.

## Key Files
| File | Description |
|------|-------------|
| `SanBayCard.jsx` | Memoized card showing the ICAO and IATA codes, airport name, city and country, with an `onDelete` action. |
| `SanBayModal.jsx` | Create/edit form (`maICAO`, `maIATA`, `tenSanBay`, `thanhPhoSanBay`, `quocGiaSanBay`); looks the airport up with `thongTinSanBay` from `QLSanBayServices` and pre-fills the fields. |

## For AI Agents

### Working In This Directory
- `SanBayModal` resolves the airport from the ICAO code via `thongTinSanBay` and fills the remaining fields — that lookup is the source of truth, not manual typing.
- The card exposes `onDelete` only; there is no edit action on the card, editing happens in the modal.
- Airport codes are uppercase business keys — keep `maICAO` (4 letters) and `maIATA` (3 letters) distinct.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Add an airport and delete it in `pnpm dev` against the backend on port 8080.

### Common Patterns
- `SanBayModal` shows `searchLoading` / `searchError` while resolving the ICAO code; keep those states wired.
- The customer-side airport picker in `../../KhachHang/TimChuyenBayForm.jsx` reads the same records — a bad country/airport entry breaks the search form too.
- Two near-duplicate airport service modules exist: `QLSanBayServices.jsx` (plural, `thongTinSanBay`, `addSanBay`) and `QLSanBayService.jsx` (singular, `getActiveSanBay`). This folder uses the plural one — check the import path before adding a call.

## Dependencies

### Internal
- `../../../services/QLSanBayServices.jsx` - `thongTinSanBay` lookup and airport CRUD.
- `../../../services/QLSanBayService.jsx` - the parallel singular module used by the flight page.
- `../../../pages/QuanLy/QuanLySanBay.jsx` - the page that owns the airport list.

### External
- react-icons - plane and map-pin icons.
- prop-types - runtime prop validation on `SanBayCard`.

<!-- MANUAL: -->
