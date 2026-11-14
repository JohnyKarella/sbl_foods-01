/* SBL Foods — Version B motion engine (GSAP + ScrollTrigger + Lenis) */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (reduce || !hasGsap) html.classList.add('reduce');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* ---------------- Utilities usable without GSAP ---------------- */
  function initBasics() {
    var onS = function () { html.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onS, { passive: true }); onS();
    // year
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    // tabs
    $$('[role="tablist"]').forEach(function (list) {
      var tabs = $$('[role="tab"]', list);
      function sel(t, focus) {
        tabs.forEach(function (x) {
          var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
          var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
        });
        if (focus) t.focus();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p && window.gsap && !reduce) gsap.from($$('.lwall > div', p), { opacity: 0, y: 20, duration: .6, stagger: .03, ease: 'power3.out' });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { sel(t); });
        t.addEventListener('keydown', function (e) {
          var n = e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length] : e.key === 'ArrowLeft' ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
          if (n) { e.preventDefault(); sel(n, true); }
        });
      });
    });
    // flip cards on touch
    $$('.flip__tap').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); var f = b.closest('.flip'); var on = f.classList.toggle('is-flipped'); b.setAttribute('aria-pressed', on); });
    });
    // forms → mailto
    $$('form[data-mailto]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var fd = new FormData(form), lines = [];
        fd.forEach(function (v, k) { if (k !== 'subject' && String(v).trim()) lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v); });
        location.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(fd.get('subject') || 'Enquiry') + '&body=' + encodeURIComponent(lines.join('\n'));
        var ok = $('.form__ok', form); ok && ok.classList.add('is-on');
      });
    });
    // accordion categories
    $$('.accord').forEach(function (acc) {
      var items = $$('.acc', acc);
      function open(it) { items.forEach(function (x) { x.classList.toggle('is-open', x === it); x.setAttribute('aria-expanded', x === it); }); }
      items.forEach(function (it) {
        it.addEventListener('mouseenter', function () { if (window.innerWidth >= 900) open(it); });
        it.addEventListener('focus', function () { open(it); });
      });
    });
    // query string prefill
    var q = new URLSearchParams(location.search).get('product');
    var msg = $('#f-msg'); if (q && msg) msg.value = 'Enquiry about: ' + q + '\n';
  }
  initBasics();

  /* ---------------- Menu (mobile) ---------------- */
  var burger = $('.burger'), menu = $('.menu');
  var lenis = null;
  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (hasGsap && !reduce) {
      if (open) {
        gsap.timeline()
          .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' })
          .from($$('.menu__list a', menu), { yPercent: 110, duration: .8, stagger: .06, ease: 'expo.out' }, '-=.35')
          .from($('.menu__foot', menu), { opacity: 0, y: 20, duration: .6 }, '-=.6');
      } else gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'expo.inOut' });
    } else menu.style.clipPath = open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)';
    if (open) setTimeout(function () { var a = $('.menu__list a', menu); a && a.focus(); }, 500);
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!html.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && html.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
  }

  if (!hasGsap || reduce) {
    // no motion: hide loaders/curtains, make links/anchors plain
    var pl = $('.preloader'); if (pl) pl.remove();
    html.classList.remove('from-nav');
    initStaticJourney();
    window.SBL_READY = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Smooth scroll ---------------- */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.SBL_LENIS = lenis;
  }
  // in-page anchors
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]'); if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var t = document.querySelector(url.hash); if (!t) return;
    e.preventDefault();
    if (html.classList.contains('menu-open')) setMenu(false);
    history.pushState(null, '', url.hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    lenis ? lenis.scrollTo(t, { offset: -90, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------------- Header ---------------- */
  var hdr = $('.hdr');
  ScrollTrigger.create({
    start: 'top top', end: 'max',
    onUpdate: function (s) {
      if (html.classList.contains('menu-open')) return;
      hdr.classList.toggle('is-hidden', s.direction === 1 && s.scroll() > 300);
    }
  });
  // pill nav blob
  var pill = $('.pillnav'), blob = pill && $('.pillnav__blob', pill);
  if (pill && blob) {
    var cur = $('a[aria-current="page"]', pill);
    function moveBlob(a) {
      if (!a) { blob.style.opacity = 0; return; }
      blob.style.opacity = 1; blob.style.width = a.offsetWidth + 'px'; blob.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    }
    $$('a', pill).forEach(function (a) { a.addEventListener('mouseenter', function () { moveBlob(a); }); a.addEventListener('focus', function () { moveBlob(a); }); });
    pill.addEventListener('mouseleave', function () { moveBlob(cur); });
    requestAnimationFrame(function () { moveBlob(cur); });
    window.addEventListener('resize', function () { moveBlob(cur); });
  }

  /* ---------------- Cursor + magnetic ---------------- */
  if (fine) {
    html.classList.add('has-cursor');
    var cursor = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__ring span');
    var dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var l = e.target.closest('[data-cursor]');
      var h = e.target.closest('a,button,summary,label,input,select,textarea');
      cursor.classList.toggle('is-label', !!l);
      cursor.classList.toggle('is-hover', !l && !!h);
      label.textContent = l ? l.getAttribute('data-cursor') : '';
      cursor.classList.toggle('on-dark', !!e.target.closest('.sec--ink,.sec--wine,.journey,.ftr,.menu,.clipmedia,.flip__b'));
    });
    document.addEventListener('pointerleave', function () { gsap.to(cursor, { opacity: 0, duration: .3 }); });
    document.addEventListener('pointerenter', function () { gsap.to(cursor, { opacity: 1, duration: .3 }); });
    $$('.magnetic').forEach(function (m) {
      var mx = gsap.quickTo(m, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), my = gsap.quickTo(m, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      m.addEventListener('pointermove', function (e) { var r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .3); my((e.clientY - r.top - r.height / 2) * .35); });
      m.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }

  /* ---------------- Text splitting ---------------- */
  function splitWords(el) {
    if (el._split) return el._split;
    var out = [];
    (function walk(node, wrapEm) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var line = document.createElement('span'); line.className = 'split-line'; line.style.display = 'inline-block';
            var inner = document.createElement('span'); inner.textContent = p; line.appendChild(inner); frag.appendChild(line); out.push(inner);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    el._split = out; return out;
  }
  function splitChars(el) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split('').forEach(function (c) {
            if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'char'; s.textContent = c; frag.appendChild(s); out.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return out;
  }

  /* ---------------- Intro: preloader or curtain ---------------- */
  var preloader = $('.preloader');
  var curtainSpans = $$('.curtain span');
  var curtainLogo = $('.curtain__logo');
  var heroTl = gsap.timeline({ paused: true });
  buildHeroIntro(heroTl);

  var firstVisit = !store.get('sbl-visited') && preloader;
  if (firstVisit) {
    store.set('sbl-visited', '1');
    var countEl = $('.preloader__count'), bar = $('.preloader__bar span');
    var o = { v: 0 };
    lenis && lenis.stop();
    var pt = gsap.timeline({ onComplete: function () { preloader.remove(); lenis && lenis.start(); } });
    pt.to(o, { v: 100, duration: 1.8, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = Math.round(o.v); } })
      .to(bar, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to($('.preloader__logo'), { scale: .8, opacity: 0, duration: .5 }, '-=.2')
      .to(preloader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
      .add(function () { heroTl.play(); }, '-=.55');
    preloader.style.clipPath = 'inset(0 0 0% 0)';
  } else {
    if (preloader) preloader.remove();
    if (html.classList.contains('from-nav')) {
      gsap.set(curtainSpans, { scaleY: 1 });
      gsap.set(curtainLogo, { opacity: 1 });
      html.classList.remove('from-nav');
      gsap.timeline()
        .to(curtainLogo, { opacity: 0, duration: .3 })
        .to(curtainSpans, { scaleY: 0, transformOrigin: 'top', duration: .8, stagger: .06, ease: 'expo.inOut' }, '-=.1')
        .add(function () { heroTl.play(); }, '-=.5');
    } else heroTl.play();
  }

  // page leave
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href') || '';
    if (/^(mailto:|tel:|https?:|#)/.test(href)) return;
    var url = new URL(a.href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    store.set('sbl-nav', '1');
    lenis && lenis.stop();
    gsap.timeline({ onComplete: function () { location.href = a.href; } })
      .set(curtainSpans, { transformOrigin: 'bottom' })
      .to(curtainSpans, { scaleY: 1, duration: .7, stagger: .05, ease: 'expo.inOut' })
      .to(curtainLogo, { opacity: 1, duration: .25 }, '-=.2');
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { gsap.set(curtainSpans, { scaleY: 0 }); gsap.set(curtainLogo, { opacity: 0 }); lenis && lenis.start(); }
  });

  function buildHeroIntro(tl) {
    var h = $('.hero, .phero'); if (!h) return;
    var lines = $$('.split-line > span', h);
    var title = $('h1', h);
    if (!lines.length && title) lines = splitWords(title);
    tl.from(lines, { yPercent: 115, rotate: 4, duration: 1.3, stagger: .07, ease: 'expo.out' })
      .from($$('[data-hero]', h), { opacity: 0, y: 30, duration: 1, stagger: .08, ease: 'expo.out' }, '-=1')
      .from($$('.carousel, .phero__media', h), { opacity: 0, scale: .92, duration: 1.6, ease: 'expo.out' }, '-=1.2')
      .from($$('.hero__ghost', h), { opacity: 0, x: 80, duration: 1.8, ease: 'expo.out' }, '-=1.5');
    gsap.set(lines, { yPercent: 115 });
  }

  /* ---------------- Scroll reveals ---------------- */
  $$('[data-split]').forEach(function (el) {
    var words = splitWords(el);
    gsap.from(words, { yPercent: 115, duration: 1.1, stagger: .035, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.set('[data-r]', { opacity: 0, y: 46 });
  ScrollTrigger.batch('[data-r]', {
    start: 'top 90%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: 'expo.out', overwrite: true }); }
  });
  $$('[data-r-img]').forEach(function (m) {
    var img = $('img', m);
    gsap.fromTo(m, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 85%' } });
    if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 85%' } });
  });
  $$('[data-speed]').forEach(function (el) {
    var s = parseFloat(el.getAttribute('data-speed'));
    gsap.fromTo(el, { yPercent: -s * 50 }, { yPercent: s * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* fill text */
  $$('.fill-text').forEach(function (el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return; if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    gsap.to(words, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: .6 } });
  });

  /* odometer */
  $$('[data-odo]').forEach(function (el) {
    var val = el.getAttribute('data-odo'), cols = [];
    el.innerHTML = '';
    val.split('').forEach(function (d, i) {
      var col = document.createElement('span'); col.className = 'odo__col';
      var html = ''; for (var k = 0; k < 20; k++) html += '<span>' + (k % 10) + '</span>';
      col.innerHTML = html; el.appendChild(col); cols.push({ col: col, d: parseInt(d, 10) + 10 });
    });
    var hasPlus = el.getAttribute('data-plus') !== '0';
    if (hasPlus) { var plus = document.createElement('span'); plus.className = 'odo__plus'; plus.textContent = '+'; el.appendChild(plus); }
    el.setAttribute('aria-label', val + (hasPlus ? '+' : ''));
    cols.forEach(function (c, i) {
      gsap.to(c.col, { yPercent: -c.d * 5, duration: 2.2 + i * .25, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
  });
  $$('[data-count]').forEach(function (el) {
    var o = { v: 0 }, t = parseFloat(el.getAttribute('data-count'));
    gsap.to(o, { v: t, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-IN'); } });
  });

  /* velocity marquees */
  $$('.vmarquee__track').forEach(function (track, idx) {
    var n = track.children.length; track.innerHTML += track.innerHTML;
    Array.prototype.slice.call(track.children, n).forEach(function (c) { c.setAttribute('aria-hidden', 'true'); });
    var dir = track.getAttribute('data-dir') === 'right' ? 1 : -1;
    var loop = gsap.fromTo(track, { xPercent: dir === -1 ? 0 : -50 }, { xPercent: dir === -1 ? -50 : 0, duration: 32, ease: 'none', repeat: -1 });
    var skew = gsap.quickTo(track, 'skewX', { duration: .5, ease: 'power3' });
    ScrollTrigger.create({
      trigger: track, start: 'top bottom', end: 'bottom top',
      onUpdate: function (s) {
        var v = s.getVelocity();
        gsap.to(loop, { timeScale: (s.direction === 1 ? 1 : -1) * Math.min(1 + Math.abs(v) / 300, 6), duration: .3, overwrite: true, onComplete: function () { gsap.to(loop, { timeScale: s.direction === 1 ? 1 : -1, duration: 1.2 }); } });
        skew(gsap.utils.clamp(-8, 8, v / -250));
      }
    });
    ScrollTrigger.addEventListener('scrollEnd', function () { skew(0); });
  });

  /* horizontal journey — zig-zag timeline */
  var journey = $('.journey');
  if (journey) {
    var jItems = $$('.jitem', journey), jYodo = $('.yodo', journey), jGhost = $('.journey__ghost', journey),
        jEra = $('.journey__era', journey), jN = $('.journey__n', journey), jEras = $$('.eras button', journey), jFill = $('.jline i', journey);
    var jActive = 0, pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var jActivate = function (i, force) {
      if (i === jActive && !force) return;
      jActive = i;
      jItems.forEach(function (it, k) { it.classList.toggle('is-active', k === i); it.classList.toggle('is-past', k < i); });
      var y = jItems[i].getAttribute('data-yr');
      y.split('').forEach(function (d, k) { var col = jYodo.children[k]; if (col) col.style.transform = 'translateY(' + (-d * 10) + '%)'; });
      jGhost.classList.add('is-swap'); setTimeout(function () { jGhost.textContent = y; jGhost.classList.remove('is-swap'); }, 300);
      jEra.textContent = jItems[i].getAttribute('data-era');
      jN.textContent = pad2(i + 1) + ' / ' + pad2(jItems.length);
      var cur = 0; jEras.forEach(function (b, k) { if (+b.getAttribute('data-idx') <= i) cur = k; });
      jEras.forEach(function (b, k) { b.setAttribute('aria-current', k === cur); });
    };
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () {
      var track = $('.jtrack', journey), nodeX = [];
      var measure = function () { nodeX = jItems.map(function (it) { return it.offsetLeft + $('.jnode', it).offsetLeft; }); };
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      measure();
      var tw = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: journey, start: 'top top', end: function () { return '+=' + Math.round(dist() * 1.15); }, pin: true, scrub: .8, invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: function (s) {
            var first = nodeX[0], last = nodeX[nodeX.length - 1], target = first + s.progress * (last - first), best = 0;
            for (var k = 0; k < nodeX.length; k++) if (nodeX[k] <= target + 2) best = k;
            jActivate(best);
            jFill.style.transform = 'scaleX(' + (target / track.scrollWidth).toFixed(4) + ')';
          }
        }
      });
      var st = tw.scrollTrigger;
      jFill.style.transform = 'scaleX(' + (nodeX[0] / track.scrollWidth).toFixed(4) + ')';
      // card contents rise in as each milestone slides into view
      var firstView = [];
      jItems.forEach(function (it) {
        var up = it.classList.contains('jitem--top'), parts = $$('.jcard__media, .jcard__body > *', it);
        if (it.offsetLeft < window.innerWidth * .92) { firstView.push({ parts: parts, up: up }); return; }
        gsap.from(parts, { y: up ? -26 : 26, opacity: 0, duration: .8, stagger: .06, ease: 'expo.out',
          scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left 96%', toggleActions: 'play none none reverse' } });
      });
      // milestones already on screen animate in when the section arrives
      var intro = gsap.timeline({ scrollTrigger: { trigger: journey, start: 'top 75%', once: true } });
      intro.from($$('.jnode', journey).slice(0, firstView.length), { scale: 0, duration: .6, stagger: .1, ease: 'back.out(2)' }, 0);
      firstView.forEach(function (f, k) { intro.from(f.parts, { y: f.up ? -26 : 26, opacity: 0, duration: .9, stagger: .06, ease: 'expo.out' }, .15 + k * .12); });
      // era buttons jump to their milestone
      var onEra = function (e) {
        var b = e.target.closest('.eras button'); if (!b) return;
        var i = +b.getAttribute('data-idx'), first = nodeX[0], last = nodeX[nodeX.length - 1];
        var y = st.start + ((nodeX[i] - first) / (last - first)) * (st.end - st.start) + 2;
        window.SBL_LENIS ? window.SBL_LENIS.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: y, behavior: 'smooth' });
      };
      journey.addEventListener('click', onEra);
      return function () { journey.removeEventListener('click', onEra); gsap.set(track, { clearProps: 'all' }); };
    });
    mm.add('(max-width: 899px)', function () {
      journey.classList.add('is-static');
      jItems.forEach(function (it) { gsap.from($('.jcard', it), { x: 40, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: it, start: 'top 90%', once: true } }); });
      return function () { journey.classList.remove('is-static'); };
    });
  }
  function initStaticJourney() { var j = $('.journey'); if (j) j.classList.add('is-static'); }

  /* clip-reveal media */
  $$('.clipmedia').forEach(function (cm) {
    var inner = $('.clipmedia__inner', cm), img = $('img', cm), txt = $('.clipmedia__text', cm);
    var tl = gsap.timeline({ scrollTrigger: { trigger: cm, start: 'top top', end: '+=120%', pin: true, scrub: 1 } });
    tl.fromTo(inner, { clipPath: 'inset(18% 22% 18% 22% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' })
      .fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
      .from(txt, { opacity: 0, y: 60, ease: 'power2.out', duration: .5 }, .45);
  });

  /* stacking cards */
  var scards = $$('.scard');
  scards.forEach(function (c, i) {
    var next = scards[i + 1]; if (!next) return;
    gsap.fromTo(c, { scale: 1, filter: 'brightness(1)' }, { scale: .9 + i * .012, filter: 'brightness(.9)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 25%', scrub: true } });
  });

  /* chart */
  $$('.chart').forEach(function (ch) {
    gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 75%' } })
      .to($$('.bar i', ch), { scaleY: 1, duration: 1.4, stagger: .07, ease: 'expo.out' })
      .to($$('.bar b', ch), { opacity: 1, duration: .5, stagger: .05 }, '-=1');
  });

  /* footer wordmark */
  var word = $('.ftr__word');
  if (word) {
    var chars = splitChars(word);
    gsap.to(chars, { y: 0, duration: 1.4, stagger: .035, ease: 'expo.out', scrollTrigger: { trigger: word, start: 'top 95%' } });
  }

  /* people float */
  var pf = $('.people-float');
  if (pf && fine) {
    var px = gsap.quickTo(pf, 'x', { duration: .6, ease: 'power3' }), py = gsap.quickTo(pf, 'y', { duration: .6, ease: 'power3' });
    var imgs = $$('img', pf);
    $$('.person').forEach(function (p, i) {
      p.addEventListener('pointerenter', function () { pf.classList.add('is-on'); imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); }); });
      p.addEventListener('pointerleave', function () { pf.classList.remove('is-on'); });
      p.addEventListener('pointermove', function (e) { px(e.clientX + 30); py(e.clientY - 140); });
    });
  }

  /* hero ghost parallax */
  var ghost = $('.hero__ghost');
  if (ghost) gsap.to(ghost, { xPercent: -25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // hash on load
  if (location.hash && lenis) {
    var t0 = document.querySelector(location.hash);
    if (t0 && !$('#catalog')) setTimeout(function () { lenis.scrollTo(t0, { offset: -90, immediate: true }); ScrollTrigger.refresh(); }, 120);
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  window.SBL_READY = true;
})();

/* ================= 3D packet carousel ================= */
(function () {
  'use strict';
  var stage = document.querySelector('.carousel'); if (!stage) return;
  var ring = stage.querySelector('.carousel__ring');
  var items = Array.prototype.slice.call(ring.children);
  var n = items.length;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nameEl = stage.querySelector('.carousel__label b'), catEl = stage.querySelector('.carousel__label small');
  var radius = 0, angle = 0, vel = reduce ? 0 : 0.12, tilt = 0, targetTilt = -8, dragging = false, lastX = 0, boost = 0, front = -1;

  function layout() {
    var w = stage.clientWidth;
    var cw = Math.max(110, Math.min(210, w * 0.36));
    stage.style.setProperty('--cw', cw + 'px');
    radius = Math.max(cw * 1.55, (cw * 1.05 * n) / (2 * Math.PI));
    items.forEach(function (it, i) {
      it.style.transform = 'rotateY(' + (i * 360 / n) + 'deg) translateZ(' + radius + 'px)';
    });
  }
  layout(); window.addEventListener('resize', layout);

  function render() {
    tilt += (targetTilt - tilt) * 0.06;
    ring.style.transform = 'translateZ(' + (-radius) + 'px) rotateX(' + tilt.toFixed(2) + 'deg) rotateY(' + angle.toFixed(2) + 'deg)';
    // depth shading + front detection
    var best = 0, bestCos = -2;
    for (var i = 0; i < n; i++) {
      var a = ((i * 360 / n + angle) % 360 + 360) % 360;
      var cos = Math.cos(a * Math.PI / 180);
      if (cos > bestCos) { bestCos = cos; best = i; }
      items[i].style.opacity = (0.35 + 0.65 * (cos + 1) / 2).toFixed(3);
      items[i].style.filter = cos < 0 ? 'blur(' + (-cos * 1.5).toFixed(1) + 'px)' : '';
    }
    if (best !== front) {
      front = best;
      if (nameEl) { nameEl.textContent = items[best].getAttribute('data-name'); catEl.textContent = items[best].getAttribute('data-cat'); }
    }
  }
  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(stage);
  function tick() {
    if (visible && !document.hidden) {
      if (!dragging) { angle -= vel + boost; boost *= 0.94; }
      render();
    }
    requestAnimationFrame(tick);
  }
  render();
  if (!reduce) requestAnimationFrame(tick);

  stage.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; stage.setPointerCapture && stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    targetTilt = -8 + ((e.clientY - r.top) / r.height - 0.5) * -14;
    if (!dragging) return;
    var d = e.clientX - lastX; lastX = e.clientX;
    angle += d * 0.35; boost = -d * 0.08;
    if (reduce) render();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { stage.addEventListener(ev, function () { dragging = false; targetTilt = -8; }); });
  // keyboard
  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { angle += 360 / n; render(); }
    if (e.key === 'ArrowRight') { angle -= 360 / n; render(); }
  });
  // scroll velocity boost
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () { var dy = window.scrollY - lastY; lastY = window.scrollY; boost += Math.max(-3, Math.min(3, dy * 0.02)); }, { passive: true });
})();

/* ================= WebGL silk background ================= */
(function () {
  'use strict';
  var c = document.getElementById('silk'); if (!c) return;
  var gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: true });
  if (!gl) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}',
    'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;',
    'float tt=t*.05;vec2 q=vec2(fbm(p+tt),fbm(p+vec2(5.2,1.3)-tt));',
    'vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+tt*1.5+m*.3),fbm(p+3.*q+vec2(8.3,2.8)-tt));',
    'float f=fbm(p+2.5*w);',
    'vec3 ivory=vec3(.961,.933,.875),sand=vec3(.93,.84,.66),saff=vec3(.88,.64,.17),wine=vec3(.48,.11,.18);',
    'vec3 col=mix(ivory,sand,smoothstep(.25,.75,f));col=mix(col,saff,smoothstep(.62,.95,f*length(q))*.55);',
    'col=mix(col,wine,smoothstep(.75,1.,w.x*f)*.35);',
    'col=mix(ivory,col,smoothstep(.0,.65,uv.x));',
    'gl_FragColor=vec4(col,1.);}'
  ].join('');
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm');
  var scale = 0.5; // render at half res for performance (it is a soft gradient)
  function size() { c.width = Math.max(2, c.clientWidth * scale); c.height = Math.max(2, c.clientHeight * scale); gl.viewport(0, 0, c.width, c.height); }
  size(); window.addEventListener('resize', size);
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', function (e) { tmx = e.clientX / innerWidth; tmy = e.clientY / innerHeight; }, { passive: true });
  var vis = true; if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(c);
  var t0 = performance.now();
  function draw() {
    mx += (tmx - mx) * .03; my += (tmy - my) * .03;
    gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, (performance.now() - t0) / 1000); gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  if (reduce) { draw(); return; }
  (function loop() { if (vis && !document.hidden) draw(); requestAnimationFrame(loop); })();
})();
