# Bramka publikacji dokumentów — co dokładnie zostało

**Data:** 2026-08-26 · **Stan:** 0 placeholderów; zostają bramki wykonawcze — deploy F4 (kod gotowy) i F4a przy publikacji · **Autor:** agent (na podstawie
plików w `docs/legal/`, kodu aplikacji i konfiguracji projektu)

> Ten dokument nie jest opinią prawną. Jest listą tego, czego w dokumentach fizycznie nie ma,
> z podziałem na to, kto może każdą lukę zamknąć. Danych nikt tu nie zmyśla — puste pole
> zostaje puste, dopóki nie poda go właściciel, księgowy albo prawnik.

---

## 1. Korekta liczby, od której trzeba zacząć

Roadmapa i `CLAUDE.md` mówią o **36 placeholderach**. Ta liczba jest zaniżona, bo liczy
**wiersze** zawierające napis „DO UZUPEŁNIENIA", a nie same luki: w jednym wierszu bywają dwie,
a warianty `[DO DECYZJI]` i `[DO POTWIERDZENIA]` nie były liczone w ogóle.

| Stan | Regulamin | Polityka | DPA | Razem |
|---|---|---|---|---|
| Przed 2026-08-26 | 19 | 18 | 10 | **47** |
| Po naniesieniu B3/B4 i e-maila | 16 | 17 | 10 | **43** |
| Po podaniu tożsamości Operatora (tego samego dnia) | 12 | 14 | 9 | **35** |
| Po zatwierdzeniu 11 decyzji grupy B (tego samego dnia) | 7 | 9 | 5 | **21** |
| Po analizie prawnej grup D i E (tego samego dnia, ADR-025) | 3 | 0 | 0 | **3** |
| Po decyzjach wieczornych (founding wariant 2, Anthropic poza DPA) | 2 | 0 | 0 | **2** |
| Po brzmieniach VAT/faktur z analizy podatkowej (noc) | 0 | 0 | 0 | **0** |

Cztery luki zamknęło potwierdzenie adresu `kontakt@wynajempro.com`, kolejne osiem — podanie
przez właściciela imienia, nazwiska i adresu do korespondencji (tego samego dnia, po południu).
Grupę B (11 decyzji) właściciel zatwierdził w całości po propozycjach — naniesione tego samego
dnia. Pozostałe **21 luk** rozkłada się tak: 2 właściciel (data naboru founding members — patrz
sekcja 8.3 — i załącznik ze wzorem odstąpienia), 3 księgowy (sekcja 5), 9 prawnik (sekcja 6),
6 ustalenia u źródła (sekcja 7); pozycje E-2/E-3 występują w Polityce i DPA naraz, stąd suma
wystąpień przewyższa liczbę spraw.

---

## 2. Co zmieniło się dzisiaj

**Wiersze dopisane do Polityki §2** (zaległe B3 i B4 — funkcje działają na produkcji od
2026-08-19, a Polityka o nich milczała):

- **Dziennik dostępu administracyjnego** (`admin_audit`) — nowy wiersz: zakres, cel, podstawa
  (art. 6 ust. 1 lit. f), okres 12 miesięcy. Zakres spisany z kodu, nie z projektu w ocenie:
  dziennik **nie zapisuje adresu e-mail**, sam UID — czyli jest węższy, niż zakładał projekt
  wiersza z 19.08.
- **Pola obsługi zgłoszenia** dopisane do wiersza `contact_messages`: status (nowe / w toku /
  zamknięte), notatka Operatora do 5000 znaków, data zmiany i identyfikator osoby działającej.
- **Sekcja 6** dostała zdanie, którego brakowało: usunięcie Konta **nie kasuje** wpisów
  w dzienniku — zostaje UID, rodzaj czynności i data. Bez tego Polityka obiecywała pełne
  usunięcie, którego mechanizm nie realizuje.

**Naprawiony martwy kanał kontaktu.** Adres `kontakt@wynajempro.pl` był podany w czterech
miejscach produktu, a domena `wynajempro.pl` **nie rozwiązuje się u żadnego z trzech
sprawdzonych resolwerów** (lokalny, 8.8.8.8, 1.1.1.1 — SERVFAIL, brak rekordów MX). Poczta pod
ten adres nie dochodziła. Podmienione na `kontakt@wynajempro.com` (domena ma pocztę na iCloud,
potwierdzone rekordami MX i przez właściciela):

- strona `/kontakt` — adres publiczny oraz komunikat awaryjny „nie udało się wysłać, napisz
  na…", czyli kanał zapasowy prowadził w próżnię akurat wtedy, gdy był potrzebny;
