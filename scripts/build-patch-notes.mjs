/**
 * Generator wpisów „Co nowego": docs/marketing/patch-notes.md -> src/data/patchNotes.js
 *
 * PO CO: treść okienka „Co nowego" w panelu (E4) pisze się i przegląda w markdownie,
 * jak artykuły pomocy i dokumenty prawne. Jeden kierunek: markdown to źródło prawdy,
 * plik danych aplikacji jest generowany i NIE edytuje się go ręcznie.
 *
 * DLACZEGO plik w repo, a nie Firestore: patch nota opisuje wydanie, więc ma wychodzić
 * RAZEM z deployem hosting:app — bundlowana treść gwarantuje to z definicji (użytkownik
 * na starej powłoce nie zobaczy noty o funkcji, której jeszcze nie ma). Do tego zero
 * odczytów Firestore i zero zmian w regułach.
 *
 * Użycie: npm run patchnotes:build
 *
 * Format źródła (docs/marketing/patch-notes.md):
 *   ## RRRR-MM-DD — Tytuł        <- wpis; najnowszy NA GÓRZE pliku
 *   - punkt                      <- 1–6 punktów na wpis
 * Wszystko poza nagłówkami wpisów i punktami jest ignorowane (nagłówek pliku, blok
 * cytatu z konwencją). Generator pilnuje: formatu daty, malejącej kolejności dat,
 * liczby punktów, unikalności id i zakazu emoji (zasada identyfikacji).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZRODLO = join(ROOT, 'docs', 'marketing', 'patch-notes.md');
const WYJSCIE = join(ROOT, 'src', 'data', 'patchNotes.js');

const md = readFileSync(ZRODLO, 'utf8');
const bledy = [];
const wpisy = [];

const slug = (s) => s.toLowerCase()
  .replace(/[ąćęłńóśźż]/g, (c) => ({ ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }[c]))
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Emoji nie ma prawa wejść na materiały marki (zasada identyfikacji, zero emoji).
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

let biezacy = null;
for (const [nr, linia] of md.split('\n').entries()) {
  const naglowek = linia.match(/^## (\d{4}-\d{2}-\d{2}) — (.+)$/);
  if (naglowek) {
    biezacy = { id: `${naglowek[1]}-${slug(naglowek[2])}`, date: naglowek[1], title: naglowek[2].trim(), items: [] };
    wpisy.push(biezacy);
    continue;
  }
  if (linia.startsWith('## ')) {
    bledy.push(`linia ${nr + 1}: nagłówek wpisu bez daty w formacie „## RRRR-MM-DD — Tytuł": ${linia}`);
    continue;
  }
  const punkt = linia.match(/^- (.+)$/);
  if (punkt && biezacy) biezacy.items.push(punkt[1].trim());
}

if (wpisy.length === 0) bledy.push('brak wpisów — plik źródłowy pusty albo zmieniła się konwencja nagłówków');
const idki = new Set();
for (const [i, w] of wpisy.entries()) {
  if (Number.isNaN(Date.parse(w.date))) bledy.push(`${w.id}: nieistniejąca data ${w.date}`);
  if (w.items.length < 1 || w.items.length > 6) bledy.push(`${w.id}: ${w.items.length} punktów (ma być 1–6)`);
  if (idki.has(w.id)) bledy.push(`${w.id}: zdublowany id — dwa wpisy z tą samą datą i tytułem`);
  idki.add(w.id);
  if (i > 0 && w.date > wpisy[i - 1].date) {
    bledy.push(`${w.id}: wpisy mają iść od najnowszego do najstarszego, a ${w.date} > ${wpisy[i - 1].date}`);
  }
  for (const tekst of [w.title, ...w.items]) {
    if (EMOJI.test(tekst)) bledy.push(`${w.id}: emoji w treści — zasada identyfikacji tego zakazuje: ${tekst}`);
  }
}

if (bledy.length) {
  console.error('✗ patch-notes.md NIE przechodzi:');
  for (const b of bledy) console.error(`  - ${b}`);
  process.exit(1);
}

const naglowekPliku = `// GENEROWANE z docs/marketing/patch-notes.md — NIE edytuj ręcznie.
// Zmiany treści: edytuj markdown i uruchom \`npm run patchnotes:build\`.
// Wpisy od najnowszego. Kontrakt pola: { id, date: 'RRRR-MM-DD', title, items[] }.

`;
writeFileSync(WYJSCIE, `${naglowekPliku}export const PATCH_NOTES = ${JSON.stringify(wpisy, null, 2)};\n`);
console.log(`✓ ${WYJSCIE} — ${wpisy.length} wpisów (najnowszy: ${wpisy[0].date} — ${wpisy[0].title})`);
