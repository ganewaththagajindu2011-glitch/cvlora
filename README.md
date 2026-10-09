# CVLora

A CV builder for Sri Lanka and the global market. **Development foundation, not a production product.**

## Current milestone

M0 introduces the pnpm monorepo, Next.js landing and sample-template preview, Fastify operational endpoints, shared strict Zod schemas, adaptive liquid-glass design tokens, self-hosted English/Sinhala/Tamil fonts, PostgreSQL/Redis infrastructure, Prisma schema, tooling and CI.
Authentication, CV persistence/editor, the 24-template collection, exports, public sharing, billing, email and AI are **not implemented**. There are no account or CV endpoints. The worker refuses startup until its isolated rendering implementation exists. Do not use real personal information with this foundation.

## Prerequisites

Node 24.19.0, pnpm 11.19.0, Docker with Compose. Use Corepack to activate the pinned pnpm version. The cloud sandbox needs writable tool directories: `export PNPM_HOME=/workspace/.pnpm XDG_CACHE_HOME=/workspace/.cache`.
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
