# PROJEKT — wymaga weryfikacji prawnika-człowieka przed publikacją

> **Status:** PROJEKT (draft). Przygotował agent `legal` w ramach blokera launchu **N4**.
> NIE jest to dokument wiążący. Struktura wg art. 28 RODO. Wdrożenie (np. jako akceptowany
> załącznik do Regulaminu / osobny dokument w panelu) — po akceptacji właściciela i prawnika,
> realizuje `dev`. Placeholdery `[DO UZUPEŁNIENIA: …]` = dane, których agent nie zmyśla.
> **Data projektu:** 2026-07-04 · **Weryfikacja podstaw:** 2026-07-04.
>
> **Podstawa struktury:** art. 28 ust. 3 RODO (obligatoryjne elementy powierzenia).
> **Model akceptacji (do decyzji właściciela + prawnik):** rekomendowane zawarcie DPA jako
> integralnej części Regulaminu akceptowanej przy rejestracji (art. 28 ust. 9 RODO dopuszcza
> formę elektroniczną). Alternatywnie — osobny dokument akceptowany w panelu.
>
> **Aktualizacja 2026-07-22 (legal, ocena X9 — `Ocena-linki-guide-opinie.md`, decyzja
> właściciela):** dodano §2 ust. 5 — charakterystyka udostępniania „po linku" (publikacja
> treści przewodnika pod nieodgadywalnym URL bez uwierzytelnienia) oraz uzupełniono katalog
> środków w §6 o środki ograniczające ryzyko tego modelu. Po wdrożeniu pakietu na produkcję
> (deploy hostingu 2026-07-22, commit `e850136`) katalog §6 uzupełniono dodatkowo o nagłówek
> `X-Robots-Tag` i maskowanie identyfikatora strony w analityce — oba środki zweryfikowane
> w kodzie. Zmiany oznaczone znacznikiem `[UZUPEŁNIENIE 2026-07-22]`.
>
> **PRZEGLĄD 2026-07-22 (przed spotkaniem z prawnikiem, na zlecenie właściciela):** rewizja
> aktualności całego dokumentu. Przeredagowano nieaktualną ramkę bramki rozliczalności przy §6
> (blokery N1–N3 wdrożone na produkcję 2026-07-09/10 — dotychczasowa treść opisywała je jako
> zaślepione), uzupełniono §9 o faktyczne okresy retencji i pełny zakres usuwania danych wraz
> z opisem odporności procesu na awarie, doprecyzowano §3 (obecny przepływ akceptacji nie zbiera
> imienia ani podpisu gościa). Zmiany oznaczone `[PRZEGLĄD 2026-07-22]`. Szczegółowy,
> zweryfikowany katalog zabezpieczeń — `Bezpieczenstwo-kont-i-danych.md`.
>
> **[UZUPEŁNIENIE 2026-07-25 (legal, X14 — rozbicie liczby gości)]:** uzupełniono **§3**
> (kategorie danych powierzonych) o **skład osobowy pobytu** — liczbę dorosłych, dzieci
> i zwierząt w rezerwacji — wraz z oceną roboczą, dlaczego **nie** dopisujemy „osób małoletnich"
> do kategorii osób, których dane dotyczą. **Funkcja jest w kodzie (gałąź robocza) i NIE została
> wdrożona na produkcję** — wpis w §3 opisuje więc zakres powierzenia **po wdrożeniu**, a nie
> stan dzisiejszy; termin i kolejność wdrożenia (reguły bazy przed frontem) to odrębna decyzja
> właściciela. **Zmiana nie dotyka §6** — katalog środków bezpieczeństwa pozostaje bez zmian,
> bo ekspozycja danych się nie zmienia (nowe pola leżą wyłącznie za bramką właściciela:
> `isOwnerAndVerified` + `hasActiveSubscription`; brak ścieżki odczytu publicznego, brak w iCal,
> brak w analityce — zweryfikowane w kodzie 2026-07-25). Równoległe uzupełnienie:
> `Polityka-prywatnosci.md` §4. *(Adnotację datowano dniem faktycznej edycji dokumentu;
> zlecenie posługiwało się datą 2026-07-24.)*

