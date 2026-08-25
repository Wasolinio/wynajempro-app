# Handoff: panel podatkowy WynajemPRO (X25)

## Overview

Czwarta podzakładka modułu **Finanse** (`Przegląd · Koszty i opłaty · Podatki · Raporty`).
Panel odpowiada na jedno pytanie: **ile odłożyć, żeby nie zabrakło**. Wszystko poniżej głównej
kwoty tylko ją uzasadnia.

Panel zastępuje **w całości** tymczasowy widok `src/pages/dashboard/views/TaxesView.jsx`.
Logika jest gotowa i przetestowana — `src/utils/taxSummary.js` (`podsumowaniePodatkowe`,
`podsumowanieMiesieczne`, `domyslnyTryb`, `zdrowotnaRyczalt`). Nie zmieniamy silnika, budujemy
wyłącznie warstwę widoku.

Dwa tryby:
- **„Podsumowanie”** — domyślny dla `lump_sum`. Jedna liczba, bez tabel i żargonu.
- **„Szczegóły dla księgowego”** — domyślny dla `general`. Rozbicie kwot + rozkład miesięczny.

> ⚠️ **Zmiana wobec projektu (2026-08-25, ADR-020):** formy `unregistered` i `linear` zostały
> usunięte z aplikacji. Obie były liczone stawką ryczałtu bez podstawy prawnej. Panel obsługuje
> dwie formy: ryczałt i zasady ogólne.

## About the Design Files

Pliki w tym pakiecie to **referencja projektowa napisana w HTML** — prototyp pokazujący docelowy
wygląd i zachowanie, a **nie kod produkcyjny do skopiowania**. Zadaniem jest odtworzenie tych
widoków w istniejącym środowisku aplikacji: React 18 + Vite, style w `src/pages/dashboard/styles.js`
(szablon JS z CSS-em, przestrzeń nazw `.wpd-*`), ikony liniowe lucide, Firebase/Firestore jako dane.

Nie przenosimy inline’owych stylów z prototypu do JSX-a. Prototyp ma je tylko dlatego, że jest
jednym plikiem HTML. W kodzie: klasy `.wpd-*`, a brakujące dopisujemy w `styles.js` w tej samej
konwencji (BEM-owe `__element` i `--modifier`).

## Fidelity

**High-fidelity.** Kolory, typografia, odstępy, promienie i copy są finalne — odtwarzamy 1:1,
korzystając z istniejących tokenów CSS. Wszystkie wartości poniżej pochodzą z Identyfikacji v2
i są już zdefiniowane jako zmienne w `styles.js` (`:root`), więc w kodzie używamy `var(--*)`,
nie hexów.

Jedyne wartości do potwierdzenia z właścicielem: treść zastrzeżenia prawnego (uzgadniana osobno)
oraz przykładowe liczby — w prototypie są zmyślone, w aplikacji przychodzą z `taxSummary.js`.

---

## Screens / Views

Prototyp jest arkuszem z podpisanymi rysunkami („RYS. 1 — …”). Poniżej każdy rysunek jako
docelowy stan widoku.

### RYS. 1 — Tryb „Podsumowanie”, stan normalny (ryczałt)

**Purpose.** Gospodarz w pośpiechu ma w pierwszej sekundzie zobaczyć kwotę do odłożenia.

**Layout.** Panel wchodzi w istniejącą ramę: nagłówek modułu (`Finanse` + podtytuł mono),
segment lat po prawej, pasek zakładek (`.wpd-tabs`), pod nim pasek narzędzi panelu.
Treść panelu to trzy warstwy w pionie, `gap: 16px`:

