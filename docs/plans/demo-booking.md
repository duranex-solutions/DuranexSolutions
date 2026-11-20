# Bookings demo plan

Demo 1 of 5 on /software/. Path: `/software/demo/bookings/` (slug `bookings`, which matches the card id and DEMOS.md; the brief said `booking`, and Luan chose `bookings` on 2026-11-20).
Phases: 1 plan (this file) · 2 build · 3 QA and ship prep.

## Rules (verbatim from the brief)
- The DEMOS.md rules are binding (in-memory sample data, Reset re-seeds, no backend, nothing sent, fictional businesses and people, rand amounts in en-ZA format, mobile-first, keyboard, WCAG AA, reduced motion, size budgets).
- Reuse the shared components. Booking-specific code goes in this demo's own files. Change a shared file only if genuinely needed; if you do, give the reason in the plan and record the change in DEMOS.md.
- Copy is en-ZA, plain and short.
- Never push, merge or deploy. Commit on the current branch only.

Goal: a visitor gets the idea in under 2 minutes of clicking. It is not a product: no accounts, payments, recurring bookings, drag-and-drop or settings screens.

## Decisions
- **Business:** Marula Hair Studio, Kiaat Heights. Both are made up, and the page kicker says so. *Fictional, as DEMOS.md requires.*
- **Accent:** `#e07a8a` (rose). navy-900 on the accent 5.88 · accent-strong `#8c5568` on paper 5.16, on paper-card 5.57, on tint 5.08. *Passes AA with a margin (computed by script; re-check by eye).*
- **Sample data:**
  - built once at load, relative to today, from local date parts only
  - times stored as minutes since midnight
  - *never stale, and no UTC off-by-one*
- **Slots:**
  - 30-minute grid, with a plain interval-overlap check against hours, blocks and bookings
  - "Any stylist" picks the free stylist with the fewest bookings that day (ties go by list order)
  - today hides starts before now rounded up to the next :00 or :30
  - *small pure functions that node can test*
- **Pure logic in its own file** (`slots.js`, counted in the 30 KB budget), with node tests in `docs/tests/`. *DEMOS.md has no slot for tests. /docs/ already 404s on Netlify, so the tests are never public.*
- **Toggle = the shared nav** with two items, "Customer view" and "Owner view": bottom tabs on phone, sidebar from 1024px. *It reuses the router, `aria-current` and focus-to-heading.*
- **State:**
  - wizard and diary UI state lives in the store (`ui.customer`, `ui.owner`)
  - views are only hidden, so switching back keeps everything
  - Reset clears it
  - *needs no new code in the shared kit*
- **One step at a time on every screen size.** Desktop adds the step list and a sticky summary. *One code path keeps it inside the budget.*
- **Keyed render:**
  - a list is rebuilt only when its inputs change (for example the slots rebuild only when date + service + stylist + bookings change)
  - selecting a choice just syncs `checked`
  - *otherwise every click would rebuild the DOM and lose focus*
- **Reschedule dialog is static markup** opened with `Demo.modal.open(el)`. *Built-in modal actions close before they run, so they can't validate a missing time.*
- **No shared CSS/JS changes.**
  - weekday names live in app.js
  - the only override is the toast offset above the phone Back/Next bar, in app.css
  - DEMOS.md gets one line about the extra logic file and tests (Phase 2)
- **Owner week on phone = 7 rows**, not a horizontal chip strip. *A count reads better as words ("4 bookings") than in a 47px chip. Easy to switch if Luan prefers chips.*

## Sample data outline (`data.js`, loaded after `slots.js`)
- **Hours:** Mon–Fri 08:00–17:00 · Sat 08:00–13:00 · Sun closed.
- **Services** (`{ id, name, min, price }`):

  | Service | Length | Price |
  |---|---|---|
  | Men's cut | 30 min | R 180 |
  | Cut and blow-dry | 60 min | R 350 |
  | Silk press | 90 min | R 650 |
  | Full colour | 120 min | R 950 |
  | Knotless braids | 180 min | R 1 250 |

- **Stylists** (`{ id, name, days, block }`):

  | Stylist | Works | Block |
  |---|---|---|
  | Lerato Mokoena | Mon–Sat | Lunch 12:00–13:00, Mon–Fri |
  | Zanele Dube | Mon–Sat | Afternoon off, Wednesday 13:00–17:00 |
  | Ruan Botha | Tue–Sat | Lunch 13:00–14:00, Tue–Fri |

