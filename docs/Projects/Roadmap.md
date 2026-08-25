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

## 📅 Plan tygodnia 24–30.08.2026

> Ułożony **po zależnościach, nie po dniach** — zgodnie z zasadą „bez zmyślonych liczb".
> Kolumna „kto" ma znaczenie: część pozycji agent wykonać nie może (konsole zewnętrzne,
> decyzje prawne, pieniądze), a część czeka wyłącznie na niego.
> Stan wyjściowy: panel administratora, migracja Stripe i identyfikacja wdrożone 19–21.08
> ([[Activity-Log]]), `main` zsynchronizowany z GitHubem.

### Ścieżka A — pieniądze. Blokuje przyjęcie pierwszej złotówki

Kolejność jest wymuszona: bez A1 nie da się wykonać A3, a bez A2 checkout wygląda jak
transakcja bez sprzedawcy.

| # | Co | Kto | Zależność |
|---|---|---|---|
| **A1** | **Aktywacja konta Stripe** — dane firmy, rachunek bankowy. Bez tego karta klienta zostanie odrzucona **mimo poprawnego kodu**; na pulpicie „Pay out funds" jest przygaszone | właściciel | blokuje A3 |
| **A2** | **Branding checkoutu** — ikona, `#D9492B` / `#17150F`, dane publiczne (nazwa, kontakt), adresy Regulaminu i Polityki w Settings → Legal | właściciel | — |
| **A3** | **Pełny test płatności** — jedyny sposób potwierdzenia, że webhook przestawia status na `active`. Podpisu nie da się sprawdzić inaczej niż prawdziwym zdarzeniem: na koncie produkcyjnym Stripe nie wysyła zdarzeń testowych | oboje | po A1 |
| **A4** | `consent_collection` — zbieranie akceptacji Regulaminu przy płatności (wartość dowodowa przy umowie z konsumentem) | agent | **po A2** — bez adresu Regulaminu w Stripe tworzenie sesji padnie |
| **A5** | Sprzątanie w sandboxie: 15 klientów testowych i martwy endpoint webhooka | właściciel | — |

⚠️ **A4 celowo nie zostało zrobione razem z resztą migracji.** Dodanie go przed A2
zepsułoby płatności, żeby dołożyć do nich checkbox.

### Ścieżka B — RODO. Pięć decyzji, część blokuje zaproszenia do bety

Pełny opis każdej: [[Panel-administratora]] §7, uzasadnienia w
`docs/legal/Ocena-panelu-administratora-2026-08-19.md`.

| # | Decyzja | Pilność |
|---|---|---|
| **B1** | **Okres przechowywania dziennika dostępu.** Wdrożone 12 miesięcy, bo zbiór **bez żadnej granicy narusza art. 5 ust. 1 lit. e od pierwszego wpisu**. To propozycja do potwierdzenia — wariant 24 mies., jeśli dziennik ma służyć obronie przed roszczeniami | mechanizm już kasuje codziennie o 3:15 — decyzja tym pilniejsza |
| **B2** | **Ścieżka retencji dla kont po „Nadaj dostęp" i „Odbierz".** Oba stany żyją dziś bezterminowo; panel pokazuje je w „Porządku", ale nie kasuje | przed pierwszym testerem bety |
| **B3** | Wiersz o dzienniku w Polityce prywatności §2 (gotowy projekt w ocenie) | przed deployem — już wdrożone, więc **zaległe** |
| **B4** | Pola obsługi zgłoszenia (status, notatka) w Polityce §2 | jw. |
| **B5** | Warunki founding members w Regulaminie §6 — dziś `[DO UZUPEŁNIENIA]`, a to zobowiązanie wobec konsumenta | przed pierwszym zaproszeniem |

**B3–B5 to dokumenty publikowane.** Agent ich nie tyka bez decyzji — przygotuje brzmienia,
zatwierdza właściciel (docelowo prawnik, bloker N4).

### Ścieżka C — identyfikacja. Reszta pakietu Claude Design

Znak (kierunek C) i komplet ikon wdrożone 21.08. Zostaje z handoffu:

