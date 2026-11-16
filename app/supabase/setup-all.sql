-- CrideviSPA: run ONCE in Supabase SQL Editor (Database > SQL Editor > New query > paste > Run)
-- CrideviSPA schema (phase 2)
create type booking_status as enum ('new', 'confirmed', 'done', 'cancelled');

create table categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_id text not null,
  name_en text not null,
  sort_order int not null default 0
);

create table treatments (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  desc_id text not null default '',
  desc_en text not null default '',
  icon text,
  badge_id text,
  badge_en text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

create table treatment_prices (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references treatments(id) on delete cascade,
  duration_minutes int check (duration_minutes is null or duration_minutes > 0),
  duration_label_id text,
  duration_label_en text,
  price_idr int not null check (price_idr > 0),
  sort_order int not null default 0,
  check (duration_minutes is not null or duration_label_id is not null)
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_id text not null,
  title_en text not null default '',
  excerpt_id text not null default '',
  excerpt_en text not null default '',
  body_id text not null default '',
  body_en text not null default '',
  category text,
  cover_image_url text,
  author text not null default 'CrideviSPA Team',
  published boolean not null default false,
  published_at timestamptz,
  meta_description_id text,
  meta_description_en text,
  updated_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status booking_status not null default 'new',
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (phone ~ '^62[0-9]{8,13}$'),
  email text check (email is null or char_length(email) <= 200),
  address_note text check (address_note is null or char_length(address_note) <= 1000),
  booking_date date not null,
  booking_time time not null,
  lang text not null default 'id' check (lang in ('id', 'en')),
  items jsonb not null,
  total_idr int not null check (total_idr >= 0),
  admin_note text
);
create index bookings_created_at_idx on bookings (created_at desc);

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger treatments_touch before update on treatments for each row execute function touch_updated_at();
create trigger articles_touch before update on articles for each row execute function touch_updated_at();

-- Row Level Security: public reads only active/published content; everything else is admin-only.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;
revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

alter table categories enable row level security;
alter table treatments enable row level security;
alter table treatment_prices enable row level security;
alter table articles enable row level security;
alter table bookings enable row level security;
alter table admins enable row level security;

create policy categories_public_read on categories for select using (true);
create policy categories_admin_all on categories for all using (is_admin()) with check (is_admin());

create policy treatments_public_read on treatments for select using (is_active or is_admin());
create policy treatments_admin_all on treatments for all using (is_admin()) with check (is_admin());

create policy prices_public_read on treatment_prices for select
  using (exists (select 1 from treatments t where t.id = treatment_id and (t.is_active or is_admin())));
create policy prices_admin_all on treatment_prices for all using (is_admin()) with check (is_admin());

create policy articles_public_read on articles for select using (published or is_admin());
create policy articles_admin_all on articles for all using (is_admin()) with check (is_admin());

-- bookings: no anon policy at all; inserts come from the server route with the service-role key.
create policy bookings_admin_all on bookings for all using (is_admin()) with check (is_admin());

create policy admins_self_read on admins for select using (user_id = auth.uid());

-- Storage bucket for article cover images: public read, admin write.
insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true)
  on conflict (id) do nothing;
create policy article_images_admin_write on storage.objects for insert
  with check (bucket_id = 'article-images' and is_admin());
create policy article_images_admin_update on storage.objects for update
  using (bucket_id = 'article-images' and is_admin());
create policy article_images_admin_delete on storage.objects for delete
  using (bucket_id = 'article-images' and is_admin());
