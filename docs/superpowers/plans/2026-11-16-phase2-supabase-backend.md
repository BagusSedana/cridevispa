# Phase 2 — Supabase Backend + Next.js Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real backend for CrideviSPA: Supabase data, a logged-in admin, recorded WhatsApp bookings and SEO article pages, live on www.cridevispa.com via proxy while the static home page stays as is.

**Architecture:** A Next.js (App Router, TypeScript) app in `app/`, deployed as a second Vercel project. Supabase Postgres + Auth + Storage with RLS. The existing static Vercel project proxies `/artikel*`, `/admin*`, `/api/bookings` to the app; its home page booking form POSTs to `/api/bookings` before opening WhatsApp.

**Tech Stack:** Next.js 15 (App Router, TS), `@supabase/supabase-js` + `@supabase/ssr`, zod, Vitest, Supabase CLI (via `npx supabase`), Markdown via `react-markdown` + `rehype-sanitize`.

**Spec:** `docs/superpowers/specs/2026-11-16-phase2-supabase-backend-design.md`

## Global Constraints

- Hosting Vercel; repo github.com/BagusSedana/cridevispa; commit and push directly to `main` after local verification (owner instruction).
- www.cridevispa.com must never break; a booking API failure must never block opening WhatsApp.
- Bilingual ID/EN everywhere public; `?lang=en` selects English, Indonesian is default.
- WhatsApp number `6285812429650`; hours 07:00–23:00, last booking 22:00, timezone Asia/Makassar (WITA).
- Prices stored as integer rupiah (`price_idr`); displayed as `Rp 250.000`.
- `SUPABASE_SERVICE_ROLE_KEY` only in Vercel server env and git-ignored `app/.env.local`; never in client code, chat or git.
- Public sign-ups disabled in Supabase Auth; admin = user listed in `admins` table.
- Admin UI text in Indonesian.
- Article bodies: Markdown + images only, rendered sanitized.
- App's `*.vercel.app` host sends `X-Robots-Tag: noindex`; canonical/hreflang base `https://www.cridevispa.com`.

## Review Focus

1. Date/time checks done in WITA, not server UTC — a 23:30 WITA booking for "today" must be rejected, an 08:00 WITA booking made at 00:30 WITA for today accepted. (Task 5 test)
2. Client sends tampered prices or unknown treatment ids — server recomputes from DB, rejects unknown/inactive ids. (Task 5 test)
3. Phone in `08…`, `+62…`, `62…` and with spaces/dashes is accepted and normalized to `62…`; letters rejected. (Task 5 test)
4. Booking API down or slow on the live site — WhatsApp still opens within 3 s. (Task 13 test)
5. Anon key can read neither `bookings` nor unpublished articles nor inactive treatments, and cannot write anything. (Task 2 test)

---

### Task 0: Prerequisites (owner + environment)

**Files:** none (environment only)

- [ ] **Step 1:** Owner decides Supabase region. If recreating in Singapore: create project "cridevispa" in Southeast Asia (Singapore) and delete the Sydney one. (Owner action.)
- [ ] **Step 2:** Install Node.js LTS: `winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements`. Verify: `node -v` prints `v22.x` or newer.
- [ ] **Step 3:** In Supabase dashboard → Authentication → Sign In / Providers: disable "Allow new users to sign up"; create the owner's user (Users → Add user) with their email and a strong password. (Owner action.)
- [ ] **Step 4:** Owner copies Project URL, anon key and service-role key from Project Settings → API into `app/.env.local` (created in Task 1) themselves.

### Task 1: Scaffold the Next.js app

**Files:**
- Create: `app/` via `npx create-next-app@latest app --ts --app --eslint --src-dir --no-tailwind --import-alias "@/*"`
- Create: `app/.env.example` (the three var names, empty values), `app/vitest.config.ts`
- Create: `app/src/middleware.ts` (noindex header on `*.vercel.app`; admin guard added in Task 6)
- Modify: `app/next.config.ts` (security headers), `app/.gitignore` (ensure `.env*.local`)
- Test: `app/src/middleware.test.ts`

**Interfaces:**
- Produces: `npm test` (Vitest), `npm run build`; env names `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 1: Write failing test** `noindexOnVercelHost`: request with host `cridevispa-app.vercel.app` → response header `x-robots-tag` = `noindex`; host `www.cridevispa.com` → header absent.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement `middleware(req: NextRequest): NextResponse`. In `next.config.ts` add headers for all routes: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`, and a CSP allowing self + the Supabase URL in `connect-src`/`img-src`, Google Fonts in `style-src`/`font-src`, `frame-ancestors 'self'`.
- [ ] **Step 4:** `npm test` → PASS; `npm run build` → succeeds.
- [ ] **Step 5:** Check root `.vercelignore` impact: it lists `app/`. Vercel reads `.vercelignore` from the project's Root Directory, so the app project (Root Directory `app`) is unaffected — confirm in Task 12 by a successful app build; if it fails, move the ignore of `app/` to the static project via its "Ignored Build Step"/root `.vercelignore` only.
- [ ] **Step 6: Commit** `feat(app): scaffold Next.js app with security headers` and push.

