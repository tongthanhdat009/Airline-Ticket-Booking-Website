<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-18 -->

# src/test

## Purpose
Backend unit tests, JUnit 5 + Mockito, H2 in-memory.

## Key Files
| File | Description |
|------|-------------|
| `J2EeBackendApplicationTests.java` | Context-load smoke test |
| `service/DonHangServiceTest.java` | Order service unit tests (reference example) |
| `scheduler/FlightAutoGenerationSchedulerTest.java` | Scheduler tests |
| `controller/ClientIdorTest.java` | Customer API auth/IDOR checks |
| `controller/InvoiceReportTemplateTest.java` | Jasper invoice template test |
| `exception/GlobalExceptionHandlerTest.java` | Error-mapping tests |
| `util/SecurityUtilTest.java` | Security util tests |

## For AI Agents
- New service logic → add/extend test here mirroring `src/main` package. Run `./mvnw test` from `J2EE-Backend/`.
- Security-sensitive controller change → extend `ClientIdorTest`, don't add a new harness.

<!-- MANUAL: -->