1. **Hero (atramentowy)** — `background: var(--ink)`, `border-radius: 4px`, `padding: 32px`,
   `display: grid; grid-template-columns: 1.25fr 1fr; gap: 32px`.
   - Lewa kolumna: etykieta mono `DO ODŁOŻENIA ZA 2026` (IBM Plex Mono, 11px, `letter-spacing:.12em`,
     uppercase, `color:#8C8576`, `margin-bottom:16px`); kwota `font-weight:800; font-size:76px;
     line-height:.95; letter-spacing:-.04em; color:var(--paper)`, sufiks „zł” 38px/700;
     akapit 15px/1.6 `color:#C7BFB0`, `max-width:380px`.
     Kwota = `lacznieDoZaplaty`.
   - Prawa kolumna: `border-left:1px solid #2C2920; padding-left:28px`, trzy wiersze
     (wzór `.wpd-settle__row` w wersji na atramencie): klucz 13.5px `#C7BFB0`, wartość mono 14px/500
     `var(--paper)`, `padding:11px 0`, `border-bottom:1px solid #2C2920` (ostatni bez).
     Wiersze: `Podatek ryczałtowy 8,5%` → `podatek`; `Zdrowotna {zdrowotnaMies} zł × {miesiecy} miesięcy`
     → `zdrowotnaRok`; `Składki społeczne` → gdy `spoleczneRok === 0`, po prawej mono 12px `#8C8576`
     uppercase „nie masz ich w ustawieniach” (**nigdy „0 zł”**).

2. **Rząd dwóch kart** — `grid-template-columns: 1.35fr 1fr; gap:16px`, obie `.wpd-panel`
   (`background:var(--surface); border:1px solid var(--hairline); border-radius:4px; padding:22px`).
   - **Karta progu** (patrz „Próg 100 000 zł” niżej).
   - **Karta „Przychód i co go zjadło”**: trzy wiersze `.wpd-settle__row` (brutto, prowizje, media)
     — **bez znaków minus i bez sumy z odejmowaniem**; pod nimi nota bursztynowa; na dole,
     dociśnięta `margin-top:auto` i oddzielona `border-top:1px solid var(--hairline)`:
     etykieta mono „Zostaje Ci po prowizjach, kosztach i odłożeniu podatków” + kwota 26px/800
     `color:var(--green)` = `przychod − prowizje − media − lacznieDoZaplaty`.
   - Nota bursztynowa: `background:var(--tint-amber); border:1px solid #EFE2C2; border-radius:4px;
     padding:12px 14px; gap:10px`, ikona lucide `info` 16px `color:var(--amber-ink)`,
     tekst 12.5px/1.55 `var(--amber-ink)`.

3. **Stopka zastrzeżenia** — `.wpd-note`, `display:flex; justify-content:space-between;
   padding:14px 16px`; po lewej zdanie 13px/1.6 `var(--muted)` (`max-width:640px`), po prawej
   mono 10px uppercase `var(--label)`: `STAWKI {rokStawek} · WYLICZONE {data}`.
   **Jedno miejsce w całym panelu** — nie powtarzamy zastrzeżenia przy liczbach.

**Pasek narzędzi panelu.** `display:flex; justify-content:space-between; align-items:center;
flex-wrap:wrap; gap:16px; margin-bottom:16px`: po lewej `.wpd-seg` z trybami, po prawej mono 11px
`var(--faint)`: `{liczbaRezerwacji} rezerwacji · stawki {rokStawek}`.

### Próg 100 000 zł (karta w RYS. 1, wariant przekroczony w RYS. 7)

Ma się czytać z odległości, dlatego liczba „ile zostało” jest większa niż procent.

- Nagłówek: mono 10px uppercase `var(--label)` „PRÓG RYCZAŁTU · 100 000 ZŁ”; po prawej mono 11px/600
  `{procentProgu}% progu` w kolorze akcentu.
- Zdanie główne: 27px/700, `letter-spacing:-.02em` — „Zostało **15 400 zł** przychodu”
  (kwota w mono 600, `font-variant-numeric: tabular-nums`).
- Pasek: `height:18px; background:var(--inner-2); border-radius:3px; overflow:hidden`,
  wypełnienie `width: {procentProgu}%`, kolor akcentu. Trzy pionowe kreski 1px
  `rgba(243,239,229,.45)` na 25 / 50 / 75% (czytelna skala bez podpisów).
- Skala pod paskiem: mono 10px `var(--label)`, `justify-content:space-between` — `0`, `50 000`, `100 000 zł`.
- Akapit: 13.5px/1.6 `var(--muted)` — stawki 8,5% / 12,5% i konsekwencja dla cen.

