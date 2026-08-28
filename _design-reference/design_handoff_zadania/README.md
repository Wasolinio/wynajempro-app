# Handoff: moduł „Zadania” (WynajemPRO, panel gospodarza)

## Po co ten pakiet

Nowy, szósty widok panelu: **Zadania**. Łączy w jednym miejscu zadania generowane z szablonów
(kotwica przyjazd/wyjazd, dziś liczone przez `src/utils/taskSchedule.js`) i zadania ręczne, dziś żyjące
jako `rentals` z `type: 'reminder'`. Wnosi trzy rzeczy, których panel nie ma:

1. **Przypisywanie zadania do rezerwacji bez wybierania z listy** — przeciągnięcie kartki na pasek
   rezerwacji na siedmiodniowej osi (bierze gościa i dzień, na który spadła) albo na wolny dzień
   (bierze sam termin i obiekt). Klik w pasek otwiera szybkie zadanie w kontekście tej rezerwacji.
2. **Listę dzienną z grupowaniem po obiekcie** — sekcje Zaległe / Dziś / Jutro / dni tygodnia / Później,
   w każdej sekcji podgrupy po obiekcie.
3. **Pełniejsze zadanie** — priorytet, godzina, checklista, notatka, zdjęcie, powtarzalność.

## O plikach w tym pakiecie

`prototyp/Zadania.dc.html` to **referencja projektowa napisana w HTML** — działający prototyp
pokazujący docelowy wygląd i zachowanie (przeciąganie, animacje, popover, kalendarz, custom select).
**Nie jest to kod produkcyjny do skopiowania.** Zadaniem wdrożenia jest odtworzenie tego projektu
w istniejącym środowisku repozytorium: React 18 + Vite, Firebase, `lucide-react`, arkusz `.wpd`
w `src/pages/dashboard/styles.js` — zgodnie z konwencjami, które już tam obowiązują (klasy `.wpd-*`,
zero cieni i gradientów, linie 1 px, radius 3 px kontrolki / 4 px panele, `prefers-reduced-motion`).

Prototyp otwiera się w przeglądarce (`prototyp/Zadania.dc.html`, obok musi leżeć `support.js`).
Warto go mieć otwartego przy wdrożeniu, zwłaszcza dla animacji przeciągania.

Pozostałe pliki:

| Plik | Zawartość |
|---|---|
| `README.md` | Specyfikacja: układ, komponenty, wartości, interakcje, animacje, stan, tokeny |
| `IMPLEMENTACJA.md` | Plan wdrożenia w tym repo: pliki, model danych, reguły, testy, kolejność |
| `PROMPT.md` | Gotowy prompt startowy do wklejenia w Claude Code |
| `tokens-zadania.css` | Gotowy blok CSS w konwencji `.wpd-*` do wklejenia w `styles.js` |
| `prototyp/` | Prototyp HTML + runtime |

## Fidelity

**Hi-fi.** Kolory, typografia, odstępy, promienie, czasy i krzywe animacji są docelowe — wszystkie
wartości pochodzą z identyfikacji v2 i z `styles.js` (namespace `.wpd`). Odtwarzać 1:1.
Jedyny obszar świadomie niedokończony: **widok mobilny (<980 px)** — wytyczne są w sekcji
„Responsywność”, ale makiety telefonu nie ma.

---

## Ekran: Zadania

**Ścieżka:** panel gospodarza → sidebar poz. `06 Zadania` (nowa pozycja pod `05 Finanse`).
**Cel użytkownika:** zobaczyć, co jest do zrobienia dziś i w tym tygodniu, przypiąć zadania
bez terminu do konkretnej rezerwacji lub dnia, odhaczać wykonane.

### Układ (od góry)

Powłoka bez zmian względem panelu: sidebar `240 px` (`#17150F`), obszar roboczy `#F3EFE5`,
`.wpd-content` = `padding: 26px 34px 90px`, `max-width: 1240px`, wyśrodkowany.

