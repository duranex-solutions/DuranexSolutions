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

  /* Excel copy of the same rows: a hand-built .xlsx (stored zip) so South African Excel shows real dates, numbers and sized columns */
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n', M = "http://schemas.openxmlformats.org/";
  const serial = (v) => Math.round(Date.UTC(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10)) / 864e5) + 25569;
  const u16 = (n) => [n & 255, (n >> 8) & 255], u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cd = [];
    let off = 0;
    files.forEach(([name, text]) => {
      const nb = enc.encode(name), d = enc.encode(text), c = crc(d);
      const h = [].concat(u32(0x04034b50), u16(20), u16(0x800), u16(0), u16(0), u16(0x21), u32(c), u32(d.length), u32(d.length), u16(nb.length), u16(0));
      parts.push(new Uint8Array(h), nb, d);
      cd.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x800), u16(0), u16(0), u16(0x21), u32(c), u32(d.length), u32(d.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nb);
      off += h.length + nb.length + d.length;
    });
    let size = 0; cd.forEach((x) => { size += x.length; });
    return new Blob(parts.concat(cd, [new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(size), u32(off), u16(0)))]), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function xlsx(s, today) {
    const head = ["Date", "Invoice number", "Client", "Description", "Amount", "Status", "Due date", "Paid date"];
    const kinds = ["d", "s", "s", "s", "n", "s", "d", "d"], st = { s: 0, h: 1, d: 2, n: 3 };
    const rows = s.invoices.slice().sort((a, b) => (a.number < b.number ? -1 : 1)).map((v) => [
      v.issued, v.number, s.client.name, v.lines.map((l) => l.desc).join("; "), amount(v),
      { paid: "Paid", due: "Due", overdue: "Overdue" }[status(v, today)], v.due, v.paid || "",
    ]);
    const cell = (v, k, r, i, h) => {
      const ref = String.fromCharCode(65 + i) + r;
      if (v === "") return "";
      if (h || k === "s") return '<c r="' + ref + '" t="inlineStr"' + (h ? ' s="1"' : "") + "><is><t>" + esc(v) + "</t></is></c>";
      return '<c r="' + ref + '" s="' + st[k] + '"><v>' + (k === "d" ? serial(v) : v) + "</v></c>";
    };
    const row = (r, j, h) => '<row r="' + (j + 1) + '">' + r.map((v, i) => cell(v, kinds[i], j + 1, i, h)).join("") + "</row>";
    const body = row(head, 0, true) + rows.map((r, j) => row(r, j + 1)).join("");
    const widths = [12, 16, 28, 38, 12, 10, 12, 12];
    const sheet = X + '<worksheet xmlns="' + M + 'spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
      widths.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join("") + "</cols><sheetData>" + body + "</sheetData></worksheet>";
    const rel = (id, type, t) => '<Relationship Id="' + id + '" Type="' + M + "officeDocument/2006/relationships/" + type + '" Target="' + t + '"/>';
    const ct = (part, type) => '<Override PartName="' + part + '" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.' + type + '+xml"/>';
    const xf = (fmt, font) => '<xf numFmtId="' + fmt + '" fontId="' + font + '" fillId="0" borderId="0" xfId="0"/>';
    return zip([
      ["[Content_Types].xml", X + '<Types xmlns="' + M + 'package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + ct("/xl/workbook.xml", "sheet.main") + ct("/xl/worksheets/sheet1.xml", "worksheet") + ct("/xl/styles.xml", "styles") + "</Types>"],
      ["_rels/.rels", X + '<Relationships xmlns="' + M + 'package/2006/relationships">' + rel("rId1", "officeDocument", "xl/workbook.xml") + "</Relationships>"],
      ["xl/workbook.xml", X + '<workbook xmlns="' + M + 'spreadsheetml/2006/main" xmlns:r="' + M + 'officeDocument/2006/relationships"><sheets><sheet name="Invoices (sample)" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ["xl/_rels/workbook.xml.rels", X + '<Relationships xmlns="' + M + 'package/2006/relationships">' + rel("rId1", "worksheet", "worksheets/sheet1.xml") + rel("rId2", "styles", "styles.xml") + "</Relationships>"],
      ["xl/styles.xml", X + '<styleSheet xmlns="' + M + 'spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy\\-mm\\-dd"/></numFmts><fonts count="2"><font><sz val="11"/></font><font><b/><sz val="11"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4">' + xf(0, 0) + xf(0, 1) + xf(164, 0) + xf(4, 0) + "</cellXfs></styleSheet>"],
      ["xl/worksheets/sheet1.xml", sheet],
    ]);
  }

  root.Calc = { iso, addDays, between, materialize, amount, status, clientTotals, practiceTotals, rel, dueText, reminderText, csv, xlsx, plural };
  if (typeof module !== "undefined") module.exports = root.Calc;
})(typeof window !== "undefined" ? window : globalThis);
