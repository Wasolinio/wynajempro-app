# PROJEKT — wymaga weryfikacji prawnika-człowieka przed publikacją

> **Status:** PROJEKT (draft). Przygotował agent `legal` w ramach blokera launchu **N4**.
> NIE jest to dokument wiążący. Wdrożenie do `src/pages/PrivacyPage.jsx` wykonuje `dev`
> PO akceptacji właściciela i prawnika. Placeholdery `[DO UZUPEŁNIENIA: …]` = dane, których
> agent nie zmyśla. **Data projektu:** 2026-07-04 · **Weryfikacja podstaw:** 2026-07-04.
>
> **Rozbudowa istniejącej strony** `PrivacyPage.jsx` (66 linii) — luki uzupełnione:
> podstawy prawne art. 6 RODO (brakowały), okresy przechowywania oparte na REALNYM
> mechanizmie usuwania z `functions/index.js`, pełny katalog praw + prawo skargi do PUODO,
> dwuwarstwowość danych (konto gospodarza vs dane gości), źródło danych, cookies zgodne
> ze stanem faktycznym (Analytics ładowany dopiero po zgodzie — potwierdzone w `firebase.js`).
>
> **Aktualizacja 2026-07-22 (legal, ocena X9 — `Ocena-linki-guide-opinie.md`, decyzja
> właściciela):** uzupełniono opis mechanizmu „dostępu po linku" w sekcji 4, rozbito wiersz
> profilu gospodarza w sekcji 2 na stan po naprawie N5 (`hostProfile` niepubliczny,
> `publicContact` publiczny — spójnie z propozycją B1.1 z `Uwagi-N5-dla-prawnika.md`)
> oraz dodano zasady analityki na stronach publicznych w sekcji 9. Zmiany oznaczone
> znacznikiem `[UZUPEŁNIENIE 2026-07-22]`. Po deployu pakietu na produkcję (2026-07-22,
> commit `e850136`) zdjęto adnotację wdrożeniową przy zdaniu o maskowaniu identyfikatora
> w analityce — maskowanie zweryfikowane w kodzie.

---

# Polityka Prywatności WynajemPRO

**Obowiązuje od:** [DO UZUPEŁNIENIA: data]

## 1. Administrator danych

Administratorem danych osobowych Użytkowników (Gospodarzy) w zakresie ich kont jest [DO UZUPEŁNIENIA: pełna firma, forma prawna, adres, NIP], dalej „Operator" / „my".

Kontakt w sprawach danych osobowych: [DO UZUPEŁNIENIA: adres e-mail, np. rodo@wynajempro.pl] oraz adres korespondencyjny [DO UZUPEŁNIENIA].

**Inspektor Ochrony Danych (IOD):** [DO UZUPEŁNIENIA: czy powołano IOD — jeśli tak, podać dane kontaktowe; jeśli nie, usunąć sekcję. Uwaga: dla podmiotu tej skali IOD zwykle nie jest obowiązkowy (art. 37 RODO), ale to ocena prawnika — patrz checklista.]

> **Ważne rozróżnienie dwóch ról.** W odniesieniu do danych **Gości/Najemców**, które Gospodarz
> wprowadza do Aplikacji (rezerwacje, kontakty, podpisy pod regulaminem, dane dostępowe),
> **administratorem jest Gospodarz**, a Operator występuje jako **podmiot przetwarzający**
> (procesor) na podstawie Umowy powierzenia (DPA — `DPA-powierzenie.md`). Niniejsza Polityka
> opisuje przede wszystkim przetwarzanie danych, dla których administratorem jest Operator
> (konto Gospodarza). Dane Gości opisujemy poglądowo w sekcji 4.

## 2. Kategorie danych, cele i podstawy prawne — dane Gospodarza (Operator = administrator)

