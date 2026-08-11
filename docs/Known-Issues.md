# 🐛 Known Issues

## Critical Issues

> **None outstanding.** The two "critical bugs" previously listed here were investigated on 2026-06-29 and found to be **false** — both behaviours are already implemented in the code. Kept below as RESOLVED/NOT-A-BUG so nobody re-opens them.

### 1. iCal Token Not Generated — ❌ NOT A BUG (verified 2026-06-29)
**Status**: ✅ RESOLVED (was never broken)  
**Claim**: `secretToken` not initialized on property create → iCal export 403.

**Reality**: `secretToken` **is** generated with `window.crypto.randomUUID()` in `src/ManagerApp.jsx` — on create (`ManagerApp.jsx:463-475`) and as a retrofit for legacy properties lacking one (`ManagerApp.jsx:403-412`). Properties live in `users/{uid}/settings/properties.items`, not a top-level `properties` collection. `functions/index.js` `exportIcal` validates the token (`:985`). Export works.

---

### 2. Storage Leak on Account Deletion — ❌ NOT A BUG (verified 2026-06-29)
**Status**: ✅ RESOLVED (was never broken)  
**Claim**: `deleteUserAccount` leaves guide files in Storage.

**Reality**: `functions/index.js` `exports.deleteUserAccount` (`:902`) deletes, per owned guide, the Storage files via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` (`:933-937`), then the guide doc (`:944`), then the Auth user. No leak. (`exports.deleteExpiredAccountsData` handles scheduled cleanup of expired accounts.)

---

### 3. App Check Issue
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 9f85a23)  
**Issue**: App Check was disabled for debugging, now re-enabled.

**Status**: Monitoring for issues.

---

## Minor Issues

### 4. Firebase Auth iFrame Blocking
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 2bad1ff)  
**Issue**: X-Frame-Options header was blocking Firebase Auth iFrame.

**Fix Applied**: Removed restrictive header, now allows SAMEORIGIN.

---

### 5. Google Login Loop
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 99cc65b)  
**Issue**: Google login redirect loop on email verification.

**Fix Applied**: Improved redirect logic post-verification.

---

## Otwarte (2026-07-10 — sygnały z X1 i audytu N5)

### 6. Formularz /kontakt nie wysyła wiadomości
**Severity**: 🔴 przed launchem · **Status**: ✅ ZAMKNIĘTE — wdrożone na produkcję 2026-07-16 (deploy wiszącej partii: `firestore:rules,hosting,functions`)
`ContactPage.jsx` `handleSubmit` pokazywał tylko toast — treść NIGDZIE nie trafiała. **Decyzja właściciela: zapis do Firestore.** Wdrożone: `addDoc` do `contact_messages` (limity 320/5000, toast błędu z adresem awaryjnym), reguły create-only z walidacją kształtu (odczyt wyłącznie w konsoli Firebase). Pamiętać: zaglądać do kolekcji `contact_messages` w konsoli.

### 7. Paywall oferuje „Pakiet roczny", którego backend nie obsługuje
**Severity**: 🔴 sprzedażowe · **Status**: ✅ ZAMKNIĘTE — wdrożone na produkcję 2026-07-16 (pakiet roczny ukryty; wraca z drugą ceną w Stripe + parametrem planu)
`PaywallScreen` pokazywał 24,99/mc (299,90/rok), ale `createCheckoutSession` ma zaszyty JEDEN Price ID — klik „roczny" kupowałby miesięczny. **Decyzja właściciela: pakiet UKRYTY** do czasu wdrożenia (jedna karta 29,99 zł/mc, przełącznik okresu usunięty). Wraca razem z ofertą founding members po dodaniu drugiej ceny w Stripe + parametru planu.

### 9. Upload do przewodników: storage/unauthorized — brak roli cross-service (nawrót incydentu N2)
**Severity**: 🔴 funkcja martwa · **Status**: ✅ ROZWIĄZANE 2026-07-15 (właściciel nadał rolę w IAM; potwierdzone testem na żywo — upload okładki przechodzi, zero błędów w konsoli)
Zgłoszone przez właściciela 2026-07-15, odtworzone na żywo w jego sesji: `Firebase Storage: User does not have permission… (storage/unauthorized)` przy wgrywaniu okładki NOWEGO przewodnika. Eliminacja: panel działa (dokument `users` i subskrypcja OK w regułach Firestore), plik 70 B image/png, gałąź `!exists` — jedyny różniący czynnik to `firestore.get/exists` w `storage.rules` → **rola `roles/firebaserules.firestoreServiceAgent` dla agenta Storage (`service-379384522806@gcp-sa-firebasestorage…`) nie jest skutecznie nadana** (prompt CLI przy N2 najwyraźniej nie zadziałał). Naprawa: `firebase deploy --only storage` w TTY z odpowiedzią `y` na prompt o uprawnieniach cross-service ALBO nadanie roli w konsoli GCP (IAM). Weryfikacja: ponowny upload okładki.
**Update 2026-07-15**: TTY deploy właściciela NIE nadał roli (prawdopodobnie prompt się nie pojawił). **Potwierdzone zrzutem z konsoli IAM** (widok z rolami agentów Google, filtr „firebasestorage"): agent ma wyłącznie domyślną rolę „Agent usługi Cloud Storage dla Firebase" — brak `roles/firebaserules.firestoreServiceAgent`. Właściciel nadaje rolę ręcznie w IAM (ołówek → Dodaj kolejną rolę → filtr „firebaserules" → Firebase Rules Firestore Service Agent → Zapisz).

### 8. Konta Google nie mogą usunąć konta z poziomu aplikacji
**Severity**: 🟡 RODO · **Status**: ✅ ZAMKNIĘTE 2026-07-16 (finding F6 toru RODO-UI, commit `c714fb1`, wdrożone rules→hosting)
Formularz „Usunięcie konta" wymagał hasła (`EmailAuthProvider.credential`), którego konto Google nie posiada. Naprawione: `AccountModal` rozgałęzia się po providerze — konta Google przechodzą przez `reauthenticateWithPopup(GoogleAuthProvider)` („Potwierdź przez Google i usuń konto"). Domyka art. 17 dla kont Google; obejście mailowe z artykułu supportu jest nieaktualne.
Dług (kosmetyka, [[Projects/Backlog]]): brak osobnej obsługi `auth/popup-blocked`.

---

## Otwarte (2026-07-21 — sygnały z odświeżania bazy wiedzy X1)

> Wyszły przy przepisywaniu artykułów pod obecny UI (agent `support`). Obie pozycje
> **zweryfikowane w kodzie** przez głównego Claude'a, nie przyjęte na słowo.

### 10. Wpisów typu „Koszty" i jednorazowych zadań nie da się edytować ani usunąć
**Severity**: 🔴 integralność danych (psuje zysk i CSV dla księgowego) · **Status**: ✅ NAPRAWIONE 2026-07-21 (front-only, bez zmian reguł — `text`/`isCompleted` i `delete` były już w allowliście `isValidRental`)
**Naprawa:** „Ostatnie koszty" w `CostsView` dostały kolumnę akcji (edycja przez istniejący `openEditModal`, usuwanie przez `handleDeleteClick`) oraz przełącznik „Pokaż wszystkie" — bez niego koszt starszy niż 8 ostatnich wpisów pozostawał nieosiągalny. Wiersz niesie teraz referencję do oryginalnego wpisu (`entry`). Jednorazowe zadania (`type: 'reminder'`) dostały zakładkę „Zadania" w widoku Rezerwacje (`remindersList` wpięty w `displayedBookings`) z odhaczaniem, edycją i usuwaniem; przełącznik sortowania celowo pominięty, bo zadania sortuje `utilitySortOrder`, więc byłby martwym przyciskiem. Regresja: `e2e/costs-tasks.spec.js`.
**Stan pierwotny (do historii):**
`ManagerApp.jsx:239` **liczy** `utilitiesList` (`type === 'utility'`), ale destrukturyzacja w `:222` go nie odbiera — lista nigdzie nie trafia. Żaden widok nie pokazuje wpisów kosztowych z akcjami: `BookingsView` (jedyne miejsce z `openEditModal`/`handleDeleteClick`) renderuje wyłącznie rezerwacje, a „Ostatnie koszty" w `CostsView.jsx:344-359` to wiersze **bez przycisków** (Edytuj/Usuń w tym widoku należą do kosztów STAŁYCH z `settings/recurringCosts` — inny model).
To samo dotyczy `type === 'reminder'`: `remindersList` zasila tylko pływający widget „Zadania na dziś" (`:274`), gdzie zadanie można odhaczyć, ale nie poprawić ani skasować.
**Skutek:** literówka w kwocie kosztu zostaje w danych na zawsze i zaniża zysk netto oraz eksport dla księgowego. Gospodarz nie ma żadnej ścieżki naprawy poza kontaktem z nami.

### 11. Sygnalizator synchronizacji w sidebarze zawsze pokazuje „—"
**Severity**: 🟡 wprowadza w błąd (gospodarz uzna, że integracja nie działa) · **Status**: ✅ NAPRAWIONE 2026-07-21
**Naprawa:** `syncRows` czyta teraz WARTOŚCI `syncLinks` (portale), nie klucze (nazwy obiektów). Lista jest sterowana danymi: „Booking.com" i „Airbnb" pokazujemy zawsze, bo Ustawienia mają na nie pola; każdy inny portal pojawi się sam, gdy trafi do danych. „Nocowanie" zniknęło — nie ma pola na jego link, więc wiersz nie mógł nigdy zapalić się na „OK" (decyzja produktowa o dodaniu tego kanału pozostaje otwarta). Regresja: `e2e/costs-tasks.spec.js`.
**Stan pierwotny (do historii):**
`ManagerApp.jsx:471-475` buduje `syncRows`, sprawdzając `Object.keys(syncLinks)` pod kątem słów „airbnb"/„booking"/„nocowanie". Tymczasem **kluczami `syncLinks` są NAZWY OBIEKTÓW**, a nazwy portali siedzą w wartościach: `SettingsModal.jsx:184,189` zapisuje `editingSyncLinks[p.name] = { booking, airbnb }`, `ManagerApp.jsx:399` utrwala to jako `{ links: editingSyncLinks }`, a `useFirebaseData.js:94` czyta z powrotem `data.links`.
**Skutek:** przy poprawnie wklejonych linkach wszystkie trzy kanały świecą „—". Naprawa: sprawdzać wartości (`Object.values(syncLinks).some((v) => v?.booking)` itd.), nie klucze. Uwaga: „Nocowanie" nie ma w ogóle pola na link w Ustawieniach, choć widnieje w sygnalizatorze — do rozstrzygnięcia produktowego.

### 12. Debugowy handler błędów kasował stronę na produkcji — ✅ NAPRAWIONE 2026-08-10/11
**Severity**: 🟠 psuł UX każdego błędu i pokazywał użytkownikom stack trace · **Status**: ✅ NAPRAWIONE (commit `69f05c3`, wdrożone)

> ⚠️ **ERRATA 2026-08-11 — ten wpis został przeklasyfikowany.** Pierwotnie brzmiał
> „Nie działa dodawanie rezerwacji. Strona wywala błąd — PRZYCZYNA NIEUSTALONA" i miał
> severity 🔴. **Zgłoszenie z 10.08 było testowe** — właściciel wysłał je, żeby sprawdzić,
> czy kanał `/kontakt` w ogóle działa, a treść była wypełniaczem. **Awaria dodawania
> rezerwacji nigdy nie wystąpiła i nie ma dla niej żadnych dowodów.** Zgodnie z konwencją
> tego pliku pierwotnego sformułowania nie kasujemy — patrz „Czego to uczy" niżej.

**Realny problem, który przy tym wyszedł i został naprawiony (`index.html`):** globalny
`window.onerror` + `window.onunhandledrejection` podmieniały `document.body` na czerwony ekran
„Błąd JS!" ze stack tracem. Wszedł commitem `b4aeb4e` (29.06, „bypass email verification and add
cleanup TODOs for **easier V4 testing**") i **przeżył na produkcji 6 tygodni**. Bypass weryfikacji
z tego samego commita posprzątano przy N1 — tego handlera nie. Skutek: KAŻDY błąd JS, także
w obcym skrypcie albo rozszerzeniu przeglądarki, kasował działającą stronę. Błędy renderu i tak
łapie `src/GlobalErrorBoundary.jsx` (markowy ekran + czyszczenie cache PWA), więc handler nie
wnosił nic poza szkodą. Zweryfikowane po wdrożeniu na żywej produkcji: nieobsłużony `throw`
i odrzucony promise → strona żyje, błędy trafiają do konsoli ze stack tracem.

**Audyt ścieżki dodawania rezerwacji (przeprowadzony przy okazji — wynik: ZDROWA).**
Robiony pod fałszywym założeniem, że jest awaria, ale ustalenia są prawdziwe i zostają
jako potwierdzenie stanu produkcji na 10.08:
- konto: `emailVerified: true`, `status: 'active'` → `isOwnerAndVerified` + `hasActiveSubscription` przechodzą;
- `firestore.rules`: allowlista `isValidRental` zawiera `adults`/`children`/`pets`, zmiana addytywna;
- kod zapisu: e2e „Dodanie rezerwacji zapisuje czysty dokument" **przechodzi**;
- deploy: 26/26 chunków HTTP 200, `ManagerApp-Df2hXFSw.js` **bajt w bajt** identyczny z lokalnym buildem;
- dane: rezerwacja z rozbiciem (`adults:2, children:2, pets:1, guests:4`) istnieje w bazie od 25.07;
- App Check: egzekwowanie wyłączone → nie blokuje zapisu (ale patrz #13).

**Czego to uczy — i dlaczego zostaje w rejestrze:**
1. **„Brak dokumentu w `rentals` z 10.08" wziąłem za poszlakę potwierdzającą awarię.** To był
   brak próby, nie ślad błędu. Nieobecność danych nie jest dowodem — o ile nie wiadomo, że
   ktoś naprawdę próbował.
2. **Zgłoszenie testowe jest nieodróżnialne od prawdziwego.** Kanał nie ma pola statusu ani
   typu, więc nic nie odsiewa wypełniaczy — to zaostrza istniejący brak z §6
   [[support/Proces-obslugi-zgloszen]] („Brak statusu zgłoszenia"). Przy testach warto pisać
   wprost „TEST — proszę zignorować".
3. Pościg za nieistniejącym błędem wyprodukował mimo to trzy realne ustalenia (#13, #14, #15) —
   ale to szczęśliwy skutek uboczny, nie metoda.

---

### 15. Każdy deploy zostawia użytkowników na starej powłoce (service worker)
**Severity**: 🟡 opóźnia dotarcie poprawek, mylące przy weryfikacji · **Status**: ⏳ OTWARTE (do decyzji)
**Zaobserwowane 2026-08-10** przy weryfikacji wdrożenia `69f05c3`, niezależnie od zgłoszenia:
`curl` dostawał już **czysty** `index.html`, a przeglądarka z aktywnym service workerem nadal
serwowała **stary** — czerwony ekran z usuniętego handlera pojawił się na produkcji **po**
deployu. Dopiero jedno przeładowanie podmieniło powłokę.

To poprawne zachowanie `registerType: 'autoUpdate'` (`vite.config.js:10`), nie awaria. Ale ma
dwie konsekwencje:
- **poprawka dociera do użytkownika dopiero przy kolejnym wejściu/przeładowaniu**, o czym nikt
  go nie informuje;
- **`curl` NIE weryfikuje deployu aplikacji PWA** — sprawdza serwer, nie to, co widzi użytkownik.
  Weryfikacja live musi iść przez przeglądarkę. To najtrwalszy wniosek z tej sesji.

**Do rozważenia:** `skipWaiting` + jawny komunikat „dostępna nowa wersja, odśwież", zamiast
liczyć na to, że użytkownik sam trafi w moment przeładowania. Decyzja produktowa — nie ruszane.

> Wcześniejsza wersja tego wpisu wiązała nieświeży SW z rzekomą awarią dodawania rezerwacji
> (404 leniwego chunku → odrzucony promise → czerwony ekran). **Ta hipoteza jest wycofana** —
> tłumaczyła zdarzenie, które nigdy nie zaszło. Sam mechanizm nieświeżej powłoki jest realny
> i zaobserwowany; jego rzekomy skutek nie.

---

### 13. App Check zwraca 403 na produkcji — blokuje włączenie egzekwowania
**Severity**: 🔴 blokuje zadanie 1 z [[Projects/Instrukcje-wlasciciela]] · **Status**: ⏳ OTWARTE
**Objaw (zaobserwowany na żywo 10.08 na `wynajempro.com`):**
```
@firebase/app-check: AppCheck: 403 error. Attempts allowed again after 01d:00m:00s (appCheck/initial-throttle)
```
Klucz reCAPTCHA v3 jest poprawnie wbudowany w bundle (`src/firebase.js:31`, `VITE_RECAPTCHA_SITE_KEY`), ale wymiana tokenu na token App Check jest odbijana. Po 403 SDK wchodzi w **dobowy throttle** i przestaje próbować.

**Dlaczego dziś nic nie psuje:** egzekwowanie App Check jest w konsoli **wyłączone**, więc Firestore przyjmuje żądania bez ważnego tokenu.

**Dlaczego to jest pilne:** zadanie 1 w [[Projects/Instrukcje-wlasciciela]] to właśnie **włączenie egzekwowania**. Zrobione przy obecnym 403 **odetnie cały ruch aplikacji do Firestore** — dokładnie to, przed czym ostrzega notatka „odcięcie ruchu" w instrukcji. Kolejność jest odwrotna niż zapisana: najpierw naprawić 403, potwierdzić w konsoli, że token się wystawia, dopiero potem włączać egzekwowanie.

**Podejrzany numer jeden:** zmiana domeny kanonicznej na `wynajempro.com` (22.07) — klucz reCAPTCHA i/lub rejestracja aplikacji w App Check mogą nadal wskazywać starą domenę `moje-domki-6c77d`. Do sprawdzenia w konsoli reCAPTCHA (lista dozwolonych domen) i Firebase → App Check (czy aplikacja webowa jest zarejestrowana z tym kluczem).

---

### 14. Test e2e migracji `guests`→`adults` zgnił po 6 dniach — bezgłośnie
**Severity**: 🟡 fałszywe poczucie pokrycia · **Status**: ✅ NAPRAWIONE 2026-08-10
**Problem:** `e2e/panel-v2.spec.js` „Edycja starej rezerwacji (samo `guests`)" miał fixture z datami wpisanymi na sztywno (`2026-08-01`–`2026-08-05`). Lista rezerwacji domyślnie filtruje `upcoming` (`ManagerApp.jsx:240`: `endDate >= dziś`), więc **10.08 fixture wpadł do „Archiwum"**, test przestał znajdować przycisk „Edytuj" i wywalał się na timeoucie.
**Dlaczego to bolało:** to jedyny test pilnujący pułapki utraty danych z X17 — migracji `guests`→`adults`, bez której zapis starej rezerwacji **zeruje liczbę osób**. Commit X17 zdał go 25.07 („e2e 39/39") i od 31.07 test nie chronił już niczego, nie dając żadnego sygnału.
**Naprawa:** daty fixture'ów liczone względem dnia uruchomienia (`isoInDays()`), z komentarzem zakazującym powrotu do dat na sztywno. Po poprawce `panel-v2.spec.js` przechodzi 7/7.
**Wniosek ogólny:** deklaracja „e2e N/N" w commicie jest prawdziwa wyłącznie w dniu commita.

---

## Future Improvements (Not Bugs)

- [ ] Add dark mode
- [ ] Implement guide versioning
- [ ] Add email notifications
- [ ] Optimize Firestore queries
- [ ] Add analytics
- [ ] Improve mobile UX
- [ ] Add property photos/gallery

---

## Testing Status

| Issue | E2E Test | Manual Test | Fix Status |
|-------|----------|-------------|-----------|
| iCal Token | n/a | ✅ OK | NOT A BUG (generated in ManagerApp.jsx) |
| Storage Leak | n/a | ✅ OK | NOT A BUG (deleteUserAccount clears Storage) |
| App Check | ✅ PASS | ✅ OK | FIXED |
| Auth iFrame | ✅ PASS | ✅ OK | FIXED |
| Google Loop | ✅ PASS | ✅ OK | FIXED |

---

## How to Report Issues

1. Create failing E2E test in `e2e/` folder
2. Run test to confirm bug
3. Document in this file
4. Create branch: `fix/issue-name`
5. Fix + test + commit
6. Push PR

---

**Related**: [[Development]], [[Features]], [[Architecture]]
