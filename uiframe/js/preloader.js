(function(){
"use strict";
var RM = window.matchMedia("(prefers-reduced-motion: reduce)");
if(RM.matches) return;

var CFG = {
  barMin     : 750,    // ms the loading bar runs even when the page is already up
  hold       : 2000,   // ms to read the card before the pen picks up
  cover      : 0.20,   // share of the card cleared before the pen finishes the job itself
  nibWidth   : 0.086,  // stroke width as a share of the viewport's short side
  ease       : 0.62,   // how hard the pen chases the pointer
  feather    : 3.2,    // softness of the cleared edge, px
  bite       : 0.70,   // how much the bristles take per pass, 0 to 1
  core       : 0.52,   // the part of the stroke that clears outright, the rest is bristles
  step       : 7,      // minimum travel before a new point joins the stroke, px
  inkLife    : 620,    // ms the red trail stays on the paper
  idleOut    : 6000,   // ms with no scrubbing at all before it finishes itself
  handsOff   : 8000,   // ms hard cap once scrubbing has started
  finishStep : 260     // ms per auto stroke at the end
};

var ink="#1F1B18", paper="#F9F6EE", red="#FF1F0E";
var COARSE = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if(COARSE){ CFG.cover = 0.14; }   // a thumb covers less ground than a mouse

var root=document.documentElement;
root.classList.add("pre-active");

/* ---------- dom ---------- */
var wrap=document.createElement("div"); wrap.id="preload"; wrap.setAttribute("aria-hidden","true");
var card=document.createElement("canvas"); card.id="preCard";
var trail=document.createElement("canvas"); trail.id="preInk";
var bar=document.createElement("div"); bar.id="preBar"; bar.innerHTML="<i></i>";
var barFill=bar.firstChild;
var hint=document.createElement("div"); hint.id="preHint";
hint.textContent=(COARSE ? "Swipe" : "Scrub") + " to open the page";
var nib=document.createElement("div"); nib.id="preNib";
nib.innerHTML='<img alt="" src="data:image/webp;base64,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">';
wrap.appendChild(card); wrap.appendChild(trail); wrap.appendChild(bar); wrap.appendChild(hint);
document.body.appendChild(wrap); document.body.appendChild(nib);

var cx=card.getContext("2d"), tx=trail.getContext("2d");
var face=document.createElement("canvas"), fx=face.getContext("2d");
var stamp=document.createElement("canvas"), sx=stamp.getContext("2d");   // what the brush has taken off
var tmp=document.createElement("canvas"), mx=tmp.getContext("2d");       // one pass, before the bristles
var dpr=Math.min(2, window.devicePixelRatio||1);
var W=0,H=0,R=0,grid=null,cols=0,rows=0,cell=26,hit=0,tex=null,grain=null;

/* ---------- the bristles ---------- */
function makeGrain(){
  var n=320, c=document.createElement("canvas"); c.width=c.height=n;
  var g=c.getContext("2d");
  g.fillStyle="#fff"; g.fillRect(0,0,n,n);
  g.globalCompositeOperation="destination-out";
  for(var i=0;i<210;i++){                       // dry drag marks along the stroke
    var y=Math.random()*n, x=Math.random()*n, w=50+Math.random()*300;
    g.strokeStyle="rgba(0,0,0,"+(0.10+Math.random()*0.45)+")";
    g.lineWidth=0.5+Math.random()*2.4;
    for(var k=-1;k<=0;k++){                     // wrapped, so the tile has no seam
      g.beginPath(); g.moveTo(x+k*n, y); g.lineTo(x+k*n+w, y+(Math.random()-0.5)*2.5); g.stroke();
    }
  }
  for(var j=0;j<2400;j++){                      // tooth
    g.fillStyle="rgba(0,0,0,"+(0.12+Math.random()*0.55)+")";
    g.fillRect(Math.random()*n|0, Math.random()*n|0, 1+(Math.random()*2|0), 1);
  }
  g.globalCompositeOperation="source-over";
  return c;
}

/* ---------- the card ---------- */
function buildFace(){
  fx.setTransform(dpr,0,0,dpr,0,0);
  fx.clearRect(0,0,W,H);
  fx.fillStyle=paper; fx.fillRect(0,0,W,H);
  if(tex){ fx.fillStyle=fx.createPattern(tex,"repeat"); fx.fillRect(0,0,W,H); }

  // the sheet sits on the page, so it carries its own shading
  var g=fx.createRadialGradient(W*0.5,H*0.46,Math.min(W,H)*0.2,W*0.5,H*0.46,Math.max(W,H)*0.78);
  g.addColorStop(0,"rgba(31,27,24,0)"); g.addColorStop(1,"rgba(31,27,24,.09)");
  fx.fillStyle=g; fx.fillRect(0,0,W,H);

  var mid=H*0.5, s = W < 700 ? Math.min(W*0.27, 116) : Math.min(W*0.13, 172);
  fx.textAlign="center"; fx.textBaseline="alphabetic";

  fx.fillStyle=red;
  fx.font="600 12px 'Host Grotesk',system-ui,sans-serif";
  if("letterSpacing" in fx) fx.letterSpacing="1.2px";
  fx.fillText("FROM THOUGHT TO STORY", W/2, mid - s*0.62);
  if("letterSpacing" in fx) fx.letterSpacing="0px";

  fx.fillStyle=ink;
  fx.font="800 "+s+"px 'Bodoni Moda',Didot,serif";
  fx.fillText("Quillli", W/2, mid + s*0.3);

  var row=Math.round(mid + s*0.66);
  bar.style.width=Math.round(Math.min(240, Math.max(160, W*0.17)))+"px";
  bar.style.top=row+"px";
  hint.style.fontSize=Math.min(18,Math.max(15,W*0.011))+"px";
  hint.style.top=(row-6)+"px";
}

function size(){
  W=window.innerWidth; H=window.innerHeight;
  [card,trail,face,stamp,tmp].forEach(function(c){
    c.width=Math.round(W*dpr); c.height=Math.round(H*dpr);
    if(c===card||c===trail){ c.style.width=W+"px"; c.style.height=H+"px"; }
  });
  tx.setTransform(dpr,0,0,dpr,0,0);
  R=Math.max(COARSE ? 72 : 54, Math.min(W,H)*CFG.nibWidth);
  cols=Math.ceil(W/cell); rows=Math.ceil(H/cell);
  grid=new Uint8Array(cols*rows); hit=0;
  if(!grain) grain=makeGrain();
  sx.setTransform(1,0,0,1,0,0); sx.clearRect(0,0,stamp.width,stamp.height);
  buildFace();
}

/* the texture is the one bound in the design, lifted off the mobile menu
   so the file carries a single copy of it */
function grabTexture(){
  var m=document.getElementById("menuPanel"); if(!m) return;
  var u=/url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(m).backgroundImage || "");
  if(!u) return;
  var img=new Image();
  img.onload=function(){ tex=img; if(!started && !closing){ buildFace(); paint(); } };
  img.src=u[1];
}

/* ---------- the stroke ---------- */
var runs=[], live=true, closing=false, started=0, idle=0;

function mark(x0,y0,x1,y1,r){
  var a=Math.max(0,Math.floor((Math.min(x0,x1)-r)/cell)),
      b=Math.min(cols-1,Math.floor((Math.max(x0,x1)+r)/cell)),
      c=Math.max(0,Math.floor((Math.min(y0,y1)-r)/cell)),
      d=Math.min(rows-1,Math.floor((Math.max(y0,y1)+r)/cell));
  var dx=x1-x0, dy=y1-y0, L=dx*dx+dy*dy;
  for(var j=c;j<=d;j++) for(var i=a;i<=b;i++){
    var k=j*cols+i; if(grid[k]) continue;
    var px=i*cell+cell/2, py=j*cell+cell/2, t=L?((px-x0)*dx+(py-y0)*dy)/L:0;
    t=t<0?0:t>1?1:t;
    var ex=px-(x0+dx*t), ey=py-(y0+dy*t);
    if(ex*ex+ey*ey <= r*r*0.62){ grid[k]=1; hit++; }
  }
}

/* one pass of the brush: lay the new bit of path down, let the bristles
   eat into it, then add it to what has already been taken off */
function pass(run){
  var p=run.pts, n=p.length; if(n<1) return;
  var i0=Math.max(0, n-4);
  function lay(){
    mx.beginPath();
    if(n===1){ mx.moveTo(p[0].x,p[0].y); mx.lineTo(p[0].x+0.1,p[0].y); }
    else {
      mx.moveTo(p[i0].x,p[i0].y);
      for(var i=i0+1;i<n-1;i++) mx.quadraticCurveTo(p[i].x,p[i].y,(p[i].x+p[i+1].x)/2,(p[i].y+p[i+1].y)/2);
      mx.lineTo(p[n-1].x,p[n-1].y);
    }
    mx.stroke();
  }
  mx.setTransform(1,0,0,1,0,0); mx.clearRect(0,0,tmp.width,tmp.height);
  mx.setTransform(dpr,0,0,dpr,0,0);
  mx.strokeStyle="#fff"; mx.lineCap="round"; mx.lineJoin="round";

  // the full width of the brush, then the bristles eat into it
  mx.filter="blur("+CFG.feather+"px)";
  mx.lineWidth=run.w;
  lay();
  mx.filter="none";
  mx.globalCompositeOperation="destination-in";
  mx.fillStyle=mx.createPattern(grain,"repeat");
  mx.globalAlpha=CFG.bite;
  mx.fillRect(0,0,W,H);
  mx.globalAlpha=1;
  mx.globalCompositeOperation="source-over";

  // the middle of the brush carries enough paint to clear outright
  mx.filter="blur("+(CFG.feather*0.7)+"px)";
  mx.globalAlpha=0.84;
  mx.lineWidth=run.w*CFG.core;
  lay();
  mx.globalAlpha=1;
  mx.filter="none";

  sx.setTransform(1,0,0,1,0,0);
  sx.drawImage(tmp,0,0);
}

function openRun(w){ runs.push({ w:w, pts:[] }); }
function addPoint(x,y){
  var run=runs[runs.length-1]; if(!run) return;
  var p=run.pts, last=p[p.length-1];
  if(last){
    var dx=x-last.x, dy=y-last.y;
    if(dx*dx+dy*dy < CFG.step*CFG.step) return;
    mark(last.x,last.y,x,y,run.w*0.5);
  } else {
    mark(x,y,x,y,run.w*0.5);
  }
  p.push({x:x,y:y});
  pass(run);
}

function paint(){
  cx.setTransform(1,0,0,1,0,0);
  cx.clearRect(0,0,card.width,card.height);
  cx.drawImage(face,0,0);
  cx.globalCompositeOperation="destination-out";
  cx.drawImage(stamp,0,0);
  cx.globalCompositeOperation="source-over";
}

/* ---------- the red trail ---------- */
var pts=[];
function drawTrail(now){
  tx.clearRect(0,0,W,H);
  while(pts.length && now-pts[0].t > CFG.inkLife) pts.shift();
  if(pts.length<2) return;
  tx.lineCap="round"; tx.lineJoin="round";
  for(var i=1;i<pts.length;i++){
    var gx=pts[i].x-pts[i-1].x, gy=pts[i].y-pts[i-1].y;
    if(gx*gx+gy*gy > 58000) continue;          // the stroke breaks rather than joining across a jump
    var age=1-(now-pts[i].t)/CFG.inkLife, head=i/pts.length;
    tx.strokeStyle="rgba(255,31,14,"+(0.9*age)+")";
    tx.lineWidth=Math.max(1, 7*age*(0.45+0.55*head));
    tx.beginPath(); tx.moveTo(pts[i-1].x,pts[i-1].y); tx.lineTo(pts[i].x,pts[i].y); tx.stroke();
  }
}

/* ---------- load, then a beat to read it ---------- */
var loaded=(document.readyState==="complete"), barAt=0, barDone=0, openAt=Infinity, t0=0;
if(!loaded) window.addEventListener("load", function(){ loaded=true; });

function runBar(now){
  if(!t0) t0=now;
  if(barDone) return;
  var k=Math.min(1,(now-t0)/CFG.barMin), e=1-Math.pow(1-k,3);
  var p=e*0.92;
  if(loaded && k>=1) p=Math.min(1, barAt + 0.055);
  if(p>barAt) barAt=p;
  barFill.style.width=(barAt*100).toFixed(1)+"%";
  if(barAt>=1){
    barDone=now;
    setTimeout(function(){
      bar.classList.add("off"); hint.classList.add("on");
      openAt=performance.now()+CFG.hold;
      setTimeout(function(){ if(!started) finish(); }, CFG.hold + CFG.idleOut);
    }, 180);
  }
}

/* ---------- pointer ---------- */
var target=null, pos=null, tilt=0;
function point(x,y){
  if(!live || closing) return;
  if(performance.now() < openAt) return;      // let them read it first
  target={x:x,y:y};
  if(!pos){
    pos={x:x,y:y}; openRun(R); addPoint(x,y);
    nib.classList.add("on"); hint.classList.remove("on");
  }
  if(!started){ started=performance.now(); clearTimeout(idle);
    idle=setTimeout(function(){ finish(); }, CFG.handsOff); }
}
window.addEventListener("mousemove", function(e){ point(e.clientX,e.clientY); }, {passive:true});
window.addEventListener("touchstart", function(e){ var t=e.touches[0]; if(t) point(t.clientX,t.clientY); }, {passive:true});
window.addEventListener("touchmove", function(e){ var t=e.touches[0]; if(t) point(t.clientX,t.clientY); }, {passive:true});
window.addEventListener("keydown", function(){ if(live && openAt<Infinity) finish(); });
window.addEventListener("resize", function(){ if(live && !closing){ runs=[]; pts=[]; pos=null; target=null; size(); paint(); } });

function place(x,y){ nib.style.transform="translate3d("+(x-0.5)+"px,"+(y-10.1)+"px,0) rotate("+(-33+tilt)+"deg)"; }

function frame(now){
  runBar(now);
  if(!closing && pos && target){
    var vx=target.x-pos.x, vy=target.y-pos.y;
    pos.x+=vx*CFG.ease; pos.y+=vy*CFG.ease;
    addPoint(pos.x,pos.y);
    pts.push({x:pos.x,y:pos.y,t:now});
    tilt += (Math.max(-13,Math.min(13, vx*0.32)) - tilt)*0.12;
    place(pos.x,pos.y);
    paint();
  }
  drawTrail(now);
  if(!closing && started && hit/(cols*rows) >= CFG.cover) finish();
  if(live) requestAnimationFrame(frame);
}

/* ---------- it finishes the job itself ---------- */
function finish(){
  if(closing) return; closing=true; clearTimeout(idle); pts.length=0;
  bar.classList.add("off"); hint.classList.remove("on");
  var from = pos ? {x:pos.x,y:pos.y} : {x:-R,y:H*0.2};
  var wide = Math.max(R, H/3.4);          // the last strokes are broad and confident
  var legs=[], n=4;
  for(var i=0;i<n;i++){
    var y=H*((i+0.5)/n);
    legs.push([{x:-wide, y:y+(i%2? wide*0.2 : -wide*0.2)}, {x:W+wide, y:y+(i%2? -wide*0.22 : wide*0.22)}]);
  }
  if(from.y > H*0.5) legs.reverse();

  var s0=performance.now(), leg=-1;
  function nextLeg(now){ leg++; s0=now; if(leg<legs.length) openRun(wide); }
  function sweep(now){
    if(leg<0) nextLeg(now);
    var k=Math.min(1,(now-s0)/CFG.finishStep), e=1-Math.pow(1-k,3);
    var a=legs[leg][0], b=legs[leg][1];
    var px=a.x+(b.x-a.x)*e, py=a.y+(b.y-a.y)*e + Math.sin(e*Math.PI)*wide*0.14;
    addPoint(px,py);
    pts.push({x:px,y:py,t:now});
    tilt += ((b.x>a.x? 11 : -11) - tilt)*0.15;
    place(px,py);
    paint(); drawTrail(now);
    if(k>=1){ nextLeg(now); if(leg>=legs.length) return done(); }
    requestAnimationFrame(sweep);
  }
  nib.classList.add("on");
  requestAnimationFrame(sweep);
}

function done(){
  nib.classList.remove("on");
  wrap.classList.add("gone");
  root.classList.remove("pre-active");
  setTimeout(function(){
    live=false;
    wrap.parentNode && wrap.parentNode.removeChild(wrap);
    nib.parentNode && nib.parentNode.removeChild(nib);
  }, 620);
}

size(); paint();
requestAnimationFrame(frame);

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", grabTexture);
else grabTexture();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){
  if(!started && !closing){ buildFace(); paint(); }
});

window.quillliPreloader = {
  replay : function(){ location.reload(); },
  cover  : function(){ return Math.round(hit/(cols*rows)*100)+"%"; },
  tune   : function(o){ Object.assign(CFG,o||{}); return CFG; },
  skip   : finish
};
})();
