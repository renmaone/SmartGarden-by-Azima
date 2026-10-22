/* Dehqon profili: shaxsiy ma'lumot, xo'jalik, bildirishnomalar, ko'rinish, ma'lumotlar. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state;
  let root = null, confirmReset = false;
  const $ = s => U.$(s, root);

  function normPhone(v) {
    let d = String(v).replace(/\D/g, '');
    if (d.length === 9) d = '998' + d;
    if (d.length !== 12 || !d.startsWith('998')) return null;
    return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }
  const sw = (id, title, sub, on) => `<div class="toggle-row"><span><b>${title}</b>${sub ? `<span class="note">${sub}</span>` : ''}</span><label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${title}"><span></span></label></div>`;

  function hero() {
    const p = S().profile, l = S().greenhouses, area = l.reduce((a, g) => a + (+g.area || 0), 0);
    const sent = S().sms.filter(m => m.status !== 'test').length;
    $('#hero').innerHTML = `<div class="avatar">${U.esc(U.initials(p.name))}</div>
      <div><h2>${U.esc(p.name || 'Dehqon')}</h2><p class="note">${U.esc(p.farm)} · ${U.esc(p.region)}${p.district ? ', ' + U.esc(p.district) : ''}</p></div>`;
    $('#pstats').innerHTML = `
      <div class="kpi"><div class="label">Issiqxonalar</div><div class="v mono">${l.length}</div></div>
      <div class="kpi"><div class="label">Umumiy maydon</div><div class="v mono">${area}<small> m²</small></div></div>
      <div class="kpi"><div class="label">Ekin turlari</div><div class="v mono">${new Set(l.map(g => g.cropId)).size}</div></div>
      <div class="kpi"><div class="label">Yuborilgan SMS</div><div class="v mono">${sent}</div></div>`;
  }

  function render(el) {
    root = document.createElement('div'); el.appendChild(root); confirmReset = false;
    const p = S().profile, s = S().settings;
    root.innerHTML = `
      <div class="profile-hero" id="hero"></div>
      <div class="kpis" id="pstats" style="margin-bottom:16px"></div>
      <div class="profile-grid">
        <form class="panel" id="p-form" novalidate>
          <div class="sect"><h3>Shaxsiy ma'lumotlar</h3><div class="form-grid">
            <div class="fld"><label for="p-name">To'liq ism</label><input type="text" id="p-name" maxlength="60" value="${U.esc(p.name)}" autocomplete="name"><div class="err" id="e-pname"></div></div>
            <div class="fld"><label for="p-phone">Telefon (SMS shu raqamga boradi)</label><input type="tel" id="p-phone" value="${U.esc(p.phone)}" autocomplete="tel" placeholder="+998 90 123 45 67"><div class="err" id="e-pphone"></div></div>
            <div class="fld span2"><label for="p-email">Elektron pochta (ixtiyoriy)</label><input type="email" id="p-email" value="${U.esc(p.email)}" autocomplete="email"><div class="err" id="e-pemail"></div></div>
          </div></div>
          <div class="sect"><h3>Xo'jalik</h3><div class="form-grid">
            <div class="fld span2"><label for="p-farm">Xo'jalik nomi</label><input type="text" id="p-farm" maxlength="60" value="${U.esc(p.farm)}"></div>
            <div class="fld"><label for="p-region">Viloyat</label><select id="p-region">${SG.config.regions.map(r => `<option ${r === p.region ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
            <div class="fld"><label for="p-district">Tuman</label><input type="text" id="p-district" maxlength="40" value="${U.esc(p.district)}"></div>
            <div class="fld"><label for="p-years">Tajriba (yil)</label><input type="number" id="p-years" min="0" max="80" value="${p.years}"></div>
          </div></div>
          <div class="sect"><h3>Bildirishnomalar</h3>
            ${sw('s-sms', 'SMS ogohlantirish', "O'chirilsa hech qanday SMS yuborilmaydi", s.sms)}
            ${sw('s-low', 'Past namlik', "Sug'orish kerak bo'lganda", s.onLow)}
            ${sw('s-high', 'Yuqori namlik', 'Ortiqcha suv bo\'lganda', s.onHigh)}
            ${sw('s-ok', 'Normal holatga qaytish', 'Muammo hal bo\'lganda', s.onOk)}
            ${sw('s-quiet', 'Tinch soatlar', 'Shu vaqtda SMS ertalabgacha kechiktiriladi', s.quiet)}
            <div class="quiet"><div class="fld"><label for="s-from">Boshlanishi</label><input type="time" id="s-from" value="${s.quietFrom}"></div><div class="fld"><label for="s-to">Tugashi</label><input type="time" id="s-to" value="${s.quietTo}"></div></div>
          </div>
          <div class="btns"><button class="btn primary" type="submit">${U.icon('check', 18)} Saqlash</button></div>
        </form>
        <div class="stack">
          <div class="panel"><div class="panel-head"><h2>Ko'rinish</h2></div>
            <div class="seg" role="group" aria-label="Mavzu" id="theme"><button type="button" data-v="system">Tizim</button><button type="button" data-v="light">Yorug'</button><button type="button" data-v="dark">Qorong'i</button></div>
            <p class="note" style="margin-top:10px">Til: o'zbek (lotin).</p></div>
          <div class="panel"><div class="panel-head"><h2>Ma'lumotlar</h2></div>
            <p class="note">Profil, issiqxonalar va xabarlar shu qurilmada brauzeringizda saqlanadi.</p>
            <div class="btns" style="margin-top:12px" id="reset-box"></div></div>
        </div>
      </div>`;
    hero();
    themeBtns(); resetBox();

    $('#theme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; SG.store.setSettings({ theme: b.dataset.v }); SG.app.applyTheme(); themeBtns(); });
    $('#reset-box').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'ask') { confirmReset = true; resetBox(); }
      else if (b.dataset.a === 'no') { confirmReset = false; resetBox(); }
      else if (b.dataset.a === 'yes') { SG.store.reset(); SG.app.applyTheme(); U.toast("Boshlang'ich ma'lumotlar tiklandi"); SG.router.refresh(); }
    });
    $('#p-form').addEventListener('submit', e => {
      e.preventDefault();
      const err = (id, t) => { $(id).textContent = t; return !!t; };
      const name = $('#p-name').value.trim(), phone = normPhone($('#p-phone').value), email = $('#p-email').value.trim();
      let bad = err('#e-pname', name ? '' : 'Ismingizni kiriting');
      bad = err('#e-pphone', phone ? '' : "Raqamni +998 XX XXX XX XX ko'rinishida kiriting") || bad;
      bad = err('#e-pemail', !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : "Pochta manzili noto'g'ri") || bad;
      if (bad) return;
      SG.store.setProfile({ name, phone, email, farm: $('#p-farm').value.trim() || 'Mening issiqxonam', region: $('#p-region').value, district: $('#p-district').value.trim(), years: Math.max(0, +$('#p-years').value || 0) });
      SG.store.setSettings({ sms: $('#s-sms').checked, onLow: $('#s-low').checked, onHigh: $('#s-high').checked, onOk: $('#s-ok').checked, quiet: $('#s-quiet').checked, quietFrom: $('#s-from').value || '22:00', quietTo: $('#s-to').value || '06:00' });
      $('#p-phone').value = phone; hero(); U.toast('Profil saqlandi');
    });
  }
  function themeBtns() { U.$$('#theme button', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S().settings.theme)); }
  function resetBox() {
    $('#reset-box').innerHTML = confirmReset
      ? `<span class="note">Hamma o'zgarishlar o'chadi. Davom etasizmi?</span><span class="confirm"><button class="btn small danger" data-a="yes">Ha, tiklash</button><button class="btn small" data-a="no">Bekor</button></span>`
      : `<button class="btn" data-a="ask">${U.icon('refresh', 16)} Boshlang'ich holatga qaytarish</button>`;
  }
  SG.router.register('profil', { title: 'Dehqon profili', icon: 'user', render });
})(window.SG);
