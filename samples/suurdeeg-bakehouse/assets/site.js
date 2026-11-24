/* Suurdeeg Bakehouse – concept design by Duranex.
   "Out of the oven now" bake clock, Saturday pre-order basket, demo forms.
   No network requests. */
(function () {
  'use strict';

  var DEMO_TEXT = 'This is a demo – nothing is sent.';
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var OVENS_ON = 270; /* 04:30 */
  var DOORS = 420; /* 07:00 */
  var CLOSED = 840; /* 14:00 */
  var CLOSED_DAY = 1; /* Monday */

  /* South Africa has no daylight saving: SAST is always UTC+2. */
  function sastDate() { return new Date(Date.now() + 2 * 3600 * 1000); }
  function sastNow() {
    var d = sastDate();
    return { dow: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
  function until(mins) {
    if (mins < 60) return mins + ' min';
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + ' h' + (m ? ' ' + m + ' min' : '');
  }
  function rand(n) { return 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* ---------- Bake clock ---------- */
  var clock = document.getElementById('clock');
  if (clock) {
    var elTime = document.getElementById('clock-time');
    var elTz = document.getElementById('clock-tz');
    var elLine = document.getElementById('clock-line');
    var elJump = document.getElementById('clock-jump');
    var elLive = document.getElementById('clock-live');
    var elH = document.getElementById('clock-h');
    var elM = document.getElementById('clock-m');

    var stops = Array.prototype.map.call(document.querySelectorAll('.stop[data-t]'), function (el) {
      return { el: el, t: Number(el.getAttribute('data-t')), kind: el.getAttribute('data-kind'), label: el.getAttribute('data-label') };
    });
    var bakes = stops.filter(function (s) { return s.kind === 'bake'; });
    var firstBake = bakes[0];
    var closedStop = stops.filter(function (s) { return s.t === CLOSED; })[0];

    var preview = null; /* minutes, when "try another time" is in use */
    var lastNowId = null;

    function nextOpenDayLabel(dow) {
      var d = (dow + 1) % 7;
      if (d !== CLOSED_DAY) return 'Tomorrow’s';
      return DAY_NAMES[(d + 1) % 7] + '’s';
    }

    /* Build the status line from text and bold parts, without innerHTML. */
    function setLine(parts) {
      elLine.textContent = '';
      parts.forEach(function (p) {
        if (typeof p === 'string') { elLine.appendChild(document.createTextNode(p)); return; }
        var b = document.createElement('strong');
        b.textContent = p.b;
        elLine.appendChild(b);
      });
    }

    function tag(stop, text) {
      var p = document.createElement('p');
      p.className = 'now-tag';
      p.textContent = text;
      var box = stop.el.querySelector('.stop-text');
      box.insertBefore(p, box.firstChild);
    }

    function clear() {
      stops.forEach(function (s) {
        s.el.classList.remove('is-now', 'is-next');
        s.el.removeAttribute('aria-current');
        var t = s.el.querySelector('.now-tag');
        if (t) t.parentNode.removeChild(t);
      });
    }

    function setDial(min) {
      var h = Math.floor(min / 60) % 12, m = min % 60;
      elH.setAttribute('transform', 'rotate(' + (h * 30 + m * 0.5) + ' 20 20)');
      elM.setAttribute('transform', 'rotate(' + (m * 6) + ' 20 20)');
    }

    function render() {
      var real = sastNow();
      var dow = preview === null ? real.dow : 6; /* previews pretend it's a Saturday */
      var min = preview === null ? real.min : preview;
      var now = null, next = null, parts;

      clear();
      setDial(min);
      elTime.textContent = hhmm(min);
      elTz.textContent = preview === null ? 'SAST · ' + DAY_NAMES[dow] : '· preview, Saturday';

      if (dow === CLOSED_DAY) {
        next = firstBake;
        parts = ['Closed on Mondays (we bake rusks and feed the starter). Tuesday’s first bake: ', { b: firstBake.label + ' at ' + hhmm(firstBake.t) }, '.'];
      } else if (min < OVENS_ON) {
        next = firstBake;
        parts = ['Ovens go on at 04:30. First bake today: ', { b: firstBake.label + ' in ' + until(firstBake.t - min) }, ' (' + hhmm(firstBake.t) + ').'];
      } else if (min >= CLOSED) {
        now = closedStop;
        next = firstBake;
        parts = ['Closed for today. ' + nextOpenDayLabel(dow) + ' first bake: ', { b: firstBake.label + ' at ' + hhmm(firstBake.t) }, '.'];
      } else {
        stops.forEach(function (s) { if (s.t <= min) now = s; });
        bakes.forEach(function (s) { if (!next && s.t > min) next = s; });
        parts = now.kind === 'bake' ? ['Out of the oven now: ', { b: now.label }, '. '] : ['Now: ', { b: now.label }, '. '];
        if (next) parts.push('Next: ', { b: next.label + ' in ' + until(next.t - min) }, '.');
        else parts.push('That was the last bake. ' + nextOpenDayLabel(dow) + ' first: ' + firstBake.label + ' at ' + hhmm(firstBake.t) + '.');
        if (min < DOORS) parts.push(' Doors open at 07:00.');
      }

      setLine(parts);

      if (now) {
        now.el.classList.add('is-now');
        now.el.setAttribute('aria-current', 'time');
        tag(now, now === closedStop ? 'Where we are now' : now.kind === 'bake' ? 'Out of the oven now' : 'Happening now');
      }
      if (next && next !== now) {
        next.el.classList.add('is-next');
        tag(next, 'Next out of the oven');
      }

      var target = now && now !== closedStop ? now : next;
      elJump.hidden = !target;
      if (target) {
        elJump.href = '#' + target.el.id;
        elJump.textContent = target === now ? 'Jump to now' : 'See the next bake';
      }

      var id = now ? now.el.id : 'none';
      if (lastNowId !== null && id !== lastNowId) elLive.textContent = elLine.textContent;
      lastNowId = id;
    }

    render();
    setInterval(function () { if (preview === null && !document.hidden) render(); }, 20000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && preview === null) render(); });

    /* "Try another time" for people viewing the design at night */
    var tryBox = document.getElementById('try-time');
    var range = document.getElementById('try-range');
    var out = document.getElementById('try-out');
    var live = document.getElementById('try-live');
    if (tryBox && range) {
      tryBox.hidden = false;
      range.addEventListener('input', function () {
        preview = Number(range.value);
        out.textContent = hhmm(preview);
        lastNowId = null; /* don't announce every step of the slider */
        render();
      });
      live.addEventListener('click', function () {
        preview = null;
        lastNowId = null;
        render();
        tryBox.open = false;
      });
    }
  }

  /* ---------- Saturday pre-order ---------- */
  var order = document.getElementById('order');
  if (order) {
    /* Next Saturday whose Thursday 17:00 cut-off hasn't passed yet. */
    var d = sastDate();
    var dow = d.getUTCDay();
    var min = d.getUTCHours() * 60 + d.getUTCMinutes();
    var add = (6 - dow + 7) % 7;
    if (add === 0 || dow === 5 || (dow === 4 && min >= 17 * 60)) add += 7;
    var sat = new Date(d.getTime() + add * 86400000);
    var thu = new Date(sat.getTime() - 2 * 86400000);
    var satEl = document.getElementById('sat-date');
    var cutEl = document.getElementById('cutoff');
    if (satEl) satEl.textContent = 'Saturday ' + sat.getUTCDate() + ' ' + MONTHS[sat.getUTCMonth()];
    if (cutEl) cutEl.textContent = 'Thursday ' + thu.getUTCDate() + ' ' + MONTHS[thu.getUTCMonth()] + ', 17:00';

    var qtys = order.querySelectorAll('input[data-price]');
    var list = document.getElementById('basket-list');
    var totalEl = document.getElementById('basket-total');
    var total = 0;

    var updateBasket = function () {
      total = 0;
      list.textContent = '';
      Array.prototype.forEach.call(qtys, function (input) {
        var n = Math.floor(Number(input.value));
        var max = Number(input.max) || 10;
        if (!isFinite(n) || n < 0) n = 0;
        if (n > max) n = max;
        if (!n) return;
        var sum = n * Number(input.getAttribute('data-price'));
        total += sum;
        var li = document.createElement('li');
        var a = document.createElement('span');
        a.textContent = n + ' × ' + input.getAttribute('data-name');
        var b = document.createElement('span');
        b.textContent = rand(sum);
        li.appendChild(a);
        li.appendChild(b);
        list.appendChild(li);
      });
      if (!total) {
        var empty = document.createElement('li');
        empty.className = 'basket-empty';
        empty.textContent = 'Nothing yet. Add a loaf or two.';
        list.appendChild(empty);
      }
      totalEl.textContent = rand(total);
    };
    order.addEventListener('input', updateBasket);
    order.addEventListener('change', function (e) {
      var t = e.target;
      if (t && t.hasAttribute && t.hasAttribute('data-price')) {
        var n = Math.floor(Number(t.value));
        var max = Number(t.max) || 10;
        t.value = String(!isFinite(n) || n < 0 ? 0 : Math.min(n, max));
      }
      updateBasket();
    });
    updateBasket();

    order.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('order-status');
      status.textContent = total
        ? 'Thanks! On a real site your order (' + rand(total) + ') would now go to the bakery. ' + DEMO_TEXT
        : 'Add at least one item to your bag first. (' + DEMO_TEXT + ')';
    });
  }

  /* ---------- Any other demo form ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-demo]'), function (form) {
    if (form === order) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      if (status) status.textContent = DEMO_TEXT;
    });
  });
})();
