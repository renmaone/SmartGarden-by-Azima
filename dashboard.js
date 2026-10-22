/* Boshqaruv paneli: KPI, issiqxona kartalari, tanlangan issiqxona tafsiloti, hodisalar. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state;
  let selId = null, root = null;
  const $ = (s) => U.$(s, root);

  const sel = () => {
    const l = S().greenhouses;
    return l.find(g => g.id === selId) || (selId = l[0] && l[0].id, l[0]);
  };

  function kpis() {
    const l = S().greenhouses, avg = SG.sim.average();
    const alerts = l.filter(g => SG.sim.status(g) !== 'ok').length;
    const area = l.reduce((a, g) => a + (+g.area || 0), 0);
    const crops = new Set(l.map(g => g.cropId)).size;
    const today = S().sms.filter(m => new Date(m.ts).toDateString() === new Date().toDateString()).length;
    $('#kpis').innerHTML = `
      <div class="kpi"><div class="label">Issiqxonalar</div><div class="v mono">${l.length}</div><div class="s">${area} m² maydon</div></div>
      <div class="kpi"><div class="label">Ekin turlari</div><div class="v mono">${crops}</div><div class="s">${[...new Set(l.map(g => SG.crops.get(g.cropId).name))].join(', ') || '-'}</div></div>
      <div class="kpi"><div class="label">O'rtacha namlik</div><div class="v mono">${avg == null ? '-' : avg.toFixed(0)}<small>%</small></div><div class="s">barcha issiqxonalar bo'yicha</div></div>
      <div class="kpi ${alerts ? (alerts > 1 ? 'crit' : 'warn') : ''}"><div class="label">Ogohlantirishlar</div><div class="v mono">${alerts}</div><div class="s">bugun ${today} ta SMS</div></div>`;
  }

  function cards() {
    const host = $('#cards'), l = S().greenhouses;
    if (host.children.length !== l.length || l.some((g, i) => host.children[i].dataset.id !== g.id)) {
      host.innerHTML = l.map(g => `<button class="card" data-id="${g.id}"></button>`).join('');
    }
    l.forEach((g, i) => {
      const r = SG.sim.get(g), c = SG.crops.get(g.cropId), st = SG.sim.status(g), days = U.daysSince(g.planted), stg = SG.crops.stageAt(c, days);
      const el = host.children[i];
      el.setAttribute('aria-pressed', g.id === selId);
      el.innerHTML = `
        <div class="row"><div class="who">${U.avatar(c, 40)}<div><div class="name">${U.esc(g.name)}</div><div class="crop">${c.name} · ${stg.name}</div></div></div>${U.pill(st)}</div>
        <div class="big mono">${r.moisture.toFixed(0)}<small>%</small>${r.pump ? `<span class="pumping">${U.icon('drop', 14)} sug'orilmoqda</span>` : ''}</div>
        <div class="bar"><div class="zone" style="left:${g.min}%;width:${g.max - g.min}%"></div><div class="mk" style="left:${r.moisture}%"></div></div>
        <div class="mini mono"><span>${r.temp.toFixed(1)} °C</span><span>havo ${r.humidity.toFixed(0)}%</span><span>${days}-kun</span></div>`;
    });
  }

  function detail() {
    const g = sel(); if (!g) return;
    const r = SG.sim.get(g), c = SG.crops.get(g.cropId), st = SG.sim.status(g), days = U.daysSince(g.planted), stg = SG.crops.stageAt(c, days);
    const left = Math.max(0, c.cycle - days), pct = Math.min(100, Math.round(days / c.cycle * 100));
    $('#d-head').innerHTML = `${U.avatar(c, 52)}
      <div class="grow"><h2>${U.esc(g.name)}</h2><div class="note">${c.name} · ${stg.name} · ${days}-kun · ${g.area} m²${g.note ? ' · ' + U.esc(g.note) : ''}</div></div>
      <div class="life"><div class="lt"><span>Hosilgacha</span><span class="mono">${left} kun</span></div><div class="prog"><i style="width:${pct}%"></i></div></div>`;
    const tState = r.temp > c.tMax ? 'high' : r.temp < c.tMin ? 'low' : 'ok';
    const hState = r.humidity > 85 ? 'high' : r.humidity < 40 ? 'low' : 'ok';
    $('#d-stats').innerHTML = `
      <div class="stat ${st}"><div class="label">Tuproq namligi</div><div class="v mono">${r.moisture.toFixed(1)}%</div><div class="h">optimal ${g.min}-${g.max}% · ${SG.config.labels[st]}</div></div>
      <div class="stat ${tState}"><div class="label">Harorat</div><div class="v mono">${r.temp.toFixed(1)} °C</div><div class="h">${c.name} uchun ${c.tMin}-${c.tMax} °C</div></div>
      <div class="stat ${hState}"><div class="label">Havo namligi</div><div class="v mono">${r.humidity.toFixed(0)}%</div><div class="h">me'yor 40-85%</div></div>`;
    SG.chart.render($('#chart'), g);
    $('#d-advice').innerHTML = SG.advice.html(g);
    const set = (id, t) => { const e = $(id); if (e.textContent !== t) e.textContent = t; };
    set('#min-v', g.min + '%'); set('#max-v', g.max + '%');
    $('#pump').setAttribute('aria-pressed', r.pump); set('#pump', r.pump ? "Sug'orishni o'chirish" : "Sug'orishni yoqish");
    $('#auto').setAttribute('aria-pressed', !!g.auto); set('#auto', "Avto-sug'orish: " + (g.auto ? 'yoqiq' : "o'chiq"));
  }

  function syncSliders() { const g = sel(); if (!g) return; $('#min').value = g.min; $('#max').value = g.max; }

  function events() {
    const ev = SG.sim.events;
    $('#events').innerHTML = ev.length ? ev.map(e => `<div class="ev ${e.kind}"><time class="mono">${U.time(e.ts)}</time><span class="dt"></span><span>${U.esc(e.text)}</span></div>`).join('')
      : '<div class="empty">Hodisalar paydo bo\'lishi bilan shu yerda ko\'rinadi.</div>';
  }

  function render(el) {
    root = el;
    if (!S().greenhouses.length) {
      root.innerHTML = `<div class="panel"><div class="empty">Hozircha issiqxona yo'q.<br><br><a class="btn primary" href="#issiqxonalar">${U.icon('plus', 18)} Issiqxona qo'shish</a></div></div>`;
      return;
    }
    root.innerHTML = `
      <section class="kpis" id="kpis"></section>
      <div class="cards" id="cards" role="group" aria-label="Issiqxonalar"></div>
      <div class="dash-grid">
        <div class="panel">
          <div class="d-head" id="d-head"></div>
          <div class="stats" id="d-stats"></div>
          <div class="panel-head" style="margin:8px 0 6px"><span class="label">Namlik tarixi, oxirgi 48 o'lchov</span></div>
          <svg id="chart" viewBox="0 0 640 230" role="img" aria-label="Tuproq namligi grafigi"></svg>
          <div class="advice-list" id="d-advice"></div>
          <div class="controls">
            <div class="ctl"><label for="min"><span>Minimal chegara</span><b class="mono" id="min-v"></b></label><input type="range" id="min" min="10" max="60" step="1"></div>
            <div class="ctl"><label for="max"><span>Maksimal chegara</span><b class="mono" id="max-v"></b></label><input type="range" id="max" min="50" max="95" step="1"></div>
          </div>
          <div class="btns" style="margin-top:16px">
            <button class="btn" id="pump" aria-pressed="false"></button>
            <button class="btn" id="auto" aria-pressed="false"></button>
            <button class="btn" id="reset-th">${U.icon('refresh', 16)} Ekin me'yoriga qaytarish</button>
          </div>
          <div class="btns" style="margin-top:8px">
            <button class="btn small" id="dry">Qurg'oqchilik simulyatsiyasi</button>
            <button class="btn small" id="wet">Ortiqcha suv simulyatsiyasi</button>
          </div>
        </div>
        <div class="panel"><div class="panel-head"><h2>So'nggi hodisalar</h2></div><div class="events" id="events"></div></div>
      </div>`;
    syncSliders();
    bind(); update();
  }

  function bind() {
    const gap = SG.config.thresholdGap;
    $('#cards').addEventListener('click', e => {
      const c = e.target.closest('.card'); if (!c) return;
      selId = c.dataset.id; syncSliders(); update();
    });
    $('#min').addEventListener('input', e => { const g = sel(), v = Math.min(+e.target.value, g.max - gap); e.target.value = v; SG.store.updateGreenhouse(g.id, { min: v }); update(); });
    $('#max').addEventListener('input', e => { const g = sel(), v = Math.max(+e.target.value, g.min + gap); e.target.value = v; SG.store.updateGreenhouse(g.id, { max: v }); update(); });
    $('#pump').addEventListener('click', () => { SG.sim.togglePump(sel()); update(); });
    $('#auto').addEventListener('click', () => { const g = sel(); SG.store.updateGreenhouse(g.id, { auto: !g.auto }); update(); });
    $('#reset-th').addEventListener('click', () => { const g = sel(), c = SG.crops.get(g.cropId); SG.store.updateGreenhouse(g.id, { min: c.min, max: c.max }); syncSliders(); update(); U.toast(`${c.name} uchun me'yor tiklandi: ${c.min}-${c.max}%`); });
    $('#dry').addEventListener('click', () => { SG.sim.drought(sel()); update(); });
    $('#wet').addEventListener('click', () => { SG.sim.flood(sel()); update(); });
  }

  function update() {
    if (!root || !S().greenhouses.length) return;
    sel(); kpis(); cards(); detail(); events();
  }

  SG.router.register('dashboard', { title: 'Boshqaruv paneli', icon: 'dashboard', render, update });
})(window.SG);
