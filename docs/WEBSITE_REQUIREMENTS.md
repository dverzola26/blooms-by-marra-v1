# Blooms by Marra — E-commerce Website Master Prompt (Brand-Referenced v2)

> **Purpose:** Paste this prompt into Codex, Claude Code, Cursor, or another AI development agent to plan, build, test, and prepare a production-ready e-commerce flower shop.  
> **Prepared:** November 4, 2026  
> **Business reference:** https://www.facebook.com/bloomsbymarra/  
> **Sources:** Owner-provided business requirements, plus two uploaded Blooms by Marra promotional graphics (`brand-references/blooms-cover.png` and `brand-references/blooms-shop-guide.png`). The graphics ground the visual identity and show shop information, but current operating policies and precise addresses still need launch-time verification. The Facebook page could not be reliably fetched for automated review.
> **Critical pending decision:** Previous owner guidance specifies a **2:00 PM** cutoff for same-day *delivery*; the supplied shop-guide post states **3:00 PM**. The actual cutoff must be verified with the owner. Until then, retain the previous 2:00 PM backend configuration as a conservative placeholder; keep the cutoff administrator-configurable, and **do not publish an unconfirmed fixed cutoff** on the live site.
> **Rights:** Treat the supplied social graphics as visual references. Do not assume the complete website can reproduce their logo, photos or illustrations without explicit owner-approved assets/permission.

---

## 0. YOUR ROLE AND MISSION

Act as a **Senior E-commerce Product Designer, Conversion-Focused UI/UX Designer, Full-Stack Engineer, and Solutions Architect**. Build a beautiful, warm, trustworthy, mobile-first online flower shop for **Blooms by Marra** in the Philippines.

The site must be a **functional e-commerce storefront**—not just a brochure or lead-capture landing page. Customers should be able to browse products, customize arrangements where supported, select delivery or pickup, place orders, submit payment evidence, and view order status. Store operators must be able to manage availability and orders without editing code.

**Business priority:** Increase genuine online flower orders while preserving the business's existing inventory, delivery, pricing, and human approval procedures. Never misrepresent an unconfirmed order as guaranteed, and never mark a payment as verified merely because a screenshot was uploaded.

Work with practical, small-business-friendly assumptions. Prioritize a strong MVP that can be deployed, maintained, and extended later with AI-assisted customer service and n8n workflows.

## 1. PROJECT PROFILE — ALREADY FILLED

| Field | Requirement |
|---|---|
| Brand | **Blooms by Marra** |
| Website type | **B2C e-commerce florist / flower delivery and pickup store** |
| Business | Floral arrangements, flower bouquets, and occasion-specific flower products; catalog and add-ons subject to owner-provided data |
| Primary goal | Convert visitors into completed, traceable flower orders; reduce repetitive inquiries and manual coordination |
| Secondary goals | Build brand credibility, showcase actual arrangements, help customers choose occasions and delivery options, streamline order fulfillment |
| Main audience | Customers ordering flowers for birthdays, anniversaries, romance, graduations, congratulations, sympathy, inaugurations, and other occasions; local and out-of-area gift senders |
| Geography | **Metro Manila and Pampanga, Philippines**, handled by separate branches |
| Branches | **Valenzuela** and **Angeles, Pampanga** |
| Operating hours | **8:00 AM–8:00 PM daily**, according to supplied shop-guide poster (shop, chat and delivery hours); exceptions and holiday schedules admin-configurable |
| Currency / timezone | **PHP (₱)**; `Asia/Manila` |
| Primary language | Natural, friendly **English**; optionally support Taglish for customer-facing help text |
| Business Facebook | https://www.facebook.com/bloomsbymarra/ |
| Brand tagline on poster | **Your Everyday Florist for Every Occasion** (from the branch/hours graphic) |
| Fulfillment channels on posters | Same-day delivery (subject to confirmation), store pickup, and **GrabMart Ready** (verify availability/official link before publishing integration) |
| Contact number | **To be verified by owner** before public launch |
| Valenzuela address | **111 McArthur Highway, Marulas, Valenzuela City** — printed on supplied poster; landmark **in front of 7-Eleven and beside Wye Cafe**; verify official street spelling, unit and map pin before launch |
| Pampanga address | **Galang–Wong Building, Salome Street, Brgy. Balibago, Angeles City, Pampanga** — printed on supplied poster; verify exact address and map pin before launch |
| Domain | **TBD**, configurable without source-code changes |

### Identity / tone

Blooms by Marra should feel **personal, thoughtful, romantic, and dependable** rather than a generic marketplace. The experience should help visitors easily send meaningful gifts on important occasions. Write concise, warm, natural product and ordering copy; avoid exaggerated claims, fake customer stories, or claims about delivery coverage beyond approved service areas.

