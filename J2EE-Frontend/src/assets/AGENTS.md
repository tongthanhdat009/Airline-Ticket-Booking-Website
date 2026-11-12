<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# assets

## Purpose
Static files bundled by Vite (SVG, hand-written CSS). No runtime logic. Global styling lives in `src/index.css`; nearly all UI styling is Tailwind utility classes.

## Key Files
| File | Description |
|------|-------------|
| `react.svg` | Default Vite React logo — currently not imported anywhere |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `css/` | Hand-written CSS overrides (see `css/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Put user-facing images in `public/` (served as-is); use `assets/` for files that must be fingerprinted by Vite.
- Import with ES module syntax (`import logo from '../assets/react.svg'`) so Vite hashes the URL.
- Prefer Tailwind utilities over adding new CSS files here.
- `react.svg` is unused — delete it rather than wire it into a page.

### Testing Requirements
- No test target. Confirm the asset resolves by importing it and running `pnpm dev`.

### Common Patterns
- Files here are only reachable through an import; a bare path string will 404.
- `src/index.css` is the only globally imported stylesheet (from `src/main.jsx`).

## Dependencies

### Internal
- `../index.css` - global Tailwind entry, imported from `src/main.jsx`

### External
- none

<!-- MANUAL: -->
