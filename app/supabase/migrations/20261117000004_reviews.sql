-- Real guest reviews, entered by the admin. Public sees published rows only.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  origin text check (origin is null or char_length(origin) <= 120),
  treatment text check (treatment is null or char_length(treatment) <= 120),
  rating int not null check (rating between 1 and 5),
  text_id text not null default '',
  text_en text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check (char_length(text_id) > 0 or char_length(text_en) > 0)
);
alter table reviews enable row level security;
create policy reviews_public_read on reviews for select using (published or is_admin());
create policy reviews_admin_all on reviews for all using (is_admin()) with check (is_admin());