## 2. BRAND & VISUAL DESIGN SYSTEM — GROUNDED IN PROVIDED POSTS

**Reference visuals:**

1. `brand-references/blooms-cover.png`: brand cover with warm-gray/off-white backdrop, chocolate-brown uppercase serif **BLOOMS BY MARRA**, soft pink floral bouquet, a slim line-art flower, circular **Order Today** accent and a pastel-pink utility ribbon across the bottom. Key text: **Flower Delivery • Manila & Pampanga**, **Valenzuela City & Angeles City**, **Same-Day Delivery**, **8 AM–8 PM**, **GrabMart Ready**.
2. `brand-references/blooms-shop-guide.png`: shop-hours graphic with ivory/blush background, warm tan label, beige textured paper, brown typographic hierarchy, delicate flower sketches, and a café-boutique editorial composition. It supplies the tagline **Your Everyday Florist for Every Occasion**. It also shows **3 PM** as the same-day cutoff, conflicting with prior owner-provided 2 PM guidance (see decision log).

### 2.1 Visual personality

The site must look like an **elegant, approachable floral gift boutique**, not a dark-tech startup or generic e-commerce template. Preserve the spirit of the supplied posts:

- **Mood:** soft, romantic, feminine, welcoming, artful, slightly vintage, thoughtful and trustworthy.
- **Style:** airy ivory canvas, blush-pink panels, champagne/tan accents, cocoa-brown typography and delicate botanical outlines.
- **Composition:** generous whitespace; balanced editorial typography; bouquet images as the visual hero; soft paper/textural layers used sparingly.
- **Shape language:** gentle rounded corners, tasteful oval/circular badges and fine botanical line art. Avoid excessive blob shapes, heavy card shadows, futuristic glass panels or neon gradients.
- **Motion:** subtle hover movement and fade/slide reveal; respect `prefers-reduced-motion`; do not make shopping interactions feel slow.
- **Accuracy:** use the owner's real bouquet photography as product imagery. The reference posters are *branding inspiration*, not SKU photos.

### 2.2 Color palette and design tokens

The values below are **production-friendly starting tokens informed by colors sampled or visually matched from the two uploaded graphics**, not an official brand manual. Preserve the visual balance even if individual values are refined later.

| Token | Hex | Use |
|---|---|---|
| `--color-background` | `#FBF4EE` | Main warm ivory page background (sampled from shop guide) |
| `--color-surface` | `#F6EEE1` | Cream product detail panels, cards and textured sections |
| `--color-blush` | `#F2B6B6` | Promotional ribbon and soft accents (sampled from cover) |
| `--color-blush-light` | `#FBE9E7` | Light promotional/occasion panels |
| `--color-sand` | `#E8D3B4` | Warm beige informational panels (sampled from shop guide) |
| `--color-taupe` | `#BB8E6D` | Tan borders, decoration, muted buttons (sampled) |
| `--color-cocoa` | `#543C30` | Headings, primary CTA, high-contrast body links |
| `--color-brown-muted` | `#7D634A` | Secondary text and boutique icons (sampled from shop guide) |
| `--color-sage` | `#74816C` | Rare botanical/status accent; not the dominant brand color |
| `--color-white` | `#FFFFFF` | White text on sufficiently dark buttons and clean surfaces |

**Accessibility:** Pink and tan are **decorative surfaces**, not white-text CTA backgrounds. Use dark cocoa text on blush/sand panels. Use cocoa/white or equivalent pairs that achieve WCAG AA contrast for normal text. Verify actual contrast in implementation; prefer darker variants for text as needed.

**Visual proportions:** approximately **60% ivory/cream**, **20% blush-pink**, **15% cocoa/taupe**, and **5% botanical accents**. Do not overuse sage green; the supplied posters are predominantly pink, cream, tan and brown.

Use semantic Tailwind variables rather than hardcoding color hex values throughout components. Produce CSS variables for default, hover, focus, disabled, border and text states.

### 2.3 Typography

- **Logo/hero serif:** elegant high-contrast display serif reminiscent of the poster's widely tracked uppercase lettering (e.g., **Cormorant Garamond**, **Playfair Display**, or **DM Serif Display**). The official logo asset, if supplied, overrides typeset approximations.
- **Subhead and body:** legible sans-serif such as **DM Sans** or **Inter**, with generous line height and controlled letter spacing.
- **Occasional script:** optional for tiny decorative phrases only, inspired by the handwritten shop-hours headings. **Never** use script for prices, labels, buttons, policies, navigation or form fields.
- **Example headline treatment:** `BLOOMS BY MARRA` can be uppercase with deliberate tracking in branding areas, while shopping/product headings use readable editorial case.
- **Hierarchy:** expressive but restrained. Avoid giant multi-line headings that push products or primary CTAs below the fold on mobile.

