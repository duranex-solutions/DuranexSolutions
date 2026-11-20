/* Booking slot logic: pure functions, no DOM. Dates are "YYYY-MM-DD", times are minutes since midnight. */
(function (g) {
 "use strict";
 const p2 = (n) => (n < 10 ? "0" : "") + n;
 const ymd = (d) => d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
 const parse = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
 const addDays = (s, n) => { const d = parse(s); return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)); };
 const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
 const dow = (s) => parse(s).getDay();
 const toHM = (m) => p2(Math.floor(m / 60)) + ":" + p2(m % 60);
 const fromHM = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
 const svcOf = (id, data) => data.services.find((x) => x.id === id);
 const hoursFor = (date, data) => data.hours[dow(date)] || null;
 const clash = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
 const nextHalf = (now) => Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30;
 function openDays(today, n) {
  const out = [];
  for (let i = 0; out.length < n; i++) { const d = addDays(today, i); if (dow(d) !== 0) out.push(d); }
  return out;
 }
 function isFree(sty, date, start, dur, data, ignoreId) {
  const h = hoursFor(date, data), w = dow(date);
  if (!h || !sty.days.includes(w) || start < h[0] || start + dur > h[1]) return false;
  if (sty.blocks.some((b) => b.days.includes(w) && clash(start, start + dur, b.from, b.to))) return false;
  return !data.bookings.some((b) => b.date === date && b.sty === sty.id && b.id !== ignoreId && clash(start, start + dur, b.start, b.start + svcOf(b.svc, data).min));
 }
 function freeStarts(o) {
  const h = hoursFor(o.date, o.data), out = [];
  if (!h) return out;
  const min = ymd(o.now) === o.date ? nextHalf(o.now) : 0;
  const list = o.stylist && o.stylist !== "any" ? o.data.stylists.filter((s) => s.id === o.stylist) : o.data.stylists;
  for (let t = h[0]; t + o.dur <= h[1]; t += 30) {
   if (t < min) continue;
   const ids = list.filter((s) => isFree(s, o.date, t, o.dur, o.data, o.ignoreId)).map((s) => s.id);
   if (ids.length) out.push({ start: t, stylists: ids });
  }
  return out;
 }
 function pickStylist(ids, date, data) {
  const n = (id) => data.bookings.filter((b) => b.date === date && b.sty === id).length;
  return data.stylists.filter((s) => ids.includes(s.id)).reduce((a, s) => (n(s.id) < n(a.id) ? s : a)).id;
 }
 function firstBookable(o) {
  return o.days.find((d) => freeStarts({ date: d, dur: o.dur, stylist: o.stylist, data: o.data, now: o.now }).length) || o.days[0];
 }
 function dayItems(date, data) {
  const out = [], h = hoursFor(date, data), w = dow(date);
  data.bookings.filter((b) => b.date === date).forEach((b) => out.push({ type: "booking", b, sty: b.sty, from: b.start, to: b.start + svcOf(b.svc, data).min }));
  if (h) data.stylists.forEach((s) => {
   if (!s.days.includes(w)) out.push({ type: "block", off: true, sty: s.id, from: h[0], to: h[1], label: "Not working" });
   else s.blocks.filter((b) => b.days.includes(w)).forEach((b) => out.push({ type: "block", sty: s.id, from: b.from, to: b.to, label: b.label }));
  });
  return out.sort((a, b) => a.from - b.from);
 }
 function resolveSeed(raw, today, data) {
  const days = openDays(today, 7), d2 = { services: data.services, stylists: data.stylists, hours: data.hours, bookings: [] };
  raw.forEach((r) => {
   const date = days[r[0]], start = fromHM(r[1]), dur = svcOf(r[3], d2).min;
   const order = d2.stylists.filter((s) => s.id === r[2]).concat(d2.stylists.filter((s) => s.id !== r[2]));
   const s = order.find((x) => isFree(x, date, start, dur, d2));
   if (s) { const n = d2.bookings.length; d2.bookings.push({ id: "MH-" + (1001 + n), date, start, svc: r[3], sty: s.id, name: r[4], phone: "+27 00 000 00" + (11 + n) }); }
  });
  return { days, bookings: d2.bookings };
 }
 const api = { ymd, addDays, diff, dow, toHM, svcOf, openDays, hoursFor, isFree, freeStarts, pickStylist, firstBookable, dayItems, resolveSeed };
 g.BookingSlots = api;
 if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
