/* Dashboards demo: filters, KPIs, chart, products, staff hours, report and payroll sheet. In memory only. */
(function () {
  "use strict";
  const D = window.Demo, G = window.DashGen, S = window.DEMO_SEED;
  const $ = (s) => document.querySelector(s);
  const NS = "http://www.w3.org/2000/svg";
  const phone = window.matchMedia("(max-width: 639px)");
  const BR = {};
  S.branches.forEach((b) => { BR[b.id] = b; });
  const nf1 = new Intl.NumberFormat("en-ZA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const f1 = (n) => nf1.format(n).replace(/\s/g, " ");
  const axis = (v) => "R " + D.fmt.number(v);
  const axisShort = (v) => (v >= 1000 ? "R " + D.fmt.number(v / 1000) + "k" : "R " + v);
  const bids = (br) => (br === "both" ? S.branches.map((b) => b.id) : [br]);
  const brName = (br) => (br === "both" ? "Both branches" : BR[br].name);
  const full = (d) => D.fmt.date(d);
  let showTable = false, repMonth = null, ctx = null;

  function svg(tag, attrs, ...kids) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    kids.forEach((c) => e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }


  function context(f) {
    const p = G.period(f.range, new Date()), ids = bids(f.branch);
    const cur = p.n ? G.agg(S, p.s, p.e, ids) : null;
    const prev = p.n ? G.agg(S, p.ps, p.pe, ids) : null;
    return { f, p, ids, cur, prev, parts: p.n ? G.buckets(p) : [] };
  }

  /* KPI tiles */
  const KPI = [
    { k: "rev", label: "Revenue", fmt: D.fmt.rand, up: true },
    { k: "tx", label: "Transactions", fmt: D.fmt.number, up: true },
    { k: "avg", label: "Average sale", fmt: D.fmt.rand, up: true },
    { k: "lab", label: "Labour cost", fmt: (v) => f1(v) + "%", up: false, pts: true },
  ];
  const kpiVals = (a) => ({ rev: a.rev, tx: a.tx, avg: a.tx ? a.rev / a.tx : 0, lab: a.rev ? (a.pay / a.rev) * 100 : 0 });
  function change(def, cur, prev) {
    if (!prev) return null;
    const d = def.pts ? cur - prev : ((cur - prev) / prev) * 100;
    const same = Math.abs(d) < (def.pts ? 0.5 : 1), flat = Math.round(Math.abs(d) * 10) === 0;
    const word = flat ? "No change" : (d > 0 ? "Up " : "Down ") + f1(Math.abs(d)) + (def.pts ? " points" : "%");
    return { arrow: flat ? "▶" : d > 0 ? "▲" : "▼", word, tone: same ? "neutral" : d > 0 === def.up ? "ok" : "warn", verdict: same ? "About the same" : d > 0 === def.up ? "Better" : "Worse" };
  }
  function renderKpis(c) {
    const a = kpiVals(c.cur), b = kpiVals(c.prev);
    $("#dash-kpis").replaceChildren(...KPI.map((def) => {
      const ch = change(def, a[def.k], b[def.k]);
      return D.el("div", { class: "demo-card dash-kpi" },
        D.el("p", { class: "demo-muted", text: def.label }),
        D.el("span", { class: "demo-stat", text: def.fmt(a[def.k]) }),
        def.k === "lab" && D.el("p", { class: "demo-muted dash-sub", text: D.fmt.number(c.cur.hrs) + " staff hours" }),
        ch && D.el("p", { class: "dash-chg" }, D.el("span", { "aria-hidden": "true", text: ch.arrow + " " }), ch.word + " vs " + c.p.vs),
        ch && D.badge(ch.tone, ch.verdict));
    }));
  }


  function nice(max, n) {
    const raw = (max || 1) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = [1, 2, 2.5, 5, 10].filter((x) => x * mag >= raw)[0];
    return m * mag;
  }
  function renderChart(c) {
    const sm = phone.matches, W = sm ? 320 : 560, H = sm ? 230 : 260;
    const L = sm ? 40 : 66, R = 6, T = 10, B = sm ? 26 : 30, pw = W - L - R, ph = H - T - B;
    const series = c.ids.map((id) => ({ id, name: BR[id].name, vals: c.parts.map((x) => G.agg(S, x.s, x.e, [id]).rev) }));
    const max = Math.max.apply(null, [0].concat.apply([], series.map((s) => s.vals)));
    const rows = sm ? 3 : 4, step = nice(max, rows), top = step * rows, y = (v) => T + ph - (v / top) * ph;
    const g = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "dash-chart", role: "img", "aria-labelledby": "ct cd" });
    const hi = c.parts.map((x, i) => [x.label, series.reduce((t, s) => t + s.vals[i], 0)]).sort((a, b) => b[1] - a[1])[0];
    g.appendChild(svg("title", { id: "ct" }, $("#chart-title").textContent + ", " + brName(c.f.branch) + ", " + G.span(c.p.s, c.p.e)));
    g.appendChild(svg("desc", { id: "cd" }, "Bar chart of revenue for " + c.parts.length + (c.p.mode === "day" ? " days" : " blocks") + ". The highest is " + hi[0] + " at " + D.fmt.rand(hi[1]) + ". Use View as table for every figure."));
    g.appendChild(svg("defs", null, svg("pattern", { id: "dash-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
      svg("rect", { width: 6, height: 6, class: "dash-hatch-bg" }), svg("line", { x1: 0, y1: 0, x2: 0, y2: 6, class: "dash-hatch-ln" }))));
    for (let i = 0; i <= rows; i++) {
      const v = i * step;
      g.appendChild(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: i ? "dash-grid" : "dash-base" }));
      g.appendChild(svg("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end" }, sm ? axisShort(v) : axis(v)));
    }
    const slot = pw / c.parts.length, gw = slot * 0.72, bw = gw / series.length;
    c.parts.forEach((x, i) => {
      const x0 = L + i * slot + (slot - gw) / 2;
      series.forEach((s, j) => {
        const h = (s.vals[i] / top) * ph;
        g.appendChild(svg("rect", { x: x0 + j * bw, y: T + ph - h, width: bw - (series.length > 1 ? 1 : 0), height: h, class: s.id === "pk" ? "dash-bar-pk" : "dash-bar-mv" },
          svg("title", null, s.name + ", " + x.label + ": " + D.fmt.rand(s.vals[i]))));
      });
      g.appendChild(svg("text", { x: L + i * slot + slot / 2, y: H - 8, "text-anchor": "middle" }, sm ? x.short : x.label));
    });
    $("#chart-box").replaceChildren(g);
    $("#chart-legend").replaceChildren(...series.map((s) => D.el("li", null, D.el("span", { class: "dash-sw dash-sw-" + s.id, "aria-hidden": "true" }), s.name)));
    const m0 = G.MONTH[c.parts[0].s.getMonth()], m1 = G.MONTH[c.parts[c.parts.length - 1].s.getMonth()];
    $("#chart-caption").textContent = c.p.mode === "day" ? "Days, " + G.span(c.p.s, c.p.e) : "Blocks starting on these days in " + (m0 === m1 ? m0 : m0 + " and " + m1);
    const cols = [{ label: "Period", key: "label" }].concat(series.map((s, j) => ({ label: s.name, num: true, render: (r) => D.fmt.rand(r.v[j]) })));
    if (series.length > 1) cols.push({ label: "Total", num: true, render: (r) => D.fmt.rand(r.v[0] + r.v[1]) });
    D.table($("#chart-table"), { label: $("#chart-title").textContent + " as a table", columns: cols, rows: c.parts.map((x, i) => ({ id: "b" + i, label: x.label, v: series.map((s) => s.vals[i]) })) });
  }

  /* Top products */
  const topProducts = (a, n) => S.products.map((p) => ({ id: p.id, name: p.name, qty: a.items[p.id] || 0, rev: (a.items[p.id] || 0) * p.price })).sort((x, y) => y.rev - x.rev).slice(0, n);
  function renderTop(c) {
    const list = topProducts(c.cur, 5), best = list[0].rev || 1;
    $("#top-list").replaceChildren(...list.map((p) => {
      const bar = D.el("span");
      bar.style.width = Math.round((p.rev / best) * 100) + "%";
      return D.el("li", null,
        D.el("div", { class: "dash-top__row" }, D.el("span", null, p.name + " ", D.el("span", { class: "demo-muted", text: D.fmt.number(p.qty) + " sold" })), D.el("strong", { text: D.fmt.rand(p.rev) })),
        D.el("div", { class: "dash-top__bar", "aria-hidden": "true" }, bar));
    }));
  }

  /* Staff hours */
  const staffRows = (c) => S.staff.filter((s) => c.ids.indexOf(s.branch) >= 0).map((s) => Object.assign({ id: s.id, s }, c.cur.staff[s.id]));
  function renderStaff(c) {
    const box = $("#staff-table"), both = c.f.branch === "both";
    $("#staff-period").textContent = "";
    if (!c.cur) {
      $("#staff-total-top").textContent = $("#staff-total").textContent = "";
      return D.table(box, { rows: [], empty: emptyRange() });
    }
    $("#staff-period").textContent = "Showing " + G.span(c.p.s, c.p.e) + " " + c.p.e.getFullYear();
    const rows = staffRows(c);
    const cols = [{ label: "Name", render: (r) => r.s.name }, { label: "Role", render: (r) => r.s.role }];
    if (both) cols.push({ label: "Branch", render: (r) => BR[r.s.branch].name });
    cols.push({ label: "Shifts", num: true, key: "shifts" }, { label: "Hours", num: true, render: (r) => D.fmt.number(r.hours) },
      { label: "Rate (R/h)", num: true, render: (r) => D.fmt.rand(r.s.rate) }, { label: "Gross pay", num: true, render: (r) => D.fmt.rand(r.pay) });
    D.table(box, { label: "Staff hours and gross pay", columns: cols, rows });
    const t = rows.length + " staff · " + D.fmt.number(c.cur.hrs) + " hours · " + D.fmt.rand(c.cur.pay) + " gross pay";
    $("#staff-total-top").textContent = $("#staff-total").textContent = "Total: " + t;
  }
  const emptyRange = () => ({ title: "No sales yet this month", text: "This month starts today, so there is nothing to show yet.", action: { label: "Show last month", onClick: () => setFilter("range", "last") } });

  /* Filters */
  function setFilter(k, v) { D.store.update((s) => { s.filters[k] = v; }); }

  function render(state) {
    const f = state.filters;
    $("#f-range").value = f.range;
    document.querySelectorAll('#dash-filters input[name="branch"]').forEach((r) => { r.checked = r.value === f.branch; });
    const c = (ctx = context(f)), has = !!c.cur;
    $("#dash-content").hidden = !has;
    $("#dash-empty").replaceChildren();
    $("#dash-period").textContent = has ? "Showing " + G.span(c.p.s, c.p.e) + " " + c.p.e.getFullYear() + ", compared with " + c.p.vs : "";
    $("#chart-title").textContent = c.p.mode === "day" ? "Daily sales" : "Weekly sales";
    if (has) { renderKpis(c); renderChart(c); renderTop(c); }
    else $("#dash-empty").appendChild(D.empty(emptyRange()));
    renderStaff(c);
    $("#chart-table").hidden = !showTable;
    $("#chart-box").hidden = $("#chart-caption").hidden = $("#chart-legend").hidden = showTable;
    const b = $("#btn-table");
    b.setAttribute("aria-expanded", String(showTable));
    b.textContent = showTable ? "View as chart" : "View as table";
  }

  /* Monthly report: built once, shown in the dialog and copied for printing */
  function months() {
    const t = G.day0(new Date()), out = [];
    for (let k = 0; k < 3; k++) {
      const p = G.monthPeriod(t.getFullYear(), t.getMonth() - k, t);
      if (p.n) out.push({ id: String(k), p, label: p.month + (k ? "" : " (so far)") });
    }
    return out;
  }
  function reportEl(p, br) {
    const ids = bids(br), a = G.agg(S, p.s, p.e, ids), b = G.agg(S, p.ps, p.pe, ids), va = kpiVals(a), vb = kpiVals(b);
    const parts = G.buckets(p), both = br === "both";
    const tbl = (label, columns, rows) => { const box = D.el("div"); D.table(box, { label, columns, rows }); return box; };
    const sec = (t, x) => D.el("section", null, D.el("h3", { text: t }), x);
    const kRows = KPI.map((def) => { const ch = change(def, va[def.k], vb[def.k]); return { id: def.k, def, ch }; });
    const wk = parts.map((x, i) => ({ id: "w" + i, label: x.label, v: ids.map((id) => G.agg(S, x.s, x.e, [id]).rev) }));
    const wCols = [{ label: "Block", key: "label" }].concat(ids.map((id, j) => ({ label: BR[id].name, num: true, render: (r) => D.fmt.rand(r.v[j]) })));
    if (both) wCols.push({ label: "Total", num: true, render: (r) => D.fmt.rand(r.v[0] + r.v[1]) });
    const sRows = S.staff.filter((s) => ids.indexOf(s.branch) >= 0).map((s) => Object.assign({ id: s.id, s }, a.staff[s.id]));
    sRows.push({ id: "total", total: true, hours: a.hrs, pay: a.pay });
    const sCols = [{ label: "Name", render: (r) => (r.total ? D.el("strong", { text: "Total" }) : r.s.name) }];
    if (both) sCols.push({ label: "Branch", render: (r) => (r.total ? "" : BR[r.s.branch].name) });
    sCols.push({ label: "Hours", num: true, render: (r) => D.fmt.number(r.hours) }, { label: "Gross pay", num: true, render: (r) => D.fmt.rand(r.pay) });
    return D.el("div", { class: "dash-rep" },
      D.el("h3", { class: "dash-rep__title", text: S.business + ": monthly report" }),
      D.el("p", null, D.el("strong", { text: p.month }), " (" + full(p.s) + " to " + full(p.e) + ") · " + brName(br)),
      D.el("p", { class: "demo-muted", text: "Sample data, made up for this demo. Prepared " + full(new Date()) + "." }),
      sec("Key numbers vs " + p.vs, tbl("Key numbers", [{ label: "Measure", render: (r) => r.def.label }, { label: "This period", num: true, render: (r) => r.def.fmt(va[r.def.k]) },
        { label: "Before", num: true, render: (r) => r.def.fmt(vb[r.def.k]) }, { label: "Change", render: (r) => (r.ch ? r.ch.arrow + " " + r.ch.word + " (" + r.ch.verdict.toLowerCase() + ")" : "No earlier data") }], kRows)),
      sec("Weekly sales", tbl("Weekly sales", wCols, wk)),
      sec("Top 5 products", tbl("Top 5 products", [{ label: "Product", key: "name" }, { label: "Sold", num: true, render: (r) => D.fmt.number(r.qty) }, { label: "Revenue", num: true, render: (r) => D.fmt.rand(r.rev) }], topProducts(a, 5))),
      sec("Staff summary", tbl("Staff summary", sCols, sRows)));
  }
  function fillReport() {
    const list = months(), sel = $("#f-month");
    if (!sel.options.length) list.forEach((m) => sel.appendChild(D.el("option", { value: m.id, text: m.label })));
    if (repMonth == null) repMonth = ctx && ctx.f.range === "this" ? "0" : "1";
    const m = list.filter((x) => x.id === repMonth)[0] || list[0];
    sel.value = m.id;
    $("#rep-body").replaceChildren(reportEl(m.p, ctx.f.branch));
  }
  function openReport() {
    $("#f-month").textContent = "";
    fillReport();
    D.modal.open($("#report-dlg"));
  }
  function printReport() {
    const pr = $("#dash-print");
    pr.replaceChildren($("#rep-body").firstChild.cloneNode(true));
    window.print();
  }

  /* Payroll sheet (.xlsx) */
  function downloadSheet() {
    const c = ctx;
    if (!c.cur) return D.toast("Nothing to export yet. Try Last month.", { tone: "error" });
    const name = "kopje-coffee-SAMPLE-payroll-" + (c.f.branch === "both" ? "both" : BR[c.f.branch].name.toLowerCase()) + "-" + G.iso(c.p.s) + "-to-" + G.iso(c.p.e) + ".xlsx";
    const url = URL.createObjectURL(G.payroll(S, c.p, c.f.branch));
    const a = D.el("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    D.toast("Payroll sheet downloaded (sample data)");
  }

  /* Wiring */
  $("#f-range").addEventListener("change", (e) => setFilter("range", e.target.value));
  $("#dash-filters").addEventListener("change", (e) => { if (e.target.name === "branch") setFilter("branch", e.target.value); });
  $("#dash-filters").addEventListener("submit", (e) => e.preventDefault());
  $("#btn-table").addEventListener("click", () => { showTable = !showTable; render(D.store.get()); });
  $("#btn-report").addEventListener("click", openReport);
  $("#btn-csv").addEventListener("click", downloadSheet);
  $("#f-month").addEventListener("change", (e) => { repMonth = e.target.value; fillReport(); });
  $("#rep-close").addEventListener("click", () => D.modal.close());
  $("#rep-print").addEventListener("click", printReport);
  window.addEventListener("afterprint", () => $("#dash-print").replaceChildren());
  const onMq = () => { if (ctx && ctx.cur) renderChart(ctx); };
  if (phone.addEventListener) phone.addEventListener("change", onMq); else phone.addListener(onMq);
  D.onReset(() => { showTable = false; repMonth = null; $("#dash-print").replaceChildren(); });

  D.init({ seed: S, render });
})();
