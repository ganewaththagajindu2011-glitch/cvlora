# Security

The browser-only CV editor is usable; this is not a security-certified product. No system is 100% safe. Server-side collection of personal CV data must stay disabled until authentication, authorization, export isolation and privacy controls are complete. Browser device saving is unencrypted, off by default, and described before opt-in.

## Reporting

Do not include credentials or personal CV data in public issues. No private reporting contact has been established yet; repository owners must enable GitHub private vulnerability reporting before public launch.

## STRIDE threat model

| Threat                 | Boundary                    | M0 control / remaining work                                                                                                                              |
| ---------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spoofing               | Browser/API/session         | No private routes exist. M1: verified identity, Argon2id, rotating sessions and CSRF.                                                                    |
| Tampering              | CV JSON/payments            | Strict bounded schemas. M2: owner-scoped writes, versions. M5: webhook signatures/idempotency.                                                           |
| Repudiation            | Account/export/billing      | AuditLog schema only. M1+: structured security events without PII.                                                                                       |
| Information disclosure | HTTP, DB, storage           | Redacted operational errors/log serializers, CSP, no-store health, local service passwords. Production TLS/encryption/R2 policies pending.               |
| Denial of service      | API, templates, queue       | Body/time bounds and distributed rate-limit integration; payloads and worker/resource limits need full workflow tests.                                   |
| Elevation of privilege | Owner access/export browser | No resource endpoints or export worker. M1/M2: deny-by-default owner checks. M4: non-root read-only sandboxed isolated renderer with constrained egress. |

## Assumptions

Operational endpoints are public and reveal no dependency addresses. Proxy headers are not trusted by default. Production reverse-proxy limits/TLS must be configured explicitly. Local Docker volumes are not encrypted by this repository. No outbound user-controlled fetches, uploads, webhooks or AI processing exist yet. The worker fails closed and cannot silently drop export jobs.
Supply-chain verification, TLS checks and Chromium sandboxing must remain enabled. See the checklist for implemented versus pending controls.