### Task 2: Database schema + RLS

**Files:**
- Create: `app/supabase/migrations/20261116000001_schema.sql`, `..._rls.sql`
- Create: `app/scripts/grant-admin.sql` (one line: `insert into admins (user_id) values ('<OWNER_USER_ID>');`)
- Test: `app/tests/rls.test.ts` (integration, runs against the real project with anon + service keys from `.env.local`)

**Interfaces:**
- Produces tables exactly as in spec Data model: `categories`, `treatments`, `treatment_prices`, `articles`, `bookings` (status enum `booking_status`: `new|confirmed|done|cancelled`), plus `admins(user_id uuid primary key references auth.users)`; SQL function `is_admin() returns boolean` (security definer, checks `auth.uid()` in `admins`); storage bucket `article-images` (public read, admin write).

- [ ] **Step 1: Write failing tests** with an anon client: `select` from `bookings` returns 0 rows/permission error; `insert` into `treatments` errors; `articles` select returns only `published = true`; `treatments` select returns only `is_active = true`. With service client: insert one unpublished article + one inactive treatment fixture, cleaned up after.
- [ ] **Step 2:** Run `npx vitest run tests/rls.test.ts` → FAIL (tables missing).
- [ ] **Step 3:** Write migrations; RLS: anon/authenticated `select` on active/published rows; all writes and all `bookings` access require `is_admin()`. Apply with `npx supabase db push` (owner logs in to CLI with `npx supabase login` once).
- [ ] **Step 4:** Tests → PASS.
- [ ] **Step 5:** Owner runs `grant-admin.sql` in SQL editor with their user id (shown in Auth → Users).
- [ ] **Step 6: Commit** `feat(db): schema and row level security` and push.

### Task 3: Seed current content

**Files:**
- Create: `app/scripts/seed.ts` (run with `npx tsx scripts/seed.ts`), `app/scripts/legacy-data.ts` (copy of `DEFAULT_TREATMENTS_DATA` / `DEFAULT_ARTICLES_DATA` from `js/data.js`), `app/scripts/articles/manfaat-pijat-bali.id.md` / `.en.md` (converted from `artikel/manfaat-pijat-bali.html`)
- Test: `app/scripts/seed.test.ts`

**Interfaces:**
- Produces: `parseRupiah(s: string): number` and `legacyToRows(data): { categories, treatments, prices }` in `app/src/lib/price.ts` / `app/scripts/transform.ts`.

- [ ] **Step 1: Write failing tests:** `parseRupiah('Rp 250.000') === 250000`; `legacyToRows` turns Balinese Massage into one treatment with two prices `{60, 250000}` and `{90, 350000}`; a package with `dur_id: '2,5 jam'` keeps `duration_minutes: null` and the label. Total treatment count equals the legacy count.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. Seed is idempotent (upsert on `categories.key`, `treatments.name+category`, `articles.slug`). Article slug `manfaat-pijat-bali` (no `.html`). Legacy `art_2` reuses `art_1`'s slug in `js/data.js` — seed it as a draft (`published=false`) with slug `facial-rutin-iklim-tropis-bali` and no body; note it in the admin.
- [ ] **Step 4:** Tests PASS; run seed; verify row counts in Supabase table editor.
- [ ] **Step 5: Commit** `feat(db): seed current treatments and articles` and push.

### Task 4: Data access + formatting

**Files:**
- Create: `app/src/lib/supabase/server.ts` (`createServerClient()` via `@supabase/ssr` cookies), `app/src/lib/supabase/admin.ts` (`createServiceClient()` — imports `server-only`), `app/src/lib/catalog.ts`, `app/src/lib/articles.ts`, `app/src/lib/i18n.ts`
- Test: `app/src/lib/price.test.ts`, `app/src/lib/i18n.test.ts`

**Interfaces:**
- Produces: `formatRupiah(n: number): string` → `'Rp 250.000'`; `getLang(searchParams): 'id' | 'en'`; `getCatalog(lang): Promise<CategoryWithTreatments[]>`; `getPublishedArticles(lang): Promise<ArticleSummary[]>`; `getArticleBySlug(slug, lang): Promise<Article | null>`; types in `app/src/lib/types.ts`.

