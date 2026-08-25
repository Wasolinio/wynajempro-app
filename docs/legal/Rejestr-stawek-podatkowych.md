# Rejestr stawek podatkowych

Po co ten plik: `STAWKI_PODATKOWE` w `src/utils/constants.js` to jedyna rzecz w module
podatkowym, która **zgnije sama, bez żadnego sygnału**. Wyliczenie policzone zeszłorocznymi
stawkami wygląda dokładnie tak samo jak poprawne. Ten rejestr jest dowodem należytej
staranności — data i źródło każdej weryfikacji.

**Rytm:** sprawdzać **do 31 stycznia** każdego roku. Wtedy znane są już wszystkie wartości:
GUS podaje przeciętne wynagrodzenie za IV kwartał w drugiej połowie stycznia, a od niego
zależy składka zdrowotna ryczałtowców.

**Co sprawdzać:** przeciętne wynagrodzenie w sektorze przedsiębiorstw za IV kwartał roku
poprzedniego, minimalne wynagrodzenie, progi i stawki ryczałtu, progi składki zdrowotnej,
kwotę wolną i próg skali, stawkę VAT dla zakwaterowania, limit zwolnienia podmiotowego z VAT,
limit działalności nierejestrowanej.

Po weryfikacji zaktualizować `STAWKI_PODATKOWE.zweryfikowano` i dopisać wpis niżej.

---

## 2026-08-25 — weryfikacja pełna

Sprawdzone na polecenie właściciela, przy okazji usuwania form `unregistered` i `linear`.
Wynik: **wszystkie wartości w `constants.js` są poprawne dla 2026.** Nic nie wymagało zmiany.

| Wartość | W kodzie | Potwierdzone | Uwagi |
|---|---|---|---|
| Ryczałt najem — stawka do progu | 8,5% | ✅ | art. 12 ust. 1 pkt 4 ustawy o ryczałcie |
| Ryczałt najem — stawka od nadwyżki | 12,5% | ✅ | jw. |
| Próg ryczałtu | 100 000 zł | ✅ | liczony łącznie dla wszystkich nieruchomości podatnika |
| Zdrowotna ryczałt — przychód do 60 000 zł | 498,35 zł/mies | ✅ | 60% przeciętnego wynagrodzenia × 9% |
| Zdrowotna ryczałt — 60 000–300 000 zł | 830,58 zł/mies | ✅ | 100% × 9% |
| Zdrowotna ryczałt — powyżej 300 000 zł | 1 495,04 zł/mies | ✅ | 180% × 9% |
| Odliczenie 50% zdrowotnej | tak, tylko w działalności | ✅ | art. 11 ust. 1a odsyła do art. 6 **ust. 1** |
| Skala — kwota wolna | 30 000 zł | ✅ | art. 27 ust. 1 PIT; kwota zmniejszająca 3 600 zł |
| Skala — próg | 120 000 zł | ✅ | jw. |
| Skala — stawki | 12% / 32% | ✅ | jw. |
| VAT zakwaterowanie | 8% | ✅ | PKWiU dział 55, poz. 47 zał. nr 3 do ustawy o VAT |

**Podstawa wyliczenia składki zdrowotnej:** przeciętne miesięczne wynagrodzenie w sektorze
przedsiębiorstw wraz z wypłatami z zysku za **IV kwartał 2025 = 9 228,64 zł** (komunikat GUS
ze stycznia 2026). Sprawdzenie: 9 228,64 × 60% × 9% = 498,35 ✓ · × 100% × 9% = 830,58 ✓ ·
× 180% × 9% = 1 495,04 ✓.

### Rzecz, która mogła to wywrócić, a nie wywróciła

Reforma składki zdrowotnej dla przedsiębiorców miała wejść **1 stycznia 2026** i zmienić
mechanikę na dwuskładnikową (część stała od 75% minimalnego wynagrodzenia). **Prezydent
zawetował ustawę 6 maja 2025**, więc w 2026 obowiązują zasady dotychczasowe — te, które
aplikacja liczy. Gdyby reforma weszła, wszystkie trzy progi zdrowotnej byłyby nieaktualne.

