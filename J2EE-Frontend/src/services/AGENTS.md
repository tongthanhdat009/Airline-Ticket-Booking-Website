<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# services

## Purpose
All HTTP access to the backend: 45 modules grouped by feature prefix, every request going through the shared `apiClient.jsx` instance.

## Key Files
| File | Description |
|------|-------------|
| `apiClient.jsx` | Shared axios instance: bearer-token injection, 401 refresh + retry with a request queue |
| `AuthService.jsx`, `ClientAuthService.jsx`, `DangNhapClientServices.jsx`, `DangKyClientServices.jsx` | Admin and customer login/logout/register, current user, logout all devices |
| `EmailVerificationService.jsx`, `ForgotPasswordService.jsx`, `TaiKhoanService.jsx`, `validationService.jsx` | Account lifecycle: email verification, OTP reset, profile and credential updates, email/phone/password validation |
| `MenuService.jsx`, `PhanQuyenService.jsx`, `VaiTroService.jsx`, `QLTaiKhoanAdminServices.jsx` | Admin menu config, RBAC matrix, roles CRUD/search, admin accounts + role assignment |
| `datVeServices.jsx`, `QLChuyenBayService.jsx`, `QLMayBayService.jsx`, `SoDoGheService.jsx` | Flights, fares, seat map, aircraft and seats: customer reads plus admin CRUD, status/delay/cancel, seat auto-generation |
| `DatChoService.jsx`, `QLDatChoService.jsx`, `donHangApi.jsx`, `hoanTienApi.jsx`, `QLThanhToanService.jsx`, `ThanhToanService.jsx` | Bookings, orders, payments, refunds — including internal "thanh toán thường" confirmation, no external gateway |
| `QLSanBayService.jsx`, `QLSanBayServices.jsx`, `QLTuyenBayService.jsx`, `QLTuyenBayServices.jsx` | Airports and routes; the airport pair and the route pair overlap on the same endpoints — use one, do not add a third |
| `QLHangVeService.jsx`, `QLGiaChuyenBayService.jsx`, `QLDichVuService.jsx`, `QLDichVuChuyenBayService.jsx`, `ClientDichVuService.jsx`, `KhuyenMaiClientService.jsx`, `QLKhuyenMaiService.jsx` | Fare classes, flight prices, add-on services + options + images, service↔flight binding, coupons |
| `hoaDonApi.jsx`, `doiSoatGiaoDichApi.jsx`, `AuditLogService.jsx`, `ThongKeService.jsx` | Invoices (stats, PDF/Excel export), transaction reconciliation, audit log, dashboard statistics |
| `BannerService.jsx`, `TinTucService.jsx`, `QLKhachHangService.jsx`, `CheckInService.jsx`, `CountryService.jsx` | Homepage banners, news, customer records, check-in search/confirm, country list |
| `AdvisorChatService.jsx`, `utils.jsx` | AI advisor chat (POST + SSE token streaming); display helpers for currency, date/time, flight duration |

## For AI Agents

### Working In This Directory
- New API call → a function in the matching feature module; never call raw `axios` from a component. Import the shared `apiClient` from `./apiClient` — it attaches the token and handles 401 refresh. Admin endpoints live under `/admin/...`; that path selects the admin token in the interceptor, and `skipRedirect: true` stops a 401 from redirecting to login.

### Testing Requirements
- `pnpm lint` must pass; exercise the change against the backend on 8080 with `pnpm dev` and check the Network tab.

### Common Patterns
- PDF/Excel export is server-driven (the backend returns the file); no client-side PDF library is used.
- `EmailVerificationService.jsx` uses raw `axios` + `config/api.config.js` on purpose — those endpoints are unauthenticated.

## Dependencies

### Internal
- `./apiClient.jsx` - axios instance, token storage, refresh/retry interceptors
- `../config/api.config.js`, `../data/adminMenuData.js` - base URL helpers for the unauthenticated services; admin menu consumer of `MenuService`

### External
- axios - HTTP client; js-cookie - access token cookies read/written by `apiClient.jsx`

<!-- MANUAL: -->