- **Open days:** the next 7 dates from today (today included) that aren't Sundays. A date is `new Date(y, m, d + n)` turned into "YYYY-MM-DD" with `getFullYear/getMonth/getDate`.
  - Never `toISOString()` (UTC: the wrong day before 02:00 SAST).
  - Never `new Date("YYYY-MM-DD")` (parsed as UTC).
  - `Demo.fmt.date` already parses locally.
- **13 raw bookings** `[day 0–6, "HH:MM", stylist, service, customer]`. Phones are `+27 00 000 0011`… and ids are `MH-1001`….
  - d0: 08:30 Lerato, Cut and blow-dry, Naledi Mokoena · 10:00 Zanele, Silk press, Aisha Patel · 14:00 Ruan, Men's cut, Sipho Dlamini
  - d1: 09:00 Ruan, Full colour, Megan Fourie · 11:00 Lerato, Men's cut, Kabelo Molefe
  - d2: 08:00 Zanele, Knotless braids, Thandi Nkosi · 15:00 Lerato, Cut and blow-dry, Priya Naidoo
  - d3: 10:30 Ruan, Cut and blow-dry, Johan Pretorius · 13:30 Zanele, Full colour, Nomsa Zulu
  - d4: 09:00 Lerato, Silk press, Lindiwe Mahlangu · 11:30 Zanele, Men's cut, Thabo Mabaso
  - d5: 08:00 Ruan, Knotless braids, Fatima Ebrahim · d6: 10:00 Zanele, Cut and blow-dry, Anele Ndlovu
- **`BookingSlots.resolveSeed(raw, today)`** puts each booking on its date. Because the weekday depends on today, an entry can land on Ruan's Monday, a Saturday afternoon or Zanele's Wednesday. If it doesn't fit, it moves to another free stylist at the same time, and is dropped if none is free.
- **`DEMO_SEED`:** `{ business, services, stylists, hours, days, bookings, nextNo, ui }`, with `ui = { customer: { step: 1, stylist: "any", date: firstBookable }, owner: { mode: "day", date: days[0], highlight: null } }`.
- **First bookable day:** today if a free start remains after now, otherwise the next open day. This covers Sunday and after-closing visits.

## slots.js API (pure, `now` passed in; exports to `window.BookingSlots` and `module.exports`)
`ymd(date)`, `toHM(min)`, `openDays(today, n)`, `hoursFor(date, data)`, `isFree(stylist, date, start, dur, data, ignoreId)`, `freeStarts({ date, dur, stylist, data, now, ignoreId })` returns `[{ start, stylists[] }]`, `pickStylist(start, list, date, data)`, `firstBookable(...)`, `dayItems(date, data)` (bookings and blocks, sorted), `resolveSeed(raw, today)`.

## Desktop layout
**Customer (≥960px):** a 2-column grid, steps 2fr and summary 1fr.
- **Left column:**
  - step list: 1 Service · 2 Stylist · 3 Date and time · 4 Your details. Done steps are buttons; the current one has `aria-current="step"`.
  - the current step card
  - Back / Next inline
- **Right column:** a sticky summary card (top: bar height + gap) with service, stylist, date, time and price, and a "Change" button per row. Going back keeps later choices. A chosen time that's no longer free is cleared, with a note.
- **Confirmation:**
  - "You're booked" card and reference
  - the inline WhatsApp reminder (`Demo.previewEl`, which says "Preview only. Nothing was sent.")
  - buttons "See it in the owner's diary" and "Make another booking"

**Owner (day grid from 640px, week grid from 960px):**
- **Toolbar:** Day/Week (`aria-pressed`), Previous/Next ("Previous day/week"), Today, date label.
- **Legend:** Booking · New (accent fill, thick accent-strong border, "New" badge) · Moved ("Moved" badge) · Blocked (diagonal stripes and "Blocked:" text).
- **Day:**
  - CSS grid with a time gutter and 3 stylist columns, 18 half-hour rows (08:00–17:00)
  - items placed with `el.style.gridRow` (allowed by the CSP)
  - each column is a `section` labelled "Zanele's day", with items in time order
- **Week:**
  - 7 day columns of time-ordered chips ("09:00 Naledi · Cut and blow-dry")
  - each header is a button ("Sat 21 Nov, 4 bookings") that opens the day
  - Sunday says "Closed"
