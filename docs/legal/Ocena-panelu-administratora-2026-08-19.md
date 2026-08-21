# OCENA WEWNĘTRZNA — panel administratora `/admin` a RODO i prawo konsumenckie

> **Status:** ocena robocza agenta `legal`. **NIE jest to porada prawna ani dokument wiążący.**
> Wskazane niżej rozstrzygnięcia oznaczone jako „ocena robocza" to stanowisko zespołu, nie
> opinia prawnika. Ocena prawnika-człowieka dla całego pakietu (bloker **N4**) jest **nadal
> oczekiwana** — `Raport-dla-prawnika-2026-07-22.md`. Kwestie wymagające jego rozstrzygnięcia
> zebrano w sekcji 6 jako **projekt erraty E14**.
>
> **Data oceny:** 2026-08-19 · **Weryfikacja podstaw prawnych:** 2026-08-19 (źródła w sekcji 7)
> · **Stan kodu:** gałąź robocza, **nic nie wdrożone na produkcję** (`docs/Panel-administratora.md`,
> ramka wstępna; wpis `docs/Activity-Log.md` z 2026-08-19).
>
> **Zakres:** `functions/admin.js`, `firestore.rules` (nowy blok `admin_audit`),
> `src/pages/admin/**`, `docs/Panel-administratora.md`, w odniesieniu do
> `docs/legal/Polityka-prywatnosci.md`, `docs/legal/DPA-powierzenie.md`,
> `docs/legal/Regulamin.md` i `docs/support/Proces-obslugi-zgloszen.md`.
>
> **Zasada, która obowiązuje tę ocenę** (ta sama, co pozostałe dokumenty w `docs/legal/`):
> stan faktyczny ustala się z kodu, nie z opisu. Wszystkie ustalenia niżej mają wskazane
> miejsce w plikach.

---

## 1. Werdykt

**Panel jest zmianą, która per saldo poprawia zgodność, a nie ją pogarsza.** Zastępuje trzy
drogi dostępu do danych (konsola dostawcy, klucz serwisowy, sesja agenta) jedną, zawężoną
i rejestrowaną; wprowadza do kodu stopniowanie zakresu, które dotąd było wyłącznie procedurą
w pliku; nie dokłada żadnego odbiorcy danych.

**Nie jest jednak zmianą neutralną dokumentacyjnie.** Powstają dwa nowe zbiory danych
(`admin_audit` oraz pola obsługi w `contact_messages`), dla których dziś nie ma ani podstawy
opisanej w Polityce, ani okresu przechowywania. Osobno — i to jest **najcięższe ustalenie
tej oceny** — dwa przyciski dostępu tworzą stany konta, **które wypadają ze wszystkich
mechanizmów retencji** i przeczą temu, co Polityka §6 i Regulamin §11 ust. 2 obiecują
użytkownikowi (sekcja 3.7, ustalenie **A1**).

Trzy rzeczy są blokerami **przed pierwszym użyciem panelu na cudzym koncie**, nie przed samym
deployem: retencja `admin_audit`, ścieżka retencji dla kont po ręcznej zmianie dostępu oraz
warunki bety w Regulaminie §6 ust. 5.

---

## 2. Stan faktyczny ustalony z kodu

Co panel realnie robi z danymi osobowymi — bez opierania się na komentarzach i instrukcji.

| Akcja (`functions/admin.js`) | Jakie dane osobowe opuszczają bazę | Do kogo trafiają | Wpis do dziennika |
|---|---|---|---|
| `overview` (l. 284–391) | **żadne** — wyłącznie liczby zbiorcze i szereg czasowy | przeglądarka Operatora | nie (zasadnie) |
| `users` (l. 396–413) | e-mail, nazwa, UID, data rejestracji i ostatniego logowania — **do 200 kont naraz**, przy każdym naciśnięciu klawisza (debounce 300 ms, `UsersView.jsx:61-64`) | j.w. | **nie** |
| `user` poziom 1 (l. 415–474) | pełny stan konta i subskrypcji jednego Gospodarza + komplet claimów | j.w. | tak — `user.read.level1` z **UID i e-mailem** |
| `user` poziom 2 (l. 476–508) | `hostProfile`: nazwa podmiotu, adres, telefon, dwa adresy e-mail, identyfikator podatkowy **zamaskowany**; `syncLinks` zamaskowane do hosta; reszta ustawień jako liczby | j.w. | tak — `user.read.level2` |
| `user` + `revealTaxId` (l. 485) | **pełny NIP albo PESEL** | j.w. | tak — `user.read.level2.taxId` |
| `grantAccess` (l. 522–573) | zmiana `status` / `trialEndsAt` w dokumencie **i** claimu | zapis do bazy | tak — `access.trial` / `access.active` / `access.revoke` |
| `messages` (l. 578–600) | adres e-mail i **pełna treść** zgłoszeń (pole swobodne, do 5000 znaków) | przeglądarka Operatora | tak — `messages.read` (sama liczba) |
| `messageUpdate` (l. 602–620) | zapis `adminStatus`, `adminNote` (do 5000 zn.), `adminUpdatedAt`, `adminUpdatedBy` | zapis do bazy | tak — `message.update` |
| `newsletter` (l. 625–641) | adresy e-mail wszystkich zapisanych + dowód zgody; przy `export: true` te same dane **jako plik na dysku** | przeglądarka / dysk lokalny | tak — `newsletter.read` / `newsletter.export` |
| `health` (l. 646–684) | **listy adresów e-mail** w sześciu kategoriach (do usunięcia, zaległości, wygasłe triale, niepotwierdzone, rozjazdy) + nazwy przewodników bez właściciela | przeglądarka Operatora | **nie** |
| `audit` (l. 689–698) | zawartość dziennika, w tym e-maile w `details` | j.w. | nie (zasadnie — rekurencja) |

**Czego panel nie robi** — zweryfikowane, nie przyjęte na słowo:

- **Nie czyta treści danych Gości.** Jedyne dotknięcie `rentals` to `collectionGroup("rentals").select()`
  (l. 143) — `select()` bez argumentów zwraca **same referencje, zero pól**. Podpisy liczone przez
  `count()` (l. 293). Poziom 3 z `Proces-obslugi-zgloszen.md` w panelu faktycznie nie istnieje.
- **Nie dokłada odbiorcy zewnętrznego.** Jedyne wyjście poza infrastrukturę to
  `stripe.prices.retrieve(PRICE_ID)` (l. 258) — pobranie ceny produktu, **bez jakichkolwiek
  danych osobowych**.
- **Nie poszerza dostępu klienckiego.** `firestore.rules` zyskują jedną pozycję —
  `admin_audit` z `allow read, write: if false` (l. 316–318); `contact_messages` zachowuje
  `allow read, update, delete: if false` (l. 304).
- **Bramka jest jedna i po stronie serwera** (`requireAdmin`, l. 59–70), uprawnienie to custom
  claim nadawany wyłącznie kluczem serwisowym, `enforceAppCheck: true` na wejściu (l. 704).

To jest solidna architektura i tak należy ją prawnikowi przedstawić.

---

## 3. Odpowiedzi na pytania

### 3.1. Czy Polityka prywatności i/lub DPA wymagają zmiany? (pytanie 1)

