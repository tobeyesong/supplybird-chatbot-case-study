create extension if not exists "pgcrypto";

create or replace function public.is_modhaus_owner()
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'user_metadata' ->> 'modhaus_owner_token', '') <> ''
    or lower(coalesce(auth.jwt() ->> 'email', '')) in ('toanlam01@gmail.com', 'modhausllc@gmail.com')
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  category text not null check (category in ('flooring', 'decking', 'roofing', 'other')),
  subcategory text,
  price numeric(10, 2) not null default 0,
  price_unit text not null default 'sq_ft',
  coverage_per_box numeric(10, 2),
  coverage_unit text,
  images text[] not null default '{}',
  in_stock boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);

alter table public.products enable row level security;

drop policy if exists "Products are public readable" on public.products;
create policy "Products are public readable"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated owner can insert products" on public.products;
create policy "Authenticated owner can insert products"
on public.products for insert
to authenticated
with check (public.is_modhaus_owner());

drop policy if exists "Authenticated owner can update products" on public.products;
create policy "Authenticated owner can update products"
on public.products for update
to authenticated
using (public.is_modhaus_owner())
with check (public.is_modhaus_owner());

drop policy if exists "Authenticated owner can delete products" on public.products;
create policy "Authenticated owner can delete products"
on public.products for delete
to authenticated
using (public.is_modhaus_owner());

create table if not exists public.category_settings (
  category text primary key check (category in ('flooring', 'decking', 'roofing', 'other')),
  default_price numeric(10, 2) not null default 0,
  price_unit text not null default 'sq_ft',
  updated_at timestamptz not null default now()
);

alter table public.category_settings enable row level security;

drop policy if exists "Category settings are public readable" on public.category_settings;
create policy "Category settings are public readable"
on public.category_settings for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated owner can insert category settings" on public.category_settings;
create policy "Authenticated owner can insert category settings"
on public.category_settings for insert
to authenticated
with check (public.is_modhaus_owner());

drop policy if exists "Authenticated owner can update category settings" on public.category_settings;
create policy "Authenticated owner can update category settings"
on public.category_settings for update
to authenticated
using (public.is_modhaus_owner())
with check (public.is_modhaus_owner());

insert into public.category_settings (category, default_price, price_unit)
values
  ('flooring', 0.99, 'sq_ft'),
  ('decking', 1.40, 'ln_ft'),
  ('roofing', 22.99, 'bundle'),
  ('other', 36.00, 'roll')
on conflict (category) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Product images are public readable" on storage.objects;
create policy "Product images are public readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Authenticated owner can upload product images" on storage.objects;
create policy "Authenticated owner can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_modhaus_owner());

drop policy if exists "Authenticated owner can update product images" on storage.objects;
create policy "Authenticated owner can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_modhaus_owner())
with check (bucket_id = 'product-images' and public.is_modhaus_owner());

drop policy if exists "Authenticated owner can delete product images" on storage.objects;
create policy "Authenticated owner can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_modhaus_owner());
