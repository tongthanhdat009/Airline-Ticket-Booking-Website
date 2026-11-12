<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Auth

## Purpose
Login and registration screens for the customer site: a shared two-column layout, the marketing banner column, and the two forms. The forms are pure presentation — the page in `pages/KhachHang/` owns submission and routing.

## Key Files
| File | Description |
|------|-------------|
| `AuthLayout.jsx` | Two-column shell (banner left, form right) with a framer-motion stagger on children; accepts `children`, `bannerContent`, `className`. |
| `BannerContent.jsx` | Exports `LoginBannerContent` and `RegisterBannerContent`; the register variant tracks the current step and the email-verification prompt. |
| `LoginForm.jsx` | Email/password form with show-password toggle and inline validation; emits `onSubmit` / `onGoogleLogin` and accepts `isLoading`. |
| `RegisterForm.jsx` | Three-step wizard (thông tin cá nhân → liên hệ → bảo mật) with a local `useDebounce`, `validationService` rules and VN phone validation. |

## For AI Agents

### Working In This Directory
- Keep both forms controlled by the parent: they emit events and never navigate or call the auth API.
- `RegisterForm` validates with `services/validationService.jsx` (`validatePassword`, `validateBirthDate`, `calculateAge`) and `utils/phoneValidation.js` — reuse those instead of writing new regexes.
- Add user-facing strings to both `src/i18n/locales/en/` and `src/i18n/locales/vi/`; Vietnamese is the primary locale.

### Testing Requirements
- `pnpm lint` must pass; no unit tests exist. Exercise both screens through `pnpm dev` at `/dang-nhap-client` and `/dang-ky-client`.

### Common Patterns
- `framer-motion` is imported with `// eslint-disable-next-line no-unused-vars` in this folder — keep the import only if the animation is re-enabled, otherwise remove both.
- `RegisterForm` is the only file here that talks to the backend: it posts `/check-email` and `/check-phone` through `apiClient` on the debounced value.
- Password visibility is local component state; the typed value is never lifted to the page.

## Dependencies

### Internal
- `../../services/validationService.jsx` - password, birth-date and age rules.
- `../../utils/phoneValidation.js` - VN phone regex, message and max length.
- `../../services/apiClient.jsx` - email / phone availability checks in `RegisterForm`.
- `../../pages/KhachHang/DangNhap.jsx`, `DangKy.jsx` - own submit handling and routing.

### External
- react-i18next - translated labels and error messages.
- react-router-dom - navigation out of the login form.
- framer-motion - entrance animations.

<!-- MANUAL: -->
