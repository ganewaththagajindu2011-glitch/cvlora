# Architecture

The Next.js App Router web application uses workspace UI and template packages. Templates render text through React rather than arbitrary HTML. Shared Zod schemas define locale, document bounds and safe customizations. At M0 the only template is a hardcoded non-personal sample; no CV data is stored in the browser.
Fastify owns future private application APIs. PostgreSQL/Prisma stores users, sessions, CVs, versions, export jobs and audit records; Redis supplies distributed rate limits and future queues. M0 includes an applied initial migration and database/Redis readiness checks, but no business endpoints.
The worker is a separate process/container boundary. It will accept only validated server-sourced documents and trusted templates, never arbitrary user HTML. The M0 executable fails closed rather than consume jobs before isolation is complete. Billing, R2 signed URLs and Claude integration are server-only future milestones.
The local Compose file runs only PostgreSQL and Redis with random credentials and loopback port bindings. Live processes are not assumed to persist through cloud publication.
