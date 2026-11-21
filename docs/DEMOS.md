# Building a demo

How to build one of the five interactive demos on /software/. Read this and `software/demo/example/` (the working placeholder) and you can build a new demo without anything else. The binding rules are in `docs/plans/demo-foundation.md`.

## Rules in one list
- Plain HTML, CSS and JS. No frameworks, libraries, CDN links or build step. Absolute asset paths (`/software/demo/...`).
- Data lives in JS only (`data.js`), in memory, gone on reload or Reset. No localStorage, sessionStorage, cookies, IndexedDB, fetch or XHR. Nothing is really sent: show the message preview instead.
- Fictional South African business and people. No real company names or logos. No invented stats, clients or testimonials.
- Demo pages never load `/script.js` (no GA, no consent banner) and are `noindex, follow`.
- No inline `<script>`, no `<style>`, no `style=""` (the site CSP blocks them). `el.style.x = ...` from JS is fine.
- Do not touch the main site header or menu. The demo bar replaces them on demo pages.
- Copy is en-ZA, first person, plain and honest.

## File layout
```
software/demo/demo.css            shared kit (budget 12 KB)
software/demo/demo.js             shared kit, window.Demo (budget 8 KB)
software/demo/<slug>/index.html   the page
software/demo/<slug>/data.js      sample data: window.DEMO_SEED = {...}
software/demo/<slug>/app.js       this demo's logic
software/demo/<slug>/app.css      accent override and demo-only styles (optional)
```
Budget per demo: `data.js` + `app.js` + `app.css` together at most 30 KB. KB means 1000 bytes. No new fonts or images. Exception: `dashboards` has 36 KB for all its files (gen.js, data.js, app.js, app.css; owner approved), because it writes its own .xlsx file. `job-cards` has up to 40 KB for data.js, rules.js, app.js and app.css (owner approved); it is 35 236 bytes.
`client-portal` has up to 40 KB for data.js, calc.js, app.js and app.css (owner approved, because it also writes its own .xlsx); it is 35 146 bytes. `calc.js` is its pure-logic file and holds the CSV and .xlsx builders.
A demo may add one pure-logic file (no DOM, so it can be tested in node), for example `bookings/slots.js`, loaded after `demo.js` and before `data.js`. It counts in the same 30 KB. Tests for it are not kept in the repo.
Slugs: `client-portal`, `job-cards`, `bookings`, `dashboards`, `automations`. `example` is the placeholder and is never linked from the site.

## Head and page template
Copy `software/demo/example/index.html` and change the title, description, og tags and `og:url`. Keep, in this order:
```html
<meta name="robots" content="noindex, follow" />
<link rel="preload" href="/assets/fonts/xn7gYHE41ni1AdIRggexSg.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/styles.css" />
<link rel="stylesheet" href="/software/demo/demo.css" />
<link rel="stylesheet" href="/software/demo/<slug>/app.css" />   <!-- after demo.css -->
<script src="/software/demo/demo.js" defer></script>
<script src="/software/demo/<slug>/data.js" defer></script>
<script src="/software/demo/<slug>/app.js" defer></script>
```
Do not add a canonical link (it would fight the noindex). Body: `<body class="demo-body" data-page="demo-<slug>">`, then in order: skip link, `header.demo-bar`, `div.demo-app` (nav + `main#main`). One `<h1>` (the business name), one `<h2>` per view.

The demo bar is the same on every demo. Only change the WhatsApp text (`?text=Hi%20Luan%2C%20I%20tried%20your%20<slug>%20demo.`) and, for a real demo, the back link to `/software/#<slug>` (the example links to `/software/` because it has no card).

## Accent colour
To give a demo its own accent, add `software/demo/<slug>/app.css` containing `:root { --demo-accent: #xxxxxx; }`, linked after demo.css; check navy-900 text on it and its strong mix on paper are both ≥ 4.5.

