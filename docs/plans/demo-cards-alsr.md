# Plan: demo cards, ALSR images, address (branch `demo-cards-alsr`)

Local commits only. Do NOT push until the owner has set Netlify Branch deploys and Deploy previews to None. This file is never served: `netlify.toml` returns a forced 404 for `/docs/*` (`publish = "."`, so the redirect is the mechanism).

## Decisions (owner-approved)
- ALSR scope: only `assets/images/alsr-home.webp` and `.jpg` (Home + Work). `og-share.png` has no ALSR shot and stays.
- Capture tool: Playwright + Chromium installed in the scratchpad, outside the repo (no package.json or node_modules in the site). WebP via `cwebp`.
- Address becomes "Jansen Park, Boksburg, 1459"; JSON-LD `streetAddress` = "Jansen Park".

## Files touched
- Cards: `software/index.html` (~77-110), `styles.css` (~1062-1175 and ~2444-2490), `script.js` (~416, `data-demo-link` tracking must keep working).
- Home link: `index.html:100`.
- ALSR: `index.html:109-112`, `work/index.html:73-76`, `assets/images/alsr-home.*`.
- Address: footers of index, about, contact, software, websites, work, terms, privacy, 404; `contact/index.html:143`; `privacy/index.html:129`; JSON-LD `index.html:40`; CLAUDE.md line 10 (local only).

## Checklist

### 1. Software cards: screenshots, no icons
- [ ] Read docs/DEMOS.md; install Playwright in scratchpad; run local static server
- [ ] Capture 5 crops (one recognisable element each, 640 wide, WebP): client-portal list panel, job-cards card with signature, bookings calendar/slots, dashboards KPI + chart, automations message preview/rules
- [ ] Add `assets/images/demo-<slug>.webp` with explicit width/height, `loading="lazy"`, `decoding="async"`, descriptive alt
- [ ] Remove the 5 card icons (+ "Your idea" icon) and dead `.concept-card > .icon` CSS
- [ ] Image flush to card top, matching radius

### 2. Outline "Try the demo" buttons, pinned, clickable cards
- [ ] New gold-border no-fill `.btn-outline` (existing `.btn-secondary` is not gold)
- [ ] `.concept-card` flex column; button `margin-top:auto`
- [ ] Stretched link (`::after` inset 0) on the one real `<a>` per card; keep `data-demo-link`; visible focus ring on card

### 3. "Your idea" card
- [ ] Add "Talk about your idea ↗" outline button -> `/contact/?plan=custom`; drop the duplicate inline link

### 4. Home Software card link
- [ ] "See what I can build ↗" -> "Try 5 live demos ↗"

### 5. ALSR images
- [ ] Fresh 1280x800 screenshots of live alsr-sa.com, WebP + JPG fallback
- [ ] Rename to `alsr-home-2026.*` to bust the 30-day cache; update all 4 references; delete old files

### 6. Address
- [ ] Remove the street number everywhere listed above; keep Jansen Park, Boksburg, 1459
- [ ] `grep` for "O'Hare" and `O\u0027Hare` returns nothing outside docs

### Wrap-up
- [ ] Browser pass at 360 / 768 / 1280: no horizontal scroll, buttons aligned, whole card clickable, one tab stop per card
- [ ] `/docs/*` 404 rule still present in netlify.toml
- [ ] Update PLAN.md checklist + handoff notes (local only)
- [ ] Local commits only; push once at the end, after the Netlify settings are changed
