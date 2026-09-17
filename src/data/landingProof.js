/*
  Artefakty rzeczywistości na landingu, które wymagają MATERIAŁÓW I DECYZJI WŁAŚCICIELA
  (humanizacja landingu 2026-09-03, analiza Smoobu §7 plan pkt 1–2 i 4).

  Zasada: brak materiału = elementu NIE MA w DOM. Nigdy pusta ramka, „zdjęcie wkrótce",
  stock, wygenerowana twarz ani wymyślony cytat czy liczba. LandingPage renderuje każdy
  z bloków warunkowo, więc do czasu decyzji strona wygląda tak, jakby tych pól nie było.

  Osobny plik danych, nie stałe w komponencie (react-refresh/only-export-components).
  Zdjęcia: pliki w src/assets/landing/ (import = URL z haszem, nie public/), WebP,
  poziome, min. 1600 px, własne (nie z galerii portalu robionej przez fotografa bez praw).

  JAK WYPEŁNIĆ (po mailu zwrotnym właściciela z decyzjami a–g):
    import rus01 from '../assets/landing/rus-2026-zewnatrz-01.webp';
    export const PHOTOS = [
      { src: rus01, width: 1600, height: 1067, alt: 'Domek letniskowy w Rusi, w tle jezioro',
        caption: 'Ruś nad Jeziorem Ruskim, sierpień 2026' },
    ];
    export const FOUNDER = {
      name: 'Szymon Wasiak', role: 'gospodarz · Domki Letniskowe Ruś',
      photo: twarz, photoAlt: 'Szymon Wasiak',
      text: 'Dwa zdania „dlaczego to zbudowałem" — słowo po słowie zaakceptowane przez właściciela.',
      footerLine: 'WynajemPRO prowadzi Szymon Wasiak, gospodarz Domków Letniskowych Ruś na Warmii.',
    };
    export const BETA = { hosts: 0, properties: 0, asOf: '2026-09-03' }; // liczby z /admin, z datą stanu
  Cytaty testerów: dopiero po pisemnej zgodzie każdej osoby (wzór maila od agenta legal),
  nigdy z komentarzy w grupie FB ani z plików testerów.
*/
/*
  DECYZJE WŁAŚCICIELA (a)–(g) z 2026-09-17 — czytaj, zanim cokolwiek tu wypełnisz:
    (a) nazwisko na landingu: NIE · (b) zdjęcie twarzy: NIE
        → FOUNDER zostaje null Z DECYZJI, nie z braku materiału. Nie wypełniać
          (ani bloku założyciela, ani footerLine z nazwiskiem) bez nowej decyzji.
    (c) nazwa „Domki Letniskowe Ruś": TAK · (e) pierwsza osoba w karcie „Z praktyki": TAK
        → naniesione wprost w LandingPage.jsx (karta „Z praktyki").
    (d) FAQ „Odpisuję osobiście, mailem, zwykle w ciągu 24–48 godzin roboczych": TAK → w FAQ.
    (f) zakres „1 domek czy 20 apartamentów": ZOSTAJE.
    (g) ocena Airbnb 5,0 przy 5 opiniach: NIE — wracamy przy większej liczbie opinii.
  Precyzja miejsca: „Warmia i Mazury" (2026-09-17). NADAL OTWARTE: liczby z /admin z datą stanu → BETA.
*/
import rusDomekZDrona from '../assets/landing/rus-domek-z-drona.webp';

/* Zdjęcie 1: kadr 1:51 z filmu z drona dostarczonego przez właściciela 2026-09-17
   (npm run zdjecia:build, kadr zapisany w scripts/build-landing-photos.mjs). Bez osób,
   bez czytelnych tablic; zabudowa sąsiadów tylko w rogu dalekiego tła.
   Prawa potwierdzone przez właściciela 2026-09-17: materiał własny, sam latał dronem.
   Precyzja miejsca (druga połowa decyzji (c)): „Warmia i Mazury" — nie zawężać w podpisach
   ani w alt-ach. Daty nagrania właściciel nie podał, więc podpis jej nie zawiera. */
export const PHOTOS = [
  {
    src: rusDomekZDrona,
    width: 1200,
    height: 800,
    alt: 'Drewniany domek letniskowy z zadaszonym tarasem na ogrodzonej działce, widok z drona',
    caption: 'Domki Letniskowe Ruś, Warmia i Mazury · własne ujęcie z drona',
    // Dopisek na prośbę właściciela (2026-09-17), jego słowami. ⚠️ Niesie termin: wiosną 2027
    // zdjęcie i to zdanie są do wymiany (Backlog, iteracja 2 pkt 8) — po terminie zacznie kłamać.
    note: 'To zdjęcie z początków mojej przygody z wynajmem. Nowe, już z dwoma domkami, dodam wiosną 2027, kiedy skończą się prace przy basenach.',
  },
];
export const FOUNDER = null;
export const BETA = null;
