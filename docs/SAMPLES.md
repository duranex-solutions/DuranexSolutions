# Sample designs: build rules and definition of done

Read this before adding or editing anything under `/samples/`, `/designs/` or `/assets/images/designs/`. The plan and history are in `docs/plans/sample-designs.md`; the short rules are in CLAUDE.md ("Sample designs"). This file is the checklist.

The samples are **concept designs**, not client work and not for sale. Six exist: `ironbark-plumbing`, `suurdeeg-bakehouse`, `lindela-ledger`, `fynbos-fringe`, `torque-bay`, `ridgeline-security`.

## 1. What a sample is

- A small site of 2–3 pages at `/samples/<slug>/` (home plus inner pages in `<page>/index.html`).
- Its **own** design: its own layout, fonts, palette and one signature interaction. Nothing is shared with the main site or another sample. Don't copy a layout from a sibling; the comparison table in the plan must stay true (no repeated layout, font family, main accent or signature).
- Not allowed as a layout: hero + three cards + testimonials + CTA, a centred stock-photo hero, gradient blobs.
- No `/styles.css`, `/script.js` or analytics. No third-party requests of any kind (no maps, embeds, CDNs, external fonts). Maps and illustrations are inline SVG.

## 2. Files

    samples/<slug>/index.html
    samples/<slug>/<inner>/index.html
    samples/<slug>/assets/site.css        own CSS
    samples/<slug>/assets/site.js         own JS (no network requests)
    samples/<slug>/assets/icon.svg        favicon
    samples/<slug>/assets/fonts/*.woff2   self-hosted, latin subset, plus the OFL text for each family
    samples/<slug>/assets/img/*.webp      stock photos (optional)

Gallery files: `designs/index.html` (cards), `designs/view/index.html` (viewer), `designs/credits/index.html`, `designs/designs.css`, `designs/designs.js`, and the previews in `assets/images/designs/<slug>-full.webp`.

## 3. Page template (every sample page)

In `<head>`:
- `<html lang="en-ZA">`, a unique `<title>` ending "(concept design)", a meta description that says it's a concept design.
- `<meta name="robots" content="noindex">` and **no** canonical link.
- Open Graph tags (title, description, url, image, `og:locale` en_ZA) so a WhatsApp link previews well.
- Icon, a `preload` for the main font, the sample's own stylesheet and `<script defer>`.

In `<body>`:
- A skip link to `#main`, one `<h1>`, a `<main id="main">`, real landmarks and headings in order.
- Footer note on every page: `Concept design by Duranex · fictional business · photo credits`. "Concept design by Duranex" links to `/designs/`; "photo credits" links to `/designs/credits/#<slug>`. Also a line saying the business isn't real.
- **No** inline `<script>`, `<style>` or `style=""` (the CSP blocks them). Use classes, `site.css` and `site.js`.

## 4. Honesty rules (non-negotiable)

- Fictional business names. Before a new name is used, search it (Google, Maps, Facebook, CIPC) and rename on any South African hit.
- **No** testimonials, reviews, star ratings, awards, "years in business", client counts, client logos or "trusted by". No invented statistics. Percentages are fine only as product facts (e.g. "100% rye") or CSS/SVG sizes.
- Fake contact details only: `000 000 0000`, `hello@example.co.za`, "123 Example Street". The only real number on the gallery side is Luan's WhatsApp (gallery, viewer, credits), never inside a sample.
- Prices are fictional but realistic, rounded to R50 and shown as "from R…". Rand amounts, en-ZA spelling, first person where it suits, plain and honest.
- Every form calls `preventDefault` and shows "This is a demo – nothing is sent." (in the page or in `site.js`). No form posts anywhere; no `action` to an external host.
- Security and similar services must not promise outcomes ("no company can promise that nothing will ever happen").

## 5. Images

- Only Unsplash or Pexels (both allow free commercial use), **or** CSS/SVG. Download, resize (about 900 px on the long side is plenty) and convert to WebP, **≤ 150 KB each**. Give every `<img>` `width`, `height`, `alt` and `loading="lazy"` (not on the first-screen image).
- Record each photo in `designs/credits/index.html` under the sample's `<section id="<slug>">`: description, photographer, source URL, download date, and "resized and converted to WebP".
- Stock photos are captioned "Stock photo". Nothing placed beside a model photo may read like a quote or review. Never present a stock person as staff or a client.
- No visible brand logos (cars, tools, products), no real uniforms (police, security firms), no recognisable private homes or number plates.

## 6. Fonts

- Self-hosted latin-subset `.woff2` in the sample's `assets/fonts/`, with `font-display: swap`, and the family's `*-OFL.txt` next to it. Credit the families in the credits page with an OFL link.
- Never Manrope or DM Mono (those are the main site's), and no family used by another sample.
- Keep every existing `@font-face` rule in the main site's `styles.css`.

## 7. Motion, accessibility, mobile

- Mobile first. Check 320/360, 768, 1024, 1280 and 1440: **no horizontal scroll**.
- First screen at 360 and 1280 says what the business does and gives a primary action, without inner scrolling widgets.
- All animation and transitions off under `prefers-reduced-motion: reduce` (a block in `site.css`), including smooth scroll. Content must be readable with it on, and readable with JavaScript off (no text hidden waiting for a script).
- Every interactive element has a visible focus style (outline, or a clear border/background change) and a sensible tab order. Custom radios/checkboxes that hide the input must show focus on their label.
- Text contrast WCAG AA (4.5:1 body, 3:1 large). Don't rely on `aria-label` that differs from the visible text; start the label with the visible wording.

## 8. Gallery and viewer

- Adding a sample means: a card in `designs/index.html` (tag, name + town, two-sentence description, signature, "View design" link with `data-track="sample_view"`, "Open on its own" link), the slug and name in `DESIGNS` in `designs/designs.js`, a credits section, and a screenshot.
- Screenshots: `npx -y -p playwright node scripts/screenshots.mjs` (all) or add slugs (`... torque-bay`). Run it again whenever a sample's home page changes. `scripts/` is local only and is a 404 on Netlify.
- The viewer allows only whitelisted slugs; unknown slugs show "Design not found".
- `/designs/` is indexed and in the sitemap. Samples, `/designs/view/` and `/designs/credits/` are not (meta robots **and** `X-Robots-Tag` in `netlify.toml`).

## 9. Definition of done

A sample (or a change to one) is finished when all of these pass. Run them locally (Playwright and axe-core can be installed outside the repo, for example in a scratch folder).

1. **axe-core** (WCAG 2 A/AA + best-practice), at 375 and 1280, reduced motion on: 0 violations on every page.
2. **Horizontal overflow** at 360, 768, 1024, 1440: none.
3. **Console and network:** no console errors, no failed or 4xx requests, no CSP violations when served with the production headers from `netlify.toml`. Every internal link and `#anchor` resolves; every image loads (images inside closed `<details>` load when opened).
4. **Robots:** `noindex` meta present on every sample page; absent on `/designs/`; `X-Robots-Tag` rules in `netlify.toml` cover `/samples/*`, `/designs/view/*`, `/designs/credits/*`.
5. **Keyboard:** Tab through each page at 375 and 1280: skip link present, focus always visible and on-screen, no traps.
6. **Reduced motion:** no running infinite animations, no smooth scroll. **No JS:** headings and text visible, nothing important hidden.
7. **Honesty grep** over `samples/` and `designs/`: no testimonial, review, rating, star, award, "clients", "years", real phone or email; every form shows the demo message; no inline styles/scripts; no external hosts.
8. **Credits** entry complete and the footer note links work.
9. **Lighthouse** (mobile and desktop): accessibility and best-practices 100; performance in the 90s. SEO will read about 63–66 because of `noindex` (the "page is blocked from indexing" audit): that is intended.
10. **Gallery:** card, screenshot, viewer (iframe loads, phone toggle, WhatsApp text) and `/work/` thumbnails still correct.
11. On the **deploy preview** (can't be tested locally): `curl -I` shows `x-robots-tag: noindex` on a sample, `/designs/view/` and `/designs/credits/` but not `/designs/`; the viewer iframe loads (SAMEORIGIN / `frame-ancestors 'self'`); `/docs`, `/docs/plans/sample-designs.md`, `/CLAUDE.md`, `/AUDIT.md`, `/PLAN.md` and `/scripts/screenshots.mjs` show the 404 page.
12. Update the plan's checklist and handoff note, commit locally. **Never `git push`** unless Luan says so.
