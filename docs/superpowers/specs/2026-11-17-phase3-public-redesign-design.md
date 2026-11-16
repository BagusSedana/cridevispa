# Phase 3 — Public site redesign in Next.js + domain cutover

Date: 2026-11-17 · Status: draft for owner approval
Builds on: `2026-11-16-phase2-supabase-backend-design.md` (phase 2, live).

## Intent

CrideviSPA is a home-service massage/spa in Denpasar, Bali. Visitors are **tourists — domestic Indonesian and foreign — looking for the best spa in Bali at a competitive price** (owner, 2026-11-17). Within the first seconds they must see **quality** (a convincing, premium look), **price** (visible without hunting) and **how to book** (WhatsApp, fast). English must be as polished as Indonesian.

Today the public home page is the old static HTML site; only `/artikel`, `/admin` and the booking API run on the new Next.js app (proxied). Phase 3 rebuilds every public page in the Next.js app, fed by Supabase, then moves www.cridevispa.com to the app and retires the static site.

## Goals

1. Redesigned public pages in the Next.js app (`app/`), visual direction **A · "Gelap & Mewah"** (owner's pick from mockups): dark, gold, cream; Cormorant Garamond + Inter; large photography; 5-star-hotel feel. A refinement of the current identity, not a new one.
2. All prices and treatments come from Supabase (admin edits show everywhere). **Prices are not changed** (owner: "jangan dirubah harga yang sudah ada") — the database already holds today's prices.
3. Bilingual ID/EN on every page; Indonesian default, `?lang=en` for English (same URL scheme as phase 2 articles and current hreflang).
4. Trust built only from **facts that are already true** (see Trust content). No new promises, no invented reviews.
5. Booking via WhatsApp, recorded in Supabase, never blocked (phase 2 rule carries over).
6. Cutover: www.cridevispa.com served by the app project; static project and all proxy routes removed; old URLs keep working.

## Non-goals

- Changing prices, adding treatments, new services.
- On-site calendar/slot booking, payments, customer accounts.
- Admin dashboard redesign (it stays functional; separate later work).
- New guarantees or service promises (response time, notice period, transport fees, satisfaction guarantee) — owner explicitly declined promises they might not keep.

## Anti-goals (failure even if it works)

- Any fabricated review, rating, star count, customer name or "certified by X" claim not already on the current site. The three current testimonials (Sarah & James, Agung Pratama, Elena Rostova) are not real and must be removed.
- Hero blank on load (today's 2–3 s intro animation). The hero must render immediately with its text and buttons.
- A price shown anywhere that differs from the database, or a booking total that differs from what WhatsApp shows.
- www.cridevispa.com down, or an existing URL (`/`, `/?lang=en`, `/artikel…`, `/admin…`) returning 404 after cutover.
- SEO regression: pages that lose their title/description/canonical/hreflang, or an indexable `*.vercel.app` duplicate without canonical to www.

## Constraints

- Stack fixed by phase 2: Next.js 16 (App Router, `src/proxy.ts`), Supabase, Vercel project `cridevispa-app`. Commit and push directly to `main` (owner standing instruction); verify locally and live.
- Contact facts (from `js/config.js`): WhatsApp 6285812429650, email info@cridevispa.com, Instagram instagram.com/cridevispa, address Jl. Gunung Payung II No 26, Padangsambian Kelod, Denpasar Barat; hours 07:00–23:00, last booking 22:00; area "Denpasar & sekitarnya".
- Content to reuse: the ~240 ID/EN strings in `js/i18n.js` (hero, intro, why-us, process, FAQ, location, footer) and photos in `assets/` (jpg versions; the large duplicate `.png` files are not used).
- Mobile first: most tourists browse on phones. Tap targets ≥ 44 px, no horizontal scroll at 375 px.
- Accessibility: WCAG AA contrast on dark backgrounds, `prefers-reduced-motion` respected.

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **1 (chosen)** | Rebuild public pages in the Next.js app, then cut the domain over | Most work, but one site, prices from admin everywhere, server-rendered for SEO, removes the proxy setup and the `/app` exposure ruling from phase 2. |
| 2 | Restyle the old static HTML and fetch prices with JavaScript | Faster, but weaker SEO for prices, two sites to maintain, and it would have to be redone as approach 1 anyway. |

Owner picked **1** on 2026-11-17.

## Decisions made with the owner

- Audience and priorities as in Intent.
- Visual direction A (dark & luxurious), from the mockup comparison of A/B/C.
- Prices unchanged.
- No promises that might not be kept; no fake reviews. Reviews section only shows real reviews entered in admin.
- **Work happens on branch `phase3`** and is reviewed on its Vercel preview URL; www stays unchanged until the owner approves, then `phase3` is merged to `main` together with the cutover (owner, 2026-11-17). Small fixes outside phase 3 still go straight to `main`.

## Design

### Pages (all bilingual, all server-rendered)

| URL | Content |
|---|---|
| `/` | Home (sections below) |
| `/treatments` | Full menu: category filter, every treatment with all durations and prices, "Pilih" adds to booking |
| `/booking` | Selected treatments + form (existing phase-2 form, restyled); WhatsApp handoff |
| `/lokasi` | Area served, hours, contact, address + embedded Google Map |
| `/artikel`, `/artikel/[slug]` | Phase-2 pages restyled to direction A |
| `/admin…` | Unchanged |

Old static "views" were in-page (`#treatments` etc.); those anchors on `/` keep scrolling to the matching home section.

### Home sections, in order

1. **Hero** — headline, "Mulai Rp 100.000 · harga transparan" (minimum price read from DB, not hard-coded), buttons *Booking via WhatsApp* and *Lihat harga*. Renders immediately; any motion is a subtle fade on already-visible content.
2. **Kenapa CrideviSPA** — six facts, verbatim in meaning from the current site:
   - Terapis bersertifikat & terlatih menjaga privasi
   - Datang ke rumah, hotel, atau villa di Denpasar & sekitarnya
   - Peralatan & produk dibawa terapis
   - Buka setiap hari 07:00–23:00 (booking terakhir 22:00)
   - Harga tertera = harga dibayar · mulai Rp 100.000
   - Booking lewat WhatsApp, Bahasa Indonesia atau English
3. **Treatment & harga** — cards per category from Supabase with prices; link to `/treatments`.
4. **Ulasan tamu** — real reviews only, from a new `reviews` table managed in admin; **hidden when there are none**.
5. **Cara booking** — 4 steps (existing process copy).
6. **Area layanan** — Denpasar & sekitarnya, hours, map link.
7. **FAQ** — existing questions (mattress/towels, areas, how far ahead, payment).
8. **Artikel terbaru** — 3 latest published articles.
9. **Closing CTA + footer** — WhatsApp, Instagram, email, address.

Sections removed vs today: separate intro, split and banner sections (merged into 2) and the separate price preview (merged into 3); the three fake testimonials.

### Reviews (new, small)

- Table `reviews`: id, name, origin (e.g. "Seminyak villa guest"), treatment (text), rating 1–5, text_id, text_en, published (bool), created_at. RLS: public reads published only; admin full access.
- Admin page "Ulasan": add/edit/publish/unpublish. Only the owner enters reviews (copied from real guest messages/Google later). No public submission form in this phase.

### Visual system (direction A)

- Colors: near-black `#14120f`/`#1c1a16`, gold `#c9a96e`, cream `#faf7f0`; text contrast checked to AA.
- Type: Cormorant Garamond (headings), Inter (body), via `next/font` (self-hosted, no layout shift).
- Images: existing jpgs via `next/image` (responsive sizes, lazy below the fold, hero `priority`).
- Motion: short fade/slide-in on scroll for sections below the fold; none on the hero text; disabled under `prefers-reduced-motion`.
- Header: logo, nav (Beranda, Treatment, Lokasi, Artikel), ID|EN switch, gold "Booking" button; mobile menu; sticky WhatsApp button on mobile.

### SEO

- Each page: title, description, canonical to `https://www.cridevispa.com…`, hreflang id-ID/en-US, Open Graph image.
- JSON-LD `HealthAndBeautyBusiness` (name, address, phone, opening hours 07:00–23:00, area served, price range from DB min–max) on `/`; `Service`/`Offer` items on `/treatments`. No `aggregateRating` until real reviews exist.
- Sitemap adds `/treatments`, `/lokasi`; `?lang=en` alternates.

### Cutover (end of phase)

1. Verify all pages on `cridevispa-app.vercel.app` (owner reviews there first).
2. In Vercel: remove `www.cridevispa.com` and `cridevispa.com` from project `cridevispa`, add them to `cridevispa-app` (owner action, guided). DNS unchanged.
3. Redirects in the app for legacy paths: `/index.html` → `/`, `/artikel/*.html` (exists), any `/assets/*` used by old shared links served from `app/public/assets`.
4. Remove the static site files from the repo root and delete the `cridevispa` Vercel project after a week of stable traffic (owner's call).
5. Update Supabase Auth redirect URLs if needed (already www).

## Builder's calls

- Phase-2 temporary `/booking` form and article styling are replaced, not patched.
- `?lang=` stays the language mechanism (no `/en/` path prefix) to keep phase-2 URLs and hreflang stable.
- Treatment "icon" field keeps mapping to a small inline SVG set (existing icons: leaf, hands, flower, stones, muscle, …).
- Copy for the six trust facts is taken from current `why_*` strings, lightly shortened; English from the current `en` strings.

- **Review stars / structured data:** each published review may show its 1–5 stars on the page, but the site **never emits `aggregateRating` or `Review` JSON-LD** — Google treats a business's own reviews of itself as ineligible for star results and it risks a manual action. Star rich results, if ever, come from the Google Business Profile.
- **"Mulai Rp …":** computed as the true minimum `price_idr` over active treatments (today Rp 100.000), used by the hero, the trust fact and JSON-LD `priceRange`. Copy never hard-codes the number.
- **Rollback:** the static site, its `vercel.json` proxy routes and the `cridevispa` Vercel project stay unchanged and deployable until the owner confirms a week of stable traffic after cutover; rollback = move the domains back. Removing the static files and project is a follow-up after that week, not part of this phase's done criteria.
- **`*.vercel.app` host:** before cutover it stays reachable for owner review (canonical → www). After cutover, the production `cridevispa-app.vercel.app` host 308-redirects to www (via an env flag set at cutover), so only www is indexable; preview deployments keep `noindex`.

## Left to the builder

Component structure, CSS approach (CSS modules vs global), animation library choice (or none), exact image crops, map embed vs static map image, test setup for UI.

## Success criteria

- Every page above renders on mobile (375 px) and desktop with no console errors and no horizontal scroll; hero text visible on first paint.
- Prices on `/`, `/treatments`, `/booking` equal the database; changing a price in admin shows on all three within a minute.
- No review section is shown while `reviews` has no published rows; none of the old fake testimonials remain anywhere.
- Lighthouse mobile on `/`: Performance ≥ 85, Accessibility ≥ 95, SEO = 100.
- After cutover: `/`, `/?lang=en`, `/treatments`, `/lokasi`, `/booking`, `/artikel…`, `/admin…` all 200 on www; `/index.html` and `/artikel/x.html` redirect; a test booking from www lands in admin.
