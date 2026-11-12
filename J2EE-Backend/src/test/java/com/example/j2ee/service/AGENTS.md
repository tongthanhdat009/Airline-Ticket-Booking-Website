<!-- Parent: ../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# service (test)

## Purpose
Unit tests for the business-logic layer: đơn hàng lifecycle, quên mật khẩu OTP, one-time OAuth2 codes and the login rate limiter.

## Key Files
| File | Description |
|------|-------------|
| `DonHangServiceTest.java` | Reference example. Covers filtered/sorted listing via `Specification` + `Sort`, `getDonHangById`/`getDonHangByPnr`, valid and invalid `updateTrangThai` transitions, `huyDonHang` (success, already cancelled, hành khách đã check-in, chuyến bay đã khởi hành) and `restoreDonHang`. |
| `ForgotPasswordServiceTest.java` | OTP flow: unknown email is silent, a second request inside the cooldown is blocked, five wrong attempts lock the OTP out, `resetPassword` burns the OTP, a wrong attempt before a correct one resets the counter. |
| `OAuth2CodeServiceTest.java` | `create` returns a non-blank code; `consume` returns the access/refresh tokens + email once and `null` afterwards; unknown, null and empty codes return `null`. |
| `RateLimitServiceTest.java` | `tryAcquire` allows up to the limit, denies beyond it, keeps different keys independent, and `clear()` resets the counters. |

## For AI Agents

### Working In This Directory
- Mockito only: `@ExtendWith(MockitoExtension.class)` with `@Mock` repositories/services and `@InjectMocks` for the class under test; `ForgotPasswordServiceTest` calls the constructor directly instead.
- These tests never touch Spring, the database or the network — a new test that needs a container or a mail server does not belong here.
- Assert both the returned DTO and the interaction (`verify(repo).save(...)`, `verify(repo, never()).save(...)`) so a silent write is caught.

### Testing Requirements
- Run `./mvnw test` from `J2EE-Backend/`.
- New service logic needs a test here, mirroring the `src/main` package; copy the shape of `DonHangServiceTest`.
- Assert the exact Vietnamese message when a method is expected to throw `IllegalArgumentException`.

### Common Patterns
- Domain state is set through the entity setters (`ĐÃ THANH TOÁN`, `ĐÃ HỦY`, `CHỜ THANH TOÁN`) — keep the strings identical to the ones in `model/`.
- `IllegalArgumentException` is the standard "business rule rejected" signal for services.
- OTP/rate-limit state lives in the service instance, so each test needs a fresh instance (`@BeforeEach`).

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/service/DonHangService.java`, `ForgotPasswordService.java`, `OAuth2CodeService.java`, `RateLimitService.java` - the classes under test.
- `src/main/java/com/example/j2ee/dto/donhang/` - the response/request DTOs asserted on.

### External
- JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`, `ArgumentCaptor`) - no Spring context.

<!-- MANUAL: -->
