/* Automations demo: a quote form and the four things that happen next. In memory only, nothing is sent. */
(function () {
  "use strict";
  const D = window.Demo;
  const S = window.DEMO_SEED;
  const $ = (s) => document.querySelector(s);
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
  const firstName = (n) => n.split(" ")[0];
  const rand = (n) => "R " + D.fmt.number(n);
  const BUDGETS = (function () {
    const b = S.budgetSteps;
    return ["Not sure yet", "Under " + rand(b[0]), rand(b[0]) + " to " + rand(b[1]), rand(b[1]) + " to " + rand(b[2]), "Over " + rand(b[2])];
  })();
  const STATUS = {
    sent: ["ok", "Quote sent"], due: ["warn", "Follow-up due"], booked: ["ok", "Booked"],
    nobudget: ["neutral", "No budget given"], reminder: ["info", "Reminder set"],
  };
  const ownerLine = S.owner.name + ", " + S.owner.phone;

  /* The pure bits: wording and dates */
  const lower = (t) => t.toLowerCase();
  const yourEvent = (t) => (t === "Other" ? "your event" : "your " + lower(t));
  const anEvent = (t) => (t === "Other" ? "an event" : "a " + lower(t));
  const reminderDate = (d) => addDays(d, 2);
  const cut = (t) => (t.length > 48 ? t.slice(0, 48).trimEnd() + "…" : t);

  /* Sheet tables (full sheet view, and the compact one in step 3) */
  const col = {
    recv: { label: "Received", render: (r) => D.fmt.date(r.received) },
    phone: { label: "WhatsApp", key: "phone" },
    type: { label: "Event", key: "type" },
    date: { label: "Event date", render: (r) => D.fmt.date(r.date) },
    guests: { label: "Guests", num: true, key: "guests" },
    suburb: { label: "Suburb", key: "suburb" },
    budget: { label: "Budget", render: (r) => BUDGETS[r.budget] },
    status: { label: "Status", render: (r) => D.badge(STATUS[r.status][0], STATUS[r.status][1]) },
  };
  const nameCol = (newId) => ({ label: "Name", render: (r) => (r.id === newId ? D.el("span", null, r.name + " ", D.badge("info", "New")) : r.name) });
  function sheet(box, rows, cols, newId) {
    D.table(box, { label: "Quote sheet", rows, columns: cols });
    const tr = newId && box.querySelector('tr[data-id="' + newId + '"]');
    if (tr) tr.classList.add("is-new");
  }
  function render(s) {
    const c = col;
    sheet($("#aut-sheet"), s.requests, [c.recv, nameCol(s.newId), c.phone, c.type, c.date, c.guests, c.suburb, c.budget, c.status], s.newId);
  }

  /* Static comparison table */
  D.table($("#aut-compare"), {
    label: "By hand or automatic",
    rows: S.compare,
    columns: [{ label: "Step", key: "step" }, { label: "By hand", key: "hand" }, { label: "Automatic", key: "auto" }],
  });

  /* Form: option lists */
  const form = $("#quote-form");
  const typeSel = $("#f-type");
  typeSel.appendChild(D.el("option", { value: "" }, "Choose one"));
  S.types.forEach((t) => typeSel.appendChild(D.el("option", { value: t }, t)));
  BUDGETS.forEach((b, i) => $("#f-budget").appendChild(D.el("option", { value: i }, b)));
  $("#f-date").min = iso(new Date());

  /* Form: errors and validation */
  const FIELDS = ["name", "phone", "date", "type", "guests", "suburb"];
  function fail(id, msg) {
    const input = $("#f-" + id), err = $("#f-" + id + "-err");
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !!msg;
  }
  const clearErrors = () => FIELDS.forEach((f) => fail(f, ""));
  function validate() {
    const v = {
      name: $("#f-name").value.trim(), phone: $("#f-phone").value.trim(), date: $("#f-date").value, type: $("#f-type").value,
      guests: Number($("#f-guests").value), suburb: $("#f-suburb").value.trim(),
      budget: Number($("#f-budget").value) || 0, notes: $("#f-notes").value.trim(),
    };
    const p = v.phone.replace(/\s/g, "");
    const msg = {
      name: v.name ? "" : "Enter your name.",
      phone: /^0\d{9}$/.test(p) || /^\+27\d{9}$/.test(p) ? "" : "Enter a South African mobile number: 10 digits starting with 0, or +27 and 9 digits.",
      date: !v.date ? "Choose the date of your event." : v.date < iso(new Date()) ? "Choose a date from today onwards." : "",
      type: v.type ? "" : "Choose the type of event.",
      guests: Number.isInteger(v.guests) && v.guests >= 10 && v.guests <= 500 && $("#f-guests").value !== "" ? "" : "Enter the number of guests, from 10 to 500.",
      suburb: v.suburb ? "" : "Enter the suburb where the event is.",
    };
    const bad = FIELDS.filter((f) => fail(f, msg[f]));
    if (bad.length) { $("#f-" + bad[0]).focus(); return null; }
    return v;
  }
  form.addEventListener("input", (e) => { const id = e.target.id.slice(2); if (FIELDS.includes(id)) fail(id, ""); });
  form.addEventListener("change", (e) => { const id = e.target.id.slice(2); if (FIELDS.includes(id)) fail(id, ""); });

  $("#aut-fill").addEventListener("click", () => {
    const p = S.prefill;
    $("#f-name").value = p.name;
    $("#f-phone").value = p.phone;
    $("#f-date").value = iso(addDays(new Date(), p.days));
    $("#f-type").value = p.type;
    $("#f-guests").value = p.guests;
    $("#f-suburb").value = p.suburb;
    $("#f-budget").value = p.budget;
    $("#f-notes").value = p.notes;
    clearErrors();
    D.toast("Sample details filled in. Press Send request.");
  });

  /* What happens next */
  const head = $("#aut-head"), emptyBox = $("#aut-empty"), recv = $("#aut-recv"), list = $("#aut-list"), tools = $("#aut-tools"), live = $("#aut-live");
  const sum = $("#aut-sum");
  let timer = null;
  emptyBox.appendChild(D.empty({ title: "Nothing sent yet", text: "Send the form to see what happens next." }));

  function stepEl(title, ...body) {
    return D.el("li", { class: "aut-step" }, D.el("div", { class: "aut-step__head" }, D.el("strong", { text: title }), D.badge("ok", "Done")), body);
  }
  function makeSteps(r, now) {
    const first = firstName(r.name), when = D.fmt.date(r.date), rem = reminderDate(now), remText = D.fmt.date(rem);
    const budget = r.budget ? "Budget: " + BUDGETS[r.budget] + "\n" : "";
    const notes = r.notes ? "Notes: " + cut(r.notes) + "\n" : "";
    return [
      { say: "WhatsApp confirmation sent to " + first + " (preview).", build: () => stepEl("WhatsApp confirmation sent to " + first,
        D.previewEl({ channel: "whatsapp", to: r.name + ", " + r.phone,
          body: "Hi " + first + ", thanks for your quote request for " + yourEvent(r.type) + " on " + when + " (" + r.guests + " guests, " + r.suburb + "). I've got all the details and I'll send you a quote within 2 days. If anything changes, just reply here. Thandi, Mopani Table Catering" })) },
      { say: "Alert sent to Thandi (preview).", build: () => stepEl("Alert sent to Thandi",
        D.previewEl({ channel: "whatsapp", to: ownerLine,
          body: "New quote request\n" + r.name + ", " + r.phone + "\n" + r.type + " on " + when + "\n" + r.guests + " guests, " + r.suburb + "\n" + budget + notes +
            "It's in your quote sheet and a reminder is set for " + remText + "." })) },
      { say: "Added to the quote sheet.", build: sheetStep },
      { say: "Follow-up reminder set for " + remText + ".", build: () => stepEl("Follow-up reminder set for " + remText + " at 09:00",
        D.el("p", { text: "On that morning Thandi gets this message:" }),
        D.previewEl({ channel: "whatsapp", to: ownerLine,
          body: "Reminder: " + r.name + " asked for a quote for " + anEvent(r.type) + " on " + when + ", 2 days ago. If you haven't sent it yet, now's a good time." }),
        D.el("p", { class: "aut-small", text: "In a real build, the reminder is cancelled once the quote is marked as sent." })) },
    ];
  }
  function sheetStep() {
    const s = D.store.get(), phone = mq("(max-width: 639px)");
    const box = D.el("div", { class: "aut-scroll" });
    const rows = phone ? s.requests.filter((r) => r.id === s.newId) : s.requests;
    sheet(box, rows, [col.recv, nameCol(s.newId), col.type, col.guests, col.status], s.newId);
    return stepEl("Added to the quote sheet",
      D.el("p", { text: "A new row was added with every detail from the form." }), box,
      phone && D.el("p", { class: "aut-small", text: "and " + (s.requests.length - 1) + " earlier requests" }),
      D.el("p", null, D.el("a", { href: "#view-sheet" }, "Open the full quote sheet")));
  }

  function stopTimer() { clearTimeout(timer); timer = null; }
  function backToStart() {
    stopTimer();
    list.textContent = "";
    list.hidden = true;
    recv.hidden = true;
    tools.textContent = "";
    live.textContent = "";
    emptyBox.hidden = false;
  }
  function runSteps(r) {
    const now = new Date(), steps = makeSteps(r, now);
    let shown = 0;
    backToStart();
    emptyBox.hidden = true;
    recv.hidden = false;
    list.hidden = false;
    recv.textContent = "Request received at " + D.fmt.time(now);
    const add = () => { list.appendChild(steps[shown].build()); return steps[shown++].say; };
    const finish = () => {
      const had = tools.contains(document.activeElement);
      tools.textContent = "";
      if (had) head.focus({ preventScroll: true });
    };
    const all = () => {
      stopTimer();
      while (shown < steps.length) add();
      live.textContent = "All 4 steps done.";
      finish();
    };
    const tick = () => {
      const say = add();
      live.textContent = "Step " + shown + " of 4: " + say;
      if (shown < steps.length) timer = setTimeout(tick, 1000);
      else { timer = null; finish(); }
    };
    if (mq("(prefers-reduced-motion: reduce)")) return all();
    tools.appendChild(D.el("button", { type: "button", class: "btn btn-secondary demo-btn--sm", onclick: all }, "Show all steps"));
    timer = setTimeout(tick, 1000);
  }

  /* Submit, summary, send another */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = validate();
    if (!v) return;
    const r = { received: iso(new Date()), name: v.name, phone: v.phone, type: v.type, date: v.date, guests: v.guests, suburb: v.suburb, budget: v.budget, notes: v.notes, status: "reminder" };
    D.store.update((s) => { r.id = "Q-" + s.nextNo++; s.requests.unshift(r); s.newId = r.id; });
    const dl = $("#aut-sum-dl");
    dl.textContent = "";
    [["Name", r.name], ["Event", r.type], ["Date", D.fmt.date(r.date)], ["Guests", String(r.guests)]].forEach((x) => dl.append(D.el("dt", { text: x[0] }), D.el("dd", { text: x[1] })));
    form.hidden = true;
    sum.hidden = false;
    runSteps(r);
    head.focus({ preventScroll: true });
    if (mq("(max-width: 1199px)")) head.scrollIntoView({ block: "start", behavior: mq("(prefers-reduced-motion: reduce)") ? "auto" : "smooth" });
  });
  function toStart() {
    backToStart();
    clearErrors();
    form.hidden = false;
    sum.hidden = true;
  }
  $("#aut-again").addEventListener("click", () => {
    toStart();
    form.reset();
    $("#f-name").focus();
  });
  D.onReset(toStart);

  D.init({ seed: S, render });
})();
