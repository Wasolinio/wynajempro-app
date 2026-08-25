# Panel administratora — instrukcja

> **Stan na 2026-08-19: kod gotowy, NIC NIE JEST WDROŻONE.** Panel zacznie działać dopiero
> po wykonaniu trzech kroków z sekcji 2. Do tego czasu wejście na `/admin` pokaże ekran
> „Brak uprawnień" (jeśli jesteś zalogowany) albo przekieruje na logowanie.

---

## 1. Co to jest i po co powstało

Panel pod adresem **`wynajempro.com/admin`** odpowiada na pytania, które do tej pory
wymagały trzech różnych dróg: konsoli Firebase, sesji z agentem albo skryptu z kluczem
serwisowym. Ilu przybyło użytkowników, ilu płaci, komu kończy się okres próbny, kto napisał
przez formularz kontaktowy, co wymaga reakcji.

Wygląda i działa jak panel gospodarza — ten sam ciemny pasek boczny, te same liczby
w czcionce technicznej, ta sama zasada „zero ozdobników". Różni go tylko znacznik **ADMIN**
przy logo. Działa też na telefonie.

### Czego panel celowo NIE robi

| Nie robi | Dlaczego |
|---|---|
| Nie pokazuje rezerwacji ani podpisów gości | To dane, wobec których jesteś **procesorem**, nie administratorem. Panel je **liczy**, nigdy nie wyświetla. Gdy zgłoszenie naprawdę tego wymaga, idzie się ścieżką z `docs/support/Proces-obslugi-zgloszen.md`. |
| Nie wysyła maili | „Odpowiedz" otwiera Twój program pocztowy. Wysyłka z aplikacji to osobna decyzja: nadawca, SPF/DKIM, ślad w RODO. |
| Nie kasuje danych | Kasowanie należy do nocnej funkcji, która ma własne, sprawdzane ponownie kryteria. Panel pokazuje, co się kwalifikuje — i tyle. |
| Nie nadaje uprawnień administratora | To wymaga klucza serwisowego, patrz krok 2.3. Gdyby dało się to zrobić z panelu, przejęcie jednego konta pozwalałoby napastnikowi rozsiać kolejne. |

---

## 2. Uruchomienie — krok po kroku

Dziewięć kroków. Kroki 1–3 nic nie zmieniają na produkcji (możesz je zrobić od razu),
kroki 4–9 zmieniają — i od nich nie ma odwrotu jednym kliknięciem.

Kolejność nie jest dowolna: **najpierw reguły, potem funkcje, na końcu aplikacja.**
Powód: aplikacja bez funkcji po drugiej stronie pokaże błędy, a nowa reguła nikomu nic
nie psuje (dokłada wyłącznie zamkniętą kolekcję).

---

### Krok 1 — sprawdź, że nic się nie zepsuło po drodze

```bash
npm run lint && npm run build && npm run test:e2e
```

**Czego oczekiwać:** lint bez błędów, build bez błędów, **172 testy przechodzą**
(144 wcześniejsze + 28 nowych, które sprawdzają panel).
**Jeśli padnie:** nie idź dalej. Wynik testu powie który i dlaczego.

---

### Krok 2 — sprawdź warstwę odczytu bez bazy

```bash
cd functions && node --test
```

**Czego oczekiwać:** `pass 9`, `fail 0`. To sprawdzenie maskowania identyfikatora
podatkowego, ukrywania tokenów w adresach iCal i liczenia doby wg strefy Europe/Warsaw.
Nie wymaga żadnych poświadczeń.

---

### Krok 3 — uruchom panel na prawdziwych danych, ZANIM go wdrożysz

To jest krok, którego nie da się zastąpić niczym innym: zapytania panelu **nigdy jeszcze
nie były uruchomione przeciw prawdziwej bazie** (nie ma tu emulatora Firestore).
Skrypt woła dokładnie ten sam kod, który wywoła wdrożona funkcja — i **wyłącznie do odczytu**.

Najpierw pobierz **klucz serwisowy**: Konsola Firebase → Ustawienia projektu → Konta usługi →
Wygeneruj nowy klucz prywatny. Zapisz plik **poza katalogiem projektu** (np. w `~/Klucze/`).

```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=~/Klucze/klucz.json node audit-admin-api.cjs
```