1. **Topbar** (istniejący `.wpd-top`): tytuł „Zadania” (`700 / 25px / -.03em`), podtytuł mono
   `10.5px` uppercase `#716951` z dzisiejszą datą, wyszukiwarka `230 × 40`, przycisk główny
   `+ Zadanie` (cynober, `40 px`).
2. **Pasek liczników** — panel `#FBFAF6`, `1px #DDD5C3`, radius `4px`, komórki rozdzielone
   pionowymi liniami `1px`:
   - „POZOSTAŁO” + **licznik przewijający cyfry**: dwie kolumny cyfr, każda `40 px` wysokości,
     `IBM Plex Mono 600 / 33px / -.02em`, `transform: translateY(-cyfra × 40px)`,
     `transition: transform .55s cubic-bezier(.22,1,.36,1)`.
   - „ZALEGŁE” — mono `600 / 22px` w `#D9492B` + podpis „wymaga decyzji”.
   - „BEZ REZERWACJI” — mono `600 / 22px` `#17150F` + podpis „do przypisania”.
   - Po prawej ikona trendu (cynober, `17px`) + zdanie `12.5px #524C3F`:
     „Przeciągnij kartkę na pasek rezerwacji — zadanie przypnie się do gościa i terminu.”
3. **Panel „Oś przypisania”** (szczegóły niżej).
4. **Dwie kolumny**: lista dzienna (`flex: 1 1 560px; min-width: 0`) + skrzynka
   „Do przypisania” (`flex: 1 1 300px; max-width: 340px; position: sticky; top: 96px`),
   `gap: 20px`, `flex-wrap: wrap` — poniżej ~940 px skrzynka spada pod listę.
   **Nie używać sztywnego `grid-template-columns: 1fr 316px`** — przy szerokości panelu ~900 px
   kolumna listy schodziła do 265 px i kartki się nachodziły.

### Panel „Oś przypisania”

Nagłówek: `.wpd-panel__head` (`padding: 15px 20px`, dolna linia `1px #DDD5C3`) —
tytuł „Oś przypisania” (`700 / 17px / -.02em`), zakres „23–29 SIERPNIA” mono `10px`,
po prawej dwie legendy mono `10px`: prostokąt `14×6` w kolorze obiektu = „pasek = rezerwacja”,
prostokąt `14×6` z `1px dashed #DDD5C3` = „wolny dzień = sam termin”.

Siatka jak w kalendarzu panelu (`.wpd-cal__*`): `grid-template-columns: 196px 1fr`.

- **Wiersz nagłówka dni**: 7 komórek, `border-left: 1px solid #EFE9DA`, wyśrodkowane;
  numer dnia mono `500 / 12px` `#524C3F`, skrót dnia mono `8.5px` uppercase `#716951`;
  dzisiejsza kolumna w `#D9492B`.
- **Wiersz obiektu** (`border-top: 1px solid #DDD5C3`):
  - lewa komórka `padding: 14px 18px`, `border-right: 1px solid #DDD5C3`: kwadratowa kropka
    `8×8`, radius `2px` w kolorze obiektu + nazwa `600 / 14px`, pod nią mono `9.5px` uppercase
    `#716951` (miejscowość · liczba osób).
  - **tor**: `position: relative`, wewnątrz siatka 7 komórek `min-height: 56px`,
    `border-left: 1px solid #EFE9DA`. Wolna komórka: `cursor: cell`, weekend `#F7F3E9`,
    u góry linia celu `2px` cynober z `transform: scaleX(0)` (rośnie przy przeciąganiu).
  - **paski rezerwacji**: `position: absolute; top: 12px; height: 32px`, radius `3px`
    (`0 3px 3px 0` gdy przycięty z lewej, `3px 0 0 3px` gdy z prawej), tło = kolor obiektu
    (`PROP_HEX`), nazwa gościa `600 / 12px #fff` z `text-overflow: ellipsis`, po prawej
    źródło mono `9px` `rgba(255,255,255,.72)` i plus `13px`. Hover: `filter: brightness(1.12)`.
  - **geometria paska**: `left = (indeksPrzyjazdu + .5) / 7 × 100%`,
    `right = (indeksWyjazdu + .5) / 7 × 100%`, przycięte do 0 % / 100 % gdy rezerwacja
    wychodzi poza okno siedmiu dni.