To jest dokładnie ten scenariusz, dla którego ten rejestr istnieje: wartości się nie zmieniły,
ale **prawie się zmieniły**, i nic w kodzie by o tym nie powiedziało.

### Rozbieżność w źródłach — rozstrzygnięta

Jedno ze znalezionych źródeł podaje progi **461 / 769 / 1 385 zł**. To są wartości **z 2025**
(przeciętne wynagrodzenie za IV kw. 2024 = 8 549,18 zł; × 9% = 769,43). Tę samą liczbę
— 769,43 zł — miał mockup projektowy, co potwierdza, że projektant pracował na danych
z poprzedniego roku. Wartości w `constants.js` są nowsze i poprawne.

### Wartości sprawdzone, ale jeszcze nieużywane w kodzie

| Wartość | Ile | Gdzie się przyda |
|---|---|---|
| Limit zwolnienia podmiotowego z VAT | 240 000 zł | drugi pasek progu, obok progu ryczałtu — propozycja z analizy §P1 |
| Limit działalności nierejestrowanej | 10 813,50 zł **na kwartał** | gdyby forma wróciła do aplikacji; 225% minimalnego wynagrodzenia (4 806 zł) |
| Podatek liniowy | 19% od dochodu | gdyby forma wróciła; art. 30c ust. 1 PIT |
| Minimalne wynagrodzenie 2026 | 4 806 zł | podstawa limitu nierejestrowanej |

### Czego ta weryfikacja NIE rozstrzyga

Sprawdzone zostały **wartości liczbowe**. Dwa pytania metodyczne zostały wtedy odłożone
do doradcy — jedno z nich rozstrzygnęła późniejsza lektura tekstów ustaw (niżej).
Otwarte zostaje:

**Kwalifikacja najmu krótkoterminowego z usługami** — czy mieści się w najmie prywatnym,
czy jest działalnością gospodarczą. Źródła branżowe ostrzegają, że przy zorganizowanym
i ciągłym wynajmie „na doby" organ może uznać działalność niezależnie od tego, jak gospodarz
to nazywa. To bezpośrednio dotyczy pola `rentalBasis` (ADR-018) i naszej grupy docelowej.
Ustawa tego nie rozstrzyga — kwalifikacja zależy od stanu faktycznego, więc **tu lektura
przepisu nie pomoże** i pytanie Q5 zostaje otwarte.

---

## 2026-08-25 — lektura tekstów ustaw

Właściciel polecił sięgnąć do **tekstów przepisów**, nie do publikacji branżowych, wobec braku
środków na doradcę. Poniżej to, co da się ustalić z samego brzmienia — z zaznaczeniem, czego
się z niego ustalić nie da.

### Co potwierdziło się co do słowa

**Art. 11 ust. 1a ustawy o ryczałcie** — odliczenie 50% składki zdrowotnej:

> „Przychody, o których mowa w **art. 6 ust. 1**, mogą być pomniejszone o 50% składek na
> ubezpieczenie zdrowotne zapłaconych w roku podatkowym (…) 1) **z tytułu pozarolniczej
> działalności gospodarczej** opodatkowanej w formie ryczałtu od przychodów ewidencjonowanych
> (…) — jeżeli nie zostały zwrócone podatnikowi w jakiejkolwiek formie."

Dwa niezależne warunki i oba wskazują na działalność: przychód musi być z art. 6 **ust. 1**
(nie z ust. 1a, czyli nie z najmu prywatnego), a składka musi być **z tytułu działalności
gospodarczej**. ADR-018 jest zgodne z przepisem.

**Art. 66 ust. 1 ustawy o świadczeniach opieki zdrowotnej** — katalog tytułów do obowiązkowego
ubezpieczenia zdrowotnego jest zamknięty i **nie wymienia najmu prywatnego**. To domyka drugą
połowę ADR-018: przy najmie poza działalnością nie ma składki, więc nie ma też czego odliczać.

**Art. 81 ust. 2e i 2f tej samej ustawy** — podstawa wymiaru składki dla ryczałtowców: progi
przychodu **60 000 zł** i **300 000 zł**, podstawy **60%**, **100%** i **180%** przeciętnego
miesięcznego wynagrodzenia. Dokładnie ten mechanizm, który liczy `zdrowotnaRyczalt()`.

