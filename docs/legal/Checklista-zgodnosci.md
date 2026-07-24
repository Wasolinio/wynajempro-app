# PROJEKT — checklista zgodności przedlaunchowej WynajemPRO

> **Status:** materiał roboczy agenta `legal` do blokera launchu **N4** (roadmapa NOW).
> To NIE jest opinia prawna. Wszystkie projekty dokumentów (`Regulamin.md`,
> `Polityka-prywatnosci.md`, `DPA-powierzenie.md`) i ustalenia poniżej **wymagają
> weryfikacji prawnika-człowieka** przed publikacją i przed przyjęciem pierwszej płatności.
>
> **Data sporządzenia:** 2026-07-04 · **Data weryfikacji podstaw prawnych (WebSearch):** 2026-07-04.
>
> **[AKTUALIZACJA 2026-07-24 · legal]** Zamknięto pozycję **„Wycofanie zgody cookie"** (sekcja B)
> — mechanizm wdrożony na produkcję 2026-07-24 (N6.1, commit `495aace`); skorygowano powiązany
> wiersz stanu faktycznego w sekcji A. Podstawę „art. 173 Prawa telekomunikacyjnego" oznaczono
> jako **nieaktualną** i przekazano do rozstrzygnięcia prawnikowi w ramach N4 (PKE od 2024-11-10)
> — samej podstawy **nie przepisano**. Podstawy prawne poza tym jednym wyjątkiem pozostają
> zweryfikowane na 2026-07-04 i wymagają odświeżenia przy najbliższym przeglądzie.

---

## A. Stan faktyczny ustalony z kodu (fundament analizy)

Ustalone bezpośrednio w repozytorium, nie z deklaracji:

| Fakt | Źródło w kodzie |
|---|---|
| Dwie warstwy danych: konto Gospodarza (`users/{uid}`) + dane Gości/Najemców (rezerwacje, podpisy, sekrety) | `docs/Agent-Process-Map.md`, `firestore.rules` |
| Podpisy gości: data akceptacji, opcj. imię/podpis, migawka regulaminu → `guides/{id}/signatures/{uid}`; gość uwierzytelniany anonimowo | `src/pages/GuestGuideView.jsx:113-122` |
| Sekrety (PIN, WiFi) w `guides/{id}/secrets/data`, ujawniane po podpisie | `firestore.rules:142-148`, `GuestGuideView.jsx:100-106` |
| `hostProfile` publiczny zawiera m.in. **adres i telefon** gospodarza | `SettingsModal.jsx:103,108`; `firestore.rules:99` |
| Płatności: Stripe, subskrypcja 29,99 zł/mc, brak przechowywania kart | `functions/index.js`, `PaywallScreen.jsx` |
| Usuwanie danych: `deleteUserAccount` (profil + guides + Storage + Auth) i `deleteExpiredAccountsData` (po karencji) | `functions/index.js` |
| **Analytics ładowany DOPIERO po zgodzie** (`cookie_consent==='true'`) — model opt-in | `src/firebase.js:58-68` |
| Banner cookie zapisuje zgodę w `localStorage`; brak łatwego wycofania/granularności — **[STATUS 2026-07-24 · legal] część „brak łatwego wycofania" jest nieaktualna**: wycofanie i zmiana zgody wdrożone na produkcję 2026-07-24 (patrz sekcja B). Bez zmian pozostaje brak granularności — wybór jest binarny (analityka albo tylko niezbędne), bo analityka jest jedyną kategorią nie-niezbędną | `src/components/ConsentNotice.jsx`; po 2026-07-24 także `src/firebase.js`, `src/pages/PrivacyPage.jsx`, `src/pages/landing/LandingPage.jsx` |
| **N1/N2/N3 zaślepione w regułach**: weryfikacja e-mail, subskrypcja, walidacja schematu zwracają `true`/są zakomentowane | `firestore.rules:9-63` |

---

## B. Tabela ustaleń: luka → ryzyko → priorytet → rekomendacja