**Rozumowanie o braku nowego odbiorcy — broni się.** Zweryfikowane w kodzie (sekcja 2): dane
nie opuszczają dotychczasowego kręgu (Google/Firebase jako subprocesor + przeglądarka
Operatora, który jest administratorem tych danych). Operator nie jest wobec siebie „odbiorcą"
w rozumieniu art. 4 pkt 9 RODO, a wewnętrzne narzędzie administratora nie jest elementem,
który art. 13 ust. 1–2 każe wymieniać w informacji dla osób. **Katalog subprocesorów
w Polityce §5 i DPA §7 nie wymaga zmiany.** — *ocena robocza, wysoka pewność.*

**Rozumowanie o mniejszym przekazywaniu do Anthropic — prawdziwe faktycznie, ale dziś
nieudokumentowane, więc nie nadaje się jeszcze do powołania w dokumentach.** Panel nie usuwa
kanału agenta: `docs/support/Proces-obslugi-zgloszen.md` nadal opisuje go jako **drogę
podstawową** odczytu zgłoszeń, a poświadczenia Firebase CLI omijają reguły, więc kanał ten
sięgnie także po nową kolekcję `admin_audit`. Dopóki procedura nie mówi wprost „panel jest
drogą pierwszą, kanał agenta subsydiarną", redukcja zakresu jest praktyką, nie stanem
udokumentowanym — a wobec organu liczy się to drugie (art. 5 ust. 2).

- 🟡 **Zaktualizować `docs/support/Proces-obslugi-zgloszen.md`** po wdrożeniu: nowa kolejność
  (panel → kanał agenta tylko gdy panel nie wystarcza, z przykładami), skreślenie pozycji
  „Brak statusu zgłoszenia" z sekcji 6 (panel to naprawia). Dopiero po tym można w erracie E7
  napisać prawnikowi, że **faktyczny zakres przekazywania do subprocesora się zawęził**.
- 🔴 **Czego nie wolno napisać:** że Anthropic „nie otrzymuje" danych zgłoszeń. Kanał istnieje,
  wpisy w Polityce §5 i DPA §7 zostają.

**Zmiany w Polityce, które są konieczne** — nie z powodu odbiorcy, tylko z powodu **nowych
danych i nowego celu**:

1. 🔴 **Wiersz `contact_messages` w §2 jest niepełny.** Wymienia „adres e-mail, treść
   wiadomości, data, źródło"; panel dokłada `adminStatus`, `adminNote` (pole swobodne do 5000
   znaków), `adminUpdatedAt`, `adminUpdatedBy`. Notatka może zawierać dane zgłaszającego
   i osób trzecich. Podstawa: art. 13 ust. 1–2 w zw. z art. 5 ust. 1 lit. a (przejrzystość).
2. 🔴 **`admin_audit` to nowy zbiór danych osobowych i wymaga własnego wiersza w §2** —
   szczegóły i propozycja brzmienia w sekcji 3.3.
3. 🟢 **§10 (Bezpieczeństwo)** — warto (nie trzeba) dodać zdanie o kontroli dostępu po stronie
   Operatora; treść w punkcie niżej.

**DPA:** zmiana **nie jest wymagana**. Warto natomiast — **po wdrożeniu, nie wcześniej**
(bramka rozliczalności obowiązująca ten dokument) — dopisać do §6 środek organizacyjny:

> *dostęp Operatora do danych Kont jest ograniczony do jednego konta z uprawnieniem nadawanym
> poza Aplikacją i wyłącznie z użyciem klucza serwisowego, stopniowany co do zakresu, a każde
> sięgnięcie po dane osobowe jest zapisywane w dzienniku niedostępnym z poziomu Aplikacji;
> narzędzie administracyjne Operatora nie udostępnia treści danych powierzonych (rezerwacji
> ani zapisów akceptacji regulaminu przez Gości) — operuje wyłącznie ich liczbą.*

To realnie wzmacnia wykazanie art. 28 ust. 3 lit. b i lit. h oraz art. 32 ust. 4 RODO i jest
w tej chwili jedynym miejscem w DPA opisującym środki po stronie **ludzi**, a nie kodu. 🟡

**Osobno — upoważnienia.** Dopóki Operator to jedna osoba tożsama z administratorem, art. 29
i art. 32 ust. 4 RODO nie generują papierów. Z chwilą nadania claimu `admin` **komukolwiek
innemu** potrzebne są: upoważnienie do przetwarzania i zobowiązanie do poufności — **przed**
uruchomieniem `set-admin-claim.cjs`. To jeden wiersz do dopisania w `Panel-administratora.md`
sekcja 2.3. 🟡

### 3.2. Czy stopniowanie dostępu wystarcza dla zasady minimalizacji? (pytanie 2)

