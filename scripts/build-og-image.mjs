/**
 * Generator banera Open Graph — public/og-image.png (1200 × 630 px).
 *
 * PO CO: to najczęściej widziany obraz marki. Pokazuje się przy każdym wklejeniu
 * linku do wynajempro.com na Facebooku, LinkedInie, w Slacku i WhatsAppie. Jego
 * podtytuł MUSI mówić to samo co lead w hero landingu — inaczej udostępniony link
 * obiecuje co innego niż strona, na którą prowadzi.
 *
 * DLACZEGO ISTNIEJE: pierwszy eksport (2026-08-21) zrobiono skryptem, który został
 * w scratchpadzie i nie trafił do repo — patrz docs/Activity-Log.md. Kiedy 2026-08-22
 * przepisaliśmy lead po feedbacku testerów, baner został ze starym tekstem wypalonym
 * w pikselach i nie było czym go odtworzyć. Ten plik zamyka tę dziurę: źródło banera
 * mieszka w repo i wersjonuje się razem z copy.
 *
 * ŹRÓDŁO PROJEKTU: `_design-reference/Identyfikacja WynajemPRO.dc.html`, sekcja 10
 * („OG image — podgląd linku", RYS. 1 — OG typograficzny). Markup poniżej jest
 * przepisany 1:1, z dwoma świadomymi odstępstwami:
 *   1. `transform:scale(.5)` usunięty — dokument pokazuje baner w podglądzie 50%,
 *      my renderujemy 1:1 przy deviceScaleFactor 1.
 *   2. Znak = `mark-C-litera-w` (litera W). Dokument identyfikacji ma w tym miejscu
 *      jeszcze starą oś czasu (trzy paski 17/17/11); literę W zatwierdzono
 *      2026-08-21 i to ona jest w kodzie (LandingPage → LogoMark) oraz w eksporcie.
 *      Na atramentowym tle znak jest odwrócony: kremowy kafel, atramentowe pierwsze
 *      pociągnięcie, cynobrowe drugie.
 *
 * PODTYTUŁ: trzymaj zgodny z `.wp4-lead` w hero (src/pages/landing/LandingPage.jsx).
 * Po każdej zmianie leadu uruchom ten skrypt i wypchnij nowy PNG razem z copy.
 *
 * Użycie: npm run og:build
 *
 * Uwaga: w tym środowisku nie ma ImageMagick ani rsvg — rasteryzuje Playwright
 * (Chromium), który jest już zależnością testów e2e.
 */

import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WYJSCIE = join(ROOT, 'public', 'og-image.png');

// ── Treść — jedyne, co zwykle się zmienia ───────────────────────────────────
const SLOGAN_1 = 'Wynajem ';
const SLOGAN_2 = 'pod kontrolą';           // Newsreader, kursywa
const PODTYTUL =
  'WynajemPRO to aplikacja do prowadzenia wynajmu krótkoterminowego. ' +
  'Zbiera rezerwacje z portali w jeden kalendarz i pokazuje, ile naprawdę ' +
  'zostaje po prowizjach i podatku.';
const CTA      = 'Wypróbuj 14 dni bezpłatnie';
const DOPISEK  = 'BEZ KARTY · 29,99 ZŁ/MC PÓŹNIEJ';
const DOMENA   = 'wynajempro.com';

// ── Tokeny marki (brand.jsx) ────────────────────────────────────────────────
const ATRAMENT = '#17150F';
const PAPIER   = '#F3EFE5';
const CYNOBER  = '#D9492B';
const PRZYGASZONY = '#A0987F';   // podtytuł na atramencie
const SLABY       = '#6B6555';   // domena i dopisek

const ZNAK = `<svg viewBox="0 0 40 40" width="56" height="56">
  <rect width="40" height="40" rx="8" fill="${PAPIER}"/>
  <path d="M9 11.5 L14.5 28.5 L20 15.5" fill="none" stroke="${ATRAMENT}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 15.5 L25.5 28.5 L31 11.5" fill="none" stroke="${CYNOBER}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const HTML = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1200px;height:630px}
  body{-webkit-font-smoothing:antialiased}
  .mono{font-family:'IBM Plex Mono',monospace}
</style></head><body>
<div style="width:1200px;height:630px;background:${ATRAMENT};padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;font-family:'Schibsted Grotesk',sans-serif">

  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="display:flex;align-items:center;gap:18px">
      ${ZNAK}
      <div style="display:flex;align-items:baseline;font-weight:800;font-size:36px;letter-spacing:-.025em;color:${PAPIER}">Wynajem<span class="mono" style="font-weight:500;font-size:18px;background:${CYNOBER};color:#fff;padding:4px 9px;margin-left:6px;letter-spacing:.04em">PRO</span></div>
    </div>
    <div class="mono" style="font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:${SLABY}">${DOMENA}</div>
  </div>

  <div>
    <div style="font-weight:800;font-size:88px;line-height:.98;letter-spacing:-.035em;color:${PAPIER};max-width:900px">${SLOGAN_1}<span style="font-family:'Newsreader',serif;font-weight:500;font-style:italic">${SLOGAN_2}</span>.</div>
    <div style="font-size:26px;line-height:1.5;color:${PRZYGASZONY};margin-top:24px;max-width:900px">${PODTYTUL}</div>
  </div>

  <div style="display:flex;align-items:center;gap:20px">
    <span style="background:${CYNOBER};color:#fff;padding:18px 30px;font-weight:600;font-size:22px;border-radius:3px">${CTA}</span>
    <span class="mono" style="font-size:17px;color:${SLABY};letter-spacing:.06em">${DOPISEK}</span>
  </div>

</div></body></html>`;

const przegladarka = await chromium.launch();
const karta = await przegladarka.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,          // piksel w piksel — bez tego wyjdzie 2400 × 1260
});
await karta.setContent(HTML, { waitUntil: 'networkidle' });
await karta.evaluate(() => document.fonts.ready);
await karta.waitForTimeout(500);  // Google Fonts potrafią dojechać po `networkidle`
await karta.screenshot({ path: WYJSCIE });
await przegladarka.close();

console.log(`✓ ${WYJSCIE} — 1200 × 630`);
console.log('  Podtytuł musi zgadzać się z .wp4-lead w hero landingu.');
