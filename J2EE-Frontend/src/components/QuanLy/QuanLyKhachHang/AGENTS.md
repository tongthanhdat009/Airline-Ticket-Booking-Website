<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyKhachHang

## Purpose
The customer detail modal for the admin console: a three-tab view over one hành khách record (profile, account, flight history). The grid card for the same screen lives in `../KhachHang/`.

## Key Files
| File | Description |
|------|-------------|
| `ViewKhachHangModal.jsx` | Tabbed modal that renders the three panels; keeps a local copy of `customer` and syncs it through `onCustomerUpdate`. |
| `ThongTinKhachHang.jsx` | Profile tab: editable họ tên, ngày sinh, giới tính, địa chỉ, số điện thoại, quốc gia, saved via `updateKhachHangPartial`. |
| `ThongTinTaiKhoan.jsx` | Account tab: reads the login account with `getTaiKhoanKhachHang` and changes the password with `doiMatKhauKhachHang`. |
| `ThongTinChuyenBay.jsx` | Flight tab: loads the customer's flights with `getChuyenBayByKhachHangId` and summarises totals (chuyến bay, chi tiêu, dịch vụ). |

## For AI Agents

### Working In This Directory
- `ViewKhachHangModal` copies the `customer` prop into local state so a tab edit does not mutate the page's list directly; call `onCustomerUpdate` to publish changes.
- `ThongTinChuyenBay` and `ThongTinTaiKhoan` fetch their own data — the other two tabs do not.
- Phone validation uses `isValidVnPhone` / `VN_PHONE_MESSAGE` from `utils/phoneValidation.js`; reuse them for consistency.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Edit a customer profile, change their password and browse their flights in `pnpm dev`.

### Common Patterns
- `ThongTinKhachHang` starts in edit mode only when `initialEditMode` is true, and `ViewKhachHangModal` forwards that flag.
- `ThongTinTaiKhoan` keeps the new password and its confirmation in local state and validates them before calling the API.
- This folder and `../KhachHang/` are different screens: one is the detail modal, the other the grid card.

## Dependencies

### Internal
- `../../../services/QLKhachHangService.jsx` - `getChuyenBayByKhachHangId`, `getTaiKhoanKhachHang`, `doiMatKhauKhachHang`, `updateKhachHangPartial`.
- `../../../utils/phoneValidation.js` - VN phone validation for the profile form.
- `../../../pages/QuanLy/QuanLyKhachHang.jsx` - the page that owns the customer list and opens this modal.

### External
- react - local state for the tabs and forms.

<!-- MANUAL: -->
