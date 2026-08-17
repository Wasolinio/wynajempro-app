/*
  Polityka haseł — LUSTRO ustawienia z konsoli Firebase.

  Konsola: Authentication → Settings → Password policy, tryb „Require enforcement",
  ustawione 2026-08-17: minimum 8 znaków, wymagana wielka litera, mała litera i cyfra
  (znak specjalny świadomie NIE jest wymagany; „Force upgrade on sign-in" wyłączone,
  więc istniejące hasła działają dalej).

  Po co ten plik: Firebase i tak odrzuci hasło niezgodne z polityką, ale robi to
  komunikatem `auth/weak-password` BEZ informacji, czego brakuje. Przed tą zmianą ekran
  resetu hasła mówił „minimum 6 znaków", więc użytkownik spełniał to, co widział, dostawał
  odmowę i wchodził w pętlę bez wyjścia — na najgorszej możliwej ścieżce, czyli u kogoś,
  kto już nie może się zalogować.

  ⚠️ Zmiana polityki w konsoli wymaga zmiany TUTAJ. Inaczej ekran znowu zacznie kłamać
  i nikt się o tym nie dowie, bo Firebase nie zgłasza rozjazdu.

  ⚠️ Klasy znaków celowo ASCII (`A-Z`, `a-z`). Nie mamy potwierdzonego, jak dokładnie
  Firebase traktuje polskie znaki diakrytyczne przy wymogu „uppercase/lowercase", więc
  lustro jest ostrożne: może odrzucić hasło, które Firebase by przyjął (użytkownik dostanie
  wtedy konkretną wskazówkę), ale nigdy nie przepuści hasła, które Firebase odrzuci —
  a tylko ten drugi kierunek tworzy pętlę.
*/

export const PASSWORD_MIN_LENGTH = 8;

// Jedno zdanie do pokazania pod polem hasła — zanim użytkownik cokolwiek wpisze.
export const PASSWORD_HINT =
  'Minimum 8 znaków, w tym wielka litera, mała litera i cyfra.';

// Lista po polsku: „a”, „a i b”, „a, b i c”.
const wylicz = (items) =>
  items.length <= 1
    ? (items[0] || '')
    : `${items.slice(0, -1).join(', ')} i ${items[items.length - 1]}`;

/**
 * Sprawdza hasło wobec polityki.
 * @returns {string|null} komunikat dla użytkownika albo null, gdy hasło spełnia wymagania.
 */
export const validatePassword = (password) => {
  const pwd = password || '';
  const brakuje = [];

  if (pwd.length < PASSWORD_MIN_LENGTH) brakuje.push(`co najmniej ${PASSWORD_MIN_LENGTH} znaków`);
  if (!/[A-Z]/.test(pwd)) brakuje.push('wielkiej litery');
  if (!/[a-z]/.test(pwd)) brakuje.push('małej litery');
  if (!/[0-9]/.test(pwd)) brakuje.push('cyfry');

  if (brakuje.length === 0) return null;
  return `Hasło nie spełnia wymagań — brakuje: ${wylicz(brakuje)}.`;
};
