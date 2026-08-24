# Rentowność WynajemPRO — symulacja (2026-08-22)

> **Po co ten dokument.** Właściciel zapytał o rentowność przy okazji decyzji o rozbudowie
> synchronizacji (X26, [[Projects/Roadmap]]). Model liczy, czy produkt się spina, gdzie są
> sufity i który wariant techniczny ile kosztuje.
>
> ⚠️ **To nie jest porada podatkowa.** Stawki ZUS i podatku są modelowane wg publicznych
> danych na 2026 r. i **wymagają potwierdzenia u księgowego** przed decyzją o formie
> działalności. Model liczy przepływy, nie zastępuje księgowości.

## Założenia — wszystkie jawne

| Pozycja | Wartość | Skąd |
|---|---|---|
| Cena | 29,99 zł/mc za konto | stan kodu; **cennik niezatwierdzony** ([[strategy/Plan-wdrożenia-na-rynek]]) |
| Stripe, karty EOG | 1,5% + 1,00 zł | cennik Stripe PL |
| Firestore, darmowy próg | 50 000 odczytów/dobę | Firebase Blaze |
| Firestore ponad próg | 0,06 USD / 100 tys. odczytów | Firebase |
| Kurs USD | 3,80 zł | **założenie** |
| Profil gospodarza | 3 obiekty × 2 źródła iCal | **założenie** |
| Limit nierejestrowanej | 10 813,50 zł/kwartał | 225% × 4 806 zł (2026) |
| **Zatrudnienie właściciela** | **umowa o pracę w innym miejscu** | stan na 2026-08-22 |
| Zdrowotna, ryczałt, ≤60 tys./rok | 498,35 zł/mc | 60% × 9 228,64 zł × 9% (ZUS 2026) |
| Zdrowotna, ryczałt, 60–300 tys./rok | 830,58 zł/mc | 100% × 9 228,64 zł × 9% |
| Składki społeczne z JDG | **0 zł** | zbieg tytułów — patrz sekcja 3 |
| Księgowość przy JDG | 200 zł/mc | **założenie** |

**Czego model NIE liczy:** własnego czasu właściciela (realnie największy koszt), obciążenia
wsparciem, kosztu pozyskania klienta, zwrotów i nieudanych płatności.

---

## 1. 🔥 Znalezisko, które wypadło mimochodem, a jest najważniejsze

Model liczył koszt Firebase przy trzech wariantach naprawy synchronizacji iCal (X26). Wyszło coś,
czego nie było widać z poziomu kodu:

| Wariant synchronizacji | Odczytów/dobę na konto | Ile kont mieści się za darmo |
|---|---|---|
| **Dziś** — raz na dobę, 1 odczyt na każde zdarzenie | 480 | ~104 |
| **Naiwna naprawa** — co godzinę, ten sam wzorzec odczytu | 4 620 | **~10** |
| **Dobra naprawa** — co godzinę, 1 dokument stanu na kanał | 444 | **~112** |

