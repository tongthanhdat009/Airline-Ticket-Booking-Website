<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# config

## Purpose
Runtime configuration for URLs and environment-dependent paths. Single source of truth for where the backend, WebSocket broker, uploaded images, and OAuth endpoints live.

## Key Files
| File | Description |
|------|-------------|
| `api.config.js` | `API_BASE_URL`, `WS_BASE_URL` and helpers `getApiUrl`, `getAssetUrl`, `getServiceImageUrl`, `getServiceOptionImageUrl`, `getOAuthUrl`, `getPdfUrl` |

## For AI Agents

### Working In This Directory
- Change endpoints here; never inline a `localhost:8080` string in a component or service.
- `VITE_API_BASE_URL` / `VITE_WS_BASE_URL` are the **full API base including `/api`** (dev `http://localhost:8080/api`, prod `/api`). `api.config.js` and `services/apiClient.jsx` both build on it, and service modules call `apiClient.get('/admin/...')` with no prefix — do not strip or double the `/api`.
- New env vars use `import.meta.env.VITE_*` and need a matching key in every deploy environment.

### Testing Requirements
- `pnpm lint` must pass; verify in the browser via `pnpm dev` that requests hit the configured base (Network tab).

### Common Patterns
- `getAssetUrl` / `getServiceImageUrl` branch on production: nginx serves uploads in prod, the API serves them in dev.
- Production is detected by `VITE_APP_ENV === 'production'` or hostname `jadt-airline.io.vn`.
- The URL helpers pass through absolute `http://`, `https://`, `blob:` and `data:` inputs unchanged.

## Dependencies

### Internal
- `../services/apiClient.jsx` - separate axios instance with its own base URL and auth interceptors

### External
- Vite `import.meta.env` - build-time env injection

<!-- MANUAL: -->
