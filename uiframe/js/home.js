/* AD556 Twinkle Your Tale prototype, shared layer. Version v8, built 2026-09-11 12:04. */
(function () {
  'use strict';
  var VERSION = 'v8', STAMP = '2026-09-11 12:04';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var body = document.body;
  if (reduced) body.classList.remove('fx');

  /* ------------------------------------------------ tunables (deck.tune) */
  var T = {
    trailRate: 0.38,      // sparkles per px of cursor travel (0.25 sparse, 0.6 dense)
    trailLife: 0.9,       // seconds
    trailSize: 7,         // px, star radius at birth
    hoverRate: 9,         // sparkles per second while hovering a magical item
    hoverLife: 1.1,
    revealBurst: 14,      // sparkles scattered when a section comes into view
    gravity: 18,          // px/s^2, positive = drift down. small, they float
    colours: ['#F3EEE4', '#E3AC5A', '#FFD98A', '#FFF4DC'],
    preloadLaunch: 500,   // ms before the shooting star leaves
    preloadFlight: 1000,  // ms in the air
    preloadHold: 1100,    // ms the logo sits before the sky fades
    preloadFade: 700
  };

  /* ------------------------------------------------ sparkle canvas */
  var cv = document.getElementById('fx-canvas'), cx = cv && cv.getContext('2d');
  var DPR = 1, W = 0, H = 0, parts = [], running = false, last = 0, fxOn = !reduced && !!cx;
  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  if (cx) { size(); window.addEventListener('resize', size); }

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function spawn(x, y, o) {
    o = o || {};
    var a = rnd(0, Math.PI * 2), sp = o.speed !== undefined ? o.speed : rnd(6, 40);
    parts.push({
      x: x, y: y, vx: Math.cos(a) * sp + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0),
      life: o.life || T.trailLife, age: 0, r: o.size || rnd(T.trailSize * 0.5, T.trailSize),
      rot: rnd(0, Math.PI), spin: rnd(-1.5, 1.5), col: o.col || T.colours[(Math.random() * T.colours.length) | 0],
      tw: rnd(4, 9), ph: rnd(0, 6.28), glow: o.glow !== undefined ? o.glow : 1
    });
    if (parts.length > 900) parts.splice(0, parts.length - 900);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }
  function star(x, y, r, rot, inner) {
    cx.beginPath();
    for (var i = 0; i < 8; i++) {
      var rr = i % 2 ? r * inner : r, an = rot + i * Math.PI / 4;
      var px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr;
      if (i) cx.lineTo(px, py); else cx.moveTo(px, py);
    }
    cx.closePath();
  }
  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.age += dt;
      if (p.age >= p.life) { parts.splice(i, 1); continue; }
      p.vy += T.gravity * dt; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
      var t = p.age / p.life, env = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      var flick = 0.65 + 0.35 * Math.sin(p.ph + p.age * p.tw);
      var a = env * flick, r = p.r * (0.55 + 0.45 * env);
      cx.globalAlpha = a; cx.fillStyle = p.col;
      star(p.x, p.y, r, p.rot, 0.28); cx.fill();
      cx.globalAlpha = a * 0.9; cx.fillStyle = '#fff';
      star(p.x, p.y, r * 0.42, p.rot, 0.3); cx.fill();
    }
    cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
    if (parts.length) requestAnimationFrame(tick); else running = false;
  }

  /* ------------------------------------------------ cursor trail */
  var lx = null, ly = null, carry = 0;
  if (fxOn && finePointer) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (lx === null) { lx = e.clientX; ly = e.clientY; return; }
      var dx = e.clientX - lx, dy = e.clientY - ly, d = Math.hypot(dx, dy);
      carry += d * T.trailRate;
      var n = Math.floor(carry); carry -= n;
      for (var i = 0; i < n && i < 6; i++) {
        var u = Math.random();
        spawn(lx + dx * u + rnd(-4, 4), ly + dy * u + rnd(-4, 4), { speed: rnd(2, 14), vx: -dx * 0.6, vy: -dy * 0.6 + rnd(-8, 4), life: rnd(T.trailLife * 0.6, T.trailLife * 1.3) });
      }
      lx = e.clientX; ly = e.clientY;
    }, { passive: true });
    window.addEventListener('pointerleave', function () { lx = ly = null; });
  }

  /* ------------------------------------------------ hover twinkle: a magical item glints and sheds sparks */
  function edgePoint(r) {
    var per = 2 * (r.width + r.height), u = Math.random() * per;
    if (u < r.width) return [r.left + u, r.top];
    u -= r.width; if (u < r.height) return [r.right, r.top + u];
    u -= r.height; if (u < r.width) return [r.right - u, r.bottom];
    u -= r.width; return [r.left, r.bottom - u];
  }
  var hovering = null, hoverAcc = 0, hoverLast = 0;
  function hoverLoop(now) {
    if (!hovering) return;
    var dt = Math.min(0.05, (now - hoverLast) / 1000); hoverLast = now;
    hoverAcc += dt * T.hoverRate;
    var r = hovering.getBoundingClientRect();
    while (hoverAcc >= 1) {
      hoverAcc -= 1;
      var p = edgePoint(r);
      spawn(p[0] + rnd(-3, 3), p[1] + rnd(-3, 3), { speed: rnd(4, 18), vy: rnd(-14, -4), life: T.hoverLife, size: rnd(3, 6) });
    }
    requestAnimationFrame(hoverLoop);
  }
  function burst(el, n, opts) {
    var r = el.getBoundingClientRect();
    for (var i = 0; i < n; i++) {
      var p = edgePoint(r);
      spawn(p[0], p[1], Object.assign({ speed: rnd(10, 40), vy: rnd(-20, -6), life: rnd(0.7, 1.2), size: rnd(3, 7) }, opts || {}));
    }
  }
  if (fxOn && finePointer) {
    document.addEventListener('pointerover', function (e) {
      var el = e.target.closest && e.target.closest('.twinkle, .btn, .link, .faq-card summary, .nav .links a');
      if (!el || el === hovering) return;
      if (hovering) hovering.classList.remove('is-glint');
      hovering = el; hoverAcc = 0; hoverLast = performance.now();
      burst(el, 6);
      requestAnimationFrame(hoverLoop);
    });
    document.addEventListener('pointerout', function (e) {
      if (!hovering) return;
      var to = e.relatedTarget;
      if (to && hovering.contains(to)) return;
      hovering = null;
    });
  }

  /* ------------------------------------------------ in-view reveals with a scatter of dust */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (fxOn && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        el.classList.add('is-in');
        var r = el.getBoundingClientRect(), n = Math.round(T.revealBurst * Math.min(1, (r.width * r.height) / (900 * 600)) + 4);
        for (var i = 0; i < n; i++) {
          (function (k) {
            setTimeout(function () {
              spawn(r.left + Math.random() * r.width, Math.max(0, r.top) + Math.random() * Math.min(r.height, H - Math.max(0, r.top)),
                { speed: rnd(2, 10), vy: rnd(-22, -8), life: rnd(1.2, 2.2), size: rnd(3, 8), glow: 1 });
            }, k * 45);
          })(i);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------ hero timeline: bg, copy, create bar (Figma motion, 2s once) */
  var lives = document.querySelectorAll('[data-live]');
  function goLive() { lives.forEach(function (el) { el.classList.add('is-live'); }); }
  if (reduced) goLive();

  /* ------------------------------------------------ film: only the clip in view plays */
  var films = Array.prototype.slice.call(document.querySelectorAll('[data-film] video'));
  films.forEach(function (v) { v.muted = true; v.defaultMuted = true; v.setAttribute('muted', ''); });
  function filmVisible(v) {
    var r = v.getBoundingClientRect();
    return r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
  }
  function filmTick() {
    films.forEach(function (v) {
      if (reduced) { if (!v.paused) v.pause(); return; }
      if (filmVisible(v)) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      else if (!v.paused) { v.pause(); v.currentTime = 0; }
    });
  }
  var navs = document.querySelectorAll('.nav, body > .nav-m');
  function navTick() { var on = window.scrollY > 40; navs.forEach(function (n) { n.classList.toggle('is-scrolled', on); }); }
  window.addEventListener('scroll', navTick, { passive: true }); navTick();
  window.addEventListener('scroll', filmTick, { passive: true });
  window.addEventListener('resize', filmTick);
  filmTick();

  /* ------------------------------------------------ nav: mobile menu, currency, inert links */
  var menu = document.getElementById('menu');
  document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden'; }); });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  function closeMenu() { if (!menu) return; menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); body.style.overflow = ''; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); document.querySelectorAll('.currency.open').forEach(function (c) { c.classList.remove('open'); }); } });

  var CUR = { USD: { s: '$', r: 1 }, EUR: { s: '€', r: 0.92 }, GBP: { s: '£', r: 0.79 } };
  var cur = 'USD';
  try { cur = sessionStorage.getItem('tyt:cur') || 'USD'; } catch (e) {}
  function setCur(c) {
    cur = CUR[c] ? c : 'USD';
    try { sessionStorage.setItem('tyt:cur', cur); } catch (e) {}
    document.querySelectorAll('[data-currency-label]').forEach(function (l) { l.textContent = cur; });
    document.querySelectorAll('[data-cur]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-cur') === cur ? 'true' : 'false'); });
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-price')) * CUR[cur].r;
      el.textContent = CUR[cur].s + (el.hasAttribute('data-cents') ? v.toFixed(2) : Math.round(v));
    });
  }
  document.querySelectorAll('[data-currency]').forEach(function (c) {
    c.querySelector('.trigger').addEventListener('click', function (e) {
      e.stopPropagation(); var open = c.classList.toggle('open'); c.querySelector('.trigger').setAttribute('aria-expanded', open);
    });
    c.querySelectorAll('[data-cur]').forEach(function (b) { b.addEventListener('click', function () { setCur(b.getAttribute('data-cur')); c.classList.remove('open'); }); });
  });
  document.addEventListener('click', function () { document.querySelectorAll('.currency.open').forEach(function (c) { c.classList.remove('open'); }); });
  setCur(cur);

  document.querySelectorAll('[data-select]').forEach(function (sel) {
    var label = sel.querySelector('[data-select-label]');
    function toggle(open) { sel.classList.toggle('open', open); sel.setAttribute('aria-expanded', open); }
    sel.addEventListener('click', function (e) {
      e.stopPropagation();
      var opt = e.target.closest('[role=option]');
      if (opt) {
        label.textContent = opt.textContent;
        sel.querySelectorAll('[role=option]').forEach(function (b) { b.setAttribute('aria-selected', b === opt ? 'true' : 'false'); });
        toggle(false); return;
      }
      toggle(!sel.classList.contains('open'));
    });
    sel.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(!sel.classList.contains('open')); } if (e.key === 'Escape') toggle(false); });
  });
  document.addEventListener('click', function () { document.querySelectorAll('[data-select].open').forEach(function (s) { s.classList.remove('open'); s.setAttribute('aria-expanded', 'false'); }); });

  /* FAQ: details, but the open and close animate instead of snapping */
  document.querySelectorAll('.faq-card').forEach(function (d) {
    var sum = d.querySelector('summary'), ans = d.querySelector('.ans');
    if (!sum || !ans) return;
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.classList.contains('busy')) return;
      d.classList.add('busy');
      if (!d.open) {
        d.open = true; ans.style.height = '0px';
        requestAnimationFrame(function () { ans.style.height = ans.scrollHeight + 'px'; });
      } else {
        ans.style.height = ans.scrollHeight + 'px';
        requestAnimationFrame(function () { ans.style.height = '0px'; });
      }
      ans.addEventListener('transitionend', function done() {
        ans.removeEventListener('transitionend', done);
        if (ans.style.height === '0px') d.open = false; else ans.style.height = 'auto';
        d.classList.remove('busy');
      });
    });
  });

  var note = document.getElementById('note'), noteT;
  function say(msg) {
    if (!note) return;
    note.textContent = msg; note.classList.add('show');
    clearTimeout(noteT); noteT = setTimeout(function () { note.classList.remove('show'); }, 2600);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-inert]');
    if (!a) return;
    e.preventDefault();
    say('That page is not in this prototype yet.');
    if (fxOn) burst(a, 10, { speed: rnd(20, 60) });
  });
  var create = document.querySelector('[data-create]');
  if (create) create.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (create.querySelector('input').value || '').trim() || create.querySelector('input').placeholder;
    say('The create flow is not in this prototype yet. It would start a book for ' + name + '.');
    if (fxOn) burst(create.querySelector('.btn'), 16, { speed: rnd(20, 70) });
  });

  /* ------------------------------------------------ mobile stories rail indicator */
  var rail = document.querySelector('[data-rail]'), ind = document.querySelector('[data-indicator]');
  if (rail && ind) {
    var segs = ind.querySelectorAll('i');
    rail.addEventListener('scroll', function () {
      var cards = rail.children, best = 0, bd = 1e9, rl = rail.getBoundingClientRect().left + 24;
      for (var i = 0; i < cards.length; i++) { var d = Math.abs(cards[i].getBoundingClientRect().left - rl); if (d < bd) { bd = d; best = i; } }
      segs.forEach(function (s, i) { s.classList.toggle('on', i === best); });
    }, { passive: true });
  }

  /* ------------------------------------------------ preload: night sky, a shooting star lands on the i, the logo pulses in */
  var pre = document.getElementById('preload');
  var preDone = Promise.resolve();
  var arrived = /brush-incoming/.test(document.documentElement.className);
  if (pre && (arrived || reduced || /nopreload/.test(location.search))) { pre.remove(); pre = null; }
  if (pre) preDone = new Promise(function (resolve) {
    var sky = pre.querySelector('.sky'), sg = sky.getContext('2d'), SW = 0, SH = 0, SD = 1;
    var mark = pre.querySelector('.mark'), svg = mark.querySelector('svg'), paths = svg.querySelectorAll('path'), tittle = null;
    paths.forEach(function (p, i) { p.style.setProperty('--i', i); if ((p.getAttribute('fill') || '').toUpperCase() === '#E3AC5A') tittle = p; });
    if (tittle) tittle.classList.add('tittle');
    function sizeSky() { SD = Math.min(2, window.devicePixelRatio || 1); SW = window.innerWidth; SH = window.innerHeight; sky.width = SW * SD; sky.height = SH * SD; sg.setTransform(SD, 0, 0, SD, 0, 0); }
    sizeSky(); window.addEventListener('resize', sizeSky);
    var stars = [];
    for (var i = 0; i < 170; i++) stars.push({ x: Math.random(), y: Math.random(), r: 0.4 + Math.pow(Math.random(), 2.5) * 1.6, tw: rnd(1.5, 5), ph: rnd(0, 6.28), gold: Math.random() < 0.18 });
    // where the i's star sits, in viewport px
    function target() { var b = mark.getBoundingClientRect(); return [b.left + b.width * (47.2572 / 280.016), b.top + b.height * (7.31 / 44.333)]; }
    var t0 = performance.now(), launched = false, landed = false, trail = [], comet = null, rings = [], dust = [], alive = true;
    function bez(a, b, c, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]; }
    function frame(now) {
      if (!alive) return;
      var e = now - t0, dt = 1 / 60;
      sg.clearRect(0, 0, SW, SH);
      // the sky
      stars.forEach(function (s) {
        var a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.ph + e / 1000 * s.tw));
        sg.globalAlpha = a * 0.9; sg.fillStyle = s.gold ? '#E3AC5A' : '#F3EEE4';
        sg.beginPath(); sg.arc(s.x * SW, s.y * SH, s.r, 0, 6.2832); sg.fill();
      });
      sg.globalAlpha = 1;
      // the shooting star
      if (e > T.preloadLaunch && !landed) {
        var tg = target(), A = [-0.08 * SW, SH * 0.12], C = tg, B = [SW * 0.42, -SH * 0.02];
        var t = Math.min(1, (e - T.preloadLaunch) / T.preloadFlight), k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var p = bez(A, B, C, k); comet = p;
        trail.push({ x: p[0], y: p[1], a: 1 }); if (trail.length > 26) trail.shift();
        if (Math.random() < 0.6) dust.push({ x: p[0] + rnd(-6, 6), y: p[1] + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-10, 30), a: 1, r: rnd(1, 2.6) });
        if (t >= 1) { landed = true; land(); }
      }
      sg.globalCompositeOperation = 'lighter';
      if (trail.length > 1) {
        for (var i = 1; i < trail.length; i++) {
          var f = i / trail.length; sg.strokeStyle = 'rgba(255,236,196,' + (f * 0.85).toFixed(3) + ')'; sg.lineWidth = 0.6 + f * 3.2; sg.lineCap = 'round';
          sg.beginPath(); sg.moveTo(trail[i - 1].x, trail[i - 1].y); sg.lineTo(trail[i].x, trail[i].y); sg.stroke();
        }
        if (!landed) trail.forEach(function (q) { q.a *= 0.9; }); else trail.shift();
      }
      if (comet && !landed) { var g = sg.createRadialGradient(comet[0], comet[1], 0, comet[0], comet[1], 14); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,236,196,.9)'); g.addColorStop(1, 'rgba(227,172,90,0)'); sg.fillStyle = g; sg.beginPath(); sg.arc(comet[0], comet[1], 14, 0, 6.2832); sg.fill(); }
      for (var d = dust.length - 1; d >= 0; d--) { var q = dust[d]; q.x += q.vx * dt; q.y += q.vy * dt; q.a -= 0.02; if (q.a <= 0) { dust.splice(d, 1); continue; } sg.globalAlpha = q.a; sg.fillStyle = '#FFE9C2'; sg.beginPath(); sg.arc(q.x, q.y, q.r * q.a, 0, 6.2832); sg.fill(); }
      sg.globalAlpha = 1;
      for (var r = rings.length - 1; r >= 0; r--) { var rg = rings[r]; rg.r += rg.v * dt; rg.a -= rg.decay * dt; if (rg.a <= 0) { rings.splice(r, 1); continue; } sg.strokeStyle = 'rgba(227,172,90,' + rg.a.toFixed(3) + ')'; sg.lineWidth = rg.w * rg.a + 0.5; sg.beginPath(); sg.arc(rg.x, rg.y, rg.r, 0, 6.2832); sg.stroke(); }
      sg.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }
    function land() {
      var tg = target();
      rings.push({ x: tg[0], y: tg[1], r: 4, v: 420, a: 0.9, w: 3, decay: 1.3 });
      rings.push({ x: tg[0], y: tg[1], r: 2, v: 260, a: 0.7, w: 2, decay: 0.9 });
      setTimeout(function () { rings.push({ x: tg[0], y: tg[1], r: 2, v: 300, a: 0.6, w: 2, decay: 1.1 }); }, 420);
      for (var i = 0; i < 26; i++) dust.push({ x: tg[0], y: tg[1], vx: rnd(-160, 160), vy: rnd(-160, 120), a: 1, r: rnd(1, 3) });
      if (fxOn) for (var k = 0; k < 18; k++) spawn(tg[0] + rnd(-4, 4), tg[1] + rnd(-4, 4), { speed: rnd(30, 120), life: rnd(0.8, 1.6), size: rnd(3, 8) });
      pre.classList.add('reveal');
      setTimeout(function () {
        pre.classList.add('out');
        setTimeout(function () { alive = false; pre.remove(); resolve(); }, T.preloadFade + 50);
      }, T.preloadHold + 900);
    }
    requestAnimationFrame(frame);
  });

  /* ------------------------------------------------ brush transition, wired on load */
  var brush = null;
  function wireBrush() {
    if (!window.BrushTransition) { goLive(); return; }
    brush = window.BrushTransition.create({ ground: 'dark', seed: 20260911, duration: 1.15 });
    brush.resume().then(function (resumed) {
      // the hero timeline starts once the strokes have peeled off, or once the preload has cleared on a cold load
      if (resumed) setTimeout(goLive, 60); else preDone.then(goLive);
    });
    brush.link('a[href]:not([target]):not([download]):not([data-no-transition]):not([data-inert])');
  }
  if (document.readyState === 'complete') wireBrush(); else window.addEventListener('load', wireBrush);
  if (!window.BrushTransition && document.readyState === 'complete') preDone.then(goLive);

  /* ------------------------------------------------ diagnostics */
  window.deck = {
    version: VERSION, built: STAMP, page: body.getAttribute('data-page'),
    fx: function (on) { if (on === undefined) return fxOn; fxOn = !!on; body.classList.toggle('fx', fxOn); return fxOn; },
    tune: function (o) { Object.assign(T, o || {}); return T; },
    tunables: T,
    sparkles: function () { return parts.length; },
    burst: function (sel, n) { var el = document.querySelector(sel); if (el) burst(el, n || 20); },
    films: function () { return films.map(function (v) { return { src: (v.currentSrc || '').split('/').pop(), paused: v.paused, t: +v.currentTime.toFixed(2), ready: v.readyState, w: v.videoWidth }; }); },
    brush: function () { return brush; },
    currency: setCur
  };
  console.log('%cAD556 Twinkle Your Tale ' + VERSION + ' (' + STAMP + '). Type deck for diagnostics.', 'color:#E3AC5A');
})();

