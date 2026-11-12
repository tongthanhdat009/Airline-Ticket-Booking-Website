<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# hooks

## Purpose
Shared React hooks: admin auth state, RBAC checks, menu loading, toasts, page title, table/grid view preference, and WebSocket subscriptions.

## Key Files
| File | Description |
|------|-------------|
| `useAuth.js` | Reads admin user info from cookie; returns `{ user, isAuthenticated, loading, refreshUserInfo }` |
| `usePermission.js` | Memoized wrappers over `utils/permissionUtils.js` — role and permission checks |
| `useMenuData.js` | Loads admin menu config via `data/adminMenuData.js`; falls back to `localStorage.userPermissions` |
| `useToast.js` | Returns `{ ToastComponent, showToast, showSuccess, showError, showInfo, hideToast }` |
| `useTitle.js` | Sets `document.title`, restores the previous title on unmount |
| `useViewToggle.js` | Table/grid mode persisted in `localStorage`; auto-switches to grid at ≤ 1024px |
| `useWebSocket.js` | STOMP/SockJS subscription to `/topic/flight-updates`; keeps the last 10 updates |
| `useCheckInWebSocket.js` | STOMP/SockJS subscription to `/topic/checkin-updates`; invokes `onCheckIn` |

## For AI Agents

### Working In This Directory
- New shared logic → a hook here; keep HTTP in `services/` and let the hook call the service.
- Name files `useXxx.js`, export both a named and a default export, and deactivate WebSocket clients on cleanup.

### Testing Requirements
- `pnpm lint` must pass (the `react-hooks` ESLint plugin is enabled).
- Verify in the browser against the backend on 8080: sidebar permissions, toast rendering, live flight and check-in updates.

### Common Patterns
- `useWebSocket` / `useCheckInWebSocket` connect only when a token cookie exists; `useWebSocket` sends `Authorization: Bearer` in the STOMP connect headers.
- `useAuth` reads cookies, not the server — it does not replace the auth checks in `services/apiClient.jsx`.

## Dependencies

### Internal
- `../services/MenuService.jsx` - menu endpoint behind `useMenuData`
- `../utils/permissionUtils.js` - role/permission checks; `../utils/cookieUtils.js` - token cookies read by `useWebSocket`
- `../config/api.config.js`, `../components/common/Toast` - `WS_BASE_URL` for both STOMP hooks; component rendered by `useToast`

### External
- @stomp/stompjs + sockjs-client - STOMP over WebSocket transport

<!-- MANUAL: -->
