<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# J2EE-Frontend

## Purpose
React 19 + Vite customer site + admin dashboard (Tailwind 4, Ant Design 5). Customer: 6-step booking flow, thanh toán thường nội bộ, check-in, live chat. Admin: 25+ management pages, Recharts stats, Jasper-backed exports.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Deps + scripts (`dev/build/lint/preview`) |
| `vite.config.js` | Vite config |
| `eslint.config.js` | ESLint (React Hooks + Refresh) |
<!-- 2026-10-18: scratch `src/testAPI.jsx` deleted (unreferenced) -->

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | All app code (see `src/AGENTS.md`) |
| `public/` | Static assets by feature (see `public/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `pnpm` only (pnpm 9, Node 20+). Never add npm/yarn lockfiles.
- Functional components + hooks, `.jsx` extension.
- API calls go in `src/services/` per feature, never raw `axios` in components.
- Auth: access token in cookie, refresh in localStorage, auto-refresh in `apiClient.jsx` interceptors.
- i18n keys in both `src/i18n/locales/{en,vi}/`; Vietnamese primary.

### Testing Requirements
- `pnpm lint` must pass. No unit tests currently; visual check via `pnpm dev` (port 5173) against backend on 8080.

### Common Patterns
- Route guards: `ProtectedRoute` / `AdminProtectedRoute` / `RBACProtectedRoute` / `RequireCompleteProfile`.
- Permissions via `usePermission` hook, menu-driven from backend.

## Dependencies

### Internal
- Backend API at `VITE_API_BASE_URL` (default `http://localhost:8080/api`)

### External
- react, react-router-dom@7, axios, antd, tailwindcss, recharts, react-i18next, js-cookie, sockjs-client + @stomp/stompjs, jspdf + html2canvas, xlsx

<!-- MANUAL: -->
