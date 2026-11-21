# Client portal demo: plan

**Context.** The "Client portals and record keeping" card on /software/ is the last of the five cards without a demo. This demo lets a visitor log in as a client of a fictional bookkeeping practice, reply to a quote, open an overdue invoice and preview its reminder, download a document, then switch to the practice's view and export a CSV. All of that should take under 2 minutes. It is built on the shared kit (`software/demo/demo.css`, `demo.js`) following `docs/DEMOS.md`. No shared file changes are needed for the build.

---

## 1. Decisions

### Names (all fictional, marked as such on the page)
- **Practice: Quillstone Bookkeeping**, Benoni. Bookkeeper: Anika van Wyk. An invented word, so it's unlikely to match a real firm. Not VAT-registered.
  - The sample PDF is made out to *Larkspur Lane Physiotherapy*. That's a client business, not a bookkeeping practice, so it becomes the demo client and the PDF fits the story as the practice's monthly report to them.
- **Demo client: Larkspur Lane Physiotherapy**, Bedfordview. Contact Nomvula Dlamini, `nomvula@example.com`, `+27 00 000 0001`.
- **Other clients** (practice view only, summary numbers only):

| Client | Suburb | Outstanding | Overdue | Quotes waiting | Last activity |
|---|---|---|---|---|---|
| Bluegum Auto Repairs | Germiston | 4 200 | 2 100 (1) | 0 | −1 day, "Viewed invoice INV-0450" |
| Mopane Tree Catering | Kempton Park | 0 | 0 | 1 | −3, "Quote Q-0119 sent" |
| Kestrel Print Studio | Benoni | 2 650 | 0 | 0 | −6, "Paid INV-0439" |
| Brightwater Plumbing | Edenvale | 7 900 | 5 400 (2) | 0 | −12, "Invoice INV-0444 sent" |
| Wagtail Pre-school | Alberton | 1 300 | 0 | 1 | −2, "Accepted quote Q-0114" |

  Why these numbers: three rows match "Overdue only" and three don't, so the filter visibly does something.
- **Accent: `#9b87e0`** (lavender). The other demos already use orange, pink, teal, sky blue and the example's blue. Measured by script with the DEMOS.md formula: navy-900 on the accent **5.57**, accent-strong on paper **5.23**, on paper-card **5.64**, on the tint **5.14**. All pass AA.

### Data model (`data.js`, `window.DEMO_SEED`)
Dates in the seed are **day offsets from today** (`issued: -33`). Before `Demo.init`, app.js turns them into ISO strings once, using today's date, and passes that copy as the seed. Why: every visit is built around today, and Reset restores exactly what the visitor first saw.
- `practice`: `{ name, suburb, bookkeeper }`
- `client`: `{ id: "larkspur", name, suburb, contact, email, phone }`
- `quotes[]`: `{ id, number, title, detail, amount, per: "month" | "once", sent, validUntil, status: "waiting" | "accepted" | "declined", decided, reason }`
  - Q-0121 "Monthly bookkeeping and management accounts", R 2 400,00 per month, waiting
  - Q-0122 "Annual financial statements", R 6 500,00 once-off, waiting
  - Q-0109 "Monthly payroll, up to 5 staff", R 720,00 per month, accepted 40 days ago
- `invoices[]`: `{ id, number, issued, due, paid | null, lines: [{ desc, qty, rate }] }`. The amount is always worked out from the lines, never stored. Why: it can never disagree with the lines.

| Invoice | Line | Issued | Due | Paid | Amount |
|---|---|---|---|---|---|
| INV-0412 | Monthly bookkeeping, <month> | −95 | −65 | −66 | 1 850,00 |
| INV-0431 | Monthly bookkeeping, <month> | −64 | −34 | −36 | 1 850,00 |
| INV-0447 | Monthly bookkeeping, <month> | −33 | **−3** | – | 1 850,00 |
| INV-0452 | Payroll, <month> | −5 | +25 | – | 720,00 |
| INV-0455 | Provisional tax return preparation | −2 | +12 | – | 950,00 |

  `<month>` is the month before the issue date, filled in at start-up so the label always fits the dates.
