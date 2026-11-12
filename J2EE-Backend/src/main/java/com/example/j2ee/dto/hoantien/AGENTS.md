<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/hoantien

## Purpose
Payloads for hoàn tiền (refund) requests: customer-side request data, admin approve/reject payloads, and the refund statistics summary.

## Key Files
| File | Description |
|------|-------------|
| `DuyetHoanTienRequest.java` | Approve a refund: `maHoanTien`, `nguoiXuLy`, `ghiChu`. |
| `TuChoiHoanTienRequest.java` | Reject a refund: `maHoanTien`, `nguoiXuLy`, `lyDoTuChoi`, `ghiChu`. |
| `HoanTienResponse.java` | Refund row: invoice code, booking id, customer contact, request date, reason, amount, status, method, handler. |
| `HoanTienDetailResponse.java` | Refund detail with flight/route, original fare, cancellation fee and rejection reason. |
| `HoanTienThongKeDTO.java` | Refund statistics: total/pending/approved/rejected counts plus refunded and pending amounts. |

## For AI Agents

### Working In This Directory
- Refund status values: `CHO_XU_LY`, `DA_HOAN_TIEN`, `TU_CHOI`.
- `phuongThucHoan` is still modelled with the legacy `VNPAY` value alongside `CHUYEN_KHOAN` and `TIEN_MAT` — VNPay was dropped (V24/V25), so treat it as inert.
- `nguoiXuLy` and `ngayXuLy` record who approved or rejected and when; they are audit-relevant.

### Testing Requirements
- Refund approval changes money and booking state — cover it in a service test.
- Verify the refund amount never exceeds the original fare minus the cancellation fee.

### Common Patterns
- Approve and reject requests share the id + handler + note shape; the rejection adds a reason.
- Money is `BigDecimal`; `soTienHoan`, `giaVeGoc` and `phiHuy` are all present on the detail view.

## Dependencies

### Internal
- `../../service/HoanTienService.java` - request, process, approve and reject.
- `../../model/HoanTien.java` - refund entity.

### External
- Jakarta Validation - constraints on the approve/reject payloads.

<!-- MANUAL: -->
