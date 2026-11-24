# Sample designs – plan

Six concept websites for fictional South African businesses, a gallery to browse them and a viewer page to try them full-size. They are concept designs: not client work, not for sale as templates. Rules are in CLAUDE.md ("Sample designs").

## 0. Audit (2026-11-24, branch sample-designs)

**Structure.** Static site, `publish = "."`. Pages are folders with an index.html: `/`, `/websites/`, `/software/`, `/work/`, `/about/`, `/contact/`, `/terms/`, `/privacy/`, `/404.html`. Six software demos live in `/software/demo/<slug>/` on their own kit (`demo.css`, `demo.js`, rules in docs/DEMOS.md). Assets: `/assets/fonts` (10 woff2 + OFL texts), `/assets/images`, `/assets/logos`.

**Nav.** The header is copied into every page by hand: logo, Websites, Software, Work, About, plus a "Get a free quote" button. Below the desktop breakpoint it becomes a Menu toggle, with a `<noscript>` style fallback. The footer nav repeats those links plus Contact. There's also a floating Call/WhatsApp pill. The gallery is linked from the footer, not the header (§4).

**Shared CSS/JS.** `styles.css` (about 2,670 lines) holds all main-site styles. `script.js` (about 420 lines) runs the menu, the year, the consent banner, GA4 (loaded only after consent) and `data-track` events (form_submit, whatsapp_click, call_click, email_click, demo_click). Demo pages load neither file. Samples follow that pattern: they load no `/styles.css`, no `/script.js` and no GA.

**@font-face.** 10 rules at the top of `styles.css`. DM Mono has 4 (400 and 500, each in latin and latin-ext). Manrope has 6 (400–800 variable: cyrillic-ext, cyrillic, greek, vietnamese, latin-ext, latin). Every page preloads the latin Manrope file. All 10 stay as they are. Samples ship their own fonts in their own folders.

