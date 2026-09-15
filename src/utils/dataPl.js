/*
  Daty i liczebniki po polsku — jedno miejsce zamiast lokalnych kopii w komponentach.

  formatujDatePl('2026-08-29') → „29 sierpnia" (rok tylko, gdy inny niż bieżący) —
  zachowanie 1:1 z popupu „Co nowego" (PatchNotesModal). Z { zRokiem: 'zawsze' } →
  „29 sierpnia 2026" — na stronach publicznych czytelnik nie zna kontekstu roku.

  Parsowanie ręczne, NIE `new Date('RRRR-MM-DD')`: ISO bez godziny jest interpretowane
  jako UTC, więc w strefie Europe/Warsaw północ przesunęłaby dzień do tyłu.
*/
export function formatujDatePl(dateStr, { zRokiem = 'auto', miesiac = 'long' } = {}) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const opts = { day: 'numeric', month: miesiac };
  if (zRokiem === 'zawsze' || (zRokiem === 'auto' && y !== new Date().getFullYear())) opts.year = 'numeric';
  return new Date(y, m - 1, d).toLocaleDateString('pl-PL', opts);
}

// miesiacRokPl('2026-09-03') → „wrzesień 2026" (mianownik — podpis „stan z wrzesień 2026"
// brzmi źle, więc dla podpisów używamy formy „stan z: wrzesień 2026" albo dopełniacza niżej)
export function miesiacRokPl(dateStr) {
  const [y, m] = String(dateStr).split('-').map(Number);
  if (!y || !m) return dateStr;
  // dopełniacz nazw miesięcy — toLocaleDateString z dniem daje go za darmo, bez dnia mianownik
  const dopelniacz = new Date(y, m - 1, 1).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }).replace(/^\d+\s/, '');
  return `${dopelniacz} ${y}`;
}

// odmien(5, ['wpis', 'wpisy', 'wpisów']) → „5 wpisów"; reguła: 1 · 2–4 (poza 12–14) · reszta
export function odmien(n, [jeden, kilka, wiele]) {
  const abs = Math.abs(n);
  const r10 = abs % 10;
  const r100 = abs % 100;
  const forma = abs === 1 ? jeden : (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) ? kilka : wiele;
  return `${n} ${forma}`;
}
