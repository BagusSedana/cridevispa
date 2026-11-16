# Phase 2 — Supabase backend + new admin (Next.js)

Date: 2026-11-16 · Status: approved by owner 2026-11-16

## Intent

CrideviSPA (home service massage, Denpasar) runs a static HTML/JS site on Vercel. Its admin dashboard saves everything (treatments, prices, articles, bookings) in the browser's localStorage, so:

- price/treatment/article edits made in admin are only visible in the admin's own browser; visitors always see the hard-coded defaults in `js/data.js`;
- bookings are saved in the *customer's* browser and never reach the owner (the owner only sees the WhatsApp message);
- admin "login" is a client-side PIN, default `1234`.

The owner wants a real backend so admin edits reach visitors, bookings are recorded, and articles can be published to boost SEO. This is phase 2 of a 4-phase rebuild (1 quick fixes — done; 2 backend + admin; 3 public-site redesign; 4 polish/SEO/security review), done one phase at a time.

## Goals

1. Supabase holds treatments, prices, packages, articles and bookings.
2. A new admin (login with Supabase Auth) to manage all of the above.
3. Bookings: customer fills the form → booking is saved in Supabase → customer continues to WhatsApp with the prefilled message (same as today). Admin sees every booking and can set a status.
4. Articles: each published article is its own server-rendered page (`/artikel/<slug>`), bilingual (ID/EN), with proper meta tags, so Google indexes it. Article edits appear on the live site without a manual redeploy.
5. Built in Next.js so phase 3 (redesign) builds on the same foundation.

## Non-goals (this phase)

- Visual redesign, new animations, new layout — that is phase 3.
- On-site slot/calendar booking or therapist scheduling (owner chose WhatsApp booking).
- Online payments, customer accounts, email/SMS notifications.
- Multiple admin users or roles.

## Anti-goals (failure even if it "works")

- The live site at www.cridevispa.com breaks or goes blank at any point during phase 2, or a customer is blocked from reaching WhatsApp because the booking API failed.
- Anyone other than the owner can read bookings (customer names/phones/addresses) or edit content.
- Secrets (Supabase service-role key) end up in the browser or in git.
- SEO regressions: existing URLs (`/`, `/artikel/`, `/artikel/manfaat-pijat-bali.html`) stop working.

## Constraints

