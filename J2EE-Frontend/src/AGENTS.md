<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

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
| `services/` | 25+ per-feature API modules over `apiClient.jsx` |
| `hooks/` | `useAuth`, `usePermission`, `useToast`, `useWebSocket` (+chat/checkin/admin variants), `useMenuData`, `useTitle`, `useViewToggle` |
| `config/` | `api.config.js` (base URL / env) |
| `constants/` | `aircraftConfig.js`, `colorPalette.js` |
| `data/` | `adminMenuData.js` (fallback menu) |
| `utils/` | `cookieUtils`, `permissionUtils`, `profileUtils`, `colorUtils`, `tailwindColorUtils` |
| `i18n/locales/{en,vi}/` | Translations; add keys to both |
| `assets/css/` | `TrangChuAdmin.css` (only hand CSS; rest is Tailwind) |

## For AI Agents
- New API call → add function in matching `services/<Feature>Service.jsx`, reuse `apiClient.jsx` (auth/refresh/user-type handled there).
- New route page → `pages/<KhachHang|QuanLy>/` + guard (`ProtectedRoute` vs `AdminProtectedRoute`) + menu entry if admin.
- Shared UI → `components/common/`; check it doesn't already exist before adding.
- Colors via `constants/colorPalette.js` + `utils/tailwindColorUtils.js`, not hardcoded hex.

<!-- MANUAL: -->
