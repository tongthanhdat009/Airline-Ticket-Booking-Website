<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# css

## Purpose
Hand-written CSS for admin screens. The rest of the app styles itself with Tailwind utilities, so this directory stays nearly empty.

## Key Files
| File | Description |
|------|-------------|
| `TrangChuAdmin.css` | `fadeIn` keyframes plus the `.animate-fadeIn` helper used by the admin home screen |

## For AI Agents

### Working In This Directory
- Add a rule only when Tailwind cannot express it (keyframes, complex pseudo-selectors).
- Import the stylesheet from the consuming component; do not add it to `src/main.jsx`.
- Class names are global here — prefix them (`animate-fadeIn`, `admin-…`) to avoid collisions.

### Testing Requirements
- `pnpm lint` must pass; visually confirm the animation on the admin home screen via `pnpm dev`.

### Common Patterns
- `TrangChuAdmin.css` is not imported by any file today — importing it is the caller's job, do not assume it is active.
- Tailwind 4 is configured through `@tailwindcss/vite` in `src/index.css`, not through a `tailwind.config.js`.

## Dependencies

### Internal
- none

### External
- none

<!-- MANUAL: -->