- `documents[]`: `{ id, name, type, date, file | null }`
  - "Monthly summary", PDF, −14 days, file = the sample PDF. The PDF names no month, so the date can move with today.
  - **New sample PDF** (made in Phase 2, replacing the current file at the same path):
    - One A4 page in the standard Helvetica font (nothing embedded), about 3 KB.
    - Written by a throwaway node script, not kept in the repo.
    - Content:
      - "Larkspur Lane Physiotherapy", with the line "Monthly summary, prepared by Quillstone Bookkeeping".
      - The big "SAMPLE, FICTIONAL" mark and the "Demo document…" line.
      - The same income and expense figures as now, written the en-ZA way ("R 61 600,00").
      - Notes with no month names ("up 8% on the previous month").
    - Why: it matches the demo's story and the site's number format, and it never looks old.
  - "Payroll report", PDF, −6, example entry
  - "Fixed asset register", Spreadsheet, −30, example entry
  - "Engagement letter (signed)", PDF, −150, example entry
- `reminders`: `{ on: true, email: true, whatsapp: true, before7: true, onDue: true, overdue: true }`
- `others[]`: the five rows above, as `{ id, name, suburb, outstanding, overdue, overdueCount, quotesWaiting, last, lastText }`
- `activity[]`: the demo client's log, newest first. The seed has `{ date: −2, text: "Invoice INV-0455 sent" }`. Accept, Decline and Save add entries.

### State shape
```
{ ...seed, ui: { loggedIn: false, overdueOnly: false, lastClientView: "overview",
  tips: { login, quote, reminder, download, csv } } }
```
Everything Reset must restore lives in the store, so `Demo.reset()` restores it in one go. Reset logs out and returns to the login screen, because "restores everything" includes the session. Log out only sets `loggedIn: false` and keeps the data.

### How the client and practice views share one state
- There is one `Demo.store`. The demo client's practice-table row is **calculated** from the same `quotes`, `invoices` and `activity` arrays the client view shows. It is never a copy, so accepting a quote changes "Quotes waiting" in both places on the next render.
- Views are kit views: `login`, `overview`, `quotes`, `invoices`, `documents`, `reminders`, `practice`, passed to `Demo.init({ views })` with `login` first, so it's the default and the Reset target.
- The nav lists only the five client sections, so the kit's limit of five or fewer holds. `practice` is reached only through the header switch.
- app.js sets `data-mode="login | client | practice"` on `.demo-app` from the current view. app.css hides the nav and drops the sidebar column for `login` and `practice`.
- A `hashchange` guard sends any portal view back to `login` while logged out. On page load the hash is replaced with `#view-login`, because reload always starts logged out.

### Status and totals (pure functions in `calc.js`)
- `amount(inv)` = Σ qty × rate, rounded to cents.
- `status(inv, today)` = `paid` if `paid` is set, else `overdue` if `due < today` (comparing ISO strings), else `due`. Only INV-0447 is unpaid with a past due date, and the offsets move with today, so **exactly one is overdue on any day**. Phase 2 checks this in node over 400 simulated days.
- Badges: Paid `ok` ✓, Due `info` i (with "Due in 12 days"), Overdue `error` ✕ (with "3 days overdue").
- `clientTotals`:
  - outstanding = Σ unpaid
  - overdue = Σ overdue, plus the count
  - quotesWaiting = count of `waiting`
  - last = `activity[0]`
- Practice tiles = the demo client's totals + Σ `others`.
- **Seed totals:**
  - Client: outstanding R 3 520,00; overdue R 1 850,00 (1 invoice); 2 quotes waiting.
  - Practice: outstanding R 19 570,00; overdue R 9 350,00 (4 invoices); 4 quotes waiting.
- **"Next things to do"** (Overview): an ordered list of up to 3 items, the first being "the next thing":
  1. the overdue invoice, with a View button
  2. quotes waiting for a reply, with Go to quotes
  3. the next due invoice

  Paying isn't possible in the demo, so a single "next thing" would never change. The list does: the quotes item disappears once both quotes are answered.

