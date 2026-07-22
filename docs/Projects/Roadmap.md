# 🗺️ Roadmapa — jedyne źródło prawdy planowania

> **Zasada nadrzędna:** decyzje „co robimy" żyją w JEDNYM miejscu — tutaj.
> [[Projects/Backlog]] to tylko poczekalnia niezaplanowanych pomysłów,
> [[Projects/Milestones]] to tylko widok dat, [[Activity-Log]] to historia.
> Wcześniej plany żyły w 4 miejscach naraz i się rozjechały (np. „krytyczne bugi",
> które od 29.06 były już wyjaśnione jako fałszywe alarmy — patrz [[Known-Issues]]).

## Jak czytać i aktualizować (metodologia)

- Każda pozycja ma: **po co** (cel biznesowy), **gotowe, gdy** (definicja ukończenia),
  **weryfikację** (jaki dowód) i **agenta** prowadzącego (`.claude/agents/`, patrz [[Team-Playbook]]).
- **Bez zmyślonych liczb.** Żadnych estymat godzinowych i wróżonych metryk — czego nie
  zmierzyliśmy, tego nie wpisujemy. Priorytet ma uzasadnienie słowne.
- Statusy: ⬜ do zrobienia · 🔄 w toku · ⏸ czeka na decyzję · ✅ zrobione (wpis w [[Activity-Log]]).
- Nowy pomysł trafia najpierw do [[Projects/Backlog]]; do roadmapy przechodzi decyzją
  właściciela — wtedy dostaje pełny opis wg szablonu.
- Aktualizuje każdy (agent lub właściciel), kto zmienia stan rzeczy — od razu, nie „potem".

---

## 🎯 Horyzont: publiczny launch

**Definicja launchu:** aplikacja może bezpiecznie przyjmować płacących klientów —
prawnie (regulamin, RODO), technicznie (weryfikacja, paywall, walidacja danych)
i operacyjnie (jest jak pomagać użytkownikom). **Data launchu: decyzja właściciela**
po domknięciu sekcji NOW.

---

## 🔴 NOW — blokery launchu

