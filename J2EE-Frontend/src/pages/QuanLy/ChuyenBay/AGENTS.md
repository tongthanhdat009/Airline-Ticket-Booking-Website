<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# ChuyenBay

## Purpose
Standalone full-page forms for creating and editing a chuyến bay. They are separate routes (`/admin/dashboard/ChuyenBay/them`, `/admin/dashboard/ChuyenBay/:id/sua`) rather than modals, unlike the older `EditFlightModal` still used by `../QuanLyChuyenBay.jsx`.

## Key Files
| File | Description |
|------|-------------|
| `ThemChuyenBay.jsx` | Add form: tuyến bay, máy bay, số hiệu, giờ đi/giờ đến, optional return leg, dịch vụ attach, seat-layout preview |
| `SuaChuyenBay.jsx` | Edit form: loads the flight by `:id`, same fields plus dịch vụ add/remove and seat-map preview |

## For AI Agents

### Working In This Directory
- Read lookup data from `services/QLTuyenBayService.jsx`, `QLMayBayService.jsx` (`getActiveMayBay`), `QLDichVuService.jsx`; write through `services/QLChuyenBayService.jsx` (`createChuyenBay` / `updateChuyenBay`).
- `SuaChuyenBay.jsx` gets the flight id from `useParams()`; `ThemChuyenBay.jsx` has no id and starts from an empty `formData`.
- Keep the two forms field-for-field in sync — they are duplicated, not shared. Extract to a component before adding a field to only one.
- `ThemChuyenBay.jsx` has the dịch vụ attach calls commented out; `SuaChuyenBay.jsx` is the one wired to `QLDichVuChuyenBayService.jsx`.

### Testing Requirements
- `pnpm lint` from `J2EE-Frontend/`; no unit tests for this tree.
- Manual: add a chuyến bay and edit it back from `/admin/dashboard/ChuyenBay`, then confirm it appears in `../QuanLyChuyenBay.jsx`.

### Common Patterns
- `SeatLayoutViewer` + `SeatMapCompactPreview` show the máy bay seat map for the selected aircraft.
- Flight type is a state flag (`'1-chieu'` vs round trip) that toggles the return-leg fields.
- Errors are kept in a local `errors` object and surfaced with `Toast`; submit is guarded by `isSubmitting`.

## Dependencies

### Internal
- `../../../components/QuanLy/QuanLyMayBay/` - `SeatLayoutViewer`, `SeatMapCompactPreview`
- `../../../components/QuanLy/CardChucNang.jsx` - page shell
- `../../../components/common/Toast.jsx` - feedback
- `../../../services/QLChuyenBayService.jsx`, `QLTuyenBayService.jsx`, `QLMayBayService.jsx`, `QLDichVuService.jsx`, `QLDichVuChuyenBayService.jsx`

### External
- react-router-dom - `useParams`, `useNavigate`
- react-icons - UI icons

<!-- MANUAL: -->