### Quotes
- Accept opens a `Demo.modal` titled "Accept quote Q-0121?", with a summary and the buttons Cancel / Accept quote.
- Decline opens the same kind of modal with an optional "Reason (optional)" textarea (`<label for>`, maxlength 200). app.js reads it in the action's `onClick`; the element is still in memory after the dialog closes.
- On confirm:
  - the status and decided date are set and an `activity` entry is added;
  - the toast says "Quote Q-0121 accepted. Quillstone Bookkeeping can see your reply.";
  - the buttons are replaced by a badge (Accepted `ok`, Declined `neutral`) and any reason.
- Step 2 of "Try this" ticks on Accept.

### Invoice modal (View)
- It shows: practice name, invoice number and badge, bill to, issue and due dates, the lines as a `dl` list (no table, so nothing scrolls sideways on a phone), the total, and "No VAT charged. Quillstone Bookkeeping is not VAT-registered."
- How to pay: "EFT, using the invoice number as the reference. Banking details are left out of this demo." **No Pay now button.**
- Buttons: Close. The overdue invoice also gets **Preview reminder**, which opens the reminder preview after the modal closes (kit behaviour) and ticks step 3.

### Reminders
- A form: "Send me invoice reminders" (on/off checkbox), the fieldset "Send by" (Email, WhatsApp), and the fieldset "When" (7 days before the due date, On the due date, When an invoice is overdue). Native checkboxes in rows at least 44px tall.
- The form is a draft until **Save**. Save writes to the store, adds an activity entry and shows the toast "Saved for this visit only". Form values are written from the store only on login, Save and Reset (an `onReset` hook), so a re-render never wipes unsaved ticks.
- **Preview reminder** uses the current ticks and the real sample overdue invoice (INV-0447). It opens one modal titled **"Simulated reminder"** containing `Demo.previewEl` for each ticked channel: WhatsApp first, then email.
  - The kit draws the WhatsApp-style bubble with no logo, and the label "Preview only. Nothing was sent."
  - If overdue reminders or all reminders are off, a line above the preview says "With your current settings this message would not be sent."
  - With no channel ticked, the toast says "Tick Email or WhatsApp to preview a reminder." (tone `error`).
- WhatsApp text: "Hi Nomvula, a friendly reminder from Quillstone Bookkeeping: invoice INV-0447 for R 1 850,00 was due on 18 Nov 2026 and is now 3 days overdue. You can view it in your client portal. If you've already paid, please ignore this message. Thank you." The email has the same body plus the subject "Reminder: invoice INV-0447 is overdue". The dates and amounts are calculated, never typed in.

### Documents
- A `Demo.table` with the columns Name, Type, Date and an action column.
- Only the monthly summary has a link: `<a class="btn btn-secondary demo-btn--sm" href="/software/demo/client-portal/sample-monthly-summary.pdf" download="larkspur-lane-SAMPLE-monthly-summary.pdf">Download PDF (3 KB)</a>`. Clicking it ticks step 4.
- The others show the muted text "Example entry" and no button.

### CSV export (practice view)
- Built in `calc.js` and downloaded with a Blob and a temporary `<a download>`; the object URL is revoked straight after.
- Format: UTF-8 BOM, CRLF line endings, RFC 4180 quoting (any field with `,`, `"` or a newline is quoted, and `"` is doubled).
- Columns: **Date, Invoice number, Client, Description, Amount, Status, Due date, Paid date**.
  - Dates are ISO `YYYY-MM-DD`; Paid date is empty when unpaid.
  - Amount is `1850.00`, with a dot and no symbol.
  - Status is Paid, Due or Overdue as of today.
- Rows: the demo client's 5 invoices, the only invoices with detail.
- Filename: `quillstone-SAMPLE-invoices-YYYY-MM-DD.csv`.
- The toast says "CSV downloaded: 5 sample invoices", and step 5 ticks.
- Why CSV and not the .xlsx DEMOS.md recommends: you asked for it, and an import into accounting software usually takes a CSV, unlike a report people read in a spreadsheet. I'll add that distinction to DEMOS.md in Phase 3.

### "Try this" (5 steps, each ticks itself off)
1. Log in as the demo client.
2. Accept a quote.
3. Open the overdue invoice and preview its reminder.
4. Download the sample monthly summary.
5. Switch to Practice view and export the CSV.

