# Demo foundation project

Shared foundation (template, demo bar, CSS/JS kit, conventions doc, Software-page hooks, GA event, indexing decision, placeholder demo) for the five interactive demos on /software/. Each demo is built later in its own project. Phase 1 = audit + plan. Phases 2 and 3 build it.

## Rules
- No frameworks, libraries, CDN links or build step. Plain HTML/CSS/JS. Absolute asset paths. Clean URLs.
- Demo data lives in JS only: sample data files, in memory, cleared on reload or Reset. No localStorage, sessionStorage, cookies, IndexedDB, fetch/XHR, no backend. Nothing is really sent; show a simulated WhatsApp or email preview instead.
- Fictional South African businesses and people. No real company names or logos. Rand amounts with en-ZA formatting.
- Never invent stats, testimonials or clients.
- Mobile-first. Fully keyboard-operable. WCAG AA contrast (check gold and cyan on navy too). Respect prefers-reduced-motion. Fast on a cheap Android phone: no heavy JS, no extra fonts or images, small CSS/JS budgets.
- Reuse the existing design tokens. Do not redesign the site. Do not touch the main header or menu.
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
4. **Files:** shared `/software/demo/demo.css` + `/software/demo/demo.js`. Each demo has `index.html` + `data.js` (seed) + `app.js` (logic). Reason: one path for one header rule; `app.js` avoids a name clash with the shared demo.js.
5. **Slugs:** `client-portal`, `job-cards`, `bookings`, `dashboards`, `automations`, plus `example` (placeholder). Reason: short and plain. Cards have no ids, so Phase 3 adds matching ids and "← Back to Software" goes to `/software/#<slug>`.
6. **`/software/demo/`** 301s to `/software/` (netlify.toml). Reason: no empty index page.
7. **Demo bar:** sticky top, 48px, `flex-wrap: nowrap`, targets ≥ 44px. Below 640px: "Demo" pill ("· sample data, nothing is saved" visually hidden), "← Software" ("Back to" hidden), Reset (icon + word), WhatsApp as an icon with the accessible name "Want this for your business? WhatsApp Luan (opens in a new tab)". Full wording from 640px. Reason: four items fit in 328px; screen readers always hear the full text.
8. **Bar WhatsApp link:** same number, pre-filled text, e.g. `https://wa.me/27836095579?text=Hi%20Luan%2C%20I%20tried%20your%20bookings%20demo.` Reason: Luan knows which demo the lead came from; no new contact details.
9. **Reset:** `Demo.reset()` deep-clones the seed (`structuredClone`, JSON fallback), closes any dialog, re-renders, returns to the first view, focuses its heading and announces "Demo reset to sample data" in the live region. Reason: the same state as a fresh load, with clear feedback.
10. **Modals:** native `<dialog>` + `showModal()`, with focus returned to the opener. Reason: built-in focus trap, Esc handling and inert background, no library.
11. **Tables:** a real `<table>`. Below 640px, `display:block` rows with `td::before { content: attr(data-label) }`. `Demo.table()` adds `data-label` and explicit ARIA table roles. Reason: stacked cards on phones without losing semantics (Safari drops them on `display:block`).
12. **App layout:** `.demo-app` grid, with a sidebar from 1024px and a fixed bottom tab bar below that (max 5 tabs, extras in a "More" dialog). Views switch by hash (`#view-…`), active tab has `aria-current="page"`. Navy shell, paper content. Reason: app feel, back button and deep links work, and `.form-field` is designed for paper.
13. **Status badges:** paper-card background, 1px border + text in the status colour, a dot and always a word. Tones: ok = success, warn = gold-700, error = error, info = navy, neutral = paper-muted. Reason: all ≥ 4.5 on paper-card; never colour alone.
14. **GA event:** `demo_click` through the existing `[data-track]` delegate, params `link_url` + `demo_name` (from `data-demo`), a one-line change in script.js. Reason: matches the `*_click` convention, and fires only after consent because `track()` checks gtag.
15. **Motion:** toast and dialog fades only under `prefers-reduced-motion: no-preference`. Reason: rule compliance.
16. **Budgets (raw):** demo.css ≤ 12 KB, demo.js ≤ 8 KB, per demo data.js + app.js ≤ 30 KB, no new fonts or images. Reason: the whole site's script.js is 16 KB; a demo then adds ≤ ~50 KB over the cached styles.css and fonts.
17. **Copy timing:** the reworded copy mentions demos, so it's committed in Phase 3 but must not reach `main` before the first real demo is linked. `example` is never linked from the site.

## File layout
- New, shared: `software/demo/demo.css`, `software/demo/demo.js`
- New placeholder: `software/demo/example/index.html`, `software/demo/example/data.js`, `software/demo/example/app.js`
- Later projects: `software/demo/<slug>/index.html`, `data.js`, `app.js`
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
- [ ] `software/demo/demo.css` with every CSS component above. Accept: ≤ 12 KB; only existing tokens (no new hex values); works with no `style=""`.
- [ ] `software/demo/demo.js` with the API above. Accept: ≤ 8 KB; a grep for localStorage, sessionStorage, cookie, indexedDB, fetch and XMLHttpRequest finds nothing; no console errors.
- [ ] Template head: noindex meta, og tags, font preload, /styles.css + demo.css, deferred demo.js + data.js + app.js, no /script.js. Accept: no inline script or style; passes the CSP.
- [ ] `software/demo/example/`: list, table, form, badges, toast, dialog, WhatsApp + email preview, empty state, Reset. Accept: at 360px the bar is one row with no horizontal scroll; layout checked at 768 and 1280; a keyboard-only run (Tab, Enter, Esc) works; Reset restores the seed and is announced; no animation with reduced motion; Rand renders "R 1 234,56".
- [ ] netlify.toml: `X-Robots-Tag: noindex` for `/software/demo/*`, and `/software/demo` + `/software/demo/` → `/software/` 301. Accept: TOML parses; CSP and other headers unchanged.
- [ ] `docs/DEMOS.md`: rules, file layout, head template, API, components, colour rules, budgets, how to add the card link. Accept: a new demo can be built from DEMOS.md alone.
- [ ] Commit on demo-foundation. Accept: `git status` clean, nothing pushed.

## Phase 3 checklist (Software page + QA)
- [ ] Add `id="<slug>"` to the five concept cards. Accept: `/software/#bookings` lands on its card, not hidden under the header.
- [ ] `.concept-demo-link` style in styles.css. Accept: AA on paper, target ≥ 44px, matches `.link-arrow` feel. No link added until a real demo exists.
- [ ] Copy changes exactly as above (note, FAQ HTML, FAQ JSON-LD). Accept: HTML and JSON-LD text match; JSON-LD parses.
- [ ] script.js: add `demo_name` from `data-demo` and list `demo_click` in the events comment. Accept: a temporary test link sends nothing before consent and sends `demo_click` with `demo_name` after Accept; the test link is removed.
- [ ] Final QA: demo colour pairs, budgets, noindex meta + header, sitemap unchanged, main header/menu untouched. Accept: all pass and are recorded below.
- [ ] Commit on demo-foundation. Accept: `git status` clean, nothing pushed.

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