| # | Co | Kto |
|---|---|---|
| **C1** | **Z-5** — hero (1440 × 560) i pas CTA (1440 × 280) jako **żywe sekcje HTML** w `LandingPage.jsx`, namespace `.wp4`, nie obrazki | agent |
| **C2** | Eksport banerów social — 13 formatów (IG post/story, FB cover/post, LinkedIn cover/post, „nowa funkcja", Google Ads ×3, OG danymi) | agent |
| **C3** | Podmiana placeholderów w wizytówce i sygnaturze e-mail na prawdziwe dane | właściciel podaje dane, agent składa |

### Ścieżka D — weryfikacja i dług

| # | Co | Uwaga |
|---|---|---|
| **D1** | **Przejście listy kontrolnej panelu** ([[Panel-administratora]] krok 9) | wciąż nieodhaczone; szczególnie sprawdzenie, czy w dzienniku pojawiają się wpisy |
| **D2** | **Przegląd dostępności panelu administratora** | agent `designer` przerwany limitem sesji; otwarte: kontrasty klas `.wpa-*`, obsługa klawiaturą wierszy tabeli kont, dostępne nazwy ikon |
| **D3** | **Przegląd commita `6942496`** (X20–X23 z równoległej sesji) | praca nieprzejrzana przeze mnie; wydzielona osobno, żeby dała się wycofać |
| **D4** | `invoice.payment_action_required` — 3D Secure przy odnowieniu | dziś degraduje się do `payment_failed` po kilku dniach zamiast od razu informować klienta |
| **D5** | **Node 20 → 22** | twarda data: **30.10.2026** wyłączenie środowiska, po niej nie da się wdrożyć funkcji |
| **D6** | Decyzja o App Check na logowaniu ([[Known-Issues]] #17) | wymuszanie chroni przed botami, ale czyni z reCAPTCHA pojedynczy punkt awarii wejścia do produktu |

### Ścieżka E — zlecenia właściciela z 23.08. Wchodzą do tygodnia od 24.08

> Pięć pozycji dorzuconych w trakcie tygodnia. E1 ma termin zewnętrzny (odpowiedź czeka
> na nas, nie my na nią), E3 jest gotowe do wdrożenia, reszta wymaga najpierw ustaleń.

| # | Co | Kto | Zależność / uwaga |
|---|---|---|---|
| **E1** | **Odpowiedź supportu Firebase — obsłużyć** | oboje | ⚠️ **najpilniejsze w ścieżce:** właściciel przekazuje treść odpowiedzi, agent czyta i proponuje działanie |
| **E2** | **Raport zasadności założenia JDG dla domków letniskowych** — liczony na danych z konta właściciela w aplikacji | agent, dane od właściciela | wymaga UID i zgody na odczyt danych finansowych konta (poziom 2/3 wg `docs/support/Proces-obslugi-zgloszen.md`). Podkładka metodyczna: [[strategy/Rentownosc-symulacja-2026-08-22]]. **Nie jest to porada podatkowa** — wynik do potwierdzenia u księgowego |
| **E3** | **Nowa zakładka w panelu: Zadania + eksport** | `dev` + `designer` | design gotowy (`design_handoff_identyfikacja_v2`), czeka **wyłącznie na wdrożenie**. Do ustalenia przed startem: format eksportu (CSV/PDF/iCal) i zakres zadania |
| **E4** | **System popupowych patch notów** — komunikat „co nowego" po wdrożeniu zmian | `dev` + `designer` | do zaprojektowania od zera: źródło treści (plik w repo vs Firestore), wersjonowanie „widziane/niewidziane" per konto, żeby nie wyskakiwało dwa razy |
| **E5** | **Firmowe sociale — zagospodarowanie i prowadzenie** | `marketing` | cel: **więcej testerów bety i więcej feedbacku**. Zależność: **po C2** (eksport banerów social). Do decyzji właściciela: które kanały i kto publikuje — agent przygotowuje, publikuje właściciel |

**Otwarte pytania (blokują start E2, E3 i E5):**
1. **E2** — czy dane liczymy z konta produkcyjnego właściciela, i za jaki okres?
2. **E3** — co dokładnie eksportujemy z zakładki Zadania i do jakiego formatu?
3. **E5** — które kanały (IG / FB / LinkedIn / TikTok) i kto naciska „publikuj"?

### Gdyby tydzień miał wystarczyć tylko na jedno

**Ścieżka A.** Reszta to porządek i dług; A to jedyna ścieżka, po której płyną pieniądze —
a dziś, mimo poprawnego kodu, konto nie jest gotowe ich przyjąć.

Wyjątek: **E1** wypada zrobić obok A, bo to jedyna pozycja z terminem po stronie kogoś
innego niż my — wątek supportu Firebase można przegapić.

---

## 🔴 NOW — blokery launchu

### N1. Przywrócenie weryfikacji e-mail
**Po co:** bypass wprowadzony dla testów V4 (commit `b4aeb4e`) pozwala wejść do panelu bez potwierdzenia adresu — otwarta furtka na fałszywe konta.
**Gotowe, gdy:** rejestracja e-mail wymaga weryfikacji przed dostępem do panelu; TODO z `b4aeb4e` usunięte.
**Weryfikacja:** e2e auth na emulatorach + test ręczny pełnego przepływu rejestracji.
**Agent:** `dev`, przegląd `code-reviewer`. **Status:** 🔄 (2026-07-04)
- ✅ **Kod przywrócony**: guard w `App.jsx` (ProtectedRoute), `WynajemContext.jsx` (onAuthStateChanged → signOut), `LoginPanel.jsx` (blokada logowania niezweryfikowanego); wszystkie 3 TODO z `b4aeb4e` usunięte. Konta Google pomijają wymóg (adres zweryfikowany u dostawcy).
- ✅ **e2e auth 13/13** — w tym „login niezweryfikowanego pokazuje baner" i nowy „niezweryfikowany nie wejdzie na /dashboard". Przy okazji odtworzono całą suitę `auth.spec` (była 0/12 — patrz [[Design-Notes]]/X10: brakujące eksporty w mocku + stale selektory pod v2).
- ✅ **Test ręczny właściciela WYKONANY 2026-08-13** (smoke 4f): rejestracja na alias, wiadomość weryfikacyjna dotarła, **bez kliknięcia linku panel nie wpuszcza**, po kliknięciu wpuszcza. To domyka N1 w całości — był to ostatni element, którego nie dało się sprawdzić w środowisku agenta. Przy okazji potwierdzone, że zakładanie kont w ogóle działa (po tym samym dniu, w którym `ADMIN_ONLY_OPERATION` położyło logowanie anonimowe, nie było to oczywiste). ⚠️ Zgłoszony przy tej okazji wygląd maila i strony weryfikacji → [[Zlecenia-wlasciciela]] #10.
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
- ✅ **Forma działalności rozstrzygnięta 2026-08-17** (decyzja właściciela): start na **działalności nierejestrowanej**, JDG dopiero po przekroczeniu progu przychodu. Konsekwencje dla N4: placeholdery firmowe (nazwa, forma prawna, NIP, REGON, KRS) **zostają puste świadomie** — Operatorem jest osoba fizyczna; **nadal wymagane** imię i nazwisko, adres do korespondencji i e-mail (UŚUDE art. 5, RODO art. 13 — obowiązek niezależny od formy działalności), więc bramka publikacji dokumentów pozostaje zamknięta do czasu ich podania; PESEL nie trafia do dokumentów publicznych. Do pakietu dopisane cztery pytania: status konsumencki sprzedawcy w działalności nierejestrowanej, VAT/faktury i klienci z UE, próg i moment przejścia na JDG, klauzula przewidująca zmianę formy Operatora bez zmiany Regulaminu. Rozpisane: [[Projects/Instrukcje-wlasciciela]] sekcja 6.
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

### N6. Domknięcie braków z §9 „Bezpieczeństwo kont i danych" (2026-07-23)
**Po co:** §9 dokumentu `docs/legal/Bezpieczenstwo-kont-i-danych.md` to uczciwa lista braków przekazana prawnikowi; raport `docs/legal/Raport-dla-prawnika-2026-07-22.md` pyta wprost (4.1 pkt 5), które z nich blokują start sprzedaży. CLAUDE.md nazywa trzy z nich jako pozostające przed launchem — tutaj dostają pełny opis, właścicieli i weryfikację.
**Uwaga (żeby nie dublować):** blokery z oceny „dostępu po linku" (`Ocena-linki-guide-opinie.md`: maskowanie ID w GA, ostrzeżenie w GuideBuilderze, `X-Robots-Tag`, kaskada purge N5 C.1, opis mechanizmu i analityki w Polityce §4/§9 i DPA §2 ust. 5/§6) są już **WDROŻONE 2026-07-22** (patrz X9) — ta pozycja ich nie powiela.
**Gotowe, gdy:** pozycje (BLOKER) wdrożone i zweryfikowane; pozycje konsolowe potwierdzone przez właściciela ([[Zlecenia-wlasciciela]]); decyzje przeniesione do „Otwartych decyzji" i rozstrzygnięte.
**Weryfikacja:** per-pozycja niżej. **Agent:** `dev` + `legal` (brzmienia) + właściciel (konsola/decyzje). **Status:** ✅ **ZAMKNIĘTE W CAŁOŚCI 2026-08-18** — N6.1 i N6.2 wdrożone 2026-07-24 (ogon N6.1 domknięty 2026-08-13), N6.3 wykonane 2026-08-13, N6.4 domknięte 2026-08-18 (Storage wymuszany), N6.5 wykonane 2026-08-18 (15 plików usuniętych). **Jedynym otwartym blokerem launchu zostaje odpowiedź prawnika (N4).** Historia: N6.1 i N6.2 wdrożone (2026-07-24, ogon N6.1 domknięty 2026-08-13), N6.3 wykonane 2026-08-13; pierwotnie: **oba blokery (N6.1, N6.2) WDROŻONE na produkcję 2026-07-24** (commit `495aace`, `firebase deploy --only hosting:app`); N6.5 gotowy do uruchomienia przez właściciela; zostają dwie pozycje konsolowe (N6.3, N6.4).
- **N6.1 Wycofanie zgody na cookies (art. 7 ust. 3 RODO)** — ✅ **WDROŻONE 2026-07-24** (`495aace`; kod 2026-07-23, `dev`). Mechanizm: `src/firebase.js` — `disableAnalytics()` (`ga-disable-<ID>=true` + `setAnalyticsCollectionEnabled(false)` + kasowanie ciastek `_ga*`) / `enableAnalytics()`; `initAnalytics()` utwardzony — **nie tworzy GA bez zapisanej zgody** (domyka bonusową lukę: zdarzenia z `LoginPanel` leciały do GA przed zgodą). Wejścia „równie łatwo": link „Ustawienia cookies" w stopce landingu + przycisk „Zmień/wycofaj zgodę" na stronie Polityki → otwierają globalny `ConsentNotice` (zdarzenie `wpc:open`, bez przeładowania), z linią statusu i symetrycznym accept/withdraw. Weryfikacja: lint 0, build OK, nowy `e2e/cookie-consent.spec.js` 3/3, podgląd wizualny (flaga `ga-disable-*` przełącza się). **Brzmienie domknięte przez `legal` (2026-07-24):** 4/5 tekstów OK; treść banera skorygowana (usunięto nadmiarowe „dostosowywać komunikaty" — aplikacja nie personalizuje, po zgodzie działa tylko GA; poprawił `dev`, e2e 3/3). **Weryfikacja na produkcji (2026-07-24, `wynajempro.com`):** pełny przepływ przeklikany na żywo — akceptacja → `cookie_consent='true'`, `ga-disable-G-BZ0SJC201Z=false`, ciastka `_ga` utworzone; ponowne otwarcie z linku w stopce → baner z adaptacyjnym „Wycofaj zgodę" i statusem „zgoda… udzielona"; wycofanie → flaga skasowana, `ga-disable=true`, **ciastka `_ga*` usunięte**. Oba wejścia (stopka + Polityka) potwierdzone live. ✅ **Dokumenty zaktualizowane po deployu (`legal`, 2026-07-24):** §9 dokumentu bezpieczeństwa rozdzielone — tabela braków zawiera tylko pozycje OTWARTE, domknięte przeniesione do nowej **§9.1** (z datami i dowodami); z Polityki zdjęte „oczekuje na deploy"; **errata E1–E5 w `Raport-dla-prawnika-2026-07-22.md`** (pakiet był już u prawnika — pierwotne zdania zachowane jako cytat z datą, nie przepisane); pozycja „Wycofanie zgody cookie" zamknięta w `Checklista-zgodnosci.md`.
  ⚠️ **Luka wykryta przy tym przeglądzie i naprawiona (2026-07-24, kod — NIE na produkcji):** baner renderuje się globalnie (`App.jsx:162`), więc gość na `/guide/:id` i `/opinie/:id` mógł zgodę **wyrazić**, ale te strony nie miały żadnego wejścia do jej wycofania (brak linku do `/prywatnosc`) — realna luka „równej łatwości" dla gości, czyli akurat tej grupy, wobec której Operator jest administratorem danych analitycznych. Naprawa: dyskretne „Ustawienia cookies" przy kredycie „Stworzono za pomocą WynajemPRO" (`GuestGuideView.jsx`, `ReviewPageView.jsx`, `.wpb-meta__btn` w `brand.jsx`), ten sam mechanizm `wpc:open`. Weryfikacja: lint 0, build OK, e2e 51/51 (2 nowe testy stron gościa). ✅ **WDROŻONE 2026-08-10** (`0660c1e`, `hosting:app`) — „Ustawienia cookies" i mechanizm `wpc:open` potwierdzone w serwowanym chunku `GuestGuideView`. Luka „równej łatwości" u gości zamknięta.
  ✅ **Reszta luki domknięta w kodzie 2026-08-13** (`f442c42`, `dev`): ekrany błędu obu widoków („Brak dostępu" / „Nie znaleziono strony") dostały przycisk „Ustawienia cookies" pod panelem — sam, bez kredytu (na ekranie „nie znaleziono" nie ma czego kredytować). Ten sam mechanizm `wpc:open`. Weryfikacja: `cookie-consent.spec.js` 7/7 (2 nowe testy wchodzą w gałąź błędu przez pustą bazę w mocku), suita 130/130 (13.08), lint 0, build OK, oba ekrany przeklikane w przeglądarce (także 375px). ✅ **WDROŻONE 2026-08-13** (`hosting:app`) — oba ekrany potwierdzone na żywo na `wynajempro.com`: przycisk jest, kredytu nie ma, wycofanie zgody kasuje `cookie_consent` i zapala `ga-disable-*`. Luka „równej łatwości" zamknięta w całości. **Zostaje:** (2) *Wsad do N4 (prawnik):* podstawa cookies „art. 173 Pr. tel." nieaktualna → PKE art. 399/402 (od 2024-11-10) — dotyczy Polityki, Checklisty i Oceny-linki; `legal` oznaczył w dokumentach. (3) *Opcjonalnie (`designer`):* wizualna równowaga przycisków banera (primary „Akceptuję" vs ghost „Wycofaj") pod kątem „równej łatwości" — do decyzji.
