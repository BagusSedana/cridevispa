# SDD ledger — plan: docs/superpowers/plans/2026-11-17-phase3-public-redesign.md
Setup: branch phase3 (owner chose preview-first); base 2f24f08
Pre-flight: T1 COPY consumed by T2,T4-T7 — consistent. T2 withLang/waLink consumed by T4-T7 — consistent. T3 getPriceRange/getPublishedReviews/getCatalogSafe consumed by T4,T5,T10 — consistent. T6 parsePreselected consumes T5 '/booking?items=' format — consistent. T10 pageMetadata used by T4-T8 pages — T10 comes after; Ruling: create lib/metadata.ts early in T4 and extend in T10 — cost: none.
Task 0: complete (commit 1391010, build ok; preview URL pending Vercel)
Task 1: Ruling: hero headline uses the approved mockup copy ('Spa villa terbaik, datang ke Anda' / 'Bali’s finest villa spa, brought to you') instead of legacy 'Traditional Care, Modern Touch' — owner picked mockup A with it — cost: owner may prefer the old line. Added withMin() helper for the {min} placeholder.
Task 1: complete (commit e853670, tests: vitest src/content → 9 passed)
Task 2: Ruling: header/footer are a server component SiteShell({lang,path}) rendered by each page instead of a (site)/layout.tsx — layouts don't receive searchParams, and lang comes from ?lang — cost: each page must pass its path. Reveal hides below-fold content until JS runs — cost: no-JS visitors see faded sections; text stays in HTML for SEO.
Task 2: complete (commit 873b279, tests: npm test → 117 passed; 375px overflowX 0; no console errors)
Task 3: Ruling: added a 4 s fetch timeout to the cookie-less public Supabase client — an unreachable DB otherwise hung pages (tests timed out) — cost: very slow but alive DB responses >4 s show the fallback content; outage case takes ~7 s per loader (client retries).
Task 3: partial (commit 3a8e187; price-range 1 passed, safe loaders 3 passed; reviews RLS test blocked until owner runs migration 004)
Task 4: Ruling: home treatment cards show the first 3 prices per category plus '+N' and link to /treatments?kategori=<key> — keeps the home short — cost: none. Category photos mapped from existing assets (foot→massage_service, ear→wellness_split, body→facial_service).
Task 4: complete (commit badf24b, tests: npm test pass; server HTML has hero/price/trust/JSON-LD, no 'Sarah'/'aggregateRating'; 375px overflowX 0; no console errors)
Task 5: Ruling: renamed TreatmentCard → TreatmentList (whole menu component) — same responsibility — cost: none. Unknown ?kategori shows all.
Task 5: complete (commit 995450b, tests: treatment-card 3 passed; packages filter 2 rows, all 16 rows, EN 16; 375px overflowX 0)
Task 6: complete (commit 81ff63b, tests: preselect 6 passed; browser: ?items=valid,bogus,dup → 1 checked, total Rp 250.000; rows grid 3-col at 375px)
Task 7: complete (commit c8eedc7; browser 375px: overflowX 0, map iframe present, no CSP errors)
Task 8: Ruling: kept ArticleChrome (now SiteShell + article wrapper) and a restyled global artikel.css instead of deleting them — Markdown output is styled by element selectors — cost: none.
Task 8: complete (commit ead9bbb; tests: seo+components 16 passed; 4 article URLs 200 with lang-aware links; 375px overflowX 0)
Task 9: complete (commit 95d899a, tests: reviews actions 4 passed; tsc clean)
Task 10: complete (commit ff497ee, tests: seo 6 passed; full suite Tests  145 passed | 3 skipped (148)
Task 11: Lighthouse mobile (local prod build): / perf 89 a11y 100 seo 100; /treatments 93/100/100; /lokasi 94/100/100; /booking 94/100/66 (noindex by design); /artikel 93/100/100; article 94/100/100. Fixed colour contrast (gold-ink token).
Task 11: Ruling: Lighthouse run on a local production build instead of the preview URL — preview is behind Vercel login — cost: Vercel edge/CDN timing differs slightly from local.
Task 11: Ruling: /booking SEO 66 accepted — page is deliberately noindex (form, no search value) — cost: none.
Task 11: waiting for owner review of preview https://cridevispa-app-git-phase3-gede-bagus-projects.vercel.app and migration 004
Task 3: complete (reviews RLS 3 passed after owner ran migration 004)
Task 12: redirect flag done (commit a3a5360, proxy tests 9 passed); merge + domain move pending final review
Final: fixed article/page 500 on DB outage — (site)/error.tsx + not-found.tsx, phase3-fixes #1 RED→GREEN, suite 157/157
Final: fixed root files lost at cutover — copied 7 files to app/public, #2 RED→GREEN
Final: fixed html lang on English pages — lang on header/main/footer, #3 RED→GREEN
Final: fixed review edit missing + silent publish failure — edit form per row, #4 RED→GREEN
Final: Ruling: English pages now self-canonical (?lang=en) instead of the spec's canonical-to-Indonesian — Google ignores hreflang on non-canonical URLs, so English pages would never be indexed — cost: none expected; deviates from plan text.
Final: fixed language switch dropping ?items/?kategori, #6 GREEN
Final: Ruling: re-graded reviewer's "declined" iOS popup risk to Important and fixed — /booking now navigates same-tab to WhatsApp — cost: visitor leaves the site tab (WhatsApp opens anyway).
Final: minor (deferred): empty category chip when a category has no priced treatments
Final: minor (deferred): Reveal content invisible without JS (no <noscript> override)
Final: minor (deferred): no server-side max length on review texts
Final: minor (deferred): admin panel pages rely on layout requireAdmin (+RLS), not per-page
Final: minor (deferred): long free-text duration label could overflow at 375px
Final: minor (deferred): /artikel lacks sitemap alternates, x-default and OG
Final: minor (deferred): treatment icons not rendered
Final: minor (deferred): stale comment in ArticleChrome.tsx
Task 12: merged phase3 → main (082d748, 38e1067). App production: /, /treatments, /lokasi, /booking, /?lang=en, /artikel, /admin/login 200; /index.html 301; 404 page branded. Search Console file route works locally (200) but vercel.app still 404 at last check — recheck after cutover.
Task 12: waiting for owner to move domains in Vercel + set REDIRECT_APP_HOST_TO_WWW=1
Task 12: complete (www live on app: all pages 200, legacy .html 301, Search Console file 200 via rewrite, vercel.app→www 308, booking from www 201 + deleted)
Final: Ruling: Search Console file served via rewrite to /google-verification — Vercel does not route '.html' paths to app routes — cost: none.