/*!
 * Brush page transition, v2
 * Built for Twinkle Your Tale (AD556) by Automa Digital.
 * No dependencies. Works as an ES module or as a plain <script> (window.BrushTransition).
 *
 * Paints the viewport out with layered dry brush strokes, swaps the page,
 * then peels the strokes off the other side.
 *
 * v2 over v1: the paint itself. Each stroke now carries a bristle profile across its
 * height (dense centre, frayed edges that break into individual hairs), dry skips that
 * open up along the stroke as the brush runs out, pooled pigment along the ragged edges,
 * spatter, a slight bow so no stroke is dead straight, a paper grain multiplied into the
 * pigment, and a head mask with rounded finger tips and the odd drip. Motion gained a
 * per stroke speed jitter and a soft settle. The API, the seed handover and the coverage
 * proof are unchanged from v1.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BrushTransition = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var VERSION = "2.0.0";
  var STORE = "brush-transition:incoming", PLATE = "brush-transition:plate";

  var DEFAULTS = {
    bands: 6,               // number of strokes. 5 to 7 reads best
    duration: 1.2,          // multiplier on the base 1,410ms
    cover: 640,             // ms, before the multiplier
    hold: 130,
    reveal: 640,
    stagger: 0.10,          // 0 = all strokes move together, 0.14 = heavily staggered
    jitter: 0.08,           // per stroke speed variation, 0 = metronome, 0.15 = lively
    feather: 210,           // px of bristled edge at the head of each stroke
    grain: 0,               // paper grain strength. 0 = solid paint (default: the strokes must hide the page), 0.16 = dry
    skips: false,           // dry skips punched through the body. off by default for the same reason
    zIndex: 2147483000,
    seed: 20260908,         // fixed seed = the same strokes every time. null = random
    ground: null,           // 'dark' | 'light' | function returning one of those
    palette: {
      onDark:  { fill: "#F3EEE4", shade: "#DED5C2", dry: "#A9732A", pool: "#C9B993" },
      onLight: { fill: "#0C1428", shade: "#070C18", dry: "#F3EEE4", pool: "#040810" }
    },
    respectReducedMotion: true
  };

  /* ---------------------------------------------------------------- maths */
  function rng(s) { var x = s >>> 0 || 1; return function () {
    x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }

  function catmull(pts, close) {
    var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
         + " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
         + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d + (close ? "Z" : "");
  }
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var easeCover = function (t) { return 1 - Math.pow(1 - t, 2.3); };
  var easeReveal = function (t) { return Math.pow(t, 2.1); };

  /* stroke body: ragged along its length, bowed a touch, running off canvas at both ends */
  function bandPath(y0, y1, r, ampF, bow) {
    var N = 17, X0 = -300, W = 1600, top = [], bot = [], amp = (y1 - y0) * ampF;
    for (var i = 0; i <= N; i++) {
      var t = i / N, x = X0 + t * W;
      var taper = Math.pow(Math.sin(Math.PI * t), 0.18);
      var h2 = (y1 - y0) / 2, mid = (y0 + y1) / 2 + bow * Math.sin(Math.PI * t);
      top.push([x, mid - h2 * taper + (r() - 0.5) * amp * 1.7]);
      bot.push([x, mid + h2 * taper + (r() - 0.5) * amp * 1.7]);
    }
    bot.reverse();
    return catmull(top.concat(bot), true);
  }
  function skips(len, edge, r) {
    var da = "", x = 0;
    while (x < len + 40) {
      var d1 = (18 + r() * 150) * (1 - edge * 0.5) + 6, g = (3 + r() * 40) * (0.35 + edge * 1.5);
      da += (da ? " " : "") + d1.toFixed(0) + " " + g.toFixed(0); x += d1 + g;
    }
    return da;
  }
  /* hairs at the edges of the stroke, where a flat brush frays. denser and longer than v1 */
  function bristles(y0, y1, r) {
    var mid = (y0 + y1) / 2, half = (y1 - y0) / 2, out = [];
    for (var k = 0; k < 96; k++) {
      var side = k % 2 ? 1 : -1, u = 0.46 + 0.54 * Math.pow(r(), 0.55);
      var y = mid + side * half * u, edge = clamp((u - 0.46) / 0.54, 0, 1);
      var x0 = -320 + r() * 1400, len = (200 + r() * 900) * (1 - edge * 0.3), pts = [];
      for (var j = 0; j <= 8; j++) {
        var t = j / 8;
        pts.push([x0 + t * len, y + Math.sin(t * 2.6 + k) * half * 0.03 + (r() - 0.5) * half * 0.04]);
      }
      out.push('<path d="' + catmull(pts, false) + '" fill="none" stroke="%F1%" stroke-opacity="'
        + ((0.7 - edge * 0.55) * (0.4 + r() * 0.6)).toFixed(3) + '" stroke-width="'
        + ((0.5 + r() * 2.6) * (1 - edge * 0.45)).toFixed(2)
        + '" stroke-linecap="round" stroke-dasharray="' + skips(len, edge, r) + '"/>');
    }
    return out.join("");
  }
  /* dry pigment inside the body, where the brush ran out. the tail carries more of it */
  function streaks(y0, y1, r, dir) {
    var out = "";
    for (var i = 0; i < 26; i++) {
      var y = y0 + (y1 - y0) * (0.05 + 0.9 * r());
      var x0 = -300 + r() * 900, len = 380 + r() * 1100, pts = [];
      for (var j = 0; j <= 8; j++) { var t = j / 8; pts.push([x0 + t * len, y + (r() - 0.5) * (y1 - y0) * 0.05]); }
      out += '<path d="' + catmull(pts, false) + '" fill="none" stroke="url(#' + (dir > 0 ? "dryR" : "dryL")
        + ')" stroke-opacity="' + (0.08 + r() * 0.18).toFixed(3) + '" stroke-width="'
        + (0.6 + r() * 3.6).toFixed(1) + '" stroke-linecap="round" stroke-dasharray="' + skips(len, 0.35, r) + '"/>';
    }
    return out;
  }
  /* skips punched through the body: gaps that open up towards the tail of the stroke */
  function skipMask(y0, y1, r, dir) {
    var out = "", H = y1 - y0;
    for (var i = 0; i < 26; i++) {
      var y = y0 + H * (0.08 + 0.84 * r());
      var tailness = r();                            // where along the stroke the gap sits
      var xs = dir > 0 ? -300 + tailness * 1300 : 1300 - tailness * 1300;
      var len = 60 + r() * 380, w = 0.4 + Math.pow(r(), 1.6) * 1.8;
      out += '<path d="M' + xs.toFixed(0) + ',' + y.toFixed(1) + ' l' + (dir > 0 ? len : -len).toFixed(0) + ',' + ((r() - 0.5) * 3).toFixed(1)
        + '" stroke="#000" stroke-opacity="' + (0.18 + tailness * 0.42).toFixed(2) + '" stroke-width="' + w.toFixed(2)
        + '" stroke-linecap="round" stroke-dasharray="' + skips(len, 0.6, r) + '"/>';
    }
    return out;
  }
  /* pigment spatter around the edges */
  function spatter(y0, y1, r) {
    var out = "", mid = (y0 + y1) / 2, half = (y1 - y0) / 2;
    for (var i = 0; i < 48; i++) {
      var side = i % 2 ? 1 : -1, y = mid + side * half * (0.92 + r() * 0.26), x = -300 + r() * 1600;
      out += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(1) + '" r="' + (0.4 + Math.pow(r(), 2) * 2.4).toFixed(2)
        + '" fill="%F1%" fill-opacity="' + (0.25 + r() * 0.6).toFixed(2) + '"/>';
    }
    return out;
  }

  /* ------------------------------------------------------------- instance */
  function create(userOpts) {
    var o = {};
    for (var k in DEFAULTS) o[k] = DEFAULTS[k];
    for (var k2 in (userOpts || {})) o[k2] = userOpts[k2];
    o.palette = Object.assign({}, DEFAULTS.palette, (userOpts || {}).palette || {});

    var FEATHER = o.feather, BANDS = o.bands;
    var seed = o.seed === null ? (Math.random() * 1e9) | 0 : o.seed;

    var cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none;"
      + "z-index:" + o.zIndex + ";visibility:hidden";
    var cx = cv.getContext("2d");
    var CW = 0, CH = 0, DPR = 1;
    var defs = [], art = { dark: [], light: [] }, artJobs = {}, masks = [], tmps = [], grainC = null;
    var ready = null, busy = false, plate = null;

    function reduced() {
      return o.respectReducedMotion && window.matchMedia
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    /* ------- ground detection: which colourway the strokes should use ----- */
    function autoGround() {
      var el = document.body || document.documentElement;
      var c = getComputedStyle(el).backgroundColor || "";
      var m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return "dark";
      var p = m[1].split(",").map(parseFloat);
      if (p.length > 3 && p[3] === 0) {
        var c2 = getComputedStyle(document.documentElement).backgroundColor || "";
        var m2 = c2.match(/rgba?\(([^)]+)\)/); if (m2) p = m2[1].split(",").map(parseFloat);
      }
      var lum = (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
      return lum > 0.5 ? "light" : "dark";
    }
    function groundNow() {
      if (typeof o.ground === "function") return o.ground() === "light" ? "light" : "dark";
      if (o.ground === "light" || o.ground === "dark") return o.ground;
      return autoGround();
    }
    // strokes must contrast with the page they cover, so a light page gets ink strokes
    function keyFor(g) { return g === "light" ? "light" : "dark"; }
    function coverColour(g) { return g === "light" ? o.palette.onLight.fill : o.palette.onDark.fill; }

    /* ---------------------------- artwork ------------------------------- */
    function rasterise(svg, w, h) {
      return new Promise(function (res) {
        var img = new Image();
        img.onload = function () {
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var g = c.getContext("2d"); g.drawImage(img, 0, 0, w, h);
          if (o.grain > 0 && grainC) {              // paper grain, multiplied into the pigment's alpha
            g.globalCompositeOperation = "destination-in";
            g.globalAlpha = 1;
            g.drawImage(grainC, 0, 0, w, h);
            g.globalCompositeOperation = "source-over";
          }
          res(c);
        };
        img.onerror = function () { res(null); };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      });
    }
    /* a tile of speckle: mostly opaque, with a scatter of soft pinholes and a faint fibre lay */
    function grainTile(r) {
      var S = 256, c = document.createElement("canvas"); c.width = S; c.height = S;
      var g = c.getContext("2d");
      g.fillStyle = "rgba(0,0,0,1)"; g.fillRect(0, 0, S, S);
      g.globalCompositeOperation = "destination-out";
      var n = Math.round(1400 * o.grain);
      for (var i = 0; i < n; i++) {
        var x = r() * S, y = r() * S, rad = 0.3 + Math.pow(r(), 2.4) * 1.1;
        g.globalAlpha = 0.08 + r() * 0.3;
        g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill();
      }
      for (var j = 0; j < Math.round(240 * o.grain); j++) {   // horizontal fibres
        g.globalAlpha = 0.05 + r() * 0.16;
        g.fillRect(r() * S, r() * S, 4 + r() * 24, 0.6 + r() * 0.8);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
      return c;
    }
    function edgeMask(bh, r) {
      var m = document.createElement("canvas"); m.width = FEATHER; m.height = bh;
      var mg = m.getContext("2d");
      var OP0 = 58, rows = Math.max(100, Math.round(bh / 1.5)), sp = bh / rows;
      var a1 = r() * 6.28, a2 = r() * 6.28, a3 = r() * 6.28, f1 = 1.1 + r() * 1.6, f2 = 3.4 + r() * 3.2, f3 = 9 + r() * 6;
      var wob = function (y) { return Math.sin(y / bh * 6.28 * f1 + a1) * 19 + Math.sin(y / bh * 6.28 * f2 + a2) * 9 + Math.sin(y / bh * 6.28 * f3 + a3) * 3; };
      mg.fillStyle = "#fff";
      for (var i = 0; i < rows; i++) { var yy = (i + 0.5) * sp; mg.fillRect(0, yy - sp * 0.6, OP0 + wob(yy), sp * 1.4); }
      for (var j = 0; j < rows; j++) {                         // the fingers of paint that run ahead
        var eb = Math.abs((j / rows - 0.5) * 2);
        if (r() < 0.18 * eb + 0.06) continue;
        var y = (j + 0.5) * sp, OP = OP0 + wob(y);
        var reachPx = (6 + Math.pow(r(), 1.5) * 60) * (1 - eb * 0.35);
        var th = sp * (0.9 + Math.pow(r(), 2) * 3.4);
        var gr = mg.createLinearGradient(OP - 6, 0, OP + reachPx, 0);
        gr.addColorStop(0, "rgba(255,255,255,1)");
        gr.addColorStop(Math.min(0.75, 0.25 + r() * 0.45), "rgba(255,255,255," + (0.75 + r() * 0.25).toFixed(2) + ")");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        mg.fillStyle = gr;
        var fy = y - th / 2 + (r() - 0.5) * sp * 0.8;
        mg.fillRect(OP - 6, fy, reachPx + 6, th);
        mg.beginPath(); mg.arc(OP + reachPx * (0.55 + r() * 0.3), fy + th / 2, th * 0.55, 0, 6.2832); mg.fill();   // rounded tip
      }
      for (var k = 0; k < 26; k++) {                           // the few hairs that run ahead of the paint
        var hy = r() * bh, len = 40 + Math.pow(r(), 1.4) * 110, ht = 0.7 + r() * 1.8, HOP = OP0 + wob(hy);
        var g2 = mg.createLinearGradient(HOP, 0, HOP + len, 0);
        g2.addColorStop(0, "rgba(255,255,255," + (0.55 + r() * 0.45).toFixed(2) + ")");
        g2.addColorStop(1, "rgba(255,255,255,0)");
        mg.fillStyle = g2; mg.fillRect(HOP, hy, len, ht);
      }
      for (var d = 0; d < 5; d++) {                            // a drip or two, where the paint was heavy
        var dy = r() * bh, dl = 8 + r() * 30, dx = OP0 + wob(dy) - 14 - r() * 20;
        mg.fillStyle = "rgba(255,255,255," + (0.5 + r() * 0.5).toFixed(2) + ")";
        mg.fillRect(dx, dy, 2 + r() * 2, dl);
        mg.beginPath(); mg.arc(dx + 1.5, dy + dl, 2 + r() * 1.5, 0, 6.2832); mg.fill();
      }
      return m;
    }

    function build() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      CW = window.innerWidth; CH = window.innerHeight;
      cv.width = CW * DPR; cv.height = CH * DPR;
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);

      var step = 1000 / BANDS, r = rng(seed), INSET = 0.155, AMPF = 0.062, ROT = 1.2;
      grainC = grainTile(rng(seed ^ 0x5bd1e995));
      var cs = [], hs = [], rots = [], bows = [], speeds = [];
      for (var i = 0; i < BANDS; i++) {
        cs.push(step * (i + 0.5) + (r() - 0.5) * step * 0.14);
        hs.push(step * (1.25 + r() * 0.40));
        rots.push((r() - 0.5) * 2 * ROT);
        bows.push((r() - 0.5) * step * 0.05);
        speeds.push(1 + (r() - 0.5) * 2 * o.jitter);
      }
      var ext = function (i) { return (i === 0 || i === BANDS - 1) ? 240 : 0; };
      // guaranteed core half height once raggedness, bow and rotation are subtracted
      var reach = function (i) {
        var H = 2 * hs[i] + ext(i), coreH = H * (1 - 2 * INSET);
        return coreH / 2 - (0.85 * AMPF * coreH + Math.abs(bows[i]) + 800 * Math.tan(Math.abs(rots[i]) * Math.PI / 180) + 6);
      };
      for (var pass = 0; pass < 80; pass++) {       // grow strokes until they provably overlap
        var ok = true;
        for (var j = 1; j < BANDS; j++)
          if (reach(j - 1) + reach(j) < cs[j] - cs[j - 1] + 2) { hs[j - 1] += 5; hs[j] += 5; ok = false; }
        if (cs[0] - reach(0) - ext(0) / 2 > -6) { hs[0] += 5; ok = false; }
        if (cs[BANDS - 1] + reach(BANDS - 1) + ext(BANDS - 1) / 2 < 1006) { hs[BANDS - 1] += 5; ok = false; }
        if (ok) break;
      }

      var sx = CW / 1000, sy = CH / 1000;
      var VX0 = -40, VW = 1060 + FEATHER / sx;   // only the visible window is rasterised
      defs = [];
      for (var b = 0; b < BANDS; b++) {
        var dir = (b % 2 ? -1 : 1), c = cs[b], hh = hs[b];
        var y0 = c - hh, y1 = c + hh;
        if (b === 0) y0 -= 240;
        if (b === BANDS - 1) y1 += 240;
        var core = bandPath(y0 + (y1 - y0) * INSET, y1 - (y1 - y0) * INSET, r, AMPF, bows[b]);
        var shade = bandPath(y0 + (y1 - y0) * 0.55, y1 - (y1 - y0) * 0.24, r, 0.13, bows[b]);
        var inner = '<clipPath id="cc"><path d="' + core + '"/></clipPath>'
          + '<mask id="sk" maskUnits="userSpaceOnUse" x="-400" y="' + (y0 - 50).toFixed(0) + '" width="2000" height="' + (y1 - y0 + 100).toFixed(0) + '">'
          + '<rect x="-400" y="' + (y0 - 50).toFixed(0) + '" width="2000" height="' + (y1 - y0 + 100).toFixed(0) + '" fill="#fff"/>'
          + (o.skips ? skipMask(y0 + (y1 - y0) * INSET, y1 - (y1 - y0) * INSET, r, dir) : "") + '</mask>'
          + '<g transform="rotate(' + rots[b].toFixed(2) + ' 500 ' + c.toFixed(1) + ')">'
          + '<g mask="url(#sk)"><path d="' + core + '" fill="%F1%"/></g>' + bristles(y0, y1, r) + spatter(y0 + (y1 - y0) * INSET, y1 - (y1 - y0) * INSET, r)
          + '<g mask="url(#sk)"><g clip-path="url(#cc)"><path d="' + shade + '" fill="%F2%" opacity=".3"/>'
          + '<path d="' + core + '" fill="none" stroke="%F3%" stroke-opacity=".28" stroke-width="7"/>'   // pooled pigment along the ragged edge
          + streaks(y0 + (y1 - y0) * 0.18, y1 - (y1 - y0) * 0.18, r, dir) + '</g></g></g>';
        defs.push({
          dir: dir, y0: y0, y1: y1, inner: inner, speed: speeds[b],
          px: Math.round(VW * sx), py: Math.max(2, Math.round((y1 - y0) * sy)),
          dx: Math.round(VX0 * sx), dy: Math.round(y0 * sy),
          vx0: VX0, vw: VW, seed: (r() * 1e9) | 0
        });
      }
      masks = defs.map(function (d) { return edgeMask(d.py, rng(d.seed)); });
      tmps = defs.map(function (d) {
        var c2 = document.createElement("canvas"); c2.width = FEATHER; c2.height = d.py; return c2;
      });

      art = { dark: [], light: [] }; artJobs = {};
      var first = groundNow();
      ready = ensure(first);
      var other = first === "dark" ? "light" : "dark";
      var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 400); };
      idle(function () { ensure(other); });
      return ready;
    }

    /* one colourway, built on demand and cached */
    function ensure(key) {
      if (artJobs[key]) return artJobs[key];
      var w = key === "light" ? o.palette.onLight : o.palette.onDark, jobs = [];
      art[key] = [];
      (function () {
        defs.forEach(function (d, idx) {
          var body = d.inner.split("%F1%").join(w.fill).split("%F2%").join(w.shade).split("%F3%").join(w.pool || w.shade);
          var cut = body.indexOf("</mask>") + 7;
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + d.px + '" height="' + d.py
            + '" viewBox="' + d.vx0 + ' ' + d.y0.toFixed(1) + ' ' + d.vw.toFixed(1) + ' ' + (d.y1 - d.y0).toFixed(1)
            + '" preserveAspectRatio="none">'                       // must be none, or the strokes squash
            + '<defs><linearGradient id="dryR" gradientUnits="userSpaceOnUse" x1="-300" x2="1300">'
            + '<stop offset="0" stop-color="' + w.dry + '" stop-opacity=".95"/>'
            + '<stop offset=".62" stop-color="' + w.dry + '" stop-opacity=".6"/>'
            + '<stop offset="1" stop-color="' + w.dry + '" stop-opacity=".26"/></linearGradient>'
            + '<linearGradient id="dryL" gradientUnits="userSpaceOnUse" x1="1300" x2="-300">'
            + '<stop offset="0" stop-color="' + w.dry + '" stop-opacity=".95"/>'
            + '<stop offset=".62" stop-color="' + w.dry + '" stop-opacity=".6"/>'
            + '<stop offset="1" stop-color="' + w.dry + '" stop-opacity=".26"/></linearGradient>'
            + body.slice(0, cut) + "</defs>"
            + body.slice(cut) + "</svg>";
          jobs.push(rasterise(svg, d.px, d.py).then(function (c3) { art[key][idx] = c3; }));
        });
      })();
      artJobs[key] = Promise.all(jobs);
      return artJobs[key];
    }

    /* ---------------------------- painting ------------------------------ */
    function feather(i, a, d, srcX) {
      var t = tmps[i], g = t.getContext("2d");
      g.clearRect(0, 0, FEATHER, d.py);
      g.drawImage(a, srcX, 0, FEATHER, d.py, 0, 0, FEATHER, d.py);
      g.globalCompositeOperation = "destination-in";
      g.drawImage(masks[i], 0, 0);
      g.globalCompositeOperation = "source-over";
      return t;
    }
    function paint(phase, p, key) {
      cx.clearRect(0, 0, CW, CH);
      var S = o.stagger, span = 1 - S * (BANDS - 1);
      defs.forEach(function (d, i) {
        var a = art[key][i]; if (!a) return;
        var t = clamp((p - i * S) / span * d.speed, 0, 1);
        var E = Math.round((phase === "cover" ? easeCover(t) : easeReveal(t)) * (CW + FEATHER * 2) - FEATHER);
        cx.save();
        if (d.dir < 0) { cx.translate(CW, 0); cx.scale(-1, 1); }
        if (phase === "cover") {
          cx.save(); cx.beginPath(); cx.rect(0, d.dy, Math.max(0, E - FEATHER + 1), d.py); cx.clip();
          cx.drawImage(a, d.dx, d.dy); cx.restore();
          if (E > 0 && E - FEATHER < CW) {
            var s1 = Math.round(Math.max(0, Math.min(a.width - FEATHER, (E - FEATHER) - d.dx)));
            cx.drawImage(feather(i, a, d, s1), d.dx + s1, d.dy);
          }
        } else {
          cx.save(); cx.beginPath(); cx.rect(E + FEATHER - 1, d.dy, CW + 2, d.py); cx.clip();
          cx.drawImage(a, d.dx, d.dy); cx.restore();
          if (E + FEATHER > 0 && E < CW) {
            var s2 = Math.round(Math.max(0, Math.min(a.width - FEATHER, E - d.dx)));
            var sl = feather(i, a, d, s2);
            cx.save(); cx.translate(d.dx + s2 + FEATHER, 0); cx.scale(-1, 1); cx.drawImage(sl, 0, d.dy); cx.restore();
          }
        }
        cx.restore();
      });
    }
    function animate(phase, key, ms) {
      return new Promise(function (res) {
        var t0 = performance.now();
        (function tick(now) {
          var e = now - t0;
          if (e < ms) { paint(phase, e / ms, key); requestAnimationFrame(tick); }
          else { paint(phase, 1, key); res(); }
        })(t0);
      });
    }

    /* solid plate: shown instantly so an incoming page never flashes */
    function showPlate(colour) {
      if (!plate) {
        plate = document.createElement("div");
        plate.setAttribute("aria-hidden", "true");
        plate.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:" + (o.zIndex - 1);
      }
      plate.style.background = colour;
      if (!plate.parentNode) document.documentElement.appendChild(plate);
    }
    function hidePlate() { if (plate && plate.parentNode) plate.parentNode.removeChild(plate); }

    function mount() { if (!cv.parentNode) document.documentElement.appendChild(cv); }

    /* ------------------------------- api -------------------------------- */
    var api = {
      version: VERSION,
      canvas: cv,

      ready: function (g) { return ensure(keyFor(g || groundNow())); },

      cover: function (opts) {
        var g = (opts && opts.ground) || groundNow(), key = keyFor(g);
        if (reduced()) { showPlate(coverColour(g)); return Promise.resolve(g); }
        mount();
        return ensure(key).then(function () {
          cv.style.visibility = "visible";
          return animate("cover", key, o.cover * o.duration).then(function () {
            showPlate(coverColour(g));        // holds the cover if the DOM swap takes a moment
            return g;
          });
        });
      },

      reveal: function (opts) {
        var g = (opts && opts.ground) || groundNow(), key = keyFor(g);
        if (reduced()) { hidePlate(); return Promise.resolve(); }
        mount();
        return ensure(key).then(function () {
          cv.style.visibility = "visible";
          paint("reveal", 0, key);
          if (opts && opts.before) opts.before();   // the incoming page may unhide itself here, under full strokes
          hidePlate();
          return animate("reveal", key, o.reveal * o.duration).then(function () {
            cv.style.visibility = "hidden";
            cx.clearRect(0, 0, CW, CH);
          });
        });
      },

      /* cover, run your swap, hold, reveal. swap may return a promise */
      run: function (swap, opts) {
        if (busy) return Promise.resolve();
        busy = true;
        if (reduced()) {
          return Promise.resolve(swap && swap()).then(function () { busy = false; });
        }
        var g = (opts && opts.ground) || groundNow();
        return api.cover({ ground: g })
          .then(function () { return swap && swap(); })
          .then(function () { return new Promise(function (r2) { setTimeout(r2, o.hold * o.duration); }); })
          .then(function () { return api.reveal({ ground: g }); })
          .then(function () { busy = false; })
          .catch(function (e) { busy = false; hidePlate(); cv.style.visibility = "hidden"; throw e; });
      },

      /* multi page sites: cover, hand the ground and seed to the next page, then navigate */
      go: function (url, opts) {
        if (reduced()) { location.href = url; return Promise.resolve(); }
        if (busy) return Promise.resolve();
        busy = true;
        var g = (opts && opts.ground) || groundNow();
        return api.cover({ ground: g }).then(function () {
          try {
            sessionStorage.setItem(STORE, JSON.stringify({ ground: g, seed: seed, at: Date.now() }));
            // the last frame, strokes over the plate, so the next page's first paint is pixel identical
            var snap = document.createElement("canvas"); snap.width = cv.width; snap.height = cv.height;
            var sg = snap.getContext("2d"); sg.fillStyle = coverColour(g); sg.fillRect(0, 0, snap.width, snap.height); sg.drawImage(cv, 0, 0);
            sessionStorage.setItem(PLATE, snap.toDataURL("image/jpeg", 0.82));
          } catch (e) { try { sessionStorage.removeItem(PLATE); } catch (e2) {} }
          location.href = url;
        });
      },

      /* call on the incoming page: if we arrived mid transition, peel the strokes off */
      resume: function () {
        var raw = null;
        try { raw = sessionStorage.getItem(STORE); sessionStorage.removeItem(STORE); sessionStorage.removeItem(PLATE); } catch (e) {}
        if (!raw) return Promise.resolve(false);
        var s; try { s = JSON.parse(raw); } catch (e) { return Promise.resolve(false); }
        if (!s || Date.now() - s.at > 8000) return Promise.resolve(false);
        if (s.seed !== seed) { seed = s.seed; build(); }
        // the head script already painted the handover frame; only fall back to a plate without it
        var held = /brush-incoming/.test(document.documentElement.className);
        if (!held) showPlate(coverColour(s.ground));
        var unhide = function () {
          var h = document.documentElement;
          h.className = h.className.replace(/\s*brush-incoming/, ""); h.style.background = "";
        };
        if (reduced()) { unhide(); hidePlate(); return Promise.resolve(true); }
        return api.reveal({ ground: s.ground, before: unhide }).then(function () { return true; });
      },

      /* intercept same origin links so a plain multi page site just works */
      link: function (selector) {
        var sel = selector || 'a[href]:not([target]):not([download]):not([data-no-transition])';
        document.addEventListener("click", function (e) {
          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          var a = e.target.closest ? e.target.closest(sel) : null;
          if (!a) return;
          var href = a.getAttribute("href");
          if (!href || href.charAt(0) === "#" || /^[a-z]+:/i.test(href) && a.origin !== location.origin) return;
          if (a.href === location.href) return;
          e.preventDefault();
          api.go(a.href);
        });
        return api;
      },

      stats: function () {
        var px = 0, n = 0;
        ["dark", "light"].forEach(function (k) {
          (art[k] || []).forEach(function (c) { if (c) { px += c.width * c.height; n++; } });
        });
        return { version: VERSION, bands: BANDS, strokeCanvases: n,
                 megapixels: +(px / 1e6).toFixed(1), approxMB: +(px * 4 / 1048576).toFixed(1) };
      },

      /* preview the artwork at full cover without navigating, for tuning */
      preview: function (g) {
        var key = keyFor(g || groundNow()); mount();
        return ensure(key).then(function () { cv.style.visibility = "visible"; paint("cover", 1, key); });
      },
      clear: function () { cv.style.visibility = "hidden"; cx.clearRect(0, 0, CW, CH); hidePlate(); },
      /* freeze one frame of a phase at progress p (0 to 1), for tuning */
      frame: function (phase, p, g) {
        var key = keyFor(g || groundNow()); mount();
        return ensure(key).then(function () { cv.style.visibility = "visible"; paint(phase === "reveal" ? "reveal" : "cover", clamp(p, 0, 1), key); });
      },

      reroll: function (s) { seed = (s === undefined || s === null) ? (Math.random() * 1e9) | 0 : s; return build(); },
      rebuild: build,
      destroy: function () {
        window.removeEventListener("resize", onResize);
        if (cv.parentNode) cv.parentNode.removeChild(cv);
        hidePlate();
      }
    };

    var rt;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (!busy) build(); }, 180); }
    window.addEventListener("resize", onResize);

    build();
    return api;
  }

  return { create: create, version: VERSION };
});