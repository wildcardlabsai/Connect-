# ConnectCymru

Marketing site for ConnectCymru, a Welsh B2B network being built to connect businesses
that have surplus materials with businesses that can use them.

**Connecting Welsh industry.**

The platform itself is not live. This site positions ConnectCymru as launching soon and
exists to build a founding network of Welsh businesses ahead of launch.

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
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
  data/        All site content: materials, stages, benefits, nav, media, wales
  lib/         seo, validation, submitEnquiry, useInView
  pages/       One file per route
  styles/      tokens.css, base.css
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

### 2. Forms

Both forms currently simulate a successful submission in the browser. **Nothing is sent and
nothing is stored.** All of that behaviour lives in one file,
**`src/lib/submitEnquiry.ts`**.

To connect a real backend or hosted form service, set one environment variable:

```bash
# .env
VITE_ENQUIRY_ENDPOINT=https://your-endpoint.example/api/enquiries
```

When it is set, the payload is POSTed there as JSON and the real response decides whether
the success or error state is shown. See `.env.example`. Adjust the request body in
`submitEnquiry.ts` if your service expects a different shape.

The success states name the frontend-only caveat on screen. Remove that line from
`InterestForm.tsx` and `ContactForm.tsx` once submissions actually go somewhere.

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

No backend, no authentication, no database, no marketplace activity, no analytics, and no
invented statistics, testimonials, customer logos, company names, partnerships or
endorsements. No contact details are published, because none have been provided.

## Accessibility

Semantic landmarks, one `h1` per page, labelled form controls with inline errors wired
through `aria-describedby`, a skip link, visible focus states, `inert` on the closed mobile
menu, and `prefers-reduced-motion` honoured throughout. Checked with axe across every page
at desktop and mobile widths with no violations.
