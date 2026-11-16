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