**Kolor akcentu.** Domyślnie bursztyn (`--amber` na pasku, `--amber-ink` na etykiecie) jako „uwaga”;
po przekroczeniu progu cynober. Prototyp ma to jako przełącznik (`progAkcent`) — do wdrożenia
wystarczy reguła: `procentProgu >= 100` → cynober, inaczej bursztyn.
Rekomendacja: bursztyn dopiero od ~80% progu, niżej neutralny atrament — do decyzji właściciela.

**Wariant przekroczony (RYS. 7).** Pasek to flex dwóch bloków bez wspólnego tła:
`flex: 0 0 {prog/przychod*100}%` w `var(--ink)` i reszta w `var(--cynober)`. Podpisy w tej samej
proporcji: pod pierwszym blokiem `100 000 zł` (wyrównane do prawej, `padding-right:6px`),
pod drugim `nadwyżka` w cynobrze. Zdanie główne: „Powyżej progu o **8 200 zł**”.
Obok karta „Podatek po dwóch stawkach”: `Do progu · 8,5% od 100 000 zł`, `Nadwyżka · 12,5% od …`
(wartość w cynobrze), wiersz sumaryczny 17px/700.

### RYS. 2 — Przełącznik trybów

Dwa miejsca, jeden komponent (`.wpd-seg`):

- **W panelu**, nad treścią. `.wpd-seg` z dwoma `.wpd-seg__btn`; aktywny `--active`
  (`background:var(--ink); color:#fff`). Etykiety: `Podsumowanie`, `Szczegóły dla księgowego`.
  Na ≤600px: `display:grid; grid-template-columns:1fr 1fr` pełnej szerokości, druga etykieta
  skrócona do `Szczegóły`, `padding:9px 0`, `text-align:center`.
- **Ustawienia konta → Podatki.** Karta „Widok podatków” z podtytułem „Domyślnie wynika z Twojej
  formy opodatkowania. Możesz to zmienić na stałe.” i dwoma wierszami wyboru
  (`.wpd-listrow` + radio): tytuł 14px/600 + opis 12.5px `var(--muted)`. Wybrany wiersz ma
  `border-color: var(--ink)`, kropka radio 14px z `box-shadow: inset 0 0 0 3px var(--surface)`.

**Zasada.** Nie pytamy o tryb przy pierwszym uruchomieniu. Domyślny tryb = `domyslnyTryb(settings)`.
Wybór zapisuje się (ustawienia konta) i jest odwracalny jednym kliknięciem — bez potwierdzenia,
bez toastu.

### RYS. 3 — Tryb „Szczegóły dla księgowego”

**Purpose.** Materiał do rozmowy z księgową przez telefon.

**Layout** (od góry, `gap:16px`):

1. **Pasek czterech komórek** — `display:grid; grid-template-columns:repeat(4,1fr)`,
   wspólna ramka `1px var(--hairline)`, `border-radius:4px; overflow:hidden`, rozdzielone
   `border-right:1px solid var(--inner)`; komórka: `padding:18px 20px`, etykieta mono 10px
   uppercase, wartość 24px/800 tabular. Kolejność: `Przychód`, `Podstawa`, `Podatek`,
   `Łącznie do zapłaty` — ostatnia na `var(--ink)` (etykieta `#8C8576`, wartość `var(--paper)`).
2. **Rachunek roku** (`1.25fr`) + kolumna boczna (`1fr`), `gap:16px`.
   - Rachunek: wiersze `.wpd-settle__row`, wartości mono 14px z dwoma miejscami po przecinku,
     wyrównane do prawej. Kolejność: przychód brutto z N rezerwacji → *(gdy płatnik VAT:
     `VAT należny 8%` i `Przychód po VAT`; gdy `vatNalezny === 0` — wiersza nie ma)* →
     `Odliczenie 50% składki zdrowotnej` (`− 3 076,00`) → **Podstawa opodatkowania** (600) →
     `Ryczałt 8,5% od podstawy` → `Zdrowotna — próg do 300 000 zł · 769,43 × 8` →
     `Składki społeczne — nie masz ich w ustawieniach` (mono „POMIJAMY”, gdy `spoleczneRok === 0`) →
     wiersz sumy `Łącznie do zapłaty`, klucz 14px/700, wartość mono 17px/700.
   - Kolumna boczna, dwie karty:
     `Do rozmowy z księgową` — siatka `1fr auto`, `gap:10px 16px`: forma opodatkowania, próg,
     VAT należny 8%, rok stawek, miesięcy w wyliczeniu (`{miesiecy} z 12`).
     `Prowizje i media · poza rachunkiem ryczałtu` — dwa wiersze + akapit 12.5px `var(--faint)`
     wyjaśniający, że nie wchodzą do podstawy.
