<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Airline Ticket Booking Website

## Purpose
Full-stack airline ticket booking system (Hệ thống đặt vé máy bay) — customer website + admin dashboard in one repo. Spring Boot 3.5.5 / Java 21 REST API, React 19 + Vite frontend, MySQL + Flyway. Covers flight search, booking, internal payment, check-in, live chat + AI advisor, RBAC admin management, Jasper reports, audit log. Vietnamese-first, i18n `en`/`vi`.

## Key Files
| File | Description |
|------|-------------|
| `Makefile` | Task runner: `make setup\|install\|db\|check\|backend\|frontend\|dev\|build\|clean` |
| `README.md` | Project overview, setup, feature list |
| `README_ENV_SETUP.md` | Detailed env var setup guide |
| `.gitignore` | Ignores `.env`, `/deploy`, `/plan`, `target/`, `dist/`, agent state dirs |
| `J2EE-Backend/pom.xml` | Maven deps + build (Java 21, Spring Boot 3.5.5) |
| `J2EE-Backend/src/main/resources/application.properties` | Runtime config, all secrets via env placeholders |
| `J2EE-Frontend/package.json` | Frontend deps + scripts (`dev`/`build`/`lint`/`preview`) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `J2EE-Backend/` | Spring Boot API (see `J2EE-Backend/AGENTS.md`) |
| `J2EE-Frontend/` | React app: customer site + admin console (see `J2EE-Frontend/AGENTS.md`) |
| `.github/workflows/` | CI (backend/frontend) + production CD (see `.github/workflows/AGENTS.md`) |
| `plan/` | Planning + e2e test report. **Gitignored** (`/plan`), untracked (see `plan/AGENTS.md`) |
| `.codegraph/` `.omc/` `.omo/` `.freebuff/` | Local agent tool state. Gitignored, never edit or document |

## Technology Stack

### Backend (`J2EE-Backend/`)
- Spring Boot 3.5.5, Java 21, Maven wrapper `./mvnw`
- MySQL + Flyway (`db/migration/`, V1..V26), Spring Data JPA / Hibernate (`ddl-auto=validate`)
- Spring Security + JWT (jjwt 0.11.5) + OAuth2 (Google login) + STOMP WebSocket
- Spring AI 1.0.0 (BOM) via OpenAI-compatible endpoint; OpenRouter + local advisor gateway
- JasperReports 6.21.3 (4 templates), Apache POI 5.2.5 (Excel), Spring Cache + Caffeine
- dotenv-java 3.0.0 loads `.env`; no secrets committed

### Frontend (`J2EE-Frontend/`)
- React 19.1.1, Vite 7.1.2, plain JSX (no TypeScript), Tailwind CSS 4.1.13, Ant Design 5.28.0
- react-router-dom 7.9.1, axios 1.12.2, react-i18next 16.3.5, recharts 3.2.1
- @stomp/stompjs + sockjs-client (live chat), framer-motion, react-slick, react-markdown + remark-gfm, react-datepicker
- pnpm 9 (lockfileVersion 9.0), Node 20+. No Redux — React hooks only
- **No `jspdf` dependency.** PDF export is server-side (Jasper); Excel export is a server blob. `xlsx`, `html2canvas`, `adm-zip` and `aos` are declared in `package.json` but **not imported anywhere** in `src/` — dead weight, safe to drop.

## Build and Run

```bash
make setup      # copy .env.example -> .env in both projects
make install    # setup + pnpm install
make db         # CREATE DATABASE datvemaybay (utf8mb4)
make check      # verify java/node/pnpm/mysql + .env presence
make dev        # backend :8080 + frontend :5181 together
make build      # ./mvnw package -DskipTests + pnpm build
make clean      # mvnw clean + rm -rf dist
```

Direct: `cd J2EE-Backend && ./mvnw spring-boot:run` · `cd J2EE-Frontend && pnpm run dev`

## Environment

Backend `.env` (see `J2EE-Backend/.env.example`): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `AIRPORTDB_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_FROM`, `FRONTEND_URL`, `SERVER_PORT`, `ADVISOR_BASE_URL`, `ADVISOR_API_KEY`, `ADVISOR_MODEL`, `UPLOAD_DIR`.

Frontend `.env` (see `J2EE-Frontend/.env.example`): `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`, `VITE_APP_ENV`, `VITE_APP_VERSION`. Correct local values: `VITE_API_BASE_URL=http://localhost:8080/api`, `VITE_WS_BASE_URL=http://localhost:8080/api/ws`.

