/* Oddiy hash-router: #dashboard, #datchiklar, #issiqxonalar, #maslahatchi, #xabarlar, #profil. */
(function (SG) {
  const views = {}, order = [];
  let current = null, root = null;

  SG.router = {
    register(id, view) { views[id] = view; order.push(id); },
    get order() { return order; },
    get views() { return views; },
    get current() { return current; },
    mount(el) { root = el; window.addEventListener('hashchange', () => this.go(this.fromHash(), true)); this.go(this.fromHash(), true); },
    fromHash() { const h = location.hash.replace('#', ''); return views[h] ? h : 'dashboard'; },
    go(id, fromHash) {
      if (!views[id]) id = 'dashboard';
      if (!fromHash && location.hash !== '#' + id) { location.hash = id; return; }
      if (current && views[current].destroy) views[current].destroy();
      current = id;
      root.innerHTML = '';
      views[id].render(root);
      SG.app && SG.app.chrome();
      window.scrollTo(0, 0);
    },
    refresh() { if (current) { root.innerHTML = ''; views[current].render(root); } },
    tick() { if (current && views[current].update) views[current].update(); }
  };
})(window.SG);
