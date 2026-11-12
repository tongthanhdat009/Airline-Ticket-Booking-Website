<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# serializer

## Purpose
Custom Jackson deserializers that let the API accept time values in more than one format.

## Key Files
| File | Description |
|------|-------------|
| `CustomLocalTimeDeserializer.java` | Parses `LocalTime` from `HH:mm`, falling back to ISO `HH:mm:ss`; returns null for blank input, throws `IOException` otherwise. |

## For AI Agents

### Working In This Directory
- Apply the deserializer with `@JsonDeserialize(using = CustomLocalTimeDeserializer.class)` on the DTO field — registration alone does nothing.
- The parser is lenient on input but strict on failure: an unparsable value raises `IOException`, which `GlobalExceptionHandler` maps to 400.
- Keep the field null-safe: blank strings return `null` instead of throwing, so optional times stay optional.

### Testing Requirements
- Add a Jackson round-trip test under `src/test/java/com/example/j2ee/serializer/` when changing accepted formats.
- Verify the DTO still parses `null` and empty string without error.

### Common Patterns
- One deserializer per non-standard type; DTOs own the annotation, the class stays stateless.
- Message text is English here, unlike the Vietnamese user-facing messages elsewhere.

## Dependencies

### Internal
- `../dto/` - DTOs that reference this deserializer.

### External
- Jackson Databind - `JsonDeserializer`, `DeserializationContext`.

<!-- MANUAL: -->
