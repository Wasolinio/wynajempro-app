# WynajemPRO - Kontekst roboczy

## Projekt
**WynajemPRO** - aplikacja do zarządzania wynajmem (React + Firebase)

## Aktualny focus
- **Beta testerów = ścieżka krytyczna** (launch: decyzja właściciela po becie);
  ścieżka A (Stripe/pieniądze) ⏸ wstrzymana — wznawia wyłącznie właściciel (2026-08-25)
- Dopieszczanie końcowej wersji (identyfikacja WynajemPRO v2)
- Porządek w kodzie zrobiony: jedna wersja produkcyjna, stare wersje w `/_legacy`.
  Vault Obsidiana = `docs/` (porządek 2026-08-27; start: `docs/Home.md`)

## Struktura
Mapa żywego kodu: **`src/README.md`**. Kod archiwalny (stare wersje/prototypy): **`/_legacy`** (poza buildem).
Materiały projektowe/brand: **`/_design-reference`**.

## Agent Navigation
⚠️ **CRITICAL:** Przed zmianą logiki biznesowej czytaj `docs/Agent-Process-Map.md`.
UWAGA: produkcyjny panel przeniesiony do `src/pages/dashboard/` (logika 1:1 jak opisana w mapie);
stary `src/ManagerApp.jsx` i `src/pages/LoginPanel.jsx` są teraz w `/_legacy`.

## Dokumenty dla właściciela — ZAWSZE dwie postacie
Każdy dokument pisany **do czytania przez właściciela** (instrukcja, raport, analiza,
podsumowanie) oddaje się w `.md` **i** w `.docx`: `npm run docs:docx` (stały zestaw) albo
`node scripts/build-docx.mjs <ścieżka.md>` (pojedynczy plik) → `docs/docx/`.
Markdown jest źródłem prawdy — poprawki nanosi się w nim i regeneruje kopię; `.docx` to
artefakt (w `.gitignore`). Dokument cykliczny dopisz do listy `DOKUMENTY` w skrypcie
i **regeneruj przy każdej aktualizacji**, żeby kopia się nie rozjechała.
Pełna zasada: `docs/Team-Playbook.md` → „Dokumenty dla właściciela".

## Zadania dla właściciela — instrukcja ZAWSZE w czacie
Kiedy coś musi zrobić właściciel (kliknąć w konsoli, wysłać maila, potwierdzić u kogoś),
**pełną treść i kroki wklej wprost w odpowiedzi w czacie** — gotowe do skopiowania, po kolei,
bez odsyłania do pliku. Właściciel nie ma szukać po folderach ani otwierać dokumentów, żeby
dowiedzieć się, co ma zrobić.
Plik w `docs/` nadal powstaje — jest archiwum i źródłem prawdy — ale jest **kopią zapasową
instrukcji, nie jej miejscem**. Kolejność: najpierw czat, potem plik.
Zasada z 2026-08-25, prośba właściciela: „zadania dla mnie rozwiązujemy tak, że piszesz mi
instrukcję tutaj i działamy razem".

