<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# public

## Purpose
Static assets served as-is by Vite/Nginx, grouped by feature. No code, no build step, no imports — referenced by absolute path from JSX.

## Key Files
| File | Description |
|------|-------------|
| `jatd-logo.svg` | Primary brand logo |
| `no-product.png` | Fallback image for empty lists / missing service art |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `background/` | Page backgrounds (`auth/`, `home/`) |
| `banner/` | Promo banners (`.jpg`) |
| `chatbot/` | Chatbot art |
| `destination/` | Destination showcase images (hanoi, danang, dalat, nha-trang, phuquoc, tphcm) |
| `logo/` | Brand marks — `jadt-logo.svg`, `red.png`, `white.png` |
| `service/` | Service illustrations (`.svg`) |
| `artboard/` | Marketing artboard images (`.jpg`, `.webp`) |

## For AI Agents

### Working In This Directory
- Reference by absolute path (`/banner/x.png`), never via a JS import.
- No build pipeline touches these — optimize file size yourself before committing.
- Runtime-uploaded service images are NOT here; they live in `J2EE-Backend/uploads/` and are served via `getServiceImageUrl()` in `src/config/api.config.js`.
- In production the same files are served by nginx from `dist/` — keep filenames stable or update the callers.

### Testing Requirements
- No automated check. Verify the URL resolves in the browser (dev server port 5181) or in the nginx-served build.

### Common Patterns
- One directory per feature area; asset names are descriptive, not hashed.
- Production image URLs switch on `VITE_APP_ENV` / hostname `jadt-airline.io.vn` inside `api.config.js` — don't hardcode paths elsewhere.

## Dependencies

### Internal
- `src/config/api.config.js` — `getAssetUrl()` / `getServiceImageUrl()` resolve these paths.

### External
- None. Static files only.

<!-- MANUAL: -->