The full list shows on the login screen and on Overview. A one-line "Try this, step 3 of 5: …" sits in the portal header so the next step is visible from any section. When all 5 are done: "That's the whole demo. If you'd like something like this for your clients, WhatsApp me."

### Copy
- en-ZA, plain. My voice (first person) only in the kicker, the login note and the "Try this" end line. The portal UI speaks as the product.
- No claims about security, encryption or POPIA. Accounting software is never named.

---

## 2. Desktop layout (from 1024px)
- **Every screen:** the kit demo bar on top, then the kicker "A fictional bookkeeping practice, made up for this demo" and the h1 "Quillstone Bookkeeping" at the top of `main`.
- **Login** (`data-mode="login"`, no sidebar, main is full width):
  - A centred card (max about 28rem) with the h2 "Client portal".
  - The line "You'll log in as Nomvula Dlamini from Larkspur Lane Physiotherapy."
  - A full-width primary **Log in as demo client** button.
  - The muted line "This is a demo. Nothing is checked and there's no password." No email or password fields of any kind.
  - The "Try this" card sits under the login card, the same width.
- **Shared sidebar** (kit, 15rem, sticky): `demo-brand` "Quillstone Bookkeeping", then Overview, Quotes, Invoices, Documents, Reminders.
- **Portal header** (above the views in client and practice mode, hidden on login): one row.
  - Left: "Logged in as **Nomvula Dlamini**, Larkspur Lane Physiotherapy".
  - Right: the segmented switch **Client view | Practice view** (two buttons with `aria-pressed`, in `role="group"` labelled "Portal view"), then a **Log out** button (secondary, small).
  - Under the row: the one-line "Try this" next step.
- **Overview:** 3 stat tiles (`.demo-grid`) for Outstanding, Overdue (amount + "1 invoice") and Quotes waiting. Below them, the "Next things to do" card and the "Try this" card side by side (2 columns).
- **Quotes:** quote cards in a 2-column grid, waiting quotes first. Each card shows the number, title, detail, amount + "per month" or "once-off", sent and valid-until dates, then Accept (primary) and Decline (secondary) in a `.demo-actions` row.
- **Invoices:** a real `Demo.table` (Number, Description, Issued, Due, Amount, Status, View).
- **Documents:** a real `Demo.table`.
- **Reminders:** one form card (max about 36rem) with the Save and Preview reminder buttons at the bottom.
- **Practice view** (`data-mode="practice"`, sidebar hidden, full width):
  - The h2 "Practice view", plus the line "What Quillstone Bookkeeping sees. Your demo client's row updates when you act in the client view."
  - **3 tiles on top:** Total outstanding, Overdue (amount + invoice count), Quotes waiting.
  - **Toolbar:** the "Overdue only" checkbox on the left; on the right, the **Export for accounting software** button with the line under it: "A generic CSV that most accounting packages can import. Nothing is connected."
  - **Clients table** (`Demo.table`): Client, Outstanding, Overdue, Quotes waiting, Last activity ("Today · Accepted quote Q-0121"). The demo client's name carries an `info` badge "Demo client".
- **Modals:** the kit's native `<dialog>`, centred over the page. That covers the quote confirmations, the invoice and the reminder preview. The reminder preview always opens as a modal, whether it starts from the invoice or from Reminders: one code path, and focus comes back to the button that opened it.

## 3. Phone layout (360–414px)
- **Login:** the same card at full width with a full-width button, and "Try this" below it. No bottom tabs on login.
- **Navigation:** the kit's bottom tabs with the five sections, shown in client mode only. They're hidden on login and in practice view, where the header switch is the way back.
- **Portal header:**
  - Row 1: "Logged in as Nomvula Dlamini" (with the client name on the line below) and a small **Log out** on the right.
  - Row 2: the **Client view | Practice view** switch at full width (two 50% buttons, 44px tall).
  - Then the one-line "Try this" next step.