| Kategoria danych | Cel | Podstawa prawna (RODO) | Okres przechowywania |
|---|---|---|---|
| Adres e-mail, identyfikator (UID), hasło (w formie zabezpieczonej przez Firebase Auth), fakt weryfikacji e-mail | Założenie i utrzymanie Konta, logowanie, świadczenie usługi | art. 6 ust. 1 lit. b (wykonanie umowy) | Przez czas trwania Konta + okres karencji po usunięciu/wygaśnięciu (patrz sekcja 6) |
| Dane rozliczeniowe / identyfikatory Stripe (`stripeCustomerId`, `stripeSubscriptionId`, status subskrypcji) | Obsługa płatności i subskrypcji | art. 6 ust. 1 lit. b (umowa); w zakresie dokumentacji rozliczeniowej — art. 6 ust. 1 lit. c (obowiązek prawny, przepisy podatkowe) | Zgodnie z przepisami podatkowo-rachunkowymi [DO UZUPEŁNIENIA/POTWIERDZENIA: np. 5 lat dla dokumentów księgowych] |
| Dane biznesowe Gospodarza: nazwy obiektów, ceny, wpisy w kalendarzu (rezerwacje, koszty, zadania), ustawienia podatkowe | Świadczenie funkcji zarządzania wynajmem | art. 6 ust. 1 lit. b (umowa) | Przez czas trwania Konta + karencja |
| **[UZUPEŁNIENIE 2026-07-22]** Profil gospodarza (`hostProfile`): imię/nazwa, typ identyfikatora, NIP albo PESEL, adres, telefon, e-mail — **niepubliczny**, dostępny wyłącznie dla Użytkownika | Dane do dokumentów i rozliczeń w ramach usługi | art. 6 ust. 1 lit. b (umowa) | Przez czas trwania Konta + karencja |
| **[UZUPEŁNIENIE 2026-07-22]** Kontakt publiczny gospodarza (`publicContact`): nazwa, telefon, e-mail — wyświetlane w sekcji „Kontakt z gospodarzem" publicznego przewodnika dla gości | Prezentacja kontaktu gościom w przewodniku; **odbiorcy: każda osoba dysponująca linkiem przewodnika** (dokument czytelny publicznie — patrz sekcja 4) | art. 6 ust. 1 lit. b (element usługi konfigurowanej przez Gospodarza) — *wybór podstawy do potwierdzenia przez prawnika; alternatywa: zgoda (lit. a) — patrz `Uwagi-N5-dla-prawnika.md`, C.4* | Przez czas trwania Konta; publiczna widoczność do usunięcia przewodnika lub wyłączenia kontaktu publicznego |
| Dane techniczne: adres IP, logi, identyfikatory sesji, dane z zabezpieczeń (App Check / reCAPTCHA) | Bezpieczeństwo, zapobieganie nadużyciom, diagnostyka | art. 6 ust. 1 lit. f (uzasadniony interes — bezpieczeństwo usługi) | [DO UZUPEŁNIENIA: okres retencji logów — zależny od konfiguracji Firebase; do ustalenia] |
| Dane analityczne (Google/Firebase Analytics) | Analiza ruchu i optymalizacja | art. 6 ust. 1 lit. a (zgoda z bannera cookie) | Do wycofania zgody / zgodnie z ustawieniami Analytics [DO UZUPEŁNIENIA: okres retencji GA] |
| Zapisy do newslettera (adres e-mail, źródło) — jeśli Użytkownik się zapisze | Marketing własny / informacje o usłudze | art. 6 ust. 1 lit. a (zgoda) | Do wycofania zgody |

*(Podstawy prawne to szkielet do potwierdzenia prawnika — zwłaszcza rozgraniczenie lit. b / lit. f oraz podstawy dla logów bezpieczeństwa i danych podatkowych.)*

## 3. Źródło danych

Dane Gospodarza pochodzą bezpośrednio od Użytkownika (rejestracja, korzystanie z Aplikacji) oraz — w zakresie statusu płatności — od Operatora płatności Stripe (za pośrednictwem webhooka aktualizującego status subskrypcji).