### Lista dzienna

Nad listą pasek narzędzi: **custom select „Obiekt”** (opis w „Rozsuwane menu”) + mono `10px`
uppercase `#716951` z liczbą zadań w widoku („7 zadań w widoku”).

Sekcja dnia:

- nagłówek: nazwa (`700 / 18px / -.025em`), podtytuł mono `10.5px` uppercase `#746C54`
  („niedziela, 23 sierpnia”), licznik mono `11px` po prawej, dolna linia `1px #DDD5C3`
  (dla „Zaległe”: nazwa, licznik i linia w `#D9492B`);
- kolejność sekcji: `Zaległe` → `Dziś` → `Jutro` → nazwy dni → `Później` (po oknie 7 dni);
- podgrupa obiektu: kropka `8×8` radius `2px` w kolorze obiektu + mono `500 / 10px / .1em`
  uppercase `#524C3F` + wypełniacz linią `1px #DDD5C3`; kolejność jak w `settings.properties`,
  na końcu „Bez obiektu”;
- kartki: `display: flex; flex-direction: column; gap: 8px`.

**Kartka zadania**

| Element | Wartości |
|---|---|
| kontener | `#FBFAF6`, `1px solid #DDD5C3`, radius `4px`, `padding: 13px 16px 13px 20px`, `cursor: grab`, `touch-action: none`; hover `border-color: #17150F` |
| pasek priorytetu | `position: absolute; left: 0; top: 0; bottom: 0; width: 3px`, radius `3px 0 0 3px`; wysoki `#D9492B`, normalny `#C99A2E`, niski `#DDD5C3` |
| checkbox | `22 × 22`, `1px #DDD5C3`, radius `3px`; hover `border-color: #2F6B53`; zaznaczony `background: #2F6B53`, ptaszek `13px` biały `stroke-width: 2.6` |
| tytuł | `600 / 14.5px / -.01em`, `line-height: 1.35`, `#17150F`; wykonane `#716951` + linia przekreślenia `1px #716951` na `top: 53%` |
| wiersz meta | `flex-wrap: wrap; gap: 11px; margin-top: 8px` |
| chip „po terminie” | mono `9.5px` uppercase `#D9492B`, tło `#F6E5DF`, `1px #EBD3CB`, radius `3px`, `padding: 3px 7px` |
| godzina | ikona zegara `12px` + mono `11px` `#524C3F` |
| chip rezerwacji | tło `#EFE9DA`, `1px #DDD5C3`, radius `3px`, `padding: 3px 8px 3px 7px`; kropka `7px` w kolorze kanału (`channelColor`), gość `600 / 11.5px`, źródło mono `9px` uppercase `#716951` |
| tag „z szablonu” | mono `9px` uppercase `#746C54`, `1px #DDD5C3`, radius `3px`, `padding: 3px 6px` |
| powtarzalność | ikona odświeżania `12px` + mono `9.5px` uppercase `#716951` („co miesiąc”, „po wyjeździe”) |
| przycisk checklisty | `1px #DDD5C3`, radius `3px`, `padding: 3px 7px`, mono `10px` `#524C3F`, treść „2/4” + szewron `11px` obracany o `180°` w `.26s cubic-bezier(.22,1,.36,1)`; hover ramka i tekst `#17150F` |
| zdjęcie | ikona aparatu `12px` + mono `9.5px` uppercase „zdjęcie” |
| notatka | `Newsreader italic 14px #524C3F`, `padding-left: 11px`, `border-left: 1px solid #DDD5C3`, `margin-top: 9px` |
| checklista (rozwinięta) | `margin-top: 11px`, górna linia `1px #DDD5C3`; pozycja: kwadrat `16px` radius `2px` (zrobione `#2F6B53`) + tekst `13px`, zrobione `#716951` + `line-through` |
| uchwyt | ikona sześciu kropek `14px` w `#DDD5C3`, prawa krawędź |

