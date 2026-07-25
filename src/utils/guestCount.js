/*
  X14: „Liczba gości" rozbita na dorosłych, dzieci i zwierzęta.

  Model: `adults`, `children`, `pets` to pola opcjonalne (liczby całkowite ≥ 0).
  `guests` ZOSTAJE w dokumencie jako suma OSÓB (dorośli + dzieci) — na tym polu stoją
  istniejące rezerwacje, widok szczegółów i raporty (zgodność wstecz).
  Zwierzęta NIE są osobami i do sumy nie wchodzą.

  Jedno źródło prawdy dla podglądu sumy w formularzu i dla zapisu w ManagerApp.
*/

// '' / null / undefined → null (pole puste). Reszta → liczba całkowita ≥ 0.
export const toCount = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Math.trunc(Number(String(value).replace(',', '.')));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Suma osób. null = nie podano ani dorosłych, ani dzieci (pole `guests` zostaje puste).
export const guestsTotal = (adults, children) => {
  const a = toCount(adults);
  const c = toCount(children);
  return a === null && c === null ? null : (a || 0) + (c || 0);
};
