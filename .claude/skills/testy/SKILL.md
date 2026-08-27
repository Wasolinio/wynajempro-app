---
name: testy
description: Uruchamianie i interpretacja testów WynajemPRO — e2e na atrapach (Playwright), smoke na żywej produkcji, testy jednostkowe functions i podatków. Używaj przy każdym przebiegu testów, pisaniu nowych testów oraz diagnozowaniu czerwonego lub flaky CI. Zawiera pułapki środowiska: brak Javy, atrapa Firebase zależna od dev servera, powtórki maskujące flaki w CI.
user-invocable: true
argument-hint: "[e2e|prod|functions|podatki|ci]"
---

# Testy WynajemPRO

## Cztery suity — która przeciw czemu

| Suita | Komenda | Co sprawdza | Czego NIE sprawdza |
|---|---|---|---|
| **e2e** (`e2e/`, 25 plików spec) | `npm run test:e2e` | KOD aplikacji na atrapach Firebase; pełny frontend bez sieci | stanu produkcji, prawdziwego backendu |
| **prod smoke** (`e2e-prod/smoke.spec.js`) | `npm run test:prod` | ŻYWĄ produkcję (`wynajempro.com`), bez atrap i dev servera | logiki — to test „czy produkt żyje" |
| **functions** (`functions/*.test.cjs`) | `cd functions && npm test` | logikę Cloud Functions (`node --test`) | reguł bezpieczeństwa (od tego skill `reguly`) |
| **podatki** (`src/utils/*.test.mjs`) | `npm run test:podatki` | czyste funkcje taxSummary/taxExport | UI panelu podatkowego |

Warianty e2e: `test:e2e:ui` (inspektor), `test:e2e:debug`, `test:e2e:local` (bez `--workers=2`).

**Obie suity Playwrighta są potrzebne, nie jedna.** Lekcja z 2026-08-13 ([[Known-Issues]] #16):
e2e świeciło 133/133 na zielono, a połowa produktu (strony gościa) była martwa na produkcji —
bo e2e testuje kod na atrapach, nie stan świata. Stąd powstał `test:prod`.

## Jak naprawdę działa suita e2e

- **Atrapa zamiast Firebase:** `e2e/firebase-mock.js` (`setupFirebaseMocks`) przechwytuje
  adresy `**/node_modules/.vite/deps/firebase_*.js` i podstawia własne moduły. Te adresy
  istnieją **wyłącznie pod dev serverem Vite** — dlatego `webServer` w
  `playwright.config.js` uruchamia `npm run dev`, ⚠️ **nie wolno przełączyć go na
  produkcyjny build** ([[Known-Issues]] #18; próba z 2026-08-25 od razu posypała
  `admin-panel`, bo w buildzie moduły mają hasze i żadna trasa atrapy nie łapie).
- **Klucze Firebase w konfiguracji są celowo FAŁSZYWE.** Testy bez `setupFirebaseMocks`
  potrzebują tylko tego, żeby inicjalizacja SDK nie rzuciła wyjątkiem; `VITE_USE_EMULATORS=true`
  kieruje SDK na localhost, więc nic nie dotknie prawdziwego projektu. Prawdziwe wartości
  żyją tylko w `.env.local` na maszynie właściciela — CI ich nie ma i mieć nie musi.
- Suita **nie startuje żadnego emulatora** — wszystko robią atrapy w przeglądarce.

## Środowisko: brak Javy

Na tej maszynie nie ma Javy, więc emulatory Firestore/Storage z `firebase.json` **nie
wstaną** — i nie są potrzebne:

- reguły bezpieczeństwa testuje **lustrzany tester** w `functions/*.cjs` — procedura
  w skillu `reguly`;
- ręczne testowanie flow auth: emulator **Auth działa bez Javy** (port 9099), kody
  weryfikacyjne (`oobCode`) odczytuje się przez REST emulatora.

## CI: zielony status ≠ zdrowa suita

`playwright.config.js` w CI ustawia `retries: 2` i `workers: 1`. Konsekwencja
([[Known-Issues]] #20): **test flaky, który przejdzie przy powtórce, NIE wywraca joba** —
przebieg raportuje `success`. Dlatego:

1. Po przebiegu CI czytaj listę **„flaky"** w raporcie, nie sam status.
2. „Nie odtwarza się lokalnie" to za mało, żeby zamknąć sprawę — macOS ma nakładkowe
   paski przewijania (0 px), Linux klasyczne (zajmują szerokość); to realna klasa różnic
   środowiska, nie kaprys runnera (#18, #20).
3. Powtórki kosztują: przebieg z flakiem 2026-08-25 trwał **14,1 min zamiast 4,3**.

## Pisanie testów — zasady tego projektu

- **`expect.poll` zamiast `waitForTimeout`.** Sztywne czekanie na zegar pada na wolnym
  runnerze i uczy ignorowania czerwonego CI. Wzorzec:
  `await expect.poll(() => warunek, { timeout: 10000 })`. W [[Projects/Backlog]] wisi
  14 sztywnych czekań do wymiany (spis per plik, 2026-08-25) — naprawiając test w tych
  plikach, wymień je przy okazji.
- **Kotwicz asercje w źródle prawdy treści.** Gdy treść stron generuje się z markdownu
  (legal, pomoc), asercja ma celować we frazę ze źródła — lekcja z 2026-08-26: dwa testy
  `spelling.spec` celowały w zdania starych, ręcznie pisanych stron i wymagały
  przekotwiczenia po migracji na generator.
- **Przy migracji treści na generator spisz najpierw elementy INTERAKTYWNE starej
  strony** — treść zweryfikuje bezpiecznik generatora, zniknięcia przycisku nie zobaczy
  nikt poza testami (2026-08-26: e2e złapało wycięty przycisk wycofania zgody cookies).
- **Deklaracje datuj** ([[Team-Playbook]] §6): „e2e 204/204" jest prawdziwe wyłącznie
  w dniu przebiegu. W raportach liczby i czasy, nie „testy przechodzą".

## Przed deployem

Pre-flight (lint, build, które suity) i bramki per cel — skill `deploy`. Zmiana reguł →
skill `reguly`. Wynik przebiegu, który zmienił stan wiedzy (nowy flake, regresja,
naprawa) → wpis w [[Activity-Log]] (skill `dziennik`).
