# The Claude-database mode

This is the second of two ways the platform (`/app`, `/admin`, `/login`, `/signup`,
`/browse`) can be switched on. The first, and the one to actually launch on, is
Supabase — see [`supabase/README.md`](supabase/README.md). This mode exists for one
reason: to let you try the whole product with nothing to set up, while accepting real
limits that make it unsuitable for anything beyond that.

## What it actually is

When Supabase isn't configured, the site checks whether it's running live inside a
Claude conversation with the database capability granted (`await claude.use('db')`).
If so, it uses Claude's own database instead of a backend you'd host yourself. See
`src/lib/platform.ts` for how that check works and `src/lib/claudeDb.ts` for every
operation it implements.

**This can never affect a real deployment.** `window.claude` only exists when a page
is actually being served by Claude. A copy of this site on Netlify, Vercel, your own
server, anywhere that isn't Claude's own hosting, never sees it, so this mode simply
doesn't exist there. Nothing needs to be turned off before you deploy for real.

## The two limits, honestly

**It cannot be shared.** Claude's database capability makes a page organization-internal
— it cannot be shared publicly. Practically, for a personal account, that means it is
usable by you, alone, in your own browser. Never something you hand to a prospective
Welsh business to try.

**There is no real login.** The `user` capability, which would let a page know who is
genuinely viewing it, isn't available to this account. So "signing in" here means
picking which business profile you're acting as from a plain list — see
`src/pages/auth/Login.tsx`. It's a convenience for trying both sides of the product
yourself, not a security boundary. Anyone with access to the page can read or write
any business's listings, requirements or messages, whichever one they last chose to
act as. The admin panel matches this honestly too: there's no real permission check,
just a checkbox in Settings that a business ticks for itself.

**Approval status is filtered, not enforced.** New businesses still start `pending`
and see the same holding screen as Supabase mode, and `claudeFetchActiveListings` /
`claudeFetchActiveRequirements` / `claudeRefreshMatches` only surface data from
approved businesses (see `claudeDb.ts`). But there's no row-level security here to
back it up — it's ordinary client-side filtering, so it demonstrates the workflow
rather than actually securing it. Toggle "treat this business as admin" for a
different business in Settings, then approve or reject the pending one from
Admin → Businesses, to see the whole flow end to end.

## What it's for

Trying the actual thing — sign up as a seller, list a material, sign up as a buyer,
post what they need, see the match, message about it, moderate it as admin — without
creating an account anywhere first. Good for seeing the product work. Not a staging
environment, not a beta, not something to point real businesses at.

## What it covers

Everything Supabase mode does except photo uploads on listings (there's nowhere for
files to go in this mode, so the picker is hidden with a note saying why) and matching
runs client-side in the browser (`claudeRefreshMatches()` in `claudeDb.ts`) rather than
as a database function, since there's no server-side function capability here. Same
category-plus-location logic either way.

## If Claude's contract changes

This was built and tested against runtime contract 0.2.48. `src/lib/claudeDbTypes.ts`
is copied from that contract's type definitions rather than written from memory. If a
future version changes the `db` capability's shape, that file and `src/lib/claudeDb.ts`
are the two places to update.
