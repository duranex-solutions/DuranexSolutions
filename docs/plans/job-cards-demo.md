# Job cards demo: plan

The "Tools for teams on the road" card on /software/ (`id="job-cards"`) has no demo yet. This plan covers a shallow, two-minute demo at `/software/demo/job-cards/`. A manager assigns a job, the technician gets a simulated WhatsApp alert, fills in the job card on a phone and completes it, and the manager reads an on-screen end-of-day report. It is built on the shared kit (`software/demo/demo.css`, `demo.js`, `docs/DEMOS.md`). It is one company with no invoicing, no multi-user setup and no login.

---

## 1. Decisions

### Names (all fictional, marked as such on the page)
- **Company: Hadeda Aircon** (Luan's choice). It is named after the loud Highveld bird: friendly, memorable and clearly not a real brand. A web search found no South African aircon business with this name.
- **Technicians:** Sipho Dlamini, Riaan Botha, Naledi Mokoena. These are common South African names, and the three are easy to tell apart at a glance.
- **Customers (6):** real East Rand and Joburg-east suburbs near the office, with invented street names.

| Ref | Time | Customer | Suburb | Service | Units | Tech | Seed status |
|---|---|---|---|---|---|---|---|
| JC-1041 | 08:00–09:30 | Lindiwe Khumalo | Sunward Park, Boksburg | Standard service | 2 split | Sipho | Done (on site 08:05–09:20) |
| JC-1042 | 08:30–10:00 | Johan Pretorius | Northmead, Benoni | Fault call-out | 1 split | Riaan | Done (08:40–09:35), 1 problem flagged |
| JC-1043 | 10:00–12:00 | Fatima Patel | Bedfordview | Deep clean | 1 split | Naledi | In progress (since 10:05), 3 of 6 checks |
| JC-1044 | 11:30–13:00 | Mpho Sithole (small office) | Aston Manor, Kempton Park | Standard service | 3 split | Sipho | On the way |
| JC-1045 | 12:30–14:00 | Annelie de Bruyn | Edenvale | Standard service | 1 split | Riaan | Scheduled |
| JC-1046 | 13:30–15:00 | Bongani Ndlovu | Primrose, Germiston | Standard service | 2 split | none | **Unassigned** |

- **Why these six:** all five statuses are on screen at once, two finished jobs give the report content, and one job is waiting to be assigned.
- **Contact details:** phones are `+27 00 000 01xx` (technicians) and `+27 00 000 02xx` (customers). There are no emails.
- **Units:** no brand names, only size and room (for example "12 000 BTU, main bedroom").

### Data model (data.js, `window.DEMO_SEED`)
- **Dates:** data.js works out today's local date with `getFullYear`, `getMonth` and `getDate` (never `toISOString`). It writes every time as `"YYYY-MM-DDTHH:mm"`, so `Demo.fmt.time` and `Demo.fmt.date` work unchanged. Because the jobs are built on today's date, "today's jobs" is true whenever someone visits.
- **services:** three types, enough to make the value total mean something. These are sample prices for a made-up company.

  | Key | Label | Price | Charged | Minutes |
  |---|---|---|---|---|
  | `std` | Standard service | 650 | per unit | 45 per unit |
  | `deep` | Deep clean | 950 | per unit | 75 per unit |
  | `fault` | Fault call-out | 850 | flat | 60 |

  In data.js: `{ std: { label: "Standard service", price: 650, perUnit: true, mins: 45 }, deep: { label: "Deep clean", price: 950, perUnit: true, mins: 75 }, fault: { label: "Fault call-out", price: 850, perUnit: false, mins: 60 } }`.
- **checklist:** one template for every job, which keeps the demo shallow. 4 of the 6 items are required:
  1. Power isolated before work (required)
  2. Filters cleaned (required)
  3. Indoor coil and drain line cleaned (required)
  4. Remote control and settings checked
  5. Cooling tested, vent temperature noted (required)
  6. Area left clean, work explained to customer
- **statuses:** each is a `Demo.badge`, so it always shows an icon and a word, never colour alone.

  | Key | Badge tone | Word |
  |---|---|---|
  | `unassigned` | warn | Unassigned |
  | `scheduled` | neutral | Scheduled |
  | `onway` | info | On the way |
  | `progress` | info | In progress |
  | `done` | ok | Done |
- **techs:** `[{ id, name, phone }]`.
- **customers:** `[{ id, name, address, suburb, phone, access }]`. `access` is a note such as "Dog in the yard, ring at the gate", because real job cards carry notes like this.
- **jobs:** `{ id, ref, start, end, customerId, techId|null, service, units: [{ btu, room }], status, arrivedAt|null, doneAt|null, checks: { itemId: { state: "todo"|"ok"|"problem", note } }, photos: [{ id, url|null, sample }], signature: null | { kind: "drawn"|"typed", name, img? } }`

### State shape
```
{ ...seed data, ui: { techId: "t1", openJobId: null, alert: null | { jobId, techId }, tips: { opened: false, report: false } } }
```
- The UI choices that matter for Reset are in the store, so `Demo.reset()` restores everything in one go.
- **Kept outside the store,** in app.js module variables, because they are browser resources or change many times a second:
  - a `Set` of object URLs for the photos;
  - the signature strokes for each job, saved as points from 0 to 1.
- An `onReset` hook revokes every URL and clears the strokes.

### Rules
- **Required check done:** it is ticked, or marked "Problem" with a note that isn't empty. A technician can't always fix something, but they have to say why.
- **Can complete:** every required check is done, and there is a signature, either drawn (at least one stroke) or typed (a name of 2 or more characters). Photos are optional.
- **Simulated times:**
  - "Start job" sets `arrivedAt` to the job's booked start.
  - "Complete" sets `doneAt` to `arrivedAt + mins × units`, or `arrivedAt + mins` for a flat-rate service.
  - Why: visitors finish in seconds and at any hour, so the real clock would show 0-minute visits or completions at 21:00. The report says "Times are simulated".
- **Status steps on the job card:** a "Scheduled" job shows an "I'm on my way" button, and an "On the way" job shows "Start job". Ticking the first check also starts the job, so nothing blocks the two-minute path.
- **Assign dialog:** I pre-select the technician with the fewest jobs that day. `Demo.modal` actions close the dialog before they run, so the dialog can't show an error, and pre-selecting someone means there is never an empty choice.

### How the two views share one state
- There is one `Demo.store`. `render(state)` redraws the manager board, the technician's job list and the report from it.
- The open job card is the exception. It is built once when it opens, then patched in place: checklist row, "Still needed" line, photo strip, signature state. Rebuilding it on every tick would lose keyboard focus, the cursor in a note and the canvas drawing.
- Completing a job calls `store.update`, which re-renders the board, so on desktop the change shows on the left at once.

### Report contents and formulas
- **Tiles:**
  - jobs done: `count(status = done)` of `jobs.length`
  - outstanding: `jobs.length − done`
  - photos: `Σ photos.length`
  - signatures: `count(signature)`, drawn and typed together
  - problems: `count(checks.state = problem)`
- **Per-job table:** `Demo.table`, which turns into stacked cards below 640px.
  - Columns: time, ref and customer, technician, status, time on site, photos, signature, problems, value.
  - Time on site is `doneAt − arrivedAt`, shown as "1 h 15 min". An in-progress job shows "On site since 10:05". Any other job shows "–".
- **Problems list:** job ref, customer, check and the technician's note.
- **Per technician:** one line each, for example "Sipho: 1 of 2 done".
- **Value:**
  - Job value is `price × (perUnit ? units.length : 1)`.
  - Shown as "Work done today" (the sum for done jobs) and "Still booked" (the sum for the rest), labelled **"Sample prices. Not an invoice."**
  - Seed totals: R 2 150,00 done, R 7 000,00 for all six jobs.
- **Footer line:** "In a real version, this report would be sent to you automatically every evening by WhatsApp or email." This matches the card copy ("daily reports sent to you automatically") without claiming that anything is sent here.
- No PDF and no print.

### Accent colour
**`#3fa9d6`** (sky blue, "cool air"). The other demos already use orange, pink, teal and the example's blue. Measured by script with the DEMOS.md formula:

| Pair | Ratio |
|---|---|
| navy-900 on accent | 6.31 |
| accent-strong on paper | 4.78 |
| accent-strong on paper-card | 5.16 |
| accent-strong on tint | 4.74 |

All pass AA. Re-check them in the browser in Phase 3.

---

## 2. Desktop layout (from 1024px)

### Shell
The shared sidebar (240px) lists **Manager** and **End-of-day report**. The Technician item is hidden from 1024px, because the phone is always on screen there.

### Manager view
`.demo-main` becomes a two-column grid.

**Left column** (1fr: about 320px at 1024px, about 560px from 1280px), top to bottom:
1. Kicker and h1 "Hadeda Aircon"
2. h2 "Manager board" with today's date
3. The "Try this" card: 4 steps, each ticks itself off as you do it
4. "Today's jobs": job cards sorted by time
5. "Technicians": one card per technician, with their jobs and badges
6. A "See end-of-day report" button

**Right column (375px):** a plain phone frame.
- A rounded border with no device brand and no notch, labelled with an h3 "Technician's phone (simulated)".
- The frame is `position: sticky` below the demo bar. Its height is `100vh − bar − 32px`, at most 760px.
- The screen scrolls on its own, like a real phone. It is a `role="region"` with `tabindex="0"`, so keyboard users can scroll it.
- At the top sits a "Showing jobs for" select with the three technicians.

### Assign and alert
1. "Assign technician" on JC-1046 opens a `Demo.modal`. It has a radio list of technicians, each with their number of jobs today, and Cancel / Assign buttons.
2. On Assign, the phone switches to that technician.
3. **The WhatsApp alert appears inside the phone frame, at the top of the screen.**
   - It is built with `Demo.previewEl` and headed "Simulated WhatsApp alert".
   - It carries the kit label "Preview only. Nothing was sent." and an **Open job** button.
   - Focus moves to the alert's heading, and a toast confirms the assignment.
4. Open job opens the job card inside the frame. By then the board on the left already shows "Scheduled".

### Report
The End-of-day report view uses the full width of the main area, so tables stay real tables. The phone frame isn't shown there, because the report is manager-only.

### How it works
The technician app is one DOM node, `#jc-tech`. A `matchMedia('(min-width: 1024px)')` listener moves it between the phone frame (desktop) and the Technician view (phone). Moving a node keeps the canvas drawing, the photos and the listeners.

## 3. Phone layout (360–414px)

### View switch
The shared bottom tabs: **Manager | Technician | Report**.
- They are easy to reach with a thumb, work like the other demos, and keep navigation to one level.
- Each view has its own h2, and switching moves focus to it (kit behaviour).

### Manager view
- Top to bottom: the "Try this" card (compact), today's jobs as full-width stacked cards, then the technician cards.
- Each job card shows the time, ref, customer and suburb, service and units, the technician (or "No technician yet"), the badge and one button.
  - The unassigned job gets a primary **Assign technician** button.
  - The others get "Open as technician".

### Assign flow
The same `Demo.modal`, with large radio rows (44px or taller), then Assign.

### Alert
- After Assign, a modal shows the WhatsApp-style preview with **Open job** (primary) and **Back to board**.
- The same alert also stays at the top of that technician's job list.
- Open job goes to the Technician view and focuses the job card heading. That focus must run after the kit's own hashchange focus.

### Technician view
Top to bottom: the "Showing jobs for" select, the alert (if there is one), "My jobs today" (tap a job to open it), then the job card.

The job card, in order:
1. "← My jobs" back button, an h3 with the ref and customer, the status badge and the time slot
2. "Still needed" line, for example "3 required checks, signature", updated live
3. Next step button: "I'm on my way" or "Start job"
4. Customer: name, address, phone and access notes
5. Service and units, for example "Standard service · 2 split units: 12 000 BTU main bedroom, 18 000 BTU lounge"
6. Checklist:
   - Each item is a `fieldset`. Its legend is the item label plus "Required" where it applies.
   - Two pill-shaped radio buttons: **Done** and **Problem**.
   - Choosing Problem shows a short note field (140 characters at most).
7. Photos (optional, up to 3):
   - **Take or add photo:** a label around `<input type="file" accept="image/*" capture="environment">`.
   - **Use sample photo:** the sample is drawn on a canvas, so no image file is added.
   - Thumbnails, each with a Remove button.
   - The line "Photos stay on this phone. Nothing is uploaded."
8. Customer signature:
   - The canvas is the full card width (about 312–340px) by 180px.
   - `touch-action: none` is set on the canvas only, so the rest of the page still scrolls.
   - It is sized with `devicePixelRatio`, so lines stay sharp.
   - Under it: a **Clear** button, and a **Type name instead** toggle that shows a "Customer's full name" field.
9. A "What's missing" message (shown only when needed), then **Mark job complete**

### Where Complete sits
At the end of the card, not in a sticky bar:
- The work runs top to bottom: check, photo, sign, complete.
- A sticky bar would stack on top of the fixed 60px tabs and the 48px demo bar. That would hide about a fifth of a small screen, and the bar jumps when the keyboard opens for a note or the typed name.
- The "Still needed" line at the top tells the technician what is left before they scroll.

The button is always enabled. If it is pressed too early:
- the missing items show as a list of buttons, each of which jumps to its item and focuses it;
- focus moves to that message.

### Report
The third tab:
1. Tiles, 2 across
2. Per-job table as stacked cards (kit)
3. Problems list
4. Value block with "Not an invoice"

## 4. Files
New, under `software/demo/job-cards/`:
- **`index.html`:** copied from the example. Change the title, description, og tags and `og:url`, the WhatsApp text ("...tried your job-cards demo.") and the back link (`/software/#job-cards`), and add three nav items and three views.
- **`data.js`:** the seed, built from today's date.
- **`rules.js`:** pure logic with no DOM, so it can be tested in node: job value, required-check status, can-complete with its missing list, time on site, report totals.
- **`app.js`:** rendering, assign, alert, job card patching, photos, signature pad, report, moving the technician node, and `Demo.init`.
- **`app.css`:** the accent, desktop grid and phone frame, job cards, checklist pills, photo strip, signature pad, alert slot and the reduced-motion guard.

**Budget:**
- Aim for 30 000 bytes for data.js, rules.js, app.js and app.css together. Estimate: about 3 + 2 + 19 + 6 KB.
- Luan approved going over if needed, up to about 40 KB.
- The budget only affects this demo page, because no other page loads these files. It is there so the demo loads fast and responds quickly on a cheap Android phone on mobile data.
- Record the final size in the Phase 2 handoff and in the DEMOS.md budget line.

**Shared files: no changes.** `Demo.previewEl`, `Demo.modal`, `Demo.badge`, `Demo.table` and `Demo.toast` cover everything. demo.css is already at 11 895 of its 12 000 bytes.

In Phase 3 only: `software/index.html` (the link on the card) and `docs/DEMOS.md` ("Linked so far").

## 5. Checklists

### Phase 2: build
- [ ] `rules.js`, with node checks of every formula on the seed: required, can complete, value, time on site, totals
- [ ] `data.js` with local dates. Check the seed totals: 2 done, R 2 150,00 done, R 7 000,00 for all
- [ ] `index.html` from the example: head order, noindex, no canonical, one h1, three views and nav
- [ ] Manager board: jobs list, technician cards, "Try this" card (ticks itself off), report button
- [ ] Assign dialog, then the alert (inline in the frame on desktop, a modal on phone), then Open job with the right focus
- [ ] Technician job list and select. Job card built once and patched, focus never lost
- [ ] Checklist radios and problem notes. Notes saved on `change`, not on every keystroke. "Still needed" line
- [ ] Photos:
  - [ ] file input and object URL preview, at most 3
  - [ ] Remove revokes the URL
  - [ ] sample photo drawn on a canvas
  - [ ] Reset revokes every URL
- [ ] Signature:
  - [ ] Pointer Events with pointer capture, and coalesced events where the browser has them
  - [ ] sharp on high-DPI screens, redrawn from the strokes on resize
  - [ ] Clear, and Type name instead
- [ ] Complete: the missing list with jump buttons, then done with times, a toast and the board updated
- [ ] Report: tiles, table, problems, per technician, value with "Sample prices. Not an invoice.", "Times are simulated", and the "would be sent to you automatically" line
- [ ] Desktop grid, sticky phone frame, technician node moved on the 1024px matchMedia change
- [ ] Accent in app.css, reduced-motion guard, 44px tap targets
- [ ] Definition-of-done greps and budget (`wc -c` on data.js, rules.js, app.js and app.css)

### Phase 3: switch on and QA
- [ ] Definition of done from DEMOS.md: every grep line and the by-hand list
- [ ] Add `Try the demo ↗` (`data-demo-link="job-cards"`) as the last child of `#job-cards` in `software/index.html`. Update "Linked so far" in DEMOS.md
- [ ] Indexing:
  - [ ] not in `sitemap.xml` and not disallowed in `robots.txt`
  - [ ] noindex meta present (the `/software/demo/*` header in netlify.toml already covers the page)
- [ ] `/software/#job-cards` lands on the card, and the back link goes there
- [ ] Desktop at 1024px and 1280px: board and phone side by side, an assigned job shows on the phone at once, report at full width
- [ ] Phone at 360px and 414px: bar on one row, no sideways scroll, tabs at the bottom, report table as cards
- [ ] Real phone (Android Chrome, plus an iPhone if available):
  - [ ] camera opens from "Take or add photo"
  - [ ] preview shows, and nothing lags on a cheap phone
  - [ ] a finger signature draws without the page scrolling, and is sharp
  - [ ] Clear works
  - [ ] the keyboard doesn't hide Mark job complete
- [ ] Keyboard only:
  - [ ] the whole path, including the typed signature
  - [ ] Esc closes dialogs and focus comes back
- [ ] Screen reader quick pass (NVDA or TalkBack): badges, "Still needed", the missing message, the alert
- [ ] Reduced motion: no fades. Contrast re-checked by eye
- [ ] Reset: revokes photos, clears the signature, returns to the seed and the Manager view, shows the toast

## 6. Risks and open questions (answered by Luan)
1. **Budget:** aim for 30 KB. Going over is approved if needed. It only affects this demo page.
2. **Report wording:** "In a real version, this report would be sent to you automatically every evening by WhatsApp or email."
3. **Phone memory:** full-size camera photos can be heavy on a cheap Android phone. If Phase 3 shows lag, shrink each photo once with `createImageBitmap` before previewing. The photo stays on the phone either way. (Agreed.)
4. **Addresses:** the street names are invented. I can't fully guarantee that a number, street and suburb never matches a real house. (Agreed.)
5. **Name:** Hadeda Aircon, chosen over Koelwind, Suikerbos and Rietvlei.

## Handoff: Phase 1

### Decided
- **Slug and path:** `job-cards`, at `/software/demo/job-cards/`, matching the card id. This plan file is `docs/plans/job-cards-demo.md`, the name Luan asked for. The other plans use `demo-<slug>.md`.
- **Business:** Hadeda Aircon, with technicians Sipho, Riaan and Naledi, and 6 jobs today covering all five statuses (2 done, 1 unassigned: JC-1046).
- **Views:** three, Manager, Technician and Report.
  - On phone they are the bottom tabs.
  - On desktop the sidebar shows Manager and Report, and the technician app lives in a 375px phone frame beside the board.
  - The node `#jc-tech` is moved between the frame and the Technician view on the 1024px matchMedia change.
- **Alert:** inline at the top of the phone frame on desktop, a modal on phone. Both use `Demo.previewEl`.
- **Complete:** at the end of the job card, not sticky. Always enabled, and it explains what's missing.
- **Times:** simulated from the booked start plus the service minutes.
- **Accent:** `#3fa9d6`, with contrast as in section 1.
- **Budget:** aim for 30 KB. Luan approved more if needed (about 40 KB).
- **Report:** carries "Sample prices. Not an invoice.", "Times are simulated", and the line saying it would be sent automatically in a real version.
- **Shared files:** no changes.

### Phase 2 must watch
- **Re-rendering:** never rebuild the open job card on a store change. Patch it in place, or focus, the note cursor, the file input and the canvas are lost. For the board and lists, restore focus to the same control after a re-render (for example with a `data-k` key).
- **Focus after Open job (phone):** `Demo.go` changes the hash, and the kit focuses the view h2 on `hashchange`. Focus the job card heading after that: register an app `hashchange` listener after `Demo.init`, or defer the focus.
- **Dialogs:** `Demo.modal` actions close the dialog, which removes it, before `onClick` runs. Read the chosen radio from a closure reference, not from the DOM by id.
- **Photos:**
  - Keep the object URLs in a module `Set`.
  - Revoke on Remove and in `Demo.onReset`. Old state is gone by the time the reset hook runs, so don't rely on it.
  - Never put File objects in the store (`structuredClone` of the seed only covers plain data).
- **Signature:**
  - `touch-action: none` goes on the canvas only.
  - Call `setPointerCapture` on pointerdown, set the backing size to CSS size × `devicePixelRatio` and scale the context.
  - Redraw from the stored strokes on resize, because resizing a canvas clears it.
  - The canvas is `role="img"` with instructions. The keyboard path is "Type name instead".
- **Dates:** local dates only, never `toISOString()` (UTC shifts the day before 02:00 SAST). Format with `Demo.fmt` only.
- **CSP:** no inline style, script or `style=""`. Setting `el.style` from JS is fine. The sample photo is drawn on a canvas and turned into a blob URL, with no image file.
- **Budget:** watch it while building, not only at the end. app.js is the risk.

### Phase 2 starts with
1. `rules.js` and its node checks against the seed totals
2. `data.js`
3. `index.html` from the example
4. `app.js` and `app.css`, working down the Phase 2 checklist