- **Overview:** the tiles stacked in one column, then "Next things to do", then "Try this".
- **Quotes:** stacked full-width cards. **Accept and Decline sit side by side at the bottom of each card** (50/50, 44px or taller), Accept first and primary. A decided quote shows its badge in place of the buttons.
- **Invoices:** `Demo.table` turns into stacked cards below 640px (kit behaviour). The View button is the last row of each card.
- **Documents:** stacked cards. The Download link is a full-width button; example entries show "Example entry".
- **Reminders:** a single-column form, with Save and Preview reminder stacked at full width.
- **Practice view:**
  - The 3 tiles stacked.
  - Then the "Overdue only" checkbox.
  - Then **Export at full width with the help line under it, above the table**, so you don't have to scroll past 6 cards to find it.
  - Then the clients as stacked cards (kit `Demo.table`).
- **Modals:** the kit dialog. The invoice lines are a `dl`, so nothing scrolls sideways.

---

## 4. Files
New, under `software/demo/client-portal/`:
- `index.html`: copied from `example/`, with the title, description, og tags and og:url changed. WhatsApp text `...tried%20your%20client-portal%20demo.`, back link `/software/#client-portal`. Scripts in order: `demo.js`, `calc.js`, `data.js`, `app.js`.
- `calc.js`: the pure-logic file (no DOM): day offsets to ISO, amount, status, totals, days between, reminder text, CSV string. It can be tested in node.
- `data.js`: the seed.
- `app.js`: rendering, handlers, router guard, downloads, `Demo.init`.
- `app.css`: the accent, `data-mode` nav hiding, portal header and segmented switch, login card, quote card grid, checkbox rows.
- `sample-monthly-summary.pdf`: replaced in Phase 2 by the new version (same path and name). The current one goes into the Phase 1 commit, so it stays in git history.

Budget: the target is about 30 000 bytes for data.js + calc.js + app.js + app.css (my estimate is 3.5 + 3 + 20 + 3 KB). The owner approved going over if needed, and the final size gets recorded in DEMOS.md.

Shared files: **none for the build.** Phase 3 only:
- `software/index.html`: add the demo link to the card, and change "exported to Sage or Xero" to "exported for your accounting software". The card is visible text only, so check the FAQ and schema for the same wording.
- `docs/DEMOS.md`: add client-portal to the linked list, the note on CSV for accounting imports, and the client-portal budget exception with its final size.

## 5. Checklists