**Art. 12 ust. 1 pkt 4** — stawki 8,5% / 12,5% z progiem 100 000 zł obejmują zarówno
**lit. a** (przychody z art. 6 ust. 1a, czyli najem prywatny), jak i **lit. c** (świadczenie
usług związanych z zakwaterowaniem, PKWiU dział 55). Jedna gałąź kodu dla obu podstaw wynajmu
jest więc poprawna.

**Art. 27 ust. 1 ustawy o PIT** — skala: do 120 000 zł podatek 12% minus kwota zmniejszająca
3 600 zł; powyżej 10 800 zł plus 32% nadwyżki. Nasza implementacja liczy
`(podstawa − 30 000) × 12%`, co jest **matematycznie tożsame** (30 000 × 12% = 3 600),
oraz `90 000 × 12% + (podstawa − 120 000) × 32%`, czyli `10 800 + 32% nadwyżki`. Zgodne.

**Art. 113 ust. 1 ustawy o VAT** — limit zwolnienia podmiotowego **240 000 zł**, liczony
od wartości sprzedaży bez podatku, „w poprzednim ani bieżącym roku podatkowym".

### Co lektura ZMIENIŁA w kodzie

**Art. 11 ust. 3 ustawy o ryczałcie** — pytanie Q6(c), odłożone wcześniej do doradcy,
rozstrzyga samo brzmienie przepisu:

> „Jeżeli podatnik uzyskuje przychody wymienione w art. 6 ust. 1, 1a lub 1d, **w tym
> opodatkowane różnymi stawkami**, i dokonuje odliczeń od tych przychodów, odliczeń tych
> dokonuje **w takim stosunku, w jakim w roku podatkowym pozostają poszczególne przychody**
> (…) **w ogólnej kwocie przychodów**."

Kod pomniejszał podstawę o odliczenie **przed** podziałem na pasma, przez co całe odliczenie
lądowało w paśmie 8,5%. Przepis żąda rozdzielenia proporcjonalnego. **Poprawione** —
`podatekDochodowy()` mnoży teraz oba pasma przez ten sam współczynnik `podstawa / przychód`.

Skutek jest niewielki i zawsze w stronę obniżenia podatku, bo poprzednia metoda zawyżała:

| Przychód | Poprzednio | Wg art. 11 ust. 3 | Różnica |
|---:|---:|---:|---:|
| 108 200 zł | 9 101,40 | 9 086,30 | −15,11 |
| 150 000 zł | 14 326,40 | 14 259,96 | −66,45 |
| 320 000 zł | 35 237,53 | 34 990,85 | −246,68 |

Poniżej progu 100 000 zł nic się nie zmienia — nie ma dwóch pasm, więc nie ma czego dzielić.

**Art. 43 ust. 20 ustawy o VAT** — analiza prawna zostawiła jako „założenie do nazwania"
pytanie, czy stawka 8% jest właściwa dla wszystkich rezerwacji, skoro najem na cele
mieszkaniowe jest zwolniony z art. 43 ust. 1 pkt 36. Przepis rozstrzyga to wprost:

> „Zwolnienie, o którym mowa w ust. 1 pkt 36, **nie ma zastosowania do usług wymienionych
> w poz. 47 załącznika nr 3 do ustawy**."

Poz. 47 to usługi związane z zakwaterowaniem. Dla najmu krótkoterminowego zwolnienie
**nie działa**, więc 8% jest poprawne. Do tego samo zwolnienie z pkt 36 wymaga celu
**wyłącznie mieszkaniowego**, czego pobyt turystyczny nie spełnia. Założenie w kodzie jest
zgodne z ustawą — nie wymaga zmiany, wymagało tylko sprawdzenia.

### Co lektura ZNALAZŁA, a czego kod jeszcze nie robi

**Art. 12 ust. 13 — próg 200 000 zł dla małżonków.** To jest znalezisko, które dotyczy wprost
naszej grupy docelowej, bo mieszkania na wynajem bywają wspólną własnością małżeńską.

> „W przypadku małżonków, którzy złożyli oświadczenie określone w ust. 6, kwota przychodów,
> o której mowa w ust. 1 pkt 4, wynosi **200 000 zł**."