- Hosting stays on Vercel; repo stays github.com/BagusSedana/cridevispa, pushed directly to `main` (owner's standing instruction). `main` auto-deploys.
- Supabase project already exists (owner's account) but is in **Sydney**. Singapore is much closer to Bali; since the project is still empty, recreating it in Singapore costs nothing now (pending owner decision).
- Bilingual ID/EN must be preserved (current site has full i18n).
- Contact data stays as today: WhatsApp `6285812429650`, email `info@cridevispa.com`, hours 07:00–23:00, last booking 22:00.
- Node.js is not installed on the owner's PC yet; it must be installed (winget) for local dev.

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | Next.js (App Router) on Vercel + Supabase | One project for public pages, SEO article pages, admin and booking API; native to Vercel. Biggest change: the site is rebuilt in Next.js. |
| B | Astro + Supabase | Lightest, fastest public site; admin (forms, auth, tables) and live article updates are more awkward. |
| C | Keep static HTML, call Supabase from the browser | Least change, but articles stay weak for SEO, admin stays fragile, and phase 3 would rebuild anyway (double work). |

Owner picked **A** on 2026-11-16.

## Decisions made with the owner

- Backend: Supabase.
- Framework: Next.js.
- Booking: via WhatsApp, but each booking is recorded in Supabase and visible in admin.
- Articles are an SEO priority.
- Phases run in order 1 → 4.

## Design

### Rollout (no downtime)

- The Next.js app lives in a new `app/` folder in the same repo. The current static site stays at the repo root and stays live, unchanged, through phases 2 and 3. *(Builder's call — avoids breaking the live site.)*
- Phase 2 deploys the Next.js app as a **second Vercel project** pointed at `app/` (e.g. `cridevispa-app.vercel.app`). *(Builder's call.)*
- **Owner decision (2026-11-16): bookings, articles and the new admin go live in phase 2**, not at phase 3. Done by proxying from the existing static project's `vercel.json` (same origin, so no CORS):
  - `www.cridevispa.com/artikel` and `/artikel/*` → app's article pages;
  - `www.cridevispa.com/admin*` → app's admin (the old static `admin/index.html` with PIN 1234 is removed);
  - `www.cridevispa.com/api/bookings` → app's booking API.
- The live static home page keeps its design and its built-in treatment list until phase 3; only its booking submit changes: it `POST`s to `/api/bookings` first, then opens WhatsApp exactly as today. If the API call fails, WhatsApp still opens (booking is never blocked). The live site's CSP `connect-src 'self'` already allows this.
- The app's own `*.vercel.app` domain sends `X-Robots-Tag: noindex`; every public page's canonical and hreflang point to `https://www.cridevispa.com`, so there is no duplicate content.
- `/artikel/manfaat-pijat-bali.html` → 301 to `/artikel/manfaat-pijat-bali` from phase 2.
- Full cutover of the rest of `www.cridevispa.com` to the Next.js app happens at the end of phase 3.
- Add `app/`, `docs/` to the root `.vercelignore` so the static deployment does not ship them.

### Data model (Supabase Postgres)

- `categories` — id, key (`massage`, `foot`, `facial`, `ear`, `body`, `packages`), name_id, name_en, sort_order.
- `treatments` — id, category_id, name, desc_id, desc_en, icon, badge_id, badge_en, is_active, sort_order, updated_at.
- `treatment_prices` — id, treatment_id, duration_minutes (nullable for packages), duration_label_id/en (for packages, e.g. "2,5 jam"), price_idr (integer rupiah), sort_order. Replaces today's `dur30/dur60/dur90/price` string fields.
- `articles` — id, slug (unique), title_id/en, excerpt_id/en, body_id/en (Markdown), category, cover_image_url, author, published (bool), published_at, meta_description_id/en, updated_at.
- `bookings` — id, created_at, status (`new` | `confirmed` | `done` | `cancelled`), name, phone, email (nullable), address_note, booking_date, booking_time, lang, items (jsonb snapshot: treatment name, duration, price_idr at time of booking), total_idr, admin_note.
- Seed script imports the current `DEFAULT_TREATMENTS_DATA` and `DEFAULT_ARTICLES_DATA` from `js/data.js` and the existing article page content, so day-one data equals today's site.

### Security

- Row Level Security on every table.
  - Public (anon): `select` on active treatments/prices/categories and published articles only. No access to `bookings`.
  - Admin: full access, granted to the single owner account (checked by user id / an `admins` table), not to "any logged-in user".
- Bookings are inserted only through a Next.js server route (`POST /api/bookings`) that validates input (zod), recomputes prices from the database (never trusts client prices), rate-limits per IP, and uses a honeypot field against bots. It writes with the service-role key, which exists only in Vercel server env vars.
- Supabase Auth: email + password for the owner; public sign-ups disabled in Supabase settings. Admin routes protected server-side (middleware), not just hidden in the UI.
- Article Markdown is rendered with sanitization (no raw HTML / scripts).
- Security headers from phase 1 carried over to the Next.js app (`next.config` headers), plus a real CSP.

### Admin (`/admin`)

- Login page (email/password).
- **Bookings**: list newest first, filter by status/date, view details, change status, add admin note, one-click "open WhatsApp" to the customer.
- **Treatments & prices**: add/edit/hide/reorder treatments per category; edit prices per duration; packages with free-text duration label.
- **Articles**: list, create/edit (Markdown editor with preview, ID + EN fields), cover image upload to Supabase Storage, publish/unpublish, slug and meta description fields.
- UI in Indonesian. Functional and clean, not the phase-3 visual design.

### Public pages delivered in phase 2

- `/artikel` (list) and `/artikel/[slug]` (article), server-rendered from Supabase with ISR / on-demand revalidation when admin saves, bilingual via `?lang=en` (matches current hreflang URLs), with title/description/OG tags, `Article` JSON-LD, and inclusion in a generated `sitemap.xml`.
- Old URL `/artikel/manfaat-pijat-bali.html` redirects (301) to `/artikel/manfaat-pijat-bali` after cutover.
- A minimal booking form + treatment list page on the app to exercise `/api/bookings` end-to-end. Its look is temporary (phase 3 replaces it).

### Environment & config

- Vercel env vars (app project): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public), `SUPABASE_SERVICE_ROLE_KEY` (server only).
- Local: `app/.env.local` (git-ignored). The owner pastes keys into it and into Vercel themselves; keys are never pasted in chat or committed.
- Database schema and RLS policies kept as SQL migration files in `app/supabase/migrations/` so they are reviewable and reproducible.

## Builder's calls (from review)

- **Article migration:** existing hand-written article HTML is converted to Markdown; approximate visual match is acceptable. Article bodies allow Markdown + images only (no raw HTML). `Article` JSON-LD, meta and OG tags are generated by the page template, so SEO markup is not lost.
- **Admin account:** the owner creates their own user in the Supabase dashboard (so the password never passes through chat or code). A migration creates the `admins` table; the owner runs one provided SQL line to add their user id. Access tests then run against that account.
- **Booking form:** same fields as today (name, phone, email optional, date, time, address/notes, selected treatments). Added validation only: no past dates, time between 07:00 and 22:00 (last booking), Indonesian phone format. The WhatsApp message keeps today's format.

## Left to the builder

Library choices within Next.js (UI kit, Markdown editor, form library), exact folder structure, rate-limit mechanism, test setup, migration tooling, how icons are mapped.

## Success criteria

- Owner can log in at the app's `/admin`; a wrong password or a non-owner account cannot reach any admin data (verified, including direct API/database calls with the anon key).
- Editing a price or article in admin shows on the app's public pages within a minute, without redeploying.
- Submitting the booking form creates a row in `bookings`, opens WhatsApp with the same message format as today, and appears in admin.
- Published articles render as full HTML on first load (visible with JavaScript disabled) with correct meta tags, and appear in `sitemap.xml`.
- www.cridevispa.com stays up throughout; a real booking made on it appears in the new admin; `/artikel/*` and `/admin` on www are served by the app.
