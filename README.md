# ConnectCymru

ConnectCymru is a Welsh B2B network connecting businesses that have surplus materials with
businesses that can use them.

**Connecting Welsh industry.**

This repository is two things in one:

1. A marketing site (`/`, `/how-it-works`, `/for-businesses`, `/materials`, `/about`,
   `/founding-network`, `/contact`) that positions ConnectCymru as launching soon.
2. The platform itself: accounts, listings, requirements, matching, messaging and an admin
   panel, behind `/login`, `/signup`, `/browse`, `/app` and `/admin`.

The platform runs on Supabase and **does nothing until you connect one** — see
[`supabase/README.md`](supabase/README.md) for the ten-minute setup. Until then, those
routes show a plain "not connected yet" message rather than crashing, and the marketing
site works exactly as before.

There is a second, much more limited way those routes can switch on: running live
inside a Claude conversation with the database capability granted, using Claude's own
database instead of Supabase. It exists purely so the product can be tried with nothing
to set up — it cannot be shared with anyone, and has no real login. See
[`claude-db-README.md`](claude-db-README.md) for exactly what that means. It has zero
effect on a real deployment: `window.claude` doesn't exist outside Claude's own hosting.

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Supabase (Postgres, auth, storage) for the platform — see `supabase/README.md`
- Hand-written CSS with design tokens (no UI framework)
- Inter, self-hosted via `@fontsource-variable/inter` (no third-party font requests)

## Commands

```bash
npm install
npm run dev         # development server
npm run build       # typecheck + production build to dist/
npm run preview     # serve the production build
npm run lint        # oxlint
npm run typecheck   # tsc, no emit
npm run gen:assets  # regenerate favicon.svg, apple-touch-icon.png and og.png
```

The site is a single-page app with real routes, so any host must rewrite unknown paths to
`index.html` (Netlify `_redirects`, Vercel rewrites, `try_files ... /index.html` on nginx).

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/how-it-works` | How It Works |
| `/for-businesses` | For Businesses |
| `/materials` | Materials |
| `/about` | About |
| `/founding-network` | Founding Network (interest form) |
| `/contact` | Contact (enquiry form) |
| `/login`, `/signup` | Sign in / create a business account |
| `/browse`, `/browse/:id` | Browse active listings (signed in) |
| `/app`, `/app/listings`, `/app/requirements`, `/app/matches`, `/app/messages`, `/app/settings` | Business dashboard (signed in) |
| `/admin`, `/admin/listings`, `/admin/requirements`, `/admin/businesses`, `/admin/enquiries` | Admin panel (admin role) |
| anything else | 404 |

## Structure

```
src/
  components/
    brand/     Logo and the geometric mark
    layout/    RootLayout, Header, Footer, LaunchBar, PageHero
    ui/        Button, SectionHeading, Reveal, Photo, Note
    cards/     MaterialCard, StageList
    sections/  CtaSection, SplitSection
    forms/     Fields, InterestForm, ContactForm, FormSuccess
    map/       WalesMap
    app/       AppShell, DashboardLayout, AdminLayout (the platform's own chrome)
  data/        All site content: materials, stages, benefits, nav, media, wales
  lib/
    api/       One file per domain: listings, requirements, matches, messages, admin, enquiries
    auth.tsx   AuthProvider + useAuth
    guards.tsx RequireSupabase, RequireAuth, RequireAdmin
    supabase.ts  the Supabase client
    seo, validation, submitEnquiry, useInView
  pages/
    auth/      Login, SignUp
    app/       The business dashboard
    admin/     The admin panel
    (root)     The marketing pages, one file per route
  styles/      tokens.css, base.css

supabase/
  migrations/0001_init.sql   the entire schema, RLS policies and storage bucket
  README.md                  setup steps: create a project, run the migration, connect it
```

Page copy and lists live in `src/data/`. Components take that data as props, so text can be
edited without touching layout code.

## Two things to wire up before launch

### 1. Photography

Every image on the site is referenced from **`src/data/media.ts`** and nowhere else. The
`src` values currently point at Unsplash as development placeholders. To swap in licensed
or commissioned photography:

1. Put the files in `public/images/`.
2. Change each entry's `src` to `/images/<filename>`.

Nothing else changes. Each entry also carries a `tone` pair used to paint a considered
two-colour panel behind the image, so a slow or missing file never leaves a hole in the
layout. Keep the `alt` text accurate when you swap a photograph.

### 2. The platform itself

Connect Supabase (see [`supabase/README.md`](supabase/README.md)) and the founding network
and contact forms automatically start writing to the real `enquiries` table instead of
simulating success — no code change needed, that switch lives in `src/lib/submitEnquiry.ts`.

Without Supabase configured, and without `VITE_ENQUIRY_ENDPOINT` set either, both forms
still work exactly as before: they simulate a successful submission in the browser and say
so on screen. See `.env.example` for both variables.

## Brand

Defined once in `src/styles/tokens.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--c-ink` | `#171A1C` | Deep charcoal, primary |
| `--c-paper` | `#F5F3EE` | Warm off white, primary |
| `--c-red` | `#C8102E` | Welsh red, sparing accents and the primary CTA |
| `--c-orange` | `#D66A2C` | Industrial orange, secondary accent |
| `--accent-2-text` | `#AA4E15` | Orange **text** on light grounds only |

Industrial orange is 3.2:1 on the off-white ground, which fails WCAG AA for small text, so
small orange text uses the deeper `--accent-2-text` and reverts to the brand orange inside
`.is-inverted` sections. Any block painted charcoal gets the `is-inverted` class, which
flips the semantic tokens so nested components need no special casing.

The logo is a wordmark plus a geometric mark: two nodes joined by a routed line with a
junction square where the route turns. It is a single shape and works in black, white or
Welsh red. `scripts/brand-svg.mjs` holds the same geometry for the generated assets, so
keep it in step with `src/components/brand/Mark.tsx`.

## Map of Wales

`src/components/map/WalesMap.tsx` draws a stylised Wales from real coastline coordinates in
`src/data/wales.ts`, stored as `[latitude, longitude]` pairs and projected in the component
so the outline and the town markers share one coordinate system.

The marked towns illustrate the shape of the network ConnectCymru intends to build. They do
not represent businesses, listings, users or activity, and the page says so.

## What is deliberately not here

No fake backend, no fake authentication, no fake marketplace activity — the accounts,
listings, requirements, matches and messages are real once Supabase is connected, and
entirely absent (not simulated) until then. No analytics, and no invented statistics,
testimonials, customer logos, company names, partnerships or endorsements. No contact
details are published, because none have been provided.

## Matching, and what it doesn't decide

`refresh_matches()` in the migration recomputes suggested matches whenever a listing or
requirement changes. It checks category and, loosely, location — nothing more. It does not
know about material grade, condition, quantity fit, or any regulatory requirement. The site
says so throughout (How It Works, Materials, every listing page): a match is a prompt to
look properly, not an approval, and the two businesses stay responsible for confirming
suitability themselves.

## Accessibility

Semantic landmarks, one `h1` per page, labelled form controls with inline errors wired
through `aria-describedby`, a skip link, visible focus states, `inert` on the closed mobile
menu, and `prefers-reduced-motion` honoured throughout. Checked with axe across every page
at desktop and mobile widths with no violations.
