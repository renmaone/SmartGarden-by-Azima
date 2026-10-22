/*
 * AI maslahatchi. Claude (sample imkoniyati) mavjud bo'lsa jonli ma'lumotlar bilan javob beradi,
 * bo'lmasa oflayn (qoidalar asosidagi) maslahatchiga o'tadi.
 */
(function (SG) {
  let sample = null, status = 'pending';
  const subs = new Set();
  const set = s => { status = s; subs.forEach(f => f(s)); };

  const INSTRUCTION =
    "Sen Smart Garden ilovasining AI maslahatchisisan: tajribali agronom. O'zbek tilida (lotin yozuvi) yoz. " +
    "Dehqonga oddiy, aniq va amaliy maslahat ber: qisqa abzatslar, kerak bo'lsa '-' bilan ro'yxat, muhim so'zlarni **qalin** qil. " +
    "Quyidagi JONLI ma'lumotlarga tayan, raqamlarni keltir, issiqxona nomini aytib ko'rsat. " +
    "Taxmin qilsang, buni ayt. Kasallik tashxisi uchun aniq ishonch bildirma, agronomga murojaat qilishni maslahat ber. " +
    "Mavzudan tashqari savollarga qisqa javob berib, issiqxonaga qayt. Javob 180 so'zdan oshmasin.";

  function init() {
    if (!(window.claude && window.claude.use)) return set('offline');
    window.claude.use('sample').then(s => { sample = s; set(s ? 'ready' : 'offline'); }).catch(() => set('offline'));
  }

  SG.ai = {
    get status() { return status; },
    onStatus(fn) { subs.add(fn); return () => subs.delete(fn); },
    init,
    /**
     * history: [{role:'user'|'assistant', content}], text: yangi savol.
     * Qaytaradi: {text, source:'claude'|'local'}
     */
    async ask(history, text, { onText, signal } = {}) {
      if (sample) {
        const msgs = history.slice(-10).map(m => ({ role: m.role, content: m.content }));
        msgs.push({ role: 'user', content: `${INSTRUCTION}\n\n[JONLI MA'LUMOTLAR]\n${SG.advice.contextText()}\n\n[SAVOL]\n${text}` });
        try {
          const res = await sample(msgs, { onText: o => onText && onText(o.text), signal, cache: false });
          return { text: res.text, source: 'claude' };
        } catch (e) {
          if (signal && signal.aborted) throw e;
          if (e && e.code === 'not_granted') set('offline');
          const why = e && e.code === 'rate_limited' ? "So'rovlar ko'p, biroz kuting. Hozircha oflayn maslahat:\n\n" : "AI bilan bog'lanib bo'lmadi. Oflayn maslahat:\n\n";
          return { text: why + SG.advice.localAnswer(text), source: 'local' };
        }
      }
      await new Promise(r => setTimeout(r, 450));
      return { text: SG.advice.localAnswer(text), source: 'local' };
    }
  };
})(window.SG);
