/* Maslahatlar: ekin turi, o'sish bosqichi, namlik va haroratga qarab. Oflayn AI javoblari ham shu yerda. */
(function (SG) {
  const U = () => SG.ui;

  /** Bitta issiqxona holati: ekinga xos tahlil. */
  function snapshot(g) {
    const r = SG.sim.get(g), c = SG.crops.get(g.cropId), days = U().daysSince(g.planted);
    const h = r.hist, per = (h[h.length - 1] - h[h.length - 6]) / 5;
    return { g, r, c, days, stage: SG.crops.stageAt(c, days), st: SG.sim.status(g), trend: per,
      etaToMin: per < -0.05 ? Math.max(1, Math.round((r.moisture - g.min) / -per)) : null };
  }

  function items(g) {
    const s = snapshot(g), { r, c, st } = s, out = [], m = r.moisture.toFixed(0);
    if (st === 'low') out.push({ k: 'warn', i: 'drop', t: "Sug'orish tavsiya etiladi",
      p: `Namlik ${m}%, ${c.name.toLowerCase()} uchun optimal ${g.min}-${g.max}%. Tomchilatib sug'orishni yoqing va namlik ${Math.round((g.min + g.max) / 2)}% ga yetganda to'xtating.` });
    else if (st === 'high') out.push({ k: 'crit', i: 'alert', t: 'Ortiqcha namlik',
      p: `Namlik ${m}%. Sug'orishni to'xtating, ventilyatsiya va drenajni tekshiring: ildiz chirishi xavfi bor.` });
    else out.push({ k: 'ok', i: 'check', t: "Namlik me'yorda",
      p: s.etaToMin ? `Hozirgi tezlikda taxminan ${s.etaToMin} o'lchovdan keyin minimal chegaraga yetadi.` : "Sug'orish hozircha kerak emas." });

    if (r.temp > c.tMax) out.push({ k: 'warn', i: 'thermo', t: 'Harorat yuqori',
      p: `${r.temp.toFixed(1)} °C (${c.name.toLowerCase()} uchun ${c.tMin}-${c.tMax} °C). Issiqxonani shamollating, kerak bo'lsa soya yoping, sug'orishni ertalab yoki kechqurun qiling.` });
    else if (r.temp < c.tMin) out.push({ k: 'warn', i: 'thermo', t: 'Harorat past',
      p: `${r.temp.toFixed(1)} °C (${c.name.toLowerCase()} uchun ${c.tMin}-${c.tMax} °C). Issiqxonani yoping va kechasi qo'shimcha isitishni ko'rib chiqing.` });

    if (r.humidity > 85) out.push({ k: 'warn', i: 'cloud', t: 'Havo namligi yuqori',
      p: "Zamburug' kasalliklari xavfi ortadi. Shamollatishni kuchaytiring, bargni ho'l qilmang." });
    else if (r.humidity < 40) out.push({ k: 'info', i: 'cloud', t: 'Havo quruq',
      p: "Havo namligi past: o'rgimchakkana xavfi bor. Yo'laklarni nam qiling." });

    out.push({ k: 'info', i: 'leaf', t: `${s.stage.name} bosqichi (${s.days}-kun)`, p: s.stage.tip });
    return out;
  }

  function html(g) {
    return items(g).map(a => `<div class="adv ${a.k}">${U().icon(a.i, 20)}<div><b>${U().esc(a.t)}</b><p>${U().esc(a.p)}</p></div></div>`).join('');
  }

  /** AI uchun matnli kontekst. */
  function contextText() {
    const st = SG.store.state, p = st.profile;
    const lines = st.greenhouses.map(g => {
      const s = snapshot(g);
      return `- ${g.name}: ekin ${s.c.name}, ekilganiga ${s.days} kun (${s.stage.name}), maydon ${g.area} m². ` +
        `Tuproq namligi ${s.r.moisture.toFixed(0)}% (belgilangan ${g.min}-${g.max}%, ekin uchun optimal ${s.c.min}-${s.c.max}%), holat: ${SG.config.labels[s.st]}. ` +
        `Harorat ${s.r.temp.toFixed(1)} °C (optimal ${s.c.tMin}-${s.c.tMax}), havo namligi ${s.r.humidity.toFixed(0)}%. ` +
        `Sug'orish: ${s.r.pump ? 'yoniq' : "o'chiq"}, avto: ${g.auto ? 'yoqiq' : "o'chiq"}. ` +
        (s.etaToMin ? `Minimal chegaraga ~${s.etaToMin} o'lchovda yetadi.` : '') + (g.note ? ` Izoh: ${g.note}.` : '');
    });
    return `Dehqon: ${p.name}, xo'jalik "${p.farm}", ${p.region}${p.district ? ', ' + p.district : ''}, tajriba ${p.years} yil.\nIssiqxonalar (jonli):\n${lines.join('\n') || '(hozircha issiqxona yo\'q)'}`;
  }

  /* ---------- Oflayn maslahatchi (AI ulanmagan bo'lsa) ---------- */
  function localAnswer(q) {
    const t = q.toLowerCase().replace(/[’ʻ`´]/g, "'");
    const list = SG.store.state.greenhouses.map(snapshot);
    if (!list.length) return "Hozircha issiqxona qo'shilmagan. **Issiqxonalar** bo'limidan birinchi issiqxonangizni qo'shing, so'ng aniq maslahat bera olaman.";
    const has = (...w) => w.some(x => t.includes(x));
    const line = s => `- **${s.g.name}** (${s.c.name}): namlik ${s.r.moisture.toFixed(0)}%, harorat ${s.r.temp.toFixed(1)} °C`;

    if (has("sug'or", 'sugor', 'suv', 'namlik', 'qachon')) {
      const low = list.filter(s => s.st === 'low'), high = list.filter(s => s.st === 'high');
      let a = low.length ? `**Hozir sug'orish kerak:**\n${low.map(s => `- ${s.g.name} (${s.c.name}): ${s.r.moisture.toFixed(0)}%, optimal ${s.g.min}-${s.g.max}%`).join('\n')}\n\n` : "Hozir sug'orish talab qiladigan issiqxona yo'q.\n\n";
      if (high.length) a += `**Namlik ortiqcha, sug'orishni to'xtating:**\n${high.map(s => `- ${s.g.name}: ${s.r.moisture.toFixed(0)}%`).join('\n')}\n\n`;
      const soon = list.filter(s => s.st === 'ok' && s.etaToMin && s.etaToMin < 15);
      if (soon.length) a += `**Tez orada kerak bo'ladi:**\n${soon.map(s => `- ${s.g.name}: taxminan ${s.etaToMin} o'lchovdan keyin`).join('\n')}\n\n`;
      return a + "Issiq kunlarda ertalab yoki kechqurun sug'oring. Barglarga emas, ildiz ostiga bering.";
    }
    if (has("o'g'it", 'ogit', 'ozuqa', 'oziqlan')) {
      return `**O'g'itlash bosqichga qarab:**\n${list.map(s => `- **${s.g.name}** (${s.c.name}, ${s.stage.name}): ${s.stage.tip}`).join('\n')}\n\nO'g'itni namlik me'yorda bo'lganda, sug'orishdan keyin bering.`;
    }
    if (has('kasal', "zamburug'", 'zamburug', 'barg', 'sariq', 'dog', 'chirish', 'zararkunanda', 'hasharot')) {
      const risky = list.filter(s => s.r.humidity > 80 || s.st === 'high');
      return `**Kasallikdan himoya:**\n- Shamollatishni muntazam qiling, havo namligi 80% dan oshmasin.\n- Ildiz ostiga sug'oring, bargni ho'l qilmang.\n- Kasal bargni darhol olib tashlang.\n${risky.length ? `\n**Xavf yuqori:** ${risky.map(s => s.g.name).join(', ')} (namlik yuqori).\n` : ''}\nAniq tashxis uchun barg rasmini agronomga ko'rsating. Bu yerda faqat umumiy tavsiya bera olaman.`;
    }
    if (has('harorat', 'issiq', 'sovuq', 'shamollat')) {
      return `**Harorat holati:**\n${list.map(s => `${line(s)} (optimal ${s.c.tMin}-${s.c.tMax} °C)`).join('\n')}\n\nHarorat chegaradan chiqsa, shamollating yoki issiqxonani yoping.`;
    }
    if (has('reja', 'hafta', 'jadval', 'nima qil')) {
      return `**Haftalik reja:**\n${list.map(s => `- **${s.g.name}** (${s.c.name}, ${s.stage.name}): ${s.stage.tip}`).join('\n')}\n- Har kuni ertalab namlik grafigini tekshiring.\n- Haftada bir marta datchiklarni tozalang va kalibrlang.`;
    }
    if (has('hosil', 'terim', 'pishish', "qachon uz")) {
      return `**Hosilgacha taxminiy vaqt:**\n${list.map(s => `- **${s.g.name}** (${s.c.name}): ${Math.max(0, s.c.cycle - s.days)} kun qoldi`).join('\n')}`;
    }
    const worst = list.find(s => s.st !== 'ok');
    return `**Umumiy holat:**\n${list.map(line).join('\n')}\n\n${worst ? `E'tibor bering: **${worst.g.name}** holati "${SG.config.labels[worst.st]}".` : "Hammasi me'yorda."}\n\nMen sug'orish, o'g'itlash, kasalliklar, harorat va haftalik reja bo'yicha yordam bera olaman.`;
  }

  SG.advice = { snapshot, items, html, contextText, localAnswer };
})(window.SG);
