# Connecting ConnectCymru to Supabase

This turns on real accounts, listings, requirements, matching, messaging and
the admin panel. Ten minutes, no card required.

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and create a free account if
   you don't have one.
2. **New project.** Give it a name (e.g. `connectcymru`), set a database
   password (save it somewhere; you won't need it day to day), and pick a
   region close to Wales (`eu-west-2` / London, if offered, otherwise
   `eu-west-1`).
3. Wait for it to finish provisioning (about two minutes).

## 2. Run the schema

1. In your project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/migrations/0001_init.sql` from this repository, copy the
   whole file, and paste it into the editor.
4. Click **Run**.
5. Repeat steps 2–4 with `supabase/migrations/0002_business_verification.sql`.
   Run it after `0001_init.sql`, in the same way, in the same project.

Between them, these two files create every table, the row-level security
rules that keep one business from reading another's private data, the
registration/approval workflow described below, and a storage bucket for
listing photographs. Both are safe to run again if you ever need to.

## 3. Get your two keys

1. Open **Project Settings → API**.
2. Copy the **Project URL** (looks like `https://abcdefgh.supabase.co`).
3. Copy the **anon / public** key (a long string starting `eyJ...`). This
   key is meant to be public — it's protected by the row-level security
   rules from step 2, not by being secret.

## 4. Add them to the site

Create a file called `.env` in the project root (it's already listed in
`.gitignore`, so it never gets committed):

```bash
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Then rebuild:

```bash
npm run build
```

If you're deploying to Netlify, Vercel, or similar, add the same two
variables in that host's environment variable settings instead of (or as
well as) a local `.env` file, then redeploy.

That's it. The header will show Browse, Log in and Sign up, and every
`/app` and `/admin` page will work for real instead of showing "the platform
isn't switched on for this build."

## 5. Make yourself an admin

Nobody can grant themselves admin from the app — that's deliberate. Sign up
for an account on the live site first, then in the Supabase **SQL Editor**
run:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@yourcompany.co.uk';
```

Sign out and back in (or just refresh), and an **Admin** link appears in the
header. An admin account also bypasses the pending-verification screen on
its own account, so you don't need to approve yourself to use the platform.

## 6. Optional: turn off email confirmation while testing

By default Supabase requires a business to click a confirmation link before
they can sign in. That's the right behaviour once real people are signing
up, but it can slow down testing.

To switch it off temporarily: **Authentication → Providers → Email** →
turn off "Confirm email". Turn it back on before you launch for real.

---

## What you get

- **Sign up / sign in** — one account type. Every business can both list
  surplus material and look for what it needs.
- **Listings** (`/app/listings`) — create, edit, archive, delete, upload
  photographs.
- **Requirements** (`/app/requirements`) — post what you're looking for.
- **Matches** (`/app/matches`) — computed whenever a listing or requirement
  is created or changed, based on shared category and a location match. See
  `refresh_matches()` in the migration file if you want to change how that
  scoring works.
- **Messages** (`/app/messages`) — direct messaging once two businesses want
  to talk about a listing or requirement, with live updates.
- **Browse** (`/browse`) — any signed-in business can see everyone's active
  listings.
- **Admin** (`/admin`) — overview numbers including pending approvals, the
  ability to remove a listing, approve or reject a registered business, a
  read-only view of every requirement, and the founding network / contact
  form submissions in one place.

## Business verification (registration approval)

Every new sign-up starts with `status = 'pending'`. A pending business can
sign in and see its own dashboard, but sees a holding screen instead of
listings, requirements, matches or messages — and the database itself
refuses to let it create a listing, post a requirement, or show up in
anyone else's browse/matches, whatever the client sends (see
`0002_business_verification.sql`, particularly the row-level security
policies and the `profiles_protect_admin_fields` trigger).

To approve or reject:

1. Sign in as an admin (see step 5 above) and go to **Admin → Businesses**.
2. Pending businesses sort to the top. Click **Review** to see everything
   they submitted at registration (legal name, company type, Companies
   House number, VAT number, registered address, website), or **Quick
   approve** to approve straight from the list.
3. Rejecting asks for a reason, which the business sees on their own
   pending screen and in Settings, so they know what to fix.

Only an admin can change a business's status — the trigger blocks anyone
else, including the business itself, from writing to `status`,
`reviewed_at`, `reviewed_by` or `rejection_reason`, regardless of what the
API is asked to write.

## What's deliberately not automated

Row-level security enforces who can read and write what, but it does not
decide whether a match is a good idea. `refresh_matches()` only checks
category and location; it does not know anything about material grade,
condition, quantity fit, or regulatory requirements. That judgement stays
with the two businesses, exactly as the rest of the site says it should.

## Keeping `database.types.ts` in sync

`src/lib/database.types.ts` is hand-written to match the migration. If you
add a column or table, update both files together. If you'd rather generate
it automatically, install the Supabase CLI and run:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts
```

(Then re-check `src/lib/api/*.ts` still compiles — the hand-written types
here are simpler than a generated file and some casts may need adjusting.)
