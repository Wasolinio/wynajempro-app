# Formy opodatkowania wynajmu krótkoterminowego — przegląd pod rozbudowę panelu (2026-08-28)

**Autor:** agent `legal` · **Data weryfikacji stanu prawnego: 2026-08-28** · Stan prawny: 2026

> ⚖️ **To nie jest porada prawna ani podatkowa.** To analiza compliance przygotowana przez
> analityka-agenta na potrzeby decyzji produktowych WynajemPRO. Przed oparciem na niej
> komunikatów w aplikacji o wysokiej stawce (zwłaszcza treści dotyczących obowiązków
> podatkowych użytkowników) ustalenia powinien zweryfikować doradca podatkowy lub prawnik.
> Teksty przepisów czytane były w serwisach publikujących ustawy (arslege — stan
> Dz.U.2025.0.775) i w źródłach oficjalnych (podatki.gov.pl, biznes.gov.pl); przy wdrażaniu
> warto potwierdzić brzmienie w ISAP.

**Zasada nadrzędna** (z §2 analizy prawnej panelu, [[Analiza-panel-podatkowy-2026-08-24]]):
panel **nie kwalifikuje sytuacji podatkowej użytkownika** — mówi, co liczy, czego nie liczy
i dlaczego, a rozstrzygnięcia zostawia gospodarzowi i jego księgowemu. Każda rekomendacja
niżej jest z tą zasadą zgodna.

---

## ⚠️ Korekta na wejściu: limit zwolnienia z VAT to 240 000 zł, nie 200 000 zł

Zadanie sformułowano wokół progu 200 000 zł. **Od 1 stycznia 2026 r. limit z art. 113
ust. 1 ustawy o VAT wynosi 240 000 zł** — podniesiony ustawą z 24 czerwca 2025 r.
(Dz.U. 2025 poz. 896). Przepis przejściowy: podatnik, którego sprzedaż w 2025 r.
przekroczyła 200 000 zł, ale nie 240 000 zł, mógł korzystać ze zwolnienia od 1.01.2026
(po aktualizacji VAT-R). Rejestr stawek projektu miał już poprawną wartość
([[Rejestr-stawek-podatkowych]], weryfikacja 2026-08-25); dzisiejsza weryfikacja
potwierdza ją w źródłach oficjalnych. **Wszystkie parametry wdrożeniowe niżej używają
240 000 zł.** Kwota jest roczna i zmienna ustawowo — wchodzi do rejestru stawek
z rytmem weryfikacji do 31 stycznia.

---

## Tabela ustaleń

