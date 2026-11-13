/* GEMA — script comuni a tutte le pagine: navbar fissa, transizione verso "Contattaci", moduli */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* =====================================================================
     Navbar fissa: compare quando la barra della hero esce dallo schermo
     (sulla pagina contatti è sempre visibile: data-always).
     ===================================================================== */
  var bar = document.querySelector('.topbar');
  if (bar) {
    var always = bar.hasAttribute('data-always');
    var links = [].slice.call(bar.querySelectorAll('.topbar-links a[href*="#"]'));
    var targets = links.map(function (a) {
      var id = a.getAttribute('href').split('#')[1];
      return id ? document.getElementById(id) : null;
    });
    var ticking = false;
    var update = function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      bar.classList.toggle('show', always || y > 90);
      // sezione attiva
      var mid = window.innerHeight * 0.4, active = -1;
      targets.forEach(function (t, i) {
        if (!t) return;
        var r = t.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) active = i;
      });
      links.forEach(function (a, i) { a.classList.toggle('on', i === active); });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* =====================================================================
     Transizioni tra le pagine: un cerchio blu si apre dal punto del clic,
     mostra una scritta, poi si carica la pagina nuova; lì lo stesso pannello
     (con la stessa scritta) sale e scopre la pagina, che parte sempre dall'alto.
     La scritta viaggia da una pagina all'altra in sessionStorage ("gema-pt").
     ===================================================================== */
  var WORDS = {
    contatti: 'Raccontaci<br><span class="acc">il tuo progetto.</span>',
    analisi: 'Analizziamo<br><span class="acc">il tuo sito.</span>',
    exit: '<span class="cmd">~/gema $ exit</span>Il prossimo sito che trovano<br><span class="acc">può essere il tuo.</span>'
  };
  function store(k, v) { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }

  // Cerchio blu che si apre dal punto (x, y) e mostra una scritta al centro.
  function coverFrom(x, y, wordHtml, done) {
    var r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var cover = document.createElement('div');
    cover.className = 'pt-cover pt-out';
    cover.innerHTML = '<p class="pt-word display">' + wordHtml + '</p>';
    cover.style.clipPath = 'circle(0px at ' + x + 'px ' + y + 'px)';
    document.body.appendChild(cover);
    var anim = cover.animate([
      { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' },
      { clipPath: 'circle(' + Math.ceil(r) + 'px at ' + x + 'px ' + y + 'px)' }
    ], { duration: 750, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    anim.onfinish = function () { cover.classList.add('lit'); done(cover); };
    return cover;
  }

  // Vai a href con la transizione; word è una chiave di WORDS.
  function goTo(href, x, y, word, hold) {
    store('gema-pt', word);
    if (reduce) { window.location.href = href; return; }
    coverFrom(x, y, WORDS[word], function () {
      setTimeout(function () { window.location.href = href; }, hold || 380);
    });
  }
  window.gemaGoTo = goTo;

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-to-contact]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    goTo(a.getAttribute('href'), e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, a.getAttribute('data-to-contact') || 'contatti');
  });

  // Tornando indietro con il pulsante del browser, la pagina può riapparire dalla cache: togli il cerchio.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    [].slice.call(document.querySelectorAll('.pt-out')).forEach(function (n) { n.remove(); });
    var sl = document.querySelector('.slide');
    if (sl && sl.gemaReset) sl.gemaReset();
  });

  // Arrivo con la transizione: si parte dall'alto, il pannello sale e scopre la pagina.
  var inCover = document.querySelector('.pt-cover.pt-in');
  var arriving = read('gema-pt');
  store('gema-pt', null);
  if (inCover) {
    // la classe pt-arrive la mette lo script nel <head>, prima del primo disegno
    if (root.classList.contains('pt-arrive') && arriving && !reduce) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      var w = inCover.querySelector('.pt-word');
      if (WORDS[arriving]) w.innerHTML = WORDS[arriving];
      requestAnimationFrame(function () {
        setTimeout(function () {
          root.classList.add('pt-go');
          setTimeout(function () { inCover.remove(); root.classList.remove('pt-arrive', 'pt-go'); }, 1300);
        }, 250);
      });
    } else {
      root.classList.remove('pt-arrive');
      inCover.remove();
    }
  }

  /* =====================================================================
     Pagine con data-scroll-top (contatti): si aprono SEMPRE dall'inizio,
     anche ricaricando, tornando indietro con il browser o con un #ancora.
     ===================================================================== */
  if (document.body.hasAttribute('data-scroll-top')) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var toTop = function () { window.scrollTo(0, 0); };
    toTop();
    window.addEventListener('load', toTop);
    window.addEventListener('pageshow', toTop);
  }

  /* =====================================================================
     Hero: slider "Scorri per l'analisi gratuita". Trascinando il pallino
     fino in fondo (o cliccandolo, o con Invio) si va ai contatti con
     "Analisi gratuita" già selezionata.
     ===================================================================== */
  var slide = document.querySelector('.slide');
  if (slide) {
    var knob = slide.querySelector('.slide-knob');
    var fill = slide.querySelector('.slide-fill');
    var label = slide.querySelector('.slide-label');
    var href = slide.getAttribute('data-href');
    var dragging = false, startX = 0, pos = 0, max = 0, done = false, moved = false;
    var measure = function () { max = slide.clientWidth - knob.offsetWidth - 12; };
    var setPos = function (p, animate) {
      pos = Math.max(0, Math.min(max, p));
      knob.style.transition = fill.style.transition = label.style.transition = animate ? 'transform .45s cubic-bezier(.16,1,.3,1), width .45s cubic-bezier(.16,1,.3,1), opacity .3s' : 'none';
      knob.style.transform = 'translateX(' + pos + 'px)';
      fill.style.width = (pos + knob.offsetWidth + 12) + 'px';
      label.style.opacity = String(1 - Math.min(1, pos / (max * .6)));
    };
    var finish = function () {
      if (done) return;
      done = true;
      measure(); setPos(max, true);
      slide.classList.add('done');
      var r = knob.getBoundingClientRect();
      setTimeout(function () { goTo(href, r.left + r.width / 2 + (max - pos), r.top + r.height / 2, 'analisi'); }, 260);
    };
    slide.gemaReset = function () { done = false; slide.classList.remove('done'); measure(); setPos(0, false); };
    knob.addEventListener('pointerdown', function (e) {
      if (done) return;
      measure(); dragging = true; moved = false; startX = e.clientX - pos;
      knob.setPointerCapture(e.pointerId);
    });
    knob.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX - pos) > 3) moved = true;
      setPos(e.clientX - startX, false);
    });
    var end = function () {
      if (!dragging) return;
      dragging = false;
      if (!moved || pos > max * .8) finish(); else setPos(0, true);
    };
    knob.addEventListener('pointerup', end);
    knob.addEventListener('pointercancel', function () { dragging = false; setPos(0, true); });
    knob.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); finish(); }
    });
    // clic sulla scritta: stesso effetto
    label.addEventListener('click', finish);
    window.addEventListener('resize', function () { if (!done) { measure(); setPos(0, false); } });
    measure(); setPos(0, false);
  }

  /* =====================================================================
     Modulo contatti. Nota: nessun backend collegato: qui si aggancia
     l'invio vero (es. Formspree o un endpoint del team).
     ===================================================================== */
  var proj = document.querySelector('[data-form="progetto"]');
  if (proj) {
    var chips = [].slice.call(proj.querySelectorAll('.choice .chip'));
    var setChip = function (c, on) {
      c.classList.toggle('on', on); c.setAttribute('aria-pressed', on);
      c.querySelector('.dot').classList.toggle('on', on);
    };
    chips.forEach(function (b) {
      b.addEventListener('click', function () { setChip(b, !b.classList.contains('on')); });
    });
    // Arrivando dallo slider della hero: "Analisi gratuita" già selezionata
    if (arriving === 'analisi' || location.hash === '#analisi') {
      chips.forEach(function (c) { setChip(c, c.hasAttribute('data-analisi')); });
    }
    proj.addEventListener('submit', function (e) {
      e.preventDefault();
      var foot = proj.querySelector('.foot');
      var bad = [].slice.call(proj.querySelectorAll('input[required]')).filter(function (i) { return !i.value || !i.checkValidity(); });
      if (bad.length) { foot.classList.remove('ok'); foot.textContent = 'Mancano nome o email (valida).'; bad[0].focus(); return; }
      foot.classList.add('ok');
      foot.textContent = 'Richiesta inviata ✓ Ti rispondiamo entro 24h.';
      // Dopo l'invio: pannello con la chiusura, poi si torna alla home
      var btn = proj.querySelector('button[type="submit"]').getBoundingClientRect();
      goTo('index.html', btn.left + btn.width / 2, btn.top + btn.height / 2, 'exit', 1900);
    });
  }
})();