### 2.4 Photography, illustrations and art direction

- Prioritize **authentic bouquets and real arrangements** with soft natural lighting, neutral backgrounds and natural flower colors.
- Keep product card images consistent, preferably portrait `4:5`; homepage hero may use a larger portrait bouquet photograph on the right.
- Use subtle textured-paper backgrounds and thin botanical outline icons inspired by the uploaded posters; preserve readability.
- Use **owner-supplied, approved** logo files and flower photos. Do not crop Facebook screenshots to masquerade as official product/brand asset files.
- For missing images, use clearly marked admin/demo placeholders, never fictitious purchasable inventory.
- Do not copy the posted flyers pixel-for-pixel as website components: interpret their look as a cohesive responsive web design.

### 2.5 Website layout and visual sections

**Desktop home page (top to bottom):**

1. **Slim blush announcement strip**: current owner-approved delivery message or seasonal offer. Until cutoff verified, use a neutral line like **“Flower delivery across Metro Manila & Pampanga • Delivery subject to confirmation.”**
2. **Minimal ivory header**: approved Blooms by Marra logo, Shop, Shop by Occasion, Delivery & Pickup, About, Contact, search/cart. Sticky but unobtrusive. Mobile menu must remain easy to use.
3. **Editorial hero (two columns)**: left side ivory background with brown serif headline, short heartfelt copy, cocoa primary CTA **Shop Flowers**, outlined secondary CTA **Order a Custom Bouquet**; right side hero bouquet photo with soft blush framing. It should echo the supplied cover's left-title/right-bouquet balance.
4. **Brand trust/fulfillment ribbon**: blush strip with small line-art icons for **Delivery**, **Store Pickup**, and **8 AM–8 PM Shop Hours**; include **GrabMart Ready** only after verifying actual availability/official link.
5. **Shop by Occasion**: elegant image-backed collection tiles (Birthday, Anniversary, Congratulations, Sympathy etc.) using *actual catalog categories*.
6. **Best Sellers / Featured Flowers**: real inventory-aware product cards with names, PHP prices, location/fulfillment context and meaningful Add to Cart action.
7. **How to Order**: warm sand/cream paper-like panel showing **Choose Flowers → Select Delivery/Pickup → Confirm & Pay → Arrangement Prepared** with honest approval/payment-verification states.
8. **Valenzuela & Pampanga branches**: two balanced cards with owner-confirmed addresses, opening hours, pickup guidance and verified map links.
9. **Seasonal storytelling / shop gallery**: authentic approved lifestyle/product photography, a short brand story, optional Instagram/Facebook link (no unverified social metrics).
10. **FAQ + footer**: ordering, fees, same-day approval, payment methods, privacy and policies. Footer in cocoa/cream instead of black.

**Mobile page:** stack the hero text and photo thoughtfully (text + CTA visible early), 2-column product grid when legible, prominent cart, finger-friendly controls, no horizontally overflowing category tiles, no autoplay media and no buried delivery/pickup selection.

### 2.6 Component-specific rules

- **Primary button:** cocoa `#543C30` with white label; subtle lighter/darker hover, visible focus ring, at least 44px touch height.
- **Secondary button:** warm ivory surface, thin cocoa outline and cocoa text.
- **Card surfaces:** cream or ivory, restrained borders, minimal box shadow; product images should be the visual focus.
- **Badges:** blush with cocoa text for promo/availability notes; avoid misleading “in stock” labels if branch inventory is unverified.
- **Form fields:** cream/white with cocoa text, explicit labels, accessible error messaging; no decorative script.
- **Price and logistics:** readable above the fold, clear PHP currency formatting and *included delivery* annotation where applicable.
- **Checkout:** maintain romantic visual identity, but prioritize clarity and accuracy over decoration.

### 2.7 Visual acceptance checklist

- [ ] Homepage clearly resembles the mood of the two submitted brand posters, without copying their composition literally.
- [ ] Ivory, blush pink, beige and cocoa visibly dominate the design; sage is only a subtle accent.
- [ ] Hero features owner-approved flowers, an expressive serif headline and two working CTAs.
- [ ] Poster-style botanical details are subtle, responsive and do not obstruct text.
- [ ] Mobile shoppers can find products, delivery options and cart in a few taps.
- [ ] Text contrast, keyboard focus, dynamic states and reduced-motion behavior are verified.
- [ ] No fake product photos, testimonials, ratings, GrabMart integrations or hardcoded unconfirmed cutoff claims.

## 3. STORE NAVIGATION AND PAGES

### Primary pages

