# Demo foundation project

Shared foundation (template, demo bar, CSS/JS kit, conventions doc, Software-page hooks, GA event, indexing decision, placeholder demo) for the five interactive demos on /software/. Each demo is built later in its own project. Phase 1 = audit + plan. Phases 2 and 3 build it.

## Rules
- No frameworks, libraries, CDN links or build step. Plain HTML/CSS/JS. Absolute asset paths. Clean URLs.
- Demo data lives in JS only: sample data files, in memory, cleared on reload or Reset. No localStorage, sessionStorage, cookies, IndexedDB, fetch/XHR, no backend. Nothing is really sent; show a simulated WhatsApp or email preview instead.
- Fictional South African businesses and people. No real company names or logos. Rand amounts with en-ZA formatting.
- Never invent stats, testimonials or clients.
- Mobile-first. Fully keyboard-operable. WCAG AA contrast (check gold and cyan on navy too). Respect prefers-reduced-motion. Fast on a cheap Android phone: no heavy JS, no extra fonts or images, small CSS/JS budgets.
- Reuse the existing design tokens (fonts, navy, gold, cyan) as the default. Demo working surfaces (tables, forms, cards, backgrounds) are calm and neutral; gold and cyan are accents only (buttons, active nav, focus rings, badges). The accent colour is ONE overridable CSS variable on the demo page, so each fictional business can use its own accent.
- Do not redesign the site. Do not touch the main header or menu.
- Copy is en-ZA, first person, plain and honest.
- Never push, merge or deploy. Commit on the current branch only.

