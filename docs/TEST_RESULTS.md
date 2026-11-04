# Validation results — 4 November 2026

Validated in the current cloud instance with Node 24.22.1, npm 11.9.0, Next.js 16.4.5 and Chromium.

| Check                     | Result                                                   |
| ------------------------- | -------------------------------------------------------- |
| Dependency installation   | npm install and frozen npm ci passed; lockfile generated |
| ESLint                    | Passed, no warnings/errors                               |
| Strict TypeScript         | Passed                                                   |
| Business-rule tests       | 18 passed, 0 failed, 0 skipped                           |
| Production build          | Passed; all 21 generated pages completed                 |
| Chromium functional smoke | Passed against local production build                    |
| Mobile 375 × 812          | Passed; navigation and 10 route overflow checks          |
| Desktop 1440 × 1000       | Homepage captured and core flow tested                   |
| Unauthenticated admin API | 401 as expected                                          |
| Live order endpoint       | 503 as expected; no order accepted                       |
| Browser runtime errors    | None detected in final smoke run                         |

The 18 tests cover before/at/after both 14:00 and 15:00 Asia/Manila cutoffs; pickup exemption; included Metro Manila delivery; Pampanga rates; standee city fees; unsupported areas and branch conflicts; null custom quote total; unavailable stock/manual review; payment proof vs verification; approved deposits; invalid forms, dates, recipient phone and cart quantities.

Browser checks cover search, filters, empty-state recovery, cart persistence after reload, invalid checkout errors, successful non-transactional pickup/cash rehearsal, disabled order API, guarded admin API, demo cutoff control, mobile menu and route layouts. Reusable test: `node tests/browser-smoke.mjs` with the local server running. Captures: `artifacts/home-desktop.png`, `artifacts/home-mobile.png`.

A mobile hero overflow found during testing was fixed by preserving a word boundary and allowing grid children to shrink. Early browser runs were corrected to wait for hydration and use the select control's accessible name.

## Not executed / not claimed

Supabase migration application, live RLS integration tests with multiple roles, connected staff login, real product imports, real order persistence/tracking, payment upload/provider testing, notification delivery, formal WCAG certification, external SEO checks, deployment and new-task environment restoration. No Supabase configuration was present. The public admin page is a preview; production admin operations are not implemented.

Install and start instructions are saved in the environment configuration draft. This saves reusable instructions only; it does not publish the environment or deploy the app.

## Reference-led visual revision

After the user requested a closer match, the homepage was rebuilt around the supplied composition. Production build, lint, typecheck and all 18 business-rule tests passed again. Expanded Chromium checks passed for favorite toggles, six occasions with mobile scrolling, five desktop/two mobile featured products and five distinct product images, in addition to the existing cart and checkout flow.

Final captures at 375, 768, 908 and 1440px showed no page-level horizontal overflow and zero broken images. See `design-qa.md` for the source comparison, intentional content differences and final screenshots. Live commerce and deployment remain disabled.

## Supabase staging integration

Latest source validation: **39 tests passed, zero failures/skips**, plus lint, TypeScript and production build. The new tests execute both migrations, the staging seed, functions, triggers and row policies in an embedded PostgreSQL instance using test-only Auth/storage schemas. Coverage adds branch isolation, forbidden owner actions, trusted DB pricing, idempotency/fingerprint conflicts, stale-version protection, audited settings, private proof rows/objects, manual verification, cash pickup completion, tracking rotation/expiry, same-origin checks and image decoding/metadata removal.

Storefront browser regression passed. Staging browser tests passed for protected-page redirect, staff login form/mobile layout, signed-out API guards, foreign-Origin rejection, disabled public order endpoint, invalid token rejection and token-fragment consumption. The successful tracking response is a browser fixture; it does not claim hosted persistence or authentication. Screenshots: `artifacts/staff-login-mobile.png`, `artifacts/staging-tracking-mobile.png`.

Hosted status remains blocked: the project's Supabase settings request failed at the managed proxy with CONNECT 403; runtime custom network allowlist was still empty, while the exact hostname is saved in the environment draft. Project URL and publishable key are present in ignored local configuration. No hosted schema, owner account, Auth session, PostgREST relation or Storage signed URL has been verified. Review/save the network draft, apply the appropriate SQL in a trusted Supabase SQL session, and bootstrap an owner using `docs/STAGING_SETUP.md`. No deployment, live orders or payment collection occurred.

## Publishable-key variable compatibility

The app now prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a legacy fallback. Current local configuration uses the supplied publishable-key name. Configuration regression coverage verifies preferred-key precedence, legacy-only configuration, missing keys and the disabled-staging gate. All 40 tests, lint and typecheck passed. A read-only settings check using the preferred variable still failed at the managed proxy with CONNECT 403; runtime custom host access remained empty. The hostname and preferred-variable requirement are saved in the environment draft. Hosted readiness is still pending.

## Supabase SSR session integration

Installed the requested Supabase JavaScript and SSR dependencies. Shared browser/server clients are under `src/utils/supabase/`; Next.js 16's `src/proxy.ts` runs the refresh helper for staff routes. Login, sign-out and protected staff queries now share the SSR access/refresh cookie format; the public tracking RPC remains stateless. The storefront and live-commerce gates were preserved; no todos page or example data replaced application content.

All **46 local tests** passed, including five SSR behavior cases using the actual SDK with a fixture Auth transport: signed-out requests skip network calls; expired sessions refresh and forward chunked cookies to request/response; refresh responses retain private/no-store cache headers; staging-off skips refresh; server sign-in/sign-out persist/remove cookies; strict route-handler writes surface failures. The parent test accounts for one reported test count. Lint, TypeScript and production build passed, including Next.js proxy compilation. These tests do not verify the hosted Auth provider. The running environment's Supabase allowlist was still empty at the latest observation.
