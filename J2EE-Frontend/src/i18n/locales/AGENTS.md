<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# locales

## Purpose
One folder per supported language, each holding a single JSON bundle. The files are imported statically by `i18n/i18n.js`, so both languages ship in the initial bundle.

## Key Files
| File | Description |
|------|-------------|
| `en/en.json` | English translation bundle (see `en/AGENTS.md`) |
| `vi/vi.json` | Vietnamese translation bundle (see `vi/AGENTS.md`) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `en/` | English translations (see `en/AGENTS.md`) |
| `vi/` | Vietnamese translations (see `vi/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Add a language by creating `<lang>/<lang>.json` and registering it in the `resources` object in `i18n/i18n.js`.
- The file name must equal the folder name — `i18n.js` imports `./locales/<lang>/<lang>.json` explicitly.
- Edit both language bundles together; a missing key falls back to `vi` and then shows the raw key.

### Testing Requirements
- `pnpm lint` must pass; validate the JSON after editing (`node -e "JSON.parse(require('fs').readFileSync(p,'utf8'))"`).

### Common Patterns
- Vietnamese is the source language — treat `vi.json` as the reference when a key is ambiguous.
- Each language is one big file; add keys to the existing file rather than splitting into namespace files.

## Dependencies

### Internal
- `../i18n.js` - imports both bundles and builds the i18next resources

### External
- none

<!-- MANUAL: -->