**Czego oczekiwać:** wypis wszystkich liczb, które zobaczysz potem w panelu, i na końcu
`✅ Wszystko przeszło` albo `⚠️ Przeszło z ostrzeżeniami`.
Skrypt nie wypisuje żadnych adresów ani treści zgłoszeń — tylko liczby.

**Porównaj liczby z konsolą Firebase** (liczba dokumentów w `users`, w `contact_messages`).
Jeśli się nie zgadzają, coś jest nie tak z zapytaniem i lepiej to wiedzieć teraz.

**Jeśli zobaczysz `❌`:** nie wdrażaj. Komunikat mówi, które zapytanie padło.

---

### Krok 4 — wdróż reguły bezpieczeństwa

```bash
firebase deploy --only firestore:rules
```

**Co się zmienia:** dokładnie jedna rzecz — nowa kolekcja `admin_audit`, zamknięta dla
wszystkich klientów. Nic z dotychczasowych reguł nie zostało poluzowane; zgłoszenia
z formularza dalej mają `allow read: if false`, czyli **żadna przeglądarka ich nie odczyta**.

---

### Krok 5 — wdróż funkcje

```bash
firebase deploy --only functions
```

**Co się zmienia:** dochodzą dwie funkcje — `adminApi` (panel) i `cleanupAdminAudit`
(nocne czyszczenie dziennika dostępu), a sześć istniejących wywołań przechodzi na scalanie
uprawnień zamiast nadpisywania (sekcja 5 — to naprawa błędu, który prędzej czy później
odebrałby Ci dostęp do panelu).

⚠️ **To dotyka webhooka Stripe**, czyli ścieżki płatności. Po wdrożeniu zajrzyj w logi:

```bash
firebase functions:log --only stripeWebhook
```

Nie powinno tam być nowych błędów.

---

### Krok 6 — zabezpiecz konto, które dostanie uprawnienie

> **To nie jest formalność i nie da się tego przełożyć na później.** Do dziś przejęcie
> Twojego konta oznaczało dostęp do **Twoich** danych. Po wdrożeniu panelu oznacza dostęp
> do danych **wszystkich gospodarzy**, ich profili (z numerem PESEL włącznie, po dwóch
> kliknięciach) i do skrzynki zgłoszeń — plus możliwość zmiany statusów kont.
> Ryzyko właśnie wzrosło, więc zabezpieczenie musi wzrosnąć razem z nim.

Konto z uprawnieniem administratora **loguj kontem Google z włączoną weryfikacją
dwuetapową**, nie hasłem. Firebase w wariancie bez Identity Platform nie oferuje drugiego
składnika dla logowania hasłem, więc to jedyna dostępna droga.

- [ ] Konto `wasyl515@gmail.com` ma włączoną weryfikację dwuetapową w Google.
- [ ] Do panelu logujesz się przyciskiem „Zaloguj przez Google", nie hasłem.

---

### Krok 7 — nadaj sobie uprawnienie

```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=~/Klucze/klucz.json node set-admin-claim.cjs wasyl515@gmail.com
```

**Czego oczekiwać:** `🔑 Nadano uprawnienie administratora`, wypisane uprawnienia — w których
**musi zostać `stripeStatus`** — oraz linijka `✅ Potwierdzone odczytem`.

To potwierdzenie nie jest ozdobnikiem. Zapis uprawnień to odczyt-zmiana-zapis, a webhook
Stripe może zapisywać w tej samej chwili; gdyby trafił w okno między odczytem a zapisem,
skrypt wypisze `⚠️ ROZJAZD` i zakończy się błędem — wtedy po prostu uruchom go ponownie.

Sprawdzenie, kto ma uprawnienie:

```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=~/Klucze/klucz.json node set-admin-claim.cjs --list
```

Odebranie (gdyby trzeba było):

```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=~/Klucze/klucz.json node set-admin-claim.cjs wasyl515@gmail.com --remove
```

> **Odebranie unieważnia też wydane tokeny.** Sam claim by nie wystarczył: token
> dostępowy żyje do godziny od wydania, więc przez ten czas ktoś, kto go ma, dalej
> przechodziłby przez bramkę funkcji. Skrypt zamyka to natychmiast — dlatego przy
> podejrzeniu przejęcia konta używa się właśnie tej komendy, a nie samego wylogowania.

---

### Krok 8 — wdróż aplikację

```bash
npm run build && firebase deploy --only hosting:app
```

---

### Krok 9 — sprawdź na żywo

