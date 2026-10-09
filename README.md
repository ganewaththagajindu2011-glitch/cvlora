# CVLora

A CV builder for Sri Lanka and the global market. The browser editor is usable; the full hosted product is still in development.

## Create a CV now

Open `/editor`, enter personal details, add and reorder sections, choose Professional, Modern or Classic, then use **Print / Save PDF**. In the browser print dialog select **Save as PDF**, paper **A4**, and disable browser headers and footers. Longer CVs flow onto additional printed pages; the on-screen preview is not a paginated print preview.

The editor supports English, Sinhala and Tamil text, undo/redo, strict JSON draft import/download, text size and spacing. Your details stay in the browser. **Remember on this device** is optional and stores an unencrypted local copy; leave it off on shared devices. Download drafts to keep a portable copy. No login or database is needed for this workflow.

With Node 24.19.0 and pnpm 11.19.0 installed:

```sh
pnpm install --frozen-lockfile
pnpm --filter @cvlora/web build
pnpm --filter @cvlora/web start
```

On your own computer, open `http://localhost:3000` and choose **Create my CV**. This starts the production web only and does not require Docker or an `.env` file.

### Windows troubleshooting

Use Node 24.19.x and the pinned pnpm version. If a build fails, stop and fix it before running `start`. In PowerShell, stop the running server with Ctrl+C before rebuilding. A ZIP download has no `.git` directory; Husky’s `.git can’t be found` message does not prevent using the editor.

The standalone preparation validates CSS asset paths using platform-aware path containment. A previous version incorrectly compared Windows paths against a `/` separator and failed with `Unexpected trusted CSS path`. Update the scripts from the latest repository version, rebuild, and restart. Open `http://localhost:3000/editor` in your own computer’s browser. The start script refuses an incomplete build instead of launching it.

## Remaining product work

M0 provides the monorepo, Fastify operational API, infrastructure and security/tooling foundation. The browser editor adds a real CV creation workflow. Authentication, server-side CV storage, the 24-template collection, isolated server PDF/PNG/DOCX exports, public sharing, billing, email and AI remain unimplemented. Browser printing is available; the server export worker still refuses startup. Three editable styles are available, rather than the complete planned template collection.

## Prerequisites

Node 24.19.0 and pnpm 11.19.0. Docker with Compose is needed for the full API/infrastructure workflow below. Use Corepack to activate the pinned pnpm version. The cloud sandbox needs writable tool directories: `export PNPM_HOME=/workspace/.pnpm XDG_CACHE_HOME=/workspace/.cache`.
Run `bash scripts/install-gitleaks.sh /workspace/cloud-setup/bin` to install Gitleaks 8.24.2 from its official GitHub release with its pinned SHA-256 verified, then prepend that directory to PATH. Both pre-commit and CI scan staged/committed changes. In this cloud machine it is available at `/workspace/cloud-setup/bin/gitleaks`.

## Local development

```sh
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
node scripts/init-dev.mjs
docker compose up -d --wait
pnpm db:generate
pnpm db:migrate
pnpm dev
```

The web listens on port 3000; the API on 4000. `GET /health` checks API liveness; `GET /ready` checks PostgreSQL and Redis and returns 503 on failure. The health routes are public and disclose only status. The initial Prisma migration is committed and was applied during M0 validation. `db:migrate` uses deploy, never a destructive schema reset. No seed is needed at M0.
Font assets are already committed; font regeneration is optional. `scripts/subset-fonts.py` uses FontTools 4.61.1 and Brotli 1.2.0 to retain variable weights 400–700 and subset the Latin foundation UI. Modified OFL font names and original license notices are included. Full editor font/language coverage will be expanded in M3.

The initializer creates a git-ignored `.env` with independently generated development credentials and mode 0600. It never overwrites an existing file or prints values. PostgreSQL and password-protected Redis publish only to loopback. Production secrets and TLS require separate deployment configuration.
Strict nonce CSP is implemented for production pages. `pnpm dev` may have Next.js development HMR restrictions under this CSP; production validation uses `pnpm build` and `pnpm --filter @cvlora/web start`. Do not weaken production CSP to support development HMR.

## Verify

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --audit-level high
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

This cloud instance has a validated `cvlora-browser:local` Docker image. Run browser checks with:

```sh
docker run --rm --network host --security-opt seccomp="$PWD/infra/browser-seccomp.json" --mount type=bind,src=/workspace,dst=/workspace -e PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium -e E2E_EXTERNAL_SERVER=1 -e XDG_CONFIG_HOME=/tmp/chromium-config cvlora-browser:local node node_modules/@playwright/test/cli.js test
```

Start the production web first. This is a browser **test** container, not the future export worker. Its Chromium sandbox remains enabled. The seccomp profile is from Microsoft Playwright v1.64.0. See `docs/validation.md` for current results and remaining failures.

E2E launches Chromium with `chromiumSandbox: true`. If the environment cannot provide a sandbox, the test must fail; never add `--no-sandbox`. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` may select a trusted system Chromium. Use an appropriate isolated runtime when the host prevents sandboxed launches.

## Containers

From the repository root, build the web/API images with `docker build -f apps/web/Dockerfile -t cvlora-web .` and `docker build -f apps/api/Dockerfile -t cvlora-api .`. They use non-root runtime users. The worker Dockerfile deliberately exits nonzero at M0; it is not an export service. M4 must add read-only storage, network isolation, seccomp, limits and sandboxed Chromium before enabling exports.

## Roadmap

M1 authentication/security and migrations → M2 CV CRUD/editor → M3 24 templates/i18n → M4 isolated exports/sharing → M5 payments → M6 optional server-only AI → M7 SEO/PWA → M8 measured hardening. See [DECISIONS.md](DECISIONS.md), [SECURITY.md](SECURITY.md) and [security checklist](docs/security-checklist.md). The completion criteria in AGENTS.md refer to the full product and are not yet met.
