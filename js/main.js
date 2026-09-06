/* ============================================================================
   MAIN — reveals, line-splitting, counters, nav, spire progress, parallax.
   Source: DIRECTION.md §5.  No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Preloader ────────────────────────────────────────────────────── */
  function dismissPreloader() {
    var p = document.getElementById('preloader');
    if (!p) return;
    p.classList.add('is-done');
    setTimeout(function () { p.remove(); }, 600);
  }
  window.addEventListener('load', function () { setTimeout(dismissPreloader, reduced ? 0 : 700); });
  setTimeout(dismissPreloader, 2600);           // hard cap — never trap the user

  /* ── The mark (traced SVG) ────────────────────────────────────────── */
  var marks = [];
  if (window.UmerMark) {
    ['navMark', 'footMark', 'preMark'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = window.UmerMark.svg(id);
      marks.push(el);
    });
    // The signature build: spire draws, shafts rise, one flash of light.
    var pre = document.getElementById('preMark');
    if (pre) {
      requestAnimationFrame(function () { pre.classList.add('is-building'); });
      if (!reduced) setTimeout(function () { pre.classList.add('sweep'); }, 1200);
    }
  }

  /* ── Year ─────────────────────────────────────────────────────────── */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Nav compress ─────────────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScrollNav();

  /* ── Line splitting for headlines (§5.4 — by LINE, never by char) ─── */
  function splitLines(el) {
    if (el.dataset.split === 'done') return;
    var html = el.innerHTML;
    el.dataset.original = html;

    // Wrap every word so we can measure where the browser broke the lines.
    var tmp = document.createElement('div');
    tmp.innerHTML = html;

    function wrapWords(node) {
      var out = [];
      node.childNodes.forEach(function (child) {
        if (child.nodeType === 3) {
          child.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { out.push(document.createTextNode(tok)); return; }
            var s = document.createElement('span');
            s.className = '_w';
            s.textContent = tok;
            out.push(s);
          });
        } else if (child.nodeType === 1) {
          var clone = child.cloneNode(false);
          wrapWords(child).forEach(function (n) { clone.appendChild(n); });
          out.push(clone);
        }
      });
      return out;
    }

    var wrapped = wrapWords(tmp);
    el.innerHTML = '';
    wrapped.forEach(function (n) { el.appendChild(n); });

    // Measure: group word-spans by their offsetTop.
    var words = Array.prototype.slice.call(el.querySelectorAll('._w'));
    if (!words.length) { el.dataset.split = 'done'; return; }

    var lines = [];
    var currentTop = null;
    words.forEach(function (w) {
      var t = Math.round(w.offsetTop);
      if (currentTop === null || Math.abs(t - currentTop) > 4) {
        currentTop = t;
        lines.push([]);
      }
      lines[lines.length - 1].push(w);
    });

    // Rebuild: one .r-line wrapper per measured line, preserving inline markup.
    if (lines.length) {
      var range = document.createRange();
      var frag = document.createDocumentFragment();
      lines.forEach(function (lineWords, i) {
        var first = lineWords[0];
        var last = lineWords[lineWords.length - 1];
        // Walk up to direct children of el so we don't split inline elements badly.
        var startNode = first, endNode = last;
        while (startNode.parentNode !== el) startNode = startNode.parentNode;
        while (endNode.parentNode !== el) endNode = endNode.parentNode;

        range.setStartBefore(startNode);
        range.setEndAfter(endNode);
        var contents = range.extractContents();

        var outer = document.createElement('span');
        outer.className = 'r-line';
        var inner = document.createElement('span');
        inner.style.setProperty('--delay', (i * 90) + 'ms');
        inner.appendChild(contents);
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      el.innerHTML = '';
      el.appendChild(frag);
    }
    el.dataset.split = 'done';
  }

  var headlines = document.querySelectorAll('[data-reveal-lines]');
  headlines.forEach(function (h) {
    if (reduced) { h.classList.add('is-in'); return; }
    splitLines(h);
  });

  /* ── Reveal observer ──────────────────────────────────────────────── */
  var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-lines]');

  if (reduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); runCounters(el); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        runCounters(e.target);
        io.unobserve(e.target);          // play once — never replay on scroll-up
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.01 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ── Count-up (§5.5 — locks once counted) ─────────────────────────── */
  function runCounters(scope) {
    var nodes = scope.querySelectorAll ? scope.querySelectorAll('[data-count-to]') : [];
    nodes.forEach(function (n) {
      if (n.dataset.counted) return;
      n.dataset.counted = '1';
      var to = parseFloat(n.dataset.countTo);
      var dec = parseInt(n.dataset.dec || '0', 10);
      if (reduced) { n.textContent = fmt(to, dec); return; }
      var start = performance.now(), dur = 1200, delay = 200;
      function tick(now) {
        var t = (now - start - delay) / dur;
        if (t < 0) { requestAnimationFrame(tick); return; }
        if (t >= 1) { n.textContent = fmt(to, dec); return; }
        var e = 1 - Math.pow(1 - t, 4);              // ease-out-quart ≈ expo feel
        n.textContent = fmt(to * e, dec);
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  function fmt(v, dec) {
    return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
  }

  /* ── Spire progress + elevation + parallax plates ─────────────────── */
  var spireFill = document.getElementById('spireFill');
  var plates = Array.prototype.slice.call(document.querySelectorAll('.plate'));
  var platesWrap = document.getElementById('plates');
  var ticking = false;

  function onScroll() {
    onScrollNav();

    var h = document.documentElement.scrollHeight - window.innerHeight;
    var prog = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    if (spireFill) spireFill.style.height = (prog * 100) + '%';
    // the logo's spire IS the progress gauge
    marks.forEach(function (el) { el.style.setProperty('--p', prog.toFixed(4)); });

    if (!reduced && platesWrap && plates.length) {
      var r = platesWrap.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        // -1 .. 1 across the viewport
        var centre = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        plates.forEach(function (pl) {
          var d = parseFloat(pl.dataset.depth || '0.5');
          pl.style.transform = 'translate3d(0,' + (-centre * d * 110).toFixed(2) + 'px,0)';
        });
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  window.addEventListener('resize', function () {
    headlines.forEach(function (h) {
      if (reduced || h.dataset.split !== 'done' || !h.dataset.original) return;
      h.innerHTML = h.dataset.original;
      h.dataset.split = '';
      splitLines(h);
      h.classList.add('is-in');
    });
    onScroll();
  });

  onScroll();

  /* ── Smooth anchor scroll ─────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