- **A booking button** opens the details modal (Cancel booking · Reschedule · Close).

## Phone layout (360px)
```
Customer step            Customer times           Confirmation
[Demo bar ············]  [Demo bar ············]  [Demo bar ············]
Step 1 of 4 ▓▓░░░░░░     Step 3 of 4 ▓▓▓▓▓▓░░     ✓ You're booked
Choose a service         Pick a date and time     Cut and blow-dry
(•) Cut and blow-dry     Fri Sat Mon Tue Wed..    Sat 21 Nov, 10:00
    60 min · R 350,00    [20][21][23][24][25]..   with Zanele
( ) Men's cut ...        Morning                  ┌ WhatsApp preview ┐
                         [08:00][08:30][09:00]    │ Hi Naledi, ...   │
                         [09:30][10:00][10:30]    └ Preview only ... ┘
[ Back ][    Next    ]   [ Back ][    Next    ]   [See it in the diary]
[Customer | Owner tabs]  [Customer | Owner tabs]  [Customer | Owner tabs]

Owner day (agenda)       Owner week (7 rows)
[Day|Week] ‹ Sat 21 ›    [Day|Week] ‹ 20–27 Nov ›
08:00–09:00 Naledi M.    Fri 20 Nov  3 bookings ›
  Cut and blow-dry       Sat 21 Nov  4 bookings ›
  with Lerato [New]      Sun 22 Nov  Closed
/// 12:00–13:00 Lerato   Mon 23 Nov  2 · 1 blocked ›
/// Blocked: lunch       ...
```
- The Back/Next bar is sticky just above the fixed tabs.
- The day strip is a 7-column radio row: about 47px per day at 360px, so it doesn't scroll. Full days are disabled and say "Full" in the accessible name.
- Times are 3 across, at least 44px, grouped Morning and Afternoon.
- No native date input (7 days is all a visitor needs, and the strip shows which days are full).
- There's no grid that scrolls sideways anywhere.

## Interaction details
- **Cancel:** the confirm modal ("Cancel Naledi's 10:00?" Keep it / Cancel booking) removes the booking and shows the toast "Booking cancelled".
- **Reschedule:**
  - static `<dialog class="demo-dialog" id="move-dialog">`: stylist select, day strip, time grid (the same builders as the customer view, with `ignoreId`)
  - Move checks the choice before calling `Demo.modal.close()`
  - after a move: toast "Moved to Sat 21 Nov, 11:00", the diary goes to that day with a "Moved" badge, then a WhatsApp preview ("your booking has moved")
- **Focus and announcements:**
  - switching views moves focus to the h2: "Customer view: book an appointment" / "Owner view: the diary"
  - a step change moves focus to the step h3 (`tabindex=-1`, "Step 3 of 4: Pick a date and time")
  - a missing choice shows a `field-error` tied to the fieldset with `aria-describedby`, and focus goes to the first radio
  - name and phone use `.form-field`. The phone check accepts 0XXXXXXXXX or +27XXXXXXXXX with spaces stripped.
  - name and phone are read on Next, so typing doesn't trigger a re-render
- **Calendar labels:**
  - bookings are `<button>`s labelled "Naledi Mokoena, Cut and blow-dry, 10:00 to 11:00, with Zanele. New booking."
  - blocks are plain text, not focusable ("Zanele, blocked 13:00 to 17:00: afternoon off")
- **The 2-minute path:**
  - customer hint: "Pick a service and a time. Then open Owner view to see it in the diary."
  - owner hint: "Tap a booking to cancel or move it. Your booking is marked New."
  - "Any stylist" and the first bookable day are preselected
  - "See it in the owner's diary" sets day mode on the booking's date and scrolls to it (no smooth scroll under reduced motion)

## File list (budget: data + slots + app + app.css ≤ 30 000 bytes)

| File | ≈ bytes | Notes |
|---|---|---|
| `software/demo/bookings/index.html` | 10 000 | copy of example; outside budget |
| `software/demo/bookings/data.js` | 3 000 | |
| `software/demo/bookings/slots.js` | 3 500 | loads after demo.js, before data.js |
| `software/demo/bookings/app.js` | 15 500 | |
| `software/demo/bookings/app.css` | 6 500 | accent, wizard, calendar, stripes, toast offset |
| `docs/tests/bookings-slots.test.js` | 3 000 | `node:test`; not public |

In budget: about 28.5 KB. If over: first drop the move preview, then simplify the week chips to counts only.

