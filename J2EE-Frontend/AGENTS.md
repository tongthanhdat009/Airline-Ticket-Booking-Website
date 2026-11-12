<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# J2EE-Frontend

## Purpose
React 19 + Vite customer site + admin dashboard (Tailwind 4, Ant Design 5). Customer: multi-step booking flow, thanh toán thường nội bộ, check-in, live chat + AI advisor. Admin: 25+ management pages, Recharts stats, Jasper-backed exports. Single bundle serves both audiences, split by route guard.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Deps + scripts (`dev`/`build`/`lint`/`preview`) |
| `vite.config.js` | Vite config + Tailwind v4 plugin |
| `eslint.config.js` | ESLint (React Hooks + Refresh) |
| `.env.example` | Env template — copy to `.env` |
| `src/config/api.config.js` | `API_BASE_URL`, `WS_BASE_URL` + `getApiUrl`/`getAssetUrl`/`getServiceImageUrl` helpers |
<!-- 2026-10-18: scratch `src/testAPI.jsx` deleted (unreferenced) -->

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | All app code (see `src/AGENTS.md`) |
| `public/` | Static assets by feature (see `public/AGENTS.md`) |
| `dist/` | Build output, never edit or document |

## For AI Agents

### Working In This Directory
- `pnpm` only (pnpm 9, Node 20+). Never add npm/yarn lockfiles.
- Functional components + hooks, `.jsx` extension, named exports.
- API calls go in `src/services/` per feature, never raw `axios` in components.
- Use `src/config/api.config.js` helpers for URLs — never hardcode `localhost` or a host.
- Auth: access token in cookie, refresh in localStorage, auto-refresh in `src/services/apiClient.jsx` interceptors.
- i18n keys must exist in both `src/i18n/locales/en/en.json` and `src/i18n/locales/vi/vi.json`. Vietnamese primary.
- Production asset handling keys off `VITE_APP_ENV` and hostname `jadt-airline.io.vn` — check `api.config.js` before changing image URL logic.

### Testing Requirements
- `pnpm lint` must pass. No unit tests currently; visual check via `pnpm dev` (port 5181) against backend on 8080.

### Common Patterns
- Route guards: `ProtectedRoute` / `AdminProtectedRoute` / `RBACProtectedRoute` / `RequireCompleteProfile`.
- Permissions via `usePermission` hook, menu-driven from backend.
- **One base-URL convention:** `VITE_API_BASE_URL` / `VITE_WS_BASE_URL` are the full API base **including `/api`** (dev `http://localhost:8080/api`, prod `/api`). `src/config/api.config.js` and `src/services/apiClient.jsx` both build on it, and every service module calls `apiClient.get('/admin/...')` with no prefix. Drop the `/api` and every request 404s.
- Cookie `sameSite` is inconsistent by design: `utils/cookieUtils.js` uses `none` in prod / `strict` in dev; `services/apiClient.jsx` always writes `strict` (CSRF).
- `src/components/Admin/` is dormant (nothing imports it) but its imports resolve — `react-icons/fa` is the icon source used across the app, never `lucide-react` (not installed).

## Dependencies

### Internal
- Backend API at `VITE_API_BASE_URL` (local `http://localhost:8080/api`; backend context path is `/api`). `apiClient.jsx` owns this base; `api.config.js` handles host-level asset URLs.

### External
- react 19, react-dom, react-router-dom 7, axios, antd 5 + @ant-design/icons, tailwindcss 4, recharts, react-i18next + i18next, js-cookie, sockjs-client + @stomp/stompjs, framer-motion, react-slick + slick-carousel, react-markdown + remark-gfm, react-datepicker
- **No `jspdf`** — PDF export is server-side via JasperReports; Excel export is a server blob (`URL.createObjectURL`).
- `xlsx`, `html2canvas`, `adm-zip`, `aos` are declared in `package.json` but imported nowhere in `src/` — dead weight, safe to drop.

<!-- MANUAL: -->
