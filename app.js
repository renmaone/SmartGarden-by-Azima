/* Ilova qobig'i: navigatsiya, mavzu, yuqori panel, davriy yangilanish. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state, $ = id => document.getElementById(id);
  const SHORT = { dashboard: 'Panel', datchiklar: 'Datchik', issiqxonalar: 'Issiqxona', maslahatchi: 'AI', xabarlar: 'SMS', profil: 'Profil' };

  function applyTheme() {
    const t = S().settings.theme, r = document.documentElement;
    if (t === 'light' || t === 'dark') r.setAttribute('data-theme', t); else r.removeAttribute('data-theme');
  }
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  function alerts() { return S().greenhouses.filter(g => SG.sim.status(g) !== 'ok').length; }

  function buildNav() {
    const ids = SG.router.order, V = SG.router.views;
    $('nav').innerHTML = ids.map(id => `<a href="#${id}" data-id="${id}">${U.icon(V[id].icon, 20)}<span>${V[id].title}</span>${id === 'xabarlar' ? '<span class="count" id="nav-count" hidden></span>' : ''}</a>`).join('');
    $('bnav').innerHTML = ids.map(id => `<a href="#${id}" data-id="${id}">${U.icon(V[id].icon, 22)}<span>${SHORT[id]}</span></a>`).join('');
  }

  /** Navigatsiya holati, sarlavha, profil chipi, bildirishnoma belgisi. */
  function chrome() {
    const cur = SG.router.current, V = SG.router.views, p = S().profile, n = alerts();
    U.$$('[data-id]', document).forEach(a => { if (a.tagName === 'A') { if (a.dataset.id === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); } });
    if (cur) { $('page-title').textContent = V[cur].title; document.title = 'Smart Garden'; }
    $('me-name').textContent = p.name || 'Dehqon';
    $('me-av').textContent = U.initials(p.name);
    $('side-name').textContent = p.name || 'Dehqon';
    $('side-farm').textContent = p.farm; $('me-av2').textContent = U.initials(p.name);
    const b = $('bell-badge'); b.hidden = !n; b.textContent = n;
    const c = $('nav-count'); if (c) { c.hidden = !n; c.textContent = n; }
    $('theme-btn').innerHTML = U.icon(isDark() ? 'sun' : 'leaf', 20);
  }

  function clock() { $('clock').textContent = new Date().toLocaleTimeString('uz-UZ', { hour12: false }); }

  function boot() {
    applyTheme();
    buildNav();
    SG.ai.init();
    // Birinchi ishga tushirishda normal bo'lmagan issiqxonalar uchun namuna SMS
    if (!S().sms.length) S().greenhouses.forEach(g => { const st = SG.sim.status(g); if (st !== 'ok') SG.sms.auto(g, st); });
    SG.router.mount($('view'));
    clock();
    $('theme-btn').addEventListener('click', () => { SG.store.setSettings({ theme: isDark() ? 'light' : 'dark' }); applyTheme(); chrome(); });
    $('bell').addEventListener('click', () => SG.router.go('xabarlar'));
    SG.store.subscribe(t => { if (t !== 'sms') chrome(); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', chrome);
    setInterval(() => {
      const changes = SG.sim.tick();
      changes.forEach(c => SG.sms.auto(c.g, c.to));
      clock(); chrome(); SG.router.tick();
    }, SG.config.tickMs);
  }

  SG.app = { applyTheme, chrome, boot };
  boot();
})(window.SG);
