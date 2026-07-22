# WynajemPRO - Kontekst roboczy

## Projekt
**WynajemPRO** - aplikacja do zarządzania wynajmem (React + Firebase)

## Aktualny focus
- Dopieszczanie końcowej wersji (identyfikacja WynajemPRO v2)
- Porządek w kodzie zrobiony: jedna wersja produkcyjna, stare wersje w `/_legacy`

## Struktura
Mapa żywego kodu: **`src/README.md`**. Kod archiwalny (stare wersje/prototypy): **`/_legacy`** (poza buildem).
Materiały projektowe/brand: **`/_design-reference`**.

## Agent Navigation
⚠️ **CRITICAL:** Przed zmianą logiki biznesowej czytaj `docs/Agent-Process-Map.md`.
UWAGA: produkcyjny panel przeniesiony do `src/pages/dashboard/` (logika 1:1 jak opisana w mapie);
stary `src/ManagerApp.jsx` i `src/pages/LoginPanel.jsx` są teraz w `/_legacy`.

## Zespół agentów
Wyspecjalizowani agenci w `.claude/agents/`: `dev`, `code-reviewer`, `designer`, `seo`,
`marketing`, `support`, `legal`, `strategist`. Zadania z tych obszarów deleguj do właściwego agenta.
Wspólna metodologia (obowiązuje wszystkich, także głównego Claude'a): `docs/Team-Playbook.md`.

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
- [ ] Dopieszczanie UI końcowej wersji
- [ ] Przed launchem (blokery — szczegóły w roadmapie): weryfikacja e-mail, sprawdzanie subskrypcji, walidacja schematu (reguły + front)
