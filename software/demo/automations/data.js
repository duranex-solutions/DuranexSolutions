/* Sample data for the made-up Mopani Table Catering. Fictional people and phone numbers. */
window.DEMO_SEED = {
  business: "Mopani Table Catering",
  owner: { name: "Thandi Mahlangu", phone: "+27 00 000 0009" },
  types: ["Wedding", "Birthday party", "Corporate event", "Year-end function", "Family gathering", "Other"],
  budgetSteps: [5000, 15000, 30000],
  prefill: { name: "Lerato Nkosi", phone: "+27 00 000 0005", days: 21, type: "Wedding", guests: 80, suburb: "Brakpan", budget: 3,
    notes: "Mostly finger food, with two vegetarian options please. The venue has a kitchen we can use." },
  nextNo: 5,
  newId: null,
  requests: [
    { id: "Q-1", received: "2026-11-16", name: "Sipho Dlamini", phone: "+27 00 000 0001", type: "Birthday party", date: "2026-12-05", guests: 40, suburb: "Benoni", budget: 2, status: "sent" },
    { id: "Q-2", received: "2026-11-17", name: "Annelie Botha", phone: "+27 00 000 0002", type: "Wedding", date: "2027-03-13", guests: 120, suburb: "Kempton Park", budget: 4, status: "due" },
    { id: "Q-3", received: "2026-11-18", name: "Kagiso Molefe", phone: "+27 00 000 0003", type: "Corporate event", date: "2026-12-11", guests: 60, suburb: "Germiston", budget: 3, status: "booked" },
    { id: "Q-4", received: "2026-11-19", name: "Fatima Patel", phone: "+27 00 000 0004", type: "Year-end function", date: "2026-12-12", guests: 25, suburb: "Edenvale", budget: 0, status: "nobudget" },
  ],
  compare: [
    { id: "c1", step: "Confirm to the customer", hand: "Thandi sees the request when she gets a chance, then types a WhatsApp reply herself.", auto: "The customer gets a WhatsApp confirmation as soon as they press Send." },
    { id: "c2", step: "Tell the owner", hand: "The request waits in an inbox until someone checks it.", auto: "Thandi gets one alert on her phone with all the details." },
    { id: "c3", step: "Record the request", hand: "Someone copies the details into a spreadsheet or notebook, if they remember.", auto: "A new row is added to the quote sheet with every field filled in." },
    { id: "c4", step: "Follow up", hand: "Thandi has to remember which quotes are still open.", auto: "A reminder is set for 2 days later, so open requests don't slip through." },
  ],
};
