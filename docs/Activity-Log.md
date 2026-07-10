# 📝 Activity Log

Project timeline and key milestones.

---

## 2026-07-07

### N2 — egzekwowanie subskrypcji w regułach (+ ogon N1)
- ✅ `firestore.rules`: realny `hasActiveSubscription` (claim `stripeStatus` → fallback dokumentowy z żywym trialem) + przywrócony `email_verified` w `isOwnerAndVerified`; wszystko fail-closed przez `.get()`
- ✅ `storage.rules`: bramka zapisu `guides/` (verified + subskrypcja przez cross-service + warunkowy owner-check) — TODO z linii 10 domknięty
- ✅ Przegląd `code-reviewer`: diff bezpieczny; naprawione odkryte bugi frontu (self-heal `status:'trialing'`, alias `status||accountStatus`) — bez nich deploy odmaskowałby blokadę starych kont i paywall dla płacących
- ✅ `functions/audit-users-n2.cjs` — audyt danych przed deployem (dla właściciela)
- ✅ Runda 2 przeglądu: storage.rules i poprawki potwierdzone; wzmocnienie id przewodników/stron opinii na `crypto.randomUUID()` (Date.now() był enumerowalny — okno uploadu przed zapisem); dług „osierocone pliki Storage" → Backlog
- ✅ Weryfikacja: lint+build 0, e2e 20/20 + 12/12 po wzmocnieniu UUID
- ✅ Diff reguł konsola↔repo wykonany (właściciel wkleił): **identyczne** — zero driftu; zagadka permission-denied z X13 = App Check (localhost bez atestacji), nie reguły
- ✅ **Audyt danych wykonany** (5 kont produkcyjnych): konto właściciela `wasyl515@gmail.com` = `status:'active'` → **dostęp bezterminowy** (string trialEndsAt 2028 nieszkodliwy, reguła nie czyta go przy active). 4 konta testowe/rodzinne stracą zapis: 2× wygasły trial (test@test.pl 2023, piotrwasyl4 2026-05 — blokada i tak poprawna), 2× brak pola `status` (szymonwasiak1, kamilwasyl1402). **Żadne legalne konto nie jest błędnie blokowane** (oba trialing-string są wygasłe, nie przyszłe).
- 🔧 Poprawiony `audit-users-n2.cjs` — pierwotna logika flagowała tylko „trialing bez Timestampa", przeoczyła konta bez `status`; teraz liczy faktyczny wynik reguły (active OR żywy trial-Timestamp) i wykrywa wszystkie 4.
- ✅ Diff `storage.rules` konsola↔repo: **identyczne** — oba pliki reguł bez driftu, deploy podmienia znany stan (rollback = deploy wersji z gita)
- ✅ **Decyzja właściciela + wykonanie (2026-07-09)**: 4 konta testowe usunięte w całości (Auth + Firestore z podkolekcjami; skrypt z bezpiecznikiem na konto właściciela; weryfikacja: została 1 para users/Auth = wasyl515, status active)
- ✅ **DEPLOY reguł wykonany** (`firebase deploy --only firestore:rules,storage`): obie pary skompilowane i released; 2 nieszkodliwe warningi (unused `data` w zaślepkach isValidRental/isValidGuide — znikną przy N3)
- ⚠️ **Incydent wdrożeniowy wykryty i obsłużony**: deploy w terminalu nieinteraktywnym POMIJA prompt CLI o cross-service IAM — weryfikacja polityki (REST getIamPolicy) wykazała BRAK roli `firebaserules.firestoreServiceAgent` dla agenta Storage → uploady przewodników chwilowo martwe (impact ~0: po usunięciu kont testowych jedyny gospodarz to właściciel). Programowe nadanie roli: 403 (Editor nie może setIamPolicy) → naprawa po stronie właściciela: `firebase deploy --only storage` w TTY z odpowiedzią `y` na prompt (albo IAM w konsoli GCP)
- ⏸ Po nadaniu roli: smoke test właściciela (konto active: dane + upload okładki przewodnika)