Wejdź na **`wynajempro.com/admin`**. Nie musisz się wylogowywać — panel sam odświeża token.

Przejdź listę:

- [x] Przegląd pokazuje liczby, a nie zera i nie błąd. ✅ 2026-08-25
- [x] Liczby zgadzają się z tym, co wypisał krok 3. ✅ 2026-08-25 — „4 łącznie" potwierdzone niezależnym odczytem Firestore (3 × `active`, 1 × `trialing`).
- [x] Konta: wyszukiwarka znajduje Twoje własne konto. ✅ 2026-08-25
- [ ] Konta: kliknięcie konta pokazuje szczegóły; „Pokaż ustawienia" pokazuje profil,
      a identyfikator podatkowy jest **zamaskowany** (widoczne trzy ostatnie znaki).
      ✅ 2026-08-25 — ⚖️ konto właściciela nie ma NIP-u (działalność nierejestrowana), więc panel
      pokazał „—", co jest poprawne dla pustej wartości, ale **nie ćwiczy maskowania**.
      Domknięte inaczej: `functions/admin-data.test.cjs` 9/9 (m.in. `'90010112345'` → `'••••••••345'`,
      krótki identyfikator nie odsłania się przez zaokrąglenie) + e2e `admin-panel.spec.js:299`.
      Maskowanie widoczne na żywo na innym polu: linki iCal jako `…(15 zn.)`.
- [x] Zgłoszenia: widać zgłoszenia z formularza, a testowe są **ukryte** do czasu kliknięcia
      przycisku „Testowe". ✅ 2026-08-25 — sprawdzone end-to-end wysyłką z `/kontakt?test=1`.
      🛑 Przy okazji znaleziona i naprawiona myląca stopka: mówiła „testowe są ukryte" **bezwarunkowo**,
      także po włączeniu przełącznika. Test payloadu tego nie łapał — kłamał sam tekst.
- [x] Dziennik: są w nim wpisy z tego, co przed chwilą klikałeś — **to jest dowód, że
      audyt działa**. Pusty dziennik po klikaniu po kontach oznacza problem.
      ✅ 2026-08-25 — 63 wpisy, poziom 1 i poziom 2 jako **osobne** wpisy, `USERS.LIST` z `poczatekOkna: true`
      (dławienie 15-minutowe działa), same UID-y bez adresów e-mail. Wpisy sięgają 22.08, więc audyt
      działa od wdrożenia, nie od dnia sprawdzenia.
- [~] ~~Telefon: `/admin` na telefonie ma u góry przewijany pasek z sześcioma sekcjami.~~
      ⛔ **SKREŚLONE decyzją właściciela 2026-08-25**: „nie będę korzystał z panelu admina na telefonie".
      Sprawdzanie ekranu, z którego się nie korzysta, to praca bez pokrycia. Kod mobilny zostaje w aplikacji.
      **Nie wracać do tego przy kolejnych przeglądach.**

**Gdyby panel pokazał „Brak uprawnień":** token został wydany przed nadaniem uprawnienia —
wyloguj się i zaloguj ponownie. Jeśli dalej to samo, sprawdź krok 6 poleceniem `--list`.

---

## 3. Co jest w którym miejscu

### 01 · Przegląd

Cztery liczby na górze: rejestracje z 30 dni (z porównaniem do poprzednich 30), konta
płacące wraz z MRR, trwające okresy próbne z ostrzeżeniem o kończących się, nowe zgłoszenia.
Niżej wykres rejestracji dzień po dniu i **lejek** — ile osób przechodzi z rejestracji do
potwierdzenia adresu, uzupełnienia profilu, wprowadzenia danych i płatności. To jest miejsce,
w którym widać, gdzie ludzie odpadają.

Panel „Wymaga uwagi" zbiera wszystko, co czeka na reakcję. Pusty panel to dobra wiadomość.

> **MRR liczone jest jako liczba kont ze statusem „aktywna" × cena pobrana ze Stripe.**
> Konta z dostępem nadanym ręcznie (beta) też mają ten status, więc nie każde z nich płaci.
> To szacunek, nie księgowość.

### 02 · Konta

Wyszukiwarka po adresie, nazwie albo identyfikatorze. Po kliknięciu konta z prawej strony
pojawiają się szczegóły i przyciski.

**Dostęp do danych jest stopniowany** — dokładnie tak, jak w procedurze obsługi zgłoszeń:

