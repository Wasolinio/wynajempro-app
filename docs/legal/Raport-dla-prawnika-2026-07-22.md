# WynajemPRO — raport dla prawnika

**Data:** 2026-07-22 · **Przygotowanie:** zespół WynajemPRO (materiał roboczy)
**Errata:** 2026-07-24, uzupełniona 2026-07-25 i 2026-08-10 — zmiany po przekazaniu pakietu, opisane w sekcji „Errata" poniżej.
**Cel:** przekazanie kompletu dokumentów do oceny prawnej przed uruchomieniem sprzedaży.

> **Charakter materiału:** wszystkie dokumenty w tym pakiecie są **projektami**. Nie zostały
> opublikowane, nie obowiązują żadnego użytkownika i nie przyjęto dotąd żadnej płatności od
> klienta. Opisy funkcji aplikacji zostały zweryfikowane bezpośrednio w kodzie produkcyjnym —
> tam, gdzie czegoś nie dało się potwierdzić, jest to wyraźnie zaznaczone zamiast domysłu.

---

## Errata — co zmieniło się po przekazaniu pakietu (stan na 2026-08-10)

> **Po co ta sekcja.** Pakiet przekazano 2026-07-22. Poniżej zebrano **wyłącznie to, co zmieniło
> się po tej dacie**, żeby lektura pierwotnego tekstu nie wprowadzała w błąd. **Numeracji sekcji
> i pytań nie zmieniono**, a pierwotnych sformułowań nie usunięto — miejsca, które straciły
> aktualność, mają w tekście odesłanie tutaj. Errata nie zdejmuje żadnego pytania z sekcji 4.

