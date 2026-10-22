/* Ekinlar kutubxonasi: optimal namlik/harorat, o'sish bosqichlari, parvarish. */
(function (SG) {
  const list = [
    { id: 'tomato', name: 'Pomidor', mono: 'Po', color: '#C2412D', min: 50, max: 70, tMin: 18, tMax: 28, cycle: 110,
      stages: [[0, "Ko'chat o'tkazish", "Ildiz olguncha suvni kam-kam, ammo muntazam bering."], [15, "Vegetativ o'sish", "Azotli o'g'it va bog'lashni boshlang, yon novdalarni oling."],
        [40, 'Gullash', "Namlikni bir xil tuting: keskin o'zgarish gul to'kilishiga olib keladi. Kaliy-fosforli o'g'it foydali."], [65, 'Meva tugish', "Kaliy o'g'iti bering, pastki barglarni olib havo almashinuvini yaxshilang."], [85, 'Pishish va hosil', "Sug'orishni biroz kamaytiring: meva yorilishidan saqlaydi."]],
      tips: ["Havo namligi 85% dan oshsa, kech qurish (fitoftoroz) xavfi ortadi.", "Ildiz ostiga sug'oring, bargni ho'l qilmang."] },
    { id: 'cucumber', name: 'Bodring', mono: 'Bo', color: '#3F8F3A', min: 60, max: 80, tMin: 20, tMax: 30, cycle: 75,
      stages: [[0, 'Unib chiqish', "Tuproq doim nam bo'lsin, ammo suv to'planib qolmasin."], [12, "Vegetativ o'sish", "Ipga bog'lang, azotli o'g'it bering."],
        [28, 'Gullash', "Iliq suv bilan sug'oring: sovuq suv gulni to'kadi."], [40, 'Hosil berish', "Har 2-3 kunda hosilni teriting, tez-tez va oz-ozdan sug'oring."]],
      tips: ["Bodring suvga juda talabchan: namlik 60% dan tushmasin.", "Suv sovuq bo'lsa ildiz kasallanadi, 20-25 °C suv ishlating."] },
    { id: 'pepper', name: 'Qalampir', mono: 'Qa', color: '#D97A0B', min: 45, max: 65, tMin: 20, tMax: 28, cycle: 120,
      stages: [[0, "Ko'chat o'tkazish", "O'rtacha sug'oring, tuproq qatlamini yumshating."], [20, "Vegetativ o'sish", "Azot va kaltsiy yetarli bo'lsin."],
        [45, 'Gullash', "Harorat 32 °C dan oshmasin: aks holda gul to'kiladi."], [70, 'Meva tugish', "Kaliyli o'g'it bering, tuproqni qurib qolishidan saqlang."], [95, 'Pishish', "Sug'orishni me'yorda tuting."]],
      tips: ["Qalampir quruqlik va issiqni bodringdan yaxshiroq ko'taradi, ammo suv turib qolmasin."] },
    { id: 'eggplant', name: 'Baqlajon', mono: 'Ba', color: '#6B3FA0', min: 50, max: 70, tMin: 22, tMax: 30, cycle: 120,
      stages: [[0, "Ko'chat o'tkazish", "Iliq suv bilan sug'oring."], [20, "Vegetativ o'sish", "Azotli o'g'it va tuproqni yumshatish."],
        [45, 'Gullash', "Harorat 22 °C dan past tushmasin."], [70, 'Meva tugish', "Mevalarni quyoshdan himoya qiling, kaliy bering."], [95, 'Pishish', "Pishgan mevalarni o'z vaqtida uzing."]],
      tips: ["Baqlajon sovuqqa sezgir: kechasi issiqxonani yopib qo'ying."] },
    { id: 'strawberry', name: 'Qulupnay', mono: 'Qu', color: '#D6336C', min: 55, max: 75, tMin: 15, tMax: 24, cycle: 90,
      stages: [[0, "O'rnashish", "Tuproq nam bo'lsin, ildiz bo'g'zini ko'mmang."], [20, 'Barg chiqarish', "Azotni me'yorda bering."],
        [40, 'Gullash', "Gulga suv tegmasin, tomchilatib sug'oring."], [60, 'Hosil berish', "Mevalar tuproqqa tegmasligi uchun mulcha ishlating."]],
      tips: ["Havo namligi yuqori bo'lsa kulrang chirish paydo bo'ladi, shamollatib turing."] },
    { id: 'greens', name: "Ko'katlar", mono: "Ko'", color: '#2F9E8F', min: 55, max: 75, tMin: 12, tMax: 22, cycle: 35,
      stages: [[0, 'Unib chiqish', "Yuza qatlamni doim nam tuting."], [10, "O'sish", "Oz-ozdan, tez-tez sug'oring."], [25, 'Terim', "Ertalab uzing, so'ng yengil sug'oring."]],
      tips: ["Issiqda ko'katlar tez gullab ketadi: 22 °C dan oshsa soya va shamollatish kerak."] }
  ];
  const byId = Object.fromEntries(list.map(c => [c.id, c]));

  SG.crops = {
    list,
    get: id => byId[id] || list[0],
    /** Ekin yoshiga qarab bosqichni qaytaradi: {name, tip, index} */
    stageAt(crop, days) {
      let idx = 0;
      crop.stages.forEach((s, i) => { if (days >= s[0]) idx = i; });
      const s = crop.stages[idx];
      return { name: s[1], tip: s[2], index: idx, total: crop.stages.length };
    }
  };
})(window.SG);
