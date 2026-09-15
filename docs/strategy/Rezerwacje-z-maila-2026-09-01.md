# Rezerwacje z e-maila — analiza ścieżki i alternatyw

**Data:** 2026-09-01 · **Dla:** właściciel · **Status:** finalna
**Kontekst serii:** piąty dokument analiz strategicznych; domyka drabinę synchronizacji
z [[strategy/Sciezka-API-Booking-Airbnb-2026-09-01]] (tam szczebel 3 — Channex).

Pomysł właściciela sprzed miesięcy (śladu w docs brak — analiza od zera): narzędzie,
które z maili powiadomień Booking.com/Airbnb w skrzynce gospodarza wyciąga rezerwacje.
Metoda: 4 raporty badawcze (treść maili, technika, rynek i prawo, pozostałe alternatywy),
rekomendacja strategiczna, recenzja adwersaryjna — krytyk znalazł trzy blokery,
wszystkie naniesione.

---

## Wnioski w 60 sekund

1. **Pomysł jest dobry — jako szczebel 2 drabiny, nie zamiennik czegokolwiek.**
   Mail od portalu przychodzi **natychmiast** i niesie imię gościa, kwotę i numer
   rezerwacji — domyka dokładnie dwie największe luki iCal (opóźnienie i ubóstwo
   danych). Nigdy nie da pushu w drugą stronę (cen/dostępności), więc nie kanibalizuje
   przyszłego Channexa. Drabina: 1 = iCal (daty, co godzinę) · 2 = mail (daty+dane,
   natychmiast, jednokierunkowo) · 3 = agregator (dwukierunkowość).
2. **Żelazna zasada architektury: mail tworzy, iCal rekonsyliuje.** E-mail jest
   zdarzeniowy i gubi się po cichu (spam, zepsuty forward, wyłączone powiadomienia) —
   nie wolno mu być jedynym źródłem. Zgubiony mail = rezerwacja wpada godzinę
   później z iCal, jak dziś. Duzi gracze (Hospitable, OwnerRez) wyszli z tej ścieżki
   do API nie przez prawo, tylko przez zawodność — projektujemy od dnia 1 pod
   „zgubiony mail nie psuje kalendarza".
3. **Booking ≠ Airbnb — to dwa różne kanały.** Booking: mail bogaty (pełne dane,
   alias e-mail gościa), szablon stabilny od lat, i — kluczowe — **można dodać
   dodatkowy adres odbiorcy wprost w Extranecie** (bez grzebania w skrzynce).
   Airbnb: kanał opt-out i systematycznie zubażany (koniec aliasów e-mail 2023,
   maskowanie telefonów), tylko forward. **MVP = Booking-only.**
4. **Technika:** adres wrzutowy per konto (`u-token@mail.wynajempro.com`) + Mailgun
   Routes (darmowy start, EU, podpisane webhooki) + parser szablonowy **bez LLM**
   (dane gościa nie mogą iść do zewnętrznego modelu bez DPA). OAuth do Gmaila odpada:
   restricted scope = coroczny audyt CASA ($500–4500/rok) — absurd przy naszej skali.
   Zakres: ~6 bloków, koszt bieżący 0 zł w becie.
5. **Trzy blokery krytyka przed budową** (sekcja 6): niezweryfikowany kanał
   „dodatkowy odbiorca w Extranecie" (do sprawdzenia na Twoim żywym koncie Booking),
   brak odwrotnej rekoncyliacji rezerwacji-widm w projekcie (naprawione w specu niżej),
   oraz **paywall przekierowań w polskich skrzynkach** — WP, o2 i Onet mają
   auto-forward tylko w płatnych planach (darmowa jest Interia). To zabija wariant
   forwardowy dla sporej części targetu i przesądza o Booking-first przez Extranet.
