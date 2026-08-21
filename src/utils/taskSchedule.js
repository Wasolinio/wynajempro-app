/*
  X20: termin zadania z szablonu — kotwica PRZYJAZD albo WYJAZD.

  Model szablonu (`users/{uid}/settings/reminders.items[]`):
    anchor      'arrival' | 'departure'  — pole OPCJONALNE; brak = 'arrival' (zgodność wstecz)
    daysBefore  liczba dni ze znakiem: dodatnia = PRZED kotwicą, ujemna = PO kotwicy

  Znak `daysBefore` zostaje taki, jaki był przed X20 — zapisane szablony (także te
  z ujemną wartością, jak „-2" testera) liczą się dalej tak samo, tylko teraz można
  im wskazać drugą kotwicę. Ujemnych liczb gospodarz w interfejsie nie wpisuje:
  formularz składa je z listy „kiedy" + liczby dni bez znaku.

  Jedno źródło prawdy dla pulpitu (ManagerApp), szczegółów rezerwacji i ustawień —
  lekcja z X17: dwa niezależne przebiegi po tych samych danych w końcu się rozjeżdżają.
*/

import { plural } from './plural';

export const templateAnchor = (t) => (t?.anchor === 'departure' ? 'departure' : 'arrival');

// Data, od której liczymy termin: przyjazd (`date`) albo wyjazd (`endDate`, a gdy go brak — przyjazd).
export const anchorDateStr = (rental, template) => (
  templateAnchor(template) === 'departure' ? (rental?.endDate || rental?.date) : rental?.date
);

const midnight = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

// Dzień, w którym zadanie staje się aktualne. null, gdy rezerwacja nie ma daty kotwicy.
export const taskDueDate = (rental, template) => {
  const base = midnight(anchorDateStr(rental, template));
  if (!base) return null;
  base.setDate(base.getDate() - (Number(template?.daysBefore) || 0));
  return base;
};

// Ile dni zostało do kotwicy (ujemnie = kotwica minęła). null przy braku daty.
export const daysToAnchor = (rental, template, from = new Date()) => {
  const base = midnight(anchorDateStr(rental, template));
  if (!base) return null;
  const today = new Date(from); today.setHours(0, 0, 0, 0);
  return Math.ceil((base - today) / 86400000);
};

// Zadanie jest aktualne od dnia terminu do 30 dni po kotwicy (okno jak przed X20).
export const isTaskDue = (rental, template, from = new Date()) => {
  const diff = daysToAnchor(rental, template, from);
  if (diff === null) return false;
  return diff <= (Number(template?.daysBefore) || 0) && diff >= -30;
};

/* ── Opis słowny — to jest odpowiedź na „czym są minus 2?" ── */

// Wartości listy „kiedy" w ustawieniach. Znak `daysBefore` wynika z wyboru, nie z wpisanej liczby.
export const WHEN_OPTIONS = [
  { value: 'arrival-before', label: 'Przed przyjazdem' },
  { value: 'arrival-after', label: 'Po przyjeździe' },
  { value: 'departure-before', label: 'Przed wyjazdem' },
  { value: 'departure-after', label: 'Po wyjeździe' },
];

export const whenValue = (template) => {
  const anchor = templateAnchor(template);
  const after = (Number(template?.daysBefore) || 0) < 0;
  return `${anchor}-${after ? 'after' : 'before'}`;
};

// Liczba dni bez znaku — tyle widzi i wpisuje gospodarz.
export const whenDays = (template) => Math.abs(Number(template?.daysBefore) || 0);

// Odwrotność powyższych: wybór z listy + liczba dni → pola szablonu.
export const templateTiming = (when, days) => {
  const [anchor, side] = String(when || 'arrival-before').split('-');
  const n = Math.abs(Math.trunc(Number(days)) || 0);
  // 0 dni „po" to ten sam dzień co 0 dni „przed" — zapisujemy 0, nigdy -0
  return { anchor: anchor === 'departure' ? 'departure' : 'arrival', daysBefore: side === 'after' && n !== 0 ? -n : n };
};

// „w dniu wyjazdu" · „3 dni przed przyjazdem" · „2 dni po wyjeździe"
export const describeTiming = (template) => {
  const anchor = templateAnchor(template);
  const days = whenDays(template);
  const after = (Number(template?.daysBefore) || 0) < 0;
  if (days === 0) return anchor === 'departure' ? 'w dniu wyjazdu' : 'w dniu przyjazdu';
  const unit = plural(days, ['dzień', 'dni', 'dni']);
  if (anchor === 'departure') return `${days} ${unit} ${after ? 'po wyjeździe' : 'przed wyjazdem'}`;
  return `${days} ${unit} ${after ? 'po przyjeździe' : 'przed przyjazdem'}`;
};

// Zdanie kontrolne pod formularzem — gospodarz czyta, co się stanie, zamiast domyślać się ze znaku.
export const describeTimingSentence = (template) => `Zadanie pojawi się ${describeTiming(template)} gościa.`;

/* ── Sprzątanie (X21) ── */
// Szablon sprzątania rozpoznajemy po identyfikatorze z domyślnego zestawu.
export const isCleaningTemplate = (t) => t?.id === 'cleaning';
