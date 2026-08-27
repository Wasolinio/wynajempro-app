# Handoff: Identyfikacja wizualna WynajemPRO v2.0

## Overview

Rozbudowany system identyfikacji wizualnej dla WynajemPRO (SaaS do zarządzania najmem
krótkoterminowym, `wynajempro.com`). Dokument rozszerza istniejący brand book v1.0
(`_design-reference/Identyfikacja WynajemPRO.dc.html`) o materiały marketingowe:
warianty znaku, ikony aplikacji, OG image, banery social media, banery na stronę,
formaty reklamowe, materiały firmowe i bibliotekę sloganów.

Dokument liczy 19 sekcji. Sekcje 01, 04, 05, 06, 07, 18, 19 są przeniesione **bez zmian**
z v1.0 — nie wymagają implementacji, są odniesieniem. Sekcje 02, 03, 08–17 to nowa praca.

## About the Design Files

Plik `Identyfikacja WynajemPRO.dc.html` jest **referencją projektową w HTML** — prototypem
pokazującym docelowy wygląd, nie kodem produkcyjnym do skopiowania. To dokument typu
brand book: prezentuje makiety banerów w skali, specyfikacje i reguły użycia.

Zadanie nie polega na wdrożeniu tego pliku do aplikacji. Zadanie to:

