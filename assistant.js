/* AI maslahatchi: jonli ma'lumotlarga asoslangan suhbat. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state;
  let root = null, busy = false, ctrl = null, unsub = null;
  const $ = s => U.$(s, root);

  const STATUS = { pending: 'Ulanmoqda…', ready: "Claude AI · jonli ma'lumotlar bilan", offline: "Oflayn rejim · qoidalar asosida" };
  const QUICK = ["Hozir qaysi issiqxonani sug'orish kerak?", "Bu hafta uchun reja tuzib ber", "Qanday o'g'it berishim kerak?", "Barglar sarg'ayib ketdi, nima qilay?", "Hosilgacha qancha qoldi?"];

  function bubble(m, streaming) {
    if (m.role === 'user') return `<div class="bubble user">${U.esc(m.content).replace(/\n/g, '<br>')}</div>`;
    const body = streaming && !m.content ? '<span class="typing"><i></i><i></i><i></i></span>' : U.md(m.content);
    const src = m.source && !streaming ? `<span class="src">${m.source === 'claude' ? 'Claude AI' : 'Oflayn maslahatchi'}</span>` : '';
    return `<div class="bubble bot">${body}${src}</div>`;
  }

  function welcome() {
    return { role: 'assistant', content: `Assalomu alaykum, **${S().profile.name || 'dehqon'}**! Men Smart Garden AI maslahatchisiman. Issiqxonalaringizdagi namlik, harorat va ekin bosqichlarini ko'rib turibman.\n\nSug'orish, o'g'itlash, kasalliklar yoki haftalik reja bo'yicha so'rang.` };
  }

  function log(streamingMsg) {
    const msgs = [welcome(), ...S().chat];
    if (streamingMsg) msgs.push(streamingMsg);
    const el = $('#chat-log');
    el.innerHTML = msgs.map((m, i) => bubble(m, streamingMsg && i === msgs.length - 1)).join('');
    el.scrollTop = el.scrollHeight;
  }

  function ctx() {
    const l = S().greenhouses;
    $('#ctx').innerHTML = l.length ? l.map(g => {
      const s = SG.advice.snapshot(g);
      return `<div class="ctx-item">${U.avatar(s.c, 34)}<div class="grow"><b>${U.esc(g.name)}</b><span>${s.c.name} · ${s.stage.name} · ${s.r.moisture.toFixed(0)}% · ${s.r.temp.toFixed(0)} °C</span></div>${U.pill(s.st)}</div>`;
    }).join('') : '<div class="empty">Issiqxona qo\'shilmagan.</div>';
  }

  function setStatus(s) {
    const el = $('#ai-status'); if (!el) return;
    el.className = 'st ' + s; el.innerHTML = `<i></i>${STATUS[s]}`;
  }

  async function send(text) {
    text = text.trim(); if (!text || busy) return;
    busy = true; ctrl = new AbortController();
    const history = S().chat.map(m => ({ role: m.role, content: m.content }));
    S().chat.push({ role: 'user', content: text, ts: Date.now() });
    const live = { role: 'assistant', content: '' };
    log(live); setBusy(true);
    try {
      const res = await SG.ai.ask(history, text, { signal: ctrl.signal, onText: t => { live.content = t; log(live); } });
      S().chat.push({ role: 'assistant', content: res.text, source: res.source, ts: Date.now() });
    } catch (e) {
      if (live.content) S().chat.push({ role: 'assistant', content: live.content + '\n\n(to\'xtatildi)', source: 'claude', ts: Date.now() });
      else S().chat.pop();
    }
    SG.store.setChat(S().chat);
    busy = false; ctrl = null; setBusy(false); log(); ctx();
    const i = $('#chat-input'); i && i.focus();
  }

  function setBusy(b) {
    const btn = $('#chat-send'); if (!btn) return;
    btn.innerHTML = b ? `${U.icon('stop', 18)} To'xtatish` : `${U.icon('send', 18)} Yuborish`;
    btn.dataset.busy = b ? '1' : '';
    $('#chat-input').disabled = b;
  }

  function render(el) {
    root = document.createElement('div'); el.appendChild(root);
    root.innerHTML = `<div class="ai-layout">
      <div class="panel chat">
        <div class="chat-head">
          <div class="ai-badge"><span class="logo">${U.icon('spark', 22)}</span><div><b>AI maslahatchi</b><span class="st" id="ai-status"></span></div></div>
          <button class="btn small" id="ai-clear">${U.icon('refresh', 15)} Suhbatni tozalash</button>
        </div>
        <div class="chat-log" id="chat-log" aria-live="polite"></div>
        <div class="chips" id="chips">${QUICK.map(q => `<button class="chip" type="button">${U.esc(q)}</button>`).join('')}</div>
        <form class="chat-form" id="chat-form">
          <textarea id="chat-input" rows="1" placeholder="Savolingizni yozing…" aria-label="Savol"></textarea>
          <button class="btn primary" id="chat-send" type="submit"></button>
        </form>
      </div>
      <aside class="panel"><div class="panel-head"><h2>Jonli kontekst</h2></div><p class="note" style="margin-bottom:8px">AI javob berishda shu ma'lumotlarga tayanadi.</p><div id="ctx"></div></aside>
    </div>`;
    setStatus(SG.ai.status); setBusy(false); log(); ctx();
    unsub = SG.ai.onStatus(setStatus);

    const input = $('#chat-input');
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chat-form').requestSubmit(); } });
    $('#chat-form').addEventListener('submit', e => {
      e.preventDefault();
      if (busy) { ctrl && ctrl.abort(); return; }
      const t = input.value; input.value = ''; input.style.height = 'auto'; send(t);
    });
    $('#chips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) send(c.textContent); });
    $('#ai-clear').addEventListener('click', () => { if (busy) return; SG.store.setChat([]); S().chat.length = 0; log(); U.toast('Suhbat tozalandi'); });
  }

  function destroy() { unsub && unsub(); unsub = null; }
  function update() { if (!busy && root && U.$('#ctx', root)) ctx(); }
  SG.router.register('maslahatchi', { title: 'AI maslahatchi', icon: 'spark', render, update, destroy });
})(window.SG);