**netlify.toml.**
- Sitewide (`/*`) security headers: nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP, HSTS.
- The CSP is `default-src 'self'` and allows no inline script or style. The one exception is the noscript style hash. Fonts and images come only from self, apart from GA hosts. `frame-ancestors 'none'`.
- Caching: fonts are cached for 1 year (immutable), images and logos for 30 days, and CSS/JS must revalidate.
- `/software/demo/*` gets `X-Robots-Tag: noindex`.
- Redirects: old domains, www, and index.html to /. AUDIT.md, PLAN.md, CLAUDE.md and /docs/* return 404.
- **Blocker:** `X-Frame-Options: DENY` and `frame-ancestors 'none'` stop the viewer iframe from working, even on our own domain (fix in §5).

**Sitemap / robots.** The sitemap has the 8 main pages. robots.txt allows everything. Demos are kept out of the sitemap but not disallowed, so crawlers can still read the noindex. Samples follow the same pattern.

**404.** `noindex, follow`, uses the main header and footer, and has Home and WhatsApp buttons. Small oddity: it has a canonical link, which contradicts the noindex (harmless, left for later). Bad sample URLs land here, which is fine.

## 1. File structure

    /designs/index.html                  Gallery (main-site page, indexable, in sitemap)
    /designs/view/index.html             Viewer: ?s=<slug> (noindex)
    /designs/credits/index.html          Photo + font credits, one section per sample (noindex)
    /designs/designs.css                 Gallery + viewer styles (Duranex brand, loaded after /styles.css)
    /designs/designs.js                  Filters, hover/tap scroll, viewer logic
    /assets/images/designs/<slug>-full.webp   Full-length desktop screenshot (taken at 1280, saved 640 wide, ≤5000px tall, q75)
    /scripts/screenshots.mjs             Local-only screenshot script (npx Playwright); /scripts/* is a 404 on Netlify
    /samples/<slug>/index.html           Sample home
    /samples/<slug>/<inner>/index.html   1–2 inner pages
    /samples/<slug>/assets/site.css      Sample's own CSS (nothing shared)
    /samples/<slug>/assets/site.js       Sample's own JS (signature interaction, menu)
    /samples/<slug>/assets/fonts/*.woff2 Self-hosted, latin subset, plus OFL.txt
    /samples/<slug>/assets/img/*.webp    Downloaded from Unsplash/Pexels, resized, ≤150 KB each
    docs/SAMPLES.md                      Build rules + definition of done (like DEMOS.md)

Every sample page has:
- `<meta name="robots" content="noindex">` and no canonical link.
- og tags, so WhatsApp previews work.
- A skip link and one h1.
- No inline script, `<style>` or `style=""` (blocked by the CSP).
- A footer note: "Concept design by Duranex · fictional business · photo credits". The note links to `/designs/` and `/designs/credits/#<slug>`.
- Fake contact details: 000 000 0000, hello@example.co.za, "123 Example Street".
- Forms that `preventDefault` and show "This is a demo – nothing is sent".
- No animation under `prefers-reduced-motion: reduce`.
- Mobile-first CSS, checked at 360, 768 and 1280.
- No third-party requests: no Google Maps, embeds or CDNs. Maps are SVG.

## 2. Design briefs

**Names (approved by Luan, on condition they aren't real).** In phase 2, search each name on Google, Google Maps, Facebook and the CIPC name search. On any SA hit (or a close match in the same industry), rename it and note the change in the handoff.

**Prices.** Fictional, but realistic mid-range Gauteng/Western Cape rates rounded to the nearest R50, always shown as "from R…". Each sample's footer note already says "fictional business".

**Stock photo safety (keeps Duranex out of trouble):**
- Only Unsplash or Pexels: both allow free commercial use without permission. For each photo, record its page URL, photographer and the download date in the credits.
- Model photos are allowed only from the photographer's own upload, never used as staff or clients. Captions say "Stock photo", and nothing is placed next to them that reads like a quote or review.
- No visible brand logos or badges (cars, products, tools), no real company uniforms (police, security firms), no recognisable private homes or number plates (blur or crop them).
- Nothing edited to look like a real person endorses the business.

### 2.1 Trades – Ironbark Plumbing & Geysers, Kempton Park (`ironbark-plumbing`)
- **Mood:** practical, no-nonsense, workshop-honest.
- **Layout ("work order"):** the home page reads like a printed job card. A sticky left column holds rubber-stamp-style fields (Area, Hours, Callout, Call now). The main column is a numbered ledger of services, one ruled row each: number, service, what's included, price-from. Each row opens inline to show detail. No hero image: the first screen is the job-card header with the business name stamped across it.
- **Fonts:** Archivo (variable width; Expanded weight for headings) + IBM Plex Mono for the ledger fields.
- **Palette:** paper #F4F1EA, ink #1C1F22, safety orange #F26A1B, pipe blue #2B5D8A, concrete #D9D6CF.
- **Images:** Unsplash/Pexels close-ups of copper pipe, tools and geysers, no faces. Shown in small "photo stapled to the job card" frames, slightly rotated, with a CSS paper clip.
- **Signature: "What's wrong?" triage.** Three taps (where: kitchen/bathroom/geyser; what: leak/no hot water/blocked; how bad: dripping/flooding) give the likely cause and a "do this now" step (for example, close the stopcock). They also build a pre-filled message to the fake number.
- **Inner page:** `/geysers/` (geyser repair and replacement, with a price-from table).

### 2.2 Food – Suurdeeg Bakehouse, Philippolis (`suurdeeg-bakehouse`) (was Parys, moved in phase 4)
- **Mood:** warm, early-morning, flour on the counter.
- **Layout ("the baker's day"):** the home page is a vertical timeline with the hours as its spine, from 04:30 (ovens on) to 14:00 (sold out). Each hour is a stop showing what comes out of the oven then, with the photo and text swapping sides. The page footer is the "closed, see you tomorrow" stop.
- **Fonts:** Fraunces (soft, wonky optical serif) + Karla.
- **Palette:** flour #FBF6EE, crust #8A4B22, rye #3B2A20, butter #F2C46D, sage #8FA58A.
- **Images:** Unsplash/Pexels bread, crumb, flour and hands kneading (no faces), in torn-paper `clip-path` crops with warm light.
- **Signature: "Out of the oven now" bake clock.** It reads the visitor's time in SAST, highlights the current stop on the timeline, and counts down to the next bake ("Cinnamon buns in 25 min"). Outside opening hours it shows tomorrow's first bake. With reduced motion it does the same with no animation.
- **Inner pages:** `/menu/` (a chalkboard-style price list in Rand, grouped by bread, pastries and coffee) and `/pre-order/` (a Saturday pre-order demo form).

### 2.3 Professional – Lindela Ledger & Tax, Hatfield, Pretoria (`lindela-ledger`)
- **Mood:** calm, precise, quietly expensive. Text-first and editorial.
- **Layout ("broadsheet"):** a strict 12-column Swiss grid. Large serif section numerals (01, 02 …) run down the left margin, body text sits in a narrow measure, and footnote-style sidenotes sit in the right margin (inline on mobile). There are no photos on the home page: typography and thin rules do the work.
- **Fonts:** Newsreader (headings, with optical sizes) + Public Sans (UI and small text).
- **Palette:** paper #F7F5F0, ledger green #1F3D2B, graphite #2E2E2E, brass #B08D57, red-ink #A4343A (footnote markers only).
- **Images:** a single black-and-white Unsplash still life (desk, paper, pen) on the inner page only.
- **Signature: "What do I bring?" checklist builder.** Pick a situation (salaried, salaried with side income, sole proprietor, small company). It builds a document checklist (IRP5, bank statements, medical aid certificate, RA certificate, invoices…) with tick boxes and a print button. The output is labelled "General guide, not tax advice". The document list must be checked against SARS guidance during the build.
- **Inner pages:** `/services/` (bookkeeping, tax, payroll, with fixed monthly fees in Rand) and `/checklist/` (the builder, full size).

### 2.4 Beauty – Fynbos & Fringe Hair Studio, Durbanville (`fynbos-fringe`) (was Fern & Fringe, renamed in phase 6)
- **Mood:** soft, playful luxury, like a fashion magazine.
- **Layout ("lookbook"):** the home page is a horizontal scroll-snap strip of full-height "looks" with giant didone type laid over each panel. Swipe on mobile; on desktop, arrow buttons and the keyboard work. There's a panel counter (03 / 07). Under reduced motion it becomes a vertical stack.
- **Fonts:** Bodoni Moda + Jost.
- **Palette:** cream #FFF8F3, blush #F3D9D2, plum #4A1F3D, rose gold #C98B6B, near-black #111111.
- **Images:** Unsplash/Pexels hair-detail shots, products, tools and model photos, following the stock photo safety rules in §2.
- **Signature: shade explorer.** Tap colour swatches (copper, honey blonde, ash, burgundy…) to recolour an SVG hair illustration live (CSS custom property on the fill), with the matching service and price-from shown.
- **Inner pages:** `/services/` (price menu by hair length) and `/book/` (a booking-request demo form).

### 2.5 Auto – Torque Bay Detailing, Midrand (`torque-bay`)
- **Mood:** showroom clean, precise, a bit of motorsport.
- **Layout ("spec sheet, split screen"):** on desktop, the left half is fixed and holds a large SVG line drawing of a car. The right half scrolls through packages set out as a car spec sheet (tabular rows: stage, time, what's done, price). On mobile the car shrinks into a sticky strip at the top.
- **Fonts:** Anybody (variable width; wide for headings) + Barlow.
- **Palette:** showroom white #F5F5F2, carbon #111111, gunmetal #2A2D33, chrome #A7ADB4, racing red #D7263D.
- **Images:** mostly SVG. Two or three Unsplash/Pexels close-ups (paint beading, polisher, wheel) in sharp rectangular crops with a thin red rule.
- **Signature: car zone configurator.** Pick a car size (hatch, sedan, SUV/bakkie) and toggle zones (exterior, interior, wheels, engine bay, headlights). Each zone lights up on the SVG car, and the quote and time update. "Request this quote" opens a demo form.
- **Inner page:** `/packages/` (the full package comparison).

### 2.6 Security – Ridgeline Armed Response, Centurion (`ridgeline-security`)
- **Mood:** alert, authoritative, night-time control room.
- **Layout ("map console"):** the first screen is a full-bleed SVG map of fictional suburbs and response zones. Content panels dock around it: services, how a callout works, contact. On mobile they stack under the map as a bottom sheet. This is a dark UI with a fine grid.
- **Fonts:** Saira Condensed (headings) + Red Hat Text.
- **Palette:** night #0B0F14, panel #151C24, steel #5C6B7A, signal amber #FFB703, in-zone green #2FBF71.
- **Images:** mostly SVG. One or two Unsplash/Pexels night shots (CCTV camera, gate, perimeter light), desaturated with an amber tint.
- **Signature: coverage checker.** Pick a suburb from a list or tap the map. The zone glows and reads "In our response zone" or "Outside our area – ask us". The map is a fictional illustration and is labelled as one, with no live-looking stats or incident feed.
- **Inner pages:** `/services/` (armed response, CCTV, guarding, monthly from R…) and `/coverage/` (the map, full size).

## 3. Comparison table

| Sample | Layout structure | First screen | Fonts | Palette (key) | Signature |
|---|---|---|---|---|---|
| Ironbark (trades) | Sticky stamp sidebar + numbered ledger rows | Job-card header, no photo | Archivo + IBM Plex Mono | paper, ink, safety orange, pipe blue | Symptom triage → pre-filled message |
| Suurdeeg (food) | Vertical hour-by-hour timeline, alternating | 04:30 "ovens on" stop | Fraunces + Karla | flour, crust, rye, butter, sage | Live bake clock (SAST) |
| Lindela (professional) | 12-col broadsheet, margin numerals + sidenotes | Typography only | Newsreader + Public Sans | paper, ledger green, brass, red ink | Document checklist builder + print |
| Fynbos & Fringe (beauty) | Horizontal scroll-snap lookbook panels | Full-height look #01 | Bodoni Moda + Jost | cream, blush, plum, rose gold | Shade explorer recolours SVG |
| Torque Bay (auto) | Split screen: fixed SVG car, scrolling spec sheet | Car drawing + spec header | Anybody + Barlow | showroom white, carbon, racing red | Zone configurator lights SVG car |
| Ridgeline (security) | Full-bleed map with docked panels | Interactive zone map | Saira Condensed + Red Hat Text | night, panel, amber, green | Coverage checker on SVG map |

Checks:
- No layout repeats.
- No font family is used twice, and none is Manrope or DM Mono.
- No palette shares its main accent.
- No signature repeats.
- None uses the banned patterns: hero + 3 cards + testimonials + CTA, a centred stock-photo hero, or gradient blobs.
- Two samples are dark-leaning (Ridgeline fully dark; Torque Bay's carbon type on white), but their structure and accents differ.

## 4. Gallery and viewer spec

**Where it lives.** The gallery is at `/designs/`.

**Not in the top nav (Luan, 2026-11-24: "nav stays simple").** The header keeps Websites, Software, Work, About + quote button. On `/designs/` the header marks **Work** as current, and the BreadcrumbList JSON-LD is Home › Work › Sample designs (no page on the site has a visible breadcrumb).

It's linked from:
- `/websites/`: a "See the sample designs →" text link between the plan cards and the plan notes.
- `/work/`: a "Sample designs" section after the two live sites and before the CTA, clearly labelled as concept designs, not client work, with 3 thumbnails and a "See all sample designs" button.
- The footer nav: "Designs" (after Work) on every main page.
- The sitemap.

**Gallery page** (main-site header, footer and styles, plus `designs.css`; loads `/script.js` like any main page):
- **Header copy:** "Sample designs. Six concept sites for made-up businesses, each built from scratch to show what a custom-coded site can look like. They're not templates and not for sale; yours would be designed around your business."
- **No filters:** with six cards a filter bar and "Showing x of 6" added clutter, so they were removed (Luan, 2026-11-24).
- **Cards:** industry tag, fictional name + town, one-line concept, signature named, a "View design ↗" button (stretched link to `/designs/view/?s=<slug>`), and a small "Open on its own" link to `/samples/<slug>/`.
- **Screenshot:** sits in a fixed 16:10 frame at all widths (so phone cards aren't too tall). An `<img>` holds the WebP (no JPG fallback: every browser we target reads WebP), with width/height, `loading="lazy"`, and alt text ("Full-page preview of the Ironbark Plumbing concept design").
- **Slow scroll:** on hover or `:focus-within`, `object-position` moves from top to bottom over about 10s (linear) and comes back quickly on leave. On touch (`hover: none`) a small "▶ Preview" button on the frame toggles `.is-scrolling`, so a tap doesn't follow the link by accident. Under reduced motion there's no scrolling: the button is hidden and the top of the page shows.
- **Analytics:** `data-track="sample_view"` on the View links. `script.js` gains one handler, the same consent-gated pattern as `demo_click`.

**Viewer page** `/designs/view/?s=<slug>`:
- `designs.js` checks the slug against a whitelist of 6. An unknown slug shows a "Design not found" message with a link back.
- The page holds an iframe (`title="<Name> concept design"`) to `/samples/<slug>/`, filling the viewport below the bar.
- No `/script.js` (no consent banner over the iframe, the same as the demos) and noindex.
- `<noscript>`: a plain list of links to the six samples.
- **Thin sticky bar** (48px, Duranex navy, gold/cyan accents, one row at 360px):
  - **Left:** "← All designs" back to `/designs/`.
  - **Centre:** "Concept design by Duranex – want one like this?" Under 480px this shortens to "Want one like this?".
  - **Right:** a WhatsApp button and a phone/desktop toggle. The WhatsApp message, pre-filled and URL-encoded in `wa.me/27836095579?text=…`: "Hi Luan, I saw the <Name> sample design and I'm interested in a website like this for my business. Can you tell me more?"
  - **Toggle:** two `aria-pressed` buttons. Phone puts a 390px-wide framed iframe in the centre; desktop is full width. The toggle is hidden under 768px, where the iframe is always full width.

**Credits page** `/designs/credits/`: one section per sample (`#<slug>`). For each image it lists the photographer, source and URL, with Unsplash/Pexels licence links. It also lists the fonts with their OFL links. noindex.

## 5. netlify.toml changes (phase 2)

1. **Framing.** Netlify applies every header rule that matches a path. A `/samples/*` rule can't loosen the sitewide `DENY` / `frame-ancestors 'none'`: the values combine, and the strictest still wins. So change the sitewide `/*` block:
   - `X-Frame-Options = "SAMEORIGIN"`
   - In the CSP, `frame-ancestors 'self'` instead of `'none'`.
   Other sites still can't frame us (the clickjacking protection stays). Only our own pages can frame our pages. Verify with `curl -I` on the deploy preview.
2. **CSP.** Otherwise unchanged. `frame-src` falls back to `default-src 'self'`, so the viewer iframe is allowed. Samples need only self-hosted CSS, JS, fonts and images, which the current policy already allows. Rules to keep it that way: no inline styles or scripts, no external hosts, and forms with no external action.
3. **Noindex headers:**
       [[headers]]
         for = "/samples/*"
         [headers.values]
           X-Robots-Tag = "noindex"
       [[headers]]
         for = "/designs/view/*"
         [headers.values]
           X-Robots-Tag = "noindex"
       [[headers]]
         for = "/designs/credits/*"
         [headers.values]
           X-Robots-Tag = "noindex"
4. **Sitemap:** add `/designs/` only. robots.txt is unchanged.

## 6. Phase checklist

- [x] **Phase 1** – Audit + this plan
- [x] **Phase 2** – Groundwork (gallery shell, viewer, nav link, netlify.toml, sitemap; `docs/SAMPLES.md` written in phase 10)
  - netlify.toml changes (§5).
  - `docs/SAMPLES.md` (page template, rules, definition of done).
  - Business-name checks (web searches done per sample; Google Maps/CIPC by hand still Luan's, see phase 10 part 3).
  - Folder skeleton.
  - Font download + subsetting method.
  - Image download/optimise method and the credits format.
- [x] **Phase 3** – Ironbark Plumbing (home + /geysers/), plus a first version of `/designs/credits/`
- [x] **Phase 4** – Suurdeeg Bakehouse (home + /menu/ + /pre-order/)
- [x] **Phase 5** – Lindela Ledger & Tax (home + /services/ + /checklist/)
- [x] **Phase 6** – Fynbos & Fringe (home + /services/ + /book/)
- [x] **Phase 7** – Torque Bay Detailing (home + /packages/)
- [x] **Phase 8** – Ridgeline Armed Response (home + /services/ + /coverage/)
- [x] **Phase 9** – Screenshots (full-length WebP), gallery `/designs/` cards, viewer, credits page
- [x] **Phase 10** – Links (Websites, Work, footer on every main page), `sample_view` event, full automated QA (2026-11-24). Left for Luan: phone test, `git push`, `curl -I` header checks on the deploy preview (see the phase 10, part 2 handoff).

Each sample phase covers: brief → build → its own definition-of-done checks (docs/SAMPLES.md) → credits entry → commit. One sample per phase keeps every commit reviewable.

## 7. Handoff

**Phase 1 (2026-11-24):**
- Audit done; plan written.
- Nothing built, no config changed.
- Key finding: the sitewide `X-Frame-Options: DENY` and `frame-ancestors 'none'` must become SAMEORIGIN / 'self' before the viewer can work (§5.1).
- All 7 questions answered (§8).
- Next: Phase 2.

**Phase 2 (2026-11-24), scope set by Luan: gallery + viewer + nav + netlify.toml:**
- Done: `/designs/` gallery (filters, 6 placeholder cards, aria-live count, no-JS fallback, touch "Preview" button), `/designs/view/?s=<slug>` viewer (48px sticky bar, back link, WhatsApp link, phone/desktop toggle, slug whitelist, unknown/empty/`__proto__` slugs show "Design not found", noscript list of 6 links), `designs/designs.css`, `designs/designs.js`.
- Nav: "Designs" link added between Work and About in the header of all 9 main pages. Footer links still phase 10.
- netlify.toml: sitewide `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'`, noindex headers for `/samples/*`, `/designs/view/*`, `/designs/credits/*`. Sitemap: `/designs/` added. Gallery stays indexable.
- Checked locally with Playwright: 6 cards, filter + count, 360/1024/1280 no horizontal scroll, header on one row at 1024 and 1280, mobile menu bottom at 454px of 640 (fits), viewer toggle phone 390px / desktop full width and hidden under 768px. No console errors except 404s from the viewer iframe, because the `/samples/<slug>/` pages don't exist yet.
- **[PLACEHOLDER] WhatsApp number:** the viewer uses `27XXXXXXXXX` (one constant, `WHATSAPP_NUMBER` in designs.js) as Luan asked. Replace it before launch; the site's real number is 27836095579.
- Not done yet (still in phase 2 list): `docs/SAMPLES.md`, business-name checks, folder skeleton, font/image methods, credits page. `curl -I` header check needs a Netlify deploy preview (headers don't apply locally).
- Cards show CSS placeholder previews ("Preview coming soon"); real screenshots arrive in phase 9. The scroll-on-hover CSS for the `<img>` is already in place.
- Header test (§4): 5 links + button fit on one row at 1024 and 1280, menu fits 360×640, so the nav link stays. Gap not measured against the old spacing; eyeball it on the preview.
- Next: finish the groundwork items above, then phase 3.

**Phase 3 (2026-11-24), Ironbark Plumbing & Geysers:**
- Built `/samples/ironbark-plumbing/` (home) and `/geysers/`, with their own `assets/site.css`, `assets/site.js`, `assets/icon.svg`, fonts and images. Nothing shared with the main site.
- Layout per brief: a job card with a punched-hole edge and a sticky stamp column (Area, Hours, Callout, Call now). On mobile it becomes a 2×2 stamp grid above the card. The first screen is the job-card header with the name stamped across it, and there's no photo. The services ledger has 8 numbered rows using `<details>` (open inline, works without JS). Then come 02 "What's wrong?", 03 How a job runs, and 04 Book a plumber (demo form).
- Signature: the triage is 3 radio rows (where / what / how bad). It gives an urgency stamp, a "do this now" step, the likely cause and a pre-filled message to the demo number. The buttons are Send (shows the demo notice), Copy and "Put in booking form". No network calls.
- /geysers/: a numbered SVG cutaway of a geyser (6 parts), price-from tables for repairs and replacement, warning signs, and "geyser burst? do this first".
- Fonts: Archivo variable (wdth 62–125, wght 100–900) + IBM Plex Mono 400/500/600, latin woff2 from Google Fonts, plus OFL texts. Palette as briefed. A darker orange (#b9480a) is used for small text so it has enough contrast on the paper.
- Images: 4 Unsplash photos (copper pipes, sink drain, wrenches, copper pipe end), 560–720px WebP, 3–25 KB each, with width/height set, all lazy and below the fold, in the "stapled" frames with a CSS paper clip. No faces. The wrench photo has tiny old embossing that can't be read at display size. There's no geyser photo (the stock ones had brand labels), so the geyser is SVG.
- Credits: `/designs/credits/index.html` created early (main-site shell, `noindex, follow`, no canonical), with the Ironbark section (`#ironbark-plumbing`). Phase 9 adds the other samples to it.
- Name check: a web search for "Ironbark Plumbing" South Africa found no SA business (only an Australian suburb). Name kept. Google Maps/CIPC not checked by hand.
- Prices (fictional, from R…): callout R550, after hours R950, taps R450, leaks R650, drains R750, geyser repair R850, CoC R1 650, rough-ins R4 500, geysers R8 450 / R9 450 / R10 950 (100/150/200 L), heat pump R24 500.
- Checked with Playwright behind a copy of the production CSP: 320/360/768/1000/1280 have no horizontal scroll (all ledger rows open). No console errors, CSP violations or 404s. Fonts load. The triage and form show the demo text. Under reduced motion the animation is `none`. Without JS the ledger still opens. No inline styles or scripts.
- Compared against other samples: none are built yet, so there was nothing to compare. The main-site look (navy/gold, Manrope) isn't reused.
- Next: phase 4 (Suurdeeg). Still open from phase 2: `docs/SAMPLES.md`.

**Phase 4 (2026-11-24), Suurdeeg Bakehouse:**
- **Town changed: Parys → Philippolis.** A web search for "Suurdeeg" found no SA business, but Parys already has a real, family-run "Artisan Sourdough Bakery & Café" (Suurdeeg is Afrikaans for sourdough), which counts as a close match in the same industry. The name stays; the town moved to Philippolis, where a search found no sourdough bakery. The gallery card in `/designs/` now says Philippolis. Google Maps/CIPC not checked by hand.
- Built `/samples/suurdeeg-bakehouse/` (home), `/menu/` and `/pre-order/`, with their own `assets/site.css`, `assets/site.js`, `assets/icon.svg`, fonts and images. Nothing shared with the main site or with Ironbark.
- Layout per brief: the home page is the baker's day on an hour spine. Phones have the spine on the left; from 900px it sits in the centre and the photo and text swap sides at each stop. The first screen is the 04:30 "Ovens on" stop, which holds the h1. The page starts dark (rye) before sunrise, passes a 06:00 "first light" band and turns flour-pale. The stops are 04:30, 05:30, 06:30, 07:00 (doors open, text only), 07:30, 09:00, 10:30, 12:00 and 13:00 (tomorrow's dough). The footer is the dark 14:00 "Closed. See you tomorrow." stop, with the address, hours and the concept note.
- Signature: a sticky bake clock with an SVG dial whose hands show SAST (always UTC+2, no DST maths). It highlights the current stop (`aria-current="time"`, butter-filled badge, "Out of the oven now" tag), marks the next bake with a dashed badge and counts down to it ("Cinnamon buns in 20 min"). It also has a "Jump to now" link. Before 04:30 it shows today's first bake. After 14:00 it shows tomorrow's first bake, or Tuesday's when tomorrow is Monday (closed). On Mondays it says closed and shows Tuesday's first bake. It refreshes every 20 s and only announces through `aria-live` when the stop changes. A "Try another time" slider pretends it's a Saturday, so people viewing at night can see it work. Under reduced motion it shows the same with no pulse and no smooth scroll. Without JS it shows static hours.
- /menu/: a chalkboard in a crust-wood frame (Bread, Pastries, Coffee & tea), with dotted leaders, chalk SVG doodles and the hour each item comes out. There's also an honest allergy note.
- /pre-order/: a Saturday pre-order demo form with quantity fields, a live "Your bag" total, collection slots and details. The next Saturday and the Thursday 17:00 cutoff are worked out in SAST. Submitting shows "This is a demo – nothing is sent" (with an "add an item first" message if the bag is empty).
- **Prices deviate from the R50 rule (Luan to confirm):** bakery items rounded to R50 would look fake (a R50 croissant), so they're rounded to R5 and shown as plain menu prices, not "from R…". Loaves R85–R105, croissant R32, cinnamon bun R38, flat white R38, whole melktert R260.
- Fonts: Fraunces roman variable (opsz, wght 300–800, SOFT, WONK; 121 KB), Fraunces italic (opsz, wght 400–600; 82 KB) and Karla variable (300–700; 32 KB), all latin woff2 from Google Fonts, plus OFL texts. Headings use SOFT 100 and WONK 1. Small sage text uses a darker sage (#566b52) for contrast.
- Images: 9 Unsplash photos (flour dusting, scored loaf, rye, croissants, cinnamon buns, sliced loaf, flatbreads, shaping dough, dough resting), 560–800px WebP, 14–93 KB, with width/height set. The first one has `fetchpriority="high"`; the rest are lazy (the pre-order photo is above the fold, so it isn't lazy). No faces (hands and arms only) and no logos. All were checked as "Free to use under the Unsplash License". I skipped one kneading photo that sat under Unsplash's unexplained `/flagged/` path. Credits are added to `/designs/credits/#suurdeeg-bakehouse`.
- Checked with Playwright behind the production CSP: 320/360/768/1280 have no horizontal scroll on all 3 pages. No console errors, CSP violations or 404s. All 3 font files load, and all 8 home images load with the right proportions. The clock was tested at 8 fixed SAST times (Sat 03:10/05:00/08:40/12:30/15:00, Sun 15:00, Mon 10:00, Tue 06:45), plus a 20-minute tick (09:00 changeover announced), the preview slider and "back to real time". The Saturday/cutoff dates were checked for Wed, Thu after 17:00, Fri, Sat and Sun. Basket maths and clamping work. No inline styles or scripts.
- Compared with Ironbark: the structure differs (centred alternating timeline vs sticky stamp sidebar + ledger), and so do the first screen (dark photo + serif name vs paper job card), the image treatment (torn paper vs stapled photos), fonts, palette and signature (live clock vs triage). The only shared idea is a price row with the price on the right, which is normal for any menu. No change needed.
- Next: phase 5 (Lindela). Still open from phase 2: `docs/SAMPLES.md`.

**Phase 5 (2026-11-24), Lindela Ledger & Tax:**
- Name check: web searches for "Lindela Ledger" and Lindela accounting/tax in Hatfield/Pretoria found no SA business. Name and town kept. Google Maps/CIPC not checked by hand.
- Built `/samples/lindela-ledger/` (home), `/services/` and `/checklist/`, with their own `assets/site.css`, `assets/site.js`, `assets/icon.svg`, fonts and one image. Nothing shared with the main site or other samples.
- Layout per brief: a broadsheet nameplate (dateline row, large Newsreader name, nav between a double and a single rule). From 900px it's a 12-column grid: large brass serif numerals (01–06) in columns 1–2, text in a narrow measure, and sidenotes in the right margin (columns 10–12) tied to red-ink footnote markers. Below 900px the notes sit inline with a brass left rule. The home page has no photos, only type and thin rules: drop cap, the three services as a ruled ledger with fees, the year as roman-numbered steps, a SARS dates table, Q&A, and a demo contact form.
- Signature: the "What do I bring?" checklist builder. Pick one of 4 situations (salaried / salaried with side income / sole proprietor / small company), then tick extras (medical, RA, travel, interest, tax-free savings, rental, sold assets, donations; for companies: staff, VAT, loans). It builds a grouped list (About you, Money in, Money out, SARS and payroll) with tick boxes, a "3 of 13 found so far" count (aria-live), Clear and Print. The print stylesheet prints only the slip, with the situation and a "fictional business" line. It's labelled "General guide, not tax advice". The home page has a compact version (situation only) that links to `/checklist/?for=<situation>`. The full page keeps the choice in the URL (`?for=…&with=…`). No storage, no network. Without JS the pickers hide and the whole list shows.
- **SARS check:** the list follows SARS's *Comprehensive Guide to the ITR12* (IT-AE-36-G05, revision 40, effective 29 June 2026), section 3.4 "Documentation required". That covers IRP5/IT3(a) (incl. pension/provident/RA funds), interest and foreign dividend certificates (spouse's too if married in community of property), the medical scheme certificate, out-of-pocket medical proof, ITR-DD, logbook, RA certificate, tax-free investment certificate, section 18A certificate, capital gains proof (IT3(c), base cost), rental documents and financial statements for trading. It also has the "keep supporting documents for five years from the date of submission" rule. The logbook details come from SARS's travel e-logbook page. The company items (CIPC docs, AFS + ITR14, EMP201/EMP501, VAT201, loan accounts) are what a bookkeeper would ask for, not a SARS list; the copy presents them as "what we need", not as SARS rules. The SARS dates table (EMP201 by the 7th, VAT 25th/last business day on eFiling, EMP501 31 May/31 Oct, IRP6 31 Aug/end Feb, filing season Jul–Oct) is general and has a sidenote that dates move.
- /services/: fixed-fee tables for bookkeeping, tax and payroll (stacked on phones), what the fee doesn't cover, and the one B&W photo in the margin, captioned "Stock photo". No credential claims (no SAIPA/SAICA/registered-practitioner wording) and no staff names.
- Prices (fictional, R50-rounded, "from R…"): bookkeeping R1 250 / R2 450 per month, extra 100 transactions R400, clean-up R1 500; personal return R1 450 / R2 450, provisional R450 per month, company R1 150 per month, VAT R650 per month, catch-up R1 450 per year; payroll R650 / R1 250 per month, domestic worker R200 per month.
- Fonts: Newsreader roman variable (opsz 6–72, wght 200–800; 132 KB), Newsreader italic (147 KB) and Public Sans variable (100–900; 27 KB), all latin woff2 from Google Fonts, plus OFL texts. Small brass text uses a darker brass (#765a2c) for contrast; red ink is only on footnote markers, the "not tax advice" label and the demo form notice.
- Image: 1 Unsplash photo (Barney Goodman, desk lamp over a notebook and pen, already B&W), cropped to remove a computer screen on the left, 640×834 WebP, 8 KB, lazy, with width/height set. The handwriting on the page isn't legible at display size. Credits added to `/designs/credits/#lindela-ledger`.
- Checked with Playwright behind the production CSP: 320/360/768/1280 have no horizontal scroll on all 3 pages. No console errors, CSP violations or 404s. All 3 font files load, and the photo loads. Builder: all 4 situations (3/7/6/4 items on home), the `?for=company&with=vat,staff` preload (8 items, 4 groups), all extras (13 items), ticks, count, reset, print preview, URL update. The demo form shows "This is a demo – nothing is sent". Under reduced motion scroll-behavior is auto (the only motion is smooth scroll). Without JS the pickers hide and all items show. No inline styles or scripts.
- Compared with Ironbark and Suurdeeg: the structure differs (margin numerals + sidenotes on a Swiss grid vs a sticky stamp sidebar + expanding ledger vs a centred hour timeline). So do the first screen (typographic nameplate + h1, no image), the image use (one photo on an inner page only), the fonts, the palette and the signature (document builder + print). Ironbark also has numbered sections and a "How a job runs" heading, so the Lindela one was renamed "A year on our books". Price rows exist in all three, which is normal.
- Next: phase 6 (Fern & Fringe). Still open from phase 2: `docs/SAMPLES.md`.

**Phase 6 (2026-11-24), Fynbos & Fringe Hair Studio:**
- **Renamed from Fern & Fringe → Fynbos & Fringe, slug `fern-fringe` → `fynbos-fringe`.** A web search found no SA business with the old name, but it found real US hair salons called "Fern & Fringe Beauty" and "Fringe & Fern Hair Studio", which is an exact match in the same industry. "Fynbos & Fringe" turned up no business at all and suits Durbanville. The slug and name are updated in the gallery card, the `designs.js` whitelist, the viewer's noscript list and the `designs.css` placeholder class. Google Maps/CIPC not checked by hand.
- Built `/samples/fynbos-fringe/` (home), `/services/` and `/book/`, with their own `assets/site.css`, `assets/site.js`, `assets/icon.svg`, fonts and images. Nothing shared with the main site or other samples.
- Layout per brief: the home page is a horizontal scroll-snap strip of 7 full-height looks (cover, Copper, The cut, Bounce, Waves, Your shade, Book a chair). It sits under a 56px bar, with a 56px control bar below showing the "03 / 07" counter, a progress line and ←/→ buttons. Phones: a full-bleed photo with a plum gradient and giant Bodoni type laid over it; swipe to move. From 900px: an arched photo frame on alternating sides and giant type in the other half. Keyboard: ←/→ anywhere on the page, Home/End when the strip has focus. A vertical mouse wheel turns one look at a time while the strip fills the screen, then lets the page scroll on to the footer after look 7. Look changes are announced through aria-live. Under reduced motion the strip becomes a vertical stack with no controls and no transitions. Without JS the strip still swipes and scrolls sideways and the controls stay hidden.
- Signature: the shade explorer (look 06). Six swatches (copper, honey blonde, ash blonde, rose gold, burgundy, chocolate) are radio buttons. CSS `:has()` sets `--shade/--shade-hi/--shade-lo` on the explorer, and the SVG hair (our own drawing of long wavy hair from behind, with a rose-gold clip) fills from them, with a 0.6 s fade. The matching service and price-from text swaps too. All of that is pure CSS, so it works without JS. JS adds an aria-live line and points the button to `/book/?shade=<shade>` ("Book burgundy"). The book page then preselects the service and shows "Shade you liked". It's labelled "An illustration, not a promise" with the free patch-test note.
- /services/: a price table by hair length (Short / Medium / Long / Extra long), grouped as cuts, colour, styling and treatments, with a length guide (4 small SVG figures). A length picker (`aria-pressed`) highlights the column on desktop; on phones it shows only the chosen column. Without JS all 4 columns show and the table scrolls sideways. Then come "from" notes and the small print (patch test, R200 colour deposit, 24-hour changes, card/EFT).
- /book/: a booking-request demo form in three cards (service + length chips with a live "from R…" estimate; preferred day with min = today in SAST and a warning for Sundays/Mondays, time of day; name, WhatsApp, notes, first-colour patch-test tick). An empty submit asks for name and number. Otherwise it shows "This is a demo – nothing is sent".
- Prices (fictional, R50-rounded, "from R…", Durbanville mid-range): cut & finish R450–R650 by length, curl cut R550–R750, fringe trim R100, short back & sides R300, root touch-up R750, full colour R900–R1 450, half head foils R1 000–R1 500, full head foils R1 350–R2 050, balayage R1 600–R2 450, toner & gloss R350–R550, blow-dry R300–R500, waves R400–R600, upstyle R650–R950, bond repair R250–R400, keratin R1 500–R2 600, colour correction from R2 500.
- Fonts: Bodoni Moda roman variable (opsz, wght 400–900; 46 KB) and italic (54 KB), plus Jost variable (100–900; 27 KB), all latin woff2 from Google Fonts, plus OFL texts. Small rose-gold text uses a darker #8a4d32 for contrast. After Luan's feedback (the hairlines were too thin), large Bodoni text is pinned to `font-variation-settings: "opsz" 24` instead of the automatic 96, which thickens the thin strokes while keeping the shapes. Small Bodoni text keeps automatic optical sizing.
- Images: 9 Unsplash photos (auburn knot, copper braid, scissors, round brush, loose waves, hair flip, comb-through, dark curls, soft strands), 900px portrait / 960px landscape WebP, 14–126 KB, with width/height set. The cover and each inner page's first photo are eager (`fetchpriority="high"`); the rest are lazy. Model photos are backs of heads or have the face hidden by hair, with no logos. Each has a visible "Stock photo · name / Unsplash" caption and no quotes nearby. I skipped a wooden-comb photo with an engraved brand and a salon-interior photo with portraits on the wall. Credits added to `/designs/credits/#fynbos-fringe`.
- Checked with Playwright behind the production CSP: 320/360/768/1280 have no horizontal page scroll on all 3 pages (after fixing a nav overflow below 420px by hiding the "Lookbook" link there, since the wordmark goes home). No console errors, CSP violations or 404s. All 3 font files and all 9 images load. Lookbook: next button, arrow keys, End/Home, wheel, counter, disabled ends and live text all work. All 6 shades work, plus the `?shade=ash` preselect, the estimate for 4 lengths, the free consult, flat-price roots, the Monday warning and both submit states. The 360 price picker shows 1 column. Reduced motion (360 and 1280): a vertical stack with no controls and no overflow. No-JS: the strip scrolls, the shade changes via CSS and the length picker stays hidden. Known leftover: at 768 the explorer panel scrolls inside itself by about 86px (the patch-test note sits below the fold of that panel). No inline styles or scripts.
- Compared with Ironbark, Suurdeeg and Lindela: none of them scrolls sideways or uses a full-height panel strip. The image shapes (arches here vs stapled frames, torn paper, a single B&W photo), the didone display type, the pill buttons, the plum/blush palette and the signature (live SVG recolour) are all new. Lindela and Fynbos both use a large serif with section numbers, but Lindela's are static margin numerals on a text grid and Fynbos's are italic panel numbers over photos, with a counter. No change needed.
- Next: phase 7 (Torque Bay). Still open from phase 2: `docs/SAMPLES.md`.

**Phase 7 (2026-11-24), Torque Bay Detailing:**
- Name check: web searches for "Torque Bay Detailing" and "Torque Bay" South Africa found no business. The closest hit is "Torque Detail", a US car-care product brand (different name, not a detailing studio). Name and town kept. Google Maps/CIPC not checked by hand.
- Built `/samples/torque-bay/` (home) and `/packages/`, with their own `assets/site.css`, `assets/site.js`, `assets/icon.svg`, fonts and images. Nothing shared with the main site or other samples.
- Layout per brief: from 1000px it's a 50/50 split. The left half is sticky and full height: the bar (wordmark + nav), our own SVG side-view line drawing of the car on a blueprint grid (numbered callouts, ground line, a length dimension line), and a carbon "title block" along the bottom (drawing number, size, zones, a red quote cell, time). The right half scrolls through the spec sheet: spec header + spec list, 01 Packages (table: stage, time with a red time gauge, what's done, from), 02 Build your own, 03 What finished looks like (photos), 04 A Stage 2 day sector by sector (proportional sector bar), 05 Small print, 06 Find the bay, and a carbon footer. Under 1000px the car shrinks into a sticky strip at the top (about 120–160px: the bar, the car cropped to its outline, and size/zones/quote beside it). Section numbers are race-number roundels.
- Signature: the car zone configurator. Three sizes (hatch / sedan / SUV-bakkie) swap between three different body drawings, and five zone switches (exterior, interior, wheels, engine bay, headlights) light their part of the car in red: the body outline and tint, the glass and seats, the wheels, the bonnet plus an x-ray engine outline, the headlight, and the matching callout. Lines draw in over 0.8 s. The lighting and the size swap are pure CSS (`:has()`), so they work without JS. JS adds the per-size zone prices, the total and time, a drop-off plan (same day, or two days over 8 h), a "these four zones are Stage 2 for less" tip, an aria-live summary and "Request this quote", which opens a `<dialog>` demo form with the summary. Submitting it shows "This is a demo – nothing is sent", or asks for a name and number first. Hovering or focusing a package row (home) or card (packages) previews the zones it covers on the car.
- /packages/: a size toggle (CSS-only price swap), four stage cards with price and time by size, a "what's in each" matrix (● / ○ / —, short labels on phones), an add-ons table and a "not sure which?" CTA. The car shows Stage 2 by default and follows hover/focus; the title block shows the stage and its price.
- Prices (fictional, R50-rounded, "from R…", hatch / sedan / SUV-bakkie): Stage 1 wash R450 / R500 / R600; Stage 2 full detail R1 950 / R2 200 / R2 650; Stage 3 correction R4 500 / R5 200 / R6 500; Stage 4 ceramic R8 950 / R9 950 / R11 950. Zones: exterior R650 / R750 / R950, interior R750 / R850 / R1 100, wheels R350 / R400 / R500, engine bay R450 / R450 / R550, headlights R650. Add-ons R250–R650. Stage 3/4 deposit R1 000.
- Fonts: Anybody variable (wdth 50–150, wght 100–900; 57 KB) and Barlow 400/500/600 (22 KB each), latin woff2 from Google Fonts, plus OFL texts. Headings are wide Anybody in sentence case; the wordmark and hero are uppercase. Small red text uses a darker #b51d31 and small grey text #5d636b for contrast.
- Images: 3 Unsplash photos (machine polisher, paint beading, microfibre buff), 960×360 / 720×480 / 960×400 WebP, 24–78 KB, with width/height set, all lazy and below the fold, in sharp rectangular crops with a thin red rule and "Fig." captions. The polisher photo is cropped to remove a printed name and a company logo on the shirt. No faces. **No wheel photo:** every free wheel close-up found had a car-maker badge on the centre cap or a tyre brand on the sidewall, so the wheels live in the SVG only. Unsplash's search page now shows a bot check, so photos were found through web search and their pages read to confirm the Unsplash License. Credits added to `/designs/credits/#torque-bay`.
- Checked with Playwright behind the production CSP: 320/360/768/1280 have no horizontal scroll on both pages (after tightening the bar under 360px). No console errors, CSP violations or 404s. All 4 font files load, and the images load. Configurator: default (sedan, 3 zones, R2 000, 6 h 30 min), SUV + engine (Stage 2 tip, two-day plan), all 5 zones, none (button disabled, "Pick a zone"), dialog summary, empty and filled submit, Escape closes it, package hover preview and reset, and packages-page size/stage title block. Reduced motion: no animation, no transitions, no smooth scroll. No-JS: the car still lights from the switches and swaps size, the readout hides and a note says the prices are for a sedan. On packages the default Stage 2 lights and prices follow the size toggle. No inline styles or scripts.
- Compared with the built samples: the closest is Ironbark, which also has a sticky left column and a price table. Ironbark's column is a narrow stamp sidebar on paper; here it's a half-screen technical drawing that reacts to the content. To pull them further apart, I changed the section headings from extra-wide all-caps (too close to Archivo Expanded) to sentence case, swapped the small section numbers for race-number roundels, and added time gauges, so the packages table reads as a spec sheet, not a ledger. Lindela's big serif margin numerals, Suurdeeg's vertical timeline (the sector bar here is horizontal and proportional, with no clock times) and Fynbos's horizontal strip don't overlap.
- Next: phase 8 (Ridgeline). Still open from phase 2: `docs/SAMPLES.md`.

**Phase 8 (2026-11-24), Ridgeline Armed Response:**
- Name check: web searches for "Ridgeline Armed Response" and Ridgeline security in Centurion found no SA business. The closest hits are US firms ("Ridgeline Defense", a firearms-training group in New Hampshire, and Ridgeline outdoor/firearm brands), which aren't in SA and aren't armed response. Name and town kept. Google Maps/CIPC not checked by hand.
- Built `/samples/ridgeline-security/` (home), `/services/` and `/coverage/`, with their own `assets/site.css`, `assets/site.js`, `assets/icon.svg`, fonts and images. Nothing shared with the main site or other samples.
- **Suburbs are fictional, as briefed:** Kareehof, Witpeer Park, Valkenvlei (zone 1), Moerbeihof, Klipdrif, Uilenhof (zone 2), Tamboti Rise, Bloubos (zone 3), and outside: Dassieskloof, Sterrewag, Fonteinsig, Rooiklip Plots. The map carries a "Fictional map · illustration only · not to scale" tag, the SVG has a title and description that say so, the footer note says "fictional business, fictional suburbs", and the coverage page explains that a real company would check by street address. There are no live-looking stats, response times, vehicle positions or incident feeds.
- Layout per brief: a dark UI on a fine grid. From 1000px the home page is a full-viewport map console: a full-bleed SVG map (made-up suburbs with street lines, three dashed amber response zones, roads, a highway, two spruits, ridge contour lines, a control-room marker) with docked panels. On the left is a dock with the hero panel and the coverage checker; on the right is a tabbed panel (Services / Callouts / Contact, with arrow-key tabs). A photo band and the footer sit below. Panels have amber corner brackets and numbered tags. Under 1000px the map sits on top (56vh) and the panels stack under it as a rounded bottom sheet with a handle, with the tabs flattened into one long sheet.
- Signature: the coverage checker. Pick one of 12 suburbs from the chip list, or tap it on the map. The suburb fills green (in zone) or amber (outside), its zone gets a solid green outline with an SVG glow and a slow pulse, and the result reads "In our response zone" (with the zone and its suburbs) or "Outside our area – ask us". All of that is CSS `:has()`, so it works without JS. JS adds map taps, a status chip on the map, the suburb name, an aria-live line, `?suburb=<slug>` preselect (whitelisted; `__proto__` is ignored), the URL update on /coverage/ and a "full coverage map" link that keeps the choice. Under reduced motion there's no pulse and no transitions.
- /coverage/: the map at full size (meet, core area) with the checker docked on the right and a legend, then the three zone cards plus "outside for now", and a "Not on the map? Ask us" demo form.
- /services/: an intro panel with the CCTV photo; four rate panels (armed response, CCTV monitoring, guarding, alarm installs) with our own SVG icons and what's included; a monthly add-ons table; "The honest bit" small print (no promise that nothing will happen, no false-alarm fines, ask any company for its PSIRA number, yearly increase notice); and a quote demo form. No PSIRA or other credential claims for the fictional company.
- Prices (fictional, R50-rounded, "from R…"): armed response R450/month (business R650), CCTV monitoring R600/month for up to 4 cameras (+R100 per camera), camera kit R7 950 once-off, guarding R19 500/month (one guard, 12-hour night shift), events R1 250 per guard per shift, alarm install R4 950, beams R2 450 a pair, panic buttons R450, repairs R650 call-out; add-ons panic app R50, escort R150, street patrol R200, fence monitoring R100 per month. Rand amounts use non-breaking spaces so they don't split across lines.
- All forms (home call-back, services quote, coverage ask) `preventDefault`, ask for a name and phone first, then show "This is a demo – nothing is sent".
- Fonts: Saira Condensed 500 and 700 (18 KB each) and Red Hat Text variable (300–700; 30 KB), latin woff2 from Google Fonts, plus OFL texts. Small grey text uses #9aa8b6 instead of the steel #5c6b7a, because steel is too dark for text on the night background.
- Images: 2 Unsplash photos, a CCTV camera on a slatted wall (Franck V.) and a wall light on brick at night (Greg Rosenke). They're 960×640 WebP at 33 KB and 11 KB, with width/height set, desaturated into a night-to-amber duotone in a canvas script. The home photo is lazy; the services one is above the fold, so it's eager. No people, uniforms or logos. I skipped a corrugated-wall camera with a manufacturer's logo on the housing, and a Banksy stencil (someone's artwork). Unsplash search is still behind a bot check, so photos were found through web search and their licence pages read. Credits added to `/designs/credits/#ridgeline-security`.
- Checked with Playwright behind the production CSP: 320/360/768/1280 have no horizontal scroll on all 3 pages. No console errors, CSP violations or 404s. All 3 font files and both photos load. At 1280×800 the left dock fits without scrolling (after tightening it); if a long result makes the checker panel scroll, it scrolls to the result. Tested: list pick (in zone 2), map tap (zone 1), outside suburb, zone 3, tabs by click and arrow keys, the call-back form empty and filled, coverage `?suburb=moerbeihof` preselect, URL update on map tap, a bad slug, both other forms, and phones (tabs hidden, all 3 panels shown). Reduced motion: no zone animation, scroll-behavior auto. No-JS: choosing Valkenvlei shows the zone 1 result and lights zone 1, all tab panels show and the tab bar hides. No inline styles or scripts.
- Compared with the built samples: it's the only dark sample and the only one built around a map. Torque Bay is the nearest in structure (a fixed graphic beside content), but Torque Bay is a white 50/50 split with a scrolling spec sheet, and here the map fills the screen with floating panels over it (on /coverage/ the panel docks over the map's right edge). Ironbark's triage, Lindela's checklist, Fynbos's recolour and Torque's configurator are all pick-and-see tools, but this one answers a yes/no on a map and nothing else looks like it. The fonts, palette and corner-bracket panels are new. No change needed.
- Next: phase 9 (screenshots, gallery, viewer, credits page). Still open from phase 2: `docs/SAMPLES.md`.

**UX pass (2026-11-24), after Luan's feedback ("Lindela has a lot of text and is hard to follow"):**
- Lesson: phases 3–8 were judged mostly on brief-fit and being different from each other, not enough on "can a visitor quickly see what this is, what it costs and what to do next". For every sample from now on, check: a clear action on the first screen at 360 and 1280, price or key fact up front, no more than about 4–5 home sections, reference material on inner pages, and no panel that scrolls inside itself.
- **Ridgeline:** the left dock's coverage checker scrolled inside itself. Docks are no longer height-capped (no inner scrolling on home or /coverage/). On desktop the hero buttons are hidden (the checker sits right below them and Services is beside them), and two lines of copy are shorter, so hero + checker + a result fit 1280×800. Shorter screens scroll the page normally.
- **Lindela (reworked):** the home page went from about 980 to about 440 words, and from 6 sections to 4 (What we do, What do I bring?, Questions, Book a free call). The first screen now has a shorter standfirst, a "Book a free 15-minute call" button, a "See all fees" link and a three-item at-a-glance strip (from R1 250 a month, one person on your file, SARS letters come to us). The drop-cap anecdote is gone. The FAQ uses tap-to-open `<details>`, and margin notes are down from 4 to 2. "A year on our books" and "The year, in dates" moved to /services/ (now 6 sections, notes 3–4). The nav "Write to us" became "Book a call" on all 3 pages.
- **Ironbark:** under 900px the stamps are tighter (4 across on tablets, 2×2 on phones) and the stamp note is hidden. Under 640px the decorative job-card meta row is hidden. The name, intro and "What's wrong?" button are now on the first screen at 360 and 768.
- **Suurdeeg:** the first stop now says what they sell, the hours and the address, with "See the menu" and "Pre-order for Saturday" buttons. The oven story is cut to one line.
- **Fynbos:** the shade explorer no longer scrolls inside itself on short phones (375×667 was 62px over). The art and type are smaller under 760px tall.
- **Torque Bay:** the hero buttons moved above a shorter spec list (6 rows → 4). The photo text is cut to one paragraph, and the small print moved to /packages/ (with payment added), so the home page has 5 sections and about 610 words instead of about 760. Configurator tests re-run and still pass.
- Checked with Playwright behind the production CSP: no horizontal scroll, console errors or failed requests on any page of the 6 samples at 360 and 1280 (Lindela, Ironbark, Suurdeeg and Torque also at 320/768). Every home page has a primary action on the first screen at 360 and 1280. Ironbark's ledger photos load only when a row is opened (by design).

**Phase 9 (2026-11-24), screenshots + gallery cards:**
- New `scripts/screenshots.mjs` (local only, not part of the site; `netlify.toml` now sends `/scripts/*` to the 404 page). Run from the project folder: `npx -y -p playwright node scripts/screenshots.mjs` (all six) or add slugs to redo one, e.g. `... screenshots.mjs torque-bay`. It serves the folder on a local port, opens each sample home at 1280×800 with reduced motion, animations and transitions off, scrolls once so lazy images load, takes a full-page PNG, then resizes it in Chromium's canvas to 640 wide (cropped from the top if taller than 5000px) and saves WebP q0.75 to `/assets/images/designs/<slug>-full.webp`. No extra packages; it prints the size and any 4xx or JS errors.
- Results: Ironbark 640×1541 (56 KB), Suurdeeg 640×3014 (141 KB), Lindela 640×1575 (47 KB), Fynbos 640×2729 (88 KB), Torque Bay 640×2336 (69 KB), Ridgeline 640×656 (35 KB). None needed the 5000px crop. No errors or 404s.
- Because the shots use reduced motion, Fynbos shows its vertical stack of the 7 looks (not the sideways strip) – it reads well as a full-page preview. Torque Bay's sticky car sits at the top with white space below it, which is how the page really lays out (replaced by a single-screen shot in phase 10, part 1). Suurdeeg's bake clock shows the time the script ran.
- **Changed from the plan:** 640 wide (not 800) and WebP only (no JPG fallback), as Luan asked for this phase. §1 and the card spec are updated.
- Gallery cards: the "Preview coming soon" placeholders are replaced by the screenshots (`<img>` with width/height, lazy, alt "Full-page preview of the <Name> concept design"). Each card's one-liner is now a two-sentence description from its brief (layout + mood). The slow scroll uses a per-card `--scroll-time` (4–12 s by page height) so all cards move at about the same speed; the placeholder gradients became a plain loading colour per sample. Unused `.design-frame-note` styles removed.
- Checked with Playwright: all 6 images load (640 natural width), no console errors or 404s, no horizontal scroll at 1280 or on a Pixel 7. Desktop hover moves the image and it returns on leave. Touch shows 6 "▶ Preview" buttons; a tap scrolls the image, flips to "■ Stop" and doesn't follow the link. Reduced motion: no movement on hover and no Preview buttons.
- Viewer and credits page: no change needed this phase (the viewer was built in phase 2, and each sample added its own credits section in phases 3–8).
- Re-run the script whenever a sample's home page changes.
- Next: phase 10 (links, sitemap, `sample_view` event, full QA). Still open from phase 2: `docs/SAMPLES.md`; the WhatsApp [PLACEHOLDER] number in `designs.js`.

**Phase 10, part 1 (2026-11-24), gallery tidy-up, Torque Bay fixes, links:**
- Kept Luan's working-tree changes after review: `/designs/` filter bar and count removed (HTML, JS, CSS; the leftover `data-category` attributes on cards are harmless), `.design-frame` 16:10 at all widths, `WHATSAPP_NUMBER` = 27836095579 (the [PLACEHOLDER] is resolved). Torque Bay `site.css`: from 1000px the bar wraps instead of spilling and title-block cells can wrap; at 1000–1279px the bar is tighter and the "Spec sheet" nav link hides (the logo already links home).
- Torque Bay checked with Playwright at 1000/1100/1200/1279/1280/1440 on home and /packages/: the bar, logo, nav, Quote button and every title-block cell stay left of the centre divider, nothing overflows its box, logo and nav don't touch, and there's no horizontal scroll. **Found and fixed:** on /packages/ at 1000–1279 the "Maintenance" heading on the two-across stage cards ran into the big stage number. Each `.pack` is now a size container, and under 17.5rem the heading drops to normal width and 1rem. Re-checked 320–1440: no heading touches its number or spills.
- **Torque Bay preview:** `scripts/screenshots.mjs` has a `VIEWPORT_ONLY` set (just `torque-bay`), captured as one 1280×800 screen → 640×400 WebP (18 KB). It fills the 16:10 frame exactly, so the card has `--scroll-time: 0s` and a `design-frame--still` class. `designs.js` skips the touch Preview button for still frames (5 buttons now, not 6). Alt is "First-screen preview of …".
- **Nav:** "Designs" removed from the header nav on all 11 main pages (home, websites, software, work, about, contact, privacy, terms, 404, designs, designs/credits). `/designs/` marks Work as `aria-current`; breadcrumb JSON-LD is Home › Work › Sample designs. `/software/demo/*` and `/designs/view/` have no main nav or footer, so they're unchanged.
- **Footer:** "Designs" added after Work in the footer nav on the same 11 pages.
- **/work/:** a new "Sample designs" section (kicker "Concept designs") after Charmz Cakes and before the CTA: one line saying these are concept designs for made-up businesses, not client work. Then 3 lazy thumbnails reusing the gallery WebPs (Ironbark, Fynbos, Ridgeline; 3:4 crops on phones, 16:10 from 768px, `tabindex="-1"` + `aria-hidden` so keyboard and screen-reader users get one link), and a "See all sample designs →" button. Styles are in `styles.css` (`.concepts-*`).
- **/websites/:** "Want to see what a custom build can look like? See the sample designs →" between the plan cards and the plan notes (`.plan-samples`).
- Checked with Playwright at 375 and 1280 on `/designs/`, `/work/`, `/websites/`, Torque Bay home and /packages/: no horizontal scroll, no console errors, no failed requests, no broken images. Header has no Designs link; footer has it; current link is Work on /designs/ and /work/.
- Next: the rest of phase 10 (sitemap check, `sample_view` event in `script.js`, full QA list above). Still open from phase 2: `docs/SAMPLES.md`.


