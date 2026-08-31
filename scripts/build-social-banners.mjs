/**
 * Generator banerów social i reklamowych — docs/marketing/banery/*.png (C2).
 *
 * PO CO: komplet formatów pod kanały pozyskania testerów i klientów (E5, X11):
 * Instagram, Facebook, LinkedIn, Google Ads, OG podstron. Każdy format ma
 * projekt w handoffie identyfikacji v2 i stabilne `id` w prawdziwych pikselach —
 * eksport to zrzut elementu w skali 1 (README handoffu → „Eksport banerów").
 *
 * DLACZEGO ISTNIEJE: ta sama lekcja co przy build-og-image.mjs — pierwszy eksport
 * OG (2026-08-21) zrobiono skryptem, który został w scratchpadzie, i po zmianie
 * copy nie było czym odtworzyć banera. Skrypt renderu serii „NOWE W PANELU"
 * (2026-08-28) spotkał ten sam los. Ten plik domyka obie dziury: renderuje
 * banery z dokumentu identyfikacji ORAZ odcinki serii z docs/marketing/grafiki/src/.
 *
 * ŚWIADOME ODSTĘPSTWA od dokumentu identyfikacji (te same co w build-og-image.mjs):
 *   1. ZNAK — dokument ma w banerach jeszcze starą oś czasu (trzy paski 17/17/11);
 *      monogram „W" (kierunek C) zatwierdzono 2026-08-21 i to on jest w produkcie.
 *      Skrypt podmienia każdy stary znak w locie, zachowując schemat kolorów
 *      kontekstu (kafel bez zmian, pociągnięcie 1 = kolor paska 1, pociągnięcie 2
 *      = cynober).
 *   2. `og-typo` NIE jest tu eksportowany — kanoniczna wersja z AKTUALNYM leadem
 *      hero żyje w public/og-image.png i ma własny generator (npm run og:build).
 *      Wersja w dokumencie niesie lead sprzed przepisania po feedbacku testerów
 *      (X24, 2026-08-22) i eksportowanie jej wskrzesiłoby stare copy.
 *   3. `photoSlots: false` — wersje typograficzno-danowe story IG i covera FB,
 *      bo nie mamy licencjonowanych zdjęć; pola na zdjęcia to mechanizm podglądu.
 *   4. `showSafeAreas: false` — overlaye pól bezpiecznych to pomoc projektowa,
 *      README handoffu wprost każe je wyłączyć przed eksportem.
 *   5. STORY — dolna sekcja dostaje padding-bottom 250 px zamiast 80 px.
 *      Własna notka dokumentu pod banerem mówi „dolne 250 px zostawiamy wolne
 *      pod pasek Przesuń w górę", a layout tej reguły nie egzekwował: CTA
 *      i stopka lądowały w strefie, którą Instagram zasłania swoim UI.
 *   6. COPY — reguła nazewnictwa z X24 (2026-08-22): „system" mówimy tylko
 *      o konkurencji; produkt to aplikacja, panel to ekran w środku. Dokument
 *      powstał dzień wcześniej, więc dwa banery niosą stare słowo:
 *      li-post „w systemie" → „w aplikacji", li-cover „System do zarządzania…"
 *      → „Aplikacja do zarządzania…" (brzmienie <title> landingu).
 *   7. COPY — obietnica przycięta do mechanizmu (wzorzec X26): synchronizacja
 *      działa co godzinę, więc bezwarunkowe „koniec z overbookingiem" obiecuje
 *      więcej, niż produkt daje. ad-300x250 „Koniec z overbookingiem." →
 *      „Koniec z Excelem." (slogan z biblioteki, oś 03), badge fb-post
 *      „BEZ OVERBOOKINGU" → „BOOKING + AIRBNB" (dowód zamiast drugiej obietnicy —
 *      przy okazji domyka regułę „jeden slogan i jeden dowód" na tym banerze).
 *      W tabeli dowodów sekcji 08 fraza zostaje, bo tam jest rozwinięciem dowodu
 *      synchronizacji, nie samodzielną gwarancją.
 *   8. COPY li-post — „Q3 2026" → „rok 2026": 84 600 zł przychodu w samym
 *      kwartale dawałoby rocznie ponad próg 100 000 zł, przy którym ryczałt
 *      to już 12,5%, nie pokazane 8,5%. W skali roku liczby się bronią.
 *   9. TYPOGRAFIA fb-cover — „Cały" w sloganie dostaje Newsreader italic 500,
 *      jak każe biblioteka sloganów (sekcja 08: słowo w kursywie = Newsreader).
 *      W formatach Google Ads dokument konsekwentnie rezygnuje z kursywy
 *      i tam zostaje 1:1.
 *
 * POZA ZAKRESEM: hero-banner i cta-banner (C1 — żywe sekcje HTML w LandingPage),
 * wizytówka/papier/sygnatura (C3 — czekają na dane właściciela), feature-post
 * z dokumentu (szablonem serii są źródła w grafiki/src/).
 *
 * Użycie: npm run banery:build
 */