---

## 2026-07-06

### X6 — ustawienia konta pod imieniem gospodarza (rdzeń)
- ✅ Split SettingsModal (decyzja właściciela): nowy **AccountModal** — profil gospodarza + subskrypcja + usunięcie konta — otwierany kliknięciem w imię w sidebarze i z pozycji „Konto" w mobilnym arkuszu „Więcej"; zębatka zostaje jako „Ustawienia aplikacji" (6 zakładek)
- ✅ Bezpieczny zapis: konto zapisuje WYŁĄCZNIE `settings/hostProfile` — uniknięta pułapka `saveSettings` (zapis wszystkich nieseedowanych stanów `editing*` nadpisałby np. listę obiektów pustką)
- ✅ Blok tożsamości jako button (hover, focus-visible), logika usuwania konta przeniesiona 1:1
- ✅ Weryfikacja: lint+build 0; e2e 12/12 (nowy test X6: otwarcie z imienia, seed profilu, zakładka subskrypcji, Escape)
- ⬜ Zostaje w X6: zdjęcie profilowe (upload do Storage)

### Mobile header + count-up liczb w całym panelu (zgłoszenie właściciela, skill impeccable)
- ✅ Nagłówek panelu <640px: data ukryta (zawijała się na 3 linie), tytuł z pierwszeństwem miejsca i elipsą, search elastyczny (min. lupa 44px), „+ Rezerwacja" jako sam plus 40px — nic nie wystaje poza ekran (dowód: zrzuty Playwright 375px, krótki i najdłuższy tytuł)
- ✅ Animacja liczb z Analityki wyciągnięta do `src/pages/dashboard/useCountUp.js` (progress 0→1, 700ms ease-out cubic, wszystkie liczby finiszują razem, reduced-motion → natychmiast) i wdrożona: Pulpit (4 karty + pasek obłożenia), Finanse (4 KPI), Obiekty (rezerwacje/śr. cena/obłożenie), Kalendarz (rezerwacje/wolne doby); Analityka zrefaktorowana na wspólny hook
- ✅ PRODUCT.md utworzony (wymóg skilla impeccable; rejestr product, zasady v2)
- ✅ Weryfikacja: lint+build 0; e2e 29/29; zrzuty mobilne przed/po w scratchpadzie
- ℹ️ Świadomie pominięte: ceny w wierszach tabel (animacja przy paginacji/filtrach = szum, wzorzec Analityki dotyczy agregatów); `metrics.avg` w Kalendarzu (sformatowany string)
- ✅ Naniesione findingi przeglądu tonu: `Dziękujemy za pobyt` bez wykrzyknika (tytuł + fallback), bezosobowy DEFAULT_MESSAGE („Jeśli znajdzie się chwila…"), toast przy błędzie pobierania listy, toasty błędów ze wskazaniem akcji („…Spróbuj ponownie."), mikro-copy `To zajmie około minuty.` jako `wpb-meta`, kredyt ujednolicony z przewodnikiem („Stworzono za pomocą WynajemPRO", bez linku)
- ✅ Weryfikacja: lint+build 0; e2e 28/28 (review-pages 5 + panel-v2 4 + auth 13 + smoke 2 + spelling 4)
- ✅ Punkt Booking.com rozstrzygnięty przez właściciela: hint z zastrzeżeniem „Booking prosi o opinię własnym mailem" (finding nr 6 designera)
- ✅ Całość X13 zacommitowana: `f1c47ec`

---

## 2026-07-04

### Dopieszczanie UI — partia 3 (widoki)
- ✅ Kalendarz: naprawiona kolizja pasków rezerwacji back-to-back (gantt hotelowy — pasek kończy się przed dniem wyjazdu), czytelny tekst na paskach amber (`--ink`), legenda uzupełniona o kanał Nocowanie
- ✅ GuideBuilder: 6× `window.confirm`/`alert` zastąpione brandowym DeleteConfirmModal (sparametryzowany) i toastami v2
- ✅ Responsywność: generator umów i formularz przewodnika zwijają się do 1 kolumny <980px
- ✅ Newsletter (landing): stan błędu odróżniony kolorem (#E8836B, 6.9:1 na ciemnym tle) + `role=status` dla czytników
- Weryfikacja: lint+build, e2e panel-v2+smoke+spelling 9/9 → [[Design-Notes]] (statusy partii)

### X12 — dolny pasek nawigacji mobile (partia 4)
- ✅ Pasek <980px w tokenach `--side`: Pulpit · Kalendarz · Rezerwacje · Finanse + „Więcej" (podział zatwierdzony przez właściciela)
- ✅ Arkusz „Więcej": Obiekty, Analityka, Przewodniki, Generator umów + wylogowanie + status synchronizacji; Escape/fokus/aria przez `useDialogA11y`
- ✅ Zwinięte `.wpd-cells`/`.wpd-fgrid` <980px; treść z paddingiem pod pasek (safe-area); widget zadań podniesiony nad pasek
- ✅ Weryfikacja: lint+build, e2e panel-v2 (z nowym testem mobile 375px) + smoke 6/6

### Decyzje właściciela + kierunek prac (2026-07-04)
- ✅ **Cennik na launch rozstrzygnięty**: 29,99 zł/mc + founding members (rabat roczny dla bety); pakiety wg liczby obiektów odłożone. Zamyka otwartą decyzję nr 2 w [[Projects/Roadmap]].
- ✅ **Kierunek po N1**: najpierw tor prawny **N4** — `legal` przygotowuje projekty regulaminu, polityki prywatności i DPA (najdłuższy lead time u prawnika). Kod (N2 paywall) po torze prawnym.
- 💡 **Nowy pomysł właściciela → X13 „przewodnik opinii"**: strona podziękowania po pobycie z łączami do portali opinii (Google/Booking/Airbnb), na wzór przewodnika gościa. Decyzje: roadmapa NEXT (X13), MVP = strona per obiekt z ręcznym linkiem (bez danych osobowych, bez auto-wysyłki). Rozszerzenia odłożone w [[Projects/Backlog]].

### N1 — przywrócenie weryfikacji e-mail (bloker launchu, rozpoczęte Fable → dokończone Opus)
- ✅ Usunięty bypass z `b4aeb4e` w 3 miejscach: `App.jsx` (ProtectedRoute), `WynajemContext.jsx`, `LoginPanel.jsx`; wszystkie 3 TODO wycięte. Niezweryfikowane konto hasłowe nie wchodzi do panelu; Google pomija wymóg.
- ✅ Dowód pre-existing vs regresja: `auth.spec` padał 12/12 także BEZ zmian N1 (test na stashu) — porażki nie były regresją, tylko zastaną wadą mocka + stale selektorami.
- ✅ Naprawiony `e2e/firebase-mock.js`: dodane brakujące eksporty `firebase/auth` (`setPersistence`, `browserLocalPersistence`, `browserSessionPersistence`, `sendPasswordResetEmail`) — bez nich import ESM w LoginPanel padał i `/login` renderował pustą stronę (stąd 12 timeoutów).
- ✅ Zaktualizowane stale selektory pod v2: przełącznik trybu (`Rozpocznij 14-dniowy test` → zakładka `Rejestracja`), toggle hasła (ikona lucide → tekst `Pokaż`/`Ukryj`), akceptacja regulaminu (nowy wymóg v2 — klik `.wp4a-check__box` przed submitem rejestracji).
- ✅ **`auth.spec` 13/13** (było 0/12); pełna suita zaufana: auth 13 + panel-v2 4 + smoke 2 + spelling 4 = zielone. lint+build 0.
- ⏸ **Zostaje ręczny test właściciela** (real e-mail / emulator Auth) — bypass powstał przez App Check/403, runtime nie do sprawdzenia w środowisku agenta.

### X13 — „przewodnik opinii" zbudowany (MVP)
- ✅ Edytor w panelu (nawigacja 09 „Opinie"): szablon podziękowania + łącza do portali (presety Google/Booking/Airbnb/TripAdvisor/Facebook), kopiowanie publicznego linku, QR do wydruku w obiekcie
- ✅ Publiczna strona `/opinie/{id}` w identyfikacji v2 (.wpb, mobile-first) — podziękowanie przed prośbą, bez danych osobowych gościa
- ✅ Architektura: reużycie kolekcji `guides` z `type:'review'` → zero zmian w firestore.rules; GuideBuilder filtruje typy (przewodniki i strony opinii się nie mieszają)
- ✅ Publiczny odczyt przez anonimową sesję — dokładnie wzorzec GuestGuideView sprawdzony u gości na produkcji (odkrycie: reguły wdrożone mogą różnić się od repo → notatka przy N3)
- ✅ Weryfikacja: lint+build 0, e2e `review-pages.spec.js` 5/5 + regresja panel-v2/smoke 6/6; przegląd tonu `designer` w toku

### N4 — projekty dokumentów prawnych (agent `legal`)
- ✅ Cztery projekty w `docs/legal/`: `Regulamin.md`, `Polityka-prywatnosci.md`, `DPA-powierzenie.md`, `Checklista-zgodnosci.md` — oparte na kodzie (dwuwarstwowość danych, podpisy gości, sekrety, publiczny hostProfile) i źródłach oficjalnych (ISAP/UOKiK/UODO, linki w checkliście). Placeholdery zamiast zmyślonych danych firmy.
- ⚠️ **Kluczowe odkrycie (potwierdzone w kodzie):** `firestore.rules` ma zaślepione N1/N2/N3 — `isOwnerAndVerified` bez `email_verified` (`:9-13`), `hasActiveSubscription`→`true` (`:29-32`), `isValidRental/Guide`→`true` (`:38-62`). Nasze N1 działa na froncie, ale reguły backendu nie egzekwują ani weryfikacji, ani subskrypcji, ani schematu. Ujęte w roadmapie przy N1/N2/N3.
- 🔴 **Bramka legal**: dokumentów nie wolno publikować, dopóki N1–N3 nie wdrożone (rozliczalność RODO). Czeka: decyzje właściciela (dane firmy, VAT, founding members) + prawnik‑człowiek + wdrożenie `dev`.

---

## 2026-07-03

### Dopieszczanie UI — audyt i partia 1 (+ plan wdrożenia)
- ✅ `7e64c5a` + `9b4f363` — zielony `npm run lint`: scripts/archive + .agents/.claude w ignores ESLint, usunięty martwy `.eslintignore`
- ✅ `f2a6c17` — dopieszczenie v2: loader/toasty w tokenach, error boundary na `.wpb`, zero cieni (cookie bar, widget), press-scale, animacje modali i widoków
- ✅ Audyt UI (`designer`): 15 pozycji w 5 obszarach → [[Design-Notes]]; realizacja partiami 1–4
- ✅ `c89a3ce` — spelling.spec dogoniony do treści po `fb8a00e` (2 testy padały od reorganizacji, nie przez regresję)
- ✅ `0a7d12b` — **partia 1 audytu**: :focus-visible we wszystkich przestrzeniach, tokeny mikro-etykiet w WCAG AA (`--faint #716951`, `--label #746C54`, `--amber-ink #7E6119`), klasy widmowe, `.wpd-rotate`, spójne kolory kanałów (channelTone), `plural()` w utils, press-scale na landing/login, martwy App.css usunięty
- ✅ Plan wdrożenia na rynek → [[strategy/Plan-wdrożenia-na-rynek]] (strategist przerwany limitem — dokończony przez koordynatora)
- ✅ Partia 2 audytu (dostępność interakcji): hit-area ≥40px, klawiatura dla klikalnych kart/wierszy (`utils/a11y.js`), modale z Escape + fokus + `role=dialog` (`useDialogA11y`)
- ⚠️ Odkrycie: suita e2e w dużej mierze celuje w aplikację sprzed v2 (ui-scaling: Tailwind, teksty starego landinga) — pełny bieg to 33 passed / ~24 failed, wcześniejsze odczyty „33/33" błędne; plan naprawy: roadmapa X10, zalążek nowej suity `e2e/panel-v2.spec.js`
- 📋 Decyzje właściciela: partie 1–3 zatwierdzone · nawigacja mobilna = **dolny pasek** (roadmapa X12) · kontrast tokenów = minimalna korekta hexów (✅ w partii 1)

---

## 2026-07-02

### Zespół agentów + konsolidacja planowania
- ✅ Utworzono zespół 8 agentów w `.claude/agents/` (dev, code-reviewer, designer, seo, marketing, support, legal, strategist) + wspólna metodologia: [[Team-Playbook]]
- ✅ Konsolidacja planowania: [[Projects/Roadmap]] = jedyne źródło prawdy (NOW/NEXT/LATER); [[Projects/Milestones]] → sam widok dat; [[Projects/Backlog]] → poczekalnia pomysłów; „Do zrobienia w przyszłości" → wskaźnik na roadmapę
- ✅ Sprzątnięto nieaktualne dane planistyczne: fałszywe P0 w Backlogu (iCal token, storage leak), wróżone metryki (Lighthouse, godziny), 4 konkurujące listy „Next Steps"

### Aplikacja (commity 2026-06-30 → 2026-07-02)
- ✅ `76f53ff` — generator umów najmu (nawigacja 08)
- ✅ `ce2b80f` — przebudowa szczegółów rezerwacji: zadania zamiast przewodnika
- ✅ `af4af47` — widok Analityka: statystyki okresowe z porównaniem YoY
- ✅ `76a3059` — fix ujawniania danych dostępowych w przewodniku + restyl v2
- ✅ `c6f2975` — identyfikacja v2 na stronach publicznych i ekranach pobocznych
- ✅ `416b4cc` — baner zgody cookie w identyfikacji v2
- ✅ `fb8a00e` — porządek repo: jedna wersja produkcyjna (stare → `/_legacy`)
- ✅ `dd4aec2` — kreator przewodników V4 + limit uploadu 10 MB
- ⚠️ `b4aeb4e` — bypass weryfikacji e-mail dla testów V4 — **DO COFNIĘCIA przed launchem** (roadmapa N1)

---

## 2026-06-29

### Knowledge Base Expansion
- ✅ Created comprehensive Obsidian vault with 12+ documents
- ✅ Added critical Agent-Process-Map for fast code navigation
- ✅ Set up Projects tracking (Milestones, Backlog, WynajemPRO)
- ✅ Documented all features, architecture, tech stack
- ✅ Created debugging guide and performance optimization tips
- ✅ Added code patterns and best practices
- ✅ Setup resource library and glossary

**Impact**: Agents can now navigate code without grepping, saving 500+ tokens per session.

---

## 2026-06-28

### Firebase App Check Re-enabled
- ✅ Commit: 9f85a23 - "fix: Przywrócono App Check"
- Investigation: Was disabled for debugging (commit cbe1594)
- Status: Monitoring for issues

---

## 2026-06-25

### Google Login Loop Fixed
- ✅ Commit: 99cc65b - Fixed Google login redirect loop
- Issue: User got stuck in redirect after email verification
- Solution: Improved redirect logic in auth flow

---

## 2026-06-20

### X-Frame-Options Header Removed
- ✅ Commit: 2bad1ff - "fix: Zmiana X-Frame-Options na SAMEORIGIN"
- Issue: Header was blocking Firebase Auth iFrame
- Solution: Set to SAMEORIGIN to allow iframe from same origin

---

## 2026-06-15

### E2E Testing Infrastructure Completed
- ✅ Firebase Emulator configured
- ✅ Playwright setup complete
- ✅ Test scripts added to package.json
- ✅ Initial test files created

**Status**: Ready to write E2E tests

---

## 2026-06-10

### iCal Export Bug Discovered — later found FALSE
- 🔴 Reported: `secretToken` not generated on property create
- ✅ **2026-06-29 correction**: false alarm — `secretToken` IS generated in `ManagerApp.jsx` (create + legacy retrofit) and validated by `exportIcal`. No fix needed.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-06-05

### Storage Leak Bug Identified — later found FALSE
- 🔴 Reported: Guide files not deleted on account deletion
- ✅ **2026-06-29 correction**: false alarm — `deleteUserAccount` deletes Storage via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` before removing docs. No leak.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-05-20

### Project Setup Complete
- ✅ React + Vite scaffolding
- ✅ Firebase integration
- ✅ Stripe payments setup
- ✅ Initial UI components created

---

## 2026-01-20

### Real-time Data Hook Implemented
- ✅ `useFirebaseData.js` created
- ✅ Real-time Firestore listeners setup
- ✅ State synchronization working

---

## 2026-01-15

### Project Kickoff
- ✅ WynajemPRO project started
- ✅ Tech stack decided (React, Firebase, Stripe, Playwright)
- ✅ Architecture planned
- ✅ Initial Firebase setup

---

## Key Decisions Made

See: [[Decisions]] for detailed ADRs

1. **Firebase Backend-as-a-Service** (ADR-001)
2. **React + Vite Frontend** (ADR-002)
3. **Playwright E2E Testing** (ADR-003)
4. **Firestore Security Rules** (ADR-004)
5. **useFirebaseData Hook** (ADR-005)
6. **Guest Guide Signature Requirement** (ADR-006)
7. **iCal Export via Cloud Function** (ADR-007)
8. **Storage Organization** (ADR-008)
9. **Cloud Functions for Deletion** (ADR-009)
10. **Polish Language Default** (ADR-010)
11. **Email Verification Required** (ADR-011)
12. **Stripe for Payments** (ADR-012)

---

## Recent Commits

```
bd710e4 docs: Konfiguracja systemu pamięci i bazy wiedzy w Obsidian
9f85a23 fix: Przywrócono App Check
cbe1594 chore: Tymczasowe wyłączenie App Check w celu diagnozy błędu 401 logowania
2bad1ff fix: Usunięcie nagłówka X-Frame-Options, który blokował iframe autoryzacji Firebase
9aa1aa2 fix: Zmiana X-Frame-Options na SAMEORIGIN aby umożliwić działanie Firebase Auth iframe
```

See: `git log` for full history

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Commits | 20+ |
| E2E Tests Written | 8 |
| Documentation Pages | 16 |
| Known Bugs | 0 krytycznych (2 dawne = fałszywe alarmy, [[Known-Issues]]) |
| Features Working | 8+ |
| Time to Development | 6 months |

---

## Next Steps

➡️ **Przeniesione do [[Projects/Roadmap]]** (jedyne źródło prawdy planowania).
Log nie prowadzi własnej listy zadań — poprzednia natychmiast rozjechała się
z Milestones i Backlogiem. Tu zostaje wyłącznie historia.

---

## Lessons Learned

1. **Real-time data sync**: useFirebaseData hook essential for Firebase apps
2. **Security first**: Firestore rules catch bugs early
3. **Test early**: E2E tests would have caught bugs earlier
4. **Documentation matters**: Clear docs speed up development
5. **Polish language**: Important for target market

---

## Contributing

When adding updates:

1. Add entry at top of this file (most recent first)
2. Include date and description
3. Link to related issues/PRs/docs
4. Update commit sha if applicable

---

**Last Updated**: 2026-07-02  
**Maintained By**: Szymon + Claude

---

**Related**: [[Projects/Milestones]], [[Known-Issues]], [[Decisions]]

