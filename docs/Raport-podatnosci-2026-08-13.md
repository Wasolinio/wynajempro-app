# Podatności w zależnościach — triage 2026-08-13

> **Po co ten dokument:** `npm audit` pokazuje **24 podatności** w całym drzewie zależności,
> w tym 2 „krytyczne". Sam licznik jest bezużyteczny do decyzji — liczy ostrzeżenia
> w grafie paczek, a nie ścieżki, którymi ktoś mógłby faktycznie zaszkodzić tej aplikacji.
> Poniżej rozbicie na trzy światy: **co uruchamia przeglądarka klienta**, **co serwer**,
> a **co tylko mój komputer i CI**. Bo tylko pierwsze dwa mają cokolwiek wspólnego z ryzykiem
> dla Twoich klientów.

---

## Wynik w jednym akapicie

Z 24 pozycji **dokładnie jedna** dotyczyła kodu, który uruchamia przeglądarka Twojego
klienta — i **została naprawiona dzisiaj**. Dwanaście dotyczy Cloud Functions (serwera)
i wymaga zaplanowanej aktualizacji z przeglądem, bo idą przez główną bibliotekę Google.
Reszta to narzędzia budowania i konsola Firebase — działają na moim komputerze i w CI,
nie na produkcji, i schodzą przy zwykłych aktualizacjach.

---

## 1. Przeglądarka klienta — ✅ naprawione dzisiaj

| Paczka | Waga | Co to było | Stan |
|---|---|---|---|
| `react-router` / `react-router-dom` | wysoka + niska | Otwarte przekierowanie przez odwrotny ukośnik w `<Link>` i `useNavigate` (CVE), plus ostrzeżenie o CSRF przy żądaniach PUT/PATCH/DELETE | ✅ **7.15.0 → 7.18.2**, testy e2e **133/133** |

**Dlaczego akurat ta jedna:** sprawdziłem, które z podatnych paczek naprawdę trafiają
do plików serwowanych przeglądarce (`dist/assets/*.js`). `react-router` jest w paczce
`vendor`. Pozostałych — `websocket-driver`, `nanoid`, `postcss`, `protobufjs`, `grpc` —
w wysyłanym kodzie **nie ma**: siedzą w narzędziach albo po stronie serwera.

**Realne ryzyko przed naprawą było niskie**, ale niezerowe: otwarte przekierowanie wymaga,
by adres z zewnątrz trafił do nawigacji. Aplikacja przepuszcza zewnętrzne adresy przez
`safeHref` (audyt N5), a trasy wewnętrzne są statyczne. Podbicie wersji było i tak tanie —
zmiana w obrębie 7.x, bez łamania API, potwierdzona pełną suitą.

---

## 2. Cloud Functions (serwer) — ⏸ do zaplanowania

**12 pozycji, w tym 1 krytyczna i 1 wysoka.** Wszystkie **tranzytywne** — przychodzą przez
`firebase-admin` 13.10, czyli bibliotekę Google, na którą stoją funkcje.

| Paczka | Waga | Charakter |
|---|---|---|
| `websocket-driver` | **krytyczna** | Obejście limitu zasobów przy kompresji wiadomości (odmowa usługi) |
| `form-data` | wysoka | Słaba losowość granicy wieloczęściowego żądania |
| `protobufjs`, `google-gax`, `gaxios`, `uuid`, `@google-cloud/*` i inne | średnie | Głównie odmowa usługi i problemy z obsługą wejścia |

**Dlaczego nie naprawiam tego dziś:** wyjściem jest `firebase-admin` **14.x**, czyli zmiana
głównej wersji — z definicji może łamać zachowanie. Funkcje robią rzeczy nieodwracalne
(kasowanie kont po karencji, usuwanie danych, obsługa Stripe). Podbicie takiej biblioteki
o 22:00 bez przeglądu i bez smoke testu byłoby dokładnie tym rodzajem ruchu, przed którym
sami się w tym projekcie zabezpieczamy.

**Rekomendacja:** osobne zadanie — podbicie `firebase-admin`, przegląd `code-reviewer`,
deploy `--only functions` i kontrola logów nocnego purge następnego dnia. Ryzyko dziś
jest **umiarkowane**: to w większości scenariusze odmowy usługi, a funkcje są za App Check
i za regułami, nie wystawione publicznie jako otwarte API.

---

## 3. Narzędzia (mój komputer i CI) — 🟢 niskie

`vite`, `postcss`, `nanoid`, `@babel/core`, `firebase-tools`, `tar`, `hono`, `js-yaml`,
`brace-expansion`, `ip-address`, `re2`, `undici`, `body-parser`.

Ten kod **nigdy nie dociera do klienta** — działa przy budowaniu, testach i komendach
konsoli. Dwie uwagi warte odnotowania:

- Ostrzeżenie o `vite` (obejście `server.fs.deny`) dotyczy **Windowsa**; pracujemy na macOS.
- `postcss` i `@babel/core` to odczyt plików przez komentarz `sourceMappingURL` — wymaga,
  żeby ktoś podłożył złośliwy plik do zbudowania. To ryzyko łańcucha dostaw, nie produkcji.

Schodzą przy zwykłej aktualizacji narzędzi; nie ma powodu robić tego osobno.

---

## Co warto włączyć, żeby to się nie odkładało

**Dependabot** (darmowy, wbudowany w GitHub): raz w tygodniu otwiera pull requesty
z podbiciem zależności. Do dziś nie było sensu tego włączać — nie było CI, więc nikt by
nie sprawdził, czy taki PR niczego nie psuje. **Od dzisiaj CI jest**, więc każdy taki PR
sam się weryfikuje (lint, build, 133 testy) i wystarczy go zatwierdzić albo zamknąć.

To jedna decyzja: włączyć czy nie. Jeśli tak — dopiszę plik konfiguracyjny.

---

## Uczciwe zastrzeżenie

`npm audit` odpowiada na pytanie „czy w grafie zależności jest paczka z ogłoszoną
podatnością", a nie „czy da się przez to zaszkodzić tej aplikacji". Sprawdziłem, które
paczki realnie trafiają do przeglądarki, i rozdzieliłem światy — ale **nie przeprowadzałem
testów penetracyjnych** i żaden z tych wpisów nie był weryfikowany próbą wykorzystania.
To pozostaje otwartą pozycją z `Bezpieczenstwo-kont-i-danych.md` §9 („testy penetracyjne —
nie wykonano").
