# Instrukcje krok po kroku — zadania właściciela

> **Rola tego pliku:** [[Zlecenia-wlasciciela]] mówi **CO** masz do zrobienia i dlaczego.
> Ten plik mówi **JAK** — klik po kliku, komenda po komendzie.
> Stan planowania nadal żyje w [[Projects/Roadmap]] (jedyne źródło prawdy).
>
> **Wersja:** 2026-08-10, po deployu bloku A (push + reguły + `hosting:app`).
> Kolejność w pliku = kolejność wykonania. Zadania 1–3 są niezależne, można w dowolnej kolejności.

---

## Zanim zaczniesz — co się właśnie zmieniło na produkcji (2026-08-10)

Wdrożone dziś: **X17** (rozbicie gości na dorosłych/dzieci/zwierzęta) i **poprawka RODO**
(goście stron `/guide` i `/opinie` mogą wreszcie wycofać zgodę na cookies).
Dlatego zadanie **4 (smoke testy)** dotyczy świeżego kodu — warto zrobić je w tym tygodniu,
póki pamiętasz kontekst.

---

# 1. App Check — potwierdź egzekwowanie ⏱️ ~10 min · 🔴 PILNE

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

### ⚠️ Zanim włączysz egzekwowanie — przeczytaj

Włączenie egzekwowania **odetnie** każdego klienta, który nie przechodzi atestacji.
Jeśli w metrykach widzisz zauważalny ruch „niezweryfikowany", to najpierw trzeba ustalić,
skąd pochodzi — inaczej wyłączysz aplikację żywym użytkownikom.

Co wiemy z kodu i z historii projektu:
- Produkcyjna domena `wynajempro.com` **przechodzi atestację** reCAPTCHA (potwierdzone przy X13).
- **Lokalny `npm run dev` NIE przechodzi** — to znany, udokumentowany efekt ([[Known-Issues]] #3).
  Po włączeniu egzekwowania lokalny dev bez tokenu debug przestanie się łączyć z Firebase.
- Skrypty `functions/*.cjs` używają Admin SDK, który **omija App Check** — nie ucierpią.

**Rekomendacja:** jeśli „niezweryfikowane" jest bliskie zeru → włącz egzekwowanie dla
wszystkich trzech usług. Jeśli nie → **nie włączaj**, zrób zrzut metryk i daj mi znać;
ustalimy źródło, zanim cokolwiek odetniemy.

### Gotowe, gdy
Wiesz i potrafisz udokumentować, czy egzekwowanie jest **WŁĄCZONE** dla Firestore, Storage
i Functions — osobno dla każdej z tych trzech.

### Odeślij mi
> „App Check: Firestore = wymuszane/niewymuszane, Storage = …, Functions = …,
> niezweryfikowane żądania ≈ …%"

Na tej podstawie `legal` albo potwierdzi zdanie w Polityce/DPA, albo je skoryguje —
i tak czy inaczej domkniemy pytanie prawnika.

---

# 2. Kopie zapasowe Firestore ⏱️ ~10 min · 🟠 przed launchem

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

# 3. N6.5 — jednorazowe czyszczenie osieroconych plików ⏱️ ~20 min · 🟡

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

# 4. Smoke testy w aplikacji ⏱️ ~20 min · 🟠 świeży kod

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

# 5. Logi nocnego purge ⏱️ ~5 min · 🟢 zaległe zalecenie recenzenta

**Po co:** po deployu #32 (22.07) recenzent zalecił zerknąć w logi nocnego przebiegu.
Nigdy tego nie zrobiliśmy — a to funkcja, która **kasuje dane**.

1. Konsola Firebase → **Functions** → znajdź `deleteExpiredAccountsData`.
2. Otwórz **Logi**, ustaw zakres na ostatnie dni, poszukaj przebiegów o **02:00**.
3. Szukasz: czy funkcja w ogóle się odpala, czy kończy się sukcesem, czy nie ma pętli błędów.

### Odeślij mi
> „Purge: odpala się co noc, bez błędów" albo wklej treść błędu.

---

# 6. Prawnik (N4) ⏱️ ~5 min · 🔴 to jest bloker launchu

Pakiet trafił do prawnika **22.07 — 19 dni temu**. To jedyna pozycja na całej liście,
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

# 7. Decyzja: polityka haseł ⏱️ ~5 min · 🟢 tanie

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

## Podsumowanie — lista do odhaczenia

- [ ] **1.** App Check — sprawdzone metryki, znany stan egzekwowania (🔴 pilne)
- [ ] **2.** Kopie zapasowe — PITR lub harmonogram
- [ ] **3.** N6.5 — DRY-RUN → przegląd listy → `--fix` → skasowany klucz
- [ ] **4.** Smoke testy 4a–4f (**4b jest najważniejszy**)
- [ ] **5.** Logi nocnego purge
- [ ] **6.** Prawnik ponaglony + dane firmy do dokumentów (🔴 bloker launchu)
- [ ] **7.** Decyzja o polityce haseł

Po odesłaniu wyników zamykam N6 w całości, `legal` aktualizuje §9 i erratę pakietu,
a jedynym otwartym blokerem launchu zostaje odpowiedź prawnika.

**Related:** [[Zlecenia-wlasciciela]] · [[Projects/Roadmap]] · [[Known-Issues]] · [[Activity-Log]]