1. **Home** — seasonal hero, authentic featured arrangements, shop by occasion, shop by price, how ordering works, delivery areas, branch selector, featured products, shop policies preview, and CTA to shop.
2. **Shop All** — searchable product grid with filters (occasion, product type, price, branch availability) and sorting.
3. **Categories / Occasion Landing Pages** — Birthdays, Anniversaries, Love & Romance, Graduation, Congratulations, Sympathy / Funeral, Grand Openings / Inaugurations, and other **owner-confirmed** categories.
4. **Product Detail** — gallery, exact or starting price, contents/flower type when known, selectable variants, message card, eligible add-ons, availability indication, fulfillment details, policies, and Add to Cart.
5. **Cart** — edit items, quantities, options, clear subtotal and delivery fees, branch/serviceability validation.
6. **Checkout** — **guest checkout by default**, customer/recipient information, delivery or pickup, delivery date and preferred window, card message, order summary, approved payment instructions, and clear approval status.
7. **Order Confirmation / Status** — order reference, submitted details, payment verification status, fulfillment status; authenticated or token-protected access (no exposed personal data).
8. **About / Our Story** — owner-approved brand introduction and photos; do not invent history.
9. **Delivery & Pickup** — covered locations, cutoff, branch-specific fulfillment and customer expectations.
10. **FAQ** — ordering, customization, payments, availability, changes, refunds, and issue reporting.
11. **Contact / Branches** — official Facebook link, owner-verified branch addresses, opening hours, contact details, optional map after address verification.
12. **Policies** — Terms of Sale, Delivery & Pickup, Refunds / Changes, Privacy Policy, and any relevant business notices.

### Internal dashboard (authenticated)

Build a simple operational back office with role-based access:

- **Owner/admin:** Product catalog, prices, variants, add-ons, zones/fees, order approvals, refunds/credits handled under policy, policy content, users, settings, audit history.
- **Branch staff:** Confirm local stock, manage assigned fulfillment queue, update preparation and handoff status; limited visibility to necessary customer information.
- **Order management:** Search/filter orders, view event history, record manual payment checks, flag rush/custom orders, record staff decisions, capture fulfillment notes.
- **Inventory:** Mark available/unavailable and quantity where feasible by branch and date; owner can override. Assume availability changes daily.
- **Content management:** Change homepage featured items, seasonal banners, FAQ copy and gallery photos without redeploying (within MVP feasibility).

## 4. PRODUCT CATALOG AND PRICING RULES

The **complete current catalog is not available in this brief**. Do not invent products or prices; model categories, variants, stock, add-ons, and service areas so the owner can import the approved catalog.

**Known pricing example from business requirements:**

| Product example | Indicative approved online price | Rule |
|---|---:|---|
| 6-stem local roses bouquet | **₱999** | Price includes delivery within Metro Manila for the applicable online offer; verify product's active status, exact scope and any current promotion before public launch |

Business rules:

- Online bouquet prices **generally include delivery within Metro Manila** for applicable products. The checkout must **never double-charge included delivery**.
- Maintain **per-product/per-zone delivery-included flags** rather than a blanket free-shipping rule.
- **Funeral and inauguration standees** have **fixed delivery fees by destination city**, configurable by admin.
- **Pampanga pricing and any delivery charge** must use owner-confirmed product/zone rules; never assume Metro Manila inclusion applies there.
- **Add-ons** are available in a catalog; include extensible upsell functionality, but do not invent add-ons or prices.
- **Customized arrangements and rush requests** require human review and a confirmed quote if price/availability is not predetermined.
- Inventory and seasonal prices may change; source all live display prices from the database, not hardcoded UI.
- Display exact inclusions, delivery charges, and any pending approval state before a customer commits.
- Support configurable promotional banners but do not invent discounts.

### Suggested database fields for products

`product_id`, `sku`, `slug`, `name`, `description`, `category`, `occasion_tags`, `photos`, `base_price_php`, `variants`, `add_on_ids`, `branch_availability`, `inventory_status`, `delivery_inclusion_rules`, `lead_time`, `is_custom_quote`, `is_featured`, `is_active`, `updated_at`.

## 5. HARD BUSINESS RULES — DO NOT OVERRIDE

### 5.1 Branch service area / fulfillment

- **Valenzuela branch serves Metro Manila.**
- **Pampanga branch serves Pampanga.**
- Customers select delivery or pickup; for delivery, validate city/municipality against the branch's configurable service area.
- Branch selection should be suggested from delivery city but may require manual fulfillment decisions.
- **Internal exception:** If Pampanga stock is unavailable, Valenzuela may prepare an arrangement and send it to Pampanga by bus. This is **manual staff/owner coordination**, not a public delivery guarantee or automatic customer option.
- Unsupported destinations should display a polite serviceability message and optional inquiry link; never accept guaranteed fulfillment outside supported regions.

### 5.2 Hours and same-day delivery

