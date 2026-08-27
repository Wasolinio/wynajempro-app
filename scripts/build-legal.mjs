/**
 * Generator dokumentów prawnych: docs/legal/*.md  ->  src/data/legalDocs.js
 *
 * PO CO: strony /regulamin, /prywatnosc i /dpa mają renderować DOKŁADNIE tę treść,
 * którą oceniał prawnik i którą opisuje bramka publikacji — a nie ręcznie przepisany
 * JSX, który rozjechał się ze źródłem (stan zastany 2026-08-26: strony miały własną,
 * starszą treść; DPA nie miało strony wcale). Kierunek jest jeden: markdown w
 * docs/legal/ to źródło prawdy, plik danych jest generowany i NIE edytuje się go ręcznie.
 *
 * Użycie: npm run legal:build   (albo: node scripts/build-legal.mjs)
 *
 * FILTR PUBLIKACYJNY — dokumenty źródłowe niosą adnotacje robocze, które NIE mogą
 * trafić do klienta. Zasady (kolejność ma znaczenie):
 *   1. Treść zaczyna się od DRUGIEGO nagłówka `# ` — wszystko wcześniej (baner
 *      „PROJEKT", preambuła statusowa) jest odrzucane.
 *   2. Linia metryki „**Wersja:** … · **Obowiązuje od:** …" idzie do meta, nie do treści.
 *   3. Znaczniki `**[UZUPEŁNIENIE …]**` / `**[PRZEGLĄD …]**` znikają, tekst za nimi zostaje.
 *   4. Adnotacje kursywą `*(…)*` zawierające słowa-klucze robocze (decyzja, analiza,
 *      prawnik, potwierdz…, Roadmap, bramka, checklista, nota, PRZEGLĄD, ustalone,
 *      zatwierdzon…) znikają w całości.
 *   5. Akapity i punkty list zaczynające się znacznikiem emoji (⚠️ ⛔ ⏳ 🔴 📌 🎯 ⚖️ 🛡️ 🔥)
 *      są notatkami wewnętrznymi — znikają wraz z liniami kontynuacji.
 *   6. Punkt listy będący w całości notą `*(…)*` (może być wielolinijkowy) — znika.
 *   7. Cytat `>` znika, jeżeli zawiera słowa-klucze robocze (cytat załącznika zostaje).
 *   8. Stopka „*Projekt przygotowany…*" znika.
 *
 * BEZPIECZNIK: jeżeli po filtrze w treści zostanie `[DO `, `[[`, odwołanie do pliku
 * `.md` albo słowo-klucz robocze — generator PRZERYWA z błędem. Lepiej nie zbudować
 * strony niż opublikować notatkę wewnętrzną.
 * Wyjątek świadomy: `[DATA PUBLIKACJI …]` przechodzi jako token — strona renderuje
 * w tym miejscu „zostanie podana w dniu publikacji", a generator głośno ostrzega,
 * bo przed deployem produkcyjnym w źródle ma stać prawdziwa data.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEGAL_DIR = join(ROOT, 'docs', 'legal');
const OUT = join(ROOT, 'src', 'data', 'legalDocs.js');

const DOCS = [
  { slug: 'regulamin', file: 'Regulamin.md', label: 'Regulamin', subtitle: 'Warunki korzystania z aplikacji WynajemPRO' },
  { slug: 'prywatnosc', file: 'Polityka-prywatnosci.md', label: 'Polityka prywatności', subtitle: 'Jak przetwarzamy i chronimy dane osobowe' },
  { slug: 'dpa', file: 'DPA-powierzenie.md', label: 'Umowa powierzenia (DPA)', subtitle: 'Zasady przetwarzania danych Gości w imieniu Gospodarza' },
];

const DATE_TOKEN = /\[DATA PUBLIKACJI[^\]]*\]/;
// Słowa-klucze adnotacji roboczych. Celowo szerokie — bezpiecznik na końcu i tak
// zatrzyma build, gdyby coś się prześlizgnęło w nowej, nieprzewidzianej formie.
const INTERNAL_WORDS = /decyzj|analiz|prawnik|prawnej|potwierdz|Roadmap|bramk|checklist|PRZEGLĄD|UZUPEŁNIENI|KOREKTA|ustalone u źródła|zatwierdzon|zweryfikowano|nota\b|Activity-Log|Backlog|ADR-|deploy|commit/i;
// Cytaty z odwołaniami do plików repo albo commitów to notatki weryfikacyjne, nie treść.
const REPO_REF = /`[^`]*\.(?:md|jsx?|mjs|cjs|json|rules)`|commit\b/;
// Bezpiecznik końcowy jest WĘŻSZY niż wyzwalacze strzyżenia: „analiza ruchu" czy „porada
// prawna" bywają treścią normatywną — tu łapiemy tylko to, co na pewno jest robocze.
const FORBIDDEN = [/\[DO /, /\[\[/, /\.md\b/, /PRZEGLĄD/, /UZUPEŁNIENI/, /KOREKTA \d/, /Roadmap/i, /checklist/i, /decyzja właściciela/i, /Activity-Log/, /ADR-\d/, /Backlog/i, /bramk/i, /commit `/, /sprawdza właściciel/i,
  // Emoji = na pewno notatka robocza (identyfikacja marki: „zero emoji" w treści).
  /[⚠⛔⏳🔴📌🎯⚖🛡🔥✅❌]/u];
const EMOJI_NOTE = /^(?:⚠️|⛔|⏳|🔴|📌|🎯|⚖️|🛡️|🔥)/;

const stripInline = (text) => {
  let t = text;
  t = t.replace(/\[(?:UZUPEŁNIENIE|PRZEGLĄD|KOREKTA)[^\]]*\]\s*/g, '');
  // Kursywa jednogwiazdkowa z kluczami roboczymi (np. „*wybór podstawy do potwierdzenia
  // przez prawnika…*" w komórkach tabel) — znika w całości.
  t = t.replace(/(?<![\w*])\*(?!\*)([^*\n]+?)\*(?!\*)/g, (m) => (INTERNAL_WORDS.test(m) ? '' : m));
  // Adnotacje kursywą z kluczami roboczymi. Nawiasy w środku nie występują zagnieżdżone
  // z gwiazdką, więc wystarczy dopasowanie do zamykającego ")*".
  t = t.replace(/\*\((?:[^*]|\*(?!\)))*?\)\*/g, (m) => (INTERNAL_WORDS.test(m) ? '' : m));
  t = t.replace(/\[\[([^\]]+)\]\]/g, '$1');
  t = t.replace(/\\\*/g, '*'); // odescapowanie gwiazdek załącznika: \* -> *
  return t.replace(/[ \t]+/g, ' ').replace(/ +([.,;:)])/g, '$1').replace(/\( +/g, '(').trim();
};