- [ ] Steps: failing tests for `formatRupiah(250000)`, `formatRupiah(0) === 'Rp 0'`, `getLang({lang:'en'}) === 'en'`, `getLang({}) === 'id'`, `getLang({lang:'fr'}) === 'id'` → implement → PASS → commit `feat(app): catalog and article data access` and push.

### Task 5: Booking API

**Files:**
- Create: `app/src/lib/booking/schema.ts`, `app/src/lib/booking/whatsapp.ts`, `app/src/lib/booking/rate-limit.ts`, `app/src/app/api/bookings/route.ts`
- Test: `app/src/lib/booking/schema.test.ts`, `whatsapp.test.ts`, `app/src/app/api/bookings/route.test.ts`

**Interfaces:**
- Consumes: `createServiceClient()`, `formatRupiah()`.
- Produces: `POST /api/bookings` body `{ name, phone, email?, date: 'YYYY-MM-DD', time: 'HH:MM', message?, lang: 'id'|'en', items: [{ treatmentPriceId: string }], website?: string /* honeypot */ }` → `201 { id, waUrl }` | `400 { error, field }` | `429`. `normalizePhone(s): string | null`; `isBookableSlot(date, time, now: Date): boolean` (WITA); `buildWaMessage(lang, booking): string` matching today's text in `js/main.js:477-479` exactly.

- [ ] **Step 1: Write failing tests:** `normalizePhone('0812-3456 789') === '628123456789'`, `('+62 812 3456 789')` same, `('abc')` null; `isBookableSlot` rejects past dates, rejects `22:30`, accepts `22:00`, rejects `06:59`, and uses WITA (Review Focus 1, two cases); `buildWaMessage('id', …)` equals a snapshot of today's format; route: unknown `treatmentPriceId` → 400; client-sent price ignored (total equals DB price); non-empty `website` → 201 but no row written; 6th request from one IP within 60 s → 429.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (rate limit: in-memory per instance, 5/min/IP — acceptable for this traffic; builder may swap for Supabase table). **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat(api): record bookings with server-side validation` and push.

### Task 6: Auth + admin shell

**Files:**
- Create: `app/src/app/admin/login/page.tsx`, `app/src/app/admin/layout.tsx`, `app/src/lib/auth.ts`
- Modify: `app/src/middleware.ts`
- Test: `app/src/lib/auth.test.ts`, `app/tests/admin-guard.test.ts`

**Interfaces:**
- Produces: `requireAdmin(): Promise<{ userId: string }>` (redirects to `/admin/login` if not signed in or not in `admins`); admin nav: Booking · Treatment & Harga · Artikel · Keluar.

- [ ] Steps: failing tests — unauthenticated GET `/admin` → 307 to `/admin/login`; signed-in non-admin → 403 page; admin → 200. Implement with `@supabase/ssr` session refresh in middleware → PASS → commit `feat(admin): login and admin guard` and push.
- [ ] **Forgot password** (owner request 2026-11-16): `/admin/lupa-password` (email field → `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.cridevispa.com/admin/reset-password' })`, always shows the same "Jika email terdaftar, link reset sudah dikirim" message so it does not reveal which emails exist) and `/admin/reset-password` (new password ×2, min 12 chars → `supabase.auth.updateUser({ password })`, then redirect to `/admin`). Owner adds `https://www.cridevispa.com/admin/reset-password` and the `.vercel.app` equivalent to Supabase Auth → URL Configuration → Redirect URLs. Test: the request page returns the same message for a known and an unknown email.

### Task 7: Admin — bookings

**Files:** `app/src/app/admin/page.tsx` (bookings list), `app/src/app/admin/bookings/[id]/page.tsx`, `app/src/app/admin/bookings/actions.ts`; Test: `actions.test.ts`

**Interfaces:** `updateBookingStatus(id, status: BookingStatus)`, `updateBookingNote(id, note: string)` — server actions calling `requireAdmin()` first.

- [ ] Steps: failing tests (non-admin call throws; invalid status rejected) → list newest first with filters status/date, detail view, "Buka WhatsApp" link `https://wa.me/<normalized phone>` → PASS → commit and push.

### Task 8: Admin — treatments & prices

**Files:** `app/src/app/admin/treatments/page.tsx`, `.../[id]/page.tsx`, `.../actions.ts`; Test: `actions.test.ts`

**Interfaces:** `saveTreatment(input)`, `setTreatmentActive(id, active)`, `reorderTreatments(categoryId, ids[])`, `savePrice(input)`, `deletePrice(id)`; each calls `requireAdmin()` and `revalidatePath('/')`.

- [ ] Steps: failing tests (price must be integer > 0; duration either minutes or label; non-admin rejected) → implement → PASS → commit and push.

### Task 9: Admin — articles

**Files:** `app/src/app/admin/articles/page.tsx`, `.../[id]/page.tsx`, `.../actions.ts`, `app/src/lib/slug.ts`; Test: `slug.test.ts`, `actions.test.ts`