- **N6.2 Ostrzeżenie przy usuwaniu konta — pełny zakres kasacji** — ✅ **WDROŻONE 2026-07-24** (`495aace`; kod 2026-07-23, `dev`). Stan wyjściowy: `AccountModal.jsx:182` obiecywał mniej („konto, subskrypcja, nieruchomości, historia rezerwacji") niż realnie kasuje `deleteUserAccount`. Komunikat przepisany na pełny zakres (przewodniki + sekrety WiFi/PIN + podpisy akceptacji, pliki, dane biznesowe, rekord klienta Stripe, profil, konto logowania) + „nieodwracalne, bez karencji" — wprost z §8. Weryfikacja: lint 0, build OK, e2e 49/49; grep e2e — brak asercji na tym copy. ✅ Wiersz w §9 zaktualizowany przez `legal` (2026-07-24) — przeniesiony do §9.1 z jawnym zastrzeżeniem sposobu weryfikacji. **Zostaje:** smoke właściciela (Konto → Strefa zagrożenia: sprawdzić brzmienie na żywo — komunikat jest za logowaniem, więc niedostępny dla weryfikacji agenta).
- **N6.3 Kopie zapasowe Firestore** — ✅ **WYKONANE 2026-08-13** (agent, na zlecenie właściciela; firebase CLI, bez konsoli). Stan przed: PITR wyłączone, harmonogramów **zero**, retencja wersji **3600 s**. Włączone: **PITR** (`firestore:databases:update --point-in-time-recovery ENABLED`) oraz **dzienny harmonogram kopii z retencją 7 dni** (`firestore:backups:schedules:create --recurrence DAILY --retention 7d`). Weryfikacja odczytem po zmianie: `POINT_IN_TIME_RECOVERY_ENABLED`, `Version Retention Period 604800s`, harmonogram `6f37fdce-77bc-4bbc-83a1-579b5cf6cdaf` DAILY/604800s. ⚠️ Obejmuje **Firestore, nie Storage**. Dokumenty: §9 → §9.1 w `Bezpieczenstwo-kont-i-danych.md`, errata **E8** w raporcie dla prawnika. → [[Zlecenia-wlasciciela]] #8 pkt 2 odhaczone.
- **N6.4 Egzekwowanie App Check — ✅ POTWIERDZONE 2026-08-13** (zrzut z konsoli właściciela + weryfikacja na żywo). **Cloud Firestore: Enforced, 99% ruchu zweryfikowane** — i było tak od dawna; **Authentication: Enforced** (przywrócone tego wieczora, goście potwierdzeni na telefonie); Storage: Monitoring (100% zweryfikowane); Functions: niewymuszane. To odpowiedź na **pytanie prawnika 4.1 pkt 5**, wiszące od 22.07 — deklaracja o ochronie przed automatycznymi nadużyciami (Polityka, DPA §6) jest prawdziwa dla bazy i logowania. 🛑 Przy okazji **obalone [[Known-Issues]] #13**: 403 nigdy nie był awarią produkcji, tylko poprawnym odsiewaniem klientów bez tokenu (narzędzia agenta) — trzy dni pracy stały na tej fałszywej przesłance. ✅ **DOMKNIĘTE W CAŁOŚCI 2026-08-18**: **Storage → Enforced** (metryki przed zmianą: 100% zweryfikowanych, 0% niezweryfikowanych; właściciel potwierdził po włączeniu, że przewodniki gościa otwierają się z okładkami i plikami). **Functions: pozycja bezprzedmiotowa** — konsola nie ma dla nich przełącznika (pokazuje wyłącznie odnośnik do dokumentacji), bo wymuszanie ustawia się per funkcja w kodzie, a my mamy je przy wszystkich pięciu funkcjach callable (`enforceAppCheck: true`). Dwa wejścia HTTP obsługujące cudze serwery (`stripeWebhook`, `exportIcal`) pozostają otwarte z założenia i **nic globalnego im tego nie odbierze**. Stan końcowy: Firestore, Authentication i Storage wymuszane; funkcje chronione w kodzie.
- **N6.5 Jednorazowe czyszczenie osieroconych plików z przeszłości** — ✅ **WYKONANE 2026-08-18**: DRY-RUN wykazał **15 plików w 8 guideId (1520,5 KB)**, gwarda wieku pominęła 0, jeden obiekt z żywym rodzicem nietknięty. Przed kasowaniem dwie bramki ponad procedurę: (1) **kontrola odwołań** — przeszukanie wszystkich dokumentów bazy (18 dokumentów, kolekcje `artifacts`, `contact_messages`, `guides`, `users`) pod kątem ścieżek osieroconych plików, także w postaci zakodowanej z adresów pobierania → **zero trafień**, więc kasowanie nie osieroci żywego dokumentu (skrypt sam tego nie sprawdza — patrzy tylko na rodzica o tym samym `guideId`, więc nie wykryłby okładki skopiowanej między przewodnikami); (2) **kopia zapasowa 15/15 plików** na dysk właściciela przed operacją, bo Storage **nie jest** objęty PITR. Wynik `--fix`: **15 usuniętych, 0 błędów**; przebieg kontrolny po operacji: **0 sierot**. Historia: SKRYPT GOTOWY + ZRECENZOWANY (2026-07-23/24, `dev` + `code-reviewer` F2). `functions/cleanup-orphan-guide-files-n6.cjs` (wzorzec `audit-guides-n5.cjs`): listuje `guides/{id}/**` z paginacją, kasuje tylko pliki bez dokumentu-rodzica w Firestore. Bezpieczny z domyślnych ustawień: **domyślnie DRY-RUN** (kasowanie tylko po `--fix`), realny bucket `moje-domki-6c77d.firebasestorage.app`, gwarda wieku 30 dni, **nieznany wiek pliku ⇒ pominięcie** (fail-safe), DRY-RUN pokazuje, ile gwarda pominie. Przegląd F2: DRY-RUN bezpieczny, `--fix` bez blokerów logiki. Weryfikacja: `node --check` OK, eslint czysto. **Zostaje (właściciel):** przebieg DRY-RUN ze świeżym kluczem serwisowym → przegląd listy → `--fix`; po sprzątnięciu odhaczyć wiersz „Osierocone pliki z przeszłości" w §9 dokumentu bezpieczeństwa. Skrypt **zacommitowany 2026-07-24** (`495aace`) — nie jest Cloud Function, więc deploy go nie dotyczy; uruchamia się ręcznie. Sprzężone z Backlogiem „Osierocone pliki Storage przewodników" (mechanizm bieżący + porzucone szkice — osobny dług).

### Kolejność pracy w tygodniu 2026-08-11 → 08-17 (ustalona 2026-08-11)

Sekwencja, nie nowe decyzje — wszystkie pozycje żyją już wyżej albo w [[Known-Issues]].
Rozpisane klik po kliku: [[Projects/Instrukcje-wlasciciela]] (tam też podział na dni).

**Właściciel (od najpilniejszego):** ① prawnik N4 + dane rejestrowe do dokumentów →
② kopie zapasowe Firestore (N6.3) → ③ logi nocnego purge → ④ smoke testy, z **4b
(migracja `guests`→`adults`) jako najważniejszym** → ⑤ App Check: najpierw 403
([[Known-Issues]] #13), dopiero potem egzekwowanie (N6.4) → ⑥ N6.5 → ⑦ polityka haseł.

**Uzasadnienie kolejności:** prawnik idzie pierwszy, bo to jedyny bloker launchu **na cudzym
zegarze** (pakiet u niego od 22.07); kopie i logi purge przed resztą, bo dotyczą
**nieodwracalnej utraty danych** i kosztują po 5–10 minut; App Check spadł z pierwszego
miejsca nie przez mniejszą wagę, tylko dlatego, że przez 403 nie domyka się jednym
posiedzeniem.

**Tor `dev` równolegle:** ~~triage 52 zastanych awarii e2e~~ ✅ 12.08 (suita 128/128, dziś
130/130) · ~~domknięcie „reszty luki" N6.1 na ekranach błędu widoków gościa~~ ✅ 13.08
(`f442c42`, czeka na deploy) · ~~[[Known-Issues]] #15 (nieświeża powłoka po deployu)~~ ✅ 13.08
(`79b95c7` — decyzja właściciela: pasek „dostępna nowa wersja" zamiast automatu; **wdrożone** 13.08).
**Tor `dev` na ten tydzień domknięty i wdrożony.** ⚠️ Przy weryfikacji deployu wyszła nowa pozycja 🔴: [[Known-Issues]] #16 — strony gościa nie działają na produkcji (logowanie anonimowe odbijane); wymaga konsoli właściciela.

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

### X19. Własna wysyłka e-maili transakcyjnych (wymuszona blokadą Google, 2026-08-18)
**Po co:** Google odmawia temu projektowi zmiany szablonów e-mail (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED` — [[Activity-Log]] 2026-08-18), więc link weryfikacyjny prowadzi na `moje-domki-6c77d.firebaseapp.com` i domyślną, angielską stronę Google. Nasza markowa strona `/auth/action` działa od 1 lipca i nigdy się nie pokazuje. To problem **zaufania przy pierwszym kontakcie** klienta z produktem, nie estetyki.
**Mechanizm (obejście blokady, nie walka z nią):** Cloud Function generuje `oobCode` przez Admin SDK (`generateEmailVerificationLink` / `generatePasswordResetLink`), wyciąga z niego sam kod i wysyła **nasz** e-mail z linkiem `https://wynajempro.com/auth/action?mode=…&oobCode=…`. Szablony Google przestają być używane, więc ograniczenie przestaje nas dotyczyć.
**Gotowe, gdy:** rejestracja i reset hasła wysyłają wiadomość w identyfikacji WynajemPRO, z linkiem na domenę kanoniczną, a klient ląduje na naszej stronie; stare linki Google nadal działają (nic nie unieważniamy).
**Weryfikacja:** rejestracja na świeży alias → wiadomość dociera (nie do spamu) → link otwiera naszą stronę → konto potwierdzone. Do tego kontrola SPF/DKIM/DMARC dla `wynajempro.com`.
**Koszt i zależności — świadomie wymienione, bo to nie jest poprawka na godzinę:** dostawca poczty (decyzja właściciela), konfiguracja SPF/DKIM na domenie, obsługa błędów wysyłki, a przede wszystkim **nowy podprocesor → aktualizacja Polityki prywatności i DPA** (`legal`) przed uruchomieniem.
**Sprzężenia:** wchłania pozycję „Powiadomienia e-mail" z [[Projects/Backlog]] i daje infrastrukturę pod „automatyczne wiadomości do gości".
**Agent:** `dev` + `legal` (podprocesor) + `marketing` (treść wiadomości). **Status:** ⬜ — **po launchu**, chyba że wsparcie Firebase odmówi zdjęcia blokady, wtedy do przemyślenia wcześniej. Zgłoszenie do Google: `docs/support/Zgloszenie-Firebase-szablony-2026-08-18.md`.

### X11. Plan marketingowy launchu
**Gotowe, gdy:** ICP potwierdzony z właścicielem, komunikacja wartości, wybór 1–2 kanałów na start z metrykami testu. **Agent:** `marketing` + `strategist`. **Status:** ✅ **PLAN GOTOWY 2026-08-18** — `docs/strategy/X11-Plan-marketingowy-launchu.md`
- ✅ **Research konkurencji ze źródłami** (luka świadomie zostawiona w [[strategy/Plan-wdrożenia-na-rynek]] §6): pięć kategorii z cenami i datą odczytu. Kluczowe ustalenia: channel managery liczą **za obiekt** (Smoobu 26,10 €/mc + 0,9% prowizji albo 31,50 €/mc — przy dwóch domkach 220–270 zł/mc); **MójWynajem 26–29 zł/mc** to nasz najbliższy konkurent cenowo, ale mówi językiem umów najmu, nie pobytów; polskie systemy dla apartamentów nie mają przewodnika gościa i sprzedają się przez kontakt, nie cennik; realnym konkurentem numer jeden zostaje **Excel**.
- ✅ **ICP potwierdzone**: właściciel jest instancją własnego ICP-A (Domki Letniskowe Ruś, obsługa gości samodzielnie, Booking/Airbnb/Facebook, ryczałt). ICP-B (najem długoterminowy) świadomie poza celowaniem — tam stoi MójWynajem na swoim terenie.
- ✅ **Klin pozycjonujący**: płacisz **za konto, nie za obiekt**; przewodnik gościa z danymi dostępowymi **po akceptacji regulaminu** (ochrona prawna gospodarza, nie wygoda); polskie realia rozliczeniowe w produkcie dla najmu krótkoterminowego. Wraz z listą rzeczy, których **nie wolno obiecywać** (nie jesteśmy channel managerem, nie zastępujemy księgowego).
- ✅ **Kanały wybrane pod realne ramy właściciela** (5–10 h/tydz., do 500 zł/mc, **brak własnej sieci gospodarzy**, zgoda na case study z Rusi): K1 społeczności wynajmujących (start natychmiast, bo cichy start trzeba **zrekrutować**, a nie zaprosić), K2 Google Ads na intencję long-tail (po launchu, z twardym warunkiem wstępnym), K3 SEO jako fundament. Świadomie odrzucone: płatny Facebook, LinkedIn, program partnerski dla księgowych.
- 🔴 **BLOKER dla reklamy, wykryty przy pisaniu planu**: w kodzie mierzymy wyłącznie `login`, `sign_up` i `page_view` — **nie mierzymy aktywacji**. Bez zdarzeń `first_property_added`, `first_booking_added`, `first_guide_published`, `checkout_started`/`subscription_active` oraz `utm_source` przy rejestracji reklama kupuje rejestracje-widma. Zadanie dla `dev`, sprzężone z X10.
- ✅ **Decyzje właściciela 2026-08-18 po przeglądzie jego planu bety** (chciał 20 stale użytkujących i dostęp za feedback): **bramka wyjścia z bety = 5–10 gospodarzy z pełnym cyklem** (rejestracja → obiekt → rezerwacja → przewodnik), a 20 stale użytkujących zostaje **celem pierwszego etapu po launchu**; **model dostępu = founding members z ceną podaną z góry** zamiast bezterminowo za darmo. Uzasadnienie drugiej decyzji: darmowy dostęp mierzy użycie, ale **nie mierzy gotowości do zapłaty** — 20 zadowolonych darmowych użytkowników to zero dowodu, że ktoś zapłaci 29,99 zł.
- 🔴 **Blokery zaproszeń do bety** (wykryte przy tej analizie, oba przed pierwszym zaproszeniem): (1) **nadanie i przedłużenie dostępu bety jest dziś operacją ręczną z kluczem serwisowym** — reguły słusznie zabraniają klientowi zmiany `status` i `trialEndsAt`, więc dla 20 testerów to 20 operacji z Admin SDK na produkcji; potrzebny skrypt albo pole obsługiwane funkcją (`dev`). 🔄 **Bloker (1) rozwiązany w kodzie 2026-08-19, czeka na wdrożenie**: panel administratora `/admin` ma przyciski przedłużenia trialu i nadania dostępu bety, które ustawiają dokument i claim naraz, z wpisem do dziennika — zaproszenie testera przestaje wymagać klucza serwisowego. ⚠️ Domknięte dopiero po deployu funkcji i reguł (decyzja właściciela) — patrz [[Activity-Log]] 2026-08-19 i [[Panel-administratora]]. Bloker (2) bez zmian; (2) **warunki oferty founding members** — wysokość rabatu, czas obowiązywania, koniec naboru — dziś `[DO UZUPEŁNIENIA]` w Regulaminie §6, a to zobowiązanie wobec konsumenta.
- ⚠️ **Pułapka retencji do zakomunikowania testerom**: po upływie `trialEndsAt` konto wchodzi w ścieżkę „porzucone triale" nocnego purge i po **90 dniach** (`TRIAL_RETENTION_DAYS`) dane są kasowane bezpowrotnie.

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

### X17. Rozbicie liczby gości: dorośli · dzieci · zwierzęta (właściciel, 2026-07-24)
**Po co:** realny przypadek właściciela — rodzina 2+2 z psem; dotąd dało się wpisać tylko łączne „4". Rozszerzenie X14.
**Model (decyzja):** trzy nowe **opcjonalne** pola liczbowe `adults`/`children`/`pets`; **`guests` ZOSTAJE** jako pole wyliczane = dorośli + dzieci (zgodność wstecz ze starymi rezerwacjami). **Zwierzęta nie są osobami** i do sumy nie wchodzą. Jedno źródło prawdy sumy: `src/utils/guestCount.js` — używane i przez podgląd w formularzu, i przez zapis, więc nie mogą się rozjechać.
**Agent:** `dev` → `code-reviewer` (zmiana reguł) → `support` (baza wiedzy) → `legal` (kategoria danych). **Status:** ✅ WDROŻONE 2026-08-10 (`42472af`; reguły → `hosting:app`, pola „Dorośli/Dzieci/Zwierzęta" potwierdzone w bundlu produkcyjnym)
- ✅ **Zmiana schematu przeprowadzona kompletnie:** `firestore.rules` (`isValidRental`) **i lustrzany tester** `functions/validate-schema-n3.cjs` rozszerzone zgodnie co do znaku (audyt potwierdził parytet: allowlisty 29 = 29 pól, listy liczbowe identyczne). To pułapka, na której ta zmiana najłatwiej mogła polec — X14 ostrzegał wprost.
- ✅ **Pułapka utraty danych obsłużona:** stare rezerwacje mają samo `guests` bez rozbicia; ponieważ `guests` jest teraz wyliczane, zapis takiego wpisu wyzerowałby liczbę osób. `openEditModal` migruje `guests` → `adults` przy wczytaniu. Pokryte testem e2e (asercja na formularz **i** na dokument po zapisie).
- ✅ **Sentinel `deleteField()`**: przy `create` puste pola pomijane, sentinel wyłącznie przy `update` — konwencja z N3 zachowana (to był bloker produktowy naprawiony przy N3).
- ✅ **Przegląd `code-reviewer`**: diff bezpieczny do commita, reguły bezpieczne do deployu (zmiana wyłącznie addytywna — żaden dokument przechodzący dotąd walidację nie może oblać). ⚠️ **Kolejność deployu: `firestore:rules` PRZED hostingiem** — nowe reguły są nadzbiorem starych, ale nowy front pod starymi regułami wysypuje każdy zapis rezerwacji (`permission-denied`).
- ✅ **Baza wiedzy odświeżona** (`support`): 3 artykuły + nowe FAQ „Gdzie zniknęło pole »Liczba gości«?" i „Czy pies wlicza się do liczby osób?". Treść generowana (`npm run help:build`). **Ustalenie sprzed briefu:** rezerwacje z iCal nie mają ŻADNEJ liczby osób (nie „samej liczby") — `functions/index.js` nie zapisuje tych pól; artykuły opisują stan zweryfikowany w kodzie.
- ✅ **Warstwa RODO** (`legal`): nowa kategoria danych (skład osobowy pobytu) dopisana do Polityki §4, DPA §3 i erraty E6 pakietu dla prawnika. Ekspozycja **bez zmian** — pola wyłącznie za `isOwnerAndVerified` + subskrypcja, brak ścieżki publicznego odczytu (potwierdzone: nie wyciekają do przewodnika gościa, strony opinii, eksportu iCal ani analityki). Rozstrzygnięcie: dopisane do kategorii DANYCH, nie do kategorii OSÓB (z samej liczby dziecka nie da się nikogo zidentyfikować) — rekomendacja robocza do potwierdzenia przez prawnika.
- Weryfikacja: lint 0, build OK, reguły `--dry-run` skompilowane, e2e 39/39.
- ✅ **Deploy wykonany 2026-08-10** (reguły → hosting, kolejność zachowana). Odkrycie przy wdrożeniu: `firestore.rules` były **już wydane** na produkcji i identyczne z repo (CLI: „already up to date, skipping upload") — wdrożony był sam backend, front nigdy za nim nie poszedł. To bezpieczna strona rozjazdu (reguły = nadzbiór), ale przez 16 dni panel nie miał pól rozbicia, mimo że reguły je przyjmowały.
- ⏸ **Zostaje:** smoke właściciela (dodanie rezerwacji z rozbiciem + edycja starej rezerwacji, żeby potwierdzić migrację `guests`→`adults`) + opcjonalnie `validate-schema-n3.cjs` na produkcji ze świeżym kluczem. Drobne z audytu → [[Projects/Backlog]].

### X18. Raport rentowności do druku i PDF — przebudowa (właściciel, 2026-08-13)
**Po co:** zgłoszone przy smoke 4e — raport **generuje się**, ale wygląda źle i nie nadaje się do wysłania księgowemu ani do teczki. To dokument, który gospodarz pokazuje na zewnątrz, więc jego wygląd jest częścią produktu, nie kosmetyką.
**Zaobserwowane na pliku z produkcji** (3 strony, A4 595×842 pt — sam rozmiar strony poprawny):
1. 🔴 **Pierwsza strona wychodzi pusta** — treść zaczyna się dopiero na drugiej. Podejrzenie: technika druku opiera się na `body * { visibility:hidden }` plus `.wpd-report-print{ position:absolute; top:0 }` (`styles.js`, blok `@media print`). Elementy ukryte przez `visibility` **nadal zajmują miejsce w układzie**, więc wysoka niewidzialna powłoka panelu spycha treść na kolejną stronę. Do potwierdzenia pomiarem.
2. 🟡 **Tytuł dokumentu to tytuł strony aplikacji** — „WynajemPRO - Prosty system do zarządzania najmem krótkoterminowym". Ten ciąg trafia do metadanych PDF **i do domyślnej nazwy pliku**, więc księgowy dostaje plik o nazwie hasła reklamowego zamiast „Raport rentowności — sierpień 2026". Tanie do naprawienia: podmiana `document.title` na czas drukowania i przywrócenie po.
3. 🟡 **Trzy strony na raport**, który mieści się na jednej–dwóch — do sprawdzenia po naprawie punktu 1.
**Gotowe, gdy:** raport otwiera się od pierwszej strony, ma sensowną nazwę pliku i tytuł, mieści się w rozsądnej liczbie stron, a układ A4 nie łamie tabel w połowie wiersza. Wydruk wygląda jak dokument firmowy w identyfikacji v2, nie jak zrzut ekranu panelu.
**Weryfikacja:** wygenerowany PDF obejrzany stronami (nie sam fakt, że plik powstał — dziś powstawał i był zły) + kontrola na dwóch długościach danych: jeden obiekt i kilka obiektów z pełnym rokiem.
⏸ **Rekomendacja `designer` w sprawie osobnego widoku wydruku (2026-08-19): NIE TERAZ, do „Later".** Koszt ok. dnia roboczego (wyjęcie ~330 linii JSX do wspólnego komponentu, trasa z bramką logowania, przeniesienie przełącznika rejestru do URL, przepisanie 5 testów druku), a mierzalny efekt (5→3 kartki) osiągnięto bez ruszania routingu. Wartość pojawi się dopiero, gdy raport ma dostać **inny margines lub format papieru niż wydruk umowy** — dziś dzielą jedną regułę `@page{ size:A4; margin:14mm }`. ⚖️ Czego **żadna** z dróg nie załatwi: numeracji „strona X z Y" — Chrome ignoruje pola `@page`, potrzebna byłaby paginacja w JS. **Do decyzji właściciela zostają też**: szerszy grzbiet 18 mm do segregatora (blokuje współdzielone `@page`), „(cd.)" przy tabeli przeniesionej na kolejną stronę (wymaga JSX, nie CSS), zejście do 2 kartek (wymagałoby cięcia treści zaakceptowanej w partiach A i B).
**Pierwotne pytanie:** czy zamiast drukowania widoku modalu nie zrobić **osobnego widoku wydruku** (dedykowana trasa albo kontener renderowany tylko do druku) — technika „ukryj wszystko oprócz jednego elementu" jest źródłem punktu 1 i wraca przy każdej zmianie panelu.
**Agent:** `designer` (układ dokumentu, typografia, identyfikacja) → `dev` (wdrożenie, `ProfitabilityReportModal.jsx` + blok `@media print` w `styles.js`).
**Status:** 🔄 **mechanika naprawiona naprawdę dopiero 2026-08-18.** ⚠️ Wydanie z 17.08 **pogorszyło druk** — raport wychodził w całości pusty, bo poprawka z 13.08 usunęła regułę `visibility:visible`, którą neutralizowany był **drugi, niezakresowany blok `@media print`** (generator umów) stojący niżej w tym samym arkuszu. Naprawione 18.08 dwuwarstwowo: blok umów zakresowany przez `:has(.wpd-ctr-sheet)`, w bloku raportu przywrócone `visibility:visible`. Powstał **test regresji na prawdziwym panelu** (`e2e/report-print.spec.js`, `emulateMedia('print')` + pomiar realnych elementów), sprawdzony w obie strony — bez poprawki oblewa z `visibility: hidden`. Historia: mechanika naprawiona 2026-08-13, WDROŻONA 2026-08-17 (`hosting:app`, 4 nowe pliki; chunk `ManagerApp-Cifm6yoG.js` zawiera `afterprint`, trasy 200, zero błędów modułów). ⏸ Czeka na **ponowny wydruk właściciela** — raport jest za logowaniem, więc to jedyny możliwy dowód końcowy. Właściwe X18 (typografia, gęstość tabel, osobny widok wydruku) nadal otwarte dla `designer`.
- ✅ **Puste strony — przyczyna zmierzona, nie zgadnięta.** Druk stał na dwóch technikach naraz: `visibility:hidden` na całym panelu (co **nie zwalnia miejsca w układzie** — niewidzialny sidebar dalej miał ~2400 px) oraz `position:absolute; top:0` na raporcie (co wiąże go z najbliższym **pozycjonowanym przodkiem** w drzewie panelu). Pierwsze dawało pusty ogon, drugie potrafiło przesunąć wydruk o całą stronę. Właściciel potwierdził objaw: **pusta strona 1, treść na 2 i 3**.
- ✅ **Naprawa**: wszystko poza raportem i jego przodkami znika przez `display:none` (czyli **wychodzi z układu**), raport wraca do normalnego przepływu — zero pozycjonowania, zero balastu. Jedna reguła z `:has()` zamiast trzech współpracujących sztuczek.
- ✅ **Zmierzone na próbie z prawdziwym blokiem `@media print`** (odtworzona struktura `#root > .wpd > powłoka + overlay`, z pozycjonowanym przodkiem jako podejrzanym): **3 strony → 1**, raport na stronie pierwszej, powłoka usunięta z układu, nagłówek wydruku widoczny.
- ✅ **Tytuł dokumentu**: `document.title` podmieniany na „Raport rentowności {rok} — {podmiot}" na czas drukowania i przywracany przez `afterprint` (odpala się także po anulowaniu okna). Dotąd do metadanych PDF **i do nazwy pliku** trafiało hasło ze strony.
- ✅ **PARTIA A — zawartość analityczna (2026-08-18)**: **klasyfikacja kosztów dwupoziomowa** (grupa → kategoria, z liczbą pozycji oraz udziałem w kosztach **i w przychodach**), **struktura przychodów wg źródła** (kwota, udział, liczba rezerwacji, średnia), **statystyki operacyjne** (liczba i wartości rezerwacji, średnia prowizja portali liczona wyłącznie od rezerwacji z prowizją, efektywna stawka podatku, koszty/przychody), **marża w każdym miesiącu** i linia wskaźników pod KPI. Zakres wzięty z raportu, który właściciel dostał z zewnątrz i uznał za wzorcowy — z zaznaczeniem, czego nasze dane nie odtworzą (drugi obszar działalności, numery dokumentów źródłowych).
- ✅ **PARTIA B — dokument dla księgowego (2026-08-18)**: **rejestr pozycji** (te same wiersze, które idą do CSV) z przełącznikiem „Rejestr w wydruku" — domyślnie **poza** wydrukiem, bo przy pełnym sezonie to kilkanaście stron; oraz sekcja **Metodyka i ograniczenia** z jawnym zdaniem, że przy nieewidencjonowanych kosztach (sprzątanie, materiały, amortyzacja) **wykazana marża jest wyższa niż rzeczywista**.
- 🛡️ **Obliczenia wyniesione do `src/utils/profitabilityReport.js`** — jeden moduł zamiast dwóch niezależnych przebiegów po tych samych danych (modal liczył agregaty u siebie, `reportExport.js` budował rejestr osobno). Rejestr w raporcie pochodzi teraz z tej samej funkcji co CSV, więc nie mogą się rozjechać. Istniejąca pętla agregująca przeniesiona **bez zmian merytorycznych** — świadomie, żeby liczby w dotychczasowych sekcjach nie drgnęły przy rozbudowie.
- ✅ **Weryfikacja**: lint 0, build OK, **e2e 140/140** (18.08; `report-print.spec.js` urósł do 4 testów — treść przekrojów, rejestr poza wydrukiem i po włączeniu, widoczność w druku, tytuł dokumentu). Liczby sprawdzone ręcznie na podglądzie: prowizje 378+220+315=913, koszty stałe 129×8 miesięcy=1032, suma 3316 przy przychodzie 7502 = 44,2%. **WDROŻONE 2026-08-18** (`hosting:app`).
- ✅ **PARTIA C — WYKONANA I WDROŻONA 2026-08-19** (`designer`): **pełny sezon 5 → 3 kartki A4, z rejestrem 13 → 7** (pomiar realnymi PDF-ami z Chromium, te same dane po obu stronach). Trzy znaleziska, których nie dało się zobaczyć na ekranie: (1) **na papierze włączał się breakpoint mobilny** (szerokość < 980 px), przez co cztery wskaźniki szły w siatkę 2×2 i zjadały pół pierwszej kartki; (2) **zielony i cynobrowy są w mono nierozróżnialne** (jasność 92,5 vs 101,4 na 255 — 3,5% różnicy), więc liczby w tabelach idą teraz `--ink`, a kolor został na kartach wskaźników, gdzie każda ma własny podpis; (3) **ciemne tło karty „Zysk netto" znikało** przy odznaczonej „Grafice w tle" w oknie druku, zabierając najważniejszą liczbę raportu — zamienione na ramkę. Efekt uboczny: wydruk z włączoną i wyłączoną grafiką tła jest **identyczny co do bajtu**. 🛑 **Czwarta pułapka w tym samym pliku**: reguła `.wpd{ background:#fff }` stała w `@media print` **bez zakresowania**, więc dotykała też wydruku generatora umów — zawężona do `body:has(.wpd-report-print)`. Ekran nietknięty (zrzuty 1440 i 390 px identyczne co do bajtu). Weryfikacja: lint 0, build OK, **e2e 141/141**. ⚠️ Przy tej okazji decyzja właściciela: **kontrast miesięcy bez ruchu podniesiony także na ekranie** (`opacity` 0.4 → 0.62; 0.4 dawało ok. 2,55:1, poniżej progu dostępności). Historia: partia C w toku od 2026-08-18, właściciel potwierdził wydruk partii A+B („wygląda git"): typografia i układ dokumentu, gęstość tabel, sensowna liczba stron przy pełnym roku i wielu obiektach, decyzja o osobnym widoku wydruku zamiast drukowania modalu. Robota dla `designer`. Raport ma teraz **więcej treści**, więc pytanie o układ zrobiło się pilniejsze, nie mniej pilne.
- ⏳ **Sprzężone z Backlogiem**: brak pola „numer dokumentu źródłowego" przy koszcie — w rejestrze to jedyna kolumna, której nie umiemy wypełnić.
- ⏸ **Weryfikacja końcowa należy do właściciela**: raport jest za logowaniem, więc dowodem jest jego ponowny wydruk po deployu.

### X20–X23. Pierwszy feedback testera (2026-08-21)

**Skąd:** tester przysłał cztery uwagi z panelu (`Obiekty.pages`, dwa zdjęcia ekranu). Pełna analiza
stanu sprzed zmiany — co robił kod i dlaczego tester zobaczył to, co zobaczył — w
[[Projects/Feedback-testera-2026-08-21]]. **Agent:** `dev`.
**Status:** ✅ **WDROŻONE 2026-08-21** — panel (`6942496` + `8d46d72`) i baza wiedzy (`22fd077`)
na `hosting:app`; lint 0, build OK, **e2e 181/181**, weryfikacja live przez przeglądarkę
(trasy 200, konsola czysta, nowy kod potwierdzony w bundlu produkcyjnym).
⏸ Zostaje potwierdzenie u testera i decyzja o domyślnym zestawie szablonów (⚖️ niżej).

- **X20. Zadanie po wyjeździe, a nie tylko przed przyjazdem** („czym są minus 2?").
  Termin zadania liczył się WYŁĄCZNIE od przyjazdu, a jedynym sposobem na cokolwiek po pobycie
  była **ujemna liczba w polu „Dni przed"** — która i tak odliczała od przyjazdu, więc prośba
  o opinię trafiała w środek pobytu gościa. Szablon dostał opcjonalne `anchor: 'arrival'|'departure'`
  (brak = przyjazd, więc **zapisane szablony działają bez migracji**), a formularz — listę „Kiedy"
  (przed/po × przyjazd/wyjazd), liczbę dni **bez znaku** i zdanie kontrolne „Zadanie pojawi się
  2 dni po wyjeździe gościa". Termin liczy jeden moduł `src/utils/taskSchedule.js` (pulpit, szczegóły
  rezerwacji, ustawienia) — lekcja z X17. Reguł **nie trzeba było ruszać**: `isValidSettings` wymaga
  od `reminders` tylko listy `items` (`firestore.rules:91`).
- **X21. „Do posprzątania" liczyło wyjazdy, nie sprzątania.** Jedna linijka (`cleaning:
  departures.length`) kontra lista zadań pod spodem: na zdjęciu testera kafel mówił **0**, a niżej
  wisiało „Zleć sprzątanie". Kafel liczy teraz **obiekty do posprzątania dziś** = wyjazdy + otwarte
  zadania sprzątania z tej samej listy, każdy obiekt **raz** (wyjazd i przyjazd tego samego dnia
  w tym samym domku to jedno sprzątanie). Kliknięcie prowadzi do raportu dziennego, nie do kalendarza,
  gdzie sprzątania nie widać.
- **X22. Rezerwacja prosto z kalendarza.** Klik w wolną noc = rezerwacja na tę noc, przeciągnięcie
  = cały zakres; formularz otwiera się z obiektem i obiema datami (wyjazd = dzień po ostatniej
  zaznaczonej nocy, zgodnie z tym, jak rysowane są paski). **Zajęte noce nie są klikalne i zaznaczenie
  się o nie obcina** — z kalendarza nie da się zrobić dubla. Ścieżka klawiaturowa: przycisk „+" przy
  nazwie obiektu (31 komórek × N obiektów jako przystanki tabulatora byłoby gorsze od choroby).
- **X23. Filtr obiektu w kalendarzu** — obejmuje także trzy metryki pod spodem, inaczej po zawężeniu
  do jednego domku „wolne noce" liczyłyby się z całego portfela.
- 🐛 **Znalezione przez test, nie przez oko:** przy „0 dni" obie strony kotwicy dają ten sam dzień,
  więc lista „Kiedy" wracała do „Przed…" i gubiła wybór gospodarza w trakcie ustawiania. Wybór
  trzymany jest lokalnie w formularzu, a `-0` nie trafia do bazy.
- ⚖️ **Decyzja produktowa do potwierdzenia:** domyślny zestaw szablonów dla **nowych** kont ma teraz
  sprzątanie **w dniu wyjazdu** (zamiast przyjazdu) i nowy szablon „Wyślij prośbę o opinię — 1 dzień
  po wyjeździe" (spina się z modułem Opinie, X13). Kont istniejących **nie ruszamy**. Cofnięcie:
  jedna linijka w `src/utils/constants.js`.
- Weryfikacja: 7 nowych testów e2e (`e2e/tasks-calendar.spec.js`), po jednym na uwagę + blokada dubla.

### X24–X28. Druga tura feedbacku testerów (2026-08-22)

**Skąd:** właściciel przyniósł `FEedback.pages` — trzy uwagi od trzech różnych osób (znajomy
UX designer, testerka od podatków, tester od iCal). **Agent:** główny Claude, tryb `/brainstorm`.
**Decyzja właściciela 2026-08-22 (X25):** nie wybieramy, na jakim typie gospodarza nam zależy —
moduł podatkowy dostanie **tryb prosty i tryb szczegółowy**, bo po to są testy, żeby zbierać
feedback od różnych pozycji biznesowych. Otwarte zostaje, **który tryb jest domyślny po rejestracji**.

- **X24. Landing: co to jest i po co, plus jedno nazewnictwo.** ✅ **ZROBIONE 2026-08-22**,
  szczegóły i uzasadnienia w [[Activity-Log]]. Lead w hero przepisany ze spisu modułów na
  „czym to jest / po co to jest"; nazewnictwo rozdzielone na role (**aplikacja** = produkt,
  **panel** = ekran w środku, **system** = tylko o konkurencji); `<title>` i `meta description`
  poprawione; „mikro-gospodarz" wycięty. Baner OG odbudowany i — co ważniejsze — dostał
  **źródło w repo** (`scripts/build-og-image.mjs`, `npm run og:build`), bo poprzedni eksport
  był jednorazowy i nie było czym go odtworzyć. Weryfikacja: lint 0, build OK, **e2e 181/181**,
  sprawdzone na żywo na 1280 i 375 px. ⚠️ **Niewdrożone** — czeka na X25 i X26, żeby nie
  wydawać landingu trzy razy w tygodniu.
- **X25. Moduł podatkowy: tryb prosty i szczegółowy.** ✅ **WDROŻONE 2026-08-25** (commit `b1bbf16`,
  e2e 200/200, weryfikacja live pozytywna i negatywna na chunkach produkcyjnych). Panel wrócił jako
  czwarta podzakładka Finansów. Po drodze: analiza prawna zablokowała makietę i wymusiła pole
  „Jak wynajmujesz" ([[Decisions]] ADR-018), kwotę wolną domyślnie 0 (ADR-019), usunięcie podatku
  liniowego i działalności nierejestrowanej (ADR-020) oraz podział odliczenia wg art. 11 ust. 3.
  Domknięte 2026-08-25 drugim wydaniem: współwłasność małżeńska w trzech stanach (ADR-021).
  ⏳ **Zostaje**: układ z projektu Claude Design zamiast widoku tymczasowego, mikrorachunek
  i tytuły przelewów, eksport CSV, VAT-UE od prowizji portali (czeka na Q8 do prawnika).
  **Skąd:** „Nie wystarczający panel do rozliczeń podatkowych. A kto by się rozliczał ryczałtem
  w tym biznesie? Masz tam jeszcze ZUS i wszystkie inne koszty, choćby import usług. No i VAT."
  🔥 **Zarzut jest w większości nieprawdziwy, i to jest gorsza wiadomość niż gdyby był prawdziwy.**
  `src/utils/taxCalculator.js` obsługuje ryczałt z progiem 100 000 zł (8,5% → 12,5%), skalę 12/32%
  z kwotą wolną, stawkę liniową, działalność nierejestrowaną, VAT 8%, ZUS społeczny i prowizje
  jako koszt. Testerka tego nie zobaczyła, bo **widok „Podatki" (`TaxSummaryPanel`) poszedł do
  `/_legacy` commitem `fb8a00e` i nie dostał zastępnika w panelu v2** — mówi o tym komentarz
  na górze samego `taxCalculator.js`. Liczby wychodzą dziś wyłącznie jako pozycja kosztowa
  w Analytics. To nie jest brak funkcji, to funkcja bez twarzy.
  ⚖️ **Czego naprawdę brakuje** (i tu testerka ma rację): **ZUS zdrowotny nie istnieje w kodzie**
  (jest tylko `zusSocial`, i tylko w trybie `general`) — przy ryczałcie jest ryczałtowy wg progów
  przychodu 60k/300k i potrafi przekroczyć sam podatek; **import usług** — prowizja Booking.com
  to odwrotne obciążenie, obowiązek VAT-UE i VAT-9M **nawet u niepłatnika VAT**, a kod traktuje
  ją wyłącznie jako koszt. **Gotowe, gdy:** jest widok podatkowy z trybem prostym i szczegółowym,
  zdrowotna liczy się dla ryczałtu, a prowizje portali unijnych są rozpoznawane jako import usług.
- **X26. iCal: obietnica przycięta do tego, co architektura dowozi.** ✅ **KOD GOTOWY 2026-08-22**,
  ⏸ **czeka na bramkę reguł i decyzję o deployu** — szczegóły i uzasadnienia w [[Activity-Log]].
  Zrobione: nowy silnik `functions/ical-sync.js` (klucz na `UID` zamiast dat, uzgadnianie zamiast
  dopisywania, znikłe **oznaczane, nie kasowane**), synchronizacja **co godzinę** przy koszcie
  **niższym niż przed zmianą** (dokument stanu na kanał), **wykrywanie kolizji** na pulpicie
  (`src/utils/bookingConflicts.js`), naprawiony adres eksportu (ID zamiast nazwy — zmiana nazwy
  obiektu zabijała feed w Booking.com), okno czasowe eksportu, `PRODID` bez „ChannelManager",
  obietnica przepisana w **sześciu** miejscach. Weryfikacja: **e2e 190/190**, **functions 33/33**,
  lint 0, build OK. ✅ Bramki reguł 2 i 3 zaliczone na produkcji (47 dokumentów przechodzi
  walidację; ruleset w konsoli identyczny z repo). 🛑 Autoprzegląd wyłapał dwa błędy tej zmiany
  — duplikowanie kanału po utracie dokumentu stanu i limit 500 operacji na batch — oba
  naprawione i pokryte testami (regresja sprawdzona w obie strony).
  ✅ **Przegląd `code-reviewer` wykonany 2026-08-22** — **trzy blokery** (dane `syncState` przeżywające
  usunięcie konta, masowe oznaczanie jako znikłe po awarii portalu → overbooking, patch odtwarzający
  zniekształconą rezerwację) plus kilkanaście uwag. Wszystkie blokery i większość ważnych naprawione,
  pokryte testami sprawdzonymi w obie strony. Weryfikacja po poprawkach: **e2e 189/189**, **functions 25/25**.
  ✅ **Drugi przegląd wykonany** — znalazł **bloker w poprawkach z pierwszej tury** (utrwalanie
  retrofitu mogło nadpisać listę obiektów wersją demo i unieważnić tokeny linków eksportu) oraz
  trzy usterki wprowadzone tymi poprawkami. Wszystkie naprawione i pokryte testami sprawdzonymi
  w obie strony. Po poprawkach: **e2e 190/190**, **functions 29/29**.
  ✅ **Trzeci przegląd wykonany** — znowu bloker wprowadzony przez poprawkę z poprzedniej tury
  (rezerwacja oznaczona `vanished` nie wracała do `active` po utracie stanu → sprzedany termin
  zwalniał się w portalach) plus dwa ważne: bezpiecznik liczący przebiegi zamiast czasu (trzy
  kliknięcia „Synchronizacja" zwijały go do kilkunastu sekund) i duplikat po przycięciu mapy.
  Wszystkie naprawione, testy sprawdzone w obie strony. Stan: **e2e 190/190**, **functions 31/31**.
  📌 **Trzy tury, w każdej bloker w poprawkach z poprzedniej — wszystkie dotyczyły trwałego stanu
  synchronizacji, nie logiki uzgadniania.** Przy takich zmianach planuj wiele tur z góry.
  ✅ **Czwarta tura wykonana** — znowu bloker w poprawce z poprzedniej: przycinanie zostawiało
  UID bez daty, więc zakończony pobyt dostawał fałszywe `vanished`, a dokument skasowany
  wcześniej przez gospodarza był wskrzeszany **bez pola `date`**, czyli łamiąc `isValidRental`.
  Rozwiązane nagrobkiem (`{ endDate, zamkniety }`); dwa nowe testy, oba sprawdzone w obie strony.
  Stan: **e2e 190/190**, **functions 33/33**.
  📌 **Cztery tury, w każdej bloker w poprawce z poprzedniej — ani jeden w logice uzgadniania,
  wszystkie w trwałym stanie synchronizacji.** Przy takim stanie każdy scenariusz jego
  uszkodzenia (przepadł / nieaktualny / przycięty / niepełny) wymaga własnego testu.
  ✅ **Weryfikacja na ŻYWYCH feedach (2026-08-24, konto właściciela)** — [[Activity-Log]]:
  potwierdzone `DTEND` wykluczające (wykrywanie kolizji liczy noce poprawnie), brak pola `STATUS`
  u Airbnb (zniknięcie z feedu to JEDYNY sygnał anulowania), skasowanie i założenie wpisu widoczne
  w feedzie w ciągu minut, pusty kalendarz Booking.com jako stan normalny.
  🔥 **`DTSTAMP` zmienia się przy każdym pobraniu** — suma kontrolna z surowego tekstu nigdy by się
  nie powtórzyła, więc poprawka z trzeciej tury recenzji okazała się **warunkiem działania**, a nie
  optymalizacją; bez niej rachunek kosztów z symulacji byłby nieprawdziwy.
  ⏳ **Jedyne otwarte założenie: stabilność `UID` przy MODYFIKACJI rezerwacji.** Nie da się sprawdzić
  bez ruszania rezerwacji prawdziwego gościa (Airbnb nie pozwala edytować blokad — trzeba kasować
  i zakładać na nowo, co testuje co innego). ⚖️ **Nie blokuje wdrożenia**: przy obu wynikach nowy
  silnik zachowuje się lepiej od starego, a wykrywanie anulowań nie zależy od tego założenia.
  Domknięcie: przy pierwszej naturalnej modyfikacji porównać `UID` ze stanem sprzed zmiany.
  🛡️ **Heurystyka „zniknęła + pojawiła się = ta sama" świadomie odrzucona** — nie do odróżnienia od
  „anulowanie + nowa rezerwacja na ten sam termin"; zamiast niej podpowiedź w alercie i w bazie wiedzy.
  ✅ **Piąta tura wykonana — łańcuch „naprawa psuje coś obok" urwany.** Zero nowych usterek
  w logice; recenzent stwierdził wprost, że **szóstej tury silnika nie potrzeba**. Poprawione
  dwa teksty: zdanie w alercie, które podawało otwarte założenie jako prawdopodobne i kazało
  kasować rezerwację, oraz pogrubienie renderujące się dosłownie na `/pomoc` (regresja poprawki
  z tury 3 — zamknięta teraz **całą klasą**: nowy test przechodzi po wszystkich artykułach
  i sprawdza `not.toContainText('**')`).
  ✅ **Stan końcowy: e2e 191/191, functions 33/33**, lint 0, build OK, reguły kompilują się.
  ✅ **WDROŻONE NA PRODUKCJĘ 2026-08-24** — commity `f988499` i `f4e4e0a`, gałąź `x26-ical-sync`.
  Trzy osobne wydania w kolejności reguły → functions → hosting (reguły muszą dopuszczać nowe
  pola, zanim silnik zacznie je zapisywać). 12 funkcji zaktualizowanych, `dailyICalSync`
  potwierdzony z nową konfiguracją. Weryfikacja live przez przeglądarkę: trasy 200, konsola
  bez błędów ładowania chunków, nowy kod potwierdzony **imiennie w chunkach produkcyjnych**.
  🛑 **Kontrola negatywna po deployu znalazła błąd, którego nie wyłapało pięć tur przeglądu**:
  artykuł „Rozwiązywanie problemów" nadal mówił o synchronizacji „raz na dobę" — poprawione
  i wydane ponownie. Lekcja z 21.08 potwierdziła się drugi raz.
  ⏸ **Zostaje**: krok 6 bramki reguł (smoke test uprawnień **klientem SDK**, wymaga zalogowanego
  właściciela — Admin SDK omija reguły i niczego nie dowodzi) oraz obserwacja stabilności `UID`
  przy pierwszej modyfikacji rezerwacji.
  ⏸ **Świadomie odłożone, wymaga osobnych pozycji**: kolizje niewidoczne dla rezerwacji na kolejny sezon
  (okno roku w `useFirebaseData`), `syncLinks` kluczowane nazwą obiektu (zmiana nazwy rozspaja kanał),
  `isSafeUrl` przepuszczające dziesiętny/szesnastkowy zapis IP (luka odziedziczona, nie regresja).
  ⚠️ Reguły i functions wdraża się **osobno** od hostingu.
  <!-- opis pierwotny zostaje poniżej — to on tłumaczy, po co ta praca powstała -->
  **Skąd:** „icall to proszenie sie o problemy i bledy z synchronizacja. Icall synchronizuje tylko
  dostepnosc i to co pare godzic, ale nic nie robi z cena. Wiadomosci tez pewnie nie ogarniesz."
  ⚖️ **Fakty testera są bezbłędne, wniosek („to nie jest żadne rozwiązanie") jest prawdziwy tylko
  wtedy, gdy sprzedajemy to jako channel managera.** I tu jest problem: `functions/index.js:1247`
  przedstawia nas światu jako `PRODID:-//WynajemPRO//ChannelManager//PL`, a `keywords` w `index.html`
  zawierają frazę „channel manager".
  🔴 **Poważniejsze od nazewnictwa:** FAQ na landingu (`LandingPage.jsx:661`) obiecuje, że rezerwacje
  z portali „automatycznie blokują terminy… **zapobiegając podwójnym rezerwacjom**", a `og:description`
  otwiera się od „Koniec z overbookingiem" — podczas gdy `dailyICalSync` (`functions/index.js:811`)
  chodzi **raz na dobę, o 6:00**. To jest codzienne 24-godzinne okno na overbooking przy obietnicy
  jego wyeliminowania, złożonej na piśmie, w produkcie płatnym. **Gotowe, gdy:** zapadła decyzja
  o częstotliwości synchronizacji, a copy w FAQ, `og:description` i `keywords` mówi to, co system
  faktycznie robi. **Blokowało deploy X24** — landing nie mógł jechać na produkcję z tą obietnicą
  w środku. ✅ Zdjęte 2026-08-22: obietnica poprawiona w sześciu miejscach, kod gotowy. Landing
  i tak czeka teraz na wspólne wydanie z regułami i functions, bo mówi o alarmie, którego bez
  wdrożenia silnika jeszcze nie ma.
  🔥 **Ograniczenie kosztowe ustalone 2026-08-22** ([[strategy/Rentownosc-symulacja-2026-08-22]]):
  oczywista naprawa („synchronizujmy co godzinę") przy dzisiejszym wzorcu odczytu — **osobne
  zapytanie do Firestore na każde zdarzenie w feedzie** — ścina darmowy zapas Firebase
  z ~104 kont do **~10**. Rozwiązanie: jeden **dokument stanu na kanał** (mapa `UID → daty`)
  czytany raz na przebieg i porównywany w pamięci. Wtedy synchronizacja co godzinę zużywa
  **444 odczyty/dobę/konto zamiast dzisiejszych 480**, czyli jest tańsza od stanu obecnego
  przy 24× większej częstotliwości. ⚠️ Tego skrótu nie wolno wziąć — kosztuje realne pieniądze.
- **X29. Blokady terminu nie są importowane.** ✅ **WDROŻONE I ZWERYFIKOWANE NA PRODUKCJI 2026-08-24**
  ([[Decisions]] ADR-017, commit `660f974`). Defekt ujawniony dopiero przez prawdziwe dane:
  blokady wchodziły jako `type:'booking'`, więc generowały zadania „wyślij kod do skrytki"
  dla terminów bez gościa. Pięć tur przeglądu kodu tego nie wychwyciło — nie da się tego
  zobaczyć w diffie. Weryfikacja na koncie właściciela: mapa stanu 6 → 2 identyfikatory,
  `znikle: 0`, zero wskrzeszonych dokumentów, suma kontrolna przeliczona bez blokad.
  ⚖️ Cena zapisana świadomie: nasz kalendarz pokazuje jako wolne terminy zablokowane w portalu.

- **X27. Przechwytywanie maili z portali (cena, prowizja, nazwisko gościa).** ⬜
  **Skąd:** iCal nie przenosi cen i nigdy nie będzie — Airbnb celowo wyciął z eksportu nazwisko
  i kod rezerwacji (grudzień 2019), cena nie była tam nigdy. Jedyna ścieżka do kwot bez umowy
  partnerskiej to maile, które portal i tak wysyła gospodarzowi. Gospodarz ustawia przekazywanie
  na `rezerwacje+{token}@wynajempro.com`, funkcja parsuje i uzupełnia rezerwację.
  ✅ **Koszt infrastruktury: 0 zł** (Cloudflare Email Routing) — potwierdzone w symulacji rentowności.
  ⚠️ **Bezpieczeństwo:** na adres przyjmujący pocztę może napisać każdy. Bez weryfikacji **SPF/DKIM
  oryginalnej wiadomości** dałoby się wstrzykiwać fałszywe rezerwacje do cudzego kalendarza.
  ⚖️ Ryzyko to czas, nie pieniądze: szablony maili się zmieniają, trzeba dwóch portali × dwóch
  języków, i czujki „od 14 dni nic nie przyszło z Bookinga". **Dodatek do iCal, nie zamiennik.**
- **X28. Decyzje ekonomiczne wynikające z symulacji.** ⏸ **czeka na właściciela**
  Pełny model: [[strategy/Rentownosc-symulacja-2026-08-22]]. Trzy rzeczy do rozstrzygnięcia:
  **(1) cennik** — 29,99 zł wymaga 246 płacących na 5 000 zł/mc na rękę, 49 zł wymaga 148;
  **(2) moment przejścia na JDG** — sufit nierejestrowanej to 43 200 zł/rok **niezależnie od ceny**,
  a ZUS preferencyjny pokrywa się już przy 33 kontach; **(3) Channex** — próg wyjścia na zero
  to 22 konta, warunek wyzwalający ustalony na **~40 płacących**.
  🔥 **Zaktualizowane 2026-08-22 po informacji właściciela o etacie.** Właściciel jest zatrudniony
  na UoP w innym miejscu — przy zbiegu tytułów JDG **nie rodzi składek społecznych**, zostaje sama
  zdrowotna (498,35 zł/mc do 60 tys. przychodu rocznie). Próg wyjścia na zero na JDG: **28 kont**.
  ⚠️ Rezygnacja z etatu unieważnia ten rachunek.
  **Plan właściciela:** rok 1 na możliwie niskiej cenie kosztem zarobku → maksymalna liczba
  klientów → potem nowe funkcje i podwyżka dająca klientowi realną wartość. Model to potwierdza:
  podwyżka 29,99 → 49 zł znosi utratę **38,8% klientów** bez spadku przychodu.
  ✅ **ROZSTRZYGNIĘTE 2026-08-22 — founding members** ([[Decisions]] ADR-016, Regulamin §6 ust. 5):
  cena startowa gwarantowana **12 miesięcy** (nie wieczyście), **od pierwszej płatności** danego
  klienta; kwalifikuje się **każdy, kto rozpocznie płatną Subskrypcję do dnia zakończenia naboru**;
  po okresie przejście na cenę bieżącą z **30-dniowym uprzedzeniem**. Odrzucono wieczyste zamrożenie
  (27 374 zł/rok przy 120 klientach) i stały rabat lojalnościowy (ok. 14 tys. zł/rok).
  🔴 **Komunikacja nie może nazywać tego rabatem** — nazwanie obniżką włącza obowiązek Omnibus
  (najniższa cena z 30 dni). Obowiązuje sformułowanie „cena startowa gwarantowana na 12 miesięcy".
  ⏳ **Została jedna liczba: data zakończenia naboru** — pochodna daty launchu, czyli N4 (prawnik).
  ⏸ **Do wdrożenia przed pierwszą sprzedażą:** znacznik founding membera i data pierwszej płatności
  w danych (inaczej po roku nie da się ustalić, komu wysłać uprzedzenie), oraz sprawdzenie, że Stripe
  utrzyma starą cenę istniejącym subskrypcjom przy zmianie cennika (osobny `Price` w tym samym `Product`).
  🔴 **Drugie:** sufit nierejestrowanej (120 kont) wypada **w trakcie roku 1**. JDG rejestrować
  z zapasem, przy ok. 100 kontach — przekroczenie limitu kwartalnego to problem zgodności.
- ⏸ **Zgłoszone przy okazji, decyzja właściciela:** `LoginPanel.jsx:557` obiecuje „Dołącz do
  gospodarzy, którzy zautomatyzowali pracę, podatki i odzyskali wolny czas" — istniejącą
  społeczność użytkowników, przed launchem.

---

**Kolejność pracy nad X14–X16 i X4 (ustalona 2026-07-15):** ① X16 (minuty, zdejmuje ryzyko prawne) → ② X14 (mała funkcja, ale zmiana schematu danych — porządnie z regułami) → ③ X4 partiami (największa wartość) → ④ X15 (kosmetyka, po przemeblowaniu kosztów w X4).

---

## 🟢 LATER — kierunkowo (szczegóły i pełna pula: [[Projects/Backlog]])

Powiadomienia e-mail · automatyczne wiadomości do gości · oceny/opinie gości ·
zaawansowany kalendarz dostępności · konta zespołowe · tryb ciemny · wielojęzyczność ·
głębsza synchronizacja kalendarzy · aplikacja mobilna · TypeScript · monitoring wydajności.

---

## ✅ Ostatnio ukończone (pełna historia: [[Activity-Log]])

- **2026-07-24** — **N6.1 + N6.2 wdrożone** (`495aace`, deploy `hosting:app`): wycofanie zgody na cookies (RODO art. 7 ust. 3) — dwa wejścia „równie łatwo", realne zatrzymanie GA bez przeładowania, kasowanie ciastek `_ga*`; przy okazji domknięta luka opt-in (zdarzenia logowania leciały do GA przed zgodą). Ostrzeżenie przy usuwaniu konta wymienia realny zakres kasacji. Brzmienia przeszły przegląd `legal` — z banera usunięto nieprawdziwe „dostosowywać komunikaty". Skrypt N6.5 zacommitowany po przeglądzie F2 (czeka na uruchomienie przez właściciela). Weryfikacja: lint 0, build OK, e2e 49/49 + pełny przepływ zgody przeklikany na produkcji.

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
5. **Braki bezpieczeństwa z §9 do rozstrzygnięcia** (nie blokują startu, ale wymagają decyzji — z oceny 2026-07-23, powiązane z N6):
   - ~~**Polityka haseł**~~ ✅ **rozstrzygnięte 2026-08-13, WPROWADZONE 2026-08-17** (tryb „Require enforcement": 8 znaków + **wielka** i mała litera + cyfra — właściciel przy wprowadzaniu dołożył wielką literę; `Force upgrade on sign-in` wyłączone). Ogon naprawiony tego samego dnia: ekrany rejestracji i resetu hasła deklarowały 6 znaków, więc reset zapętlał użytkownika — `src/utils/passwordPolicy.js` jako jedno źródło prawdy, e2e 136/136, wdrożone. Pierwotna decyzja: podnosimy do **8 znaków z wymogiem litery i cyfry** (odrzucone: 10 znaków ze znakiem specjalnym — koszt w porzuconych rejestracjach i hasłach na kartce; odrzucone: zostawić 6). Dotyczy wyłącznie nowych haseł. ⏸ **Zostaje wprowadzenie w konsoli** (Authentication → Settings → zasady haseł) — jedyna część, której agent nie wykona. Zapisane w §9 dokumentu bezpieczeństwa.
   - ~~**App Check dla Storage i Functions**~~ ✅ **ZAMKNIĘTE 2026-08-18** (Storage wymuszany i zweryfikowany na przewodnikach; dla Functions konsola nie oferuje przełącznika — ochrona jest w kodzie). Rozpisane było 2026-08-17 ([[Projects/Instrukcje-wlasciciela]] sekcja 8): **Storage do włączenia** (100% ruchu zweryfikowane, weryfikacja okładek zaraz po kliknięciu), **Functions świadomie zostają niewymuszane** — pięć funkcji wywoływanych z aplikacji już wymusza App Check w kodzie (`enforceAppCheck: true`), a wymuszanie na poziomie usługi trafiłoby w dwa wejścia HTTP obsługujące cudze serwery: `stripeWebhook` (płatności) i `exportIcal` (kalendarze portali). Czeka na potwierdzenie właściciela. (= N6.4.)
   - **2FA** — dziś tylko pośrednio przez konto Google; rozważyć przy większych klientach.
   - **Monitoring i alarmowanie bezpieczeństwa** — dziś tylko standardowe logi platformy; brak alertów na nietypowe wzorce.
   - **Testy penetracyjne** — nie wykonano (były wewnętrzne audyty kodu N5); decyzja, czy i kiedy zlecić.

**Related:** [[Team-Playbook]] · [[Projects/Backlog]] · [[Projects/Milestones]] · [[Known-Issues]] · [[Activity-Log]]
