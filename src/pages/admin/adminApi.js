import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

/*
  Klient panelu administratora — jedno wejście `adminApi` po stronie funkcji.

  Panel NIE czyta Firestore bezpośrednio i nie ma takiej możliwości: reguły zabraniają
  klientowi odczytu `contact_messages` i cudzych kont, i celowo tego nie zmieniamy.
  Wszystko, co widać na ekranie, przeszło przez Admin SDK i zostało tam zawężone.
*/
const call = httpsCallable(functions, 'adminApi');

export async function adminCall(action, params = {}) {
  try {
    const res = await call({ action, ...params });
    return res.data;
  } catch (err) {
    // Kody z HttpsError → komunikaty, które coś znaczą dla patrzącego.
    const code = (err && err.code ? String(err.code) : '').replace('functions/', '');
    if (code === 'permission-denied') {
      throw new Error('Brak uprawnień administratora. Token mógł być wydany przed nadaniem uprawnienia — wyloguj się i zaloguj ponownie.');
    }
    if (code === 'unauthenticated') {
      // Ten sam kod zwraca odrzucenie przez App Check (funkcja ma enforceAppCheck).
      // Diagnozowanie sesji zamiast atestacji to powtarzalna pułapka tego projektu —
      // komunikat musi wymieniać obie możliwości, inaczej ściga się nie ten problem.
      throw new Error('Sesja wygasła albo żądanie nie przeszło App Check. Zaloguj się ponownie; '
        + 'jeśli to nie pomoże, sprawdź App Check w konsoli Firebase.');
    }
    if (code === 'not-found') throw new Error(err.message || 'Nie znaleziono.');
    if (code === 'invalid-argument') throw new Error(err.message || 'Nieprawidłowe żądanie.');
    throw new Error(err && err.message ? err.message : 'Nie udało się pobrać danych.');
  }
}

/* ── Formatowanie ── */
const nf = new Intl.NumberFormat('pl-PL');
export const fmtNum = (n) => nf.format(Math.round(Number(n) || 0));
export const fmtMoney = (n, currency = 'PLN') =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(n) || 0);

export const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
export const fmtDateTime = (ms) => (ms ? new Date(ms).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

/** „3 dni temu" / „za 5 dni" — przy kontach i trialach liczy się dystans, nie data. */
export const fmtRelative = (ms) => {
  if (!ms) return '—';
  const diff = Math.round((ms - Date.now()) / 86400000);
  if (diff === 0) return 'dziś';
  if (diff === 1) return 'jutro';
  if (diff === -1) return 'wczoraj';
  if (diff > 0) return `za ${diff} dni`;
  return `${Math.abs(diff)} dni temu`;
};

/** Zmiana procentowa okres do okresu; null gdy poprzedni okres był pusty (dzielenie przez zero kłamie). */
export const delta = (now, prev) => {
  if (!prev) return null;
  return Math.round(((now - prev) / prev) * 100);
};

/* ── Statusy kont ── */
export const STATUS_LABEL = {
  trialing: 'Trial',
  active: 'Aktywna',
  past_due: 'Zaległość',
  canceled: 'Anulowana',
  none: 'Brak statusu',
  'brak dokumentu': 'Brak dokumentu',
};
export const STATUS_TONE = {
  trialing: 'granat',
  active: 'green',
  past_due: 'amber',
  canceled: 'cynober',
  none: 'muted',
  'brak dokumentu': 'cynober',
};

/** Plik CSV z BOM — bez niego Excel w polskiej lokalizacji rozjeżdża znaki diakrytyczne. */
export function downloadCsv(filename, rows) {
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(';')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
