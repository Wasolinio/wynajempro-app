/**
 * Generator czytelnych plików .docx z dokumentów markdown.
 *
 * PO CO: instrukcje dla właściciela pisze się i wersjonuje w markdownie (wikilinki,
 * diffy w gicie, agenci czytają je bez konwersji), ale do CZYTANIA markdown z tabelami
 * i znacznikami jest męczący. Ten skrypt daje drugą postać tego samego tekstu —
 * do otwarcia w Wordzie / Pages / Dokumentach Google.
 *
 * ZASADA PROJEKTU (2026-08-13, polecenie właściciela): każdy dokument pisany DLA WŁAŚCICIELA
 * do czytania — instrukcja, raport, analiza, podsumowanie — oddaje się w OBU postaciach,
 * .md i .docx, w tym samym zadaniu. Opis: docs/Team-Playbook.md → „Dokumenty dla właściciela".
 *
 * ⚠️ ŹRÓDŁEM PRAWDY POZOSTAJE .md. Pliki .docx są generowane i NIE edytuje się ich
 * ręcznie — przy następnym uruchomieniu i tak zostaną nadpisane.
 *
 * Użycie: npm run docs:docx        (wszystkie pliki z listy DOKUMENTY)
 *         node scripts/build-docx.mjs docs/Projects/Roadmap.md   (pojedynczy plik)
 *
 * Obsługiwany podzbiór markdowna — dokładnie ten, którego używają nasze dokumenty:
 *   # ## ### ####     nagłówki
 *   akapit            z **pogrubieniem**, *kursywą*, `kodem`, [linkiem](url), [[wikilinkiem]]
 *   - punkt           lista punktowana (zagnieżdżenie po wcięciu)
 *   - [ ] / - [x]     lista zadań (zamieniana na ☐ / ☑)
 *   1. krok           lista numerowana
 *   > cytat           blok wyróżniony (ostrzeżenia, notatki)
 *   | a | b |         tabela (pierwszy wiersz = nagłówek)
 *   ```kod```         blok kodu (czcionka o stałej szerokości, szare tło)
 *   ---               linia oddzielająca
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, LevelFormat, PageNumber,
  Footer,
} from 'docx';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WY = join(ROOT, 'docs', 'docx');

/**
 * Stały zestaw — dokumenty, które właściciel czyta regularnie. Odświeżają się razem
 * przy `npm run docs:docx`. Dokument jednorazowy generuj ścieżką w argumencie zamiast
 * dopisywać go tutaj; cykliczny (wraca co tydzień, co wydanie) — dopisz.
 */
const DOKUMENTY = [
  'docs/Projects/Instrukcje-wlasciciela.md',
  'docs/Projects/Zlecenia-wlasciciela.md',
];

// Tokeny identyfikacji v2 — te same kolory co w aplikacji, żeby dokument nie wyglądał
// jak wydruk z innego świata niż produkt.
const INK = '17150F';
const CYNOBER = 'D9492B';
const MUTED = '524C3F';
const HAIRLINE = 'DDD5C3';
const PAPER = 'F3EFE5';
const SURFACE = 'FBFAF6';

const DXA_SZEROKOSC = 9360; // szerokość kolumny tekstu przy A4 i marginesach 1"

/* ──────────────────────────── tekst w linii ──────────────────────────── */

/**
 * Rozbija linię na fragmenty ze stylem. Kolejność ma znaczenie: `kod` jest pierwszy,
 * bo w środku kodu gwiazdki nie są pogrubieniem (mamy takie miejsca w instrukcjach —
 * np. nazwy flag CLI).
 */
const FONT = 'Arial';       // obecny i na macOS, i na Windowsie — bez podmiany na szeryfowy
const FONT_KOD = 'Courier New';