### Phase 2: build
- [x] Copy `example/` → `client-portal/`; fill in the head, bar and nav (5 items), the 7 views, one h1 and one h2 per view.
- [x] `calc.js`, plus a throwaway node test (not kept): exactly one overdue for 400 consecutive "todays"; seed totals as in §1; CSV has a BOM, CRLF, dot decimals, ISO dates and correct quoting.
- [x] `data.js` exactly as §1; offsets turned into ISO dates once at start-up.
- [x] Login and logout, the `data-mode` switch, the hash guard; Reset lands on login with everything restored.
- [x] Overview tiles + "Next things to do"; "Try this" ticking + the header line.
- [x] Quotes: Accept and Decline with confirm, the optional reason, toast, activity entry, and the practice row updating.
- [x] Invoices table + invoice modal (no Pay now, the no-VAT line); Preview reminder only on the overdue one.
- [ ] New sample PDF generated (throwaway script); open it and check it by eye (Quillstone line, comma decimals, no month names, SAMPLE mark). (Generated and structure-checked in node; not yet opened in a viewer, so do that first in Phase 3.)
- [x] Documents: a single `<a download>`; the others show "Example entry".
- [x] Reminders: the draft form, Save toast "Saved for this visit only", the preview built from INV-0447, and the not-sent line when settings would block it.
- [x] Practice view: tiles, the Overdue only filter, the table with the demo client's badge, Export CSV with the help line.
- [ ] `app.css`: accent `#9b87e0`, existing tokens only; 5 bottom tabs fit at 360px (if "Documents" or "Reminders" doesn't fit, tighten the tab font in app.css only). (Written, with the tab font tightened below 480px; the fit at 360px is not yet seen in a browser.)
- [x] Run the DEMOS.md definition-of-done greps; record the total size (target about 30 000 bytes, more allowed).
- [x] Update `## Handoff: Phase 2` and PLAN.md; commit "Client portal demo: phase 2 build".

### Phase 3: switch on and QA
- [ ] Definition of done (greps + the hand list in DEMOS.md), with no console errors.
- [ ] Add `<a class="concept-demo-link" href="/software/demo/client-portal/" data-demo-link="client-portal">Try the demo <span aria-hidden="true">↗</span></a>` as the last child of `#client-portal` in `software/index.html`. The slug must equal the folder name and the card id. In the same card, change "exported to Sage or Xero" to "exported for your accounting software", and grep the site for any other "Sage" or "Xero".
- [ ] Confirm `/software/#client-portal` lands on the card and the back link goes there.
- [ ] Indexing per DEMOS.md: `noindex, follow` meta present, the netlify `X-Robots-Tag` covers `/software/demo/*`, **not** in `sitemap.xml`, not disallowed in `robots.txt`, no canonical.
- [ ] Desktop at 1280, 1024 and 768; phone at 360 and 414: no sideways scroll, the bar on one row, tabs at the bottom in client mode only, tables stacking.
- [ ] Keyboard only: login, the switch, Accept and Decline dialogs (Esc, focus return), invoice → Preview reminder, the form, Export.
- [ ] Reduced motion: no fades. Contrast of `#9b87e0` re-checked by eye.
- [ ] **Real phone:** the PDF downloads and opens; the CSV downloads and opens in a spreadsheet app with the columns separated, dates as YYYY-MM-DD and amounts as numbers.
- [ ] Desktop: the CSV opens cleanly (the BOM keeps the encoding right).
- [ ] Update DEMOS.md (linked list, CSV note), `## Handoff: Phase 3` and PLAN.md; commit. I'll ask you before merging to `main`.

## 6. Risks and open questions (answered by Luan)
1. **The Software card says "exported to Sage or Xero",** which names accounting software. **Decided:** in Phase 3 I'll change it to "…and records exported for your accounting software".
2. **The preview label:** **decided** to keep the kit's "Preview only. Nothing was sent." and title the modal "Simulated reminder". No shared-kit change.
3. **The sample PDF:** **decided** to replace it with a new one in Phase 2 (details under Documents in §1). It will match the story, use comma decimals and never go out of date.
4. **Budget:** **owner approved** using what's needed. I'll still aim for about 30 KB and record the final size in DEMOS.md, the same way job-cards' exception is recorded.
5. **Reset logs you out** and lands on the login screen. **Accepted.**

---

## Handoff: Phase 1

### Decided
- **Names:** practice Quillstone Bookkeeping (Benoni, not VAT-registered); demo client Larkspur Lane Physiotherapy (Bedfordview, Nomvula Dlamini); 5 other clients with fixed summary numbers (§1).
- **Accent:** `#9b87e0`, measured 5.57 / 5.23 / 5.64 / 5.14 (all pass AA).
- **Views:** `login` (first, so it's the default and the Reset target) plus the five client sections in the nav, plus `practice`, reached through the header switch. `data-mode` on `.demo-app` hides the nav on login and in the practice view.
- **Data:** dates in `data.js` are day offsets, turned into ISO strings once before `Demo.init`. Invoice amounts come from the lines. The practice row for the demo client is calculated from the same state, never copied.
- **Status:** `paid`, then `due < today` gives overdue, otherwise due. Only INV-0447 can be overdue (−3 days).
- **CSV columns:** Date, Invoice number, Client, Description, Amount, Status, Due date, Paid date. UTF-8 BOM, CRLF, dot decimals, ISO dates, no currency symbol.
- **Luan's answers:**
  - In Phase 3, change "Sage or Xero" on the card.
  - Keep the kit preview label and title the modal "Simulated reminder".
  - Replace the sample PDF in Phase 2.
  - The budget can go over 30 KB if needed.
  - Reset logs out.

### Phase 2 must watch
- **Load order:** `demo.js`, `calc.js`, `data.js`, `app.js`. Pass `views` to `Demo.init` explicitly, with `login` first.
- **The router runs on `hashchange` separately from render:** add app.js's own `hashchange` guard (logged out → `#view-login`), and set `#view-login` with `replaceState` before `Demo.init` on load.
- **`Demo.modal` actions close the dialog before `onClick`:** read the Decline reason from the textarea element you kept a reference to. Preview reminder from the invoice modal relies on this too.
- **The reminders form is a draft:** write its values from the store only on login, Save and the `onReset` hook, never in every `render`.
- **Hiding the nav:** when it's hidden on login and in practice, the kit's `body` padding for the bottom tabs still applies. Override it in app.css for those modes. On desktop, set `.demo-app` to one column.
- **The 5 bottom tabs at 360px:** check "Documents" and "Reminders" fit; adjust the tab font in app.css only.
- **The new PDF:** standard Helvetica (no embedded font), the same figures in en-ZA format ("R 61 600,00"), no month names, the SAMPLE mark kept, and the same path and filename.
- **Test `calc.js` in node:** one overdue across 400 simulated days, the seed totals (client R 3 520,00 / R 1 850,00 / 2; practice R 19 570,00 / R 9 350,00 (4) / 4), and CSV quoting.
- **Never name accounting software.** No claims about security, encryption or POPIA. No email or password fields.

---

## Handoff: Phase 2

### Built
- **New files** in `software/demo/client-portal/`: `index.html`, `calc.js`, `data.js`, `app.js`, `app.css`.
- **Replaced:** `sample-monthly-summary.pdf` (same path). One A4 page, standard Helvetica, 3 404 bytes, "Monthly summary, prepared by Quillstone Bookkeeping", comma decimals, no month names, SAMPLE mark. The generator was a throwaway script and is not kept.
- **Shared files:** none changed (so nothing to add to DEMOS.md in this phase).
- **Size:** data.js 3 430 + calc.js 4 768 + app.js 14 636 + app.css 5 819 = **28 653 bytes**, under the 30 000 budget. No exception needed, so Phase 3 only records the size and `calc.js` in DEMOS.md.
- Accent `#9b87e0`, existing tokens only.

### Checked in node (throwaway test, not kept)
- Exactly one overdue invoice on each of 400 consecutive days.
- Client totals R 3 520,00 / R 1 850,00 / 2 and practice totals R 19 570,00 / R 9 350,00 (4) / 4, on all 400 days.
- CSV: BOM, CRLF, dot decimals, ISO dates, empty Paid date when unpaid, quoting of commas and quotes.
- Reminder text: dates and amounts come from the data.
- Definition-of-done greps: no storage or network calls, no external URLs, noindex present once, no inline style or script, no missing asset paths, ids unique, one h1. `node --check` passes on all three JS files.

### NOT checked (the browser could not be driven in this session)
My attempt to start a local server and headless Chrome was blocked by the permission check, so **nothing has been run in a browser yet**: no console check, no click-through of the 5 steps, no desktop or phone layout check, no CSV opened in a spreadsheet, and the new PDF has not been opened by eye. The code is written to the plan but is untested in a page.

### Decisions I made that the plan did not spell out
- The reminder preview ticks step 3 from either place (invoice modal or Reminders page), because both use the same code.
- The CSV object URL is revoked 1 second after the click, not instantly, so slower phone browsers still get the file.
- Practice-view table: the Overdue cell shows the invoice count in brackets when above 0; zero amounts show as R 0,00.
- The "Download" column header on Documents, "Details" on Invoices (for the View button).
- Below 480px the bottom-tab font drops to 0.75rem so five tabs fit.

### Known risks to look at first
- The five bottom tabs at 360px ("Documents", "Reminders").
- The 7-column Invoices table at 1024px (it may feel tight with the sidebar).
- Portal header on phone (grid with Log out top right, switch full width below). It uses `display: contents`.
- Focus after Accept or Decline (the buttons are re-rendered, so focus should go to the Quotes heading).
- The PDF layout (right-aligned amounts use hand-measured Helvetica widths).

### Phase 3 should test first
1. Open the page cold: no console errors; reload lands on login.
2. The 5 steps on desktop, then at 360px.
3. Accept a quote, then Practice view: the demo row shows one fewer waiting quote and "Today · Accepted quote …".
4. Exactly one overdue invoice, with its badge, and "Preview reminder" only on that one.
5. Download the PDF and open it by eye; export the CSV and open it in Excel or Sheets.
6. Reset from every view lands on login with reminders ticked as in the seed.
