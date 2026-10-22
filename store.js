/* Doimiy ma'lumot ombori (localStorage): profil, sozlamalar, issiqxonalar, SMS tarixi, suhbat. */
(function (SG) {
  const KEY = SG.config.storageKey, DAY = 864e5;
  const listeners = new Set();
  let state;

  function defaults() {
    const now = Date.now(), iso = d => SG.ui.isoDate(now - d * DAY);
    const gh = (id, name, cropId, days, area, note) => {
      const c = SG.crops.get(cropId);
      return { id, name, cropId, planted: iso(days), area, min: c.min, max: c.max, auto: false, smsOn: true, note };
    };
    return {
      v: 3, seq: 4,
      profile: { name: 'Ozodbek', phone: '+998 90 123 45 67', email: '', farm: 'Mening issiqxonam', region: 'Buxoro viloyati', district: 'Jondor tumani', years: 3 },
      settings: { sms: true, onLow: true, onHigh: true, onOk: false, quiet: true, quietFrom: '22:00', quietTo: '06:00', theme: 'system' },
      greenhouses: [
        gh('g1', 'Issiqxona #1', 'tomato', 38, 120, 'Shimoliy blok'),
        gh('g2', 'Issiqxona #2', 'cucumber', 21, 90, 'Tomchilatib sug\'orish'),
        gh('g3', 'Issiqxona #3', 'pepper', 52, 80, '')
      ],
      sms: [], chat: [], readings: []
    };
  }

  function load() {
    const d = defaults();
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && (raw.v === 2 || raw.v === 3)) {
        return { ...d, ...raw, profile: { ...d.profile, ...raw.profile }, settings: { ...d.settings, ...raw.settings },
          greenhouses: Array.isArray(raw.greenhouses) ? raw.greenhouses : d.greenhouses,
          sms: raw.sms || [], chat: raw.chat || [], readings: Array.isArray(raw.readings) ? raw.readings.slice(-500) : [] , v: 3 };
      }
    } catch (e) { /* xotira mavjud emas */ }
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* e'tiborsiz */ } }
  function emit(topic) { save(); listeners.forEach(fn => fn(topic)); }

  state = load();

  SG.store = {
    get state() { return state; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    greenhouse: id => state.greenhouses.find(g => g.id === id),
    addGreenhouse(data) {
      const g = { auto: false, smsOn: true, note: '', ...data, id: 'g' + (state.seq++) };
      state.greenhouses.push(g); emit('greenhouses'); return g;
    },
    updateGreenhouse(id, patch) {
      const g = SG.store.greenhouse(id); if (!g) return;
      Object.assign(g, patch); emit('greenhouses');
    },
    removeGreenhouse(id) { state.greenhouses = state.greenhouses.filter(g => g.id !== id); emit('greenhouses'); },
    setProfile(p) { Object.assign(state.profile, p); emit('profile'); },
    setSettings(s) { Object.assign(state.settings, s); emit('settings'); },
    pushSms(entry) { state.sms.unshift(entry); if (state.sms.length > 60) state.sms.length = 60; emit('sms'); },
    clearSms() { state.sms = []; emit('sms'); },
    setChat(arr) { state.chat = arr.slice(-40); save(); },
    addReading(entry) { state.readings.push(entry); if (state.readings.length > 500) state.readings = state.readings.slice(-500); save(); },
    clearReadings() { state.readings = []; save(); },
    reset() { state = defaults(); emit('reset'); }
  };
})(window.SG);
