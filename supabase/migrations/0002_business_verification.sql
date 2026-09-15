-- ============================================================================
-- Business verification: registration detail, approval status, and the RLS
-- that actually enforces it.
-- ============================================================================
-- Run this after 0001_init.sql, the same way: SQL Editor -> New query ->
-- paste the whole file -> Run. Safe to re-run.
--
-- What this adds:
--   - Company legal/registration detail on `profiles`, collected at signup
--     so an admin has something concrete to check before approving.
--   - `status` on `profiles`: 'pending' (default), 'approved', 'rejected'.
--     A business can sign in while pending, but the app shows a holding
--     screen instead of the dashboard, and the database itself refuses to
--     let a pending business create a listing, post a requirement, or have
--     either show up for anyone else — see the RLS changes below. This
--     isn't just a UI gate: hitting the API directly gets the same refusal.
--   - Only an admin can change `status` — a trigger blocks anyone else,
--     including the business itself, regardless of what the API is asked
--     to write.
--   - refresh_matches() now only matches listings and requirements whose
--     owners are BOTH approved, so a match to a not-yet-approved business
--     is never suggested to anyone before that business is actually live.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: registration detail + status
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists legal_name text,
  add column if not exists company_type text
    check (company_type is null or company_type in ('limited_company', 'llp', 'sole_trader', 'partnership', 'other')),
  add column if not exists companies_house_number text,
  add column if not exists vat_number text,
  add column if not exists registered_address_line1 text,
  add column if not exists registered_address_line2 text,
  add column if not exists registered_city text,
  add column if not exists registered_postcode text,
  add column if not exists registered_country text default 'United Kingdom',
  add column if not exists job_title text,
  add column if not exists website text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users (id) on delete set null;

comment on column public.profiles.status is 'pending: awaiting admin review. approved: full access. rejected: refused, see rejection_reason. Only an admin may change this — see profiles_protect_admin_fields below.';
comment on column public.profiles.legal_name is 'The registered/legal company name, if different from company_name (the trading name shown elsewhere on the site).';

create index if not exists profiles_status_idx on public.profiles (status);

-- ----------------------------------------------------------------------------
-- Only an admin may change status (or who reviewed it, or when). A business
-- updating its own other details (via Settings) is unaffected — this only
-- blocks the specific fields an admin decides.
-- ----------------------------------------------------------------------------
create or replace function public.protect_admin_only_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.status is distinct from old.status then
      raise exception 'Only an admin can change account status.';
    end if;
    -- Silently keep these in step with status rather than erroring, since a
    -- normal profile update from Settings never touches them anyway.
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
    new.rejection_reason := old.rejection_reason;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields before update on public.profiles
  for each row execute function public.protect_admin_only_profile_fields();

-- A new profile must always start pending, whatever the client sends.
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (id = auth.uid() and status = 'pending');

-- ----------------------------------------------------------------------------
-- Listings and requirements: visible (and creatable) only once the owning
-- business is approved. A pending or rejected business can still sign in
-- and see its own rows in its own dashboard (useful: they can prepare a
-- listing while waiting), but nobody else can see them, and neither the
-- listing nor the requirement can be created in the first place — the
-- policies below check the owner's status, not the current status of what's
-- being read, so a business approved after listing something has nothing
-- more to do.
-- ----------------------------------------------------------------------------
drop policy if exists "listings: read active or own or admin" on public.listings;
create policy "listings: read active or own or admin" on public.listings
  for select using (
    (
      status = 'active'
      and auth.role() = 'authenticated'
      and exists (select 1 from public.profiles p where p.id = seller_id and p.status = 'approved')
    )
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "listings: insert own" on public.listings;
create policy "listings: insert own" on public.listings
  for insert with check (
    seller_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved')
  );

drop policy if exists "requirements: read active or own or admin" on public.requirements;
create policy "requirements: read active or own or admin" on public.requirements
  for select using (
    (
      status = 'active'
      and auth.role() = 'authenticated'
      and exists (select 1 from public.profiles p where p.id = buyer_id and p.status = 'approved')
    )
    or buyer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "requirements: insert own" on public.requirements;
create policy "requirements: insert own" on public.requirements
  for insert with check (
    buyer_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved')
  );

-- Starting a conversation, or sending into one, requires the sender to be
-- an approved business. A pending business has nothing to message about
-- yet (it cannot have a listing or requirement live), so this is mostly a
-- backstop, not something the UI will normally hit.
drop policy if exists "conversations: insert participant" on public.conversations;
create policy "conversations: insert participant" on public.conversations
  for insert with check (
    (buyer_id = auth.uid() or seller_id = auth.uid())
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved')
  );

drop policy if exists "messages: insert participant" on public.messages;
create policy "messages: insert participant" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved')
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- refresh_matches(): only match between two approved businesses. Without
-- this, a match could be computed and shown to an approved buyer against a
-- listing that isn't visible to them yet (because its seller is still
-- pending) — confusing, and a small information leak about who has signed
-- up before they're actually live.
-- ----------------------------------------------------------------------------
create or replace function public.refresh_matches()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.matches m
  where not exists (
    select 1
    from public.listings l
    join public.requirements r on r.category_id = l.category_id
    join public.profiles sp on sp.id = l.seller_id
    join public.profiles bp on bp.id = r.buyer_id
    where l.id = m.listing_id
      and r.id = m.requirement_id
      and l.status = 'active'
      and r.status = 'active'
      and sp.status = 'approved'
      and bp.status = 'approved'
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
  join public.profiles sp on sp.id = l.seller_id
  join public.profiles bp on bp.id = r.buyer_id
  where l.status = 'active'
    and r.status = 'active'
    and sp.status = 'approved'
    and bp.status = 'approved'
  on conflict (listing_id, requirement_id) do update
    set score = excluded.score, reason = excluded.reason;
end;
$$;