Etykiety priorytetu w skrzynce: „PILNE” `#D9492B`, „ZWYKŁE” `#7E6119`, „KIEDYŚ” `#716951`
— kolor `#DDD5C3` jest zarezerwowany dla paska `3px`, jako tekst daje 1,2:1 (poniżej progu
z komentarza w `styles.js`).

### Skrzynka „Do przypisania”

Panel `#FBFAF6` z ramką **`1px #17150F`** (mocniejsza niż zwykły panel — to źródło przeciągania),
nagłówek z ikoną skrzynki (cynober `16px`), tytułem `700 / 15px` i licznikiem mono `11px`.
Kartka skrzynki: tło `#F3EFE5`, `1px #DDD5C3`, radius `4px`, `padding: 11px 12px 11px 17px`,
tytuł `600 / 13.5px`, pod nim etykieta priorytetu i (opcjonalnie) „2/2 KROKI”, „ZDJĘCIE”;
hover: `border-color: #17150F; transform: translateX(2px)`.
Stan pusty: `1px dashed #DDD5C3`, radius `4px`, `Newsreader italic 15px #716951` — „Wszystko przypisane.”

Pod skrzynką kafel instrukcji na czarnym tle (`#17150F`, radius `4px`, `padding: 16px 18px`):
mono `9.5px` uppercase `#6B6555` „JAK PRZYPISAĆ”, trzy wiersze `12.5px #E4DDCE` numerowane
mono `10px` cynober (01/02/03).

### Szybkie zadanie (popover)

Otwierany klikiem w pasek rezerwacji (kontekst: gość + obiekt) albo przyciskiem `+ Zadanie`
(bez rezerwacji → trafia do skrzynki).

- `position: fixed`, szerokość `352px`, `1px #17150F`, radius `4px`, tło `#F3EFE5`,
  `display: flex; flex-direction: column`, `max-height = innerHeight − top − 16px`;
  **środek przewijalny** (`overflow-y: auto`), nagłówek i stopka przyklejone —
  inaczej przy otwartym kalendarzu przycisk „Dodaj zadanie” wychodzi poza ekran.
- Pozycjonowanie: `top = clamp(12, dolna krawędź paska + 10, innerHeight − 572)`,
  `left = clamp(12, lewa krawędź paska, innerWidth − 372)`.
- Za popoverem przygaszenie `rgba(23,21,15,.28)` (klik = zamknij), `z-index` 920/930.
- Nagłówek: kwadrat `34px` `1px #DDD5C3` z ikoną cynober, „Szybkie zadanie” `700 / 15.5px`,
  podtytuł mono `9.5px` uppercase — „Anna Nowak · Apartament Centrum” albo
  „bez rezerwacji · trafi do skrzynki”; przycisk zamknięcia `30px`.
- Pole treści: `.wpd-input` (`padding: 11px 13px`, `1px #DDD5C3`, radius `3px`, `14px`),
  autofocus po otwarciu.
- **Chipy terminu** (`height: 32px`, radius `3px`, `600 / 12px`, mono nadetykieta `9px`):
  „PRZYJAZD 23.08”, „WYJAZD 26.08”, „DZIŚ 23.08”, „BEZ TERMINU”; wybrany = tło `#17150F`,
  tekst `#FBFAF6`. Chipy przyjazd/wyjazd tylko w kontekście rezerwacji.
- Przełącznik „Kalendarz” — otwiera mini kalendarz (opis niżej).
- **Priorytet**: trzy przyciski w rowku `#EFE9DA` `1px #DDD5C3` radius `3px`, `padding: 3px`;
  aktywny `#17150F` / `#fff`, mono `10px` uppercase („Pilne / Zwykłe / Kiedyś”).
- **Godzina**: pole mono `13px`, placeholder `--:--`.
- Stopka: „Anuluj” (`1px #DDD5C3`) i „Dodaj zadanie” (cynober, `flex: 1.4`), wysokość `40px`.
  Puste pole treści → focus wraca do inputa, nic się nie zapisuje.

### Mini kalendarz (podgląd docelowego wyboru daty)

To jednocześnie propozycja nowego wyboru daty dla całego panelu (dziś `<input type="date">`).

