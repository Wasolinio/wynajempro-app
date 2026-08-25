# Brief projektowy — panel podatkowy WynajemPRO (X25)

> **Dla kogo ten dokument.** Do przekazania projektantowi (Claude Design). Opisuje, **co ten
> panel ma robić i jakimi danymi dysponuje** — nie opisuje, jak ma wyglądać. Układ, hierarchia,
> typografia i mikrocopy to zakres projektu.
>
> **Stan prac:** logika jest gotowa i przetestowana (`src/utils/taxSummary.js`). Istnieje też
> `src/pages/dashboard/views/TaxesView.jsx` — **widok tymczasowy**, napisany wyłącznie po to,
> żeby zobaczyć dane na ekranie. Projekt go zastępuje w całości.

---

## 1. Po co ten panel istnieje

Gospodarz wynajmuje jeden do kilku obiektów obok pracy. Rozliczenia robi raz w miesiącu albo
raz na kwartał, zwykle w pośpiechu, często z księgową, do której dzwoni.

Panel ma odpowiedzieć na **jedno pytanie**: *ile odłożyć, żeby nie zabrakło*. Wszystko poza tym
jest dodatkiem.

Skąd się wziął: pierwszy tester spojrzał na moduł podatkowy i napisał, że jest niewystarczający.
Miał rację dosłownie — widok istniał, został usunięty przy porządkach w repozytorium i nigdy nie
dostał zastępnika. Silnik liczył podatki po cichu, do bazy, bez żadnego ekranu.

## 2. Gdzie mieszka

Czwarta podzakładka w module **Finanse**, obok istniejących: `Przegląd · Koszty i opłaty ·
**Podatki** · Raporty`. Zakładki są już zaimplementowane, panel wchodzi w gotową ramę.

## 3. Dwa tryby

Właściciel rozstrzygnął, że nie wybieramy typu gospodarza — obsługujemy oba.

**Tryb „Podsumowanie"** (domyślny dla ryczałtu i działalności nierejestrowanej)
Jedno pytanie: ile odłożyć. Bez żargonu, bez tabel, bez terminów urzędowych.

**Tryb „Szczegóły dla księgowego"** (domyślny dla zasad ogólnych i liniowego)
Rozbicie kwot, rozkład miesięczny, materiał do rozmowy z księgową.

**Przełącznik ma być w dwóch miejscach:** w samym panelu (bo gospodarz przełącza się w chwili,
gdy faktycznie potrzebuje szczegółów — zwykle przy terminie płatności) oraz w Ustawieniach konta
(bo tam szuka trwałych preferencji). Wybór zapisuje się i jest odwracalny jednym kliknięciem.

⚠️ **Świadomie NIE pytamy o tryb przy pierwszym uruchomieniu.** W tamtym momencie gospodarz nie
widział żadnego z trybów, więc nie ma jak wybrać, a każdy dodatkowy ekran kosztuje aktywację.
Tryb domyślny wynika z formy opodatkowania, którą i tak podaje.

---

## 4. Dane, którymi dysponuje projekt

Wszystkie liczby są w złotych, jako liczby (nie napisy). Formatowanie należy do projektu.

### Podsumowanie roczne

| Pole | Znaczenie | Uwagi dla projektu |
|---|---|---|
| `rok` | rok, którego dotyczy zestawienie | gospodarz może przełączać lata |
| `rokStawek` | rok, z którego pochodzą stawki | zwykle równy `rok` |
| `stawkiAktualne` | czy `rokStawek === rok` | **gdy `false` — trzeba ostrzec**, patrz §5 |
| `forma` | `lump_sum` / `general` | steruje tym, co ma sens pokazać (liniowy i nierejestrowana usunięte 2026-08-25, ADR-020) |
| `brutto` | przychód brutto ze wszystkich rezerwacji | |
| `vatNalezny` | VAT należny (8% od noclegów) | **zero, gdy gospodarz nie jest płatnikiem VAT** — wtedy nie pokazywać wiersza |
| `przychod` | brutto minus VAT należny | to jest „przychód" w rozumieniu podatku |
| `prowizje` | suma prowizji portali | ⚠️ przy ryczałcie **nie** pomniejsza podatku |
| `media` | suma kosztów eksploatacyjnych | jw. |
| `podstawa` | podstawa opodatkowania | |
| `podatek` | podatek dochodowy za rok | |
| `zdrowotnaMies` | składka zdrowotna miesięcznie | przy ryczałcie **liczona automatycznie** z progu przychodu |
| `zdrowotnaRok` | zdrowotna narastająco | |
| `spoleczneRok` | składki społeczne narastająco | **często 0** (np. przy zbiegu z etatem) |
| `miesiecy` | ile miesięcy roku już minęło | do zdania „× N miesięcy" |
| `lacznieDoZaplaty` | podatek + zdrowotna + społeczne | **to jest liczba główna panelu** |
| `prog` | 100 000 zł | próg ryczałtu |
| `doProgu` | ile zostało do progu | |
| `procentProgu` | 0–100 | gotowe pod pasek postępu |
| `progPrzekroczony` | boolean | |
| `rozjazd` | `null` albo `{ wyliczony, zapisany, rezerwacji }` | patrz §5 |
| `liczbaRezerwacji` | ile rezerwacji weszło do wyliczenia | |

### Rozkład miesięczny

Tablica 12 pozycji: `{ miesiac (0–11), brutto, przychod, prowizje, media, rezerwacje }`.
Miesiące bez żadnego ruchu można pominąć — decyzja projektowa.

