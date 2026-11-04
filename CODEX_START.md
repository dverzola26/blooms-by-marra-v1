# Codex Work Task — Blooms by Marra E-commerce Website

You are working inside the Blooms by Marra project folder. **Read `AGENTS.md` and `docs/WEBSITE_REQUIREMENTS.md` completely before changing files**. Inspect both brand-reference images and the website concept image.

## Objective
Implement a premium, mobile-first, functional e-commerce florist website for Blooms by Marra, based on the source-of-truth Markdown specification and the brand/design reference images. Start from this folder as a fresh project if there is no existing app. Prioritize a usable, testable MVP while preserving a route toward production payments, orders and operations.

## Phase 1 — Build now
1. Establish project structure with Next.js App Router, TypeScript strict and Tailwind CSS (latest compatible stable versions). Add a README, `.env.example`, `.gitignore`, scripts, formatting/lint/typecheck/test configuration.
2. Implement the brand design tokens: ivory `#FBF4EE`, blush `#F2B6B6`, cream `#F6EEE1`, champagne `#E8D3B4`, taupe `#BB8E6D`, cocoa `#543C30`.
3. Build a responsive homepage based on the visual concept and brand posts, with boutique typography, logo treatment, hero, occasion categories, trust strip, sample product cards clearly tagged **DEMO**, shop guide, branch sections, FAQ and footer.
4. Add Shop, Product Detail, Cart, Checkout, Contact and Order Status pages, plus a simple owner/admin interface scaffold. Use actual data when supplied; otherwise clearly label sample catalog and disable actual payment/order submission that would suggest a real transaction.
5. Implement functional shopping UI state, validation and delivery/pickup selection. Do not pretend a backend order was saved if no DB is configured.
6. Implement a secure Postgres/Supabase schema and migration plan for products, branches, zones, fees, orders, order/payment state, role permissions and upload proofs; if credentials unavailable, provide migration SQL and honest demo-mode fallback.
7. Implement centralized Asia/Manila same-day cutoff and city/branch delivery logic, admin-configurable. Boundary tests must cover 2 PM and 3 PM without publicly asserting either is final.
8. Include accessible navigation, product search/filter, phone/mobile layout, image optimization and truthful loading/empty/error states.
9. Run available tests, lint, type checks and production build; fix failures. Capture screenshots or otherwise validate desktop/mobile layout if browser tooling exists.

## Acceptance criteria
- Visually consistent with the reference graphics and design image, but with **no invented live offers, prices, reviews, inventory or unverified policies**.
- Core navigation, search, demo-cart and demo-checkout interactions work; payment backend never fakes success.
- Delivery fee inclusion and branch/city rules are modeled explicitly.
- Production admin/payment path is protected and uses a real backend only when configured.
- Show tests/build results and unresolved production blockers at the end.

## Work method
Create a short plan, then implement and iterate without asking questions except for truly blocking production data. Do not only produce a plan, wireframes or mockups; write real source code. If a phase cannot be completed, leave a working partial build and a precise TODO list. Do **not deploy to a public site without user approval**.
