# Prześwietlenie panelu podatkowego pod zarzuty z naboru (2026-08-28)

Powód: komentarze pod postem naborowym z 21.08 („gdzie VAT, ZUS, import usług?",
„ryczałtem jak za najem długoterminowy?") i pytanie właściciela przed publikacją
posta z aktualizacją: czy panel jest wystarczająco rozbudowany, żeby te zarzuty
udźwignąć. Audyt wykonany na kodzie (`src/utils/taxSummary.js`, `taxCalculator.js`,
`constants.js`, `taxExport.js`, `TaxesView.jsx`), złotym zestawie testów
(`taxSummary.test.mjs`, 16 testów z kwotami liczonymi ręcznie z ustaw) i decyzjach
[[Decisions]] ADR-018/020/022/023.

## Jak panel odpowiada na każdy zarzut

### „Ryczałtem jak za najem długoterminowy? O co chodzi?" (Marta)

Zarzut zakłada, że ryczałt 8,5% przy krótkim terminie to nadużycie. Stan prawny:
art. 12 ust. 1 pkt 4 ustawy o ryczałcie obejmuje **tą samą stawką i tym samym progiem**
zarówno najem prywatny (lit. a, przez art. 6 ust. 1a), jak i **usługi związane
z zakwaterowaniem w działalności** (lit. c, PKWiU dział 55). Odczytane z tekstu ustawy
przy weryfikacji stawek 2026-08-25 (rejestr: [[legal/Rejestr-stawek-podatkowych]]).

Panel modeluje OBIE podstawy (`rentalBasis: 'private' | 'business'`) i **świadomie nie ma
wartości domyślnej** — pyta gospodarza kartą w panelu, bo różnica nie jest w stawce,
tylko w składkach, a pomyłka to ok. 10 tys. zł zawyżenia albo ok. 424 zł niedopłaty
rocznie (komentarz w `constants.js:110`). Formy, których nie umie liczyć (liniowy,
nieznana), **nie dostają liczby** zamiast dostać liczbę błędną (ADR-020).

### „Gdzie ZUS?" (Joanna, Marta)

- **Zdrowotna przy ryczałcie w działalności**: liczona **automatycznie**, progowo
  z przychodu narastającego (3 progi: 498,35 / 830,58 / 1495,04 zł mies.,
  stan 2026) + odliczenie 50% zapłaconej składki od przychodu. Gospodarz nie musi
  nic wpisywać.
- **Zdrowotna przy najmie prywatnym**: poprawnie **nienaliczana** — najem prywatny
  nie jest tytułem do ubezpieczenia zdrowotnego (art. 11 ust. 1a odsyła do art. 6
  ust. 1, czyli do działalności). Wcześniej aplikacja doliczała ją każdemu
  ryczałtowcowi — naprawione przy X25.
- **Składki społeczne**: pole ręczne (kwota miesięczna × liczba miesięcy), wliczane
  w koszty i pokazywane w kartach. **Wysokości nie wyliczamy** — zależy od ulg
  (ulga na start, preferencyjny, mały ZUS+) i zbiegu z etatem; automat byłby
  kwalifikowaniem cudzej sytuacji prawnej. To świadoma granica, nie brak.

### „Import usług" (Joanna, Marta)

Nie liczymy — **ADR-023**: prowizja Booking/Airbnb to import usług (odwrotne
obciążenie, także przy zwolnieniu podmiotowym), a panel mówi o tym wprost zdaniem
w nagłówku eksportu „Pobierz dla księgowej": „VAT od prowizji portali (import usług)
jest poza zakresem aplikacji" (`taxExport.js:112`). Warunek powrotu zapisany w ADR:
popyt od testera albo gospodarz z dużymi prowizjami; wtedy interpretacja
indywidualna KIS.

### „VAT" (Joanna)

VAT 8% od noclegów wydzielany **tylko czynnemu podatnikowi** (`isVatPayer`), przychód
do opodatkowania pomniejszany o VAT należny; pilnowane testem („VAT 8% wydzielany
tylko czynnemu podatnikowi").

## Zabezpieczenia jakości (dlaczego tym liczbom można ufać)

- 16 złotych testów z kwotami **policzonymi ręcznie z tekstów przepisów**, nie
  skopiowanymi z wyjścia kodu; test-bramka na ciche zmiany stawek w `constants.js`.
- Rejestr stawek z datą weryfikacji u źródła (2026-08-25) pokazywaną w stopce panelu;
  alarm `stawkiPrzeterminowane` łapie luty następnego roku bez aktualizacji.
- Współwłasność małżeńska: trzy układy z art. 12 ust. 5/6/13, w tym próg 200 000 zł
  po oświadczeniu — wdrożone i przetestowane.
- Kwota wolna domyślnie 0 (etat konsumuje ją u pracodawcy — domyślne 30 000
  zaniżało podatek do 3 600 zł).
- X25 przeszedł przegląd agenta `legal` przed wydaniem (2026-08-25).

## Luki znalezione przy prześwietleniu

1. **🟡 Próg zwolnienia podmiotowego VAT (art. 113, od 2026 r. 240 000 zł obrotu) nie jest
   pilnowany.** Panel pilnuje progu 100 000 zł ryczałtu, ale gospodarz zbliżający się
   do limitu obrotu nie dostanie sygnału, że kończy mu się zwolnienie z VAT.
   Dane są (przychód narastająco), wzorzec jest (istniejący próg ryczałtu) — tania
   i naturalna rozbudowa, mocna odpowiedź na „gdzie VAT". Przed wdrożeniem jedno
   pytanie do `legal`: co dokładnie wchodzi do limitu u gospodarza z noclegami
   (i czy pokazywać próg także płatnikowi VAT — nie, jemu jest zbędny).
2. **🟢 Kwota VAT od importu usług** — prowizje siedzą w danych, arytmetyka prosta,
   ale ADR-023 świadomie się wstrzymał do sygnału popytu. Zostaje jak jest.
3. **🟢 Składki społeczne ręczne** — granica świadoma i dobrze uzasadniona. Zostaje.
4. **🧹 Nieaktualny komentarz w `constants.js`** (przy `ryczaltNajem`): twierdzi,
   że progu małżonków 200 000 zł „jeszcze nie ma" i „wymaga pola w ustawieniach",
   a pole (`spouseRental`) i logika istnieją i są przetestowane. Kłamiący komentarz
   do sprzątnięcia.

## Werdykt

Panel **udźwignie zarzuty z komentarzy** — na każdy z czterech ma odpowiedź w kodzie
albo świadomą, zapisaną w ADR granicę, o której mówi wprost. Treść posta z aktualizacją
jest bezpieczna: nie obiecuje niczego ponad stan (pilnowanie progu 100 000 zł, VAT od
noclegów, eksport z zastrzeżeniem o imporcie usług). Rekomendacja rozbudowy przed betą:
pozycja 1 (próg zwolnienia podmiotowego VAT — 240 000 zł od 2026, korekta po analizie legal z tego samego dnia; pierwotnie pisałem tu 200 000 zł) — decyzja właściciela.
