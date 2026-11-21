/* Job cards demo: manager board, technician phone, job card, report. In-memory only. Docs: docs/DEMOS.md */
(function () {
 "use strict";
 const D = window.Demo, R = window.JCRules, E = D.el, F = D.fmt;
 const $ = (s) => document.querySelector(s);
 const S = () => D.store.get();
 const up = (fn) => D.store.update(fn);
 const mq = window.matchMedia("(min-width: 1024px)");
 let strokes = {}, card = null;
 const job = (id, s) => (s || S()).jobs.find((j) => j.id === id);
 const cust = (j) => S().customers.find((c) => c.id === j.customerId);
 const tech = (id) => S().techs.find((t) => t.id === id);
 const byStart = (a, b) => (a.start < b.start ? -1 : 1);
 const ST = { unassigned: ["warn", "Unassigned"], scheduled: ["neutral", "Scheduled"], onway: ["info", "On the way"], progress: ["info", "In progress"], done: ["ok", "Done"] };
 const badge = (j) => D.badge(ST[j.status][0], ST[j.status][1]);
 const slot = (j) => F.time(j.start) + "–" + F.time(j.end);
 const units = (j) => j.units.length + " split unit" + (j.units.length > 1 ? "s" : "");
 const njobs = (n) => n + (n === 1 ? " job" : " jobs");
 const start = (x) => { if (x.status === "scheduled" || x.status === "onway") { x.status = "progress"; x.arrivedAt = x.start; } };
 const keep = (fn) => {
  const a = document.activeElement, k = a && a.dataset && a.dataset.k;
  fn();
  const n = k && $('[data-k="' + k + '"]');
  if (n && n !== document.activeElement) n.focus({ preventScroll: true });
 };
 const later = (fn) => setTimeout(fn, 90);

 /* Manager board */
 function renderBoard(s) {
  $("#jc-date").textContent = "Today, " + F.date(new Date());
  $("#jc-jobs").replaceChildren(...s.jobs.slice().sort(byStart).map((j) => {
   const c = cust(j), t = j.techId && tech(j.techId);
   return E("article", { class: "demo-card jc-job" },
    E("div", { class: "jc-job__top" }, E("span", { class: "jc-time", text: slot(j) }), badge(j)),
    E("h3", { text: j.ref + " · " + c.name }),
    E("p", { class: "demo-muted", text: c.suburb }),
    E("p", { text: s.services[j.service].label + " · " + units(j) }),
    E("p", { text: t ? "Technician: " + t.name : "No technician yet" }),
    E("div", { class: "demo-actions" }, t
     ? E("button", { type: "button", "data-k": "ob-" + j.id, class: "btn btn-secondary demo-btn--sm", onclick: () => openJob(j.id) }, "Open as technician")
     : E("button", { type: "button", "data-k": "as-" + j.id, class: "btn btn-primary demo-btn--sm", onclick: () => assign(j.id) }, "Assign technician")));
  }));
  $("#jc-techs").replaceChildren(...s.techs.map((t) => {
   const mine = s.jobs.filter((j) => j.techId === t.id).sort(byStart);
   return E("div", { class: "demo-card" }, E("h3", { text: t.name }), E("p", { class: "demo-muted", text: njobs(mine.length) + " today" }),
    E("ul", { class: "jc-plain jc-tlist" }, mine.map((j) => E("li", {}, E("span", { text: F.time(j.start) + " " + j.ref }), badge(j)))));
  }));
 }
 function renderTips(s) {
  const j6 = job("j6", s);
  const steps = [["Assign JC-1046 to a technician", !!j6.techId], ["Open the job on the phone from the WhatsApp alert", s.ui.tips.opened],
   ["Tick the checklist, add a photo, sign, then mark the job complete", j6.status === "done"], ["Read the end-of-day report", s.ui.tips.report]];
  $("#jc-tips").replaceChildren(E("div", { class: "demo-card jc-tips" }, E("h3", { text: "Try this" }),
   E("ol", { class: "jc-plain" }, steps.map((x, i) => E("li", { class: x[1] ? "is-done" : "" },
    E("span", { class: "jc-tick", "aria-hidden": "true", text: x[1] ? "✓" : i + 1 }), x[0], x[1] && E("span", { class: "visually-hidden", text: " (done)" }))))));
 }

 /* Assign flow and WhatsApp alert */
 function assign(id) {
  const s = S(), j = job(id), n = (t) => s.jobs.filter((x) => x.techId === t.id).length;
  let pick = s.techs.slice().sort((a, b) => n(a) - n(b))[0].id;
  const rows = s.techs.map((t) => E("label", { class: "jc-pill jc-row" },
   E("input", { type: "radio", name: "jc-assign", value: t.id, checked: t.id === pick, onchange: () => { pick = t.id; } }),
   E("span", { text: t.name }), E("span", { class: "demo-muted", text: njobs(n(t)) + " today" })));
  D.modal.open({ title: "Assign " + j.ref, body: E("div", { class: "jc-assign" },
   E("p", { text: cust(j).name + ", " + slot(j) }), E("fieldset", { class: "jc-fs" }, E("legend", { text: "Technician" }), rows)),
   actions: [{ label: "Cancel" }, { label: "Assign", primary: true, onClick: () => doAssign(id, pick) }] });
 }
 function doAssign(id, tid) {
  up((st) => { const j = job(id, st); j.techId = tid; j.status = "scheduled"; st.ui.techId = tid; st.ui.openJobId = null; st.ui.alert = { jobId: id, techId: tid }; });
  D.toast(job(id).ref + " assigned to " + tech(tid).name);
  if (mq.matches) later(() => { const h = $("#jc-alert-h"); if (h) h.focus(); });
  else alertModal();
 }
 function alertEl(a) {
  const j = job(a.jobId), c = cust(j), t = tech(a.techId);
  return D.previewEl({ channel: "whatsapp", to: t.name + " (" + t.phone + ")",
   body: "New job: " + j.ref + "\n" + slot(j) + " today\n" + c.name + ", " + c.address + ", " + c.suburb + "\n" + S().services[j.service].label + ", " + units(j) + "\nAccess: " + c.access });
 }
 function alertModal() {
  const a = S().ui.alert;
  if (a) D.modal.open({ title: "Simulated WhatsApp alert", body: alertEl(a), actions: [{ label: "Open job", primary: true, onClick: () => openJob(a.jobId) }, { label: "Back to board" }] });
 }

 /* Technician list */
 function renderTech(s) {
  const sel = $("#jc-tech-sel"), open = !!s.ui.openJobId;
  if (!sel.options.length) s.techs.forEach((t) => sel.add(new Option(t.name, t.id)));
  sel.value = s.ui.techId;
  $("#jc-list").hidden = open;
  $("#jc-cardbox").hidden = !open;
  const a = s.ui.alert && s.ui.alert.techId === s.ui.techId ? s.ui.alert : null;
  $("#jc-alert").replaceChildren(...(a ? [E("div", { class: "jc-alert" },
   E("h3", { id: "jc-alert-h", tabindex: "-1", "data-k": "alert-h", text: "Simulated WhatsApp alert" }), alertEl(a),
   E("button", { type: "button", "data-k": "alert-open", class: "btn btn-primary demo-btn--sm", onclick: () => openJob(a.jobId) }, "Open job"))] : []));
  const mine = s.jobs.filter((j) => j.techId === s.ui.techId).sort(byStart);
  $("#jc-myjobs").replaceChildren(E("h3", { text: "My jobs today" }), mine.length
   ? E("ul", { class: "jc-plain jc-mini" }, mine.map((j) => E("li", {}, E("button", { type: "button", "data-k": "ml-" + j.id, onclick: () => openJob(j.id) },
    E("span", { class: "jc-time", text: slot(j) }), E("strong", { text: j.ref + " · " + cust(j).name }), E("span", { class: "demo-muted", text: cust(j).suburb }), badge(j)))))
   : D.empty({ title: "No jobs for this technician today" }));
  if (card && card.id !== s.ui.openJobId) { card.ro.disconnect(); card.el.remove(); card = null; }
  if (open && !card) { card = buildCard(job(s.ui.openJobId, s)); $("#jc-cardbox").appendChild(card.el); $("#jc-screen").scrollTop = 0; }
  if (card) patchCard(card, job(card.id, s), s);
 }
 function openJob(id) {
  up((st) => { st.ui.techId = job(id, st).techId; st.ui.openJobId = id; if (st.ui.alert && st.ui.alert.jobId === id) st.ui.alert = null; if (id === "j6") st.ui.tips.opened = true; });
  if (!mq.matches) D.go("tech");
  later(() => { if (card) card.h.focus(); });
 }

 /* Job card: built once, then patched in place */
 function buildCard(j) {
  const s = S(), c = cust(j), r = { id: j.id, showMiss: false, mk: "", key: null, mode: "draw" };
  r.h = E("h3", { id: "jc-card-h", tabindex: "-1", text: j.ref + " · " + c.name });
  r.badge = E("span");
  r.need = E("p", { class: "jc-need", "aria-live": "polite" });
  r.next = E("button", { type: "button", class: "btn btn-primary jc-edit", onclick: () => advance(j.id) });
  const checks = s.checklist.map((it) => {
   const ck = j.checks[it.id];
   const note = E("input", { type: "text", id: "jc-n-" + it.id, maxlength: "140", autocomplete: "off", value: ck.note,
    onchange: (e) => up((st) => { job(j.id, st).checks[it.id].note = e.target.value; }) });
   const nw = E("div", { class: "form-field jc-note", hidden: ck.state !== "problem" }, E("label", { for: note.id, text: "What is the problem?" }), note);
   const pill = (v, t) => E("label", { class: "jc-pill" }, E("input", { type: "radio", name: "jc-c-" + it.id, value: v, checked: ck.state === v,
    onchange: () => { nw.hidden = v !== "problem"; up((st) => { const x = job(j.id, st); x.checks[it.id].state = v; start(x); }); if (v === "problem") note.focus(); } }), t);
   return E("fieldset", { class: "jc-check jc-fs", "data-item": it.id }, E("legend", { text: it.label + (it.req ? " (required)" : "") }),
    E("div", { class: "jc-pills" }, pill("ok", "Done"), pill("problem", "Problem")), nw);
  });
  r.file = E("input", { type: "file", accept: "image/*", capture: "environment", class: "visually-hidden", onchange: onFile });
  r.add = E("label", { class: "btn btn-secondary demo-btn--sm jc-file jc-edit" }, r.file, "Take or add photo");
  r.sample = E("button", { type: "button", class: "btn btn-secondary demo-btn--sm jc-edit", onclick: () => addPhoto(null) }, "Use sample photo");
  r.strip = E("ul", { class: "jc-plain jc-strip" });
  r.cv = E("canvas", { class: "jc-sig", role: "img", "aria-label": "Signature area. Draw with a finger or a mouse, or choose Type name instead." });
  r.clear = E("button", { type: "button", class: "btn btn-secondary demo-btn--sm jc-edit", onclick: () => { strokes[r.id] = []; r.redraw(); syncSig(); } }, "Clear");
  r.toggle = E("button", { type: "button", class: "btn btn-secondary demo-btn--sm jc-edit", onclick: () => setMode(r.mode === "draw" ? "type" : "draw") });
  r.name = E("input", { type: "text", id: "jc-sig-name", maxlength: "60", autocomplete: "off", onchange: syncSig });
  r.nameBox = E("div", { class: "form-field" }, E("label", { for: "jc-sig-name", text: "Customer's full name" }), r.name);
  r.sigH = E("h4", { tabindex: "-1", text: "Customer signature" });
  r.miss = E("div", { class: "jc-miss", tabindex: "-1", role: "alert", hidden: true });
  r.done = E("p", { class: "jc-donemsg", hidden: true });
  r.complete = E("button", { type: "button", class: "btn btn-primary jc-edit", onclick: complete }, "Mark job complete");
  r.el = E("article", { class: "jc-card", "aria-labelledby": "jc-card-h" },
   E("button", { type: "button", "data-k": "back", class: "btn btn-secondary demo-btn--sm", onclick: () => { up((st) => { st.ui.openJobId = null; }); const b = $('[data-k="ml-' + r.id + '"]'); if (b) b.focus(); } }, "← My jobs"),
   r.h, E("div", { class: "jc-meta" }, r.badge, E("span", { text: slot(j) })), r.need, r.next,
   E("section", { class: "jc-sec" }, E("h4", { text: "Customer" }), E("p", { text: c.name + " · " + c.phone }), E("p", { text: c.address + ", " + c.suburb }), E("p", { class: "demo-muted", text: "Access: " + c.access })),
   E("section", { class: "jc-sec" }, E("h4", { text: "Service" }), E("p", { text: s.services[j.service].label + " · " + units(j) }),
    E("ul", { class: "jc-plain demo-muted" }, j.units.map((u) => E("li", { text: F.number(u.btu) + " BTU, " + u.room })))),
   E("section", { class: "jc-sec" }, E("h4", { text: "Checklist" }), checks),
   E("section", { class: "jc-sec" }, E("h4", { text: "Photos (optional, up to 3)" }), E("div", { class: "demo-actions" }, r.add, r.sample), r.strip,
    E("p", { class: "demo-muted", text: "Photos stay on this phone. Nothing is uploaded." })),
   E("section", { class: "jc-sec" }, r.sigH, r.cv, E("div", { class: "demo-actions" }, r.clear, r.toggle), r.nameBox),
   E("section", { class: "jc-sec" }, r.miss, r.complete, r.done));
  r.fields = r.el.querySelectorAll("fieldset.jc-check");
  initPad(r);
  card = r;
  r.name.value = j.signature && j.signature.kind === "typed" ? j.signature.name : "";
  setMode(j.signature && j.signature.kind === "typed" ? "type" : "draw", true);
  return r;
 }
 function patchCard(r, j, s) {
  const done = j.status === "done";
  r.badge.replaceChildren(badge(j));
  r.need.textContent = done ? "This job is complete." : R.need(j, s.checklist);
  r.next.hidden = j.status !== "scheduled" && j.status !== "onway";
  r.next.textContent = j.status === "scheduled" ? "I'm on my way" : "Start job";
  r.el.classList.toggle("is-done", done);
  r.fields.forEach((f) => { f.disabled = done; });
  r.name.disabled = done;
  r.done.hidden = !done;
  r.done.textContent = done ? "Job complete. Finished at " + F.time(j.doneAt) + " (simulated time)." : "";
  const key = j.photos.map((p) => p.id).join() + (done ? "d" : "");
  if (key !== r.key) {
   r.key = key;
   r.strip.replaceChildren(...j.photos.map((p, i) => E("li", { class: "jc-thumb" },
    p.url ? E("img", { src: p.url, alt: "Photo " + (i + 1) }) : sampleCanvas(i),
    !done && E("button", { type: "button", class: "btn btn-secondary demo-btn--sm", onclick: () => removePhoto(p.id) }, "Remove", E("span", { class: "visually-hidden", text: " photo " + (i + 1) })))));
  }
  const full = j.photos.length >= 3;
  r.file.disabled = r.sample.disabled = full;
  r.add.classList.toggle("is-off", full);
  const m = r.showMiss && !done ? R.missing(j, s.checklist) : [];
  r.showMiss = m.length > 0;
  r.miss.hidden = !r.showMiss;
  const mk = m.map((x) => x.label).join("|");
  if (mk !== r.mk) {
   r.mk = mk;
   r.miss.replaceChildren(...(m.length ? [E("p", { text: "Still needed before this job can be completed:" }),
    E("ul", { class: "jc-plain" }, m.map((x) => E("li", {}, E("button", { type: "button", class: "jc-link", onclick: () => jump(x) }, x.label))))] : []));
  }
 }
 function jump(x) {
  const f = x.kind === "check" && card.el.querySelector('[data-item="' + x.id + '"]');
  const bad = f && job(card.id).checks[x.id].state === "problem";
  (f ? f.querySelector(bad ? "input[type=text]" : "input") : card.sigH).focus();
 }
 function advance(id) {
  up((st) => { const x = job(id, st); if (x.status === "scheduled") x.status = "onway"; else start(x); });
  D.toast(job(id).status === "onway" ? "Status: on the way." : "Status: in progress.");
  (job(id).status === "progress" ? card.h : card.next).focus();
 }
 function complete() {
  const r = card;
  syncSig();
  const s = S(), j = job(r.id);
  if (R.missing(j, s.checklist).length) { r.showMiss = true; r.mk = ""; patchCard(r, j, s); r.miss.focus(); return; }
  up((st) => { const x = job(r.id, st); x.status = "done"; x.doneAt = R.addMin(x.arrivedAt || x.start, R.mins(st.services[x.service], x)); });
  D.toast(j.ref + " complete. The manager board is updated.");
  r.done.tabIndex = -1;
  r.done.focus();
 }

 /* Photos: resized on the phone and kept as small data URLs (the site CSP does not allow blob: images). */
 function addPhoto(url) {
  if (job(card.id).photos.length >= 3) return D.toast("Up to 3 photos per job.", { tone: "error" });
  const id = card.id;
  up((st) => { job(id, st).photos.push({ id: D.uid(), url: url, sample: !url }); });
  D.toast("Photo added.");
 }
 function onFile(e) {
  const f = e.target.files[0];
  e.target.value = "";
  if (!f) return;
  const fail = () => D.toast("That file could not be used as a photo.", { tone: "error" });
  if (!/^image\//.test(f.type) || !window.createImageBitmap) return fail();
  createImageBitmap(f).then((bm) => {
   const k = Math.min(1, 640 / Math.max(bm.width, bm.height)), c = E("canvas");
   c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
   c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
   if (bm.close) bm.close();
   if (card) addPhoto(c.toDataURL("image/jpeg", 0.75));
  }, fail);
 }
 function removePhoto(pid) {
  up((st) => { const x = job(card.id, st); x.photos = x.photos.filter((p) => p.id !== pid); });
  D.toast("Photo removed.");
  card.file.focus();
 }
 function sampleCanvas(i) {
  const c = E("canvas", { width: "192", height: "144", role: "img", "aria-label": "Sample photo " + (i + 1) }), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 144);
  g.addColorStop(0, "#cfe6f3"); g.addColorStop(1, "#f4f1ed");
  x.fillStyle = g; x.fillRect(0, 0, 192, 144);
  x.fillStyle = "#fff"; x.strokeStyle = "#7c8494"; x.lineWidth = 3;
  x.beginPath(); x.rect(28, 34, 136, 44); x.fill(); x.stroke();
  x.strokeStyle = "#b9c2cf"; x.lineWidth = 2;
  for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(44, 56 + k * 5); x.lineTo(148, 56 + k * 5); x.stroke(); }
  x.fillStyle = "#3fa9d6"; x.fillRect(40, 44, 40, 6);
  x.fillStyle = "#5e6878"; x.font = "bold 14px sans-serif"; x.fillText("Sample photo", 52, 118);
  return c;
 }

 /* Signature pad: Pointer Events, sharp on high-DPI screens, redrawn from stored strokes on resize */
 function initPad(r) {
  const cv = r.cv, ctx = cv.getContext("2d");
  let w = 0, h = 0, cur = null, box = null;
  const list = () => (strokes[r.id] = strokes[r.id] || []);
  const ink = () => { ctx.lineWidth = 2.5; ctx.lineCap = ctx.lineJoin = "round"; ctx.strokeStyle = ctx.fillStyle = getComputedStyle(cv).color; };
  const line = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0] * w, a[1] * h); ctx.lineTo(b[0] * w, b[1] * h); ctx.stroke(); };
  const dot = (p) => { ctx.beginPath(); ctx.arc(p[0] * w, p[1] * h, 1.4, 0, 6.3); ctx.fill(); };
  const pt = (e) => [Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)), Math.min(1, Math.max(0, (e.clientY - box.top) / box.height))];
  r.redraw = () => { ctx.clearRect(0, 0, w, h); ink(); list().forEach((s) => (s.length === 1 ? dot(s[0]) : s.forEach((p, i) => i && line(s[i - 1], p)))); };
  r.ro = new ResizeObserver(() => {
   const b = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
   if (!b.width) return;
   w = b.width; h = b.height; cv.width = Math.round(w * d); cv.height = Math.round(h * d);
   ctx.setTransform(d, 0, 0, d, 0, 0);
   r.redraw();
  });
  r.ro.observe(cv);
  cv.addEventListener("pointerdown", (e) => {
   if (job(r.id).status === "done" || (e.pointerType === "mouse" && e.button)) return;
   e.preventDefault();
   box = cv.getBoundingClientRect();
   cv.setPointerCapture(e.pointerId);
   cur = [pt(e)]; list().push(cur); ink(); dot(cur[0]);
  });
  cv.addEventListener("pointermove", (e) => {
   if (!cur) return;
   const ev = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
   (ev.length ? ev : [e]).forEach((x) => { const p = pt(x); line(cur[cur.length - 1], p); cur.push(p); });
  });
  const end = () => { if (cur) { cur = null; syncSig(); } };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
 }
 function setMode(m, quiet) {
  const r = card;
  r.mode = m;
  r.cv.hidden = r.clear.hidden = m === "type";
  r.nameBox.hidden = m !== "type";
  r.toggle.textContent = m === "type" ? "Draw signature instead" : "Type name instead";
  if (!quiet) syncSig();
 }
 function syncSig() {
  const r = card, j = job(r.id), n = r.name.value.trim();
  if (j.status === "done") return;
  const sig = r.mode === "type" ? (n ? { kind: "typed", name: n } : null) : (strokes[r.id] || []).length ? { kind: "drawn", name: "" } : null;
  if (JSON.stringify(sig) !== JSON.stringify(j.signature)) up((st) => { job(r.id, st).signature = sig; });
 }

 /* End-of-day report */
 function renderReport(s) {
  const t = R.totals(s), tile = (l, v) => E("div", { class: "demo-card" }, E("p", { class: "demo-muted", text: l }), E("span", { class: "demo-stat", text: v }));
  $("#jc-rdate").textContent = "Today, " + F.date(new Date());
  $("#jc-tiles").replaceChildren(tile("Jobs done", t.done + " of " + t.total), tile("Outstanding", String(t.outstanding)), tile("Photos", String(t.photos)), tile("Signatures", String(t.sigs)), tile("Problems", String(t.problems)));
  const ts = (j) => { const m = R.onSite(j); return m != null ? R.dur(m) : j.status === "progress" ? "On site since " + F.time(j.arrivedAt) : "–"; };
  D.table($("#jc-rtable"), { label: "Jobs today", rows: s.jobs.slice().sort(byStart), columns: [
   { label: "Job", render: (j) => E("span", {}, E("strong", { text: j.ref + " · " + cust(j).name }), E("br"), E("span", { class: "demo-muted", text: slot(j) })) },
   { label: "Technician", render: (j) => (j.techId ? tech(j.techId).name : "–") },
   { label: "Status", render: badge },
   { label: "Time on site", render: ts },
   { label: "Photos", num: true, render: (j) => String(j.photos.length) },
   { label: "Signature", render: (j) => (R.hasSig(j.signature) ? (j.signature.kind === "drawn" ? "Drawn" : "Typed") : "–") },
   { label: "Problems", num: true, render: (j) => String(R.problemCount(j)) },
   { label: "Value", num: true, render: (j) => F.rand(R.jobValue(j, s.services)) },
  ] });
  const pr = R.problems(s);
  $("#jc-problems").replaceChildren(pr.length ? E("ul", { class: "jc-plain" }, pr.map((p) => E("li", {}, E("strong", { text: p.ref + " · " + p.customer }), ": " + p.check + ". " + p.note))) : E("p", { class: "demo-muted", text: "No problems flagged." }));
  $("#jc-bytech").replaceChildren(...t.byTech.map((x) => E("li", { text: x.name + ": " + x.done + " of " + x.total + " done" })));
  $("#jc-value").replaceChildren(E("div", { class: "demo-grid" }, tile("Work done today", F.rand(t.valueDone)), tile("Still booked", F.rand(t.valueLeft))),
   E("p", { class: "demo-muted", text: "Sample prices. Not an invoice." }));
 }

 /* Wiring */
 const render = (s) => keep(() => { renderBoard(s); renderTips(s); renderTech(s); renderReport(s); });
 const place = () => {
  (mq.matches ? $("#jc-screen") : $("#jc-slot")).appendChild($("#jc-tech"));
  if (mq.matches && location.hash === "#view-tech") D.go("manager");
 };
 const seen = () => { if (location.hash === "#view-report" && !S().ui.tips.report) up((st) => { st.ui.tips.report = true; }); };
 D.onReset(() => { strokes = {}; });
 D.init({ seed: window.DEMO_SEED, render: render });
 $("#jc-tech-sel").addEventListener("change", (e) => up((st) => { st.ui.techId = e.target.value; st.ui.openJobId = null; }));
 $("#jc-to-report").addEventListener("click", () => D.go("report"));
 mq.addEventListener("change", place);
 window.addEventListener("hashchange", seen);
 place();
 seen();
})();
