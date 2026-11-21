# Automations demo plan

Demo 2 of 5 on /software/. Path: `/software/demo/automations/` (slug `automations`, which matches the card id `automations` in `software/index.html` and DEMOS.md). Card: "Form and WhatsApp automations".
Phases: 1 plan (this file) · 2 build · 3 QA and ship.

The DEMOS.md rules are binding. Goal: a visitor gets the idea in under 2 minutes of clicking. It is not a product.

## 1. Summary and the 2-minute click path
Mopani Table Catering is a fictional East Rand caterer run by Thandi. The demo has one quote request form. When it's sent, a "What happens next" panel shows four automatic steps one by one: a WhatsApp confirmation to the customer, a WhatsApp alert to Thandi, a new row in the quote sheet, and a reminder set for 2 days later. Below that, a plain-words table compares doing the same 4 steps by hand with having them happen automatically.

Name check (21 Nov 2026): web searches for "Mopani Table" catering and for Mopani catering in Gauteng found no such business. "Mopani" is also a Limpopo district and a tree name, which is generic enough. Kept.

Click path:
1. The page opens on **Quote form**. The intro says what the demo shows, and "What happens next" shows an empty state.
2. Press **Fill with sample details**. All fields fill and a toast says "Sample details filled in. Press Send request."
3. Press **Send request**. The form is replaced by a short "Request sent" summary. Focus moves to the "What happens next" heading.
4. The steps appear about 1 second apart (1, 2, 3, 4), with a **Show all steps** button while they run. Each step has a "✓ Done" badge and either a message preview or the sheet.
5. Scroll down to **By hand or automatic**: 4 rows in words.
6. Optional: open the **Quote sheet** tab to see every column with the new row highlighted. Press **Send another request**, or Reset in the bar.

## 2. Desktop layout (from 1200px; the sidebar appears at 1024px as usual)
Two views in the nav: **Quote form** (default and Reset target) and **Quote sheet**.

```
┌ demo bar (shared) ───────────────────────────────────────────────┐
│ sidebar │ A fictional business, made up for this demo            │
│ Quote   │ Mopani Table Catering (h1)                             │
│  form ▌ │ Quote form (h2) + one-line intro                       │
│ Quote   │ ┌ Request a quote (form) ┐ ┌ What happens next ──────┐ │
│  sheet  │ │ [Fill with sample]     │ │ 1 ✓ WhatsApp to customer│ │
│         │ │ Name / WhatsApp        │ │   [preview bubble]      │ │
│         │ │ Event date / type      │ │ 2 ✓ Alert to Thandi     │ │
│         │ │ Guests / suburb        │ │ 3 ✓ Added to sheet      │ │
│         │ │ Budget / notes         │ │   [compact table]       │ │
│         │ │ [Send request]         │ │ 4 ✓ Reminder 23 Nov ... │ │
│         │ └────────────────────────┘ └─────────────────────────┘ │
│         │ ┌ By hand or automatic (full width table) ──────────┐  │
│         │ │ Step │ By hand │ Automatic                         │  │
│         │ └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```
- The columns are about 2 parts form to 3 parts steps. The steps column holds the empty state until the form is sent, so the layout doesn't jump.
- The compact sheet in step 3 has 5 columns: Received, Name, Event, Guests, Status. An "Open the full quote sheet" link goes to the Quote sheet view.
- Quote sheet view: one `Demo.table` with Received, Name, WhatsApp, Event, Event date, Guests, Suburb, Budget, Status.
- From 1024px to 1199px, and at 768px, it is a single column (section 3) at full card width.