| Obszar | Stan obecny | Ryzyko | Priorytet | Rekomendacja | Podstawa prawna |
|---|---|---|---|---|---|
| **DPA / powierzenie** | Brak jakiejkolwiek umowy powierzenia; gospodarz przetwarza dane swoich gości bez podstawy relacji z procesorem | Przetwarzanie danych gości bez wymaganej umowy powierzenia; ryzyko po stronie i Operatora, i gospodarzy; potencjalne kary PUODO | 🔴 bloker | Wdrożyć `DPA-powierzenie.md` jako element akceptowany przy rejestracji | art. 28 RODO |
| **Podstawy prawne w Polityce** | Istniejąca `PrivacyPage` nie podaje podstaw z art. 6 RODO ani okresów przechowywania | Niespełnienie obowiązku informacyjnego (art. 13 RODO) | 🔴 bloker | Wdrożyć rozbudowaną `Polityka-prywatnosci.md` | art. 6, 13 RODO |
| **Prawo odstąpienia / treści cyfrowe** | Regulamin (kod) nie reguluje odstąpienia ani utraty prawa przy rozpoczęciu świadczenia | Roszczenia konsumentów, klauzule abuzywne, kara UOKiK | 🔴 bloker | Wdrożyć §7 Regulaminu; zaprojektować zgodę na rozpoczęcie świadczenia + potwierdzenie na trwałym nośniku | ustawa o prawach konsumenta (m.in. art. 27, 38); reżim treści/usług cyfrowych |
| **Dane rejestrowe Operatora** | Regulamin/Polityka mówią „operator aplikacji" — brak firmy, NIP, adresu, kontaktu | Brak wymaganych danych usługodawcy i administratora | 🔴 bloker | Właściciel uzupełnia placeholdery `[DO UZUPEŁNIENIA]` | art. 5 UŚUDE; art. 13 RODO |
| **N1–N3 zaślepione w regułach** | Weryfikacja e-mail, subskrypcja, walidacja schematu wyłączone | DPA/Polityka deklarowałyby środki, których kod nie egzekwuje → niezgodność deklaracji ze stanem | 🔴 bloker | Nie publikować dokumentów, dopóki N1–N3 nie wdrożone (albo dostosować opis środków) | art. 5 ust. 2 (rozliczalność), art. 32 RODO |
| **Transfery poza EOG** | Polityka (kod) mówi ogólnikowo „UE lub inne bezpieczne lokalizacje" | Brak wskazania mechanizmu transferu (SCC/DPF) | 🟡 ważne | Ustalić region Firebase i mechanizmy transferu; uzupełnić Politykę i DPA | art. 44–49 RODO |
| **Wycofanie zgody cookie** | **[STATUS 2026-07-24 · legal] POZYCJA ZAMKNIĘTA.** Mechanizm równie łatwego wycofania i zmiany zgody działa **na produkcji od 2026-07-24** (N6.1; deploy `hosting:app`, commit `495aace`, site `wynajempro` / `wynajempro.com`). Dwa wejścia: link „Ustawienia cookies" w stopce landingu oraz przycisk „Zmień lub wycofaj zgodę na cookies" na `/prywatnosc`; oba otwierają ponownie banner z symetrycznym wyborem i linią statusu. Wycofanie ustawia flagę opt-out `ga-disable-<measurementId>`, wyłącza zbieranie po stronie Firebase i kasuje pliki cookies `_ga*`. *Stan przed wdrożeniem (do 2026-07-24): „banner nie pozwala łatwo wycofać zgody ani wybrać granularnie".* | Ryzyko „zgoda niespełniająca standardu równie łatwego wycofania" **zdjęte dla serwisu i strony Polityki**. **Zastrzeżenie zakresu — pozostaje otwarte:** strony gościa (`/guide/…`, `/opinie/…`) nie mają dziś na produkcji wejścia do panelu zgód, a to tam analityka uruchamia się wobec osób niebędących użytkownikami | **ZAMKNIĘTE 2026-07-24** (było 🟡 ważne) — otwarte zastrzeżenie zakresu: 🟡 ważne | **Dowód:** przepływ akceptacja → wycofanie przeklikany end-to-end na produkcji 2026-07-24 (flaga skasowana, `ga-disable-<id>=true`, cookies `_ga*` usunięte); testy `e2e/cookie-consent.spec.js` 3/3; kod: `src/firebase.js`, `src/components/ConsentNotice.jsx`, `src/pages/PrivacyPage.jsx`, `src/pages/landing/LandingPage.jsx`. Opis: `Bezpieczenstwo-kont-i-danych.md` §9.1, `Polityka-prywatnosci.md` §9. **Do wdrożenia zostaje** wejście do panelu zgód na stronach gościa — przygotowane w kodzie przez `dev`, **przed wdrożeniem** (deploy = decyzja właściciela) | art. 7 ust. 3 RODO; ~~art. 173 Pr. tel.~~ → **[Do przeglądu prawnika — N4, odnotowano 2026-07-24]** podstawa nieaktualna: od 10.11.2024 obowiązuje **Prawo komunikacji elektronicznej** (Dz.U. 2024 poz. 1221), cookies — **art. 399 PKE**; pełną korektę podstawy przesądza prawnik (patrz sekcja C) |
| **Termin reklamacji** | Kod TermsPage: „14 dni roboczych" | Dla konsumenta termin może być krótszy/inny; „robocze" bywa kwestionowane | 🟡 ważne | Ujednolicić na 14 dni; potwierdzić reżim dla usług cyfrowych | ustawa o prawach konsumenta |
| **Omnibus przy founding members** | Rabat roczny dla bety; brak reguł prezentacji obniżki | Kara UOKiK do 10% obrotu za wadliwą prezentację obniżki | 🟡 ważne | Jeśli komunikować jako „obniżkę" — podać najniższą cenę z 30 dni; albo komunikować jako ofertę wprowadzającą, nie obniżkę | dyrektywa Omnibus / art. 4 ustawy o informowaniu o cenach |
| **Faktury / VAT** | Brak informacji o fakturach i statusie VAT | Niepewność rozliczeń, obowiązki podatkowe | 🟡 ważne | Właściciel + księgowy: ustalić VAT i wystawianie faktur | przepisy podatkowe |
| **hostProfile publiczny (adres/telefon)** | Adres i telefon gospodarza mogą być publiczne w przewodniku | Gospodarz powinien wiedzieć, że to publiczne | 🟢 porządkowe | Dodać w UI informację, że te pola są widoczne publicznie | zasada przejrzystości, art. 5 RODO |
| **Rejestr czynności (RCP/RCPP)** | Brak wzmianki o rejestrach | Formalny obowiązek dokumentacyjny | 🟢 porządkowe | Przygotować rejestr czynności (administrator) i kategorii (procesor) | art. 30 RODO |