Warunek z **ust. 6**: małżonkowie ze wspólnością majątkową osiągający przychody z art. 6
ust. 1a mogą złożyć **pisemne oświadczenie o opodatkowaniu całości przychodu przez jednego
z nich**. Termin z **ust. 7**: do 20. dnia miesiąca po miesiącu pierwszego przychodu w roku,
albo do końca roku, jeżeli pierwszy przychód wypadł w grudniu.

Bez oświadczenia działa zasada z **ust. 5 przez ust. 6**: przychód dzieli się między małżonków
proporcjonalnie, więc **każde ma własne 100 000 zł**.

⚠️ **W obu układach nasz sztywny próg 100 000 zł ostrzega wcześniej, niż powinien.** Kierunek
jest bezpieczny — gospodarz odłoży za dużo, nie za mało — ale karta progu istnieje właśnie po
to, żeby wpływać na decyzje cenowe pod koniec sezonu, a fałszywy alarm przy 100 000 zł u pary
wynajmującej wspólnie jest wtedy szkodliwy. **Wymaga pola w ustawieniach.** Nie zaimplementowane
— to nowa funkcja, nie poprawka; decyzja właściciela.

### Czego z tekstów ustaw ustalić się NIE DA

Uczciwie: lektura przepisów rozstrzyga pytania o **treść normy**, ale nie zastępuje doradcy
tam, gdzie problemem jest **kwalifikacja stanu faktycznego** albo **praktyka organów**.

- **Q5 — czy najem krótkoterminowy z usługami to działalność gospodarcza.** Ustawa podaje
  kryteria (zorganizowanie, ciągłość, zarobkowy charakter), ale ich zastosowanie do konkretnego
  gospodarza to ocena stanu faktycznego. Rozstrzygają interpretacje indywidualne i orzecznictwo,
  nie brzmienie przepisu. **To jest dokładnie ten punkt, w którym pole `rentalBasis` przenosi
  decyzję na gospodarza — i słusznie, bo aplikacja nie ma jak jej podjąć.**
- **Q1 — gdzie leży granica doradztwa podatkowego.** Art. 2 ust. 1 pkt 1 ustawy o doradztwie
  podatkowym mówi „porady, opinie i wyjaśnienia"; co konkretnie mieści się w tych słowach przy
  interfejsie aplikacji, wynika z praktyki, nie z definicji.
- **Q3, Q4 — skuteczność klauzul wobec konsumenta.** Art. 385³ pkt 2 KC ustanawia domniemanie,
  ale ocena konkretnego brzmienia to kwestia orzecznicza.

**Tania ścieżka zamiast doradcy dla Q5:** wniosek o **interpretację indywidualną** do Dyrektora
Krajowej Informacji Skarbowej (formularz ORD-IN). Opłata wynosi 40 zł od stanu faktycznego,
termin — do 3 miesięcy. Interpretacja chroni wnioskodawcę, a odpowiedź na pytanie „czy mój
najem to działalność" jest dokładnie tym, czego brakuje. **To nie jest porada dla klientów
aplikacji, tylko rozstrzygnięcie dla własnej sytuacji właściciela** — do zestawienia z tym,
co panel ma mówić gospodarzom.

### Źródła — teksty przepisów

