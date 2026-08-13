# Instrukcje krok po kroku — zadania właściciela

> **Rola tego pliku:** [[Zlecenia-wlasciciela]] mówi **CO** masz do zrobienia i dlaczego.
> Ten plik mówi **JAK** — klik po kliku, komenda po komendzie.
> Stan planowania nadal żyje w [[Projects/Roadmap]] (jedyne źródło prawdy).
>
> **Wersja:** 2026-08-11 — dopisany plan tygodnia 11–17.08 i kolejność wg pilności.
> (Poprzednia: 2026-08-10, po deployu bloku A — push + reguły + `hosting:app`.)
>
> 📄 **Wolisz Worda?** `npm run docs:docx` generuje czytelną kopię tego dokumentu
> w `docs/docx/` (do otwarcia w Wordzie, Pages, Dokumentach Google). Kopia jest
> **generowana** — zmiany nanosi się tutaj, w pliku `.md`, bo tamta zostanie nadpisana.

> ⚠️ **Numery sekcji to identyfikatory, NIE kolejność.** Numeracja 1–7 zostaje nietknięta,
> bo odwołują się do niej [[Known-Issues]] #13 i wpisy w [[Activity-Log]] — przenumerowanie
> unieważniłoby tamte odesłania. Kolejność wykonania daje tabela niżej.

---

## 🗓️ Plan tygodnia 11–17.08 — od najpilniejszego

> 🔴 **Dopisane 2026-08-13, przed całą resztą: odblokuj logowanie anonimowe.**
> Strony gościa (`/guide/…`, `/opinie/…`) **nie działają na produkcji** — każdy link
> wysłany gościowi kończy się komunikatem o błędzie autoryzacji sesji. To jedno-dwa
> kliknięcia w Firebase Console → Authentication: [[Projects/Zlecenia-wlasciciela]] #9,
> diagnostyka w [[Known-Issues]] #16. Bije wszystko poniżej, bo to nie jest dług ani
> ryzyko na przyszłość, tylko **funkcja niedostępna dla klientów już teraz**.
> ⚠️ **Korekta z wieczora 13.08:** przyczyną jest **App Check**, nie wyłączony dostawca
> „Anonymous" — i to ten sam 403 co w sekcji 1. Zacznij od **kroku 0**: otwórz prawdziwy
> link do przewodnika na telefonie. To rozstrzyga, czy problem dotyka ludzi, czy tylko
> klientów bez tokenu App Check (obie moje przeglądarki są sterowane automatem, więc
> App Check odsiewa je z definicji). Szczegóły: [[Projects/Zlecenia-wlasciciela]] #9.

| # | Zadanie | Sekcja | Czas | Dlaczego tak wysoko / nisko |
|---|---|---|---|---|
| ① | **Ponaglić prawnika + przysłać dane firmy** | sekcja **6** | ~5 min | Jedyny twardy bloker launchu i **jedyna pozycja, która nie ruszy się sama**. Pakiet leży u prawnika od 22.07. |
| ② | **Kopie zapasowe Firestore (PITR)** | sekcja **2** | ~10 min | Dziś **zero** ścieżki odtworzenia danych, a co noc chodzi funkcja, która kasuje. Najtańsza rzecz o największej asymetrii. |
| ③ | **Logi nocnego purge** | sekcja **5** | ~5 min | Funkcja kasująca dane chodzi od 22.07 **bez ani jednego spojrzenia w logi**. |
| ④ | **Smoke testy 4a–4f** (4b najważniejszy) | sekcja **4** | ~20 min | X17 wszedł na produkcję **10.08**. Jeśli migracja `guests`→`adults` nie działa na realnych danych, zapis starej rezerwacji **cicho zeruje liczbę osób**. |
| ⑤ | **App Check — najpierw napraw 403** | sekcja **1** | ~10 min | Ważne (prawnik pyta wprost), ale **nie da się domknąć jednym kliknięciem** — najpierw reCAPTCHA, potem doba throttle. Włączenie egzekwowania dziś odcięłoby aplikację. |
| ⑥ | **N6.5 — czyszczenie sierot** | sekcja **3** | ~20 min | Dług z przeszłości, nie rośnie — nowe kasacje sprzątają po sobie. |
| ⑦ | **Decyzja: polityka haseł** | sekcja **7** | ~5 min | Tanie, nie blokuje niczego. Potrzebne jedno zdanie. |

**Dzień po dniu**