1. **Naprawić błędy identyfikacji w repo** (sekcja „Zadania implementacyjne" niżej) —
   to jedyna część, która wchodzi do kodu React/Vite.
2. **Wyeksportować banery jako pliki graficzne** (PNG/JPG) do użycia w sociale
   i w `public/`.

Banery w tym pliku są zbudowane w prawdziwych pikselach docelowych i skalowane
do podglądu przez `transform: scale()`. Każdy ma stabilne `id` — element o tym `id`
ma dokładne wymiary docelowe, więc zrzut tego elementu w skali 1 daje plik gotowy
do publikacji.

## Fidelity

**High-fidelity.** Wszystkie kolory, kroje, rozmiary, odstępy i promienie są finalne
i podane wprost. Wartości pochodzą z istniejącego systemu identyfikacji v2 opisanego
w `PRODUCT.md` oraz z `src/pages/landing/LandingPage.jsx` i `src/styles/brand.jsx`.
Nie wymyślaj nowych wartości.

---

## Zadania implementacyjne w kodzie (repo WynajemPRO)

### Z-1. Podmiana favicona — BŁĄD PRODUKCYJNY

`public/favicon.svg` to fioletowy znak z szablonu Vite (`#863bff`, `#7e14ff`, `#47bfff`,
rozmyte elipsy z filtrami gaussa, maska `mask-type:alpha`). Nie ma nic wspólnego z marką.
Użytkownik w karcie przeglądarki widzi dziś obcy znak.

Pliki do podmiany:

| Plik | Stan obecny | Docelowo |
|---|---|---|
| `public/favicon.svg` | znak Vite, fioletowy | `assets/favicon-A-os-czasu.svg` z tego bundla |
| `public/icon-192x192.png` | do weryfikacji | render z `assets/icon-maskable-A.svg` @ 192 px |
| `public/icon-512x512.png` | do weryfikacji | render z `assets/icon-maskable-A.svg` @ 512 px |
| `public/og-image.png` | do weryfikacji | eksport `#og-typo` (1200 × 630) |

### Z-2. `theme-color` — BŁĄD

`index.html`, linia 7:

```html
<meta name="theme-color" content="#2563eb" />   <!-- niebieski, obcy marce -->
```

Docelowo:

```html
<meta name="theme-color" content="#17150F" />
```

### Z-3. Font w `index.html` — niespójność

`index.html` ładuje **Inter**:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

System identyfikacji v2 (`PRODUCT.md`) mówi: Schibsted Grotesk (UI), Newsreader italic
(akcenty), IBM Plex Mono (dane). Zweryfikuj, czy Inter jest jeszcze gdzieś używany;
jeśli nie — usuń ten `<link>`. Jeśli tak — zamień na:

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Schibsted+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Z-4. Ujednolicenie znaku — WYMAGA DECYZJI WŁAŚCICIELA

W repo funkcjonują dziś **dwie różne wersje znaku**:

**Wersja 1** — `_design-reference/assets/wynajempro-mark.svg` (viewBox 40 × 40):
```
rect 40×40 rx=8      fill #17150F
rect x=9  y=10    w=17 h=4.5 rx=2.25  fill #F3EFE5
rect x=14 y=17.75 w=17 h=4.5 rx=2.25  fill #D9492B
rect x=9  y=25.5  w=11 h=4.5 rx=2.25  fill #F3EFE5
```

**Wersja 2** — `LogoMark` w `src/pages/landing/LandingPage.jsx:35` i
`src/pages/landing/LoginPanel.jsx:39` (viewBox 24 × 24):
```
rect 24×24 rx=4      fill #17150F
rect x=5 y=6.5  w=14 h=3 rx=1.5  fill #A0987F   ← beż, nie papier
rect x=5 y=11.5 w=14 h=3 rx=1.5  fill #D9492B
rect x=5 y=16.5 w=14 h=3 rx=1.5  fill #A0987F   ← trzy równe paski
```

Trzy dopracowane kierunki są w sekcji 02 dokumentu i jako pliki w `assets/`:

| Plik | Kierunek | Charakter |
|---|---|---|
| `mark-A-os-czasu.svg` | Oś czasu / Gantt | najbliżej produktu, czyta się od 16 px |
| `mark-B-kalendarz.svg` | Siatka kalendarza | najbardziej dosłowny, gęsty przy 16 px |
| `mark-C-litera-w.svg` | Monogram W z pasków | najmocniejszy jako inicjał |

**Nie wybieraj samodzielnie.** Po decyzji: podmień oba warianty w kodzie na jeden,
zaktualizuj `LogoMark` w `LandingPage.jsx` i `LoginPanel.jsx`, wygeneruj zestaw ikon.

Geometria kierunku A (viewBox 40 × 40, do przepisania na 24 × 24 przez skalowanie 0,6):
```
rect 40×40 rx=8      fill #17150F
rect x=8  y=9    w=16 h=5 rx=2.5  fill #F3EFE5
rect x=13 y=17.5 w=19 h=5 rx=2.5  fill #D9492B
rect x=8  y=26   w=11 h=5 rx=2.5  fill #F3EFE5
```

### Z-5. Banery na stronę — sekcje 15

Hero (1440 × 560) i pas CTA przed stopką (1440 × 280) są zaprojektowane jako
**żywe sekcje HTML**, nie obrazki. Wdrożenie w `LandingPage.jsx` w namespace `.wp4`.
Pełna specyfikacja niżej.

---

## Screens / Views

### Sekcja 02 — Znak, trzy kierunki

**Purpose:** decyzja właściciela o kanonicznym znaku.

**Layout:** grid 3 kolumny, gap 18 px. Każda karta: `border 1px #DDD5C3`, `radius 4px`,
`overflow hidden`, tło `#FBFAF6`. Wewnątrz: pole `#17150F` z `padding 44px` i znakiem
112 × 112 px wyśrodkowanym, blok opisu `padding 20px`, stopka `padding 12px 20px`
z `border-top 1px #EFE9DA`.

Pod spodem test skalowania: grid `44px 1fr`, gap 18 px, trzy rzędy (A / B / C),
w każdym znak w rozmiarach 64 / 40 / 32 / 24 / 16 px, gap 26 px.
Etykieta rzędu: IBM Plex Mono 11 px, `weight 600`, `color #D9492B`.

### Sekcja 03 — Warianty logo

Pięć wariantów:

| Wariant | Zastosowanie | Konstrukcja |
|---|---|---|
| Poziomy (podstawowy) | wszędzie domyślnie | znak + `Wynajem` + tag `PRO`, gap 14 px, `align-items:center` |
| Pionowy | avatary, stopki wyśrodkowane | `flex-direction:column`, gap 12 px |
| Monochromatyczny atrament | druk 1-kolorowy, pieczątki | środkowy pasek `#F3EFE5` z `opacity .55`; tag `PRO` jako `border 1px #17150F`, bez wypełnienia |
| Negatyw jednobarwny | ciemne tła, faksymile | kafel jako `rect x=1 y=1 w=38 h=38 rx=7.5 fill none stroke #F3EFE5 stroke-width=2` |
| Sam logotyp | stopki, faktury (znak już wystąpił) | bez kafla, tag `PRO` na `#D9492B` |
| Avatar okrągły | sociale | znak **bez** `rx` na kaflu, `border-radius:50%` na `<svg>` |

**Logotyp — dokładna konstrukcja:**

```html
<div style="display:flex;align-items:baseline;font-weight:800;font-size:30px;letter-spacing:-.025em">
  Wynajem<span style="font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:15px;
    background:#17150F;color:#F3EFE5;padding:3px 7px;margin-left:5px;letter-spacing:.04em">PRO</span>
</div>
```

Proporcja: `font-size` tagu `PRO` = **50%** rozmiaru słowa `Wynajem`.
Padding tagu skaluje się liniowo: przy 15 px → `3px 7px`, przy 24 px → `5px 11px`.

Na tle atramentowym tag `PRO` ma tło `#D9492B` i tekst `#fff`.

**Pole ochronne:** ½ wysokości znaku ze wszystkich stron.
**Rozmiar minimalny:** znak 24 px, lockup poziomy 120 px szerokości.

### Sekcja 09 — Ikony aplikacji

| Format | Rozmiar | Uwagi |
|---|---|---|
| favicon SVG | skalowalny | jeden plik obsługuje 16 / 32 / 48; PNG tylko jako fallback |
| apple-touch-icon | 180 × 180 | **bez** `border-radius` w pliku — iOS docina sam |
| PWA maskable | 192, 512 | tło pełne `#17150F`, paski w kole o średnicy **80%** kadru |
| splash PWA | — | znak w negatywie (kafel `#F3EFE5`, paski `#17150F`), `theme-color #17150F` |

Makieta karty przeglądarki (do wizualnej weryfikacji favicona przy 16 px):
pasek kart `#E8E2D5`, karta aktywna `#FBFAF6` `radius 7px 7px 0 0` `padding 9px 14px`,
karta nieaktywna `#DED7C8` `opacity .75`, pasek adresu `#F3EFE5`
`border 1px #DDD5C3` `radius 3px`.

### Sekcja 10 — OG image · 1200 × 630 px

Dwa warianty. Element `id` = docelowe piksele.

**`#og-typo`** — typograficzny, dla kampanii i strony głównej:
- Tło `#17150F`, `padding 72px 80px`, `flex-direction:column`, `justify-content:space-between`
- Góra: logo w negatywie (znak 56 px) po lewej; `wynajempro.com` w mono 16 px,
  `letter-spacing .12em`, `uppercase`, `color #6B6555` po prawej
- Środek: nagłówek 88 px / `line-height .98` / `letter-spacing -.035em` / `#F3EFE5`,
  `max-width 900px`. Podtytuł 26 px / 1.5 / `#A0987F`, `margin-top 24px`, `max-width 720px`
- Dół: CTA `background #D9492B`, `color #fff`, `padding 18px 30px`, `weight 600`,
  `font-size 22px`, `radius 3px`; obok mono 17 px `#6B6555`

**`#og-data`** — danymi, dla podstron produktowych:
- Grid `1.05fr 1fr`. Lewa kolumna `#F3EFE5`, `padding 64px 56px 64px 72px`
- Prawa kolumna `#17150F`, `padding 56px 64px 56px 48px`
- Karta KPI: `background #1F1C15`, `border 1px #2C2920`, `radius 4px`, `padding 28px 30px`.
  Etykieta mono 14 px `#6B6555`, liczba 52 px `weight 800` `#F3EFE5`, delta mono 16 px `#7FD0AC`
- Lista obiektów: `grid 1fr auto`, `border-bottom 1px #2C2920`, nazwa 19 px `weight 600`
  `#E4DDCE`, kwota mono 19 px `#7FD0AC`

**Reguły OG:** logo lewy górny róg, min. 48 px wysokości · nagłówek max 6 słów ·
jeden dowód liczbowy · adres w monospace · **nigdy** zrzut całego panelu
(nieczytelny w miniaturze 320 px).

### Sekcja 11 — Instagram

**`#ig-post`** — 1080 × 1080 px, tło `#17150F`, `padding 80px`:
- Góra: logo w negatywie (znak 60 px, słowo 38 px) + licznik karuzeli mono 18 px `#6B6555`
- Nagłówek 104 px / `.98` / `-.04em` / `#F3EFE5`
- Karta danych `#1F1C15` / `border 1px #2C2920` / `radius 6px` / `padding 36px 40px`;
  wiersze `grid 1fr auto`, etykieta 26 px `#E4DDCE`, wartość mono 26 px `#F3EFE5`
- Stopka mono 22 px `letter-spacing .1em` `uppercase` `#A0987F`

**`#ig-story`** — 1080 × 1920 px, tło `#17150F`:
- Górne 1000 px: pole na zdjęcie (`<image-slot>`) **albo** panel danych — przełącznik `photoSlots`
- Dolne 920 px: `padding 80px 72px`, nagłówek 96 px, CTA `#D9492B` `padding 34px`
  `font-size 38px` `radius 4px` `text-align center`
- **Dolne 250 px zostawiamy wolne** pod pasek „Przesuń w górę"
- Logo **zawsze na plamie atramentu** (`background #17150F`, `padding 16px 24px`,
  `radius 4px`), nigdy wprost na zdjęciu

### Sekcja 12 — Facebook

**`#fb-cover`** — 1640 × 624 px:
- Grid `1fr 1fr`. Lewa: `padding 72px 56px 72px 96px`, logo (znak 52 px),
  nagłówek 64 px / 1 / `-.035em`, podpis mono 20 px `letter-spacing .08em` `#A0987F`
- Prawa: zdjęcie **albo** kolumna KPI — przełącznik `photoSlots`
- **Pole bezpieczne 820 × 312 px wyśrodkowane** (`left:410px; top:156px`) — na telefonie
  widać tylko to. Wszystko istotne musi się w nim mieścić. Overlay z `2px dashed #D9492B`
  jest pomocą projektową, nie eksportuje się

**`#fb-post`** — 1080 × 1080 px, tło `#F3EFE5`, `padding 80px`, format danymi:
- Góra: logo + tag `#D9492B` mono 18 px `padding 10px 18px`
- Nagłówek 78 px / 1 / `-.04em`, `max-width 820px`
- Karta kalendarza `#FBFAF6` / `border 1px #DDD5C3` / `radius 6px` / `padding 40px`;
  wiersze `grid 300px 1fr` gap 24 px; tor `height 40px` `background #EFE9DA` `radius 4px`,
  pasy rezerwacji `position:absolute` z `left`/`width` w %
- Legenda kanałów: `#234B7A` Booking · `#D9492B` Airbnb · `#2F6B53` bezpośrednia

**Reguły postu FB:** jeden komunikat (nagłówek + jeden dowód) · tekst w kadrze,
nie w opisie (pierwsze trzy linie opisu i tak są przycięte) · fragment interfejsu,
nie zrzut · stopka to zawsze `wynajempro.com` i warunek próby.

### Sekcja 13 — LinkedIn

**`#li-cover`** — 1128 × 191 px:
- `padding 0 56px 0 300px` — **lewe 290 px zasłania awatar strony, zostaje puste**
- Lewa treść: logo (znak 30 px, słowo 24 px) + deskryptor mono 13 px `#A0987F`
- Prawa: slogan 26 px `weight 800` `#F3EFE5`, adres mono 13 px `#6B6555`

**`#li-post`** — 1200 × 627 px, grid `1fr 1.1fr`:
- Lewa `#F3EFE5` `padding 64px 48px 64px 72px`: kicker mono 15 px `#D9492B`,
  nagłówek 50 px / 1.02 / `-.035em`, lead 19 px / 1.55 / `#524C3F`
- Prawa `#FBFAF6` `border-left 1px #DDD5C3`: tabela `border 1px #DDD5C3` `radius 6px`
  `background #fff`; wiersze `grid 1fr auto` `padding 18px 26px`
  `border-bottom 1px #EFE9DA`; wiersz sumy `background #17150F`,
  etykieta `#F3EFE5`, wartość mono 22 px `#7FD0AC`

### Sekcja 14 — Szablon „nowa funkcja"

**`#feature-post`** — 1080 × 1080 px, tło `#F3EFE5`, `padding 80px`.

Trzy elementy **stałe** (z tego powstaje rozpoznawalna seria):
metka `NOWE W PANELU` (mono 20 px `weight 600`, `background #17150F`,
`color #F3EFE5`, `padding 12px 20px`, `letter-spacing .14em`), logo, CTA + adres.

Trzy elementy **podmieniane**:
1. Nazwa funkcji — rzeczownik, max 3 słowa, 86 px `weight 800` `-.04em`
2. Jedno zdanie korzyści — 32 px / 1.5 / `#524C3F`, `max-width 820px`.
   Co gospodarz przestaje robić ręcznie. Bez „intuicyjny", „nowoczesny", „innowacyjny"
3. Fragment interfejsu — 3–4 wiersze danych z tej funkcji.
   **Dane przykładowe, nigdy prawdziwych gości**

### Sekcja 15 — Banery na stronę

**`#hero-banner`** — 1440 × 560 px, grid `1fr 1.05fr`:
- Lewa `#F3EFE5` `padding 72px 56px 72px 100px`, gap 28 px:
  - Pigułka mono 13 px `weight 600`, `background #F6E5DF`, `color #D9492B`,
    `padding 8px 14px`, `radius 3px`, `letter-spacing .1em`
  - Nagłówek 66 px / .98 / `-.04em`
  - Lead 20 px / 1.6 / `#524C3F`, `max-width 460px`
  - CTA primary `#D9492B` `padding 15px 26px` `radius 3px`;
    secondary `border 1px #DDD5C3` `background #FBFAF6` `padding 14px 24px`
  - Warunek mono 13 px `#9A917D`
- Prawa `#17150F` `padding 56px 100px 56px 56px`: karta obłożenia + dwie karty KPI
  (`#1F1C15`, `border 1px #2C2920`, `radius 5px`)

**`#cta-banner`** — 1440 × 280 px, tło `#17150F`, `padding 0 100px`,
`display:flex` `align-items:center` `justify-content:space-between` gap 48 px:
- Lewa: nagłówek 44 px / 1.05 / `-.035em` `#F3EFE5`, podpis mono 14 px `#6B6555`
- Prawa: CTA `#D9492B` `padding 17px 34px` `font-size 17px`,
  pod nim mono 12 px `#8C8576`

Zasada: **jeden mocny kontrast na całej stronie, nie pięć.** Hero jasny, pas CTA atramentowy.

### Sekcja 16 — Google Ads

Trzy formaty, **wszystkie w skali 1:1 w dokumencie** — nie są skalowane, można
je czytać bezpośrednio.

| `id` | Rozmiar | Tło | Nagłówek |
|---|---|---|---|
| `#ad-300x250` | 300 × 250 | `#17150F` | 29 px / 1.02 / `-.03em` |
| `#ad-160x600` | 160 × 600 | `#F3EFE5` + `border 1px #DDD5C3` | 26 px / 1.04, `text-align center` |
| `#ad-728x90` | 728 × 90 | `#17150F` | 24 px, `white-space:nowrap` |

**Reguły:**
- Trzy elementy, nie cztery: logo, jedno zdanie, przycisk. Liczba dowodowa **tylko**
  w formacie 160 × 600
- Nagłówek do 4 słów — przy 300 px szerokości dłuższy tekst spada poniżej 24 px
- Naprzemienne tła w jednej kampanii (część na atramencie, część na papierze)
- **Bez animacji.** Statyczny PNG lub JPG. Ruch nie należy do tej marki

### Sekcja 17 — Materiały firmowe

Dane osobowe i linki są **placeholderami w nawiasach kwadratowych** —
`[Imię i nazwisko]`, `[Stanowisko]`, `[+48 000 000 000]`, `[imie@wynajempro.com]`,
`[/facebook]`, `[/instagram]`, `[/linkedin]`, `[NAZWA FIRMY]`, `[NIP]`.
Podmień przed produkcją.

**`#card-front` / `#card-back`** — wizytówka 85 × 55 mm = **1004 × 650 px @ 300 dpi**,
`padding 72px`:
- Awers `#F3EFE5`: logo (znak 60 px) → imię 40 px `weight 700` + stanowisko mono 22 px
  `uppercase` `#A0987F` → kontakt mono 22 px `#524C3F` + adres mono 22 px `weight 600`
- Rewers `#17150F`: slogan 52 px / 1.02 `#F3EFE5` → deskryptor mono 20 px `#6B6555`
  + linki mono 20 px `#A0987F`

**`#letterhead`** — papier firmowy A4 = **794 × 1123 px @ 96 dpi**
(do druku przelicz na 2480 × 3508 @ 300 dpi), tło `#fff`, `padding 64px 72px`:
- Nagłówek: logo (znak 36 px) po lewej, dane firmy mono 11 px / 1.8 `#9A917D`
  wyrównane do prawej; `border-bottom 1px #DDD5C3`, `padding-bottom 24px`
- Stopka: `border-top 1px #DDD5C3`, `padding-top 18px`, mono 11 px `#9A917D`

**`#signature`** — sygnatura e-mail, **docelowa szerokość 600 px**:
- `background #fff`, `border 1px #DDD5C3`, `radius 4px`, `padding 22px 24px`
- Znak 48 px po lewej, `border-left 1px #DDD5C3` + `padding-left 20px` na treści
- Imię 16 px `weight 700`; stanowisko mono 11 px `uppercase` `#A0987F`;
  kontakt mono 12 px / 1.8 `#524C3F`; linki mono 11 px `weight 600` `uppercase`,
  adres własny `#D9492B`, pozostałe `#9A917D`
- **Bez obrazków tła i bez czcionek webowych** — klienty pocztowe je zignorują.
  Znak jako PNG 96 × 96 px hostowany na domenie.
  Fallback: `font-family: Arial, Helvetica, sans-serif`

### Sekcja 08 — Biblioteka sloganów

Trzy osie znaczeniowe. **Na jednym materiale jeden slogan i jeden dowód —
nigdy dwie obietnice naraz.**

**Oś 01 — Kontrola i spokój** (landing, OG, reklamy):
- Wynajem *pod kontrolą*. ← slogan główny
- Mniej chaosu. Więcej wynajmu.
- Kalendarz, który się nie myli.
- Nic Ci nie umknie w sezonie.
- Wiesz, ile zarabia każdy obiekt.

**Oś 02 — Profesjonalizm wobec gości** (sociale, przewodnik gościa, opinie):
- Gość widzi *porządek*.
- Jeden link i gość wie wszystko.
- Przewodnik odpowiada, gdy Ty śpisz.
- Profesjonalnie od pierwszej wiadomości.
- Gość dostaje wszystko, zanim zapyta.

**Oś 03 — Prostota, jedno narzędzie** (reklamy, porównania, onboarding):
- Jeden panel. *Cały* wynajem.
- Koniec z Excelem.
- Pięć narzędzi zmieściło się w jednym.
- Otwierasz i działa. Bez wdrożenia.
- Zbudowane dla kilku obiektów, nie dla hotelu.

Słowo w *kursywie* = Newsreader italic 500. Reszta = Schibsted Grotesk 800.

**Dowody** — dopisek pod sloganem, zawsze konkret:

| Dowód | Rozwinięcie |
|---|---|
| 14 dni bezpłatnie | Bez karty. Bez zobowiązań. |
| 29,99 zł / mc | Jedna cena, wszystkie obiekty. |
| Booking + Airbnb | Synchronizacja iCal, koniec z overbookingiem. |
| Rentowność per obiekt | Przychód, koszty, zysk netto — osobno. |
| Przewodnik gościa | Kody i WiFi po podpisie regulaminu. |
| Zamiast Excela | Jeden panel na telefonie i w laptopie. |

---

## Interactions & Behavior

Dokument jest statyczny — to brand book, nie prototyp aplikacji. Zachowania do wdrożenia
dotyczą tylko banerów na stronę (Z-5):

- **CTA hover:** `#D9492B` → `#C23E22`
- **Focus:** `outline 2px` cynober (wymóg dostępności z `PRODUCT.md`)
- **Ruch:** krzywa `cubic-bezier(.22,1,.36,1)`, 150–320 ms dla UI.
  Count-up liczb 700 ms `ease-out-cubic` (wzorzec z Analityki)
- **`prefers-reduced-motion`:** obowiązkowy dla każdej animacji
- **Pola dotykowe:** ≥ 40 px
- **Mobile:** hero przechodzi w jedną kolumnę; panel prawy pod treścią lub ukryty

W samym dokumencie działają dwa przełączniki (`data-props` na `<script data-dc-script>`):

| Prop | Domyślnie | Działanie |
|---|---|---|
| `showSafeAreas` | `true` | overlaye pól bezpiecznych na coverach FB i LinkedIn |
| `photoSlots` | `true` | `true` = pola na zdjęcia w IG story i FB cover; `false` = wersja czysto typograficzna z panelami danych |

Overlaye pól bezpiecznych to **pomoc projektowa** — przed eksportem ustaw
`showSafeAreas: false`.

---

## State Management

Brak. Dokument nie ma stanu poza dwoma przełącznikami wyżej.
Pola na zdjęcia (`<image-slot>`) trzymają wrzucony plik w sidecarze
`.image-slots.state.json` — to mechanizm podglądu, nie część wdrożenia.

---

## Design Tokens

### Kolory — podstawowe

| Token | Hex | Zastosowanie |
|---|---|---|
| Paper | `#F3EFE5` | tło główne |
| Surface | `#FBFAF6` | panele, karty |
| Ink | `#17150F` | atrament, tekst, sidebar |
| Cynober | `#D9492B` | akcent, CTA |
| Cynober hover | `#C23E22` | hover przycisku primary |

### Kolory — semantyczne

| Token | Hex | Zastosowanie |
|---|---|---|
| Zieleń | `#2F6B53` | pieniądze, zysk |
| Granat | `#234B7A` | kanał Booking |
| Amber | `#C99A2E` | w toku, uwaga |
| Hairline | `#DDD5C3` | linie, obramowania |

### Tinty i linie

| Token | Hex |
|---|---|
| Tint cynober | `#F6E5DF` |
| Tint zieleń | `#E7EDE7` |
| Tint amber | `#FBF1D9` |
| Linia wewnętrzna | `#EFE9DA` |
| Tło tagu neutralnego | `#F0EADC` |

### Tekst na papierze

| Token | Hex |
|---|---|
| Muted | `#524C3F` |
| Faint | `#9A917D` |
| Label | `#A0987F` |
| Amber tekst | `#9A7B12` |

### Tekst i powierzchnie na atramencie

| Token | Hex |
|---|---|
| Tekst | `#E4DDCE` |
| Faint | `#8C8576` |
| Label | `#6B6555` |
| Linia | `#2C2920` |
| Panel podniesiony | `#1F1C15` |
| Zieleń na atramencie | `#7FD0AC` |
| Ramka pola zdjęcia | `#3A362B` |

### Typografia

| Krój | Wagi | Zastosowanie |
|---|---|---|
| Schibsted Grotesk | 400–800 | nagłówki + UI |
| Newsreader italic | 400, 500 | akcent w nagłówkach, cytaty |
| IBM Plex Mono | 400, 500, 600 | etykiety, liczby, dane |

| Rola | Rozmiar / waga / tracking / line-height |
|---|---|
| Display / H1 | 800 · −0.03em · 1.04 |
| Nagłówek sekcji / H2 | 600 · −0.02em · 1.1 |
| Lead | 400 · 19 / 1.6 |
| Tekst podstawowy | 400 · 16 / 1.6 |
| Etykieta mono | 500 · +0.10em · UPPERCASE |

Liczby: zawsze IBM Plex Mono z liczbami tabularnymi, wyrównane do prawej.

### Skala odstępów

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 64 · 84 px`

### Promienie

| Wartość | Zastosowanie |
|---|---|
| `3px` | przyciski, pola, tagi |
| `4px` | panele |
| `5–6px` | karty wewnątrz banerów (przy dużej skali) |
| `8px` (na 40) | kafel znaku — proporcja 20% szerokości |

### Siatka

Max `1240px`, padding `40px`, gap `16–20px`.
Dokument brand booka: max `1080px`, padding `48px`.

### Cienie

**Brak.** Struktura liniami 1px, nie cieniami. Cienie i gradienty są zakazane twardo
(`PRODUCT.md`, sekcja Anti-references).

---

## Assets

Wszystkie w `assets/` tego bundla:

| Plik | Opis |
|---|---|
| `mark-A-os-czasu.svg` | kierunek A — oś czasu / Gantt, viewBox 40 × 40 |
| `mark-B-kalendarz.svg` | kierunek B — siatka kalendarza |
| `mark-C-litera-w.svg` | kierunek C — monogram W z pasków |
| `favicon-A-os-czasu.svg` | favicon gotowy do `public/` (= kierunek A) |
| `icon-maskable-A.svg` | ikona PWA maskable 512 px, tło pełne, paski w kole 80% |
| `wynajempro-mark-obecny.svg` | znak obecny w repo — do porównania, nie do wdrożenia |

Wszystkie znaki są czystymi `<rect>`/`<path>` — bez filtrów, gradientów i masek,
skalują się bez utraty jakości do 16 px.

**Zdjęcia:** brak. Dwa banery (IG story, FB cover) mają pola na zdjęcia
z opisem kadru. Zdjęcia obiektów dostarcza właściciel.

**Ikony UI:** repo używa `lucide-react` (widoczne w `src/pages/dashboard/modals/`).
Nie rysuj własnych ikon — użyj tej biblioteki.

---

## Files

| Plik | Rola |
|---|---|
| `Identyfikacja WynajemPRO.dc.html` | dokument identyfikacji — otwórz w przeglądarce |
| `support.js` | runtime dokumentu (wymagany, nie edytuj) |
| `image-slot.js` | komponent pól na zdjęcia (wymagany, nie edytuj) |
| `assets/*.svg` | znaki i ikony |

### Pliki źródłowe w repo WynajemPRO (do przeczytania przed wdrożeniem)

| Plik | Co zawiera |
|---|---|
| `PRODUCT.md` | zasady identyfikacji v2, anti-references, dostępność, ruch |
| `index.html` | favicon, `theme-color`, fonty, tagi OG — **tu są błędy Z-1…Z-3** |
| `public/favicon.svg` | fioletowy znak Vite — **do podmiany** |
| `src/pages/landing/LandingPage.jsx` | `LogoMark` (linia 35), `Logo` (52), styl `.wp4-logo` (839) |
| `src/pages/landing/LoginPanel.jsx` | `LogoMark` (linia 39) |
| `src/styles/brand.jsx` | styl `.wpb-logo` (linia 36) |
| `src/pages/dashboard/ManagerApp.jsx` | logo w panelu (linia 521) |
| `src/pages/admin/AdminApp.jsx` | logo w panelu admina (linia 178) |
| `_design-reference/Identyfikacja WynajemPRO.dc.html` | brand book v1.0 |

Namespace'y CSS w repo: `.wpd` (panel), `.wpb` (strony poboczne),
`.wp4`/`.wp4a` (landing/login), `.wpc` (cookie). Trzymaj się ich.

---

## Eksport banerów

Każdy baner ma stabilne `id` i jest zbudowany w **prawdziwych pikselach docelowych**.
Podgląd zmniejsza go przez `transform: scale()` na kontenerze `overflow:hidden` —
element o danym `id` ma pełny rozmiar.

Żeby wyeksportować: zrzuć element o danym `id` w skali 1.
Przed eksportem ustaw `showSafeAreas: false`.

| `id` | Rozmiar | Przeznaczenie |
|---|---|---|
| `og-typo` | 1200 × 630 | `public/og-image.png`, kampanie |
| `og-data` | 1200 × 630 | OG podstron produktowych |
| `ig-post` | 1080 × 1080 | post Instagram |
| `ig-story` | 1080 × 1920 | story Instagram |
| `fb-cover` | 1640 × 624 | cover strony Facebook |
| `fb-post` | 1080 × 1080 | post Facebook |
| `li-cover` | 1128 × 191 | cover strony LinkedIn |
| `li-post` | 1200 × 627 | post LinkedIn |
| `feature-post` | 1080 × 1080 | szablon „nowa funkcja" |
| `hero-banner` | 1440 × 560 | hero landingu (lub wdrożenie jako HTML) |
| `cta-banner` | 1440 × 280 | pas CTA (lub wdrożenie jako HTML) |
| `ad-300x250` | 300 × 250 | Google Ads kwadrat |
| `ad-160x600` | 160 × 600 | Google Ads pion |
| `ad-728x90` | 728 × 90 | Google Ads leaderboard |
| `card-front` | 1004 × 650 | wizytówka awers, 85 × 55 mm @ 300 dpi |
| `card-back` | 1004 × 650 | wizytówka rewers |
| `letterhead` | 794 × 1123 | papier firmowy A4 @ 96 dpi |
| `signature` | 600 szer. | sygnatura e-mail |

---

## Kolejność wdrożenia

1. **Z-1, Z-2** — favicon i `theme-color`. Bez decyzji właściciela, to naprawa błędu.
   Użyj `favicon-A-os-czasu.svg` tymczasowo albo poczekaj na wybór znaku
2. **Z-3** — sprawdź i posprzątaj font Inter w `index.html`
3. **Decyzja właściciela o znaku** (A / B / C)
4. **Z-4** — ujednolicenie znaku we wszystkich sześciu miejscach w kodzie
5. **Eksport ikon** z wybranego znaku: favicon SVG, 192, 512, apple-touch 180
6. **Eksport `og-image.png`** i podmiana w `public/`
7. **Z-5** — hero i pas CTA jako sekcje HTML w `LandingPage.jsx`
8. **Eksport banerów social** na potrzeby marketingu
9. **Podmiana placeholderów** w wizytówce i sygnaturze na prawdziwe dane
