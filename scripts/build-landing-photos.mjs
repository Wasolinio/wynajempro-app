/*
  Zdjęcia właściciela na landing (E8 część B, zlecenie #15) — źródło → WebP w src/assets/landing/.

  PO CO SKRYPT, a nie ręczny eksport: czwarta powtórka tej samej lekcji (OG, banery, zrzuty
  panelu) — plik, którego nie da się odtworzyć komendą, przy pierwszej poprawce kadru robi się
  od nowa „na oko". Kadr i rozmiar są tu zapisane liczbami.

  Kodowanie przez canvas w Chromium (Playwright), bo w środowisku nie ma sharp ani cwebp —
  ten sam wzorzec co scripts/zrzuty/panel.zrzut.js. Chromium czyta też AVIF, więc źródłem
  może być plik pobrany z portalu, o ile prawa do zdjęcia ma właściciel.

  ŹRÓDŁA: _design-reference/zdjecia-rus/ — wyłącznie materiały WŁASNE właściciela (zdjęcia
  z telefonu, kadry z własnego filmu z drona). Nigdy stock, nigdy zdjęcia fotografa portalu
  bez przeniesienia praw. W kadrze nie ma osób, czytelnych tablic, haseł Wi-Fi ani kodów.

  Uruchomienie: npm run zdjecia:build   → potem wpisz wynik do src/data/landingProof.js
*/
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '_design-reference', 'zdjecia-rus');
const OUT = join(ROOT, 'src', 'assets', 'landing');
const JAKOSC = 0.72;

/* kadr = prostokąt wycinany ze źródła (px źródła); szer × wys = rozmiar wyniku.
   rus-dron-domek-0151.jpg: klatka 1:51 z filmu właściciela (4K, 3840×2160) — domek na wprost,
   auto schowane za budynkiem, zabudowa sąsiadów tylko w dalekim tle. Kadr 3:2.
   Kadr v3 (2026-09-17, po uwadze właściciela „tragicznie wygląda"): domek zajmuje 2/3 szerokości,
   nad nim linia lasu i niebo — wcześniejsze kadry miały pół obrazu trawnika. */
const ZDJECIA = [
  {
    zrodlo: 'rus-dron-domek-0151.jpg',
    wynik: 'rus-domek-z-drona.webp',
    kadr: { x: 1200, y: 60, w: 1620, h: 1080 },
    szer: 1200,
    wys: 800,
  },
];

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif', '.webp': 'image/webp' };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
mkdirSync(OUT, { recursive: true });

for (const z of ZDJECIA) {
  const mime = MIME[extname(z.zrodlo).toLowerCase()];
  if (!mime) throw new Error(`Nieobsługiwany format źródła: ${z.zrodlo}`);
  const b64 = readFileSync(join(SRC, z.zrodlo)).toString('base64');
  const dataUrl = await page.evaluate(async ({ b64, mime, kadr, szer, wys, q }) => {
    const img = new Image();
    img.src = `data:${mime};base64,${b64}`;
    await img.decode();
    if (kadr.x + kadr.w > img.naturalWidth || kadr.y + kadr.h > img.naturalHeight) {
      throw new Error(`Kadr wychodzi poza źródło ${img.naturalWidth}×${img.naturalHeight}`);
    }
    const c = document.getElementById('c');
    c.width = szer; c.height = wys;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, kadr.x, kadr.y, kadr.w, kadr.h, 0, 0, szer, wys);
    return c.toDataURL('image/webp', q);
  }, { b64, mime, kadr: z.kadr, szer: z.szer, wys: z.wys, q: JAKOSC });
  if (!dataUrl.startsWith('data:image/webp')) throw new Error('Chromium nie zakodował WebP');
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  writeFileSync(join(OUT, z.wynik), buf);
  console.log(`✓ ${z.zrodlo} → src/assets/landing/${z.wynik}  ${z.szer}×${z.wys}  ${Math.round(buf.length / 1024)} kB`);
}
await browser.close();
