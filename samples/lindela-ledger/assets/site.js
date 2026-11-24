/* Lindela Ledger & Tax (concept design by Duranex).
   "What do I bring?" checklist builder + demo form. No network requests. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var SITUATIONS = {
    salaried: 'Salaried',
    side: 'Salaried, with side income',
    sole: 'Sole proprietor',
    company: 'Small company'
  };

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function hasWord(attr, word) { return (' ' + (attr || '') + ' ').indexOf(' ' + word + ' ') !== -1; }

  /* ---------- Checklist builder ---------- */
  each(document.querySelectorAll('[data-builder]'), function (b) {
    b.classList.add('is-live');
    var radios = b.querySelectorAll('input[name="sit"]');
    var extras = b.querySelectorAll('.extras input[type="checkbox"]');
    var items = b.querySelectorAll('li[data-for]');
    var groups = b.querySelectorAll('[data-group]');
    var count = b.querySelector('[data-cl-count]');
    var title = b.querySelector('[data-cl-title]');
    var forLine = b.querySelector('[data-cl-for]');
    var full = b.querySelector('[data-cl-full]');
    var printBtn = b.querySelector('[data-cl-print]');
    var resetBtn = b.querySelector('[data-cl-reset]');
    var compact = b.hasAttribute('data-compact');

    // Pre-select from ?for=<situation>&with=a,b (set by the front page link).
    var params = new URLSearchParams(window.location.search);
    var pre = params.get('for');
    if (pre && Object.prototype.hasOwnProperty.call(SITUATIONS, pre)) {
      each(radios, function (r) { r.checked = r.value === pre; });
    }
    var preWith = (params.get('with') || '').split(',');
    each(extras, function (x) { if (preWith.indexOf(x.value) !== -1) x.checked = true; });

    function situation() {
      var v = 'salaried';
      each(radios, function (r) { if (r.checked) v = r.value; });
      return v;
    }

    function update(fromUser) {
      var sit = situation();
      var on = {};
      each(b.querySelectorAll('.extras label[data-for]'), function (lab) {
        var fits = hasWord(lab.getAttribute('data-for'), sit);
        lab.hidden = !fits;
        var box = lab.querySelector('input');
        if (fits && box.checked) on[box.value] = true;
      });

      var shown = 0, ticked = 0;
      each(items, function (li) {
        var extra = li.getAttribute('data-extra');
        var show = hasWord(li.getAttribute('data-for'), sit) && (!extra || on[extra]);
        li.hidden = !show;
        if (show) {
          shown++;
          if (li.querySelector('input').checked) ticked++;
        }
      });
      each(groups, function (g) { g.hidden = !g.querySelector('li[data-for]:not([hidden])'); });

      if (title && !compact) title.textContent = sit === 'company' ? 'For the company' : 'For your personal return';
      if (forLine) forLine.textContent = 'Situation: ' + SITUATIONS[sit] + '.';
      if (count) {
        count.textContent = ticked === shown && shown
          ? 'All ' + shown + ' ready. Bring the pile.'
          : ticked + ' of ' + shown + ' found so far.';
      }
      if (full) {
        full.href = '/samples/lindela-ledger/checklist/?for=' + sit;
      }
      if (fromUser && !compact && window.history.replaceState) {
        var w = Object.keys(on).join(',');
        window.history.replaceState(null, '', '?for=' + sit + (w ? '&with=' + w : ''));
      }
    }

    b.addEventListener('change', function () { update(true); });
    if (printBtn) {
      printBtn.hidden = false;
      printBtn.addEventListener('click', function () { window.print(); });
    }
    if (resetBtn) {
      resetBtn.hidden = false;
      resetBtn.addEventListener('click', function () {
        each(items, function (li) { li.querySelector('input').checked = false; });
        update(false);
      });
    }
    update(false);
  });

  /* ---------- Demo forms ---------- */
  each(document.querySelectorAll('form[data-demo]'), function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.textContent = 'This is a demo – nothing is sent.';
    });
  });
})();
