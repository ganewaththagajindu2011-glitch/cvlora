# CVLora engineering rules

- Use strict TypeScript. No `any` without a justified comment. Small, pure, tested functions; no dead code.
- Never commit secrets or disable security controls to pass tests. Fix the cause.
- Prefer well-maintained libraries; check licenses and justify dependencies in DECISIONS.md.
- Every application endpoint requires strict Zod validation, authorization, rate limiting, tests, and audit events where relevant. Operational health endpoints are public and must expose no secrets.
- Unimplemented capabilities fail closed. Never pretend authentication, billing, persistence, exports, or AI works.
- Preserve performance budgets and degrade effects through quality tiers.
- Use Conventional Commits. Update README with reproducible installation, services, migration and verification commands.
- After each milestone run lint, typecheck, unit and e2e checks; distinguish passed, failed, skipped, and unrun results.
- Use the existing isolated checkout; do not create Git worktrees unless explicitly requested.

## Definition of done (full product; M0 does not satisfy this)

All tests and CI green, zero high/critical findings in dependency/container scans. Lighthouse mobile >=90 in all categories on landing/editor/gallery with enforced budgets. Validate 4x CPU slowdown, Slow 4G and a low-end Android emulator. Complete the security checklist linked to implementation/tests. A new developer can run the documented stack in under ten minutes. No system is 100% safe.
