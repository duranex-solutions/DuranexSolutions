/* Fynbos & Fringe Hair Studio (concept design by Duranex).
   Lookbook strip, shade explorer, price-length switcher, booking demo form.
   No network requests. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function rand(n) { return 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* ---------- Lookbook strip ---------- */
  var strip = document.getElementById('strip');
  var controls = document.querySelector('[data-controls]');
  if (strip && controls) {
    var looks = strip.querySelectorAll('.look');
    var total = looks.length;
    var nowEl = controls.querySelector('[data-count-now]');
    var bar = controls.querySelector('[data-progress]');
    var live = controls.querySelector('[data-count-live]');
    var prev = controls.querySelector('[data-prev]');
    var next = controls.querySelector('[data-next]');
    var current = -1;
    var wheelLock = 0;

    controls.hidden = false;

    // Horizontal only while the strip actually scrolls sideways (it's a vertical stack under reduced motion).
    function isHorizontal() { return strip.scrollWidth > strip.clientWidth + 2; }

    function index() {
      if (!isHorizontal()) return 0;
      return Math.max(0, Math.min(total - 1, Math.round(strip.scrollLeft / strip.clientWidth)));
    }

    function go(i) {
      i = Math.max(0, Math.min(total - 1, i));
      strip.scrollTo({ left: i * strip.clientWidth, behavior: reduce.matches ? 'auto' : 'smooth' });
    }

    function sync() {
      var i = index();
      bar.style.transform = 'scaleX(' + ((i + 1) / total) + ')';
      prev.disabled = i === 0;
      next.disabled = i === total - 1;
      if (i === current) return;
      var first = current === -1;
      current = i;
      nowEl.textContent = pad(i + 1);
      each(looks, function (l, n) { l.classList.toggle('is-current', n === i); });
      var h = looks[i].querySelector('h1, h2');
      if (!first) live.textContent = 'Look ' + (i + 1) + ' of ' + total + ': ' + (h ? h.textContent.replace(/\s+/g, ' ').trim() : '');
    }

    var ticking = false;
    strip.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; sync(); });
    }, { passive: true });
    window.addEventListener('resize', function () { if (isHorizontal()) strip.scrollLeft = current * strip.clientWidth; sync(); });

    prev.addEventListener('click', function () { go(index() - 1); });
    next.addEventListener('click', function () { go(index() + 1); });

    function onKey(e) {
      if (!isHorizontal() || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      var i = index();
      if (e.key === 'ArrowRight') go(i + 1);
      else if (e.key === 'ArrowLeft') go(i - 1);
      else if (e.key === 'Home' && t === strip) go(0);
      else if (e.key === 'End' && t === strip) go(total - 1);
      else return;
      e.preventDefault();
    }
    document.addEventListener('keydown', function (e) {
      var a = document.activeElement;
      if (a === document.body || a === strip || strip.contains(a)) onKey(e);
    });

    // A vertical mouse wheel turns the page while the strip fills the screen; after the last look the page scrolls on to the footer.
    strip.addEventListener('wheel', function (e) {
      if (!isHorizontal() || Math.abs(e.deltaX) > Math.abs(e.deltaY) || window.scrollY > 4) return;
      var i = index();
      var dir = e.deltaY > 0 ? 1 : -1;
      if ((dir > 0 && i === total - 1) || (dir < 0 && i === 0)) return;
      e.preventDefault();
      var now = Date.now();
      if (now - wheelLock < 650 || Math.abs(e.deltaY) < 4) return;
      wheelLock = now;
      go(i + dir);
    }, { passive: false });

    sync();
  }

  /* ---------- Shade explorer (colour itself is pure CSS via :has) ---------- */
  var SHADES = {
    copper: { name: 'Copper', service: 'full', price: 900, what: 'Full colour' },
    honey: { name: 'Honey blonde', service: 'balayage', price: 1600, what: 'Balayage' },
    ash: { name: 'Ash blonde', service: 'foils', price: 1350, what: 'Full head foils' },
    rose: { name: 'Rose gold', service: 'gloss', price: 350, what: 'Toner & gloss' },
    burgundy: { name: 'Burgundy', service: 'full', price: 900, what: 'Full colour' },
    choc: { name: 'Chocolate', service: 'full', price: 900, what: 'Full colour' }
  };
  each(document.querySelectorAll('[data-explorer]'), function (ex) {
    var liveEl = ex.querySelector('[data-shade-live]');
    var book = ex.querySelector('[data-shade-book]');
    function update(announce) {
      var r = ex.querySelector('input[name="shade"]:checked');
      if (!r || !SHADES[r.value]) return;
      var s = SHADES[r.value];
      ex.setAttribute('data-shade', r.value);
      if (book) {
        book.href = '/samples/fynbos-fringe/book/?shade=' + r.value;
        book.textContent = 'Book ' + s.name.toLowerCase();
      }
      if (announce && liveEl) liveEl.textContent = s.name + '. ' + s.what + ' from ' + rand(s.price) + '.';
    }
    ex.addEventListener('change', function () { update(true); });
    update(false);
  });

  /* ---------- Price menu: pick a length ---------- */
  each(document.querySelectorAll('[data-menu]'), function (menu) {
    var pick = menu.querySelector('[data-len-pick]');
    var table = menu.querySelector('table');
    if (!pick || !table) return;
    pick.hidden = false;
    menu.classList.add('is-live');
    pick.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-len]');
      if (!btn) return;
      table.setAttribute('data-show', btn.getAttribute('data-len'));
      each(pick.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    });
  });

  /* ---------- Booking form ---------- */
  var PRICES = {
    cut: [450, 500, 550, 650], curl: [550, 600, 650, 750], short: [300], roots: [750],
    full: [900, 1050, 1200, 1450], foils: [1350, 1550, 1750, 2050], balayage: [1600, 1850, 2100, 2450],
    gloss: [350, 400, 450, 550], consult: [0], blowdry: [300, 350, 400, 500], upstyle: [650, 750, 850, 950],
    keratin: [1500, 1800, 2100, 2600]
  };
  var LENGTHS = ['short', 'medium', 'long', 'xl'];
  var LEN_WORDS = { short: 'short', medium: 'medium-length', long: 'long', xl: 'extra-long' };

  each(document.querySelectorAll('form[data-book]'), function (form) {
    var service = form.querySelector('#b-service');
    var estimate = form.querySelector('[data-estimate]');
    var date = form.querySelector('#b-date');
    var dateHelp = form.querySelector('[data-date-help]');
    var shadeField = form.querySelector('[data-shade-field]');

    var params = new URLSearchParams(window.location.search);
    var shade = params.get('shade');
    if (shade && Object.prototype.hasOwnProperty.call(SHADES, shade)) {
      service.value = SHADES[shade].service;
      shadeField.hidden = false;
      shadeField.querySelector('input').value = SHADES[shade].name;
    }

    function sastToday() {
      var d = new Date(Date.now() + 2 * 3600 * 1000); // SAST is UTC+2 all year
      return d.toISOString().slice(0, 10);
    }
    date.min = sastToday();

    function showEstimate() {
      var len = (form.querySelector('input[name="length"]:checked') || {}).value || 'medium';
      var list = PRICES[service.value] || [];
      var p = list.length === 1 ? list[0] : list[LENGTHS.indexOf(len)];
      var label = service.options[service.selectedIndex].text;
      if (p === 0) estimate.textContent = 'Colour consultations are free.';
      else if (list.length === 1) estimate.textContent = label + ' from ' + rand(p) + '.';
      else estimate.textContent = label + ' for ' + LEN_WORDS[len] + ' hair from ' + rand(p) + '.';
    }

    function checkDate() {
      if (!date.value) { dateHelp.textContent = 'We’re open Tuesday to Saturday.'; dateHelp.classList.remove('is-warn'); return true; }
      var day = new Date(date.value + 'T12:00:00Z').getUTCDay();
      var closed = day === 0 || day === 1;
      dateHelp.textContent = closed ? 'We’re closed on Sundays and Mondays. Pick a Tuesday to Saturday.' : 'We’re open that day.';
      dateHelp.classList.toggle('is-warn', closed);
      return !closed;
    }

    form.addEventListener('change', function (e) {
      if (e.target === date) checkDate(); else showEstimate();
    });
    showEstimate();
  });

  /* ---------- Demo forms ---------- */
  each(document.querySelectorAll('form[data-demo]'), function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (f) { return !f.value.trim(); });
      if (missing.length) {
        status.textContent = 'Please add your name and WhatsApp number. (This is a demo – nothing is sent.)';
        missing[0].focus();
        return;
      }
      status.textContent = 'This is a demo – nothing is sent.';
    });
  });
})();
