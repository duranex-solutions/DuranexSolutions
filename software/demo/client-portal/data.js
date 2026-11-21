/* Client portal demo: sample data. Fictional. Dates are day offsets from today; app.js turns them into ISO dates once. */
window.DEMO_SEED = {
  practice: { name: "Quillstone Bookkeeping", suburb: "Benoni", bookkeeper: "Anika van Wyk" },
  client: { id: "larkspur", name: "Larkspur Lane Physiotherapy", suburb: "Bedfordview", contact: "Nomvula Dlamini", email: "nomvula@example.com", phone: "+27 00 000 0001" },
  quotes: [
    { id: "q121", number: "Q-0121", title: "Monthly bookkeeping and management accounts", detail: "Capturing and reconciling your bank statements, plus a monthly summary of income and expenses.", amount: 2400, per: "month", sent: -4, validUntil: 26, status: "waiting", decided: null, reason: "" },
    { id: "q122", number: "Q-0122", title: "Annual financial statements", detail: "Year-end financial statements prepared from your monthly records.", amount: 6500, per: "once", sent: -4, validUntil: 26, status: "waiting", decided: null, reason: "" },
    { id: "q109", number: "Q-0109", title: "Monthly payroll, up to 5 staff", detail: "Payslips and payroll summaries for up to five staff members.", amount: 720, per: "month", sent: -48, validUntil: -18, status: "accepted", decided: -40, reason: "" },
  ],
  invoices: [
    { id: "i412", number: "INV-0412", issued: -95, due: -65, paid: -66, lines: [{ desc: "Monthly bookkeeping, {m}", qty: 1, rate: 1850 }] },
    { id: "i431", number: "INV-0431", issued: -64, due: -34, paid: -36, lines: [{ desc: "Monthly bookkeeping, {m}", qty: 1, rate: 1850 }] },
    { id: "i447", number: "INV-0447", issued: -33, due: -3, paid: null, lines: [{ desc: "Monthly bookkeeping, {m}", qty: 1, rate: 1850 }] },
    { id: "i452", number: "INV-0452", issued: -5, due: 25, paid: null, lines: [{ desc: "Payroll, {m}", qty: 1, rate: 720 }] },
    { id: "i455", number: "INV-0455", issued: -2, due: 12, paid: null, lines: [{ desc: "Provisional tax return preparation", qty: 1, rate: 950 }] },
  ],
  documents: [
    { id: "d1", name: "Monthly summary", type: "PDF", date: -14, file: "/software/demo/client-portal/sample-monthly-summary.pdf" },
    { id: "d2", name: "Payroll report", type: "PDF", date: -6, file: null },
    { id: "d3", name: "Fixed asset register", type: "Spreadsheet", date: -30, file: null },
    { id: "d4", name: "Engagement letter (signed)", type: "PDF", date: -150, file: null },
  ],
  reminders: { on: true, email: true, whatsapp: true, before7: true, onDue: true, overdue: true },
  others: [
    { id: "o1", name: "Bluegum Auto Repairs", suburb: "Germiston", outstanding: 4200, overdue: 2100, overdueCount: 1, quotesWaiting: 0, last: -1, lastText: "Viewed invoice INV-0450" },
    { id: "o2", name: "Mopane Tree Catering", suburb: "Kempton Park", outstanding: 0, overdue: 0, overdueCount: 0, quotesWaiting: 1, last: -3, lastText: "Quote Q-0119 sent" },
    { id: "o3", name: "Kestrel Print Studio", suburb: "Benoni", outstanding: 2650, overdue: 0, overdueCount: 0, quotesWaiting: 0, last: -6, lastText: "Paid INV-0439" },
    { id: "o4", name: "Brightwater Plumbing", suburb: "Edenvale", outstanding: 7900, overdue: 5400, overdueCount: 2, quotesWaiting: 0, last: -12, lastText: "Invoice INV-0444 sent" },
    { id: "o5", name: "Wagtail Pre-school", suburb: "Alberton", outstanding: 1300, overdue: 0, overdueCount: 0, quotesWaiting: 1, last: -2, lastText: "Accepted quote Q-0114" },
  ],
  activity: [{ date: -2, text: "Invoice INV-0455 sent" }],
};