- [Art. 6 ustawy o ryczałcie (lexlege)](https://lexlege.pl/zryczl-pod-os-fiz/art-6/)
- [Art. 11 ustawy o ryczałcie (arslege)](https://arslege.pl/odliczenia-od-przychodow-opodatkowanych-w-formie-ryczaltu-od-przychodow-ewidencjonowanych/k464/a40015/)
- [Art. 12 ustawy o ryczałcie (lexlege)](https://lexlege.pl/zryczl-pod-os-fiz/art-12/)
- [Art. 27 ustawy o PIT (lexlege)](https://lexlege.pl/ustawa-o-podatku-dochodowym-od-osob-fizycznych/art-27/)
- [Art. 66 ustawy o świadczeniach opieki zdrowotnej (lexlege)](https://lexlege.pl/ustawa-o-swiadczeniach-opieki-zdrowotnej-finansowanych-ze-srodkow-publicznych/art-66/)
- [Art. 81 ustawy o świadczeniach opieki zdrowotnej (lexlege)](https://lexlege.pl/ustawa-o-swiadczeniach-opieki-zdrowotnej-finansowanych-ze-srodkow-publicznych/art-81/)
- [Art. 43 ustawy o VAT (lexlege)](https://lexlege.pl/ustawa-o-podatku-od-towarow-i-uslug/art-43/)
- [Art. 113 ustawy o VAT (lexlege)](https://lexlege.pl/ustawa-o-podatku-od-towarow-i-uslug/art-113/)

⚠️ Teksty przepisów pobrane z serwisów publikujących ustawy, nie z Dziennika Ustaw. Przy
rzeczach o wysokiej stawce warto zweryfikować brzmienie w ISAP (isap.sejm.gov.pl). Stan prawny
wskazany przez źródło: **25.08.2026**.

### Źródła

- [Składka zdrowotna dla ryczałtu w 2026 r. (infakt.pl)](https://www.infakt.pl/blog/skladka-zdrowotna-dla-ryczaltu-w-2026-r/)
- [Składka zdrowotna 2026 — ryczałt, nowe stawki i progi (symfonia.pl)](https://symfonia.pl/blog/rozwoj-firmy/jdg/skladka-zdrowotna-2025-ryczalt/)
- [Składka zdrowotna 2026 — skala, liniowy, ryczałt (optimumtax.pl)](https://optimumtax.pl/blog/skladka-zdrowotna-2026-skala-liniowy-ryczalt/)
- [Andrzej Duda zawetował zmiany w składce zdrowotnej (pit.pl)](https://www.pit.pl/aktualnosci/andrzej-duda-zawetowal-zmiany-w-skladce-zdrowotnej-co-dalej-z-reforma-od-2026-roku-1011159)
- [Weto ustawy o składce zdrowotnej — co dalej ze zmianami (portalfk.pl)](https://www.portalfk.pl/skladki/weto-ustawy-o-skladce-zdrowotnej-co-dalej-ze-zmianami-dla-przedsiebiorcow-48725.html)
- [Ryczałt od najmu w 2026 — stawki 8,5% i 12,5% (ksiegowosc365.com)](https://ksiegowosc365.com/blog/ryczalt-dla-najmu-2026.html)
- [Stawka ryczałtu 8,5% oraz 12,5% w rozliczeniu 2026 r. (e-pity.pl)](https://www.e-pity.pl/pit-28/stawka-ryczaltu-przychody-ewidencjonowane/)
- [Skala podatkowa, progi PIT 2026 (pit.pl)](https://www.pit.pl/skala-podatkowa-pit/)
- [Kwota wolna od podatku i progi podatkowe w 2026 (saldeosmart.pl)](https://www.saldeosmart.pl/blog/aktualnosci/kwota-wolna-od-podatku-i-progi-podatkowe-w-2026/)
- [Najem prywatny opodatkowany ryczałtem a odliczenie składki zdrowotnej (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-najem-prywatny-opodatkowany-ryczaltem-a-odliczenie-skladki-zdrowotnej)
- [Najem prywatny a składka zdrowotna — kto musi ją opłacać (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-najem-prywatny-a-skladka-zdrowotna)
- [Jaki VAT na usługi hotelowe, noclegowe i najem krótkoterminowy (eztax.pl)](https://eztax.pl/jaki-vat-na-uslugi-hotelowe-noclegowe-i-najem-krotkoterminowy/)
- [Wynajem krótkoterminowy lokalu: VAT, kasa i ryczałt (poradapodatkowa.pl)](https://poradapodatkowa.pl/podatkowe-aspekty-wynajmu-obiektow-noclegowych-vat-kasa-fiskalna-i-forma-opodatkowania,1326.phtml)
- [Działalność nierejestrowa — nowy limit w 2026 r. (prawo.pl)](https://www.prawo.pl/biznes/dzialalnosc-nierejestrowa-nowy-limit-w-2026-r,533527.html)

⚠️ Źródła branżowe, nie tekst ustawy. Do wiążącego potwierdzenia przez doradcę podatkowego —
patrz pytania Q1–Q9 w `Analiza-panel-podatkowy-2026-08-24.md` §11.
