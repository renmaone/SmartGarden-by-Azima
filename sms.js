/*
 * SMS ogohlantirish. Hozir xabar tarixga yoziladi (namuna), haqiqiy yuborilmaydi.
 * Real yuborish uchun deliver() ichida server orqali Twilio yoki mahalliy gateway chaqiriladi.
 */
(function (SG) {
  const S = () => SG.store.state;

  function text(g, st) {
    const c = SG.crops.get(g.cropId), m = Math.round(SG.sim.get(g).moisture), head = `${g.name} (${c.name})`;
    if (st === 'low') return `${head}: Tuproq namligi ${m}%. Sug'orish tavsiya etiladi. Optimal: ${g.min}-${g.max}%.`;
    if (st === 'high') return `${head}: Namlik ${m}%. Ortig'i suv. Ventilyatsiya yoki drenaj kerak.`;
    return `${head}: Namlik ${m}%. Holat yaxshi. Keyingi tekshiruv 6 soatdan keyin.`;
  }
  function inQuiet() {
    const s = S().settings; if (!s.quiet) return false;
    const m = v => { const [h, mi] = String(v).split(':').map(Number); return h * 60 + (mi || 0); };
    const d = new Date(), now = d.getHours() * 60 + d.getMinutes(), a = m(s.quietFrom), b = m(s.quietTo);
    return a === b ? false : a < b ? (now >= a && now < b) : (now >= a || now < b);
  }
  function wanted(g, st) {
    const s = S().settings;
    return s.sms && g.smsOn && ((st === 'low' && s.onLow) || (st === 'high' && s.onHigh) || (st === 'ok' && s.onOk));
  }
  function deliver(entry) { /* <- real integratsiya nuqtasi (serverga POST) */ SG.store.pushSms(entry); }

  SG.sms = {
    text,
    /** Avtomatik yuborish: sozlamalarga amal qiladi. */
    auto(g, st) {
      if (!wanted(g, st)) return false;
      deliver({ id: Date.now() + Math.random(), ts: Date.now(), ghId: g.id, ghName: g.name, state: st, text: text(g, st),
        to: S().profile.phone, status: inQuiet() ? 'delayed' : 'sent' });
      return true;
    },
    /** Qo'lda test xabari. */
    test(g, st) {
      deliver({ id: Date.now() + Math.random(), ts: Date.now(), ghId: g.id, ghName: g.name, state: st, text: text(g, st),
        to: S().profile.phone, status: 'test' });
    },
    statusLabel: s => ({ sent: 'Yuborildi (namuna)', delayed: 'Tinch soat: ertalab yuboriladi', test: 'Test' }[s] || s)
  };
})(window.SG);
