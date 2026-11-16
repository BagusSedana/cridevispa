# Phase 3 — Public Redesign + Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every public CrideviSPA page in the Next.js app in visual direction A, fed by Supabase, then move www.cridevispa.com to the app.

**Architecture:** Server-rendered App Router pages in `app/src/app/(site)/` sharing one site chrome (header, footer, WhatsApp button). Copy lives in a typed ID/EN dictionary ported from `js/i18n.js`; data comes from the phase-2 libs plus a new `reviews` table. Work on branch `phase3`, reviewed on the Vercel preview URL, merged at cutover.

**Tech Stack:** Next.js 16 (App Router, `src/proxy.ts`), React 19, Supabase, `next/font` (Cormorant Garamond, Inter), `next/image`, CSS Modules, Vitest + `react-dom/server` for render tests.

**Spec:** `docs/superpowers/specs/2026-11-17-phase3-public-redesign-design.md`

## Global Constraints

- Branch `phase3`; push the branch (Vercel preview). Merge to `main` only in Task 12 after owner approval.
- Visual direction A: `--ink #14120f`, `--ink-2 #1c1a16`, `--gold #c9a96e`, `--cream #faf7f0`; headings Cormorant Garamond, body Inter; WCAG AA contrast.
- Prices never hard-coded and never changed; "Mulai Rp …" = min active `price_idr` (today 100000).
- No fabricated reviews/ratings; the three legacy testimonials (Sarah & James, Agung Pratama, Elena Rostova) appear nowhere; never emit `aggregateRating` or `Review` JSON-LD.
- Trust facts are exactly the six in the spec; no new promises.
- Language via `?lang=en`; Indonesian default; every link keeps the current language.
- Hero text and buttons present in the server HTML; motion only below the fold, off under `prefers-reduced-motion`.
- Mobile 375 px: no horizontal scroll, tap targets ≥ 44 px.
- Contact: WA `6285812429650`, `info@cridevispa.com`, `https://instagram.com/cridevispa`, `Jl. Gunung Payung II No 26, Padangsambian Kelod, Denpasar Barat, Bali`, hours 07:00–23:00, last booking 22:00.
- Canonical/hreflang base `https://www.cridevispa.com`.

## Review Focus

1. Supabase unreachable or slow at request time — pages must still render (trust, contact, booking via plain WhatsApp link) instead of a 500. (Task 3 test)
2. `/booking?items=` with unknown, inactive, duplicated or 50 ids — ignored/clamped, never crashes, never trusts prices. (Task 6 test)
3. Unknown `?lang=` value or `lang` given twice — falls back to Indonesian, links stay consistent. (Task 2 test)
4. Treatment with no prices, or a category whose treatments are all hidden — not rendered as an empty card. (Task 5 test)
5. Very long treatment name / description on 375 px — wraps, no overflow. (Task 5 verification)

---

### Task 0: Branch, assets, fonts

**Files:** Create `app/public/assets/*.jpg` (copy of the jpgs used by the static site + `cridevispa_logo.png`); Modify `app/src/app/layout.tsx`.

- [ ] `git switch -c phase3`; copy assets; in `layout.tsx` load Cormorant Garamond (400/600, italic) and Inter (400/500/600/700) with `next/font/google`, exposing `--font-serif` / `--font-sans`.
- [ ] `npm run build` → succeeds. Commit `chore(phase3): branch assets and fonts`; `git push -u origin phase3`; note the Vercel preview URL in the ledger.

### Task 1: Copy dictionary

**Files:** Create `app/src/content/copy.ts`, Test `app/src/content/copy.test.ts`.

**Interfaces:** Produces `COPY: Record<Lang, Copy>` and `t(lang: Lang): Copy`, where `Copy` is a typed object with groups `nav`, `hero`, `trust` (6 items `{title, desc}`), `treatments`, `reviews`, `process` (4 steps), `area`, `faq` (items `{q, a}`), `articles`, `cta`, `footer`, `booking`, `location`.

- [ ] **Test:** both languages have identical key shapes and no empty strings; `trust` has exactly 6 items; serialized `COPY` contains none of `Sarah`, `Agung Pratama`, `Elena`, `★★★★★`; no string contains a hard-coded `Rp 100.000` (price comes from data — use `{min}` placeholder).
- [ ] Run → FAIL. Implement by porting `js/i18n.js` strings (strip HTML like `<br>`/`&nbsp;`), trust facts per spec. Run → PASS. Commit.