| # | Obszar / forma | Stan obecny w panelu | Ryzyko | Priorytet | Rekomendacja | Podstawa prawna |
|---|---|---|---|---|---|---|
| 1 | Najem prywatny na ryczałcie (w tym warianty małżeńskie) | Wspierany w pełni (ADR-018, ADR-021) | Niskie; otwarte Q5 (przekwalifikowanie na DG) — panel słusznie pyta, nie orzeka | 🟢 | Bez zmian | art. 6 ust. 1a, art. 12 ust. 1 pkt 4 lit. a, ust. 5–7 i 13 ustawy o ryczałcie; art. 9a ust. 6 PIT |
| 2 | DG na ryczałcie (PKWiU 55) | Wspierana w pełni, zdrowotna progowa + odliczenie 50% | Niskie | 🟢 | Bez zmian | art. 6 ust. 1, art. 11 ust. 1a i 3, art. 12 ust. 1 pkt 4 lit. c ustawy o ryczałcie; art. 81 ust. 2e–2f ustawy zdrowotnej |
| 3 | DG na skali | Częściowo: podatek liczony, zdrowotna ręczna, koszty tylko z aplikacji | Średnie: gospodarz może wziąć podstawę „z aplikacji" za pełną | 🟡 | Nie budować automatu zdrowotnej; dopisać w UI/eksporcie, czego nie liczymy (wzorzec ADR-023) | art. 27 ust. 1 PIT; art. 81 ust. 2 ustawy zdrowotnej (9% dochodu, min. 432,54 zł/mies w 2026) |
| 4 | DG na liniowym 19% | Świadomie bez liczby (ADR-020) | Niskie (jawny brak, nie błędna liczba) | 🟡 Later | Nie budować przed betą; pierwszy kandydat rozbudowy przy sygnale popytu — silnik skali już liczy dochód | art. 30c ust. 1 PIT; zdrowotna 4,9% dochodu, limit odliczenia 14 100 zł (2026) |
| 5 | Działalność nierejestrowana | Usunięta (ADR-020) | Zerowe (nie oferujemy) | 🟢 zamknięte | **Świadomie poza zakresem** — potwierdzam ADR-020; limit kwartalny 10 813,50 zł czyni formę praktycznie bezużyteczną dla ICP, a kwalifikacja jest sporna | art. 5 ust. 1 Prawa przedsiębiorców (od 2026 limit kwartalny 225% min. wynagrodzenia); art. 20 ust. 1ba PIT |
| 6 | Karta podatkowa | Nieznana panelowi (brak liczby) | Zerowe | 🟢 zamknięte | **Świadomie poza zakresem** — od 2022 niedostępna dla nowych; u kontynuujących kwota wynika z decyzji US, nie ma czego liczyć | art. 65 ust. 1 ustawy z 29.10.2021 (Polski Ład) |
| 7 | Spółki (z o.o., cywilna, jawna) | Poza modelem (konto = jeden podatnik-osoba fizyczna) | Zerowe dla ICP | 🟢 odnotowane | Poza ICP; nie budować | CIT (z o.o.); art. 6 ust. 1 ustawy o ryczałcie i art. 8 PIT (spółki transparentne) |
| 8 | VAT: zwolnienie podmiotowe | **Próg 240 000 zł niepilnowany** (luka nr 1 z prześwietlenia 2026-08-28) | Średnie: gospodarz bez sygnału wjeżdża w obowiązki VAT | 🟡 **rekomendowane przed betą** | Wdrożyć pasek progu wg parametrów w ostatniej sekcji | art. 113 ust. 1, 2, 5, 9 ustawy o VAT |
| 9 | VAT: czynny podatnik | Wspierany (`isVatPayer`: VAT 8% wydzielany) | Niskie | 🟢 | Bez zmian; progu 240 000 zł czynnemu **nie pokazywać** | art. 41 ust. 2, poz. 47 zał. 3 ustawy o VAT |
| 10 | Import usług (prowizje portali) | Nie liczymy, mówimy wprost w eksporcie (ADR-023) | Niskie (jawna granica) | 🟢 | Bez zmian do sygnału popytu | art. 28b ustawy o VAT (mechanizm — poza zakresem panelu) |
| 11 | Współwłasność niemałżeńska (wspólnicy bez ślubu, rodzeństwo) | Brak dedykowanego wariantu (jest tylko podział małżeński) | Niskie | 🟢 Later | Odnotować; ewentualne pole „udział %" przy popycie z bety | art. 8 ust. 1 PIT; art. 12 ust. 5 ustawy o ryczałcie |

---

## Część I — przegląd form (zadanie 2)

### 1. Najem prywatny na ryczałcie — rdzeń ICP, wspierany

**(a) Opodatkowanie.** Od 1 stycznia 2022 r. art. 9a ust. 6 PIT stanowi, że dochody ze
źródła najem/dzierżawa (art. 10 ust. 1 pkt 6 PIT) **są opodatkowane ryczałtem od przychodów
ewidencjonowanych** — bez alternatywy. W 2022 r. przepis przejściowy (art. 71 ustawy
z 29.10.2021 — Polski Ład) pozwalał jeszcze na skalę; **od 2023 r. najem prywatny rozlicza
się wyłącznie ryczałtem** — hipoteza z zadania potwierdzona. Stawki: 8,5% do 100 000 zł
przychodu, 12,5% od nadwyżki (art. 12 ust. 1 pkt 4 lit. a ustawy o ryczałcie); przy
oświadczeniu małżonków próg 200 000 zł (art. 12 ust. 13). Bez składki zdrowotnej —
najem prywatny nie jest tytułem do ubezpieczenia (zamknięty katalog art. 66 ust. 1
ustawy zdrowotnej).

**(b) Stan panelu.** Wspierany w pełni: dwie stawki z progiem, trzy warianty małżeńskie
(ADR-021), zdrowotna poprawnie NIEnaliczana (ADR-018), proporcjonalne rozdzielanie
odliczeń między pasma (art. 11 ust. 3, poprawka z 2026-08-25).

**(c) Czego brakuje.** Niczego po stronie liczenia. Otwarte zostaje Q5 (czy krótki termin
z usługami to jeszcze najem prywatny, czy już DG) — to kwalifikacja stanu faktycznego,
której panel **słusznie nie rozstrzyga**: pole `rentalBasis` przenosi decyzję na gospodarza.

**(d) Istotność dla ICP: najwyższa.** Brief produktowy: „rozlicza się najczęściej ryczałtem".

### 2. Działalność gospodarcza na ryczałcie (PKWiU 55) — wspierana

**(a)** Usługi związane z zakwaterowaniem w DG: te same stawki 8,5%/12,5% i próg 100 000 zł
(art. 12 ust. 1 pkt 4 lit. c ustawy o ryczałcie). Składka zdrowotna progowa od przychodu
(art. 81 ust. 2e–2f ustawy zdrowotnej: progi 60 000 / 300 000 zł; w 2026: 498,35 / 830,58 /
1 495,04 zł mies.), odliczenie 50% zapłaconej zdrowotnej od przychodu (art. 11 ust. 1a).

