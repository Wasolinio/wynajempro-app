/*
  E6 (runda 3): zadanie gospodarza jako wydarzenie kalendarza podawane z PRAWDZIWEGO
  adresu https. Historia porażek na iOS (potwierdzone na iPhonie właściciela na
  produkcji, 2026-08-28): anchor z `download` → plik w Pobranych bez ścieżki do
  Kalendarza; nawigacja do blob: → to samo. Działający wzorzec rynkowy (Booksy):
  Safari pokazuje natywny podgląd wydarzenia „Dodaj wszystkie" przy nawigacji do
  adresu https zwracającego `text/calendar` z `Content-Disposition: inline`
  (`attachment` wymusza pobieranie — dlatego exportIcal się tu nie nadaje).

  Funkcja jest CZYSTYM FORMATTEREM: parametry → VCALENDAR z jednym VEVENT.
  Zero odczytów Firestore, zero App Check (nawigacja nie niesie tokenu — endpoint
  publiczny z założenia, jak exportIcal); ochroną są twarda walidacja i capy długości.

  Moduł osobno od index.js z tego samego powodu co ical-sync.js: `node --test`
  przechodzi bez inicjalizacji Admin SDK i bez emulatora (w środowisku nie ma Javy).
*/

// Escaping 1:1 jak `esc` w exportIcal (index.js): `\r` usuwamy, resztę escapujemy,
// backslash pierwszy. To on gwarantuje, że wstrzyknięte CRLF nie rozerwie linii VEVENT.
const esc = (t) => String(t).replace(/\r/g, "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UID_RE = /^[A-Za-z0-9@._-]{1,120}$/;

/**
 * Buduje odpowiedź HTTP dla zapytania o .ics zadania.
 * query: { t?: tytuł (trim, cap 300), d: 'YYYY-MM-DD', uid?: identyfikator wydarzenia }
 * Zwraca { status, headers?, body }.
 */
function taskIcsResponse(query, now = new Date()) {
  const t = (query.t || "").toString().trim().slice(0, 300) || "Zadanie";
  const d = (query.d || "").toString();
  const uidParam = (query.uid || "").toString();

  if (!DATE_RE.test(d)) {
    return { status: 400, body: "Nieprawidłowa data (wymagany format YYYY-MM-DD)." };
  }
  // Regex przepuszcza np. 2026-13-40 — kontrola przez round-trip składników daty.
  const [y, m, dd] = d.split("-").map(Number);
  const dt = new Date(y, m - 1, dd);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== dd) {
    return { status: 400, body: "Nieprawidłowa data (dzień nie istnieje w kalendarzu)." };
  }

  // Brak/niepoprawny uid → losowy. Stabilny uid z panelu pozwala aplikacji kalendarza
  // rozpoznać duplikat przy ponownym dodaniu (czy nadpisze, zależy od klienta).
  const uid = UID_RE.test(uidParam)
    ? uidParam
    : `zadanie-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@wynajempro.pl`;

  // Wydarzenie całodniowe: DTEND to dzień NASTĘPNY (koniec wyłączny) — jak w exportIcal.
  const next = new Date(y, m - 1, dd + 1);
  const compact = (date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const dtstamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WynajemPRO//Zadania//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${esc(uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${d.split("-").join("")}`,
    `DTEND;VALUE=DATE:${compact(next)}`,
    `SUMMARY:${esc(t)}`,
    // przypomnienie o 9:00 w dniu zadania (start całodniowego to północ)
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(t)}`,
    "TRIGGER:PT9H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n") + "\r\n";

  return {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // `inline` jest sednem tej funkcji — patrz nagłówek pliku
      "Content-Disposition": 'inline; filename="zadanie.ics"',
      "Cache-Control": "private, max-age=300",
    },
    body,
  };
}

module.exports = { taskIcsResponse };