### Task 2: Site chrome + design tokens

**Files:** Create `app/src/app/(site)/layout.tsx`, `app/src/components/site/{SiteHeader,SiteFooter,LangSwitch,WhatsAppFab,Reveal}.tsx`, `app/src/components/site/site.module.css`, `app/src/lib/links.ts`; Test `app/src/lib/links.test.ts`.

**Interfaces:** Produces `withLang(path: string, lang: Lang): string` (`/treatments`+`en` → `/treatments?lang=en`; `id` → unchanged; preserves existing query); `waLink(lang: Lang, text?: string): string` (uses `buildWaUrl`); `<Reveal>` client component (IntersectionObserver fade-up, no-op when reduced motion).

- [ ] **Test:** `withLang` cases above plus `withLang('/booking?items=a','en') === '/booking?items=a&lang=en'`; `getLang({lang:['en','id']})==='en'` and `getLang({lang:'xx'})==='id'` (Review Focus 3).
- [ ] Implement; move `artikel`, `booking` routes under `(site)` so they share the chrome; header: logo, Beranda/Treatment/Lokasi/Artikel, ID|EN, gold "Booking"; mobile menu (`<details>`, no JS needed); sticky WA button on mobile.
- [ ] Verify 375 px + desktop in browser, no console errors. Commit.

### Task 3: Data additions — price range, reviews

**Files:** Create `app/supabase/migrations/20261117000004_reviews.sql`, `app/src/lib/reviews.ts`, `app/src/lib/price-range.ts`; Modify `app/src/lib/catalog.ts`; Tests `app/tests/reviews-rls.test.ts`, `app/src/lib/price-range.test.ts`, `app/src/lib/catalog.test.ts`.

**Interfaces:** Produces `getPriceRange(): Promise<{ min: number; max: number } | null>`; `getPublishedReviews(lang): Promise<Review[]>` (`Review = { name, origin, treatment, rating: 1|2|3|4|5, text }`); `getCatalogSafe(lang): Promise<CategoryWithTreatments[] | null>` (null on error, logs once).

- [ ] Migration: `reviews` table per spec + RLS (public select `published`, admin all). Owner pastes it in SQL Editor (clipboard).
- [ ] **Tests:** anon cannot read an unpublished review (positive control: can read a published fixture); `getPriceRange()` → `{ min: 100000, … }`; `getCatalogSafe` returns null when the Supabase URL is unreachable (point env at `http://127.0.0.1:9` in the test) — Review Focus 1.
- [ ] Implement; commit.

### Task 4: Home page

**Files:** Create `app/src/app/(site)/page.tsx` (replaces the redirect), `app/src/components/home/{Hero,Trust,TreatmentCards,Reviews,Process,Area,Faq,LatestArticles,ClosingCta}.tsx`, `app/src/lib/business-jsonld.ts`; Test `app/src/components/home/home.test.tsx`, `app/src/lib/business-jsonld.test.ts`.

**Interfaces:** `businessJsonLd(range: {min,max} | null, lang): object` → `@type: 'HealthAndBeautyBusiness'`, address, telephone `+6285812429650`, `openingHours: 'Mo-Su 07:00-23:00'`, `areaServed: 'Denpasar'`, `priceRange: 'IDR 100000 - IDR <max>'`; never has `aggregateRating`/`review`.

- [ ] **Tests:** `renderToStaticMarkup(<Hero min={100000} lang="id"/>)` contains `Rp 100.000`, the WA link and the "Lihat harga" link; `<Reviews items={[]}/>` renders `''`; `<Reviews items=[one]/>` shows its name; `businessJsonLd` has no `aggregateRating`; when `range` is null, Hero shows no price line (not "Rp 0").
- [ ] Implement sections in spec order; hero image `priority`, others lazy; anchors `#treatments`, `#faq`, `#lokasi`.
- [ ] Verify in browser at 375 px / desktop; hero text present with JS disabled (`curl` grep). Commit.

### Task 5: /treatments

**Files:** Create `app/src/app/(site)/treatments/page.tsx`, `app/src/components/site/TreatmentCard.tsx`; Test `app/src/components/site/treatment-card.test.tsx`.

**Interfaces:** "Pilih" links to `withLang('/booking?items=<priceId>', lang)`; category filter via `?kategori=<key>` (server-side, no JS).

