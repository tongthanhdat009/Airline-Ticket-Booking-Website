<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/maybay

## Purpose
Payloads for máy bay (aircraft) management and for the seat layout of an aircraft.

## Key Files
| File | Description |
|------|-------------|
| `CreateMayBayRequest.java` | Create payload: name, manufacturer, type, `soHieu`, `tongSoGhe`, `trangThai` (default `Active`), `namKhaiThac`. |
| `UpdateMayBayRequest.java` | Update payload with the same field set. |
| `MayBayResponse.java` | Aircraft view including the current airport (`currentAirport`) and created/updated/deleted timestamps. |
| `SeatLayoutRequest.java` | One seat of the layout: `maHangVe`, `soGhe`, `viTriGhe` (CỬA SỔ/LỐI ĐI/GIỮA), `hang`, `cot`. |

## For AI Agents

### Working In This Directory
- `soHieu` (tail number) is unique; deleting an aircraft renames it with a `_deleted_<id>` suffix.
- `trangThai` is a string with `Active` / `Inactive`; keep the exact casing used in the DB.
- `SeatLayoutRequest` is reused for creating and updating a single seat — the same DTO, not a separate update type.

### Testing Requirements
- Cover create/update validation in a controller test; verify the seat layout round-trips `viTriGhe` and `cot`.
- Auto seat generation is covered by the máy bay admin endpoints — extend the existing controller tests.

### Common Patterns
- `MayBayResponse` nests a `CurrentAirportDTO` (airport id, IATA code, name, city) for the aircraft's current position.
- Timestamps are `LocalDateTime`; `deletedAt` is non-null for soft-deleted aircraft.

## Dependencies

### Internal
- `../../service/MayBayService.java` - aircraft CRUD, status and restore.
- `../../service/ChiTietGheService.java` - seat CRUD on the aircraft.

### External
- Jakarta Validation - constraints on the create/update payloads.

<!-- MANUAL: -->