**(b)** Wspierana w pełni; zdrowotna liczona automatycznie z przychodu narastającego,
składki społeczne polem ręcznym (świadoma granica — wysokość zależy od ulg i zbiegów,
automat byłby kwalifikowaniem cudzej sytuacji).

**(c)** Nic krytycznego. **(d) Istotność: wysoka** — drugi filar ICP.

### 3. Działalność na skali — częściowa, do doprecyzowania komunikatów

**(a)** Podatek wg art. 27 ust. 1 PIT (12%/32%, próg 120 000 zł, kwota zmniejszająca
3 600 zł), od **dochodu** (przychód − koszty uzyskania). Składka zdrowotna: 9% dochodu,
nieodliczalna; minimalna miesięczna w 2026 r. — 432,54 zł (9% × 100% minimalnego
wynagrodzenia 4 806 zł; powrót do podstawy 100% po jednorocznej obniżce do 75% w 2025 r.,
a reforma zdrowotnej na 2026 r. została zawetowana w maju 2025 — patrz rejestr stawek).

**(b) Stan panelu.** Podatek liczony (z konfigurowalną kwotą wolną, domyślnie 0 — etat);
koszty tylko te, które aplikacja widzi (prowizje, media, opcjonalnie ZUS społeczny);
zdrowotna wyłącznie polem ręcznym `zusHealth`.

**(c) Czego brakuje i co rekomendować.** Automatu zdrowotnej **nie budować**: składka 9%
liczy się od dochodu z **całej** działalności gospodarza, a panel widzi tylko wynajem —
automat liczyłby z niepełnych danych i wyglądał wiarygodnie. Zamiast tego (wzorzec ADR-023 —
mówimy, czego nie liczymy) dopisać przy formie „skala":
- przy polu zdrowotnej: że panel jej **nie wylicza**, bo zależy od dochodu z całej
  działalności, którego nie zna;
- w karcie/eksporcie: że podstawa obejmuje **tylko koszty zarejestrowane w aplikacji**
  (prowizje, media) — bez amortyzacji, wyposażenia, odsetek itd., więc podstawa może być
  zawyżona (kierunek konserwatywny, ale trzeba go nazwać).

**(d) Istotność: średnia** — gospodarze z wysokimi realnymi kosztami (kredyt, remonty).

### 4. Działalność na podatku liniowym 19% — świadomie bez liczby; pierwszy kandydat rozbudowy

**(a)** 19% od **dochodu** (art. 30c ust. 1 PIT). Zdrowotna: **4,9% dochodu**, minimalna
432,54 zł/mies (2026); zapłaconą zdrowotną można odliczyć od dochodu lub zaliczyć do
kosztów **do limitu 14 100 zł w 2026 r.** (limit ogłaszany corocznie przez MF).

**(b)** Od ADR-020 panel liniowego **nie liczy** — wcześniej szedł błędną gałęzią 8,5%.
Dziś nieznana forma nie dostaje liczby (`formaZnana: false`), co jest poprawnym stanem
przejściowym.

**(c) Co trzeba umieć, żeby wspierać.** Mniej, niż się wydaje: silnik skali już liczy
dochód (przychód − prowizje − media − ZUS społ.), więc różnice to: stawka płaska 19%
bez kwoty wolnej; zdrowotna 4,9% od dochodu (z tym samym zastrzeżeniem co przy skali —
dochód z aplikacji ≠ dochód całej działalności; uczciwie: pole ręczne albo wyliczenie
z jawnym zastrzeżeniem); odliczenie/koszt zdrowotnej z limitem rocznym (nowa stała
w rejestrze stawek, zmienna co rok). Do tego jedna pozycja w `STAWKI_PODATKOWE`
i złote testy.

**(d) Istotność: mniejszościowa — szacunek jakościowy, nazwany.** Twardych danych
o strukturze form opodatkowania wśród wynajmujących krótkoterminowo **nie ma** (nie
znaleziono statystyk MF w tym przekroju — piszemy, że nie wiemy). Jakościowo: liniowy
opłaca się przy wysokich dochodach i realnych kosztach, a dla usług zakwaterowania
ryczałt 8,5%/12,5% od przychodu jest przy typowej strukturze kosztów zwykle
korzystniejszy i prostszy — stąd dominacja ryczałtu w ICP (spójna z briefem
produktowym). Liniowy wybierze raczej gospodarz, który ma **już** DG na liniowym
z innej branży i dokłada wynajem. **Rekomendacja: nie budować przed betą; warunek
powrotu — sygnał popytu (wzorzec ADR-022/023). Jeśli sygnał przyjdzie, to liniowy —
nie nierejestrowana i nie karta — jest właściwym pierwszym rozszerzeniem.**