6. **Wszystkie pozostałe alternatywy — NIE** (scraping extranetu, nieoficjalne API,
   parsowanie powiadomień push, skracanie interwału iCal — portale i tak regenerują
   feed co 2–12 h). Warunkowo tylko: wtyczka przeglądarki jako ręczny importer
   (wzorzec OwnerRez Channel Bridge — ale oni sami porzucili Airbnb) i Zapier —
   przy czym jako test popytu dałby fałszywe „nie ma popytu" u targetu 50+.

## 1. Co naprawdę niesie mail (badanie treści)

| | Booking.com | Airbnb |
|---|---|---|
| Zdarzenia z mailem | nowa rezerwacja, modyfikacja, anulacja (konfigurowalne!) | 8 typów: rezerwacja, inquiry, request, zmiana, anulacja, wypłata, recenzja, wiadomość — ale cały kanał **opt-out** |
| Pola nowej rezerwacji | numer, obiekt, gość (imię i nazwisko), daty, liczba gości, pokój/taryfa, cena, **alias e-mail gościa** `@guest.booking.com` | imię gościa, daty, kod potwierdzenia, ogłoszenie, kwota wypłaty z rozbiciem; **e-maila gościa BRAK** (koniec aliasów 09.2023), telefon maskowany |
| Nadawcy | `noreply@booking.com` (+aliasy gości/partnerów) | `automated@`, `express@`, `response@airbnb.com` |
| Uwierzytelnienie | SPF `-all` + **DMARC `p=reject`** | SPF `-all` + **DMARC `p=reject; sp=reject`** |
| Dodatkowy odbiorca u portalu | **TAK** — kontakt „Reservations" + sekcja „Your email addresses" w Messaging security (wymaga admina i 2FA) | **NIE** — tylko forward ze skrzynki albo co-host z własnym kontem |
| Stabilność szablonu | utrzymywany latami (kanał operacyjny obiektów bez CM) [niepewne — brak changelogu] | trend zubażania danych od 2020; layout przeprojektowywany (parsery szablonowe łamały się historycznie) |
| Język | wg języka konta (PL dostępny) — parser potrzebuje wariantu per język | jw. |

DMARC `p=reject` u obu = podrobiony mail „z portalu" da się twardo odsiać.
Kluczowy niuans techniczny: **forward łamie SPF, ale DKIM oryginału przeżywa** —
weryfikujemy DKIM domeny portalu, nie SPF.

## 2. Technika — werdykt wariantów

| | A. Adres wrzutowy per konto | B. OAuth Gmail/Graph | C. IMAP + hasło |
|---|---|---|---|
| Zasada | forward lub dodatkowy odbiorca → nasz MX → webhook → Cloud Function | read-only dostęp do skrzynki | logujemy się do skrzynki |
| Bariera | DNS + provider; działa od 1. dnia | **weryfikacja Google + coroczny audyt CASA $500–4500/rok** (gmail.readonly = restricted; tryb unverified: limit 100 użytkowników) | niska |
| RODO | wzorowa minimalizacja (tylko to, co przekierowane) | dostęp do CAŁEJ korespondencji — nadmiarowy | custody haseł — rażące złamanie art. 32 |
| Werdykt | ✅ **rekomendowany** | ⏸ najwyżej kiedyś | ❌ bezwarunkowo |

**Provider: Mailgun Routes** (free 100 maili/dzień — becie wystarczy; potem ~$15/mies;
catch-all route, HMAC na webhookach, region EU). Plan B: CloudMailin (free 10 tys./mies,
ale adres w ich domenie). SendGrid odpada (koniec free tier, niepodpisywane webhooki).
⚠️ Ceny z agregatorów cenowych — potwierdzić na oficjalnych stronach przed decyzją.

**Parser: szablony/regex per portal per język, wersjonowane, bez LLM.** Koszt LLM byłby
groszowy, ale dane gościa do zewnętrznego modelu = powierzenie wymagające DPA —
sprzeczne ze stanem z 2026-08-26 (plan Max bez DPA); „anonimizacja przed wysyłką"
to oksymoron, bo anonimizowalibyśmy dokładnie to, co chcemy wyciągnąć. Mail
nierozpoznany → skrzynka „przypisz ręcznie" (surowiec TTL 30 dni, potem kasacja).

