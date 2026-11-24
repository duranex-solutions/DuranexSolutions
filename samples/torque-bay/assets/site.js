/* Torque Bay Detailing – concept design by Duranex. Own JS, nothing shared, no network calls. */
(() => {
  "use strict";

  // Zone prices (Rand) and minutes in the bay, per car size. Fictional.
  const ZONES = {
    ext: { name: "Exterior", hatch: [650, 120], sedan: [750, 150], suv: [950, 180] },
    int: { name: "Interior", hatch: [750, 150], sedan: [850, 180], suv: [1100, 210] },
    wheels: { name: "Wheels & tyres", hatch: [350, 60], sedan: [400, 60], suv: [500, 75] },
    engine: { name: "Engine bay", hatch: [450, 60], sedan: [450, 60], suv: [550, 75] },
    lights: { name: "Headlights", hatch: [650, 60], sedan: [650, 60], suv: [650, 60] }
  };
  const PACKS = {
    "Stage 1": { hatch: 450, sedan: 500, suv: 600 },
    "Stage 2": { hatch: 1950, sedan: 2200, suv: 2650 },
    "Stage 3": { hatch: 4500, sedan: 5200, suv: 6500 },
    "Stage 4": { hatch: 8950, sedan: 9950, suv: 11950 }
  };
  const STAGE2 = ["ext", "int", "wheels", "engine"];
  const SIZE_NAME = { hatch: "Hatch", sedan: "Sedan", suv: "SUV / bakkie" };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rand = (n) => "R" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const duration = (m) => {
    const h = Math.floor(m / 60), r = m % 60;
    return "about " + [h ? h + " h" : "", r ? r + " min" : ""].filter(Boolean).join(" ");
  };
  const setText = (sel, text) => $$(sel).forEach((el) => { el.textContent = text; });

  const drawing = $("[data-drawing]");
  const svg = drawing && $("svg.car", drawing);
  const zoneBoxes = $$('.zones input[type="checkbox"]');
  const readout = $("[data-readout]");
  const live = $("[data-out-live]");
  const openBtn = $("[data-open-request]");
  let pack = drawing ? drawing.dataset.defaultLabel || "" : "";

  $$("[data-nojs]").forEach((el) => { el.hidden = true; });
  if (readout) readout.hidden = false;

  const size = () => {
    const r = $('input[name="size"]:checked');
    return r ? r.value : "sedan";
  };
  const picked = () => zoneBoxes.filter((b) => b.checked).map((b) => b.value);

  function quote() {
    const s = size(), z = picked();
    let price = 0, mins = 0;
    z.forEach((k) => { price += ZONES[k][s][0]; mins += ZONES[k][s][1]; });
    return { s, z, price, mins };
  }

  let liveTimer;
  function update(announce) {
    const s = size();
    setText("[data-tb-size]", SIZE_NAME[s]);

    if (zoneBoxes.length) {
      $$("[data-zone-price]").forEach((el) => { el.textContent = rand(ZONES[el.dataset.zonePrice][s][0]); });
      const q = quote();
      const qText = q.z.length ? "from " + rand(q.price) : "—";
      const tText = q.z.length ? duration(q.mins) : "—";
      setText("[data-tb-zones]", q.z.length + " / 5");
      setText("[data-tb-quote]", qText);
      setText("[data-tb-time]", tText);
      setText("[data-out-quote]", q.z.length ? qText : "Pick a zone");
      setText("[data-out-time]", tText);
      const plan = $("[data-out-plan]");
      if (plan) {
        plan.textContent = !q.z.length ? "Switch on at least one zone to see a price."
          : q.mins <= 420 ? "Drop off by 08:00, collect the same day from 16:00."
          : q.mins <= 480 ? "Drop off by 07:30, collect the same day from 16:30."
          : "Plan on two days: drop off in the morning, collect the next afternoon.";
      }
      const tip = $("[data-out-tip]");
      if (tip) {
        const hasStage2 = STAGE2.every((k) => q.z.includes(k));
        if (hasStage2) {
          const p2 = PACKS["Stage 2"][s];
          const rest = q.z.filter((k) => !STAGE2.includes(k)).reduce((t, k) => t + ZONES[k][s][0], 0);
          tip.textContent = "Tip: those four zones are our Stage 2 Full detail. Booked as a package it’s " + rand(p2 + rest) + (rest ? " with the headlights" : "") + ", not " + rand(q.price) + ".";
          tip.hidden = false;
        } else tip.hidden = true;
      }
      if (openBtn) openBtn.disabled = !q.z.length;
      if (announce && live) {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(() => {
          live.textContent = q.z.length ? `${SIZE_NAME[s]}, ${q.z.length} zone${q.z.length > 1 ? "s" : ""}: ${qText}, ${tText}.` : "No zones picked.";
        }, 400);
      }
    } else if (pack && PACKS[pack]) {
      setText("[data-tb-pack]", pack);
      setText("[data-tb-quote]", rand(PACKS[pack][s]));
    }
  }

  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="size"], .zones input')) update(true);
  });

  // Hover or focus a package: the car previews the zones it covers.
  if (drawing) {
    const show = (el) => {
      drawing.dataset.preview = el.dataset.preview;
      drawing.classList.add("is-preview");
      if (el.dataset.pack) { pack = el.dataset.pack; update(); }
    };
    const hide = () => {
      drawing.classList.remove("is-preview");
      delete drawing.dataset.preview;
      if (drawing.dataset.defaultLabel) { pack = drawing.dataset.defaultLabel; update(); }
    };
    $$("[data-preview]").forEach((el) => {
      el.addEventListener("mouseenter", () => show(el));
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", () => show(el));
      el.addEventListener("blur", hide);
    });
  }

  // On phones the car sits in a short strip: crop the drawing to the car itself.
  if (svg) {
    const mq = window.matchMedia("(max-width: 999px)");
    const crop = () => svg.setAttribute("viewBox", mq.matches ? "40 84 730 232" : "0 -64 800 444");
    crop();
    mq.addEventListener("change", crop);
  }

  // Request dialog (demo only: nothing leaves the page).
  const dialog = $("#request");
  if (dialog && openBtn && typeof dialog.showModal === "function") {
    const form = $("[data-request-form]", dialog);
    const status = $("[data-request-status]", dialog);
    openBtn.addEventListener("click", () => {
      const q = quote();
      if (!q.z.length) return;
      $("[data-request-summary]", dialog).textContent =
        `${SIZE_NAME[q.s]} · ${q.z.map((k) => ZONES[k].name).join(", ")} · from ${rand(q.price)} · ${duration(q.mins)}`;
      const d = $("#r-date", dialog);
      const sast = new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 10);
      d.min = sast;
      status.textContent = "";
      dialog.showModal();
    });
    $("[data-close-request]", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#r-name", form).value.trim(), phone = $("#r-phone", form).value.trim();
      status.textContent = !name || !phone
        ? "Add your name and a number first."
        : "This is a demo – nothing is sent.";
      if (!name) $("#r-name", form).focus(); else if (!phone) $("#r-phone", form).focus();
    });
  } else if (openBtn) {
    openBtn.addEventListener("click", () => { location.hash = "contact"; });
  }

  update(false);
})();
