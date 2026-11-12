<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyHangVe

## Purpose
Admin widgets for hạng vé (fare classes). This folder holds only the grid card; the colour-theme editor and its preview live one level up in `../HangVeModal.jsx` and `../HangVeDetailModal.jsx`.

## Key Files
| File | Description |
|------|-------------|
| `HangVeCard.jsx` | Memoized card showing the hạng vé name, code, price and status, with `onView` / `onEdit` / `onDelete` actions and an optional `onRestore` shown when `showDeleted` is true. |

## For AI Agents

### Working In This Directory
- A single file in this folder — keep the card self-contained rather than adding sibling components.
- Soft-deleted fare classes are hidden by default; the card exposes `onRestore` and `showDeleted` for the trash view.
- The card is display-only: the page in `pages/QuanLy/` owns the mutation and the refresh.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Switch the hạng vé list to card view and try restoring a deleted class in `pnpm dev`.

### Common Patterns
- `onRestore` is optional — guard it before rendering the restore button.
- The hạng vé colour theme is applied through `HangVeModal` / `HangVeDetailModal`, not through this card.

## Dependencies

### Internal
- `../HangVeModal.jsx`, `../HangVeDetailModal.jsx` - colour theme editor and preview.
- `../../../pages/QuanLy/QuanLyHangVe.jsx` - the page that owns the fare-class list.
- `../../common/CardView.jsx` - renders this card in the grid.

### External
- react-icons - ticket and recycle icons.
- prop-types - runtime prop validation.

<!-- MANUAL: -->