import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HANDOFF_DIR = join(ROOT, '_design-reference', 'design_handoff_identyfikacja_v2');
const DOKUMENT = join(HANDOFF_DIR, 'Identyfikacja WynajemPRO.dc.html');
const KATALOG_BANERY = join(ROOT, 'docs', 'marketing', 'banery');
const KATALOG_SERIA = join(ROOT, 'docs', 'marketing', 'grafiki');
const ZRODLA_SERII = join(KATALOG_SERIA, 'src');

// ── Manifest — id z dokumentu, rozmiary z README handoffu („Eksport banerów") ──
const BANERY = [
  { id: 'og-data',    w: 1200, h: 630,  opis: 'OG podstron produktowych' },
  { id: 'ig-post',    w: 1080, h: 1080, opis: 'post Instagram' },
  { id: 'ig-story',   w: 1080, h: 1920, opis: 'story Instagram' },
  { id: 'fb-cover',   w: 1640, h: 624,  opis: 'cover strony Facebook' },
  { id: 'fb-post',    w: 1080, h: 1080, opis: 'post Facebook' },
  { id: 'li-cover',   w: 1128, h: 191,  opis: 'cover strony LinkedIn' },
  { id: 'li-post',    w: 1200, h: 627,  opis: 'post LinkedIn' },
  { id: 'ad-300x250', w: 300,  h: 250,  opis: 'Google Ads kwadrat' },
  { id: 'ad-160x600', w: 160,  h: 600,  opis: 'Google Ads pion' },
  { id: 'ad-728x90',  w: 728,  h: 90,   opis: 'Google Ads leaderboard' },
];

// Seria „NOWE W PANELU" — samodzielne źródła HTML, element #feature-post 1080×1080.
// Nazwa PNG zachowuje datę pierwszej publikacji odcinka (to identyfikator odcinka,
// nie data renderu).
const SERIA = [
  { zrodlo: '1-synchronizacja.html',    png: '2026-08-28-nowe-w-panelu-1-synchronizacja.png' },
  { zrodlo: '2-dodaj-do-kalendarza.html', png: '2026-08-28-nowe-w-panelu-2-dodaj-do-kalendarza.png' },
  { zrodlo: '3-podatek-liniowy.html',   png: '2026-08-28-nowe-w-panelu-3-podatek-liniowy.png' },
];

// ── Podmiana znaku: stare trzy paski → monogram „W" (kierunek C) ────────────
// Wykonywana w przeglądarce na wyrenderowanym dokumencie. Stary znak poznaje się
// po sygnaturze pasków (rect rx="2.25"); kafel i skala (viewBox 0 0 40 40)
// zostają, więc działa dla każdego rozmiaru i schematu kolorów w dokumencie.
const PODMIEN_ZNAK = () => {
  const CYNOBER = '#D9492B';
  let podmienione = 0;
  for (const svg of document.querySelectorAll('svg')) {
    if ((svg.getAttribute('viewBox') || '') !== '0 0 40 40') continue;
    const paski = svg.querySelectorAll('rect[rx="2.25"]');
    if (paski.length !== 3) continue;
    const kafel = svg.querySelector('rect[rx="8"]');
    if (!kafel) continue;
    const kolor1 = paski[0].getAttribute('fill');
    for (const p of paski) p.remove();
    const ns = 'http://www.w3.org/2000/svg';
    const sciezka = (d, stroke) => {
      const el = document.createElementNS(ns, 'path');
      el.setAttribute('d', d);
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', stroke);
      el.setAttribute('stroke-width', '4.4');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
      return el;
    };
    svg.appendChild(sciezka('M9 11.5 L14.5 28.5 L20 15.5', kolor1));
    svg.appendChild(sciezka('M20 15.5 L25.5 28.5 L31 11.5', CYNOBER));
    podmienione += 1;
  }
  return podmienione;
};

