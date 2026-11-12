<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# en

## Purpose
English translation bundle. One JSON file with 12 top-level namespaces, mirrored key for key by the Vietnamese bundle.

## Key Files
| File | Description |
|------|-------------|
| `en.json` | All English strings; namespaces `auth`, `booking`, `common`, `common_extra`, `destinations`, `footer`, `home`, `home_page`, `navbar`, `pages`, `payment`, `validation` |

## For AI Agents

### Working In This Directory
- Add or change a key only together with the same key in `vi/vi.json`.
- Keys are flat inside a namespace and are addressed as `t('<namespace>.<key>')`.
- A new namespace is a new top-level object in the JSON — add it to `vi.json` in the same change.

### Testing Requirements
- `pnpm lint` must pass; verify the rendered string in the running app with the language set to `en`.

### Common Patterns
- `common` and `common_extra` both hold shared labels; `common_extra` exists so widely used `common` keys do not churn.
- `home` and `home_page` coexist — check which one a screen already uses before adding to the other.
- Keep values as plain strings; i18next `{{var}}` interpolation is the only templating used.

## Dependencies

### Internal
- `../../i18n.js` - registers this file as the `en` translation resource
- `../../../vi/vi.json` - counterpart bundle, kept in sync

### External
- none

<!-- MANUAL: -->
