<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# workflows

## Purpose
GitHub Actions pipelines for this repo: two path-filtered CI workflows and one production CD workflow. The CD logic (SSH, backup, rsync, restart) lives inline here — there is no `deploy/` directory and no `deploy/deploy-production.sh` script (the `/deploy` path is gitignored).

## Key Files
| File | Description |
|------|-------------|
| `ci-frontend.yml` | Push to `staging` / PR to `main` on `J2EE-Frontend/**`: Node 20 + pnpm 9, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, upload `frontend-dist` (retention 7 days) |
| `ci-backend.yml` | Push to `staging` / PR to `main` on `J2EE-Backend/**`: Java 21 + Maven cache, `./mvnw -B -ntp test`, `package -DskipTests`, upload `backend-jar` (retention 7 days) |
| `cd-production.yml` | Push to `main`: runs both CI jobs, then backs up, rsyncs and restarts the production service |

## For AI Agents

### Working In This Directory
- `cd-production.yml` deploys to `/opt/airline-prod/backend/app.jar` and `/opt/airline-prod/frontend/dist/`; `/opt/airline-deploy/backups/` holds only the JAR and DB backups.
- The deployment sequence in `cd-production.yml` is: prepare dirs → backup (JAR + `mysqldump`) → rsync JAR → rsync frontend → upload `infra/nginx/` template → write `/opt/airline-prod/.env` (mode 640, group `airline`) → rename JAR to `app.jar` → `systemctl restart airline` → health-check `http://localhost:8080/api/sanbay` → rollback to the newest backup on failure → install nginx site config → verify headers at origin.
- The nginx install step finds the live site file via `nginx -T` include order (not raw grep of `sites-available/`), renders `infra/nginx/airline.conf.template` with the current cert/key/upstream/UPLOAD_DIR, keeps 5 `.bak.*` backups, runs `nginx -t`, reloads, then self-verifies `Cache-Control: no-cache` on `/index.html` and `X-Content-Type-Options` on `/assets/` with a localhost curl bypassing Cloudflare. On verify failure it restores the backup, reloads and exits 1; if the origin is unreachable from localhost it keeps the new config and exits 0 with a warning.
- Concurrency group `production-deploy` with `cancel-in-progress: false` prevents overlapping deploys.
- Every secret comes from GitHub Secrets; the frontend build also reads `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`, `VITE_APP_ENV`, `VITE_APP_VERSION`.
- Actions are pinned to a commit SHA with a version comment; keep that style when bumping them.

### Testing Requirements
- No local runner. Validate with `actionlint` (or the GitHub workflow schema) before pushing.
- Verify a change by opening a PR to `main` and watching `ci-frontend.yml` / `ci-backend.yml` on the PR.

### Common Patterns
- CI is path-filtered per app, so a frontend-only PR does not build the backend.
- Both CI workflows expose a `workflow_call` output `artifact-name` and a `concurrency` group that cancels in-progress runs for the same ref.
- Production secrets live on the VPS in `/opt/airline-prod/.env` and are rewritten from GitHub Secrets on every deploy.

## Dependencies

### Internal
- `../../J2EE-Frontend/` - frontend build (pnpm 9, Node 20)
- `../../J2EE-Backend/` - backend build (`mvnw`, Java 21)
- `../../J2EE-Frontend/pnpm-lock.yaml` - pnpm cache key

### External
- actions/checkout, actions/setup-node, actions/setup-java, actions/upload-artifact, actions/download-artifact
- pnpm/action-setup, appleboy/ssh-action, burnett01/rsync-deployments

<!-- MANUAL: -->
