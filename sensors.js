/* Datchiklar sahifasi: joriy ko'rsatkichlar va saqlangan o'lchovlar tarixi. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state;
  let root;
  const esc = U.esc;
  function render(el) {
    root = el;
    root.innerHTML = `
      <div class="panel">
        <div class="panel-head"><div><h2>${U.icon('sensor', 22)} Datchiklar holati</h2><p class="note">Qiymatlar avtomatik yangilanadi. Demo rejimida haqiqiy qurilma emas, simulyator ishlaydi.</p></div><button class="btn small" id="export-readings">CSV yuklab olish</button></div>
        <div class="cards" id="sensor-cards"></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h2>O'lchovlar tarixi</h2><p class="note">Oxirgi 500 tagacha yozuv brauzer xotirasida saqlanadi.</p></div><button class="btn small" id="clear-readings">Tarixni tozalash</button></div>
        <div style="overflow:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th>Vaqt</th><th>Issiqxona</th><th>Tuproq</th><th>Harorat</th><th>Havo namligi</th><th>Holat</th><th>Sug'orish</th></tr></thead><tbody id="readings-body"></tbody></table></div>
        <p class="note" id="history-empty"></p>
      </div>`;
    root.querySelector('#export-readings').addEventListener('click', exportCsv);
    root.querySelector('#clear-readings').addEventListener('click', () => {
      if (confirm("Saqlangan o'lchovlar tarixini tozalaysizmi?")) { SG.store.clearReadings(); update(); }
    });
    update();
  }
  function update() {
    if (!root) return;
    const list = S().greenhouses;
    root.querySelector('#sensor-cards').innerHTML = list.map(g => {
      const r = SG.sim.get(g), status = SG.sim.status(g), label = SG.config.labels[status];
      const stamp = new Date().toLocaleTimeString('uz-UZ', {hour12:false});
      return `<div class="card"><div class="row"><div><div class="name">${esc(g.name)}</div><div class="crop">${esc(SG.crops.get(g.cropId).name)}</div></div>${U.pill(status)}</div>
      <div class="sensor-reading"><span class="sensor-symbol soil">${U.icon('leaf', 20)}</span><div class="big mono">${r.moisture.toFixed(1)}<small>% tuproq namligi</small></div></div>
      <div class="bar"><div class="zone" style="left:${g.min}%;width:${g.max-g.min}%"></div><div class="mk" style="left:${r.moisture}%"></div></div>
      <div class="mini"><span>${U.icon('thermo', 16)} Harorat ${r.temp.toFixed(1)} °C</span><span>${U.icon('humidity', 16)} Havo ${r.humidity.toFixed(0)}%</span></div>
      <div class="note">Holat: ${label} · Sug'orish: ${r.pump ? 'yoqilgan' : "o'chiq"}</div><div class="note">Yangilandi: ${stamp}</div></div>`;
    }).join('') || '<div class="empty">Issiqxona topilmadi.</div>';
    const readings = S().readings.slice().reverse();
    root.querySelector('#readings-body').innerHTML = readings.map(x => `<tr><td>${new Date(x.ts).toLocaleString('uz-UZ')}</td><td>${esc(x.greenhouse)}</td><td>${x.moisture}%</td><td>${x.temp} °C</td><td>${x.humidity}%</td><td>${esc(SG.config.labels[x.status] || x.status)}</td><td>${x.pump ? 'Yoqilgan' : "O'chiq"}</td></tr>`).join('');
    root.querySelector('#history-empty').textContent = readings.length ? `Jami ${readings.length} ta saqlangan o'lchov.` : "Hali tarix yo'q. Birinchi o'lchov taxminan 1 daqiqada saqlanadi.";
  }
  function exportCsv() {
    const rows = [['timestamp','greenhouse','moisture_percent','temperature_c','air_humidity_percent','status','pump']];
    S().readings.forEach(x => rows.push([new Date(x.ts).toISOString(),x.greenhouse,x.moisture,x.temp,x.humidity,x.status,x.pump]));
    const csv = rows.map(r => r.map(v => '"'+String(v ?? '').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'})); a.download = 'smart-garden-readings.csv'; a.click(); URL.revokeObjectURL(a.href);
  }
  SG.router.register('datchiklar', { title: 'Datchiklar holati', icon: 'activity', render, update });
})(window.SG);