1. **Poziom 1** (widoczny od razu): konto, subskrypcja, daty, liczba rezerwacji
   i przewodników. Rozstrzyga większość spraw.
2. **Poziom 2** (osobne kliknięcie „Pokaż ustawienia"): profil gospodarza, obiekty, podatki.
   Identyfikator podatkowy — który bywa numerem PESEL — jest **zamaskowany**; odsłonięcie
   to dodatkowe potwierdzenie i **osobny wpis w dzienniku**.
3. **Poziom 3** (dane gości): w panelu nie istnieje.

**Przyciski dostępu** rozwiązują problem, który do dziś wymagał ręcznej operacji na produkcji:

| Przycisk | Co robi |
|---|---|
| Przedłuż trial | Dodaje N dni. Jeśli okres próbny jeszcze trwa, liczy **od jego końca**, nie od dziś. |
| Nadaj dostęp (beta) | Ustawia status „aktywna" bez subskrypcji Stripe — dla testerów i founding members. |
| Odbierz | Odcina dostęp. **Nie planuje usunięcia danych** — odebranie dostępu to nie zgoda na kasowanie. Na koncie z **aktywną subskrypcją Stripe panel odmówi** — patrz niżej. |

> **Konto z żywą subskrypcją Stripe — dwie rzeczy do zapamiętania.**
> Po pierwsze: ręcznie ustawiony status („Nadaj dostęp") zostanie nadpisany przez webhook
> przy najbliższym zdarzeniu płatniczym. Panel odnotowuje to w dzienniku.
> Po drugie: **„Odbierz" na takim koncie jest odrzucane**, i to celowo. Panel odcina
> aplikację, ale nie dotyka Stripe — subskrypcja żyłaby dalej i klient płaciłby co miesiąc
> za produkt, do którego nie ma wstępu. Anulowanie idzie przez panel Stripe; wtedy webhook
> sam ustawi status i 30-dniową karencję na usunięcie danych.

> **Konto bez loginu albo bez dokumentu** ma przyciski dostępu wyłączone. Zmiana statusu
> potrzebuje obu stron konta — dokumentu (tam idzie status) i loginu (tam idzie uprawnienie
> w tokenie). Gdyby brakowało jednej, konto zostałoby w stanie połowicznym.

Jeżeli panel wypisze **„Rozjazd uprawnień"** — to najczęstsza przyczyna zgłoszenia
„zapłaciłem, a widzę ekran blokady". Token mówi co innego niż dokument w bazie. Każdy
z trzech przycisków powyżej ustawia obie rzeczy naraz i tym samym rozjazd naprawia.

### 03 · Zgłoszenia serwisowe

Skrzynka z formularza `/kontakt`. Trzy stany: **nowe**, **w toku**, **zamknięte**, do tego
notatka przy każdym zgłoszeniu (co ustalono, co odpisano).

> **Zgłoszenia testowe są domyślnie ukryte.** Te wysłane z zaznaczonym trybem testowym
> (`source: kontakt-test`) widać dopiero po kliknięciu przycisku „Testowe". Powód jest
> konkretny: 2026-08-10 zgłoszenie testowe z wymyśloną treścią uruchomiło pełną diagnostykę
> awarii, której nie było.

### 04 · Newsletter

Lista zapisów **wraz z dowodem zgody** — kto, kiedy, w jakim brzmieniu klauzuli. Eksport CSV
otwiera się w Excelu z polskimi znakami.

Jeżeli na górze pojawi się czerwone ostrzeżenie o zapisach bez zgody — to adresy sprzed
19.08.2026, gdy reguła jeszcze zgody nie wymagała. **Przed pierwszą wysyłką** trzeba je albo
odpytać ponownie, albo usunąć: dla nich nie da się wykazać podstawy prawnej.

### 05 · Porządek w danych

Lista zobowiązań i nieporządków: konta czekające na skasowanie, zaległości w płatnościach,
okresy próbne po terminie, adresy niepotwierdzone, rozjazdy między logowaniem a bazą,
**przewodniki bez właściciela** (czyli dane gości bez administratora) i zgłoszenia
przekraczające proponowany okres przechowywania.

Osobna pozycja: **„Odcięte, ale bez daty usunięcia"**. To konta, którym odebrano dostęp
z panelu. Nocne czyszczenie ich nie ruszy — wymaga zaplanowanej daty usunięcia albo statusu
okresu próbnego — więc zostają w bazie bezterminowo razem z rezerwacjami, przewodnikami
i podpisami gości. Panel ich nie kasuje, tylko pokazuje: **okres przechowywania dla tej
grupy to decyzja, która jeszcze nie zapadła**, i wymaga rozstrzygnięcia razem z zadaniem #31.

> Okres przechowywania **12 miesięcy to propozycja, nie decyzja** — w Polityce prywatności
> §2 wciąż stoi jako do rozstrzygnięcia (zadanie #31). Panel przypomina, nie kasuje.

### 06 · Dziennik administratora

Kto, kiedy i po co sięgnął po dane. Wpisy powstają wyłącznie po stronie serwera, a kolekcja
jest zamknięta dla każdej przeglądarki — **dziennika nie da się obejść ani podrobić z panelu**.
Przy stopniowanym dostępie do danych osobowych to jedyny dowód, że zakres faktycznie był
zawężany.

Do dziennika trafiają: odczyt konkretnego konta, wejście na poziom 2, odsłonięcie
identyfikatora podatkowego, każda zmiana dostępu, wyszukanie zgłoszenia po frazie, zmiana
zgłoszenia, podgląd i eksport newslettera, otwarcie ekranu „Porządek". Wyświetlenie roboczej
listy kont zostawia **jeden wpis na 15 minut** wraz z liczbą wywołań w tym oknie — ślad
zostaje, a dziennik nie zapełnia się wpisami z każdego naciśnięcia klawisza.

Dziennik nie zapisuje adresów e-mail, tylko identyfikatory kont. Powód: wpisy przeżywają
usunięcie konta, więc adres zostawałby w nich po zrealizowaniu prawa do usunięcia danych.

> **Odsłonięcie identyfikatora podatkowego działa inaczej niż reszta.** Jeśli zapis do
> dziennika się nie powiedzie, identyfikator **nie zostanie odsłonięty** — akcja przerwie
> się z komunikatem. Przy pozostałych odczytach kompromis jest odwrotny (panel ma działać
> nawet gdy dziennik chwilowo nie zapisuje), ale tutaj stawką jest numer, którym może być
> PESEL, a odsłonięcie bez śladu jest dokładnie tym, przed czym dziennik ma chronić.

> **Wpisy starsze niż 12 miesięcy kasuje nocna funkcja.** ⚠️ Ten okres to **propozycja
> czekająca na potwierdzenie przez prawnika**, nie decyzja — ale przechowywanie bez żadnej
> granicy byłoby gorsze, bo dziennik jest zbiorem danych osobowych. Zmiana okresu to zmiana
> jednej liczby (`AUDIT_RETENTION_MONTHS` w `functions/admin.js`).

---

## 4. Co warto wiedzieć o ograniczeniach

- **Pierwsze uruchomienie po wdrożeniu jest testem.** W środowisku, w którym powstał panel,
  nie ma emulatora bazy (brak Javy), więc funkcja `adminApi` **nie została ani razu
  uruchomiona przeciw prawdziwym danym**. Sprawdzona jest składnia, kształt odpowiedzi
  i cały wygląd panelu na atrapie danych. Jeżeli coś ma się wysypać, wysypie się przy
  pierwszym wejściu — i wtedy warto zajrzeć w `firebase functions:log`.
- **Liczby odświeżają się co minutę.** Przegląd trzyma wynik w pamięci przez 60 sekund;
  przycisk „Odśwież" pobiera na świeżo.
- **Rozwiązanie jest przedlaunchowe.** Panel przelicza statystyki, przeglądając całe
  kolekcje (limit bezpieczeństwa: 20 000 dokumentów). Przy dzisiejszej skali to duży zapas.
  Przy tysiącach kont trzeba będzie przejść na liczniki agregujące — panel sam ostrzeże,
  gdy limit zostanie osiągnięty, zamiast po cichu pokazywać zaniżone liczby.
- **Panel jest do odczytu**, poza trzema przyciskami dostępu i polami stanu zgłoszeń.
  Danych użytkowników się z niego nie poprawia.

---

## 5. Błąd naprawiony przy okazji — warto o nim wiedzieć

Funkcja Firebase `setCustomUserClaims` **nadpisuje wszystkie uprawnienia w tokenie**, a nie
dopisuje do nich. Sześć miejsc w kodzie (webhook Stripe i trigger rejestracji) ustawiało
w ten sposób sam status subskrypcji, kasując przy okazji wszystko inne.

Dopóki jedynym uprawnieniem był status subskrypcji, nikt tego nie zauważył. Z chwilą dodania
uprawnienia administratora **pierwsza płatność albo pierwsze odnowienie subskrypcji na Twoim
koncie odebrałoby Ci dostęp do panelu** — cicho, bez żadnego komunikatu. Wszystkie sześć
miejsc przeszło na scalanie uprawnień zamiast nadpisywania.

---

## 6. Co zostało sprawdzone, a co nie

**Sprawdzone przed oddaniem Ci tego panelu:**

| Co | Wynik |
|---|---|
| Lint i build | bez błędów; paczka panelu 15,4 kB spakowana, doczytywana dopiero po wejściu na `/admin` |
| Zakres lintu | rozszerzony na `functions/` — do 19.08.2026 cały backend był poza linterem |
| Testy end-to-end całej aplikacji | **172/172** (144 wcześniejsze + 28 nowych dla panelu) |
| Przegląd bezpieczeństwa | wykonany; bramka uprawnień szczelna, brak regresji w webhooku Stripe, osiem uwag naprawionych |
| Testy warstwy odczytu | **9/9** (maskowanie identyfikatora, ukrywanie tokenów iCal, doba wg strefy PL) |
| Reguły Firestore | kompilują się (`firebase deploy --dry-run`) |
| Funkcje | ładują się i `adminApi` jest wykrywane (`firebase deploy --only functions --dry-run`) |
| Wygląd | wszystkie sześć sekcji obejrzane w przeglądarce przy 1440 px i 375 px |
| Bramka wejścia | `/admin` bez sesji przekierowuje na logowanie; konto bez uprawnienia nie wywołuje funkcji ani razu |

**Czego NIE dało się sprawdzić bez Ciebie** (i dlatego są kroki 3 i 8):

- Zapytania do prawdziwej bazy. Nie ma tu emulatora Firestore, więc `adminApi` nigdy nie
  czytało prawdziwych danych. Krok 3 to załatwia **przed** wdrożeniem.
- Zachowanie webhooka Stripe po zmianie sposobu zapisu uprawnień — sprawdzalne wyłącznie
  na prawdziwej płatności albo w logach po wdrożeniu (krok 5).

## 7. Co czeka na Twoją decyzję

Ocena RODO panelu jest w `docs/legal/Ocena-panelu-administratora-2026-08-19.md`. Werdykt:
**panel per saldo poprawia zgodność** — zastępuje trzy różne drogi dostępu do danych jedną,
zawężoną i zapisywaną w dzienniku. Ale nie jest zmianą neutralną dokumentacyjnie.

**Rzeczy, których nie mogłem rozstrzygnąć za Ciebie:**

| Co | Dlaczego to Twoja decyzja | Kiedy najpóźniej |
|---|---|---|
| **Okres przechowywania dziennika dostępu** | Wdrożyłem 12 miesięcy, bo brak jakiejkolwiek granicy jest naruszeniem od pierwszego wpisu. Ale to propozycja do potwierdzenia — wariant 24 miesiące, jeśli dziennik ma służyć obronie przed roszczeniami. | przed deployem funkcji |
| **Ścieżka retencji dla kont po „Nadaj dostęp" i „Odbierz"** | Oba stany żyją dziś bezterminowo. Panel pokazuje je w „Porządku", ale nie kasuje — bo nie wiadomo, po jakim czasie ma kasować. | przed zaproszeniem pierwszego testera |
| **Wiersz o dzienniku w Polityce prywatności §2** | To publikowany dokument prawny — nie dopisuję do niego nic bez Ciebie. Ocena zawiera gotowy projekt wiersza. | przed deployem |
| **Pola obsługi zgłoszenia w Polityce §2** | Panel dokłada do zgłoszeń status i notatkę; Polityka ich nie wymienia. | przed deployem |
| **Warunki bety w Regulaminie §6** | Wciąż `[DO UZUPEŁNIENIA]` — to zobowiązanie wobec konsumenta. | przed zaproszeniem pierwszego testera |

**Rzecz, którą trzeba zrobić, a nie wymaga decyzji:** weryfikacja dwuetapowa na koncie
administratora — krok 6.

---

*Dokument opisuje stan na 2026-08-19. Źródłem prawdy jest ten plik `.md`; wersja `.docx`
w `docs/docx/` jest jego kopią do czytania i regeneruje się skryptem.*