- Shop, chat and delivery operational hours shown on the supplied post: **8 AM–8 PM daily** Philippine time; exceptions and staff capacity must remain configurable.
- **Cutoff discrepancy:** the earlier owner-provided requirement says **2:00 PM**, while the supplied graphic says **“Order before 3 PM for same day delivery.”** Do not assume the poster supersedes the owner's direct guidance merely because it was provided for color/design reference.
- Until owner confirms otherwise, set a **conservative provisional admin default of `14:00` (2 PM)** in `Asia/Manila`; do not embed this value across source code and do not publish an unverified fixed cutoff in marketing copy. The owner must choose either 2 PM, 3 PM, or a branch/date-specific policy before live launch.
- Determine same-day delivery eligibility from **branch-specific, timezone-aware, admin-configurable** cutoff and fulfillment settings.
- Requests **before** the configured cutoff are subject to stock, staff capacity, routing and final confirmation, not automatically guaranteed.
- Requests **at or after** the configured cutoff require staff approval. Display **Request Same-Day Approval**, not a guaranteed same-day checkout promise.
- Pickup is **not governed by the same-day delivery cutoff**; pickup availability/slots follow separate configurable rules.
- The website may collect requests **24/7**, consistent with the graphic's coming-soon website message, but do **not** imply that staff chat, fulfillment or customer service operates 24 hours.
- Holiday, peak-season, special closure and rush order rules must be admin-configurable.

### 5.3 Payment methods and confirmation

Accepted methods shared by the owner:

- **GCash**
- **Maya**
- **GoTyme**
- **MariBank**
- **Cash — pickup only**

Additional rules:

- **No Cash on Delivery (COD)**.
- **Full payment or at least 50% down payment** may be allowed depending on the customer/order **only if approved by owner/staff**.
- Expensive, custom or rush orders may require full payment. Never auto-offer a 50% deposit for all orders.
- For the MVP, implement an order submission + **manual transfer/payment proof** workflow unless a legitimate payment-provider integration is explicitly approved and configured.
- Payment instructions, account details and QR codes must be **owner supplied** and stored securely/configurably; do not invent payment destinations.
- Screenshot upload means **payment submitted for verification**, not **payment confirmed**.
- Staff must explicitly verify payment and approve the order before the system marks it paid/confirmed.
- Never store bank credentials or sensitive secrets in frontend code.

### 5.4 Refunds, changes, delivery issues

- **Paid orders are non-refundable** under the business's stated policy. Present this prominently before payment and subject the wording to applicable Philippine consumer protection requirements; do not attempt to waive mandatory legal rights.
- **No cancellations or order changes during peak seasons**, according to shop policy and subject to applicable law.
- Outside peak seasons, **order changes must be requested at least one day before delivery**. They still require confirmation.
- Delays from events beyond the shop's control may be rescheduled when possible. Do not make unconditional delivery guarantees.
- Customer concerns about an order must be reported **within 2 hours of receipt with photos** under the shop's policy; legal rights must not be improperly excluded.
- If the business confirms its own fault, remedy may be **replacement or store credit** according to the approved policy and applicable law.
- Outdoor use is at the customer's risk; include relevant guidance on appropriate use/care.
- Show concise policy summaries at checkout and link the complete owner/legal-reviewed policy.

## 6. EXACT CUSTOMER ORDER FLOW

Implement a reliable state-driven customer journey:

1. Visitor arrives from Facebook, Google Search or shared product link.
2. Visitor browses products and chooses an actual catalog item; optional variants/add-ons are selected.
3. Visitor chooses **Delivery** or **Pickup**.
4. For delivery, visitor enters recipient name, mobile number, complete address, city, preferred date/window and optional special instructions; service area and fees are validated.
5. For pickup, visitor selects branch, date and preferred time; no delivery charge applies.
6. Site evaluates date, delivery cutoff, branch inventory and product lead time. It clearly marks requests needing staff confirmation.
7. Visitor sees an itemized total, any included delivery, any additional delivery fee, and an explicit payment amount/status.
8. Visitor enters contact information and optional gift message; accepts relevant policies.
9. For predefined in-stock orders, the system creates an **Order Pending Confirmation** or other honest initial status; do not reserve an unavailable bouquet or claim confirmation without staff verification.
10. For custom, rush, out-of-stock or after-cutoff orders, create **Approval / Quotation Requested**, with no guaranteed price, time or availability until staff confirms.
11. Display owner-provided payment instructions **only when the amount and payment requirement are approved**; alternatively allow a configured pre-approval payment path for owner-designated catalog items.
12. Customer submits proof of payment through a secure upload (where applicable); staff verifies manually.
13. Staff confirms inventory, payment and fulfillment, then updates order status and communicates next steps.
14. Customer can view status using a secure order tracking link/reference.
15. After handoff, staff records completion/delivery notes. Post-delivery issue reporting follows policy and applicable law.

