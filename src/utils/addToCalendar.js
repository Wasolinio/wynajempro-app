/*
  E6: „Dodaj do kalendarza" przy zadaniu (wzorzec Booksy) — decyzja właściciela 2026-08-28.
  Klik przy zadaniu zapisuje je jako wydarzenie CAŁODNIOWE w kalendarzu telefonu gospodarza;
  przypomnienie obsługuje aplikacja kalendarza. Rozwiązanie czysto frontendowe: plik .ics
  (Apple/Outlook) albo szablon Google Calendar — bez Cloud Functions i bez feedu
  subskrypcyjnego (rezerwacje mają swój `exportIcal` w functions/index.js, to co innego).

  Terminy zadań liczy WYŁĄCZNIE src/utils/taskSchedule.js (X20) — ten moduł dostaje
  gotową datę 'YYYY-MM-DD' i tylko ją formatuje. Nie liczy żadnych terminów.
*/

export const isDateStr = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

// Data lokalna → 'YYYY-MM-DD'. Celowo bez toISOString(): UTC przesuwa dzień po 22:00 czasu PL.
// String, który JUŻ jest 'YYYY-MM-DD', przechodzi bez konwersji — `new Date('YYYY-MM-DD')`
// to północ UTC i na zachód od UTC cofnęłaby dzień (przegląd kodu 2026-08-28).
export const toDateStr = (d) => {
  if (!d) return null;
  if (isDateStr(d)) return d;
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// Zadanie ZALEGŁE to „do zrobienia teraz" — wydarzenie staje w kalendarzu DZIŚ, nie
// w przeszłości, gdzie alarm nigdy nie odpali (decyzja właściciela po przeglądzie kodu
// 2026-08-28). Stringi 'YYYY-MM-DD' porównują się leksykograficznie.
export const clampToToday = (dateStr, today = new Date()) => {
  if (!isDateStr(dateStr)) return null;
  const t = toDateStr(today);
  return dateStr < t ? t : dateStr;
};

// DTEND wydarzenia całodniowego to dzień NASTĘPNY (koniec wyłączny) — jak w `exportIcal`.
const nextDayStr = (dateStr) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return toDateStr(new Date(y, m - 1, d + 1));
};

const compact = (dateStr) => String(dateStr).replace(/-/g, '');

// Escaping tekstu w .ics — ten sam co `esc` w functions/index.js (eksport iCal rezerwacji):
// `\r` usuwamy, resztę escapujemy. Kolejność ma znaczenie: backslash pierwszy.
const esc = (t) => String(t).replace(/\r/g, '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// SUMMARY = treść zadania (+ obiekt i gość, jeśli są) — gospodarz widzi w kalendarzu
// od razu, czego i kogo zadanie dotyczy. Fallback 'Zadanie' PRZED sklejeniem z nawiasem,
// żeby stare zadanie bez treści nie dawało „undefined (Obiekt)" ani „ (Obiekt)".
export const taskEventContent = ({ text, property, guest }) => {
  const base = String(text || 'Zadanie');
  const extra = [property, guest].filter(Boolean).join(', ');
  return {
    summary: extra ? `${base} (${extra})` : base,
    details: [
      'Zadanie z panelu WynajemPRO',
      property ? `Obiekt: ${property}` : null,
      guest ? `Gość: ${guest}` : null,
    ].filter(Boolean).join('\n'),
  };
};

/*
  Treść pliku .ics dla jednego zadania. UID stabilny ({rentalId}-{taskId}@wynajempro.pl):
  pozwala aplikacji kalendarza ROZPOZNAĆ duplikat przy ponownym imporcie — czy go nadpisze,
  czy zdubluje, zależy od klienta (iOS przy ręcznym imporcie potrafi zdublować);
  do potwierdzenia na urządzeniu.
  VALARM TRIGGER:PT9H = przypomnienie o 9:00 w dniu zadania (start całodniowego to północ);
  Apple Calendar je uszanuje, Google przy imporcie pliku może zignorować — akceptowalne.
*/
export const buildTaskIcs = ({ dateStr, summary, details, uid }) => {
  if (!isDateStr(dateStr)) return null;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WynajemPRO//Zadania//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${esc(uid)}@wynajempro.pl`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${compact(dateStr)}`,
    `DTEND;VALUE=DATE:${compact(nextDayStr(dateStr))}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(details)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(summary)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n';
};

// Szablon Google Calendar — na Androidzie otwiera aplikację kalendarza z gotowym
// wydarzeniem; przypomnienie dostaje domyślne ustawienia użytkownika.
export const buildGoogleCalendarUrl = ({ dateStr, summary, details }) => {
  if (!isDateStr(dateStr)) return null;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${compact(dateStr)}/${compact(nextDayStr(dateStr))}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Pobranie pliku: Blob + tymczasowy <a download> — jedyny fragment dotykający DOM.
export const downloadIcs = (icsText, filename) => {
  if (!icsText) return;
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'zadanie.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