// ── Bramka fontów — bez niej zrzut potrafi wyjechać na foncie systemowym ────
// fonts.load() zamiast samego check(): font podlinkowany, ale jeszcze nieużyty
// na stronie, nigdy się nie ładuje (display=swap), więc check() wisiałby wiecznie.
const WYMAGANE_FONTY = [
  '400 20px "Schibsted Grotesk"',
  '600 20px "Schibsted Grotesk"',
  '700 20px "Schibsted Grotesk"',
  '800 20px "Schibsted Grotesk"',
  'italic 500 20px "Newsreader"',
  '400 20px "IBM Plex Mono"',
  '500 20px "IBM Plex Mono"',
  '600 20px "IBM Plex Mono"',
];

// Rozmiar PNG z nagłówka IHDR — kontrola, że zrzut wyszedł piksel w piksel.
const rozmiarPng = (buf) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });

const czekajNaFonty = async (karta, gdzie) => {
  await karta.evaluate(() => document.fonts.ready);
  const zaladowane = await karta.evaluate(async (fonty) => {
    await Promise.all(fonty.map((f) => document.fonts.load(f)));
    return fonty.filter((f) => document.fonts.check(f));
  }, WYMAGANE_FONTY).catch(() => []);
  if (zaladowane.length !== WYMAGANE_FONTY.length) {
    const brak = WYMAGANE_FONTY.filter((f) => !zaladowane.includes(f));
    throw new Error(`Fonty nie dojechały (${gdzie}): ${brak.join(', ')} — zrzut wyszedłby na foncie systemowym.`);
  }
  await karta.waitForTimeout(400); // Google Fonts potrafią dojechać po ready
};

const przegladarka = await chromium.launch();
const bledy = [];