### 5. Działalność nierejestrowana — potwierdzam: świadomie poza zakresem

**(a)** Art. 5 ust. 1 Prawa przedsiębiorców: działalność osoby fizycznej nie stanowi DG,
jeżeli przychód należny **nie przekracza w żadnym kwartale 225% minimalnego wynagrodzenia**
(zmiana z limitu miesięcznego 75% na kwartalny 225% od 1.01.2026, pakiet deregulacyjny)
— w 2026 r. **10 813,50 zł na kwartał** (4 806 zł × 225%). Przychód rozlicza się według
skali jako przychód z innych źródeł (art. 20 ust. 1ba PIT, PIT-36).

**(b)** Usunięta z aplikacji (ADR-020) — wcześniej liczona bezpodstawnie stawką 8,5%.

**(c)/(d) Czy wynajem krótkoterminowy w ogóle się tu mieści — ocena.** Dwie niezależne
bariery, obie wskazują na „nie budujemy":
1. **Limit.** Sezonowy wynajem choćby jednego obiektu łatwo przekracza 10 813,50 zł
   w kwartale (kilka–kilkanaście rezerwacji) — forma jest dla ICP praktycznie
   bezużyteczna nawet tam, gdzie kwalifikacyjnie by się broniła.
2. **Kwalifikacja.** Wynajem „na doby" z obsługą gości jest z natury zorganizowany
   i ciągły; do tego najem jako taki ma w PIT własne źródło (art. 10 ust. 1 pkt 6)
   rozliczane wyłącznie ryczałtem (art. 9a ust. 6). Czy konkretna aktywność to
   „nierejestrowana", „najem prywatny" czy DG — to ocena stanu faktycznego, której
   panel nie ma prawa robić; źródła interpretacyjne są tu niejednolite.

**Rekomendacja: świadomie NIE budujemy** — potwierdzam ADR-020 w całości. Gdyby użytkownik
zapytał: odpowiedź brzmi „panel tej formy nie liczy", nie „ta forma Pana nie dotyczy".

### 6. Karta podatkowa — martwa dla nowych, zamykam

Hipoteza potwierdzona: **od 1 stycznia 2022 r. nie można złożyć wniosku o opodatkowanie
kartą** (art. 65 ust. 1 ustawy z 29.10.2021 r. — Polski Ład); kontynuować mogą wyłącznie
podatnicy, którzy stosowali kartę na 31.12.2021. W karcie istniała pozycja „usługi
hotelarskie — wynajem pokoi gościnnych i domków turystycznych do 12 pokoi", więc
**kontynuujący gospodarze teoretycznie istnieją** (populacja zamknięta, malejąca).
Dla panelu bez znaczenia podwójnie: nowy użytkownik karty wybrać nie może, a u
kontynuującego podatek wynika z **decyzji naczelnika US** (stała kwota miesięczna) —
nie ma czego liczyć z rezerwacji. Obecne zachowanie „nieznana forma nie dostaje liczby"
jest właściwą obsługą. **Zamknięte — poza zakresem.**

### 7. Spółki — poza ICP, odnotowane

Sp. z o.o. (CIT 9%/19% + opodatkowanie dywidendy, ewentualnie estoński CIT) oraz spółki
transparentne (cywilna, jawna osób fizycznych — przychód przypisywany wspólnikom
proporcjonalnie, art. 8 PIT; spółka osób fizycznych może wybrać ryczałt, art. 6 ust. 1
ustawy o ryczałcie). Brief produktowy wprost wyklucza firmy zarządzające z ICP, a model
danych aplikacji (konto = jeden gospodarz-podatnik) nie udźwignąłby rozliczeń wspólników.
**Nie budować; jeśli taki użytkownik się pojawi, panel poprawnie nie da mu liczby.**

### 8. VAT — zwolnienie podmiotowe vs czynny podatnik

Czynny podatnik: wspierany (`isVatPayer` — VAT 8% od noclegów wydzielany, przychód
pomniejszany o należny; poprawność stawki 8% wobec zwolnienia z art. 43 ust. 1 pkt 36
rozstrzygnięta w rejestrze — art. 43 ust. 20 wyłącza zwolnienie dla poz. 47 zał. 3).
Zwolniony podmiotowo: dziś panel **nie pilnuje limitu 240 000 zł** — parametry
wdrożenia w części II. Import usług od prowizji: bez zmian (ADR-023).

### 9. Inne realne konstelacje — odnotowane

- **Etat + najem prywatny** — wspierane poprawnie (kwota wolna domyślnie 0).
- **Inna DG + najem prywatny obok** — panel liczy wynajem; składki i progi tej drugiej
  działalności są poza jego wiedzą. Pokrywane przez zdanie „liczymy tylko to, co
  w aplikacji" — warto je mieć w każdej karcie wyniku, nie tylko przy progach.
