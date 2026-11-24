/* Ridgeline Armed Response – concept design by Duranex. Own JS, nothing shared, no network calls. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  // Fictional suburbs: zone 0 means outside the response zones.
  const SUBURBS = {
    "kareehof": ["Kareehof", 1], "witpeer-park": ["Witpeer Park", 1], "valkenvlei": ["Valkenvlei", 1],
    "moerbeihof": ["Moerbeihof", 2], "klipdrif": ["Klipdrif", 2], "uilenhof": ["Uilenhof", 2],
    "tamboti-rise": ["Tamboti Rise", 3], "bloubos": ["Bloubos", 3],
    "dassieskloof": ["Dassieskloof", 0], "sterrewag": ["Sterrewag", 0], "fonteinsig": ["Fonteinsig", 0], "rooiklip-plots": ["Rooiklip Plots", 0]
  };
  const own = (k) => Object.prototype.hasOwnProperty.call(SUBURBS, k);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---- coverage checker ---- */
  const result = $("[data-result]");
  const chip = $("[data-map-chip]");
  const nameEl = $("[data-res-name]");
  const coverLink = $('.panel--check .panel-foot a[href$="/coverage/"]');
  let live;
  if (result) {
    live = document.createElement("p");
    live.className = "visually-hidden";
    live.setAttribute("aria-live", "polite");
    result.after(live);
  }

  function show(slug, announce) {
    if (!own(slug)) return;
    const [name, zone] = SUBURBS[slug];
    const status = zone ? "In our response zone" : "Outside our area – ask us";
    if (nameEl) nameEl.textContent = name;
    if (chip) {
      chip.textContent = `${name} · ${status}`;
      chip.className = "map-chip " + (zone ? "is-in" : "is-out");
      chip.hidden = false;
    }
    const box = result && result.closest(".panel");
    if (announce && box && box.scrollHeight > box.clientHeight) box.scrollTop = box.scrollHeight;
    if (live && announce) live.textContent = `${name}: ${status}${zone ? `, zone ${zone}` : ""}.`;
    if (coverLink) coverLink.href = "/samples/ridgeline-security/coverage/?suburb=" + slug;
    if (document.body.classList.contains("page-coverage") && announce) {
      history.replaceState(null, "", "?suburb=" + slug);
    }
  }

  document.addEventListener("change", (e) => {
    if (e.target.matches('.suburbs input[name="suburb"]')) show(e.target.value, true);
  });

  // Tap a suburb on the map: pick the matching radio.
  $$(".map .sub").forEach((g) => {
    g.addEventListener("click", () => {
      const radio = document.getElementById("s-" + g.dataset.suburb);
      if (!radio) return;
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  // ?suburb=<slug> preselects (whitelisted).
  const q = new URLSearchParams(location.search).get("suburb");
  if (q && own(q)) {
    const radio = document.getElementById("s-" + q);
    if (radio) { radio.checked = true; show(q, false); }
  } else {
    const pre = $('.suburbs input[name="suburb"]:checked');
    if (pre) show(pre.value, false);
  }

  /* ---- tabs (desktop console only; phones get one long bottom sheet) ---- */
  const tablist = $("[data-tabs]");
  if (tablist) {
    const tabs = $$('[role="tab"]', tablist);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
    const mq = window.matchMedia("(min-width: 1000px)");
    const select = (i, focus) => {
      tabs.forEach((t, n) => {
        const on = n === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    const setMode = () => {
      if (mq.matches) {
        tablist.hidden = false;
        panels.forEach((p) => p.setAttribute("role", "tabpanel"));
        select(Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true")), false);
      } else {
        tablist.hidden = true;
        panels.forEach((p) => { p.hidden = false; p.removeAttribute("role"); });
      }
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i, false));
      t.addEventListener("keydown", (e) => {
        const k = e.key;
        if (k === "ArrowRight" || k === "ArrowLeft" || k === "Home" || k === "End") {
          e.preventDefault();
          const n = k === "Home" ? 0 : k === "End" ? tabs.length - 1 : (i + (k === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
          select(n, true);
        }
      });
    });
    setMode();
    mq.addEventListener("change", setMode);
  }

  /* ---- demo forms ---- */
  $$("[data-demo-form]").forEach((form) => {
    const status = $("[data-form-status]", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const missing = $$("[required]", form).find((f) => !f.value.trim());
      if (missing) {
        status.textContent = "Add your name and a phone number first.";
        missing.focus();
        return;
      }
      status.textContent = "This is a demo – nothing is sent.";
    });
  });
})();