Project notes: docs/ is committed to git (the repo is public; Netlify 404s /docs/*). AUDIT.md, PLAN.md and CLAUDE.md are never committed (listed in .git/info/exclude). Never delete the old unused logo files in assets/logos/.

## Findings
- **(a) Consent → GA** (script.js:337-413). The choice is saved in localStorage `dx-analytics` = `"granted"`/`"denied"`. `loadAnalytics()` defines `window.gtag` only after consent. `track(name, params)` does nothing unless `typeof window.gtag === "function"`, which is the reliable "consent granted" check. A document click delegate sends `track(el.dataset.track, { link_url: el.href })` for any `[data-track]`. Events: form_submit, whatsapp_click, call_click, email_click. GA ID G-NFSFGBQR6D.
- **(b) Software page** (software/index.html). Cards are `<article class="concept-card">` in `.concept-grid` (lines 77-106): svg.icon + h3 + p, **no ids or anchors**. "Examples and concepts only…" is `<p class="note">` at line 75 (mono uppercase pill). The lead at line 66 also says the examples are concepts. The case-studies FAQ is a `<details>` at lines 158-161 **and is duplicated in the FAQPage JSON-LD on line 40**.
- **(c) Netlify** publishes the repo root (`publish = "."`), so docs/ would be served, but the `/docs/*` → 404 rule blocks it. The global CSP has `script-src 'self'` and `style-src 'self'` plus one hash: **no inline `<script>`, no `style=""` attributes** (CSSOM `el.style.x = …` is fine). `connect-src` allows self, Web3Forms and GA only. CSS/JS are `max-age=0, must-revalidate`. The `/*/index.html` → `/:splat/` 301 already covers nested folders.
- **(d) WhatsApp** is always `https://wa.me/27836095579` (26 uses), with `target="_blank" rel="noopener noreferrer"` plus visually hidden "(opens in a new tab)". The `.icon-wa` svg is at software/index.html:171. No pre-filled text exists yet.
- **(e) Fonts** are self-hosted woff2 (10 `@font-face` at the top of styles.css, `font-display: swap`). Every page preloads `/assets/fonts/xn7gYHE41ni1AdIRggexSg.woff2`. There's one `/styles.css` and one `/script.js` (IIFE, `"use strict"`, `$`/`$$` helpers), kebab-case classes, `<folder>/index.html` pages with `<body data-page="…">`. Noindex precedent: 404.html uses `<meta name="robots" content="noindex, follow">`.
- **(f) Sizes (raw):** styles.css 52.0 KB, script.js 16.0 KB, software/index.html 22.9 KB. There's no .gitignore, `_headers` or `_redirects`; everything is in netlify.toml.
- **Tokens** (styles.css:102-205): navy #152643, navy-800 #1b3150, navy-900 #0f1d34, ink, ink-muted, paper, paper-card, paper-ink, paper-muted, paper-line, field-bg/border/placeholder, gold, gold-300, gold-700, cyan, success, error. Also --font-body/--font-mono, --fs-*, --s-1…--s-10, --r-sm/md/lg/pill, --sh-*, --ease, --t-fast/med/slow. Paper sections re-point --bg/--fg/--muted/--line/--card/--link/--focus (styles.css:207-229).
- **Reusable CSS:** `.btn`, `.btn-primary`, `.btn-secondary` (515-600), `.form-field` + `.field-error` + `[aria-invalid]` + `.form-status.is-success/.is-error` (1717-1860), `.note`, `.service-tag`, `.status-dot`, `.visually-hidden`, `.skip-link`, `:focus-visible`. No table, dialog or toast styles exist.
- **Contrast (computed):**
  - Gold text: navy 4.81 ✓, **navy-800 4.18 ✗**, navy-900 5.37 ✓. Navy on a gold fill 4.81 ✓.
  - Gold-300: ≥ 6.86 on every navy ✓.
  - Cyan: ≥ 8.66 on navies ✓, 1.34 on paper ✗.
  - Gold-700, success, error and paper-muted: ≥ 4.72 on paper/paper-card ✓, fail on navy.
  - **Rule:** on dark use gold-300, cyan or ink-muted for text. On light use gold-700, success, error or paper-muted. Plain gold is a fill only, or text on navy/navy-900.

## Decisions
1. **Indexing:** `noindex, follow` meta. Out of sitemap.xml, not disallowed in robots.txt, plus `X-Robots-Tag: noindex` for `/software/demo/*` in netlify.toml. Reason: thin sample-data pages, the Software page should rank, and crawlers must fetch the page to see the noindex. No canonical (it would conflict with noindex). Keep og/twitter tags so shared WhatsApp links preview well.
2. **No GA, no consent banner on demo pages.** Demo pages don't load /script.js. Reason: no storage or cookies at all, which matches the rules. Interest is measured by the Software-page click event.
3. **CSS:** load `/styles.css` (tokens, base, .btn, .form-field; already cached) plus `/software/demo/demo.css`. Reason: reuses tokens without copying them and leaves the site CSS alone.
4. **Files:** shared `/software/demo/demo.css` + `/software/demo/demo.js`. Each demo has `index.html` + `data.js` (seed) + `app.js` (logic) + optional `app.css` (accent override and demo-specific styles). Reason: one path for one header rule; `app.js` avoids a name clash with the shared demo.js.
5. **Slugs:** `client-portal`, `job-cards`, `bookings`, `dashboards`, `automations`, plus `example` (placeholder). Reason: short and plain. Cards have no ids, so Phase 3 adds matching ids and "← Back to Software" goes to `/software/#<slug>`.
6. **`/software/demo/`** 301s to `/software/` (netlify.toml). Reason: no empty index page.
7. **Demo bar:** sticky top, 48px, `flex-wrap: nowrap`, targets ≥ 44px. Below 640px: "Demo" pill ("· sample data, nothing is saved" visually hidden), "← Software" ("Back to" hidden), Reset (icon + word), WhatsApp as an icon with the accessible name "Want this for your business? WhatsApp Luan (opens in a new tab)". Full wording from 640px. Reason: four items fit in 328px; screen readers always hear the full text.
8. **Bar WhatsApp link:** same number, pre-filled text, e.g. `https://wa.me/27836095579?text=Hi%20Luan%2C%20I%20tried%20your%20bookings%20demo.` Reason: Luan knows which demo the lead came from; no new contact details.
9. **Reset:** `Demo.reset()` deep-clones the seed (`structuredClone`, JSON fallback), closes any dialog, re-renders, returns to the first view, focuses its heading and announces "Demo reset to sample data" in the live region. Reason: the same state as a fresh load, with clear feedback.
10. **Modals:** native `<dialog>` + `showModal()`, with focus returned to the opener. Reason: built-in focus trap, Esc handling and inert background, no library.
11. **Tables:** a real `<table>`. Below 640px, `display:block` rows with `td::before { content: attr(data-label) }`. `Demo.table()` adds `data-label` and explicit ARIA table roles. Reason: stacked cards on phones without losing semantics (Safari drops them on `display:block`).
12. **App layout:** `.demo-app` grid, with a sidebar from 1024px and a fixed bottom tab bar below that (max 5 tabs, extras in a "More" dialog). Views switch by hash (`#view-…`), active tab has `aria-current="page"`. Neutral shell (paper background, paper-card sidebar and tab bar); the accent marks the active view. Reason: app feel, back button and deep links work, and `.form-field` is designed for paper.
13. **Status badges:** paper-card background, 1px border + text in the status colour, a dot and always a word. Tones: ok = success, warn = gold-700, error = error, info = `--demo-accent-strong`, neutral = paper-muted. Reason: all ≥ 4.5 on paper-card; never colour alone.
14. **GA event:** `demo_click` through the existing `[data-track]` delegate, params `link_url` + `demo_name` (from `data-demo`), a one-line change in script.js. Reason: matches the `*_click` convention, and fires only after consent because `track()` checks gtag.
15. **Motion:** toast and dialog fades only under `prefers-reduced-motion: no-preference`. Reason: rule compliance.
16. **Budgets (raw):** demo.css ≤ 12 KB, demo.js ≤ 8 KB, per demo data.js + app.js + app.css ≤ 30 KB, no new fonts or images. Reason: the whole site's script.js is 16 KB; a demo then adds ≤ ~50 KB over the cached styles.css and fonts.
17. **Copy timing:** the reworded copy mentions demos, so it's committed in Phase 3 but must not reach `main` before the first real demo is linked. `example` is never linked from the site.
18. **Accent + neutral surfaces.**
    - **The one variable:** `--demo-accent`, default `var(--gold)`. A demo overrides it in its own `app.css` with `:root { --demo-accent: #…; }`, linked after demo.css.
    - **Shades worked out from it in demo.css** (never overridden):
      - `--demo-on-accent: var(--navy-900)`: text on accent fills.
      - `--demo-accent-strong: color-mix(in srgb, var(--demo-accent) 60%, var(--navy-900))`: accent text, focus rings, active-nav indicator.
      - `--demo-accent-tint: color-mix(in srgb, var(--demo-accent) 14%, #fff)`: active nav and selected-row background.
    - **Neutral surfaces (existing tokens):** `--paper` app background, `--paper-card` cards and sidebar, `--field-bg` fields, `--paper-line` borders, `--paper-ink` text, `--paper-muted` secondary text.
    - **The demo bar stays Duranex** (navy-900, gold-300, cyan focus) and ignores `--demo-accent`.
    - **Raw accent:** only as a fill (with navy-900 text) or a tint, never as text or the only sign of state. Gold is just 2.79 on paper.
    - **An override must pass:** navy-900 on the accent ≥ 4.5, and its strong mix on paper ≥ 4.5. Mid-to-light colours pass.
    - **Reason:** one value re-skins a demo, and the worked-out shades keep AA. A linked file is needed because the CSP blocks inline `<style>`; setting it from JS would make the colour flash. `color-mix` is already used in styles.css.

## File layout
- New, shared: `software/demo/demo.css`, `software/demo/demo.js`
- New placeholder: `software/demo/example/index.html`, `software/demo/example/data.js`, `software/demo/example/app.js`, `software/demo/example/app.css`
- Later projects: `software/demo/<slug>/index.html`, `data.js`, `app.js`, optional `app.css`
- Docs: `docs/DEMOS.md` (new), `docs/plans/demo-foundation.md` (this file)
- Edited: `netlify.toml` (X-Robots-Tag, /software/demo 301), `software/index.html` (card ids, note, FAQ + JSON-LD), `styles.css` (`.concept-demo-link` only), `script.js` (demo_name + events comment)
- Unchanged on purpose: `sitemap.xml`, `robots.txt`, main header and menu

## Component list
CSS (demo.css):
- `.demo-bar`, `.demo-bar__label`, `__back`, `__reset`, `__wa`: the slim top bar
- `.demo-app`: grid shell (sidebar ≥ 1024px, bottom tabs below)
- `.demo-sidebar`, `.demo-tabs`: view navigation, `aria-current="page"`
- `.demo-view`: one screen; inactive views use `hidden`
- `.demo-card`: content card on paper
- `.demo-table`: table that stacks into cards below 640px
- `.demo-form`: layout wrapper around existing `.form-field`
- `.demo-badge` + `--ok/--warn/--error/--info/--neutral`: status pill with dot + word
- `.demo-toast`: polite live region, auto-hides
- `.demo-dialog`: styling for native `<dialog>`
- `.demo-empty`: empty state (icon, line of text, action)
- `.demo-preview`, `--whatsapp`, `--email`: simulated message preview
- `.concept-demo-link` (in styles.css): the "Try the demo ↗" link on a Software card

JS (`window.Demo`, demo.js):
- `Demo.init({ seed, render, views })`: boot, routing, Reset wiring
- `Demo.store.get / set / update / subscribe`: in-memory state only
- `Demo.reset()`, `Demo.onReset(fn)`: re-seed, re-render, announce
- `Demo.fmt.rand(n)`: Intl en-ZA ZAR, e.g. "R 1 234,56"
- `Demo.fmt.number`, `Demo.fmt.date` ("19 Nov 2026"), `Demo.fmt.time`
- `Demo.el(tag, props, ...children)`: safe element builder (textContent, never innerHTML for typed input)
- `Demo.toast(msg, { tone })`: message in the live region
- `Demo.modal.open(dialog | { title, body, actions })`, `Demo.modal.close()`
- `Demo.preview({ channel, to, subject, body })`: dialog labelled "Preview only, nothing was sent"
- `Demo.table(container, { columns, rows, empty })`: renders a stacking table or the empty state
- `Demo.uid()`: id for new sample records

## Copy changes
- **Note, software/index.html:75**
  - Before: `Examples and concepts only, not finished projects.`
  - After: `Concepts, not client work. Demos use sample data, nothing is saved.`
- **FAQ "Do you have software case studies?", software/index.html:160 and JSON-LD line 40**
  - Before: `Not yet. Software is a new service for Duranex, and the examples on this page are concepts. You can see my website work on the work page.`
  - After: `Not yet. Software is a new service for Duranex. The demos on this page are my own builds, not client work. They run in your browser on made-up sample data, so nothing you type is saved or sent. You can see my website work on the work page.`
  - The HTML keeps the `<a href="/work/">work page</a>` link; the JSON-LD stays plain text.
- **Lead, line 66:** unchanged (still accurate).
- **Card link**, added by each later demo project once its demo exists, as the last child of its card:
  `<a class="concept-demo-link" href="/software/demo/<slug>/" data-track="demo_click" data-demo="<slug>">Try the demo <span aria-hidden="true">↗</span></a>` (same tab)

## Phase 2 checklist (foundation)
- [x] `software/demo/demo.css` with every CSS component above. Accept: ≤ 12 KB; only existing tokens (no new hex values, except the accent override in a demo's app.css); works with no `style=""`.
- [x] Neutral surfaces. Accept: tables, forms, cards and backgrounds use only the paper/field tokens in Decision 18; gold and cyan appear only on buttons, active nav, focus rings and badges (check by grepping demo.css).
- [x] Accent through one variable. Accept: changing `--demo-accent` in `example/app.css` re-skins every accent use; no other accent value is set anywhere.
- [x] Contrast check, default gold and one override (blue `#5b9be8`, set in `example/app.css`). Accept: navy-900 on accent ≥ 4.5 (expected gold 5.37, blue 5.86); accent-strong on paper and paper-card ≥ 4.5 (gold 5.45/5.88, blue 5.00/5.40); accent-strong on accent-tint ≥ 4.5 (gold 5.35, blue 4.94); raw accent never used as text. Re-measure in the browser and record the results in the handoff. Measured by script in Phase 2 (all pass); browser re-measure still to do by eye.
- [x] `software/demo/demo.js` with the API above. Accept: ≤ 8 KB; a grep for localStorage, sessionStorage, cookie, indexedDB, fetch and XMLHttpRequest finds nothing; no console errors.
- [x] Template head: noindex meta, og tags, font preload, /styles.css + demo.css, deferred demo.js + data.js + app.js, no /script.js. Accept: no inline script or style; passes the CSP.
- [x] `software/demo/example/`: list, table, form, badges, toast, dialog, WhatsApp + email preview, empty state, Reset. Accept: at 360px the bar is one row with no horizontal scroll; layout checked at 768 and 1280; a keyboard-only run (Tab, Enter, Esc) works; Reset restores the seed and is announced; no animation with reduced motion; Rand renders "R 1 234,56".
- [~] netlify.toml: `X-Robots-Tag: noindex` for `/software/demo/*`, and `/software/demo` + `/software/demo/` → `/software/` 301. Accept: TOML parses; CSP and other headers unchanged. **Not done in Phase 2 on purpose (Luan said not to touch netlify.toml this phase). Still open: do it in Phase 3 or a later step.**
- [x] `docs/DEMOS.md`: rules, file layout, head template, API, components, colour rules, budgets, how to add the card link. It must include this line: "To give a demo its own accent, add `software/demo/<slug>/app.css` containing `:root { --demo-accent: #xxxxxx; }`, linked after demo.css; check navy-900 text on it and its strong mix on paper are both ≥ 4.5." Accept: a new demo can be built from DEMOS.md alone.
- [x] Commit on demo-foundation. Accept: `git status` clean, nothing pushed.

## Phase 3 checklist (Software page + QA)
- [x] Add `id="<slug>"` to the five concept cards. Accept: `/software/#bookings` lands on its card, not hidden under the header.
- [x] `.concept-demo-link` style in styles.css. Accept: AA on paper, target ≥ 44px, matches `.link-arrow` feel. No link added until a real demo exists.
- [x] Copy changes exactly as above (note, FAQ HTML, FAQ JSON-LD). Accept: HTML and JSON-LD text match; JSON-LD parses.
- [x] script.js: add `demo_name` from `data-demo` and list `demo_click` in the events comment. Accept: a temporary test link sends nothing before consent and sends `demo_click` with `demo_name` after Accept; the test link is removed.
- [x] Final QA: demo colour pairs, budgets, noindex meta + header, sitemap unchanged, main header/menu untouched. Accept: all pass and are recorded below.
- [x] Commit on demo-foundation. Accept: `git status` clean, nothing pushed.

## Handoff log

### Handoff - Phase 1 (2026-11-19)
**Done:** audit (Findings), all decisions, this plan. docs/ is now committed; no site files changed.

**Luan to decide or check:**
1. The new note and FAQ wording in "Copy changes".
2. Whether you're happy with the pre-filled WhatsApp message in the demo bar (Decision 8).
3. Optional, later: register `demo_name` as a custom dimension in Google Analytics so it shows in reports. Phase 3 gives click-steps.

**Phase 2 reads first, in this order:**
1. This file.
2. styles.css lines 100-230 (tokens + surfaces), 459-600 (labels, buttons), 1062-1130 (cards), 1717-1860 (forms).
3. software/index.html lines 1-45 (head pattern) and 171 (WhatsApp icon svg).
4. netlify.toml (CSP and headers).

### Amendment (2026-11-19): neutral surfaces, overridable accent
- **Rules:** the design-tokens rule was replaced with Luan's wording. "Do not redesign… menu" is kept as its own bullet.
- **Decisions:** added Decision 18 (`--demo-accent` plus shades worked out from it, and the neutral surface tokens). Decision 12 now uses a neutral shell; in Decision 13 the info badge uses accent-strong. Decision 4, File layout and Decision 16 now include the optional per-demo `app.css`.
- **Phase 2 checklist:** added neutral surfaces, accent through one variable, and a contrast check for gold plus a blue override. DEMOS.md must include the override line.
- **Phase 2 wasn't built yet,** so no CSS changes were needed. DEMOS.md didn't exist yet, so its line is a Phase 2 item.

### Handoff - Phase 2 (2026-11-19)
**Files created:** `software/demo/demo.css` (11.9 KB), `software/demo/demo.js` (7.9 KB), `software/demo/example/index.html`, `data.js`, `app.js`, `app.css` (6.7 KB together), `docs/DEMOS.md` (205 lines). Branch was `demo-foundation`. Nothing else was touched: Software page, sitemap.xml, robots.txt, netlify.toml, script.js, styles.css are unchanged.

**Deviations from the plan, and why:**
1. The example's logic file is `app.js` (plan Decision 4), not `demo.js` as the Phase 2 prompt said, so it can't clash with the shared `demo.js`.
2. The nav is one `<nav class="demo-sidebar demo-tabs">`: bottom tabs below 1024px, sidebar from 1024px. Same classes as planned, no duplicated markup. The "More" dialog for extra tabs was not built; keep demos to 5 views or fewer (documented).
3. Bar: the long wording ("Want this for your business?" and "sample data, nothing is saved") shows from 960px, not 640px. At 640-959px the bar would overflow. From 640px "← Back to Software" and "WhatsApp Luan" show. Screen readers always hear the full text.
4. Badges use a small icon character (✓ ! ✕ i –) plus the word, instead of a coloured dot. Same rule (never colour alone), stronger.
5. The toast has a gold-300 left edge on its navy box (a small accent on the dark toast), and uses a ✓ / ! / i icon for tone.
6. Budgets are measured in 1000-byte KB, like the plan's own numbers. demo.css is written as one line per rule to fit 12 KB.
7. The `Demo.modal` needs native `<dialog>` support (all current browsers); there is no old-browser fallback.

**Verified without a browser UI (headless Edge on a local test server, since removed):**
- Full click-through script: nav and aria-current, table with data-labels, badges, filter to empty state, Message dialog to WhatsApp preview ("Preview only. Nothing was sent."), remove-with-confirm, form validation errors and focus, add order, Reset (6 orders, first view, heading focused, toast), no script errors.
- Rand prints `R 1 234,56` (Intl en-ZA gives "R" + U+00A0 + "1" + U+00A0 + "234,56"; code keeps non-breaking spaces everywhere). Dates `19 Nov 2026`, time `14:05`.
- Layout at 360, 768 and 1280: no horizontal overflow; at 360 the bar is one row (right edge 333 of 360, all targets 44px+), tabs fixed at the bottom, table becomes stacked cards, all 17 table buttons are 44px+; from 1024 the sidebar is 240px and sticky.
- Greps (storage, network, external URLs, inline script/style, `/script.js`, hex in demo.css): all clean. Every asset path is absolute and exists. Tags balanced, ids unique, one h1, labels on all 5 inputs.

**Known gaps:**
- netlify.toml (X-Robots-Tag, /software/demo 301) is not done: Luan said not to touch it this phase. It's the one open Phase 2 checklist item.
- Keyboard-only run, Esc to close, and reduced-motion were not exercised by hand; they rely on native `<dialog>`/CSS. Focus return to the opener works for real clicks; scripted clicks don't focus buttons so that part was only partly tested.
- No `/software/demo/example/` clean-URL redirect test (Netlify only).
- Per-demo `app.css` isn't minified; only the shared files are budgeted tightly.

**Contrast (computed by script):** every pair passes AA. Gold: navy-900 on accent 5.37, accent-strong on paper/card/tint 5.45/5.88/5.35. Blue `#5b9be8`: 5.86, 5.00/5.40/4.94. Full table in DEMOS.md.

**Luan: check by eye in Live Server (open `/software/demo/example/`):**
1. Phone width (360px in dev tools): the bar fits on one row; tabs at the bottom; Orders shows cards, not a wide table.
2. Press Reset and tick-through: Orders > Next step, Message > WhatsApp preview and Email preview, Remove, New order (try leaving it empty), filter to "Cancelled".
3. Keyboard only: Tab through everything, Esc closes dialogs, focus lands back on the button.
4. Desktop width (1280px): sidebar on the left, table in columns.
5. The blue accent looks right on the buttons and active tab (it's set only in `example/app.css`; delete that file's one line to see the gold default).
6. Dev tools > Rendering > "Emulate prefers-reduced-motion: reduce": no fades on toast or dialog.
7. The bar's WhatsApp link opens with the pre-filled message (it says "example demo").

### Handoff - Phase 3 (2026-11-19)
**Wording for Luan to review**
- Note on /software/ (a mono pill under "What I can build for you")
  - Before: `Examples and concepts only, not finished projects.`
  - After: `Concepts, not client work. Demos use sample data, nothing is saved.`
- FAQ "Do you have software case studies?" (visible answer and FAQPage JSON-LD, identical apart from the work-page link)
  - Before: `Not yet. Software is a new service for Duranex, and the examples on this page are concepts. You can see my website work on the work page.`
  - After: `Not yet. Software is a new service for Duranex. The demos on this page are my own builds, not client work. They run in your browser on made-up sample data, so nothing you type is saved or sent. You can see my website work on the work page.`
- Both lines mention demos that are not linked yet. Do not merge to `main` before the first real demo is linked (Decision 17).

**Files changed:** `software/index.html` (note, FAQ HTML + JSON-LD, ids on the five cards), `styles.css` (`.concept-demo-link`, card `scroll-margin-top`), `script.js` (demo_click listener, events comment), `netlify.toml` (X-Robots-Tag for `/software/demo/*`), `docs/DEMOS.md`, this file. CLAUDE.md was also edited locally (it is not committed).

**Deviations**
- The link uses `data-demo-link="<slug>"` (Luan's Phase 3 prompt), not `data-track` + `data-demo` from Decision 14/Copy changes. The listener is separate from the `[data-track]` one and sets `demo_name`, `link_url`, `transport_type: "beacon"`. DEMOS.md has the final snippet.
- It checks `localStorage dx-analytics === "granted"` and `typeof window.gtag === "function"`. Existing consent/GA code is unchanged.
- `/docs/*` was already blocked by a 404 rule, so nothing was added for it.

**Checked without a browser:** DEMOS.md definition-of-done greps on `example` all clean (storage/network, external URLs, noindex meta = 1, no inline style/script, all asset paths exist, data+app+css = 6.7 KB); demo.css 11,895 B and demo.js 7,916 B (within budget). Software page diff: header/nav untouched, no demo link or `/software/demo` reference. FAQ HTML and JSON-LD text match; JSON-LD parses. sitemap.xml parses and has no demo URLs; robots.txt has no demo rule. GA trace: `loadAnalytics()` only runs when the saved choice is "granted" or the Accept button is pressed, so nothing loads before consent; the new listener returns early without both consent and gtag, and nothing is queued.

**Unfinished / not verified**
- `/software/demo` and `/software/demo/` -> `/software/` 301 (Decision 6) was NOT added (not in the Phase 3 prompt). Checklist item is marked `[~]`. Until it exists, `/software/demo/` 404s.
- Not run in a browser: the temporary test link for demo_click (consent vs no consent), `/software/#bookings` landing position under the header, the `.concept-demo-link` look and contrast, the X-Robots-Tag header (Netlify only), and `netlify.toml` parsing by Netlify (edited in the existing format, not run through a TOML parser).
- Optional: register `demo_name` as a GA custom dimension (steps in DEMOS.md).