- Kontener `#FBFAF6`, `1px #DDD5C3`, radius `4px`, `padding: 12px`.
- Nagłówek: „Sierpień 2026” `700 / 14px`, nazwa obiektu mono `9.5px` uppercase `#716951`,
  legenda „ZAJĘTE” z próbką `10px` `#EFE9DA`.
- Nagłówki dni: mono `8.5px` uppercase, tydzień od poniedziałku, `SB`/`ND` w `#D9492B`.
- Komórka dnia: `height: 34px`, `1px #DDD5C3`, radius `3px`, mono `11.5px`;
  hover `border-color: #17150F; transform: scale(1.06)`; dziś ramka `#D9492B` + `600`;
  wybrany `#17150F` / `#FBFAF6`; **noc zajęta** tło `#EFE9DA` + pasek `2px` u dołu
  w kolorze obiektu; święto (15.08) tekst `#D9492B`; weekend `#524C3F`.
- Pod siatką jedna linia mono `10px #524C3F`:
  „24 sierpnia · poniedziałek — zajęte: Marek Zieliński, 4 noce, 1 240 zł” albo „— wolne”.
  Odmiana liczebnika przez istniejące `plural(n, ['noc','noce','nocy'])`.

### Rozsuwane menu (custom select)

Wzorzec dla filtra „Obiekt”, do przeniesienia na źródło rezerwacji, kategorię kosztu,
sortowanie i wybór roku (dziś `<select>` z tłem-strzałką w `.wpd-select`).

- Przycisk: `height: 38px`, `padding: 0 13px`, `#FBFAF6`, `1px #DDD5C3` (otwarty `#17150F`),
  radius `3px`; mono nadetykieta `9.5px` uppercase `#746C54` („OBIEKT”), kropka `7px`
  w kolorze wartości, wartość `600 / 13.5px`, szewron `13px` obracany o `180°` w `.24s`.
- Menu: `top: calc(100% + 6px)`, szerokość `262px`, `#FBFAF6`, **`1px #17150F`**, radius `4px`,
  `padding: 5px`, `z-index: 60`, `transform-origin: top left`,
  wejście `.24s cubic-bezier(.22,1,.36,1)` z `opacity 0 / scale(.94) / translateY(-6px)`.
- Pozycja: `padding: 9px 10px`, radius `3px`, kropka `8px` + nazwa `13.5px` + licznik mono
  `10.5px` `#716951`; hover `#EFE9DA`; wybrana ma tło `#EFE9DA` i cynobrowy ptaszek `13px`.
  Pozycje wjeżdżają kaskadowo: `translateX(-10px) → 0`, `.3s`, opóźnienie `indeks × 35 ms`.

---

## Interakcje i animacje

Wszystkie krzywe z identyfikacji: wejścia i ruch `cubic-bezier(.22,1,.36,1)`,
sprężyna `cubic-bezier(.34,1.56,.64,1)`, mikro-przejścia `.14–.18s`.