**Phase 10, part 2 (2026-11-24), QA pass:**
- **How:** local Playwright + axe-core (installed outside the project, nothing added to the repo) against a local static server. 27 pages: gallery, credits, viewer for each of the 6 slugs plus a bad slug, all 16 sample pages, `/work/`, `/websites/`.
- **axe (WCAG 2 A/AA + best-practice) at 375 and 1280, reduced motion:** 0 violations after the fixes below.
- **Horizontal overflow at 360, 768, 1024, 1440:** none on any of the 27 pages.
- **Console errors, failed requests, 4xx:** none. Every internal link and `#anchor` on those pages resolves. Images: all load. The only ones not loaded on first paint are Ironbark's three ledger photos inside closed `<details>` (lazy by design; they load when a row is opened).
- **Robots:** all 16 sample pages `noindex`; viewer and credits `noindex, follow`; `/designs/` is `index, follow`. `netlify.toml` has `X-Robots-Tag: noindex` for `/samples/*`, `/designs/view/*`, `/designs/credits/*` and `/software/demo/*`, and none for `/designs/`.
- **404s:** `netlify.toml` sends `/CLAUDE.md`, `/AUDIT.md`, `/PLAN.md`, `/docs/*` and `/scripts/*` to the 404 page. Added the bare `/docs` and `/scripts` too (the `/*` rules might not match them). Can't be proven locally: check on the deploy preview.
- **Honesty grep (samples + gallery + viewer):** no testimonials, reviews, star ratings, awards, "years in business" or client counts. The "%"s are CSS/SVG sizes and "100% rye". The only "clients" is "monthly clients" in a Lindela fee note. Every phone is 000 000 0000 and every email hello@example.co.za; the only real number is Luan's WhatsApp on the gallery, credits and viewer. No inline styles or scripts in samples, no external hosts, all form handlers show "This is a demo – nothing is sent". Every sample page has the "Concept design by Duranex" note, and every sample CSS has a `prefers-reduced-motion` block.
- **Fixed:**
  - Viewer had no `<h1>` (all 6 designs): added a visually hidden one that `designs.js` fills in with the design name.
  - Link names that didn't contain their visible text (Fynbos, Torque Bay, Lindela, Ridgeline logos): aria-labels now start with the visible wording; a missing space between two spans in the Ridgeline and Torque Bay logos added.
  - Contrast: Ironbark `--orange-ink` darkened (`#b9480a` to `#a63f06`) and the page-title stamp text now uses it (border stays bright orange); Lindela big numerals `#b08d57` to `#9c7a43`; Fynbos large look numbers on the three light looks (1, 3, 4) use `--rose-ink` from 1000px; Torque Bay footer mark red to `#ff5a6e`.
  - `sample_view`: no new code needed. The existing `[data-track]` click handler in `script.js` already sends it (consent-gated, and only once gtag has loaded); tested with a stub gtag: `sample_view` with the viewer URL. Comment in `script.js` updated.
