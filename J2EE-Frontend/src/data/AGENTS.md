<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# data

## Purpose
Static admin menu configuration and permission mappings. The backend is the primary source; the tables here are the fallback.

## Key Files
| File | Description |
|------|-------------|
| `adminMenuData.js` | `adminMenuItems` fallback tree, `permissionMapping`, `actionList`, `rolePermissions`, `roleNames`, icon map, and the `fetchMenuItems` / `fetchMenuConfig` API loaders |

## For AI Agents

### Working In This Directory
- Prefer the API-driven path (`fetchMenuConfig` → `services/MenuService.jsx`); edit the hardcoded `adminMenuItems` only for a genuinely new screen.
- Permission keys follow `{FEATURE_CODE}_{ACTION}` (e.g. `FLIGHT_VIEW`) and must match the backend codes exactly.
- A new menu route also needs its icon component registered in `iconMap`, otherwise it falls back to `FaUsers`.

### Testing Requirements
- `pnpm lint` must pass; open the admin sidebar with different roles and confirm items appear/vanish per permission.

### Common Patterns
- `fetchMenuConfig` rethrows on API failure; `useMenuData` catches it and falls back to `localStorage.userPermissions`.
- `fetchMenuItems` injects a synthetic `Hạng vé` entry sharing `PRICE_VIEW` whenever `GiaBay` is present.
- `rolePermissions` / `roleNames` are legacy static tables kept for offline role resolution.

## Dependencies

### Internal
- `../services/MenuService.jsx` - backend menu endpoints (`/admin/dashboard/menu/*`)
- `../hooks/useMenuData.js` - consumes `fetchMenuConfig`

### External
- react-icons - icon components mapped from the backend `uiIcon` strings

<!-- MANUAL: -->
