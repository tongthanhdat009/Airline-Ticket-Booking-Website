<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# vi

## Purpose
Vietnamese translation bundle — the primary language of the product. One JSON file with 12 top-level namespaces, mirrored key for key by the English bundle.

## Key Files
| File | Description |
|------|-------------|
| `vi.json` | All Vietnamese strings; namespaces `auth`, `booking`, `common`, `common_extra`, `destinations`, `footer`, `home`, `home_page`, `navbar`, `pages`, `payment`, `validation` |

## For AI Agents

### Working In This Directory
- This is the reference bundle: when a key is ambiguous, decide the Vietnamese wording here first, then mirror it into `en.json`.
- Add or change a key only together with the same key in `en/en.json`.
- Keys are flat inside a namespace and are addressed as `t('<namespace>.<key>')`.

### Testing Requirements
- `pnpm lint` must pass; verify the rendered string in the running app with the default language (`vi`).

### Common Patterns
- Vietnamese is both the default (`lng`) and the `fallbackLng` in `i18n/i18n.js`, so a missing `en` key still renders Vietnamese.
- `common` and `common_extra` both hold shared labels; `common_extra` exists so widely used `common` keys do not churn.
- `home` and `home_page` coexist — check which one a screen already uses before adding to the other.

## Dependencies

### Internal
- `../../i18n.js` - registers this file as the `vi` translation resource and fallback
- `../../../en/en.json` - counterpart bundle, kept in sync

### External
- none

<!-- MANUAL: -->