- **Sitemap:** `/designs/` only, as planned; samples, viewer and credits are not in it.
- **Not done / for Luan:**
  - Phone test and `git push`. After the deploy preview is up: `curl -I` on `/samples/ironbark-plumbing/`, `/designs/view/`, `/designs/credits/` (expect `x-robots-tag: noindex`), `/designs/` (expect none), and on the viewer that the iframe loads (SAMEORIGIN / `frame-ancestors 'self'`). Also open `/docs`, `/docs/plans/sample-designs.md`, `/CLAUDE.md` and `/scripts/screenshots.mjs` (expect the 404 page).
  - Lighthouse was not run (no Chrome DevTools in this setup); axe covers accessibility only.
  - `docs/SAMPLES.md` (page template and definition of done) was never written (open since phase 2). The rules live in CLAUDE.md and this plan.
  - Fynbos and Lindela were only axe-checked with reduced motion on; with motion on, mid-animation frames can show false low-contrast results.


**Phase 10, part 3 (2026-11-24), `docs/SAMPLES.md`, remaining checks, /work/ thumbnail:**
- **Written:** `docs/SAMPLES.md` (page template, honesty rules, images, fonts, motion/accessibility, gallery steps, and a 12-point definition of done). CLAUDE.md already points to the plan; the plan points to SAMPLES.md.
- **/work/:** the third thumbnail is now Suurdeeg Bakehouse (was Ridgeline). Checked at 375 and 1280.
- **Lighthouse (local server with gzip, mobile + desktop, home pages + gallery, viewer, credits, /work/):** accessibility 100 and best-practices 100 on all but Fynbos (96, see below); performance 75–100 (gallery mobile 75 and Suurdeeg desktop 81 were the lowest; machine-dependent, TBT swings between runs); SEO 100 on /designs/ and /work/, 63–66 on noindex pages (only the intended "blocked from indexing" audit).
- **Fynbos contrast flag in Lighthouse:** the "Request a booking" button in the last look reads 2.04:1 only while that look is off-screen in the sideways strip (its text fades in with opacity). It passes axe when scrolled to. Not a real issue.
- **Keyboard (375 and 1280, all 19 pages):** skip links present, every Tab stop scrolls into view and shows focus (Ironbark form fields use a border + tint change, Torque Bay custom radios show focus on their labels), no traps. **Reduced motion:** no infinite animations or smooth scroll anywhere. **No JS:** headings and text visible on every page; only the viewer needs JS (it has a `<noscript>` list).
- **Production headers (netlify.toml rules applied by a local test server):** the viewer loads all six samples in its iframe, the phone toggle gives 390px, and all 20 pages have no CSP errors or 404s. Header rules gave `noindex` on samples, viewer and credits only, and 404 for `/docs`, `/docs/*`, `/CLAUDE.md`, `/AUDIT.md`, `/PLAN.md`, `/scripts`, `/scripts/*`. This tests our config, not Netlify itself, so the `curl -I` check on the deploy preview is still worth doing (listed in `docs/SAMPLES.md` item 11).
- **Still open for Luan:** phone test; Google Maps / CIPC name checks by hand; `git push` after review.

## 8. Questions for Luan (answered 2026-11-24)

1. **Gallery placement:** in the top nav if it isn't too heavy, otherwise leave it out (the phase 10 test is in §4).
2. **Business names:** approved, as long as none is a real business (checked in phase 2).
3. **Framing change:** approved. The site changes from "nobody may show our pages inside a frame" to "only duranexsolutions.com may".
4. **Screenshots:** approved, using Playwright via npx locally. Only the images are committed.
5. **WhatsApp text:** "Hi Luan, I saw the <Name> sample design and I'm interested in a website like this for my business. Can you tell me more?"
6. **Prices:** my call. Realistic mid-range rates, rounded to R50, shown as "from R…".
7. **Stock photos:** allowed, following the safety rules in §2.

No open questions.
