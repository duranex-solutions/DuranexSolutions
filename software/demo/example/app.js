/* Placeholder demo logic: orders for a made-up laundry. In memory only. */
(function () {
  "use strict";
  const D = window.Demo;
  const $ = (s) => document.querySelector(s);
  const STATUS = {
    received: { label: "Received", tone: "info" },
    progress: { label: "In progress", tone: "warn" },
    ready: { label: "Ready", tone: "ok" },
    collected: { label: "Collected", tone: "neutral" },
    cancelled: { label: "Cancelled", tone: "error" },
  };
  const NEXT = { received: "progress", progress: "ready", ready: "collected" };
  const first = (o) => o.customer.split(" ")[0];

  function render(s) {
    const live = s.orders.filter((o) => o.status !== "cancelled");
    $("#stat-orders").textContent = D.fmt.number(live.length);
    $("#stat-ready").textContent = D.fmt.number(s.orders.filter((o) => o.status === "ready").length);
    $("#stat-value").textContent = D.fmt.rand(live.reduce((t, o) => t + o.amount, 0));
    $("#filter").value = s.filter;
    const rows = s.filter === "all" ? s.orders : s.orders.filter((o) => o.status === s.filter);
    D.table($("#orders-table"), {
      label: "Orders",
      rows,
      empty: {
        title: s.orders.length ? "No orders with that status" : "No orders yet",
        text: s.orders.length ? "Try another status." : "Add one on the New order tab, or use Reset to bring back the sample orders.",
        action: s.orders.length ? { label: "Show all orders", onClick: () => D.store.update((x) => { x.filter = "all"; }) } : { label: "Add an order", onClick: () => D.go("new") },
      },
      columns: [
        { label: "Order", key: "id" },
        { label: "Customer", key: "customer" },
        { label: "Service", key: "service" },
        { label: "Amount", num: true, render: (o) => D.fmt.rand(o.amount) },
        { label: "Date", render: (o) => D.fmt.date(o.date) },
        { label: "Status", render: (o) => D.badge(STATUS[o.status].tone, STATUS[o.status].label) },
        { label: "Actions", render: actions },
      ],
    });
  }

  function actions(o) {
    const btn = (label, aria, fn) => D.el("button", { type: "button", class: "btn btn-secondary demo-btn--sm", "aria-label": label + " " + aria, onclick: fn }, label);
    return D.el("div", { class: "demo-actions" },
      NEXT[o.status] && btn("Next step", o.id, () => {
        D.store.update((s) => { s.orders.find((x) => x.id === o.id).status = NEXT[o.status]; });
        D.toast(o.id + " is now " + STATUS[NEXT[o.status]].label.toLowerCase());
      }),
      btn("Message", o.customer, () => message(o)),
      btn("Remove", o.id, () => D.modal.open({
        title: "Remove " + o.id + "?",
        body: "This only removes it from the sample data in your browser. Reset brings it back.",
        actions: [{ label: "Cancel" }, { label: "Remove order", primary: true, onClick: () => {
          D.store.update((s) => { s.orders = s.orders.filter((x) => x.id !== o.id); });
          D.toast(o.id + " removed");
        } }],
      })));
  }

  function message(o) {
    const status = STATUS[o.status].label.toLowerCase();
    const line = "your order " + o.id + " (" + o.service.toLowerCase() + ", " + D.fmt.rand(o.amount) + ") is now: " + status + ".";
    D.modal.open({
      title: "Message " + first(o),
      body: "Choose how to preview the message. Nothing will be sent.",
      actions: [
        { label: "Cancel" },
        { label: "Email preview", onClick: () => D.preview({ channel: "email", to: o.email || "No email address on file", subject: "Update on order " + o.id,
          body: "Hi " + first(o) + ",\n\nThis is an update from Protea Row Laundry: " + line + "\n\nKind regards\nProtea Row Laundry" }) },
        { label: "WhatsApp preview", primary: true, onClick: () => D.preview({ channel: "whatsapp", to: o.phone,
          body: "Hi " + first(o) + ", " + line + " Thank you! Protea Row Laundry" }) },
      ],
    });
  }

  /* New order form */
  const form = $("#order-form");
  const fields = ["name", "amount"];
  function fail(id, msg) {
    const input = $("#f-" + id), err = $("#f-" + id + "-err");
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !!msg;
  }
  function clearErrors() { fields.forEach((f) => fail(f, "")); }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#f-name").value.trim();
    const amount = parseFloat($("#f-amount").value.replace(/\s/g, "").replace(",", "."));
    const bad = [fail("name", name ? "" : "Enter the customer's name."), fail("amount", amount > 0 ? "" : "Enter an amount above R 0.")];
    if (bad.includes(true)) return $(bad[0] ? "#f-name" : "#f-amount").focus();
    D.store.update((s) => {
      s.orders.unshift({ id: "PR-" + s.nextNo++, customer: name, service: $("#f-service").value, amount, date: new Date(), status: "received", phone: "+27 00 000 0000", email: $("#f-email").value.trim() });
      s.filter = "all";
    });
    form.reset();
    D.toast("Order added to the sample data");
    D.go("orders");
  });
  D.onReset(clearErrors);
  $("#filter").addEventListener("change", (e) => D.store.update((s) => { s.filter = e.target.value; }));

  D.init({ seed: window.DEMO_SEED, render });
})();
