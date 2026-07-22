# Zlecenia właściciela

Rejestr spraw, których **agenci nie mogą wykonać sami** — operacje w konsolach zewnętrznych
i decyzje zastrzeżone dla właściciela. Główny agent przypomina o tej liście na prośbę
(„co mam do zrobienia?") i przy naturalnych punktach kontrolnych (przed deployem, przed launchem).

Zasada: pozycja schodzi z listy dopiero po potwierdzeniu wykonania przez właściciela
(wpis w [[Activity-Log]]).

---

## Operacje do wykonania (konsola / decyzja „działaj")

### 1. Deploy hostingu — kanonizacja X9 ⏸
Kod zacommitowany (`8bda769`, 2026-07-22): sitemap + robots + OG + canonical per trasa na `wynajempro.com`.
**Deploy = Twoja decyzja** (wystarczy `--only hosting`). Bez deployu produkcja nadal serwuje
sitemapę z domeną firebase.
**Po deployu warto od razu:** Google Search Console — dodać usługę (property) `wynajempro.com`
i zgłosić `https://wynajempro.com/sitemap.xml`.

### 2. Przekierowanie 301 firebase → wynajempro.com (multi-site) ⏸
Nie da się zrobić edycją `firebase.json` (redirects nie filtrują po hoście → pętla).
Wymaga operacji w konsoli — pełna procedura: [[Activity-Log]] 2026-07-22, skrót:
1. `firebase hosting:sites:create wynajempro-app`
2. Konsola Firebase → Hosting: przepiąć custom domenę `wynajempro.com` na nowy site
3. Stary site `moje-domki-6c77d` zostaje redirectorem: `/:rest*` → 301 na `https://wynajempro.com/:rest`
4. `firebase target:apply` × 2, `firebase.json` jako tablica `hosting`, deploy obu site'ów
5. Przy okazji: w szablonach e-mail Auth (konsola) ustawić action URL na domenę kanoniczną
   (reserved `/__/*` ma priorytet nad redirectami, więc auth bezpieczny — to tylko eliminacja przeskoku)

Do tego czasu stan „canonical + sitemap + robots" jest bezpieczny sam w sobie.

### 3. Push na GitHub ⏸
Lokalne commity `8bda769` + `e133e2f` (+ ten rejestr) nie są wypchnięte. Powiedz słowo.

---

## Decyzje czekające

### 4. Wnioski z raportu `legal`: strony `/guide` i `/opinie` 🔄
Analiza RODO modelu „publiczne po nieodgadywalnym linku" (przewodnik zawiera hasła WiFi
i kody do drzwi) — agent pracuje (zlecone 2026-07-22). Po raporcie: decyzje o środkach
(np. wygasanie linku, PIN) będą Twoje.

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
