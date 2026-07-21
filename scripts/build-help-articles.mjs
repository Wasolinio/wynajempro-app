/**
 * Generator centrum pomocy: docs/support/*.md  ->  src/data/helpArticles.js
 *
 * PO CO: artykuły pomocy piszemy i weryfikujemy w markdownie (`support` cytuje z nich
 * kod 1:1). Ręczne przepisywanie ich do JS-a raz już się zemściło — treść rozjechała
 * się z panelem po przebudowie Finansów. Tu jest jeden kierunek: markdown to źródło
 * prawdy, plik danych aplikacji jest generowany i NIE edytuje się go ręcznie.
 *
 * Użycie: npm run help:build   (albo: node scripts/build-help-articles.mjs [ścieżka-wyjścia])
 *
 * Obsługiwany podzbiór markdowna (celowo wąski — dokładnie to, czego używają artykuły):
 *   # H1            -> tytuł artykułu (pierwszy akapit pod nim = lead)
 *   ## / ### nagł.  -> bloki h2 / h3
 *   - punkt         -> blok list
 *   1. krok         -> blok steps (numerowany)
 *   **Pytanie?**    -> pytanie FAQ; kolejna linia to odpowiedź
 *   reszta          -> akapit
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUPPORT_DIR = join(ROOT, 'docs', 'support');
const OUT = process.argv[2] || join(ROOT, 'src', 'data', 'helpArticles.js');

const FAQ_HEADING = 'Najczęstsze pytania';

/** Kolejność i krótkie opisy bierzemy z indeksu (docs/support/README.md). */
function readIndex() {
  const md = readFileSync(join(SUPPORT_DIR, 'README.md'), 'utf8');
  const entries = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^- \[(.+?)\]\((.+?\.md)\)\s*—\s*(.+)$/);
    // W indeksie opisy są dopełnieniem zdania („… — gdy chcesz X"); na kafelku
    // stoją samodzielnie, więc zaczynamy je wielką literą.
    if (m) {
      const raw = m[3].trim();
      entries.push({ title: m[1], file: m[2], excerpt: raw.charAt(0).toUpperCase() + raw.slice(1) });
    }
  }
  if (!entries.length) throw new Error('Nie znalazłem listy artykułów w docs/support/README.md');
  return entries;
}

function parseArticle(md) {
  const lines = md.split('\n');
  const blocks = [];
  let title = null;
  let lead = null;
  let inFaq = false;
  let pending = null; // otwarta lista/steps/faq, do której dokładamy kolejne linie

  const flush = () => { if (pending) { blocks.push(pending); pending = null; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Pusta linia zamyka listę i kroki, ale NIE FAQ — tam pary pytanie/odpowiedź
    // są rozdzielone pustymi liniami i mają trafić do jednego bloku.
    if (!line) { if (pending?.type !== 'faq') flush(); continue; }

    if (line.startsWith('# ')) { title = line.slice(2).trim(); flush(); continue; }

    if (line.startsWith('## ') || line.startsWith('### ')) {
      flush();
      const level = line.startsWith('### ') ? 'h3' : 'h2';
      const content = line.replace(/^#{2,3}\s+/, '').trim();
      inFaq = content === FAQ_HEADING;
      blocks.push({ type: level, content });
      continue;
    }

    // Pytanie FAQ: cała linia pogrubiona, odpowiedź w kolejnej linii.
    const faq = line.match(/^\*\*(.+)\*\*$/);
    if (faq && inFaq) {
      const answer = (lines[i + 1] || '').trim();
      if (!answer) throw new Error(`Pytanie FAQ bez odpowiedzi: „${faq[1]}"`);
      i++;
      if (pending?.type !== 'faq') { flush(); pending = { type: 'faq', items: [] }; }
      pending.items.push({ q: faq[1].trim(), a: answer });
      continue;
    }

    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      if (pending?.type !== 'list') { flush(); pending = { type: 'list', items: [] }; }
      pending.items.push(bullet[1].trim());
      continue;
    }

    const step = line.match(/^\d+\.\s+(.+)$/);
    if (step) {
      if (pending?.type !== 'steps') { flush(); pending = { type: 'steps', items: [] }; }
      pending.items.push(step[1].trim());
      continue;
    }

    flush();
    // Pierwszy akapit pod tytułem jest leadem, nie treścią.
    if (title && lead === null && !blocks.length) { lead = line; continue; }
    blocks.push({ type: 'p', content: line });
  }
  flush();

  if (!title) throw new Error('Artykuł bez nagłówka H1');
  return { title, lead, blocks };
}

const index = readIndex();
const articles = index.map(({ file, excerpt }) => {
  const path = join(SUPPORT_DIR, file);
  if (!existsSync(path)) throw new Error(`Indeks wskazuje na nieistniejący plik: ${file}`);
  const { title, lead, blocks } = parseArticle(readFileSync(path, 'utf8'));
  return { slug: basename(file, '.md'), title, excerpt, lead, blocks, source: `docs/support/${file}` };
});

const banner = `// PLIK GENEROWANY — NIE EDYTUJ RĘCZNIE.
// Źródło treści: docs/support/*.md  ·  Regeneracja: npm run help:build
// Zmiany wprowadzaj w markdownie i uruchom generator — inaczej przepadną.
`;

writeFileSync(OUT, `${banner}\nexport const helpArticles = ${JSON.stringify(articles, null, 2)};\n`, 'utf8');

const faqCount = articles.reduce(
  (n, a) => n + a.blocks.filter((b) => b.type === 'faq').reduce((m, b) => m + b.items.length, 0), 0,
);
console.log(`OK: ${articles.length} artykułów, ${faqCount} pytań FAQ -> ${OUT.replace(ROOT + '/', '')}`);
for (const a of articles) console.log(`  · ${a.slug} — ${a.blocks.length} bloków`);
