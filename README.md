# QA Reference Framework

![QA](https://github.com/Kurtis-H/qa-reference-framework/actions/workflows/ci.yml/badge.svg)

**How I'd set up test automation for a web product:** UI, API contract, accessibility, performance and security testing in one framework, running in CI with published reports.

It tests [vuln-shop](https://github.com/Kurtis-H/vuln-shop), a small shop app I built with intentional security bugs and a switch that turns them on or off.

📊 **Latest reports:** https://Kurtis-H.github.io/qa-reference-framework/

## What's covered

| Layer | Tool | What it checks |
|---|---|---|
| UI (end-to-end) | Playwright + page objects | Browsing, search, product pages, chat |
| API | Playwright request + Zod | Status codes, validation, auth, edge cases |
| API contract | Zod `.strict()` schemas + OpenAPI | Response shapes, no unexpected fields, endpoints still exist |
| Accessibility | axe-core | WCAG 2.1 AA violations |
| Security regression | Playwright | SQL injection, IDOR, stored XSS, forged JWTs, LLM prompt leaks |
| Performance | k6 | p95 latency and error-rate thresholds under load |
| DAST | OWASP ZAP baseline | Passive scan of the running app |
| Dependencies / secrets | Trivy | Known CVEs, leaked secrets, misconfigurations |
| Triage | [scan-triage-bot](https://github.com/Kurtis-H/scan-triage-bot) | Merges ZAP + Trivy into one ranked list in the job summary |

## Highlights

- **The security tests are tested.** CI runs the `@security` suite against vuln-shop's *vulnerable* mode and requires **every test to fail**. If a security test passes against a known-vulnerable app, it isn't detecting anything, and the build goes red.
- **It found a real bug on its first run.** axe-core flagged that vuln-shop's pages had no `lang` attribute (a WCAG violation for screen readers). It was fixed in vuln-shop 0.1.1.
- **Strict contracts catch data leaks.** API schemas reject unknown fields, so if a response ever starts including something like a password hash, the contract test fails.
- **Arrange with the API, assert in the UI.** Test setup goes through the API (fast, reliable), and the assertions check what users actually see.

## Quickstart

1. Start vuln-shop (from its repo): `docker compose up --build`. Vulnerable mode runs on `:8000` and secure mode on `:8001`.
2. Install and run:

```bash
npm ci
npx playwright install chromium
npm test                    # everything, against secure mode
npm run report              # open the HTML report
```

Useful variations:

```bash
npm run test:smoke                              # quick @smoke subset
npm run test:api                                # API only, no browser
npm run test:a11y                               # accessibility only
BASE_URL=http://localhost:8000 npm run test:security   # watch the security suite catch the bugs
CROSS_BROWSER=1 npm test                        # add Firefox and WebKit
k6 run perf/smoke.js                            # performance smoke (install k6 first)
```

On Windows PowerShell, set variables like this: `$env:BASE_URL="http://localhost:8000"; npm run test:security`

## Project structure

```
src/
  api/ShopApi.ts        API client: intent-level methods (login, searchProducts...)
  pages/                Page objects: HomePage, ProductPage
  fixtures/             Custom fixtures: api, aliceApi, bobApi, homePage...
  schemas/              Zod contracts for every response
  data/                 Test users, products, unique-data helper
  config/env.ts         All environment config in one place
tests/
  api/                  Products, auth, orders, reviews, OpenAPI contract
  ui/                   Shop flows and reviews
  a11y/                 axe-core WCAG scans
  security/             Attack replays that must be blocked
perf/smoke.js           k6 load smoke with thresholds
.github/
  actions/start-vuln-shop/   Reusable step: boot the app under test
  workflows/ci.yml           5 jobs: e2e, security-proof, perf, scans, publish
```

## Tags

Tests are tagged so CI and people can run the right slice:

- `@smoke`: critical paths, under a minute
- `@regression`: edge cases and negative tests
- `@a11y`: accessibility
- `@security`: attack replays

## Design decisions

- **Page objects with locators, not methods for everything.** Page objects expose locators and a few meaningful actions (`search`, `sendChat`). Assertions stay in the tests, where readers expect them.
- **Fixtures over beforeEach.** `aliceApi` and `bobApi` arrive already logged in, each in its own request context, so tests can't leak auth state into each other.
- **Unique test data.** Anything a test creates gets a unique suffix, so tests can run in parallel and be re-run against a database that isn't reset.
- **Waiting on network responses, not timeouts.** UI actions wait for the matching API response. There are no `waitForTimeout` calls anywhere, which removes a major source of flakiness.
- **Retries only in CI, and only 1.** A test that needs a retry shows up as "flaky" in the report, so it gets fixed instead of hidden.
- **Scanners are report-only for now.** ZAP and Trivy are expected to find issues in a deliberately vulnerable app. Gating on them is on the roadmap, once a baseline and suppressions file exist.

## CI setup notes

- vuln-shop and scan-triage-bot must be public repos under the same GitHub account, because CI pulls them by name.
- To publish reports: **Settings → Pages → Source: GitHub Actions**.

## Roadmap

- [ ] Trivy and ZAP gating with a reviewed suppressions file
- [ ] Visual regression snapshots
- [ ] Sharded parallel runs across CI machines
- [ ] Feed JUnit history into [flaky-hunter](https://github.com/Kurtis-H/flaky-hunter)
- [x] Feed ZAP and Trivy output into [scan-triage-bot](https://github.com/Kurtis-H/scan-triage-bot) for one ranked summary

## License

MIT
