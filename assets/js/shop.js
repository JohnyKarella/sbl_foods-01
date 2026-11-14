/* SBL Foods — Version B catalogue: filters, search, enquiry drawer */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = document.documentElement.classList.contains('reduce') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var grid = $('#catalog');
  if (grid) {
    var cards = $$('.flip', grid), tabs = $$('[data-filter]'), search = $('#q'), count = $('#count'), empty = $('#empty');
    var st = { cat: 'all', q: '' };
    function apply(anim) {
      var shown = [];
      cards.forEach(function (c) {
        var ok = (st.cat === 'all' || c.dataset.cat === st.cat) && (!st.q || c.dataset.search.indexOf(st.q) > -1);
        c.classList.toggle('is-hidden', !ok); if (ok) shown.push(c);
      });
      count.textContent = shown.length + ' product' + (shown.length === 1 ? '' : 's');
      empty.hidden = shown.length > 0;
      if (window.gsap) {
        if (anim && !reduce) gsap.fromTo(shown.slice(0, 16), { opacity: 0, y: 30, rotateY: -25 }, { opacity: 1, y: 0, rotateY: 0, duration: .8, stagger: .035, ease: 'expo.out', overwrite: true });
        gsap.set(shown.slice(16), { opacity: 1, y: 0 });
        window.ScrollTrigger && ScrollTrigger.refresh();
      }
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t); });
        st.cat = t.dataset.filter; apply(true);
        history.replaceState && history.replaceState(null, '', st.cat === 'all' ? location.pathname : '#' + st.cat);
      });
    });
    var tm; search.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(function () { st.q = search.value.trim().toLowerCase(); apply(true); }, 140); });
    function fromHash(first) {
      var h = location.hash.slice(1), t = tabs.filter(function (x) { return x.dataset.filter === h; })[0];
      if (t) {
        t.click();
        var top = $('.filters').getBoundingClientRect().top + window.scrollY - 10;
        setTimeout(function () { window.SBL_LENIS ? window.SBL_LENIS.scrollTo(top, { immediate: first }) : window.scrollTo(0, top); }, first ? 200 : 0);
      } else if (first) apply(false);
    }
    window.addEventListener('hashchange', function () { fromHash(false); });
    fromHash(true);
  }

  /* drawer */
  var dr = $('#drawer'); if (!dr) return;
  var last = null;
  function open(card) {
    last = document.activeElement;
    $('#d-title', dr).textContent = card.dataset.name;
    $('#d-cat', dr).textContent = card.dataset.catlabel;
    var img = $('img', card); $('#d-img', dr).src = img.getAttribute('src'); $('#d-img', dr).alt = card.dataset.name + ' pack';
    $('#d-product', dr).value = card.dataset.name;
    var picks = $('#d-sizes', dr); picks.innerHTML = '';
    card.dataset.sizes.split('|').forEach(function (s, i) {
      var l = document.createElement('label'); l.innerHTML = '<input type="checkbox" name="pack" value="' + s + '"' + (i ? '' : ' checked') + '><span>' + s + '</span>'; picks.appendChild(l);
    });
    $('.form__ok', dr).classList.remove('is-on');
    dr.classList.add('is-open'); dr.setAttribute('aria-hidden', 'false');
    window.SBL_LENIS && window.SBL_LENIS.stop(); document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { $('#d-name', dr).focus(); }, 300);
  }
  function close() {
    dr.classList.remove('is-open'); dr.setAttribute('aria-hidden', 'true');
    window.SBL_LENIS && window.SBL_LENIS.start(); document.documentElement.style.overflow = '';
    last && last.focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-enquire]'); if (b) { e.preventDefault(); open(b.closest('.flip')); }
    if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!dr.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var f = $$('button,input,select,textarea,a', $('.drawer__panel', dr)).filter(function (x) { return x.offsetParent; });
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('form', dr).addEventListener('submit', function (e) {
    e.preventDefault(); var form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var fd = new FormData(form);
    var body = 'Product: ' + fd.get('product') + '\nPack sizes: ' + fd.getAll('pack').join(', ') + '\nQuantity: ' + (fd.get('qty') || '-') + '\n\nName: ' + fd.get('name') + '\nCompany: ' + (fd.get('company') || '-') + '\nPhone: ' + fd.get('phone') + '\nCity: ' + (fd.get('city') || '-') + '\n\n' + (fd.get('message') || '');
    location.href = 'mailto:sbaf@sblfoods.com?subject=' + encodeURIComponent('Product enquiry: ' + fd.get('product')) + '&body=' + encodeURIComponent(body);
    $('.form__ok', dr).classList.add('is-on');
  });
})();
