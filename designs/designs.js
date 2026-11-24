/* Sample designs: gallery preview scroll, and the viewer page. No dependencies. */
(() => {
  "use strict";

  // Whitelist of viewer slugs. Anything else shows "Design not found".
  const DESIGNS = {
    "ironbark-plumbing": "Ironbark Plumbing & Geysers",
    "suurdeeg-bakehouse": "Suurdeeg Bakehouse",
    "lindela-ledger": "Lindela Ledger & Tax",
    "fynbos-fringe": "Fynbos & Fringe Hair Studio",
    "torque-bay": "Torque Bay Detailing",
    "ridgeline-security": "Ridgeline Armed Response",
  };

  // WhatsApp number for the viewer bar (digits only, no + or spaces).
  const WHATSAPP_NUMBER = "27836095579";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Gallery ---------- */
  const grid = $("#design-grid");
  if (grid) {
    // Touch: a small Preview button starts the slow scroll, so a tap never follows the link by accident.
    const touch = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch && !reduced) {
      $$(".design-frame:not(.design-frame--still)", grid).forEach((frame) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "design-preview-btn";
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = "▶ Preview";
        btn.addEventListener("click", () => {
          const on = frame.classList.toggle("is-scrolling");
          btn.setAttribute("aria-pressed", String(on));
          btn.textContent = on ? "■ Stop" : "▶ Preview";
        });
        frame.appendChild(btn);
      });
    }
  }

  /* ---------- Viewer ---------- */
  const stage = $("#viewer-stage");
  if (stage) {
    const frame = $("#viewer-frame");
    const missing = $("#viewer-missing");
    const toggle = $("#viewer-toggle");
    const wa = $("#viewer-wa");
    const slug = new URLSearchParams(window.location.search).get("s") || "";

    if (!Object.prototype.hasOwnProperty.call(DESIGNS, slug)) {
      missing.hidden = false;
      wa.hidden = true;
      document.title = "Design not found | Duranex Software Solutions";
    } else {
      const name = DESIGNS[slug];
      frame.title = `${name} concept design`;
      frame.src = `/samples/${slug}/`;
      stage.hidden = false;
      document.title = `${name} concept design | Duranex Software Solutions`;

      const text = `Hi Luan, I saw the ${name} sample design and I'm interested in a website like this for my business. Can you tell me more?`;
      wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      toggle.hidden = false;
      toggle.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-mode]");
        if (!btn) return;
        const phone = btn.dataset.mode === "phone";
        stage.classList.toggle("is-phone", phone);
        stage.classList.toggle("is-desktop", !phone);
        $$("button", toggle).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      });
    }
  }
})();
