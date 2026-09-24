/* =============================================================
   VERITI GLOBAL  ·  preloader.js
   The book opens and one word finds its English.

   HOMEPAGE ONLY. Do not load this file, or css/preloader.css, on
   inner pages.

   ---------------------------------------------------------------
   HOW THE GATE WORKS
   ---------------------------------------------------------------
   An inline snippet in the <head> of index.html decides whether the
   sequence runs and writes .pl-on or .pl-off onto <html> BEFORE first
   paint. That is deliberate: the overlay is display:none by default,
   so an inner page can never flash a cream screen for a frame while
   waiting for this file to load.

   The homepage declares itself with <html data-page="home">. Do not
   go back to sniffing location.pathname: it breaks on renamed files,
   staging subfolders and preview panels.

   Config lives on window.PRELOADER, set by that inline snippet:
     homepageOnly    true  = only <html data-page="home"> plays it
     oncePerSession  false = plays on every homepage load
                     true  = plays once per browser session

   ---------------------------------------------------------------
   TIMELINE (ms from start)
   ---------------------------------------------------------------
     60    book fades in
     420   cover swings open
     1000  word cycle starts, 300ms per word
     2500  lands on "meaning" in English
     3280  book scales up and fades
     3920  overlay gone, scroll unlocked, hero writes itself in

   Sequence start waits on document.fonts.ready, capped at 1100ms, so
   the non-Latin words are never drawn in a fallback face. A 7s hard
   ceiling releases the page regardless, so a stalled font or image can
   never trap a visitor behind the animation.
   ============================================================= */

(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  var pre = doc.getElementById('preloader');
  if (!pre) { return; }

  var bkWord = doc.getElementById('bkWord');
  var plBar = doc.getElementById('plBar');
  var plSkip = doc.getElementById('plSkip');

  /* The word is "meaning", carried through five languages before it
     settles into English. Change the set here; the timeline scales to
     however many entries there are. */
  var WORDS = [
    { t: '意味', lang: 'ja' },                            /* Japanese */
    { t: 'المعنى', lang: 'ar', rtl: 1 }, /* Arabic */
    { t: 'смысл', lang: 'ru' },          /* Russian  */
    { t: 'νόημα', lang: 'el' },          /* Greek    */
    { t: 'sens', lang: 'fr' },                                    /* French   */
    { t: 'meaning', lang: 'en', final: 1 }                        /* lands    */
  ];

  var WORD_STEP = 300;
  var CYCLE_START = 1000;
  var HOLD = 780;
  var EXIT = 640;
  var HARD_CEILING = 7000;

  var wordEls = WORDS.map(function (w) {
    var s = doc.createElement('span');
    s.textContent = w.t;
    s.setAttribute('lang', w.lang);
    if (w.rtl) { s.setAttribute('dir', 'rtl'); }
    if (w.final) { s.className = 'is-final'; }
    bkWord.appendChild(s);
    return s;
  });

  var timers = [];
  var finished = false;
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function releasePage() {
    if (finished) { return; }
    finished = true;
    timers.forEach(clearTimeout);
    timers = [];

    pre.classList.add('is-done');
    html.classList.remove('is-locked');
    setTimeout(function () {
      if (pre && pre.parentNode) { pre.parentNode.removeChild(pre); }
    }, 800);

    /* Hand the hero back to the motion engine. */
    Array.prototype.forEach.call(doc.querySelectorAll('[data-reveal-after]'), function (el) {
      if (window.VGMotion) { window.VGMotion.reveal(el); }
      else { el.classList.add('is-in'); }
    });

    doc.dispatchEvent(new CustomEvent('vg:preloader-done'));
  }

  function runSequence() {
    var total = CYCLE_START + (WORDS.length - 1) * WORD_STEP + HOLD;

    later(function () { pre.classList.add('pl-run'); }, 60);
    later(function () { pre.classList.add('pl-open'); }, 420);

    requestAnimationFrame(function () {
      plBar.style.transition = 'width ' + (total + 200) + 'ms cubic-bezier(.3,.7,.4,1)';
      plBar.style.width = '100%';
    });

    wordEls.forEach(function (el, i) {
      later(function () {
        if (i > 0) {
          wordEls[i - 1].classList.remove('is-on');
          wordEls[i - 1].classList.add('is-off');
        }
        el.classList.add('is-on');
      }, CYCLE_START + i * WORD_STEP);
    });

    later(function () { pre.classList.add('pl-out'); }, total);
    later(releasePage, total + EXIT);
  }

  if (plSkip) {
    plSkip.addEventListener('click', function () {
      pre.classList.add('pl-out');
      setTimeout(releasePage, 320);
    });
  }

  if (!html.classList.contains('pl-on')) {
    /* The head gate said no. Show the page immediately. */
    pre.classList.add('is-done');
    html.classList.remove('is-locked');
    releasePage();
    return;
  }

  html.classList.add('is-locked');
  if (window.scrollTo) { window.scrollTo(0, 0); }

  var fontsReady = (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
  var capped = new Promise(function (res) { setTimeout(res, 1100); });
  Promise.race([fontsReady, capped]).then(runSequence);

  setTimeout(releasePage, HARD_CEILING);
})();