function fragmenty(tekst, bazoweWejscie = {}) {
  // Część czytników (m.in. podgląd w Finderze) ignoruje domyślne style dokumentu
  // i wstawia własny szeryfowy font, więc podajemy go wprost przy każdym fragmencie.
  const bazowy = { font: FONT, ...bazoweWejscie };
  const wynik = [];
  const wzor = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[\[[^\]]+\]\])|(\[[^\]]+\]\([^)]+\))|(\*[^*\s][^*]*\*)/g;
  let ostatni = 0;
  let m;
  while ((m = wzor.exec(tekst)) !== null) {
    if (m.index > ostatni) wynik.push(new TextRun({ ...bazowy, text: tekst.slice(ostatni, m.index) }));
    const [dopasowanie] = m;
    if (dopasowanie.startsWith('`')) {
      wynik.push(new TextRun({
        ...bazowy, text: dopasowanie.slice(1, -1), font: FONT_KOD, size: 18, color: CYNOBER,
      }));
    } else if (dopasowanie.startsWith('**')) {
      // rekurencja, bo w pogrubieniu siedzą u nas wikilinki i `kod`
      wynik.push(...fragmenty(dopasowanie.slice(2, -2), { ...bazowy, bold: true }));
    } else if (dopasowanie.startsWith('[[')) {
      // Wikilink prowadzi do innego pliku vaulta — w .docx nie ma dokąd kliknąć,
      // więc zostaje sama nazwa dokumentu, kursywą.
      const cel = dopasowanie.slice(2, -2).split('|').pop();
      wynik.push(new TextRun({ ...bazowy, text: cel.split('/').pop(), italics: true, color: MUTED }));
    } else if (dopasowanie.startsWith('[')) {
      const [, etykieta, adres] = dopasowanie.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (/^https?:/.test(adres)) {
        wynik.push(new ExternalHyperlink({
          link: adres,
          children: [new TextRun({ ...bazowy, text: etykieta, color: CYNOBER, underline: {} })],
        }));
      } else {
        wynik.push(new TextRun({ ...bazowy, text: etykieta, italics: true, color: MUTED }));
      }
    } else {
      wynik.push(...fragmenty(dopasowanie.slice(1, -1), { ...bazowy, italics: true }));
    }
    ostatni = m.index + dopasowanie.length;
  }
  if (ostatni < tekst.length) wynik.push(new TextRun({ ...bazowy, text: tekst.slice(ostatni) }));
  return wynik.length ? wynik : [new TextRun({ ...bazowy, text: '' })];
}

/* ──────────────────────────── bloki ──────────────────────────── */

const POZIOM_NAGLOWKA = {
  1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4,
};

function komorka(tekst, { naglowek = false, szerokosc } = {}) {
  return new TableCell({
    width: { size: szerokosc, type: WidthType.DXA },
    shading: naglowek ? { type: ShadingType.CLEAR, fill: PAPER, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: fragmenty(tekst, naglowek ? { bold: true, size: 19 } : { size: 19 }),
    })],
  });
}