### N1. Przywrócenie weryfikacji e-mail
**Po co:** bypass wprowadzony dla testów V4 (commit `b4aeb4e`) pozwala wejść do panelu bez potwierdzenia adresu — otwarta furtka na fałszywe konta.
**Gotowe, gdy:** rejestracja e-mail wymaga weryfikacji przed dostępem do panelu; TODO z `b4aeb4e` usunięte.
**Weryfikacja:** e2e auth na emulatorach + test ręczny pełnego przepływu rejestracji.
**Agent:** `dev`, przegląd `code-reviewer`. **Status:** 🔄 (2026-07-04)
- ✅ **Kod przywrócony**: guard w `App.jsx` (ProtectedRoute), `WynajemContext.jsx` (onAuthStateChanged → signOut), `LoginPanel.jsx` (blokada logowania niezweryfikowanego); wszystkie 3 TODO z `b4aeb4e` usunięte. Konta Google pomijają wymóg (adres zweryfikowany u dostawcy).
- ✅ **e2e auth 13/13** — w tym „login niezweryfikowanego pokazuje baner" i nowy „niezweryfikowany nie wejdzie na /dashboard". Przy okazji odtworzono całą suitę `auth.spec` (była 0/12 — patrz [[Design-Notes]]/X10: brakujące eksporty w mocku + stale selektory pod v2).
- ⏸ **Zostaje test ręczny właściciela**: bypass powstał przez problem App Check / HTTP 403 (`b4aeb4e`; App Check ponownie włączony — [[Known-Issues]] #3). Runtime pełnego flow (real `sendEmailVerification` → link → `emailVerified` → wejście) trzeba potwierdzić na żywo lub na emulatorze Auth. Nie da się tego zweryfikować w środowisku agenta.
- ✅ **Warstwa reguł domknięta przy N2** (2026-07-09, `e9b0f70`): `email_verified` w `isOwnerAndVerified` odkomentowane i WDROŻONE — backend egzekwuje weryfikację, nie tylko front (Google przechodzi, anonimowi goście nietknięci). Pozycja ⬜ wisiała tu nieaktualna do 2026-07-21.

### N2. Egzekwowanie subskrypcji (paywall)
**Po co:** bez sprawdzania statusu subskrypcji/trialu aplikacja jest realnie darmowa — brak przychodu.
**Gotowe, gdy:** po wygaśnięciu trialu i braku subskrypcji użytkownik widzi `PaywallScreen` i nie ma dostępu do panelu; ścieżki Stripe (checkout → webhook → status) przetestowane.
**Weryfikacja:** test na emulatorach/koncie testowym Stripe: trial aktywny / wygasły / subskrypcja opłacona / anulowana.
**Agent:** `dev`, przegląd `code-reviewer`. **Status:** ✅ 2026-07-09 (`e9b0f70`) — reguły WDROŻONE na produkcję (firestore + storage), rola cross-service nadana przez właściciela, smoke test właściciela zaliczony („wszystko działa"). Paywall i weryfikacja e-mail egzekwowane przez backend.
- ✅ **Reguły napisane** (`firestore.rules`): `hasActiveSubscription` = claim `stripeStatus=='active'` (szybka ścieżka, zero odczytów) lub fallback dokumentowy (`status`/`accountStatus`; trialing tylko z żywym `trialEndsAt` Timestampem, fail-closed). Przy okazji domknięty ogon N1: `email_verified` w `isOwnerAndVerified` (Google przechodzi, anonimowi goście nietknięci). Ścieżki paywalla zachowane: odczyt własnego profilu i `checkout_sessions` bez subskrypcji.
- ✅ **storage.rules** (odkrycie reviewera — własny TODO bramki): zapis `guides/` wymaga teraz verified + subskrypcji (cross-service lustro) + warunkowego owner-checka (upload okładki przed zapisem przewodnika przepuszczony świadomie).
- ✅ **Przegląd `code-reviewer` (2 rundy)**: całość bezpieczna do commita. Runda 1 wykryła 2 bugi frontu (naprawione: self-heal pisał `accountStatus` odrzucany przez regułę create; alias mógł pokazać paywall płacącemu). Runda 2 potwierdziła storage.rules i poprawki; dołożone wzmocnienie: id przewodnika/strony opinii z `crypto.randomUUID()` zamiast enumerowalnego `Date.now()` (id żyje w publicznym URL i ścieżce Storage). Dług odnotowany w Backlogu: osierocone pliki Storage po usunięciu przewodnika.
- ✅ `functions/audit-users-n2.cjs` — audyt danych produkcyjnych do uruchomienia przez właściciela PRZED deployem (trialing bez Timestampa, samo accountStatus, konta bez dokumentu users).
- ⏸ **Deploy = decyzja właściciela**: (1) audyt danych (`cd functions && node audit-users-n2.cjs`), (2) diff wdrożonych reguł z konsoli vs repo, (3) `firebase deploy --only firestore:rules,storage` — **przy promptcie CLI o uprawnieniach cross-service POTWIERDZIĆ** (agent Storage musi dostać odczyt Firestore, inaczej wszystkie uploady przewodników padną — finding 🟡 rundy 2), (4) smoke test po deployu: upload okładki na koncie trialowym + kontrolna odmowa zapisu na koncie z wygasłym trialem. Bez Javy brak emulatora — przegląd + audyt danych są bramką; CLI zwaliduje składnię przed publikacją.
- ⏸ Decyzje produktowe przy okazji: zapis sekretów przewodnika bez bramki subskrypcji (dziś możliwy po wygaśnięciu — finding 🟢); `past_due` blokuje natychmiast (bez grace period).

### N3. Walidacja schematu danych (reguły + front)
**Po co:** bez walidacji w `firestore.rules` złośliwy lub wadliwy klient może zapisać dowolne dane — ryzyko bezpieczeństwa i spójności.
**Gotowe, gdy:** reguły walidują kształt zapisów (typy, wymagane pola, rozmiary) dla `rentals`, `settings`, `guides`; front waliduje przed wysłaniem; istniejące dane produkcyjne przechodzą.
**Weryfikacja:** testy reguł na emulatorze (zapis poprawny przechodzi, wadliwy odrzucany) + regresja e2e.
**Agent:** `dev` + `code-reviewer` (audyt reguł). **Status:** ✅ 2026-07-10 (`beafb13`) — walidacja WDROŻONA (firestore:rules, kompilacja bez warningów) + hosting z fixem dodawania wpisów; tester produkcyjny 16/16; czeka tylko smoke test właściciela (ręczne dodanie wpisu).
- ✅ **Walidacja napisana**: `isValidRental` (allowlist 24 pól z trzech źródeł prawdy: formularz + sync iCal + aktualizacje zadań; typy, limity), `isValidGuide` rozdzielony na przewodnik gościa (z legacy sekretami dopuszczonymi w merge'u update) i stronę opinii X13, `isValidSettings` + gałąź hostProfile (6 pól). Hardening: create przewodnika odrzuca legacy sekrety (`hasAny`).
- ✅ **Przegląd `code-reviewer`**: bezpieczne do commita; składnia zweryfikowana analitycznie (konstrukcje już skompilowane na produkcji przy N2). Wykryty przy okazji **przedistniejący bloker produktowy**: dodawanie wpisu (`setDoc` na create) padało na sentinelu `deleteField()` — SDK rzuca przed regułami; naprawione w `ManagerApp.handleAddRental` (create: pomijanie pola; update: deleteField).
- ✅ `functions/validate-schema-n3.cjs` — lustrzany tester (te same predykaty w JS) do przepuszczenia WSZYSTKICH dokumentów produkcji; zamiennik emulatora. Zgodność lustra potwierdzona przez przegląd (rozbieżności tylko w stronę ostrzejszą).
- ⏸ **Czeka**: świeży klucz serwisowy od właściciela → przebieg testera na produkcji (rozstrzygnie m.in. hipotezę `property`-jako-mapa w starych rezerwacjach — kod się przed nią broni, więc takie dokumenty mogły istnieć) → commit → deploy za zgodą → smoke test (PRIORYTET: ręczne dodanie rezerwacji/kosztu/zadania — świeżo naprawiona ścieżka).
- Front: bez zmian kodu (13 required w formularzu, parsowanie liczb, normalizacja URL — wystarczające); limity UI (20 łączy, maxLength) → Backlog.
- ✅ **Reguły wdrożone = repo, zweryfikowane** (2026-07-07): właściciel wkleił reguły z konsoli, `diff -wB` z `git show HEAD:firestore.rules` — identyczne. Zagadka `permission-denied` z X13 rozstrzygnięta: to **App Check** blokował nieatestowany klient localhost (produkcyjna domena przechodzi atestację reCAPTCHA) — nie rozjazd reguł. Walidacja `isValidGuide` przy N3 musi uwzględnić `type:'review'` (X13).

### RODO-UI (#22) — klauzule i usuwanie kont (2026-07-16)
**Po co:** domknięcie findingów F4/F5/F6 z części legal audytu N5. **Agent:** `legal` (brzmienia) + `dev` (wdrożenie). **Status:** ✅ WDROŻONE 2026-07-16 (`c714fb1`; re-review „bezpieczna do deployu"; deploy rules→hosting wg warunku recenzenta)
- ✅ **F6/#8**: usuwanie kont Google — `AccountModal` wykrywa provider; hasło (email) LUB `reauthenticateWithPopup(Google)`. Domyka art. 17 dla kont Google.
- ✅ **F5**: klauzula informacyjna (warstwa pierwsza) pod formularzem `/kontakt` + link do Polityki. Operator = „serwis WynajemPRO" (pełny podmiot w Polityce).
- ✅ **F4**: informacja przy danych kontaktowych (CompleteProfileScreen + AccountModal) + **osobne pole publicznego e-maila** (`publicEmail` — e-mail logowania NIE jest już auto-publikowany) + **przełącznik „Pokazuj dane kontaktowe gościom"** (`showPublicContact`; wyłączenie realnie kasuje `settings/publicContact`). Model rozszerzony przez reguły+tester+self-heal.
- ✅ **Generator umów w dokumentach**: `legal` oznaczył wyłączenie (Regulamin §4 „obecnie niedostępna", Checklista poz. 8 status WYŁĄCZONA, notatka w Uwagi-N5). Disclaimer nienaruszony (wraca z funkcją).
- ✅ **Osobne pole publicznego e-maila + przełącznik** wdrożone (2026-07-16, na polecenie właściciela). Domyka główne ryzyko F4 (prywatny e-mail logowania nie wycieka).
- ⏸ **Otwarte decyzje właściciela/prawnika** (zadanie #31): retencja `contact_messages` (~12 mies.?) + wiersz w Polityce §2, pełna nazwa Operatora. Dług: stare `publicContact` z e-mailem logowania czyszczą się dopiero przy następnym zapisie profilu (rozważyć migrację).

### N4. Regulamin, polityka prywatności, powierzenie danych (DPA)
**Po co:** przyjmowanie płatności bez regulaminu i podstaw RODO to ryzyko prawne; gospodarze przetwarzają w aplikacji dane SWOICH najemców — potrzebne powierzenie przetwarzania. (Pozycja nr 1 z listy właściciela.)
**Gotowe, gdy:** projekty dokumentów w `docs/legal/` + weryfikacja przez prawnika-człowieka + wdrożone w aplikacji (`Terms`/`Privacy`) przez `dev`.
**Weryfikacja:** checklista zgodności `legal` (podstawy prawne z datą) + potwierdzenie prawnika.
**Agent:** `legal` (projekty) → właściciel + prawnik (akceptacja) → `dev` (wdrożenie). **Status:** 🔄 — **dokumenty u prawnika-człowieka (2026-07-10)**, czekamy na uwagi; po nich korekty + wdrożenie przez `dev`.
- ✅ **Projekty gotowe** w `docs/legal/`: `Regulamin.md`, `Polityka-prywatnosci.md`, `DPA-powierzenie.md`, `Checklista-zgodnosci.md` — oparte na kodzie i źródłach (ISAP/UOKiK/UODO), z placeholderami na dane firmy. Wszystkie oznaczone „PROJEKT".
- ⏸ **Czeka na właściciela**: uzupełnić sekcję D checklisty (dane rejestrowe firmy, VAT/faktury, warunki founding members, model odstąpienia) + wybór kancelarii (otwarta decyzja nr 4).
- ⏸ **Czeka na prawnika-człowieka**: 9 punktów z sekcji E (m.in. odstąpienie przy Stripe, status „przedsiębiorcy na prawach konsumenta", kompletność DPA art. 28, nowelizacje 2026).
- 🔴 **Bramka publikacji (sekcja F)**: dokumentów NIE wolno publikować, dopóki N1–N3 nie są wdrożone (włącznie z regułami) — inaczej deklaracje rozejdą się ze stanem (rozliczalność, art. 5 ust. 2 RODO).

### N5. Audyt przedlaunchowy: bezpieczeństwo + RODO w kodzie
**Po co:** ostatnia bramka przed wpuszczeniem prawdziwych klientów i ich danych.
**Gotowe, gdy:** `code-reviewer` przejrzał `firestore.rules`, `storage.rules`, `functions/index.js` i przepływy sekretów (PIN/WiFi, `secretToken`); `legal` przejrzał przepływy danych osobowych; wszystkie 🔴 findingi rozwiązane.
**Weryfikacja:** raporty obu agentów z listą findingów i ich statusem.
**Agent:** `code-reviewer` + `legal`. **Status:** 🔄 — część techniczna (`code-reviewer`) ruszyła 2026-07-10 równolegle do N4 u prawnika; część `legal` (przepływy danych osobowych) pójdzie po raporcie technicznym, żeby czytała jego findingi.
- ✅ **Audyt techniczny wykonany** (2026-07-10): 2×🔴 (publiczny `list` całej kolekcji `guides` — anonim mógł zrzucić dane wszystkich klientów; legacy sekrety wifi/PIN na publicznych dokumentach, edycja ich NIE czyściła), 3×🟡 (SSRF w sync iCal: redirecty bez re-walidacji + brak bramki subskrypcji; XSS `javascript:` w łączach stron publicznych; publiczny `hostProfile` z `taxIdentifier` — może być PESEL), 4×🟢. Werdykt przed naprawami: NIE wpuszczać płacących klientów.
- ✅ **Naprawy wdrożone w kodzie** (ten sam dzień): reguły `get`/`list` rozdzielone + sekrety w update wolno tylko usuwać (`diff().addedKeys()/changedKeys()`); migracja sekretów przy każdym zapisie przewodnika (`deleteField`) + czyszczenie `secrets/data`; `safeHref` (tylko http/s w href) na obu stronach publicznych + normalizacja łączy w edytorze; `publicContact` (wąski publiczny kontakt) zamiast publicznego `hostProfile` — zapis w koncie/onboardingu + samonaprawa starych kont; bramka verified+subskrypcja w `syncICalCalendars` + `fetchWithSafeRedirects` (re-walidacja SSRF każdego przekierowania). Weryfikacja: lint 0, build OK, reguły dry-run skompilowane, e2e 30/30.
- ✅ **Re-review `code-reviewer` (2026-07-10): diff BEZPIECZNY DO COMMITA** — wszystkie findingi domknięte w kodzie, bez regresji; potwierdzone m.in.: `deleteField` na nieobecnym polu nie wpada do MapDiff (czyste przewodniki zapisują się normalnie), undici `redirect:'manual'` daje realny 302+Location (legalne iCale za przekierowaniem dalej działają), jedyny publiczny czytelnik `hostProfile` przełączony. Nowe 🟢: DNS-rebinding w `isSafeUrl` ([[Projects/Backlog]]), usunięty martwy `WynajemContext.jsx.bak`.
- ✅ **CZĘŚĆ TECHNICZNA DOMKNIĘTA (2026-07-10, `f10b029`)**: commit + deploy (rules + hosting + **functions**, 9 funkcji zaktualizowanych) + migracja na produkcji: `audit-guides-n5.cjs` wykazał ZERO legacy sekretów i ZERO enumerowalnych id (nic do odtwarzania — 🔴2 był teoretyczny dla tych danych), `--fix` utworzył `publicContact` właściciela, kontrola „✓ Czysto", tester N3: 20/20 dokumentów. Follow-up w Backlogu: usunięcie wifi/pin z allowlisty reguł (produkcja potwierdzona czysta).
- ✅ **Część `legal` — raport gotowy (2026-07-15)**: warstwa DOSTĘPU do danych po naprawach technicznych solidna; warstwa CYKLU ŻYCIA — nie. **1×🔴 F1**: czyszczenie po 30-dniowej karencji nie usuwa danych powierzonych (guides nadal publicznie serwowane, sekrety czytelne dla starych sesji gości, podpisy, Storage, users+Auth zostają) — a paywall/Polityka/DPA obiecują usunięcie → bez naprawy nie wolno opublikować dokumentów N4 (art. 28(3)(g), 5(1)(e), rozliczalność). 🟡 F2–F7: brak ścieżki usuwania porzuconych triali, osierocone podpisy po usunięciu przewodnika z panelu, luka informacyjna publicContact przy zbieraniu, klauzula przy /kontakt, przejściowy kanał mailowy dla usunięć kont Google, rozjazdy dokumentów po zmianach 2026-07-10. Wsad dla prawnika: `docs/legal/Uwagi-N5-dla-prawnika.md` (istniejące dokumenty nietknięte). Zadania: #21 (F1+F3, `dev`, 🔴), #22 (F4/F5/#8 UI).
- ⚠️ **Nawrót incydentu N2 wykryty przy smoke teście (2026-07-15)**: upload okładki przewodnika = `storage/unauthorized` — rola cross-service dla agenta Storage realnie nienadana; naprawa po stronie właściciela ([[Known-Issues]] #9: `firebase deploy --only storage` w TTY z `y`).
- ⏸ **Wsad do części `legal`:** 🟡5 (PII gospodarza), 🟢 retencja: `cleanupUserData` przy kontach `canceled` nie czyści `guides`/`secrets`/podpisów gości (imię + obraz podpisu = dane osobowe).

---

## 🟡 NEXT — po odblokowaniu launchu (lub równolegle, gdy NOW czeka na prawnika)

### X1. Baza wiedzy / centrum pomocy dla użytkowników
Pozycja nr 2 z listy właściciela. **Po co:** mniej powtarzalnych pytań, łatwiejszy onboarding. **Gotowe, gdy:** artykuły FAQ w `docs/support/` (od `support`) + osadzone w aplikacji (`dev`). **Agent:** `support` → `dev`. 🔄 — 2026-07-21 osadzenie w aplikacji zbudowane; treść w odświeżaniu, czeka akceptacja właściciela.
- ✅ **Artykuły gotowe** (2026-07-10): 9 plików w `docs/support/` — każdy krok i etykieta zweryfikowane w kodzie (cytaty 1:1), trial = 14 dni potwierdzony, zero markerów niepewności.
- ⚠️ **Treść rozjechała się z panelem** (wykryte 2026-07-21 przed osadzeniem): artykuły pisane 10.07 opisują stan sprzed X4/X14/X16/RODO-UI/F2. Zweryfikowane w kodzie nieprawdy: osobny widok „Analityka" (nie istnieje — `ManagerApp.NAV` ma Finanse 05 z podzakładkami), FAQ „raportu nie da się pobrać jako plik" (są druk A4→PDF i eksport CSV), „Generator umów" w nawigacji i w arkuszu „Więcej" (X16 go zdjął), usuwanie konta Google mailem (F6 dał reauth przez popup), publikowanie e-maila logowania w przewodniku (RODO-UI: wąski `publicContact` + przełącznik), brak pola „Liczba gości" (X14) i retencji 90/30 dni (F2). Wniosek metodologiczny: **artykuł cytujący UI 1:1 starzeje się z każdym deployem** — odświeżenie musi być krokiem w checkliście zmian UI.
- ✅ **Odświeżenie treści** (agent `support`, 2026-07-21): wszystkie 9 plików przepisane pod obecny kod, każda etykieta z cytatu. `finanse-i-raporty` niemal w całości nowy (Finanse 05 → Przegląd/Koszty i opłaty/Raporty, koszty stałe z `RecurringCostModal`, druk PDF + eksport CSV z kolumnami), `pierwsze-kroki` i `rozwiazywanie-problemow` z nawigacją 1:1 z `NAV`, `konto-i-subskrypcja` z publicznym kontaktem, reauth Google i retencją 90/30 dni, `przewodnik-goscia` z `publicContact` zamiast e-maila logowania, `rezerwacje-koszty-zadania` z „Liczbą gości" i bez generatora umów. Świadomie nieopisane (niesprawdzalne w repo): ścieżki klikania w extranetach Booking/Airbnb, czas zaciągania linku przez portale, konfiguracja faktur w Stripe, podłączenie Nocowania (brak pola na link w Ustawieniach).
- ⚠️ **Przegląd wyprodukował 10 sygnałów produktowych — 2 poważne, zweryfikowane w kodzie i wpisane do [[Known-Issues]]**: #10 wpisów typu „Koszty" i jednorazowych zadań NIE DA SIĘ edytować ani usunąć (`utilitiesList` liczony, ale nieodebrany w destrukturyzacji; „Ostatnie koszty" bez akcji) — literówka w kwocie zostaje w danych i psuje zysk oraz CSV dla księgowego; #11 sygnalizator synchronizacji w sidebarze sprawdza klucze `syncLinks` (nazwy obiektów) zamiast wartości (portale), więc przy działających linkach zawsze świeci „—". Reszta → [[Projects/Backlog]] (m.in. dwie różne definicje „Zysku netto" w sąsiednich zakładkach).
- ✅ **Osadzenie w aplikacji zbudowane** (`dev`, 2026-07-21): publiczne trasy `/pomoc` i `/pomoc/:slug` (celowo bez logowania — użytkownik odcięty paywallem też musi trafić do instrukcji), `HelpCenterPage` + `HelpArticlePage` na wzorcu bloga i `LegalLayout`, ikony per artykuł powtórzone z nawigacji panelu (`helpIcons.jsx`, lucide — zasada „zero emoji"). Wejścia: stopka landingu („Zasoby"), sidebar panelu i mobilny arkusz „Więcej" (nowa karta, żeby nie wybijać z pracy), odesłanie nad formularzem `/kontakt`. Sitemapa rozszerzona o 9 adresów.
- ✅ **Jedno źródło prawdy zamiast przepisywania**: `scripts/build-help-articles.mjs` generuje `src/data/helpArticles.js` z `docs/support/*.md` (`npm run help:build`); plik danych oznaczony jako generowany. Ręczne przepisanie treści do JS-a odtworzyłoby dokładnie ten rozjazd, który właśnie wykryliśmy.
- ✅ **Naprawa przy okazji**: Preflight Tailwinda zerował `list-style`, więc instrukcje „krok po kroku" renderowały się BEZ numeracji (reguła `li::marker` w `.wpb-prose` nie miała czego kolorować). Punktory i numery przywrócone jawnie w `brand.jsx` — dotyczyło też bloga i stron prawnych. Test regresji w `e2e/help-center.spec.js`.
- ✅ **Weryfikacja**: lint 0, build OK, `e2e/help-center.spec.js` 7/7 (lista, artykuł+FAQ, numeracja kroków, nieznany slug, wejście z landingu, wejście z panelu desktop+mobile), zaufany zestaw 40/40 bez regresji, podgląd wizualny desktop + mobile 375px.
- ✅ **Naprawy #10 i #11 wykonane** (2026-07-21, na polecenie właściciela wraz z akceptacją treści): koszty i jednorazowe zadania mają edycję/usuwanie, sygnalizator synchronizacji mówi prawdę. Front-only, bez zmian reguł. Po naprawach zaktualizowane dwa fragmenty artykułów opisujące obejścia.
- ✅ **Treść zaakceptowana przez właściciela 2026-07-21** → commit + deploy hosting.
- ⚠️ **Sygnały produktowe z pisania** (support nie zgadywał — treść je omija): martwy formularz `/kontakt`, pakiet roczny na paywallu bez obsługi w backendzie, brak możliwości usunięcia konta Google z UI → [[Known-Issues]] #6–8; drobne (isAdvancePaid bez UI, mylący „Eksport PDF", Facebook zeruje podatki) → [[Projects/Backlog]].

### X2. Interaktywne demo panelu na landingu
Pozycja nr 3: obecne demo nie działa; pomysł — mockup w stylu „apple scroll" (scrollowanie podświetla funkcje). **Po co:** pokazanie produktu bez rejestracji = wyższa konwersja. **Gotowe, gdy:** działające demo na landingu, zweryfikowane na mobile. **Agent:** `designer` + `dev`, przekaz `marketing`. **Status:** ✅ WDROŻONE 2026-07-21 (kod 2026-07-17 `10e3cc5`; deploy `--only hosting`) — live na `moje-domki-6c77d.web.app` + `wynajempro.com`.
- Diagnoza „demo nie działa": link „Otwórz panel demo →" prowadził do /login. Nowa sekcja #panel: 4 kroki + przyklejony mockup okna panelu (Pulpit/Kalendarz/Finanse/Przewodnik) przełączany scrollem (IntersectionObserver) lub klikiem; dostępność (przyciski, aria-current, aria-live, reduced-motion); mobile: sticky mockup z tłem, pozioma nawigacja. Uczciwe CTA „Załóż darmowe konto — 14 dni testów". Stały spec `e2e/landing-demo.spec.js` (4 testy + zrzuty) — zaufany zestaw 34/34. Zweryfikowane wizualnie (desktop/finanse/mobile).
- **Poprawka ramek (2026-07-21, `1ed3f83`, wdrożona)**: highlight liczony z realnego elementu `[data-hl]` zamiast ręcznych procentów — te nie pokrywały treści (Finanse 31px za wysoko → ramka w kafelkach KPI, Obiekty 38px za krótko). Teraz trzyma się treści w każdej skali; zweryfikowane pomiarami DOM (Δx=Δy=0) w desktopie i kompakcie.
- **v2 (2026-07-17, import z Claude Design „Wynajem Landing Scroll.dc.html")**: pełny apple-scroll — sticky 520vh, szyna postępu + 5 etap (Pulpit/Kalendarz/Obiekty/Rezerwacja/Finanse), okno przeglądarki z pełnym mockupem panelu, ruchomy highlight, winScale. `LandingScrollDemo.jsx` (wierny port silnika support.js); zastąpił v1. e2e przepisany, 34/34.

### X3. Przewodnik gościa — dokończenie
Pozycja nr 4, **częściowo zrobiona**: restyl v2 + naprawa odkrywania danych dostępowych ✅ (`76a3059`). Zostaje: możliwość dodania 2 plików (regulamin + przewodnik). **Agent:** `dev`. 🔄

### X4. Fuzja Finanse + Analityka i rozbudowa śledzenia finansów
**Zakres rozstrzygnięty decyzją właściciela 2026-07-15** (zastępuje stare „⏸ czeka na decyzję"; wchłania X5):
**Po co:** rdzeń obietnicy produktu — gospodarz widzi w jednym miejscu, ile naprawdę zarabia. **Agent:** `dev` + `designer` (skill impeccable). **Status:** ✅ 3 partie zrobione i wdrożone 2026-07-16 (szczegóły pod listą)
- [x] **Fuzja pulpitów** (partia 1): Analityka i Finanse scalone w jeden moduł „Finanse" (05) z podzakładkami **Przegląd · Koszty i opłaty · Raporty** (`FinanceHub`). Dawna „Analityka" (06) wchłonięta, `FinanceView` usunięty (Analityka jako Przegląd go zastępuje). NAV przenumerowana (Przewodniki 06, Opinie 07). Weryfikacja: lint 0, build OK, e2e 30/30, zrzuty desktop+mobile (impeccable) — zgodne z .wpd, AA, responsywne.
- [x] **Zakładka „Koszty i opłaty"** (partia 1, `CostsView`): filtr zakres+obiekt, 4 KPI (count-up), rozbicie „Na co poszły pieniądze" (kategorie: prowizje/podatki/media + kategorie własne z wpisów), „Koszty wg obiektu", tabela „Ostatnie koszty" (restacking na mobile). Model: koszty z rezerwacji (commission/utilities/tax/vat) + wpisy typu utility per kategoria.
- [x] **Rozbudowa śledzenia finansów** (partia 2, 2026-07-15): koszty stałe (cykliczne — `settings/recurringCosts`, kwota miesięczna liczona za poniesione miesiące) vs zmienne; **prowizje per portal**; **zysk netto + marża** i **zysk wg obiektu**. Model przez cały łańcuch stanu; reguły `isValidSettings`+tester rozszerzone o `recurringCosts`; CRUD `RecurringCostModal`; nowe klasy `.wpd-ptable`. Weryfikacja: lint 0, build, reguły, e2e 30/30, podgląd wizualny realnym komponentem (liczby spójne, rusztowanie podglądu usunięte).
- [x] **Moduł Raportu Rentowności** (partia 3, 2026-07-16): `ProfitabilityReportModal` przepisany na pełne P&L roku z kosztami stałymi (spójne z Koszty i opłaty). Wykres zysku miesiąc-po-miesiącu (inline SVG, obsługa wartości ujemnych + linia zera) i struktura kosztów (5 słupków etykietowanych) — bez bibliotek (etos marki; **skill dataviz**: walidator FAIL na stonowanych tokenach marki, ale pasmo CVD 8–12 legalne dzięki etykiecie na każdym słupku). Tabela miesięczna + rentowność wg obiektu. **Druk A4→PDF** (`window.print` + arkusz `@media print`) i **eksport CSV dla księgowego** (`utils/reportExport.js`: separator `;`, przecinek dziesiętny, BOM, wiersz SUMA — przetestowany w node). Weryfikacja: lint 0, build, e2e 12/12, podgląd wizualny realnym CSS panelu zatwierdzony. **Czeka:** test wydruku PDF właściciela.

**Cała X4 zrobiona (3 partie) i WDROŻONA** 2026-07-16 (`e211c8d` w deployu wiszącej partii: `firestore:rules,hosting,functions` — reguły z `recurringCosts` released). ⏸ Zostaje smoke test właściciela: CRUD kosztu stałego + Raport rentowności → Drukuj/PDF i eksport CSV.

### X5. Lepsze podsumowanie miesiąca
✅ **Scalone z X4** decyzją właściciela 2026-07-15 — fuzja pulpitów + raport rentowności realizują ten cel.

### X6. Ustawienia konta w lewym dolnym rogu + profil
Pozycja nr 7: przeniesienie ustawień obok nazwy gospodarza, zdjęcie profilowe itd. **Agent:** `designer` + `dev`. 🔄
- ✅ **Rdzeń (2026-07-06, decyzja właściciela):** SettingsModal rozdzielony — nowy **AccountModal** (profil gospodarza, subskrypcja, usunięcie konta) otwierany kliknięciem w imię i nazwisko w sidebarze oraz z pozycji „Konto" w mobilnym arkuszu „Więcej"; zębatka = „Ustawienia aplikacji" (obiekty, źródła, kategorie, podatki, integracje, powiadomienia). Konto ma własny, wąski zapis `settings/hostProfile` (celowo nie reużywa `saveSettings`, który zapisuje wszystkie stany `editing*` — nieseedowane groziłyby nadpisaniem obiektów pustką). Weryfikacja: lint+build 0, e2e panel-v2+review+smoke 12/12 (w tym nowy test X6).
- ⬜ Zostaje: zdjęcie profilowe (osobny kawałek — upload do Storage).

### X7. Rozbudowa szczegółów rezerwacji
Pozycja nr 8, **częściowo zrobiona**: przebudowa szczegółów rezerwacji (zadania zamiast przewodnika) ✅ (`ce2b80f`). **⏸ czeka na decyzję:** jakie informacje dodać w kolejnym kroku? **Agent:** `dev`. ⏸

### X8. Audyt językowy treści PL
Przeniesione ze starego Milestone 2: literówki, gramatyka, spójność tonu na landingu, w panelu i szablonach przewodników. **Agent:** `marketing` (ton) + `designer` (UI copy). ⬜

### X9. Fundament SEO
**Po co:** SPA na Firebase Hosting — najpierw trzeba ustalić, co w ogóle widzi Google. **Gotowe, gdy:** audyt indeksowalności (initial HTML, sitemap, robots, meta/OG, canonical) + wdrożone poprawki warstwy SEO + plan treści. **Agent:** `seo`. 🔄
- ✅ **Część 1 — kanonizacja domeny (2026-07-21, decyzje właściciela):** kanoniczna = `wynajempro.com` (bez www). Sitemap (14 adresów), robots (`Sitemap:` + `Disallow` dla login/reset/auth/guide/opinie), OG w `index.html` i nowy `SeoTags.jsx` (canonical + og:url per trasa, `noindex` na trasach wyłączonych) — wszystko na domenie kanonicznej. Weryfikacja: lint+build 0, canonical potwierdzony runtime na 8 trasach. Szczegóły i pułapki: [[Activity-Log]] 2026-07-22. Commit `8bda769` + **deploy hostingu 2026-07-22** (decyzja właściciela) — live zweryfikowane na obu domenach. Następny krok: GSC ([[Zlecenia-wlasciciela]]).
- ✅ **301 firebase→kanoniczna (2026-07-22):** multi-site wdrożone — site `wynajempro` serwuje aplikację (domena custom przepięta, DNS TXT `hosting-site` zmienione), stary `moje-domki-6c77d` = redirector 301 z zachowaniem ścieżki; auth nietknięty (rezerwowane `/__/*`). Deploy aplikacji odtąd: `--only hosting:app`. Szczegóły: [[Activity-Log]].
- ⬜ Zostaje: audyt indeksowalności SPA (pusty initial HTML — decyzja prerender/SSG/SSR), title+description per podstrona (rozbudowa `SeoTags`), JSON-LD, wpisy bloga w sitemapie, plan treści (`docs/seo/`).
- ⚖️ `legal` przeanalizował (2026-07-22, raport: [[Ocena-linki-guide-opinie]]); decyzje właściciela „wg rekomendacji" ZREALIZOWANE tego samego dnia: maskowanie tokenu w GA + ostrzeżenie w GuideBuilderze + X-Robots-Tag wdrożone (`dev`, e2e 13/13), projekty N4 uzupełnione (`legal`), reszta → [[Projects/Backlog]]. Pakiet + **N5 C.1 wdrożone na produkcji 2026-07-22** (tryb F2: harness 21/21, przegląd „BEZPIECZNA", deploy hosting+functions). Ostatni bloker legal zamknięty; zostaje #32 (Stripe przy purge).

### X10. Rozszerzenie testów e2e kluczowych przepływów
Przeniesione ze starego Milestone 4, bez fikcyjnego celu „80%": auth (z przywróconą weryfikacją), rezerwacje, przewodnik + sekrety, paywall/Stripe. **Agent:** `dev` + `code-reviewer`. ⬜
**⚠️ Odkrycie 2026-07-03:** duża część istniejącej suity celuje w aplikację sprzed v2 (ui-scaling: selektory Tailwinda, teksty starego landinga — 9 trwale czerwonych testów); pełny bieg to było „33 passed / ~24 failed", nie zielona suita. X10 to de facto przepisanie suity pod v2, nie tylko rozszerzenie. Zalążek: `e2e/panel-v2.spec.js` (smoke zalogowanego panelu na mockach).
**Postęp 2026-07-04:** `auth.spec` odtworzona w całości (0/12 → **13/13**) przy okazji N1 — naprawiony mock (`firebase-mock.js`: brakujące eksporty auth) + stale selektory pod v2 (zakładka Rejestracja, toggle Pokaż/Ukryj, checkbox regulaminu). Wiarygodne dziś: **auth 13, panel-v2 4, smoke 2, spelling 4**. Do przepisania zostają: `ui-scaling` (pre-v2), `stripe.spec` (m.in. `29.99` vs `29,99`, teksty), `stripe-payment`, `links-buttons`, `ical_token`, `guest-guide*`.

### X11. Plan marketingowy launchu
**Gotowe, gdy:** ICP potwierdzony z właścicielem, komunikacja wartości, wybór 1–2 kanałów na start z metrykami testu. **Agent:** `marketing` + `strategist`. ⬜

### X12. Nawigacja mobilna panelu — dolny pasek (decyzja właściciela 2026-07-03)
**Po co:** poniżej 980px sidebar znika bez żadnej alternatywy — panel jest nieużywalny na telefonie, a FAQ landinga obiecuje pełną responsywność (audyt UI poz. 4, [[Design-Notes]]).
**Gotowe, gdy:** dolny pasek w tokenach `--side` z podziałem 8 pozycji nawigacji (pasek + menu „więcej" — propozycja podziału do akceptacji właściciela); dostępne wylogowanie i status synchronizacji; `.wpd-cells`/`.wpd-fgrid` zwinięte w media query.
**Weryfikacja:** przejście wszystkich widoków na viewporcie mobile (375px) + e2e ui-scaling.
**Agent:** `designer` (projekt podziału) + `dev`. **Status:** ✅ 2026-07-04 (podział zatwierdzony przez właściciela: Pulpit · Kalendarz · Rezerwacje · Finanse + „Więcej"; e2e mobile w `panel-v2.spec.js`)

### X13. „Przewodnik opinii" — strona podziękowania z prośbą o opinię (pomysł właściciela 2026-07-04)
**Po co:** opinie na Google/Booking/Airbnb to bezpośrednia dźwignia rezerwacji gospodarza; nieinwazyjna strona-podziękowanie kieruje gościa dokładnie tam, gdzie opinia ma dla gospodarza wartość — wzmacnia główną obietnicę produktu.
**Zakres MVP (decyzja właściciela 2026-07-04):** strona per obiekt na wzór przewodnika gościa (reużycie architektury `guides` → tani build): edytor szablonu w panelu (tekst podziękowania + lista łączy do portali opinii), publiczna strona pod linkiem udostępnianym ręcznie po wyjeździe. Bez danych osobowych gościa na stronie i bez automatycznej wysyłki — warianty „personalizacja per rezerwacja" i „auto-wysyłka e-mail" świadomie odłożone ([[Projects/Backlog]]: automatyczne wiadomości; przy auto-wysyłce konsultacja `legal`).
**Gotowe, gdy:** gospodarz tworzy/edytuje stronę opinii dla obiektu; publiczny link działa bez logowania; strona w identyfikacji v2, dopracowana na mobile (goście otwierają na telefonie); e2e podstawowego przepływu.
**Weryfikacja:** e2e (utworzenie → publiczny podgląd → łącza) + przegląd `designer` (nieinwazyjny ton) + `code-reviewer` (reguły dostępu publicznego).
**Agent:** `designer` (koncept i ton) + `dev`. **Status:** ✅ 2026-07-06 (`f1c47ec`)
- ✅ **Zbudowane**: edytor `ReviewBuilder` (nawigacja 09 „Opinie": szablon podziękowania, łącza z presetami Google/Booking/Airbnb/TripAdvisor/Facebook, kopiowanie linku, QR do wydruku), publiczna strona `ReviewPageView` (`/opinie/{id}`, .wpb, mobile-first, anonimowa sesja jak w GuestGuideView), filtr typów w GuideBuilder. Zero zmian w firestore.rules (reużycie `guides` z `type:'review'`).
- ✅ **Weryfikacja**: lint+build 0; e2e `review-pages.spec.js` 5/5 (publiczna strona z łączami, 404, rozdzielenie typów, lista w panelu, szablon nowej strony) + regresja panel-v2/smoke.
- ✅ **Przegląd `designer` (2026-07-06)**: hierarchia strony („podziękowanie przed prośbą") oceniona jako wzorowa; 7 findingów naniesionych — m.in. tytuł bez wykrzyknika (głos marki), bezosobowy szablon wiadomości, toast przy błędzie pobierania (pusty stan nie kłamie), mikro-copy i kredyt ujednolicone z GuestGuideView (`wpb-meta`, bez linku). Po poprawkach: e2e 28/28.
- ✅ Punkt designera nr 6 rozstrzygnięty przez właściciela (2026-07-06): hint Booking.com z zastrzeżeniem „Booking prosi o opinię własnym mailem". Całość w `f1c47ec`.

### X14. Pole liczby gości w formularzu rezerwacji (właściciel, 2026-07-15)
**Po co:** podstawowa dana rezerwacji (sprzątanie, raporty, przyszłe umowy). **Gotowe, gdy:** pole w formularzu nowej/edytowanej rezerwacji, zapis zgodny z walidacją N3 (allowlista reguł + lustrzany tester!), widoczne w szczegółach rezerwacji. **Agent:** `dev`. ✅ WDROŻONE 2026-07-16 (`e211c8d`; ⏸ smoke test właściciela: dodanie rezerwacji z liczbą gości)
- Pole „Liczba gości" (opcjonalne, min 1) w rzędzie z datami; parsowanie liczbowe w handleAddRental; `guests` w allowliście `isValidRental` + lustrze testera; komórka „Goście" (z odmianą osoba/osoby/osób) w szczegółach rezerwacji (grid 3→4). E2e: zapis `guests: 3` jako liczba — 30/30.

### X15. Ikony kategorii kosztów i źródeł rezerwacji (właściciel, 2026-07-15)
**Po co:** szybsza czytelność list. **Decyzja identyfikacyjna właściciela 2026-07-16:** NIE emoji, lecz **ikony liniowe lucide** — bo design system ma udokumentowane „zero emoji" (`styles.js`, `LandingPage.jsx`), a spójność była priorytetem; ten sam język 1px co reszta panelu, kolor z tokenów. **Agent:** `designer` + `dev`. ✅ WDROŻONE 2026-07-16 (`411302c`, deploy hosting; front-only)
- Centralny moduł: `glyphs.js` (categoryIcon/sourceIcon — dopasowanie po słowie kluczowym bez diakrytyków, obejmuje kategorie własne) + `SourceTag.jsx` (spójny tag źródła: ikona+nazwa+ton). Wpięte: 4 miejsca tagów źródeł (Pulpit, Rezerwacje, Szczegóły, Generator umów) + CostsView (breakdown kategorii, prowizje wg portalu, listy kosztów stałych, ostatnie koszty). Weryfikacja: lint 0, build OK. Podgląd wizualny w smoke teście właściciela (App Check blokuje lokalny dev). Ewentualny follow-up: ikony w listach zarządzania kategorii/źródeł w SettingsModal.

### X16. Wyłączenie generatora umów w obecnej wersji (właściciel, 2026-07-15)
**Po co:** wzorce umów nie mają jeszcze akceptacji prawnika (N4 w toku) — generator w rękach klientów to ryzyko prawne. **Gotowe, gdy:** pozycja zniknięta z nawigacji (desktop + mobile), kod zostaje (wraca po akceptacji prawnej). **Agent:** `dev`. ✅ WDROŻONE 2026-07-16 (`e211c8d`)
- Wpis usunięty z NAV (komentarz przywracający w kodzie), Opinie przenumerowane na 08, martwy import ikony sprzątnięty; widok i logika zostają nietknięte. Mobilny arkusz „Więcej" karmi się NAV — znika automatycznie. Start panelu zawsze od Pulpitu (activeView nieutrwalany) — brak ślepych ścieżek.

**Kolejność pracy nad X14–X16 i X4 (ustalona 2026-07-15):** ① X16 (minuty, zdejmuje ryzyko prawne) → ② X14 (mała funkcja, ale zmiana schematu danych — porządnie z regułami) → ③ X4 partiami (największa wartość) → ④ X15 (kosmetyka, po przemeblowaniu kosztów w X4).

---

## 🟢 LATER — kierunkowo (szczegóły i pełna pula: [[Projects/Backlog]])

Powiadomienia e-mail · automatyczne wiadomości do gości · oceny/opinie gości ·
zaawansowany kalendarz dostępności · konta zespołowe · tryb ciemny · wielojęzyczność ·
głębsza synchronizacja kalendarzy · aplikacja mobilna · TypeScript · monitoring wydajności.

---

## ✅ Ostatnio ukończone (pełna historia: [[Activity-Log]])

- **2026-07-21** — **X1 centrum pomocy** osadzone (`/pomoc`, treść generowana z `docs/support/*.md`) po odświeżeniu wszystkich 9 artykułów pod obecny panel; **#10** (koszty i jednorazowe zadania bez edycji/usuwania) i **#11** (kłamiący sygnalizator synchronizacji) naprawione; numeracja list w `.wpb-prose` przywrócona po Preflightcie Tailwinda. E2e 46/46.

- **2026-07-06** — **X13 „przewodnik opinii"** (`f1c47ec`): edytor w panelu (nawigacja 09) + publiczna strona `/opinie/{id}`, z naniesionym przeglądem tonu `designer`; e2e 28/28.
- **2026-07-04** — partia 3 audytu: kalendarz (kolizja pasków back-to-back, kontrast amber, legenda), GuideBuilder bez systemowych okien, responsywność generatora, stan błędu newslettera (`432ea6a`); **X12**: dolny pasek nawigacji mobile + arkusz „Więcej" z testem e2e; **N1** kod przywrócony + `auth.spec` odtworzona 13/13 (zostaje ręczny test właściciela).
- **2026-07-03** — zielony lint (`7e64c5a`, `9b4f363`); dopieszczenie v2 — mikrointerakcje i zero cieni (`f2a6c17`); audyt UI 15 pozycji ([[Design-Notes]]) + partia 1: focus-visible, kontrast AA, spójność (`0a7d12b`); naprawa spelling.spec (`c89a3ce`); plan wdrożenia na rynek ([[strategy/Plan-wdrożenia-na-rynek]]).
- **2026-07-02** — zespół 8 agentów + [[Team-Playbook]]; konsolidacja roadmapy (ten plik); generator umów najmu (`76f53ff`); przebudowa szczegółów rezerwacji (`ce2b80f`); widok Analityka (`af4af47`).
- **2026-07-01** — naprawa ujawniania danych dostępowych w przewodniku + restyl v2 (`76a3059`); identyfikacja v2 na stronach publicznych (`c6f2975`).
- **2026-06-30** — porządek repo: jedna wersja produkcyjna, stare do `/_legacy` (`fb8a00e`); kreator przewodników V4 + upload 10 MB (`dd4aec2`); dashboard V4 jako produkcja (`53ecc5d`); baner cookie v2 (`416b4cc`).

---

## ⏸ Otwarte decyzje właściciela

1. **Data launchu** — po domknięciu NOW.
2. ~~**Cennik i pakiety**~~ ✅ **rozstrzygnięte 2026-07-04:** na launch jedna cena **29,99 zł/mc + founding members** (rabat roczny dla uczestników bety); pakiety wg liczby obiektów odłożone do sygnałów od realnych klientów (rekomendacja z [[strategy/Plan-wdrożenia-na-rynek]]).
3. **Zakres X4** (panel księgowy) i **X5** (podsumowanie miesiąca vs Analityka) i **X7** (szczegóły rezerwacji).
4. **Kancelaria/prawnik** do weryfikacji dokumentów z N4 — nadal otwarte (projekty przygotowuje `legal`, akceptacja przez prawnika‑człowieka).

**Related:** [[Team-Playbook]] · [[Projects/Backlog]] · [[Projects/Milestones]] · [[Known-Issues]] · [[Activity-Log]]
