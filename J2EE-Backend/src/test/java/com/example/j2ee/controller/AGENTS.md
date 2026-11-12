<!-- Parent: ../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# controller (test)

## Purpose
Tests for the controller layer without a web server: authorization (IDOR), duplicate-key message mapping and the Jasper hóa đơn template contract.

## Key Files
| File | Description |
|------|-------------|
| `ClientIdorTest.java` | D-9/D-10 checks — user A must not read, update, change the password of, list bookings of, or cancel user B's tài khoản/đặt chỗ; asserts 403 plus `verifyNoInteractions`/`never()`. |
| `DuplicateMessageTest.java` | `ClientDatChoController.resolveDuplicateMessage` maps a CCCD unique violation to a "CCCD" message, a seat violation to a "Ghế" message, a generic unique violation to a generic message, and a non-duplicate exception to `null`. |
| `InvoiceReportTemplateTest.java` | D-11 regression — compiles `jasper/invoice_report.jrxml`, fills it with the exact map shape `ClientInvoiceController` sends, and exports a PDF. |

## For AI Agents

### Working In This Directory
- Controllers are built by hand with `@InjectMocks` plus mocked services/repositories — no MockMvc, no HTTP layer.
- A logged-in customer is simulated with `new UsernamePasswordAuthenticationToken(email, null, List.of())` in `SecurityContextHolder`; clear it in `@AfterEach`.
- Every authorization regression asserts 403 **and** that the service was never reached (`verify(service, never())...`).

### Testing Requirements
- Extend `ClientIdorTest` for a new customer-facing endpoint instead of adding a second IDOR harness.
- Run `./mvnw test` from `J2EE-Backend/`; after editing `jasper/invoice_report.jrxml` also run `InvoiceReportTemplateTest`.
- No `@SpringBootTest` here — booting the context would pull in the MySQL-only Flyway migrations.

### Common Patterns
- The 403 comes from the controller comparing the requested id/email against the authenticated principal; the test asserts the status, not the body.
- `resolveDuplicateMessage` is a static helper on `ClientDatChoController`; its output must stay Vietnamese and must not leak SQL constraint names such as `UK_madinhdanh`.
- Template field names in `InvoiceReportTemplateTest` are the same keys the controller puts in the map — change both together.

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/controller/TaiKhoanController.java`, `ClientDatChoController.java` - the classes under test.
- `src/main/resources/jasper/invoice_report.jrxml` - the template under test.

### External
- JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`); JasperReports - compile/fill/export in the template test.

<!-- MANUAL: -->
