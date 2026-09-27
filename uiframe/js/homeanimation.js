(function(){
"use strict";
var VERSION = "v9";
var BUILT   = "2026-09-15 08:33 UTC";
var RM = window.matchMedia("(prefers-reduced-motion: reduce)");

var EO = "cubic-bezier(.16,1,.3,1)";   // Figma [0.16,1,0.3,1]
var ES = "cubic-bezier(.25,1,.5,1)";   // Figma [0.25,1,0.5,1]

/* Hero entrance, read off the Figma cohort on node 12329:17675.
   key : [delay s, duration s, ease, tx px, ty px, scale] */
var TL = {
  art     : [0.00, 0.80, ES,   0,   0, 1],
  lbl0    : [0.45, 0.60, EO,   0,  20, 1],
  lbl1    : [0.55, 0.60, EO,   0,  20, 1],
  lbl2    : [0.65, 0.60, EO,   0,  20, 1],
  lbl3    : [0.75, 0.60, EO,   0,  20, 1],
  msg     : [0.70, 0.60, EO,   0,   0, 1],
  eyebrow : [0.40, 0.70, ES,   0,   0, 1],
  h1a     : [0.50, 0.80, EO,   0,  50, 1],
  h1b     : [0.65, 0.80, EO,   0,  50, 1],
  sub     : [0.85, 0.70, ES,   0,  25, 1],
  stamp   : [1.00, 0.70, EO,   0,   0, 0.85],
  wordmark: [0.50, 0.90, EO, -40,   0, 1],
  promise : [0.90, 0.60, ES,   0,   0, 1],
  notea   : [1.00, 0.60, ES,   0,   0, 1],
  ul1     : [1.10, 0.50, ES,   0,   0, 1],
  noteb   : [1.05, 0.60, ES,   0,   0, 1],
  ul2     : [1.15, 0.50, ES,   0,   0, 1]
};

var TUNE = { revealStagger:1,
             quillWidth:7, quillTaper:0.11, quillLife:1100, quillMax:160, quillInk:0.9,
             quillBreak:120 };

function $(s,c){ return (c||document).querySelector(s); }
function $$(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }

var navBar = $("#navBar"), nextSec = $("#next"), panel = $("#menuPanel");
var stage = $("#stage"), clip = $("#stageClip");
var heroEls = $$(".hero-anim");
var NAV_TOP = 953, navStuck = false;

/* ---------- hero stage scaling ---------- */
function fit(){
  var w = document.documentElement.clientWidth;
  if(stage && clip){
    var s = Math.min(1, w/1920);
    stage.style.setProperty("--hs", s);
    clip.style.height = Math.round(1080*s) + "px";
    if(navBar){
      navBar.style.setProperty("--hs", s);
      NAV_TOP = Math.round(953 * s);
      if(!navStuck) navBar.style.top = NAV_TOP + "px";
    }
  }
}

/* ---------- nav: travels with the hero, then pins at 24px ---------- */
function syncNav(){
  if(!navBar) return;
  var stick = window.pageYOffset >= (NAV_TOP - 24);
  if(stick === navStuck) return;
  navStuck = stick;
  navBar.classList.toggle("stuck", stick);
  navBar.style.top = stick ? "" : NAV_TOP + "px";
}

/* ---------- hero entrance ---------- */
function heroReset(){
  heroEls.forEach(function(el){
    var t = TL[el.getAttribute("data-k")]; if(!t) return;
    var base = el.getAttribute("data-base") || "";
    el.style.transition = "none";
    el.style.opacity = 0;
    el.style.transform = base + " translate(" + t[3] + "px," + t[4] + "px) scale(" + t[5] + ")";
  });
}
function heroPlay(){
  heroEls.forEach(function(el){
    var t = TL[el.getAttribute("data-k")]; if(!t) return;
    var base = el.getAttribute("data-base") || "";
    el.style.transition = "opacity "+t[1]+"s "+t[2]+" "+t[0]+"s, transform "+t[1]+"s "+t[2]+" "+t[0]+"s";
    el.style.opacity = 1;
    el.style.transform = base + " translate(0px,0px) scale(1)";
  });
}
function heroStatic(){
  heroEls.forEach(function(el){
    el.style.transition = "none"; el.style.opacity = 1;
    el.style.transform = el.getAttribute("data-base") || "none";
  });
}

/* ---------- nav: mark the current page ---------- */
function markCurrent(){
  var links = $$("#navLinks a, .pill-nav a");
  var here  = location.pathname.split("/").pop();
  links.forEach(function(a){
    a.classList.remove("current");
    var href = a.getAttribute("href") || "";
    if(href && href.charAt(0) !== "#" && href === here) a.classList.add("current");
  });
  // this prototype is the homepage, which has no nav item of its own,
  // so nothing is marked here. The treatment is wired for the other pages.
}

/* ---------- currency selector (USD default, EUR and GBP) ---------- */
function initCurrency(sel, btn, menu, label){
  var root = $(sel), b = $(btn), m = $(menu), out = $(label);
  if(!root || !b || !m || !out) return;
  function close(){ root.classList.remove("open"); b.setAttribute("aria-expanded","false"); }
  function open(){ root.classList.add("open"); b.setAttribute("aria-expanded","true"); }
  b.addEventListener("click", function(e){
    e.stopPropagation();
    root.classList.contains("open") ? close() : open();
  });
  $$("button", m).forEach(function(o){
    if(o.getAttribute("data-cur") === out.textContent.trim()) o.setAttribute("aria-selected","true");
    o.addEventListener("click", function(e){
      e.stopPropagation();
      var cur = o.getAttribute("data-cur");
      $$("#curNow, #curNowM").forEach(function(n){ n.textContent = cur; });
      $$(".cur-menu button").forEach(function(x){
        x.setAttribute("aria-selected", x.getAttribute("data-cur") === cur ? "true" : "false");
      });
      close();
    });
  });
  document.addEventListener("click", close);
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
}

/* ---------- mobile menu ---------- */
function initMenu(){
  var open = $("#navBurger"), close = $("#menuClose");
  if(!open || !panel) return;
  function show(){
    panel.hidden = false;
    document.body.style.overflow = "hidden";
    open.setAttribute("aria-expanded","true");
  }
  function hide(){
    panel.hidden = true;
    document.body.style.overflow = "";
    open.setAttribute("aria-expanded","false");
  }
  open.addEventListener("click", show);
  if(close) close.addEventListener("click", hide);
  $$("#menuPanel .mm-index a, #menuPanel .btn").forEach(function(a){ a.addEventListener("click", hide); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !panel.hidden) hide(); });
  window.addEventListener("resize", function(){ if(window.innerWidth > 1100 && !panel.hidden) hide(); });
}

/* ---------- reveals ---------- */
function setupReveals(){
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var d = parseInt(e.target.getAttribute("data-d")||"0",10) * TUNE.revealStagger;
      setTimeout(function(){ e.target.classList.add("in"); }, d);
      io.unobserve(e.target);
    });
  }, {rootMargin:"0px 0px -12% 0px", threshold:0.12});
  $$(".rv").forEach(function(el){ io.observe(el); });

  if(nextSec){
    var no = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); no.unobserve(e.target); } });
    }, {threshold:0.15});
    no.observe(nextSec);
  }
}

