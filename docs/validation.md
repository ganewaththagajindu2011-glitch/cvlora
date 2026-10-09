# M0 validation — 9 October 2026

The following records the M0 baseline. The current browser editor is documented below. Neither milestone satisfies the full-product definition of done.

| Check                                                   | Result                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Strict TypeScript, ESLint                               | Passed across the workspace                                                                        |
| Unit tests                                              | 11 passed in two suites                                                                            |
| Sandboxed desktop/mobile Chromium E2E                   | 8 passed, including axe accessibility, navigation, theme, reduced motion and CSP enforcement       |
| Production builds                                       | Web, API and fail-closed worker built                                                              |
| PostgreSQL / Redis                                      | Compose health checks passed; repeat migration deploy reported no pending migrations               |
| API readiness                                           | Host and non-root API Docker container returned HTTP 200 with status ready using real dependencies |
| Web Docker                                              | Non-root image built and rendered successfully; this image predates the final font changes         |
| Initial modern-browser JavaScript                       | Landing 146.28 kB gzip; gallery 145.03 kB gzip; includes inline scripts and passes 150 kB budget   |
| Production dependency audit                             | No known vulnerabilities reported                                                                  |
| Full dependency audit                                   | Failed: two high extract-zip advisories through Lighthouse tooling and two moderate findings       |
| SBOM                                                    | CycloneDX inventory generated with 861 components                                                  |
| Remote GitHub CI, CodeQL, container vulnerability scans | Not run; configured checks remain mandatory                                                        |

The extract-zip advisories are GHSA-jmr9-qjv8-65gv and GHSA-7pqw-9j4j-h8q3. The advisory names version 2.0.2 as patched, but it was not available from the registry during investigation. Audit enforcement remains enabled. No untrusted archives were supplied to these tools.

The API burst check produced 58 successful responses and 88,958 rate-limit responses over ten seconds. This demonstrates rejection of bursts, not business throughput or a release performance benchmark.

The M0 Lighthouse run finished on 9 October 2026 at 23:21 Asia/Colombo against that milestone’s production build. Assertions use the median of three runs. Both pages exceed the strict 2-second LCP target; the measured delay is primarily rendering rather than server response time. The performance gate remains failing and its threshold has not been relaxed. A simulated Lighthouse mobile run does not replace the required low-end Android emulator, interaction latency and complete editor measurements.

At M0, authentication, email, CV ownership/CRUD/editor, template collection, sharing, exports, payments and AI were unimplemented. The current browser-only editor changes that local workflow; server-side account/CRUD/export features remain disabled. The worker deliberately exits nonzero. Cloud instructions were saved as a draft; publication and fresh-task restoration have not been verified. Local-only commit restoration is not reliably supported by the environment configuration service.

## Browser editor validation

The current build supports actual CV creation at `/editor`, with three editable styles, live preview, section editing/reordering, undo/redo, opt-in local saving, strict draft import/download, and browser PDF printing. It needs no database or API for CV creation.

- ESLint, strict TypeScript and production web build passed; 13 unit tests passed across three suites.
- 14 sandboxed desktop/mobile browser tests passed, including creation from the landing, editing and reordering, undo/redo, printing, draft restoration/removal, invalid import preservation, literal XSS rendering, keyboard-sized controls and axe WCAG checks.
- Generated and inspected A4 PDFs for Professional, Modern and Classic. PDF text extraction verified user details and sections. A seven-page CV retained its final entry and used A4 dimensions; browser screenshots verified the actual styled desktop/mobile editor. No browser console errors were observed in the manual workflow.
- Initial modern-browser JavaScript, including inline scripts: landing 146.38 kB gzip, gallery 145.24 kB, editor 177.72 kB. All pass their 150/150/250 kB budgets.
- Fixed the Next inlineCss route-style issue: ordered layout + editor CSS now receives a trusted build-derived combined hash. Arbitrary injected inline CSS remains blocked; CSP was not relaxed.

The on-screen preview is a flowing document rather than an exact paginated print preview. PDF generation uses the user’s native browser print dialog. Server PDF/PNG/DOCX exports, accounts, cloud sync, public sharing, billing and the full template collection remain separate work. Device saving is opt-in and unencrypted. The prior development-tool dependency findings remain unresolved and security gates remain enabled. GitHub CI/container scans and low-end Android/interaction measurements have not been verified for this update.

The latest Lighthouse run measured three mobile runs per route. Median scores and metrics:

| Route     | Performance / Accessibility / Best practices / SEO | LCP     | CLS    |
| --------- | -------------------------------------------------- | ------- | ------ |
| Landing   | 98 / 100 / 96 / 100                                | 2.160 s | 0.0029 |
| Templates | 98 / 100 / 96 / 100                                | 1.814 s | 0.0001 |
| Editor    | 97 / 100 / 96 / 60                                 | 2.113 s | 0      |

Lighthouse assertions remain failing for landing/editor LCP. Editor SEO also fails because the editor intentionally uses `noindex`; this was preserved rather than changed to obtain a score. All accessibility, layout-shift and JavaScript budgets passed. This is not a claim that every release performance or full-product acceptance criterion passes.
