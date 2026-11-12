<!-- Parent: ../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# scheduler (test)

## Purpose
Unit tests for the scheduled jobs, driven by a fixed date so the time window is deterministic.

## Key Files
| File | Description |
|------|-------------|
| `FlightAutoGenerationSchedulerTest.java` | P0-4 coverage — a cold start (no flights anywhere) creates nothing; a weekly template is cloned together with its dịch vụ cung cấp; a duplicate flight number is skipped; a máy bay schedule conflict is skipped; a date that already has flights is not regenerated. |

## For AI Agents

### Working In This Directory
- The scheduler is built by hand (`new FlightAutoGenerationScheduler(repository)`) with a mocked `ChiTietChuyenBayRepository` — no `@SpringBootTest`, no clock injection.
- `today` is pinned to a fixed `LocalDate` (Monday 2026-03-02) because the job clones the template from `today - 7`; never use `LocalDate.now()` here.
- Assert on the saved entity with an `ArgumentCaptor<ChiTietChuyenBay>` and check `trangThai`, `dichVuCungCap`, `daXoa` and `deletedAt`.

### Testing Requirements
- Run `./mvnw test` from `J2EE-Backend/`.
- A change to `FlightAutoGenerationScheduler` must keep all five cases green: cold start, weekly clone, duplicate number, aircraft conflict, existing date.

### Common Patterns
- `repository.existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(...)` guards the flight number, `repository.existsAircraftScheduleConflict(...)` guards the máy bay — stub both.
- Cloned flights must start as "Đang mở bán" with `daXoa=false` and `deletedAt=null`.
- `cloneFlight(...)` returns `false` when it skips; the test asserts that instead of checking the repository.

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/scheduler/FlightAutoGenerationScheduler.java` - the class under test.
- `src/main/java/com/example/j2ee/repository/ChiTietChuyenBayRepository.java` - the mocked query contract.

### External
- JUnit 5 + Mockito; Java `LocalDate`/`LocalTime` for the fixed time window.

<!-- MANUAL: -->
