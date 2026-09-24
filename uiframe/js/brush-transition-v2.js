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
