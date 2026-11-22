# Plan: demo cards, ALSR images, address (branch `demo-cards-alsr`)

Local commits only. Do NOT push until the owner has set Netlify Branch deploys and Deploy previews to None. This file is never served: `netlify.toml` returns a forced 404 for `/docs/*` (`publish = "."`, so the redirect is the mechanism).

## Decisions (owner-approved)
- ALSR scope: only `assets/images/alsr-home.webp` and `.jpg` (Home + Work). `og-share.png` has no ALSR shot and stays.
- Capture tool: Playwright + Chromium installed in the scratchpad, outside the repo (no package.json or node_modules in the site). WebP via `cwebp`.
- Address becomes "O'Hare Street, Jansen Park, Boksburg, 1459" (street name kept, number removed); JSON-LD `streetAddress` = "O\u0027Hare Street, Jansen Park".

## Files touched
- Cards: `software/index.html` (~77-110), `styles.css` (~1062-1175 and ~2444-2490), `script.js` (~416, `data-demo-link` tracking must keep working).
- Home link: `index.html:100`.
- ALSR: `index.html:109-112`, `work/index.html:73-76`, `assets/images/alsr-home.*`.
- Address: footers of index, about, contact, software, websites, work, terms, privacy, 404; `contact/index.html:143`; `privacy/index.html:129`; JSON-LD `index.html:40`; CLAUDE.md line 10 (local only).

## Checklist

### 1. Software cards: screenshots, no icons
- [x] Read docs/DEMOS.md; install Playwright in scratchpad; run local static server
- [x] Capture 5 crops (one recognisable element each, 640 wide, WebP): client-portal list panel, job-cards card with signature, bookings calendar/slots, dashboards KPI + chart, automations message preview/rules
- [x] Add `assets/images/demo-<slug>.webp` with explicit width/height, `loading="lazy"`, `decoding="async"`, descriptive alt
- [x] Remove the 5 card icons (+ "Your idea" icon) and dead `.concept-card > .icon` CSS
- [x] Image flush to card top, matching radius

### 2. Outline "Try the demo" buttons, pinned, clickable cards
- [x] New gold-border no-fill `.btn-outline` (existing `.btn-secondary` is not gold)
- [x] `.concept-card` flex column; button `margin-top:auto`
- [x] Stretched link (`::after` inset 0) on the one real `<a>` per card; keep `data-demo-link`; visible focus ring on card

### 3. "Your idea" card
- [x] Add "Talk about your idea ↗" outline button -> `/contact/?plan=custom`; drop the duplicate inline link

### 4. Home Software card link
- [x] "See what I can build ↗" -> "Try 5 live demos ↗"

### 5. ALSR images
- [x] Fresh 1280x800 screenshots of live alsr-sa.com, WebP + JPG fallback
- [x] Rename to `alsr-home-2026.*` to bust the 30-day cache; update all 4 references; delete old files

### 6. Address
- [x] Remove the street number everywhere listed above; keep street name, Jansen Park, Boksburg, 1459
- [x] `grep` for "O'Hare" and `O\u0027Hare` returns nothing outside docs

### Wrap-up
- [x] Browser pass at 360 / 768 / 1280: no horizontal scroll, buttons aligned, whole card clickable, one tab stop per card
- [x] `/docs/*` 404 rule still present in netlify.toml
- [x] Update PLAN.md checklist + handoff notes (local only)
- [ ] Push once, after the owner has set Netlify Branch deploys and Deploy previews to None (NOT done yet)

## Handoff notes (2026-11-22)
- Built on `demo-cards-alsr`, local commits only. **Not pushed.** Before pushing: Netlify > Site configuration > Build & deploy > Branches and deploy contexts, set Branch deploys and Deploy previews to None.
- Cards: five 640x400 WebP crops in `assets/images/demo-<slug>.webp` (13 KB average), taken from the real demos at 1280 wide. Icons removed. `.btn-outline` (gold border, no fill) is new in styles.css; `.concept-demo-link::after` is the stretched link. One link per card; the link keeps `data-demo-link`, so GA tracking is unchanged. A visually hidden phrase ("of the client portal" etc.) gives each "Try the demo" link a unique name.
- The job-cards crop shows the typed customer signature and "Job complete" on the phone; the demo's seed data has no drawn signature.
- "Your idea" card: button to `/contact/?plan=custom`; the inline "Tell me about it" link was replaced. Its body sentence is unchanged.
- Home: "Try 5 live demos ↗".
- ALSR: fresh 1280x800 screenshots of alsr-sa.com saved as `alsr-home-2026.webp` (73 KB) and `.jpg` (119 KB, the `<picture>` fallback). Old `alsr-home.*` deleted; Home and Work updated. The new filename avoids the 30-day image cache. `og-share.png` has no ALSR content and was not touched.
- Address is now "O'Hare Street, Jansen Park, Boksburg, 1459" in all footers, contact, privacy and the JSON-LD `streetAddress` ("O\u0027Hare Street, Jansen Park"). No "8 O'Hare" remains in the site. CLAUDE.md (local only) updated too.
- `/docs/*` still returns 404 via the forced redirect in netlify.toml. All @font-face rules untouched.
- Checks (local server, Playwright + axe 4.x): no horizontal overflow at 360, 768, 1024, 1440 on Home, Software, Work, Contact, Websites, About; axe: 0 violations at 375 and 1280 on Home, Software, Work, Contact (same as main); no console errors or failed requests on those four pages; buttons share one bottom line per row at 1280; cards stack at 375; clicking anywhere on a card opens its demo; one focusable link per card.
- Review screenshots (not in the repo): `...\scratchpad\review-software-375.png`, `review-software-1280.png`, `review-home-375.png`, `review-home-1280.png`.
