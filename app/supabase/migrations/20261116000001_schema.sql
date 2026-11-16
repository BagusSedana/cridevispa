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
