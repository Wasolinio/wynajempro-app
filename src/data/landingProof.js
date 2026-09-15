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
export const PHOTOS = [];
export const FOUNDER = null;
export const BETA = null;
