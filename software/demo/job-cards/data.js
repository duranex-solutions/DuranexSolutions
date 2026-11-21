/* Sample data for Hadeda Aircon, a made-up business. Times are built on today's local date. */
(function () {
 "use strict";
 const d = new Date(), p = (n) => (n < 10 ? "0" : "") + n;
 const day = d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
 const t = (hm) => day + "T" + hm;
 const K = (st, notes) => {
  const o = {};
  for (let i = 0; i < 6; i++) o["i" + (i + 1)] = { state: (st && st[i]) || "todo", note: (notes && notes[i]) || "" };
  return o;
 };
 const ALL = ["ok", "ok", "ok", "ok", "ok", "ok"];
 const job = (n, s, e, c, tc, sv, units, status, x) => Object.assign({
  id: "j" + (n - 1040), ref: "JC-" + n, start: t(s), end: t(e), customerId: c, techId: tc, service: sv, units: units,
  status: status, arrivedAt: null, doneAt: null, checks: K(), photos: [], signature: null }, x);
 window.DEMO_SEED = {
  business: "Hadeda Aircon",
  services: {
   std: { label: "Standard service", price: 650, perUnit: true, mins: 45 },
   deep: { label: "Deep clean", price: 950, perUnit: true, mins: 75 },
   fault: { label: "Fault call-out", price: 850, perUnit: false, mins: 60 },
  },
  checklist: [
   { id: "i1", label: "Power isolated before work", req: true },
   { id: "i2", label: "Filters cleaned", req: true },
   { id: "i3", label: "Indoor coil and drain line cleaned", req: true },
   { id: "i4", label: "Remote control and settings checked", req: false },
   { id: "i5", label: "Cooling tested, vent temperature noted", req: true },
   { id: "i6", label: "Area left clean, work explained to customer", req: false },
  ],
  techs: [
   { id: "t1", name: "Sipho Dlamini", phone: "+27 00 000 0101" },
   { id: "t2", name: "Riaan Botha", phone: "+27 00 000 0102" },
   { id: "t3", name: "Naledi Mokoena", phone: "+27 00 000 0103" },
  ],
  customers: [
   { id: "c1", name: "Lindiwe Khumalo", address: "22 Mopani Crescent", suburb: "Sunward Park, Boksburg", phone: "+27 00 000 0201", access: "Security gate, ask for her at the intercom" },
   { id: "c2", name: "Johan Pretorius", address: "7 Vlei Road", suburb: "Northmead, Benoni", phone: "+27 00 000 0202", access: "Dog in the yard, ring at the gate" },
   { id: "c3", name: "Fatima Patel", address: "31 Fynbos Lane", suburb: "Bedfordview", phone: "+27 00 000 0203", access: "Park in the driveway, side door is open" },
   { id: "c4", name: "Mpho Sithole (small office)", address: "5 Karee Street", suburb: "Aston Manor, Kempton Park", phone: "+27 00 000 0204", access: "Reception opens at 08:00, units are on the first floor" },
   { id: "c5", name: "Annelie de Bruyn", address: "18 Sering Avenue", suburb: "Edenvale", phone: "+27 00 000 0205", access: "Ring the bell, flat 3" },
   { id: "c6", name: "Bongani Ndlovu", address: "9 Bloekom Drive", suburb: "Primrose, Germiston", phone: "+27 00 000 0206", access: "Call on arrival, gate remote is with the neighbour" },
  ],
  jobs: [
   job(1041, "08:00", "09:30", "c1", "t1", "std", [{ btu: 12000, room: "main bedroom" }, { btu: 18000, room: "lounge" }], "done", {
    arrivedAt: t("08:05"), doneAt: t("09:20"), checks: K(ALL), photos: [{ id: "p1", url: null, sample: true }, { id: "p2", url: null, sample: true }],
    signature: { kind: "typed", name: "Lindiwe Khumalo" } }),
   job(1042, "08:30", "10:00", "c2", "t2", "fault", [{ btu: 12000, room: "study" }], "done", {
    arrivedAt: t("08:40"), doneAt: t("09:35"), checks: K(["ok", "ok", "ok", "problem", "ok", "ok"], ["", "", "", "Handset cracked, customer will order a new one", "", ""]),
    photos: [{ id: "p3", url: null, sample: true }], signature: { kind: "typed", name: "Johan Pretorius" } }),
   job(1043, "10:00", "12:00", "c3", "t3", "deep", [{ btu: 9000, room: "front bedroom" }], "progress", {
    arrivedAt: t("10:05"), checks: K(["ok", "ok", "ok"]) }),
   job(1044, "11:30", "13:00", "c4", "t1", "std", [{ btu: 18000, room: "open-plan office" }, { btu: 12000, room: "boardroom" }, { btu: 9000, room: "reception" }], "onway"),
   job(1045, "12:30", "14:00", "c5", "t2", "std", [{ btu: 12000, room: "main bedroom" }], "scheduled"),
   job(1046, "13:30", "15:00", "c6", null, "std", [{ btu: 12000, room: "lounge" }, { btu: 9000, room: "bedroom" }], "unassigned"),
  ],
  ui: { techId: "t1", openJobId: null, alert: null, tips: { opened: false, report: false } },
 };
})();
