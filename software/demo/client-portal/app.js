/* Client portal demo: Quillstone Bookkeeping (fictional). In memory only. Logic that needs no DOM is in calc.js. */
(function () {
  "use strict";
  const D = window.Demo, C = window.Calc, F = D.fmt;
  const $ = (s) => document.querySelector(s);
  const TODAY = C.iso(new Date());
  const VIEWS = ["login", "overview", "quotes", "invoices", "documents", "reminders", "practice"];
  const STEPS = [
    ["login", "Log in as the demo client."],
    ["quote", "Accept a quote."],
    ["reminder", "Open the overdue invoice and preview its reminder."],
    ["download", "Download the sample monthly summary."],
    ["csv", "Switch to Practice view and export the CSV."],
  ];
  const END = "That's the whole demo. If you'd like something like this for your clients, WhatsApp me.";
  const TONE = { paid: ["ok", "Paid"], due: ["info", "Due"], overdue: ["error", "Overdue"] };

  const seed = C.materialize(window.DEMO_SEED, TODAY);
  seed.ui = { loggedIn: false, overdueOnly: false, lastClientView: "overview", tips: { login: false, quote: false, reminder: false, download: false, csv: false } };

  const view = () => { const m = /^#view-(.+)$/.exec(location.hash); return m && VIEWS.includes(m[1]) ? m[1] : "login"; };
  const set = (fn) => D.store.update(fn);
  const tick = (k) => set((s) => { s.ui.tips[k] = true; });
  const price = (q) => F.rand(q.amount) + (q.per === "month" ? " per month" : " once-off");
  const btn = (label, cls, fn, aria) => D.el("button", { type: "button", class: "btn " + cls + " demo-btn--sm", "aria-label": aria, onclick: fn }, label);

  /* Which layout the page is in: login, client or practice */
  function syncMode() {
    const v = view(), mode = v === "login" ? "login" : v === "practice" ? "practice" : "client";
    $(".demo-app").dataset.mode = mode;
    $("#sw-client").setAttribute("aria-pressed", String(mode === "client"));
    $("#sw-practice").setAttribute("aria-pressed", String(mode === "practice"));
    if (mode === "client") D.store.get().ui.lastClientView = v;
  }
  history.replaceState(null, "", "#view-login");
  window.addEventListener("hashchange", () => {
    const li = D.store.get().ui.loggedIn, v = view();
    if (!li && v !== "login") history.replaceState(null, "", "#view-login");
    else if (li && v === "login") history.replaceState(null, "", "#view-overview");
    syncMode();
  });

  function tipsCard(s) {
    const t = s.ui.tips;
    return D.el("div", { class: "demo-card cp-tips" }, D.el("h3", { text: "Try this" }),
      D.el("ol", {}, STEPS.map((x, i) => D.el("li", { class: t[x[0]] ? "is-done" : "" },
        D.el("span", { class: "cp-tick", "aria-hidden": "true", text: t[x[0]] ? "✓" : String(i + 1) }),
        D.el("span", {}, t[x[0]] && D.el("span", { class: "visually-hidden", text: "Done: " }), x[1])))),
      STEPS.every((x) => t[x[0]]) && D.el("p", { class: "cp-end", text: END }));
  }
  const put = (box, el) => { box.textContent = ""; box.appendChild(el); };

  /* Overview */
  function todoList(s) {
    const items = [], unpaid = s.invoices.filter((v) => C.status(v, TODAY) !== "paid").sort((a, b) => (a.due < b.due ? -1 : 1));
    const late = unpaid.find((v) => C.status(v, TODAY) === "overdue"), next = unpaid.find((v) => C.status(v, TODAY) === "due");
    const waiting = s.quotes.filter((q) => q.status === "waiting").length;
    const line = (v) => "Invoice " + v.number + " (" + F.rand(C.amount(v)) + "). ";
    if (late) items.push([line(late) + C.dueText(late, TODAY) + ".", "View", "View invoice " + late.number, () => openInvoice(late.id)]);
    if (waiting) items.push([C.plural(waiting, "quote") + " waiting for your reply.", "Go to quotes", null, () => D.go("quotes")]);
    if (next) items.push([line(next) + C.dueText(next, TODAY) + ".", "View", "View invoice " + next.number, () => openInvoice(next.id)]);
    if (!items.length) return D.el("p", { class: "demo-muted", text: "Nothing needs your attention right now." });
    return D.el("ol", { class: "cp-todo" }, items.slice(0, 3).map((x) => D.el("li", {}, D.el("span", { text: x[0] }), btn(x[1], "btn-secondary", x[3], x[2]))));
  }

  /* Quotes */
  function quoteCard(q) {
    const done = q.status !== "waiting";
    return D.el("article", { class: "demo-card cp-quote" },
      D.el("p", { class: "demo-muted", text: q.number }),
      D.el("h3", { text: q.title }),
      D.el("p", { text: q.detail }),
      D.el("p", { class: "cp-price" }, D.el("strong", { text: F.rand(q.amount) }), q.per === "month" ? " per month" : " once-off"),
      D.el("p", { class: "demo-muted", text: "Sent " + F.date(q.sent) + " · Valid until " + F.date(q.validUntil) }),
      done
        ? D.el("div", { class: "cp-decided" }, q.status === "accepted" ? D.badge("ok", "Accepted") : D.badge("neutral", "Declined"), D.el("span", { class: "demo-muted", text: F.date(q.decided) }),
            q.reason && D.el("p", { text: "Your reason: " + q.reason }))
        : D.el("div", { class: "demo-actions cp-qact" },
            btn("Accept", "btn-primary", () => acceptQuote(q), "Accept quote " + q.number),
            btn("Decline", "btn-secondary", () => declineQuote(q), "Decline quote " + q.number)));
  }
  function decide(id, status, reason) {
    let q;
    set((s) => {
      q = s.quotes.find((x) => x.id === id);
      q.status = status; q.decided = TODAY; q.reason = reason;
      s.activity.unshift({ date: TODAY, text: (status === "accepted" ? "Accepted" : "Declined") + " quote " + q.number });
      if (status === "accepted") s.ui.tips.quote = true;
    });
    D.toast("Quote " + q.number + " " + status + ". " + D.store.get().practice.name + " can see your reply.");
  }
  function acceptQuote(q) {
    D.modal.open({
      title: "Accept quote " + q.number + "?",
      body: D.el("div", { class: "cp-block" }, D.el("p", { text: q.title + ", " + price(q) + "." }), D.el("p", { class: "demo-muted", text: "Quillstone Bookkeeping will see your reply straight away." })),
      actions: [{ label: "Cancel" }, { label: "Accept quote", primary: true, onClick: () => decide(q.id, "accepted", "") }],
    });
  }
  function declineQuote(q) {
    const ta = D.el("textarea", { id: "decline-reason", rows: "3", maxlength: "200", autocomplete: "off" });
    D.modal.open({
      title: "Decline quote " + q.number + "?",
      body: D.el("div", { class: "cp-block" }, D.el("p", { text: q.title + ", " + price(q) + "." }),
        D.el("div", { class: "form-field" }, D.el("label", { for: "decline-reason", text: "Reason (optional)" }), ta)),
      actions: [{ label: "Cancel" }, { label: "Decline quote", primary: true, onClick: () => decide(q.id, "declined", ta.value.trim().slice(0, 200)) }],
    });
  }

  /* Invoices */
  function statusCell(v) {
    const st = C.status(v, TODAY);
    return D.el("div", { class: "cp-status" }, D.badge(TONE[st][0], TONE[st][1]), D.el("span", { class: "demo-muted", text: st === "paid" ? F.date(v.paid) : C.dueText(v, TODAY) }));
  }
  function openInvoice(id) {
    const s = D.store.get(), v = s.invoices.find((x) => x.id === id), st = C.status(v, TODAY);
    const row = (a, b, cls) => [D.el("dt", { text: a }), D.el("dd", { class: cls, text: b })];
    const body = D.el("div", { class: "cp-block" },
      D.el("p", {}, D.el("strong", { text: s.practice.name }), " · " + s.practice.suburb),
      statusCell(v),
      D.el("dl", { class: "cp-dl" }, row("Bill to", s.client.name), row("Issued", F.date(v.issued)), row("Due", F.date(v.due))),
      D.el("dl", { class: "cp-dl cp-lines" },
        v.lines.map((l) => row((l.qty === 1 ? "" : l.qty + " × ") + l.desc, F.rand(l.qty * l.rate))),
        row("Total", F.rand(C.amount(v)), "cp-total")),
      D.el("p", { class: "demo-muted", text: "No VAT charged. " + s.practice.name + " is not VAT-registered." }),
      D.el("p", { text: "How to pay: EFT, using the invoice number as the reference. Banking details are left out of this demo." }));
    const actions = [{ label: "Close" }];
    if (st === "overdue") actions.push({ label: "Preview reminder", primary: true, onClick: () => openReminder(draft()) });
    D.modal.open({ title: "Invoice " + v.number, body, actions });
  }

  /* Documents */
  function docAction(d) {
    if (!d.file) return D.el("span", { class: "demo-muted", text: "Example entry" });
    return D.el("a", {
      class: "btn btn-secondary demo-btn--sm", href: d.file, download: "larkspur-lane-SAMPLE-monthly-summary.pdf",
      onclick: () => setTimeout(() => tick("download"), 150),
    }, "Download PDF (3 KB)");
  }

  /* Reminders: the form is a draft until Save */
  const FIELDS = { on: "#rm-on", email: "#rm-email", whatsapp: "#rm-wa", before7: "#rm-b7", onDue: "#rm-due", overdue: "#rm-over" };
  const draft = () => { const d = {}; for (const k in FIELDS) d[k] = $(FIELDS[k]).checked; return d; };
  const fillForm = (r) => { for (const k in FIELDS) $(FIELDS[k]).checked = r[k]; };
  function openReminder(d) {
    const s = D.store.get(), inv = s.invoices.find((v) => C.status(v, TODAY) === "overdue");
    if (!inv) return D.toast("No invoice is overdue right now.", { tone: "info" });
    if (!d.email && !d.whatsapp) return D.toast("Tick Email or WhatsApp to preview a reminder.", { tone: "error" });
    const t = C.reminderText(inv, TODAY, { practice: s.practice.name, first: s.client.contact.split(" ")[0], fmt: F });
    D.modal.open({
      title: "Simulated reminder",
      body: D.el("div", { class: "cp-block" },
        (!d.on || !d.overdue) && D.el("p", { class: "cp-warn", text: "With your current settings this message would not be sent." }),
        d.whatsapp && D.el("section", { class: "cp-ch" }, D.el("h3", { text: "WhatsApp message" }), D.previewEl({ channel: "whatsapp", to: s.client.phone, body: t.whatsapp })),
        d.email && D.el("section", { class: "cp-ch" }, D.el("h3", { text: "Email" }), D.previewEl({ channel: "email", to: s.client.email, subject: t.subject, body: t.email }))),
    });
    setTimeout(() => tick("reminder"), 0);
  }
  $("#rem-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = draft();
    set((s) => { s.reminders = d; s.activity.unshift({ date: TODAY, text: "Updated reminder settings" }); });
    D.toast("Saved for this visit only");
  });
  $("#rm-preview").addEventListener("click", () => openReminder(draft()));

  /* Practice view */
  function practiceRows(s) {
    const c = C.clientTotals(s, TODAY);
    const me = { id: s.client.id, name: s.client.name, demo: true, outstanding: c.outstanding, overdue: c.overdue, overdueCount: c.overdueCount, quotesWaiting: c.quotesWaiting, last: c.last.date, lastText: c.last.text };
    return [me].concat(s.others).filter((r) => !s.ui.overdueOnly || r.overdue > 0);
  }
  function download(blob, ext, msg) {
    const s = D.store.get(), url = URL.createObjectURL(blob);
    const a = D.el("a", { href: url, download: "quillstone-SAMPLE-invoices-" + TODAY + "." + ext, hidden: true });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    D.toast(msg + ": " + s.invoices.length + " sample invoices");
    tick("csv");
  }
  const exportCsv = () => download(new Blob([C.csv(D.store.get(), TODAY)], { type: "text/csv;charset=utf-8" }), "csv", "CSV downloaded");
  const exportXlsx = () => download(C.xlsx(D.store.get(), TODAY), "xlsx", "Excel file downloaded");

  function render(s) {
    syncMode();
    const c = C.clientTotals(s, TODAY), p = C.practiceTotals(s, TODAY), t = s.ui.tips;
    put($("#tips-login"), tipsCard(s));
    put($("#tips-overview"), tipsCard(s));
    const n = STEPS.findIndex((x) => !t[x[0]]);
    $("#cp-next").textContent = n < 0 ? END : "Try this, step " + (n + 1) + " of 5: " + STEPS[n][1];

    $("#ov-out").textContent = F.rand(c.outstanding);
    $("#ov-over").textContent = F.rand(c.overdue);
    $("#ov-over-n").textContent = C.plural(c.overdueCount, "invoice");
    $("#ov-quotes").textContent = F.number(c.quotesWaiting);
    put($("#ov-todo"), todoList(s));

    const qs = s.quotes.slice().sort((a, b) => (a.status === "waiting" ? 0 : 1) - (b.status === "waiting" ? 0 : 1));
    const ql = $("#quote-list");
    ql.textContent = "";
    qs.forEach((q) => ql.appendChild(quoteCard(q)));

    D.table($("#inv-table"), {
      label: "Invoices",
      rows: s.invoices.slice().sort((a, b) => (a.number < b.number ? 1 : -1)),
      columns: [
        { label: "Number", key: "number" },
        { label: "Description", render: (v) => v.lines.map((l) => l.desc).join("; ") },
        { label: "Issued", render: (v) => F.date(v.issued) },
        { label: "Due", render: (v) => F.date(v.due) },
        { label: "Amount", num: true, render: (v) => F.rand(C.amount(v)) },
        { label: "Status", render: statusCell },
        { label: "Details", render: (v) => btn("View", "btn-secondary", () => openInvoice(v.id), "View invoice " + v.number) },
      ],
    });
    D.table($("#doc-table"), {
      label: "Documents",
      rows: s.documents,
      columns: [
        { label: "Name", key: "name" },
        { label: "Type", key: "type" },
        { label: "Date", render: (d) => F.date(d.date) },
        { label: "Download", render: docAction },
      ],
    });

    $("#pr-out").textContent = F.rand(p.outstanding);
    $("#pr-over").textContent = F.rand(p.overdue);
    $("#pr-over-n").textContent = C.plural(p.overdueCount, "invoice");
    $("#pr-quotes").textContent = F.number(p.quotesWaiting);
    $("#pr-filter").checked = s.ui.overdueOnly;
    D.table($("#pr-table"), {
      label: "Clients",
      rows: practiceRows(s),
      empty: { title: "No clients match", text: "Untick Overdue only to see everyone." },
      columns: [
        { label: "Client", render: (r) => D.el("span", { class: "cp-cn" }, r.name, r.demo && D.badge("info", "Demo client")) },
        { label: "Outstanding", num: true, render: (r) => F.rand(r.outstanding) },
        { label: "Overdue", num: true, render: (r) => F.rand(r.overdue) + (r.overdueCount ? " (" + r.overdueCount + ")" : "") },
        { label: "Quotes waiting", num: true, render: (r) => F.number(r.quotesWaiting) },
        { label: "Last activity", render: (r) => C.rel(r.last, TODAY) + " · " + r.lastText },
      ],
    });
  }

  $("#login").addEventListener("click", () => {
    set((s) => { s.ui.loggedIn = true; s.ui.tips.login = true; });
    D.go("overview");
  });
  $("#logout").addEventListener("click", () => {
    set((s) => { s.ui.loggedIn = false; });
    D.go("login");
  });
  $("#sw-client").addEventListener("click", () => D.go(D.store.get().ui.lastClientView));
  $("#sw-practice").addEventListener("click", () => D.go("practice"));
  $("#pr-filter").addEventListener("change", (e) => set((s) => { s.ui.overdueOnly = e.target.checked; }));
  $("#pr-export").addEventListener("click", exportCsv);
  $("#pr-xlsx").addEventListener("click", exportXlsx);
  D.onReset((s) => { history.replaceState(null, "", "#view-login"); fillForm(s.reminders); syncMode(); });

  D.init({ seed, render, views: VIEWS });
})();