3. **Rozkład miesięczny** — `.wpd-panel` z nagłówkiem (`padding:16px 20px; border-bottom`):
   po lewej mono „ROZKŁAD MIESIĘCZNY · 2026”, po prawej mono 10px `var(--faint)`
   „miesiące bez ruchu pominięte”. Tabela `.wpd-table` w kontenerze `overflow-x:auto`,
   `min-width:640px`. Kolumny: `Miesiąc` (13.5px/600, lewo) + `Rezerwacje`, `Brutto`, `Przychód`,
   `Prowizje`, `Media` (mono 13px, `.wpd-num`, tabular). Wiersz `Razem` na `var(--ink)`,
   wartości 600, prowizje i media w `#C7BFB0`.
   **Decyzja projektowa:** miesiące bez ruchu pomijamy (`brutto === 0 && media === 0 && rezerwacje === 0`).
   Prototyp ma wariant „wszystkie 12” z myślnikami `—` w pustych komórkach — do włączenia tylko,
   jeśli właściciel będzie chciał pełny rok.
4. **Stopka zastrzeżenia** — identyczna jak w trybie „Podsumowanie”.

### RYS. 4 — Pusto (rok bez rezerwacji)

`.wpd-empty` w `.wpd-panel`: `text-align:center; padding:52px 24px`.
Ikona lucide `receipt` 26px `var(--faint)`, `margin-bottom:16px`.
Nagłówek 22px/700 „Za 2026 nie ma jeszcze żadnej rezerwacji”.
Akapit 14.5px/1.6 `var(--muted)`, `max-width:440px`, wyśrodkowany.
Dwa przyciski (`gap:12px`): primary cynober `padding:12px 20px; border-radius:3px; font-weight:600`
„Dodaj rezerwację”; secondary `.wpd-btn--ghost` „Podłącz kalendarz”.
Pod nimi mono 11px `var(--faint)`: „2025 masz rozliczony — przełącz rok wyżej”
(pokazujemy tylko, jeśli poprzedni rok ma rezerwacje).
**Nie pokazujemy zer, KPI ani pustych tabel.**

### RYS. 5 — Stawki z innego roku (`stawkiAktualne === false`)

Alert **wysokiej wagi** nad kwotą główną, nie przy liczbach:
`background:var(--tint-cynober); border:1px solid var(--cynober); border-radius:4px;
padding:16px 18px; display:flex; gap:12px`, ikona lucide `alert-triangle` 18px `var(--cynober)`,
tytuł 14.5px/700 `#7a2e1c`, treść 13.5px/1.6 `#7a2e1c`.
Copy: „Rozliczenie {rok} liczymy stawkami z {rokStawek}” + „Kwoty podatku i składek zmieniają się
co roku. Dopóki nie wejdą stawki na {rok}, traktuj te liczby jako orientacyjne — kierunek jest
dobry, kwota nie.”
Dodatkowo w hero, po prawej, znacznik mono 10.5px/600 uppercase na cynobrze: `STAWKI {rokStawek}`.
Kwota zostaje pełną wielkością — nie wyszarzamy jej.

### RYS. 6 — Rozjazd (`rozjazd !== null`)

Alert uwagi (bursztyn): `background:var(--tint-amber); border:1px solid var(--amber)`,
ikona `info`, tytuł „Dwie różne kwoty podatku za {rok}”, treść wskazująca najczęstszą przyczynę
(zmiana formy opodatkowania w trakcie roku) i liczbę rezerwacji.
Pod alertem dwie karty `1fr 1fr`, `gap:16px`:
- **Z bieżących ustawień** — `border-color: var(--ink)`, tag `WIĄŻĄCA` (mono 10px/600, biały
  na atramencie, `padding:4px 8px; radius:3px`), kwota 34px/800 (`rozjazd.wyliczony`), opis 13px.