## Phase 2 checklist (build)
- [ ] Install Node LTS (`winget install OpenJS.NodeJS.LTS`). Done when: `node -v` prints v20 or higher.
- [ ] Copy example to `software/demo/bookings/` and update the head, h1, nav (2 items), WhatsApp text (`bookings`), back link `/software/#bookings`, and the slots.js script tag. Done when: the page opens with no console errors.
- [ ] `slots.js` and `docs/tests/bookings-slots.test.js`. Done when: `node --test docs/tests` passes. The tests cover:
  - Sunday and after-closing (first bookable day)
  - month rollover (30 Nov to 1 Dec)
  - a 180-min fit that stops at the lunch block and at closing
  - "Any stylist" pick
  - `ignoreId`
  - `resolveSeed` for all 7 start weekdays: no clashes, at least 11 bookings
- [ ] `data.js` per the outline. Done when: the seed has 5 services, 3 stylists and 11 to 13 bookings, with dates on open days only.
- [ ] Customer wizard: the 4 steps, summary, Change/Back, confirmation with the inline preview. Done when: a booking can be made with mouse and with keyboard only.
- [ ] Owner day and week views, desktop grid and phone agenda/rows, legend, highlight. Done when: the new booking shows "New" on its day, and blocked times show stripes and text.
- [ ] Cancel and reschedule modals, toasts and the move preview. Done when: both update the diary, and focus returns sensibly.
- [ ] Reset and the toggle keep state. Done when: switching views keeps the step and choices, and Reset restores the seed and step 1.
- [ ] Add the one-line DEMOS.md note (extra pure-logic file allowed inside the budget; tests in docs/tests).
- [ ] Commit "Booking demo: build" (no push). Update the Handoff log.

## Phase 3 checklist (QA and ship prep)
- [ ] DEMOS.md definition-of-done greps (Git Bash). Done when: every grep prints what DEMOS.md expects.
- [ ] Budgets: `wc -c` of data, slots, app and app.css. Done when: the total is 30 000 or less.
- [ ] Screenshots with headless Edge from a local node server at 360, 768 and 1280px, for: customer steps, confirmation, owner day/week, dialogs. Done when: no sideways scroll, the bar is one row at 360px, and the sidebar appears from 1024px.
- [ ] Keyboard-only pass, the full path from booking to diary to reschedule. Done when: Tab, Enter, Space and Esc work, focus is always visible, and it lands on step and view headings.
- [ ] Reduced motion (OS setting). Done when: there are no fades and no smooth scroll.
- [ ] Dates and money. Done when: every amount shows `R 1 234,56`, dates show `21 Nov 2026`, and no day is off by one when the clock is set to 00:30 and to 23:30.
- [ ] Contrast of `#e07a8a` re-checked by eye and recorded in the handoff note.
- [ ] Ship prep:
  - add the card link to `#bookings` (DEMOS.md snippet)
  - put back the demo wording that the 2026-11-20 hotfix removed (the note and FAQ answer, both the visible text and the JSON-LD; text from commit a1fbd5f)
  - the demo is not in sitemap.xml or robots.txt

  Done when: `/software/#bookings` lands on the card, and the demo's back link returns there.
- [ ] Update DEMOS.md if anything changed, commit "Booking demo: QA and link". No merge or push; Luan decides when to go live.

## Handoff log

### Handoff - Phase 1 (2026-11-20)
- **Decided:** everything above. Slug `bookings`; Node LTS gets installed at the start of Phase 2; no shared CSS/JS changes planned.
- **Already done this session:** demo-foundation was merged into main and pushed (live checks passed: noindex header, /docs/ 404). That merge put demo wording live too early, so a hotfix on main (`7cb64e2`) restored the old Software-page wording, and demo-booking was fast-forwarded to it. Phase 3 must restore the demo wording with the card link.
- **Luan to check:** salon name and suburb, prices, the rose accent; owner week on phone as 7 rows (rather than chips); the 13 sample customers' names.
- **Phase 2 reads first, in order:**
  1. this file
  2. `docs/DEMOS.md`
  3. `software/demo/example/index.html`, `app.js`, `data.js`
  4. grep `software/demo/demo.js` for `D.modal`, `D.previewEl`, `toDate`, `show` (don't read it in full)
  5. grep `software/demo/demo.css` for `.demo-tabs`, `.demo-toast`, `.demo-dialog`