// ═══ 1. Banery z dokumentu identyfikacji ════════════════════════════════════
{
  // Kopia tymczasowa OBOK oryginału (względne ścieżki do support.js/assets
  // muszą działać), z wyłączonymi przełącznikami podglądu w data-props.
  const zrodlo = readFileSync(DOKUMENT, 'utf8');
  // Każdy przełącznik sprawdzany OSOBNO — wspólna bramka przepuściłaby stan,
  // w którym jeden regex przestał trafiać, a drugi wciąż zmienia plik (przegląd 2026-08-31).
  let bezPodgladu = zrodlo;
  for (const prop of ['showSafeAreas', 'photoSlots']) {
    const przed = bezPodgladu;
    bezPodgladu = bezPodgladu.replace(
      new RegExp(`(&quot;${prop}&quot;:\\{[^}]*&quot;default&quot;:)true`), '$1false',
    );
    if (bezPodgladu === przed) {
      throw new Error(`Nie znalazłem przełącznika ${prop} w data-props — struktura dokumentu się zmieniła?`);
    }
  }
  const TEMP = join(HANDOFF_DIR, '.__eksport-tmp.dc.html');
  writeFileSync(TEMP, bezPodgladu);

  try {
    const karta = await przegladarka.newPage({
      viewport: { width: 1700, height: 2000 },
      deviceScaleFactor: 1, // piksel w piksel — bez tego wyjdzie 2×
    });
    await karta.goto(pathToFileURL(TEMP).href, { waitUntil: 'networkidle' });
    // Runtime dokumentu dociąga React UMD asynchronicznie — czekamy na treść.
    await karta.waitForSelector('#og-data', { timeout: 30000 });
    await czekajNaFonty(karta, 'dokument identyfikacji');

    const podmienione = await karta.evaluate(PODMIEN_ZNAK);
    if (podmienione === 0) {
      throw new Error('Nie podmieniłem ani jednego znaku — dokument już ma monogram W albo zmieniła się sygnatura pasków. Sprawdź i zaktualizuj PODMIEN_ZNAK.');
    }
    console.log(`✓ znak: ${podmienione} podmian starych pasków na monogram W`);

    // Odstępstwa 5–9 (patrz nagłówek): strefa „Przesuń w górę" w story,
    // korekty copy (X24, obietnica overbookingowa, skala roku) i kursywa covera.
    const korekty = await karta.evaluate(() => {
      const wynik = [];
      const dolStory = document.querySelector('#ig-story > div:last-child');
      if (dolStory && getComputedStyle(dolStory).paddingBottom === '80px') {
        dolStory.style.paddingBottom = '250px';
        wynik.push('ig-story: dolne 250 px zwolnione pod pasek Instagrama');
      }
      const zamiany = [
        { id: 'li-post', szukaj: 'w systemie', zamien: 'w aplikacji', czemu: 'nazewnictwo X24' },
        { id: 'li-cover', szukaj: 'System do zarządzania', zamien: 'Aplikacja do zarządzania', czemu: 'nazewnictwo X24' },
        { id: 'ad-300x250', szukaj: 'overbookingiem.', zamien: 'Excelem.', czemu: 'obietnica ponad mechanizm' },
        { id: 'fb-post', szukaj: 'BEZ OVERBOOKINGU', zamien: 'BOOKING + AIRBNB', czemu: 'obietnica ponad mechanizm' },
        { id: 'li-post', szukaj: 'Q3 2026', zamien: 'rok 2026', czemu: 'wiarygodność stawki 8,5%' },
      ];
      for (const z of zamiany) {
        const el = document.getElementById(z.id);
        if (!el) continue;
        const chodnik = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let wezel;
        while ((wezel = chodnik.nextNode())) {
          if (wezel.nodeValue.includes(z.szukaj)) {
            wezel.nodeValue = wezel.nodeValue.replace(z.szukaj, z.zamien);
            wynik.push(`${z.id}: „${z.szukaj}" → „${z.zamien}" (${z.czemu})`);
          }
        }
      }
      // Kursywa sygnaturowa na coverze FB (odstępstwo 9).
      for (const div of document.querySelectorAll('#fb-cover div')) {
        if (div.children.length <= 1 && div.innerHTML.includes('Cały wynajem.')) {
          div.innerHTML = div.innerHTML.replace(
            'Cały wynajem.',
            '<span style="font-family:\'Newsreader\',serif;font-weight:500;font-style:italic">Cały</span> wynajem.',
          );
          wynik.push('fb-cover: „Cały" w kursywie Newsreader (sekcja 08)');
          break;
        }
      }
      return wynik;
    });
    for (const k of korekty) console.log(`✓ korekta: ${k}`);
    if (korekty.length !== 7) {
      throw new Error(`Spodziewałem się 7 korekt (story, 5 zamian copy, kursywa covera), weszło ${korekty.length} — dokument się zmienił, sprawdź odstępstwa 5–9 w nagłówku.`);
    }

    mkdirSync(KATALOG_BANERY, { recursive: true });
    for (const b of BANERY) {
      const jest = await karta.$(`#${b.id}`);
      if (!jest) { bledy.push(`#${b.id}: brak elementu w dokumencie`); continue; }
      // Bramka per baner: po podmianie znaku w EKSPORTOWANYM elemencie nie ma
      // prawa zostać ani jeden stary znak. Globalny licznik podmian tego nie
      // gwarantuje — częściowa podmiana (np. po dryfie sygnatury w jednym
      // banerze) przechodziła bez śladu (przegląd 2026-08-31).
      const resztkiStaregoZnaku = await karta.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return -1;
        return [...el.querySelectorAll('svg')]
          .filter((s) => s.querySelectorAll('rect[rx="2.25"]').length >= 3).length;
      }, b.id);
      if (resztkiStaregoZnaku !== 0) {
        bledy.push(`#${b.id}: ${resztkiStaregoZnaku} stary(ch) znak(ów) po podmianie — sygnatura pasków się rozjechała`);
        continue;
      }
      // Podgląd zmniejsza banery przez transform:scale() ZADANY NA SAMYM
      // elemencie banera (zmierzono: og-data ×0.5, ig-post ×0.4, fb-cover ×0.52;
      // tylko reklamy Google są 1:1). Zrzut elementu wyszedłby w skali podglądu,
      // więc przenosimy baner do czystego kontenera w korzeniu i zdejmujemy
      // transform z niego samego (banery mają sztywne rozmiary i style inline,
      // przeprowadzka nie zmienia ich wyglądu). Przy okazji zerujemy
      // border-radius: to estetyka podglądu brand booka, a w PNG bez kanału alfa
      // zostawiała w rogach kremowe piksele tła dokumentu — na ciemnych
      // placementach Google Ads wychodziły jasne kropki (przegląd 2026-08-31).
      await karta.evaluate((id) => {
        let scena = document.getElementById('__scena-eksportu');
        if (!scena) {
          scena = document.createElement('div');
          scena.id = '__scena-eksportu';
          scena.style.cssText = 'position:absolute;top:0;left:0;z-index:99999;transform:none;background:transparent';
          document.body.appendChild(scena);
        }
        const el = document.getElementById(id);
        el.style.transform = 'none';
        el.style.borderRadius = '0';
        scena.replaceChildren(el);
      }, b.id);
      const plik = join(KATALOG_BANERY, `${b.id}.png`);
      await (await karta.$(`#${b.id}`)).screenshot({ path: plik });
      const { w, h } = rozmiarPng(readFileSync(plik));
      if (w !== b.w || h !== b.h) {
        bledy.push(`#${b.id}: wyszło ${w}×${h}, ma być ${b.w}×${b.h}`);
      } else {
        console.log(`✓ ${b.id}.png — ${w} × ${h} (${b.opis})`);
      }
    }
    await karta.close();
  } finally {
    rmSync(TEMP, { force: true });
  }
}