- `--demo-accent` is the only value you set. Default is the site gold. The example uses blue `#5b9be8`.
- demo.css works out the rest: `--demo-on-accent` (navy-900), `--demo-accent-strong` (60% accent + navy-900), `--demo-accent-tint` (14% accent + white). Never override those.
- The raw accent is a fill only (primary button, with navy-900 text). Accent text, focus rings and the active-nav indicator use `--demo-accent-strong`. The active-nav background uses the tint.
- The demo bar stays Duranex navy and ignores the accent.
- Surfaces are neutral: `--paper` page, `--paper-card` cards and nav, `--field-bg` fields, `--paper-line` borders, `--paper-ink` text, `--paper-muted` secondary text. Do not add other colours.

## Components (all in demo.css)
App shell and views. The nav is one element: bottom tabs below 1024px, sidebar from 1024px. Keep to five views or fewer (there is no "More" menu).
```html
<nav class="demo-sidebar demo-tabs" aria-label="Demo sections">
  <p class="demo-brand" aria-hidden="true">Business name</p>
  <ul><li><a href="#view-summary">Summary</a></li> ...</ul>
</nav>
<section class="demo-view" data-view="summary" aria-labelledby="h-summary">   <!-- others: hidden -->
  <h2 id="h-summary">Summary</h2> ...
</section>
```
Link `href="#view-<name>"` and `data-view="<name>"` must match. The first view is the default and Reset target.

Card and stats: `<div class="demo-card"><p class="demo-muted">Orders</p><span class="demo-stat">6</span></div>`. Wrap several in `.demo-grid`. Helpers: `.demo-toolbar`, `.demo-actions` (button row), `.demo-muted`.

Buttons reuse the site classes: `.btn .btn-primary` (accent fill), `.btn .btn-secondary`, plus `.demo-btn--sm` for table and dialog buttons (still 44px tall).

Forms reuse `.form-field` from styles.css. Every field needs a `<label for>`; errors go in `<span class="field-error" id="..." hidden>` named by `aria-describedby`, and set `aria-invalid="true"` on the input.
```html
<form class="demo-card demo-form" novalidate>
  <div class="form-field"><label for="f-name">Name</label>
    <input id="f-name" autocomplete="off" aria-describedby="f-name-err" />
    <span class="field-error" id="f-name-err" hidden></span></div>
  <div><button class="btn btn-primary" type="submit">Add</button></div>
</form>
```
Selects use the same `.form-field` wrapper.

Status badge (icon and word, never colour alone). Tones: `ok`, `warn`, `error`, `info`, `neutral`.
```js
Demo.badge("ok", "Ready")   // <span class="demo-badge demo-badge--ok"><span aria-hidden>✓</span>Ready</span>
```
Table that stacks into cards below 640px: call `Demo.table(box, {...})` (below). It writes a real `<table>` with ARIA roles and a `data-label` on every cell.

Toast: `Demo.toast("Saved")`. A polite live region, created by demo.js, hides after 5 seconds.

Modal: native `<dialog class="demo-dialog">` with `.demo-dialog__head`, `__body`, `__foot`. Usually you do not write the markup: `Demo.modal.open({ title, body, actions })` builds one.

Empty state: `Demo.empty({ title, text, action })`. `Demo.table` shows it by itself when `rows` is empty.

Message preview (simulated WhatsApp or email), always labelled "Preview only. Nothing was sent.": `Demo.preview({ channel: "whatsapp" | "email", to, subject, body })`.