---

# Umowa powierzenia przetwarzania danych osobowych (DPA)

**Wersja:** 1.0 · **Obowiązuje od:** 26 sierpnia 2026 r. *(decyzja właściciela 2026-08-26, spójnie z Regulaminem i Polityką)*

zawierana pomiędzy:

- **Administratorem** — Użytkownikiem (Gospodarzem) korzystającym z Aplikacji WynajemPRO, który wprowadza do niej dane osobowe swoich Gości/Najemców, oraz
- **Podmiotem przetwarzającym (Procesorem)** — **Szymon Wasiak** — osoba fizyczna (działalność nierejestrowana; NIP, REGON i KRS nie mają zastosowania), adres do korespondencji: **Nowogródzka 9/9, 82-300 Elbląg** *(dane podane przez właściciela 2026-08-26)*,

zwanymi łącznie „Stronami". Umowa stanowi wykonanie obowiązku z art. 28 ust. 3 RODO i wiąże się z korzystaniem przez Administratora z Aplikacji.

## §1. Definicje

Pojęcia „dane osobowe", „przetwarzanie", „administrator", „podmiot przetwarzający", „naruszenie ochrony danych" mają znaczenie nadane im w RODO (Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679).

## §2. Przedmiot i charakter powierzenia

1. Administrator powierza Procesorowi przetwarzanie danych osobowych w zakresie i celu niezbędnym do świadczenia usług Aplikacji WynajemPRO na rzecz Administratora.
2. **Cel przetwarzania:** umożliwienie Administratorowi zarządzania wynajmem, w tym prowadzenia rezerwacji, publikowania przewodników dla gości oraz udostępniania gościom danych dostępowych po elektronicznej akceptacji regulaminu.
3. **Charakter przetwarzania:** przechowywanie, utrwalanie, organizowanie, udostępnianie (gościom — na polecenie Administratora), usuwanie — w ramach infrastruktury Aplikacji.
4. Procesor przetwarza dane wyłącznie na udokumentowane polecenie Administratora, którym jest niniejsza Umowa oraz korzystanie z funkcji Aplikacji zgodnie z jej przeznaczeniem i Regulaminem.
5. **[UZUPEŁNIENIE 2026-07-22] Charakterystyka udostępniania („dostęp po linku"):** publikowanie przewodnika dla gości polega na udostępnieniu jego treści pod unikalnym, trudnym do odgadnięcia adresem URL, **dostępnym bez uwierzytelnienia dla każdej osoby dysponującej linkiem**; dane dostępowe (kod do drzwi, hasło WiFi) są ujawniane po elektronicznej akceptacji regulaminu obiektu przez osobę otwierającą link, bez weryfikacji jej tożsamości. Administrator, korzystając z funkcji przewodnika, akceptuje ten kanał udostępniania jako element usługi oraz **samodzielnie decyduje, komu przekazuje link, i odpowiada za jego dystrybucję**; Procesor nie kontroluje dalszego przekazywania linku przez osoby, którym Administrator go udostępnił. Środki ograniczające ryzyko tego modelu opisano w §6. *(Do oceny prawnika: czy ten ustęp wystarczająco realizuje wymóg opisania charakteru przetwarzania z art. 28 ust. 3 zd. 1 RODO i czy potrzebne jest dodatkowe, wyraźne oświadczenie Administratora o akceptacji kanału.)*

## §3. Kategorie osób i kategorie danych

**Kategorie osób, których dane dotyczą:**
- Goście / Najemcy obiektów Administratora,
- inne osoby, których dane Administrator zdecyduje się wprowadzić do Aplikacji.

**Kategorie danych** *(katalog ustalony na podstawie faktycznego modelu danych Aplikacji — Agent-Process-Map, GuestGuideView.jsx, firestore.rules)*:
- dane rezerwacji: nazwa obiektu, daty pobytu, kwoty oraz ewentualne dane identyfikacyjne/kontaktowe gościa wpisane przez Administratora,
- **[UZUPEŁNIENIE 2026-07-25 — funkcja w kodzie, przed wdrożeniem na produkcję]** **skład osobowy pobytu:** liczba dorosłych, liczba dzieci oraz liczba zwierząt towarzyszących — pola **opcjonalne**, uzupełniane wyłącznie z inicjatywy Administratora, przechowywane jako **wartości liczbowe** w dokumencie rezerwacji (`users/{uid}/rentals/{id}`; łączna liczba osób pozostaje sumą dorosłych i dzieci). Pola te **nie zawierają danych identyfikujących poszczególne osoby**, w tym dzieci (brak imienia, wieku, daty urodzenia) — przechowywana jest sama liczba. Nie są to dane szczególnych kategorii w rozumieniu art. 9 RODO. Dostęp: wyłącznie Administrator po zalogowaniu (reguły bazy: właściciel + zweryfikowany e-mail + aktywna subskrypcja); dane nie są publikowane w przewodniku dla gości ani na stronie opinii, nie występują w publicznym eksporcie kalendarza (iCal) i nie są przekazywane do narzędzi analitycznych,
- **dane akceptacji regulaminu:** **[PRZEGLĄD 2026-07-22]** data akceptacji, identyfikator anonimowej sesji przeglądarki gościa oraz migawka zaakceptowanej treści regulaminu — przechowywane w `guides/{id}/signatures`. **Obecny przepływ nie zbiera imienia gościa ani odręcznego podpisu**; starsze zapisy (z wcześniejszej wersji funkcji) mogą je zawierać. *(Do oceny prawnika: czy identyfikator anonimowej sesji stanowi dane osobowe w rozumieniu art. 4 pkt 1 — w ocenie roboczej jest to dana spseudonimizowana, pozwalająca powiązać akceptację z urządzeniem, nie z tożsamością osoby.)*
- **dane dostępowe udostępniane gościom:** kod do drzwi (PIN), hasło WiFi — przechowywane w `guides/{id}/secrets/data` (dane wrażliwe operacyjnie; nie są „szczególnymi kategoriami" w rozumieniu art. 9 RODO, ale wymagają podwyższonej ochrony).

> **Uwaga:** Aplikacja nie jest przeznaczona do przetwarzania szczególnych kategorii danych
> (art. 9 RODO). Administrator zobowiązuje się nie wprowadzać takich danych. *(Do potwierdzenia
> przez prawnika, czy potrzebne dodatkowe zastrzeżenie umowne.)*

> **[UZUPEŁNIENIE 2026-07-25 — ocena robocza] Liczba dzieci a katalog kategorii osób.**
> Do katalogu **kategorii osób, których dane dotyczą, nie dopisujemy „osób małoletnich"**.
> Uzasadnienie: pole liczbowe nie pozwala zidentyfikować ani wyodrębnić żadnego dziecka
> (art. 4 pkt 1 RODO) — przechowywana jest wyłącznie liczba, bez imienia, wieku i daty
> urodzenia. Osobą, której dane dotyczą, pozostaje **gość rezerwujący**, a informacja o składzie
> pobytu jest daną **o nim** (opisuje okoliczności jego pobytu). Dane dzieci pojawiłyby się
> w Aplikacji dopiero wtedy, gdyby Administrator wpisał je samodzielnie w polach opisowych
> (nazwa gościa, notatka do rezerwacji) — ten przypadek pokrywa już drugi punkt katalogu
> kategorii osób („inne osoby, których dane Administrator zdecyduje się wprowadzić do Aplikacji"),
> a odpowiedzialność za taki wpis spoczywa na Administratorze.
>
> **Skala zmiany — bez eskalacji.** Motyw 38 RODO wiąże szczególną ochronę dzieci przede
> wszystkim z **marketingiem, profilowaniem** oraz **usługami oferowanymi bezpośrednio dziecku** —
> żadna z tych sytuacji tu nie zachodzi (usługa jest oferowana Administratorowi, dane nie są
> profilowane ani wykorzystywane marketingowo). Art. 8 RODO (zgoda dziecka) dotyczy usług
> społeczeństwa informacyjnego oferowanych bezpośrednio dziecku — nie ma zastosowania.
> Zmiana **nie uruchamia obowiązku oceny skutków** (art. 35 RODO): wykaz Prezesa UODO z 17.06.2019
> (M.P. 2019 poz. 666) nie wymienia danych dzieci wśród rodzajów operacji wymagających DPIA,
> a zasada kierunkowa zakłada spełnienie **co najmniej dwóch** kryteriów z wykazu — tutaj nie
> jest spełnione żadne (brak profilowania, danych szczególnych kategorii, dużej skali,
> systematycznego monitorowania). Ewentualna ocena skutków po stronie Administratora zależy od
> **jego** całego procesu, nie od tej funkcji; Procesor wspiera go zgodnie z §5 pkt 6.
> *(Weryfikacja źródeł: motyw 38 RODO oraz wykaz Prezesa UODO — 2026-07-25.)*
>
> *(Do rozstrzygnięcia przez prawnika: czy mimo powyższego wymienić „osoby małoletnie" wprost
> w kategoriach osób jako zapis ostrożnościowy. Koszt takiego zapisu jest niski, ale sugerowałby
> szerszy zakres powierzenia niż faktyczny; nasza rekomendacja robocza — pozostawić jak wyżej.)*

## §4. Czas trwania

Powierzenie trwa przez okres obowiązywania umowy o świadczenie usług (posiadania aktywnego Konta) i kończy się z chwilą usunięcia Konta lub rozwiązania umowy, z zastrzeżeniem zasad usuwania danych z §9.

## §5. Obowiązki Procesora (art. 28 ust. 3 RODO)

Procesor zobowiązuje się:
1. **przetwarzać dane wyłącznie na udokumentowane polecenie Administratora** (w tym co do transferów poza EOG), chyba że obowiązek wynika z prawa UE lub państwa członkowskiego — wówczas informuje o tym Administratora przed przetwarzaniem, o ile prawo tego nie zakazuje (art. 28 ust. 3 lit. a);
2. **zapewnić zobowiązanie do zachowania poufności** osób upoważnionych do przetwarzania danych (art. 28 ust. 3 lit. b);
3. **stosować środki bezpieczeństwa** wymagane art. 32 RODO (patrz §6) (art. 28 ust. 3 lit. c);
4. **przestrzegać warunków korzystania z subprocesorów** (§7) (art. 28 ust. 3 lit. d);
5. **pomagać Administratorowi** — w miarę możliwości i za pomocą odpowiednich środków technicznych — w realizacji żądań osób, których dane dotyczą (prawa z rozdziału III RODO) (art. 28 ust. 3 lit. e);
6. **pomagać Administratorowi** w wypełnianiu obowiązków z art. 32–36 RODO (bezpieczeństwo, zgłaszanie naruszeń, ocena skutków) (art. 28 ust. 3 lit. f);
7. **po zakończeniu świadczenia usług usunąć lub zwrócić dane** zgodnie z §9 (art. 28 ust. 3 lit. g);
8. **udostępniać Administratorowi informacje** niezbędne do wykazania spełnienia obowiązków oraz umożliwiać audyty/inspekcje i przyczyniać się do nich (art. 28 ust. 3 lit. h) — na zasadach z §8;
9. **niezwłocznie informować Administratora**, jeżeli jego polecenie stanowi naruszenie RODO lub innych przepisów o ochronie danych.

## §6. Bezpieczeństwo (art. 32 RODO)

Procesor wdraża środki techniczne i organizacyjne odpowiednie do ryzyka, w szczególności (odzwierciedlają rzeczywistą architekturę Aplikacji):
- kontrolę dostępu opartą na regułach bazy danych (Firestore Security Rules) ograniczających dostęp do danych do właściciela konta i — w przypadku sekretów — ujawnianie ich gościowi dopiero po zapisaniu autoryzowanego podpisu,
- **oddzielne przechowywanie danych dostępowych** (PIN/WiFi) w wydzielonej kolekcji (subkolekcja `secrets`) z warunkowym dostępem — dane dostępowe nie są zapisywane w publicznie czytelnym dokumencie przewodnika,
- szyfrowanie transmisji (HTTPS/TLS),
- zabezpieczenia przed automatycznymi nadużyciami (App Check / reCAPTCHA),
- korzystanie z certyfikowanej infrastruktury chmurowej (Google Cloud / Firebase),
- **[UZUPEŁNIENIE 2026-07-22] środki ograniczające ryzyko modelu „dostępu po linku" (§2 ust. 5):** identyfikatory przewodników o wysokiej entropii, generowane kryptograficznie (UUID); rozdzielenie publicznego odczytu pojedynczego dokumentu od listowania kolekcji (listowanie wyłącznie dla właściciela — wyklucza masowe pozyskanie linków); walidacja schematu zapisów wraz z zakazem dodawania danych dostępowych do dokumentu publicznego; wyłączenie stron przewodników i stron opinii z indeksowania przez wyszukiwarki (`robots.txt`, metatag `noindex, nofollow` oraz **serwerowy nagłówek `X-Robots-Tag: noindex, nofollow`** dla tras `/guide/**` i `/opinie/**` — skuteczny niezależnie od tego, czy robot wykonuje JavaScript); polityka `Referrer-Policy: strict-origin-when-cross-origin` oraz atrybuty `noreferrer` na łączach wychodzących, zapobiegające wyciekowi pełnego adresu linku do witryn zewnętrznych; **maskowanie identyfikatora strony w danych analitycznych** — do narzędzia analitycznego trafia wyłącznie zbiorcza ścieżka (`/guide/[id]`, `/opinie/[id]`), bez identyfikatora będącego elementem linku i bez parametrów adresu.

> **[UZUPEŁNIENIE 2026-07-22 — po wdrożeniu] Weryfikacja spójności deklaracji ze stanem
> faktycznym (rozliczalność, art. 5 ust. 2):** wszystkie środki wymienione w punkcie „dostęp
> po linku" — w tym nagłówek `X-Robots-Tag` i maskowanie identyfikatora w analityce —
> zweryfikowano w kodzie 2026-07-22 (`firebase.json`, sekcje nagłówków dla `/guide/**`
> i `/opinie/**`; `src/App.jsx`, funkcja `trackedPagePath`; pozostałe: `firestore.rules`,
> `GuideBuilder.jsx`, `SeoTags.jsx`, `public/robots.txt` — szczegóły w
> `Ocena-linki-guide-opinie.md`). Wdrożenie na produkcję: deploy hostingu 2026-07-22,
> commit `e850136` (potwierdzenie właściciela; nagłówek `x-robots-tag` zweryfikowany na
> `wynajempro.com`). Wcześniejsza wersja tej ramki wstrzymywała wpisanie obu środków do
> katalogu do czasu wdrożenia — warunek spełniony, ramka zaktualizowana.

> **[PRZEGLĄD 2026-07-22] Bramka rozliczalności — status: SPEŁNIONA.** Zasada obowiązująca
> ten dokument brzmi: *DPA nie deklaruje środków, których kod nie egzekwuje* (rozliczalność,
> art. 5 ust. 2 RODO). Wcześniejsza wersja tej ramki wstrzymywała publikację, ponieważ w chwili
> jej pisania (2026-07-04) walidacja schematu, wymóg weryfikacji e-mail i sprawdzanie
> subskrypcji były w regułach zaślepione. **Ten stan już nie obowiązuje:** wszystkie trzy
> mechanizmy zostały wdrożone i wydane na produkcję 2026-07-09/10 (weryfikacja e-mail —
> warunek `email_verified` w `isOwnerAndVerified`; egzekwowanie subskrypcji — `hasActiveSubscription`
> z szybką ścieżką na oświadczeniu tokenu i zapasowym sprawdzeniem dokumentu; walidacja schematu —
> allowlisty pól i limity w `isValidRental`, `isValidGuide`, `isValidSettings`), a ich obecność
> potwierdzono ponownie w stanie `firestore.rules` z 2026-07-22. Środki dla modelu „dostępu po
> linku" zweryfikowano i wydano tego samego dnia (ramka wyżej). **Katalog §6 odpowiada zatem
> stanowi faktycznemu produkcji na dzień 2026-07-22** — z zastrzeżeniem, że egzekwowanie
> zabezpieczenia przed automatycznymi nadużyciami (App Check) jest konfigurowane po stronie
> konsoli dostawcy i wymaga potwierdzenia przez właściciela (patrz `Bezpieczenstwo-kont-i-danych.md`,
> sekcja „Ograniczenia weryfikacji").

> **[UZUPEŁNIENIE 2026-07-25] Nowe pola rezerwacji a katalog §6 — bez zmian w środkach.**
> Rozbicie liczby gości (§3) nie wymagało dopisania żadnego środka: nowe pola są objęte tymi
> samymi mechanizmami co reszta dokumentu rezerwacji — izolacją danych konta (odczyt wyłącznie
> dla zweryfikowanego właściciela z aktywną subskrypcją) oraz **walidacją schematu** (pola
> `adults`, `children`, `pets` dodane do allowlisty `isValidRental` z wymogiem typu liczbowego,
> wraz z lustrzanym testerem po stronie funkcji). Zgodnie z zasadą rozliczalności odnotowujemy,
> że **zmiana ta jest w kodzie i nie została jeszcze wydana na produkcję** — do czasu wdrożenia
> reguł opis z §3 wyprzedza stan faktyczny bazy.

## §7. Podpowierzenie (subprocesorzy) — art. 28 ust. 2 i 4 RODO

1. Administrator udziela Procesorowi **ogólnej zgody** na korzystanie z subprocesorów niezbędnych do świadczenia usługi. Na dzień zawarcia Umowy są to:
   - **Google / Firebase (Google Cloud EMEA Ltd. / Google Ireland Ltd.)** — infrastruktura (Auth, Firestore, Storage, Functions, hosting),
   - *(nota wyjaśniająca — analiza 2026-08-26: **Stripe nie jest subprocesorem danych powierzonych** i został zdjęty z tej listy. Do Stripe trafiają wyłącznie dane rozliczeniowe Gospodarza — relacja, w której Operator jest administratorem, opisana w Polityce prywatności §5; dane Gości nie są przekazywane Stripe w żadnym przepływie, co potwierdzono w kodzie funkcji płatności)*,
   - **Google (OAuth)** — w zakresie logowania,
   - *(nota — decyzja właściciela 2026-08-26: **Anthropic wykreślony z listy subprocesorów
     danych powierzonych**. Od dnia wejścia w życie niniejszej Umowy kanał wsparcia oparty na
     modelu językowym **nie odczytuje danych Gości** — rezerwacji, przewodników ani zapisów
     akceptacji; diagnostyka kończy się na danych, których administratorem jest Operator
     (Polityka prywatności §5), a dane Gości ogląda wyłącznie Operator osobiście.
     Warunek publikacji WYKONANY 2026-08-26: poziom 3 procedury wsparcia zniesiony z chwilą
     publikacji Umowy (bramka F4a), więc postanowienie jest prawdziwe od pierwszego dnia
     obowiązywania.)*

2. Procesor **informuje Administratora o zamierzonych zmianach** dotyczących dodania lub zastąpienia subprocesorów, dając możliwość wyrażenia sprzeciwu. Informacja przekazywana jest e-mailem na adres przypisany do Konta lub komunikatem w Aplikacji, z co najmniej **14-dniowym wyprzedzeniem** *(decyzja właściciela 2026-08-26)*.
3. Procesor nakłada na subprocesorów obowiązki ochrony danych co najmniej równoważne obowiązkom z niniejszej Umowy (art. 28 ust. 4).
4. **Transfery poza EOG:** Google — SCC w Cloud Data Processing Addendum oraz certyfikacja Google LLC w EU-US Data Privacy Framework (dane Firestore/Storage w spoczynku w regionie eur3 — UE; część usług przetwarza dane w USA). Kopie zabezpieczeń — adresy w Polityce prywatności §5 oraz u Procesora na żądanie. *(analiza prawna 2026-08-26 — `Analiza-prawna-2026-08-26.md`)*

## §8. Prawo do audytu i informacji

1. Procesor udostępnia Administratorowi informacje niezbędne do wykazania zgodności z art. 28 RODO.
2. Administrator ma prawo do audytu; z uwagi na charakter usługi (współdzielona infrastruktura SaaS, wielu administratorów) audyt realizowany jest przede wszystkim przez udostępnienie posiadanej dokumentacji, certyfikatów i raportów dostawców infrastruktury; inspekcja na miejscu jest wyłączona z uwagi na współdzieloną infrastrukturę SaaS *(decyzja właściciela 2026-08-26; dopuszczalność wyłączenia inspekcji — do przeglądu przy najbliższej rewizji prawnej)*. *(Zakres i tryb audytu w SaaS to typowy przedmiot negocjacji — do ustalenia z prawnikiem.)*

## §9. Usunięcie / zwrot danych po zakończeniu

1. Po zakończeniu świadczenia usług Procesor, zależnie od decyzji Administratora, usuwa lub zwraca dane powierzone oraz usuwa istniejące kopie, chyba że prawo nakazuje przechowywanie.
2. **[PRZEGLĄD 2026-07-22] Mechanizm faktyczny (zweryfikowany w kodzie `functions/index.js`):**
   - **Usunięcie Konta przez Administratora** (samodzielnie w Aplikacji) uruchamia niezwłoczne, nieodwracalne usunięcie: przewodników wraz z subkolekcją danych dostępowych i zapisami akceptacji gości, powiązanych plików w magazynie plików, danych biznesowych, rekordu klienta u operatora płatności oraz konta uwierzytelniającego i dokumentu profilu. **Bez okresu karencji.**
   - **Konta wygasłe** są usuwane w tym samym pełnym zakresie przez proces cykliczny (`deleteExpiredAccountsData`, uruchamiany codziennie) po upływie: **30 dni** od anulowania Subskrypcji albo **90 dni** od zakończenia bezpłatnego okresu próbnego bez wykupienia Subskrypcji.
   - **Odporność procesu usuwania (stan na 2026-07-22):** kasowanie następuje w kolejności od danych najbardziej wrażliwych (dane dostępowe, zapisy akceptacji, pliki) do dokumentu konta, który usuwany jest jako ostatni. Niepowodzenie któregokolwiek kroku przerywa operację i pozostawia dokument konta jako znacznik, dzięki czemu kolejny przebieg procesu ponawia i dokańcza usuwanie; proces jest w pełni idempotentny. Rozwiązanie to wyklucza sytuację, w której publicznie dostępne treści przewodnika przetrwałyby usunięcie konta. *(Wdrożone i wydane na produkcję 2026-07-22 — zamknięcie ustalenia C.1 z `Uwagi-N5-dla-prawnika.md` oraz ustalenia dotyczącego rekordu klienta u operatora płatności w procesie cyklicznym.)*
3. Administrator może samodzielnie usuwać poszczególne przewodniki, dane dostępowe i zapisy akceptacji z poziomu Aplikacji.
4. **[PRZEGLĄD 2026-07-22]** Zwrot danych przed usunięciem: Aplikacja udostępnia eksport danych rozliczeniowych (CSV) oraz eksport kalendarza (iCal). *(Do oceny prawnika: czy zakres tych eksportów jest wystarczający dla realizacji „zwrotu danych" z art. 28 ust. 3 lit. g oraz prawa do przenoszenia danych z art. 20 RODO — dziś nie obejmuje on treści przewodników ani zapisów akceptacji gości.)* **[UZUPEŁNIENIE 2026-07-25]** Skład osobowy pobytu (§3) również nie jest objęty żadnym z tych eksportów — pozostaje wyłącznie w interfejsie Aplikacji.

## §10. Zgłaszanie naruszeń

Procesor bez zbędnej zwłoki, po stwierdzeniu naruszenia ochrony danych powierzonych, zgłasza je Administratorowi na adres e-mail przypisany do Konta Administratora *(decyzja właściciela 2026-08-26)* wraz z informacjami umożliwiającymi Administratorowi wywiązanie się z obowiązku z art. 33 RODO. *(RODO nie wyznacza procesorowi sztywnego terminu godzinowego — „bez zbędnej zwłoki". Ewentualny termin umowny do ustalenia z prawnikiem.)*

## §11. Odpowiedzialność

1. Odpowiedzialność Stron wobec osób, których dane dotyczą, reguluje art. 82 RODO i nie podlega ograniczeniu.
2. W stosunkach między Stronami łączna odpowiedzialność każdej ze Stron z niniejszej Umowy ograniczona jest do wysokości opłat za Subskrypcję zapłaconych przez Administratora w okresie 12 miesięcy poprzedzających zdarzenie wywołujące szkodę.
3. Ograniczenie z ust. 2 nie dotyczy szkody wyrządzonej umyślnie (art. 473 § 2 Kodeksu cywilnego).
4. Wobec Administratorów będących konsumentami lub przedsiębiorcami na prawach konsumenta ograniczenia obowiązują wyłącznie w zakresie dopuszczalnym przez bezwzględnie obowiązujące przepisy prawa (spójnie z Regulaminem §12 ust. 2). *(analiza prawna 2026-08-26 — `Analiza-prawna-2026-08-26.md`)*

## §12. Postanowienia końcowe

1. W sprawach nieuregulowanych stosuje się RODO i prawo polskie.
2. Umowa wiąże z chwilą akceptacji Regulaminu przy rejestracji Konta *(decyzja właściciela 2026-08-26)*. *(Zastrzeżenie do prawnika: pole zgody przy rejestracji wymienia dziś Regulamin i Politykę, nie DPA — patrz `Bramka-publikacji-2026-08-26.md` §8.2.)*
3. W razie sprzeczności między Umową a Regulaminem w zakresie ochrony danych powierzonych — pierwszeństwo ma niniejsza Umowa.

---

*Projekt oparty na faktycznym modelu danych Aplikacji (Agent-Process-Map, `firestore.rules`, `functions/index.js`, `GuestGuideView.jsx`) i strukturze art. 28 RODO. Uzupełnienia 2026-07-22 na podstawie oceny X9 (`Ocena-linki-guide-opinie.md`); środki §6 dla modelu „po linku" zweryfikowane w kodzie po deployu (commit `e850136`). Uzupełnienie §3 z 2026-07-25 (skład osobowy pobytu) oparte na kodzie gałęzi roboczej — funkcja przed wdrożeniem na produkcję. Podstawy prawne i daty — patrz `Checklista-zgodnosci.md`. Wymaga weryfikacji prawnika-człowieka przed publikacją.*