- centrum pomocy `/pomoc` — dwa artykuły (przez regenerację z `docs/support/`);
- artykuł pomocy kazał logować się „na wynajempro.pl" — też poprawione.

To była zarazem ścieżka realizacji praw z RODO (art. 15–22) i jedyne obejście usuwania konta
dla użytkowników logujących się przez Google.

---

## 3. Grupa A — ✅ ZAMKNIĘTA 2026-08-26

Właściciel podał komplet danych tego samego dnia, w którym powstał ten inwentarz:

| Dana | Wartość | Naniesione |
|---|---|---|
| Imię i nazwisko | **Szymon Wasiak** | Regulamin §1, Polityka §1 i §12, DPA §strony — plus przy każdym adresie korespondencyjnym |
| Adres do korespondencji | **Nowogródzka 9/9, 82-300 Elbląg** | Regulamin §1, §7 (odstąpienie), §8 (reklamacje), §14; Polityka §1, §12; DPA |
| E-mail kontaktowy | **kontakt@wynajempro.com** | wszystkie miejsca kontaktowe (naniesiony rano) |

Pola firmowe (NIP, REGON, KRS) oznaczone w dokumentach jako **nie mające zastosowania** —
Operatorem jest osoba fizyczna na działalności nierejestrowanej (decyzja 2026-08-17).
PESEL zgodnie z zasadą nie trafił do żadnego dokumentu.

⚠️ Adres jest publiczny — pod niego konsument wysyła odstąpienie od umowy i reklamację,
więc korespondencję spod tego adresu trzeba realnie odbierać.

---

## 4. Grupa B — ✅ ZAMKNIĘTA 2026-08-26

Właściciel zatwierdził **wszystkie 11 decyzji po propozycjach** — naniesione tego samego dnia.
⚠️ **Konsekwencja B-5 wymagająca kodu:** Polityka deklaruje teraz 12 miesięcy retencji dla
`contact_messages`, a **mechanizmu kasowania nie ma** (w `functions/` czyszczony jest tylko
`admin_audit`). Deklaracja bez mechanizmu to wzorzec, który projekt już dwa razy naprawiał —
purge musi powstać **przed publikacją Polityki** (Roadmapa: F7).
**Aktualizacja tego samego dnia — ✅ WARUNEK ZSZEDŁ:** purge **wydany na produkcję**
za zgodą właściciela (commit `85bcb47` w `main`, `firebase deploy --only functions`;
scheduler `cleanupContactMessages`, codziennie 03:45, reguła: 12 mies. od
`max(createdAt, adminUpdatedAt)`). Bramki przed wydaniem: testy 41/41, e2e 204/204,
przegląd `code-reviewer`. Deklaracja Polityki §2 ma od dziś działający mechanizm —
F7 przestało blokować publikację (szczegóły: Activity-Log 2026-08-26).

| # | Luka | Gdzie | Rozstrzygnięcie (wszystkie ✅ zatwierdzone 2026-08-26) |
|---|---|---|---|
| B-1 | Numer wersji i data wejścia w życie | Regulamin nagłówek, Polityka nagłówek | **1.0** + data publikacji (wpisać w dniu wydania) |
| B-2 | Kanał informowania o zmianach Regulaminu i termin | Regulamin §10 | **e-mail + komunikat w panelu, 14 dni** wyprzedzenia |
| B-3 | Kanał informowania o zmianach Polityki | Polityka §11 | jak wyżej |
| B-4 | Czy powołano Inspektora Ochrony Danych | Polityka §1 | **nie powołano** — sekcja do usunięcia; przy tej skali IOD zwykle nie jest obowiązkowy |
| B-5 | Okres przechowywania zgłoszeń z formularza | Polityka §2 | **12 miesięcy** od zakończenia korespondencji (to decyzja **B1** z Roadmapy) |
| B-6 | Okres przechowywania dziennika dostępu | Polityka §2 | **12 miesięcy** — już wdrożone w kodzie i kasuje codziennie; wariant 24 mies., jeśli dziennik ma służyć obronie przed roszczeniami |
| B-7 | Moment związania umową powierzenia (DPA) | DPA §12 | **akceptacja Regulaminu przy rejestracji** — checkbox istnieje i blokuje rejestrację bez zaznaczenia (`LoginPanel.jsx:150`). ⚠️ Zastrzeżenie w sekcji 8 niżej |
| B-8 | Kanał zgłaszania naruszeń przez Operatora do Gospodarza | DPA §10 | **e-mail przypisany do Konta** |
| B-9 | Kanał i termin informowania o zmianie subprocesorów | DPA §7 | **e-mail lub komunikat w panelu, 14 dni** wyprzedzenia |
| B-10 | Tryb realizacji prawa do audytu | DPA §8 | udostępnienie dokumentacji i raportów dostawców; inspekcja na miejscu **wyłączona** przy współdzielonej infrastrukturze — do potwierdzenia przez prawnika |
| B-11 | Sposób udostępniania faktur / potwierdzeń płatności | Regulamin §6 | Stripe wysyła potwierdzenia mailem — ale to zależy od decyzji o VAT (grupa C) |

