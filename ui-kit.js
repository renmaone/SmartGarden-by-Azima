/* Kichik yordamchilar: ikonkalar, escape, toast, avatar, sana funksiyalari. */
(function (SG) {
  const ICONS = {
    dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    activity: 'M3 12h4l3-8 4 16 3-8h4',
    sensor: 'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1M9 9h6v6H9z',
    humidity: 'M12 3c3.5 4.4 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.5-6.6 6-11z',
    house: 'M3 11 12 4l9 7v9H3zM9 20v-6h6v6',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    chat: 'M4 5h16v11H9l-5 4z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
    plus: 'M12 5v14M5 12h14',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    bell: 'M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4',
    drop: 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z',
    thermo: 'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z',
    cloud: 'M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4.5 4.5 0 0 1 17 18z',
    send: 'M4 12 20 4l-4 16-4-7z',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5',
    check: 'M5 12l5 5 9-10',
    alert: 'M12 4 2.5 20h19zM12 10v4M12 17v.5',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.5',
    stop: 'M7 7h10v10H7z',
    refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
    leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c3-5 6-7 10-9'
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  SG.ui = {
    esc,
    $: (s, r) => (r || document).querySelector(s),
    $$: (s, r) => Array.from((r || document).querySelectorAll(s)),
    icon: (name, size = 20) =>
      `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`,
    toast(msg, kind) {
      const host = document.getElementById('toasts');
      if (!host) return;
      const t = document.createElement('div');
      t.className = 'toast ' + (kind || '');
      t.textContent = msg;
      host.appendChild(t);
      setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2800);
    },
    avatar: (crop, size = 40) => `<span class="crop-av" style="background:${crop.color};--s:${size}px" aria-hidden="true">${esc(crop.mono)}</span>`,
    pill: st => `<span class="pill ${st}">${SG.config.labels[st]}</span>`,
    daysSince(iso) {
      const t = new Date(iso + 'T00:00:00').getTime();
      return Math.max(0, Math.floor((Date.now() - t) / 864e5));
    },
    fmtDate(iso) { const p = String(iso).split('-'); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso; },
    isoDate(ms) { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
    time: ms => new Date(ms).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    initials(name) {
      const p = String(name || '').trim().split(/\s+/).filter(Boolean);
      return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase();
    },
    /** Oddiy markdown: **qalin**, - ro'yxat, bo'sh qator = yangi abzats. Avval escape qilinadi. */
    md(text) {
      const lines = esc(text).split('\n');
      let html = '', inList = false, para = [];
      const flush = () => { if (para.length) { html += `<p>${para.join('<br>')}</p>`; para = []; } };
      const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      lines.forEach(raw => {
        const l = raw.trim();
        const li = l.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
        if (li) { flush(); if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(li[1])}</li>`; }
        else {
          if (inList) { html += '</ul>'; inList = false; }
          if (!l) flush(); else para.push(inline(l.replace(/^#+\s*/, '')));
        }
      });
      if (inList) html += '</ul>';
      flush();
      return html;
    }
  };
})(window.SG);
