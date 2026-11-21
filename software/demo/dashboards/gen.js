/* Dashboards demo: pure logic, no DOM. Sales are worked out from the date, never stored. */
(function (root) {
  "use strict";
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const day0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (a, b) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
  const monthStart = (y, m) => new Date(y, m, 1);
  const monthEnd = (y, m) => new Date(y, m + 1, 0);

  /* Seeded random numbers: the same day always gives the same sales */
  const hash = (s) => {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return h >>> 0;
  };
  const mulberry = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const cache = new Map();
  function dayData(S, d, b) {
    const key = iso(d) + "|" + b.id;
    let r = cache.get(key);
    if (r) return r;
    const rnd = mulberry(hash(key)), dow = d.getDay();
    /* each week runs a little busier or quieter than the last, so the comparisons have something to show */
    const wk = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5 / 7);
    const m = S.dow[dow] * (0.93 + 0.14 * mulberry(hash("w" + wk + "|" + b.id))());
    const items = {};
    let rev = 0, n = 0;
    S.products.forEach((p) => {
      const q = Math.round(b.base * m * p.weight * S.basket * (0.88 + 0.24 * rnd()));
      items[p.id] = q; rev += q * p.price; n += q;
    });
    const tx = Math.round((n / S.basket) * (0.95 + 0.1 * rnd()));
    const hrs = {};
    S.staff.forEach((s) => {
      if (s.branch !== b.id) return;
      const off = rnd() < 0.06;
      hrs[s.id] = s.days.indexOf(dow) >= 0 && !off ? s.shift : 0;
    });
    r = { rev, tx, items, hrs };
    cache.set(key, r);
    return r;
  }

  /* Totals for a date range and a list of branch ids */
  function agg(S, s, e, bids) {
    const a = { rev: 0, tx: 0, hrs: 0, pay: 0, items: {}, staff: {}, days: 0 };
    S.staff.forEach((p) => { if (bids.indexOf(p.branch) >= 0) a.staff[p.id] = { shifts: 0, hours: 0, pay: 0 }; });
    for (let d = day0(s); d <= e; d = addDays(d, 1)) {
      a.days++;
      S.branches.forEach((b) => {
        if (bids.indexOf(b.id) < 0) return;
        const x = dayData(S, d, b);
        a.rev += x.rev; a.tx += x.tx;
        for (const k in x.items) a.items[k] = (a.items[k] || 0) + x.items[k];
        S.staff.forEach((p) => {
          if (p.branch !== b.id || !x.hrs[p.id]) return;
          const t = a.staff[p.id], h = x.hrs[p.id];
          t.shifts++; t.hours += h; t.pay += h * p.rate;
          a.hrs += h; a.pay += h * p.rate;
        });
      });
    }
    return a;
  }

  /* "14-20 Nov" or "28 Oct-3 Nov" */
  function span(s, e) {
    const a = s.getDate(), b = e.getDate();
    if (iso(s) === iso(e)) return a + " " + MON[s.getMonth()];
    if (s.getMonth() === e.getMonth()) return a + "\u2013" + b + " " + MON[s.getMonth()];
    return a + " " + MON[s.getMonth()] + "\u2013" + b + " " + MON[e.getMonth()];
  }

  /* A calendar month up to yesterday, and what it is compared with. Empty (n = 0) on the 1st. */
  function monthPeriod(y, m, today) {
    const first = monthStart(y, m);
    y = first.getFullYear(); m = first.getMonth();
    const yest = addDays(today, -1), s = monthStart(y, m), last = monthEnd(y, m);
    const e = yest < last ? yest : last, n = Math.max(0, diff(s, e) + 1), full = iso(e) === iso(last);
    const ps = monthStart(y, m - 1), pl = monthEnd(y, m - 1);
    let pe = pl;
    if (!full) { pe = addDays(ps, Math.max(n, 1) - 1); if (pe > pl) pe = pl; }
    return { s, e, n, ps, pe, vs: full ? MONTH[ps.getMonth()] : span(ps, pe), month: MONTH[m] + " " + y, mode: "cal" };
  }

  function period(id, today) {
    today = day0(today);
    const yest = addDays(today, -1);
    if (id === "this") return monthPeriod(today.getFullYear(), today.getMonth(), today);
    if (id === "last") return monthPeriod(today.getFullYear(), today.getMonth() - 1, today);
    const n = id === "4w" ? 28 : 7, s = addDays(yest, 1 - n);
    return { s, e: yest, n, ps: addDays(s, -n), pe: addDays(s, -1), vs: "previous " + (n === 7 ? "7 days" : "4 weeks"), mode: n === 7 ? "day" : "roll" };
  }

  /* Chart blocks: daily, rolling 7 days, or calendar weeks 1-7, 8-14 ... */
  function buckets(p) {
    const out = [];
    if (p.n < 1) return out;
    if (p.mode === "day") {
      for (let d = p.s; d <= p.e; d = addDays(d, 1)) out.push({ s: d, e: d, label: WD[d.getDay()] + " " + d.getDate(), short: WD[d.getDay()].slice(0, 2) });
    } else {
      let s = p.s;
      while (s <= p.e) {
        let e = addDays(s, 6);
        if (p.mode === "cal") {
          const k = Math.floor((s.getDate() - 1) / 7);
          e = k < 4 ? new Date(s.getFullYear(), s.getMonth(), (k + 1) * 7) : monthEnd(s.getFullYear(), s.getMonth());
        }
        if (e > p.e) e = p.e;
        out.push({ s, e, label: span(s, e), short: String(s.getDate()) });
        s = addDays(e, 1);
      }
    }
    return out;
  }

  /* Payroll sheet: a hand-written .xlsx (stored zip, no library) so widths, dates and numbers are right in Excel */
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n', M = "http://schemas.openxmlformats.org/";
  const serial = (d) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) + 25569;
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

  function sheet(rows, widths) {
    const st = { d: 2, h: 3, m: 4, n: 0 };
    const cell = (v, k, r, i) => {
      const ref = String.fromCharCode(65 + i) + r;
      if (k === "s") return '<c r="' + ref + '" t="inlineStr"' + (r === 1 ? ' s="1"' : "") + "><is><t>" + esc(v) + "</t></is></c>";
      return '<c r="' + ref + '" s="' + st[k] + '"><v>' + (k === "d" ? serial(v) : v) + "</v></c>";
    };
    const body = rows.map((r, j) => '<row r="' + (j + 1) + '">' + r.map((c, i) => cell(c[0], c[1], j + 1, i)).join("") + "</row>").join("");
    return X + '<worksheet xmlns="' + M + 'spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
      widths.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join("") + "</cols><sheetData>" + body + "</sheetData></worksheet>";
  }
  function payroll(S, p, branch) {
    const bids = branch === "both" ? S.branches.map((b) => b.id) : [branch], a = agg(S, p.s, p.e, bids);
    const rows = [["Period start", "Period end", "Employee ID", "Name", "Role", "Branch", "Shifts", "Hours", "Hourly rate (ZAR)", "Gross pay (ZAR)"].map((h) => [h, "s"])];
    S.staff.forEach((s) => {
      if (bids.indexOf(s.branch) < 0) return;
      const t = a.staff[s.id], br = S.branches.filter((b) => b.id === s.branch)[0].name;
      rows.push([[p.s, "d"], [p.e, "d"], [s.id, "s"], [s.name, "s"], [s.role, "s"], [br, "s"], [t.shifts, "n"], [t.hours, "h"], [s.rate, "m"], [t.pay, "m"]]);
    });
    const rel = (id, type, t) => '<Relationship Id="' + id + '" Type="' + M + "officeDocument/2006/relationships/" + type + '" Target="' + t + '"/>';
    const ct = (part, type) => '<Override PartName="' + part + '" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.' + type + '+xml"/>';
    const xf = (fmt, font) => '<xf numFmtId="' + fmt + '" fontId="' + font + '" fillId="0" borderId="0" xfId="0"/>';
    return zip([
      ["[Content_Types].xml", X + '<Types xmlns="' + M + 'package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + ct("/xl/workbook.xml", "sheet.main") + ct("/xl/worksheets/sheet1.xml", "worksheet") + ct("/xl/styles.xml", "styles") + "</Types>"],
      ["_rels/.rels", X + '<Relationships xmlns="' + M + 'package/2006/relationships">' + rel("rId1", "officeDocument", "xl/workbook.xml") + "</Relationships>"],
      ["xl/workbook.xml", X + '<workbook xmlns="' + M + 'spreadsheetml/2006/main" xmlns:r="' + M + 'officeDocument/2006/relationships"><sheets><sheet name="Payroll (sample)" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ["xl/_rels/workbook.xml.rels", X + '<Relationships xmlns="' + M + 'package/2006/relationships">' + rel("rId1", "worksheet", "worksheets/sheet1.xml") + rel("rId2", "styles", "styles.xml") + "</Relationships>"],
      ["xl/styles.xml", X + '<styleSheet xmlns="' + M + 'spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="yyyy\-mm\-dd"/><numFmt numFmtId="165" formatCode="0.0"/></numFmts><fonts count="2"><font><sz val="11"/></font><font><b/><sz val="11"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5">' + xf(0, 0) + xf(0, 1) + xf(164, 0) + xf(165, 0) + xf(2, 0) + "</cellXfs></styleSheet>"],
      ["xl/worksheets/sheet1.xml", sheet(rows, [14, 14, 14, 22, 20, 12, 9, 9, 19, 17])]
    ]);
  }

  root.DashGen = { iso, addDays, day0, diff, span, period, monthPeriod, buckets, agg, payroll, MONTH, MON, WD };
})(typeof window !== "undefined" ? window : globalThis);
