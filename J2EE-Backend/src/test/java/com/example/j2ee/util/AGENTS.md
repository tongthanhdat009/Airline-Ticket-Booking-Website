<!-- Parent: ../../../../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# util (test)

## Purpose
Tests for the static helpers that read the current caller out of the Spring `SecurityContext` — the basis of every IDOR guard.

## Key Files
| File | Description |
|------|-------------|
| `SecurityUtilTest.java` | D-9/D-10 ownership checks — an anonymous principal and an admin get no customer email; an empty context denies everything; a customer matches its own email case-insensitively; ownership resolves through the linked `TaiKhoan` first and falls back to the `HanhKhach` email for guest bookings. |

## For AI Agents

### Working In This Directory
- `SecurityUtil` is a static helper class, not a Spring bean — call the methods directly, there is nothing to inject.
- The principal is faked with `new UsernamePasswordAuthenticationToken(email, null, List.of())`; an admin is faked with `AdminUserDetails.fromToken(...)` so the helper must not treat it as a customer.
- Clear `SecurityContextHolder` in `@AfterEach`, otherwise the next test inherits the previous principal.

### Testing Requirements
- Extend `SecurityUtilTest` for every new helper or changed comparison in `src/main/java/com/example/j2ee/util/SecurityUtil.java`.
- An ownership change must also be re-verified in `src/test/java/com/example/j2ee/controller/ClientIdorTest.java`.
- Run `./mvnw test` from `J2EE-Backend/`.

### Common Patterns
- `getCurrentCustomerEmail()` returns `null` for admins and for anonymous principals — a null result must fail closed.
- `isSelf` compares emails case-insensitively; `isOwnerOf` prefers `HanhKhach.taiKhoan.email` over `HanhKhach.email` (guest booked before registering).
- Anonymous is expressed with `AnonymousAuthenticationToken`, not with a missing context — both cases are asserted separately.

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/util/SecurityUtil.java` - the class under test.
- `src/main/java/com/example/j2ee/security/AdminUserDetails.java`, `src/main/java/com/example/j2ee/model/HanhKhach.java` - the principal and ownership target.

### External
- Spring Security core (`SecurityContextHolder`, `UsernamePasswordAuthenticationToken`, `AnonymousAuthenticationToken`).

<!-- MANUAL: -->
