-- ============================================================================
-- ConnectCymru platform schema
-- ============================================================================
-- Run this once against a fresh Supabase project (SQL Editor -> New query ->
-- paste the whole file -> Run). It is safe to re-run: every statement either
-- creates something that doesn't yet exist or replaces a function/policy.
--
-- What this sets up:
--   - profiles          one row per signed-up business, keyed to auth.users
--   - user_roles        grants (currently just 'admin'), kept off `profiles`
--                        so a user can never grant themselves admin
--   - material_categories  the same six categories plus "other" shown on the
--                        public Materials page, used to categorise listings
--   - listings           surplus material a business has available
--   - requirements        material a business is looking for
--   - matches             suggested pairings between a listing and a
--                        requirement, computed by refresh_matches() below
--   - conversations / messages   direct messaging once two businesses want
--                        to talk about a listing or requirement
--   - enquiries           founding network + contact form submissions
--
-- Storage: also creates a `listing-photos` bucket for listing images.
--
-- Every table has row level security switched on. A user can always see and
-- manage their own rows; published listings and requirements are visible to
-- any signed-in business so matching and browsing work; admins can see and
-- moderate everything via the is_admin() check.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  location text,
  industry text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per business account. Extends auth.users with the details ConnectCymru needs.';

-- ----------------------------------------------------------------------------
-- user_roles
-- ----------------------------------------------------------------------------
-- Kept separate from `profiles` on purpose: `profiles` is editable by its
-- owner via the API, and a role column on that table would let a user grant
-- themselves admin. Roles are only ever written by an admin or by hand in the
-- SQL editor.
create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is 'Role grants. Only ''admin'' exists today. Never editable by the user it applies to.';

-- A small helper so policies below read cleanly. security definer lets it see
-- user_roles even from inside a policy on another table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- material_categories
-- ----------------------------------------------------------------------------
create table if not exists public.material_categories (
  id text primary key,
  name text not null,
  sort_order int not null default 0
);

insert into public.material_categories (id, name, sort_order) values
  ('timber', 'Timber', 1),
  ('metals', 'Metals', 2),
  ('plastics', 'Plastics', 3),
  ('textiles', 'Textiles', 4),
  ('packaging', 'Packaging', 5),
  ('manufacturing-surplus', 'Manufacturing surplus', 6),
  ('other', 'Other', 7)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- listings  (surplus material a business has available)
