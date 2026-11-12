<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyLichSuThaoTac

## Purpose
The admin card for the lịch sử thao tác (audit log) list. It shows one recorded admin action in the grid view of the audit screen.

## Key Files
| File | Description |
|------|-------------|
| `LichSuCard.jsx` | Memoized card showing the actor, action, target table/record, and timestamp, with a single `onView` action. |

## For AI Agents

### Working In This Directory
- A single file in this folder — the audit log has no other admin widgets.
- The card is read-only: no `onEdit` / `onDelete` are offered, and none should be added — audit entries are immutable.
- The record fields mirror the backend audit-log table written by `AuditLogAspect` on the server; do not invent extra columns.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Perform an admin action and confirm it shows up in the lịch sử thao tác list in `pnpm dev`.

### Common Patterns
- The audit log is produced by the backend `@Auditable` annotation — this card only displays it, it never writes.
- `onView` opens the detail view supplied by the page; the card holds no selection state.

## Dependencies

### Internal
- `../../../services/AuditLogService.jsx` - audit log list and detail endpoints.
- `../../../pages/QuanLy/QuanLyLichSuThaoTac.jsx` - the page that owns the audit list.

### External
- react-icons - history, clock, user and database icons.
- prop-types - runtime prop validation.

<!-- MANUAL: -->
