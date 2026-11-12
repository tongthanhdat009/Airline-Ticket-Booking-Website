<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/datcho

## Purpose
Booking (đặt chỗ) payloads: the large create-booking request, booking responses, admin list/detail views and the đổi ghế / đổi chuyến bay requests.

## Key Files
| File | Description |
|------|-------------|
| `CreateBookingRequest.java` | Full booking payload: passenger list, flight details (outbound + optional return), per-direction and per-passenger dịch vụ, coupon code, total amount. |
| `CreateBookingResponse.java` | Result of a booking: `maDatCho`, `maThanhToan`, `confirmToken`, `maHanhKhach` and the per-passenger id lists. |
| `DatChoAdminResponse.java` | Admin booking row: passenger, flight, seat, hạng vé, payment, `maDonHang`, `pnr`. |
| `DatChoDetailResponse.java` | Customer booking detail: hành khách, chi tiết ghế, thông tin thanh toán. |
| `DatChoFilterRequest.java` | Admin list filter: flight, status, date range, search text, page/size. |
| `DatChoSearchRequest.java` | Proof-of-knowledge lookup by `maDatCho` + passenger name. |
| `DoiGheRequest.java` | Đổi ghế request: new seat id + reason. |
| `DoiChuyenBayRequest.java` | Đổi chuyến bay request: new flight id, new seat id, reason. |
| `DoiHangVeRequest.java` / `DoiHangVeResponse.java` | Đổi hạng vé request (new hạng vé id, new seat id, reason) and the fee breakdown (old/new price, difference, fee, total, transaction type). |
| `ThanhToanInfo.java` | Payment summary attached to a booking: amount, `daThanhToan` (`Y`/`N`), expiry date. |

## For AI Agents

### Working In This Directory
- `CreateBookingRequest` is the largest contract in the app: passenger and seat arrays must stay index-aligned, and `totalAmount` is client-supplied and must be recomputed server-side.
- `confirmToken` from `CreateBookingResponse` is a single-use token that lets an anonymous customer confirm thanh toán — treat it as a credential.
- Round-trip bookings put the return flight in `flightInfo.returnFlight`; seat ids may be a single `maGhe` or a `danhSachMaGhe` list.

### Testing Requirements
- Booking creation is the money path — extend `src/test/java/com/example/j2ee/controller/ClientIdorTest.java` and add a service test for seat conflicts.

### Common Patterns
- Seat references are ints (FK to `chitietghe`), passenger data is embedded in the request, not referenced.
- Money fields are `BigDecimal`; status flags on `ThanhToanInfo` are `Character` (`'Y'`/`'N'`).

## Dependencies

### Internal
- `../../service/BookingService.java`, `../../service/QuanLyDatChoService.java`, `../../service/KhuyenMaiService.java` - the flows these payloads drive.

### External
- Jakarta Validation - constraints on passenger, seat and flight fields.

<!-- MANUAL: -->