- **Zapisane przy rezerwacjach** — ramka hairline, kwota 34px/800 `var(--faint)`
  (`rozjazd.zapisany`), opis z liczbą rezerwacji i różnicą.
Stopka karty: `border-top:1px solid var(--hairline); padding-top:16px`, po lewej zdanie 13px,
po prawej link-akcja „Przelicz {n} rezerwacji →” (600, `border-bottom:2px solid var(--ink)`).

### RYS. 8 — Forma inna niż ryczałt (`general` / `linear`)

Elementy specyficzne dla ryczałtu **znikają**, nie pokazują się puste:
- brak karty progu 100 000 zł,
- brak automatycznej zdrowotnej — bierzemy `zusHealth` z ustawień („Zdrowotna z Twoich ustawień · 314,10 × 8”),
- prowizje i media **wchodzą do rachunku ze znakiem minus** i dają wiersz `Dochód · podstawa`,
- wiersz `Podatek 12% po kwocie wolnej 30 000 zł`.
Obok, karta zielona (`--tint-green`, `border:1px solid #D7E2DA`, tytuł `var(--green)`):
„Tu koszty obniżają podatek” — wyjaśnia różnicę wobec ryczałtu.
Pod nią karta `border: 1px dashed var(--hairline)` „Czego tu nie ma” z dwoma zdaniami
(pasek progu, automatyczna zdrowotna) — to element dokumentacji projektu, **nie wdrażamy jej w UI**.

### RYS. 9 — Telefon 375 px

Kolejność zostaje: kwota → próg → rachunek. Karty schodzą w jedną kolumnę (`grid-template-columns:1fr`),
`gap:12px`, padding kontenera 16px.
- Zakładki: `.wpd-tabs` z `overflow-x:auto`, etykiety skrócone (`Koszty`), `white-space:nowrap`.
- Przełącznik trybów: dwie kolumny pełnej szerokości.
- Hero: `padding:20px`, kwota 44px/800, sufiks 22px, zdanie 13px/1.55 (skrócone do jednego).
- Karta progu: nagłówek + procent w jednym wierszu, zdanie 19px/700, pasek `height:14px`,
  bez pionowych kresek skali i bez podpisów 0/50/100.
- Tryb szczegółów: pasek KPI zwężony do dwóch komórek (`Podstawa`, `Łącznie`), wartości 19px/800;
  rachunek jako wiersze klucz–wartość; tabela miesięczna zredukowana do czterech kolumn
  (`Miesiąc`, `Brutto`, `Prowizje`, `Media`), `min-width:420px`, w kontenerze `overflow-x:auto`,
  z nagłówkiem-podpowiedzią mono 9.5px „przewiń w poziomie →”.
- Zastrzeżenie: tekst 12px/1.6 `var(--faint)` bez ramki, na końcu.

**Wymóg twardy:** `document.body.scrollWidth === 375` przy szerokości okna 375 — żaden segment,
tabela ani pasek narzędzi nie może rozepchnąć strony w poziomie. Idiom z `styles.js`:
kontener przewijany u siebie + `min-width:0` na elementach flex.

---

## Interactions & Behavior

- **Przełącznik trybu** — klik przestawia widok natychmiast, bez animacji przejścia, i zapisuje
  preferencję w ustawieniach konta (to samo pole, które czyta karta w Ustawieniach). Powrót jednym
  kliknięciem. Bez toastów.
- **Segment lat** — przeliczenie panelu dla wybranego roku; `miesiecy` dla lat przeszłych = 12,
  dla przyszłych = 0 (wtedy stan pusty).
- **Hover** — `.wpd-seg__btn:hover{ color:var(--ink) }`, `.wpd-table tbody tr:hover{ background:var(--inner) }`,
  przyciski primary `#C23E22`. Przejścia 120–140 ms, `transition: background .12s, color .14s, border-color .14s`.
- **Akcje ze stanów** — „Dodaj rezerwację” otwiera istniejący modal rezerwacji; „Podłącz kalendarz”
  prowadzi do Synchronizacji; „Przelicz N rezerwacji” uruchamia przeliczenie zapisanych kwot
  bieżącymi ustawieniami (potwierdzenie w modalu — akcja modyfikuje dane).