- **Współwłasność niemałżeńska** (para bez ślubu, rodzeństwo): przychód dzieli się wg
  udziałów (art. 8 ust. 1 PIT; art. 12 ust. 5 ustawy o ryczałcie), a panel ma tylko
  warianty małżeńskie. Wariant `polowa` liczbowo odpowiada udziałowi 50%, ale jest
  opisany po małżeńsku. 🟢 Later: ewentualne pole „udział %" przy popycie.
- **Obowiązek kasy fiskalnej** — odrębny reżim (rozporządzenie o zwolnieniach z kas),
  w tym raporcie **nie badany**; odnotowuję, żeby nie zginął: kandydat na osobne pytanie
  do `legal`, jeśli właściciel zechce rozszerzać obszar VAT/ewidencja.

---

## Część II — Parametry wdrożeniowe progu zwolnienia podmiotowego VAT (zadanie 1)

**Dla agenta `dev`.** Wzorzec UI: istniejąca karta progu ryczałtu w
`src/pages/dashboard/views/TaxesView.jsx` (blok `wpd-prog`, w tym stopka „Liczymy tylko
przychód z rezerwacji w tej aplikacji."). Dane: `podsumowaniePodatkowe()` w
`src/utils/taxSummary.js`. Stała: nowy wpis w `STAWKI_PODATKOWE`
(`src/utils/constants.js`) + pozycja w [[Rejestr-stawek-podatkowych]] + złoty test
w `taxSummary.test.mjs` (kwoty liczone ręcznie, nie z wyjścia kodu).

### P1. Kwota i konstrukcja limitu

- **Limit: 240 000 zł** (art. 113 ust. 1 ustawy o VAT, w brzmieniu od 1.01.2026;
  podwyższenie z 200 000 zł ustawą z 24.06.2025, Dz.U. 2025 poz. 896). ⚠️ Nie 200 000 zł
  z treści zadania.
- Liczy się **wartość sprzedaży bez kwoty podatku**, która nie przekroczyła limitu
  „w poprzednim ani bieżącym roku podatkowym". U gospodarza **zwolnionego** w cenie nie ma
  VAT, więc wartością sprzedaży jest **cała kwota należna od gościa**.
- Limit jest **jeden na podatnika** i obejmuje całą jego sprzedaż — ze wszystkich
  działalności, nie tylko z noclegów i nie tylko z tej aplikacji.

### P2. Co u naszego gospodarza wchodzi do limitu

1. **Przychód z noclegów — w całości.** Usługi zakwaterowania to zwykła sprzedaż
   opodatkowana (8%, poz. 47 zał. 3), niczym z limitu niewyłączona.
2. **Prowizje portali NIE pomniejszają licznika.** Wartość sprzedaży to cena, którą płaci
   gość; prowizja Booking/Airbnb to zakup usługi od portalu (koszt), a **zakupy** w limicie
   sprzedaży nie występują. Import usług od prowizji do limitu nie wchodzi (to nabycie,
   nie sprzedaż) — spójne z ADR-023.
3. **Najem prywatny (w rozumieniu PIT) TEŻ się wlicza.** Definicja działalności w VAT
   (art. 15 ust. 2) jest szersza niż w PIT i obejmuje „wykorzystywanie towarów (…) w sposób
   ciągły dla celów zarobkowych" — najem prywatny czyni wynajmującego podatnikiem VAT
   niezależnie od kwalifikacji PIT (tak np. interpretacja Dyrektora KIS z 18.08.2023,
   0112-KDIL1-2.4012.303.2023.1.ID). Nawet najem długoterminowy **zwolniony przedmiotowo**
   (art. 43 ust. 1 pkt 36) wlicza się do limitu: art. 113 ust. 2 pkt 2 lit. a wyłącza
   z pominięcia „transakcje związane z nieruchomościami", jeżeli nie mają charakteru
   pomocniczych — a stały najem pomocniczy nie jest.
4. **Konsekwencja dla panelu:** licznik z aplikacji jest z definicji **dolnym
   oszacowaniem** — gospodarz może mieć poza aplikacją najem długoterminowy, inną
   sprzedaż, rezerwacje z niezaimportowanego kanału. Zdanie „liczymy tylko przychód
   z rezerwacji w tej aplikacji — Twoja pozostała sprzedaż także zużywa ten limit"
   jest **obowiązkową** częścią karty, nie ozdobnikiem.
5. **Techniczne (kod):** licznik = suma `income` rezerwacji `type === 'booking'`
   z wybranego roku, bez `syncStatus === 'vanished'` — czyli pole `brutto`
   z `podsumowaniePodatkowe()`. **Bez** odejmowania VAT (u zwolnionego go nie ma; przy
   `isVatPayer` karty i tak nie pokazujemy — P7), **bez** pomniejszania o prowizje,
   **bez** podziału małżeńskiego (`spouseRental` — patrz P6). Nie używać pola `przychod`
   (jest po podziale małżeńskim i po odjęciu VAT).

### P3. Pierwszy rok działalności (art. 113 ust. 9)

Podatnik **rozpoczynający** wykonywanie czynności w trakcie roku ma limit
**w proporcji do okresu prowadzonej działalności** (art. 113 ust. 9; utrata — ust. 10).
Panel nie zna daty rozpoczęcia działalności, więc proporcji **nie liczy** — ale
**musi o niej wspomnieć jednym zdaniem** w opisie karty. Powód: bez tego zdania pasek
u gospodarza z pierwszego roku pokazuje **więcej zapasu, niż istnieje** — kierunek błędu
niebezpieczny, odwrotny niż wszystkie inne przybliżenia panelu. Zdanie informacyjne
(„w pierwszym roku limit jest proporcjonalnie niższy") nie kwalifikuje niczyjej sytuacji.
Alternatywę — pytanie o datę rozpoczęcia w ustawieniach — odradzam na teraz: kolejne pole
o niejasnej definicji („rozpoczęcie wykonywania czynności" ≠ data założenia konta),
a wartość dodana mała.

### P4. Wyłączenia z art. 113 ust. 13

Katalog czynności odbierających prawo do zwolnienia (m.in. dostawy terenów budowlanych,
nowych środków transportu, niektórych towarów wysyłkowych; usługi prawnicze, doradcze,
jubilerskie, ściągania długów). **Usług zakwaterowania w katalogu nie ma — typowego ICP
żadne wyłączenie nie dotyka.** Realny scenariusz brzegowy: gospodarz prowadzi równolegle
np. usługi doradcze — wtedy zwolnienie nie przysługuje mu **w ogóle**, niezależnie od
obrotu. Panel tego nie wie i **nie powinien o to pytać** (byłaby to ankieta kwalifikująca
sytuację prawną); pokrywa to odesłanie do księgowego w treści karty. Nie budować.

### P5. Utrata zwolnienia i treść ostrzeżenia

- **Od której czynności:** zwolnienie traci moc **począwszy od czynności, którą
  przekroczono kwotę** (art. 113 ust. 5) — opodatkowana jest już cała ta czynność,
  nie tylko nadwyżka. To różnica wobec progu ryczałtu (tam zmienia się stawka od
  nadwyżki) — kopia karty nie może tej mechaniki sugerować.
- **Co po przekroczeniu:** zgłoszenie rejestracyjne / aktualizacja **VAT-R przed dniem
  utraty prawa do zwolnienia** (art. 96 ust. 5 pkt 2 ustawy o VAT). Powrót do zwolnienia
  możliwy najwcześniej po upływie roku, licząc od końca roku utraty (art. 113 ust. 11) —
  tej mechaniki panel **nie modeluje** (świadomie; zapisać w ADR wdrożeniowym).

**Proponowane brzmienia** (zgodne z zasadą „nie kwalifikujemy" — mówimy o normie i o tym,
co widzi aplikacja; wnioski wyciąga księgowy):

Karta, stan spokojny (poniżej progu ostrzegania):
> **Limit zwolnienia z VAT · 240 000 zł** — zostało X zł
> Do 240 000 zł wartości sprzedaży rocznie sprzedaż może korzystać ze zwolnienia z VAT
> (art. 113 ustawy o VAT). Liczymy tylko przychód z rezerwacji w tej aplikacji — pozostała
> sprzedaż (inny najem, inna działalność) także zużywa ten limit. W pierwszym roku
> działalności limit jest proporcjonalnie niższy.

Ostrzeżenie przy zbliżaniu (rekomendacja: od 80%, spójnie z paskiem ryczałtu):
> **Rezerwacje w aplikacji zbliżają się do 240 000 zł.** Powyżej tego limitu sprzedaż
> traci zwolnienie z VAT — począwszy od czynności, którą limit przekroczono — a przepisy
> wiążą z tym obowiązki rejestracyjne (VAT-R). Czy i kiedy dotyczy to Ciebie, zależy od
> całej Twojej sprzedaży, nie tylko tej w aplikacji — porozmawiaj z księgowym
> z wyprzedzeniem.

Po przekroczeniu (wg danych aplikacji):
> **Rezerwacje w aplikacji przekroczyły 240 000 zł.** Od czynności, którą przekroczono
> limit, sprzedaż nie korzysta już ze zwolnienia podmiotowego (art. 113 ust. 5 ustawy
> o VAT), a rejestracji VAT-R dokonuje się przed dniem utraty zwolnienia. Skonsultuj
> rozliczenie z księgowym. Panel nadal nie dolicza VAT do Twoich kwot — do czasu
> włączenia opcji „jestem czynnym podatnikiem VAT" w ustawieniach.

Czego w treściach **nie ma i nie może być**: „musisz się zarejestrować", „straciłeś
zwolnienie", „jesteś podatnikiem VAT" — to kwalifikacje sytuacji konkretnej osoby
(ryzyko z art. 2 ust. 1 pkt 1 ustawy o doradztwie podatkowym, granica opisana w §2
analizy prawnej). Panel mówi: co pokazują jego dane, co stanowi przepis, i do kogo iść.

### P6. Małżonkowie a licznik VAT

Oświadczenie małżonków z ustawy o ryczałcie (art. 12 ust. 6) i podział przychodu
`spouseRental` to mechanika **PIT — na VAT się nie przenosi**. Na gruncie VAT podatnikiem
jest ten, kto faktycznie świadczy usługę (zawiera umowy, przyjmuje gości); praktyka
interpretacyjna przy majątku wspólnym zwykle przypisuje całość temu małżonkowi, który
wynajmem faktycznie zarządza. **Parametr: licznik VAT liczy pełne `brutto` z aplikacji,
bez podziału wg `spouseRental`.** Kierunek konserwatywny (ostrzeżenie najwcześniej jak
się da). To jest interpretacja z niepewnością — jeżeli u konkretnej pary każde z małżonków
odrębnie świadczy część usług, limity mogą biec osobno; rozstrzygnięcie należy do
księgowego, nie do panelu. Nie komplikować UI tym wariantem.

### P7. Czy pokazywać próg czynnemu podatnikowi VAT (`isVatPayer: true`)

**Nie — hipoteza z zadania potwierdzona.** Czynny podatnik ze zwolnienia podmiotowego
nie korzysta, więc pasek „zostało X zł zwolnienia" jest dla niego szumem i sugeruje,
że przy 240 000 zł coś się dla niego zmienia (nie zmienia się nic). Warunek renderowania
karty: `isVatPayer === false` (także gdy ustawienia są domyślne — domyślnie `false`).
Scenariusza „czynny podatnik chce wrócić do zwolnienia" (art. 113 ust. 11) świadomie
nie obsługujemy — jednostkowy, wymaga wiedzy o historii utraty, której panel nie ma.

### P8. Lista zmian dla dev (podsumowanie)

1. `constants.js` → `STAWKI_PODATKOWE`: nowa pozycja, np.
   `vatZwolnieniePodmiotowe: { limit: 240000 }` (kwota roczna, zmienna ustawowo — objęta
   rytmem rejestru stawek „do 31 stycznia").
2. `taxSummary.js` → `podsumowaniePodatkowe()`: nowe pola wyniku (np. `vatLimit`,
   `vatDoLimitu`, `vatProcentLimitu`, `vatLimitPrzekroczony`) liczone z `brutto`
   (pełnego, bez podziału małżeńskiego), tylko koncepcyjnie — render warunkowany
   `!isVatPayer` w widoku.
3. `TaxesView.jsx`: druga karta progu wg wzorca `wpd-prog`, treści z P5, render tylko
   dla `isVatPayer === false`; **bez** kopiowania mechaniki „od nadwyżki inna stawka".
4. `taxSummary.test.mjs`: złote testy — kwota limitu z ustawy, licznik bez prowizji
   i bez podziału małżeńskiego, ukrycie dla vatowca, stan przekroczenia.
5. [[Rejestr-stawek-podatkowych]]: wpis o pozycji `vatZwolnieniePodmiotowe`
   (art. 113 ust. 1, 240 000 zł, zweryfikowano 2026-08-28).
6. ADR: decyzja o granicach (bez proporcji ust. 9, bez ust. 13, bez ust. 11, licznik
   pełny przy małżonkach) — żeby granice były zapisane, a nie domyślne.

---

## Źródła (weryfikacja 2026-08-28)

**Teksty przepisów:**
- [Art. 113 ustawy o VAT (arslege, stan Dz.U.2025.0.775)](https://arslege.pl/wartosc-sprzedazy-a-zwolnienia-podatkowe/k76/a20259/) — ust. 1 (240 000 zł), 2, 4, 5, 9–11, 13
- [Art. 96 ustawy o VAT (arslege)](https://arslege.pl/zgloszenie-rejestracyjne/k76/a20242/) — ust. 5 pkt 2 (VAT-R przed dniem utraty zwolnienia)

**Źródła oficjalne:**
- [Zwolnienie podmiotowe od podatku VAT (podatki.gov.pl)](https://www.podatki.gov.pl/podatki-firmowe/vat/poradniki-i-informatory/zwolnienie-podmiotowe-od-podatku-vat) — limit 240 000 zł w 2026, proporcja pierwszego roku, utrata od czynności przekraczającej
- [Sejm przyjął pakiet ustaw deregulacyjnych (gov.pl / KAS)](https://www.gov.pl/web/kas/sejm-przyjal-pakiet-ustaw-deregulacyjnych)
- [Działalność nierejestrowana (biznes.gov.pl)](https://www.biznes.gov.pl/pl/portal/00115)
- [Działalność nierejestrowana — nowe zasady od 2026 (praca.gov.pl, PUP Sosnowiec)](https://sosnowiec.praca.gov.pl/strona-glowna/-/asset_publisher/Qat7ebECUfDp/content/dzialalnosc-nierejestrowana-nowe-zasady-od-2026-roku-)

**Źródła branżowe (pomocniczo, z tą kwalifikacją):**
- [Limit zwolnienia podmiotowego w VAT podwyższony w 2026 (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-limit-zwolnienia-podmiotowego-w-vat) — ustawa z 24.06.2025, Dz.U. 2025 poz. 896, przepis przejściowy 200–240 tys.
- [Limit zwolnienia z VAT — ministerstwo wyjaśnia wątpliwości (prawo.pl)](https://www.prawo.pl/podatki/limit-zwolnienia-z-vat-ministerstwo-wyjasnia-watpliwosci,535739.html)
- [Przez najem prywatny przedsiębiorca może stracić zwolnienie z VAT (prawo.pl)](https://www.prawo.pl/podatki/prywatny-najem-mieszkan-a-limit-zwolnienia-z-vat,524036.html) — najem wlicza się do limitu art. 113
- [Najem prywatny jako działalność opodatkowana VAT (pit.pl)](https://www.pit.pl/vat/najem-prywatny-jako-dzialalnosc-opodatkowana-vat-1005750) — art. 15 ust. 2, interpretacja KIS 0112-KDIL1-2.4012.303.2023.1.ID
- [Transakcje związane z nieruchomościami a zwolnienie z VAT (ksiegowego.pl)](https://www.ksiegowego.pl/artykul/transakcje-zwiazane-z-nieruchomosciami-i-pomocniczy-charakter-czynnosci-a-zwolnienie-z-vat) — art. 113 ust. 2 pkt 2 lit. a
- [Najem prywatny od 2023 r. tylko na ryczałcie (podatki.biz)](https://www.podatki.biz/artykuly/najem-prywatny-od-2023-r-tylko-na-ryczalcie_52_50298.htm) — art. 9a ust. 6 PIT, art. 71 Polskiego Ładu
- [Likwidacja karty podatkowej — kto pozostanie po 2022 (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-likwidacja-karty-podatkowej-kto-pozostanie-na-niej-po-2022-roku) — art. 65 ust. 1 Polskiego Ładu
- [Karta podatkowa przy wynajmie pokoi gościnnych (infor.pl)](https://ksiegowosc.infor.pl/podatki/ryczalt/karta-podatkowa/5178448,Karta-podatkowa-przy-wynajmie-pokoi-goscinnych-i-domkow-turystycznych.html)
- [Działalność nierejestrowana 2026 — limit przychodu (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-limit-przychodu-dla-dzialalnosci-nierejestrowanej) — 10 813,50 zł/kwartał
- [Limit odliczenia składki zdrowotnej na liniowym 2026 (ifirma.pl)](https://www.ifirma.pl/blog/limit-odliczenia-skladki-zdrowotnej-na-podatku-liniowym-2026/) — 14 100 zł
- [Składka zdrowotna 2026 — skala, liniowy, ryczałt (infakt.pl)](https://www.infakt.pl/blog/skladka-zdrowotna-2026-skala-podatkowa-podatek-liniowy-ryczalt-i-inne-formy/) — 9% / 4,9%, minimalna 432,54 zł (powrót do podstawy 100% minimalnego)
- [Składka zdrowotna przedsiębiorców w 2026 r. (gofin.pl)](https://www.gofin.pl/skladki-zasilki-emerytury/skladki-zus/45280/skladka-zdrowotna-przedsiebiorcow-w-2026-r)

**Dokumenty wewnętrzne:** [[Rejestr-stawek-podatkowych]] · [[Przeswietlenie-panelu-podatkowego-2026-08-28]] · [[Decisions]] ADR-018/020/021/022/023 · [[Projects/Brief-panel-podatkowy-2026-08-24]] · `docs/marketing/Brief-produktowy-WynajemPRO.md` §2

> ⚖️ Ponownie: dokument jest projektem analizy do decyzji właściciela i wkładem dla agenta
> `dev`. Treści ostrzeżeń z P5 przed publikacją w aplikacji powinien przejrzeć prawnik lub
> doradca podatkowy — zwłaszcza pod kątem granicy z ustawą o doradztwie podatkowym.
