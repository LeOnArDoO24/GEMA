/* GEMA — home: sfondo Matrix Rain, card di "Cosa facciamo", filo di "Come lavoriamo" */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 900px)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* =====================================================================
     Matrix Rain — porting in JS puro del componente React MatrixRain
     (stessa logica di colonne, scia, glow e risposta al puntatore).
     Colori adattati alla palette GEMA; l'intensità si regola con
     CONFIG_RAIN.opacity e con il "velo" CSS sopra al canvas.
     ===================================================================== */
  var CONFIG_RAIN = {
    background: '#141414',   // fondo della hero
    color: '#536be1',        // blu GEMA per la scia
    highlight: '#94a6ff',    // azzurro GEMA per il carattere in testa
    density: 0.9,
    fontSize: 18,
    glow: 6,
    speed: 1,
    trail: 0.9,
    pointerResponse: true,
    opacity: 0.65            // opacità del canvas (1 = come il componente originale)
  };
  var defaultCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

  function randomFrom(seed) {
    var value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  }
  function createColumn(index) {
    var seed = index * 47.17 + 11.3;
    var entryPhase = randomFrom(seed + 2.4);
    return { head: 1.5 - entryPhase * 10.5, seed: seed, velocity: 9 + randomFrom(seed + 5.7) * 11 };
  }

  function matrixRain(root, opts) {
    var o = opts;
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'matrix-canvas';
    canvas.style.opacity = o.opacity;
    root.appendChild(canvas);
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    var pointerTarget = root.parentElement || root;

    var safeFontSize = clamp(o.fontSize, 10, 32);
    var safeDensity = clamp(o.density, 0.45, 1.4);
    var safeSpeed = clamp(o.speed, 0.2, 2.5);
    var safeTrail = clamp(o.trail, 0.72, 0.97);
    var glyphs = Array.from(o.characters || defaultCharacters);
    var font = '500 ' + safeFontSize + 'px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    var pointer = { active: false, x: 0, y: 0 };
    var columns = [], columnWidth = safeFontSize / safeDensity;
    var frameId, lastTime = performance.now(), elapsed = 0, acc = 0, visible = true;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reduceMotion = mq.matches;

    function resize() {
      var b = root.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(b.width * ratio)), h = Math.max(1, Math.round(b.height * ratio));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      columnWidth = safeFontSize / safeDensity;
      var count = Math.ceil(b.width / columnWidth) + 1;
      columns = Array.from({ length: count }, function (_, i) { return createColumn(i); });
      ctx.fillStyle = o.background;
      ctx.fillRect(0, 0, b.width, b.height);
    }
    function characterAt(seed) {
      var i = Math.floor(randomFrom(seed) * glyphs.length);
      return glyphs[i] || glyphs[0] || '0';
    }
    function drawStatic() {
      var b = root.getBoundingClientRect();
      ctx.globalAlpha = 1; ctx.fillStyle = o.background; ctx.fillRect(0, 0, b.width, b.height);
      ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var ci = 0; ci < columns.length; ci++) {
        var col = columns[ci];
        var x = ci * columnWidth + columnWidth * .5;
        var len = 10 + Math.floor(randomFrom(col.seed + 8) * 16);
        for (var off = 0; off < len; off++) {
          var row = Math.floor(col.head) - off, y = row * safeFontSize;
          if (y < -safeFontSize || y > b.height + safeFontSize) continue;
          var pr = off / Math.max(len - 1, 1);
          ctx.globalAlpha = Math.pow(1 - pr, 2.2);
          ctx.fillStyle = off === 0 ? o.highlight : o.color;
          ctx.shadowColor = o.color;
          ctx.shadowBlur = clamp(o.glow, 0, 18) * (1 - pr);
          ctx.fillText(characterAt(col.seed + row * 2.73), x, y);
        }
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    function drawRainTick(dt) {
      var b = root.getBoundingClientRect();
      var rows = Math.ceil(b.height / safeFontSize);
      var radius = Math.max(84, safeFontSize * 7.5);
      ctx.globalAlpha = (1 - safeTrail) * .5; ctx.fillStyle = o.background; ctx.fillRect(0, 0, b.width, b.height);
      ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var ci = 0; ci < columns.length; ci++) {
        var col = columns[ci];
        col.head += col.velocity * safeSpeed * dt;
        if (col.head > rows + 4) {
          var reset = createColumn(ci + Math.floor(elapsed * .01));
          col.head = -4 - randomFrom(reset.seed + 9) * rows * .5;
          col.seed = reset.seed; col.velocity = reset.velocity;
        }
        var x = ci * columnWidth + columnWidth * .5, y = Math.floor(col.head) * safeFontSize;
        var dx = x - pointer.x, dy = y - pointer.y, dist = Math.hypot(dx, dy);
        var inf = o.pointerResponse && pointer.active ? Math.max(0, 1 - dist / radius) : 0;
        var disp = dist > 0 ? (dx / dist) * inf * 7 : 0;
        var g = characterAt(col.seed + Math.floor(col.head) * 2.73 + elapsed * .0041);
        ctx.globalAlpha = .82 + inf * .18; ctx.fillStyle = o.color; ctx.shadowColor = o.color;
        ctx.shadowBlur = clamp(o.glow, 0, 18) * (.7 + inf * .5);
        ctx.fillText(g, x + disp, y);
        ctx.globalAlpha = .62 + inf * .38; ctx.fillStyle = o.highlight;
        ctx.shadowBlur = clamp(o.glow, 0, 18) * .45;
        ctx.fillText(g, x + disp, y);
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    function tick(t) {
      var dt = Math.min((t - lastTime) / 1000, .05);
      lastTime = t; elapsed += dt * 1000; acc += dt;
      if (acc >= .05) { drawRainTick(acc); acc = 0; }
      frameId = visible && !reduceMotion ? requestAnimationFrame(tick) : undefined;
    }
    function start() { if (frameId !== undefined || !visible || reduceMotion) return; lastTime = performance.now(); frameId = requestAnimationFrame(tick); }
    function stop() { if (frameId === undefined) return; cancelAnimationFrame(frameId); frameId = undefined; }

    pointerTarget.addEventListener('pointermove', function (e) {
      var b = root.getBoundingClientRect();
      pointer.active = true; pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top;
    });
    pointerTarget.addEventListener('pointerleave', function () { pointer.active = false; });
    mq.addEventListener('change', function () { reduceMotion = mq.matches; if (reduceMotion) { stop(); drawStatic(); } else start(); });
    new ResizeObserver(function () { resize(); if (reduceMotion) drawStatic(); else drawRainTick(0); }).observe(root);
    new IntersectionObserver(function (en) { visible = !!(en[0] && en[0].isIntersecting); if (visible) start(); else stop(); }).observe(root);

    resize();
    if (reduceMotion) drawStatic(); else drawRainTick(0);
    start();
  }
  document.querySelectorAll('[data-matrix]').forEach(function (el) { matrixRain(el, CONFIG_RAIN); });

  /* =====================================================================
     [02] Cosa facciamo — card che si impilano con lo scroll
     ===================================================================== */
  var svc = document.querySelector('.services');
  var cards = [].slice.call(svc.querySelectorAll('.svc-card'));
  var title = svc.querySelector('.svc-title');
  var tCmd = title.querySelector('.cmd'), tLine = title.querySelector('.line2');
  var count = svc.querySelector('.count');
  var bars = [].slice.call(svc.querySelectorAll('.bars i'));
  var current = 0, swapTimer;

  function setActive(i) {
    if (i === current) return;
    current = i;
    bars.forEach(function (b, k) { b.classList.toggle('on', k === i); });
    count.textContent = '0' + (i + 1) + ' / 04';
    clearTimeout(swapTimer);
    title.classList.add('swap');
    swapTimer = setTimeout(function () {
      tCmd.textContent = cards[i].dataset.cmd;
      tLine.textContent = cards[i].dataset.title;
      title.classList.remove('swap');
    }, reduce ? 0 : 180);
  }

  function navOffset() {
    var n = document.querySelector('.topbar');
    return n ? n.offsetHeight + 20 : 28;
  }

  function updateServices() {
    if (mobile.matches) return;
    var vh = window.innerHeight;
    var r = svc.getBoundingClientRect();
    var range = svc.offsetHeight - vh;
    var p = clamp(-r.top / range, 0, 1) * (cards.length - 1); // 0..3
    var backTop = navOffset(); // sotto la navbar fissa
    cards.forEach(function (c, i) {
      var h = c.offsetHeight;
      var rest = Math.max(backTop + 40, (vh - h) / 2);
      var below = vh + 118;
      var d = p - i, top, scale = 1, op = 1;
      if (d <= -1) { top = below; }
      else if (d < 0) { top = lerp(below, rest, easeInOut(clamp((d + 1) / .85, 0, 1))); }
      else if (d < 1) {
        var k = easeInOut(clamp(d / .6, 0, 1));
        top = lerp(rest, backTop, k); scale = lerp(1, .92, k); op = lerp(1, .32, k);
      } else if (d < 2) { top = backTop; scale = .92; op = lerp(.32, 0, clamp((d - 1) / .5, 0, 1)); }
      else { top = backTop; scale = .92; op = 0; }
      c.style.transform = 'translate3d(0,' + top.toFixed(1) + 'px,0) scale(' + scale.toFixed(4) + ')';
      c.style.opacity = op.toFixed(3);
      c.style.visibility = op < .01 ? 'hidden' : 'visible';
      c.style.zIndex = 10 + i;
    });
    setActive(clamp(Math.round(p), 0, cards.length - 1));
  }

  /* =====================================================================
     [04] Come lavoriamo — il filo si disegna con lo scroll
     ===================================================================== */
  var thread = document.querySelector('.thread');
  var outer = document.querySelector('.thread-outer');
  var wire = thread.querySelector('.wire');
  var steps = [].slice.call(thread.querySelectorAll('.step'));
  var nodes = [].slice.call(thread.querySelectorAll('.node'));
  var cta = document.querySelector('.cta');
  var total = wire.getTotalLength();
  var OX = 269; // l'SVG parte a x=269 dentro il blocco da 1316px
  var samples = [], N = 900;
  for (var s = 0; s <= N; s++) {
    var L = total * s / N, pt = wire.getPointAtLength(L);
    samples.push({ L: L, x: pt.x + OX, y: pt.y });
  }
  // lunghezza del filo in cui tocca ciascun nodo
  var nodeLen = nodes.map(function (n) {
    var nx = parseFloat(n.style.left), ny = parseFloat(n.style.top), best = 0, bd = 1e9;
    samples.forEach(function (q) { var dd = (q.x - nx) * (q.x - nx) + (q.y - ny) * (q.y - ny); if (dd < bd) { bd = dd; best = q.L; } });
    return best;
  });
  // per ogni lunghezza, la y più bassa raggiunta finora: il filo segue la linea di scroll
  var maxY = 0;
  samples.forEach(function (q) { maxY = Math.max(maxY, q.y); q.my = maxY; });
  wire.style.strokeDasharray = total + ' ' + total;

  var scale = 1;
  function layoutThread() {
    if (mobile.matches) { outer.style.height = ''; return; }
    scale = Math.min(1, outer.clientWidth / 1316);
    thread.style.transform = 'scale(' + scale + ')';
    outer.style.height = (1740 * scale) + 'px';
  }

  function stepState(el, state) {
    el.classList.toggle('active', state === 'active');
    el.classList.toggle('done', state === 'done');
    el.querySelector('.state span').textContent = state === 'done' ? 'Fatto ✓' : state === 'active' ? 'In corso' : 'In coda';
  }

  function updateThread() {
    var vh = window.innerHeight;
    if (mobile.matches) {
      steps.forEach(function (st, i) {
        var r = st.getBoundingClientRect();
        var reached = r.top < vh * .6;
        var next = steps[i + 1] ? steps[i + 1].getBoundingClientRect().top < vh * .6 : false;
        stepState(st, reached ? (next ? 'done' : 'active') : 'wait');
      });
      return;
    }
    var r = thread.getBoundingClientRect();
    var scan = (vh * .55 - r.top) / scale; // y nel sistema del Figma
    var len = 0;
    if (scan >= 1740) len = total;
    else if (scan > 0) {
      for (var i = 0; i < samples.length; i++) { if (samples[i].my >= scan) { len = samples[i].L; break; } }
    }
    wire.style.strokeDashoffset = (total - len).toFixed(1);
    var complete = len >= total - 1;
    var reached = nodeLen.map(function (nl) { return len >= nl - 2; });
    steps.forEach(function (st, i) {
      var state = !reached[i] ? 'wait' : (complete || reached[i + 1]) ? 'done' : 'active';
      stepState(st, state);
    });
    nodes.forEach(function (n, i) {
      n.classList.toggle('on', reached[i]);
      n.classList.toggle('active', i < 4 && reached[i] && !complete && !reached[i + 1]);
    });
    cta.classList.toggle('lit', complete);
  }

  /* ---------- loop ---------- */
  var ticking = false;
  function frame() { ticking = false; updateServices(); updateThread(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function onResize() {
    if (mobile.matches) cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.visibility = ''; });
    layoutThread(); onScroll();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  onResize();

})();