Gotchas (verified against `application.properties`):
- `server.servlet.context-path=/api` → backend lives under `http://localhost:8080/api`; WS under `/api/ws`.
- `JWT_ACCESS_EXPIRATION` (default 300000 = 5 min) and `JWT_REFRESH_EXPIRATION` (default 2592000000 = 30 d) are read from the env and fall back to those defaults.
- Mail vars are `EMAIL_SMTP_HOST` / `EMAIL_SMTP_PORT` / `EMAIL_USERNAME` / `EMAIL_PASSWORD` / `EMAIL_FROM` — `.env.example` matches them.
- `.env.example` `JWT_SECRET` placeholder is too short for HS256 — set a real 32+ char secret.
- Advisor LLM defaults to a **local** gateway `http://localhost:20128/v1`; prod must set `ADVISOR_BASE_URL` to a reachable host.
- Odoo connector: `ODOO_CONNECTOR_URL` + `ODOO_WEBHOOK_SECRET`. The secret has **no usable default** — if it is blank the webhook is skipped rather than signed with a well-known key.
- **One base-URL convention:** `VITE_API_BASE_URL` / `VITE_WS_BASE_URL` are the **full API base including `/api`** (dev `http://localhost:8080/api`, prod `/api`). Every helper in `src/config/api.config.js` and every service module's `apiClient.get('/admin/...')` depends on it — drop the `/api` and every call 404s.

## Architecture Patterns

**Backend** — layered `controller/` → `service/` → `repository/` → MySQL; `dto/` at the API boundary, `model/` = JPA entities.
- All responses wrapped in `ApiResponse<T>` (`success` / `message` / `data`).
- Soft delete on entities: `@SQLDelete` + `@SQLRestriction` on `da_xoa` / `deleted_at`.
- RBAC: `@RequirePermission` / `@RequireRole` → `PermissionAspect` → `DynamicAdminAuthorizationManager` + `AdminRoleVoter`. Admin roles: `SUPER_ADMIN`, `QUAN_LY`, `NHAN_VIEN_VE`, `KE_TOAN`, `VAN_HANH`.
- Audit: `@Auditable` → `AuditLogAspect` → `audit_log` table.
- Payment is **internal** ("thanh toán thường"): staff confirms, invoice + ticket issued on the spot. No external gateway (VNPay was added in V17, dropped in V24/V25).
- Legacy VNPay **fields survive** in DTOs even though the gateway is gone: `dto/doi_soat/*` still carry `vnpayAmount` / `vnpayTransactionId` / `vnpayResponseCode`, and `dto/hoantien/*` still accepts `phuongThucHoan = VNPAY`. They are inert — do not wire them up.
- Controllers split `Client*` (customer API) vs `QuanLy*` (admin API).
- `AdminRoleVoter` is legacy. The live admin authorization path is `DynamicAdminAuthorizationManager` (DB-driven) — don't route new checks through the voter.

**Frontend**
- Access token in cookie (js-cookie), refresh token in localStorage; auto-refresh via `src/services/apiClient.jsx` interceptors.
- Route guards: `ProtectedRoute`, `AdminProtectedRoute`, `RBACProtectedRoute`, `RequireCompleteProfile`.
- Permissions checked client-side via `usePermission` hook + menu driven by the backend.
- API calls live in `src/services/` per feature — never raw `axios` in components.
- i18n keys must exist in **both** `src/i18n/locales/en/en.json` and `vi/vi.json`.

## Database

Key tables: `sanbay`, `tuyenbay`, `chitietchuyenbay`, `maybay`, `chitietghe`, `hangve`, `giachuyenbay`, `hanhkhach`, `taikhoan` / `taikhoanadmin`, `donhang` (PNR order code), `datcho`, `datchodichvu`, `dichvucungcap`, `luachondichvu`, `khuyenmai`, `khuyenmaidatcho`, `hoadon`, `hoantien`, `vaitro` / `phanquyen` / `hanhdong` / `chucnang`, `audit_log`, `chat_session` / `chat_message`, `banner`, `tintuc`, `ai_suggestion_log`.

Flyway: versioned `V<n>__<name>.sql`, currently **V1..V26**. Auto-runs on startup, `out-of-order=false`, `clean-disabled=true`. Never edit an applied migration — add a new one. Key milestones: V8 guest customers allowed (unique constraints dropped), V18 reconciliation fields on `hoadon`, V24 drop `vnpay_transaction_log`, V25 remove VNPay admin feature, V26 remove support-chat admin feature.