---

## 5. Grupa C — wymaga księgowego, nie prawnika i nie agenta

Trzy luki, jedna rozmowa.

| # | Luka | Gdzie |
|---|---|---|
| C-1 | Czy 29,99 zł to kwota **brutto z VAT**; stawka VAT albo podstawa zwolnienia | Regulamin §6 |
| C-2 | Czy i jak Operator wystawia faktury VAT | Regulamin §6 |
| C-3 | Okres przechowywania dokumentów księgowych (zwykle 5 lat — do potwierdzenia dla działalności nierejestrowanej) | Polityka §2 |

⚖️ To realnie wiąże się z formą działalności: przy nierejestrowanej odpowiedzi bywają inne niż
przy JDG. Bez tych trzech danych Regulamin obiecuje cenę, nie mówiąc, co się w niej mieści.

---

## 6. Grupa D — ✅ ZAMKNIĘTA 2026-08-26 analizą własną (ADR-025)

Właściciel zrezygnował z powrotu do prawnika. Wszystkie 9 pytań rozstrzygnięte w
`Analiza-prawna-2026-08-26.md` — tam źródła, daty odczytu i poziomy pewności.
Aktualizacja wieczorna 2026-08-26: **Anthropic wykreślony z DPA** (decyzja właściciela), poziom 3 supportu działa do końca bety — jego zniesienie to bramka publikacji **F4a**. Plan Anthropic warunkuje już tylko wpis w Polityce §5. Data naboru founding members zastąpiona konstrukcją zdarzeniową (wariant 2) — §8.3 nieaktualne.

| # | Luka | Gdzie |
|---|---|---|
| D-1 | Status platformy ODR (wygaszona) — jakie informacje o pozasądowym rozwiązywaniu sporów są dziś obowiązkowe | Regulamin §9 |
| D-2 | Stan praw do znaku „WynajemPRO" — czy zarejestrowany znak towarowy | Regulamin §13 |
| D-3 | Punkt do potwierdzenia w postanowieniach końcowych | Regulamin §14 |
| D-4 | Czy Stripe jest subprocesorem **danych powierzonych** (Gości), czy tylko danych relacji Operator↔Gospodarz | DPA §7 |
| D-5 | Czy dostawca modelu językowego jest subprocesorem danych powierzonych; który podmiot kontraktuje | DPA §7, Polityka §5 |
| D-6 | Ograniczenia odpowiedzialności między przedsiębiorcami | DPA §11 |
| D-7 | Podstawa dla dziennika dostępu: art. 6 ust. 1 lit. f czy lit. c | Polityka §2 (**nowe, z dzisiaj**) |
| D-8 | Czy zachowanie wpisu w dzienniku mimo żądania usunięcia broni się na art. 17 ust. 3 lit. e | Polityka §6 (**nowe, z dzisiaj**) |
| D-9 | Mechanizmy legalizujące transfer poza EOG — wskazanie wprost | Polityka §5 |

---

## 7. Grupa E — ✅ ZAMKNIĘTA 2026-08-26 (ustalone u źródła)

Wyniki w `Analiza-prawna-2026-08-26.md` część E: region **eur3** (UE) dla Firestore/Storage przy funkcjach w us-central1; Stripe — DPF+SCC; Anthropic — Anthropic Ireland, SCC (warunkowo); lista subprocesorów prowadzona w Polityce §5; logi do 30/400 dni; GA nie dłużej niż 14 miesięcy.

| # | Luka | Gdzie sprawdzić |
|---|---|---|
| E-1 | Region Firestore/Storage projektu `moje-domki-6c77d` + mechanizm transferu | Firebase Console |
| E-2 | SCC / DPF wg DPA Stripe | umowa powierzenia Stripe |
| E-3 | Podmiot kontraktujący dostawcy modelu językowego + mechanizm transferu | umowa powierzenia |
| E-4 | Link do listy subprocesorów albo zobowiązanie do jej aktualizacji | decyzja + Polityka §5 |
| E-5 | Okres retencji logów technicznych Firebase | Firebase Console |
| E-6 | Okres retencji danych Google Analytics | GA Console |

