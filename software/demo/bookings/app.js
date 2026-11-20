/* Bookings demo: customer wizard and owner diary for a made-up salon. In memory only. */
(function () {
 "use strict";
 const D = window.Demo, BS = window.BookingSlots, el = D.el, hm = BS.toHM;
 const $ = (s) => document.querySelector(s), $$ = (s) => Array.from(document.querySelectorAll(s));
 const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 const day = (d) => DOW[BS.dow(d)] + " " + D.fmt.date(d).slice(0, -5);
 const first = (n) => n.split(" ")[0];
 const svc = (s, id) => BS.svcOf(id, s);
 const sty = (s, id) => s.stylists.find((t) => t.id === id);
 const bk = (id) => D.store.get().bookings.find((b) => b.id === id);
 const U = (fn) => D.store.update(fn);
 const upd = (fn) => U((s) => fn(s, s.ui.customer));
 const TITLES = ["", "Choose a service", "Choose a stylist", "Pick a date and time", "Your details"];
 let focusSel = null, mv = null;
 function part(box, key, build) {
  if (box._k === key) return;
  box._k = key;
  box.replaceChildren(...[].concat(build()));
 }
 const setErr = (id, msg) => { const e = $(id); e.textContent = msg; e.hidden = !msg; };
 const clearErr = () => setErr("#c-err", "");
 const opt = (name, value, title, sub) => el("label", { class: "bk-opt" },
  el("input", { type: "radio", name, value, onchange: () => pick(name, value) }),
  el("span", {}, el("b", {}, title), sub && el("small", {}, sub)));
 function picker(o) {
  const s = o.s, dur = svc(s, o.svc).min, now = new Date();
  let date = o.date;
  const q = (d) => BS.freeStarts({ date: d, dur, stylist: o.sty, data: s, now, ignoreId: o.ignoreId });
  const times = el("div");
  const group = (t, a) => a.length && [el("p", { class: "bk-grp", text: t }), el("div", { class: "bk-times" }, a.map((x) =>
   el("label", { class: "bk-chip" }, el("input", { type: "radio", name: "pt", value: x.start, checked: x.start === o.time, onchange: () => o.onPick(date, x.start) }), el("span", {}, hm(x.start)))))];
  const draw = () => {
   const l = q(date);
   times.replaceChildren(...(l.length ? [group("Morning", l.filter((x) => x.start < 720)), group("Afternoon", l.filter((x) => x.start >= 720))].flat().filter(Boolean)
    : [el("p", { class: "demo-muted", text: "No free times on this day. Try another day." })]));
  };
  draw();
  const strip = el("div", { class: "bk-days" }, s.days.map((d) => {
   const full = !q(d).length;
   return el("label", { class: "bk-chip bk-day" },
    el("input", { type: "radio", name: "pd", value: d, checked: d === date, disabled: full, onchange: () => { date = d; draw(); o.onPick(d, null); } }),
    el("span", {}, el("small", {}, DOW[BS.dow(d)]), el("b", {}, String(+d.slice(8))), el("small", {}, full ? "Full" : D.fmt.date(d).split(" ")[1])));
  }));
  return el("div", { class: "bk-pick" },
   el("fieldset", { class: "bk-set" }, el("legend", {}, "Day"), strip),
   el("fieldset", { class: "bk-set", "aria-describedby": o.errId }, el("legend", {}, "Time"), times));
 }
 function fix(s, c) {
  if (!c.service) return;
  const o = { date: c.date, dur: svc(s, c.service).min, stylist: c.stylist, data: s, now: new Date() }, was = c.date;
  if (!BS.freeStarts(o).length) c.date = o.date = BS.firstBookable({ days: s.days, dur: o.dur, stylist: c.stylist, data: s, now: o.now });
  if (c.time != null && (c.date !== was || !BS.freeStarts(o).some((x) => x.start === c.time))) {
   c.time = null;
   c.note = "Your time is no longer free for that choice. Please pick another.";
  }
 }
 function pick(k, v) {
  clearErr();
  upd((s, c) => { c[k] = v; fix(s, c); });
 }
 function go(n) {
  clearErr();
  focusSel = "#c-h";
  upd((s, c) => {
   if (c.step === 4) { c.name = $("#f-name").value; c.phone = $("#f-phone").value; }
   c.step = n;
   if (n !== 3) c.note = "";
  });
 }
 function fail(msg, sel) {
  setErr("#c-err", msg);
  const i = $(sel);
  if (i) i.focus();
 }
 function next() {
  const c = D.store.get().ui.customer;
  if (c.step === 1 && !c.service) return fail("Choose a service to continue.", "#c-body input");
  if (c.step === 3 && c.time == null) return fail("Pick a time to continue.", "#c-body input[name=pt]");
  if (c.step === 4) return book();
  go(c.step + 1);
 }
 const bad = (id, msg) => { setErr("#f-" + id + "-err", msg); $("#f-" + id).setAttribute("aria-invalid", !!msg); return !!msg; };
 function book() {
  const name = $("#f-name").value.trim(), phone = $("#f-phone").value.trim();
  const e1 = bad("name", name ? "" : "Enter your name."), e2 = bad("phone", /^(0\d{9}|\+27\d{9})$/.test(phone.replace(/\s/g, "")) ? "" : "Enter a mobile number like 071 000 0000.");
  if (e1 || e2) return $(e1 ? "#f-name" : "#f-phone").focus();
  focusSel = "#c-done-h";
  upd((s, c) => {
   const hit = BS.freeStarts({ date: c.date, dur: svc(s, c.service).min, stylist: c.stylist, data: s, now: new Date() }).find((x) => x.start === c.time);
   if (!hit) { c.step = 3; c.time = null; c.note = "That time was just taken. Please pick another."; focusSel = "#c-h"; return; }
   const id = "MH-" + s.nextNo++, sid = c.stylist === "any" ? BS.pickStylist(hit.stylists, c.date, s) : c.stylist;
   s.bookings.push({ id, date: c.date, start: c.time, svc: c.service, sty: sid, name, phone });
   c.name = name; c.phone = phone; c.booked = id;
   s.ui.owner = { mode: "day", date: c.date, highlight: { id, kind: "new" } };
  });
 }
 const fresh = (s) => Object.assign({}, window.DEMO_SEED.ui.customer, { date: BS.firstBookable({ days: s.days, dur: 30, stylist: "any", data: s, now: new Date() }) });
 function body(s, c) {
  if (c.step === 3) return picker({ s, svc: c.service, sty: c.stylist, date: c.date, time: c.time, errId: "c-err", onPick: (d, t) => { clearErr(); upd((x, y) => { y.date = d; y.time = t; y.note = ""; }); } });
  const one = c.step === 1;
  return el("fieldset", { class: "bk-set", "aria-describedby": "c-err" }, el("legend", { class: "visually-hidden" }, one ? "Service" : "Stylist"),
   one ? s.services.map((v) => opt("service", v.id, v.name, v.min + " min · " + D.fmt.rand(v.price))) : [opt("stylist", "any", "Any stylist", "We pick whoever is free"), s.stylists.map((t) => opt("stylist", t.id, t.name))]);
 }
 function renderCustomer(s) {
  const c = s.ui.customer, b = c.booked && s.bookings.find((x) => x.id === c.booked), st = c.step, v = c.service && svc(s, c.service);
  $("#c-wiz").hidden = !!b;
  $("#c-done").hidden = !b;
  if (b) {
   const t = sty(s, b.sty), when = day(b.date) + ", " + hm(b.start), sv = svc(s, b.svc);
   $("#d-what").replaceChildren(el("b", {}, sv.name), " · " + when + " with " + first(t.name));
   $("#d-ref").textContent = "Reference " + b.id + " · " + D.fmt.rand(sv.price) + " · " + sv.min + " min";
   $("#d-wa").replaceChildren(D.previewEl({ channel: "whatsapp", to: b.phone, body: "Hi " + first(b.name) + ", you're booked at Marula Hair Studio: " + sv.name.toLowerCase() + " with " + first(t.name) + " on " + when + ". Reference " + b.id + ". See you then!" }));
   return;
  }
  $("#c-wiz").dataset.step = st;
  $("#c-h").textContent = "Step " + st + " of 4: " + TITLES[st];
  $("#c-note").textContent = c.note;
  $("#c-note").hidden = !c.note || st !== 3;
  $("#c-back").hidden = st === 1;
  $("#c-next").textContent = st === 4 ? "Confirm booking" : "Next";
  $$("#c-steps .bk-step").forEach((x, i) => { x.disabled = i + 1 >= st; x.setAttribute("aria-current", i + 1 === st ? "step" : "false"); });
  if (st === 4 && $("#c-form").hidden) { $("#f-name").value = c.name; $("#f-phone").value = c.phone; bad("name", ""); bad("phone", ""); }
  $("#c-form").hidden = st !== 4;
  $("#c-body").hidden = st === 4;
  if (st < 4) part($("#c-body"), st + (st === 3 ? "|" + c.service + c.stylist + JSON.stringify(s.bookings) : ""), () => body(s, c));
  $$("#c-body input[name=service],#c-body input[name=stylist]").forEach((i) => { i.checked = i.value === c[i.name]; });
  const R = { service: v && v.name, stylist: c.stylist === "any" ? "Any stylist" : sty(s, c.stylist).name, date: c.time != null && day(c.date), time: c.time != null && hm(c.time), price: v && D.fmt.rand(v.price) + " · " + v.min + " min" };
  for (const k in R) {
   const dd = $('[data-r="' + k + '"]');
   dd.firstChild.textContent = R[k] || "Not chosen yet";
   if (dd.children[1]) dd.children[1].hidden = !R[k];
  }
 }
 const wkStart = (s, d) => BS.addDays(s.today, 7 * Math.floor(BS.diff(s.today, d) / 7));
 const last = (s) => s.days[s.days.length - 1];
 const count = (n) => (n ? n + (n === 1 ? " booking" : " bookings") : "No bookings");
 function item(it, s, mode) {
  if (it.type === "block") return el("div", { class: "bk-item bk-block" }, el("b", {}, hm(it.from) + "–" + hm(it.to)),
   (it.off ? "" : "Blocked: ") + it.label + (mode === "a" ? " · " + first(sty(s, it.sty).name) : ""));
  const b = it.b, v = svc(s, b.svc), t = sty(s, b.sty), hi = s.ui.owner.highlight, flag = hi && hi.id === b.id ? hi.kind : null;
  const label = [b.name, v.name, hm(it.from) + " to " + hm(it.to), "with " + first(t.name)].join(", ") + (flag ? ". " + (flag === "new" ? "New" : "Moved") + " booking." : "");
  return el("button", { type: "button", class: "bk-item" + (flag ? " is-" + flag : ""), "aria-label": label, onclick: () => details(b.id) },
   el("b", {}, mode === "a" ? hm(it.from) + "–" + hm(it.to) : b.name),
   mode === "a" && " " + b.name,
   el("small", {}, v.name + (mode === "a" ? " · with " + first(t.name) : "")),
   flag && D.badge(flag === "new" ? "info" : "warn", flag === "new" ? "New" : "Moved"));
 }
 function dayView(s, date) {
  const h = BS.hoursFor(date, s);
  if (!h) return D.empty({ title: "Closed on Sundays", text: "Use the arrows to find an open day." });
  const items = BS.dayItems(date, s), rows = (h[1] - h[0]) / 30, r = (m) => (m - h[0]) / 30 + 2;
  const grid = el("div", { class: "bk-dayg" });
  grid.style.gridTemplateColumns = "3rem repeat(" + s.stylists.length + ", minmax(0, 1fr))";
  const gut = el("div", { class: "bk-gut", "aria-hidden": "true" });
  for (let m = h[0]; m < h[1]; m += 60) { const t = el("span", {}, hm(m)); t.style.gridRow = r(m) + " / span 2"; gut.appendChild(t); }
  const tpl = "2rem repeat(" + rows + ", 3rem)";
  gut.style.gridTemplateRows = tpl;
  grid.appendChild(gut);
  s.stylists.forEach((t) => {
   const col = el("section", { class: "bk-col", "aria-label": first(t.name) + "'s day" }, el("h3", {}, first(t.name)));
   col.style.gridTemplateRows = tpl;
   items.filter((i) => i.sty === t.id).forEach((i) => { const n = item(i, s, "g"); n.style.gridRow = r(i.from) + " / span " + (i.to - i.from) / 30; col.appendChild(n); });
   grid.appendChild(col);
  });
  return [grid, el("ul", { class: "bk-agenda" }, items.filter((i) => !i.off).map((i) => el("li", {}, item(i, s, "a"))))];
 }
 function weekView(s, start) {
  return el("ol", { class: "bk-week", "aria-label": "Week" }, [0, 1, 2, 3, 4, 5, 6].map((i) => {
   const d = BS.addDays(start, i), closed = !BS.hoursFor(d, s), c = count(s.bookings.filter((x) => x.date === d).length);
   return el("li", { class: "bk-wd" + (closed ? " is-closed" : "") },
    closed ? el("p", { class: "bk-wh" }, el("b", {}, day(d)), el("span", {}, "Closed"))
     : el("button", { type: "button", class: "bk-wh", "aria-label": day(d) + ", " + c, onclick: () => openDay(d) }, el("b", {}, day(d)), el("span", {}, c)));
  }));
 }
 function openDay(d) {
  focusSel = "#o-label";
  U((s) => { s.ui.owner.mode = "day"; s.ui.owner.date = d; });
 }
 function renderOwner(s) {
  const o = s.ui.owner, wk = o.mode === "week", ws = wkStart(s, o.date), a = D.fmt.date(wk ? ws : o.date);
  $("#o-day").setAttribute("aria-pressed", String(!wk));
  $("#o-week").setAttribute("aria-pressed", String(wk));
  $("#o-label").textContent = wk ? "Week of " + a : day(o.date) + " " + a.slice(-4);
  const at = (id, dis, lab) => { const n = $(id); n.setAttribute("aria-disabled", String(dis)); n.setAttribute("aria-label", lab); };
  at("#o-prev", (wk ? ws : o.date) <= s.today, wk ? "Previous week" : "Previous day");
  at("#o-next", wk ? BS.addDays(ws, 7) > last(s) : o.date >= last(s), wk ? "Next week" : "Next day");
  part($("#o-body"), JSON.stringify([o, s.bookings]), () => (wk ? weekView(s, ws) : dayView(s, o.date)));
 }
 function move(n) {
  const s = D.store.get(), o = s.ui.owner, wk = o.mode === "week", d = BS.addDays(wk ? wkStart(s, o.date) : o.date, n * (wk ? 7 : 1));
  if (d < s.today || d > last(s)) return;
  U((x) => { x.ui.owner.date = d; });
 }
 function scrollHi() {
  const n = $$(".bk-item.is-new,.bk-item.is-moved").find((x) => x.offsetParent);
  if (n) n.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
 }
 ["day", "week"].forEach((m) => { $("#o-" + m).onclick = () => U((s) => { s.ui.owner.mode = m; }); });
 $("#o-prev").onclick = () => move(-1);
 $("#o-next").onclick = () => move(1);
 $("#o-today").onclick = () => U((s) => { s.ui.owner.date = s.today; });
 function details(id) {
  const s = D.store.get(), b = bk(id), v = svc(s, b.svc);
  D.modal.open({
   title: b.name,
   body: el("div", {}, el("p", {}, el("b", {}, v.name), " · " + v.min + " min · " + D.fmt.rand(v.price)),
    el("p", {}, D.fmt.date(b.date) + ", " + hm(b.start) + " to " + hm(b.start + v.min) + " with " + first(sty(s, b.sty).name)),
    el("p", { class: "demo-muted", text: b.phone + " · " + b.id })),
   actions: [{ label: "Close" }, { label: "Cancel booking", onClick: () => askCancel(id) }, { label: "Reschedule", primary: true, onClick: () => openMove(id) }],
  });
 }
 function askCancel(id) {
  const b = bk(id);
  D.modal.open({
   title: "Cancel " + first(b.name) + "'s " + hm(b.start) + "?",
   body: "This removes the booking from the sample diary. Reset brings it back.",
   actions: [{ label: "Keep it" }, { label: "Cancel booking", primary: true, onClick: () => {
    U((s) => {
     s.bookings = s.bookings.filter((x) => x.id !== id);
     if (s.ui.owner.highlight && s.ui.owner.highlight.id === id) s.ui.owner.highlight = null;
     if (s.ui.customer.booked === id) s.ui.customer = fresh(s);
    });
    D.toast("Booking cancelled");
   } }],
  });
 }
 function drawMove() {
  const s = D.store.get(), b = bk(mv.id);
  setErr("#mv-err", "");
  $("#mv-pick").replaceChildren(picker({ s, svc: b.svc, sty: mv.sty, date: mv.date, time: null, ignoreId: b.id, errId: "mv-err", onPick: (d, t) => { mv.date = d; mv.time = t; setErr("#mv-err", ""); } }));
 }
 function openMove(id) {
  const s = D.store.get(), b = bk(id), sel = $("#mv-sty");
  mv = { id, date: b.date, time: null, sty: b.sty };
  $("#mv-title").textContent = "Move " + first(b.name) + "'s " + svc(s, b.svc).name.toLowerCase();
  sel.replaceChildren(el("option", { value: "any", text: "Any stylist" }), ...s.stylists.map((t) => el("option", { value: t.id, text: t.name })));
  sel.value = b.sty;
  drawMove();
  D.modal.open($("#move-dialog"));
 }
 $("#mv-sty").onchange = (e) => { mv.sty = e.target.value; mv.time = null; drawMove(); };
 $("#mv-go").onclick = () => {
  const s = D.store.get(), b = bk(mv.id);
  if (mv.time == null) { setErr("#mv-err", "Pick a time to continue."); return $("#mv-pick input[name=pt]") && $("#mv-pick input[name=pt]").focus(); }
  const hit = BS.freeStarts({ date: mv.date, dur: svc(s, b.svc).min, stylist: mv.sty, data: s, now: new Date(), ignoreId: b.id }).find((x) => x.start === mv.time);
  if (!hit) { setErr("#mv-err", "That time is no longer free. Pick another."); return; }
  const sid = mv.sty === "any" ? BS.pickStylist(hit.stylists, mv.date, s) : mv.sty, m = mv;
  D.modal.close();
  U((x) => {
   const y = x.bookings.find((z) => z.id === m.id);
   y.date = m.date; y.start = m.time; y.sty = sid;
   x.ui.owner = { mode: "day", date: m.date, highlight: { id: y.id, kind: "moved" } };
  });
  D.toast("Moved to " + day(m.date) + ", " + hm(m.time));
  setTimeout(scrollHi, 0);
 };
 function render(s) {
  renderCustomer(s);
  renderOwner(s);
  if (focusSel) { const n = $(focusSel); focusSel = null; if (n) n.focus(); }
 }
 $("#c-next").onclick = next;
 $$("[data-step]").forEach((b) => { b.onclick = () => go(+b.dataset.step); });
 $("#f-name").onkeydown = $("#f-phone").onkeydown = (e) => { if (e.key === "Enter") next(); };
 $("#d-diary").onclick = () => { D.go("owner"); setTimeout(scrollHi, 120); };
 $("#d-again").onclick = () => { focusSel = "#c-h"; upd((x) => { x.ui.customer = fresh(x); }); };
 $("#c-back").onclick = () => go(D.store.get().ui.customer.step - 1);
 D.onReset(() => { focusSel = null; clearErr(); });
 D.init({ seed: window.DEMO_SEED, render });
})();
