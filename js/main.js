/* Sua Marca: comportamentos progressivos. A página funciona sem este arquivo. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var mobileQuery = window.matchMedia('(max-width: 59.99em)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu no celular ---------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;
    function set(open) { nav.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); }
    function sync() { set(!mobileQuery.matches); if (!mobileQuery.matches) toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () { set(nav.hidden); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && mobileQuery.matches) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileQuery.matches && !nav.hidden) { set(false); toggle.focus(); }
    });
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', sync);
    sync();
  }

  /* Formulário de contato ---------------------------------------------- */
  function initForm() {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (!form || !status) return;
    var msg = { required: 'Campo obrigatório', contact: 'Informe um telefone ou email válido',
      success: 'Mensagem enviada. Retornamos em breve.', error: 'Confira os campos destacados.' };
    function isContact(v) {
      var d = v.replace(/\D/g, '');
      return (d.length >= 10 && d.length <= 13) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    function setError(field, text) {
      var wrap = field.closest('.field'), id = field.id + '-error', el = document.getElementById(id);
      if (!wrap) return;
      wrap.classList.toggle('is-invalid', !!text);
      if (!text) { field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); if (el) el.remove(); return; }
      if (!el) { el = document.createElement('p'); el.className = 'form__error'; el.id = id; wrap.appendChild(el); }
      el.textContent = text; field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', id);
    }
    function validate(field) {
      var v = field.value.trim();
      if (!field.required && !v) { setError(field, ''); return true; }
      if (!v) { setError(field, msg.required); return false; }
      if (field.id === 'telefone' && !isContact(v)) { setError(field, msg.contact); return false; }
      setError(field, ''); return true;
    }
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { validate(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (f) { if (!validate(f) && !first) first = f; });
      status.className = 'form__status ' + (first ? 'is-error' : 'is-success');
      status.textContent = first ? msg.error : msg.success;
      if (first) { first.focus(); return; }
      form.reset(); /* Sem backend no demo: a mensagem de sucesso é estática. */
    });
  }

  /* Transições ao rolar: cada seção com um movimento próprio ---------------- */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var map = [
      ['.hero .label', 'rv-down'], ['.hero__title, .hero__lead, .hero__actions', 'rv-up'], ['.hero__media', 'rv-fade'],
      ['#solucoes .col-label, #como-trabalhamos .col-label, #quem-somos .col-label, #contato .col-label', 'rv-up'],
      ['.numbered li:nth-child(odd)', 'rv-left'], ['.numbered li:nth-child(even)', 'rv-right'],
      ['.steps li', 'rv-cascade'], ['#quem-somos .prose > p, .fineprint', 'rv-blur'], ['.facts', 'rv-wipe'],
      ['#contato .btn, .form', 'rv-pop']
    ];
    var items = [];
    map.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el) { el.classList.add('reveal', pair[1]); items.push(el); });
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* Rolagem: barra de progresso e header compacto ---------- */
  function initScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var bar = null;
    if (!reduceMotion) {
      bar = document.createElement('div');
      bar.className = 'progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
    }
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 24);
      if (!bar) return;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* Ano no rodapé ------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  initNav();
  initForm();
  initReveal();
  initScroll();
})();
