<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# scheduler

## Purpose
Cron-driven background jobs. Four jobs run: flight status, flight schedule generation, payment expiry and chat idle timeout. Reconciliation and audit-log cleanup live in `../service/`.

## Key Files
| File | Description |
|------|-------------|
| `PaymentExpiryScheduler.java` | Every 60 s cancels unpaid payments past their deadline: marks the payment `H`/`CANCELLED`, the order `ĐÃ HỦY`, the bookings `CANCELLED` and frees the seats. |
| `FlightAutoGenerationScheduler.java` | Clones the weekly flight pattern into a 30-day lookahead window; runs at 02:00 Asia/Ho_Chi_Minh and once at startup (`@Async` backfill). |
| `ChatIdleTimeoutScheduler.java` | Every 60 s escalates idle chat sessions: reminder at 5 min, `IDLE` at 10 min, auto-close (`RESOLVED`) at 30 min, with STOMP broadcasts. |
| `ReconciliationScheduler.java` | Daily 02:00 reconciliation of yesterday's transactions and a weekly full pass on Sunday 03:00. |

## For AI Agents

### Working In This Directory
- Every job must be safe to run twice: the flight generator skips existing dates, the payment job re-checks the unpaid flag, the chat job only touches sessions still open.
- Use the Vietnam timezone (`Asia/Ho_Chi_Minh`) for date-based jobs; the flight generator already pins it.
- The flight generator deliberately avoids one big transaction — each `save()` is its own transaction so a single bad row cannot roll back the batch.
- Do not hold a transaction open across a broadcast loop; `ChatIdleTimeoutScheduler` writes rows and then pushes to `/topic/chat/**`.

### Testing Requirements
- `src/test/java/com/example/j2ee/scheduler/FlightAutoGenerationSchedulerTest.java` is the reference test — mirror it for any new job.
- Assert the job is idempotent: running it twice must not duplicate flights or cancel twice.

### Common Patterns
- Jobs log a Vietnamese summary line (counts of created/skipped, matched/unmatched) so the outcome is greppable in the logs.
- Reconciliation and audit-log cleanup are `@Scheduled` methods inside service classes (`../service/DoiSoatGiaoDichService`, `../service/AuditLogScheduler`), not in this package.

## Dependencies

### Internal
- `../repository/` - the tables each job reads and writes.
- `../service/DoiSoatGiaoDichService.java` - reconciliation logic invoked by the scheduler.
- `../config/WebSocketConfig.java` - STOMP broker used for the chat broadcasts.

### External
- Spring `@Scheduled` / `@EventListener` / `@Async` - cron and startup triggers.
- Spring Messaging `SimpMessagingTemplate` - chat broadcasts.

<!-- MANUAL: -->
