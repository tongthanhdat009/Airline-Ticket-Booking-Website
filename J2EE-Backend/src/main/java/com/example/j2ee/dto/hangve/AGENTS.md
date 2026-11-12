<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/hangve

## Purpose
Payloads for hạng vé (ticket class / cabin) management, including the UI colour theme stored per hạng vé.

## Key Files
| File | Description |
|------|-------------|
| `CreateHangVeRequest.java` | Create payload: name, description, the seven theme colours (`mauNen`, `mauVien`, `mauChu`, `mauHeader`, `mauIcon`, `mauRing`, `mauBadge`) and `hangBac`. |
| `UpdateHangVeRequest.java` | Same field set as create, used for updates. |
| `HangVeResponse.java` | Hạng vé view plus usage counters (`soLuongGhe`, `soLuongGia`) and `deletedAt`. |

## For AI Agents

### Working In This Directory
- The colour fields are Tailwind class strings consumed by the admin UI; keep the exact names, they are stored as-is.
- `hangBac` is the class rank used when ordering hạng vé; it is a string, not a number.
- Deleting a hạng vé renames it (`tenhangve` gets a `_deleted_<id>` suffix) so the unique key stays free.

### Testing Requirements
- Cover create/update validation in a controller test; verify the colour fields round-trip unchanged.
- Confirm `soLuongGhe`/`soLuongGia` counts stay correct after a seat or fare is created.

### Common Patterns
- Create and update DTOs are intentionally identical — keep them in sync when adding a field.
- `HangVeResponse` includes soft-delete metadata because the admin list shows deleted rows separately.

## Dependencies

### Internal
- `../../service/HangVeService.java` - CRUD, soft delete and restore.
- `../../model/HangVe.java` - entity holding the theme colours.

### External
- Jakarta Validation - constraints on the create/update payloads.

<!-- MANUAL: -->