## 4. Dane Gości/Najemców (Operator = podmiot przetwarzający)

Gospodarz może wprowadzać do Aplikacji dane osób trzecich (Gości/Najemców):
- dane rezerwacji (obiekt, daty, kwoty; ewentualne dane kontaktowe wpisane przez Gospodarza),
- **podpisy elektroniczne** gości akceptujących regulamin przewodnika (rekord z datą akceptacji, opcjonalnie imię i podpis, migawka zaakceptowanego regulaminu) — zapisywane w `guides/{id}/signatures/{uid}`,
- **dane dostępowe** (PIN do drzwi, hasło WiFi) — przechowywane odrębnie w `guides/{id}/secrets/data`, ujawniane gościowi dopiero po elektronicznej akceptacji.

**[UZUPEŁNIENIE 2026-07-22] Mechanizm udostępniania przewodnika („dostęp po linku").** Przewodnik dla gości oraz strona z prośbą o opinię są publikowane pod unikalnym, trudnym do odgadnięcia adresem internetowym (linkiem), który Gospodarz przekazuje gościom. Strony te są dostępne bez logowania — **treść przewodnika (w tym publiczny kontakt Gospodarza) może odczytać każda osoba dysponująca linkiem**, a dane dostępowe (kod do drzwi, hasło WiFi) są ujawniane po elektronicznej akceptacji regulaminu obiektu przez osobę, która otworzyła link, bez weryfikacji jej tożsamości. O tym, komu udostępnić link, decyduje Gospodarz jako administrator danych zawartych w przewodniku. Strona z prośbą o opinię nie zawiera danych osobowych gościa. Publiczne strony przewodników są wyłączone z indeksowania przez wyszukiwarki i nie można ich wyszukać ani wylistować — dostęp wymaga znajomości pełnego adresu.

W zakresie tych danych **administratorem jest Gospodarz**. Operator przetwarza je wyłącznie na polecenie Gospodarza, na zasadach Umowy powierzenia (DPA). Osoby, których dane dotyczą (Goście), swoje prawa realizują wobec Gospodarza jako administratora. Operator wspiera Gospodarza w realizacji tych praw zgodnie z DPA.

## 5. Odbiorcy danych i podmioty przetwarzające (subprocesorzy)

Dane mogą być powierzane następującym dostawcom działającym jako podmioty przetwarzające:

| Subprocesor | Rola / zakres | Uwaga o transferze |
|---|---|---|
| **Google Cloud / Firebase** (Google Cloud EMEA Ltd. / Google Ireland Ltd.) | Infrastruktura: uwierzytelnianie (Auth), baza danych (Firestore), pliki (Storage), funkcje serwerowe (Cloud Functions), hosting, Analytics, App Check/reCAPTCHA | Możliwy transfer poza EOG — [DO UZUPEŁNIENIA/POTWIERDZENIA: lokalizacja regionu Firestore/Storage projektu `moje-domki-6c77d` oraz mechanizm transferu — SCC / DPF. To wymaga sprawdzenia w konsoli Firebase i potwierdzenia prawnika.] |
| **Stripe** (Stripe Payments Europe, Ltd. / Stripe, Inc.) | Obsługa płatności subskrypcyjnych, dane rozliczeniowe | Możliwy transfer do USA — mechanizm: [DO UZUPEŁNIENIA/POTWIERDZENIA: SCC / DPF wg DPA Stripe] |
| **Google** (Google OAuth) | Logowanie kontem Google (dla użytkowników wybierających tę metodę) | jw. |

Operator korzysta z subprocesorów na podstawie umów powierzenia zapewniających poziom ochrony wymagany przez RODO. [DO UZUPEŁNIENIA: link do listy subprocesorów lub zobowiązanie do jej aktualizacji.]

**Transfery poza EOG:** [DO UZUPEŁNIENIA/POTWIERDZENIA przez prawnika: dokładne wskazanie mechanizmów legalizujących transfer — standardowe klauzule umowne (SCC) i/lub EU-US Data Privacy Framework, wraz z informacją, gdzie Użytkownik może uzyskać kopię zabezpieczeń. Nie wpisujemy tego „z pamięci" — do zweryfikowania u źródła.]

## 6. Okres przechowywania i usuwanie danych

Dane przechowujemy przez czas trwania Konta oraz — po jego usunięciu lub wygaśnięciu — przez okres karencji, po którym są trwale usuwane. Mechanizm usuwania odzwierciedla faktyczne działanie Aplikacji:

- **Usunięcie Konta na żądanie Użytkownika** uruchamia proces (`deleteUserAccount`), który usuwa: dokument profilu Użytkownika, wszystkie utworzone przez niego przewodniki wraz z plikami (Storage) oraz konto uwierzytelniające.
- **Konta wygasłe** (po zakończeniu trialu bez subskrypcji lub po anulowaniu) są oznaczane datą planowanego usunięcia i po upływie okresu karencji ich dane są automatycznie usuwane (`deleteExpiredAccountsData`).
- Okres karencji wynosi [DO UZUPEŁNIENIA/POTWIERDZENIA: dokładna liczba dni z `functions/index.js` — do zweryfikowania w kodzie przez `dev`/`legal` przed publikacją; nie wpisuję zmyślonej wartości].
- Dane wymagane przepisami prawa (np. dokumentacja rozliczeniowa) mogą być przechowywane dłużej, w zakresie i przez okres wynikający z tych przepisów.

## 7. Prawa osób, których dane dotyczą

Przysługuje Państwu prawo do:
- **dostępu** do danych i uzyskania kopii (art. 15 RODO),
- **sprostowania** danych (art. 16) — część danych można edytować samodzielnie w profilu,
- **usunięcia** danych / „bycia zapomnianym" (art. 17) — m.in. przez usunięcie Konta,
- **ograniczenia przetwarzania** (art. 18),
- **przenoszenia** danych (art. 20) — w zakresie danych przetwarzanych na podstawie umowy/zgody; eksport rezerwacji możliwy m.in. przez iCal,
- **sprzeciwu** wobec przetwarzania opartego na uzasadnionym interesie (art. 21),
- **wycofania zgody** w dowolnym momencie, bez wpływu na zgodność przetwarzania sprzed wycofania (dot. Analytics, newslettera).

Realizacja praw: [DO UZUPEŁNIENIA: kanał — e-mail rodo@…, funkcje w panelu].

**Prawo skargi:** Przysługuje Państwu prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa; uodo.gov.pl).

**Uwaga dla Gości:** jeśli Państwa dane wprowadził do Aplikacji Gospodarz (rezerwacja, przewodnik), administratorem jest ten Gospodarz — swoje prawa należy realizować wobec niego. Operator przekaże żądanie właściwemu Gospodarzowi lub wesprze jego realizację zgodnie z DPA.

## 8. Dobrowolność podania danych

Podanie adresu e-mail (lub użycie konta Google) jest niezbędne do założenia Konta i korzystania z Aplikacji — bez tego usługa nie może być świadczona. Podanie danych profilu gospodarza (adres, telefon) oraz zapis do newslettera są dobrowolne.

## 9. Pliki cookies i technologie pamięci lokalnej

WynajemPRO wykorzystuje:
- **Cookies i mechanizmy niezbędne** (Firebase Auth, sesja logowania) oraz **Local Storage / IndexedDB** — do działania aplikacji, utrzymania sesji i podręcznej pamięci (m.in. tryb offline, zapamiętanie sesji akceptacji przez gościa). Podstawa: niezbędność do świadczenia usługi (art. 173 ust. 3 Prawa telekomunikacyjnego / niezbędny charakter).
- **Cookies/technologie analityczne (Google/Firebase Analytics)** — uruchamiane **wyłącznie po wyrażeniu zgody** w bannerze cookie. Podstawa: zgoda (art. 6 ust. 1 lit. a RODO w zw. z art. 173 Prawa telekomunikacyjnego).

**[UZUPEŁNIENIE 2026-07-22] Analityka na stronach publicznych.** Zasady powyższe obowiązują także na publicznych stronach przewodnika gościa (`/guide/…`) i prośby o opinię (`/opinie/…`): technologie analityczne uruchamiają się tam wyłącznie po zgodzie osoby odwiedzającej, a administratorem danych analitycznych zbieranych na tych stronach jest Operator. Identyfikator konkretnej strony (element linku przewodnika) jest w danych analitycznych maskowany i nie jest przekazywany do narzędzia analitycznego. *(Stan faktyczny zweryfikowany w kodzie 2026-07-22: maskowanie wdrożone w `src/App.jsx` — funkcja `trackedPagePath` zamienia ścieżki `/guide/…` i `/opinie/…` na zbiorcze `/guide/[id]` / `/opinie/[id]` i odcina parametry adresu przed wysyłką zdarzenia `page_view`; wdrożone na produkcji — deploy 2026-07-22, commit `e850136`. Wcześniejsza adnotacja wstrzymująca publikację tego fragmentu do czasu wdrożenia — warunek spełniony, adnotacja zdjęta.)*

**Stan faktyczny (zweryfikowany w kodzie `firebase.js`):** Analytics inicjalizuje się dopiero, gdy zgoda została zapisana (`cookie_consent === 'true'`); przy wyborze „Tylko niezbędne" lub zamknięciu bannera skrypt analityczny nie jest ładowany. Jest to model opt-in zgodny z zasadą uprzedniej zgody.

> **⚠️ Rekomendacja do weryfikacji (nie bloker treści Polityki, ale istotne dla spójności):**
> Banner (`ConsentNotice.jsx`) nie oferuje obecnie łatwego **wycofania/zmiany zgody** po jej
> udzieleniu ani granularnego wyboru — zgoda zapisana w `localStorage` jest „lepka". RODO wymaga,
> by wycofanie zgody było równie łatwe jak jej udzielenie. **Zadanie dla `dev` po akceptacji:**
> dodać mechanizm zarządzania zgodą (np. link „Ustawienia cookies" wywołujący ponownie banner
> i czyszczący flagę). Ta uwaga należy do checklisty, nie do treści publikowanej Polityki.

## 10. Bezpieczeństwo

Stosujemy środki techniczne i organizacyjne odpowiednie do ryzyka, m.in.: reguły dostępu na poziomie bazy danych (Firestore Security Rules) ograniczające dostęp do danych do właściciela konta, oddzielne przechowywanie danych wrażliwych (kody/hasła gości w odrębnej, chronionej kolekcji ujawnianej dopiero po akceptacji gościa), zabezpieczenia przed automatycznymi nadużyciami (App Check / reCAPTCHA), szyfrowanie transmisji (HTTPS).

## 11. Zmiany Polityki

Politykę możemy aktualizować. O istotnych zmianach poinformujemy [DO UZUPEŁNIENIA: kanał]. Aktualna wersja jest zawsze dostępna w Aplikacji.

## 12. Kontakt

[DO UZUPEŁNIENIA: e-mail, adres]. W sprawach dotyczących danych Gości — prosimy kierować się do właściwego Gospodarza jako administratora.

---

*Projekt przygotowany na podstawie stanu faktycznego zweryfikowanego w kodzie (`firebase.js`, `functions/index.js`, `firestore.rules`, `GuestGuideView.jsx`, `SettingsModal.jsx`, `ConsentNotice.jsx`; uzupełnienia 2026-07-22 — dodatkowo `App.jsx`, `firebase.json`, `SeoTags.jsx`, `public/robots.txt` — patrz `Ocena-linki-guide-opinie.md`). Podstawy prawne i daty — patrz `Checklista-zgodnosci.md`. Wymaga weryfikacji prawnika-człowieka przed publikacją.*