🛑 **Oczywista naprawa („zwiększmy częstotliwość do godziny") ścina zapas z ~104 kont do ~10.**
Dziesięciokrotnie. Bo dzisiejszy kod robi osobne zapytanie do Firestore na **każde zdarzenie**
w feedzie, a przy 24 przebiegach dziennie to się mnoży.

✅ **Właściwa naprawa jest jednocześnie tańsza od stanu obecnego** — 444 odczyty zamiast 480,
przy synchronizacji 24 razy częstszej. Wystarczy trzymać jeden dokument stanu na kanał
(mapa `UID → daty`) i porównywać w pamięci, zamiast odpytywać bazę o każde zdarzenie.

To jest argument, że w X26 nie wolno pójść na skróty: skrót kosztuje realne pieniądze,
a zrobienie tego dobrze kosztuje mniej niż nicnierobienie.

---

## 2. Rentowność jednostkowa: produkt spina się od pierwszego klienta

| Kont | Przychód | Stripe | Firebase | Stałe | Zysk/mc | Marża |
|---:|---:|---:|---:|---:|---:|---:|
| 5 | 149,95 | 7,25 | 0,00 | 5,00 | **137,70** | 91,8% |
| 20 | 599,80 | 29,00 | 0,00 | 5,00 | **565,80** | 94,3% |
| 50 | 1 499,50 | 72,49 | 0,00 | 5,00 | **1 422,01** | 94,8% |
| 120 | 3 598,80 | 173,98 | 0,23 | 5,00 | **3 419,59** | 95,0% |
| 300 | 8 997,00 | 434,96 | 5,77 | 5,00 | **8 551,28** | 95,0% |

✅ **Marża ~95% na każdej skali.** Infrastruktura nie jest problemem tego biznesu i nie będzie —
przy 300 kontach Firebase kosztuje **5,77 zł miesięcznie**.

📌 Jedynym realnym kosztem zmiennym jest Stripe: **1,45 zł od transakcji**, czyli **4,8%** przy
cenie 29,99 zł. Uwaga: to opłata stała 1 zł robi tu robotę, nie procent. Przy cenie 49 zł ten
sam koszt spada do 3,0% przychodu.

**Odpowiedź na pytanie o pocztę:** przechwytywanie maili (Cloudflare Email Routing) to **0 zł**
kosztu infrastruktury. Ryzykiem tego pomysłu jest twój czas i utrzymanie parserów, nie rachunki.

---

## 3. Umowa o pracę zmienia strukturę kosztów

🔥 **Właściciel jest zatrudniony na UoP w innym miejscu.** Przy zbiegu tytułów do ubezpieczeń
(UoP z wynagrodzeniem co najmniej minimalnym) JDG **nie rodzi obowiązku składek społecznych** —
emerytalnej, rentowej, wypadkowej. Zostaje wyłącznie **składka zdrowotna**, bo tę płaci się
osobno z każdego tytułu.

⚠️ **Do potwierdzenia u księgowego** i ważne tak długo, jak trwa etat. Rezygnacja z pracy
włącza pełny ZUS i **zmienia ten model** — patrz różnica w tabeli niżej.

Zdrowotna przy ryczałcie jest progowa, liczona od przeciętnego wynagrodzenia 9 228,64 zł:

| Przychód roczny | Składka/mc | Przy cenie 29,99 zł to… |
|---|---:|---|
| do 60 000 zł | **498,35 zł** | do 166 kont |
| 60 000 – 300 000 zł | **830,58 zł** | od 167 kont |
| powyżej 300 000 zł | 1 495,04 zł | od 834 kont |

📌 Od 2026 ryczałtowiec odlicza **50% zapłaconej zdrowotnej od przychodu**, co model uwzględnia.

### Ile zostaje na rękę (JDG + UoP, ryczałt 12%, księgowość 200 zł)

| Kont | Przychód | Stripe | Zdrowotna | Ryczałt | **Na rękę** |
|---:|---:|---:|---:|---:|---:|
| 50 | 1 499,50 | 72,49 | 498,35 | 150,04 | **573,62** |
| 100 | 2 999,00 | 144,99 | 498,35 | 329,98 | **1 820,69** |
| 120 | 3 598,80 | 173,98 | 498,35 | 401,95 | **2 319,51** |
| 170 | 5 098,30 | 246,47 | 830,58 | 561,96 | **3 254,28** |
| 250 | 7 497,50 | 362,46 | 830,58 | 849,87 | **5 249,59** |
| 400 | 11 996,00 | 579,94 | 830,58 | 1 389,69 | **8 990,79** |

✅ **Próg wyjścia na zero na JDG: 28 kont** (z księgowością). Bez etatu, z ZUS-em preferencyjnym,
byłoby to ok. 33 konta, a po jego wyczerpaniu znacznie więcej.

> ⚠️ **Errata do wcześniejszej wersji tego dokumentu.** Poprzednio przyjąłem zdrowotną 461,66 zł
> i próg „17 kont" dla ulgi na start. Prawidłowa stawka dla ryczałtu w 2026 to **498,35 zł**,
> a próg 17 kont nie zawierał księgowości. **Właściwa liczba to 28 kont.**

### Ile kont daje dany dochód

| Cel na rękę | 29,99 zł z UoP | 29,99 zł bez etatu | 49 zł z UoP | 49 zł bez etatu |
|---|---:|---:|---:|---:|
| 1 000 zł/mc | 68 | 86 | **41** | 52 |
| 3 000 zł/mc | 148 | 166 | **89** | 100 |
| 5 000 zł/mc | 240 | 259 | **145** | 156 |
| 8 000 zł/mc | 361 | 379 | **218** | 229 |

📌 Etat oszczędza ok. 456 zł/mc, czyli **równowartość 15–18 kont**. Realna, ale nie przełomowa.
**Prawdziwa przewaga etatu nie jest w tej tabeli**: dzięki niemu firma nie musi cię utrzymywać
w pierwszym roku. To jest właśnie warunek, który sprawia, że plan z niską ceną w ogóle jest
wykonalny — większość osób nie może sobie na niego pozwolić.

---

## 4. 🔴 Sufit nierejestrowanej — i dlaczego wypada W TRAKCIE roku 1

Limit działalności nierejestrowanej w 2026 to **10 813,50 zł na kwartał**.

| Cena | Sufit w kontach | Maks. przychód roczny |
|---|---:|---:|
| 29,99 zł | 120 | 43 186 zł |
| 39,00 zł | 92 | 43 056 zł |
| 49,00 zł | 73 | 42 924 zł |

🔥 **Limit siedzi na przychodzie, nie na liczbie klientów — cena go nie podnosi.**

⚠️ **To ma bezpośrednie znaczenie dla planu „rok 1 na niskiej cenie i jak najwięcej klientów":
sufit wypada przy 120 kontach, czyli prawdopodobnie w trakcie tego roku, a nie po nim.**
Przekroczenie limitu w kwartale to problem zgodności, nie formalność.

✅ Dobra wiadomość: przy etacie JDG kosztuje **498,35 zł/mc** i pokrywa się przy 28 kontach.
**Rekomendacja: zarejestrować JDG przy ok. 100 kontach, z zapasem — nie przy 120.**

---

## 5. Plan penetracyjny: niska cena teraz, podwyżka z nową wartością

**Plan właściciela (2026-08-22):** przez pierwszy rok możliwie niska cena kosztem zarobku, żeby
pozyskać jak najwięcej klientów; potem funkcje, które podnoszą koszt utrzymania, i **jednocześnie
podwyżka dająca klientowi realny zysk** — płaci więcej, ale narzędzie z każdą aktualizacją potrafi więcej.

### Co model mówi na jego korzyść

🔥 **Podwyżka ma ogromny zapas na odpływ klientów.** Przy przejściu z 29,99 zł na inną cenę
przychód pozostaje ten sam nawet po utracie:

| Podwyżka | Możesz stracić i wyjść na zero |
|---|---:|
| 29,99 → 39 zł | **23,1%** klientów |
| 29,99 → 49 zł | **38,8%** klientów |
| 29,99 → 59 zł | **49,2%** klientów |

Czyli przy podwyżce do 49 zł mógłbyś stracić **niemal czterech na dziesięciu** klientów i mieć
dokładnie ten sam przychód — przy niższych kosztach obsługi i mniejszym obciążeniu wsparciem.

✅ **Obawa o koszty nowych funkcji jest w dużej mierze bezpodstawna.** Firebase przy 400 kontach
to jednocyfrowe złotówki, przechwytywanie maili kosztuje 0 zł. Jedyne realnie drogie dodatki to
usługi zewnętrzne (Channex od 608 zł/mc) i **twój czas**. Nie bój się kosztu funkcji — bój się
czasu potrzebnego na ich dowiezienie.

### Czego model nie kupuje w ciemno

🛑 **Niska cena selekcjonuje kohortę najwrażliwszą na cenę.** Klienci pozyskani za 29,99 zł to
z definicji ci, którzy najgorzej zniosą 49 zł. Zapas 38,8% będzie sprawdzany mocniej niż średnio.

🛑 **Podwyżka to moment ponownej decyzji dla każdego klienta.** Jeśli produkt nie poprawił się
widocznie, odpływ przebije 38,8% i to nie będzie porażka cennika, tylko porażka dowożenia.
Przy pracy w pojedynkę to jest **główne ryzyko tego planu**.

🔴 **Warunki founding members trzeba rozstrzygnąć PRZED pierwszą sprzedażą, nie przed podwyżką.**
Koszt obietnicy „stara cena na zawsze":

| Pierwsza kohorta | Koszt utrzymania 29,99 zł zamiast 49 zł |
|---:|---|
| 50 klientów | 950 zł/mc = **11 406 zł/rok** |
| 120 klientów | 2 281 zł/mc = **27 374 zł/rok** |
| 200 klientów | 3 802 zł/mc = **45 624 zł/rok** |

⚖️ **Rekomendacja: cena founding members ograniczona w czasie (np. 12 miesięcy), nie wieczysta.**
Zachowuje obietnicę wobec pierwszych klientów i nie zabija planu. Wieczysta blokada pierwszej
kohorty kosztuje przy 120 klientach **27 tys. zł rocznie, bezterminowo** — i dotyczy dokładnie
tych osób, które będą z tobą najdłużej.

🛡️ **Jedno przeramowanie:** nie ogłaszaj „podwyżki". Twoje własne sformułowanie — „płaci więcej,
ale ma mega dopracowane narzędzie" — jest gotową odpowiedzią. **Nową cenę wypuszcza się razem
z nazwanym wydaniem**, żeby była przypięta do widocznego wydarzenia, a nie do daty w kalendarzu.

---

## 6. Odpływ klientów — koszt utrzymania stanu

| Churn | Średnie życie klienta | LTV | Nowych/mc przy 120 kontach, żeby stać w miejscu |
|---|---:|---:|---:|
| 2%/mc | 50 mc | 1 427 zł | 2,4 |
| 5%/mc | 20 mc | 571 zł | 6,0 |
| 8%/mc | 12,5 mc | 357 zł | 9,6 |

📌 Przy churnie 8% i cenie 29,99 zł **LTV wynosi 357 zł**. To jest sufit tego, ile wolno wydać
na pozyskanie jednego klienta — i przy płatnej reklamie w Polsce jest to kwota niekomfortowo niska.
Model potwierdza to, co zakłada plan marketingowy: **przy tej cenie kanały płatne się nie spinają,
liczy się pozyskanie organiczne.** Podniesienie ceny do 49 zł podnosi LTV przy tym samym churnie
do ok. 620 zł i dopiero wtedy warto w ogóle rozmawiać o reklamie.

---

## 7. Wariant z pośrednikiem API (Channex)

130 USD/mc + 0,50 USD za obiekt, przy 3 obiektach na konto:

| Kont | Koszt kanału/mc | Wynik/mc |
|---:|---:|---:|
| 20 | 608 zł | **−42 zł** |
| 40 | 722 zł | +415 zł |
| 60 | 836 zł | +871 zł |
| 120 | 1 178 zł | +2 242 zł |

✅ **Próg wyjścia na zero: 22 płacące konta.** Niżej, niż zakładałem w analizie X26 — pośrednik
API przestaje być mrzonką szybciej, niż się wydawało.

⚖️ Ale to nadal nie jest decyzja na dziś: przy zerze płacących klientów oznaczałaby 608 zł/mc
stałego kosztu bez przychodu. **Warunek wyzwalający: ok. 40 płacących kont** — wtedy Channex
jest już na plusie od pierwszego miesiąca i domyka zarzut o ceny i czas reakcji.

---

## 8. Wnioski

1. ✅ **Produkt jest rentowny jednostkowo od pierwszego klienta.** Marża ~95%, infrastruktura
   pomijalna. Obawa o rentowność nie dotyczy kosztów — dotyczy **skali i tempa**.
2. ✅ **Etat zmienia strukturę kosztów i czyni plan penetracyjny wykonalnym.** Zero składek
   społecznych z JDG, próg wyjścia na zero przy 28 kontach, a firma nie musi cię utrzymywać
   w roku 1. ⚠️ Rezygnacja z pracy unieważnia ten model.
3. 🔴 **Sufit nierejestrowanej (120 kont) wypada w trakcie roku 1, nie po nim.** JDG rejestrować
   z zapasem, przy ok. 100 kontach.
4. ✅ **Plan „tanio teraz, drożej z nową wartością" ma pokrycie w liczbach** — podwyżka do 49 zł
   znosi utratę 38,8% klientów bez spadku przychodu.
5. 🔴 **Najpilniejsza decyzja to warunki founding members**, bo zapada przed pierwszą sprzedażą.
   Wieczysta stara cena dla 120 klientów kosztuje 27 374 zł rocznie, bezterminowo.
6. 🛑 **Głównym ryzykiem planu nie jest cennik, tylko dowożenie funkcji** przed podwyżką.
7. ✅ **Nowe funkcje nie podniosą istotnie kosztów utrzymania** — poza usługami zewnętrznymi.
   Przechwytywanie maili (X27) kosztuje 0 zł infrastruktury.
8. ⏸ **Channex: warunek wyzwalający ~40 płacących kont.**

## 9. Do decyzji właściciela

- [ ] 🔴 **Warunki founding members** — cena ograniczona w czasie (rekomendacja: 12 miesięcy)
      czy wieczysta? Decyzja zapada **przed pierwszą sprzedażą**.
- [ ] **Cena docelowa po roku 1** — 39, 49 czy 59 zł. Od tego zależy, ile klientów potrzebujesz.
- [ ] **Moment rejestracji JDG** — rekomendacja: przy ok. 100 kontach.
- [ ] **Potwierdzenie u księgowego**: zbieg tytułów przy UoP, progi zdrowotnej, ryczałt 12%.