- [ ] **Tests:** a treatment with `prices: []` renders nothing; a category whose treatments render nothing is omitted (Review Focus 4); each price row shows `formatRupiah(priceIdr)` and its duration label.
- [ ] Implement + `Service`/`Offer` JSON-LD; verify a long name wraps at 375 px (Review Focus 5). Commit.

### Task 6: /booking (restyle + preselect)

**Files:** Modify `app/src/app/(site)/booking/page.tsx`, `BookingForm.tsx`; Create `app/src/lib/booking/preselect.ts`; Test `app/src/lib/booking/preselect.test.ts`.

**Interfaces:** `parsePreselected(raw: string | string[] | undefined, validIds: Set<string>): string[]` — split on commas, keep valid ids, dedupe, max 10.

- [ ] **Tests:** unknown ids dropped; duplicates removed; 50 ids → 10; `undefined` → `[]` (Review Focus 2).
- [ ] Implement; form starts with those items checked; keep phase-2 submit/fallback behaviour; restyle to direction A. Commit.

### Task 7: /lokasi

**Files:** Create `app/src/app/(site)/lokasi/page.tsx`.

- [ ] Area, hours, contact, address, Google Maps embed (`https://www.google.com/maps?q=…&output=embed`, add `frame-src https://www.google.com` to CSP in `next.config.ts`), WA button. Verify render + no CSP console error. Commit.

### Task 8: Articles restyle

**Files:** Modify `app/src/app/(site)/artikel/page.tsx`, `[slug]/page.tsx`; delete `ArticleChrome.tsx`, `artikel.css`, `booking.css` once unused.

- [ ] Use site chrome and tokens; existing article tests and `tests/seo.test.ts` still pass. Commit.

### Task 9: Admin — Ulasan

**Files:** Create `app/src/app/admin/(panel)/reviews/{page.tsx,actions.ts,actions.test.ts}`; Modify panel nav.

**Interfaces:** `saveReview(state, form)`, `setReviewPublished(id, published)` — `requireAdmin()` first; validation: name ≤ 80, rating integer 1–5, `text_id` or `text_en` required; `revalidatePath('/')`.

- [ ] **Tests:** non-admin rejected; rating 6 rejected with Indonesian message; empty texts rejected. Implement; commit.

### Task 10: SEO + legacy URLs

**Files:** Modify `app/src/app/sitemap.ts`, `app/next.config.ts`, every `(site)` page's `generateMetadata`; Create `app/src/lib/metadata.ts`; Test extend `app/tests/seo.test.ts`.

**Interfaces:** `pageMetadata({ path, lang, title, description, image? }): Metadata` → canonical `SITE_URL+path`, hreflang `id-ID`/`en-US` (`?lang=en`), OG.

- [ ] **Tests:** sitemap includes `/treatments` and `/lokasi`; redirect `/index.html` → `/` (301); `pageMetadata` canonical never contains `?lang`.
- [ ] Implement; commit.

### Task 11: Preview review + quality gate

- [ ] On the `phase3` preview URL: every page 200, no console errors at 375 px and desktop, prices equal `/api/catalog`, no fake testimonial text (`curl | grep -c Sarah` = 0).
- [ ] Lighthouse mobile on `/`: Performance ≥ 85, Accessibility ≥ 95, SEO = 100 (run `npx lighthouse <preview>/ --preset=perf` etc.; fix until met).
- [ ] Send owner the preview URL; **stop until owner approves.**

### Task 12: Cutover

**Files:** Modify `app/src/proxy.ts` (+test): when `process.env.REDIRECT_APP_HOST_TO_WWW === '1'` and host is `cridevispa-app.vercel.app`, 308 to `https://www.cridevispa.com` + path; preview hosts untouched.

- [ ] **Test:** flag on + production host → 308 to www keeping path and query; preview host (`cridevispa-app-git-phase3-….vercel.app`) → no redirect; flag off → no redirect.
- [ ] Merge `phase3` → `main`, push; owner moves domains in Vercel (remove from `cridevispa`, add to `cridevispa-app`) and sets `REDIRECT_APP_HOST_TO_WWW=1`.
- [ ] Live checks per spec success criteria (all URLs 200/redirects, test booking from www appears in admin and is deleted). Static project kept for one week as rollback.
