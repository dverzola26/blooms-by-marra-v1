# Blooms by Marra

A responsive Next.js App Router, strict TypeScript and Tailwind CSS storefront MVP. Built from the supplied work package. **Demo only: no live products, orders, payment collection, notifications or deployment.** Supabase staging workflows are implemented; hosted connection and owner bootstrap remain pending.

## Run locally

Use Node.js 24 (validated with 24.22.1) and npm 11. From this repository:

```sh
npm ci
npm run dev -- --port 3000
```

For a production-mode local check: `npm run build`, then `npm start -- --port 3000`. No external services or credentials are required for the demo. Keep configured proxy and TLS trust intact during installation. This cloud task is already isolated; reuse this checkout without creating a worktree.

## Continue on a Mac

Install Node.js 24 (or use `nvm install` / `nvm use` with the included `.nvmrc`), then:

```sh
git clone https://github.com/dverzola26/blooms-by-marra-v1.git
cd blooms-by-marra-v1
npm ci
cp .env.example .env.local
npm run dev -- --port 3000
```

Open this folder in Codex on your Mac. Start by reading `AGENTS.md`, `CODEX_START.md`, and `docs/STAGING_SETUP.md`. The storefront works as a demo without Supabase. For staging, add your project URL/publishable key to the ignored `.env.local`, set `BLOOMS_STAGING_ENABLED=true`, and finish the hosted database/owner setup in the staging guide. Local configuration is intentionally not included in Git.

Browser checks in this cloud environment use `/usr/bin/chromium`. On macOS, use a local Chromium/Chrome executable (the storefront smoke script accepts `CHROMIUM_PATH`); adapt the other browser scripts' executable path for your machine before running them. Unit/database tests run with `npm test` and need no separate Postgres service. Deployment and live payments still require explicit owner approval.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
node tests/browser-smoke.mjs
```

The browser smoke test needs the running app and Chromium (`CHROMIUM_PATH`, default `/usr/bin/chromium`). Set `TEST_BASE_URL` for another local port. Screenshots are written to `artifacts/`. The cloud sandbox may require tool-approved execution for network access, browser launch, server listening or Next.js build subprocesses. `npm test` uses Node's non-isolated runner so all individual tests are reported in this sandbox.

## What's implemented

- Responsive homepage, searchable/filterable/sortable sample catalog, individual product pages, gift messages, persistent local demo cart, quantity editing and removal.
- Guest checkout rehearsal with delivery/pickup, branch/city compatibility, included delivery, city fees, date/contact validation, cash restricted to pickup and explicit non-transactional result.
- Contact, delivery, story, FAQ, draft policies and order-status guidance.
- Public admin **preview** for catalog, empty operational queue and an internal cutoff setting rehearsal. No real customer data or production mutations.
- Supabase role-checking API foundation, deny-by-default migration, private payment-proof bucket, independent order/payment/fulfillment states and order event audit trigger.

The bouquet images, hero, decorative botanical motif and watercolor paper are AI-generated demo artwork, not actual shop photography or an approved official logo. Distinct sample arrangements replace the first version’s repeated photograph. Sample prices and rates are fixtures. Original posters remain reference documents and have not been cropped into official assets.

See [implementation, architecture and operations](docs/IMPLEMENTATION.md), [source requirements](docs/WEBSITE_REQUIREMENTS.md) and [launch decisions](docs/PENDING_DECISIONS.md).

## Supabase staging integration

See [the staging setup and owner guide](docs/STAGING_SETUP.md). Staff sign-in is `/admin/login`; the protected workspace is `/admin/workspace`. The public `/admin` page remains a sample-only preview. Staging adds atomic test-order storage, audited owner/staff transitions, private proof upload/review, expiring status tokens, and owner-controlled test inventory/cutoffs. The public storefront checkout still never saves orders or accepts payment.

The current instance holds the supplied project URL/publishable key in ignored `.env.local`. Hosted connectivity is blocked until the saved project-host network allowance is applied. The schema has been tested locally but has **not** been applied to the hosted project. For a fresh staging project, review `supabase/STAGING_SETUP.sql`; complete Auth owner bootstrap using the dashboard and [guide](docs/STAGING_SETUP.md). Do not supply administrator secrets in chat.

Run `npm test` for PostgreSQL migration/RLS and application security tests. With the local server running, `node tests/staging-browser.mjs` checks signed-out route guards and browser tracking behavior (a fixture response, not a hosted database). No staff session or production capability is fabricated when configuration is absent.

## Deployment target

Compatible with Vercel's Next.js runtime. For a future approved staging deployment, configure build command `npm run build` and environment variables in hosting settings, then repeat staging DB and browser checks. This work has not deployed anything. Do not deploy, publish catalog products or enable payments without owner approval.

## SSR sessions

Supabase browser/server helpers live in `src/utils/supabase/`. Next.js 16 uses `src/proxy.ts` to refresh staff sessions; no deprecated root middleware file is needed. Staff sign-in, sign-out and protected queries now share the SSR cookie session. Role checks and RLS remain mandatory. See [session behavior and setup](docs/STAGING_SETUP.md).
