<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# constants

## Purpose
Static lookup tables shared across the app: design tokens and aircraft seat-layout templates. No I/O, no React.

## Key Files
| File | Description |
|------|-------------|
| `colorPalette.js` | JadT brand hex scale, Tailwind class maps, gradients, status colors, shadcn theme, button/badge variants |
| `aircraftConfig.js` | `AIRCRAFT_TEMPLATES` (A320/B737/B787/A350 cabin layouts), `CABIN_COLORS`, `SEAT_POSITIONS`, `COMMON_EXIT_ROWS`, `DEFAULT_CABIN_CONFIG` |

## For AI Agents

### Working In This Directory
- Add a color here instead of hardcoding hex or Tailwind classes inside a component.
- Seat-map UI reads `AIRCRAFT_TEMPLATES`; a new aircraft type is a new key there, not a new component.
- Plain module exports — import the named constant, never mutate the object at runtime.

### Testing Requirements
- `pnpm lint` must pass; check a rendered seat map / status badge after changing a token.

### Common Patterns
- `colorPalette.js` is the source of truth; `utils/colorUtils.js` and `utils/tailwindColorUtils.js` convert between hex, Tailwind classes and CSS.
- `aircraftConfig.js` mixes forms on purpose: `cabins[].backgroundColor` is a hex string, `CABIN_COLORS` holds Tailwind class strings. Do not mix them.

## Dependencies

### Internal
- `../utils/colorUtils.js` - consumes `STATUS_COLORS` and `TAILWIND_COLORS`
- `../utils/tailwindColorUtils.js` - hex ↔ Tailwind class conversions

### External
- none

<!-- MANUAL: -->