## JS API (`window.Demo`, demo.js)
- `Demo.init({ seed, render, views? })`: deep-clones `seed` into the store, calls `render(state)` now and after every store change, starts the hash router. `views` is optional (defaults to the `data-view` order in the DOM).
- `Demo.store.get()`, `.set(next)`, `.update(fn)` (mutate the state in `fn`, or return a new one), `.subscribe(fn)` returns an unsubscribe function. `set` and `update` re-render.
- `Demo.reset()`: closes any dialog, re-seeds, runs `onReset` hooks, resets forms, re-renders, goes to the first view, focuses its heading and shows "Demo reset to sample data". The bar's Reset button (`data-demo-reset`) calls it.
- `Demo.onReset(fn)`: hook for demo-only clean-up (for example clearing form errors).
- `Demo.go(name)`: switch view (updates the hash, focuses the heading).
- `Demo.fmt.rand(n)`, `.number(n)`, `.date(v)`, `.time(v)`. Output: `R 1 234,56`, `1 234 567`, `19 Nov 2026`, `14:05`. Spaces are non-breaking (U+00A0). Dates take `"YYYY-MM-DD"`, `"YYYY-MM-DDTHH:mm"` or a Date. Month names are fixed in the code so they never differ by browser. Always use these, never hand-format.
- `Demo.el(tag, props, ...children)`: builds elements. Props: `class`, `text`, `on<event>` handlers, anything else becomes an attribute. Strings are text nodes. Never put typed or sample text into `innerHTML`.
- `Demo.table(box, { label, columns, rows, empty })`: `columns` are `{ label, key | render(row), num? }`; `rows` need an `id`.
- `Demo.badge(tone, text)`, `Demo.empty({ title, text, action: { label, onClick } })`.
- `Demo.toast(msg, { tone: "ok" | "error" | "info" })`.
- `Demo.modal.open(dialogElement | { title, body, actions: [{ label, primary?, onClick? }] })`, `Demo.modal.close()`. Actions close the dialog first, then run `onClick`. Focus is trapped and Esc closes (native dialog). Focus returns to the button that opened it, or to the view heading if that button was re-rendered.
- `Demo.preview(opts)` opens the preview in a modal; `Demo.previewEl(opts)` returns the element for inline use.
- `Demo.uid()`: id for new sample records.

Typical `app.js`: build everything in `render(state)` (stats, `Demo.table`, filter value), change data only through `Demo.store.update`, and call `Demo.init({ seed: window.DEMO_SEED, render })` last.

## Sample data rules (`data.js`)
- `window.DEMO_SEED = { ... }`, plain JSON-like data. Seed once; Reset restores it exactly.
- Fictional business that is clearly marked as made up on the page. Invented people with common South African names. No real company, brand or logo.
- Phones obviously fake (`+27 00 000 0001`). Emails on `example.com`. No real addresses, ID numbers or bank details.
- Amounts are numbers in rand (`1234.56`), formatted only by `Demo.fmt.rand`. Dates are ISO strings.
- Keep one record in a state that makes each component useful (a filter with no matches, for the empty state).

## Accessibility and performance rules
- Keyboard: everything reachable and operable with Tab, Enter, Space and Esc. Visible focus (`--focus` is the accent-strong shade, cyan on the dark bar).
- Tap targets at least 44px. The demo bar is one row at 360px.
- Contrast WCAG AA: text 4.5, large text and UI parts 3. Gold and cyan are never body text on paper.
- Status is never colour alone: badges carry an icon and a word, nav carries a bar and heavier text.
- Motion only under `prefers-reduced-motion: no-preference`. The toast and dialog fades are the only shared animation. The automations demo adds one more: each step fades in over 200 ms (in its `app.css`). Under reduced motion all steps appear at once.
- Live updates (toast) go through the polite live region. Moving between views moves focus to the view heading.
- Data tables stay real tables. Every input has a label. One h1 per page.
- Fast on a cheap Android phone: no heavy loops, no big images, no extra fonts. Render only what the current state needs.

## Contrast results (example demo, measured with the sRGB formula)
Default accent (gold `#b18c3e`) and the override (blue `#5b9be8`). AA needs 4.5 for text, 3 for UI parts.

| Pair | Gold | Blue |
|---|---|---|
| navy-900 text on accent fill (primary button) | 5.37 | 5.86 |
| navy-900 on hovered primary (80% accent + white) | 6.98 | 7.40 |
| accent-strong on paper | 5.45 | 5.00 |
| accent-strong on paper-card | 5.88 | 5.40 |
| accent-strong on accent-tint (selected state) | 5.35 | 4.94 |
| paper-ink on accent-tint (active nav label) | 13.17 | 13.25 |
| accent-strong focus ring on paper (needs 3) | 5.45 | 5.00 |

Fixed pairs (same for every demo):