| Zdarzenie | Zachowanie |
|---|---|
| Wejście widoku | panel osi `.45s` od `opacity 0 / translateY(10px)`; kartki `.34s` od `opacity 0 / translateY(7px)` |
| Start przeciągania | `pointerdown` na kartce (ignoruj `[data-nodrag]`: checkbox, przycisk checklisty, podzadania). Klon kartki do warstwy `position: fixed`, `z-index: 910`, ramka `#17150F`, `pointer-events: none`; oryginał `opacity: .22`; `body { cursor: grabbing; user-select: none }` |
| Ciągnięcie | pętla `requestAnimationFrame`, **bez `setState`**. Pozycja doganiana z opóźnieniem: `s += (cel − s) × .26`. Przechył: `tilt = clamp(zaległość / 42, −1, 1) × dragTilt` (domyślnie `9°`), wygładzany `× .22`. Skala `1.035` |
| Podpowiedź celu | czarna plakietka (`#17150F`, mono `10.5px` uppercase, radius `3px`) `+16 / +18 px` od kursora: „25 SIE · WT → ANNA NOWAK” lub „→ DOMEK NAD JEZIOREM” |
| Wejście na pasek | `transform: scale(1.045)`, `outline: 1px solid #D9492B` z `outline-offset: 2px` |
| Wejście na wolny dzień | tło `#F6E5DF`, górna linia celu `2px` cynober `scaleX(0) → 1` w `.22s` |
| Upuszczenie na cel | klon leci do środka celu (`300 ms`, `scale(.72)`, `opacity .06`), cel odbija `scale(1.09)` sprężyną `.26s`; potem zapis i przerysowanie listy |
| Kartka po przypisaniu | remount z animacją wejścia + błysk `.95s`: tło `#F6E5DF → #FBFAF6`, ramka cynober → `#DDD5C3` |
| Upuszczenie w pustkę | klon wraca na pozycję wyjściową (`300 ms`) i gaśnie, oryginał odzyskuje `opacity` |
| Odhaczenie | ptaszek rysowany `stroke-dashoffset: 30 → 0` w `.42s`; przekreślenie `scaleX(0) → 1` w `.3s`; zadanie **zostaje na liście** (decyzja właściciela), licznik „Pozostało” przewija cyfry `.55s` |
| Zaległe | pasek priorytetu pulsuje: `1.8s ease-in-out infinite`, `opacity 1 → .45`, `scaleX(1) → 2.2` |
| Checklista | rozwinięcie z kaskadą: każda pozycja `.38s cubic-bezier(.34,1.56,.64,1)` od `translateX(-10px)`, opóźnienie `indeks × 55 ms` |
| Klik w pasek rezerwacji | popover „Szybkie zadanie” wjeżdża `.26s` od `scale(.96) / translateY(−10px)`, `transform-origin: top left` |
| Escape / klik w tło | zamyka popover i menu selecta |

**`prefers-reduced-motion: reduce`** (repo już ma taki blok w `styles.js` — dopisać nowe klasy):
bez przechyłu (`dragTilt = 0`), bez pulsowania, bez kaskad; przeciąganie zostaje (to funkcja),
ale doganianie ustawić na `.55` i skalę na `1.01`; wejścia kartek i popovera bez animacji.

**Dostępność i klawiatura.** Przeciąganie to droga myszkowa/dotykowa; potrzebna równoważna
ścieżka klawiaturowa — tak jak w kalendarzu panelu (`.wpd-cal__add`):
- w każdym wierszu osi przycisk `+` (widoczny na `:hover` i `:focus-visible`) otwierający
  szybkie zadanie dla tego obiektu/dnia;
- na kartce przycisk „Przypisz” (dostępny z klawiatury) otwierający ten sam popover;
- popover jako `role="dialog"` z istniejącym `useDialogA11y` (focus trap + Escape);
- po przypisaniu komunikat w `aria-live="polite"`: „Zadanie przypisane: Anna Nowak, 25 sierpnia”;
- pola dotykowe ≥ 40 px (konwencja z audytu poz. 5 — `::after { inset: −9px }`).

## Stan

Stan lokalny widoku:

| Zmienna | Typ | Rola |
|---|---|---|
| `filter` | `'all' \| propertyId` | filtr obiektu (custom select) |
| `open` | `{ [taskId]: boolean }` | rozwinięte checklisty |
| `quick` | `null \| { rentalId, propertyId, top, left, maxH }` | popover szybkiego zadania |
| `quickText / quickTime / quickPrio / quickDay` | string / string / enum / `'YYYY-MM-DD' \| null` | pola popovera |
| `calOpen`, `calHover` | boolean, number | mini kalendarz i podgląd zajętości |
| `selOpen` | boolean | menu selecta |

Stan przeciągania trzymany **poza Reactem** (`this.drag = { id, klon, plakietka, rect, offset, x, y, s, tilt, target }`),
żeby nie przerysowywać drzewa 60 razy na sekundę. Trafienie celu: `document.elementFromPoint`
→ `closest('[data-drop]')`; klon ma `pointer-events: none`. `setState` dopiero po upuszczeniu.

Dane wejściowe widoku: `rentals`, `settings.properties`, `settings.templates` (z kontekstu),
zadania z nowej kolekcji `tasks` (model w `IMPLEMENTACJA.md`).

