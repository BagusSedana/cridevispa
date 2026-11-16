# SDD ledger — plan: docs/superpowers/plans/2026-11-16-phase2-supabase-backend.md
Setup: Ruling: work directly on main, no worktree — owner's standing instruction "langsung push ke git aku" (2026-11-16) — cost if wrong: unfinished app/ code lands on main, but app/ is excluded from the live static deploy by .vercelignore.
Setup: Ruling: .superpowers/ added to .gitignore (workspace was not ignored).
Pre-flight: T3 produces parseRupiah in src/lib/price.ts; T4 adds formatRupiah to same file — consistent.
Pre-flight: T4 createServiceClient consumed by T5, T7-9 — consistent.
Pre-flight: T6 requireAdmin consumed by T7-9 — consistent.
Pre-flight: T11 GET /api/catalog consumed by T13 — consistent (added in plan self-review).
Pre-flight: T10 Markdown renderer reused by T9 preview — T9 precedes T10; Ruling: build components/Markdown.tsx in T9, T10 reuses it — cost: none.
Task 1: Ruling: Next.js 16.4 (latest) instead of 15, middleware.ts → src/proxy.ts (renamed in Next 16) — follows framework docs — cost: none.
Task 1: complete (commit b71a6f1, tests: npm test → 2 passed; npm run build → ok)
Task 3: Ruling: legacy article page has English body only — seed body_en from HTML, body_id empty; article page falls back to English body when body_id is empty — cost: ID readers see English text until owner writes ID version.
Task 3: partial — transform tests 7 passed; seed run pending Supabase keys
Task 6: Ruling: added forgot/reset password pages at owner's question (2026-11-16) — spec's login needs a recovery path — cost: small extra scope.
Task 2: Ruling: migrations applied via SQL Editor paste (supabase/setup-all.sql) instead of CLI db push — owner had not logged in to CLI — cost: migrations must be kept in sync by hand.
Task 2: Ruling: admin row inserted via REST with service key (UID d9693e6f…) instead of owner running grant-admin.sql.
Task 2: finding — RLS tests passed with an unregistered anon key (false pass); added positive control; currently FAILS until owner supplies a valid publishable key.
Task 3: complete (seed run twice: 6 categories, 11 treatments, 16 prices, 2 articles; transform tests 7 passed)
Task 2: complete (tests: npx vitest run tests/rls.test.ts → 6 passed incl. positive control, real publishable key)
Task 4: Ruling: formatRupiah was written in Task 3 alongside parseRupiah, so its Task 4 tests passed on first run (no RED) — same file, trivial — cost: none. Added pick() fallback helper and createPublicClient() (cookie-less) for cacheable public reads.
Task 4: complete (commit f280374, tests: npm test → 26 passed)
Task 5: Ruling: WhatsApp message shows the phone as typed (legacy behaviour); DB stores normalized 62… — keeps message identical — cost: none. Duplicate items allowed (priced per occurrence). Honeypot returns 201 with empty WA text.
Task 5: complete (commit 782c862, tests: npm test → Tests  51 passed)
Task 6: Ruling: non-admin users are redirected to /admin/login?error=forbidden instead of a 403 page — forbidden() is experimental in Next 16 — cost: none. Reset links go through /admin/auth/confirm (code exchange) then /admin/reset-password. Real-login check pending owner trying it.
Task 6: complete (commit d4cb19e, tests: npm test → 59 passed; build ok; /admin → 307 /admin/login verified locally)
Task 7: complete (commit effd676, tests: vitest admin/(panel) → 4 passed; tsc clean)
Task 8: Ruling: reorderTreatments(categoryId, ids[]) replaced by moveTreatment(id, ±1) up/down buttons — simpler UI without drag-drop JS — cost: reordering long lists takes more clicks.
Task 8: complete (commit 9f62ff2, tests: npm test → 72 passed; tsc clean)
Task 9: Ruling: uploadCover is a helper inside saveArticle (one form submit) rather than a separate action; serverActions.bodySizeLimit raised to 3mb for 2 MB covers — cost: none. Markdown.tsx built here (pre-flight ruling) and reused by Task 10.
Task 9: complete (commit 692b9cb, tests: npm test → 88 passed; tsc clean)
Task 10: Ruling: article pages render per request (dynamic, because ?lang= is a search param) instead of ISR — still full HTML for Google; admin saves are instant — cost: one Supabase read per view (fine at this traffic).
Task 10: Ruling: www sitemap.xml/robots.txt are still the static files; Task 13 must proxy /sitemap.xml to the app (and point static robots.txt at it) or Google never sees new articles — cost if missed: new articles not in sitemap.
Task 10: complete (commit 3fbb40a, tests: npm test → pass incl. tests/seo.test.ts 3; curl: body text in HTML, canonical+hreflang+JSON-LD present, .html→301, draft/unknown→404)
Task 11: complete (commit e1e017d, tests: catalog route 1 passed; browser E2E: booking row created (total 250000, phone normalized) + WhatsApp URL opened; test row deleted)
Task 12: Ruling: root .vercelignore applied to the app project too (build failed NEXT_NO_VERSION); removed app/ from it and block /app/* with a 404 route in static vercel.json instead — cost if wrong: app source readable on www until checked.
Task 12: complete (cridevispa-app.vercel.app: /artikel 200, article HTML has body, /admin→307 login, .html→301, X-Robots-Tag noindex, CSP on, /api/catalog 16 rows, POST /api/bookings 201 + row deleted)
Task 13: Ruling: home booking records via fire-and-forget POST (keepalive) and opens WhatsApp immediately with the legacy client text, instead of awaiting the API with a 3 s timeout — avoids popup blockers and guarantees WA is never blocked — cost: bookings the API rejects (e.g. past date, unmatched item) reach WhatsApp but not the admin.
Task 13: Ruling: /artikel/x.html on www returns 308 (static project's cleanUrls) instead of the spec's 301 — both are permanent; Google treats them the same — cost: none expected.
Task 13: Ruling: removed host-based noindex (www proxies to the app's vercel.app host, so it hit www articles); admin stays noindex; vercel.app duplicates rely on canonical → www — cost: vercel.app URLs could be indexed if Google ignores canonical.
Task 13: Ruling: static sitemap.xml deleted; /sitemap.xml proxied to the app (lists home, /artikel, published articles). Static robots.txt already points to it.
Task 13: complete (commits 979449b, 112ecf0; live checks: /artikel, article, ?lang=en, /admin/login, /api/catalog, /sitemap.xml 200; old admin files 404/308; article no X-Robots-Tag; admin noindex; _next assets 200; www home booking → Supabase row + WhatsApp opened in 16 ms; test row deleted)
Final: fixed reset-password redirect to vercel.app — confirm/route.test.ts RED→GREEN, suite 100/100; live: bad code → www/admin/lupa-password
Final: fixed /app source readable via %2F — route /(?:app|docs)(?:$|[/%].*) → 404, verified live on 5 encoded paths; /apple-touch-icon.png still 200
Final: fixed international phones rejected — schema.test.ts +61/00/0062 cases RED→GREEN, suite 100/100; DB needs migration 003 (owner runs in SQL Editor)
Final: fixed catalog fetched only at submit — preloaded on page load, verified /api/catalog request on load in browser
Final: Ruling: app/ still ships inside the static deployment (blocked by route, not excluded) — proper exclusion needs a separate static root dir; goes away at phase 3 cutover — cost if wrong: a new bypass encoding exposes source (no secrets).
Final: Ruling: home-page booking matched by treatment name; admin renames/price edits don't reach the static home until phase 3 — owner told — cost: renamed treatments stop being recorded from the home page.
Final: Ruling: /booking page still shows the error (no WhatsApp) on 400 validation errors — 400 means fixable input, not API failure — cost: none expected.
Final: minor (deferred): impossible dates like 2026-02-31 → 500 instead of 400
Final: minor (deferred): rate limit in-memory per instance, keyed on first x-forwarded-for hop
Final: minor (deferred): some admin actions ignore DB errors; moveTreatment non-atomic
Final: minor (deferred): CSP script-src 'unsafe-inline'
Final: minor (deferred): stale comment in proxy.ts (only panel layout calls requireAdmin)
Final: minor (deferred): RLS tests lack anon update/delete, storage write, admins read, inactive-treatment prices
Final: minor (deferred): replaced cover images not deleted from storage