**Idempotencja:** klucz `portal + numer rezerwacji` → deterministyczne ID dokumentu.
**Deduplikacja z iCal — adopcja:** sync iCal przed utworzeniem wpisu z feedu szuka
istniejącego `source:'email'` o tym samym obiekcie i datach → dopisuje `icalUid`
zamiast tworzyć duplikat. Nowe pola (`source`, `portalReservationId`, `icalUid`)
muszą wejść do allowlisty `isValidRental` (walidacja po merge'u — lekcja X26);
webhook pisze przez Admin SDK → wspólny walidator wg wzorca lustrzanego testera.

## 3. Rynek i prawo

- **Kto robi:** duzi (Hospitable, iGMS, OwnerRez, Uplisting) z tej ścieżki **wyszli
  do API** — z powodu zawodności, nie prawa. Żywy segment to generyczne parsery
  (Parseur, Mailparser, Parsio, Zapier) z utrzymywanymi od lat szablonami
  Booking/Airbnb — ścieżka komercyjnie żywa, głównie jako „klej".
- **ToS:** zakazy botów u obu portali dotyczą **dostępu do platformy/extranetu**.
  Mail doręczony do skrzynki gospodarza to jego kopia — parsowanie własnej poczty
  nie jest dostępem do platformy; klauzuli zakazującej nie znaleziono. Granica
  do trzymania twardo: **nie dotykamy extranetu, niczego nie wysyłamy na platformę**.
  Portale historycznie zubażały dane (Booking: aliasy gości ~2018; Airbnb: seria
  cięć), ale nie ścigały parserów maili.
- **RODO:** rola bez zmian (procesor gospodarza), zmienia się źródło danych —
  aneks jednozdaniowy do DPA („treść powiadomień e-mail z portali rezerwacyjnych")
  przy następnej rewizji + wiersz retencji surowca w Polityce. Konstrukcja produktu
  przeciw „przekieruję całą skrzynkę": unikalny adres per konto, **twarda biała
  lista nadawców na ingest** (mail spoza listy odrzucany przed zapisem), instrukcja
  forwardu filtrem po nadawcy, nigdy OAuth do całej skrzynki.

## 4. Pozostałe alternatywy — werdykty

| Ścieżka | Werdykt | Powód |
|---|---|---|
| Scraping extranetu z hasłami gospodarza | ❌ | custody haseł, 2FA Bookinga, ToS; ryzyko blokady ponosi gospodarz |
| Nieoficjalne API (GitHub) | ❌ | łamie ToS, pęka po cichu, historia crackdownów Airbnb |
| Parsowanie push z telefonu | ❌ | uprawnienie restricted w Google Play, działa tylko na włączonym telefonie |
| Skrócenie iCal do 10–15 min | ❌ | portale regenerują feed co 2–12 h — częstsze odpytywanie zwraca ten sam plik |
| Google Calendar / SMS portali | ❌ | ta sama rura iCal, rzadziej; SMS wygaszane |
| Wtyczka przeglądarki (sesja gospodarza) | ⚠️ warunkowo | wzorzec OwnerRez Channel Bridge — ręczny import „na klik", nie sync; oni sami porzucili Airbnb |
| Zapier/Make jako MVP | ⚠️ tylko jako pomost | dla targetu 50+ konfiguracja parsera = fałszywy sygnał „brak popytu" |

## 5. Projekt uczciwości (wymuszony przez krytyka — warunki, bez których nie budujemy)

Parser łamie się **cicho i wszystkim naraz** — to koliduje z marką „nie obiecujemy
ponad stan", chyba że wbudujemy wykrywanie:

1. **Globalna metryka pokrycia:** odsetek wpisów z iCal, które miały wcześniej mail.
   Spadek = zmiana szablonu → alarm do właściciela (nie do klientów), zanim ktokolwiek
   zauważy.
2. **Adopcja jako audyt:** wpis z feedu, którego nie da się dopasować do istniejącego
   `source:'email'` = sygnał złej ekstrakcji dat.
3. **Odwrotna rekoncyliacja widm** (luka znaleziona przez krytyka): wpis `source:'email'`
   bez adopcji przez iCal po N godzinach = oznacz „niepotwierdzony przez portal"
   w UI. Inaczej anulacja, której mail zginął, zostawia rezerwację-widmo na zawsze —
   a widmo w kalendarzu jest gorsze niż brak wpisu.
4. **Walidacja pól** (checkout>checkin, kwota w rozsądnym zakresie) z degradacją
   do „przypisz ręcznie" zamiast zapisu na ślepo.
5. **Status rury w UI** („ostatni mail z Booking: dziś 14:32") zamiast gołej obietnicy.

## 6. Trzy blokery przed decyzją o budowie

1. **Kanał „dodatkowy odbiorca" w Extranecie Booking — ✅ MECHANIZM POTWIERDZONY,
   TEST UZBROJONY (2026-09-01, sesja na żywym koncie).** Strona Kontakty ma temat
   „Rezerwacje" i przyjęła kontakt z aliasem `domkirus+rezerwacje@gmail.com` —
   co dokładnie ten kanał dostaje, rozstrzygnie najbliższa rezerwacja (obserwacja
   maili z adresatem `+rezerwacje`). Ustalenia po drodze: sekcja „Twoje adresy e-mail"
   w Ustawieniach bezpieczeństwa wiadomości to co INNEGO (biała lista adresów
   wysyłających do gości — korekta wiedzy z badania); strefy Kontaktów/Preferencji
   wiadomości wymagają dodatkowej weryfikacji 2FA i pełnego logowania — instrukcja
   onboardingu dla klientów musi to uprzedzać. Szczegóły:
   Audyt-Booking-Airbnb-2026-09-01 (projekt Domki Ruś).
2. **Paywall przekierowań w polskich skrzynkach** (ustalenie krytyka, ze źródłami):
   WP i o2 — forward tylko w płatnej „Poczcie bez reklam"; Onet — tylko w płatnym
   OnetPoczta Plus; darmowa Interia. Konsekwencja: wariant forwardowy (jedyny dla
   Airbnb!) jest martwy dla części targetu → Airbnb spada do fazy 2 również z tego
   powodu; Booking-first przez Extranet staje się warunkiem sensu całej funkcji
   (patrz bloker 1).
3. **Przedefiniowanie miernika bety nr 3 PRZED startem funkcji.** Mail zaspokoi część
   próśb o „prawdziwą synchronizację" — jeśli miernika nie rozbijemy na „chcę, żeby
   rezerwacje wpadały same" (zaspokaja mail) vs „chcę push cen i dostępności"
   (wymaga Channexa), sami zatrujemy bramkę decyzji o szczeblu 3.

## 7. Miejsce w produkcie i cenniku

- **Cennik: funkcja bazowego 29,99.** Koszt krańcowy groszowy (opłata Mailguna nie
  jest per konto), zasada „żadnych modułów wewnątrz planów", a przyszła linia planów
  zostaje czysta: **29,99 = wszystko jednokierunkowe (iCal + mail), 59,99 Sync =
  dwukierunkowość (push cen przez agregator)**. Mail w planie Sync sprzedawałby coś,
  co kosztuje grosze.
- **Komunikacja — wolno:** „Rezerwacje z Booking.com wpadają same, zwykle w minutę —
  z imieniem gościa i kwotą", „koniec z przepisywaniem rezerwacji". **Nie wolno:**
  „koniec z overbookingiem" (nadal brak pushu w drugą stronę), „channel manager",
  „synchronizacja z Booking" (sugeruje dwukierunkowość). Nazwa: **„Rezerwacje
  z e-maila"**. Granica wprost w produkcie: „Ceny i dostępność nadal ustawiasz
  w portalu; kalendarz co godzinę sprawdza spójność (iCal) — mail przyspiesza
  i wzbogaca wpis."
- **Bramki startu:** lżejsze niż dla Channexa (nie ma 590 zł/mies. kosztu stałego).
  Zostają: blokery 1–3 z sekcji 6 + sygnał z bety (ilu testerów ma obiekty na Booking
  **bez** channel managera — bo z CM mail bywa tylko fallbackiem) + miejsce w kolejce
  priorytetów solo foundera (6 bloków + OPEX uwagi na szablony to nie zero).

## 8. Werdykt

**Budować — warunkowo i w kolejności:** najpierw bloker 1 (test na Twoim koncie),
potem przedefiniowanie miernika nr 3, potem MVP Booking-only (nowe rezerwacje +
anulacje, PL/EN, adres wrzutowy + Extranet, DKIM-gate, biała lista, projekt uczciwości
z sekcji 5 w komplecie od pierwszego dnia). Airbnb — faza 2, tylko jeśli beta pokaże
popyt i użytkowników ze skrzynkami umożliwiającymi forward. To jedyna ścieżka spoza
oficjalnego API, która przeszła sito marki: reszta alternatyw odpada.

---

## Załącznik A: pierwsza żywa próbka — Airbnb (2026-09-01)

Właściciel dostarczył zapis prawdziwego maila Airbnb ze swojego konta gospodarza
(typ: **przypomnienie o rezerwacji** — „[gość] przyjeżdża już wkrótce"; zapis strony
Gmaila, dane gościa pozostają poza repo). Co potwierdza:

- **Nadawca:** `automated@airbnb.com` (w wątku obecny też `express@airbnb.com`) —
  zgodnie z badaniem.
- **Pola obecne (szablon PL):** imię i nazwisko gościa + status weryfikacji + liczba
  recenzji + miejscowość; nazwa obiektu i typ („Całe miejsce"); zameldowanie
  i wymeldowanie **z godzinami**; liczba gości **z podziałem** (dorośli, zwierzęta);
  **kod potwierdzenia** (`HM…`); pełne rozliczenie: cena × noce, opłata serwisowa
  gościa, opłata za zwierzę, „Razem", oraz **„Wypłata gospodarza"** z prowizją
  gospodarza i pozycją **„Zarabiasz"**; zasady anulowania. Brak: e-mail i telefon
  gościa (zgodnie z przewidywaniem).
- **Pułapka parsera nr 1: daty bez roku** („czw., 27 sie") — rok trzeba wnioskować
  (mail przypomnienia = najbliższa przyszłość; w mailu potwierdzenia do sprawdzenia
  na próbce).
- **Dla modułu podatkowego:** mail niesie i przychód, i prowizję portalu — dokładnie
  pola, które `rentals` już ma. Import z maila zasilałby podatki bez ręcznego
  przepisywania kwot.
- **Prowizja gospodarza w tej próbce: 3,0% + VAT** (split-fee). ⚠️ **KOREKTA po
  załączniku C:** druga próbka Airbnb z tego samego konta (rezerwacja dokonana
  25.07.2026) ma już **15,5% + VAT** i zerową opłatę serwisową gościa (host-only) —
  jedno konto nosi OBA modele naraz, najpewniej zależnie od daty dokonania rezerwacji
  względem migracji Airbnb na host-only (2025/2026). Wcześniejszy wniosek „mail
  zachowuje 3%" był za mocny: migracja na 15,5% postępuje także **bez** API. Teza
  z analizy API („podpięcie przez API wymusza host-only") pozostaje prawdziwa dla
  kont jeszcze na split-fee, ale jej waga dla tego konta zmalała.

## Załącznik B: próbki Booking.com — badawcze założenie OBALONE (2026-09-01)

Właściciel dostarczył dwie kolejne żywe próbki (ta sama rezerwacja, nr `5101…`):

**1. „Booking.com — Nowa rezerwacja!" (nadawcy w wątku: `noreply@booking.com`,
`no-reply@properties.booking.com`):** wbrew założeniu badania mail jest **UBOGI** —
w treści tylko: nazwa obiektu, numer rezerwacji, IATA, link do Extranetu.
**Zero nazwiska gościa, zero daty wyjazdu, zero kwot** (sprawdzone twardo: w całym
pliku brak słów „Zameldowanie", „Cena", „Prowizja", „Liczba gości"). Jedyne dane
poza treścią: **temat** niesie numer rezerwacji i datę przyjazdu z pełnym rokiem
(„czwartek, 10 września 2026").

**2. „Gość: [gość] — prośba została potwierdzona"** (powiadomienie o wiadomości
gościa z auto-odpowiedzią): paradoksalnie **bogatszy** — blok „Dane rezerwacji"
z imieniem i nazwiskiem gościa, zameldowaniem i wymeldowaniem **z rokiem**
(„czw. 10 wrz. 2026"), nazwą obiektu, numerem, liczbą gości i pokoi. Ale przychodzi
**tylko gdy gość napisze wiadomość** — kanał warunkowy, nie gwarantowany.

**Konsekwencje (odwrócenie asymetrii z badania):** na żywych próbkach to **Airbnb
ma maile bogate** (kwoty, prowizja, gość, kod — załącznik A), a **Booking trzyma dane
w Extranecie** i mailem wysyła wskaźnik. Dla projektu MVP oznacza to zmianę wzorca
dla Bookinga: **mail = natychmiastowy zapalnik** (numer + data przyjazdu z tematu +
obiekt) tworzący wpis „oczekuje na szczegóły", który **iCal kompletuje w ciągu
godziny** (daty od–do). Obietnica „wpadają same z imieniem i kwotą" na tym szablonie
NIE broni się dla Bookinga — broni się „dowiadujesz się natychmiast, szczegóły
dojeżdżają same". ⚠️ Do sprawdzenia przy weryfikacji blokera 1: czy w ustawieniach
powiadomień Extranetu istnieje wariant maila rezerwacyjnego **ze szczegółami**
(niektóre segmenty/ustawienia mogą go mieć — próbka pochodzi z jednego konta).

**Zestaw próbek — stan po trzech** (przechowywać POZA repo; do budowy parsera
potrzebny też surowy oryginał: Gmail → ⋮ → „Pokaż oryginał" → „Pobierz oryginał"
— zapis strony to render Gmaila, nie MIME, więc bez nagłówków DKIM):

| Portal | Typ maila | Status |
|---|---|---|
| Airbnb | przypomnienie o rezerwacji | ✅ (zapis strony) |
| Airbnb | **potwierdzenie nowej rezerwacji** | ✅ **.eml — załącznik C** |
| Airbnb | anulacja · zmiana rezerwacji | ⬜ |
| Booking.com | nowa rezerwacja | ✅ (zapis strony; szablon ubogi — patrz wyżej) |
| Booking.com | **anulacja** | ✅ **.eml — załącznik C** |
| Booking.com | powiadomienie o wiadomości gościa (z danymi) | ✅ (zapis strony) |
| Booking.com | modyfikacja rezerwacji | ⬜ |
| oba | oryginały .eml („Pobierz oryginał") | ✅ po jednym z portalu |

## Załącznik C: dwa surowe oryginały .eml — twarde potwierdzenia (2026-09-01)

Właściciel dostarczył pełne pliki MIME: **anulacja Booking.com** i **potwierdzenie
nowej rezerwacji Airbnb**. Ustalenia z surowca:

**Bezpieczeństwo — model DKIM-gate potwierdzony w nagłówkach:**
- Booking: `From: noreply@booking.com`, koperta `noreply@mailer.booking.com`
  (SPF liczony po `mailer.booking.com` — kolejny dowód, że po forwardzie należy
  weryfikować **DKIM `d=booking.com`**, nie SPF), `dkim=pass (s=bk)`,
  `dmarc=pass (p=REJECT sp=REJECT)`.
- Airbnb: `From: automated@airbnb.com`, `dkim=pass` (podwójny podpis), `dmarc=pass`.

**Obie wiadomości mają część `text/plain`** (Booking w base64, Airbnb 6,3 KB czystego
tekstu ze strukturą etykiet) — parser może pracować na tekście, bez czołgania się
po HTML-u. To istotnie obniża kruchość względem założeń.

**Klucze mapowania obiektów znalezione w mailach:**
- Booking: link do Extranetu niesie **`hotel_id`** (stały identyfikator obiektu)
  obok `res_id` — gotowy klucz do mapowania obiekt↔konto przy wielu obiektach;
  `res_id` siedzi też w URL piksela śledzącego.
- Airbnb: link ogłoszenia niesie **room id** (stały identyfikator listingu),
  do tego kod potwierdzenia `HM…` w treści i w URL szczegółów rezerwacji.
- ⏳ Do sprawdzenia na żywym feedzie: czy UID zdarzeń w iCal Bookinga zawiera
  `res_id` (jeśli tak — dopasowanie mail↔iCal robi się trywialne).

**Anulacja Booking = ten sam ubogi wzorzec co nowa rezerwacja:** treść niesie tylko
`res_id` + link; daty i gość wyłącznie w temacie (data przyjazdu z rokiem). Obsługa:
dopasowanie po `res_id` do istniejącego wpisu → status anulowany; bez wpisu — tylko
notatka w skrzynce nierozpoznanych.

**Potwierdzenie Airbnb = pełny wpis od ręki:** gość (imię i nazwisko, weryfikacja,
liczba recenzji), obiekt + room id, daty **bez roku** ale z godzinami i dniami
tygodnia (rok wnioskowany: najbliższa przyszłość względem daty maila z nagłówka
`Date`), rozbicie gości (dorośli/dzieci/zwierzęta), kod potwierdzenia, pełne
rozliczenie z pozycją „Zarabiasz" i prowizją gospodarza. Nadaje się na kompletny
wpis `rentals` łącznie z przychodem i prowizją dla modułu podatkowego.

🔥 **Odkrycie prowizyjne:** ta rezerwacja (dokonana 25.07.2026) ma **opłatę serwisową
gospodarza 15,5% + VAT i zerową opłatę gościa** (host-only), podczas gdy próbka
z załącznika A — **3,0% + VAT** (split-fee). Jedno konto, dwa modele — patrz korekta
w załączniku A. Praktyczny wniosek dla parsera: **procent prowizji trzeba czytać
z maila per rezerwacja**, nie zakładać stałej wartości.

## Metodologia i źródła

Badanie 2026-09-01: centra pomocy partnerskie Booking.com (powiadomienia, kontakty,
Messaging security, aliasy gości) i Airbnb (powiadomienia, iCal ~3 h, historia cięć
danych), szablony parserów (Parsio/Parseur/Mailparser — de facto dokumentacja pól),
DNS SPF/DMARC obu portali (dig, 2026-09-01), cenniki providerów inbound (Mailgun,
CloudMailin, Postmark, SendGrid, SES — częściowo przez agregatory cen, oznaczone),
wymogi Google CASA dla restricted scopes, ToS obu portali, DPA Parseur (wzorzec
retencji), historia Smartbnb/OwnerRez/iGMS, pomoc polskich skrzynek (WP/o2/Onet/
Interia — paywall forwardu). Recenzja adwersaryjna z własną weryfikacją źródłową;
jej trzy blokery wpisane do sekcji 6. Szacunki oznaczone [niepewne].