---

## 5. Stany, które projekt musi obsłużyć

**Pusto.** Rok bez rezerwacji. Nie pokazujemy zer — pokazujemy, co zrobić, żeby coś się pojawiło.

**Przed progiem / po progu.** Do 100 000 zł stawka 8,5%, powyżej 12,5% od nadwyżki. To jedna
z niewielu rzeczy, które gospodarz naprawdę chce widzieć z wyprzedzeniem — zbliżanie się do progu
zmienia jego decyzje cenowe pod koniec sezonu.

**Stawki z innego roku** (`stawkiAktualne === false`). Kwoty podatkowe zmieniają się co roku.
Gdy dane są liczone starymi stawkami, **trzeba to powiedzieć wprost** — inaczej wyliczenie
dalej wygląda poprawnie, tylko jest nieprawdziwe. To ostrzeżenie o wysokiej wadze.

**Rozjazd** (`rozjazd !== null`). Kwoty wpisane ręcznie przy pojedynczych rezerwacjach nie
zgadzają się z wyliczeniem z bieżących ustawień — najczęściej dlatego, że gospodarz zmienił formę
opodatkowania w trakcie roku. Trzeba pokazać obie liczby i powiedzieć, która jest wiążąca.

**Brak składek społecznych.** Bardzo częste (zbieg z etatem). Wtedy `spoleczneRok === 0` i wiersz
nie powinien straszyć zerem.

**Forma inna niż ryczałt.** Przy zasadach ogólnych i liniowym **nie ma progu 100 000 zł** i nie ma
automatycznej zdrowotnej — te elementy znikają, a nie pokazują się puste.

---

## 6. Ograniczenia, których nie wolno naruszyć

### Prawne — najważniejsze

To zestawienie jest **szacunkiem dla gospodarza i jego księgowego, nie deklaracją podatkową
ani poradą**. Musi to być widoczne, ale nie może dominować ekranu ani straszyć przy każdej liczbie.
Jedno miejsce, czytelne, na końcu.

⚠️ **Czego nie wolno zasugerować:** że przy ryczałcie koszty i prowizje obniżają podatek.
Nie obniżają. Pokazujemy je, bo gospodarz chce wiedzieć, ile zjadły — ale układ nie może
sugerować odejmowania. To jest realne ryzyko wprowadzenia w błąd.

### Marki

- **Zero emoji.** Markery i ikony wyłącznie liniowe z zestawu `lucide`.
- Identyfikacja v2, przestrzeń nazw `.wpd-*`. Tokeny: atrament `#17150F`, papier `#F3EFE5`,
  cynober `#D9492B` (akcent i pilne), bursztyn `#C99A2E` (uwaga), zieleń `#2F6B53`.
- Kroje: Schibsted Grotesk (tekst), Newsreader (kursywa ozdobna), IBM Plex Mono (liczby, etykiety).
- **Liczby tabelaryczne** monospace'em — kwoty muszą się zgadzać w kolumnie.

### Językowe

- Zwracamy się na „Ty", rzeczowo i spokojnie.
- Bez nowomowy urzędowej i bez marketingowej. Nie „kompleksowe rozliczenie", tylko „ile odłożyć".
- Bez reguły trzech („szybko, wygodnie i bezpiecznie") — to sygnał tekstu pisanego maszynowo.
- Terminy urzędowe tylko tam, gdzie gospodarz i tak ich potrzebuje, żeby porozmawiać z księgową.

### Techniczne

- Panel działa w istniejącej ramie zakładek Finansów, do wykorzystania klasy `.wpd-*`
  (m.in. `wpd-panel`, `wpd-stat`, `wpd-stats`, `wpd-seg`, `wpd-settle__row`, `wpd-table`,
  `wpd-note`, `wpd-bar`, `wpd-empty`, `wpd-mono`).
- **Responsywność obowiązkowa**, łącznie z 375 px. Tabele przewijają się w swoim kontenerze,
  strona nie przewija się w poziomie.
- Motyw jasny; tokeny w `src/pages/dashboard/styles.js`.

---

## 7. Czego ten panel jeszcze NIE robi

Świadomie poza zakresem tej tury, żeby nie projektować pod funkcje, których nie ma:

- ~~**Mikrorachunek podatkowy i tytuły przelewów**~~ — **skreślone 2026-08-25** ([[Decisions]] ADR-022). Nie wrócą, dopóki nikt się o nie nie upomni.
- **VAT-UE / import usług od prowizji portali** — to realny obowiązek wielu gospodarzy i najbardziej
  wartościowa brakująca funkcja, ale wymaga przejścia przez analizę prawną, zanim wejdzie do kodu.
- **Eksport CSV dla księgowego** — planowany, jeszcze nieistniejący.

Projekt może zostawić na nie miejsce, ale nie powinien ich rysować jako gotowych.

---

## 8. Czego oczekujemy od projektu

1. Układ obu trybów, z jasną hierarchią — co gospodarz ma zobaczyć w pierwszej sekundzie.
2. Sposób pokazania progu 100 000 zł, żeby czytał się z odległości.
3. Rozwiązanie przełącznika trybów, spójne z resztą panelu.
4. Wygląd czterech stanów wyjątkowych z §5 (pusto, stare stawki, rozjazd, brak składek).
5. Widok na 375 px, nie tylko na desktopie.
6. Mikrocopy tam, gdzie układ tego wymaga — z zastrzeżeniem, że treści prawne uzgadniamy osobno.
