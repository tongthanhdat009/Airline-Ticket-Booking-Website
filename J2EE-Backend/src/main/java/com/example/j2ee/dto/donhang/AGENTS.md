<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/donhang

## Purpose
Payloads for đơn hàng (order) management: list/detail views, status change, cancellation and the batch approve/refund requests.

## Key Files
| File | Description |
|------|-------------|
| `DonHangResponse.java` | Order row: `maDonHang`, `pnr`, customer, booking date, total price, status, contact info, timestamps. |
| `DonHangDetailResponse.java` | Order detail with the nested `danhSachDatCho` bookings. |
| `UpdateTrangThaiDonHangRequest.java` | New order status (`trangThai`). |
| `HuyDonHangRequest.java` | Cancellation reason (`lyDoHuy`). |
| `BatchApproveRequest.java` | List of `maDonHangs` to approve in one call. |
| `BatchRefundRequest.java` | List of `maDonHangs` to refund plus `lyDoHoanTien`. |

## For AI Agents

### Working In This Directory
- `pnr` is the order code shown to customers and is unique; look orders up by `maDonHang` internally and by `pnr` externally.
- Status values in use: `CHỜ THANH TOÁN`, `ĐÃ THANH TOÁN`, `ĐÃ HỦY` — they are Vietnamese strings with spaces, not enum constants.
- `DonHangDetailResponse` embeds the `DatCho` entities directly; keep that in mind before adding fields to the entity.

### Testing Requirements
- Extend `src/test/java/com/example/j2ee/service/DonHangServiceTest.java` for status transitions and cancellation side effects.
- Batch endpoints must be tested with a partial-failure list.

### Common Patterns
- Money is `BigDecimal` (`tongGia`); dates are `LocalDateTime`.
- Batch requests only carry ids; the reason for refunds is a single string for the whole batch.

## Dependencies

### Internal
- `../../service/DonHangService.java` - order lifecycle, approve/refund/cancel.
- `../../model/DonHang.java` - order entity backing these DTOs.

### External
- Jakarta Validation - `@NotEmpty` on the id lists of the batch requests.

<!-- MANUAL: -->
