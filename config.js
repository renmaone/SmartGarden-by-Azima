/* Umumiy sozlamalar va matnlar. */
(function (SG) {
  SG.config = {
    storageKey: 'sg-v2',
    tickMs: 1500,
    historyLen: 48,
    pumpRate: 1.6,
    thresholdGap: 5,
    labels: { ok: 'Normal', low: 'Past namlik', high: 'Yuqori namlik' },
    regions: [
      'Toshkent shahri', 'Toshkent viloyati', 'Andijon viloyati', 'Buxoro viloyati', "Farg'ona viloyati",
      'Jizzax viloyati', 'Xorazm viloyati', 'Namangan viloyati', 'Navoiy viloyati', 'Qashqadaryo viloyati',
      "Qoraqalpog'iston Respublikasi", 'Samarqand viloyati', 'Sirdaryo viloyati', 'Surxondaryo viloyati'
    ]
  };
})(window.SG = window.SG || {});
