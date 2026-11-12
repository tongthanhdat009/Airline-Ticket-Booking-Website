<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# src (frontend)

## Purpose
All React code. Entry `main.jsx` → `App.jsx` (routing). `pages/` route targets, `components/` UI, `services/` API calls, `hooks/` shared logic.

## Key Files
| File | Description |
|------|-------------|
| `main.jsx` | React entrypoint |
| `App.jsx` | Router + providers |
| `index.css` | Global styles (Tailwind) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `pages/` | Route pages: `KhachHang/` (customer) + `QuanLy/` (admin) (see `pages/AGENTS.md`) |
| `components/` | UI by area: `Admin/`, `Auth/`, `common/`, `KhachHang/`, `QuanLy/` (see `components/AGENTS.md`) |
| `services/` | 45 per-feature API modules over `apiClient.jsx` (see `services/AGENTS.md`) |
| `hooks/` | `useAuth`, `usePermission`, `useToast`, `useWebSocket`, `useCheckInWebSocket`, `useMenuData`, `useTitle`, `useViewToggle` (see `hooks/AGENTS.md`) |
| `config/` | `api.config.js` — API/WS base URLs, asset + OAuth URL helpers (see `config/AGENTS.md`) |
| `constants/` | `colorPalette.js`, `aircraftConfig.js` (see `constants/AGENTS.md`) |
| `data/` | `adminMenuData.js` — admin menu + permission fallback (see `data/AGENTS.md`) |
| `utils/` | `cookieUtils`, `permissionUtils`, `profileUtils`, `colorUtils`, `tailwindColorUtils`, `phoneValidation` (see `utils/AGENTS.md`) |
| `i18n/` | i18next init, language from `localStorage.language` (see `i18n/AGENTS.md`) |
| `i18n/locales/` | One folder per language (see `i18n/locales/AGENTS.md`) |
| `i18n/locales/en/` | English bundle `en.json` (see `i18n/locales/en/AGENTS.md`) |
| `i18n/locales/vi/` | Vietnamese bundle `vi.json` (see `i18n/locales/vi/AGENTS.md`) |
| `assets/` | Bundled SVG + CSS (see `assets/AGENTS.md`) |
| `assets/css/` | `TrangChuAdmin.css` — currently imported nowhere; the app is pure Tailwind (see `assets/css/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New API call → add function in matching `services/<Feature>Service.jsx`, reuse `apiClient.jsx` (auth/refresh/user-type handled there).
- New route page → `pages/<KhachHang|QuanLy>/` + guard (`ProtectedRoute` vs `AdminProtectedRoute`) + menu entry if admin.
- Shared UI → `components/common/`; check it doesn't already exist before adding.
- Colors via `constants/colorPalette.js` + `utils/tailwindColorUtils.js`, not hardcoded hex.
- One base-URL convention: `VITE_API_BASE_URL` / `VITE_WS_BASE_URL` are the full API base **including `/api`** (dev `http://localhost:8080/api`). Both `services/apiClient.jsx` and `config/api.config.js` build on it.

### Testing Requirements
- No unit-test infra. `pnpm lint` must pass and `pnpm build` must succeed before calling a change done.

### Common Patterns
- i18n: add the key to **both** `i18n/locales/en/en.json` and `i18n/locales/vi/vi.json` — a missing key renders the raw key on the UI.
- `.jsx` extension, functional components + hooks, named exports.

## Dependencies

### Internal
- `../public/` — static assets served as-is; `../src/config/api.config.js` resolves their URLs.

### External
- react 19, react-router-dom 7, axios, antd 5, tailwindcss 4, recharts, react-i18next, js-cookie, @stomp/stompjs + sockjs-client, framer-motion, react-slick, react-markdown + remark-gfm, react-datepicker.

<!-- MANUAL: -->