function parseDoc(mdRaw, meta) {
  // Pre-pass: adnotacje *( … )* potrafią przełamywać się przez wiele linii (zawijanie
  // do ~100 znaków w źródłach) — strzyżemy je na całym tekście, zanim potniemy na linie.
  const md = mdRaw.replace(/\*\((?:[^*]|\*(?!\)))*?\)\*/gs, (m) => (INTERNAL_WORDS.test(m) ? '' : m));
  const all = md.split('\n');
  // Reguła 1: od drugiego nagłówka H1.
  const h1s = all.map((l, i) => (l.startsWith('# ') ? i : -1)).filter((i) => i >= 0);
  if (h1s.length < 2) throw new Error(`${meta.file}: oczekuję banera PROJEKT + tytułu (2× "# ")`);
  const lines = all.slice(h1s[1]);

  const blocks = [];
  let title = null;
  let effective = null;
  let version = null;
  let pending = null; // otwarty blok listy/tabeli/cytatu
  const flush = () => {
    if (!pending) return;
    // Reguła 7 egzekwowana przy KAŻDYM zamknięciu cytatu (także pustą linią).
    if (pending.type === 'quote' && pending.items.some((l) => INTERNAL_WORDS.test(l) || REPO_REF.test(l))) { pending = null; return; }
    blocks.push(pending); pending = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) { flush(); continue; }
    if (line.startsWith('# ')) { title = stripInline(line.slice(2)); continue; }

    // Reguła 2: metryka wersji.
    const m = line.match(/^\*\*Wersja:\*\*\s*(.+?)\s*·\s*\*\*Obowiązuje od:\*\*\s*(.+)$/);
    if (m) {
      version = stripInline(m[1]);
      const d = stripInline(m[2]);
      effective = DATE_TOKEN.test(d) ? null : d;
      continue;
    }

    if (line === '---') { flush(); blocks.push({ type: 'hr' }); continue; }
    if (line.startsWith('*Projekt ')) { flush(); continue; }

    if (line.startsWith('## ') || line.startsWith('### ')) {
      flush();
      blocks.push({ type: line.startsWith('### ') ? 'h3' : 'h2', content: stripInline(line.replace(/^#{2,3}\s+/, '')) });
      continue;
    }

    if (line.startsWith('>')) {
      const content = stripInline(line.replace(/^>\s?/, ''));
      if (pending?.type !== 'quote') { flush(); pending = { type: 'quote', items: [] }; }
      if (content) pending.items.push(content);
      continue;
    }
    if (pending?.type === 'quote') flush();

    if (line.startsWith('|')) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue; // separator nagłówka
      const cells = line.split('|').slice(1, -1).map((c) => stripInline(c));
      if (pending?.type !== 'table') { flush(); pending = { type: 'table', header: cells, rows: [] }; }
      else pending.rows.push(cells);
      continue;
    }

    const bullet = raw.match(/^(\s*)-\s+(.+)$/);
    if (bullet) {
      const [, indent, body] = bullet;
      // Reguła 6: punkt-nota (może ciągnąć się przez linie kontynuacji).
      if (body.trimStart().startsWith('*(') || EMOJI_NOTE.test(body.trim())) {
        while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1]) && !/^\s*-\s/.test(lines[i + 1]) && !/^\s*\d+\.\s/.test(lines[i + 1])) i++;
        continue;
      }
      const item = stripInline(body);
      if (!item) continue;
      if (indent.length >= 2 && pending?.type === 'ol' && pending.items.length) {
        (pending.items[pending.items.length - 1].sub ??= []).push(item);
      } else if (indent.length >= 2 && pending?.type === 'ul' && pending.items.length) {
        pending.items.push(item); // zagnieżdżenie w ul spłaszczamy — nie występuje w tych dokumentach głębiej
      } else {
        if (pending?.type !== 'ul') { flush(); pending = { type: 'ul', items: [] }; }
        pending.items.push(item);
      }
      continue;
    }

    const step = raw.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (step) {
      const item = stripInline(step[3]);
      if (pending?.type !== 'ol') { flush(); pending = { type: 'ol', items: [] }; }
      if (item) pending.items.push({ text: item, start: Number(step[2]) });
      continue;
    }

    // Kontynuacje i akapity.
    if (EMOJI_NOTE.test(line)) {
      // Reguła 5: notatka wewnętrzna — pomiń wraz z kontynuacjami.
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^\s*(-|\d+\.|#|>|\|)/.test(lines[i + 1])) i++;
      flush();
      continue;
    }
    const cont = stripInline(line);
    if (!cont) continue;
    if (pending && (pending.type === 'ul' || pending.type === 'ol') && /^\s/.test(raw)) {
      // wcięta linia = kontynuacja ostatniego punktu
      const last = pending.items[pending.items.length - 1];
      if (typeof last === 'string') pending.items[pending.items.length - 1] = `${last} ${cont}`;
      else last.text = `${last.text} ${cont}`;
      continue;
    }
    flush();
    const prev = blocks[blocks.length - 1];
    if (prev?.type === 'p' && !lines[i - 1]?.trim().match(/^$|^#|^-|\d+\.|^\||^>/) && lines[i - 1]?.trim()) {
      prev.content = `${prev.content} ${cont}`;
    } else {
      blocks.push({ type: 'p', content: cont });
    }
  }
  flush();

  if (!title) throw new Error(`${meta.file}: brak tytułu po banerze`);
  return { slug: meta.slug, label: meta.label, subtitle: meta.subtitle, title, version, effective, blocks, source: `docs/legal/${meta.file}` };
}

