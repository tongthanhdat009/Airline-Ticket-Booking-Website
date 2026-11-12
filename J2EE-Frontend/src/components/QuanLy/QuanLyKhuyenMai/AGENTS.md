<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyKhuyenMai

## Purpose
Admin widgets for khuyến mãi (promotions): the promotion card in the grid view and the create/edit modal.

## Key Files
| File | Description |
|------|-------------|
| `KhuyenMaiCard.jsx` | Memoized card showing the mã khuyến mãi, name, discount type and value, validity dates and status, with `onView` / `onEdit` / `onDelete` actions. |
| `KhuyenMaiModal.jsx` | Add/edit form for a khuyến mãi (`maKM`, `tenKhuyenMai`, value, dates, status) validated and saved through `QLKhuyenMaiService`; reports with `showToast`. |

## For AI Agents

### Working In This Directory
- `KhuyenMaiModal` calls `QLKhuyenMaiService` itself and then notifies the page through `onSave` plus a `showToast` — it is not purely controlled like the other modals here.
- `promotion` is `null` when creating and populated when editing; the modal switches its title and submit behaviour accordingly.
- The customer-facing side of the same feature is `../../../services/KhuyenMaiClientService.jsx`, used by the booking discount input — keep the field semantics aligned.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Create a khuyến mãi and then apply it during a booking in `pnpm dev`.

### Common Patterns
- The mã khuyến mãi is a business key shown on the card and used by the customer input — do not let the modal change it silently on edit.
- Discount type and value are separate fields (percentage or fixed amount); keep both in the payload.
- `showToast` is required for feedback; without it the user sees no confirmation.

## Dependencies

### Internal
- `../../../services/QLKhuyenMaiService.jsx` - promotion CRUD used by the modal.
- `../../../services/KhuyenMaiClientService.jsx` - customer-side validation of a discount code.
- `../../../pages/QuanLy/QuanLyKhuyenMai.jsx` - the page that owns the promotion list.

### External
- react-icons - tag, calendar, percent and money icons.
- prop-types - runtime prop validation on `KhuyenMaiCard`.

<!-- MANUAL: -->
