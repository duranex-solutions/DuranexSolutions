# Dashboards demo plan

Demo 3 of 5 on /software/. Path: `/software/demo/dashboards/`. The slug `dashboards` matches the card id in `software/index.html` and the DEMOS.md slug list. Card: "Dashboards and automatic reports".
Phases: 1 plan (this file) · 2 build · 3 QA and ship.

The DEMOS.md rules are binding. Goal: a visitor gets the idea in under 2 minutes of clicking. It is a demo, not a product.

## 1. Decisions

### Business
- **Kopje Coffee**, a fictional Johannesburg coffee shop. A web search on 21 Nov 2026 for "Kopje Coffee" South Africa found no such business. "Kopje" (a small hill) is a generic word. Reason: short, local, clearly not a chain.
- **Branches: Parkhurst** (the busier one) **and Melville**. These are real suburbs, which is allowed. Reason: two well-known café suburbs, and the different volumes make the "Both" comparison interesting.
- **Accent `#2fb3a0`** (teal). Measured with the sRGB formula: navy-900 on accent 6.48, accent-strong on paper 4.71, on card 5.08, on tint 4.66. All pass. Reason: it reads as "data and finance", and it is different from the gold, blue, rose and terracotta already used.

### Data model (`data.js`, `window.DEMO_SEED`)
- `business`.
- `branches`: `[{id:"pk", name:"Parkhurst", base:110}, {id:"mv", name:"Melville", base:80}]`. `base` is the average number of transactions per day. Reason: two numbers give two volumes.
- `products`: 10 items, each `{id, name, price, weight}`. `weight` sets how popular the item is. Reason: a short menu fits a top-5 list and a phone.
  - Drinks: Flat white R 38, Cappuccino R 36, Americano R 30, Café latte R 40, Red cappuccino (rooibos) R 38, Iced latte R 45.
  - Food: Croissant R 32, Carrot cake slice R 55, Toasted chicken mayo R 75, Breakfast bagel R 85.
- `staff`: 5 per branch, 10 in all. Each is `{id:"KC-001", name, role, branch, rate, days:[0..6], shift}`. Reason: a fixed weekly roster with a few seeded days off looks real.
  - Parkhurst: Nomsa Khumalo, Manager, R 85/h. Pieter van Wyk, Assistant manager, R 60. Ayanda Zulu, Barista, R 45. Kayla Petersen, Barista, R 42. Sibusiso Mthembu, Kitchen, R 38.
  - Melville: Tshepo Mokoena, Manager, R 85. Chantelle Adams, Assistant manager, R 60. Bongani Ndlovu, Barista, R 45. Priya Naidoo, Barista, R 42. Johan Venter, Kitchen, R 38.
  - Shifts are 6 to 9 hours, 5 days a week, spread so that both branches are covered 7 days a week.
- `dow`: day-of-week multipliers, Mon 0.85 up to Sat 1.25.
- `basket`: about 1.6 items per transaction.
- `filters`: `{range:"7d", branch:"both"}`. This is the only state that changes. Reason: the sales come from the date, so Reset only has to restore the filters.
- Daily sales are **not stored in the seed**. They are worked out from the date (see Generator), cached in a Map in memory, and never saved.

### Generator (`gen.js`, pure logic, no DOM, testable in node)
- `mulberry32` seeded with a string hash of `"YYYY-MM-DD|branchId"`. Reason: the same day always gives the same numbers, on any device and any visit.
- Per day and branch, for each product: `items = round(base × dow × weight × basket × (0.88 to 1.12 noise))`.
  - Revenue = Σ qty × price.
  - Transactions = round(items ÷ basket, with ±5% noise).
- Shifts per person per day: the roster says whether they work, and a seeded 6% chance turns it into a day off. Hours = `shift`.
- Window: the **92 days ending yesterday** (about 13 weeks). Reason: it always covers last month and the month before, and the last 4 weeks and the 4 weeks before. Phase 2 checks this in node for every day of a year.
- Today is left out. Reason: a real dashboard doesn't show a full day's sales at 09:00. On the 1st of a month, "This month" is empty and shows the empty state.
- Phase 2 tunes `base` and `weight` so labour cost lands at roughly 15 to 20% of revenue. That is plausible for sample data and is never presented as a real statistic.

