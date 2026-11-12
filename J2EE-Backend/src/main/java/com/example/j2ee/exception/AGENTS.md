<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# exception

## Purpose
Single `@RestControllerAdvice` that maps every exception thrown by the app to a consistent `ApiResponse` envelope with the right HTTP status.

## Key Files
| File | Description |
|------|-------------|
| `GlobalExceptionHandler.java` | Maps `ResponseStatusException`, validation, type-mismatch, missing-param, unreadable-body, constraint, 404, duplicate-key and generic exceptions to `ApiResponse`. |

## For AI Agents

### Working In This Directory
- Add new mappings here, not in `@ExceptionHandler` methods on individual controllers — one advice class owns all error mapping.
- Unknown exceptions must return a generic Vietnamese message; never put `ex.getMessage()` in a 500 response.
- Duplicate-key detection unwraps the cause chain (`TransactionSystemException`, `JpaSystemException`, `PersistenceException`) to catch commit-time unique violations and return 409.
- 403 responses are sanitised to "Bạn không có quyền thực hiện thao tác này" so permission and role names stay internal.

### Testing Requirements
- Extend `src/test/java/com/example/j2ee/exception/GlobalExceptionHandlerTest.java` for every new mapping.
- Assert both the HTTP status and the `ApiResponse` body shape (`success`/`message`/`data`).

### Common Patterns
- Vietnamese user-facing messages; internal detail goes to the server log only.
- `MethodArgumentNotValidException` returns 400 with a `field -> message` map inside `data`.
- `ResponseStatusException` keeps its own status; everything else falls back to 500.

## Dependencies

### Internal
- `../dto/ApiResponse.java` - the envelope every error response uses.
- `../annotation/` + `../aspect/PermissionAspect.java` - source of the 403 `ResponseStatusException`.

### External
- Spring MVC (`@RestControllerAdvice`, `@ExceptionHandler`) - global error handling.
- Jakarta Validation - `ConstraintViolationException`, `MethodArgumentNotValidException`.

<!-- MANUAL: -->
