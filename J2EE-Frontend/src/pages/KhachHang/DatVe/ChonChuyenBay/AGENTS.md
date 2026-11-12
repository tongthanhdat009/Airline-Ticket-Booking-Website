<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# ChonChuyenBay

## Purpose
Step 1 of the booking flow: pick the outbound (`ChonChuyenBayDi.jsx`) and, for round trips, the return (`ChonChuyenBayVe.jsx`) flight. Both list chuyến bay with fare per hạng vé and remaining seat count.

## Key Files
| File | Description |
|------|-------------|
| `ChonChuyenBayDi.jsx` | Route `/chon-chuyen-bay`: outbound flight list, seat availability per hạng vé, continues to `/chon-chuyen-bay-ve` or `/thong-tin-hanh-khach` |
| `ChonChuyenBayVe.jsx` | Route `/chon-chuyen-bay-ve`: return flight list, adds the return fare to the running `totalPrice`, continues to `/thong-tin-hanh-khach` |

## For AI Agents

### Working In This Directory
- The two files are near-duplicates on purpose; change both or extract into `components/KhachHang/` before diverging them.
- Flight data comes from `services/datVeServices.jsx` (`getSanBayByThanhPhoSanBay`, `searchChuyenBay`, `getGiaVe`, `kiemTraConGhe`); hạng vé list from `services/QLHangVeService.jsx`.
- The price helper `calcTotalPrice()` is local to each file and adds a hardcoded `thuePhi = 583000` per leg; keep the two calculations in sync.
- Forward the payload with `navigate(path, { state: { ...formData, selectedTuyenBayDi, totalPrice } })` — the next step reads exactly those keys.

### Testing Requirements
- `pnpm lint` from `J2EE-Frontend/`; no unit tests for this tree.
- Manual: search a one-way and a round-trip itinerary and check the seat counts and total price at the next step.

### Common Patterns
- `formData` comes from `location.state`; it carries `flightType` (`'round'` / one-way), `passengers`, `startDate` / `endDate` and the airport selection.
- Seat availability is probed once per (chuyến bay, hạng vé) pair and cached in a `soGheCon` map keyed `"<maChuyenBay>_<maHangVe>"`.
- Both pages render `BookingStepper currentStep={0}`, `HeaderTimKiemChuyen` and `ThongTinThanhToan`; keep that layout when editing.

## Dependencies

### Internal
- `../../../../components/KhachHang/FlightCard/FlightCard.jsx` - flight result card
- `../../../../components/KhachHang/` - `DanhSachNgayBay`, `HeaderTimKiemChuyen`, `ThongTinThanhToan`
- `../../../../components/KhachHang/Booking/BookingStepper.jsx` - step indicator
- `../../../../services/datVeServices.jsx`, `../../../../services/QLHangVeService.jsx`, `../../../../services/utils.jsx`

### External
- react-router-dom - `useLocation` / `useNavigate`
- react-i18next - flight list copy
- react-icons - UI icons

<!-- MANUAL: -->
