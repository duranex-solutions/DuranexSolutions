/* Client portal demo: pure logic, no DOM. Dates are ISO strings "YYYY-MM-DD". Tested in node, not kept in the repo. */
(function (root) {
  "use strict";
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parts = (s) => s.split("-").map(Number);
  const addDays = (s, n) => { const p = parts(s); return iso(new Date(p[0], p[1] - 1, p[2] + n)); };
  const dayNo = (s) => { const p = parts(s); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); };
  const between = (a, b) => dayNo(b) - dayNo(a);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");

  /* Seed with day offsets in, ISO dates out. "{m}" becomes the month before the issue date. */
  function materialize(seed, today) {
    const s = JSON.parse(JSON.stringify(seed));
    const d = (n) => (n == null ? null : addDays(today, n));
    s.quotes.forEach((q) => { q.sent = d(q.sent); q.validUntil = d(q.validUntil); q.decided = d(q.decided); });
    s.invoices.forEach((v) => {
      const p = parts(d(v.issued)), m = p[1] - 2;
      const label = MONTHS[(m + 12) % 12] + " " + (m < 0 ? p[0] - 1 : p[0]);
      v.issued = d(v.issued); v.due = d(v.due); v.paid = d(v.paid);
      v.lines.forEach((l) => { l.desc = l.desc.replace("{m}", label); });
    });
    s.documents.forEach((x) => { x.date = d(x.date); });
    s.others.forEach((o) => { o.last = d(o.last); });
    s.activity.forEach((a) => { a.date = d(a.date); });
    return s;
  }

  const amount = (inv) => Math.round(inv.lines.reduce((t, l) => t + l.qty * l.rate, 0) * 100) / 100;
  const status = (inv, today) => (inv.paid ? "paid" : inv.due < today ? "overdue" : "due");
  const sum = (a) => Math.round(a.reduce((t, x) => t + x, 0) * 100) / 100;

  function clientTotals(s, today) {
    const unpaid = s.invoices.filter((v) => status(v, today) !== "paid");
    const late = unpaid.filter((v) => status(v, today) === "overdue");
    return {
      outstanding: sum(unpaid.map(amount)), overdue: sum(late.map(amount)), overdueCount: late.length,
      quotesWaiting: s.quotes.filter((q) => q.status === "waiting").length, last: s.activity[0] || null,
    };
  }
  function practiceTotals(s, today) {
    const c = clientTotals(s, today);
    return {
      outstanding: sum([c.outstanding].concat(s.others.map((o) => o.outstanding))),
      overdue: sum([c.overdue].concat(s.others.map((o) => o.overdue))),
      overdueCount: c.overdueCount + s.others.reduce((t, o) => t + o.overdueCount, 0),
      quotesWaiting: c.quotesWaiting + s.others.reduce((t, o) => t + o.quotesWaiting, 0),
    };
  }

  function rel(date, today) {
    const n = between(date, today);
    return n <= 0 ? "Today" : n === 1 ? "Yesterday" : n + " days ago";
  }
  function dueText(inv, today) {
    const n = between(today, inv.due);
    if (inv.paid) return "Paid";
    if (n < 0) return plural(-n, "day") + " overdue";
    return n === 0 ? "Due today" : "Due in " + plural(n, "day");
  }

  /* o = { practice, first, fmt: { rand, date } } with fmt from Demo.fmt */
  function reminderText(inv, today, o) {
    const late = Math.max(between(inv.due, today), 0);
    const body = "friendly reminder from " + o.practice + ": invoice " + inv.number + " for " + o.fmt.rand(amount(inv)) + " was due on " + o.fmt.date(inv.due) +
      " and is now " + plural(late, "day") + " overdue. You can view it in your client portal. If you've already paid, please ignore this message. Thank you.";
    return {
      whatsapp: "Hi " + o.first + ", a " + body,
      subject: "Reminder: invoice " + inv.number + " is overdue",
      email: "Hi " + o.first + ",\n\nA " + body + "\n\nKind regards\n" + o.practice,
    };
  }

  const cell = (v) => (/[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  function csv(s, today) {
    const head = ["Date", "Invoice number", "Client", "Description", "Amount", "Status", "Due date", "Paid date"];
    const rows = s.invoices.slice().sort((a, b) => (a.number < b.number ? -1 : 1)).map((v) => [
      v.issued, v.number, s.client.name, v.lines.map((l) => l.desc).join("; "), amount(v).toFixed(2),
      { paid: "Paid", due: "Due", overdue: "Overdue" }[status(v, today)], v.due, v.paid || "",
    ]);
    return "﻿" + [head].concat(rows).map((r) => r.map((x) => cell(String(x))).join(",")).join("\r\n") + "\r\n";
  }

  root.Calc = { iso, addDays, between, materialize, amount, status, clientTotals, practiceTotals, rel, dueText, reminderText, csv, plural };
  if (typeof module !== "undefined") module.exports = root.Calc;
})(typeof window !== "undefined" ? window : globalThis);