| # | Czego dotyczy | Było (stan przekazany 2026-07-22) | Jest (stan aktualny — data przy pozycji) | Dowód / gdzie opisane |
|---|---|---|---|---|
| **E1** *(2026-07-24)* | **Wycofanie zgody na cookies** — sekcja 5, punkt trzeci | „banner pozwala zgodę wyrazić, ale nie ma jeszcze mechanizmu jej łatwego wycofania. Wiemy o tym; pozycja jest otwarta i zostanie wdrożona." | Mechanizm wycofania i zmiany zgody **działa na produkcji od 2026-07-24**. Dwa równorzędne wejścia: link „Ustawienia cookies" w stopce serwisu oraz przycisk „Zmień lub wycofaj zgodę na cookies" na stronie Polityki Prywatności; oba otwierają ponownie banner z symetrycznym wyborem „Akceptuję" / „Wycofaj zgodę". Wycofanie **realnie zatrzymuje** analitykę (flaga opt-out dla identyfikatora pomiaru, wyłączenie zbierania po stronie Firebase, usunięcie plików cookies `_ga*`), a nie tylko chowa banner. | Wydanie produkcyjne 2026-07-24 (deploy `hosting:app`, commit `495aace`, domena `wynajempro.com`); przepływ akceptacja → wycofanie przeklikany end-to-end na produkcji. Opis: `Bezpieczenstwo-kont-i-danych.md` §9.1 oraz `Polityka-prywatnosci.md` §9. **Zastrzeżenie zakresu → E2** |
| **E2** *(2026-07-24)* | **Zasięg mechanizmu z E1** (kwestia nierozpoznana w pakiecie z 2026-07-22) | — | Na **stronach gościa** (`/guide/…`, `/opinie/…`) **nie ma dziś na produkcji wejścia do panelu zgód** — strony te nie mają stopki serwisu. Poprawka jest przygotowana w kodzie, ale **nie została wdrożona** (termin wdrożenia to odrębna decyzja właściciela). Do czasu wdrożenia deklaracja „równie łatwego wycofania" odpowiada stanowi faktycznemu dla serwisu i strony Polityki, a **nie** dla stron gościa — choć to właśnie tam analityka uruchamia się wobec osób niebędących naszymi użytkownikami. **[AKTUALIZACJA 2026-08-10 — pozycja ZAMKNIĘTA]** Poprawka **została wdrożona na produkcję 2026-08-10**. Na stronach gościa (`/guide/…`, `/opinie/…`) przy podpisie „Stworzono za pomocą WynajemPRO" jest wejście „Ustawienia cookies" otwierające ten sam panel zgód. Deklaracja „równie łatwego wycofania" odpowiada teraz stanowi faktycznemu **także dla stron gościa**. **[AKTUALIZACJA 2026-08-13 — pozycja domknięta w całości]** Ostatni wąski przypadek — ekrany błędu obu widoków („Brak dostępu" / „Nie znaleziono strony"), które renderowały się bez tego podpisu, więc gość z nieaktualnym linkiem po akceptacji banera nie miał wejścia do wycofania — **został wdrożony na produkcję 2026-08-13** i przeklikany na żywo. Wejście „Ustawienia cookies" jest teraz na obu ekranach błędu. **Odrębne zastrzeżenie faktyczne (nie prawne):** w dniu 2026-08-13 stwierdzono awarię techniczną po stronie konfiguracji dostawcy, przez którą strony gościa nie wczytują się wcale (sesja gościa jest odrzucana). Nie zmienia to treści powyższych deklaracji — mechanizm zgód jest wdrożony i działa — ale w okresie awarii same strony są dla gości niedostępne. Sprawa jest w toku po stronie właściciela. | Ustalenie własne 2026-07-24. Kontekst: `Polityka-prywatnosci.md` §9 (analityka na stronach publicznych), `Ocena-linki-guide-opinie.md` poz. 5. **Wdrożenie:** commit `0660c1e`, deploy `hosting:app` 2026-08-10; obecność mechanizmu potwierdzona w kodzie serwowanym z produkcji |
| **E3** *(2026-07-24)* | **Ostrzeżenie przed usunięciem konta** — dotyczy pytania **13** w sekcji 4.2 | Komunikat wyświetlany przed usunięciem konta wymieniał **węższy zakres** niż faktycznie wykonywana kasacja | Komunikat wymienia **pełny faktyczny zakres**: przewodniki wraz z danymi dostępowymi gości i zapisami akceptacji regulaminu, pliki, dane biznesowe, subskrypcję i rekord klienta Stripe, profil oraz konto logowania — ze wskazaniem nieodwracalności i braku okresu karencji. Zakres jest spójny z opisem usuwania danych w dokumencie nr 4. | Kod: `src/pages/dashboard/modals/AccountModal.jsx`, wydanie 2026-07-24 (commit `495aace`). **Zastrzeżenie co do sposobu weryfikacji:** potwierdzone w kodzie, buildzie i testach; komunikat jest dostępny wyłącznie po zalogowaniu, więc **nie był oglądany na produkcji**. Pytanie 13 **pozostaje otwarte** — prosimy oceniać nowe brzmienie |
| **E4** *(2026-07-24)* | **Podstawa prawna cookies** cytowana w dokumentach | Dokumenty (m.in. Polityka §9, checklista) powołują „Prawo telekomunikacyjne (art. 173)" | Odnotowaliśmy, że ta podstawa jest **nieaktualna**: ustawa z 12.07.2024 — **Prawo komunikacji elektronicznej** (Dz.U. 2024 poz. 1221) weszła w życie **10.11.2024** i zastąpiła Prawo telekomunikacyjne; przechowywanie informacji w urządzeniu końcowym (cookies) reguluje **art. 399 PKE**. **Brzmień merytorycznych nie zmienialiśmy** — model opt-in i zgoda w rozumieniu RODO pozostają bez zmian. **Korekta samej podstawy to prośba do Państwa.** | Notki dodane w `Polityka-prywatnosci.md` §9 i `Checklista-zgodnosci.md` (sekcje A, B, C). Weryfikacja źródeł 2026-07-24 (ISAP / Dziennik Ustaw, komunikat Ministerstwa Cyfryzacji). **Uwaga:** wskazywanego przepisu o definicji zgody (art. 402 PKE) **nie potwierdziliśmy w tekście urzędowym** — prosimy o weryfikację numeracji |
| **E5** *(2026-07-24)* | **Stan dokumentów pakietu** — tabela w sekcji 2 | Wszystkie pozycje opisane jako „zaktualizowany 2026-07-22" | Po przekazaniu zmieniły się trzy dokumenty: **nr 2** `Polityka-prywatnosci.md` (§9 — opis wycofania zgody + notka o podstawie prawnej), **nr 4** `Bezpieczenstwo-kont-i-danych.md` (nowa sekcja 9.1 „pozycje domknięte", dwie pozycje zeszły z listy braków), **nr 6** `Checklista-zgodnosci.md` (zamknięcie pozycji „wycofanie zgody cookie", oznaczenie podstawy prawnej). Dokumenty **1, 3, 5 i 7 — bez zmian**. **[AKTUALIZACJA 2026-07-25]** stan tej pozycji opisuje dzień 2026-07-24; późniejsze zmiany — patrz **E6** |
| **E6** *(2026-07-25)* | **Zmiana modelu danych rezerwacji** — dotyczy dokumentu nr 2 (`Polityka-prywatnosci.md` §4) i nr 3 (`DPA-powierzenie.md` §3) | Rezerwacja zawierała **jedną liczbę osób** („liczba gości"); dokumenty opisywały dane rezerwacji jako „obiekt, daty, kwoty; ewentualne dane kontaktowe" | Rezerwacja zyskuje **rozbicie składu osobowego pobytu**: liczba dorosłych, liczba dzieci, liczba zwierząt (pola **opcjonalne**, wyłącznie wartości liczbowe; łączna liczba osób = dorośli + dzieci). Nowa jest **kategoria informacji**, nie sposób jej udostępniania: **ekspozycja danych nie zmienia się w żadnym punkcie** — pola są czytelne wyłącznie dla zalogowanego Gospodarza (reguły bazy: właściciel + zweryfikowany e-mail + aktywna subskrypcja), nie trafiają do przewodnika gościa ani strony opinii, nie występują w publicznym eksporcie kalendarza (iCal) i nie są wysyłane do analityki. **Funkcja jest w kodzie i NIE została wdrożona na produkcję** — wdrożenie (reguły bazy przed frontem) to odrębna decyzja właściciela, więc opisy w dokumentach 2 i 3 są opisem stanu **po wdrożeniu**. **[AKTUALIZACJA 2026-08-10]** Funkcja **została wdrożona na produkcję 2026-08-10** (reguły bazy przed frontem, kolejność zachowana). Opisy w dokumentach 2 i 3 są od tej daty opisem **stanu faktycznego**, a nie stanu docelowego. Ocena robocza kategorii danych (dane zwykłe, bez danych identyfikujących dziecko) pozostaje niezmieniona i **nadal prosimy o jej weryfikację**. **Ocena robocza (prosimy o weryfikację):** to dane zwykłe dotyczące gościa rezerwującego, nie dane szczególnych kategorii (art. 9 RODO); nie zapisujemy żadnych danych identyfikujących dziecko (brak imienia, wieku, daty urodzenia) — sama liczba, dlatego **nie dopisaliśmy „osób małoletnich" do kategorii osób w DPA §3**; art. 8 RODO nie ma zastosowania (usługa nie jest oferowana bezpośrednio dziecku); w naszej ocenie zmiana nie uruchamia obowiązku oceny skutków (art. 35 RODO — wykaz Prezesa UODO, M.P. 2019 poz. 666). **Prosimy o sygnał, jeśli w Państwa ocenie kategorie powierzenia powinny jednak wymieniać małoletnich wprost** — pytanie łączy się z sekcją 4.1 pkt 3 (kompletność DPA) | Kod (gałąź robocza, przed wdrożeniem): `firestore.rules` — pola `adults`/`children`/`pets` w allowliście i walidacji `isValidRental`, odczyt kolekcji `rentals` wyłącznie za `isOwnerAndVerified` + `hasActiveSubscription`; `functions/index.js` — publiczny eksport iCal emituje tylko identyfikator, daty i stałą nazwę „Rezerwacja z WynajemPRO"; `src/pages/dashboard/modals/AddEditEntryModal.jsx`, `src/utils/guestCount.js`. Weryfikacja stanu faktycznego w kodzie: 2026-07-25 (niezależnie przez dwie role zespołu). Opis: `Polityka-prywatnosci.md` §4, `DPA-powierzenie.md` §3 |

| **E7** *(2026-08-10)* | **Nowy subprocesor — wsparcie obsługi zgłoszeń modelem językowym.** Dotyczy dokumentu nr 2 (`Polityka-prywatnosci.md` §2 i §5) i nr 3 (`DPA-powierzenie.md` §7) | Lista subprocesorów obejmowała **trzy** podmioty: Google/Firebase, Stripe, Google (OAuth). Obsługa zgłoszeń z formularza `/kontakt` odbywała się wyłącznie ręcznie | Operator wprowadza **wsparcie obsługi zgłoszeń narzędziem opartym na modelu językowym (Anthropic)**. Przetwarzane są: treść zgłoszenia wraz z adresem e-mail nadawcy oraz — przy diagnostyce konkretnego konta — dane konta Gospodarza wskazanego przez Operatora. **Trzy zabezpieczenia wbudowane w rozwiązanie, nie tylko deklarowane:** (1) kanał techniczny ma uprawnienia **wyłącznie do odczytu** — narzędzia zapisu, modyfikacji i usuwania danych nie zostały udostępnione na poziomie konfiguracji, więc nie istnieją, a nie „są zabronione"; (2) **stopniowanie zakresu** — diagnostyka zaczyna się od stanu konta i subskrypcji, a do danych rezerwacji (dane Gości = dane powierzone) sięga wyłącznie wtedy, gdy zgłoszenie tego wymaga; (3) klauzula informacyjna **przy samym formularzu** wymienia tę kategorię odbiorcy, a nie odsyła wyłącznie do Polityki. **Prosimy o ocenę trzech kwestii:** (a) czy przy tak zawężonym zakresie dostawca jest subprocesorem **danych powierzonych** (DPA §7), czy wyłącznie danych, wobec których Operator jest administratorem — pytanie bliźniacze do postawionego przy Stripe w sekcji 4.1 pkt 3; (b) czy podstawa z art. 6 ust. 1 lit. f dla obsługi zgłoszeń obejmuje udział takiego dostawcy, czy wymaga odrębnego uzasadnienia; (c) czy wymagany jest test równowagi (LIA) i ocena skutków (art. 35). **Kanał wprowadzono przed launchem**, gdy jedynym Gospodarzem jest właściciel — po launchu dodanie subprocesora uruchamia obowiązek powiadomienia Gospodarzy i prawo sprzeciwu (DPA §7 ust. 2) | Konfiguracja: `.mcp.json` (jawna lista pięciu narzędzi wyłącznie odczytu) i `.claude/settings.json` (druga warstwa — lista zakazanych operacji). Klauzula: `src/pages/ContactPage.jsx`. Proces i granice zakresu: `docs/support/Proces-obslugi-zgloszen.md`. **Zastrzeżenie:** podmiot kontraktujący Anthropic oraz mechanizm legalizujący transfer poza EOG **nie zostały wpisane** — oznaczono je jako do potwierdzenia u źródła, zgodnie z zasadą przyjętą dla pozostałych subprocesorów |
| **E8** *(2026-08-13)* | **Kopie zapasowe bazy** — dotyczy dokumentu nr 4 (`Bezpieczenstwo-kont-i-danych.md` §9) i **pytania z sekcji 4.1 pkt 5** | Dokument nr 4 wymieniał brak konfiguracji kopii zapasowych bazy (harmonogram eksportu / odtwarzanie do punktu w czasie) jako pozycję otwartą o wadze „średnia–wysoka, rekomendowane do wdrożenia przed launchem" | Konfiguracja **została wykonana 2026-08-13**: włączone **odtwarzanie do punktu w czasie z oknem 7 dni** oraz niezależny **dzienny harmonogram kopii zapasowych z retencją 7 dni**. Istnieje więc ścieżka odtworzenia danych po omyłkowym skasowaniu przez aplikację lub skrypt — czego sama redundancja infrastruktury dostawcy nie zapewniała. Pozycja zeszła z listy braków do sekcji 9.1 dokumentu nr 4. **Zakres:** mechanizm obejmuje bazę danych, **nie** pliki w magazynie plików | Stan potwierdzony odczytem konfiguracji bazy po zmianie: odtwarzanie do punktu w czasie włączone, okres przechowywania wersji 7 dni (wcześniej 1 godzina), harmonogram dzienny, retencja 7 dni; przed zmianą harmonogramów było zero. Opis: `Bezpieczenstwo-kont-i-danych.md` §9.1 |
| **E9** *(2026-08-13)* | **Egzekwowanie App Check** — dotyczy **pytania z sekcji 4.1 pkt 5** oraz dokumentu nr 4 (`Bezpieczenstwo-kont-i-danych.md` §9) | Pytaliśmy Państwa, czy deklarację o ochronie przed automatycznymi nadużyciami można utrzymać, skoro **nie umieliśmy potwierdzić**, czy mechanizm jest egzekwowany — z kodu widać było wyłącznie jego inicjalizację | **Potwierdzone.** Odczyt panelu dostawcy: **baza danych (Cloud Firestore) — egzekwowanie WŁĄCZONE, 99% żądań zweryfikowanych**; **uwierzytelnianie — egzekwowanie WŁĄCZONE**; magazyn plików — monitorowanie (100% zweryfikowanych, bez odrzucania); funkcje serwerowe — bez egzekwowania. Deklaracja odpowiada stanowi faktycznemu **dla bazy i logowania**, czyli warstw z danymi osobowymi. **Prosimy o ocenę, czy przy takim zakresie brzmienie Polityki §9 i DPA §6 jest wystarczająco precyzyjne**, czy wymaga zawężenia do usług faktycznie objętych. | Zrzut panelu App Check przekazany przez Operatora 2026-08-13 + weryfikacja na żywo (po włączeniu egzekwowania dla uwierzytelniania strony dla Gości nadal działają). Opis: `Bezpieczenstwo-kont-i-danych.md` §9.1. **Zastrzeżenie:** u dostawcy egzekwowanie dla uwierzytelniania jest oznaczone jako funkcja w wersji zapoznawczej (PREVIEW), co oznacza możliwość zmian po stronie dostawcy bez zapowiedzi |

**[AKTUALIZACJA 2026-08-10]** Po erracie E7 zmieniły się dodatkowo **nr 2**
(`Polityka-prywatnosci.md` — §2 i §5) oraz **nr 3** (`DPA-powierzenie.md` — §7). Pozycje **E2**
i **E6**, które w chwili pisania opisywały funkcje „przygotowane, ale niewdrożone", zostały
**zaktualizowane po wdrożeniu produkcyjnym z 2026-08-10** — prosimy czytać je razem z dopiskami.

**[AKTUALIZACJA 2026-07-25]** Łączny stan dokumentów po przekazaniu pakietu: zmieniły się
**nr 2** (`Polityka-prywatnosci.md` — §9 w dniu 2026-07-24, §4 w dniu 2026-07-25), **nr 3**
(`DPA-powierzenie.md` — §3, 2026-07-25), **nr 4** (`Bezpieczenstwo-kont-i-danych.md` — 2026-07-24)
i **nr 6** (`Checklista-zgodnosci.md` — 2026-07-24 i 2026-07-25). Dokumenty **1, 5 i 7 — bez zmian**.

**Czego errata NIE zmienia:**

- Wszystkie dokumenty pozostają **projektami** — nieopublikowanymi, nieobowiązującymi nikogo;
  nadal nie przyjęto żadnej płatności od klienta.
- **Wszystkie pytania z sekcji 4.1 i 4.2 pozostają otwarte** (pytanie 13 — patrz E3).
- **Pozostałe braki z dokumentu nr 4 są otwarte**: osierocone pliki z przeszłości, brak 2FA,
  brak wydzielonego monitoringu bezpieczeństwa. **Egzekwowanie App Check zeszło z tej listy
  2026-08-13 — patrz E9** (z zastrzeżeniem zakresu: magazyn plików i funkcje bez egzekwowania).
  **Konfiguracja kopii zapasowych zeszła z tej listy 2026-08-13 — patrz E8.** Polityka haseł: decyzja
  o podniesieniu do 8 znaków z wymogiem litery i cyfry zapadła 2026-08-13, wprowadzenie w konsoli
  jest jeszcze przed nami. W sprawie App Check doszło ustalenie faktyczne z 2026-08-13: żądanie bez
  ważnego tokenu App Check jest przez usługę uwierzytelniania **odrzucane**, co wskazuje, że dla tej
  usługi egzekwowanie **działa**; pełne potwierdzenie per usługa nadal wymaga konsoli. **Pytanie z sekcji 4.1 pkt 5
  jest w pełni aktualne** — zmieniła się tylko struktura listy (pozycje domknięte przeniesiono
  do sekcji 9.1 tamtego dokumentu, żeby nie udawały braków).
- Generator umów najmu **pozostaje funkcją wyłączoną** (sekcja 5, punkt pierwszy).

---

## 1. Czym jest WynajemPRO

Aplikacja internetowa (model SaaS) dla osób wynajmujących krótkoterminowo nieruchomości —
domki, apartamenty. Jeden użytkownik („Gospodarz") zarządza swoimi obiektami: kalendarzem
rezerwacji, kosztami, prostymi rozliczeniami podatkowymi.

**Adres:** https://wynajempro.com · **Model:** 14 dni bezpłatnego okresu próbnego (bez karty),
następnie subskrypcja 29,99 zł/mies. przez Stripe · **Skala:** przed startem sprzedaży,
działalność jednoosobowa, brak pracowników.

**Funkcja istotna prawnie:** Gospodarz tworzy w aplikacji **przewodnik dla gościa** — stronę
z instrukcjami pobytu, którą udostępnia linkiem. Przewodnik zawiera m.in. kod do drzwi i hasło
WiFi, ujawniane gościowi po elektronicznej akceptacji regulaminu obiektu. Oznacza to, że
**Gospodarz przetwarza w aplikacji dane swoich gości** — stąd potrzeba umowy powierzenia (DPA).

---

## 2. Co przekazujemy do oceny

| # | Dokument | Czego dotyczy | Stan |
|---|---|---|---|
| 1 | `Regulamin.md` | Regulamin świadczenia usług drogą elektroniczną | Projekt, zaktualizowany 2026-07-22 |
| 2 | `Polityka-prywatnosci.md` | Informacja o przetwarzaniu danych (art. 13 RODO) | Projekt, zaktualizowany 2026-07-22 |
| 3 | `DPA-powierzenie.md` | Umowa powierzenia (art. 28 RODO) — Gospodarz jako administrator danych gości | Projekt, zaktualizowany 2026-07-22 |
| 4 | `Bezpieczenstwo-kont-i-danych.md` | **Nowy** — opis zabezpieczeń kont, haseł i danych, z listą braków | Materiał informacyjny |
| 5 | `Ocena-linki-guide-opinie.md` | Analiza modelu „dostęp po linku" (strony dostępne bez logowania) | Analiza wewnętrzna |
| 6 | `Checklista-zgodnosci.md` | Lista kontrolna zgodności z podstawami prawnymi | Materiał roboczy |
| 7 | `Uwagi-N5-dla-prawnika.md` | Ustalenia z wewnętrznego audytu bezpieczeństwa i RODO | Materiał roboczy |

Dokumenty 1–3 są przeznaczone do publikacji po akceptacji. Dokumenty 4–7 to materiał
kontekstowy — pokazują, na jakiej podstawie sformułowano treści i jakie ryzyka rozpoznano.

> **[ERRATA 2026-07-24]** Kolumna „Stan" opisuje dzień przekazania pakietu. Po 2026-07-22
> zmieniły się dokumenty **nr 2, 4 i 6** — zakres zmian w erracie, pozycja **E5**.
> **[ERRATA 2026-07-25]** Dodatkowo zmieniły się **nr 2** (ponownie, §4) i **nr 3** (§3) —
> pozycja **E6**.

---

## 3. Co zrobiliśmy sami przed tym spotkaniem

Żeby nie zajmować czasu prawnika kwestiami technicznymi, przed spotkaniem domknęliśmy warstwę
techniczną, od której zależy prawdziwość deklaracji w dokumentach:

- **Weryfikacja adresu e-mail** — wymagana, egzekwowana także po stronie serwera (nie tylko
  w interfejsie).
- **Kontrola dostępu do danych** — dane każdego konta odizolowane regułami bazy danych;
  udostępnianie publiczne ograniczone do świadomie wybranych stron.
- **Usuwanie danych (art. 17)** — pełna kasacja obejmuje dziś także treści przewodników, dane
  dostępowe gości, pliki oraz rekord klienta u operatora płatności; proces jest odporny na awarie
  (nieudany krok powoduje ponowienie, a nie ciche pominięcie).
- **Retencja** — zdefiniowana i zaimplementowana: 30 dni po anulowaniu subskrypcji, 90 dni po
  zakończeniu okresu próbnego, brak karencji przy usunięciu na żądanie.
- **Strony gości** — wyłączone z indeksowania przez wyszukiwarki na poziomie serwera; identyfikator
  linku nie jest przekazywany do narzędzia analitycznego.

**Zasada, którą się kierowaliśmy:** dokument nie deklaruje środka, którego kod nie egzekwuje.
Kilka zapisów było celowo wstrzymanych do czasu faktycznego wdrożenia.

---

## 4. Zagadnienia, w których prosimy o rozstrzygnięcie

### 4.1 Priorytet — bez tego nie ruszamy ze sprzedażą

1. **Prawo odstąpienia (Regulamin §7).** Model jest nietypowy: 14 dni okresu próbnego **bez
   pobrania płatności**, dopiero potem płatna subskrypcja. Odstąpienie od umowy o dostęp do
   okresu próbnego i odstąpienie od płatnej subskrypcji to dwie różne sytuacje. Prosimy
   o skonstruowanie klauzuli o zgodzie na rozpoczęcie świadczenia i utracie prawa odstąpienia,
   dopasowanej do tego przepływu, oraz o wskazanie, co musi zostać pokazane użytkownikowi
   w procesie płatności.
2. **Status „przedsiębiorcy na prawach konsumenta".** Większość gospodarzy prowadzi działalność
   gospodarczą, ale korzystanie z aplikacji może nie mieć dla nich charakteru zawodowego.
   Przesądzenie zakresu ochrony konsumenckiej wpływa na §7, §8 i §12 Regulaminu.
3. **Kompletność DPA (art. 28 ust. 3).** W szczególności: czy opis kanału „dostępu po linku"
   (§2 ust. 5) wystarczająco realizuje wymóg opisania charakteru przetwarzania, czy potrzebne
   jest odrębne oświadczenie Gospodarza o akceptacji tego kanału, oraz czy **Stripe jest
   subprocesorem danych powierzonych** (naszym zdaniem dotyczy relacji Operator–Gospodarz,
   nie danych gości — prosimy o potwierdzenie). **[ERRATA 2026-07-25]** Do tego punktu doszła
   kwestia **kategorii danych powierzonych po rozbiciu liczby gości** (dorośli / dzieci /
   zwierzęta) — nasze rozstrzygnięcie i uzasadnienie w erracie, pozycja **E6**.
4. **Model „dostępu po linku" a art. 32 RODO.** Kluczowe pytanie tego pakietu, opisane
   w dokumencie nr 5: przewodnik z kodem do drzwi i hasłem WiFi jest dostępny dla **każdego, kto
   zna link** — bez logowania i bez weryfikacji tożsamości. Wdrożyliśmy środki ograniczające
   (nieodgadywalne adresy, brak możliwości listowania, wyłączenie z wyszukiwarek, ochrona przed
   wyciekiem adresu). Prosimy o ocenę, czy taki model jest obronny, oraz o wskazanie, czy
   konieczne jest wygasanie linków lub dodatkowy PIN. Zwracamy uwagę, że **kod do drzwi dotyczy
   bezpieczeństwa fizycznego nieruchomości**, a nie tylko danych osobowych.
5. **Zgodność deklarowanych zabezpieczeń ze stanem faktycznym.** Dokument nr 4 zawiera także
   listę braków (m.in. brak 2FA, hasło od 6 znaków, brak potwierdzonej konfiguracji kopii
   zapasowych). Prosimy o wskazanie, które z nich należy usunąć **przed** startem sprzedaży.

### 4.2 Ważne, ale nie blokujące startu

6. **Podstawa prawna publikacji kontaktu gospodarza** w przewodniku: wykonanie umowy (art. 6
   ust. 1 lit. b) czy zgoda (lit. a)? Publikacja jest opcjonalna i sterowana przełącznikiem.
7. **Reżim reklamacji i zgodności usługi cyfrowej** (rozdz. 5b ustawy o prawach konsumenta) —
   terminy i skutki milczenia; obecny zapis to 14 dni.
8. **Klauzule ograniczające odpowiedzialność** (Regulamin §12) pod kątem abuzywności — zwłaszcza
   w powiązaniu z §4 ust. 3 (odpowiedzialność Gospodarza za dystrybucję linku).
9. **Transfery danych poza EOG** dla Google/Firebase i Stripe — jaki mechanizm wskazać w DPA §7.
10. **Retencja zgłoszeń z formularza kontaktowego** — proponujemy 12 miesięcy; prosimy
    o potwierdzenie lub wskazanie właściwego okresu.
11. **Okres przechowywania dokumentacji rozliczeniowej** i zasady fakturowania (VAT albo podstawa
    zwolnienia) — do wpisania w Polityce i Regulaminie.
12. **Obowiązek informacyjny przy promocji „founding members"** — czy i jak stosować wymóg
    podania najniższej ceny z 30 dni (dyrektywa Omnibus).
13. **Nieodwracalne usunięcie konta bez „kosza"** — czy sposób ostrzeżenia użytkownika przed
    operacją jest wystarczający. **[ERRATA 2026-07-24]** Brzmienie ostrzeżenia zostało po
    przekazaniu pakietu rozszerzone o pełny faktyczny zakres kasacji — pytanie pozostaje otwarte,
    ale prosimy oceniać **nowe** brzmienie (errata, pozycja **E3**).
14. **Czy potrzebny jest Inspektor Ochrony Danych** przy tej skali działalności (nasza ocena
    robocza: nie, art. 37 RODO — prosimy o potwierdzenie).
15. **Aktualny stan obowiązków informacyjnych o pozasądowym rozwiązywaniu sporów** (unijna
    platforma ODR została wygaszona — co należy dziś podawać).

### 4.3 Do wypełnienia przez właściciela przed publikacją

W dokumentach pozostawiono oznaczone miejsca `[DO UZUPEŁNIENIA]` — dane rejestrowe firmy, adresy
kontaktowe, numer i data wersji, warunki oferty „founding members". Nie zostały wypełnione
celowo, żeby uniknąć wpisania danych niepotwierdzonych.

---

## 5. Funkcje wyłączone i świadomie odłożone

Dla porządku — czego aplikacja **dziś nie robi**, mimo że dokumenty mogą o tym wspominać:

- **Generator umów najmu** — funkcja wyłączona z interfejsu decyzją właściciela; nie jest
  oferowana użytkownikom. Regulamin §4 opisuje ją jako niedostępną, a zastrzeżenie o charakterze
  wzorców wraca razem z funkcją. Prosimy o ocenę, czy przy ewentualnym ponownym włączeniu samo
  udostępnianie wzorców nie rodzi odpowiedzialności Operatora.
- **Automatyczna wysyłka wiadomości do gości** — nieobecna; wszystkie linki gospodarz przekazuje
  ręcznie.
- **Wycofanie zgody na cookies** — *treść przekazana 2026-07-22, dziś nieaktualna:* „banner
  pozwala zgodę wyrazić, ale nie ma jeszcze mechanizmu jej łatwego wycofania. Wiemy o tym;
  pozycja jest otwarta i zostanie wdrożona."
  **[ERRATA 2026-07-24]** Mechanizm wycofania i zmiany zgody **działa na produkcji od
  2026-07-24** — opis i dowód w erracie, pozycja **E1**, oraz w `Bezpieczenstwo-kont-i-danych.md`
  §9.1 i `Polityka-prywatnosci.md` §9. W tej sekcji pozostaje natomiast **węższe, wciąż aktualne
  zastrzeżenie**: na **stronach gościa** (`/guide/…`, `/opinie/…`) **nie ma dziś na produkcji
  wejścia do panelu zgód** — poprawka jest przygotowana w kodzie, przed wdrożeniem
  (errata, pozycja **E2**).
- **[ERRATA 2026-07-25] Rozbicie liczby gości** (dorośli / dzieci / zwierzęta w rezerwacji) —
  funkcja jest **w kodzie i nie działa jeszcze na produkcji**; dokumenty nr 2 i 3 opisują ją jako
  stan po wdrożeniu. Termin wdrożenia to odrębna decyzja właściciela (errata, pozycja **E6**).

---

## 6. Nasza prośba

Prosimy o: (a) rozstrzygnięcie punktów z sekcji 4.1, (b) korektę brzmień w dokumentach 1–3,
(c) wskazanie, które braki z dokumentu nr 4 blokują start sprzedaży, oraz (d) informację, czy
potrzebują Państwo dostępu do dodatkowych materiałów technicznych — możemy przygotować dowolny
wycinek konfiguracji lub kodu.

Dodatkowo — po erracie z 2026-07-24 — prosimy o (e) wskazanie **właściwej podstawy prawnej
cookies** do wpisania w dokumentach po zastąpieniu Prawa telekomunikacyjnego przez Prawo
komunikacji elektronicznej (errata, pozycja **E4**), a po erracie z 2026-07-25 — o (f) ocenę,
czy **kategorie danych powierzonych w DPA §3** po rozbiciu liczby gości są opisane prawidłowo
(errata, pozycja **E6**).

---

*Materiał roboczy zespołu WynajemPRO. Opisy stanu aplikacji zweryfikowane w kodzie produkcyjnym
2026-07-22; errata na początku dokumentu opisuje zmiany po wydaniu produkcyjnym z 2026-07-24
(commit `495aace`) oraz zmianę modelu danych rezerwacji odnotowaną 2026-07-25 (kod gałęzi
roboczej, przed wdrożeniem). Nie stanowi opinii prawnej ani deklaracji zgodności.*
