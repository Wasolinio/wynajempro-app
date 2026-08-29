/*
  Powtarzalność zadań (moduł Zadania, E3 partia 2) — rozwijanie `recurrence`
  na kolejne terminy. Model pola (IMPLEMENTACJA.md §1):
    recurrence: null | { kind: 'weekly' | 'monthly' | 'afterCheckout', label }

  Mechanika: odhaczenie zadania z `recurrence` tworzy następne wystąpienie
  (WynajemContext.toggleTaskDone) z terminem policzonym tutaj. Jedno źródło
  liczenia — ta sama lekcja co X20 dla terminów z szablonów (taskSchedule).

  Daty wyłącznie lokalnie ('YYYY-MM-DD'), nie toISOString.
*/

export const RECURRENCE_KINDS = [
  { kind: 'weekly', label: 'co tydzień' },
  { kind: 'monthly', label: 'co miesiąc' },
  { kind: 'afterCheckout', label: 'po wyjeździe' },
];

export const recurrenceLabel = (kind) => RECURRENCE_KINDS.find((k) => k.kind === kind)?.label || '';

const toDayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseDay = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

const propName = (p) => (typeof p === 'object' ? p?.name : p);

/*
  Termin następnego wystąpienia po odhaczeniu. Baza = dotychczasowy termin zadania,
  a gdy go brak (zadanie ze skrzynki) — dzisiaj.

  - weekly:  +7 dni
  - monthly: ten sam dzień następnego miesiąca, przycięty do końca miesiąca
             (31 stycznia → 28/29 lutego, nie 2/3 marca).
             ⚠️ Przycięcie jest TRWAŁE dla serii: kolejny termin liczy się od daty
             przyciętej, więc 31 sty → 28 lut → 28 mar → 28 kwi (a nie z powrotem 31).
             Świadome uproszczenie — inaczej trzeba by trzymać przy zadaniu „dzień
             kotwicy" osobno od terminu. Sprawdzone ręcznie przy przeglądzie 2026-08-29.
  - afterCheckout: najbliższy WYJAZD z rezerwacji obiektu zadania PO dacie bazowej;
             brak przyszłego wyjazdu = brak następnego wystąpienia (null) —
             zadanie nie ma się mnożyć w pustkę. Zwracany jest też id tej
             rezerwacji, żeby nowe wystąpienie dostało chip gościa.

  Zwraca { date: 'YYYY-MM-DD', rentalId: string | null } albo null.
*/
export function nextOccurrence(task, { rentals = [], today = null } = {}) {
  const kind = task?.recurrence?.kind;
  if (!kind) return null;
  const base = parseDay(task.date) || (today ? parseDay(today) : new Date());
  base.setHours(0, 0, 0, 0);

  if (kind === 'weekly') {
    const d = new Date(base); d.setDate(d.getDate() + 7);
    return { date: toDayStr(d), rentalId: null };
  }
  if (kind === 'monthly') {
    const day = base.getDate();
    const first = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    first.setDate(Math.min(day, lastDay));
    return { date: toDayStr(first), rentalId: null };
  }
  if (kind === 'afterCheckout') {
    const baseStr = toDayStr(base);
    const next = rentals
      .filter((r) => r.type === 'booking' && r.endDate && r.endDate > baseStr
        && (!task.propertyName || propName(r.property) === task.propertyName))
      .sort((a, b) => (a.endDate < b.endDate ? -1 : 1))[0];
    return next ? { date: next.endDate, rentalId: next.id } : null;
  }
  return null;
}
