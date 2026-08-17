---
name: deploy
description: Rytuał wydania WynajemPRO na produkcję. Używaj przy każdym wdrożeniu — aplikacji (hosting), reguł Firestore/Storage, Cloud Functions i indeksów. Zawiera pre-flight, właściwą komendę dla celu, pułapki (prompt cross-service, App Check 403) oraz weryfikację na żywo przez przeglądarkę, bo curl nie weryfikuje deployu aplikacji PWA.
user-invocable: true
argument-hint: "[app|rules|functions|indexes]"
---

# Deploy WynajemPRO

## Zasada nadrzędna

Deploy jest **trudno odwracalny**, więc obowiązuje [[Team-Playbook]] §7: zatrzymaj się
i uzyskaj potwierdzenie właściciela. Zgoda na jeden deploy nie jest zgodą na następny.
Nigdy nie wdrażaj „przy okazji" innego zadania.

Raportujesz „wdrożone" **wyłącznie po weryfikacji live** z kroku 4. Sam sukces komendy
`firebase deploy` nie jest dowodem, że użytkownik widzi nową wersję.

## Krok 1 — ustal cel i komendę

| Co wdrażasz | Komenda |
|---|---|
| Aplikacja (front, `dist/`) | `firebase deploy --only hosting:app` |
| Reguły bezpieczeństwa | `firebase deploy --only firestore:rules,storage` |
| Cloud Functions | `firebase deploy --only functions` |
| Indeksy Firestore | `firebase deploy --only firestore:indexes` |

⚠️ **Nie używaj `npm run deploy`.** W `package.json` to `vite build && firebase deploy`
**bez `--only`** — jednym ruchem wypycha hosting, reguły, functions i indeksy naraz.
Reguły i functions mają własne bramki (kroki niżej), więc taki deploy je omija.

⚠️ **Hosting jest multi-site** (od 2026-07-22). Cel `app` to site `wynajempro`
z domeną kanoniczną `wynajempro.com`. Stary site `moje-domki-6c77d` jest redirectorem 301
i nie wdraża się go przy zmianach aplikacji.

## Krok 2 — pre-flight

Zawsze:
1. `npm run lint` — konfiguracja ma `--max-warnings 0`, więc ostrzeżenie to błąd.
2. `npm run build` — build musi przejść, bo `hosting:app` publikuje `dist/`.
3. **Stan e2e.** Uruchom suitę i podaj wynik liczbowo (`7/7`, nie „przechodzą").
   Jeśli są czerwone, rozstrzygnij `git stash`, czy zależą od Twojej zmiany, czy są zastane.
   Zastane awarie wymień z nazwy w raporcie — nie chowaj ich pod „reszta bez zmian".

Dodatkowo dla reguł: cała procedura ze skilla `reguly` **przed** tym krokiem.
Dodatkowo dla functions: przegląd `code-reviewer`, bo functions mają dostęp administracyjny.

## Krok 3 — deploy

Po zgodzie właściciela. Przy `firestore:rules,storage` CLI zapyta o uprawnienia
**cross-service** (agent Storage musi dostać odczyt Firestore). **Potwierdź.**
Odmowa albo pominięcie promptu kładzie wszystkie uploady przewodników.

## Krok 4 — weryfikacja na żywo (obowiązkowa)

**`curl` nie weryfikuje deployu tej aplikacji.** Sprawdza serwer, a nie to, co widzi
użytkownik. Aplikacja jest PWA z `registerType: 'autoUpdate'` (`vite.config.js`), więc
przeglądarka z aktywnym service workerem serwuje **starą powłokę** jeszcze po deployu.
Tak powstał incydent z 2026-08-10: `curl` dostawał czysty `index.html`, a przeglądarka
czerwony ekran ze starego builda ([[Known-Issues]] #12).

Weryfikuj narzędziami przeglądarki (`preview_start` na `https://wynajempro.com`):

1. **Twarde przeładowanie** po wejściu — dopiero ono aktywuje nowy service worker.
2. **Trasy `200`**: `/`, `/kontakt`, `/pomoc`. Dla zmian w panelu także `/dashboard`.
3. **Konsola bez błędów** — w szczególności bez `Failed to fetch dynamically imported module`.
   Ten błąd oznacza, że stary SW prosi o nieistniejący hash chunku.
4. **Przekierowanie 301** ze starej domeny z zachowaniem ścieżki.
5. Dla zmian w treści: sprawdź, że nowy tekst faktycznie jest na stronie, a nie tylko w `dist/`.

Zmiany w regułach weryfikuje się inaczej — smoke testem uprawnień (krok 6 skilla `reguly`),
nie przeglądarką.

## Krok 5 — po deployu

1. **Wpis do dziennika** — skill `dziennik`. Podaj liczbę wdrożonych plików, hash commita
   i wynik weryfikacji live. Bez tego wpis nie ma wartości dowodowej.
2. **Status w [[Projects/Roadmap]]** — od razu, nie „potem".
3. Jeśli zmiana dotknęła UI opisanego w pomocy: `npm run help:build`, bo artykuły cytują
   etykiety 1:1 i starzeją się z każdym deployem.

## Znane pułapki

- **App Check jest EGZEKWOWANY** dla Cloud Firestore i Authentication (potwierdzone
  2026-08-13, 99% ruchu zweryfikowane). `403` widziany w narzędziach agenta to **poprawne
  odsiewanie klienta bez tokenu**, a nie awaria produkcji — [[Known-Issues]] #13 zostało
  z tego powodu sprostowane. ⚠️ Wcześniejsza wersja tego skilla twierdziła odwrotnie
  („egzekwowanie wyłączone, nie włączaj") i trzy dni pracy stały na tej fałszywej przesłance.
  Storage i Functions: patrz [[Projects/Instrukcje-wlasciciela]] sekcja 8 — Functions
  **świadomie** zostają niewymuszane (`stripeWebhook` i `exportIcal` obsługują cudze serwery,
  a funkcje callable wymuszają App Check własnym `enforceAppCheck: true`).
- **`permission-denied` na localhoście** to zwykle App Check blokujący nieatestowanego
  klienta, a nie rozjazd reguł. Produkcyjna domena przechodzi atestację reCAPTCHA.
- **Deklaracja „e2e N/N" starzeje się.** Jest prawdziwa wyłącznie w dniu przebiegu, więc
  zawsze ją datuj. Testy z datami wpisanymi na sztywno gniją bez żadnego sygnału.