// ═══ 2. Odcinki serii „NOWE W PANELU" ═══════════════════════════════════════
// Katalog źródeł musi zgadzać się z manifestem — inaczej nowy odcinek dodany do
// src/ nie zostałby wyrenderowany, a skrypt i tak wypisałby „Komplet" (przegląd
// 2026-08-31).
{
  const naDysku = readdirSync(ZRODLA_SERII).filter((f) => f.endsWith('.html')).sort();
  const wManifescie = SERIA.map((s) => s.zrodlo).sort();
  if (JSON.stringify(naDysku) !== JSON.stringify(wManifescie)) {
    throw new Error(`Rozjazd manifestu SERIA z katalogiem grafiki/src/: na dysku [${naDysku}], w manifeście [${wManifescie}] — dopisz odcinek do SERIA albo usuń plik.`);
  }
}
for (const s of SERIA) {
  const karta = await przegladarka.newPage({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 1,
  });
  await karta.goto(pathToFileURL(join(ZRODLA_SERII, s.zrodlo)).href, { waitUntil: 'networkidle' });
  await czekajNaFonty(karta, s.zrodlo);
  const el = await karta.$('#feature-post');
  if (!el) { bledy.push(`${s.zrodlo}: brak #feature-post`); await karta.close(); continue; }
  const plik = join(KATALOG_SERIA, s.png);
  await el.screenshot({ path: plik });
  const { w, h } = rozmiarPng(readFileSync(plik));
  if (w !== 1080 || h !== 1080) bledy.push(`${s.zrodlo}: wyszło ${w}×${h}, ma być 1080×1080`);
  else console.log(`✓ ${s.png} — 1080 × 1080`);
  await karta.close();
}

await przegladarka.close();

if (bledy.length) {
  console.error('\n✗ Eksport NIEKOMPLETNY:');
  for (const b of bledy) console.error(`  - ${b}`);
  process.exit(1);
}
console.log(`\n✓ Komplet: ${BANERY.length} banerów w docs/marketing/banery/ + ${SERIA.length} odcinki serii.`);
console.log('  og-typo (kampanie / strona główna) = public/og-image.png — npm run og:build.');