- **Loading** — dopóki `rentals`/`settings` się wczytują, pokazujemy szkielet: pasek KPI i hero
  z pustymi blokami `var(--inner)`, bez zer i bez „0 zł”.
- **Brak animacji dekoracyjnych.** Pasek progu nie animuje się przy wejściu.
- **Responsywność** — punkty łamania jak w resztzie panelu: ≥1024 px układ dwukolumnowy,
  <1024 px jedna kolumna, <600 px warianty mobilne opisane w RYS. 9.

## State Management

Widok jest bezstanowy poza dwiema rzeczami:

| Stan | Typ | Źródło / trigger |
|---|---|---|
| `tryb` | `'prosty' \| 'szczegolowy'` | init: `settings.taxView ?? domyslnyTryb(settings)`; zmiana: klik w `.wpd-seg` lub Ustawienia; zapis do ustawień konta |
| `rok` | `number` | init: `new Date().getFullYear()`; zmiana: segment lat |

Dane (bez własnego fetchowania — te same konteksty, z których korzysta reszta Finansów):
```js
const podsumowanie = podsumowaniePodatkowe(rentals, settings, rok);
const miesiace = podsumowanieMiesieczne(rentals, settings, rok)
  .filter(m => m.brutto || m.media || m.rezerwacje);   // decyzja projektowa
```

Warunki renderowania, wprost z `podsumowanie`:
```
liczbaRezerwacji === 0            → stan pusty (RYS. 4), nic więcej
stawkiAktualne === false          → alert cynober + znacznik w hero (RYS. 5)
rozjazd !== null                  → alert bursztyn + dwie karty (RYS. 6)
forma === 'lump_sum'              → karta progu; procentProgu >= 100 → wariant przekroczony (RYS. 7)
forma !== 'lump_sum'              → bez progu, bez auto-zdrowotnej, koszty w rachunku (RYS. 8)
vatNalezny === 0                  → brak wierszy VAT
spoleczneRok === 0                → wiersz opisowy, nigdy „0 zł”
```
Kolejność alertów, gdy wypadną razem: najpierw stare stawki (wysoka waga), potem rozjazd.

Formatowanie: `Intl.NumberFormat('pl-PL')` z separatorem tysięcy = wąska spacja, `zł` po liczbie.
W trybie „Podsumowanie” kwoty bez groszy (zaokrąglone), w „Szczegółach” dwa miejsca po przecinku.
Wszystkie liczby: IBM Plex Mono + `font-variant-numeric: tabular-nums`.

## Design Tokens

Wszystkie są już w `src/pages/dashboard/styles.js` (`:root`) — używamy `var(--*)`.

| Token | Wartość | Rola w panelu |
|---|---|---|
| `--paper` | `#F3EFE5` | tło strony, tekst na atramencie |
| `--surface` | `#FBFAF6` | karty, panele |
| `--ink` | `#17150F` | hero, wiersz „Razem”, aktywny segment |
| `--cynober` | `#D9492B` | akcent, alert wysokiej wagi, nadwyżka nad progiem |
| `--cynober-hover` | `#C23E22` | hover primary |
| `--green` | `#2F6B53` | „zostaje Ci”, karta o kosztach przy skali |
| `--amber` / `--amber-ink` | `#C99A2E` / `#7E6119` | uwaga, pasek progu, nota o prowizjach |
| `--hairline` / `--inner` / `--inner-2` | `#DDD5C3` / `#EFE9DA` / `#E0D8C6` | linie, tła segmentów, tor paska |
| `--tint-cynober` / `--tint-amber` / `--tint-green` | `#F6E5DF` / `#FBF1D9` / `#E7EDE7` | tła alertów i not |
| `--muted` / `--faint` / `--label` | `#524C3F` / `#716951` / `#746C54` | tekst, tekst drugorzędny, etykiety mono |
| na atramencie | `#C7BFB0` tekst, `#8C8576` faint, `#2C2920` linia | hero |

**Typografia.** Schibsted Grotesk 400–800 (UI), Newsreader italic 500 (akcent w nagłówkach —
w panelu nieużywany), IBM Plex Mono 400–600 (etykiety, liczby).