### Suggested order statuses

`draft`, `submitted`, `needs_review`, `quote_pending`, `awaiting_payment`, `payment_submitted`, `payment_verified`, `confirmed`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `completed`, `reschedule_requested`, `cancelled_before_payment`, `issue_reported`.

Model **payment status** and **fulfillment status** independently so a payment screenshot never accidentally confirms an order. Keep a timestamped audit trail of staff changes.

## 7. CRITICAL UX COMPONENTS

- High-visibility hero: **“Flowers for Every Meaningful Moment”** (proposed copy; owner may change).
- Main CTA: **Shop Flowers**; secondary CTA: **Request a Custom Arrangement**.
- Smart category and occasion shortcuts, including seasonal merchandising.
- Product card: authentic photo, name, price or **Request a Quote**, availability/fulfillment note, and actionable add-to-cart.
- Search, price/category/occasion filters and empty-results states.
- Fast cart drawer, persistent mobile checkout shortcut, order summary, inline errors.
- Clear delivery vs pickup switch with branch-specific service areas.
- City-based delivery pricing and a **Delivery Included** label when applicable.
- Delivery date picker honoring same-day rules; distinguish **available**, **request approval**, and **unavailable** states.
- Personalized gift message field; no extra fees unless catalog says so.
- Upsell/add-ons from the *approved* catalog only.
- Customer FAQ explaining payment verification and expected response process.
- Contact link to the actual Blooms by Marra Facebook page.
- Accessible confirmation messages and error handling; no dead-end buttons.
- Clear store timezone and local currency.
- If external chat/Messenger links are used, preserve the cart/order reference where feasible without leaking personal data.

## 8. RECOMMENDED TECH STACK

Choose maintainability and low recurring operational overhead, not unnecessary complexity:

| Layer | Default choice |
|---|---|
| Framework | **Next.js (App Router)** with current stable supported release |
| Language | **TypeScript** with strict typing |
| UI | **Tailwind CSS** and selectively **shadcn/ui** |
| Icons | **Lucide** |
| Animation | **Motion**, only where it enhances UX |
| Data store | **Supabase PostgreSQL** (or equivalent Postgres) |
| Authentication | Supabase Auth or equivalent for **staff and owner**; guest checkout for shoppers |
| Image storage | Private/public bucket separation for product imagery vs payment proofs |
| Forms and validation | React Hook Form + Zod or comparable maintained libraries |
| Email / notifications | Transactional provider **only when configured**; do not claim messages were sent without integration |
| Hosting | **Vercel** for storefront; compatible managed DB/storage |
| Automations | **n8n** integration as a controlled later-phase enhancement, with authenticated webhooks and retry handling |
| Analytics | Privacy-conscious event tracking with no sensitive customer or payment details |
| Repository | Git + GitHub |

Use current maintained versions, lockfile, typed environment validation and migrations. Use server-side authorization for all changes. Admin endpoints must check roles, not merely hide UI elements. Use Philippine peso centavos or integer minor units for money, not floating-point arithmetic.

## 9. DATA MODEL AND BACK-OFFICE DESIGN

Design and document migrations for at least:

- `profiles`, `roles`, `branches`, `service_zones`, `delivery_rates`
- `categories`, `products`, `product_variants`, `product_images`, `add_ons`
- `branch_inventory` (including availability timestamp and optional quantity)
- `carts`, `orders`, `order_items`, `order_addresses`, `order_status_events`
- `payment_instructions`, `payment_records`, `payment_proof_files`
- `custom_quote_requests`, `fulfillment_notes`, `holiday_cutoffs`, `site_settings`

Admin features:

- Approve/reject exceptional same-day requests.
- Review and accept/reject custom quotes or substitute arrangements.
- Confirm inventory availability per branch.
- Verify payments manually and record verifier/time.
- Print/export an order preparation list without exposing unnecessary PII.
- Set per-city fees, delivery inclusion rules, blackout dates and peak-season behavior.
- Upload/change product photos, price and availability.
- View a minimal sales/order dashboard without inventing financial totals.

Enforce database access controls (including row-level security where supported). Payment proofs and addresses must not be publicly accessible. Implement retention and deletion controls for customer personal information.

## 10. SEARCH, PERFORMANCE, ACCESSIBILITY AND TRUST

