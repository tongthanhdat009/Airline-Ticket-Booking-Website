<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyTuyenBay

## Purpose
Admin widgets for tuyến bay (routes): the route card in the grid view and the create/edit modal that pairs a departure with an arrival airport.

## Key Files
| File | Description |
|------|-------------|
| `TuyenBayCard.jsx` | Memoized card showing the route code, both airports and their IATA codes, with `onView` / `onEdit` / `onDelete` actions. |
| `TuyenBayModal.jsx` | Add/edit form; the airport pickers come from the `airports` prop, and the form state is owned by the page through `formData` / `handleFormChange`. |

## For AI Agents

### Working In This Directory
- `TuyenBayModal` is fully controlled — `formData`, `handleFormChange` and `onSubmit` all come from the page. Do not add local state for the fields.
- `currentRoute` decides whether the modal shows "Thêm tuyến bay mới" or "Chỉnh sửa tuyến bay".
- The airport list arrives as the `airports` prop; the page loads it from `QLSanBayServices.getSanBayActive`.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Add a route and edit it in `pnpm dev` against the backend on port 8080.

### Common Patterns
- A route with the same departure and arrival airport is invalid — check the page's validation, not the modal.
- The route code (`maTuyenBay`) is a business key; the modal must not renumber routes on edit.

## Dependencies

### Internal
- `../../../services/QLTuyenBayService.jsx` - route CRUD.
- `../../../services/QLTuyenBayServices.jsx` - the parallel module used by the admin page.
- `../../../pages/QuanLy/QuanLyTuyenBay.jsx` - the page that owns routes, the airport list and the form state.

### External
- react-icons - plane and arrow icons.
- prop-types - runtime prop validation on `TuyenBayCard`.

<!-- MANUAL: -->
