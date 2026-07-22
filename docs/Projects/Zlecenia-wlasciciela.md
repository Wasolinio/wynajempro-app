# Zlecenia właściciela

Rejestr spraw, których **agenci nie mogą wykonać sami** — operacje w konsolach zewnętrznych
i decyzje zastrzeżone dla właściciela. Główny agent przypomina o tej liście na prośbę
(„co mam do zrobienia?") i przy naturalnych punktach kontrolnych (przed deployem, przed launchem).

Zasada: pozycja schodzi z listy dopiero po potwierdzeniu wykonania przez właściciela
(wpis w [[Activity-Log]]).

---

## Operacje do wykonania (konsola / decyzja „działaj")

### 1. Google Search Console — nowa usługa + zgłoszenie sitemapy ⏸
Kanonizacja X9 jest live (deploy 2026-07-22). Teraz w [GSC](https://search.google.com/search-console):
dodać usługę (property) `wynajempro.com` (weryfikacja domeny przez DNS lub prefiksu przez plik/tag)
i zgłosić `https://wynajempro.com/sitemap.xml`. To przyspieszy przepięcie indeksu na domenę kanoniczną.

### 2. ✅ Przekierowanie 301 firebase → wynajempro.com — WDROŻONE 2026-07-22
Wykonane w całości (site `wynajempro` + redirector + DNS TXT + przepięcie domeny),
zweryfikowane end-to-end — szczegóły: [[Activity-Log]] 2026-07-22.
**Od teraz deploy aplikacji: `firebase deploy --only hosting:app`.**
Opcjonalna kosmetyka na kiedyś: action URL w szablonach e-mail Auth (konsola
Firebase → Authentication → Templates) na domenę kanoniczną — auth działa poprawnie
i bez tego (rezerwowane `/__/*` nie podlega przekierowaniom).

---

## Decyzje czekające

### 4. Decyzje po raporcie `legal`: strony `/guide` i `/opinie` ⏸ (raport gotowy 2026-07-22)
Raport: [[Ocena-linki-guide-opinie]] (docs/legal/). Werdykt: model „nieodgadywalny link"
obronny jako fundament, ale **4 blokery przed launchem** (m.in. NOWE ustalenie: pełny token
linku `/guide/{id}` wycieka do Google Analytics — jedyna bariera dostępu kopiowana do systemu
Google). Twoje decyzje:
1. Zgoda na maskowanie ID w GA (`/guide/[id]`) — koszt: brak rozróżnienia odsłon per przewodnik.
2. „Wygeneruj nowy link" w GuideBuilderze: przed czy po launchu (rekomendacja `legal`: po).
3. Akceptacja brzmienia ostrzeżenia przy „Udostępnij gościom" (projekt w raporcie, sekcja 4a).
4. Czy warstwa opcjonalna (data ważności linku / PIN pobytu) wchodzi na roadmapę (rekomendacja: Later).
5. Zgoda na uzupełnienie projektów N4 (Polityka/Regulamin/DPA) o opis mechanizmu linku przed wysyłką do prawnika.

### 5. Rozjazd domen w fallbackach Stripe
`functions/index.js:154,410` — fallbackowe URL-e na `wynajempro.pl` (nie `.com`).
Martwe w praktyce (nadpisywane originem frontu), ale do wyprostowania przy najbliższym
dotknięciu functions. Decyzja: poprawić przy okazji czy osobnym zadaniem.

### 6. X7 — szczegóły rezerwacji: co dodać w kolejnym kroku?
Z roadmapy: przebudowa zrobiona (`ce2b80f`), rozszerzenie **czeka na Twoją decyzję** o zakresie.

### 7. Blokery przed launchem (z [[Roadmap]])
Weryfikacja e-mail, sprawdzanie subskrypcji, walidacja schematu (reguły + front)
— zadania dla `dev`, ale start i kolejność to Twoja decyzja priorytetowa.
Powiązane: zadanie #32 (cykliczny purge nie kasuje klienta Stripe — niepełny art. 17, przed launchem).