**Ocena robocza: kierunek jest prawidłowy i wdrożenie jest lepsze niż deklaratywne.**
Minimalizacja z art. 5 ust. 1 lit. c jest tu realizowana **w kodzie** (maskowanie, brak
poziomu 3, `select()` bez pól), a nie tylko w procedurze — to dokładnie ten rodzaj dowodu,
którego wymaga art. 25 ust. 2 („domyślnie przetwarzane są wyłącznie dane niezbędne").

**Cztery miejsca, gdzie zakres jest szerszy, niż potrzeba:**

1. 🟡 **Poziom 2 jest grubszy niż procedura, którą odwzorowuje.** `Proces-obslugi-zgloszen.md`
   §4 poziom 2 mówi wprost: *„`hostProfile` czytaj tylko wtedy, gdy zgłoszenie dotyczy profilu
   lub faktur"*. W kodzie jedno kliknięcie „Pokaż ustawienia" zwraca **całe `settings/*` naraz**
   (`admin.js:476-505`), więc diagnoza „nie działa synchronizacja iCal" odsłania przy okazji
   nazwę podmiotu, adres i telefon Gospodarza. **Rekomendacja:** rozbić na 2a (techniczne:
   `syncLinks`, `tax`, liczniki) i 2b (`hostProfile`) — dwa przyciski, dwie nazwy akcji
   w dzienniku (`user.read.level2` / `user.read.level2.hostProfile`).
   *Podstawa: art. 5 ust. 1 lit. c, art. 25 ust. 2.*
2. 🟡 **Ekran „Porządek" zwraca sześć list adresów e-mail bez bramki i bez śladu**
   (`admin.js:646-684`). Co do kategorii to dane poziomu 1, więc zakres nie jest nadmierny —
   ale odczyt jest **masowy i nieudokumentowany**, mimo że to jedno świadome kliknięcie.
   **Rekomendacja:** wpis `health.read` do dziennika; opcjonalnie pokazywać UID, a adres
   dociągać na żądanie.
3. 🟡 **Dziennik zapisuje e-mail obok UID** (`admin.js:507, 510`) — duplikuje dane osobowe do
   drugiego zbioru, który nie ma retencji i przeżyje usunięcie konta. Do rozliczalności
   wystarczy UID; adres da się odtworzyć w panelu, dopóki konto istnieje, a po jego usunięciu
   **nie powinien być odtwarzalny**. **Rekomendacja:** zapisywać sam `uid`.
   *Podstawa: art. 5 ust. 1 lit. c, art. 25 ust. 1, art. 17.*
4. 🟢/🟡 **Maska identyfikatora podatkowego nie uwzględnia typu numeru.** `maskIdentifier`
   (l. 104–109) zostawia trzy ostatnie znaki. Dla NIP to rozwiązanie bez zarzutu. Dla **PESEL**
   trzy ostatnie znaki to (kolejno) druga cyfra numeru porządkowego, **cyfra oznaczająca płeć**
   i cyfra kontrolna — maska ujawnia więc płeć, choć miała nie ujawniać niczego.
   **Rekomendacja:** uzależnić maskę od `identifierType` — dla PESEL nie pokazywać ogona;
   jeżeli potrzebna jest rozpoznawalność „ten sam numer", użyć krótkiego skrótu (hash), nie
   fragmentu numeru.

**Czego nie rekomenduję zmieniać:** zakresu listy kont (`users`) — e-mail w wynikach
wyszukiwarki jest niezbędny do funkcji, a alternatywa (wyszukiwanie „w ciemno" po UID) nie
zmniejsza ryzyka, tylko utrudnia pracę. Tu właściwym środkiem jest ślad, nie zawężenie
(sekcja 3.3).

**Brakujące „po co".** `AdminApp.jsx:28` i instrukcja §3.06 zapowiadają dziennik jako „kto,
kiedy i **po co** sięgnął po dane". Dziennik odpowiada dziś na dwa pierwsze pytania i na „co",
ale **nie na „po co"** — nie ma pola powodu. Albo dodać krótkie pole `reason` przy poziomie 2
i odsłonięciu identyfikatora (i przenosić je do `details`), albo poprawić opis, żeby nie
obiecywał czegoś, czego nie ma. To ta sama klasa błędu, którą zespół tropi w Polityce:
deklaracja szersza niż stan faktyczny. 🟡

### 3.3. Dziennik `admin_audit` (pytanie 3)

**(a) Czy granica „bez roboczej listy kont" się broni?**

**Uzasadnienie się broni, linia jest postawiona nie tam, gdzie trzeba.** Argument o zaśmieceniu
dziennika wpisami z każdego naciśnięcia klawisza jest prawdziwy i ma oparcie w kodzie
(`UsersView.jsx:61-64`) — dziennik nieczytelny nie jest dowodem na nic. Ale kryterium powinno
brzmieć **„czy odpowiedź niesie dane osobowe do przeglądarki"**, a nie „czy odczyt jest
celowany". Przy tym kryterium poza dziennikiem zostają dziś **dwie** rzeczy, a nie jedna:
lista kont (uzasadnione) **oraz ekran „Porządek"** (nieuzasadnione — jedno kliknięcie, sześć
list adresów).

**Rekomendacja (🟡):**
- audytować `health` bezwarunkowo,
- dla listy kont wprowadzić **wpis dławiony**: jeden `users.list` na administratora na okno
  15 minut, z liczbą wywołań w oknie — stan trzymany w instancji funkcji dokładnie tak, jak
  już zrobiono z `overviewCache` (l. 281–282). To zamyka lukę, nie psując czytelności.
  Alternatywa minimalna: jeden wpis `admin.session` przy wejściu do panelu.

**Osobno, poza pytaniem:** `audit()` połyka błąd zapisu (l. 80–83). Dla większości akcji to
słuszny kompromis (dostępność ponad kompletność logu). Przy **odsłonięciu identyfikatora
podatkowego powinno być odwrotnie**: dziś, jeśli zapis dziennika padnie, PESEL i tak wróci do
przeglądarki — bez śladu. **Rekomendacja:** dla `revealTaxId` wariant fail-closed — brak wpisu
oznacza brak odsłonięcia. 🟡 *(art. 5 ust. 2)*

**(b) Czy dziennik tworzy nowy zbiór wymagający podstawy i okresu? — TAK, jednoznacznie.**

`admin_audit` zawiera dane osobowe **trzech** kategorii osób: Operatora (`adminUid`),
Gospodarza (`details.uid`, `details.email`, `details.previousStatus`, swobodne `details.note`)
oraz — pośrednio — osób piszących przez formularz (identyfikatory zgłoszeń). To jest odrębna
czynność przetwarzania w nowym celu (rozliczalność i bezpieczeństwo), nie „metadane".

Konieczne rozstrzygnięcia:

| Element | Propozycja robocza | Podstawa |
|---|---|---|
| Cel | wykazanie legalności i zakresu dostępu do danych Kont; wykrywanie nadużyć uprawnienia administratora | art. 5 ust. 2, art. 24 ust. 1, art. 32 ust. 1 lit. b i d |
| Podstawa | art. 6 ust. 1 lit. f — uzasadniony interes (rozliczalność, bezpieczeństwo). Wariant alternatywny: lit. c w zw. z art. 5 ust. 2 i art. 24. **Wybór należy do prawnika**; przy lit. f potrzebny jest krótki test równowagi | art. 6 ust. 1 lit. f / lit. c |
| Okres | **12 miesięcy** — spójnie z propozycją kierunkową dla `contact_messages` (zadanie #31). Wariant 24 miesiące, jeśli dziennik ma służyć obronie przed roszczeniami — do decyzji prawnika | art. 5 ust. 1 lit. e |
| Egzekwowanie | rozszerzenie `deleteExpiredAccountsData` albo osobny scheduler kasujący wpisy starsze niż X | art. 5 ust. 1 lit. e + art. 5 ust. 2 |
| Kolizja z art. 17 | po usunięciu Konta w dzienniku zostaje UID i **e-mail** Gospodarza. Rozwiązanie zalecane: zapisywać sam UID (sekcja 3.2 pkt 3) **i** czyścić/pseudonimizować wpisy przy kasowaniu konta; wariant alternatywny — świadome powołanie art. 17 ust. 3 lit. e i udokumentowanie tego | art. 17 ust. 1 i ust. 3 lit. e |

🔴 **Priorytet: dziś dla tego zbioru nie ma ŻADNEGO okresu.** Dopóki panel nie działa, to
kwestia papierowa; z chwilą pierwszego wpisu staje się realnym naruszeniem art. 5 ust. 1
lit. e. To jest dokładnie ten sam wzorzec, który zespół naprawiał przy newsletterze
(deklaracja bez mechanizmu) — tylko odwrócony: mechanizm bez deklaracji.

**Propozycja wiersza do Polityki §2** (do weryfikacji prawnika):

> | Dziennik dostępu administracyjnego (`admin_audit`): identyfikator konta, którego dotyczył
> odczyt lub zmiana, rodzaj czynności, data i identyfikator osoby działającej z ramienia
> Operatora | Wykazanie, że dostęp Operatora do danych Konta był ograniczony do niezbędnego
> zakresu; wykrywanie nadużyć uprawnień | art. 6 ust. 1 lit. f (uzasadniony interes —
> rozliczalność i bezpieczeństwo; art. 5 ust. 2, art. 24, art. 32 RODO) | [DO DECYZJI:
> propozycja 12 miesięcy od zapisu] |

**Niezmienialność — nazwać, nie obiecywać.** Dziennik pisze i czyta Admin SDK, więc posiadacz
klucza serwisowego może wpisy usunąć. Przy jednoosobowej działalności nie ma na to
proporcjonalnego środka i nie trzeba go szukać — trzeba tylko **nie obiecywać więcej, niż
jest**. Instrukcja §3.06 mówi „dziennika nie da się obejść ani podrobić **z panelu**" — to
zdanie jest prawdziwe w tym zawężeniu i tak powinno zostać. 🟢

**(c) Czy dziennik powinien trafić do rejestru czynności? — TAK.**

Wyjątek z art. 30 ust. 5 RODO i tak nie działa: zwolnienie odpada, gdy zachodzi
**którakolwiek** z trzech przesłanek, a tu przetwarzanie **nie ma charakteru sporadycznego**
(stanowisko UODO, „Rejestrowanie czynności przetwarzania", publikacja 22.05.2018, ostatnia
modyfikacja 08.07.2026 — odczyt 2026-08-19). Rejestr figuruje już w `Checklista-zgodnosci.md`
jako 🟢 „porządkowe" — **rekomenduję podniesienie do 🟡** i dopisanie dwóch czynności:
„administrowanie Kontami i obsługa zgłoszeń (panel Operatora)" oraz „dziennik dostępu
administracyjnego". Koszt: jedna tabela.

### 3.4. Eksport CSV newslettera (pytanie 4)

**Sam eksport nie wymaga zmiany Polityki.** Art. 13 nakazuje podać cel, podstawę, kategorie
odbiorców i okres — **nie formę techniczną ani nośnik**. Plik nie trafia do nowego podmiotu.
Pod tym względem: **w porządku jak jest.** — *ocena robocza.*

Trzy rzeczy do zrobienia po stronie środków i procedury:

1. 🟡 **Kopia wychodzi spod wszystkich zabezpieczeń, które zespół zbudował** — reguł, retencji,
   kasowania konta. Po wycofaniu zgody plik na dysku dalej zawiera adres. **Rekomendacja:**
   jedno zdanie ostrzeżenia w interfejsie przed pobraniem („to kopia poza Aplikacją: nie
   wysyłaj jej pocztą, skasuj po użyciu; wycofanie zgody nie usuwa adresu z tego pliku") oraz
   akapit w `Panel-administratora.md` §3.04: gdzie takie pliki trzymać i kiedy je kasować.
   *Podstawa: art. 32 ust. 1, art. 5 ust. 2.*
2. 🔴 (przed pierwszą wysyłką) / 🟡 (dziś) — **eksport bierze także wiersze bez zgody.**
   `NewsletterView.jsx:36-49` nie filtruje po `consent`; zapisy `consent: false` trafiają do
   tego samego pliku z adnotacją „NIE" w kolumnie. Skoro panel sam stwierdza, że dla tych
   adresów nie da się wykazać podstawy, nie powinny wyjeżdżać w jednym pliku z resztą — to
   dwa kliknięcia od wklejenia całości do narzędzia wysyłkowego. **Rekomendacja:** eksport
   domyślnie wyłącznie `consent === true`; wiersze bez zgody — osobny, wyraźnie nazwany
   eksport „do wyczyszczenia" albo wcale.
   *Podstawa: art. 6 ust. 1 lit. a, art. 7 ust. 1 RODO; art. 398 Prawa komunikacji
   elektronicznej — uprzednia zgoda na marketing bezpośredni (numeracja potwierdzona
   w źródłach wtórnych 2026-08-19, do weryfikacji na tekście urzędowym — to samo zastrzeżenie
   co w erracie E4).*
3. 🟡 (dziś) / 🔴 (przed pierwszą wysyłką) — **nie ma żadnej ścieżki wypisu.** Panel potrafi
   eksportować, ale nie potrafi usunąć zapisu, a reguły zabraniają klientowi `update`
   i `delete` (`firestore.rules:285`). Polityka §2 deklaruje okres „do wycofania zgody" —
   opisuje więc mechanizm, którego nie ma. Art. 7 ust. 3 RODO wymaga, by wycofanie było
   **równie łatwe** jak wyrażenie. **Rekomendacja:** akcja `newsletter.delete` w panelu
   (z wpisem do dziennika) plus link wypisu w pierwszym mailu; do tego czasu — opisać ścieżkę
   ręczną w instrukcji, żeby żądanie nie utknęło (termin z art. 12 ust. 3 — miesiąc).

### 3.5. Pokazywanie liczby zgłoszeń ponad 12 miesięcy (pytanie 5)

**Ocena robocza: pokazywać. Ukrycie byłoby gorsze.** Trzy powody:

1. To informacja **wewnętrzna**, nie oświadczenie wobec osób, których dane dotyczą — nie tworzy
   zobowiązania i nie wyprzedza decyzji.
2. `HealthView.jsx:146-150` nazywa 12 miesięcy **propozycją kierunkową** i odsyła do §2 Polityki
   oraz zadania #31. Panel nie udaje, że decyzja zapadła — a to jedyne, co byłoby wadą.
3. Z punktu widzenia rozliczalności lepiej mieć wskaźnik niż go nie mieć.

Jedyne realne ryzyko jest odwrotne, niż sugeruje pytanie: liczba **dokumentuje świadomość**, że
dane leżą dłużej, niż sam Operator uważa za właściwe, przy braku decyzji. To argument za
podjęciem decyzji, nie za skasowaniem licznika.

🟡 **Rekomendacja:** podnieść zadanie #31 do pozycji przedlaunchowej i objąć nim **trzy zbiory
naraz**: `contact_messages`, `admin_audit` oraz logi techniczne (Polityka §2 ma tam
`[DO UZUPEŁNIENIA]`). Jedna decyzja zamyka trzy `[DO DECYZJI]`.
*Podstawa: art. 5 ust. 1 lit. e, art. 13 ust. 2 lit. a.*

### 3.6. Ręczne nadawanie i odbieranie dostępu (pytanie 6)

**Punkt wyjścia — kwalifikacja.** Dostęp do funkcji panelu jest **usługą cyfrową** w rozumieniu
rozdziału 5b ustawy o prawach konsumenta (Regulamin §8 ust. 4 sam się na ten reżim powołuje).
Rozdział 5b stosuje się także wtedy, gdy konsument **nie płaci ceny**, a dostarcza dane
osobowe: wyłączenie z art. 43i dotyczy wyłącznie wąskiego przypadku oprogramowania na otwartej
i wolnej licencji, więc bety WynajemPRO nie obejmuje *(weryfikacja 2026-08-19 na tekście
ustawy w serwisie lexlege — źródło nieurzędowe, do potwierdzenia przez prawnika na ISAP)*.
**Wniosek: tester bety jest konsumentem w umowie o dostarczanie usługi cyfrowej, z pełnym
reżimem zgodności z art. 43k–43n.**

**Nadanie i przedłużenie — łatwe.** Świadczenie na korzyść użytkownika, nie wymaga nowej
klauzuli. Wymaga jednak, żeby użytkownik **wiedział, co dostał**: na jak długo, co się stanie
po zakończeniu, czy przejdzie w płatną subskrypcję (nie przechodzi — status `active` bez
subskrypcji Stripe nie uruchamia pobrania) i co z danymi po odebraniu.

**Odebranie — tu jest problem.** `revoke` to jednostronne pozbawienie świadczenia.
Regulamin §11 ust. 3 przewiduje rozwiązanie lub zawieszenie **wyłącznie** przy istotnym
naruszeniu Regulaminu, po uprzednim wezwaniu. Odebranie dostępu testerowi „bo skończyła się
beta" **nie mieści się w tej podstawie**. Zgodnie z art. 43p ustawy o prawach konsumenta
przedsiębiorca może zmienić usługę cyfrową tylko wtedy, **gdy umowa tak stanowi i wyłącznie
z uzasadnionych przyczyn w tej umowie wskazanych**, bez kosztów po stronie konsumenta i po
poinformowaniu go w sposób jasny i zrozumiały (art. 43q). Regulamin §6 ust. 5 (founding
members) jest dziś `[DO UZUPEŁNIENIA]` — czyli podstawy umownej nie ma.

🔴 **Przed zaproszeniem pierwszego testera** uzupełnić §6 ust. 5 o: kto się kwalifikuje, czy
dostęp jest terminowy czy bezterminowy, **z jakich przyczyn może zostać odebrany**, jaki jest
termin uprzedzenia, co dzieje się z danymi po odebraniu i czy po becie następuje przejście na
płatną subskrypcję (a jeśli tak — obowiązek Omnibus przy prezentacji rabatu, już odnotowany
w §6 ust. 5). *Uwaga: klauzula dająca przedsiębiorcy prawo odebrania świadczenia „w każdym
czasie, bez podania przyczyny" jest kandydatem na postanowienie niedozwolone (art. 385¹
i art. 385³ k.c.) — brzmienie musi ułożyć prawnik.*

**Ślad i potwierdzenie.** Dziennik zapisuje `previousStatus`, liczbę dni i notatkę — to dobry
dowód **dla RODO**, ale nie jest potwierdzeniem **dla użytkownika**, którego wymaga art. 43q
(informacja o zmianie), a szerzej — reżim potwierdzenia umowy na trwałym nośniku. Panel
świadomie nie wysyła maili. 🟡 **Rekomendacja wykonalna bez kanału wysyłkowego:**
(i) właściciel wysyła potwierdzenie ze swojej skrzynki i wkleja jego ślad w pole `note`
(`admin.js:559` — trafia do dziennika); (ii) panel gospodarza pokazuje, skąd bierze się dostęp
(„dostęp w ramach programu testowego do dnia X") — inaczej użytkownik nie ma jak poznać
warunków, na jakich korzysta z usługi.

**Dwa zabezpieczenia techniczne, których w `grantAccess` brakuje:**

- 🟡 `mode: 'trial'` **nie sprawdza, czy konto ma żywą subskrypcję** (l. 534–549). Pomyłkowe
  kliknięcie na płacącym kliencie ustawi mu `status: 'trialing'`. **Rekomendacja:** blokada
  albo dodatkowe potwierdzenie, gdy `stripeSubscriptionId` istnieje.
- 🟡 `mode: 'revoke'` **nie sprawdza i nie odnotowuje**, czy subskrypcja żyje (l. 566–572) —
  w przeciwieństwie do `active`, gdzie flaga `stripeManaged` jest zapisywana. Odcięcie dostępu
  przy aktywnej subskrypcji oznacza, że konsument płaci i nie dostaje świadczenia (art. 43l
  i 43n ustawy o prawach konsumenta; od strony cywilnej — świadczenie nienależne).
  **Rekomendacja:** dopisać `stripeManaged` do wpisu `access.revoke` i ostrzeżenie w interfejsie
  („to konto ma aktywną subskrypcję — anuluj ją najpierw po stronie operatora płatności").

### 3.7. Czego nie było w pytaniach (pytanie 7)

#### A1. 🔴 Przyciski dostępu tworzą stany konta bez ścieżki retencji — i wbrew temu, co obiecuje Polityka

**To najcięższe ustalenie tej oceny.** Ustalone przez porównanie `admin.js:522-573`
z `functions/index.js:508-571`.

Nocne czyszczenie kwalifikuje konta **dwoma** zapytaniami:
`status == 'canceled'` **i** `scheduledDeletionAt <= now` (l. 526–534), albo
`status == 'trialing'` **i** `trialEndsAt` starsze niż 90 dni (l. 551–558).

Co z tego wynika dla przycisków panelu:

| Przycisk | Stan konta po kliknięciu | Czy wpadnie w retencję | Co obiecuje dokument |
|---|---|---|---|
| **Nadaj dostęp (beta)** | `status: 'active'`, brak subskrypcji Stripe, brak `scheduledDeletionAt` | **NIE — żadna ze ścieżek nie pasuje** | — (stan nieopisany) |
| **Odbierz** | `status: 'canceled'`, `canceledAt` ustawione, **`scheduledDeletionAt` celowo nieustawione** | **NIE** — zapytanie zakresowe nie dopasowuje dokumentów bez tego pola | Polityka §6 i Regulamin §11 ust. 2: *„30 dni od anulowania Subskrypcji, a następnie trwałe usunięcie"* |

Skutki:

1. **Konto z ręcznie nadanym dostępem nigdy nie zostanie wyczyszczone**, nawet jeśli tester
   porzuci je nazajutrz. Wcześniej takie konto (porzucony trial) znikało po 90 dniach razem
   z **danymi Gości**, wobec których Operator jest procesorem. Przycisk „Nadaj dostęp"
   wyjmuje konto ze wszystkich mechanizmów retencji — bezterminowo.
   *Naruszenie art. 5 ust. 1 lit. e; wobec danych powierzonych także DPA §9.*
2. **Konto po odebraniu dostępu ma status „canceled", ale nigdy nie zostanie usunięte** — czyli
   stan faktyczny przeczy zdaniu, które Polityka §6 i Regulamin §11 ust. 2 mówią użytkownikowi.
   Komentarz w kodzie („odebranie dostępu to nie zgoda na skasowanie danych") jest **słuszny
   co do intencji**, ale skutkiem jest przechowywanie bezterminowe, a nie ostrożność.
3. Takie konta **nie pojawiają się na żadnej liście** ekranu „Porządek" (`HealthView.jsx`
   pokazuje `scheduledDeletion`, `pastDue`, `expiredTrials`, `unverified`, rozjazdy
   i osierocone przewodniki — żadna kategoria ich nie łapie). Są niewidoczne.

**Rekomendacja (do decyzji właściciela, wdrożenie `dev`):**
- „Odbierz" — albo ustawiać `scheduledDeletionAt` (30 dni, jak webhook, spójnie z §11 ust. 2)
  z jawnym komunikatem w interfejsie, albo użyć **odrębnego statusu** (np. `suspended`), żeby
  konto nie podawało się za „canceled", zachowując się inaczej niż zapowiada Regulamin.
  Wariant pierwszy jest zgodny z opublikowanym opisem, drugi wymaga dopisania stanu do §11.
- „Nadaj dostęp (beta)" — zapisywać znacznik (`accessGrantedBy: 'operator'`, opcjonalnie
  `betaUntil`) i objąć te konta decyzją retencyjną (np. czyszczenie po X dniach od ostatniego
  logowania, po uprzedzeniu).
- „Porządek" — dodać sekcję **„konta bez ścieżki retencji"** (status `canceled` bez
  `scheduledDeletionAt`; status `active` bez `stripeSubscriptionId`). Jedno zapytanie zamienia
  lukę w pozycję monitorowaną.

**Zasada do zapamiętania:** żaden stan konta nie może istnieć bez zdefiniowanej ścieżki
retencji. Panel wprowadza dwa takie stany naraz.

#### A2. 🔴 Panel podnosi wagę braku uwierzytelniania dwuskładnikowego

`Bezpieczenstwo-kont-i-danych.md` §9 wymienia brak 2FA z wagą „do decyzji — dla mikro-SaaS
akceptowalne". **Ta ocena przestaje być aktualna z chwilą wdrożenia panelu.** Do dziś
przejęcie konta właściciela oznaczało dostęp do **jego** danych. Po wdrożeniu oznacza dostęp
do danych **wszystkich Gospodarzy**, ich profili (z PESEL włącznie, po dwóch kliknięciach)
i do skrzynki zgłoszeń, a także możliwość zmiany statusów kont.

**Rekomendacja (przed deployem):** konto z claimem `admin` powinno logować się **kontem Google
z włączonym 2FA**, nie hasłem — Firebase Auth w wariancie bez Identity Platform nie oferuje
MFA dla logowania hasłem, więc to jedyna dostępna droga. Do sprawdzenia i potwierdzenia
w konsoli przed uruchomieniem panelu; wynik dopisać do `Bezpieczenstwo-kont-i-danych.md` §9.1.
*Podstawa: art. 32 ust. 1 lit. b, art. 24 ust. 1 (środki adekwatne do ryzyka — ryzyko właśnie
wzrosło).*

#### A3. 🟡 Cofnięcie uprawnienia nie unieważnia wydanego tokenu

Po `set-admin-claim.cjs --remove` token z claimem `admin` pozostaje ważny do godziny.
W instrukcji sekcja 2.3 warto dopisać, że przy podejrzeniu incydentu trzeba dodatkowo
unieważnić sesje (`revokeRefreshTokens`) — samo odebranie claimu nie odcina natychmiast.

#### A4. 🟡 Notatka do zgłoszenia to pole, w którym Operator sam może wprowadzić dane nadmiarowe

DPA §3 zawiera zobowiązanie **Administratora** do niewprowadzania danych szczególnych
kategorii. Po stronie Operatora analogicznej samodyscypliny nie ma, a `adminNote` przyjmuje
5000 znaków. Dzisiejszy podpowiedź w polu — „Co ustalono, co odpisano, czy sprawa wraca…" —
zachęca do opisu. **Rekomendacja:** dopisać pół zdania: „notatka służbowa: ustalenia i status;
nie przepisuj tu danych, które nie są potrzebne do obsługi".

#### A5. 🟡 Dokumentacja rozjedzie się z kodem w dniu wdrożenia

`docs/support/Proces-obslugi-zgloszen.md` sekcja 3 opisuje odczyt zgłoszeń kanałem agenta jako
drogę jedyną, a sekcja 6 wymienia „Brak statusu zgłoszenia" jako brak. Panel zmienia jedno
i drugie. To nie jest kosmetyka: **ta procedura jest dowodem stopniowania zakresu**, na który
powołują się Polityka §5, DPA §7 i errata E7. Nieaktualna procedura osłabia ten dowód.

#### A6. 🟢 Dziennik jest czytelny dla kanału agenta

Poświadczenia Firebase CLI omijają reguły, więc `admin_audit` jest w zasięgu kanału MCP.
Nie jest to naruszenie (ten sam administrator, ten sam cel), ale warto o tym pamiętać przy
redagowaniu erraty — żeby nie napisać prawnikowi, że dziennik jest poza zasięgiem czegokolwiek
poza panelem.

#### A7. 🟢 Ocena skutków (DPIA) — nie jest wymagana

*Ocena robocza:* panel nie wprowadza systematycznego monitorowania na dużą skalę, nie
przetwarza szczególnych kategorii danych i nie profiluje; jego skutkiem netto jest **zawężenie**
dostępu, który wcześniej odbywał się przez konsolę i klucz serwisowy bez żadnego śladu.
Kryteria z art. 35 ust. 3 RODO nie są spełnione; wykaz Prezesa UODO (M.P. 2019 poz. 666,
cytowany w DPA §3 — weryfikacja zespołu 2026-07-25) nie wymienia tego rodzaju operacji.
**Sam fakt rozważenia tej kwestii warto zapisać** — to element rozliczalności (art. 5 ust. 2),
i właśnie dlatego ten akapit tu stoi.

#### A8. 🟢 Dziennik ułatwia obowiązek z art. 33

Warto dopisać do instrukcji jedno zdanie: przy podejrzeniu nieuprawnionego dostępu **pierwszym
krokiem jest odczyt `admin_audit`** — 72 godziny z art. 33 ust. 1 biegną szybko, a dziennik
jest jedynym miejscem, gdzie widać zakres zdarzenia.

---

## 4. Tabela ustaleń

| # | Obszar | Stan obecny | Ryzyko | Priorytet | Rekomendacja | Podstawa |
|---|---|---|---|---|---|---|
| A1a | Retencja — konto po „Nadaj dostęp (beta)" | `status: active` bez subskrypcji; nie łapie go żadna ścieżka czyszczenia | Bezterminowe przechowywanie danych Gospodarza **i danych powierzonych** | 🔴 | Znacznik nadania + objęcie decyzją retencyjną + sekcja „konta bez ścieżki retencji" w widoku Porządek | art. 5 ust. 1 lit. e; DPA §9 |
| A1b | Retencja — konto po „Odbierz" | `status: canceled` bez `scheduledDeletionAt`; nigdy nie zostanie usunięte | Stan faktyczny przeczy Polityce §6 i Regulaminowi §11 ust. 2 | 🔴 | Ustawiać datę usunięcia (30 dni) albo wprowadzić odrębny status i opisać go w §11 | art. 5 ust. 1 lit. e i ust. 2 |
| B1 | `admin_audit` — brak podstawy i okresu | Zbiór z danymi trzech kategorii osób, zero retencji | Naruszenie art. 5 ust. 1 lit. e od pierwszego wpisu; brak informacji dla osób | 🔴 | Wiersz w Polityce §2 (projekt w 3.3), okres 12 mies., kasowanie w schedulerze | art. 5 ust. 1 lit. e, art. 6 ust. 1 lit. f, art. 13 |
| B2 | `admin_audit` — e-mail obok UID | `details.email` zapisywane przy każdym odczycie konta | Duplikacja danych; kolizja z art. 17 po usunięciu konta | 🟡 | Zapisywać sam UID; przy kasowaniu konta czyścić/pseudonimizować wpisy | art. 5 ust. 1 lit. c, art. 17, art. 25 |
| B3 | `admin_audit` — zakres audytowania | `health` i lista kont poza dziennikiem | Masowy odczyt adresów bez śladu | 🟡 | Audytować `health`; wpis dławiony `users.list` (1 / 15 min) | art. 5 ust. 2 |
| B4 | Dziennik — zapis połykany | Błąd zapisu nie przerywa akcji | Odsłonięcie PESEL bez śladu | 🟡 | Fail-closed dla `revealTaxId` | art. 5 ust. 2, art. 32 |
| B5 | Dziennik — brak „po co" | Instrukcja i nagłówek obiecują powód, którego nie ma | Deklaracja szersza niż stan faktyczny | 🟡 | Pole `reason` przy poziomie 2 i odsłonięciu **albo** korekta opisu | art. 5 ust. 2 |
| C1 | Polityka §2 — `contact_messages` | Wiersz nie wymienia pól obsługi (`adminNote` do 5000 zn., status, autor) | Niepełna informacja o zakresie | 🔴 | Uzupełnić wiersz | art. 13 ust. 1–2, art. 5 ust. 1 lit. a |
| C2 | Polityka §5 / DPA §7 — subprocesorzy | Panel nie dokłada odbiorcy | brak | 🟢 | Bez zmian | art. 4 pkt 9, art. 13 ust. 1 lit. e |
| C3 | DPA §6 — środki | Katalog opisuje wyłącznie środki techniczne wobec Gospodarza i Gościa | Niewykorzystany dowód zgodności | 🟡 (po wdrożeniu) | Dopisać kontrolę dostępu Operatora, stopniowanie i dziennik | art. 28 ust. 3 lit. b i h, art. 32 ust. 4 |
| C4 | Rejestr czynności | Brak; w checkliście jako 🟢 | Wyjątek z art. 30 ust. 5 nie działa (przetwarzanie niesporadyczne) | 🟡 | Podnieść do 🟡, dopisać dwie czynności | art. 30 ust. 1 i 5 |
| D1 | Minimalizacja — poziom 2 | Jedno kliknięcie odsłania całe `settings/*`, w tym `hostProfile` | Kod szerszy niż własna procedura | 🟡 | Rozbić na 2a (techniczne) i 2b (`hostProfile`) | art. 5 ust. 1 lit. c, art. 25 ust. 2 |
| D2 | Minimalizacja — maska PESEL | Trzy ostatnie znaki ujawniają cyfrę płci | Niewielkie, ale sprzeczne z celem maski | 🟢/🟡 | Maska zależna od `identifierType` | art. 5 ust. 1 lit. c |
| E1 | Newsletter — eksport bez filtra zgody | CSV zawiera także `consent: false` | Ryzyko wysyłki bez podstawy | 🟡 → 🔴 przed wysyłką | Eksportować domyślnie tylko wiersze ze zgodą | art. 6 ust. 1 lit. a, art. 7 ust. 1; art. 398 PKE |
| E2 | Newsletter — brak wypisu | Panel nie usuwa zapisu; reguły blokują klienta | Polityka deklaruje mechanizm, którego nie ma | 🟡 → 🔴 przed wysyłką | Akcja `newsletter.delete` + link wypisu | art. 7 ust. 3, art. 12 ust. 3 |
| E3 | Newsletter — plik na dysku | Brak ostrzeżenia i zasady postępowania | Kopia poza retencją i kontrolą | 🟡 | Ostrzeżenie w interfejsie + akapit w instrukcji | art. 32 ust. 1, art. 5 ust. 2 |
| F1 | Regulamin §6 ust. 5 — beta | `[DO UZUPEŁNIENIA]`; §11 ust. 3 pokrywa tylko naruszenia | Odebranie dostępu bez podstawy umownej | 🔴 przed pierwszym testerem | Uzupełnić warunki, przyczyny i tryb odebrania | art. 43p i 43q u.p.k.; art. 385¹, 385³ k.c. |
| F2 | Brak potwierdzenia zmiany dla użytkownika | Panel nie wysyła maili | Zmiana usługi bez informacji | 🟡 | Potwierdzenie ręczne + ślad w `note`; komunikat o źródle dostępu w panelu gospodarza | art. 43q u.p.k. |
| F3 | `grantAccess` bez bramek na Stripe | `trial` degraduje płacącego; `revoke` nie sprawdza subskrypcji | Płatność bez świadczenia | 🟡 | Blokada/potwierdzenie + `stripeManaged` we wpisie `revoke` | art. 43l, 43n u.p.k.; art. 405 k.c. |
| G1 | Brak 2FA na koncie z claimem `admin` | Waga oceniona przed istnieniem panelu | Przejęcie jednego konta = dostęp do danych wszystkich Kont | 🔴 przed deployem | Logowanie Google z 2FA; potwierdzić w konsoli | art. 32 ust. 1 lit. b, art. 24 |
| G2 | Token po odebraniu claimu | Ważny do godziny | Opóźnione odcięcie przy incydencie | 🟡 | Dopisać `revokeRefreshTokens` do procedury | art. 32 ust. 1 |
| H1 | `Proces-obslugi-zgloszen.md` | Opisuje stan sprzed panelu | Osłabia dowód stopniowania zakresu (E7) | 🟡 | Aktualizacja po wdrożeniu | art. 5 ust. 2 |
| H2 | Notatka do zgłoszenia | Podpowiedź zachęca do opisu | Możliwe dane nadmiarowe, w tym z art. 9 | 🟡 | Uzupełnić podpowiedź | art. 5 ust. 1 lit. c |

---

## 5. Podział rozstrzygający

### Trzeba zmienić

1. **Retencja `admin_audit`** — podstawa, okres, mechanizm kasowania, wiersz w Polityce §2. *(B1)*
2. **Ścieżka retencji dla kont po „Nadaj dostęp" i „Odbierz"** — dziś oba stany żyją
   bezterminowo, a „Odbierz" dodatkowo przeczy Polityce §6 i Regulaminowi §11 ust. 2. *(A1)*
3. **Wiersz `contact_messages` w Polityce §2** — dopisać pola obsługi zgłoszenia. *(C1)*
4. **Warunki bety w Regulaminie §6 ust. 5** — przed zaproszeniem pierwszego testera, nie przed
   deployem. *(F1)*
5. **2FA na koncie z uprawnieniem administratora** — przed deployem. *(G1)*
6. **Eksport newslettera bez zgody i brak ścieżki wypisu** — przed pierwszą wysyłką
   bezwzględnie; dziś jako pozycja otwarta. *(E1, E2)*

### Warto rozważyć

1. Rozbicie poziomu 2 na techniczny i `hostProfile` — kod dogoniłby własną procedurę. *(D1)*
2. Audyt ekranu „Porządek" i dławiony wpis dla listy kont. *(B3)*
3. Zapisywanie w dzienniku samego UID zamiast UID + e-mail. *(B2)*
4. Fail-closed przy odsłonięciu identyfikatora podatkowego. *(B4)*
5. Pole „powód" przy poziomie 2 — albo korekta zdania w instrukcji. *(B5)*
6. Maska zależna od typu identyfikatora (PESEL vs NIP). *(D2)*
7. Dopisanie środków organizacyjnych do DPA §6 — **po wdrożeniu**. *(C3)*
8. Bramki na Stripe w `grantAccess` i `stripeManaged` we wpisie `revoke`. *(F3)*
9. Podniesienie rejestru czynności z 🟢 na 🟡 i dopisanie dwóch czynności. *(C4)*
10. Aktualizacja `Proces-obslugi-zgloszen.md` i podpowiedzi przy notatce. *(H1, H2)*

### W porządku jak jest

1. **Brak nowego odbiorcy danych** — zweryfikowane w kodzie; Polityka §5 i DPA §7 bez zmian.
2. **Odczyt serwerowy zamiast poszerzenia reguł** — decyzja architektoniczna, która trzyma
   `contact_messages` przy `allow read: if false` i nie otwiera klienckiego dostępu do cudzych
   kont. Prawnikowi należy ją pokazać jako środek z art. 25 ust. 1, nie jako szczegół techniczny.
3. **Brak poziomu 3** — `select()` bez pól i `count()` to nie deklaracja, tylko mechanizm.
4. **Pokazywanie liczby zgłoszeń ponad 12 miesięcy** — z zastrzeżeniem „propozycja, nie
   decyzja", które w interfejsie już jest.
5. **Zgłoszenia testowe domyślnie ukryte** — minimalizacja i mniej niepotrzebnych diagnostyk.
6. **Uprawnienie jako custom claim nadawany kluczem serwisowym**, nie pole w bazie i nie
   przycisk w panelu.
7. **Zdanie „dziennika nie da się obejść ani podrobić **z panelu**"** — prawdziwe w tym
   zawężeniu; nie rozszerzać.
8. **Brak DPIA** — z zapisanym uzasadnieniem *(A7)*.

---

## 6. Projekt erraty **E14** do `Raport-dla-prawnika-2026-07-22.md`

Do wklejenia do tabeli erraty po decyzji właściciela (kolumny jak w oryginale):

> **E14** *(2026-08-19)* — **Panel administratora Operatora: jedno miejsce dostępu do danych
> wszystkich Kont, ze stopniowaniem zakresu i dziennikiem.** Dotyczy dokumentów nr 2
> (`Polityka-prywatnosci.md` §2), nr 3 (`DPA-powierzenie.md` §6), nr 1 (`Regulamin.md` §6 ust. 5
> i §11) oraz pytań z sekcji 4.1.
>
> **Było:** dostęp Operatora do danych Kont odbywał się trzema drogami — konsola dostawcy,
> skrypt z kluczem serwisowym i kanał wsparcia oparty na modelu językowym (errata E7). Żadna
> z nich nie zostawiała śladu, a zakres był ograniczony wyłącznie procedurą opisaną w pliku.
>
> **Jest:** jedno wejście serwerowe z pojedynczą bramką uprawnień (custom claim nadawany
> wyłącznie kluczem serwisowym, poza aplikacją), **stopniowanie zakresu wbudowane w kod**
> (poziom 1 — konto i subskrypcja; poziom 2 — ustawienia, na osobne żądanie; **poziom 3 — dane
> Gości — w narzędziu nie istnieje: rezerwacje i zapisy akceptacji są wyłącznie liczone**),
> maskowanie identyfikatora podatkowego z osobno rejestrowanym odsłonięciem oraz **dziennik
> dostępu w kolekcji zamkniętej dla wszystkich klientów**. Reguły bazy nie zostały poluzowane
> w żadnym punkcie. Narzędzie **nie dokłada odbiorcy danych** — dane nie opuszczają
> dotychczasowej infrastruktury.
>
> **Prosimy o ocenę pięciu kwestii:**
> **(a)** czy dziennik dostępu (identyfikator konta, rodzaj czynności, data, osoba działająca
> z ramienia Operatora) prawidłowo opieramy na art. 6 ust. 1 lit. f jako realizację
> rozliczalności z art. 5 ust. 2 i art. 24, czy właściwsza jest lit. c — i czy przy lit. f
> potrzebny jest udokumentowany test równowagi;
> **(b)** jaki okres przechowywania dziennika jest właściwy (propozycja robocza: 12 miesięcy,
> spójnie z propozycją dla zgłoszeń — zadanie #31) **oraz** jak rozstrzygnąć jego kolizję
> z żądaniem usunięcia danych (art. 17): pseudonimizować wpisy po usunięciu Konta czy powołać
> art. 17 ust. 3 lit. e;
> **(c)** czy ręczne nadanie i **odebranie** dostępu w programie testowym (founding members)
> wymaga podstawy w Regulaminie w rozumieniu art. 43p ustawy o prawach konsumenta — i jakie
> brzmienie §6 ust. 5 nie będzie postanowieniem niedozwolonym; osobno: jaka forma potwierdzenia
> dla użytkownika jest wystarczająca, skoro Aplikacja nie ma kanału wysyłki wiadomości;
> **(d)** czy przy tak zawężonym narzędziu i przy dostępności panelu jako drogi pierwszej
> możemy zawęzić opis zakresu kanału wsparcia opartego na modelu językowym (errata E7,
> Polityka §5, DPA §7) do przypadków, w których panel nie wystarcza;
> **(e)** czy rejestr czynności przetwarzania (art. 30) powinien w Państwa ocenie powstać przed
> uruchomieniem sprzedaży — w naszej ocenie wyjątek z art. 30 ust. 5 nie ma zastosowania,
> bo przetwarzanie nie ma charakteru sporadycznego.
>
> **Zastrzeżenie:** na dzień erraty **nic z tego nie zostało wdrożone na produkcję**, a wskazane
> przez nas braki retencyjne (dziennik oraz konta po ręcznej zmianie dostępu) są jeszcze przed
> naprawą — pełny wykaz w `Ocena-panelu-administratora-2026-08-19.md`.

---

## 7. Źródła i daty weryfikacji

| Źródło | Co z niego wzięto | Data odczytu |
|---|---|---|
| RODO (rozporządzenie 2016/679), tekst polski — EUR-Lex, CELEX 32016R0679 | art. 5, 6, 13, 17, 24, 25, 29, 30, 32, 33, 35 | 2026-08-19 *(pobrany fragment miał charakter streszczenia — dokładne brzmienie cytatów do zweryfikowania przez prawnika)* |
| UODO, „Rejestrowanie czynności przetwarzania" (uodo.gov.pl/pl/383/214) | wyjątek z art. 30 ust. 5 odpada, gdy zachodzi którakolwiek z trzech przesłanek, w tym niesporadyczny charakter przetwarzania | 2026-08-19 (publikacja 22.05.2018, ost. modyfikacja 08.07.2026) |
| Ustawa o prawach konsumenta, rozdział 5b (art. 43h–43q) — serwis lexlege.pl | art. 43i (wyłączenia — wąskie, dotyczy oprogramowania na otwartej licencji), art. 43p (zmiana usługi cyfrowej wyłącznie na podstawie umowy i z przyczyn w niej wskazanych), art. 43q (obowiązek informacyjny) | 2026-08-19 — **źródło nieurzędowe, do potwierdzenia na ISAP** |
| Prawo komunikacji elektronicznej (Dz.U. 2024 poz. 1221), art. 398 — źródła wtórne (prawo.pl i in.) | wymóg uprzedniej zgody na marketing bezpośredni; uchylenie art. 10 ustawy o świadczeniu usług drogą elektroniczną | 2026-08-19 — **numeracja do potwierdzenia na tekście urzędowym; to samo zastrzeżenie co w erracie E4** |
| Kodeks cywilny, art. 385¹ i 385³ | ocena klauzul o jednostronnej zmianie i odebraniu świadczenia | powołane kierunkowo, **bez weryfikacji brzmienia u źródła w tej ocenie** |
| Kod projektu | `functions/admin.js`, `functions/index.js` (l. 508–571), `firestore.rules` (l. 285, 304, 316–318), `src/pages/admin/**`, `docs/Panel-administratora.md`, `docs/support/Proces-obslugi-zgloszen.md` | 2026-08-19 |

---

## 8. Zastrzeżenie

**Ten dokument nie jest poradą prawną.** Przygotował go agent `legal` zespołu WynajemPRO jako
materiał roboczy do decyzji właściciela i do przekazania prawnikowi. Wszystkie kwalifikacje
prawne oznaczone jako „ocena robocza" są stanowiskiem zespołu opartym na treści przepisów
i stanowiskach organu, **nie zastępują opinii prawnika-człowieka** i nie mogą być podstawą
oświadczeń wobec użytkowników ani organu nadzorczego.

Zmiany w `Polityce prywatności`, `DPA` i `Regulaminie` opisane w sekcji 5 to **propozycje
brzmienia**, nie treści gotowe do publikacji. Ocena prawnika dla całego pakietu (bloker **N4**)
jest nadal oczekiwana; kwestie wynikające z tej oceny zebrano jako projekt erraty **E14**
(sekcja 6). Wdrożenie zmian w kodzie wykonuje `dev` po decyzji właściciela — agent `legal`
kodu ani treści prawnych w aplikacji nie zmienia.

---

*Dokument opisuje stan na 2026-08-19 (kod gotowy, nic nie wdrożone). Źródłem prawdy jest ten
plik `.md`; kopię `.docx` generuje `node scripts/build-docx.mjs docs/legal/Ocena-panelu-administratora-2026-08-19.md`.*
