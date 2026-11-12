<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# utils

## Purpose
Pure helpers with no React state: cookie access, RBAC checks, profile completeness, color mapping, and phone validation.

## Key Files
| File | Description |
|------|-------------|
| `cookieUtils.js` | Admin/client auth cookie helpers (`admin_access_token`, `accessToken`, `admin_user_info`, client email) |
| `permissionUtils.js` | Role and permission checks against the `admin_user_info` cookie |
| `profileUtils.js` | `checkProfileComplete()` plus `useProfileCompleteBanner()` for the "complete your profile" prompt |
| `colorUtils.js` | Status → Tailwind badge/button/gradient class builders, payment and booking status maps |
| `tailwindColorUtils.js` | Hex ↔ Tailwind class ↔ CSS conversions (`hexToRgb`, `hexToTw`, `twToCss`, gradient variants) |
| `phoneValidation.js` | `VN_PHONE_REGEX`, `VN_PHONE_MESSAGE`, `VN_PHONE_MAX_LENGTH`, `isValidVnPhone` |

## For AI Agents

### Working In This Directory
- Reuse these helpers instead of re-implementing date, currency, phone or color formatting in a component.
- Keep helpers pure — no API calls except `profileUtils.checkProfileComplete`, which fetches the account.
- Vietnamese phone numbers have one regex in the whole system; change it here, not in a form.

### Testing Requirements
- `pnpm lint` must pass; check the rendered output (badge color, formatted price, accepted phone) in `pnpm dev`.

### Common Patterns
- `cookieUtils.js` uses `sameSite: 'none'` in production and `'strict'` in dev; `services/apiClient.jsx` always writes `strict`. Match the module you are editing, do not mix conventions.
- `phoneValidation.js` mirrors the backend `HanhKhachService.PHONE_PATTERN`; `VN_PHONE_MAX_LENGTH` matches the DB column `varchar(20)`.
- `colorUtils.js` builds on `constants/colorPalette.js` — change tokens there, not in the utility.
- `profileUtils.checkProfileComplete` calls `TaiKhoanService` with `skipRedirect` so a missing login does not bounce the user.

## Dependencies

### Internal
- `../constants/colorPalette.js` - `STATUS_COLORS` and `TAILWIND_COLORS` used by `colorUtils.js`
- `../services/TaiKhoanService.jsx` - account lookup behind `profileUtils.js`

### External
- js-cookie - cookie read/write

<!-- MANUAL: -->
