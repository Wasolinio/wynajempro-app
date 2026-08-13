/*
  Zbieranie błędów aplikacji (Sentry).

  PO CO: `GlobalErrorBoundary` pokazuje użytkownikowi markowy ekran i na tym się kończy —
  nikt się nie dowiaduje, że ktoś ten ekran zobaczył. Czerwony ekran z debugowego handlera
  wisiał na produkcji sześć tygodni ([[Known-Issues]] #12), a awaria stron gościa (#16)
  wyszła przypadkiem przy weryfikacji deployu. Bez telemetrii błędów jedynym czujnikiem
  jest zgłoszenie od klienta — czyli najdroższy możliwy.

  ⚠️ WYŁĄCZONE, DOPÓKI NIE MA `VITE_SENTRY_DSN`. Bez tej zmiennej nic się nie ładuje
  (SDK jest w osobnej paczce, dociąganej dynamicznie) i nic nie wychodzi na zewnątrz.
  Włączenie = decyzja właściciela, bo Sentry to NOWY PODPROCESOR w rozumieniu RODO:
  wymaga wiersza w Polityce §2/§5, w DPA §7 i erraty w pakiecie dla prawnika.

  RODO — dwie rzeczy wbudowane, nie zadeklarowane:
  1. `sendDefaultPii: false` — bez adresu e-mail, bez ciasteczek, bez nagłówków żądań.
  2. Maskowanie identyfikatorów w adresach: `/guide/<id>` i `/opinie/<id>` to strony,
     gdzie identyfikator JEST barierą dostępu (decyzja z 2026-07-22 o maskowaniu ich
     w Analytics — `Ocena-linki-guide-opinie.md`). Do Sentry idzie `/guide/[id]`.
*/

const DSN = import.meta.env.VITE_SENTRY_DSN;

/** `/guide/abc123?x=1` → `/guide/[id]` (ta sama zasada co przy zdarzeniach GA). */
export function zamaskujSciezke(url) {
  if (typeof url !== 'string') return url;
  return url
    .replace(/\/(guide|opinie)\/[^/?#]+/g, '/$1/[id]')
    .replace(/[?#].*$/, '');
}

let sentry = null;

export async function initMonitoring() {
  if (!DSN || sentry) return sentry;

  // Dynamiczny import: bez DSN paczka SDK nie trafia nawet do pobrania.
  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    // Bez śledzenia wydajności i bez nagrywania sesji — zbieramy wyłącznie błędy.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    ignoreErrors: [
      // Szum rozszerzeń przeglądarki i zerwanych połączeń — nie są błędami aplikacji.
      'ResizeObserver loop',
      'Non-Error promise rejection captured',
      /^Failed to fetch$/,
      /^NetworkError/,
    ],
    beforeSend(event) {
      if (event.request?.url) event.request.url = zamaskujSciezke(event.request.url);
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((okruch) => (
          okruch.data?.url ? { ...okruch, data: { ...okruch.data, url: zamaskujSciezke(okruch.data.url) } } : okruch
        ));
      }
      return event;
    },
  });

  sentry = Sentry;
  return sentry;
}

/** Zgłoszenie błędu złapanego przez granicę błędów. Bez DSN nie robi nic. */
export function zglosBlad(blad, kontekst) {
  if (!DSN) return;
  initMonitoring().then((s) => s?.captureException(blad, kontekst ? { extra: kontekst } : undefined));
}