/* ---------- the quill: an ink line that follows the cursor ----------
   Points are stored in PAGE coordinates, so the ink stays where it was
   written and travels with the document when you scroll. Drawn as one
   filled ribbon whose width tapers to nothing at the tail, so there are
   no stepped alphas and no segment joints to show as hard edges.        */
function initQuill(){
  if(RM.matches) return;
  if(!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var c = document.createElement("canvas");
  c.id = "quill"; c.setAttribute("aria-hidden","true");
  document.body.appendChild(c);
  var ctx = c.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);

  function size(){
    var w = window.innerWidth, h = window.innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + "px"; c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  var pts = [], last = null, running = false;

  function add(x, y, t, v){
    pts.push({ x:x, y:y, t:t, w:Math.max(0.9, TUNE.quillWidth - v * TUNE.quillTaper) });
    if(pts.length > TUNE.quillMax) pts.shift();
  }

  window.addEventListener("mousemove", function(e){
    var cx = e.clientX, cy = e.clientY;

    // Chrome fires mousemove while the page scrolls under a stationary
    // cursor. The pointer has not moved, so nothing should be written:
    // without this the ink draws a straight line down the document.
    if(last && cx === last.cx && cy === last.cy) return;

    var t  = performance.now();
    var ox = window.pageXOffset, oy = window.pageYOffset;
    var v  = 0;

    if(last){
      var dx = cx - last.cx, dy = cy - last.cy;     // real pointer travel, in client space
      var d  = Math.sqrt(dx*dx + dy*dy);
      v = d / Math.max(8, t - last.t) * 16;
      var steps = Math.min(8, Math.floor(d / 10));
      for(var i = 1; i < steps; i++){
        add(last.cx + dx*(i/steps) + ox, last.cy + dy*(i/steps) + oy,
            last.t + (t - last.t)*(i/steps), v);
      }
    }
    add(cx + ox, cy + oy, t, v);
    last = { cx:cx, cy:cy, t:t };
    if(!running){ running = true; requestAnimationFrame(frame); }
  }, {passive:true});

  window.addEventListener("mouseout", function(e){ if(!e.relatedTarget) last = null; });

  function smooth(a, key){
    if(a.length < 3) return;
    for(var pass = 0; pass < 2; pass++){
      for(var i = 1; i < a.length - 1; i++){
        a[i][key] = (a[i-1][key] + a[i][key]*2 + a[i+1][key]) / 4;
      }
    }
  }
  function edgeThrough(A, joinOn){
    if(joinOn) ctx.lineTo(A[0].x, A[0].y); else ctx.moveTo(A[0].x, A[0].y);
    for(var i = 1; i < A.length - 1; i++){
      ctx.quadraticCurveTo(A[i].x, A[i].y, (A[i].x + A[i+1].x)/2, (A[i].y + A[i+1].y)/2);
    }
    ctx.lineTo(A[A.length-1].x, A[A.length-1].y);
  }

  function frame(){
    var now = performance.now(), life = TUNE.quillLife;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    while(pts.length && now - pts[0].t > life) pts.shift();

    if(pts.length > 2){
      var ox = window.pageXOffset, oy = window.pageYOffset, n = pts.length, P = [];
      for(var i = 0; i < n; i++){
        var tail = Math.pow(1 - (now - pts[i].t)/life, 0.65);
        var head = (n - i) > 2 ? 1 : 0.45 + 0.55*((n - i)/2);
        P.push({ x: pts[i].x - ox, y: pts[i].y - oy, w: pts[i].w * tail * head });
      }
      smooth(P,"x"); smooth(P,"y"); smooth(P,"w");

      // a big gap means the page scrolled between two pointer moves,
      // so the stroke breaks rather than joining across the jump
      var runs = [], cur = [P[0]], brk = TUNE.quillBreak;
      for(var g = 1; g < P.length; g++){
        var gx = P[g].x - P[g-1].x, gy = P[g].y - P[g-1].y;
        if(Math.sqrt(gx*gx + gy*gy) > brk){ runs.push(cur); cur = []; }
        cur.push(P[g]);
      }
      runs.push(cur);

      ctx.fillStyle = "rgba(255,31,14," + TUNE.quillInk + ")";
      runs.forEach(function(run){
        var m = run.length;
        if(m < 3) return;
        var L = [], R = [];
        for(var k = 0; k < m; k++){
          var a = run[Math.max(0,k-1)], b = run[Math.min(m-1,k+1)];
          var dx = b.x - a.x, dy = b.y - a.y;
          var len = Math.sqrt(dx*dx + dy*dy) || 1;
          var nx = -dy/len, ny = dx/len, h = run[k].w/2;
          L.push({ x:run[k].x + nx*h, y:run[k].y + ny*h });
          R.push({ x:run[k].x - nx*h, y:run[k].y - ny*h });
        }
        R.reverse();
        ctx.beginPath();
        edgeThrough(L, false);
        edgeThrough(R, true);
        ctx.closePath();
        ctx.fill();
      });
    }

    if(pts.length){ requestAnimationFrame(frame); }
    else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }
}

/* ---------- boot ---------- */
function boot(){
  fit();
  window.addEventListener("resize", fit);
  markCurrent();
  initCurrency("#curSel",  "#curBtn",  "#curMenu",  "#curNow");
  initCurrency("#curSelM", "#curBtnM", "#curMenuM", "#curNowM");
  initMenu();

  // the sticky nav is layout, not motion: it runs under reduced motion too
  window.addEventListener("scroll", syncNav, {passive:true});
  syncNav();

  if(RM.matches){
    heroStatic();
    $$(".rv").forEach(function(el){ el.classList.add("in"); });
    if(nextSec) nextSec.classList.add("in");
    return;
  }

  heroReset();
  setupReveals();
  initQuill();
  requestAnimationFrame(function(){ requestAnimationFrame(heroPlay); });
}

if(document.readyState === "complete") boot();
else window.addEventListener("load", boot);

/* ---------- diagnostics ---------- */
window.quillli = {
  version : function(){ console.log("Quillli homepage prototype " + VERSION + " (built " + BUILT + ")"); return VERSION; },
  replay  : function(){
              if(RM.matches){ console.warn("reduced motion is on, nothing to replay"); return; }
              heroReset();
              $$(".rv").forEach(function(el){ el.classList.remove("in"); });
              if(nextSec) nextSec.classList.remove("in");
              requestAnimationFrame(function(){ setupReveals();
                requestAnimationFrame(heroPlay); });
            },
  timeline: function(){ console.table(TL); return TL; },
  tune    : function(o){ Object.assign(TUNE, o||{}); console.log(TUNE); return TUNE; },
  currency: function(){ var n = $("#curNow"); return n ? n.textContent.trim() : null; },
  nav     : function(){ return {top:NAV_TOP, stuck:navStuck}; },
  quill   : function(){ return !!$("#quill"); },
  state   : function(){ return {version:VERSION, reducedMotion:RM.matches, navStuck:navStuck,
                        heroScale: stage ? getComputedStyle(stage).getPropertyValue("--hs").trim() : null,
                        menuOpen: panel ? !panel.hidden : null,
                        reveals:$$(".rv").length, revealed:$$(".rv.in").length}; }
};
console.log("%cQuillli " + VERSION, "background:#FF1F0E;color:#FFFBF0;padding:2px 8px;border-radius:9px",
            "quillli.replay() / quillli.nav() / quillli.tune({quillWidth:9}) / quillli.state()");
})();