## Zespół agentów
Wyspecjalizowani agenci w `.claude/agents/`: `dev`, `code-reviewer`, `designer`, `seo`,
`marketing`, `support`, `feedback`, `legal`, `strategist`. Zadania z tych obszarów deleguj do właściwego agenta.
`support` bierze pojedyncze zgłoszenie, `feedback` — syntezę wielu naraz (bety, wzorce, priorytety).
Wspólna metodologia (obowiązuje wszystkich, także głównego Claude'a): `docs/Team-Playbook.md`.

## Skille projektu
Procedury WynajemPRO spisane jako skille w `.claude/skills/` — ładują się same, gdy zadanie
do nich pasuje, albo wywołasz je jako `/nazwa`:
- **`deploy`** — rytuał wydania: pre-flight, komenda per cel, weryfikacja live **przez
  przeglądarkę** (curl nie weryfikuje deployu PWA — lekcja z 2026-08-10).
- **`dziennik`** — wpis do `docs/Activity-Log.md` w konwencji projektu + synchronizacja
  Roadmapy i Known-Issues.
- **`reguly`** — zmiana `firestore.rules`/`storage.rules` bez emulatora (lustrzany tester
  w `functions/*.cjs`, bramka deployu, pułapki App Check).
- **`zgloszenie`** — obsługa zgłoszenia: odsiew testów po `source`, stopniowany dostęp do danych.
- **`testy`** — cztery suity (e2e na atrapach / prod smoke / functions / podatki), pułapki
  CI (flaki maskowane powtórkami), brak Javy, wzorzec `expect.poll`.
- **`dokument`** — dokument dla właściciela w `.md` + `.docx`: generator, zestaw
  DOKUMENTY, kontrola rozjazdu kopii.
- **`porzadek`** — okresowy rytuał porządków w vaulcie i repo: śmieci w gicie, martwe
  wikilinki, świeżość indeksów, sieroty, duplikaty skilli.

Osobno, globalnie: **`humanizer`** (`~/.claude/skills/`) do tekstów dla klientów —
landing, maile, wpisy, odpowiedzi supportu. Kalibracja polska w jego `PL.md`.

## Obsługa zgłoszeń (support)
Zgłoszenia z `/kontakt` lądują w Firestore (`contact_messages`), a reguły zabraniają odczytu
klientom — czyta się je ścieżką administracyjną. Odczyt przez **Firebase MCP** (`.mcp.json`,
5 narzędzi wyłącznie do odczytu; `--tools` usuwa kasowanie i deploy u źródła).
Proces: **`docs/support/Proces-obslugi-zgloszen.md`**.
**Tryb pracy — ⛔ ZAWIESZONY dla danych osobowych (2026-08-26):** właściciel potwierdził plan konsumencki Max (bez DPA), więc do czasu oferty komercyjnej agent NIE czyta `contact_messages` ani danych kont; właściciel czyta zgłoszenia w `/admin` i streszcza problem bez danych identyfikujących, agent diagnozuje na kodzie. Wpis o Anthropic wykreślony z Polityki §5. Po DPA wracają poziomy 1–2 (poziom 3 zniesiony na stałe — F4a). O nowych zgłoszeniach właściciela powiadamia lokalny strażnik `scripts/check-messages.mjs` (LaunchAgent co 3 h, maska pól bez danych osobowych). `hostProfile` ma `taxIdentifier` (może być PESEL) —
czytać wyłącznie przy zgłoszeniach o profil/faktury. Kanał jest **tylko do odczytu**:
agent diagnozuje i proponuje, nie naprawia danych na produkcji.

## Kluczowe pliki (produkcja)
- `src/App.jsx` — routing (tylko trasy produkcyjne)
- `src/pages/dashboard/ManagerApp.jsx` — panel zarządzania (powłoka)
- `src/pages/dashboard/views/` + `modals/` — widoki i modale panelu
- `src/pages/landing/` — landing (`LandingPage.jsx`) + logowanie (`LoginPanel.jsx`)
- `src/context/WynajemContext.jsx` + `src/hooks/useFirebaseData.js` — stan i synchronizacja z Firebase
- `firestore.rules` / `storage.rules` (upload 10 MB) / `functions/index.js`

## Ostatni status
Wersja produkcyjna V2 wdrożona i wypchnięta na GitHub. Branch: main.
Hosting multi-site (od 2026-07-22): aplikacja na site **`wynajempro`** (domena kanoniczna
`wynajempro.com`), stary site `moje-domki-6c77d` = redirector 301.
**Deploy aplikacji: `firebase deploy --only hosting:app`.**

## Zadania w trakcie
Plan pracy: **`docs/Projects/Roadmap.md`** — jedyne źródło prawdy planowania (Now/Next/Later).
- [ ] Beta testerów (ścieżka krytyczna) + dopieszczanie UI końcowej wersji
- [x] ✅ **Wszystkie blokery launchu ZAMKNIĘTE** (stan 2026-08-26): blokery techniczne
  N1–N3 wydane 2026-07-09/10 · prawnik bez zastrzeżeń 2026-08-25 (N4) · **dokumenty
  opublikowane 2026-08-26** (commit `328cd71`, weryfikacja live, bramka 47→0).
  Regulamin, Polityka i `/dpa` renderują treść z `docs/legal/` — **zmiany treści TYLKO
  przez markdown + `npm run legal:build` + deploy**. Historia:
  `docs/legal/Bramka-publikacji-2026-08-26.md` + `Analiza-prawna-2026-08-26.md` (ADR-025).
  Plan Anthropic = Max (konsumencki, bez DPA) → zasady kanału supportu: sekcja
  „Obsługa zgłoszeń" wyżej.
