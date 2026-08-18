# Instrukcje krok po kroku — zadania właściciela

> **Rola tego pliku:** [[Zlecenia-wlasciciela]] mówi **CO** masz do zrobienia i dlaczego.
> Ten plik mówi **JAK** — klik po kliku, komenda po komendzie.
> Stan planowania nadal żyje w [[Projects/Roadmap]] (jedyne źródło prawdy).
>
> **Wersja:** 2026-08-17 — plan tygodnia przepisany na stan po 13.08 (cztery pozycje zeszły
> z listy), sekcja 6 przepisana pod decyzję o **działalności nierejestrowanej**, dopisane
> dwie nowe sekcje krok po kroku: **8** (App Check dla Storage i Functions) i **9**
> (szablony e-maili Auth).
> (Poprzednie: 2026-08-11 — plan tygodnia 11–17.08; 2026-08-10 — deploy bloku A.)
>
> 📄 **Wolisz Worda?** `npm run docs:docx` generuje czytelną kopię tego dokumentu
> w `docs/docx/` (do otwarcia w Wordzie, Pages, Dokumentach Google). Kopia jest
> **generowana** — zmiany nanosi się tutaj, w pliku `.md`, bo tamta zostanie nadpisana.

> ⚠️ **Numery sekcji to identyfikatory, NIE kolejność.** Numeracja 1–7 zostaje nietknięta,
> bo odwołują się do niej [[Known-Issues]] #13 i wpisy w [[Activity-Log]] — przenumerowanie
> unieważniłoby tamte odesłania. Kolejność wykonania daje tabela niżej.

---

## 🗓️ Co zostało do końca tygodnia (stan 17.08)

> ✅ **13.08 zdjął z listy cztery pozycje naraz**: smoke testy 4a–4f (komplet), kopie
> zapasowe Firestore, logi nocnego purge i App Check dla Firestore. Przy okazji domknięte
> #16 (strony gościa nie działały przez wyłączonego dostawcę „Anonymous") i pakiet dla
> prawnika doprowadzony do stanu bieżącego (errata E10).
> ⚠️ **Od 13.08 wieczorem nie ma ani jednego commita** — 14, 15 i 16.08 przeszły bez pracy
> nad tymi pozycjami. Dziś jest **poniedziałek 17.08, ostatni dzień tego tygodnia planu**,
> więc poniższa lista to uczciwy stan, a nie plan sprzed czterech dni.

| # | Zadanie | Sekcja | Czas | Status |
|---|---|---|---|---|
| ① | **Prawnik (N4)** | **6** | — | ⏸ **Nie czeka na Ciebie.** Ponaglony 13.08, pakiet aktualny. Dane Operatora — decyzja z 17.08, patrz sekcja 6. |
| ② ✅ | Kopie zapasowe Firestore (PITR + harmonogram) | 2 | — | zrobione za Ciebie 13.08 |
| ③ ✅ | Logi nocnego purge | 5 | — | sprawdzone 13.08, czysto |
| ④ ✅ | Smoke testy 4a–4f | 4 | — | komplet zdany 13.08 |
| ⑤ ✅ | App Check — Storage i Functions | **8** | — | ✅ **18.08**: Storage wymuszany, przewodniki sprawdzone; Functions bez przełącznika w konsoli (ochrona w kodzie) |
| ⑥ ✅ | N6.5 — czyszczenie sierot w Storage | 3 | — | ✅ **18.08**: 15 plików usuniętych, kontrola po operacji czysta; **zostaje skasować klucz serwisowy** |
| ⑦ ✅ | Polityka haseł — wprowadzona w konsoli | 7 | — | ✅ **17.08**: 8 znaków + wielka i mała litera + cyfra, tryb „Require"; ekrany aplikacji poprawione i wdrożone |
| ⑧ | **Szablony e-maili Auth** | **9** ⭐ nowa | ~10 min | ⬜ dziś link weryfikacyjny prowadzi na obcą domenę i angielski ekran Google |

**Sugerowana kolejność (dziś i dalej):** ⑦ → ⑧ → ⑤ → ⑥.
Trzy pierwsze to konsola i po kilka minut każde; N6.5 zostawiam na koniec, bo wymaga klucza
serwisowego i mojej asysty przy przeglądaniu listy plików.

**Po mojej stronie (nie czeka na Ciebie):** wdrożenie poprawki druku raportu (X18 część 1 —
naprawiona 13.08 wieczorem, ale **nie trafiła jeszcze na produkcję**). Dopóki jej nie wypchnę,
Twój ponowny wydruk kontrolny nie ma sensu — drukowałbyś starą wersję.

Po ⑤–⑧ **N6 zamyka się w całości**, a jedynym otwartym blokerem launchu zostaje
**odpowiedź prawnika**.

**Świadomie NIE w tym tygodniu:** X3, X6, X7 (czeka na Twoją decyzję o zakresie), X8,
reszta X9 (indeksowalność SPA, JSON-LD), X11, właściwe X18 (typografia wydruku).
Wszystko po launchu albo równolegle do niego.

---

## Zanim zaczniesz — co się zmieniło na produkcji 2026-08-10/11

