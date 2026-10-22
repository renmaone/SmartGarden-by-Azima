/* Issiqxonalar: ro'yxat, qo'shish, tahrirlash, o'chirish va ekinlar kutubxonasi. */
(function (SG) {
  const U = SG.ui, S = () => SG.store.state;
  let root = null, editing = null, confirmDel = null, dirtyTh = false;
  const $ = s => U.$(s, root);

  function live(g) { return `hozir <b class="mono">${SG.sim.get(g).moisture.toFixed(0)}%</b> ${U.pill(SG.sim.status(g))}`; }

  function rows() {
    const l = S().greenhouses;
    if (!l.length) return '<div class="empty">Issiqxona yo\'q. "Yangi issiqxona" tugmasi bilan qo\'shing.</div>';
    return l.map(g => {
      const c = SG.crops.get(g.cropId), r = SG.sim.get(g), st = SG.sim.status(g), days = U.daysSince(g.planted), stg = SG.crops.stageAt(c, days);
      const del = confirmDel === g.id
        ? `<span class="confirm"><button class="btn small danger" data-act="del-yes" data-id="${g.id}">Ha, o'chirish</button><button class="btn small" data-act="del-no">Bekor</button></span>`
        : `<span class="btns"><button class="btn small" data-act="edit" data-id="${g.id}" aria-label="${U.esc(g.name)} tahrirlash">${U.icon('edit', 16)} Tahrirlash</button><button class="btn small" data-act="del" data-id="${g.id}" aria-label="${U.esc(g.name)} o'chirish">${U.icon('trash', 16)}</button></span>`;
      return `<div class="gh-row">
        <div class="who">${U.avatar(c, 44)}<div style="min-width:0"><b>${U.esc(g.name)}</b><span>${c.name} · ${stg.name}</span></div></div>
        <div class="meta"><span>Ekilgan: ${U.fmtDate(g.planted)} (${days}-kun) · ${g.area} m²</span><span>Chegara: ${g.min}-${g.max}% · <span class="live" data-id="${g.id}">${live(g)}</span></span>${g.note ? `<span>${U.esc(g.note)}</span>` : ''}</div>
        <label class="sw"><span class="switch"><input type="checkbox" data-act="sms" data-id="${g.id}" ${g.smsOn ? 'checked' : ''} aria-label="SMS ${U.esc(g.name)}"><span></span></span>SMS</label>
        ${del}</div>`;
    }).join('');
  }

  function formHtml() {
    const g = editing === 'new' ? null : SG.store.greenhouse(editing);
    const v = g || { name: `Issiqxona #${S().greenhouses.length + 1}`, cropId: 'tomato', planted: U.isoDate(Date.now()), area: 100, min: 50, max: 70, smsOn: true, note: '' };
    return `<form class="panel form-panel" id="gh-form" novalidate>
      <div class="panel-head"><h2>${g ? 'Issiqxonani tahrirlash' : 'Yangi issiqxona'}</h2></div>
      <div class="form-grid">
        <div class="fld"><label for="f-name">Nomi</label><input type="text" id="f-name" maxlength="40" value="${U.esc(v.name)}"><div class="err" id="e-name"></div></div>
        <div class="fld"><label for="f-crop">Ekin turi</label><select id="f-crop">${SG.crops.list.map(c => `<option value="${c.id}" ${c.id === v.cropId ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
        <div class="fld"><label for="f-planted">Ekilgan sana</label><input type="date" id="f-planted" value="${v.planted}" max="${U.isoDate(Date.now())}"><div class="err" id="e-planted"></div></div>
        <div class="fld"><label for="f-area">Maydon (m²)</label><input type="number" id="f-area" min="1" max="100000" value="${v.area}"><div class="err" id="e-area"></div></div>
        <div class="fld"><label for="f-min">Minimal namlik (%)</label><input type="number" id="f-min" min="10" max="90" value="${v.min}"></div>
        <div class="fld"><label for="f-max">Maksimal namlik (%)</label><input type="number" id="f-max" min="15" max="95" value="${v.max}"><div class="err" id="e-th"></div></div>
        <div class="fld span2"><label for="f-note">Izoh</label><input type="text" id="f-note" maxlength="80" value="${U.esc(v.note || '')}" placeholder="Masalan: shimoliy blok"></div>
        <div class="fld span2"><div class="toggle-row"><span><b>SMS ogohlantirish</b><span class="note">Bu issiqxona uchun SMS yuborilsin</span></span><label class="switch"><input type="checkbox" id="f-sms" ${v.smsOn ? 'checked' : ''}><span></span></label></div></div>
      </div>
      <p class="note" id="f-hint" style="margin-top:10px"></p>
      <div class="form-actions"><button class="btn primary" type="submit">${U.icon('check', 18)} Saqlash</button><button class="btn" type="button" id="f-cancel">Bekor qilish</button></div>
    </form>`;
  }

  function hint() {
    const c = SG.crops.get($('#f-crop').value);
    $('#f-hint').textContent = `${c.name} uchun tavsiya: namlik ${c.min}-${c.max}%, harorat ${c.tMin}-${c.tMax} °C, davr taxminan ${c.cycle} kun.`;
  }

  function library() {
    return SG.crops.list.map(c => `<div class="lib"><div class="t">${U.avatar(c, 44)}<b>${c.name}</b></div>
      <dl><dt>Tuproq namligi</dt><dd class="mono">${c.min}-${c.max}%</dd><dt>Harorat</dt><dd class="mono">${c.tMin}-${c.tMax} °C</dd><dt>Davr</dt><dd class="mono">~${c.cycle} kun</dd></dl>
      <div class="stages">${c.stages.map(s => `<span>${s[1]}</span>`).join('')}</div>
      <p class="note">${U.esc(c.tips[0])}</p></div>`).join('');
  }

  function paint() {
    root.innerHTML = `
      <div class="toolbar"><div><h2 style="font-size:20px">Mening issiqxonalarim</h2><p class="note">Har bir issiqxonada nima ekilganini, chegaralarni va SMS holatini boshqaring.</p></div>
        <button class="btn primary" id="add" ${editing ? 'disabled' : ''}>${U.icon('plus', 18)} Yangi issiqxona</button></div>
      ${editing ? formHtml() : ''}
      <div class="gh-list" id="gh-list">${rows()}</div>
      <h2 class="section-title">Ekinlar kutubxonasi</h2><p class="note">Tizim chegaralarni va maslahatlarni shu ma'lumotlar asosida beradi.</p>
      <div class="library">${library()}</div>`;
    if (editing) { hint(); bindForm(); }
  }

  function bindForm() {
    const crop = $('#f-crop');
    ['#f-min', '#f-max'].forEach(id => $(id).addEventListener('input', () => { dirtyTh = true; }));
    crop.addEventListener('change', () => {
      const c = SG.crops.get(crop.value);
      if (!dirtyTh) { $('#f-min').value = c.min; $('#f-max').value = c.max; }
      hint();
    });
    $('#f-cancel').addEventListener('click', () => { editing = null; paint(); });
    $('#gh-form').addEventListener('submit', e => {
      e.preventDefault();
      const val = id => $(id).value.trim(), err = (id, t) => { $(id).textContent = t; return !!t; };
      const name = val('#f-name'), planted = val('#f-planted'), area = +val('#f-area'), min = +val('#f-min'), max = +val('#f-max');
      let bad = false;
      bad = err('#e-name', name ? '' : 'Nomini kiriting') || bad;
      bad = err('#e-planted', !planted ? 'Sanani tanlang' : planted > U.isoDate(Date.now()) ? 'Sana kelajakda bo\'lishi mumkin emas' : '') || bad;
      bad = err('#e-area', area > 0 ? '' : 'Maydon 0 dan katta bo\'lsin') || bad;
      bad = err('#e-th', min >= 10 && max <= 95 && max - min >= SG.config.thresholdGap ? '' : `Chegara 10-95% oralig'ida, farq kamida ${SG.config.thresholdGap}% bo'lsin`) || bad;
      if (bad) return;
      const data = { name, cropId: crop.value, planted, area, min, max, note: val('#f-note'), smsOn: $('#f-sms').checked };
      if (editing === 'new') { SG.store.addGreenhouse(data); U.toast(`${name} qo'shildi`); }
      else { SG.store.updateGreenhouse(editing, data); U.toast('Saqlandi'); }
      editing = null; paint();
    });
  }

  function bindList() {
    root.addEventListener('click', e => {
      if (e.target.closest('#add')) { editing = 'new'; dirtyTh = false; paint(); $('#f-name').focus(); return; }
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act, id = b.dataset.id;
      if (act === 'edit') { editing = id; dirtyTh = true; paint(); $('#f-name').focus(); }
      else if (act === 'del') { confirmDel = id; paint(); }
      else if (act === 'del-no') { confirmDel = null; paint(); }
      else if (act === 'del-yes') { const g = SG.store.greenhouse(id); SG.store.removeGreenhouse(id); confirmDel = null; U.toast(`${g ? g.name : 'Issiqxona'} o'chirildi`); paint(); }
    });
    root.addEventListener('change', e => {
      const t = e.target; if (t.dataset && t.dataset.act === 'sms') { SG.store.updateGreenhouse(t.dataset.id, { smsOn: t.checked }); U.toast(t.checked ? 'SMS yoqildi' : "SMS o'chirildi"); }
    });
  }

  function render(el) { root = document.createElement('div'); el.appendChild(root); editing = null; confirmDel = null; paint(); bindList(); }
  function update() {
    // faqat jonli qiymatlarni yangilaymiz: forma va tugmalar qayta chizilmaydi
    U.$$('.live', root).forEach(el => { const g = SG.store.greenhouse(el.dataset.id); if (g) el.innerHTML = live(g); });
  }
  SG.router.register('issiqxonalar', { title: 'Issiqxonalar', icon: 'house', render, update });
})(window.SG);
