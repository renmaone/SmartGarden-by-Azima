/*
 * Datchik simulyatori (demo). Haqiqiy tizimda shu modul serverdan o'qiydigan
 * modul bilan almashtiriladi; interfeys: get, status, tick, setPump, drought, flood, events.
 */
(function (SG) {
  const cfg = SG.config, N = cfg.historyLen;
  const rt = {}, events = [];
  let ticks = 0, lastSavedAt = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seedMoisture = { g1: 58, g2: 84, g3: 41 };

  function log(text, kind) { events.unshift({ ts: Date.now(), text, kind: kind || 'info' }); if (events.length > 40) events.pop(); }

  function ensure(g) {
    if (rt[g.id]) return rt[g.id];
    const c = SG.crops.get(g.cropId);
    const m0 = seedMoisture[g.id] ?? clamp((g.min + g.max) / 2 + (Math.random() * 10 - 5), 10, 95);
    const r = { moisture: m0, temp: (c.tMin + c.tMax) / 2 + 2, humidity: 55 + Math.random() * 20, pump: false, hist: [], state: null };
    let v = m0;
    for (let i = 0; i < N; i++) { r.hist.unshift(v); v = clamp(v + (Math.random() * 1.6 - 0.5), 5, 98); }
    r.state = statusOf(g, r);
    rt[g.id] = r;
    return r;
  }
  function statusOf(g, r) { return r.moisture < g.min ? 'low' : r.moisture > g.max ? 'high' : 'ok'; }

  SG.sim = {
    events,
    get: g => ensure(g),
    status: g => statusOf(g, ensure(g)),
    log,
    tick() {
      ticks++;
      const changes = [], ids = new Set();
      SG.store.state.greenhouses.forEach(g => {
        ids.add(g.id);
        const r = ensure(g), c = SG.crops.get(g.cropId);
        if (g.auto) {
          const was = r.pump;
          if (r.moisture < g.min) r.pump = true;
          else if (r.moisture >= (g.min + g.max) / 2) r.pump = false;
          if (r.pump !== was) log(`${g.name}: avto-sug'orish ${r.pump ? 'yoqildi' : "o'chirildi"}`, 'info');
        }
        const dry = 0.25 + Math.random() * 0.35 + Math.max(0, r.temp - 24) * 0.02;
        r.moisture = clamp(r.moisture + (r.pump ? cfg.pumpRate : -dry), 5, 98);
        r.humidity = clamp(r.humidity + (Math.random() - 0.5) * 1.4, 30, 92);
        const mid = (c.tMin + c.tMax) / 2 + 2;
        r.temp = mid + 3.2 * Math.sin(ticks / 16 + g.id.length + g.name.length) + (Math.random() - 0.5) * 0.3;
        r.hist.push(r.moisture); if (r.hist.length > N) r.hist.shift();
        const st = statusOf(g, r);
        // O'lchovlar tarixini localStorage'ga daqiqasiga bir marta saqlash.
        if (Date.now() - lastSavedAt >= 60000) {
          SG.store.addReading({ ts: Date.now(), greenhouseId: g.id, greenhouse: g.name, moisture: +r.moisture.toFixed(1), temp: +r.temp.toFixed(1), humidity: +r.humidity.toFixed(1), status: st, pump: !!r.pump, source: 'demo' });
          lastSavedAt = Date.now();
        }
        if (st !== r.state) {
          const from = r.state; r.state = st;
          changes.push({ g, from, to: st });
          log(`${g.name} (${c.name}): ${cfg.labels[st].toLowerCase()}, ${r.moisture.toFixed(0)}%`, st);
        }
      });
      Object.keys(rt).forEach(id => { if (!ids.has(id)) delete rt[id]; });
      return changes;
    },
    togglePump(g) { const r = ensure(g); r.pump = !r.pump; log(`${g.name}: sug'orish ${r.pump ? "qo'lda yoqildi" : "qo'lda o'chirildi"}`, 'info'); },
    drought(g) { const r = ensure(g); r.pump = false; r.moisture = Math.max(8, g.min - 12); r.hist[r.hist.length - 1] = r.moisture; },
    flood(g) { const r = ensure(g); r.pump = false; r.moisture = Math.min(96, g.max + 14); r.hist[r.hist.length - 1] = r.moisture; },
    average() {
      const l = SG.store.state.greenhouses; if (!l.length) return null;
      return l.reduce((a, g) => a + ensure(g).moisture, 0) / l.length;
    }
  };
})(window.SG);