| Dzień | Ty | Ja (nie czeka na Ciebie) |
|---|---|---|
| **wt 11.08** | ① prawnik + dane firmy · ② PITR · ③ logi purge | triage 52 zastanych awarii e2e |
| **śr 12.08** | ④ smoke 4a + **4b** · ⑤ App Check (403) | triage · luka N6.1 na ekranach błędu |
| **czw 13.08** | ④ smoke 4f · ⑥ N6.5 DRY-RUN | ✅ tor `dev` domknięty i wdrożony (RODO + #15); ✅ ② i ③ zrobione za Ciebie; 🔴 znaleziony bloker #16 |
| **pt 14.08** | ⑥ N6.5 `--fix` · ④ smoke 4c–4e · ⑦ hasła | decyzja + wdrożenie #15 (nieświeża powłoka) |

Po odesłaniu wyników **N6 zamyka się w całości**, `legal` aktualizuje §9 i erratę pakietu,
a jedynym otwartym blokerem launchu zostaje **odpowiedź prawnika**.

**Świadomie NIE w tym tygodniu:** X3, X6, X7 (czeka na Twoją decyzję o zakresie), X8,
reszta X9 (indeksowalność SPA, JSON-LD), X11. Wszystko po launchu albo równolegle do niego.

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

# 3. N6.5 — jednorazowe czyszczenie osieroconych plików ⏱️ ~20 min · 🟡 · **kolejność ⑥**

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

# 6. Prawnik (N4) ⏱️ ~5 min · 🔴 bloker launchu · **kolejność ① — zacznij od tego**

Pakiet trafił do prawnika **22.07 — 20 dni temu** (stan na 11.08). To jedyna pozycja na całej liście,
która **nie ruszy się sama**, a bez niej nie ma publicznego launchu.

Warto ponaglić i zapytać o dwie rzeczy:
1. **Kiedy realnie możesz spodziewać się uwag** (potrzebujesz daty, nie „wkrótce" —
   od tego zależy planowanie reszty).
2. Czy prawnik potrzebuje czegoś od nas, żeby ruszyć — bo jeśli tak, to lepiej się dowiedzieć
   teraz niż za kolejne trzy tygodnie.

W międzyczasie możesz uzupełnić miejsca oznaczone `[DO UZUPEŁNIENIA]` w dokumentach
(`docs/legal/`): **dane rejestrowe firmy, adresy kontaktowe, warunki oferty founding members**.
To Twoje dane, nie mam ich skąd wziąć — a bez nich dokumentów i tak nie opublikujemy.
Jak mi je podasz, wpiszę je wszędzie tam, gdzie trzeba.

---

# 7. Decyzja: polityka haseł ⏱️ ~5 min · 🟢 tanie · **kolejność ⑦**

Dziś obowiązuje domyślne minimum Firebase: **6 znaków**, bez wymogu złożoności
i bez sprawdzania haseł z wycieków. Dla aplikacji, w której gospodarz trzyma dane swoich
najemców, to niski próg.

Podnosisz? Konsola Firebase → **Authentication** → **Settings / Ustawienia** →
zasady haseł (minimalna długość, wymagane typy znaków).

**Uwaga:** zaostrzenie dotyczy **nowych haseł**. Istniejące konta działają dalej —
to nie jest zmiana, która kogoś wyloguje.

### Odeślij mi
> „Hasła: podnoszę do N znaków + wymagania … / zostawiam 6 znaków"

Decyzja trafi do „Otwartych decyzji" w [[Projects/Roadmap]] i do dokumentów `legal`.

---

## Podsumowanie — lista do odhaczenia (w kolejności wykonania)

- [ ] ① **sekcja 6** — prawnik ponaglony + dane firmy przysłane (🔴 bloker launchu)
- [x] ② **sekcja 2** — kopie zapasowe: ✅ **zrobione za Ciebie 2026-08-13** (PITR + dzienny harmonogram, 7 dni)
- [x] ③ **sekcja 5** — logi nocnego purge: ✅ **sprawdzone 2026-08-13** (14 przebiegów 31.07–13.08, zero błędów, zero kasacji)
- [ ] ④ **sekcja 4** — smoke testy 4a–4f (**4b jest najważniejszy**) (🟠)
- [ ] ⑤ **sekcja 1** — App Check: najpierw 403, potem metryki (🟠)
- [ ] ⑥ **sekcja 3** — N6.5: DRY-RUN → przegląd listy → `--fix` → skasowany klucz (🟡)
- [~] ⑦ **sekcja 7** — polityka haseł: decyzja **podjęta 2026-08-13** (8 znaków + litera i cyfra); zostaje wprowadzenie w konsoli (🟢)

Po odesłaniu wyników zamykam N6 w całości, `legal` aktualizuje §9 i erratę pakietu,
a jedynym otwartym blokerem launchu zostaje odpowiedź prawnika.

---

## Tor równoległy — po mojej stronie (nie czeka na Ciebie)

Nie potrzebuję do tego konsoli ani Twojego konta. Pozycje żyją już w istniejących
dokumentach — tu tylko ustawiam je w kolejce na ten tydzień:

- **B1. Triage 52 zastanych awarii e2e** (🔴 dług) — pełny przebieg suity 10.08 dał
  52 czerwone testy (`guest-guide`, `stripe`, `ui-scaling`, `links-buttons`), sprawdzone
  na `git stash` jako niezależne od tamtych zmian. Suita jest dziś **niewiarygodna**, a to
  jedyna siatka pod launch. Rozdzielić na: zgniłe pod v2 (→ [[Projects/Roadmap]] X10)
  i realne regresje (→ naprawa od razu).
- **B2. Domknięcie luki N6.1** (🟠) — ekrany błędu `/guide/:id` i `/opinie/:id` renderują się
  bez kredytu, więc gość z wygasłym linkiem po kliknięciu „Akceptuję" nadal nie ma jak
  wycofać zgody. Fix ~1 linijka na widok; opisane w [[Projects/Roadmap]] N6.1 jako „reszta luki".
- **B3. Nieświeża powłoka po deployu** (🟡, [[Known-Issues]] #15) — **wymaga Twojej decyzji**:
  czy wdrażamy `skipWaiting` + komunikat „dostępna nowa wersja, odśwież". Dziś każdy deploy
  zostawia użytkownika na starej wersji do następnego przeładowania, bez żadnej informacji.

**Related:** [[Zlecenia-wlasciciela]] · [[Projects/Roadmap]] · [[Known-Issues]] · [[Activity-Log]]
