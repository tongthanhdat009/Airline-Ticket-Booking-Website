<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# jwt

## Purpose
JWT issuing and parsing. `JwtUtil` builds/validates tokens; `JwtFilter` turns a valid access token into an `Authentication` in the `SecurityContext`.

## Key Files
| File | Description |
|------|-------------|
| `JwtUtil.java` | Builds access/refresh tokens with `typ`, `role`/`roles`, `permissions`, `adminId` claims; signs HS256 from `jwt.secret`. |
| `JwtFilter.java` | `OncePerRequestFilter` that reads the `Authorization: Bearer` header and populates the security context. |

## For AI Agents

### Working In This Directory
- Access tokens expire per `jwt.access-expiration`, refresh tokens per `jwt.refresh-expiration`; rotation lives in `../service/RefreshTokenService.java`.
- Every token carries `typ` (`access` or `refresh`); `JwtFilter` ignores refresh tokens so they cannot authenticate a request.
- The filter never returns 401 itself — on any failure it clears the context and continues the chain as anonymous; Spring Security decides the outcome.
- Admin tokens embed `adminId`, `roles` and `permissions`, so `AdminUserDetails.fromToken` is built without a DB query; regular users are loaded from the DB.

### Testing Requirements
- Token round-trip changes belong in a unit test under `src/test/java/com/example/j2ee/jwt/` (sign → parse → validate).
- Auth-flow regressions are covered end-to-end in `src/test/java/com/example/j2ee/controller/ClientIdorTest.java`.

### Common Patterns
- `JwtFilter` skips `OPTIONS`, `/api/ws` (WebSocket handshake) and static image extensions.
- Claims are read through `getClaim(token, resolver)`; unparsable tokens return `false` from `validate()` instead of throwing.
- Refresh-token rotation and revocation are DB-backed (`refreshtoken` table), not stateless.

## Dependencies

### Internal
- `../security/AdminUserDetails.java` - principal type built from admin token claims.
- `../service/RefreshTokenService.java` - persists, rotates and revokes refresh tokens.
- `../config/SecurityConfig.java` - installs `JwtFilter` in the filter chain.

### External
- JJWT 0.11.5 (`io.jsonwebtoken`) - token build/parse, HS256 signing.
- Spring Security - `OncePerRequestFilter`, `UsernamePasswordAuthenticationToken`.

<!-- MANUAL: -->
