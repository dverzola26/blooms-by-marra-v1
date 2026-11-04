# Blooms by Marra — Codex Project Instructions

## Read first
- `docs/WEBSITE_REQUIREMENTS.md` is the **source of truth** for business rules and technical acceptance criteria.
- `brand-references/blooms-cover.png` and `brand-references/blooms-shop-guide.png` are original branding references.
- `design-reference/homepage-desktop-mobile-concept.png` is an **AI-generated visual concept only**. Recreate its general layout and visual feel, NOT its purported business data.
- Follow `CODEX_START.md` for implementation scope and milestones.

## Business-data integrity / safety
- The AI mockup displays **fictional products, prices, ratings and storefront photographs**, none of which should be represented as real or used as live commerce data. Use visibly labeled sample/demo products while waiting for the approved catalog; never imply fictional items can be purchased.
- The mockup features a **3 PM same-day cutoff**, but the owner previously supplied a **2 PM cutoff** and the poster shows 3 PM. Do NOT put either time in public claims until owner confirmation. Set a provisional 14:00 Asia/Manila configuration only, admin-editable.
- Keep checkout/order approvals, payment verification, delivery fees, branch service areas and refund rules aligned with the master requirements.
- Customer-facing words/flows must clearly distinguish a request from an approved order and uploaded payment proof from verified payment.
- Use owner-approved logo and bouquet photos for launch. Do not extract or crop them from these posters for use as standalone official assets unless licensed/approved.
- Do not make claims about legal enforceability of store policies; owner/legal review before launch.

## Engineering practices
- Stack: Next.js App Router, TypeScript strict, Tailwind CSS, PostgreSQL/Supabase (backend integration when credentials available), Vercel deployment target.
- Favor a responsive, accessible, branded and polished storefront. Ensure real clickable flows; avoid fake buttons.
- Keep secrets in environment variables; no production credentials in source.
- If external credentials are absent, scaffold integrations honestly; preserve working UI and automated unit tests.
- Write tests for timezone cutoff boundaries, delivery and pickup flows, fee inclusion, order/payment state transitions, and validation.
- Before declaring success, run and report the available install, lint, typecheck, test and build commands, and list any unrun checks.
- Do not deploy, publish live products, or trigger payments without explicit approval.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
