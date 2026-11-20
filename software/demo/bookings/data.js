/* Fictional sample data, relative to today. */
(function () {
 "use strict";
 const BS = window.BookingSlots;
 const today = BS.ymd(new Date());
 const wk = [480, 1020], sat = [480, 780];
 const base = {
  services: [
   { id: "men", name: "Men's cut", min: 30, price: 180 },
   { id: "cut", name: "Cut and blow-dry", min: 60, price: 350 },
   { id: "press", name: "Silk press", min: 90, price: 650 },
   { id: "colour", name: "Full colour", min: 120, price: 950 },
   { id: "braids", name: "Knotless braids", min: 180, price: 1250 },
  ],
  stylists: [
   { id: "lerato", name: "Lerato Mokoena", days: [1, 2, 3, 4, 5, 6], blocks: [{ label: "Lunch", days: [1, 2, 3, 4, 5], from: 720, to: 780 }] },
   { id: "zanele", name: "Zanele Dube", days: [1, 2, 3, 4, 5, 6], blocks: [{ label: "Afternoon off", days: [3], from: 780, to: 1020 }] },
   { id: "ruan", name: "Ruan Botha", days: [2, 3, 4, 5, 6], blocks: [{ label: "Lunch", days: [2, 3, 4, 5], from: 780, to: 840 }] },
  ],
  hours: [null, wk, wk, wk, wk, wk, sat],
 };
 const raw = [
  [0, "08:30", "lerato", "cut", "Naledi Mokoena"], [0, "10:00", "zanele", "press", "Aisha Patel"], [0, "14:00", "ruan", "men", "Sipho Dlamini"],
  [1, "09:00", "ruan", "colour", "Megan Fourie"], [1, "11:00", "lerato", "men", "Kabelo Molefe"],
  [2, "08:00", "zanele", "braids", "Thandi Nkosi"], [2, "15:00", "lerato", "cut", "Priya Naidoo"],
  [3, "10:30", "ruan", "cut", "Johan Pretorius"], [3, "13:30", "zanele", "colour", "Nomsa Zulu"],
  [4, "09:00", "lerato", "press", "Lindiwe Mahlangu"], [4, "11:30", "zanele", "men", "Thabo Mabaso"],
  [5, "08:00", "ruan", "braids", "Fatima Ebrahim"], [6, "10:00", "zanele", "cut", "Anele Ndlovu"],
 ];
 const r = BS.resolveSeed(raw, today, base);
 const first = BS.firstBookable({ days: r.days, dur: 30, stylist: "any", data: Object.assign({ bookings: r.bookings }, base), now: new Date() });
 window.DEMO_SEED = Object.assign({ business: "Marula Hair Studio", today, days: r.days, bookings: r.bookings, nextNo: 1001 + r.bookings.length }, base, {
  ui: {
   customer: { step: 1, service: null, stylist: "any", date: first, time: null, name: "", phone: "", note: "", booked: null },
   owner: { mode: "day", date: r.days[0], highlight: null },
  },
 });
})();
