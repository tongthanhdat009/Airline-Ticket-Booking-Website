<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/khuyenmai

## Purpose
Payloads for khuyến mãi (coupon) management: create/update, customer-side validation and application, and the resulting discount breakdown.

## Key Files
| File | Description |
|------|-------------|
| `CreateKhuyenMaiRequest.java` | Create payload: `maKM`, name, type, discount value, min/max order value, quantity, validity window, status. |
| `UpdateKhuyenMaiRequest.java` | Update payload with the same field set. |
| `KhuyenMaiResponse.java` | Coupon view including `soLuongDaDuocDung`, `soLuongConLai` and soft-delete metadata. |
| `ValidateCouponRequest.java` | Customer check: `maKM`, `tongGiaDonHang`, `soLuongVe`. |
| `ValidateCouponResponse.java` | Validation result: `valid`, discount type and value, discounted total, error message. |
| `ApplyCouponRequest.java` | Applies a coupon to a set of bookings (`maKM`, `danhSachMaDatCho`). |
| `ApplyCouponResponse.java` | Totals before/after the discount, the discount amount and the per-ticket split. |

## For AI Agents

### Working In This Directory
- Discount type is `PERCENT` or `FIXED`; the code branches on it, so do not introduce new types without updating `KhuyenMaiService`.
- `ApplyCouponResponse.phanBoTheoVe` maps booking id to its discounted amount — the frontend relies on it to show per-ticket prices.
- Coupon usage is decremented inside a `REQUIRES_NEW` transaction so a failed booking does not consume the quota.

### Testing Requirements
- Cover percent and fixed discounts, expiry and quota exhaustion in a service test.
- Verify a coupon cannot be applied twice to the same booking.

### Common Patterns
- `maKM` is the customer-facing code; deleting a coupon renames it with a `_deleted_<id>` suffix so the code stays unique.
- Validity window is `LocalDateTime`; the check is `ACTIVE` plus the current time inside the window.

## Dependencies

### Internal
- `../../service/KhuyenMaiService.java` - validation, application and CRUD.
- `../../service/BookingService.java` - applies the coupon during booking.

### External
- Jakarta Validation - constraints and the cross-field `isGiaTriToiDaValid` check on create/update.

<!-- MANUAL: -->