## 3. Phone layout (below 640px; tabs at the bottom)
```
┌ demo bar ──────────────┐
│ kicker, h1, h2, intro  │
│ ┌ Request a quote ───┐ │
│ │ [Fill with sample] │ │
│ │ fields, 1 per row  │ │
│ │ [Send request]     │ │
│ └────────────────────┘ │
│ ┌ What happens next ─┐ │
│ │ empty state, then  │ │
│ │ steps 1–4 stacked  │ │
│ └────────────────────┘ │
│ By hand or automatic   │
│ (stacked cards)        │
├ Quote form | Quote sheet ┤
└────────────────────────┘
```
- Order: intro, form, What happens next, comparison.
- On submit, the form card becomes the "Request sent" summary (name, event, date, guests, and Send another request). Focus moves to the "What happens next" h3 (`tabindex="-1"`), which is scrolled into view. The scroll is smooth only under `no-preference`. That puts step 1 on screen right away.
- New steps appear below the heading, and the page does not auto-scroll after each one, so it never pulls against the user's own scrolling.
- The sheet in step 3 and the full Quote sheet view use `Demo.table`, which stacks into labelled cards below 640px (the shared stacked-card pattern). On phone, step 3 shows only the new row plus "and 4 earlier requests" and the link to the full sheet, so step 3 isn't five cards long.
- The comparison is also a `Demo.table`, so each row becomes a card: Step, By hand, Automatic.
- Previews use `Demo.previewEl` inline, at full width.