- Aim for **WCAG 2.2 AA** practices where feasible; keyboard navigation, visible focus, semantic landmarks, contrast and descriptive form errors.
- Optimize for mobile traffic, fast image loading, modern formats and minimal JavaScript.
- SEO pages for **flower delivery in Metro Manila**, **flowers in Valenzuela**, and **flower delivery in Pampanga**, but only with accurate service claims and unique copy.
- Product metadata, Open Graph previews, canonical URLs, XML sitemap and robots controls.
- Product structured data only for **real, published catalog products with accurate availability and price**.
- No invented ratings, testimonials, social proof, reviews, order counts or certifications.
- Security: rate-limited submissions, anti-spam, safe file uploads, CSRF protections where relevant, server-side validation, permission checks, secure tokens and secrets.
- Respect the Philippine **Data Privacy Act**; have the owner review the privacy notice and consumer-policy wording before launch.
- Test the **admin-configured same-day delivery cutoff** boundary in Philippine time (provisional 2 PM, plus 3 PM if owner approves) and ensure correctness even when the deployment server is in UTC.

## 11. CONTENT GUIDELINES

Write with an inviting, thoughtful voice. Example content directions are **draft suggestions**, not verified slogans:

- Hero headline: **Flowers for Every Meaningful Moment**
- Supporting line: **Thoughtfully arranged blooms for life's celebrations, heartfelt messages, and everything in between.**
- Primary CTA: **Shop Flowers**
- Secondary CTA: **Explore Arrangements**
- Delivery explanation: **Serving Metro Manila and Pampanga through our local teams. Delivery availability is confirmed per order.**
- Value proposition: **Choose an arrangement, share your delivery details, and let our team confirm the finishing touches.**

Make product descriptions accurate from owner-supplied catalog, with transparent substitutions and inclusions. Avoid promising same-day delivery in every locality.

## 12. DELIVERY PLAN — CODEX EXECUTION WORKFLOW

### Phase A — Audit and discovery

1. Inspect the existing repository (if any) and preserve working code.
2. Summarize business requirements, hard constraints and unknowns.
3. Review owner-provided catalog/photos/branding, if present.
4. Draft information architecture, entities, order states and payment flows.
5. Identify only **blocking** missing inputs; use safe placeholders for everything else.

### Phase B — Design and clickable storefront

1. Create the design tokens and reusable component library.
2. Build Home, Shop, Product Detail, Cart, Checkout and supporting pages with clearly identified **demo data** until approved product data is supplied.
3. Build excellent desktop and mobile layouts and meaningful loading/error/empty states.
4. Provide a realistic preview of both the normal order and staff-approval flow.

### Phase C — Production features

1. Implement database schema, migrations, seed scripts and row-level policies.
2. Implement guest checkout, branch/service-zone validation, pricing and time rules.
3. Implement order creation, payment proof storage, operator review and tracking.
4. Build admin catalog/inventory/order management tools.
5. Enable live owner-controlled settings and replace all dummy catalog data before launch.

### Phase D — Test and harden

Test at minimum:

- Metro Manila bouquet with **delivery included** (no duplicate fee).
- Pampanga delivery with owner-configured fee/eligibility rules.
- Funeral/inauguration standee with city-specific delivery rate.
- Pickup order with **zero delivery fee** and no incorrect delivery-cutoff restriction.
- Boundary tests at **one minute before, exactly at, and one minute after the configured cutoff** in `Asia/Manila`; explicitly test both `14:00` and `15:00` settings.
- Out-of-stock branch item and manual sourcing/transfer review.
- Rush/custom request with pending quote and no invented final total.
- Full-payment and **owner-approved** deposit cases.
- Payment screenshot upload that **does not** automatically verify payment.
- Staff roles, forbidden admin access, private customer data and private proof files.
- Refused outside-area delivery, failed form submission and retry/recovery.
- Responsive behavior at 375px mobile and common tablet/desktop widths.
- Build, lint, type-check, automated tests and manual core-path smoke tests.

### Phase E — Launch readiness

1. Add domain, analytics and production environment only when confirmed.
2. Verify real catalog, prices, branch addresses, contacts and official payment instructions.
3. Review policies with owner/legal adviser as needed.
4. Verify Vercel build and real test-order flow end to end.
5. Provide operational instructions for branch staff and owner.
6. **Do not deploy publicly or collect real payments without authorization and verified business credentials.**

### Phase F — Optional follow-on features (not mandatory for initial launch)

- n8n automation for new-order alerts, payment-review tasks and staff reminders.
- Messenger and/or other customer communication integration **only through supported, approved APIs**.
- AI shopping assistant constrained to verified products/prices/policies; human handoff for custom orders.
- Promotional campaigns, abandoned-cart follow-up with consent, seasonal catalog scheduling.
- Additional supported payment gateway and automated reconciliation after owner approval.

## 13. REQUIRED OUTPUTS

Provide:

