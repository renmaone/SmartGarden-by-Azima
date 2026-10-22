# Smart Garden: aqlli issiqxona tizimi (MVP)

Tuproq namligi monitoringi, ekinga xos maslahatlar, AI maslahatchi, avtomatik SMS ogohlantirish va dehqon profili.
Hozirgi versiya demo: datchik qiymatlari brauzerda simulyatsiya qilinadi, profil, issiqxonalar, SMS, suhbat va datchik o'lchovlari brauzerda (localStorage) saqlanadi.

## Ishga tushirish
Papkada oddiy server ishga tushiring: `python3 -m http.server 8080`, so'ng http://localhost:8080 ni oching.

## Bo'limlar
- **Datchiklar holati**: tuproq namligi, harorat, havo namligi, sug'orish holati va o'lchovlar tarixi; CSV eksport.
- **Boshqaruv paneli**: KPI, issiqxona kartalari (ekin va o'sish bosqichi bilan), namlik grafigi, maslahatlar, sug'orish boshqaruvi, hodisalar.
- **Issiqxonalar**: qo'shish, tahrirlash, o'chirish; har birida ekin turi, ekilgan sana, maydon, namlik chegarasi, SMS; ekinlar kutubxonasi.
- **AI maslahatchi**: jonli ma'lumotlarga tayangan suhbat. Claude (sample imkoniyati) ulangan bo'lsa u javob beradi, aks holda oflayn qoidalar asosidagi maslahatchi.
- **SMS xabarlar**: tarix, filtr, test xabar, qabul qiluvchi, shablonlar.
- **Dehqon profili**: ism, telefon, xo'jalik, viloyat, bildirishnoma turlari, tinch soatlar, mavzu, ma'lumotlarni tiklash.

## Tuzilma
    index.html
    css/       tokens · base · layout · components · views
    js/
      config.js crops.js ui-kit.js     sozlama, ekinlar kutubxonasi, yordamchilar
      store.js                          doimiy ombor (profil, issiqxonalar, SMS, suhbat)
      simulator.js                      datchik simulyatori (almashtiriladigan manba)
      advice.js sms.js chart.js ai.js   maslahat, SMS, grafik, AI
      router.js app.js                  navigatsiya va ilova qobig'i
      views/ dashboard · greenhouses · assistant · messages · profile
    firmware/esp32_soil_sensor.ino      ESP32 uchun namuna kod

## Haqiqiy tizimga o'tish
1. **Datchik**: firmware/ kodini ESP32 ga yuklang.
2. **Server**: `POST /api/readings` qabul qilib Firebase/Blynk ga saqlasin.
3. **Ma'lumot manbai**: js/simulator.js ni serverdan o'qiydigan modul bilan almashtiring (`get`, `status`, `tick` interfeysi saqlansin).
4. **SMS**: js/sms.js dagi `deliver()` ni server orqali Twilio yoki mahalliy gateway chaqiruviga ulang. Kalitlar serverda turishi kerak.
5. **Saqlash**: js/store.js ni server API bilan almashtirsangiz, ma'lumotlar qurilmalar orasida umumiy bo'ladi.


## Saqlash haqida
- Ushbu versiya ma'lumotlarni shu brauzer/qurilmaning `localStorage` xotirasida saqlaydi. Brauzer ma'lumotlari tozalansa, tarix ham o'chishi mumkin; boshqa telefon/kompyuter bilan avtomatik sinxronlanmaydi.
- O'lchovlar demo rejimida daqiqasiga bir marta saqlanadi (500 tagacha). Haqiqiy ESP32 qurilmasi uchun backend va ma'lumotlar bazasi kerak; `.ino` faylidagi `ENDPOINT` hozircha namuna.

## Deploy (GitHub Pages)
1. ZIP'ni oching va `smart-garden` papkasini oling.
2. GitHub'da yangi repository yarating (masalan `smart-garden`).
3. Papka ichidagi fayllarni repository root'iga yuklang: `index.html`, `css/`, `js/`, `firmware/`, `README.md`. `index.html` repository root'ida bo'lishi kerak.
4. Repository → **Settings → Pages** → **Deploy from a branch** → `main` va `/(root)` → **Save**.
5. Deploy tugagach `https://USERNAME.github.io/REPOSITORY/` manzilini oching.
6. Bu statik sayt uchun hosting yetarli, lekin localStorage faqat har bir foydalanuvchining o'z brauzerida ishlaydi. ESP32'dan keladigan haqiqiy ma'lumotlarni umumiy saqlash uchun backend (masalan Render/Railway) va baza (masalan Supabase/Firebase) alohida sozlanishi shart. API kalitlarini front-end JS ichiga joylamang.