| Pair | Ratio |
|---|---|
| ink on navy-900 (bar, toast, preview label) | 15.06 |
| gold-300 on navy-900 (bar "Demo" pill, hover) | 8.82 |
| cyan on navy-900 (bar focus ring) | 11.14 |
| paper-ink on paper / paper-card / field-bg | 13.42 / 14.48 / 15.11 |
| paper-muted on paper / paper-card | 5.00 / 5.40 |
| badge ok (success) on paper-card | 5.10 |
| badge warn (gold-700) on paper-card | 5.71 |
| badge error on paper-card | 6.27 |
| badge neutral (paper-muted) on paper-card | 5.40 |
| field-error on paper / paper-card | 5.81 / 6.27 |
| paper-ink on WhatsApp bubble (12% success + white) | 12.83 |
| field-border on paper / white (UI part) | 3.34 / 3.76 |

An override must pass: navy-900 on the accent at least 4.5, and the accent-strong mix on paper at least 4.5 (and ideally on the tint). Mid-to-light colours pass; very dark or very saturated ones may not. Compute it before you commit to a colour.
These were computed by script, not in a browser. Re-check by eye in Live Server.

## Printing and file downloads (from the dashboards demo)
- **Print to PDF:** copy the content into an empty `<div class="dash-print" aria-hidden="true">` at the end of the body, then call `window.print()`; empty it on `afterprint`. In `@media print` hide `.skip-link, .demo-bar, .demo-app, .demo-toast, dialog`, show the print block, and set `@page { size: A4; margin: 15mm }`. Do not print the `<dialog>` itself.
- **Tables inside a dialog or print block:** let phones use the shared stacked cards. Only force real tables with `@media (min-width: 640px), print`, or the dialog scrolls sideways on phones.
- **Spreadsheet export:** write a real `.xlsx` (hand-built stored zip, see `dashboards/gen.js`), not a CSV. Reason: a CSV cannot set column widths, so Excel shows dates as "#####" and cuts text, and decimal-comma regional settings can misread numbers. In the .xlsx dates are real dates, numbers are numbers, columns are sized, and the header is bold and frozen. The filename carries SAMPLE, for example `kopje-coffee-SAMPLE-payroll-both-2026-11-14-to-2026-11-20.xlsx`. Gross pay only, no PAYE or UIF. Build the file in memory with a Blob and a temporary link; never fetch.
- **CSV is right when the file is meant for importing into other software** (the client-portal demo's "Export for accounting software"). Accounting packages import a CSV, not a formatted .xlsx. Write a UTF-8 BOM, CRLF line endings, RFC 4180 quoting, ISO dates (`YYYY-MM-DD`), dot decimals with no currency symbol, and a filename that carries SAMPLE. Use .xlsx when people will read the file. Why both exist in client-portal: tested in real Excel on an en-ZA PC, a dot-decimal CSV opens as one column, with amounts as text (sum 0) and dates as `########`. So that demo offers the CSV for importing and an .xlsx for reading, built from the same rows.
- **Tall dialogs:** a native dialog taller than the screen scrolls to the focused button, which hides its title. In the demo's `app.css`, make `.demo-dialog__head` sticky at the top and `.demo-dialog__foot` sticky at the bottom (client-portal does this).
- **Long toasts:** `.demo-toast` is centred with `left: 50%`, so a long message gets squeezed to half the screen. Add `width: max-content` in the demo's `app.css` if its toasts are longer than a few words (client-portal does this).

## Adding a new demo
1. Copy `software/demo/example/` to `software/demo/<slug>/`.
2. In `index.html`: title, description, og tags and `og:url`, business name, nav items and views, WhatsApp text, back link `/software/#<slug>`.
3. Replace `data.js` with the new sample data (rules above).
4. Rewrite `app.js`: `render(state)`, event handlers through `Demo.store.update`, then `Demo.init`.
5. In `app.css` set `--demo-accent` (or delete the file and its `<link>` to keep the gold default). Check contrast.
6. Use at least one of the shared components for anything you need before writing new CSS. If you must add CSS, keep it in `app.css`, use existing tokens only, and stay in the 30 KB budget.
7. Run the definition of done below.
8. Link it from its Software card (section below) only when the demo is finished.

## Definition of done (every demo)
Run from the repo root. Replace `<slug>`.
```
D=software/demo/<slug>
grep -nE "localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest" $D/*.js $D/*.html software/demo/demo.js     # expect no output
grep -noE "https?://[^\"' )]+" $D/* | grep -vE "duranexsolutions\.com|wa\.me/27836095579"                                           # expect no output
grep -c 'name="robots" content="noindex, follow"' $D/index.html                                                                     # expect 1
grep -nE "<style|style=\"|<script>|/script\.js" $D/index.html                                                                       # expect no output
grep -oE '(href|src)="/[^"#?]*' $D/index.html | sed -E 's/(href|src)="//' | sort -u | while read p; do [ -e ".$p" ] || echo MISSING $p; done   # expect no output
wc -c $D/data.js $D/app.js $D/app.css $D/slots.js                                                                                # sum 30000 or less (slots.js only if the demo has one)
```
The only external URLs allowed are the site's own (`duranexsolutions.com`, in the og tags) and the WhatsApp number link.

By hand:
- [ ] Opens straight from `/software/demo/<slug>/` with no console errors.
- [ ] Head: noindex meta, proper title and description, og tags, font preload, no canonical, no `/script.js`.
- [ ] Tags balanced, ids unique, one h1, a label on every input.
- [ ] 360px: demo bar on one row, no sideways scroll, table stacks into cards, tabs at the bottom.
- [ ] 768px and 1280px: layout holds, sidebar appears from 1024px.
- [ ] Keyboard only: Tab through bar, nav, forms, dialogs; Enter and Space activate; Esc closes a dialog; focus comes back.
- [ ] Reset restores the seed, closes dialogs, goes to the first view and shows the toast.
- [ ] Rand shows `R 1 234,56` everywhere and dates `19 Nov 2026`.
- [ ] Reduced motion on (OS setting): no fades.
- [ ] Contrast of any override accent recorded in the demo's handoff note.
- [ ] Sample data fictional and marked as such; nothing implies a real client or stat.
- [ ] Message previews say "Preview only. Nothing was sent."
- [ ] Budgets met (above).

## Linking a finished demo from the Software page
Each concept card on `/software/` has an id equal to its demo slug (`client-portal`, `job-cards`, `bookings`, `dashboards`, `automations`), so `/software/#<slug>` lands on the card and the demo bar's "Back to Software" link goes there. The `.concept-demo-link` style is in `styles.css`. Linked so far: all five, `bookings`, `automations`, `dashboards`, `job-cards` and `client-portal`. Add it only when the demo is finished, as the last child of its card:
```html
<a class="concept-demo-link" href="/software/demo/<slug>/" data-demo-link="<slug>">Try the demo <span aria-hidden="true">↗</span></a>
```
Same tab. Never link `example`.

### Analytics event
- `script.js` has one delegated click listener on `[data-demo-link]`. It sends GA4 event **`demo_click`** with parameters `demo_name` (the data attribute value, i.e. the slug), `link_url` and `transport_type: "beacon"` (so a same-tab navigation does not cancel it).
- It sends only when consent is `"granted"` (localStorage `dx-analytics`) AND `window.gtag` is already a function. Otherwise it does nothing and queues nothing. The consent and GA loading code is untouched.
- The demo pages themselves load no GA and no consent banner, so interest is measured only by this click.
- Optional: register `demo_name` as a custom dimension in GA (Admin > Custom definitions > Create custom dimension, scope Event, parameter `demo_name`) to see it in reports.

### Indexing
- Demo pages carry `<meta name="robots" content="noindex, follow">`, and `netlify.toml` adds the header `X-Robots-Tag: noindex` for `/software/demo/*`.
- Demo URLs are not in `sitemap.xml` and not disallowed in `robots.txt`. Reason: the pages are thin sample-data screens, the Software page is the one that should rank, and crawlers must be able to fetch a page to see its noindex. No canonical link (it would contradict noindex). og/twitter tags stay so WhatsApp link previews work.
- `/docs/*` is already blocked with a 404 rule in `netlify.toml`.

### When a demo ships
1. Run the definition of done above.
2. Add the link snippet to the end of its card in `software/index.html`.
3. Confirm the slug in `data-demo-link` equals the folder name and the card id.
4. Confirm `/software/#<slug>` lands on the card, and the demo's back link points to it.
5. Confirm the demo is not in `sitemap.xml` and is not disallowed in `robots.txt`.
6. The reworded note and case-studies FAQ mention demos: do not merge to `main` before the first real demo is linked.
