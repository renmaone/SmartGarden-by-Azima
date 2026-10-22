/* SMS xabarlar: tarix, test yuborish, qabul qiluvchi va shablonlar. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state;
  let root = null, filter = 'all', unsub = null;
  const $ = s => U.$(s, root);

  function list() {
    const items = S().sms.filter(m => filter === 'all' || m.ghId === filter);
    $('#sms-count').textContent = `${items.length} ta`;
    $('#sms-list').innerHTML = items.length ? items.map(m =>
      `<div class="sms ${m.state}"><div class="meta"><span>Kimga: <span class="mono">${U.esc(m.to)}</span></span><span class="mono">${new Date(m.ts).toLocaleDateString('uz-UZ')} ${U.time(m.ts)}</span></div>${U.esc(m.text)}<div class="meta" style="margin:6px 0 0"><span class="pill ${m.status}">${SG.sms.statusLabel(m.status)}</span></div></div>`).join('')
      : `<div class="empty">Hozircha xabar yo'q. Namlik chegaradan chiqsa SMS shu yerda paydo bo'ladi, yoki o'ng tomondan test xabar yarating.</div>`;
  }

  function render(el) {
    root = document.createElement('div'); el.appendChild(root);
    const s = S().settings, ghs = S().greenhouses;
    const opts = ghs.map(g => `<option value="${g.id}">${U.esc(g.name)} (${SG.crops.get(g.cropId).name})</option>`).join('');
    root.innerHTML = `<div class="msg-grid">
      <div class="panel">
        <div class="panel-head"><h2>SMS tarixi <span class="note mono" id="sms-count"></span></h2>
          <div class="btns"><select id="flt" aria-label="Issiqxona bo'yicha filtr" style="width:auto"><option value="all">Barcha issiqxonalar</option>${opts}</select>
          <button class="btn small" id="clr">${U.icon('trash', 15)} Tozalash</button></div></div>
        <div class="sms-list" id="sms-list" aria-live="polite"></div>
      </div>
      <div class="stack">
        <div class="panel"><div class="panel-head"><h2>Qabul qiluvchi</h2></div>
          <p class="mono" style="font-size:18px">${U.esc(S().profile.phone)}</p><p class="note">${U.esc(S().profile.name)} · <a href="#profil">profilda o'zgartirish</a></p>
          <div class="toggle-row" style="margin-top:8px"><span><b>SMS ogohlantirish</b><span class="note">Barcha issiqxonalar uchun</span></span><label class="switch"><input type="checkbox" id="sms-on" ${s.sms ? 'checked' : ''} aria-label="SMS ogohlantirish"><span></span></label></div>
        </div>
        <div class="panel"><div class="panel-head"><h2>Test SMS</h2></div>
          <div class="fld"><label for="t-gh">Issiqxona</label><select id="t-gh" ${ghs.length ? '' : 'disabled'}>${opts}</select></div>
          <div class="fld" style="margin-top:10px"><label for="t-st">Holat</label><select id="t-st"><option value="low">Past namlik</option><option value="ok">Normal</option><option value="high">Yuqori namlik</option></select></div>
          <div class="btns" style="margin-top:12px"><button class="btn primary" id="t-send" ${ghs.length ? '' : 'disabled'}>${U.icon('send', 16)} Test SMS yaratish</button></div>
          <p class="note" style="margin-top:10px">Bu yerda SMS haqiqiy yuborilmaydi, faqat ko'rinishi ko'rsatiladi. Real SMS uchun Twilio yoki mahalliy gateway server orqali ulanadi.</p>
        </div>
        <div class="panel"><div class="panel-head"><h2>Shablonlar</h2></div>
          <div class="tpl"><b>Past namlik</b>Issiqxona #1 (Pomidor): Tuproq namligi 18%. Sug'orish tavsiya etiladi. Optimal: 50-70%.</div>
          <div class="tpl"><b>Normal</b>Issiqxona #1 (Pomidor): Namlik 58%. Holat yaxshi. Keyingi tekshiruv 6 soatdan keyin.</div>
          <div class="tpl"><b>Yuqori namlik</b>Issiqxona #2 (Bodring): Namlik 85%. Ortig'i suv. Ventilyatsiya yoki drenaj kerak.</div>
        </div>
      </div></div>`;
    $('#flt').addEventListener('change', e => { filter = e.target.value; list(); });
    $('#clr').addEventListener('click', () => { SG.store.clearSms(); U.toast('Tarix tozalandi'); });
    $('#sms-on').addEventListener('change', e => { SG.store.setSettings({ sms: e.target.checked }); U.toast(e.target.checked ? 'SMS yoqildi' : "SMS o'chirildi"); });
    $('#t-send').addEventListener('click', () => { const g = SG.store.greenhouse($('#t-gh').value); if (g) { SG.sms.test(g, $('#t-st').value); U.toast('Test SMS yaratildi'); } });
    list();
    unsub = SG.store.subscribe(t => { if (t === 'sms' && root && U.$('#sms-list', root)) list(); });
  }
  function destroy() { unsub && unsub(); unsub = null; }
  SG.router.register('xabarlar', { title: 'SMS xabarlar', icon: 'chat', render, destroy });
})(window.SG);