**Interfaces:** `slugify(title: string): string`; `saveArticle(input)`, `setPublished(id, published)`, `uploadCover(file): Promise<string /* public URL */>`; saving calls `revalidatePath('/artikel')` and `revalidatePath('/artikel/' + slug)`.

- [ ] Steps: failing tests — `slugify('5 Manfaat Pijat Bali!') === '5-manfaat-pijat-bali'`, accented letters transliterated, duplicate slug rejected with Indonesian message, cover upload rejects non-image and > 2 MB → implement (Markdown textarea + preview using the same sanitized renderer as Task 10) → PASS → commit and push.

### Task 10: Public article pages + sitemap

**Files:** `app/src/app/artikel/page.tsx`, `app/src/app/artikel/[slug]/page.tsx`, `app/src/components/Markdown.tsx`, `app/src/app/sitemap.ts`, `app/src/app/robots.ts`, `app/next.config.ts` (redirect)

**Interfaces:** `generateMetadata` sets title, description, canonical `https://www.cridevispa.com/artikel/<slug>`, hreflang `id`/`en` (`?lang=en`), OG image = cover; page embeds `Article` JSON-LD.

- [ ] Steps: failing tests — `Markdown` strips `<script>` and `onerror=`; unknown slug → 404; unpublished slug → 404; sitemap includes published slugs only; `/artikel/manfaat-pijat-bali.html` → 301 to `/artikel/manfaat-pijat-bali`. Verify with JS disabled that the body text is in the HTML (`curl` the page, grep a sentence) → commit and push.

### Task 11: Minimal booking page on the app

**Files:** `app/src/app/booking/page.tsx`, `app/src/components/BookingForm.tsx`, `app/src/app/api/catalog/route.ts`

**Interfaces:** Consumes `getCatalog()`, `POST /api/bookings`; on 201 opens `waUrl`; on any error/timeout (3 s) still opens WhatsApp with the client-built message. Produces `GET /api/catalog?lang=id|en` → `{ treatmentPriceId, name, durationMinutes, durationLabel, priceIdr }[]` (active only; used by Task 13).

- [ ] Steps: render catalog, select items, submit → row appears in admin (manual check in browser) → commit and push. Look is temporary (phase 3).

### Task 12: Deploy the app project

**Files:** none in repo (Vercel dashboard), plus `app/vercel.json` only if needed.

- [ ] **Step 1:** Owner, in Vercel: Add New → Project → import `BagusSedana/cridevispa` again, name `cridevispa-app`, Root Directory `app`, framework Next.js. Add the three env vars (Production + Preview). (Owner action; keys pasted by owner.)
- [ ] **Step 2:** Verify build succeeds (this also confirms the root `.vercelignore` does not exclude the app — Task 1 Step 5).
- [ ] **Step 3:** Verify on `cridevispa-app.vercel.app`: `/admin` login works, `/artikel/manfaat-pijat-bali` renders, `curl -I` shows `x-robots-tag: noindex`, a test booking appears in admin then is deleted.

### Task 13: Wire the live static site

**Files:**
- Modify: `vercel.json` (root) — add before the catch-all: `/artikel(.*)`, `/admin(.*)`, `/api/bookings` → `https://cridevispa-app.vercel.app/...` (keep the header route first)
- Delete: `admin/index.html`, `js/admin.js`, `css/admin.css`, `artikel/index.html`, `artikel/manfaat-pijat-bali.html`
- Modify: `js/main.js` booking submit (around lines 432–494): `fetch('/api/bookings', …)` with 3 s `AbortController` timeout, map selected items to `treatmentPriceId` via a lookup endpoint or by sending `{ name, dur }` — **decision: add `GET /api/catalog` to the app (Task 11 owner) returning `{ name, durationMinutes, durationLabel, treatmentPriceId }[]`, and `main.js` matches by name + duration**; on any failure, fall back to today's `window.open(wa.me…)`. Remove `_saveBookingToStorage`.
- Test: manual + `curl`

- [ ] **Step 1:** Local check with `server.ps1` is not possible for proxies — verify on a Vercel Preview deployment of a branch? Owner pushes to `main` only, so instead: make the change, push, and immediately verify live (rollback = `git revert` + push).
- [ ] **Step 2:** Live checks: `/artikel/manfaat-pijat-bali` 200 from app; `/artikel/manfaat-pijat-bali.html` 301; `/admin` shows new login; home page booking creates a row and opens WhatsApp; with `/api/bookings` blocked in DevTools, WhatsApp still opens (Review Focus 4); console has no errors.
- [ ] **Step 3: Commit** `feat: route articles, admin and bookings to the new app` and push; run checks; revert if any fails.
