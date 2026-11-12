<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# validation

## Purpose
One custom Bean Validation constraint for date ranges, used where a request object carries both a start and an end timestamp.

## Key Files
| File | Description |
|------|-------------|
| `ValidDateRange.java` | Class-level constraint annotation; default message "Ngày kết thúc phải sau ngày bắt đầu". |
| `DateRangeValidator.java` | Validator that reflects `ngayBatDau` / `ngayKetThuc` and requires the end to be strictly after the start. |

## For AI Agents

### Working In This Directory
- The validator reads the fields `ngayBatDau` and `ngayKetThuc` by name via reflection — rename those fields and the constraint silently fails.
- The target type must be a class with both `LocalDateTime` fields; the cast to `LocalDateTime` fails otherwise.
- Null fields return valid (true) and let `@NotNull` produce the error message instead.
- The default message is Vietnamese, matching the rest of the API.

### Testing Requirements
- Add a validator unit test under `src/test/java/com/example/j2ee/validation/` when the rule changes.
- Check the endpoint still answers 400 with the field error map (`GlobalExceptionHandler` handles `MethodArgumentNotValidException`).

### Common Patterns
- Type-level annotation (`@Target(ElementType.TYPE)`), applied to the request DTO class.
- Any reflection failure is swallowed and reported as invalid, so a bad target type fails validation rather than crashing.

## Dependencies

### Internal
- `../dto/` - request DTOs that carry `ngayBatDau` / `ngayKetThuc`.

### External
- Jakarta Validation - `@Constraint`, `ConstraintValidator`.

<!-- MANUAL: -->
