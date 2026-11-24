# Sample designs – plan

Six concept websites for fictional South African businesses, a gallery to browse them and a viewer page to try them full-size. They are concept designs: not client work, not for sale as templates. Rules are in CLAUDE.md ("Sample designs").

## 0. Audit (2026-11-24, branch sample-designs)

**Structure.** Static site, `publish = "."`. Pages are folders with an index.html: `/`, `/websites/`, `/software/`, `/work/`, `/about/`, `/contact/`, `/terms/`, `/privacy/`, `/404.html`. Six software demos live in `/software/demo/<slug>/` on their own kit (`demo.css`, `demo.js`, rules in docs/DEMOS.md). Assets: `/assets/fonts` (10 woff2 + OFL texts), `/assets/images`, `/assets/logos`.

**Nav.** The header is copied into every page by hand: logo, Websites, Software, Work, About, plus a "Get a free quote" button. Below the desktop breakpoint it becomes a Menu toggle, with a `<noscript>` style fallback. The footer nav repeats those links plus Contact. There's also a floating Call/WhatsApp pill. A "Designs" link may be added if it fits (test in §4).

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
    /assets/images/designs/<slug>-full.webp   Full-length desktop screenshot, 800px wide, ≤250 KB
    /assets/images/designs/<slug>-full.jpg    Fallback, same size
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

**Top nav (Luan: "top nav if it's not too heavy").** In phase 10, add "Designs" as a 5th text link between Work and About on every main page. Keep it only if:
- at 1024px and 1280px the header stays on one row with the logo, the 5 links and the quote button, and the spacing doesn't shrink below the current gap;
- the mobile menu stays one screen tall at 360×640.

If either check fails, drop the top-nav link and rely on the links below. Record the result in the handoff.

It's also linked from:
- `/websites/`: a "See sample designs" button under Plans.
- `/work/`: a section "Concept designs" next to the two live sites, clearly labelled as concepts.
- The footer nav: "Sample designs".
- The sitemap.

**Gallery page** (main-site header, footer and styles, plus `designs.css`; loads `/script.js` like any main page):
- **Header copy:** "Sample designs. Six concept sites for made-up businesses, each built from scratch to show what a custom-coded site can look like. They're not templates and not for sale; yours would be designed around your business."
- **Filter buttons:** All, Trades, Food, Professional, Beauty, Auto, Security. They are `<button aria-pressed>` and scroll sideways on mobile. Filtering sets `hidden` on cards, and an `aria-live` line reads "Showing 1 of 6". Without JS the buttons are hidden and all cards show.
- **Cards:** industry tag, fictional name + town, one-line concept, signature named, a "View design ↗" button (stretched link to `/designs/view/?s=<slug>`), and a small "Open on its own" link to `/samples/<slug>/`.
- **Screenshot:** sits in a fixed frame (4:5 on mobile, 16:10 from 768px). The `<picture>` holds the WebP with a JPG fallback, `loading="lazy"`, and alt text ("Full-page preview of the Ironbark Plumbing concept design").
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
- [~] **Phase 2** – Groundwork (partly done: gallery shell, viewer, nav link, netlify.toml, sitemap; see handoff for what is still open)
  - netlify.toml changes (§5).
  - `docs/SAMPLES.md` (page template, rules, definition of done).
  - Business-name checks.
  - Folder skeleton.
  - Font download + subsetting method.
  - Image download/optimise method and the credits format.
- [x] **Phase 3** – Ironbark Plumbing (home + /geysers/), plus a first version of `/designs/credits/`
- [x] **Phase 4** – Suurdeeg Bakehouse (home + /menu/ + /pre-order/)
- [x] **Phase 5** – Lindela Ledger & Tax (home + /services/ + /checklist/)
- [x] **Phase 6** – Fynbos & Fringe (home + /services/ + /book/)
- [ ] **Phase 7** – Torque Bay Detailing (home + /packages/)
- [ ] **Phase 8** – Ridgeline Armed Response (home + /services/ + /coverage/)
- [ ] **Phase 9** – Screenshots (full-length WebP + JPG), gallery `/designs/`, viewer, credits page
- [ ] **Phase 10** – Links (Websites, Work, footer on every main page), sitemap, `sample_view` event, full QA. QA covers:
  - 360/768/1280 and keyboard.
  - Reduced motion and no-JS.
  - Lighthouse.
  - `curl -I` header checks on a deploy preview.
  - A grep for forbidden content (testimonials, ratings, real phone numbers in samples, inline styles).

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
- Fonts: Bodoni Moda roman variable (opsz, wght 400–900; 46 KB) and italic (54 KB), plus Jost variable (100–900; 27 KB), all latin woff2 from Google Fonts, plus OFL texts. Small rose-gold text uses a darker #8a4d32 for contrast.
- Images: 9 Unsplash photos (auburn knot, copper braid, scissors, round brush, loose waves, hair flip, comb-through, dark curls, soft strands), 900px portrait / 960px landscape WebP, 14–126 KB, with width/height set. The cover and each inner page's first photo are eager (`fetchpriority="high"`); the rest are lazy. Model photos are backs of heads or have the face hidden by hair, with no logos. Each has a visible "Stock photo · name / Unsplash" caption and no quotes nearby. I skipped a wooden-comb photo with an engraved brand and a salon-interior photo with portraits on the wall. Credits added to `/designs/credits/#fynbos-fringe`.
- Checked with Playwright behind the production CSP: 320/360/768/1280 have no horizontal page scroll on all 3 pages (after fixing a nav overflow below 420px by hiding the "Lookbook" link there, since the wordmark goes home). No console errors, CSP violations or 404s. All 3 font files and all 9 images load. Lookbook: next button, arrow keys, End/Home, wheel, counter, disabled ends and live text all work. All 6 shades work, plus the `?shade=ash` preselect, the estimate for 4 lengths, the free consult, flat-price roots, the Monday warning and both submit states. The 360 price picker shows 1 column. Reduced motion (360 and 1280): a vertical stack with no controls and no overflow. No-JS: the strip scrolls, the shade changes via CSS and the length picker stays hidden. Known leftover: at 768 the explorer panel scrolls inside itself by about 86px (the patch-test note sits below the fold of that panel). No inline styles or scripts.
- Compared with Ironbark, Suurdeeg and Lindela: none of them scrolls sideways or uses a full-height panel strip. The image shapes (arches here vs stapled frames, torn paper, a single B&W photo), the didone display type, the pill buttons, the plum/blush palette and the signature (live SVG recolour) are all new. Lindela and Fynbos both use a large serif with section numbers, but Lindela's are static margin numerals on a text grid and Fynbos's are italic panel numbers over photos, with a counter. No change needed.
- Next: phase 7 (Torque Bay). Still open from phase 2: `docs/SAMPLES.md`.

## 8. Questions for Luan (answered 2026-11-24)

1. **Gallery placement:** in the top nav if it isn't too heavy, otherwise leave it out (the phase 10 test is in §4).
2. **Business names:** approved, as long as none is a real business (checked in phase 2).
3. **Framing change:** approved. The site changes from "nobody may show our pages inside a frame" to "only duranexsolutions.com may".
4. **Screenshots:** approved, using Playwright via npx locally. Only the images are committed.
5. **WhatsApp text:** "Hi Luan, I saw the <Name> sample design and I'm interested in a website like this for my business. Can you tell me more?"
6. **Prices:** my call. Realistic mid-range rates, rounded to R50, shown as "from R…".
7. **Stock photos:** allowed, following the safety rules in §2.

No open questions.