Wdrożone: **X17** (rozbicie gości na dorosłych/dzieci/zwierzęta), **poprawka RODO**
(goście stron `/guide` i `/opinie` mogą wreszcie wycofać zgodę na cookies), **usunięcie
debugowego handlera błędów** z `index.html` (kasował stronę przy każdym błędzie JS)
oraz **znacznik zgłoszeń testowych** (`/kontakt?test=1`).
Dlatego zadanie **4 (smoke testy)** dotyczy świeżego kodu — warto zrobić je w tym tygodniu,
póki pamiętasz kontekst.

---

# 1. App Check — potwierdź egzekwowanie ⏱️ ~10 min · 🟠 · **kolejność ⑤**

> **Zmiana oceny 2026-08-11.** Ta sekcja miała „🔴 PILNE" z czasów, gdy sądziliśmy, że
> wystarczy wejść i włączyć. Po odkryciu 403 ([[Known-Issues]] #13) to **nie jest zadanie
> na jedno posiedzenie** — trzeba naprawić reCAPTCHA, odczekać dobę throttle i dopiero
> wtedy patrzeć na metryki. Waga bez zmian (prawnik pyta o to wprost), ale w kolejce
> tygodnia schodzi za rzeczy, które domykasz w 5–10 minut.

**Po co:** w kodzie widać tylko inicjalizację reCAPTCHA v3 po stronie aplikacji.
Samo „App Check jest włączony" **nie znaczy, że jest egzekwowany** — egzekwowanie ustawia się
osobno, per usługa, w konsoli. Od tego zależy, czy zdanie o ochronie przed automatycznymi
nadużyciami w **Polityce prywatności i DPA §6 jest prawdziwe**. Prawnik pyta o to wprost
(raport 4.1 pkt 5). Dopóki tego nie potwierdzisz, deklarujemy coś, czego nie umiemy udowodnić.

### Kroki

1. Wejdź na https://console.firebase.google.com i wybierz projekt **`moje-domki-6c77d`**.
2. W menu bocznym znajdź **App Check** (sekcja „Kompilacja" / „Build").
3. Otwórz zakładkę z listą usług (**„Aplikacje"** pokazuje zarejestrowane appki,
   **„Interfejsy API" / „APIs"** pokazuje usługi i ich stan egzekwowania).
4. **NAJPIERW spójrz na metryki, nie klikaj od razu „Wymuszaj".** Przy każdej usłudze
   (Cloud Firestore, Cloud Storage, Cloud Functions) zobaczysz podział żądań na
   **zweryfikowane** i **niezweryfikowane**.
5. Zapisz sobie (albo zrób zrzut) proporcje dla **Cloud Firestore**, **Cloud Storage**
   i **Cloud Functions**.

### ✅ ROZSTRZYGNIĘTE 2026-08-13 — ta sekcja jest już nieaktualna

> **Egzekwowanie dla Cloud Firestore jest WŁĄCZONE od dawna i działa** (99% ruchu
> zweryfikowane — zrzut z Twojej konsoli). Ostrzeżenie niżej („nie włączaj, bo odetniesz
> aplikację") stało na błędnym odczycie: 403 zaobserwowany w narzędziu agenta wzięliśmy
> za stan produkcji. 403 dotyczy klientów bez tokenu — czyli przeglądarek sterowanych
> automatem, a nie Twoich klientów.
>
> **Co realnie zostało z tego zadania:** przywrócić „Enforce" dla **Authentication**
> (zdjęte przy diagnostyce 13.08) i zdecydować o **Storage** oraz **Functions**.
> Pytanie prawnika 4.1 pkt 5 jest już odpowiedziane — dane w [[Projects/Zlecenia-wlasciciela]] #8.

<details><summary>Pierwotne ostrzeżenie z 10.08 (do historii — oparte na błędnej przesłance)</summary>

**Produkcja NIE przechodzi dziś atestacji.** Sprawdzone na żywo na `wynajempro.com`
10.08.2026 — konsola przeglądarki zwraca:

```
@firebase/app-check: AppCheck: 403 error. Attempts allowed again after 01d:00m:00s
```

Wymiana tokenu reCAPTCHA na token App Check jest odbijana, a SDK po 403 wchodzi
w **dobowy throttle**. Dziś nic to nie psuje, bo egzekwowanie jest wyłączone — ale
**włączenie go w tym stanie odetnie całą aplikację od Firestore**. To nie jest ryzyko
teoretyczne, tylko przewidywalny skutek.

⚠️ To **koryguje wcześniejszy zapis tej instrukcji**, który twierdził, że domena
produkcyjna atestację przechodzi (na podstawie X13, sprzed zmiany domeny kanonicznej
22.07). To zdanie jest nieaktualne.

**Kolejność jest więc odwrotna niż pierwotnie zapisana:**
1. Napraw 403 — sprawdź w konsoli reCAPTCHA listę dozwolonych domen (czy jest
   `wynajempro.com`, a nie tylko stara `moje-domki-6c77d.web.app`) oraz w Firebase →
   App Check, czy aplikacja webowa jest zarejestrowana z tym samym kluczem.
2. Potwierdź, że 403 zniknął (konsola przeglądarki na produkcji, po dobie throttle
   albo w oknie incognito).
3. **Dopiero wtedy** patrz na metryki i rozważaj egzekwowanie.

Reszta ustaleń bez zmian:
- **Lokalny `npm run dev` NIE przechodzi** — znany efekt ([[Known-Issues]] #3).
  Po włączeniu egzekwowania lokalny dev bez tokenu debug przestanie się łączyć z Firebase.
- Skrypty `functions/*.cjs` używają Admin SDK, który **omija App Check** — nie ucierpią.

</details>

Szczegóły i sprostowanie: [[Known-Issues]] #13.

### Gotowe, gdy
Wiesz i potrafisz udokumentować, czy egzekwowanie jest **WŁĄCZONE** dla Firestore, Storage
i Functions — osobno dla każdej z tych trzech.

### Odeślij mi
> „App Check: Firestore = wymuszane/niewymuszane, Storage = …, Functions = …,
> niezweryfikowane żądania ≈ …%"

Na tej podstawie `legal` albo potwierdzi zdanie w Polityce/DPA, albo je skoryguje —
i tak czy inaczej domkniemy pytanie prawnika.

---

# 2. Kopie zapasowe Firestore ⏱️ ~10 min · 🔴 · **kolejność ②**

> ✅ **WYKONANE ZA CIEBIE 2026-08-13** — nie musisz nic klikać. Okazało się, że da się to
> zrobić z `firebase` CLI, bez konsoli. Włączone: **PITR** (okno 7 dni) **i dzienny harmonogram
> kopii z retencją 7 dni** — czyli wariant pełny z kroku 3 i 4. Stan przed zmianą: PITR wyłączone,
> harmonogramów zero, retencja wersji **1 godzina**. Potwierdzone odczytem konfiguracji po zmianie.
> ⚠️ Dotyczy **Firestore, nie Storage**. Kroki niżej zostawione dla historii i na wypadek,
> gdybyś chciał obejrzeć to w konsoli.

**Po co:** redundancja Google chroni przed awarią ich dysku. **Nie chroni przed tym,
że nasza aplikacja albo skrypt omyłkowo skasuje dane.** A my mamy w kodzie funkcje,
których zadaniem jest kasowanie (`deleteUserAccount`, nocny purge). Dziś nie mamy
**żadnej** ścieżki odtworzenia danych klienta po takim błędzie.

### Kroki

1. Konsola Firebase → projekt `moje-domki-6c77d` → **Firestore Database**.
2. Znajdź zakładkę **„Kopie zapasowe" / „Backups"** (jeśli jej nie widzisz w konsoli
   Firebase, to samo jest w Google Cloud Console → Firestore → Backups — ten sam projekt).
3. Włącz **odtwarzanie do punktu w czasie (PITR / Point-in-time recovery)**.
   To daje możliwość odczytu stanu bazy sprzed awarii (okno liczone w dniach).
4. Dodatkowo utwórz **harmonogram kopii zapasowych**: częstotliwość **codziennie**,
   okres przechowywania **7 dni** (na naszą skalę danych to grosze, a daje realny bufor).

### ⚠️ Uwaga o koszcie
PITR i harmonogram kopii **kosztują** (naliczane od rozmiaru danych). Przy obecnej skali
projektu to kwoty symboliczne, ale to Twoja decyzja finansowa — jeśli wolisz sam
harmonogram bez PITR, to nadal ogromny krok naprzód wobec stanu „zero kopii".

### Gotowe, gdy
W konsoli widać aktywne PITR **lub** aktywny harmonogram eksportu.

### Odeślij mi
> „Kopie: PITR włączone / harmonogram dzienny z retencją N dni / nie włączyłem, bo…"

Wtedy `legal` odhaczy wiersz w §9 dokumentu bezpieczeństwa i zaktualizuje erratę pakietu
dla prawnika.

---

# 3. N6.5 — jednorazowe czyszczenie osieroconych plików — ✅ WYKONANE 2026-08-18

> ✅ **Zrobione razem 18.08.** Usunięte **15 plików w 8 przewodnikach (1,5 MB)**: okładki,
> załączone regulaminy obiektu i dwa nasze pliki testowe z lipca. Przebieg kontrolny po
> operacji: **zero sierot**. Przed kasowaniem: przegląd listy, sprawdzenie, że żaden żywy
> dokument w bazie nie odwołuje się do tych plików, oraz **kopia zapasowa na Pulpicie**
> (`kopia-sierot-2026-08-18`) — bo Storage nie ma PITR i operacja jest nieodwracalna.
> ⏸ **Zostaje Tobie:** skasować plik klucza serwisowego z dysku i unieważnić klucz w konsoli
> (krok 3d niżej).

> **Uwaga do kolejności:** PITR z sekcji 2 chroni **Firestore, nie Storage** — nie jest więc
> siatką pod to zadanie. Zabezpieczeniem przy N6.5 jest DRY-RUN, Twój przegląd listy
> i wbudowana gwarda wieku 30 dni. Sekcja 2 idzie wcześniej z własnych powodów, nie jako
> warunek tej.

**Po co:** pliki przewodników usuniętych **przed** wdrożeniem kaskady purge (N5 C.1) wciąż
leżą w Storage i są **publicznie czytelne pod starymi adresami**. Nowe kasacje już sprzątają
po sobie, więc to jednorazowy dług z przeszłości. Skrypt jest gotowy i przeszedł przegląd
`code-reviewer` w trybie F2.

### 3a. Wygeneruj klucz serwisowy

1. Konsola Firebase → **⚙️ Ustawienia projektu** → zakładka **Konta usługi**.
2. **Wygeneruj nowy klucz prywatny** → pobierze się plik `.json`.
3. **Zapisz go POZA repozytorium** — np. `~/Desktop/klucz-wynajempro.json`.
   Nigdy w katalogu projektu: przypadkowy commit klucza serwisowego = oddanie pełnego
   dostępu do bazy każdemu, kto zobaczy repo.

### 3b. Przebieg próbny (DRY-RUN — nic nie kasuje)

```bash
cd "/Users/wasolinio/Desktop/WynajemPRO App/functions" && GOOGLE_APPLICATION_CREDENTIALS=~/Desktop/klucz-wynajempro.json node cleanup-orphan-guide-files-n6.cjs
```

Skrypt **domyślnie nic nie kasuje** — tylko listuje i liczy.

**Na co patrzeć w wyniku:**
- Linia `Bucket: ...` — musi być `moje-domki-6c77d.firebasestorage.app`.
  Jeśli zobaczysz „0 przejrzanych obiektów", to znak złego bucketu, a nie pustego Storage.
- Lista plików uznanych za osierocone — **przejrzyj ją okiem**. To jest ta bramka.
  Skrypt nie odróżni sieroty po usuniętym przewodniku od porzuconego szkicu, w którym
  wgrałeś okładkę i nigdy nie kliknąłeś „Zapisz". Chroni przed tym gwarda wieku 30 dni,
  ale ostateczna decyzja jest ludzka.

### 3c. Realne kasowanie — dopiero po przejrzeniu listy

```bash
cd "/Users/wasolinio/Desktop/WynajemPRO App/functions" && GOOGLE_APPLICATION_CREDENTIALS=~/Desktop/klucz-wynajempro.json node cleanup-orphan-guide-files-n6.cjs --fix
```

### 3d. Po wszystkim — skasuj klucz

Usuń pobrany plik `.json` z dysku i unieważnij klucz w konsoli
(Ustawienia projektu → Konta usługi → zarządzanie kluczami w Google Cloud).
Klucz serwisowy leżący na Pulpicie to otwarte drzwi do całej bazy.

### Gotowe, gdy
`--fix` przeszedł, a podsumowanie mówi, ile plików usunięto.

### Odeślij mi
> Wynik DRY-RUN (ile sierot) + wynik `--fix` (ile skasowanych).

Wtedy odhaczymy wiersz „Osierocone pliki z przeszłości" w §9 dokumentu bezpieczeństwa.

---

# 4. Smoke testy w aplikacji ⏱️ ~20 min · 🟠 świeży kod · **kolejność ④**

Tego **nie da się sprawdzić z mojej strony** — wszystko jest za logowaniem.
Rób na produkcji (`wynajempro.com`), na swoim koncie.

### 4a. X17 — nowe pola gości (wdrożone dziś)

1. Panel → **Rezerwacje** → dodaj nową rezerwację.
2. Wypełnij **Dorośli = 2**, **Dzieci = 2**, **Zwierzęta = 1**. Zapisz.
3. Otwórz szczegóły tej rezerwacji → sprawdź, czy liczba osób pokazuje **4** (pies się nie liczy).

### 4b. X17 — pułapka migracji ⚠️ **najważniejszy test dnia**

1. Otwórz do **edycji STARĄ rezerwację** — sprzed 25.07, taką, która ma wpisaną liczbę gości.
2. Sprawdź, czy pole **„Dorośli" wypełniło się** dawną liczbą gości (np. stare „4" → Dorośli 4).
3. **Zapisz bez zmian.** Otwórz szczegóły ponownie.
4. **Liczba osób NIE MOŻE spaść do zera.** Jeśli spadła — natychmiast mi zgłoś,
   bo to znaczy, że migracja `guests` → `adults` nie zadziałała na realnych danych.

### 4c. Wycofanie zgody u gościa (wdrożone dziś)

1. Skopiuj link do dowolnego swojego przewodnika gościa.
2. Otwórz go w **oknie prywatnym** (żeby nie mieć zapisanej zgody).
3. Zaakceptuj cookies w banerze.
4. Zjedź na sam dół strony — przy napisie „Stworzono za pomocą WynajemPRO" ma być
   **„Ustawienia cookies"**. Kliknij → baner ma się otworzyć z opcją **wycofania**.

### 4d. Ostrzeżenie przy usuwaniu konta

1. Panel → **Konto** → **Strefa zagrożenia**.
2. **Tylko przeczytaj** komunikat — sprawdź, czy wymienia przewodniki, sekrety WiFi/PIN,
   podpisy gości, pliki i rekord Stripe.
3. **‼️ NIE potwierdzaj usunięcia.** To działa natychmiast i nieodwracalnie, bez karencji.

### 4e. Finanse — raport i eksport (zaległe od 16.07)

1. **Finanse** → **Koszty i opłaty** → dodaj koszt stały, edytuj go, usuń.
2. **Finanse** → **Raporty** → otwórz Raport rentowności → **Drukuj / PDF**
   (sprawdź, czy układ A4 nie jest połamany).
3. W tym samym oknie → **eksport CSV** → otwórz plik w Excelu/Numbers i sprawdź,
   czy polskie znaki i przecinki dziesiętne wyglądają poprawnie.

### 4f. Weryfikacja e-mail — pełny przepływ (zaległe od N1, nigdy nietestowane na żywo)

1. Zarejestruj konto na **nowy, prawdziwy adres e-mail** (może być alias, np. `+test`).
2. Sprawdź, czy **bez kliknięcia linku** nie wchodzisz do panelu.
3. Kliknij link weryfikacyjny z maila → sprawdź, czy panel się otwiera.
4. Potem to konto testowe możesz usunąć.

### Odeślij mi
> Krótko: które punkty przeszły, a przy którym coś wyglądało nie tak (najlepiej zrzut).

---

# 5. Logi nocnego purge ⏱️ ~5 min · 🟠 · **kolejność ③**

> ✅ **SPRAWDZONE ZA CIEBIE 2026-08-13** (`firebase functions:log --only deleteExpiredAccountsData`).
> Wynik: **14 nocnych przebiegów w oknie 31.07–13.08, wszystkie zakończone**, zero błędów
> i ostrzeżeń, w każdym „Konta canceled po karencji: **0**" i „Porzucone triale: **0**".
> Czyli funkcja chodzi, a przez ostatnie dwa tygodnie **nie skasowała ani jednego rekordu**.
> Nic po cichu nie znika — to była właśnie ta niepewność.

> **Zmiana oceny 2026-08-11:** było 🟢 („zaległe zalecenie recenzenta"). Podnoszę do 🟠 —
> to jedyna funkcja w projekcie, która **samodzielnie kasuje dane klientów**, chodzi
> co noc od 22.07 i nikt nigdy nie sprawdził, czy w ogóle się odpala. Pięć minut za
> odpowiedź na pytanie „czy coś nam po cichu nie znika".

**Po co:** po deployu #32 (22.07) recenzent zalecił zerknąć w logi nocnego przebiegu.
Nigdy tego nie zrobiliśmy — a to funkcja, która **kasuje dane**.

1. Konsola Firebase → **Functions** → znajdź `deleteExpiredAccountsData`.
2. Otwórz **Logi**, ustaw zakres na ostatnie dni, poszukaj przebiegów o **02:00**.
3. Szukasz: czy funkcja w ogóle się odpala, czy kończy się sukcesem, czy nie ma pętli błędów.

### Odeślij mi
> „Purge: odpala się co noc, bez błędów" albo wklej treść błędu.

---

# 6. Prawnik (N4) i dane Operatora ⏱️ — · 🔴 bloker launchu · **⏸ czeka na prawnika, nie na Ciebie**

Pakiet jest u prawnika od 22.07, **ponaglony 13.08** i tego samego dnia doprowadzony do stanu
bieżącego (errata E10). Gdyby zaczął czytać teraz, czyta stan faktyczny. Po Twojej stronie
nie ma tu w tej chwili żadnego kliknięcia — czekamy na uwagi.

### Decyzja właściciela 2026-08-17: start na działalności nierejestrowanej

**Ustalenie:** aplikacja rusza w ramach **działalności nierejestrowanej**, a rejestracja
**JDG** następuje dopiero po przekroczeniu progu przychodu. Miejsca `[DO UZUPEŁNIENIA]`
dotyczące firmy (nazwa, forma prawna, NIP, REGON, KRS) **zostają puste świadomie** —
to nie jest zaległość, tylko odzwierciedlenie stanu faktycznego.

**Co z tego wynika dla dokumentów** (`docs/legal/`):

- Operator nie jest „firmą" z nazwą i NIP-em, tylko **osobą fizyczną**. Regulamin, Polityka
  i DPA muszą to nazywać poprawnie — dopisuję to jako pytanie do prawnika, bo od formy
  Operatora zależy brzmienie kilku paragrafów naraz.
- ⚠️ **Jedno „do uzupełnienia" zostaje mimo wszystko: kto jest Operatorem.** Obowiązek podania
  **imienia i nazwiska, adresu do korespondencji i adresu e-mail** nie bierze się z formy
  działalności, tylko z bycia usługodawcą (UŚUDE art. 5) i administratorem danych (RODO art. 13).
  Bez tego dokumenty nie wyjdą z etapu projektu — **niezależnie od tego, czy jest JDG, czy nie**.
  To jedyna rzecz z tej sekcji, którą warto mi podać, gdy uznasz za stosowne.
- 🛑 **PESEL-u nie publikujemy nigdzie.** W dokumentach dla klientów identyfikatorem jest
  imię i nazwisko plus adres — nie numer ewidencyjny. (W kodzie pole `taxIdentifier` już dziś
  bywa PESEL-em i dlatego jest traktowane jak dane wrażliwe.)

### Cztery pytania dopisane do pakietu dla prawnika

Wynikają wprost z tej decyzji i **żadnego z nich nie rozstrzygam sam** — to są pytania
o prawo, nie o kod:

1. **Status konsumencki:** czy sprzedając abonament jako osoba prowadząca działalność
   nierejestrowaną, jestem wobec klientów przedsiębiorcą w rozumieniu przepisów
   konsumenckich (odstąpienie, reklamacje, Omnibus przy „founding members")?
2. **VAT i faktury:** czy usługa SaaS w tym modelu mieści się w zwolnieniu, jak dokumentować
   sprzedaż i co z klientami z innych krajów UE — Regulamin §6 ma tu dziś placeholder.
3. **Próg i moment przejścia:** przy jakim przychodzie i w jakim terminie trzeba
   zarejestrować JDG — i czy przekroczenie progu w trakcie miesiąca zmienia coś dla
   umów już zawartych z abonentami.
4. **Zmiana formy bez zmiany umowy:** czy Regulamin powinien z góry przewidywać przejście
   Operatora z działalności nierejestrowanej na JDG, żeby nie trzeba było wtedy
   przeprowadzać zmiany regulaminu dla wszystkich klientów.

### Gdy prawnik się odezwie

Poproś o **datę**, nie o „wkrótce", i o informację, czy czegoś od nas potrzebuje.
Uwagi przekaż mi w dowolnej postaci — naniosę je na dokumenty i zaktualizuję erratę.

---

# 7. Polityka haseł — ✅ WYKONANE 2026-08-17

> ✅ **Zrobione razem 17.08.** W konsoli ustawione: tryb **Require enforcement**, minimum
> **8 znaków**, wymagana **wielka litera, mała litera i cyfra** (właściciel zdecydował
> o dołożeniu wielkiej litery ponad decyzję z 13.08), znak specjalny niewymagany,
> `Force upgrade on sign-in` **wyłączone** — istniejące konta nietknięte.
> 📌 **Ogon wykryty przy tej okazji i naprawiony tego samego dnia:** ekrany aplikacji nadal
> mówiły o 6 znakach, więc reset hasła zapętlał użytkownika. Poprawione i wdrożone
> (`hosting:app`, 17.08) — patrz [[Activity-Log]].

> ✅ **Decyzja zapadła 13.08: 8 znaków + wymóg litery i cyfry.** Odrzucone: 10 znaków ze
> znakiem specjalnym (koszt w porzuconych rejestracjach i hasłach zapisywanych na kartce)
> oraz zostawienie domyślnych 6 znaków. **Zostaje samo wprowadzenie w konsoli** — decyzji
> już nie podejmujesz, tylko ją klikasz.

Dziś obowiązuje domyślne minimum Firebase: **6 znaków**, bez wymogu złożoności.
Dla aplikacji, w której gospodarz trzyma dane swoich najemców, to niski próg.

### Kroki

1. Konsola Firebase → projekt `moje-domki-6c77d` → **Authentication**.
2. Zakładka **Settings / Ustawienia** → sekcja **Password policy / Zasady haseł**.
3. Włącz politykę i ustaw:
   - **minimalna długość: 8**
   - **wymagaj znaku alfabetycznego (litery)** ✓
   - **wymagaj cyfry** ✓
   - wielkich liter i znaków specjalnych **nie** zaznaczamy (świadomie — to była ta odrzucona opcja).
4. Jeśli zobaczysz wybór trybu egzekwowania (**Require / Wymagaj** kontra **Notify /
   Powiadamiaj**), wybierz **Require** — „Notify" tylko odnotowuje słabe hasło i wpuszcza dalej.
5. Zapisz.

⚠️ **Jeśli nie widzisz sekcji zasad haseł** — to znaczy, że projekt nie jest podniesiony do
Identity Platform (funkcja jest dostępna dopiero tam). Nie klikaj wtedy nic w kwestii
podniesienia planu: napisz mi, a sprawdzimy, co to zmienia w cenniku Authentication,
i zdecydujesz na liczbach.

**Uwaga:** zaostrzenie dotyczy **nowych haseł i ich zmian**. Istniejące konta działają dalej —
to nie jest zmiana, która kogokolwiek wyloguje.

### Gotowe, gdy
W konsoli widać aktywną politykę 8 znaków z wymogiem litery i cyfry.

### Odeślij mi
> „Hasła: ustawione 8 + litera i cyfra" albo „nie ma takiej sekcji"

Wtedy `legal` zdejmuje tę pozycję z §9 dokumentu bezpieczeństwa i z erraty pakietu
(dziś jest tam zapisana jako decyzja z jawnym „wprowadzenie jeszcze przed nami").

---

# 8. App Check — Storage i Functions — ✅ WYKONANE 2026-08-18

> ✅ **Zrobione razem 18.08.** Storage przełączony na **Enforce** (przed zmianą: 100% ruchu
> zweryfikowanego, 0% niezweryfikowanego), a właściciel potwierdził od razu po włączeniu, że
> przewodniki gościa otwierają się z okładkami i plikami.
> 📌 **Functions okazały się pozycją bez treści**: konsola nie ma dla nich przełącznika, tylko
> odnośnik do dokumentacji — wymuszanie ustawia się per funkcja w kodzie i **już je mamy**.
> Moja wczorajsza „decyzja do podjęcia" była więc decyzją o czymś, czego nie da się kliknąć.

> **Kontekst:** 13.08 ustaliliśmy stan faktyczny — **Cloud Firestore: wymuszane** (99% ruchu
> zweryfikowane) i **Authentication: wymuszane**. Zostały dwie usługi: **Storage**
> (dziś tylko monitorowanie, 100% ruchu zweryfikowane) i **Functions** (niewymuszane).
> To jest ta „⏸ otwarta decyzja" z N6.4 — poniżej rozpisana tak, żeby dała się kliknąć.

## 8a. Storage — **rekomendacja: włącz**

Metryki z 13.08 pokazują **100% ruchu zweryfikowanego**, czyli włączenie nie powinno niczego
odciąć. Storage niesie okładki i pliki przewodników pokazywane gościom, więc mimo dobrych
metryk sprawdzamy efekt od razu po kliknięciu.

1. Konsola Firebase → **App Check** → zakładka **Interfejsy API / APIs**.
2. Wiersz **Cloud Storage** → **Wymuszaj / Enforce** → potwierdź.
3. **Natychmiast zweryfikuj** (nie odkładaj tego na później — cofnięcie działa od ręki):
   otwórz w **oknie prywatnym** link do dowolnego swojego przewodnika gościa i sprawdź,
   czy **okładka i pliki się ładują**.
4. Jeśli cokolwiek przestało się pokazywać — wróć do tego samego wiersza i przełącz
   z powrotem na **Monitorowanie**. Skutek jest natychmiastowy, nic nie trzeba wdrażać.

## 8b. Functions — **rekomendacja: NIE włączaj** ⚠️

Sprawdziłem to dziś w kodzie i wychodzi na to, że **włączenie tu nic nie zyskuje, a może
położyć płatności**:

- **Wszystkie pięć funkcji wywoływanych z aplikacji już dziś wymusza App Check** — w kodzie,
  osobno dla każdej (`enforceAppCheck: true` przy `createCheckoutSession`,
  `createBillingPortalSession`, `syncICalCalendars`, `deleteUserAccount`, `deleteGuide`).
  Ochrona, o którą chodzi, **jest już włączona** i nie zależy od przełącznika w konsoli.
- **Dwie pozostałe funkcje są wywoływane przez cudze serwery**, które z definicji nie mają
  naszego tokenu: `stripeWebhook` (Stripe informuje nas o płatnościach) i `exportIcal`
  (Booking i Airbnb pobierają kalendarz). Wymuszanie na poziomie usługi celuje właśnie
  w ruch „bez tokenu" — czyli dokładnie w te dwa wejścia.
- Cena pomyłki jest niesymetryczna: odcięty webhook Stripe oznacza **subskrypcje, o których
  aplikacja się nie dowiaduje**, a odcięty `exportIcal` — kalendarze, które przestają się
  synchronizować z portalami. Bez żadnego zysku, bo to, co dało się zabezpieczyć, już jest.

**Decyzja do podjęcia:** zostawiamy Functions na „niewymuszane" i zapisujemy **dlaczego**
(żeby za trzy miesiące nikt nie uznał tego za przeoczenie). Jeśli się zgadzasz, napisz jedno
zdanie — wpiszę to do dokumentów jako świadomy wybór z uzasadnieniem, a nie brak.

### Odeślij mi
> „App Check: Storage = wymuszane (okładki działają) / Functions = zostawiamy niewymuszane"

Wtedy **N6.4 zamyka się w całości**, a `legal` dopisuje stan trzech usług do §9 i erraty —
pytanie prawnika 4.1 pkt 5 dostaje pełną, a nie częściową odpowiedź.

---

# 9. Szablony e-maili Auth — markowy adres zamiast obcej domeny ⏱️ ~10 min · 🟠 · **kolejność ⑧** *(nowa sekcja, 2026-08-17)*

> Pełny opis, skąd się to wzięło: [[Zlecenia-wlasciciela]] #10 (zgłoszone przez Ciebie
> przy smoke 4f: „nie podoba mi się link służący do weryfikacji oraz samo zatwierdzanie konta").

**Co dziś dostaje nowy klient:** link w mailu prowadzi na `moje-domki-6c77d.firebaseapp.com`
— domenę, która nie ma nic wspólnego z produktem — i ląduje na **domyślnym, angielskim ekranie
Google** („Verify Email Address"). Dla kogoś, kto właśnie założył konto w WynajemPRO, wygląda
to jak próba wyłudzenia. **Nasza własna, markowa strona działa na produkcji od 1 lipca**
(`wynajempro.com/auth/action`) — Firebase po prostu nigdy nie dostał polecenia, żeby z niej
korzystać.

### Kroki (konsola Firebase → **Authentication** → **Templates / Szablony**)

1. Szablon **„Weryfikacja adresu e-mail"** → ikona **ołówka**.
2. Na dole edytora: **„Dostosuj adres URL akcji" / „Customize action URL"**.
3. Wpisz dokładnie: `https://wynajempro.com/auth/action` → **zapisz**.
4. **Powtórz dla dwóch pozostałych szablonów**: „Resetowanie hasła" i „Zmiana adresu e-mail"
   — nasza strona obsługuje wszystkie trzy tryby.
5. ⚠️ **Pisowni marki NIE poprawiaj tutaj — korekta z 2026-08-18.** W treści maila nie ma
   wpisanego „WynajemPro": jest zmienna **`%APP_NAME%`**, którą Firebase podstawia z **publicznej
   nazwy projektu**. Literówka siedzi więc w ustawieniach projektu (Ustawienia projektu → Ogólne →
   nazwa widoczna publicznie), a nie w szablonie. W edytorze szablonu nie ruszaj `%APP_NAME%`,
   `%DISPLAY_NAME%` ani `%LINK%` — skasowanie którejkolwiek zmiennej psuje wiadomość.

> 🛑 **ZABLOKOWANE PRZEZ GOOGLE (2026-08-18) — nie próbuj dalej, to nie jest błąd po Twojej stronie.**
> Zapis kończy się odpowiedzią **400 `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`** z Identity Toolkit.
> Wykluczone po drodze: autoryzowane domeny (`wynajempro.com` **jest** na liście — odczyt
> z publicznego endpointu), uprawnienia (400 to odrzucenie wartości, nie brak roli), rozszerzenia
> przeglądarki (błąd powtórzył się w incognito). **Odpada też droga przez API**: konsola wysyła
> dokładnie ten `PATCH .../config?updateMask=notification.sendEmail.callbackUri`, który miałem
> wykonać kluczem serwisowym — odmowa pochodzi z samego API, więc inny klient jej nie ominie.
> Google ogranicza edycję szablonów e-mail (powszechnie tłumaczone przeciwdziałaniem phishingowi);
> warunków zdjęcia blokady nie ma w publicznej dokumentacji.
> **Co dalej:** zgłoszenie do wsparcia Firebase + docelowo własna wysyłka poczty — patrz
> [[Activity-Log]] 2026-08-18 i [[Projects/Roadmap]].

### Weryfikacja
Zarejestruj konto na kolejny alias (`+test2`) i sprawdź, że link prowadzi na `wynajempro.com`
i otwiera **naszą** stronę, a nie ekran Google. Konto testowe potem usuń.

⚠️ **Bez ryzyka dla starych linków:** maile już wysłane niosą stary adres i nadal zadziałają
na ekranie Google. Zmiana dotyczy wyłącznie kolejnych wiadomości.

### Odeślij mi
> „Szablony: action URL ustawiony w 3 miejscach, pisownia poprawiona, `+test2` otwiera naszą stronę"

---

## Podsumowanie — lista do odhaczenia (w kolejności wykonania)

- [~] ① **sekcja 6** — prawnik: ponaglony 13.08, pakiet aktualny → **⏸ czekamy na jego uwagi**.
      Dane Operatora: decyzja z 17.08 (**działalność nierejestrowana**, JDG po przekroczeniu progu);
      placeholdery firmowe zostają puste świadomie, ale **imię, nazwisko, adres i e-mail Operatora
      trzeba będzie podać** przed publikacją dokumentów (🔴 bloker launchu)
- [x] ② **sekcja 2** — kopie zapasowe: ✅ **zrobione za Ciebie 2026-08-13** (PITR + dzienny harmonogram, 7 dni)
- [x] ③ **sekcja 5** — logi nocnego purge: ✅ **sprawdzone 2026-08-13** (14 przebiegów 31.07–13.08, zero błędów, zero kasacji)
- [x] ④ **sekcja 4** — smoke testy 4a–4f: ✅ **KOMPLET ZDANY 2026-08-13**; po drodze naprawione przewijanie dialogów, dopisane X18 (raport PDF), zlecenie #10 (adres w szablonach maili) i dług CSV w Backlogu
- [x] ⑤ **sekcja 1** — App Check dla Firestore: ✅ **potwierdzone 2026-08-13** (Enforced, 99% zweryfikowane; #13 obalony)
- [x] ⑥ **sekcja 8** — App Check: ✅ **Storage wymuszany od 2026-08-18** (okładki przewodników sprawdzone); Functions bez przełącznika w konsoli — ochrona per funkcja w kodzie
- [x] ⑦ **sekcja 3** — N6.5: ✅ **WYKONANE 2026-08-18** (15 plików, kopia zapasowa na Pulpicie, kontrola po operacji czysta) — ⏸ zostaje **skasować klucz serwisowy i unieważnić go w konsoli**
- [x] ⑧ **sekcja 7** — polityka haseł: ✅ **WPROWADZONA 2026-08-17** (8 znaków + wielka i mała litera + cyfra, tryb „Require"); ekrany aplikacji zsynchronizowane i wdrożone tego samego dnia
- [ ] ⑨ **sekcja 9** — szablony e-maili Auth: action URL na `wynajempro.com/auth/action` w 3 szablonach + pisownia marki (🟠)

Po odesłaniu wyników zamykam N6 w całości, `legal` aktualizuje §9 i erratę pakietu,
a jedynym otwartym blokerem launchu zostaje odpowiedź prawnika.

---

## Tor równoległy — po mojej stronie (nie czeka na Ciebie)

Nie potrzebuję do tego konsoli ani Twojego konta.

**Zamknięte 12–13.08:** ~~B1 triage 52 zastanych awarii e2e~~ ✅ (suita 134/134) ·
~~B2 luka N6.1 na ekranach błędu widoków gościa~~ ✅ wdrożone 13.08 ·
~~B3 nieświeża powłoka po deployu ([[Known-Issues]] #15)~~ ✅ wdrożone 13.08 (pasek
„dostępna nowa wersja" — Twoja decyzja, zamiast automatycznego przeładowania).

**Otwarte:**

- **B4. Deploy X18 część 1** (🟠) — poprawka druku raportu jest w repo od 13.08 (21:08),
  ale **nie ma jej na produkcji**: sprawdziłem 17.08 serwowany chunk `ManagerApp` na
  `wynajempro.com` — nie zawiera obsługi `afterprint` z nowej wersji. Dopóki tego nie wypchnę,
  Twój wydruk kontrolny nie sprawdza niczego nowego. **To jest moje najbliższe zadanie.**
- **B5. Właściwe X18** (🟡, `designer`) — typografia dokumentu, gęstość tabel, sensowna liczba
  stron przy pełnym roku i wielu obiektach, decyzja o osobnym widoku wydruku zamiast
  drukowania modalu. Poprawka z 13.08 usunęła **wady mechaniczne**, nie zaprojektowała dokumentu.

**Related:** [[Zlecenia-wlasciciela]] · [[Projects/Roadmap]] · [[Known-Issues]] · [[Activity-Log]]
