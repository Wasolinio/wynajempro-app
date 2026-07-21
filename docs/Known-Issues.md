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
