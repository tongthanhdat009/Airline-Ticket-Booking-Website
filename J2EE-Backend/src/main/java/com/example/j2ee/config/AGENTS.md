<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# config

## Purpose
Spring configuration beans: the security filter chain, CORS, WebSocket/STOMP broker, OAuth2 login handlers, caching, Flyway, password encoding and the OpenRouter/AI client wiring.

## Key Files
| File | Description |
|------|-------------|
| `SecurityConfig.java` | Stateless filter chain: permitAll/permit-by-role rules, `JwtFilter` + `AuthRateLimitFilter` placement, JSON 401/403 handlers, admin/customer auth providers. |
| `AuthRateLimitFilter.java` | Per-IP, per-endpoint quota (60 s) on sensitive auth endpoints; returns 429 without extra detail. |
| `WebSocketConfig.java` | Enables the STOMP simple broker on `/topic`, app prefix `/app`, SockJS endpoint `/ws` restricted to configured origins. |
| `OAuth2SuccessHandler.java` | Google login callback: upserts the customer/admin account, issues tokens, stores a one-time code for the frontend. |
| `OAuth2FailureHandler.java` | Redirects back to the frontend with an error flag when Google login fails. |
| `OpenRouterConfig.java` | `WebClient`/`RestClient` builders with OpenRouter headers plus the Spring AI `ChatClient` bean. |
| `CacheConfig.java` | Caffeine cache manager (5 min TTL, 100 entries) for the eight `thongKe*` statistics caches. |
| `WebConfig.java` | `RestTemplate` bean and path-match config so `*.svg`-style paths still reach controllers. |
| `FlywayConfig.java` | `FlywayMigrationStrategy` that repairs failed migrations before `migrate()`. |
| `PasswordEncoderConfig.java` | `BCryptPasswordEncoder` bean used by both auth providers. |

## For AI Agents

### Working In This Directory
- URL rules live in `SecurityConfig.securityFilterChain`; a new public endpoint needs an explicit `permitAll()` matcher there.
- `/admin/dashboard/**` and `/admin/datcho/**` use `dynamicAdminAuthManager`; per-feature rights come from `@RequirePermission` in the controller.
- The chain is stateless with CSRF disabled — tokens come from the `Authorization` header, never from cookies.
- The two `UserDetailsService` beans are qualified by name (`userAccountDetailsService`, `adminAccountDetailsService`); keep those bean names, they are referenced from `JwtFilter`.

### Testing Requirements
- Run `./mvnw test` from `J2EE-Backend/` after touching the filter chain — `ClientIdorTest` depends on the permitAll rules.

### Common Patterns
- `@Value` reads secrets from `application.properties` / `.env`; never hardcode credentials here. Cache names are declared explicitly in `CacheConfig` — a `@Cacheable` on an unlisted name silently does nothing.

## Dependencies

### Internal
- `../jwt/JwtFilter.java`, `../security/DynamicAdminAuthorizationManager.java`, `../service/RateLimitService.java`, `../service/RefreshTokenService.java` - the beans wired into this configuration.

### External
- Spring Security, Spring Web MVC, Spring WebSocket (STOMP), Spring AI (`ChatClient`), Caffeine, Flyway, OAuth2 client.

<!-- MANUAL: -->
