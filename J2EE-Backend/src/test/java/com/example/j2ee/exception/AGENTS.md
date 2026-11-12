<!-- Parent: ../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# exception (test)

## Purpose
Tests for the single `@RestControllerAdvice` that maps every exception to an `ApiResponse` envelope with the right HTTP status.

## Key Files
| File | Description |
|------|-------------|
| `GlobalExceptionHandlerTest.java` | D-6/D-8/D-15 checks — a `ResponseStatusException` stays 403 without leaking the internal permission name (`FLIGHT_VIEW`), a generic exception returns 500 with a common message that hides internals, and `IllegalArgumentException` stays 400 with its own message. |

## For AI Agents

### Working In This Directory
- The handler is instantiated directly (`new GlobalExceptionHandler()`), then a single `@ExceptionHandler` method is called — no Spring context, no `MockMvc`.
- One test per handler method; assert both the HTTP status and the `ApiResponse` body (`isSuccess()`, `getMessage()`).

### Testing Requirements
- Add a test here for every new `@ExceptionHandler` in `src/main/java/com/example/j2ee/exception/GlobalExceptionHandler.java`.
- Run `./mvnw test` from `J2EE-Backend/`.

### Common Patterns
- Permission denial must stay 403 and the permission name must never reach the response body — assert with `assertFalse(body.getMessage().contains("FLIGHT_VIEW"))`.
- System errors must return 500 with a generic Vietnamese message; assert the original message and package name are absent.
- `ResponseStatusException` keeps its own status; `IllegalArgumentException` keeps its own message.

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/exception/GlobalExceptionHandler.java` - the class under test.
- `src/main/java/com/example/j2ee/dto/ApiResponse.java` - the response envelope asserted on.

### External
- JUnit 5 `Assertions`; Spring MVC (`ResponseStatusException`, `ResponseEntity`).

<!-- MANUAL: -->
