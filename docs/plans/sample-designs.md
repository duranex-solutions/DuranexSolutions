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

### 2.2 Food – Suurdeeg Bakehouse, Parys (`suurdeeg-bakehouse`)
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

### 2.4 Beauty – Fern & Fringe Hair Studio, Durbanville (`fern-fringe`)
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
| Fern & Fringe (beauty) | Horizontal scroll-snap lookbook panels | Full-height look #01 | Bodoni Moda + Jost | cream, blush, plum, rose gold | Shade explorer recolours SVG |
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
- [ ] **Phase 2** – Groundwork
  - netlify.toml changes (§5).
  - `docs/SAMPLES.md` (page template, rules, definition of done).
  - Business-name checks.
  - Folder skeleton.
  - Font download + subsetting method.
  - Image download/optimise method and the credits format.
- [ ] **Phase 3** – Ironbark Plumbing (home + /geysers/)
- [ ] **Phase 4** – Suurdeeg Bakehouse (home + /menu/ + /pre-order/)
- [ ] **Phase 5** – Lindela Ledger & Tax (home + /services/ + /checklist/)
- [ ] **Phase 6** – Fern & Fringe (home + /services/ + /book/)
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

## 8. Questions for Luan (answered 2026-11-24)

1. **Gallery placement:** in the top nav if it isn't too heavy, otherwise leave it out (the phase 10 test is in §4).
2. **Business names:** approved, as long as none is a real business (checked in phase 2).
3. **Framing change:** approved. The site changes from "nobody may show our pages inside a frame" to "only duranexsolutions.com may".
4. **Screenshots:** approved, using Playwright via npx locally. Only the images are committed.
5. **WhatsApp text:** "Hi Luan, I saw the <Name> sample design and I'm interested in a website like this for my business. Can you tell me more?"
6. **Prices:** my call. Realistic mid-range rates, rounded to R50, shown as "from R…".
7. **Stock photos:** allowed, following the safety rules in §2.

No open questions.
