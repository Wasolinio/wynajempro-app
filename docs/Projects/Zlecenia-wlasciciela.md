# Zlecenia właściciela

Rejestr spraw, których **agenci nie mogą wykonać sami** — operacje w konsolach zewnętrznych
i decyzje zastrzeżone dla właściciela. Główny agent przypomina o tej liście na prośbę
(„co mam do zrobienia?") i przy naturalnych punktach kontrolnych (przed deployem, przed launchem).

Zasada: pozycja schodzi z listy dopiero po potwierdzeniu wykonania przez właściciela
(wpis w [[Activity-Log]]).

---

## Operacje do wykonania (konsola / decyzja „działaj")

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

### 7. Blokery przed launchem (z [[Roadmap]])
Weryfikacja e-mail, sprawdzanie subskrypcji, walidacja schematu (reguły + front)
— zadania dla `dev`, ale start i kolejność to Twoja decyzja priorytetowa.
Powiązane: zadanie #32 (cykliczny purge nie kasuje klienta Stripe — niepełny art. 17, przed launchem).