const docs = DOCS.map((meta) => parseDoc(readFileSync(join(LEGAL_DIR, meta.file), 'utf8'), meta));

// ── BEZPIECZNIK ──
const problems = [];
for (const d of docs) {
  const texts = [];
  const collect = (v) => { if (typeof v === 'string') texts.push(v); else if (Array.isArray(v)) v.forEach(collect); else if (v && typeof v === 'object') Object.values(v).forEach(collect); };
  collect(d.blocks);
  const flat = texts.join('\n');
  for (const bad of FORBIDDEN) {
    const m = flat.match(bad);
    if (m) problems.push(`${d.slug}: niedozwolony fragment w treści: …${flat.slice(Math.max(0, m.index - 70), m.index + 90)}…`);
  }
  if (!d.effective) console.warn(`⚠️  ${d.slug}: brak daty „Obowiązuje od" — strona pokaże „zostanie podana w dniu publikacji". Przed deployem produkcyjnym wpisz datę w ${d.source}.`);
}
if (problems.length) {
  console.error('⛔ Filtr publikacyjny przepuścił treść roboczą:\n' + problems.join('\n'));
  process.exit(1);
}

const banner = `// PLIK GENEROWANY — NIE EDYTUJ RĘCZNIE.
// Źródło treści: docs/legal/*.md  ·  Regeneracja: npm run legal:build
// Zmiany wprowadzaj w markdownie i uruchom generator — inaczej przepadną.
// Filtr publikacyjny (adnotacje robocze NIE przechodzą): scripts/build-legal.mjs
`;
writeFileSync(OUT, `${banner}\nexport const legalDocs = ${JSON.stringify(docs, null, 2)};\n`, 'utf8');
console.log(`OK: ${docs.map((d) => `${d.slug} (${d.blocks.length} bloków)`).join(', ')} -> src/data/legalDocs.js`);
