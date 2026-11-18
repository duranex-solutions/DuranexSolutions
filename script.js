(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const page = document.body.dataset.page;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Old one-page hashes -> new pages */
  if (page === "home" && location.hash) {
    const moved = {
      "#packages": "/websites/#plans",
      "#contact": "/contact/",
      "#work": "/work/",
      "#approach": "/about/",
      "#how-it-works": "/#process",
    }[location.hash];
    if (moved) location.replace(moved);
  }

  /* Footer year */
  const year = $("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile nav */
  const toggle = $(".menu-toggle");
  const nav = $(".site-nav");
  if (toggle && nav) {
    const label = $(".menu-toggle-label", toggle);
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setOpen = (open, returnFocus) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "Close" : "Menu";
      if (open) $("a", nav)?.focus();
      else if (returnFocus) toggle.focus();
    };
    toggle.addEventListener("click", () => setOpen(!isOpen()));
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) setOpen(false, true);
    });
    document.addEventListener("click", (e) => {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    // Tabbing out of the menu closes it, so focus never sits in a hidden menu
    nav.addEventListener("focusout", (e) => {
      const next = e.relatedTarget;
      if (isOpen() && next && !nav.contains(next) && next !== toggle) setOpen(false);
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* Floating contact pill: not needed on /contact/ */
  const pill = $(".floating-contact");
  if (pill && page === "contact") pill.hidden = true;

  /* Reveal on scroll: fade + 12px rise, once, stagger capped at four items */
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const targets = $$(
      ".service-card, .included-item, .concept-card, .tier-card, .process-step, .why-item, .case-study, .founder, .faq-item",
    );
    if (targets.length) {
      document.body.classList.add("motion-ready");
      const counts = new Map();
      targets.forEach((el) => {
        const index = counts.get(el.parentElement) || 0;
        counts.set(el.parentElement, index + 1);
        el.dataset.reveal = "";
        el.style.transitionDelay = `${Math.min(index, 3) * 60}ms`;
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            observer.unobserve(el);
            el.classList.add("is-visible");
            // Drop the hook afterwards so hover transitions behave normally
            setTimeout(() => {
              el.removeAttribute("data-reveal");
              el.style.transitionDelay = "";
            }, 900);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      targets.forEach((el) => observer.observe(el));
    }
  }

  /* Contact form */
  const form = $("#contact-form");
  if (form) {
    form.noValidate = true;
    const status = $("#form-status");
    const planStatus = $("#plan-status");
    const planText = {
      foundation: "Foundation plan selected.",
      growth: "Growth plan selected.",
      pro: "Pro plan selected.",
      custom: "Custom or software quote selected.",
    };
    const plans = $$('input[name="plan"]', form);
    const announcePlan = () => {
      const chosen = plans.find((r) => r.checked);
      planStatus.textContent = (chosen && planText[chosen.value]) || "";
    };
    const requested = new URLSearchParams(location.search).get("plan");
    const preset = plans.find((r) => r.value === requested);
    if (preset) preset.checked = true;
    plans.forEach((r) => r.addEventListener("change", announcePlan));
    announcePlan();

    const checks = {
      name: (v) => (v.trim() ? "" : "Please enter your name."),
      email: (v) =>
        !v.trim()
          ? "Please enter your email address."
          : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
            ? ""
            : "That email address doesn't look right.",
      phone: (v) =>
        !v.trim() || v.replace(/\D/g, "").length >= 7 ? "" : "Please enter a valid phone number, or leave it blank.",
    };
    const setError = (field, message) => {
      let note = $(`#${field.id}-error`);
      if (message && !note) {
        note = document.createElement("small");
        note.id = `${field.id}-error`;
        note.className = "field-error";
        field.after(note);
      }
      if (note) {
        note.textContent = message;
        note.hidden = !message;
      }
      if (message) {
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", note.id);
      } else {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
      }
    };
    const validate = (field) => {
      const message = checks[field.name](field.value);
      setError(field, message);
      return !message;
    };
    const fields = $$("input, textarea", form).filter((f) => checks[f.name]);
    fields.forEach((f) => {
      f.addEventListener("blur", () => f.value && validate(f));
      f.addEventListener("input", () => f.hasAttribute("aria-invalid") && validate(f));
    });

    const showStatus = (text, kind) => {
      status.textContent = text;
      status.className = `form-status form-field-full is-${kind}`;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const invalid = fields.filter((f) => !validate(f));
      if (invalid.length) {
        showStatus("Please fix the highlighted fields and try again.", "error");
        invalid[0].focus();
        return;
      }
      if (form.elements.botcheck?.checked) return; // honeypot tripped: drop silently

      const data = new FormData(form);
      data.set("business_goals", data.getAll("business_goals").join(", "));
      data.set("subject", `Website enquiry from ${data.get("name")}`);
      data.set("from_name", "Duranex Website");

      const button = $('button[type="submit"]', form);
      const buttonText = $("span", button);
      const original = buttonText.textContent;
      button.disabled = true;
      buttonText.textContent = "Sending...";
      showStatus("Sending your enquiry...", "info");

      try {
        const response = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success) throw new Error("rejected");
        showStatus("Thanks, your enquiry is in. I'll reply within 24 hours.", "success");
        track("form_submit", { form_id: "contact" });
        form.reset();
        announcePlan();
      } catch {
        showStatus("Your enquiry didn't send. Please try again, or WhatsApp or call me on +27 83 609 5579.", "error");
      } finally {
        button.disabled = false;
        buttonText.textContent = original;
      }
    });
  }

  /* Hero canvas trail */
  const hero = $(".hero");
  const canvas = $(".hero-trail");
  const context = canvas && canvas.getContext("2d");
  if (hero && context) {
    const css = getComputedStyle(document.documentElement);
    const token = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    const dots = [
      { fx: 0.3, fy: 0.65, vx: 85, vy: -56, r: 6, color: token("--gold-300", "#d3b978") },
      { fx: 0.65, fy: 0.3, vx: 105, vy: 59, r: 4, color: token("--cyan", "#65e5e3") },
      { fx: 0.8, fy: 0.6, vx: -76, vy: 92, r: 3, color: token("--ink-muted", "#c3ceda") },
    ].map((d) => ({ ...d, x: 0, y: 0, trail: [] }));
    const small = window.matchMedia("(max-width: 767px)");
    let width = 0;
    let height = 0;
    let elapsed = 0;
    let last = 0;
    let frame = 0;
    let visible = false;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots.forEach((d) => {
        d.x = width * d.fx;
        d.y = height * d.fy;
        d.trail.length = 0;
      });
    };

    const draw = (time) => {
      frame = 0;
      if (!visible || document.hidden || reducedMotion.matches) return;
      const delta = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      elapsed += delta;
      context.clearRect(0, 0, width, height);
      dots.forEach((d) => {
        d.x += d.vx * delta;
        d.y += d.vy * delta;
        if (d.x < 12 || d.x > width - 12) {
          d.x = Math.max(12, Math.min(width - 12, d.x));
          d.vx *= -1;
        }
        if (d.y < 12 || d.y > height - 12) {
          d.y = Math.max(12, Math.min(height - 12, d.y));
          d.vy *= -1;
        }
        d.trail.push({ x: d.x, y: d.y, t: elapsed });
        while (d.trail.length > 120 || (d.trail.length > 1 && elapsed - d.trail[0].t > 2.5)) d.trail.shift();
        context.strokeStyle = d.color;
        context.lineWidth = d.r / 2;
        for (let i = 1; i < d.trail.length; i += 1) {
          context.globalAlpha = Math.max(0, 1 - (elapsed - d.trail[i].t) / 2.5) * 0.55;
          context.beginPath();
          context.moveTo(d.trail[i - 1].x, d.trail[i - 1].y);
          context.lineTo(d.trail[i].x, d.trail[i].y);
          context.stroke();
        }
        context.globalAlpha = 1;
        context.beginPath();
        context.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        context.fillStyle = d.color;
        // Glow only from 768px up: shadowBlur is costly on phones
        context.shadowColor = d.color;
        context.shadowBlur = small.matches ? 0 : 16;
        context.fill();
        context.shadowBlur = 0;
      });
      frame = requestAnimationFrame(draw);
    };

    const update = () => {
      if (visible && !document.hidden && !reducedMotion.matches) {
        if (!frame) frame = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        context.clearRect(0, 0, width, height);
      }
    };

    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      }).observe(hero);
    } else {
      visible = true;
      update();
    }
  }

  /* Analytics: GA4 loads only after the visitor accepts the notice. Events: form_submit, whatsapp_click, call_click, email_click */
  const GA_ID = "G-NFSFGBQR6D";
  const CONSENT_KEY = "dx-analytics";
  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };
  const saveConsent = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* storage blocked: the notice will show again */ }
  };
  const track = (name, params) => {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  };
  const loadAnalytics = () => {
    if (typeof window.gtag === "function") return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(tag);
  };

  // Declining after accepting: stop GA4 sending on this page and clear its cookies
  const stopAnalytics = () => {
    window[`ga-disable-${GA_ID}`] = true;
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;
      [location.hostname, `.${location.hostname}`].forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
      });
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
  };

  const showNotice = (returnFocusTo) => {
    if ($(".consent-notice")) return;
    const notice = document.createElement("div");
    notice.className = "consent-notice";
    notice.setAttribute("role", "region");
    notice.setAttribute("aria-label", "Analytics notice");
    notice.innerHTML =
      '<p>I use Google Analytics cookies to see which pages are useful. Nothing loads unless you accept. <a href="/privacy/#p5">Privacy policy</a></p>' +
      '<div class="consent-actions"><button type="button" class="btn btn-primary" data-consent="granted">Accept</button>' +
      '<button type="button" class="btn btn-secondary" data-consent="denied">Decline</button></div>';
    notice.addEventListener("click", (e) => {
      const choice = e.target.closest("[data-consent]");
      if (!choice) return;
      saveConsent(choice.dataset.consent);
      if (choice.dataset.consent === "granted") {
        window[`ga-disable-${GA_ID}`] = false;
        loadAnalytics();
      } else {
        stopAnalytics();
      }
      notice.remove();
      if (returnFocusTo) returnFocusTo.focus();
    });
    document.body.appendChild(notice);
    if (returnFocusTo) $("button", notice).focus();
  };

  const consent = readConsent();
  if (consent === "granted") loadAnalytics();
  else if (consent !== "denied") showNotice();

  // Footer "Cookie settings" reopens the notice so the choice can be changed
  $$("[data-cookie-settings]").forEach((btn) => {
    btn.addEventListener("click", () => showNotice(btn));
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (el) track(el.dataset.track, { link_url: el.href });
  });
})();
