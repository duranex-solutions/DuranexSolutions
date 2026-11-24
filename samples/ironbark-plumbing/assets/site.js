/* Ironbark Plumbing & Geysers – concept design by Duranex.
   "What's wrong?" triage + demo forms. No network requests. */
(function () {
  'use strict';

  var DEMO_TEXT = 'This is a demo – nothing is sent.';

  /* ---------- Triage ---------- */
  var triage = document.getElementById('triage');
  if (triage) {
    var out = document.getElementById('triage-out');
    var elUrgency = document.getElementById('out-urgency');
    var elCause = document.getElementById('out-cause');
    var elNow = document.getElementById('out-now');
    var elMsg = document.getElementById('out-msg');
    var elCopy = document.getElementById('out-copy');
    var elSend = document.getElementById('out-send');
    var elUse = document.getElementById('out-use');
    var elNote = document.getElementById('out-note');

    var WHERE = { kitchen: 'kitchen', bathroom: 'bathroom', geyser: 'geyser' };
    var WHAT = { leak: 'a leak', nohot: 'no hot water', blocked: 'a blocked drain' };
    var HOW = { drip: 'It’s dripping / slow for now.', worse: 'It’s getting worse.', flood: 'It’s flooding – urgent.' };

    var CAUSE = {
      'kitchen-leak': 'Most often a worn tap cartridge, or a compression fitting under the sink that has worked loose.',
      'kitchen-nohot': 'If the bathroom still has hot water, it’s the kitchen hot line or the mixer’s hot cartridge. If no tap in the house is hot, it’s the geyser.',
      'kitchen-blocked': 'Usually fat and food scraps building up in the sink trap, or in the pipe out to the gully outside.',
      'bathroom-leak': 'Commonly a toilet cistern valve that won’t shut off, a worn shower mixer, or a perished seal behind the basin.',
      'bathroom-nohot': 'If the kitchen is cold too, it’s the geyser. If it’s only the shower, look at the mixer or a scaled-up shower head.',
      'bathroom-blocked': 'Hair and soap in the shower or basin trap, or a toilet blockage further down the line.',
      'geyser-leak': 'Water from the overflow pipe usually means a tired pressure valve or thermostat. Water coming from the tank itself often means it has rusted through.',
      'geyser-nohot': 'Most often a burnt-out element, a faulty thermostat or a tripped geyser breaker.',
      'geyser-blocked': 'A blocked or kinked overflow or drip-tray drain. The water backs up into the ceiling instead of running outside.'
    };

    function doNow(where, what, how) {
      if (where === 'geyser') {
        if (how === 'flood') return 'Switch the geyser breaker off at the DB board, then close the cold-water valve going into the geyser. If you can’t find it, close the main stopcock at the water meter.';
        if (what === 'nohot') return 'Check the geyser breaker on the DB board. If it has tripped, reset it once. If it trips again, leave it off and call us.';
        return 'Switch the geyser breaker off at the DB board and put a bucket under any drip. Don’t go into the ceiling if it’s wet or sagging.';
      }
      if (what === 'leak') {
        if (how === 'drip') return 'Put a bowl under it and close the small isolation valve under the basin or behind the toilet, if there is one.';
        if (how === 'worse') return 'Close the isolation valve under the fitting. If there isn’t one, close the main stopcock at the water meter.';
        return 'Close the main stopcock now. It’s usually at the water meter near the front boundary. Keep water away from plugs and switch off any wet circuits.';
      }
      if (what === 'nohot') {
        if (how === 'flood') return 'Switch the geyser breaker off at the DB board and close the main stopcock. Water and electrics together are dangerous.';
        return 'Check the geyser breaker on the DB board. If it has tripped, reset it once. If it trips again, leave it off and call us.';
      }
      /* blocked */
      if (how === 'drip') return 'Stop using that drain for now. Please don’t pour in caustic drain cleaner: it rarely clears the line and it burns whoever opens the trap.';
      if (how === 'worse') return 'Stop using every drain on that side of the house (sinks, showers, washing machine) until it’s cleared.';
      return 'Stop all water use in the house. If the outside gully is overflowing, keep children and pets away from it.';
    }

    var URGENCY = {
      drip: { level: 1, text: 'Book a normal visit' },
      worse: { level: 2, text: 'Same-day if we can' },
      flood: { level: 3, text: 'Call now – 24/7 line' }
    };

    function picked(name) {
      var el = triage.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    }

    function update() {
      var where = picked('where');
      var what = picked('what');
      var how = picked('how');
      if (!(where && what && how)) {
        out.setAttribute('data-state', 'empty');
        return;
      }
      var u = URGENCY[how];
      elUrgency.textContent = u.text;
      elUrgency.setAttribute('data-level', String(u.level));
      elCause.textContent = CAUSE[where + '-' + what];
      elNow.textContent = doNow(where, what, how);
      var step = doNow(where, what, how).split('. ')[0].replace(/\.$/, '').replace(/ (now|for now)$/, '');
      step = step.charAt(0).toLowerCase() + step.slice(1);
      elMsg.textContent =
        'Hi Ironbark, I’ve got ' + WHAT[what] + ' (' + WHERE[where] + '). ' + HOW[how] + '\n' +
        'So far I’ve tried to ' + step + '.\n' +
        'My suburb: \nBest time to call: ';
      elNote.hidden = true;
      out.setAttribute('data-state', 'ready');
    }

    triage.addEventListener('change', update);
    update();

    elSend.addEventListener('click', function () {
      elNote.textContent = DEMO_TEXT + ' On a real site this would open WhatsApp with the message above.';
      elNote.hidden = false;
    });

    elCopy.addEventListener('click', function () {
      var text = elMsg.textContent;
      var done = function () {
        elNote.textContent = 'Copied. (Demo number – please don’t send it anywhere.)';
        elNote.hidden = false;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          elNote.textContent = 'Copy didn’t work in this browser. Select the text and copy it by hand.';
          elNote.hidden = false;
        });
      } else {
        elNote.textContent = 'Select the text and copy it by hand.';
        elNote.hidden = false;
      }
    });

    if (elUse) {
      elUse.addEventListener('click', function () {
        var box = document.getElementById('b-problem');
        if (!box) return;
        box.value = elMsg.textContent.split('\n').slice(0, 2).join(' ');
        box.focus();
      });
    }
  }

  /* ---------- Demo forms ---------- */
  var forms = document.querySelectorAll('form[data-demo]');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      if (status) status.textContent = DEMO_TEXT;
    });
  });
})();
