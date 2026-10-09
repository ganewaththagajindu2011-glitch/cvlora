# M0 validation — 9 October 2026

This is a development foundation. It does not satisfy the full-product definition of done.

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

The final Lighthouse run finished at 17:51 UTC against the current production build. Assertions use the median of three runs. Both pages exceed the strict 2-second LCP target; the measured delay is primarily rendering rather than server response time. The performance gate remains failing and its threshold has not been relaxed. A simulated Lighthouse mobile run does not replace the required low-end Android emulator, interaction latency and complete editor measurements.

Authentication, email, CV ownership/CRUD/editor, template collection, sharing, exports, payments and AI are not implemented. The worker deliberately exits nonzero. Do not store real personal information. Cloud instructions were saved as a draft; publication and fresh-task restoration have not been verified. Local-only commit restoration is not reliably supported by the environment configuration service.
