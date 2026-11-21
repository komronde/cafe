-- ============================================================================
-- Aurum Café — Supabase schema, Row Level Security and Storage
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Users live in Supabase Auth (auth.users); `profiles` extends them 1:1.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- helper: is the current user an admin? ----------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text not null default '',
  address     text not null default '',
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- create a profile automatically on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'phone',''));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- catalogue --------------------------------------------------------
create table if not exists public.categories (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id           serial primary key,
  category_id  integer not null references public.categories(id) on delete restrict,
  name         text not null,
  description  text not null default '',
  price_uzs    integer not null check (price_uzs >= 0),
  image_url    text not null default '',
  available    boolean not null default true,
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- ---------- orders -----------------------------------------------------------
create table if not exists public.orders (
  id             serial primary key,
  user_id        uuid references auth.users(id) on delete set null,
  customer_name  text not null,
  phone          text not null,
  fulfillment    text not null default 'pickup' check (fulfillment in ('pickup','delivery')),
  address        text not null default '',
  notes          text not null default '',
  status         text not null default 'new' check (status in ('new','preparing','ready','completed','cancelled')),
  total_uzs      integer not null check (total_uzs >= 0),
  created_at     timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id               serial primary key,
  order_id         integer not null references public.orders(id) on delete cascade,
  product_id       integer references public.products(id) on delete set null,
  name             text not null,
  unit_price_uzs   integer not null,
  quantity         integer not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- reservations, settings, messages ---------------------------------
create table if not exists public.reservations (
  id             serial primary key,
  user_id        uuid references auth.users(id) on delete set null,
  customer_name  text not null,
  phone          text not null,
  date           date not null,
  time           text not null,
  guests         integer not null check (guests between 1 and 20),
  message        text not null default '',
  status         text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at     timestamptz not null default now()
);

create table if not exists public.cafe_settings (
  id          integer primary key default 1 check (id = 1),
  name        text not null,
  tagline     text not null default '',
  phone       text not null default '',
  whatsapp    text not null default '',
  telegram    text not null default '',
  instagram   text not null default '',
  email       text not null default '',
  address     text not null default '',
  map_query   text not null default '',
  hours       jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id          serial primary key,
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ---------- Row Level Security ----------------------------------------------
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.reservations      enable row level security;
alter table public.cafe_settings     enable row level security;
alter table public.contact_messages  enable row level security;

-- profiles: owners read/update their own row (but cannot change their role); admins manage all
create policy "profiles_select_own"  on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own"  on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles_admin_all"   on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- public catalogue: anyone can read; only admins write
create policy "categories_read"      on public.categories    for select using (true);
create policy "categories_admin"     on public.categories    for all using (public.is_admin()) with check (public.is_admin());
create policy "products_read"        on public.products      for select using (true);
create policy "products_admin"       on public.products      for all using (public.is_admin()) with check (public.is_admin());
create policy "settings_read"        on public.cafe_settings for select using (true);
create policy "settings_admin"       on public.cafe_settings for all using (public.is_admin()) with check (public.is_admin());

-- orders: guests and members may create; members read their own; admins manage everything
create policy "orders_insert"        on public.orders for insert with check (user_id is null or user_id = auth.uid());
create policy "orders_select_own"    on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_update"  on public.orders for update using (public.is_admin());
create policy "orders_admin_delete"  on public.orders for delete using (public.is_admin());

create policy "order_items_insert"   on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id is null or o.user_id = auth.uid())));
create policy "order_items_select"   on public.order_items for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_admin"    on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- reservations
create policy "reservations_insert"  on public.reservations for insert with check (user_id is null or user_id = auth.uid());
create policy "reservations_select"  on public.reservations for select using (user_id = auth.uid() or public.is_admin());
create policy "reservations_admin"   on public.reservations for all using (public.is_admin()) with check (public.is_admin());

-- contact messages: anyone can send, only admins read
create policy "messages_insert"      on public.contact_messages for insert with check (true);
create policy "messages_admin"       on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: product images -----------------------------------------
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_read"   on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_admin"  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- To promote the first administrator:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
