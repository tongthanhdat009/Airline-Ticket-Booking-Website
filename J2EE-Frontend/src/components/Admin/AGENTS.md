<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Admin

## Purpose
Admin console chrome: sticky top header, permission-filtered sidebar, and a permission route guard. No file in this folder is imported by the running app — `pages/QuanLy/` renders its own shell — so treat it as dormant code. All imports resolve (icons via `react-icons/fa`); it compiles, it is just unused.

## Key Files
| File | Description |
|------|-------------|
| `Header.jsx` | Sticky top bar with search, notification, admin user info, and a logout that clears the `admin_access_token` / `admin_refresh_token` / `admin_user_info` cookies and routes to `/admin/dangnhap`. |
| `Sidebar.jsx` | Collapsible admin navigation; each menu item renders only when `hasPermission` from `utils/permissionUtils` passes, with submenu open/closed state held in local `useState`. |
| `PermissionProtectedRoute.jsx` | Route guard accepting either a full `permission` string or a `feature` + `action` pair; renders children when permitted, otherwise `Navigate` to `/dashboard`. |

## For AI Agents

### Working In This Directory
- Permissions are read synchronously from `../../utils/permissionUtils.js` — there is no hook, so nothing re-renders when the permission set changes.
- Keep guard prop names (`feature`, `action`, `permission`, `redirectTo`) aligned with `../common/RBACProtectedRoute.jsx`, which exports a `PermissionProtectedRoute` covering the same cases.
- Prefer `../common/RBACProtectedRoute.jsx` for new pages — it reads the live `usePermission` hook and adds role-based guards.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests, so verify the redirect behaviour with `pnpm dev` against the backend on port 8080.

### Common Patterns
- Icons come from `react-icons/fa` (the app-wide convention). `lucide-react` is **not** a dependency — do not reintroduce it.
- `Sidebar.jsx` keeps its menu open/close state locally (`useState`); the app has no sidebar context provider.
- Admin cookies use the `admin_` prefix while client cookies use `client_`; swapping one for the other silently logs the wrong session out.

## Dependencies

### Internal
- `../common/` - the live equivalents of the chrome in this folder.
- `../../utils/permissionUtils.js` - `hasPermission`, `getAdminUserInfo`, `getCurrentUsername`.
- `../../utils/cookieUtils.js` - admin token helpers used by the guard layer.

### External
- react-router-dom - `Navigate`, `Link`, `useLocation`.
- react-icons (`fa`) - icon set used by `Header.jsx` and `Sidebar.jsx`.

<!-- MANUAL: -->