## 4. Files
Create:
- `software/demo/automations/index.html`: copied from `example/index.html`. Change the title, description, og/twitter tags, `og:url`, the `data-page="demo-automations"` attribute, the business name, the two nav items and views, WhatsApp text `...tried%20your%20automations%20demo.`, and the back link `/software/#automations`.
- `software/demo/automations/data.js`: `window.DEMO_SEED` with business, owner, the option lists, `nextNo`, sample `requests`, `prefill`, and comparison rows.
- `software/demo/automations/app.js`: form, validation, prefill, step sequence and timer, sheet and comparison rendering, then `Demo.init`.
- `software/demo/automations/app.css`: sets `--demo-accent: #e0874f` (terracotta, a food and warmth feel that is different from the gold, blue and rose already used), the two-column grid from 1200px, step list styles, and a highlight on the new row (`--demo-accent-tint` background plus a "New" badge, so it isn't colour alone).
- No pure-logic file. The logic (date + 2 days, validation) is too small to be worth one.
- Budget estimate: data.js about 4 KB, app.js about 12 KB, app.css about 2.5 KB. That is roughly 19 KB of the 30 KB allowed.

Accent contrast (sRGB script, same method as DEMOS.md): navy-900 on `#e0874f` = 6.22; accent-strong on paper = 4.95; on paper-card = 5.35; on tint = 4.91. All pass.

Reused from `software/demo/demo.js` and the shared CSS, not rewritten: `Demo.init`/`store`, `Demo.table`, `Demo.previewEl`, `Demo.badge`, `Demo.empty`, `Demo.toast`, `Demo.fmt.date/time/number`, `Demo.el`, `Demo.onReset`, `Demo.uid`, `.form-field`/`.field-error`, `.demo-card`, `.demo-actions`, `.btn`.

**Shared file changes: none.** Notes:
- Step announcements use a demo-only visually hidden `role="status"` region inside the steps panel. The shared toast hides after 5 s and would flash four times.
- The highlight class goes on the `tr[data-id]` after `Demo.table` renders.
- The step timer and step DOM are handled in app.js and only ever appended to. Re-rendering every second would destroy focus and previews.

## 5. Sample data and copy

**Business:** Mopani Table Catering, East Rand. Owner Thandi Mahlangu, WhatsApp `+27 00 000 0009`.

**Page copy (me, Luan):**
- Kicker: "A fictional business, made up for this demo"
- Quote form intro: "This is a quote form I built for a made-up caterer. Send it and watch what happens by itself afterwards. Nothing is really sent: the messages are previews."
- Empty state: title "Nothing sent yet", text "Send the form to see what happens next."

**Form "Request a quote"** (all `.form-field`, `<label for>`):

| Field | Label | Type | Rule and error message |
|---|---|---|---|
| name | Your name | text, required | "Enter your name." |
| phone | WhatsApp number | tel, required | 10 digits starting with 0, or +27 and 9 digits (spaces allowed). "Enter a South African mobile number: 10 digits starting with 0, or +27 and 9 digits." |
| date | Event date | date, required, min = today | "Choose the date of your event." / "Choose a date from today onwards." |
| type | Type of event | select, required ("Choose one") | "Choose the type of event." |
| guests | Number of guests | number, 10–500 | "Enter the number of guests, from 10 to 500." |
| suburb | Suburb of the event | text, required | "Enter the suburb where the event is." |
| budget | Budget (optional) | select | none |
| notes | Anything else? (optional) | textarea, maxlength 300 | none |

- Buttons: "Fill with sample details" (secondary, above the fields) and "Send request" (primary).
- Event types: Wedding, Birthday party, Corporate event, Year-end function, Family gathering, Other. The sentence forms are "your wedding", "your birthday party" and so on, with "your event" for Other.
- Budget options, built in app.js with `"R " + Demo.fmt.number(n)`: Not sure yet / Under R 5 000 / R 5 000 to R 15 000 / R 15 000 to R 30 000 / Over R 30 000.
- Validation runs on submit only. Each error goes in its `field-error` span, and the field gets `aria-invalid="true"`. Focus goes to the first invalid field, and a field's error clears when the user edits it.

**Prefill:** Lerato Nkosi, `+27 00 000 0005`, event date = today + 21 days (worked out live so it's always valid), Wedding, 80 guests, Brakpan, R 15 000 to R 30 000. Notes: "Mostly finger food, with two vegetarian options please. The venue has a kitchen we can use."

**Sample sheet rows** (fixed ISO dates; phones `+27 00 000 0001` to `0004`):

| Received | Name | Event | Event date | Guests | Suburb | Budget | Status |
|---|---|---|---|---|---|---|---|
| 16 Nov 2026 | Sipho Dlamini | Birthday party | 5 Dec 2026 | 40 | Benoni | R 5 000 to R 15 000 | ✓ Quote sent (ok) |
| 17 Nov 2026 | Annelie Botha | Wedding | 13 Mar 2027 | 120 | Kempton Park | Over R 30 000 | ! Follow-up due (warn) |
| 18 Nov 2026 | Kagiso Molefe | Corporate event | 11 Dec 2026 | 60 | Germiston | R 15 000 to R 30 000 | ✓ Booked (ok) |
| 19 Nov 2026 | Fatima Patel | Year-end function | 12 Dec 2026 | 25 | Edenvale | Not sure yet | – No budget given (neutral) |

New row: received today, status "i Reminder set" (info), plus the "New" badge and highlight. Each "Send another request" adds another row. Only the latest row is highlighted.

**Steps** (h3 "What happens next", ordered list; first a line "Request received at 14:05" using `Demo.fmt.time`). The example values below are for a request sent on 21 Nov 2026:
1. **WhatsApp confirmation sent to Lerato**. `Demo.previewEl({ channel: "whatsapp", to: "Lerato Nkosi, +27 00 000 0005", body })`:
   "Hi Lerato, thanks for your quote request for your wedding on 12 Dec 2026 (80 guests, Brakpan). I've got all the details and I'll send you a quote within 2 days. If anything changes, just reply here. Thandi, Mopani Table Catering"
2. **Alert sent to Thandi** (WhatsApp to "Thandi Mahlangu, +27 00 000 0009"):
   ```
   New quote request
   Lerato Nkosi, +27 00 000 0005
   Wedding on 12 Dec 2026
   80 guests, Brakpan
   Budget: R 15 000 to R 30 000
   Notes: Mostly finger food, …
   It's in your quote sheet and a reminder is set for 23 Nov 2026.
   ```
   (The budget and notes lines are left out when empty.)
3. **Added to the quote sheet**: "A new row was added with every detail from the form." Then the compact table and "Open the full quote sheet".
4. **Follow-up reminder set for 23 Nov 2026 at 09:00**. The date is the submit date + 2 days, in local time, formatted with `Demo.fmt.date`, and the time is fixed at 09:00. Text: "On that morning Thandi gets this message:" then a preview:
   "Reminder: Lerato Nkosi asked for a quote for a wedding on 12 Dec 2026, 2 days ago. If you haven't sent it yet, now's a good time."
   Small print: "In a real build, the reminder is cancelled once the quote is marked as sent."

- Every preview carries the shared "Preview only. Nothing was sent." label.
- Screen reader announcements: "Step 1 of 4: WhatsApp confirmation sent to Lerato (preview)." through to "Step 4 of 4: Follow-up reminder set for 23 Nov 2026." Under reduced motion or Show all, there is one announcement: "All 4 steps done."

**By hand or automatic** (h3, `Demo.table`, columns Step / By hand / Automatic):

| Step | By hand | Automatic |
|---|---|---|
| Confirm to the customer | Thandi sees the request when she gets a chance, then types a WhatsApp reply herself. | The customer gets a WhatsApp confirmation as soon as they press Send. |
| Tell the owner | The request waits in an inbox until someone checks it. | Thandi gets one alert on her phone with all the details. |
| Record the request | Someone copies the details into a spreadsheet or notebook, if they remember. | A new row is added to the quote sheet with every field filled in. |
| Follow up | Thandi has to remember which quotes are still open. | A reminder is set for 2 days later, so open requests don't slip through. |

Under it (me): "Want something like this for your own forms? Use the WhatsApp button at the top and tell me what happens after someone contacts you." There are no numbers or claims about time saved.

## 6. Accessibility and reduced motion
- One h1 (the business), one h2 per view. "Request a quote", "What happens next" and "By hand or automatic" are h3s.
- Form: a label on every field, errors linked with `aria-describedby`, `aria-invalid`, focus on the first error, `novalidate`, and `inputmode="tel"` on the phone field. The event date uses the native date input with `min`.
- Steps: an `<ol>`. Each step's title states the result, and the badge says "✓ Done". Announcements go through the demo-only `role="status"` region as short text only. The cards themselves are not live regions, so previews aren't read twice.
- Timing: step 1 appears 1 s after submit, then one more each second, about 4 s in all. That is under 5 s, so WCAG 2.2.2 doesn't apply, and "Show all steps" is there anyway. Focus only moves to the button if the user moves it there. When the steps finish the button is removed, and if focus was on it, focus moves to the heading.
- `prefers-reduced-motion: reduce` (checked with `matchMedia` at submit): all four steps appear at once, with no smooth scroll and no fade. Under `no-preference`, each step fades in over about 200 ms. This is the only new motion. DEMOS.md says the toast and dialog fades are the only animation, so Phase 3 adds one line there for the step fade.
- Highlighted row: the tint plus a "New" badge with the word. Ink on tint is about 13:1.
- "Send another request" clears the form and moves focus to the Name field. The timer is cancelled on Reset (`Demo.onReset`) and on Send another request.
- Tap targets are 44px or more, and Tab, Enter and Space all work. The phone and date fields stay one per row at 360px.

## 7. Checklists
**Phase 2: build**
- [x] Copy `example/` to `automations/`; update the head, bar, nav, views and back link.
- [x] data.js: seed as in section 5.
- [x] app.css: accent, 1200px grid, step list, new-row highlight, fade under no-preference only.
- [x] app.js: option lists, prefill (today + 21), validation and errors, submit leading to the summary, focus and scroll, step sequence with timer, Show all, reduced motion, live announcements.
- [x] Step 3 compact sheet (all rows on desktop, the new row plus a count on phone) and the full Quote sheet view with the highlighted row.
- [x] Comparison table.
- [x] Send another request, plus Reset clean-up through `Demo.onReset` (timer, summary, errors, step panel back to the empty state).
- [x] Reminder date checked across a month end (submitting on 30 Nov gives 2 Dec) with a quick node check of the same function.
- [x] Budget check (≤ 30 000 bytes). Commit `demo(automations): build`.

**Phase 3: QA and ship**
- [ ] Run the DEMOS.md definition-of-done greps and fix anything they flag.
- [ ] Manual list: 360, 768 and 1280px, keyboard only, screen reader announcements (NVDA or Narrator), reduced motion, Reset, `R 1 234`-style formatting, the preview label, and no console errors.
- [ ] Full click path in under 2 minutes in a phone-sized window.
- [ ] Record the accent contrast in the handoff. Add the step-fade line to DEMOS.md.
- [ ] Add the "Try the demo" link to the `#automations` card in `software/index.html`. Check that the slug, the card id and the back link match.
- [ ] Confirm the demo is not in the sitemap and not disallowed in robots.txt.
- [ ] Update the handoff. Commit `demo(automations): link from Software page, QA`.

## 8. Open questions
Resolved: Luan confirmed all four defaults on 21 Nov 2026 ("use what you think is the best").
1. Thandi's alert is a WhatsApp preview, to match the card title. It could be an email preview instead, to show both channels.
2. There is a second "Quote sheet" tab, because a 9-column sheet doesn't fit next to the form. The alternative is to keep everything on one screen.
3. The step fade-in stays, and Phase 3 adds a line about it to DEMOS.md. The alternative is no fade.
4. The guest range is 10 to 500.

## Handoff: Phase 1
- **Decided:** every brief default kept. The business is Mopani Table Catering (East Rand, owner Thandi Mahlangu); the name check found no real business. The form has a "Fill with sample details" button. Steps appear 1 s apart, with Show all, all at once under reduced motion, and screen reader announcements. The reminder is submit date + 2 days at 09:00, formatted with `Demo.fmt.date`. The sheet starts with 4 sample rows and the new row is highlighted. Wording stays generic, and Reset restores everything.
- **Added by me:**
  - A second view, "Quote sheet", for the full 9-column table.
  - The accent `#e0874f` (contrast in section 4).
  - The owner alert as a WhatsApp preview.
  - A demo-only `role="status"` region for step announcements.
  - A guest range of 10 to 500.
  - A step fade under `no-preference` (needs a DEMOS.md line in Phase 3).
  - No shared file changes.
- **Changed by Luan:** nothing. The plan was approved as written, and Luan then confirmed the four defaults in section 8.
- **Phase 2 starts with:** copying `software/demo/example/` to `software/demo/automations/`, then data.js from section 5, then app.js and app.css, working down the Phase 2 checklist.

## Handoff: Phase 2
- **Built:** `/software/demo/automations/` as planned. Two views (Quote form, Quote sheet). Form with "Fill with sample details" (event date = today + 21) and submit-only validation (errors linked, `aria-invalid`, focus on the first invalid field, error clears on edit). Submit swaps the form for a "Request sent" summary and moves focus to the "What happens next" heading. Steps 1 to 4 appear 1 s apart with a "Show all steps" button; under reduced motion all four appear at once. Announcements go through the demo-only `role="status"` region. Step 3 shows the compact sheet (all rows on desktop, new row plus "and N earlier requests" on phone). New row has the tint plus a "New" badge, and only the latest is highlighted. Comparison is a `Demo.table`, words only. "Send another request" and Reset both return form, steps and sheet to the start, and cancel the timer. No network, no storage.
- **Files:** new `software/demo/automations/` (`index.html`, `data.js` 2.2 KB, `app.js` 11.2 KB, `app.css` 1.6 KB; 15.0 KB of 30 KB). Plan file ticked.
- **Shared-file changes:** none. DEMOS.md not changed in this phase.
- **Checked (headless Chrome, scripted):** no console errors on load, validation, prefill, submit, Show all, Send another, Reset (also Reset while steps were still running), at 1280px and 360px. No sideways scroll at either width. Reminder date on 30 Nov gives 2 Dec (and 27 Jan gives 1 Mar). Step texts match section 5. Reduced motion: all four steps and "All 4 steps done." at once, no button. The DEMOS.md grep checks for storage, network, external URLs, noindex, inline script/style and `/script.js` came back clean.
- **Not done / worth a look:**
  - Not tested by hand: 768px, keyboard-only, a real screen reader, and a real phone. The fade, the smooth scroll on phone, and the look of step 3's 5-column table at 1200 to 1300px (it scrolls sideways inside its box if too tight) need an eye.
  - The notes line in the owner alert is cut at about 48 characters with "…".
  - `body.part` helper was removed; no stray files.
- **Phase 3 should check first:** the remaining DEMOS.md checklist items by hand (768px, keyboard, Narrator, reduced motion with the real OS setting), the step-fade line for DEMOS.md, then the card link, sitemap and robots checks. Card link and sitemap were deliberately not touched.