-- ----------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null references public.material_categories (id),
  title text not null,
  description text not null,
  quantity text,
  condition text,
  location text,
  frequency text check (frequency in ('one-off', 'occasional', 'regular')),
  photo_paths text[] not null default '{}',
  status text not null default 'active' check (status in ('draft', 'active', 'archived', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_seller_idx on public.listings (seller_id);
create index if not exists listings_category_idx on public.listings (category_id);
create index if not exists listings_status_idx on public.listings (status);

comment on table public.listings is 'Surplus materials a business has listed as available.';
comment on column public.listings.status is 'draft: not yet visible. active: visible and searchable. archived: withdrawn by the seller. removed: taken down by an admin.';

-- ----------------------------------------------------------------------------
-- requirements  (material a business is looking for)
-- ----------------------------------------------------------------------------
create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null references public.material_categories (id),
  title text not null,
  description text not null,
  quantity_needed text,
  location_preference text,
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requirements_buyer_idx on public.requirements (buyer_id);
create index if not exists requirements_category_idx on public.requirements (category_id);
create index if not exists requirements_status_idx on public.requirements (status);

comment on table public.requirements is 'Materials a business is looking for.';

-- ----------------------------------------------------------------------------
-- matches  (suggested pairings, recomputed by refresh_matches())
-- ----------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requirement_id uuid not null references public.requirements (id) on delete cascade,
  score int not null default 0,
  reason text not null default '',
  created_at timestamptz not null default now(),
  unique (listing_id, requirement_id)
);

create index if not exists matches_listing_idx on public.matches (listing_id);
create index if not exists matches_requirement_idx on public.matches (requirement_id);

comment on table public.matches is 'Potential matches between a listing and a requirement. Suggestions, not approvals: see refresh_matches().';

-- Recomputes every match. Simple and readable rather than incremental, which
-- is the right trade-off at the size this platform will run at for a long
-- time: a category match plus a location match scores higher, matching only
-- on category scores lower, and nothing else is suggested. Call this from
-- the app after a listing or requirement is created, edited or reactivated.
create or replace function public.refresh_matches()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.matches m
  where not exists (
    select 1 from public.listings l
    join public.requirements r on r.category_id = l.category_id
    where l.id = m.listing_id
      and r.id = m.requirement_id
      and l.status = 'active'
      and r.status = 'active'
  );

  insert into public.matches (listing_id, requirement_id, score, reason)
  select
    l.id,
    r.id,
    case
      when l.location is not null and r.location_preference is not null
        and l.location ilike '%' || r.location_preference || '%' then 80
      else 55
    end as score,
    case
      when l.location is not null and r.location_preference is not null
        and l.location ilike '%' || r.location_preference || '%'
        then 'Same material category and a location match.'
      else 'Same material category.'
    end as reason
  from public.listings l
  join public.requirements r on r.category_id = l.category_id
  where l.status = 'active' and r.status = 'active'
  on conflict (listing_id, requirement_id) do update
    set score = excluded.score, reason = excluded.reason;
end;
$$;

-- ----------------------------------------------------------------------------
-- conversations / messages
-- ----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  requirement_id uuid references public.requirements (id) on delete set null,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create index if not exists conversations_buyer_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- enquiries  (founding network + contact form submissions)
-- ----------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  form_name text not null check (form_name in ('founding-network', 'contact')),
  name text not null,
  company text,
  email text not null,
  location text,
  industry text,
  interest text,
  message text,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

comment on table public.enquiries is 'Submissions from the founding network and contact forms. Write-only from the public site; readable by admins.';

-- ============================================================================
-- Row level security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.material_categories enable row level security;
alter table public.listings enable row level security;
alter table public.requirements enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.enquiries enable row level security;

-- profiles: a business manages its own profile; everyone signed in can read
-- basic details of any profile (needed to show "who posted this listing");
-- admins can do anything.
drop policy if exists "profiles: read" on public.profiles;
create policy "profiles: read" on public.profiles
  for select using (auth.role() = 'authenticated' or public.is_admin());

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- user_roles: nobody but an admin may read or write role grants. This is
-- deliberately restrictive; grant the first admin from the SQL editor
-- (see supabase/README.md), never from the app.
drop policy if exists "user_roles: admin only" on public.user_roles;
create policy "user_roles: admin only" on public.user_roles
  for all using (public.is_admin()) with check (public.is_admin());

-- material_categories: public reference data, readable by anyone.
drop policy if exists "material_categories: read" on public.material_categories;
create policy "material_categories: read" on public.material_categories
  for select using (true);

-- listings: active listings are visible to any signed-in business; a seller
-- always sees and manages their own regardless of status; admins see all.
drop policy if exists "listings: read active or own or admin" on public.listings;
create policy "listings: read active or own or admin" on public.listings
  for select using (
    (status = 'active' and auth.role() = 'authenticated')
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "listings: insert own" on public.listings;
create policy "listings: insert own" on public.listings
  for insert with check (seller_id = auth.uid());

drop policy if exists "listings: update own or admin" on public.listings;
create policy "listings: update own or admin" on public.listings
  for update using (seller_id = auth.uid() or public.is_admin());

drop policy if exists "listings: delete own or admin" on public.listings;
create policy "listings: delete own or admin" on public.listings
  for delete using (seller_id = auth.uid() or public.is_admin());

-- requirements: same shape as listings.
drop policy if exists "requirements: read active or own or admin" on public.requirements;
create policy "requirements: read active or own or admin" on public.requirements
  for select using (
    (status = 'active' and auth.role() = 'authenticated')
    or buyer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "requirements: insert own" on public.requirements;
create policy "requirements: insert own" on public.requirements
  for insert with check (buyer_id = auth.uid());

drop policy if exists "requirements: update own or admin" on public.requirements;
create policy "requirements: update own or admin" on public.requirements
  for update using (buyer_id = auth.uid() or public.is_admin());

drop policy if exists "requirements: delete own or admin" on public.requirements;
create policy "requirements: delete own or admin" on public.requirements
  for delete using (buyer_id = auth.uid() or public.is_admin());

-- matches: visible to whichever of the two sides owns the listing or the
-- requirement. Never written directly by the app; only refresh_matches()
-- (security definer) writes to this table.
drop policy if exists "matches: read own side or admin" on public.matches;
create policy "matches: read own side or admin" on public.matches
  for select using (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
    or exists (select 1 from public.requirements r where r.id = requirement_id and r.buyer_id = auth.uid())
  );

-- conversations: only the two participants, or an admin.
drop policy if exists "conversations: read participant or admin" on public.conversations;
create policy "conversations: read participant or admin" on public.conversations
  for select using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

drop policy if exists "conversations: insert participant" on public.conversations;
create policy "conversations: insert participant" on public.conversations
  for insert with check (buyer_id = auth.uid() or seller_id = auth.uid());

-- messages: only readable/writable by a participant in the parent
-- conversation, or an admin.
drop policy if exists "messages: read participant or admin" on public.messages;
create policy "messages: read participant or admin" on public.messages
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "messages: insert participant" on public.messages;
create policy "messages: insert participant" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- enquiries: anyone (including a logged-out visitor) may submit one; only
-- admins may read them back or mark them handled.
drop policy if exists "enquiries: insert anyone" on public.enquiries;
create policy "enquiries: insert anyone" on public.enquiries
  for insert with check (true);

drop policy if exists "enquiries: read admin only" on public.enquiries;
create policy "enquiries: read admin only" on public.enquiries
  for select using (public.is_admin());

drop policy if exists "enquiries: update admin only" on public.enquiries;
create policy "enquiries: update admin only" on public.enquiries
  for update using (public.is_admin());

-- ============================================================================
-- Storage: listing photos
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Photos are stored under `<seller_id>/<listing_id>/<filename>`, so the
-- folder name doubles as the ownership check.
drop policy if exists "listing-photos: public read" on storage.objects;
create policy "listing-photos: public read" on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists "listing-photos: owner write" on storage.objects;
create policy "listing-photos: owner write" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing-photos: owner delete" on storage.objects;
create policy "listing-photos: owner delete" on storage.objects
  for delete using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Keep updated_at current
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

drop trigger if exists requirements_set_updated_at on public.requirements;
create trigger requirements_set_updated_at before update on public.requirements
  for each row execute function public.set_updated_at();