> **Dev-only sample data** lives in `db/devdata/`, *not* in `db/migration/`. `V13_Test_data_thongke.sql` (fake invoices/orders/bookings for the analytics screens) was in `db/migration/` under a name Flyway's parser skipped silently, so it never ran anywhere. It is now in `db/devdata/` and must be applied by hand: `mysql -u root -p datvemaybay < src/main/resources/db/devdata/V13_Test_data_thongke.sql`. Never let it run in production — `V19__Remove_Test_Data.sql` scrubs test data that `V18` inserted, not V13's.

## Testing

- Backend: plain JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`), **no Spring context**. `./mvnw test` from `J2EE-Backend/`. Tests mirror the main package tree under `src/test/java/com/example/j2ee/`.
- `J2EeBackendApplicationTests.java` (the only `@SpringBootTest`) is `@Disabled` — it needs a real MySQL. `src/test/resources/application-test.properties` is **inert**: no test uses `@ActiveProfiles("test")`, so H2 sits on the classpath unused.
- Frontend: **no unit tests**. `pnpm lint` (ESLint, react-hooks + react-refresh) is the only automated gate; `pnpm build` is the compile gate.
- Manual e2e report lives in `plan/e2e-test-report.md` (gitignored).

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Backend won't start / DB refused | MySQL running; `make db` creates `datvemaybay` (utf8mb4); `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` in `J2EE-Backend/.env` |
| CORS error in browser | Backend on 8080, frontend on 5181; `CORS_ALLOWED_ORIGINS` must list the frontend origin |
| 401 after a while | Access token lives 5 min; `apiClient.jsx` interceptor refreshes automatically using the refresh token in `localStorage` (`admin_refresh_token` / `customer_refresh_token`) |
| Flyway migration failure | Inspect `flyway_schema_history`; `out-of-order=false` means a new migration must sort above all applied ones. Never edit an applied `V*__` file — add a new one |
| Backend build fails | Java 21 required (`java -version`); `./mvnw clean package` |
| Frontend build fails | `rm -rf node_modules && pnpm install`; run `pnpm lint` — ESLint errors fail the CI build |
| Empty/dangling images in prod | Nginx serves `dist/` + `/uploads/`; asset URLs switch on `VITE_APP_ENV`/hostname in `src/config/api.config.js` |

## CI/CD

`.github/workflows/`:
- `ci-backend.yml` — PR to `main`, push to `staging`. Java 21 + Maven cache → `./mvnw test` → package JAR → upload artifact (7-day retention).
- `ci-frontend.yml` — Node 20 + pnpm 9 → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm build` → upload `dist`.
- `cd-production.yml` — production deploy: concurrency group `production-deploy`, SSH to VPS, `mysqldump` backup before Flyway migrate, rsync JAR + `dist` via `burnett01/rsync-deployments`, systemd service + nginx reload. Server layout: JAR at `/opt/airline-prod/backend/app.jar`, frontend at `/opt/airline-prod/frontend/dist/`, server env at `/opt/airline-prod/.env`; `/opt/airline-deploy/backups/` holds only JAR snapshots (`app-*.jar`) and DB dumps (`db-*.sql.gz`).

Branches: `main` = production, `staging` = integration, `feature/*`, `hotfix/*`.

## Deployment

There is **no `deploy/` directory and no `deploy-production.sh`** in this repo — `deploy/` is gitignored and the deployment logic lives inline in `.github/workflows/cd-production.yml`. Production host layout: `/opt/airline-prod/backend/app.jar` (systemd service `airline`), `/opt/airline-prod/frontend/dist/` + `/opt/airline-prod/.env`; nginx serves the frontend and reverse-proxies `/api` to the backend. Backups live in `/opt/airline-deploy/backups/`. Production frontend domain is `jadt-airline.io.vn` (hardcoded in `src/config/api.config.js` for asset-URL handling), and prod builds set `VITE_API_BASE_URL=/api` so requests stay nginx-relative.

## Code Style

**Java** — constructor injection, Lombok annotations, `@Transactional` on state-changing service methods, Vietnamese user-facing messages, JavaDoc on controllers, package `com.example.j2ee.{layer}`.

**React/JSX** — functional components + hooks, `.jsx` extension, named exports, Vietnamese comments, custom hooks for reusable logic, services organised per feature, no Redux.

## Security

