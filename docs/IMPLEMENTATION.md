# Architecture, implementation and operations

## Scope and source hierarchy

This MVP implements Phase 1 in CODEX_START.md. AGENTS.md and the Markdown business rules govern behavior. The generated desktop/mobile concept informs layout only. It does not authorize products, pricing, ratings, delivery claims or payment activation. The latest user request authorizes writing source files, superseding the onboarding-only restriction against code changes.

## Information architecture and design

Home → Shop → Product detail → Demo cart → Checkout rehearsal. Supporting routes: `/delivery`, `/contact`, `/about`, `/faq`, `/policies`, `/status`. `/admin` is a public, sample-only dashboard foundation. Sensitive API access is independently guarded.

Home now follows the supplied desktop/mobile composition: compact cocoa announcement, ivory wordmark/navigation, shallow brand-led hero with floral profile motif and bouquet, blush fulfillment strip, six occasion tiles, five desktop product cards, watercolor ordering guide, compact branch cards, values row and floral closing call to action. Mobile retains a compact side-by-side brand/bouquet hero, four fulfillment icons, a swipeable three-tile occasion row and two featured cards. Remaining demo products are available in the full catalog. A compact FAQ and footer provide supporting navigation.

The reference layer is in `src/app/reference.css`; commerce pages retain their accessible responsive form foundation. Original palette tokens remain in `src/app/globals.css`. Georgia supplies the offline serif typography. Header and hero wordmarks are editable text. The botanical profile is new decorative demo art, not a cropped or approved official logo. Distinct generated rose, pink rose, sunflower, lily and mixed bouquet images are served locally using Next Image. Watercolor paper adds reference-inspired texture without copying the social posters. Imagery is reused only where the same demo arrangement appears in an occasion tile, product card, detail or cart.

Visual reference business claims remain excluded: no fabricated best-seller labels, review stars, customer counts, live stock, approved cutoff, GrabMart readiness or shop photographs. Branch cards link to contact guidance until addresses are verified.

## Application boundaries

Server components render static and informational pages. Client components manage catalog controls, cart and checkout validation. Cart items and card text persist under `blooms-demo-cart` in localStorage; checkout contact details remain in memory and are never submitted. Clear cart removes stored item/message data. Corrupt storage falls back to an empty cart. Pricing uses integer PHP centavos. Central rule functions live in `src/lib/commerce.ts`.

## Exceptions and states

- Delivery city must match the branch's limited demo matrix. The fixture list is not the complete approved coverage.
- Products from different branches cannot be combined. A manual transfer is not an automatic shipping option.
- Included delivery is evaluated per product and city; a mixed included/nonincluded cart uses one configured city charge, not a charge per item. Owner approval is needed for the final mixed-cart policy.
- Pickup has zero delivery fee and does not use the delivery cutoff. Actual pickup slots remain a production integration task.
- One provisional `14:00` cutoff is used in the demo rule engine, Asia/Manila. Tests also cover `15:00`. The database supports per-branch cutoffs and date exceptions; the admin preview does not change this engine or persist production settings.
- Before cutoff: pending confirmation. At/after cutoff, unavailable stock or custom/rush request: needs staff review. Custom quote total is null. No request automatically confirms inventory or delivery.
- Payment unpaid → submitted → staff-verified, separately from unconfirmed → confirmed → preparing → pickup-ready/out-for-delivery → completed. Screenshot submission cannot verify payment.
- Full payment is the default; a deposit of at least 50% needs explicit owner approval. Cash is pickup-only.

## Supabase staging implementation

The original foundation migration is followed by `202611040002_staging_workflows.sql`. Together they provide inactive demo branches/catalog, branch RLS, transactional staging order creation with trusted pricing and idempotency, separate audited approval/payment/fulfillment transitions, private proof metadata, hashed expiring tracking tokens, and owner-controlled staging inventory/cutoffs. Operational tables and audit history cannot be edited directly through application roles; audited SECURITY DEFINER functions own these changes.

`/admin` remains a public sample preview. `/admin/login` authenticates through Supabase Auth and stores the SDK’s shared SSR session cookies. The Next.js 16 proxy refreshes expired sessions and propagates changed cookies/cache headers before staff pages render. `/admin/workspace` and its APIs verify the JWT and database role. Branch staff can read/advance only assigned branch requests; owner approval, payment verification and settings are enforced in the database. The authenticated workspace stores only explicitly fictional staging records. Public `/checkout` and `/api/orders` remain nontransactional/disabled.

Proofs submitted through the server endpoint are bounded, decoded, stripped of metadata and re-encoded to JPEG before private storage. Private proof links expire in 60 seconds. Owner verification is explicit and does not occur during upload. Guest status links use a 256-bit random fragment token, store only its SHA-256 hash, expire in seven days and return minimal status without customer information. No bank accounts, payment destinations, live payment provider or notifications have been configured.

## Setup and operating guide

See [STAGING_SETUP.md](STAGING_SETUP.md) for the fresh-project SQL bundle, owner bootstrap, branch assignment, complete test workflow, permissions and security boundaries. The supplied project settings are saved only in ignored local configuration. The exact project host is in the saved environment network draft; the running proxy still blocked it at the last check. No hosted migrations or successful staff sign-in have been claimed.

## Validation

Tests execute the SQL migrations, functions, triggers and RLS in embedded PostgreSQL with test-only Auth/storage schemas. They verify permissions, pricing, idempotency, owner decisions, proof states, pickup cash handling, correct fulfillment progression, private file policies and tracking expiry/rotation. Browser tests check the storefront, signed-out route guards, CSRF protection and token-fragment UI using a fixture response. Actual Supabase Auth, PostgREST and Storage integration remain gated on hosted connectivity and setup.

## Production blockers

- Approved catalog/photos/logo, branch details, fees, cutoff, availability and policies.
- Hosted migration execution and owner account; real role/session/Storage tests in the chosen staging project.
- Production guest order workflow, reservations/capacity management and authenticated operational procedures beyond the staging-only paths.
- Approved payment instructions, deposit policy, distributed abuse controls, storage scanning, retention/deletion jobs and notifications.
- Explicit authorization before deployment, publishing products or enabling live orders/payments.

No public deployment, real payment, customer notification or hosted order persistence has been performed. Local SQL lifecycle tests do write fictional data to an ephemeral embedded test database.