function tabela(wiersze) {
  const kolumny = Math.max(...wiersze.map((w) => w.length));
  // Równe kolumny łamią tekst tam, gdzie nie trzeba: w naszych tabelach jedna kolumna
  // niesie zdanie, a sąsiednia dwa znaki. Szerokość idzie więc za DŁUGOŚCIĄ treści,
  // z pierwiastkiem jako tłumikiem (inaczej kolumna „#" zniknęłaby do zera) i podłogą,
  // żeby każda kolumna zmieściła choć kilka znaków.
  const waga = Array.from({ length: kolumny }, (_, k) => {
    const dlugosci = wiersze.map((w) => (w[k] ?? '').replace(/[*`\[\]]/g, '').length);
    const srednia = dlugosci.reduce((a, b) => a + b, 0) / dlugosci.length;
    return Math.max(Math.sqrt(Math.max(srednia, 1)), 1.6);
  });
  const suma = waga.reduce((a, b) => a + b, 0);
  const szerokosci = waga.map((w) => Math.floor((w / suma) * DXA_SZEROKOSC));
  szerokosci[0] += DXA_SZEROKOSC - szerokosci.reduce((a, b) => a + b, 0); // reszta z dzielenia
  const szerokosc = DXA_SZEROKOSC;
  const krawedz = { style: BorderStyle.SINGLE, size: 2, color: HAIRLINE };
  return new Table({
    columnWidths: szerokosci,
    width: { size: DXA_SZEROKOSC, type: WidthType.DXA },
    borders: { top: krawedz, bottom: krawedz, left: krawedz, right: krawedz, insideHorizontal: krawedz, insideVertical: krawedz },
    rows: wiersze.map((wiersz, i) => new TableRow({
      tableHeader: i === 0,
      children: Array.from({ length: kolumny }, (_, k) => komorka(wiersz[k] ?? '', { naglowek: i === 0, szerokosc: szerokosci[k] })),
    })),
  });
}

/** Markdown -> lista elementów docx. */
function konwertuj(md) {
  const linie = md.split('\n');
  const bloki = [];
  let i = 0;

  const czyTabela = (linia) => /^\s*\|/.test(linia);

  while (i < linie.length) {
    const linia = linie[i];

    if (!linia.trim()) { i += 1; continue; }

    // --- blok kodu ---
    if (linia.trim().startsWith('```')) {
      const kod = [];
      i += 1;
      while (i < linie.length && !linie[i].trim().startsWith('```')) { kod.push(linie[i]); i += 1; }
      i += 1;
      kod.forEach((wiersz, nr) => bloki.push(new Paragraph({
        spacing: { before: nr === 0 ? 120 : 0, after: nr === kod.length - 1 ? 160 : 0 },
        shading: { type: ShadingType.CLEAR, fill: SURFACE, color: 'auto' },
        indent: { left: 240 },
        children: [new TextRun({ text: wiersz || ' ', font: FONT_KOD, size: 17, color: INK })],
      })));
      continue;
    }

    // --- tabela ---
    if (czyTabela(linia)) {
      const wiersze = [];
      while (i < linie.length && czyTabela(linie[i])) {
        const komorki = linie[i].trim().replace(/^\||\|$/g, '').split('|').map((k) => k.trim());
        if (!komorki.every((k) => /^:?-{2,}:?$/.test(k))) wiersze.push(komorki); // pomijamy separator
        i += 1;
      }
      if (wiersze.length) {
        bloki.push(tabela(wiersze));
        bloki.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
      }
      continue;
    }

    // --- linia oddzielająca ---
    if (/^\s*---+\s*$/.test(linia)) {
      bloki.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: HAIRLINE } },
        children: [],
      }));
      i += 1;
      continue;
    }

    // --- nagłówek ---
    const naglowek = linia.match(/^(#{1,4})\s+(.*)$/);
    if (naglowek) {
      const poziom = naglowek[1].length;
      bloki.push(new Paragraph({
        heading: POZIOM_NAGLOWKA[poziom],
        spacing: { before: poziom === 1 ? 0 : 320, after: 140 },
        children: fragmenty(naglowek[2], { color: poziom <= 2 ? INK : MUTED, bold: true }),
      }));
      i += 1;
      continue;
    }

    // --- cytat (u nas: ostrzeżenia i notatki) ---
    if (/^\s*>/.test(linia)) {
      const tresc = [];
      while (i < linie.length && /^\s*>/.test(linie[i])) { tresc.push(linie[i].replace(/^\s*>\s?/, '')); i += 1; }
      const akapity = tresc.join('\n').split(/\n\s*\n/);
      akapity.forEach((akapit, nr) => bloki.push(new Paragraph({
        spacing: { before: nr === 0 ? 140 : 60, after: nr === akapity.length - 1 ? 180 : 60 },
        indent: { left: 340 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: CYNOBER, space: 12 } },
        children: fragmenty(akapit.replace(/\n/g, ' ').trim(), { color: MUTED }),
      })));
      continue;
    }

    // --- listy ---
    const punkt = linia.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (punkt) {
      const [, wciecie, znacznik, tresc] = punkt;
      const poziom = Math.min(Math.floor(wciecie.length / 2), 2);
      const numerowana = /\d/.test(znacznik);
      // „- [ ] zadanie" czytelniej wygląda jako pole wyboru niż jako nawiasy
      const zadanie = tresc.match(/^\[(.)\]\s+(.*)$/);
      let tekst = zadanie ? `${{ x: '☑', X: '☑', '~': '◐' }[zadanie[1]] || '☐'}  ${zadanie[2]}` : tresc;
      // Kontynuacja punktu (linia wcięta, nie zaczynająca nowego bloku) doklejała się
      // wcześniej jako osobny akapit bez wcięcia i rozbijała listę w połowie zdania.
      let j = i + 1;
      while (j < linie.length && /^\s+\S/.test(linie[j])
             && !/^\s*([-*]|\d+\.)\s/.test(linie[j]) && !/^\s*[|>]/.test(linie[j])
             && !linie[j].trim().startsWith('```')) {
        tekst += ` ${linie[j].trim()}`;
        j += 1;
      }
      i = j - 1;
      bloki.push(new Paragraph({
        numbering: numerowana ? { reference: 'kroki', level: poziom } : undefined,
        bullet: numerowana ? undefined : { level: poziom },
        spacing: { before: 40, after: 40 },
        children: fragmenty(tekst),
      }));
      i += 1;
      continue;
    }

    // --- zwykły akapit (linie ciągłe sklejamy, jak w markdownie) ---
    const akapit = [linia];
    i += 1;
    while (i < linie.length && linie[i].trim() && !/^(\s*[-*]|\s*\d+\.|#{1,4}\s|\s*>|\s*\||\s*---+\s*$|```)/.test(linie[i])) {
      akapit.push(linie[i]); i += 1;
    }
    bloki.push(new Paragraph({
      spacing: { before: 60, after: 120 },
      children: fragmenty(akapit.join(' ').trim()),
    }));
  }

  return bloki;
}