---

## C. Podstawy prawne z datą weryfikacji i źródłami

Zweryfikowane 2026-07-04. Preferowane źródła oficjalne. **Nie cytowano przepisów z pamięci** — poniżej odesłania do źródeł; dokładne brzmienie artykułów potwierdza prawnik.

- **RODO** — Rozporządzenie (UE) 2016/679. Kluczowe: art. 6 (podstawy), art. 13 (obowiązek informacyjny), art. 15–21 (prawa), art. 28 (powierzenie), art. 30 (rejestry), art. 32 (bezpieczeństwo), art. 33 (naruszenia), art. 44–49 (transfery). Źródło: EUR-Lex.
- **Ustawa o prawach konsumenta** (Dz.U. 2014 poz. 827, tekst jednolity aktualizowany) — odstąpienie (art. 27), utrata prawa odstąpienia dla usług/treści cyfrowych (art. 38), reżim zgodności treści/usług cyfrowych (rozdz. 5b, po nowelizacji wdrażającej dyrektywy 2019/770 i 2019/771). Źródło ISAP: tekst ujednolicony (stan aktualizowany 2026-03-10).
- **Ustawa o świadczeniu usług drogą elektroniczną** — obowiązek regulaminu i danych usługodawcy (art. 5, 8).
- **Dyrektywa Omnibus / informowanie o cenach** — obowiązek podawania najniższej ceny z 30 dni przy obniżkach; nadzór i kary UOKiK. Źródło: UOKiK, PARP.
- **Prawo telekomunikacyjne** — zasada zgody na cookies nie-niezbędne (art. 173).
  > **[Do przeglądu prawnika — N4, odnotowano 2026-07-24]** Ta podstawa jest **nieaktualna**.
  > Ustawa z 12.07.2024 — **Prawo komunikacji elektronicznej** (Dz.U. 2024 poz. 1221) weszła
  > w życie **10.11.2024** i zastąpiła Prawo telekomunikacyjne (wraz z przepisami
  > wprowadzającymi — Dz.U. 2024 poz. 1222). Przechowywanie informacji i dostęp do informacji
  > w telekomunikacyjnym urządzeniu końcowym (cookies) reguluje **art. 399 PKE**, z wyłączeniem
  > dla mechanizmów niezbędnych do świadczenia żądanej usługi. **Świadomie nie przepisuję
  > podstawy w dokumentach** — pełną korektę brzmienia (w tym przepis odsyłający do definicji
  > zgody z RODO, wskazywany jako art. 402 PKE, którego numeracji **nie potwierdziłem
  > w tekście urzędowym** w tej sesji) przesądza prawnik-człowiek. Zmiana nie dotyka
  > merytoryki: model opt-in i zgoda w rozumieniu RODO pozostają. **Weryfikacja źródeł:
  > 2026-07-24.**

