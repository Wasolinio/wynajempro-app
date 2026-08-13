# Zlecenia właściciela

Rejestr spraw, których **agenci nie mogą wykonać sami** — operacje w konsolach zewnętrznych
i decyzje zastrzeżone dla właściciela. Główny agent przypomina o tej liście na prośbę
(„co mam do zrobienia?") i przy naturalnych punktach kontrolnych (przed deployem, przed launchem).

Zasada: pozycja schodzi z listy dopiero po potwierdzeniu wykonania przez właściciela
(wpis w [[Activity-Log]]).

> 📄 **Wolisz Worda?** `npm run docs:docx` generuje czytelną kopię tego dokumentu
> w `docs/docx/` (do otwarcia w Wordzie, Pages, Dokumentach Google). Kopia jest
> **generowana** — zmiany nanosi się tutaj, w pliku `.md`, bo tamta zostanie nadpisana.

> 📘 **Instrukcje krok po kroku: [[Projects/Instrukcje-wlasciciela]]** (od 2026-08-10).
> Ten plik trzyma **CO i dlaczego**, tamten **JAK** — klik po kliku i komenda po komendzie
> (App Check, kopie zapasowe, N6.5, smoke testy, logi purge, prawnik, polityka haseł).

---

## Operacje do wykonania (konsola / decyzja „działaj")

### 9. ✅ Strony gościa naprawione — WYKONANE 2026-08-13
**Wynik:** przyczyną był **wyłączony dostawca „Anonymous"** w Authentication → Sign-in method.
Po włączeniu przewodnik otwiera się na telefonie (potwierdzone przez właściciela w incognito),
a serwer zwraca `200` zamiast `400 ADMIN_ONLY_OPERATION`. Pełny przebieg: [[Known-Issues]] #16.
✅ **Domknięte w całości**: wymuszanie App Check dla Authentication **przywrócone**, a przewodnik
nadal otwiera się na telefonie. Stan końcowy: ochrona działa dla Firestore i Authentication,
goście wchodzą, deklaracja z Polityki i DPA §6 jest prawdziwa.

<details><summary>Pierwotny opis zlecenia (do historii)</summary>
**Co się dzieje:** każdy link do przewodnika (`/guide/…`) i każda strona opinii (`/opinie/…`)
kończy się u gościa komunikatem **„Brak dostępu — Wystąpił błąd autoryzacji sesji"**.
Aplikacja loguje gościa anonimowo, zanim pokaże treść, a Google odbija to logowanie:
`auth/admin-restricted-operation`. Znalezione przy weryfikacji deployu 13.08, powtórzone
w czystej karcie. Pełna diagnostyka: [[Known-Issues]] #16.

> ⚠️ **KOREKTA z tego samego dnia (13.08, wieczór).** Powtórzyłem pomiar w czystym Chromium
> i dostałem **inny błąd** niż rano: `401` → `auth/firebase-app-check-token-is-invalid`,
> poprzedzony **403** przy pobieraniu tokenu App Check. Czyli winowajcą jest **App Check**
> (ten sam 403 co w [[Known-Issues]] #13), a nie — jak pisałem rano — wyłączony dostawca
> „Anonymous". **I ważniejsze:** obie moje przeglądarki są sterowane automatem, czyli
> dokładnie tym ruchem, który App Check ma odsiewać. **Nie wiem więc, czy problem dotyka
> prawdziwych ludzi** — rano napisałem, że „cała gościnna połowa produktu leży"; to była teza
> za mocna wobec dowodów.

**KROK 0 — 30 sekund, zanim wejdziesz w jakąkolwiek konsolę:**
Otwórz **prawdziwy** link do swojego przewodnika **na telefonie**, w oknie prywatnym.
- Widzisz treść przewodnika → problem dotyczy tylko klientów bez tokenu App Check
  (m.in. moich narzędzi). To dług, nie pożar — reszta poniżej zostaje, ale bez pośpiechu.
- Widzisz „Brak dostępu — błąd autoryzacji sesji" → **pożar**: żaden Twój gość nie otworzy
  dziś przewodnika. Rób kroki 1–3 od razu.

**Dlaczego reszta to Ty:** to ustawienia w konsoli, agent nie ma tam dostępu.

**Firebase Console:**
1. **App Check → Authentication (Identity Platform)** — jaki jest stan egzekwowania.
   Jeśli WŁĄCZONE: **wyłącz je dla tej jednej usługi**. To natychmiast odblokowuje strony
   gościa i kupuje czas na naprawę reCAPTCHA. Przy okazji zdejmuje pułapkę z zadania „App
   Check" (sekcja 1): skoro dla Authentication egzekwowanie **działa i odbija**, to dołożenie
   go Firestore/Storage przy zepsutym tokenie odcięłoby całą aplikację.
2. **Napraw źródło — reCAPTCHA (to jest #13):** konsola reCAPTCHA → lista dozwolonych domen.
   Czy jest tam `wynajempro.com`, czy tylko stara `moje-domki-6c77d.web.app`? Domena
   kanoniczna zmieniła się 22.07 i to najpoważniejszy podejrzany. Potem: Firebase → App Check
   → czy aplikacja webowa jest zarejestrowana tym samym kluczem. Po naprawie doba throttle.
3. **Dopiero gdyby to nie pomogło** — hipoteza z rana: Authentication → Sign-in method →
   **Anonymous** (czy włączone) i Settings → User actions → **„Enable create (sign-up)"**.
   ⚠️ Gdyby to drugie było zablokowane, **nie działa też rejestracja nowych użytkowników**.

**Potem:** ponów krok 0 i napisz wynik — dopiszę do dziennika i zamknę #16.
</details>

### 1. ✅ Google Search Console — WYKONANE 2026-07-22
Usługa domenowa `wynajempro.com` + sitemapa zgłoszona i przyjęta (potwierdzenie właściciela).
Po drodze dwie pułapki na przyszłość: zgłoszony omyłkowo URL strony głównej = błąd „mapa w formacie
HTML"; w usłudze **domenowej** trzeba podać PEŁNY adres mapy (pole nie dokleja prefiksu).

### 1b. ✅ Deploy pakietu legal + N5 C.1 — WYKONANE 2026-07-22
Hosting (maskowanie GA + ostrzeżenie + X-Robots-Tag) i functions (kaskada purge N5 C.1,
przegląd F2: BEZPIECZNA, 0 blokerów) na produkcji, zweryfikowane. DPA §6 domknięte przez `legal`.
**Ostatni bloker legal przed launchem zamknięty.** Zostaje #32 (klient Stripe w cyklicznym
purge — e-mail w Stripe; zleć przed launchem).

### 2. ✅ Przekierowanie 301 firebase → wynajempro.com — WDROŻONE 2026-07-22
Wykonane w całości (site `wynajempro` + redirector + DNS TXT + przepięcie domeny),
zweryfikowane end-to-end — szczegóły: [[Activity-Log]] 2026-07-22.
**Od teraz deploy aplikacji: `firebase deploy --only hosting:app`.**
Opcjonalna kosmetyka na kiedyś: action URL w szablonach e-mail Auth (konsola
Firebase → Authentication → Templates) na domenę kanoniczną — auth działa poprawnie
i bez tego (rezerwowane `/__/*` nie podlega przekierowaniom).

---

### 6. Przed/na spotkaniu z prawnikiem (2026-07-22) 🔄
Pakiet gotowy: **`docs/legal/Raport-dla-prawnika-2026-07-22.md`** (zacznij od niego — ma spis
wszystkich plików i 15 pytań w priorytetach). Do wzięcia: Regulamin, Polityka, DPA,
Bezpieczeństwo-kont-i-danych, Ocena-linki-guide-opinie, Checklista, Uwagi-N5.

**Dwie rzeczy do sprawdzenia PRZED spotkaniem (tylko Ty masz dostęp):**
1. **Konsola Firebase → App Check**: czy egzekwowanie jest WŁĄCZONE dla Firestore/Storage/Functions.
   Z kodu widać tylko inicjalizację po stronie aplikacji. Od tego zależy, czy deklaracja
   o ochronie przed automatycznymi nadużyciami w Polityce i DPA §6 jest prawdziwa.
2. **Kopie zapasowe Firestore**: czy skonfigurowany jest harmonogram eksportu lub odtwarzanie
   do punktu w czasie (PITR). W repozytorium nie ma tego śladu, a redundancja Google
   **nie chroni przed omyłkowym skasowaniem danych przez aplikację**.

Do uzupełnienia w dokumentach (miejsca oznaczone `[DO UZUPEŁNIENIA]`): dane rejestrowe firmy,
adresy kontaktowe, wersja i data dokumentów, warunki oferty „founding members".

---

## Decyzje czekające

### 4. ✅ Decyzje po raporcie `legal` — PODJĘTE I ZREALIZOWANE 2026-07-22
Właściciel: „realizuj wg rekomendacji". Wykonanie: (1) maskowanie ID w GA — wdrożone (`dev`);
(2) „Wygeneruj nowy link" — po launchu → [[Backlog]]; (3) ostrzeżenie w GuideBuilderze — wdrożone
w brzmieniu z raportu; (4) wygasanie/PIN — Later → [[Backlog]]; (5) projekty N4 uzupełnione (`legal`).
Szczegóły: [[Activity-Log]] 2026-07-22. **Pozostały bloker legal przed launchem: N5 C.1**
(kaskada czyszczenia przewodników przy purge) — osobne zadanie `dev` + `code-reviewer`,
zleć, gdy będziesz gotów (to zmiana w logice USUWANIA danych — wymaga trybu F2: review przed deployem).

### 5. ✅ Rozjazd domen w fallbackach Stripe — WYPROSTOWANE 2026-07-22
Poprawione przy okazji #32 (`ece7f73`): checkout/portal → `wynajempro.com`.
`UID:...@wynajempro.pl` w exportIcal celowo zostaje (identyfikator iCal, nie URL —
zmiana zdublowałaby rezerwacje w portalach).

### 5b. ✅ Deploy functions #32 — WYKONANY przez właściciela 2026-07-22
Potwierdzone słowem właściciela („deploy przeszedł"). **Cała lista legal przed launchem
zamknięta.** Zostaje (zalecenie reviewera): zerknąć w logi nocnego przebiegu purge (02:00).

### 6. X7 — szczegóły rezerwacji: co dodać w kolejnym kroku?
Z roadmapy: przebudowa zrobiona (`ce2b80f`), rozszerzenie **czeka na Twoją decyzję** o zakresie.

### 8. Braki bezpieczeństwa §9 do domknięcia w konsoli (przed launchem) — nowe 2026-07-23
Z oceny 3 dokumentów dla prawnika (`docs/legal/Bezpieczenstwo-kont-i-danych.md` §9).
Powiązane: [[Roadmap]] **N6**. Tylko Ty masz dostęp do tych ustawień:
1. ✅ **App Check — egzekwowanie: USTALONE 2026-08-13** (zrzut z konsoli od właściciela).
   **Cloud Firestore: Enforced, 99% ruchu zweryfikowane.** Storage: Monitoring (100%).
   Authentication: Monitoring, 73% — do przywrócenia na Enforce (patrz #9). Functions:
   niewymuszane. To odpowiedź na **pytanie prawnika 4.1 pkt 5**, wiszące od 22.07.
   ⏸ Zostaje decyzja, czy włączać wymuszanie dla **Storage** i **Functions** — osobno,
   z weryfikacją po każdym kroku (Storage niesie okładki przewodników dla gości). (= N6.4.)
2. ✅ **Kopie zapasowe Firestore — WYKONANE 2026-08-13** (agent, firebase CLI, na Twoje zlecenie): PITR
   włączone (okno 7 dni) + dzienny harmonogram z retencją 7 dni. Przed zmianą: PITR wyłączone, zero
   harmonogramów, retencja wersji 1 h. ⚠️ Dotyczy Firestore, **nie** Storage. (= N6.3.)
3. **Polityka haseł — decyzja PODJĘTA 2026-08-13** (8 znaków + litera i cyfra). ⏸ Zostaje samo
   wprowadzenie: konsola Firebase → Authentication → Settings → zasady haseł. Dotyczy nowych haseł,
   nikogo nie wylogowuje.

### 7. Blokery przed launchem (z [[Roadmap]])
Weryfikacja e-mail, sprawdzanie subskrypcji, walidacja schematu (reguły + front)
— zadania dla `dev`, ale start i kolejność to Twoja decyzja priorytetowa.
Powiązane: zadanie #32 (cykliczny purge nie kasuje klienta Stripe — niepełny art. 17, przed launchem).