- JWT access 5 min / refresh 30 d with rotation (`jwt/`, `RefreshTokenService`); refresh tokens persisted in DB.
- OAuth2 (Google) for customer login; separate admin/customer login flows.
- Permissions resolved from DB at request time; never hardcode role checks in controllers.
- Jakarta Validation on all request DTOs; `GlobalExceptionHandler` maps every error to `ApiResponse`.
- Secrets only in `.env` (gitignored). JWT secret ≥ 256 bits. Never commit `.env`, `.env.production`, or key material.
- The Odoo webhook secret has no built-in default — `ODOO_WEBHOOK_SECRET` must be set, otherwise outbound order webhooks are silently skipped.
- CORS restricted via `CORS_ALLOWED_ORIGINS`; credentials allowed for cookie auth.

## External Integrations

1. **Thanh toán thường** — internal, staff-confirmed (no external gateway).
2. **Google OAuth2** — customer social login.
3. **OpenRouter** — chatbot model (Spring AI OpenAI-compatible client).
4. **Advisor LLM gateway** — `ADVISOR_BASE_URL` (default local `http://localhost:20128/v1`).
5. **AirportDB** — airport reference data.
6. **Gmail SMTP** — transactional email (verification, password reset, ticket/invoice).
7. **Odoo connector** — `OdooHookService` POSTs the paid order to `<ODOO_CONNECTOR_URL>/ingest/airline` with an HMAC-SHA256 `X-Signature` header. Fire-and-forget: failures are logged to stderr, never surfaced to the customer. If `ODOO_WEBHOOK_SECRET` is blank the hook is **skipped** (no default key).

## For AI Agents

### Working In This Directory
- Backend change = DTO in `dto/<feature>/` → controller → service → repository. Reuse existing DTOs, `SecurityUtil`, and `ApiResponse<T>` before adding new ones.
- Admin endpoints get `@RequirePermission`; audited entities get `@Auditable` — don't hand-write either.
- DB change = new Flyway migration, never edit an applied `V*__` file.
- Frontend change = page in `pages/`, component in `components/`, API call in `services/`, translation in both `en.json` and `vi.json`.
- Never hardcode absolute URLs; use `src/config/api.config.js` helpers (`getApiUrl`, `getAssetUrl`, `getServiceImageUrl`).
- Read the nearest `AGENTS.md` before editing a directory — this tree is documented per-directory.

### Testing Requirements
- Backend: `./mvnw test` (H2). Add a JUnit 5 + Mockito test mirroring the package for new service logic.
- Frontend: `pnpm lint` must pass; no unit-test infra exists — don't add a framework unasked.
- CI gates: backend `./mvnw test`, frontend `pnpm lint` + `pnpm build`.

### Common Patterns
- PNR order code on `donhang`; guest customers allowed since V8.
- Guest customers have `email_nguoidat` = `null` — code paths must null-check it (see commit `9bc95f7`).
- Conversion-rate stats divide by order count → guard against divide-by-zero (commit `c1605df`).
- Missing i18n keys leak raw keys onto the UI — add both locales together (commit `fd13ca4`).
- `J2EE-Frontend/src/components/Admin/` is **dormant**: nothing imports it. Its imports now resolve (`react-icons/fa` replaced the uninstalled `lucide-react`; the missing sidebar context was replaced with local state), but the live admin shell lives in `pages/QuanLy/` and the guard already exists as `common/RBACProtectedRoute.jsx`. Don't wire new pages to `Admin/`.

## Dependencies

### Internal
- `J2EE-Backend/src/main/java/com/example/j2ee/` — all API code (see its `AGENTS.md`)
- `J2EE-Frontend/src/` — all frontend code (see its `AGENTS.md`)
- Frontend talks to backend over `VITE_API_BASE_URL` (context path `/api`)

### External
- Backend: Spring Boot 3.5.5, Spring Data JPA, Spring Security, Spring WebSocket (STOMP), Spring AI 1.0.0, Spring OAuth2 Client, Spring Mail, Spring Cache + Caffeine, Flyway, MySQL Connector/J, JJWT 0.11.5, JasperReports 6.21.3, Apache POI 5.2.5, dotenv-java 3.0.0, H2 (on classpath, currently unused by the test suite)
- Frontend: React 19, react-router-dom 7, axios, Ant Design 5, Tailwind CSS 4, recharts, react-i18next, js-cookie, @stomp/stompjs + sockjs-client, framer-motion, aos, react-slick, react-markdown, html2canvas, xlsx

<!-- MANUAL: -->
