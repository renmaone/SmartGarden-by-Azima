/* Namlik grafigi (SVG): optimal zona, maydon, oxirgi nuqta. Bitta masshtab. */
(function (SG) {
  const W = 640, H = 230, L = 38, R = 14, T = 12, B = 26, F = 'IBM Plex Mono,monospace';
  SG.chart = {
    render(svg, g) {
      const r = SG.sim.get(g), N = SG.config.historyLen, pw = W - L - R, ph = H - T - B;
      const x = i => L + pw * i / (N - 1), y = v => T + ph * (1 - v / 100);
      let p = '';
      for (let v = 0; v <= 100; v += 25) {
        p += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/>` +
             `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="${F}">${v}</text>`;
      }
      p += `<rect x="${L}" y="${y(g.max)}" width="${pw}" height="${y(g.min) - y(g.max)}" fill="var(--ok-soft)" opacity=".85"/>`;
      p += `<text x="${L + 6}" y="${y(g.max) + 14}" font-size="11" fill="var(--ok)" font-family="${F}">optimal ${g.min}-${g.max}%</text>`;
      const pts = r.hist.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
      p += `<polygon points="${x(0)},${y(0)} ${pts} ${x(N - 1)},${y(0)}" fill="var(--water)" opacity=".14"/>`;
      p += `<polyline points="${pts}" fill="none" stroke="var(--water)" stroke-width="2.2" stroke-linejoin="round"/>`;
      p += `<circle cx="${x(N - 1)}" cy="${y(r.moisture)}" r="5" fill="var(--water)" stroke="var(--surface)" stroke-width="2"/>`;
      p += `<text x="${L}" y="${H - 6}" font-size="11" fill="var(--muted)" font-family="${F}">-48</text>` +
           `<text x="${W - R}" y="${H - 6}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="${F}">hozir</text>`;
      svg.innerHTML = p;
    }
  };
})(window.SG);
