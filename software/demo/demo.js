/* Shared demo kit: window.Demo. In-memory only, no network. Docs: docs/DEMOS.md */
(function () {
 "use strict";
 const D = (window.Demo = {});
 const $ = (s) => document.querySelector(s);
 const $$ = (s) => Array.from(document.querySelectorAll(s));
 const clone = (o) => (typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
 let seed, state, views = [], subs = [], resets = [], toastEl, toastT, dlg, trigger, uidN = 0;

 const emit = () => subs.slice().forEach((f) => f(state));
 D.store = {
  get: () => state,
  set(s) { state = s; emit(); },
  update(fn) { const r = fn(state); if (r !== undefined) state = r; emit(); },
  subscribe(fn) { subs.push(fn); return () => { subs = subs.filter((f) => f !== fn); }; },
 };
 D.uid = () => "id" + ++uidN + Math.random().toString(36).slice(2, 6);
 D.onReset = (fn) => resets.push(fn);

 const cur = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });
 const num = new Intl.NumberFormat("en-ZA");
 const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 const pad = (n) => (n < 10 ? "0" : "") + n;
 const toDate = (v) => {
  const m = /^(\d{4})-(\d\d)-(\d\d)(?:[T ](\d\d):(\d\d))?/.exec(v);
  return v instanceof Date ? v : m ? new Date(+m[1], m[2] - 1, +m[3], +m[4] || 0, +m[5] || 0) : new Date(v);
 };
 D.fmt = {
  rand: (n) => cur.format(n).replace(/\s/g, " ").replace(/R(?=\d)/, "R "),
  number: (n) => num.format(n).replace(/\s/g, " "),
  date: (v) => { const d = toDate(v); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); },
  time: (v) => { const d = toDate(v); return pad(d.getHours()) + ":" + pad(d.getMinutes()); },
 };

 const add = (e, c) => {
  if (c == null || c === false) return;
  if (Array.isArray(c)) c.forEach((x) => add(e, x));
  else e.appendChild(c.nodeType ? c : document.createTextNode(c));
 };
 D.el = (tag, props, ...kids) => {
  const e = document.createElement(tag);
  for (const k in props || {}) {
   const v = props[k];
   if (v == null || v === false) continue;
   if (k === "class") e.className = v;
   else if (k === "text") e.textContent = v;
   else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
   else e.setAttribute(k, v === true ? "" : v);
  }
  kids.forEach((c) => add(e, c));
  return e;
 };

 const ensureToast = () => toastEl || (toastEl = document.body.appendChild(D.el("div", { class: "demo-toast", role: "status", "aria-live": "polite", "aria-atomic": "true" })));
 D.toast = (msg, o) => {
  const t = ensureToast(), tone = (o && o.tone) || "ok";
  clearTimeout(toastT);
  t.classList.remove("is-on");
  t.textContent = "";
  toastT = setTimeout(() => {
   t.appendChild(D.el("span", { class: "demo-toast__icon", "aria-hidden": "true", text: { ok: "✓", error: "!" }[tone] || "i" }));
   t.appendChild(D.el("span", { text: msg }));
   t.classList.add("is-on");
   toastT = setTimeout(() => t.classList.remove("is-on"), 5000);
  }, 60);
 };

 D.modal = {
  open(x) {
   const d = x.nodeType ? x : build(x), a = document.activeElement;
   if (a && a !== document.body && !a.closest("dialog")) trigger = a;
   if (!d._w) {
    d._w = 1;
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.addEventListener("close", () => {
     if (dlg === d) dlg = null;
     if (d.hasAttribute("data-built")) d.remove();
     if (dlg || !trigger) return;
     if (trigger.isConnected) trigger.focus();
     else focusHeading();
    });
   }
   dlg = d;
   d.showModal();
   return d;
  },
  close() { if (dlg) dlg.close(); },
 };
 const build = (o) => {
  const id = D.uid();
  const foot = D.el("div", { class: "demo-dialog__foot" });
  (o.actions || [{ label: "Close" }]).forEach((a) =>
   foot.appendChild(D.el("button", {
    type: "button",
    class: "btn demo-btn--sm " + (a.primary ? "btn-primary" : "btn-secondary"),
    onclick() { D.modal.close(); if (a.onClick) a.onClick(); },
   }, a.label)));
  return document.body.appendChild(D.el("dialog", { class: "demo-dialog", "aria-labelledby": id, "data-built": "" },
   D.el("div", { class: "demo-dialog__head" }, D.el("h2", { class: "demo-dialog__title", id, text: o.title })),
   D.el("div", { class: "demo-dialog__body" }, o.body), foot));
 };

 D.badge = (tone, text) => D.el("span", { class: "demo-badge demo-badge--" + tone },
  D.el("span", { class: "demo-badge__icon", "aria-hidden": "true", text: { ok: "✓", warn: "!", error: "✕", info: "i" }[tone] || "–" }), text);

 D.empty = (o) => D.el("div", { class: "demo-empty" },
  Object.assign(D.el("span", { "aria-hidden": "true" }), { innerHTML: '<svg viewBox="0 0 24 24"><path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5"/></svg>' }),
  D.el("h3", { text: o.title }), o.text && D.el("p", { class: "demo-muted", text: o.text }),
  o.action && D.el("button", { type: "button", class: "btn btn-secondary demo-btn--sm", onclick: o.action.onClick }, o.action.label));

 D.previewEl = (o) => {
  const wa = o.channel !== "email";
  return D.el("div", { class: "demo-preview demo-preview--" + (wa ? "whatsapp" : "email") },
   D.el("p", { class: "demo-preview__label", text: "Preview only. Nothing was sent." }),
   D.el("dl", { class: "demo-preview__meta" }, D.el("dt", { text: "To" }), D.el("dd", { text: o.to }),
    !wa && o.subject && [D.el("dt", { text: "Subject" }), D.el("dd", { text: o.subject })]),
   D.el("div", { class: "demo-preview__body", text: o.body }));
 };
 D.preview = (o) => D.modal.open({ title: o.channel === "email" ? "Email preview" : "WhatsApp preview", body: D.previewEl(o) });

 D.table = (box, o) => {
  box.textContent = "";
  if (!o.rows.length) return box.appendChild(D.empty(o.empty || { title: "Nothing here yet" }));
  const th = (c) => D.el("th", { role: "columnheader", scope: "col", class: c.num && "is-num", text: c.label });
  const td = (c, r) => D.el("td", { role: "cell", "data-label": c.label, class: c.num && "is-num" }, c.render ? c.render(r) : r[c.key]);
  box.appendChild(D.el("table", { class: "demo-table", role: "table", "aria-label": o.label },
   D.el("thead", { role: "rowgroup" }, D.el("tr", { role: "row" }, o.columns.map(th))),
   D.el("tbody", { role: "rowgroup" }, o.rows.map((r) => D.el("tr", { role: "row", "data-id": r.id }, o.columns.map((c) => td(c, r)))))));
 };

 const focusHeading = () => {
  const h = $(".demo-view:not([hidden]) h2");
  if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
 };
 const show = (name, focus) => {
  if (!views.includes(name)) name = views[0];
  $$(".demo-view").forEach((v) => { v.hidden = v.dataset.view !== name; });
  $$('.demo-tabs a[href^="#view-"]').forEach((a) => {
   if (a.getAttribute("href") === "#view-" + name) a.setAttribute("aria-current", "page");
   else a.removeAttribute("aria-current");
  });
  if (focus) { focusHeading(); scrollTo(0, 0); }
 };
 const route = (focus) => {
  const m = /^#view-(.+)$/.exec(location.hash);
  if (m || !focus) show(m ? m[1] : views[0], focus);
 };
 D.go = (name) => { if (location.hash === "#view-" + name) show(name, true); else location.hash = "view-" + name; };

 D.reset = () => {
  trigger = null;
  D.modal.close();
  state = clone(seed);
  resets.forEach((f) => f(state));
  $$(".demo-app form").forEach((f) => f.reset());
  emit();
  history.replaceState(null, "", "#view-" + views[0]);
  show(views[0], true);
  D.toast("Demo reset to sample data");
 };

 D.init = (o) => {
  seed = o.seed;
  state = clone(seed);
  const start = () => {
   ensureToast();
   views = o.views || $$(".demo-view").map((v) => v.dataset.view);
   if (o.render) subs.push(o.render);
   document.addEventListener("click", (e) => { if (e.target.closest("[data-demo-reset]")) D.reset(); });
   window.addEventListener("hashchange", () => route(true));
   emit();
   route(false);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
 };
})();