---

## 8. Znaleziska, które nie są placeholderami — a blokują publikację tak samo

### 8.1. Dokumenty na produkcji to **inne dokumenty** niż te zatwierdzone przez prawnika

To najważniejsze ustalenie z dzisiaj i nie wynika z żadnego placeholdera.

| | W `docs/legal/` (ocenione przez prawnika) | Na produkcji |
|---|---|---|
| Regulamin | 146 wierszy, 14 paragrafów | `TermsPage.jsx` — 77 wierszy, treść pisana ręcznie |
| Polityka | 216 wierszy, 12 sekcji | `PrivacyPage.jsx` — 81 wierszy, treść pisana ręcznie |
| DPA | 221 wierszy | **brak strony w aplikacji** |

Strony `/regulamin` i `/prywatnosc` mają własną, starszą treść i **nie czytają** z `docs/legal/`.
Skutki dziś na żywo:

- `/prywatnosc` §1 mówi, że administratorem jest „operator aplikacji", i odsyła po dane do
  `/kontakt` — czyli **tożsamości administratora nie ma nigdzie**, mimo art. 13 RODO;
- **DPA nie jest nigdzie opublikowane**, a Regulamin §1 ust. 6 odsyła do niego jako do pliku
  `DPA-powierzenie.md`. Po publikacji ta referencja musi być adresem strony, nie nazwą pliku;
- wypełnienie 43 luk **nie zmieni tego, co widzi klient**, dopóki strony nie zostaną
  przepisane. To osobna praca dla `dev`, nieujęta dotąd w Roadmapie jako pozycja.

### 8.2. Checkbox przy rejestracji nie obejmuje DPA

Rejestracja wymaga akceptacji **regulaminu i polityki prywatności** (`LoginPanel.jsx:510`) —
DPA nie jest tam wymienione ani podlinkowane. Jeśli DPA ma wiązać „z chwilą akceptacji
Regulaminu" (propozycja B-7), to Regulamin musi je włączać do treści umowy wprost, a link
powinien być przy checkboksie. **Pytanie do prawnika, nie decyzja agenta.**

### 8.3. Węzeł: data zakończenia naboru founding members

Regulamin §6 ust. 5 czeka na jedną daną — datę zakończenia naboru, „ustalaną w dniu uruchomienia
płatnej sprzedaży". Płatna sprzedaż to ścieżka A, wstrzymana do zakończenia testów. Testerzy
czekają na zaproszenia, a zaproszenia — na domknięty §6. **Pętla nie rozwiąże się sama.**

Dwa wyjścia, oba do decyzji właściciela:
1. **Data widełkowa teraz** — np. „nie później niż 31.12.2026". Zamyka lukę, kosztem
   zobowiązania się do terminu przed uruchomieniem sprzedaży.
2. **Warunek zdarzeniowy zamiast daty** — np. „pierwszych N gospodarzy, którzy rozpoczną
   subskrypcję". Wymaga przeredagowania ustępu i ponownego rzutu oka prawnika, bo zmienia
   konstrukcję oferty.

Mogę przygotować oba brzmienia do wyboru.

---

## 9. Kolejność, gdyby robić to najkrócej

1. ~~**Imię, nazwisko, adres** (grupa A)~~ — ✅ zamknięte 2026-08-26.
2. ~~**Jedno „tak" do grupy B**~~ — ✅ zatwierdzone i naniesione 2026-08-26.
3. **Rozmowa z księgowym** (grupa C, 3 luki) — równolegle, bo nie blokuje punktów 1–2.
4. **Przepisanie stron `/regulamin`, `/prywatnosc` i dodanie `/dpa`** (8.1) — praca dla `dev`,
   może iść równolegle z 1–3, bo to przeniesienie treści, nie jej ustalanie.
5. **Grupa E** — sprawdzam u źródła, gdy poprzednie ruszą.
6. **Grupa D + 8.2 + 8.3** — jeden zbiorczy zestaw pytań do prawnika, zamiast trzech osobnych.

---

**Related:** [[legal/Regulamin]] · [[legal/Polityka-prywatnosci]] · [[legal/DPA-powierzenie]] ·
[[legal/Checklista-zgodnosci]] · [[Projects/Roadmap]] · [[Projects/Zlecenia-wlasciciela]]
