# Security implementation status

These are ASVS category references, not a claim of ASVS Level 2 certification.

| Category           | Control                                                               | Status / evidence                                                                                                       |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| V5 Validation      | Strict bounded CV/environment schemas                                 | M0 foundation; packages/shared/src/index.ts and unit tests. Endpoint-specific schemas will accompany each future route. |
| V14 Configuration  | CSP nonce, nosniff, permissions/referrer policy                       | M0 web proxy and API Helmet; HTTP/unit tests. Desktop/mobile browser checks pass.                                       |
| V13 API            | Request bounds, timeouts, no-store operational errors                 | apps/api/src/server.ts; unit tests. Live PostgreSQL/Redis API readiness verified.                                       |
| V7 Logging         | Operational logs exclude headers/body/URL and redact secrets          | API logger serializers; no business audit events implemented.                                                           |
| V2 Authentication  | Argon2id, verification/reset, breached passwords, brute-force control | Pending M1; no auth endpoints exposed.                                                                                  |
| V3 Sessions        | Secure rotating cookies, reuse detection and CSRF                     | Pending M1.                                                                                                             |
| V4 Authorization   | Owner-scoped operations and cross-user endpoint tests                 | Pending M1/M2; no CV routes exposed.                                                                                    |
| V6 Cryptography    | At-rest encryption / sensitive field protection                       | Pending production deployment and M2.                                                                                   |
| V8 Data protection | Export/deletion/retention and privacy terms                           | Pending account workflows and legal review.                                                                             |
| V10/V12 Uploads    | MIME/magic bytes/re-encode and traversal protection                   | Pending; uploads not accepted.                                                                                          |
| V12 Exports        | Sandboxed non-root read-only worker with limits/egress policy         | Pending M4; current worker exits nonzero.                                                                               |
| V13 Payments       | Verified signatures and idempotency                                   | Pending M5; no checkout/webhook endpoints.                                                                              |
| Supply chain       | Locked versions, signature/checksum checks, Gitleaks and audit CI     | Foundation included; CI execution and image scans must be verified independently.                                       |
| Performance/a11y   | Adaptive quality, self-hosted fonts, axe and budgets                  | Foundation; no unmeasured Lighthouse score or mobile latency claims.                                                    |

The local editor has no CV API endpoints or network uploads. JSON draft import is capped at 256 KB, rejects unknown fields, unsupported templates and duplicate IDs, and preserves the current CV on failure. Text is escaped rather than interpreted as HTML. Automated browser checks cover XSS strings, opt-in storage/removal, draft restoration and print output. Local drafts are not encrypted; device saving is off by default and the UI explains this before opt-in.