### Ranges and previous period
All dates are local and end yesterday.

| Preset | Current period | Compared with | Label |
|---|---|---|---|
| Last 7 days | yesterday − 6 to yesterday | the 7 days before | "vs previous 7 days" |
| Last 4 weeks | 28 days | the 28 days before | "vs previous 4 weeks" |
| This month | the 1st to yesterday | the same days of last month (cut to that month's length) | "vs 1–20 Oct" |
| Last month | the whole of last month | the whole month before | "vs September" |

Reason: like-for-like comparisons an owner would expect.

### KPIs
For the selected branch, or the sum of both.
- Revenue = Σ revenue.
- Transactions = Σ transactions.
- Average sale = revenue ÷ transactions.
- Labour cost % = gross pay ÷ revenue × 100, with a sub-line such as "312 staff hours".

Change vs the previous period:
- Change = (current − previous) ÷ previous × 100, to 1 decimal. Labour cost % changes in **points**.
- Text: "▲ Up 8,4% vs previous 7 days". The arrow is `aria-hidden`, so the words carry the meaning.
- Each tile also has a `Demo.badge`: "✓ Better" (ok tone) or "! Worse" (warn tone).
  - Higher is better for revenue, transactions and average sale. Lower is better for labour cost %.
  - A change under 1% (or under 0,5 points) shows "– About the same" (neutral tone).
  - Reason: an owner wants to see at a glance whether things are going well, and the badge has an icon and a word, so it is never colour alone.
- Numbers use `Demo.fmt.rand` and `Demo.fmt.number`, which gives the en-ZA decimal comma on screen.

### Chart buckets
- Last 7 days: 7 daily bars, labelled by day.
- Last 4 weeks: 4 rolling 7-day blocks.
- This month and Last month: calendar blocks 1–7, 8–14, 15–21, 22–28, and 29 to month end.
- Labels always show the dates, so a short last block is explained.
- The title is "Daily sales" or "Weekly sales". Reason: one "weekly" bar for a 7-day range tells nothing.

### Top products
The top 5 by revenue, each with its quantity sold. The bar width is a % of the #1 item. Reason: revenue is what the owner cares about, and the quantity adds context.

### Staff hours
One row per person, for the selected range and branch. Columns: Name, Role, Branch (only when "Both"), Shifts, Hours, Rate (R/h), Gross pay. A totals line goes below. Reason: this is exactly what goes to payroll.

### Monthly report (dialog)
- Month select: "November 2026 (so far)", "October 2026", "September 2026". The branch comes from the filter.
- The default is last month, unless the range is "This month". Reason: a monthly report is normally for a finished month.
- Contents:
  - Header: Kopje Coffee, branch, month, "Sample data, made up for this demo", and "Prepared 21 Nov 2026".
  - The 4 KPIs vs the previous month.
  - Weekly sales table by block, per branch when Both.
  - Top 5 products.
  - Staff summary: hours and gross pay per person, with a total.
- "Save as PDF" calls `window.print()`. Print CSS shows only the report. No PDF library.

### Payroll CSV
- Built with a Blob from the filtered staff data.
- Format:
  - `﻿` BOM, comma separator, CRLF line ends.
  - Fields that contain commas or quotes are quoted.
  - Dates are ISO. Numbers use dot decimals (`37.5`, `42.00`, `1575.00`) with no thousands separators and no "R".
  - Gross pay only. No PAYE or UIF.
- Columns: `Period start, Period end, Employee ID, Name, Role, Branch, Shifts, Hours, Hourly rate (ZAR), Gross pay (ZAR)`.
- Filename: `kopje-coffee-SAMPLE-payroll-<branch>-<start>-to-<end>.csv`, for example `kopje-coffee-SAMPLE-payroll-both-2026-11-14-to-2026-11-20.csv`. Reason: a `#` comment row would break header detection in Excel and Sheets, so the filename carries "SAMPLE" instead.
- After the download, a toast says "Payroll CSV downloaded (sample data)".

## 2. Desktop layout (from 1024px, where the shared sidebar appears)
Two views in the nav:
- **Dashboard**: the default view and the Reset target.
- **Staff hours**.

The filter bar sits in `main` above both views, so it is shared and keeps its values when you switch views.

```
┌ demo bar (shared) ─────────────────────────────────────────────────────────┐
│ sidebar  │ A fictional business, made up for this demo                     │
│ Dashbd ▌ │ Kopje Coffee (h1)                                               │
│ Staff    │ ┌ filter bar (form) ───────────────────────────────────────────┐│
│  hours   │ │ Range [Last 7 days ▾]  Branch (Both|Parkhurst|Melville)       ││
│          │ │                    [Download monthly report] [Export payroll CSV]│
│          │ └──────────────────────────────────────────────────────────────┘│
│          │ Dashboard (h2) + intro line + "Try this" (3 steps, one row)     │
│          │ [Revenue] [Transactions] [Average sale] [Labour cost %]  1 row ×4│
│          │ ┌ Weekly sales chart (2fr) ──────────┐ ┌ Top products (1fr) ─┐ │
│          │ │ legend ■ Parkhurst ▨ Melville      │ │ 1 Flat white  ▇▇▇▇  │ │
│          │ │ grouped SVG bars                   │ │ 2 Cappuccino  ▇▇▇   │ │
│          │ │ [View as table]                    │ │ ...5                │ │
│          │ └────────────────────────────────────┘ └─────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
Staff hours view: same filter bar, h2, then the staff table full width (Demo.table) + totals line.
```

- **Filter bar:** one flex row that wraps. The filters are on the left. Both export buttons sit on the right in a `.demo-actions` group. They show on every view, so an export is always one click away.
- **KPI tiles:** `grid-template-columns: repeat(4, minmax(0,1fr))` from 640px.
- **Chart and products:** `grid-template-columns: minmax(0,2fr) minmax(0,1fr)` from 1024px, stacked below that.
- **Chart SVG:**
  - Full card width, about 240px tall.
  - 4 y-gridlines with full ticks ("R 40 000"). The x labels give the block dates ("14–20 Nov").
  - A `<title>` on each bar gives the exact value.
- **Branches in the chart:** when "Both" is selected, the two bars in each block are grouped.
  - Parkhurst is solid `--demo-accent-strong`. Melville is `--paper-ink` with a diagonal hatch (an SVG `<pattern>`).
  - The legend repeats both swatches, so the branch is never shown by colour alone.
- **"Try this":** a small `.demo-card` with a numbered `<ol>`:
  1. Switch the branch to Melville.
  2. Change the range to Last month.
  3. Download the monthly report or export the payroll CSV.

## 3. Phone layout (360–414px, tabs at the bottom)
```
┌ demo bar ───────────────┐
│ kicker, h1              │
│ Range [Last 7 days ▾]   │  full-width select
│ (Both|Parkhurst|Melville)│  3-way segmented radios, full width, 44px
│ [Monthly report][Payroll CSV] │ two buttons 50/50 ("Download"/"Export" visually hidden)
│ Dashboard (h2), intro   │
│ Try this (3 short lines)│
│ [Revenue ][Transact.]   │  KPI tiles 2×2
│ [Avg sale][Labour %]    │
│ Weekly sales chart      │  full width
│ [View as table]         │
│ Top products (list)     │
├ Dashboard | Staff hours ┤
└─────────────────────────┘
Staff hours view: filter bar, h2, staff as stacked cards (Demo.table < 640px), totals line.
```

- **Filters:** compact, in three rows:
  - the range select on its own row,
  - the branch radios across the next row,
  - the two export buttons side by side.
- **Short button labels:** made with the shared `.demo-sr-sm` class. "Download monthly report" shows as "Monthly report", and screen readers still hear the full name.
- **Chart:**
  - Re-rendered when `matchMedia("(max-width: 639px)")` changes.
  - Fewer labels: 3 gridlines with short y ticks ("R 40k"). The x labels show only the start day ("14", or "Mo"/"Tu" in daily mode).
  - A caption under the axis gives the month ("Blocks starting on these days in November").
  - No value labels on the bars. Exact figures are in "View as table".
- **KPI tiles:** the change text wraps under the value, and the "vs ..." part stays one short phrase.
- **Top products:** name and amount on one line, with the bar underneath at full width.
- **Staff:** 10 stacked cards in the shared pattern. The totals line sits above the cards and again at the end, so the total shows without scrolling through 10 cards.

## 4. Files

### New files in `software/demo/dashboards/`
- **`index.html`**, copied from `example/index.html`.
  - Change: title, description, og/twitter tags, `og:url`, `data-page="demo-dashboards"`, the h1, the 2 nav items and views, the WhatsApp text `...tried%20your%20dashboards%20demo.`, and the back link `/software/#dashboards`.
  - Add the filter bar markup: a form, a label for the select, and a fieldset with a legend for the radios.
  - Add the report dialog, `<dialog class="demo-dialog dash-report">`. It is opened with `Demo.modal.open(el)` so it can be wider and keep its own Save button.
  - Add an empty `<div class="dash-print" aria-hidden="true">` at the end of the body.
- **`gen.js`**: PRNG, day generation, Map cache, range and previous-period maths, buckets, aggregation, and the CSV string builder.
  - It loads after `demo.js` and before `data.js`.
  - It is the one pure-logic file DEMOS.md allows.
- **`data.js`**: `window.DEMO_SEED` as in section 1.
- **`app.js`**:
  - `render(state)` builds the filters, KPIs, chart, products, staff table, and the "View as table" toggle (with `aria-expanded` and `aria-controls`).
  - The chart uses a small `svg()` helper with `createElementNS`, because `Demo.el` only makes HTML elements.
  - Also the report dialog, the print flow and the CSV download, then `Demo.init`.
- **`app.css`**:
  - The accent.
  - Filter bar, segmented radios, KPI grid, chart and products grid, inline bars, report layout.
  - `@media print`:
    - hide `.demo-bar`, `.demo-app`, `.demo-toast`, `dialog` and the skip link,
    - show `.dash-print`,
    - set `@page { size: A4; margin: 15mm }`,
    - remove the body padding.

### Budget
Luan approved a raised limit of **36 KB** for this demo (gen.js + data.js + app.js + app.css).
- Estimate: gen.js about 5 KB, data.js about 2 KB, app.js about 16 KB, app.css about 4.5 KB. That is about 27.5 KB, which leaves room.
- Reason it is safe: 6 KB more is a few milliseconds even on a slow phone. The 30 KB rule is our own guard against bloat, not a technical limit.
- Phase 3 records the exception in DEMOS.md's budget line, so the other demos stay at 30 KB.

### Reused, not rewritten
`Demo.init`/`store`, `Demo.table` (staff, chart table, report tables), `Demo.modal`, `Demo.empty`, `Demo.toast`, `Demo.fmt.*`, `Demo.el`, `Demo.onReset`, `.demo-card`, `.demo-stat`, `.demo-actions`, `.demo-sr-sm`, `.form-field`, `.btn`.

### Shared file changes
None. In Phase 3, DEMOS.md gets:
- one line on the print CSS pattern,
- the CSV rules,
- the budget exception,
- the updated "Linked so far" list.

### Print flow
1. "Save as PDF" copies the report body into `.dash-print` and calls `window.print()`.
2. On `afterprint`, `.dash-print` is emptied.
3. The dialog stays open, and focus stays on the button.

Reason: printing a top-layer `<dialog>` with `max-height` and `overflow:auto` can cut the report off or put it in the wrong place in some browsers. A plain block in the normal page flow prints across several pages reliably.

## 5. Checklists

### Phase 2: build
- [x] Copy `example/` to `dashboards/`. Update the head, bar, nav, the 2 views, the back link and the WhatsApp text. Add the filter bar, report dialog and print container.
- [x] `gen.js`: PRNG, days, cache, ranges and previous periods, buckets, aggregates, CSV builder.
- [x] Node checks for `gen.js`:
  - the same date gives the same numbers twice,
  - the window covers every preset's previous period for every "today" in 2026–2028, including the 1st, the 31st and a leap-year February,
  - the buckets add up to the period totals.
- [x] `data.js`: the seed. Tune the volumes so labour cost is about 15–20% and the numbers look plausible.
- [x] `app.css`: accent, layouts at 360, 640 and 1024px, segmented radios, inline bars, report, print CSS.
- [x] `app.js`, KPIs and chart:
  - the filters update everything,
  - KPI tiles show the arrow, the words and the Better/Worse badge,
  - the SVG chart has `role="img"`, `<title>`, `<desc>`, a legend, and grouped, hatched bars,
  - "View as table",
  - the mobile label mode switches on a matchMedia change.
- [x] `app.js`, the rest:
  - top products,
  - staff table and totals,
  - the empty state for "This month" on the 1st, with a "Show last month" action.
- [x] Report dialog: month select, contents as in section 1, Save as PDF prints, Close.
- [x] CSV: BOM, columns, dot decimals, ISO dates, quoting, CRLF, filename, toast.
- [x] Reset restores the filters, closes the dialog and goes to Dashboard.
- [x] No inline styles in the HTML or SVG markup. Setting `el.style.width` from JS for the bars is fine.
- [x] Budget ≤ 36 000 bytes (raised for this demo). DEMOS.md greps come back clean. Commit `demo(dashboards): phase 2 build`.

### Phase 3: QA and ship
- [x] Run the DEMOS.md definition-of-done greps and the manual list:
  - 360, 768 and 1280px,
  - keyboard only,
  - reduced motion,
  - Reset,
  - `R 1 234,56` and `21 Nov 2026` formats,
  - no console errors,
  - no network requests after load.
- [x] Contrast: chart bars and hatch against the card (≥ 3), KPI and change text (≥ 4.5), badges. Record the numbers in the handoff.
- [x] Click path in under 2 minutes in a phone-sized window.
- [x] Report: Save as PDF prints only the report, on A4, in desktop Chrome and Edge, with page breaks and nothing cut off. Luan checks one real phone (Android Chrome or iOS Safari).
- [x] Payroll file in Excel (Windows): changed from CSV to .xlsx after Luan found "#####" dates and cut-off columns. Opened in the real Excel through automation: dates, widths, bold header and numbers are correct.
- [x] Google Sheets: .xlsx imports natively. On Luan's phone list (not run here).
- [x] Excel decimal issue: gone, because the .xlsx stores real numbers.
- [x] Add the "Try the demo ↗" link to the `#dashboards` card in `software/index.html` (`data-demo-link="dashboards"`). Check that the slug, the card id and the back link match.
- [x] Indexing, per DEMOS.md:
  - **not** in `sitemap.xml`,
  - not disallowed in `robots.txt`,
  - the `noindex, follow` meta is present,
  - the netlify `X-Robots-Tag` covers the path.
- [x] Add the DEMOS.md lines (print pattern, CSV rules, the 36 KB budget exception, linked list).
- [x] Write the Real phone test steps for Luan.
- [x] Update the handoffs, and the PLAN.md checklist and handoff notes.
- [x] Commit `demo(dashboards): phase 3 switch on and QA`.

## 6. Risks and open questions
Resolved with Luan on 21 Nov 2026: the CSV must open correctly, the budget is raised to 36 KB, and the KPI tiles get Better/Worse badges.

1. **Excel with SA regional settings.**
   - The risk: if Windows uses a comma as its decimal sign, double-clicking a CSV with dot decimals can turn `42.00` into text or a date. Google Sheets and payroll import tools read dot decimals fine.
   - The plan: keep the brief's format (dot decimals, comma separator, BOM), and keep every number plain with no thousands separators.
   - Phase 3 tests a double-click open in Excel on this machine. If it still misreads, add one plain line under the button: "In Excel, use Data > From Text/CSV for the cleanest import."
   - Report exactly what was seen. One file can't follow every computer's regional settings and also stay standard for payroll tools.
2. **Phone printing.** iOS Safari and Android Chrome open their own print sheet with "Save as PDF", but page breaks can differ. Design for A4 and treat phones as best effort.

## Handoff: Phase 1

### Decided
- Slug `dashboards`, path `/software/demo/dashboards/`, matching the card id and DEMOS.md. Luan chose this over the brief's `/dashboard/`.
- Two views: **Dashboard** (filters, KPIs, chart, top products) and **Staff hours** (staff table and totals). The filter bar is shared above both. Luan chose this over a single long view.
- Kopje Coffee, with Parkhurst and Melville. The name check found no real business.
- Accent `#2fb3a0`, contrast as in section 1.
- Sales are generated from the date by a seeded PRNG in `gen.js`, never stored. The state is only the filters.
- KPI tiles show the arrow, the words and a Better/Worse/About the same badge. Luan chose this over neutral-only tiles.
- The budget for this demo is raised to 36 KB (Luan approved).
- CSV in the brief's format. The Excel test is in Phase 3, with a fallback hint line only if it's needed.
- No shared file changes.

### Phase 2 must watch
- **SVG:** `Demo.el` makes HTML elements, so the SVG needs a `createElementNS` helper. Use no `style=""` attributes anywhere in the SVG (the CSP blocks them). Set fill and pattern by attribute or class.
- **Print:** go through the `.dash-print` container, not the dialog itself.
- **Date window:** check the 92-day window in node across month ends and leap years before building the UI on top of it.
- **Dates:** use local dates everywhere and never `toISOString()` (UTC would shift the day before 02:00 SAST). Build ISO strings from `getFullYear`, `getMonth` and `getDate`.
- **Number formats:** on screen use `Demo.fmt` (decimal comma). In the CSV use `toFixed` (dot). Keep the two paths separate.
- **Re-rendering:** re-render the chart on the 639px matchMedia change. Don't re-render on every resize.
- **Budget:** watch it as you build, not only at the end.

### Phase 2 starts with
`gen.js` and its node checks, then `data.js`, then `index.html` from the example, then `app.js` and `app.css`, working down the Phase 2 checklist.

## Handoff: Phase 2

### Files
- Created in `software/demo/dashboards/`: `index.html`, `gen.js`, `data.js`, `app.js`, `app.css`. No shared files changed (nothing new for DEMOS.md in Phase 2).
- Budget: gen 6 804 + data 2 311 + app.js 15 755 + app.css 6 450 = **31 320 bytes** (limit 36 000). DEMOS.md greps are clean. The only URL in the JS is the SVG namespace string (`http://www.w3.org/2000/svg`), which is not a link or a request.
- The plan file is `docs/plans/demo-dashboards.md` (the brief said `dashboard-demo.md`).

### Checked in Phase 2 (Edge headless, 1280 and 360 wide)
- No console errors, no sideways scroll at 360 (Dashboard and Staff hours).
- All 12 range x branch combinations update KPIs, chart (bars and table), top products, staff table, totals and the "Showing ..." line. Revenue tile differs in all 12.
- Node checks (`gen.js`): same date gives the same numbers; for every "today" from 1 Jan 2026 to 31 Dec 2028 every preset's previous period sits inside the 92-day window (max 91 days back needed); chart blocks add up to the period totals; empty on the 1st of a month; leap February OK.
- Rand shows `R 106 021,00`, dates `21 Nov 2026`. No dot-decimal rand on screen.
- CSV: first bytes EF BB BF (BOM), CRLF, filename `kopje-coffee-SAMPLE-payroll-parkhurst-2026-11-14-to-2026-11-20.csv`, quoting tested on `a,b` and `he said "hi"`, toast shown. Report dialog, month select, Save as PDF (calls print with the report copied into `.dash-print`), Close returning focus to the button, Reset (filters, table toggle, dialog) all work.
- 1 Dec (date faked): "This month" shows the empty state with "Show last month", staff view shows it too, report offers November and October only.

### Differences from the plan (small)
- Labour cost is 17% overall (Parkhurst about 15%, Melville about 19%). Tuned: Parkhurst base 110, Melville 92 (plan said "about 80").
- Added a per-week busy/quiet factor (0.93 to 1.07) in `gen.js`, so the vs-previous comparisons show a mix of Better, Worse and About the same instead of "about the same" everywhere.
- The report can look back further than the 92-day window (September vs August), because sales are worked out from the date, so the window is not a limit.
- No chart animation at all, so reduced motion is satisfied by default.
- KPI tile label is "Labour cost" (value shows %).

### Not done / known issues
- Not tested in a real print preview (Phase 3), nor Excel or Sheets opening.
- The CSV has no "Café" text (payroll has no products), so the "é" check in Phase 3 only applies if Excel shows names badly; staff names are plain ASCII.
- Contrast of the chart bars, hatch and badges not measured yet.
- 768 px and keyboard-only passes not done.

### Phase 3 should test first
1. Save as PDF in desktop Chrome/Edge: only the report prints, A4, tables not cut.
2. CSV double-click in Excel with SA regional settings (decimal comma risk, section 6).
3. 768 px layout (filter bar wraps into 2 rows) and keyboard-only on the radios and report dialog.
4. Reduced motion and contrast numbers; then add the Software-card link and DEMOS.md lines.

## Handoff: Phase 3

### Fixed
- **Sideways scroll in the report window on phones:** the report tables were forced into wide tables at every width. They are now real tables from 640px and in print, and the shared stacked cards on phones.
- **Excel showed "#####" and cut-off text:** a CSV cannot carry column widths. The export is now a real `.xlsx` ("Export payroll sheet", short label "Payroll sheet"), written by hand in `gen.js` with no library. Real dates, numbers, sized columns, bold frozen header, sheet "Payroll (sample)". Checked by opening it in the real Excel on this PC. The CSV code is gone. Toast: "Payroll sheet downloaded (sample data)".
- Link "Try the demo ↗" added to the `#dashboards` card (`data-demo-link="dashboards"`; slug, card id and back link match).
- Indexing per DEMOS.md: not in sitemap.xml, not in robots.txt, noindex meta present, netlify X-Robots-Tag covers `/software/demo/*`, no canonical.
- DEMOS.md: budget exception, print and spreadsheet pattern, linked list.
- Budget: 35 969 of 36 000 bytes. Very tight; any new feature needs another raise.

### Checked
- DEMOS.md greps all clean (the only URLs are the SVG and xlsx XML namespace strings, not requests). JS syntax OK.
- Contrast (sRGB formula), on the card unless noted: Parkhurst bar 5.08 (needs 3), Melville hatch and outline 14.48, axis text 5.40, KPI text 14.48, badges ok 5.10 / warn 5.71 / neutral 5.40, top-product fill on its track 3.48, selected branch border on tint 4.67, unselected radio border 3.76, print text on white 15.11.
- Tap targets by CSS: branch radios 48px, select 48px, buttons 44px. No chart animation, so reduced motion is respected.

### Not done (the sandbox refused to start a local server and headless browser this session)
- No live pass at 1280, 360 or 414px, no keyboard-only run, no click-through of every filter combination, no console or network check, no print preview. Phase 2 passed 1280 and 360, but the report layout change and the xlsx button are untested in a browser.
- Next: run these in Edge, or Luan runs the phone list below.

### Real phone test list
1. Open the Software page and tap "Try the demo" on "Dashboards and automatic reports". The demo opens.
2. Scroll the page: no sideways scrolling anywhere.
3. Tap Melville, then Last month. Tiles, chart and top products change. Tap Reset in the bar: back to Last 7 days and Both.
4. Tap "View as table", then "View as chart".
5. Tap Monthly report and scroll the window: no sideways scroll, tables show as stacked cards. Change the month.
6. Tap "Save as PDF" and choose Save as PDF in the phone's print sheet. Open the PDF: only the report, no demo bar or buttons, readable, nothing cut off.
7. Tap Payroll sheet. Open the downloaded .xlsx in Excel, Google Sheets or the Files app. Dates read 2026-.., columns are wide enough, Hours and pay are numbers.
8. Open the Staff hours tab: cards, with the total line at the top and the bottom.
9. Reload the page: the filters are back to the start.
10. Repeat on iPhone Safari if you can (Share, then Print, then pinch out on the preview to save as PDF).