| Rola | Wartości |
|---|---|
| Kwota główna (hero) | 800 · 76px · `-.04em` · `.95`; sufiks „zł” 700 · 38px; mobile 44px / 22px |
| Wartość KPI | 800 · 24px · `-.02em` (mobile 19px) |
| Zdanie progu | 700 · 27px · `-.02em` (mobile 19px) |
| Nagłówek sekcji panelu | 700 · 17px · `-.02em` |
| Tekst UI | 400 · 13.5–15px · 1.6 |
| Etykieta mono | 500 · 10–11px · `+.10em` · UPPERCASE |
| Liczba w tabeli / wierszu | mono 500–600 · 13–14px · tabular-nums |
| Suma wiersza | mono 700 · 17px |

**Odstępy** — 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 px (skala marki). `gap` między kartami 16px,
padding kart 22px, hero 32px, mobile 16px.
**Promienie** — 3px kontrolki, tagi, pasek; 4px panele i alerty.
**Cienie** — brak. Struktura wyłącznie liniami 1px.

## Assets

- **Ikony** — lucide, wyłącznie liniowe, `stroke-width:1.75` (globalna reguła `.wpd svg`).
  Użyte: `info` (nota o prowizjach, alert rozjazdu), `alert-triangle` (stare stawki),
  `receipt` (stan pusty). Brak emoji.
- **Logo** — znak WynajemPRO tylko w nagłówku arkusza referencyjnego; w aplikacji jest już w ramie.
- Brak obrazów, brak plików do skopiowania.

## Files

| Plik | Co zawiera |
|---|---|
| `Panel podatkowy.dc.html` | referencja projektowa — wszystkie rysunki (RYS. 1–9) w jednym pliku, otwiera się w przeglądarce |
| `support.js` | runtime potrzebny do otwarcia pliku referencyjnego lokalnie |
| `brief.txt` | brief projektowy (tekst z `Brief-panel-podatkowy-2026-08-24.docx`) |

W repozytorium aplikacji:
- `src/utils/taxSummary.js` — gotowa logika, bez zmian.
- `src/pages/dashboard/views/TaxesView.jsx` — **do zastąpienia w całości.**
- `src/pages/dashboard/styles.js` — tokeny i klasy `.wpd-*`; tu dopisujemy brakujące
  (np. `.wpd-hero`, `.wpd-prog`, `.wpd-compare`) w istniejącej konwencji.
- `e2e/guest-guide-taxes.spec.js`, `e2e/ui-scaling.spec.js` — testy do rozszerzenia:
  brak poziomego przewijania na 375 px, obecność zastrzeżenia dokładnie raz, brak „0 zł”
  w wierszu składek społecznych, znikanie karty progu przy `general`.

## Czego nie wolno naruszyć

1. **Ryczałt nie odejmuje kosztów.** Prowizje i media w trybie ryczałtu stoją w osobnej karcie,
   bez znaków minus i bez sumy, która sugerowałaby odejmowanie od podstawy. To realne ryzyko
   wprowadzenia w błąd — układ nie może go tworzyć.
2. **Zastrzeżenie prawne w jednym miejscu**, na końcu panelu, czytelne, nie dominujące.
   Nie powtarzamy go przy liczbach.
3. **Zero emoji, zero gradientów, zero cieni.** Ikony wyłącznie liniowe lucide.
4. **Nie pokazujemy zer.** `spoleczneRok === 0`, `vatNalezny === 0`, rok bez rezerwacji — każdy
   z tych przypadków ma własne rozwiązanie tekstowe albo znika.
5. **Liczby monospace’em, tabularnie**, wyrównane do prawej w kolumnie.
6. **Ton** — na „Ty”, rzeczowo. Bez nowomowy urzędowej i marketingowej, bez reguły trzech.

## Poza zakresem tej tury

Mikrorachunek podatkowy i tytuły przelewów, eksport CSV dla księgowej, VAT-UE / import usług
od prowizji portali. Projekt zostawia na nie miejsce (pasmo pod rachunkiem roku, miejsce obok
nagłówka rachunku), ale **nie rysujemy ich jako gotowych** i nie wdrażamy atrap.
