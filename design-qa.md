# Visual QA — reference-led revision

final result: passed

Scope: responsive adaptation of the supplied desktop/mobile florist concept, preserving the package's mandatory demo and business-data safeguards. This is not a claim of pixel-identical rendering or approved production branding.

## Evidence reviewed

- Source: `design-reference/homepage-desktop-mobile-concept.png`, including desktop panel and phone content.
- Reference-width desktop: `artifacts/home-reference-desktop.png` at 908px, normal homepage state.
- Desktop: `artifacts/home-desktop.png` at 1440px, normal homepage state.
- Mobile: `artifacts/home-mobile.png` at 375px, normal homepage state, category row at its initial position.
- Tablet: `artifacts/home-tablet.png` at 768px.

## Comparison

The initial version's large editorial headline and stacked mobile hero have been replaced with the reference's brand wordmark and adjacent bouquet. Desktop hero is 330px tall at 908px width, close to the source's shallow panoramic composition. Header uses the serif wordmark and active underline; the blush strip has four fulfillment icons. Six rounded occasion tiles occupy one desktop row; mobile presents three at a time with functional horizontal scrolling. Five rounded product cards use distinct rose, pink rose, sunflower, mixed and lily demo images. Mobile features two cards with the remaining catalog available through View All Products. Watercolor guide, compact branch panels and floral closing CTA replace the prior oversized sections.

## Issues corrected

- P1: mobile hero text overlaid dense flowers. Corrected with a mobile-specific image wrapper crop and a reserved left brand area.
- P2: excess vertical space and sparse desktop grid. Corrected with reference-proportioned header, six occasion columns, five product columns, compact guide/branch panels and reduced card gaps.
- P2: repeated imagery. Replaced with separate generated demo arrangements and matching imagery in detail/cart views.

No unresolved P0/P1/P2 visual defects were observed in the final captures. All image requests decoded successfully. Page width equals viewport width at 375, 768, 908 and 1440px; the hero artwork and occasion strip clip/scroll inside their own containers intentionally.

## Intentional differences and remaining polish

Demo disclosures, sample-price annotations, honest confirmation wording and footer navigation remain. No fictional ratings, best-seller labels, unverified fixed cutoff, GrabMart promise, address claims or storefront photographs were copied. Generated artwork resembles the concept's direction; authentic photos and official logo need owner approval. Georgia is an offline serif approximation. These asset/type refinements remain follow-up polish rather than a production-readiness claim.

## Functional validation

Chromium smoke suite passed: catalog search/filter/empty states; favorite toggles; six occasions and mobile scrolling; five desktop/two mobile featured cards; five distinct product images; cart persistence; checkout error recovery and pickup/cash rehearsal; admin preview control; 401 admin API guard; 503 disabled order endpoint; ten supporting mobile routes without page overflow. No browser JavaScript runtime errors were detected. Unit tests: 18 passed. Lint, strict TypeScript and Next.js production build passed.