**Źródła (linki):**
- [Ustawa o prawach konsumenta — tekst ujednolicony, ISAP (stan 2026-03-10)](https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20140000827/U/D20140827Lj.pdf)
- [Nowe zasady dla treści/usług cyfrowych — PARP](https://fers.parp.gov.pl/publikacje/publication/dostarczanie-tresci-cyfrowych-i-uslug-cyfrowych-oraz-sprzedaz-towarow-z-elementami-cyfrowymi-nowe-zasady-dla-przedsiebiorcow)
- [Prawo odstąpienia — umowy szczególne, UOKiK](https://prawakonsumenta.uokik.gov.pl/prawo-odstapienia-od-umowy/umowy-szczegolne/)
- [Informacje o obniżkach cen (Omnibus) — UOKiK](https://prawakonsumenta.uokik.gov.pl/prawo-do-informacji/informacje-o-obnizkach-cen/)
- [Dyrektywa Omnibus — obowiązek informowania o cenach, PARP](https://www.parp.gov.pl/component/content/article/82715:dyrektywa-omnibus-obowiazek-informowania-o-cenach)
- [Wzór umowy powierzenia — UODO](https://uodo.gov.pl/pl/file/2110)
- [Administrator, procesor, odbiorca — PARP](https://www.parp.gov.pl/component/content/article/80756:administrator-procesor-odbiorca-kto-jest-kim-w-systemie-ochrony-danych-osobowych)
- **[dodane 2026-07-24]** [Ustawa z 12.07.2024 — Prawo komunikacji elektronicznej, ISAP (Dz.U. 2024 poz. 1221)](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001221)
- **[dodane 2026-07-24]** [Przepisy wprowadzające ustawę — Prawo komunikacji elektronicznej, ISAP (Dz.U. 2024 poz. 1222)](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001222)
- **[dodane 2026-07-24]** [Ministerstwo Cyfryzacji — PKE obowiązuje od 10.11.2024](https://www.gov.pl/web/cyfryzacja/lepsza-ochrona-konsumentow-dzieki-przepisom-prawa-komunikacji-elektronicznej)

> **Niepewność nazwana:** w ISAP/Dzienniku Ustaw widnieją nowelizacje ze stycznia i marca 2026
> (m.in. Dz.U. 2026 poz. 252 oraz ustawa z 23.01.2026). Ich treści NIE udało się zweryfikować
> z plików binarnych PDF w tej sesji — **prawnik musi sprawdzić, czy nowelizacje 2026 zmieniają
> reżim usług cyfrowych / subskrypcji / prawa odstąpienia.** Nie cytuję ich, bo nie potwierdziłem treści.

---

## D. Pytania i decyzje dla właściciela (Wasyl) — do uzupełnienia PRZED wysłaniem do prawnika

1. **Dane rejestrowe firmy:** pełna nazwa/firma, forma prawna (JDG / sp. z o.o. / inna), adres siedziby, NIP, REGON, (KRS jeśli dotyczy). → wypełnia wszystkie `[DO UZUPEŁNIENIA]` dot. Operatora.
2. **Adresy kontaktowe:** e-mail ogólny, e-mail do spraw RODO, e-mail/adres do reklamacji i odstąpień, adres korespondencyjny.
3. **Domena produkcyjna** (np. wynajempro.pl) — do wpisania w dokumentach.
4. **IOD:** czy powołano Inspektora Ochrony Danych? (dla tej skali zwykle nieobowiązkowy — potwierdzi prawnik).
5. **VAT i faktury:** czy Operator jest podatnikiem VAT? czy 29,99 zł to brutto? jak wystawiane są faktury?
6. **Founding members:** dokładne warunki (kto się kwalifikuje, wysokość i typ rabatu rocznego, data zakończenia naboru) oraz sposób komunikacji (oferta wprowadzająca vs „obniżka" — ma skutki wg Omnibus).
7. **Model odstąpienia:** potwierdzić, że trial 14 dni jest BEZ pobrania płatności (wpływa na konstrukcję §7 Regulaminu).
8. **Numer wersji i data wejścia w życie** dokumentów.
9. **Kancelaria/prawnik do weryfikacji** — otwarta decyzja nr 4 roadmapy; do wyboru przez właściciela.
10. **Sposób wdrożenia DPA:** integralna część Regulaminu przy rejestracji czy osobny dokument akceptowany w panelu? (rekomendacja: część Regulaminu).

## E. Punkty do BEZWZGLĘDNEJ weryfikacji prawnika

1. **Sekcja odstąpienia (Regulamin §7)** — konstrukcja zgody na rozpoczęcie świadczenia i utraty prawa odstąpienia, dopasowana do faktycznego przepływu Stripe. Największe ryzyko sporne.
2. **Status „przedsiębiorcy na prawach konsumenta"** dla gospodarzy — kluczowe, bo większość to działalność gospodarcza; przesądza zakres ochrony konsumenckiej.
3. **DPA (całość)** — czy struktura art. 28 jest kompletna; zakres subprocesorów (czy Stripe jest subprocesorem danych powierzonych); tryb audytu w SaaS.
4. **Transfery poza EOG** — mechanizmy (SCC/DPF) dla Firebase i Stripe, po ustaleniu regionu.
5. **Reżim reklamacji/zgodności usługi cyfrowej** (rozdz. 5b ustawy o prawach konsumenta) — terminy i skutki.
6. **Klauzule ograniczające odpowiedzialność** (Regulamin §12) — pod kątem abuzywności.
7. **Nowelizacje 2026** (patrz sekcja C) — czy zmieniają reżim usług cyfrowych/subskrypcji.
8. **Generator umów najmu** — **[STATUS 2026-07-16 · legal] funkcja WYŁĄCZONA** (ukryta z nawigacji panelu decyzją właściciela — X16; kod widoku `ContractGeneratorView.jsx` pozostaje, ale wejście w UI usunięte, `ManagerApp.jsx` `NAV_ITEMS`; szczegóły w `Uwagi-N5-dla-prawnika.md`, aktualizacja na początku). Na dziś funkcja NIE jest oferowana użytkownikom, więc nie stanowi ryzyka produkcyjnego. Punkt pozostaje otwarty, ale przechodzi w tryb „przed ewentualnym ponownym włączeniem", a nie „przed launchem": finalizacja brzmienia disclaimera i ocena ryzyka, czy sama funkcja nie rodzi odpowiedzialności Operatora. Disclaimer wysokiego ryzyka zachowany w Regulaminie §4 ust. 1 (oznaczony jako „obecnie niedostępna") i wraca razem z funkcją.
9. **Zgodność deklarowanych środków bezpieczeństwa z faktycznym stanem** po wdrożeniu N1–N3 (koordynacja z `code-reviewer`, bramka N5).
10. **[dodane 2026-07-24] Podstawa prawna cookies po zmianie ustawy** — czym zastąpić odwołania do „art. 173 Prawa telekomunikacyjnego" w Polityce §9 i w tej checkliście (PKE, Dz.U. 2024 poz. 1221 — patrz sekcja C). Kwestia redakcyjna, ale dotyczy dokumentu publikowanego.

## F. Warunek publikacji (definicja „gotowe" dla N4)

Dokumenty można opublikować, gdy łącznie:
1. właściciel uzupełnił dane z sekcji D,
2. prawnik zweryfikował punkty z sekcji E i zaakceptował treść,
3. wdrożone są N1–N3 (żeby deklaracje odpowiadały stanowi faktycznemu),
4. `dev` wdrożył treści do `TermsPage`/`PrivacyPage` + mechanizm zgód cookie i zgody odstąpieniowej
   — **[STATUS 2026-07-24 · legal] część zrealizowana:** mechanizm zgód cookie (wyrażenie, zmiana
   i wycofanie zgody) działa na produkcji od 2026-07-24 (patrz sekcja B). **Otwarte pozostają:**
   wdrożenie zaakceptowanych przez prawnika treści dokumentów, zgoda odstąpieniowa w procesie
   płatności oraz wejście do panelu zgód na stronach gościa,
5. `code-reviewer` + `legal` przeszli bramkę N5.

---

*Materiał roboczy `legal`. Podstawy prawne zweryfikowane u źródeł 2026-07-04; podstawa dotycząca
cookies (PKE) — 2026-07-24. Aktualizacja 2026-07-24: zamknięto pozycję „Wycofanie zgody cookie"
po wdrożeniu produkcyjnym (commit `495aace`) i oznaczono nieaktualne odwołanie do Prawa
telekomunikacyjnego jako wsad do przeglądu prawnika. Ostateczna ocena zgodności należy
do prawnika-człowieka.*