1. **Brief architecture plan** and any necessary assumptions.
2. **Information architecture** and user flows, including exceptions.
3. **Design system** with responsive page layouts.
4. **Fully implemented source code**, migrations and seed/import scripts.
5. **Environment variable example** with no real secrets.
6. **Tests and results**, including business-rule edge cases.
7. **Run/deploy instructions** for development, staging and Vercel.
8. **Owner/admin operation guide** for catalog, inventory, payments and order statuses.
9. **Launch checklist** separating completed work from remaining owner-supplied data or integrations.

## 14. NON-NEGOTIABLE EXECUTION RULES

- Do not invent business facts, catalog products, prices, promo codes, bank details, testimonials, phone numbers, addresses or social media metrics.
- Do not copy images or text from Facebook without permission or a suitable rights basis.
- Do not create a visually attractive mockup that fails as an e-commerce storefront.
- Do not treat a customer order as confirmed without the required manual checks.
- Do not treat an uploaded transfer screenshot as verified payment.
- Do not accept COD for delivery.
- Do not promise delivery outside Metro Manila/Pampanga or before inventory and routing confirmation.
- Do not charge delivery twice when included in the product's price.
- Do not enforce a same-day **delivery** cutoff on pickup orders, and do not hardcode 2 PM or 3 PM in multiple places.
- Do not blindly issue refunds, cancellations, substitutions or deposits outside owner-approved policy and applicable law.
- Use actual working navigation, validation, state handling and role-secured APIs; label any unfinished integration.
- Preserve existing project files if invoked inside an existing repository.
- Before each substantial implementation milestone, state assumptions briefly; then build and test.
- If you cannot verify a third-party operation (payment, notification, deployment), state that plainly.

## 15. BEGIN NOW

**Start by summarizing the completed requirements and open data gaps. Then propose the information architecture, low-fidelity section layout, visual direction, technology architecture, database schema, and e-commerce checkout states for Blooms by Marra. Once the plan is clear, proceed to implement the MVP in the current repository without waiting for noncritical details. Keep every business-critical rule above intact.**

---

## Data owner must supply before live launch

- Approved product catalog (names, photos, active prices, variants, add-ons, lead times, branch availability).
- High-resolution official brand logo, approved photos, any font/color brand guide, and permission to use source photos and graphic elements.
- Verify the poster-transcribed Valenzuela and Angeles pickup addresses, landmarks, map pins, contact numbers and holiday hours.
- Approved delivery-zone/city fee matrix, Pampanga price rules, and **explicit decision on 2 PM vs 3 PM delivery cutoff** (possibly per branch).
- Official payment QR codes/accounts, owner decision rules for deposits, and payment-verification process.
- Approved policy/legal text, privacy contact, and order-notification destination(s).
- Domain, hosting accounts, database credentials and any approved integrations.

### Brand graphics and operational facts added in v2

- **Cover graphic** (`brand-references/blooms-cover.png`): warm pale background, cocoa serif wordmark, bouquet on the right, blush bottom information strip.
- **Shop-hours graphic** (`brand-references/blooms-shop-guide.png`): ivory/blush/tan/brown palette; illustrated flower/paper accents; branch pickup locations; daily 8 AM–8 PM hours; website orders 24/7 marked as *coming soon*.
- **Valenzuela address on graphic:** `111 - Mc Arthur Highway Marulas Valenzuela City`; landmark `Infront of 711 & beside Wye Cafe`; Waze listing named **Blooms by Marra Flower Shop - VALENZUELA**. Normalize only after verifying exact spelling and map pin.
- **Pampanga address on graphic:** `Galang - Wong Bldg. Salome Street. Brgy Balibago, Angeles City Pampanga`; Waze listing named **Blooms by Marra Flower Shop - PAMPANGA**. Normalize only after verification.
- **Same-day discrepancy:** business rule previously provided `2 PM`, second image says `3 PM`. Must be resolved before public launch.

### Public reference checked during preparation

- [Blooms by Marra official Facebook page supplied by owner](https://www.facebook.com/bloomsbymarra/) — **automated page inspection unavailable** during preparation.
- [Waze public listing — Blooms by Marra Flower Shop](https://www.waze.com/live-map/directions/ph/ncr/valenzuela/blooms-by-marra-flower-shop?to=place.ChIJg6PwCgi3lzMR3nPOZd3ZHlE) — publicly lists a Valenzuela address and number, but those details **must be owner-verified** before putting them on a checkout/contact page.

**Source priority:** Explicit owner-confirmed live rules and current catalog > verified owner-approved business assets/posters > third-party public listings > design suggestions. Distinguish a design reference from a request to change policy. Resolve conflicts with owner verification; never silently select a cutoff, address, catalog item or price.

**Decision required before launch:** Confirm whether the current same-day *delivery* cutoff is **2 PM or 3 PM** for Valenzuela and Pampanga, including busy-season and rush exceptions.