## Tokeny

Wyłącznie paleta z `.wpd` w `src/pages/dashboard/styles.js` — nic nowego:

```
paper       #F3EFE5    surface     #FBFAF6    ink        #17150F
cynober     #D9492B    hover       #C23E22    green      #2F6B53
granat      #234B7A    amber       #C99A2E    green-dot  #5FB389
hairline    #DDD5C3    inner       #EFE9DA    inner-2    #E0D8C6
tint-cynober#F6E5DF    tint-green  #E7EDE7    tint-amber #FBF1D9
muted       #524C3F    faint       #716951    label      #746C54
amber-ink   #7E6119    side-2      #221F17    side-active#2C2920
on-side     #E4DDCE    on-side-faint #8C8576  on-side-label #6B6555
```

Jedna wartość spoza listy: `#F7F3E9` — tło weekendowej wolnej komórki na osi
(o pół tonu ciemniejsze od `--surface`). Można zastąpić `color-mix(in srgb, var(--inner) 45%, var(--surface))`.

Kolory obiektów: `PROP_HEX` z `styles.js`. Kolory kanałów: `channelColor` / `channelTone`.

Typografia: `Schibsted Grotesk` (UI), `Newsreader italic` (notatki, stany puste),
`IBM Plex Mono` (etykiety, liczby, daty). Skala użyta w module:
`33 / 25 / 22 / 18 / 17 / 15.5 / 14.5 / 14 / 13.5 / 13 / 12.5 / 12 / 11.5 / 11 / 10.5 / 10 / 9.5 / 9 px`.

Promienie: `2px` (kropki, wewnętrzne kwadraty), `3px` (kontrolki, chipy, paski),
`4px` (panele, kartki). Cienie: **żadnych**. Gradienty: **żadnych**.

Odstępy: `2 / 3 / 6 / 8 / 9 / 11 / 12 / 13 / 14 / 16 / 18 / 20 / 22 / 26 px`.

## Responsywność

- **≥ 1240 px** — układ docelowy jak w prototypie.
- **980–1240 px** — kolumny listy i skrzynki zawijają się same (`flex-wrap`), oś bez zmian.
- **< 980 px** (w repo tu znika sidebar i wchodzi `.wpd-bottombar`) — do zaprojektowania,
  wytyczne: oś przewijana poziomo (`overflow-x: auto`, `min-width: 720px` jak `.wpd-cal__inner`),
  skrzynka nad listą jako poziomy pasek kartek, popover jako arkusz od dołu (`.wpd-sheet`,
  animacja `wpd-sheet-in`), przypisywanie przez długie przytrzymanie kartki (`touch-action: none`
  już jest) albo przez przycisk „Przypisz” → arkusz z osią. Widget `.wpd-taskwidget` zostaje
  nad dolnym paskiem (`bottom: 86px`).

## Aktywa

Brak grafik. Wszystkie ikony to `lucide-react` (`stroke-width: 1.75`, zgodnie z regułą
`.wpd svg` w `styles.js`): `Bell`, `CalendarClock`, `CheckCircle`, `ClipboardList`, `Clock`,
`Camera`, `RefreshCw`, `ListChecks`, `GripVertical`, `ChevronDown`, `Plus`, `X`, `Search`,
`TrendingUp`, `Inbox`. W prototypie są to ręcznie rysowane ścieżki SVG o tej samej geometrii —
w produkcji użyć `lucide-react`, nie kopiować ścieżek.

## Pliki

```
design_handoff_zadania/
├── README.md              ← ten plik (specyfikacja)
├── IMPLEMENTACJA.md       ← plan wdrożenia w repo WynajemPRO
├── PROMPT.md              ← prompt startowy dla Claude Code
├── tokens-zadania.css     ← blok CSS `.wpd-task*` do wklejenia w styles.js
└── prototyp/
    ├── Zadania.dc.html    ← referencyjny prototyp (otwiera się w przeglądarce)
    └── support.js         ← runtime prototypu
```

Pliki repozytorium, do których odnosi się specyfikacja, wypisane są w `IMPLEMENTACJA.md`.
