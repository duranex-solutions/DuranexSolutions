/* Job cards demo: pure logic, no DOM (so node can test it). Loaded after demo.js, before data.js. */
(function () {
 "use strict";
 const R = {};
 const pad = (n) => (n < 10 ? "0" : "") + n;
 const parse = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), +s.slice(11, 13), +s.slice(14, 16));
 const fmt = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());

 R.addMin = (s, m) => fmt(new Date(parse(s).getTime() + m * 60000));
 R.mins = (sv, j) => (sv.perUnit ? sv.mins * j.units.length : sv.mins);
 R.jobValue = (j, services) => { const sv = services[j.service]; return sv.price * (sv.perUnit ? j.units.length : 1); };
 R.checkDone = (c) => c.state === "ok" || (c.state === "problem" && c.note.trim() !== "");
 R.hasSig = (g) => !!g && (g.kind === "drawn" || (g.name || "").trim().length >= 2);
 R.onSite = (j) => (j.status === "done" && j.arrivedAt && j.doneAt ? Math.round((parse(j.doneAt) - parse(j.arrivedAt)) / 60000) : null);
 R.dur = (m) => (m >= 60 ? Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : "") : m + " min");

 R.missing = (j, checklist) => {
  const out = [];
  checklist.forEach((it) => {
   const c = j.checks[it.id];
   if (it.req && !R.checkDone(c)) out.push({ kind: "check", id: it.id, label: it.label + (c.state === "problem" ? " (add a note)" : "") });
  });
  if (!R.hasSig(j.signature)) out.push({ kind: "sig", label: "Customer signature" });
  return out;
 };
 R.need = (j, checklist) => {
  const m = R.missing(j, checklist), n = m.filter((x) => x.kind === "check").length, p = [];
  if (n) p.push(n + " required check" + (n > 1 ? "s" : ""));
  if (m.some((x) => x.kind === "sig")) p.push("signature");
  return p.length ? "Still needed: " + p.join(", ") : "Nothing left. You can mark the job complete.";
 };
 R.problemCount = (j) => Object.keys(j.checks).filter((k) => j.checks[k].state === "problem").length;
 R.problems = (s) => {
  const out = [];
  s.jobs.slice().sort((a, b) => (a.start < b.start ? -1 : 1)).forEach((j) => {
   s.checklist.forEach((it) => {
    const c = j.checks[it.id];
    if (c.state === "problem") out.push({ ref: j.ref, customer: s.customers.find((x) => x.id === j.customerId).name, check: it.label, note: c.note });
   });
  });
  return out;
 };
 R.totals = (s) => {
  const t = { total: s.jobs.length, done: 0, photos: 0, sigs: 0, problems: 0, valueDone: 0, valueAll: 0 };
  s.jobs.forEach((j) => {
   const v = R.jobValue(j, s.services);
   t.valueAll += v;
   if (j.status === "done") { t.done++; t.valueDone += v; }
   t.photos += j.photos.length;
   if (R.hasSig(j.signature)) t.sigs++;
   t.problems += R.problemCount(j);
  });
  t.outstanding = t.total - t.done;
  t.valueLeft = t.valueAll - t.valueDone;
  t.byTech = s.techs.map((x) => {
   const mine = s.jobs.filter((j) => j.techId === x.id);
   return { id: x.id, name: x.name, total: mine.length, done: mine.filter((j) => j.status === "done").length };
  });
  return t;
 };
 if (typeof module !== "undefined" && module.exports) module.exports = R;
 if (typeof window !== "undefined") window.JCRules = R;
})();
