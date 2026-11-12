<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# common

## Purpose
Shared UI used by both the customer site and the admin console: navigation chrome, route guards, toasts, dialogs, table/card layout helpers and the AI advisor chat widget. Check here first before adding a widget anywhere else.

## Key Files
| File | Description |
|------|-------------|
| `Navbar.jsx` | Customer top nav; auth state from the client cookies, language switcher persisted to `localStorage.language`. |
| `Footer.jsx` | Site footer with i18n link columns (điều lệ vận chuyển, điều khoản vé, e-Voucher…). |
| `Toast.jsx` | Auto-dismiss toast (success / error / info / warning) with a configurable `duration`. |
| `ConfirmDialog.jsx` | Reusable confirmation modal with `warning` / `danger` / `info` variants. |
| `ErrorBoundary.jsx` | Class component boundary that renders a fallback with reset and reload actions. |
| `ProtectedRoute.jsx` | Default export = client route guard (`/dang-nhap-client`); also exports `AdminProtectedRoute` for `/admin` routes. |
| `RBACProtectedRoute.jsx` | Exports `PermissionProtectedRoute`, `RoleProtectedRoute`, `IfHasPermission`, `IfHasRole` — all backed by the `usePermission` hook. |
| `AuthGuard.jsx` | Exports `LoginGuard`, `RegisterGuard`, `AdminLoginGuard` that redirect away from a login page when the session already exists. |
| `RequireCompleteProfile.jsx` | Route guard that requires a completed profile (phone + birth date) before rendering children. |
| `ProfileCompleteBanner.jsx` | Dismissible banner (session key `profileBannerDismissed`) reminding the user to finish their profile. |
| `CardView.jsx` | Memoized responsive grid wrapper (1 → 4 columns) with empty state, driven by a `renderCard(item, index)` callback. |
| `ResponsiveTable.jsx` | Memoized table wrapper with horizontal scroll and optional sticky header. |
| `ViewToggleButton.jsx` | Table / grid switch button pair used next to `CardView` and `ResponsiveTable`. |
| `ScrollToTop.jsx` | Scrolls to the top on every pathname change so browser Back lands at the page top. |
| `AdvisorChatWidget.jsx` | AI advisor chat bubble; streams replies via `AdvisorChatService`, renders markdown, keeps history in `localStorage.advisor_chat_history`. |

## For AI Agents

### Working In This Directory
- New shared widget goes here; feature-only UI belongs in its area folder. Duplication between `common/` and `QuanLy/` is the usual failure.
- Guards come in two flavours: `RBACProtectedRoute` uses the live `usePermission` hook, `AuthGuard` checks cookies synchronously so the browser Back button behaves.
- Render guard components with `children` — they call `Navigate` themselves on denial, no wrapping `<Navigate>` needed.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Check guards and empty states visually via `pnpm dev` against the backend on port 8080.

### Common Patterns
- `ErrorBoundary` is the only class component here; everything else is a function component with hooks.
- `CardView` and `ResponsiveTable` are `React.memo` wrappers around a render callback — do not fetch inside them, the owning page holds the data.
- `AdvisorChatWidget` truncates stored history to `MAX_HISTORY_TURNS = 10`; markdown is rendered by `react-markdown` (no raw HTML, so it is XSS-safe).

## Dependencies

### Internal
- `../../hooks/usePermission.js` - live permission and role lookup behind `RBACProtectedRoute`.
- `../../utils/cookieUtils.js` - client and admin token helpers used by the guards.
- `../../utils/profileUtils.js`, `../../services/TaiKhoanService.jsx` - profile-completeness check and profile lookup.
- `../../services/AdvisorChatService.jsx` - streaming chat backend used by the advisor widget.
- `../../i18n/locales/{en,vi}/` - navbar, footer and toast copy.

### External
- react-router-dom - `Navigate`, `Link`, `useLocation`.
- react-i18next - translated chrome.
- react-icons / react-markdown + remark-gfm - icons and chat markdown.
- tailwindcss - all styling.

<!-- MANUAL: -->
