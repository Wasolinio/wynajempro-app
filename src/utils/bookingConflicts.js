// =============================================================================
// WYKRYWANIE KOLIZJI TERMINÓW — WynajemPRO (X26)
//
// PO CO. Tester zarzucił, że iCal „to nie jest żadne rozwiązanie", i co do faktów
// miał rację: format przenosi samą zajętość, z opóźnieniem liczonym w godzinach.
// Portale odświeżają importowane kalendarze co kilka godzin (publiczne opisy podają
// przedział rzędu 1–4 h, bez gwarancji), więc ŻADNA implementacja po naszej stronie
// nie zapobiegnie podwójnej sprzedaży terminu.
//
// Ale iCal, choć nie umie ZAPOBIEC, umie DONIEŚĆ — a my jesteśmy jedynym miejscem,
// w którym leżą rezerwacje ze WSZYSTKICH portali naraz. Mamy więc lepszą pozycję
// do wykrycia kolizji niż którykolwiek portal osobno. Do 2026-08-22 nie było w kodzie
// ani jednej linijki, która by to sprawdzała, mimo że strona obiecywała „koniec
// z overbookingiem" w sześciu miejscach.
//
// Czysta logika, bez Reacta i bez Firebase — liczona z danych, które panel i tak
// trzyma w pamięci, więc kosztuje zero odczytów bazy.
// =============================================================================

/**
 * Doba hotelowa: rezerwacja zajmuje noce od `date` do `endDate` WYŁĄCZNIE.
 * Wyjazd 10-go i przyjazd 10-go to NIE jest kolizja — to sprzątanie tego samego dnia.
 */
function nachodzi(a, b) {
  const aOd = a.date, aDo = koniec(a);
  const bOd = b.date, bDo = koniec(b);
  return aOd < bDo && bOd < aDo;
}

/**
 * Rezerwacja bez `endDate` to JEDNA noc — tak samo liczy ją eksport iCal
 * (`functions/index.js`, `dtend = date + 1`). Wcześniej wykrywanie kolizji przyjmowało
 * tu zero nocy, więc taki wpis blokował termin w portalach, ale nigdy nie zgłaszał kolizji.
 */
function koniec(r) {
  if (r.endDate) return r.endDate;
  const d = new Date(r.date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Rezerwacja, która zniknęła z portalu, nie blokuje już terminu — nie liczy się do kolizji. */
function liczySie(r) {
  return r && r.type === 'booking' && r.date && r.syncStatus !== 'vanished';
}

/**
 * Znajduje kolizje terminów w obrębie każdego obiektu.
 *
 * @param {Array} rentals — wszystkie pozycje (rezerwacje, media, przypomnienia)
 * @returns {Array<{property:string, a:Object, b:Object, odDnia:string, doDnia:string, rozneZrodla:boolean}>}
 *          `rozneZrodla` = kolizja MIĘDZY portalami (najpoważniejsza — realny overbooking),
 *          a nie dwa wpisy z tego samego źródła (częściej pomyłka gospodarza).
 */
export function znajdzKolizje(rentals) {
  const bookings = (rentals || []).filter(liczySie);

  // Grupujemy po obiekcie — kolizja ma sens tylko w obrębie jednego domku.
  const wgObiektu = new Map();
  for (const r of bookings) {
    const klucz = r.property || '';
    if (!wgObiektu.has(klucz)) wgObiektu.set(klucz, []);
    wgObiektu.get(klucz).push(r);
  }

  const kolizje = [];
  for (const [property, lista] of wgObiektu) {
    // Sortowanie po dacie startu pozwala przerwać wewnętrzną pętlę wcześnie:
    // gdy kolejna rezerwacja zaczyna się po końcu bieżącej, dalsze też się zaczną.
    lista.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));

    for (let i = 0; i < lista.length; i++) {
      const a = lista[i];
      const aDo = koniec(a);
      for (let j = i + 1; j < lista.length; j++) {
        const b = lista[j];
        if (b.date >= aDo) break;
        if (!nachodzi(a, b)) continue;
        const odDnia = a.date > b.date ? a.date : b.date;
        const aDoD = koniec(a), bDoD = koniec(b);
        const doDnia = aDoD < bDoD ? aDoD : bDoD;
        kolizje.push({
          property, a, b, odDnia, doDnia,
          rozneZrodla: (a.source || '') !== (b.source || ''),
        });
      }
    }
  }

  // Najpierw kolizje między portalami, potem najbliższe w czasie.
  kolizje.sort((x, y) => {
    if (x.rozneZrodla !== y.rozneZrodla) return x.rozneZrodla ? -1 : 1;
    return x.odDnia < y.odDnia ? -1 : x.odDnia > y.odDnia ? 1 : 0;
  });
  return kolizje;
}

/** Kolizje dotyczące dziś lub przyszłości — te, na które gospodarz jeszcze może zareagować. */
export function znajdzKolizjeAktualne(rentals, dzisiaj = new Date().toISOString().slice(0, 10)) {
  return znajdzKolizje(rentals).filter((k) => k.doDnia > dzisiaj);
}

/** Rezerwacje, które zniknęły z portalu i czekają na decyzję gospodarza. */
export function znajdzZnikle(rentals, dzisiaj = new Date().toISOString().slice(0, 10)) {
  return (rentals || [])
    .filter((r) => r.type === 'booking' && r.syncStatus === 'vanished')
    .filter((r) => (r.endDate || r.date) >= dzisiaj)
    .sort((x, y) => (x.date < y.date ? -1 : 1));
}