/* ──────────────────────────── dokument ──────────────────────────── */

function zbuduj(md, nazwaPliku) {
  const tytul = (md.match(/^#\s+(.*)$/m) || [, nazwaPliku])[1];
  return new Document({
    creator: 'WynajemPRO',
    title: tytul,
    description: `Wygenerowane z ${nazwaPliku} — źródłem prawdy pozostaje plik .md`,
    styles: {
      default: {
        document: { run: { font: FONT, size: 21, color: INK }, paragraph: { spacing: { line: 300 } } },
        heading1: { run: { font: FONT, size: 40, bold: true, color: INK }, paragraph: { spacing: { after: 200 } } },
        heading2: { run: { font: FONT, size: 30, bold: true, color: INK } },
        heading3: { run: { font: FONT, size: 25, bold: true, color: CYNOBER } },
        heading4: { run: { font: FONT, size: 22, bold: true, color: MUTED } },
      },
    },
    numbering: {
      config: [{
        reference: 'kroki',
        levels: [0, 1, 2].map((poziom) => ({
          level: poziom,
          format: LevelFormat.DECIMAL,
          text: `%${poziom + 1}.`,
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 460 + poziom * 360, hanging: 300 } } },
        })),
      }],
    },
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ font: FONT, text: `${nazwaPliku} · wygenerowano ${new Date().toISOString().slice(0, 10)} · strona `, size: 16, color: MUTED }),
              new TextRun({ font: FONT, children: [PageNumber.CURRENT], size: 16, color: MUTED }),
              new TextRun({ font: FONT, text: ' z ', size: 16, color: MUTED }),
              new TextRun({ font: FONT, children: [PageNumber.TOTAL_PAGES], size: 16, color: MUTED }),
            ],
          })],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 240 },
          shading: { type: ShadingType.CLEAR, fill: PAPER, color: 'auto' },
          children: [new TextRun({
            text: `Kopia do czytania. Źródłem prawdy jest ${nazwaPliku} — tu nie nanosimy zmian, `
                + 'bo następne wygenerowanie je nadpisze.',
            font: FONT, size: 17, color: MUTED, italics: true,
          })],
        }),
        ...konwertuj(md),
      ],
    }],
  });
}

const pliki = process.argv.slice(2).length ? process.argv.slice(2) : DOKUMENTY;
mkdirSync(WY, { recursive: true });

for (const wzgledna of pliki) {
  const md = readFileSync(join(ROOT, wzgledna), 'utf8');
  const nazwa = basename(wzgledna, '.md');
  const buffer = await Packer.toBuffer(zbuduj(md, basename(wzgledna)));
  const cel = join(WY, `${nazwa}.docx`);
  writeFileSync(cel, buffer);
  console.log(`✓ ${wzgledna}  ->  docs/docx/${nazwa}.docx  (${Math.round(buffer.length / 1024)} kB)`);
}
