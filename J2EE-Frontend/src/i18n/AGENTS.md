<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# i18n

## Purpose
i18next / react-i18next setup. Initializes the `en` and `vi` translation resources and picks the active language from `localStorage.language`.

## Key Files
| File | Description |
|------|-------------|
| `i18n.js` | i18next instance, `initReactI18next`, resource bundle, `lng` from `localStorage` (default `vi`) |

## Subdirectories
| Directory | Purpose |
|-----------|-------------|
| `locales/` | Translation resources per language (see `locales/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Add keys to both `en/en.json` and `vi/vi.json`; a key present in only one file renders the raw key on the UI.
- Use `useTranslation()` in components instead of hardcoding Vietnamese strings in JSX.
- Keep the namespace set identical in both files — a missing top-level section fails silently.

### Testing Requirements
- `pnpm lint` must pass; switch language in the running app and check every touched screen for raw keys.

### Common Patterns
- There is a single `translation` namespace, so keys are written as `t('section.key')` with no namespace prefix.
- Vietnamese is the primary and fallback language.
- The chosen language persists in `localStorage.language`; switching it reloads the app.

## Dependencies

### Internal
- `locales/en/en.json`, `locales/vi/vi.json` - translation resources

### External
- i18next + react-i18next - translation runtime

<!-- MANUAL: -->
