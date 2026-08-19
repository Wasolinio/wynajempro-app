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
>
> **PRZEGLĄD 2026-07-22 (legal, na zlecenie właściciela — przed spotkaniem z prawnikiem):**
> pełna rewizja aktualności względem stanu kodu z 2026-07-22. Wpisano faktyczne okresy
> retencji (30 dni po anulowaniu subskrypcji, 90 dni dla porzuconych okresów próbnych — F2),
> pełny zakres usuwania danych (w tym rekord klienta Stripe — #32, kaskada przewodników —
> C.1), samodzielne usunięcie konta dla obu metod logowania (F6), doprecyzowano kontakt
> publiczny (odrębny publiczny e-mail, przełącznik widoczności — F4), dodano wiersz
> formularza kontaktowego, skorygowano sekcję o dobrowolności podania danych i zakres
> zapisu akceptacji gościa. Zmiany oznaczone znacznikiem `[PRZEGLĄD 2026-07-22]`.
>
> **[UZUPEŁNIENIE 2026-07-24 (legal, N6.1)]:** w sekcji 9 dodano opis mechanizmu **wycofania /
> zmiany zgody na cookies** (art. 7 ust. 3 RODO) i zaktualizowano wcześniejszą uwagę o jego
> braku. Mechanizm został **wdrożony na produkcję 2026-07-24** (commit `495aace`, site
> `wynajempro` / `wynajempro.com`; przepływ przeklikany end-to-end na produkcji), więc opis
> w sekcji 9 jest opisem **stanu obowiązującego**, a nie stanu docelowego — kod:
> `src/firebase.js`, `src/components/ConsentNotice.jsx`, `src/pages/PrivacyPage.jsx`,
> `src/pages/landing/LandingPage.jsx`. Osobno odnotowano dla prawnika **nieaktualność podstawy
> prawnej cookies**: cytowane „Prawo telekomunikacyjne (art. 173)" zostało zastąpione **Prawem
> komunikacji elektronicznej** (cookies — art. 399 PKE; definicja zgody odsyłająca do RODO —
> art. 402 PKE), obowiązującym od 10 listopada 2024 r. Korekta pełnej podstawy należy do
> prawnika-człowieka (N4) — treści merytorycznej sekcji 9 nie zmieniano. Cały dokument
> pozostaje **PROJEKTEM** oczekującym na weryfikację prawnika (N4).
>
> **[UZUPEŁNIENIE 2026-07-25 (legal, X14 — rozbicie liczby gości)]:** w sekcji 4 (dane Gości,
> gdzie Operator jest **podmiotem przetwarzającym**) dopisano nową kategorię danych rezerwacji:
> **skład osobowy pobytu** — liczba dorosłych, liczba dzieci, liczba zwierząt. **Funkcja jest
> w kodzie (gałąź robocza) i NIE została wdrożona na produkcję** — kolejność i termin wdrożenia
> (reguły bazy przed frontem) to odrębna decyzja właściciela; do tego czasu opis w sekcji 4 jest
> **opisem stanu docelowego**, a nie stanu obowiązującego. **Role się nie zmieniają:** dane swoich
> gości wprowadza Gospodarz jako **administrator**, Operator pozostaje **procesorem** (patrz
> `DPA-powierzenie.md` §3, gdzie równolegle uzupełniono katalog kategorii danych powierzonych).
> **Ekspozycja danych się nie zmienia** — zweryfikowano w kodzie 2026-07-25: pola leżą wyłącznie
> za bramką właściciela (`firestore.rules`: `isOwnerAndVerified` + `hasActiveSubscription`, brak
> jakiejkolwiek ścieżki odczytu publicznego), nie są odczytywane przez przewodnik gościa ani
> stronę opinii, nie występują w publicznym eksporcie kalendarza (iCal — `functions/index.js`
> emituje wyłącznie identyfikator, daty i stałą nazwę „Rezerwacja z WynajemPRO") i nie są
> przekazywane do narzędzi analitycznych. *(Adnotację datowano dniem faktycznej edycji dokumentu;
> zlecenie posługiwało się datą 2026-07-24.)*

---

# Polityka Prywatności WynajemPRO

**Obowiązuje od:** [DO UZUPEŁNIENIA: data]

## 1. Administrator danych

Administratorem danych osobowych Użytkowników (Gospodarzy) w zakresie ich kont jest [DO UZUPEŁNIENIA: pełna firma, forma prawna, adres, NIP], dalej „Operator" / „my".

Kontakt w sprawach danych osobowych: [DO UZUPEŁNIENIA: adres e-mail; publiczny adres na stronie /kontakt to obecnie kontakt@wynajempro.pl — spójność z domeną kanoniczną wynajempro.com do decyzji właściciela] oraz adres korespondencyjny [DO UZUPEŁNIENIA].

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
| Adres e-mail, identyfikator (UID), hasło (w formie zabezpieczonej przez Firebase Auth), fakt weryfikacji e-mail | Założenie i utrzymanie Konta, logowanie, świadczenie usługi | art. 6 ust. 1 lit. b (wykonanie umowy) | Przez czas trwania Konta + okres retencji po usunięciu/wygaśnięciu (patrz sekcja 6) |
| Dane rozliczeniowe / identyfikatory Stripe (`stripeCustomerId`, `stripeSubscriptionId`, status subskrypcji) | Obsługa płatności i subskrypcji | art. 6 ust. 1 lit. b (umowa); w zakresie dokumentacji rozliczeniowej — art. 6 ust. 1 lit. c (obowiązek prawny, przepisy podatkowe) | Zgodnie z przepisami podatkowo-rachunkowymi [DO UZUPEŁNIENIA/POTWIERDZENIA: np. 5 lat dla dokumentów księgowych] |
| Dane biznesowe Gospodarza: nazwy obiektów, ceny, wpisy w kalendarzu (rezerwacje, koszty, zadania), ustawienia podatkowe | Świadczenie funkcji zarządzania wynajmem | art. 6 ust. 1 lit. b (umowa) | Przez czas trwania Konta + okres retencji (sekcja 6) |
| **[UZUPEŁNIENIE 2026-07-22]** Profil gospodarza (`hostProfile`): imię/nazwa, typ identyfikatora, NIP albo PESEL (opcjonalnie), adres, telefon, e-mail logowania, publiczny e-mail — **niepubliczny**, dostępny wyłącznie dla Użytkownika | Dane do dokumentów i rozliczeń w ramach usługi | art. 6 ust. 1 lit. b (umowa) | Przez czas trwania Konta + okres retencji (sekcja 6) |
| **[UZUPEŁNIENIE 2026-07-22, doprecyzowanie PRZEGLĄD 2026-07-22]** Kontakt publiczny gospodarza (`publicContact`): nazwa, telefon oraz **publiczny adres e-mail wskazany odrębnie przez Gospodarza** (adres logowania nie jest publikowany) — wyświetlane w sekcji „Kontakt z gospodarzem" publicznego przewodnika dla gości; **publikację można w każdej chwili wyłączyć przełącznikiem** w profilu (wówczas sekcja kontaktu nie pojawia się w przewodniku) | Prezentacja kontaktu gościom w przewodniku; **odbiorcy: każda osoba dysponująca linkiem przewodnika** (dokument czytelny publicznie — patrz sekcja 4) | art. 6 ust. 1 lit. b (element usługi konfigurowanej przez Gospodarza) — *wybór podstawy do potwierdzenia przez prawnika; alternatywa: zgoda (lit. a) — patrz `Uwagi-N5-dla-prawnika.md`, C.4* | Przez czas trwania Konta; publiczna widoczność do usunięcia przewodnika lub wyłączenia kontaktu publicznego |
| **[PRZEGLĄD 2026-07-22, UZUPEŁNIENIE 2026-08-10]** Formularz kontaktowy (`contact_messages`): adres e-mail, treść wiadomości, data, źródło | Obsługa zapytań i zgłoszeń kierowanych do Operatora (także przez osoby niebędące Użytkownikami). **Odbiorcy: dostawca modelu językowego wspierającego obsługę zgłoszeń — patrz sekcja 5.** Treść wiadomości jest polem swobodnym, więc może zawierać dane, których Operator sam nie zbiera | art. 6 ust. 1 lit. f (uzasadniony interes — odpowiedź na zgłoszenie osoby, która sama się zwraca) albo lit. b, gdy dotyczy umowy — *wybór podstawy do decyzji prawnika* | [DO DECYZJI właściciela + prawnik: propozycja kierunkowa 12 miesięcy od zakończenia korespondencji; wg stanowiska UODO okres musi być konkretny] |
| Dane techniczne: adres IP, logi, identyfikatory sesji, dane z zabezpieczeń (App Check / reCAPTCHA) | Bezpieczeństwo, zapobieganie nadużyciom, diagnostyka | art. 6 ust. 1 lit. f (uzasadniony interes — bezpieczeństwo usługi) | [DO UZUPEŁNIENIA: okres retencji logów — zależny od konfiguracji Firebase; do ustalenia] |
| Dane analityczne (Google/Firebase Analytics) | Analiza ruchu i optymalizacja | art. 6 ust. 1 lit. a (zgoda z bannera cookie) | Do wycofania zgody / zgodnie z ustawieniami Analytics [DO UZUPEŁNIENIA: okres retencji GA] |
| Zapisy do newslettera (adres e-mail, źródło, **zapis zgody wraz z wersją jej treści**) — jeśli Użytkownik się zapisze | Marketing własny / informacje o usłudze | art. 6 ust. 1 lit. a (zgoda) | Do wycofania zgody |

*(Podstawy prawne to szkielet do potwierdzenia prawnika — zwłaszcza rozgraniczenie lit. b / lit. f oraz podstawy dla logów bezpieczeństwa i danych podatkowych.)*

## 3. Źródło danych

Dane Gospodarza pochodzą bezpośrednio od Użytkownika (rejestracja, korzystanie z Aplikacji) oraz — w zakresie statusu płatności — od Operatora płatności Stripe (za pośrednictwem webhooka aktualizującego status subskrypcji).

## 4. Dane Gości/Najemców (Operator = podmiot przetwarzający)

Gospodarz może wprowadzać do Aplikacji dane osób trzecich (Gości/Najemców):
- dane rezerwacji (obiekt, daty, kwoty; ewentualne dane kontaktowe wpisane przez Gospodarza),
- **[UZUPEŁNIENIE 2026-07-25 — funkcja w kodzie, przed wdrożeniem na produkcję]** **skład osobowy pobytu**: liczba dorosłych, liczba dzieci oraz liczba zwierząt towarzyszących. Są to pola **nieobowiązkowe**, wypełniane wyłącznie z inicjatywy Gospodarza (łączna liczba osób pozostaje sumą dorosłych i dzieci; zwierzęta nie są liczone jako osoby). W polach tych zapisywane są **wyłącznie liczby** — Aplikacja nie zbiera w nich imion, wieku, dat urodzenia ani innych danych identyfikujących poszczególne osoby, w tym dzieci. Dane te są widoczne **wyłącznie dla Gospodarza po zalogowaniu**: nie są publikowane w przewodniku dla gości ani na stronie z prośbą o opinię, nie są zawarte w publicznym eksporcie kalendarza (iCal) i nie są przekazywane do narzędzi analitycznych,
- **zapisy akceptacji regulaminu przez gości** — **[PRZEGLĄD 2026-07-22]** rekord z datą akceptacji, identyfikatorem anonimowej sesji i migawką zaakceptowanej treści; **obecny przepływ nie zbiera imienia ani odręcznego podpisu gościa**, jednak starsze zapisy mogą je zawierać (historyczna wersja funkcji) — zapisywane w `guides/{id}/signatures/{uid}`,
- **dane dostępowe** (PIN do drzwi, hasło WiFi) — przechowywane odrębnie w `guides/{id}/secrets/data`, ujawniane gościowi dopiero po elektronicznej akceptacji.

**[UZUPEŁNIENIE 2026-07-22] Mechanizm udostępniania przewodnika („dostęp po linku").** Przewodnik dla gości oraz strona z prośbą o opinię są publikowane pod unikalnym, trudnym do odgadnięcia adresem internetowym (linkiem), który Gospodarz przekazuje gościom. Strony te są dostępne bez logowania — **treść przewodnika (w tym publiczny kontakt Gospodarza) może odczytać każda osoba dysponująca linkiem**, a dane dostępowe (kod do drzwi, hasło WiFi) są ujawniane po elektronicznej akceptacji regulaminu obiektu przez osobę, która otworzyła link, bez weryfikacji jej tożsamości. O tym, komu udostępnić link, decyduje Gospodarz jako administrator danych zawartych w przewodniku. Strona z prośbą o opinię nie zawiera danych osobowych gościa. Publiczne strony przewodników są wyłączone z indeksowania przez wyszukiwarki i nie można ich wyszukać ani wylistować — dostęp wymaga znajomości pełnego adresu.

W zakresie tych danych **administratorem jest Gospodarz**. Operator przetwarza je wyłącznie na polecenie Gospodarza, na zasadach Umowy powierzenia (DPA). Osoby, których dane dotyczą (Goście), swoje prawa realizują wobec Gospodarza jako administratora. Operator wspiera Gospodarza w realizacji tych praw zgodnie z DPA.

> **[UZUPEŁNIENIE 2026-07-25 — do przeglądu prawnika, N4] Skład osobowy pobytu: kwalifikacja
> robocza.** Informacja o liczbie dorosłych, dzieci i zwierząt jest **daną zwykłą** dotyczącą
> gościa rezerwującego (opisuje skład towarzyszący jego pobytowi). Nie należy do szczególnych
> kategorii danych z art. 9 RODO i — w ocenie roboczej — nie czyni dziecka osobą zidentyfikowaną
> ani możliwą do zidentyfikowania (art. 4 pkt 1 RODO), bo przechowywana jest wyłącznie liczba.
> Art. 8 RODO (zgoda dziecka) nie ma tu zastosowania: dotyczy usług społeczeństwa informacyjnego
> oferowanych **bezpośrednio dziecku**, a Aplikacja jest oferowana Gospodarzowi. Wybór podstawy
> przetwarzania i obowiązek informacyjny wobec gościa (art. 13 RODO) spoczywają na **Gospodarzu**
> jako administratorze — Operator ich za niego nie wykonuje. *(Do rozważenia przez prawnika:
> czy warto, by Operator udostępniał Gospodarzom wzór informacji dla gości obejmujący także tę
> kategorię danych. Szersza analiza — `DPA-powierzenie.md` §3.)*

## 5. Odbiorcy danych i podmioty przetwarzające (subprocesorzy)

Dane mogą być powierzane następującym dostawcom działającym jako podmioty przetwarzające:

| Subprocesor | Rola / zakres | Uwaga o transferze |
|---|---|---|
| **Google Cloud / Firebase** (Google Cloud EMEA Ltd. / Google Ireland Ltd.) | Infrastruktura: uwierzytelnianie (Auth), baza danych (Firestore), pliki (Storage), funkcje serwerowe (Cloud Functions), hosting, Analytics, App Check/reCAPTCHA | Możliwy transfer poza EOG — [DO UZUPEŁNIENIA/POTWIERDZENIA: lokalizacja regionu Firestore/Storage projektu `moje-domki-6c77d` oraz mechanizm transferu — SCC / DPF. To wymaga sprawdzenia w konsoli Firebase i potwierdzenia prawnika.] |
| **Stripe** (Stripe Payments Europe, Ltd. / Stripe, Inc.) | Obsługa płatności subskrypcyjnych, dane rozliczeniowe | Możliwy transfer do USA — mechanizm: [DO UZUPEŁNIENIA/POTWIERDZENIA: SCC / DPF wg DPA Stripe] |
| **Google** (Google OAuth) | Logowanie kontem Google (dla użytkowników wybierających tę metodę) | jw. |
| **[UZUPEŁNIENIE 2026-08-10] Anthropic** ([DO POTWIERDZENIA: podmiot kontraktujący — Anthropic PBC czy podmiot irlandzki; ustalić w umowie, nie wpisywać z pamięci]) | **Wsparcie obsługi zgłoszeń.** Na polecenie Operatora model językowy przetwarza: treść zgłoszenia z formularza `/kontakt` wraz z podanym adresem e-mail oraz — przy diagnostyce konkretnego konta — dane konta Gospodarza wskazanego przez Operatora (stan konta, subskrypcja, ustawienia). **Zakres jest stopniowany i minimalizowany** (art. 5 ust. 1 lit. c): diagnostyka zaczyna się od stanu konta, a do danych rezerwacji sięga wyłącznie wtedy, gdy zgłoszenie tego wymaga. Przetwarzanie jest **wyłącznie odczytem** — kanał techniczny nie ma uprawnień do zapisu ani kasowania danych | Możliwy transfer poza EOG — [DO UZUPEŁNIENIA/POTWIERDZENIA: mechanizm legalizujący (SCC / EU-US DPF) wg umowy powierzenia Anthropic — do zweryfikowania u źródła] |

Operator korzysta z subprocesorów na podstawie umów powierzenia zapewniających poziom ochrony wymagany przez RODO. [DO UZUPEŁNIENIA: link do listy subprocesorów lub zobowiązanie do jej aktualizacji.]

**Transfery poza EOG:** [DO UZUPEŁNIENIA/POTWIERDZENIA przez prawnika: dokładne wskazanie mechanizmów legalizujących transfer — standardowe klauzule umowne (SCC) i/lub EU-US Data Privacy Framework, wraz z informacją, gdzie Użytkownik może uzyskać kopię zabezpieczeń. Nie wpisujemy tego „z pamięci" — do zweryfikowania u źródła.]

## 6. Okres przechowywania i usuwanie danych

**[PRZEGLĄD 2026-07-22 — okresy i zakres wpisane z faktycznego mechanizmu w `functions/index.js` (stan kodu 2026-07-22).]**

Dane przechowujemy przez czas trwania Konta oraz — po jego usunięciu lub wygaśnięciu — przez określony niżej okres retencji, po którym są trwale i automatycznie usuwane:

- **Usunięcie Konta na żądanie Użytkownika** (samodzielnie z poziomu Aplikacji — patrz sekcja 7) uruchamia proces (`deleteUserAccount`), który trwale usuwa: wszystkie przewodniki wraz z danymi dostępowymi, zapisami akceptacji gości i plikami (Storage), dane biznesowe (rezerwacje, ustawienia, sesje płatności), rekord klienta u Operatora płatności (Stripe), dokument profilu Użytkownika oraz konto uwierzytelniające. Usunięcie następuje niezwłocznie, bez okresu karencji.
- **Po anulowaniu Subskrypcji** dane są przechowywane jeszcze przez **30 dni** od anulowania (możliwość powrotu), a następnie trwale usuwane w takim samym pełnym zakresie jak wyżej (proces cykliczny `deleteExpiredAccountsData`; ponowne opłacenie w okresie karencji przerywa usuwanie).
- **Po zakończeniu bezpłatnego okresu próbnego bez wykupienia Subskrypcji** dane konta są przechowywane jeszcze przez **90 dni** od końca okresu próbnego, a następnie trwale usuwane w pełnym zakresie jak wyżej.
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

**[PRZEGLĄD 2026-07-22]** Konto można usunąć **samodzielnie z poziomu Aplikacji** (Konto → Usunięcie konta) — zarówno przy logowaniu hasłem (potwierdzenie hasłem), jak i przy logowaniu kontem Google (ponowne potwierdzenie logowania Google). Pozostałe żądania: [DO UZUPEŁNIENIA: kanał — e-mail; publiczny adres na /kontakt to obecnie kontakt@wynajempro.pl].

**Prawo skargi:** Przysługuje Państwu prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa; uodo.gov.pl).

**Uwaga dla Gości:** jeśli Państwa dane wprowadził do Aplikacji Gospodarz (rezerwacja, przewodnik), administratorem jest ten Gospodarz — swoje prawa należy realizować wobec niego. Operator przekaże żądanie właściwemu Gospodarzowi lub wesprze jego realizację zgodnie z DPA.

## 8. Dobrowolność podania danych

**[PRZEGLĄD 2026-07-22 — dostosowano do faktycznego przepływu konfiguracji konta (`CompleteProfileScreen.jsx`).]** Podanie adresu e-mail (lub użycie konta Google) jest niezbędne do założenia Konta. Przy pierwszej konfiguracji konta wymagane jest podanie nazwy (imienia i nazwiska lub nazwy podmiotu), adresu i telefonu — dane te służą funkcjom dokumentowo-rozliczeniowym Aplikacji i pozostają prywatne; podanie NIP/PESEL jest opcjonalne. **Publikacja kontaktu gościom w przewodniku jest opcjonalna** (przełącznik; publiczny e-mail ustawiany odrębnie). Zapis do newslettera jest dobrowolny. *(Do oceny prawnika: proporcjonalność wymogu adresu i telefonu na starcie względem zasady minimalizacji — art. 5 ust. 1 lit. c; funkcja generatora dokumentów jest obecnie wyłączona.)*

## 9. Pliki cookies i technologie pamięci lokalnej

WynajemPRO wykorzystuje:
- **Cookies i mechanizmy niezbędne** (Firebase Auth, sesja logowania) oraz **Local Storage / IndexedDB** — do działania aplikacji, utrzymania sesji i podręcznej pamięci (m.in. tryb offline, zapamiętanie sesji akceptacji przez gościa). Podstawa: niezbędność do świadczenia usługi (art. 173 ust. 3 Prawa telekomunikacyjnego / niezbędny charakter).
- **Cookies/technologie analityczne (Google/Firebase Analytics)** — uruchamiane **wyłącznie po wyrażeniu zgody** w bannerze cookie. Podstawa: zgoda (art. 6 ust. 1 lit. a RODO w zw. z art. 173 Prawa telekomunikacyjnego).

> **[Do przeglądu prawnika — N4, odnotowano 2026-07-24]** Powyższe odwołania do „Prawa
> telekomunikacyjnego (art. 173)" wymagają aktualizacji podstawy: od 10 listopada 2024 r.
> obowiązuje **Prawo komunikacji elektronicznej** (cookies — art. 399 PKE; definicja zgody
> odsyłająca do RODO — art. 402 PKE), które zastąpiło Prawo telekomunikacyjne. Aktualizacja
> pełnej podstawy należy do prawnika-człowieka; nie zmienia to treści merytorycznej (model
> opt-in i zgoda z RODO pozostają).

**[UZUPEŁNIENIE 2026-07-22] Analityka na stronach publicznych.** Zasady powyższe obowiązują także na publicznych stronach przewodnika gościa (`/guide/…`) i prośby o opinię (`/opinie/…`): technologie analityczne uruchamiają się tam wyłącznie po zgodzie osoby odwiedzającej, a administratorem danych analitycznych zbieranych na tych stronach jest Operator. Identyfikator konkretnej strony (element linku przewodnika) jest w danych analitycznych maskowany i nie jest przekazywany do narzędzia analitycznego. *(Stan faktyczny zweryfikowany w kodzie 2026-07-22: maskowanie wdrożone w `src/App.jsx` — funkcja `trackedPagePath` zamienia ścieżki `/guide/…` i `/opinie/…` na zbiorcze `/guide/[id]` / `/opinie/[id]` i odcina parametry adresu przed wysyłką zdarzenia `page_view`; wdrożone na produkcji — deploy 2026-07-22, commit `e850136`.)*

**Stan faktyczny (zweryfikowany w kodzie `firebase.js`):** Analytics inicjalizuje się dopiero, gdy zgoda została zapisana (`cookie_consent === 'true'`); przy wyborze „Tylko niezbędne" lub zamknięciu bannera skrypt analityczny nie jest ładowany. Jest to model opt-in zgodny z zasadą uprzedniej zgody. **Jedyne przetwarzanie uruchamiane po zgodzie to analiza ruchu (Google/Firebase Analytics) — Aplikacja nie personalizuje na tej podstawie treści ani komunikatów i nie stosuje cookies reklamowych.**

**[UZUPEŁNIENIE 2026-07-24] Wycofanie i zmiana zgody.** Zgodę na cookies analityczne można w każdej chwili **zmienić lub wycofać — równie łatwo, jak jej udzielić** (art. 7 ust. 3 RODO). Służą do tego dwa równorzędne wejścia: link **„Ustawienia cookies"** w stopce serwisu oraz przycisk **„Zmień lub wycofaj zgodę na cookies"** na tej stronie — oba ponownie otwierają banner zgody (bez przeładowania strony), z symetrycznym wyborem „Akceptuję" / „Wycofaj zgodę" oraz informacją o aktualnym stanie wyboru. Wycofanie zgody **realnie zatrzymuje** działanie Google/Firebase Analytics (ustawienie standardowej flagi opt-out dla identyfikatora pomiaru, wyłączenie zbierania danych po stronie Firebase oraz usunięcie istniejących plików cookies `_ga*`) — nie ogranicza się do ukrycia bannera. Wycofanie zgody **nie wpływa na zgodność z prawem** przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem. Ponieważ jedyną kategorią cookies niewymagającą niezbędności jest analityka, wybór ma charakter binarny (zgoda / tylko niezbędne) i nie wymaga dodatkowej granulacji.

> **[UZUPEŁNIENIE 2026-07-24 — pozycja domknięta]** Wcześniejsza uwaga o braku łatwego
> wycofania i zmiany zgody (wymóg równej łatwości — art. 7 ust. 3 RODO) jest **zamknięta**:
> mechanizm opisany wyżej **działa na produkcji od 2026-07-24** (zadanie N6.1, commit
> `495aace`; przepływ zgoda → ponowne otwarcie panelu → wycofanie wraz z usunięciem plików
> cookies `_ga*` przeklikany na produkcji). Akapit powyżej opisuje zatem **stan obowiązujący**,
> a nie stan docelowy. Pozycja zeszła z listy braków w `Bezpieczenstwo-kont-i-danych.md`
> (sekcja 9.1). Otwarta pozostaje wyłącznie kwestia **aktualizacji podstawy prawnej cookies**
> (Prawo telekomunikacyjne → Prawo komunikacji elektronicznej) — do rozstrzygnięcia przez
> prawnika w ramach N4.

## 10. Bezpieczeństwo

Stosujemy środki techniczne i organizacyjne odpowiednie do ryzyka, m.in.: reguły dostępu na poziomie bazy danych (Firestore Security Rules) ograniczające dostęp do danych do właściciela konta, wymóg zweryfikowanego adresu e-mail dla operacji na danych, oddzielne przechowywanie danych wrażliwych (kody/hasła gości w odrębnej, chronionej kolekcji ujawnianej dopiero po akceptacji gościa), walidację schematu zapisywanych danych, zabezpieczenia przed automatycznymi nadużyciami (App Check / reCAPTCHA), szyfrowanie transmisji (HTTPS). Szczegółowy katalog środków dla danych powierzonych zawiera DPA (§6).

## 11. Zmiany Polityki

Politykę możemy aktualizować. O istotnych zmianach poinformujemy [DO UZUPEŁNIENIA: kanał]. Aktualna wersja jest zawsze dostępna w Aplikacji.

## 12. Kontakt

[DO UZUPEŁNIENIA: e-mail, adres]. W sprawach dotyczących danych Gości — prosimy kierować się do właściwego Gospodarza jako administratora.

---

*Projekt przygotowany na podstawie stanu faktycznego zweryfikowanego w kodzie (`firebase.js`, `functions/index.js`, `firestore.rules`, `GuestGuideView.jsx`, `SettingsModal.jsx`, `AccountModal.jsx`, `CompleteProfileScreen.jsx`, `ContactPage.jsx`, `ConsentNotice.jsx`, `App.jsx`, `firebase.json`, `SeoTags.jsx`, `public/robots.txt`). Pełny przegląd aktualności: 2026-07-22; mechanizm wycofania zgody na cookies opisany 2026-07-24 jako stan obowiązujący — wdrożony na produkcję 2026-07-24 (commit `495aace`). Opis składu osobowego pobytu (sekcja 4) dodany 2026-07-25 na podstawie kodu gałęzi roboczej (`firestore.rules`, `src/pages/dashboard/ManagerApp.jsx`, `src/pages/dashboard/modals/AddEditEntryModal.jsx`, `src/utils/guestCount.js`, `functions/index.js`) — **funkcja przed wdrożeniem na produkcję**. Podstawy prawne i daty — patrz `Checklista-zgodnosci.md`; ocena modelu „dostępu po linku" — `Ocena-linki-guide-opinie.md`. Wymaga weryfikacji prawnika-człowieka przed publikacją.*
