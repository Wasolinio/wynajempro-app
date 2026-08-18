# 📋 Backlog — poczekalnia pomysłów

> **Rola tego pliku:** tu leżą pomysły NIEZAPLANOWANE. Decyzje „co robimy" są w
> [[Projects/Roadmap]]. Pomysł przechodzi do roadmapy decyzją właściciela i dopiero
> wtedy dostaje opis „po co / gotowe, gdy / weryfikacja / agent".
>
> **Zasady wpisów:** bez estymat godzinowych (fikcja) i bez priorytetów P0–P3 (o kolejności
> decyduje roadmapa). Za to każdy pomysł ma jedno zdanie „po co" — pomysł, którego celu
> nie umiemy nazwać, kasujemy. Warto dopisywać źródło (kto/co go podsunęło).

## Funkcje

- **Obsługa zgłoszeń — brakująca reszta po wpięciu Firebase MCP** (2026-08-10; odczyt zgłoszeń działa, opis procesu: `docs/support/Proces-obslugi-zgloszen.md`). Trzy braki, każdy osobno decydowalny: (1) **powiadomienie o nowym zgłoszeniu** — dziś nikt się nie dowiaduje, że coś przyszło; najtaniej Cloud Function na `onCreate` w `contact_messages` wysyłająca maila na adres Operatora; (2) **status zgłoszenia** — reguły dopuszczają 4 pola (`hasOnly`) i zabraniają `update`, więc nie da się oznaczyć „obsłużone"; wymaga rozszerzenia modelu + reguł + świadomej decyzji, kto może pisać (dziś nikt poza administracją); (3) **ślad odpowiedzi** — odpowiedzi wychodzą ręcznie ze skrzynki, poza jakimkolwiek rejestrem. **Po co:** przy dwóch zgłoszeniach to nieistotne, przy dwudziestu determinuje, czy support w ogóle działa. Sprzężone z nierozstrzygniętą retencją `contact_messages` (zadanie #31).

- **Obserwacja (2026-08-18): 24% żądań Authentication jest niezweryfikowanych przy włączonym egzekwowaniu App Check.** Najprawdopodobniej odsiew botów, czyli działanie zgodne z zamiarem — ale w tej puli mogą siedzieć **prawdziwi użytkownicy z agresywnym blokerem reklam**, który wycina reCAPTCHA. Taki klient nie zaloguje się i nie dowie się dlaczego (komunikat mówi o błędzie autoryzacji sesji). **Po co to zapisujemy:** żeby przy pierwszym zgłoszeniu „nie mogę się zalogować" zacząć od tej hipotezy, a nie od zera. Do rozważenia: rozpoznanie błędu App Check w `LoginPanel` i komunikat sugerujący wyłączenie blokera albo inną przeglądarkę.

- **Powiadomienia e-mail** (potwierdzenie rezerwacji, tygodniowe podsumowanie) — po co: użytkownik nie musi zaglądać do panelu, żeby być na bieżąco.
- **Automatyczne wiadomości do gości** (link do przewodnika po rezerwacji, przypomnienie o zameldowaniu, prośba o opinię po wyjeździe) — po co: mniej ręcznej roboty gospodarza = główna obietnica produktu. **Projekt techniczny gotowy: [[Projects/Plan-automatycznych-wiadomosci]]** (2026-08-17, na prośbę właściciela) — architektura, model danych, fazy, cztery decyzje do podjęcia (dostawca poczty, PIN w mailu vs za linkiem, tryb akceptacji, SMS). Czeka na decyzję o przeniesieniu do roadmapy.
- ~~**„Przewodnik opinii" — strona podziękowania z prośbą o opinię**~~ → **przeniesione do [[Projects/Roadmap]] jako X13** decyzją właściciela (2026-07-04, MVP: strona per obiekt, link ręczny). Tu zostają odłożone rozszerzenia: personalizacja per rezerwacja (dane osobowe pod publicznym linkiem → `legal`) i automatyczna wysyłka po wyjeździe (spina się z „automatycznymi wiadomościami do gości" powyżej).
- **Oceny/opinie gości** (zbierane w aplikacji) — po co: informacja zwrotna dla gospodarza; do przemyślenia, czy nie kolidują z opiniami na portalach (patrz: „przewodnik opinii" wyżej — kierowanie NA portale zamiast konkurowania z nimi).
- **Zaawansowany kalendarz dostępności** (blokowanie zakresów przeciągnięciem, akcje hurtowe) — po co: szybsze zarządzanie sezonem.
- **Dziennik dostępu do przewodnika** (kto i kiedy otworzył, audyt sekretów) — po co: bezpieczeństwo i spokój gospodarza; uwaga RODO → `legal`.
- **„Wygeneruj nowy link" przewodnika** (rekomendacja `legal` 2026-07-22, decyzja właściciela: po launchu) — po co: unieważnienie starego linku po sezonie/gościu (nowy ID dokumentu z przeniesieniem treści) — tania rotacja jedynej bariery dostępu; w komplecie artykuł pomocy o rotacji kodu do drzwi między pobytami.
- **Wygasanie linku przewodnika / PIN pobytu** (warstwa (c) raportu `legal`, decyzja właściciela 2026-07-22: Later, na żądanie rynku) — po co: twardszy model dostępu, jeśli klienci o to poproszą; świadomie odłożone — łamie prostotę produktu, ryzyko rezydualne po wdrożonych środkach ocenione jako akceptowalne.
- **Konta zespołowe** (współzarządcy, role) — po co: więksi klienci; post-MVP.
- **Tryb ciemny** — po co: komfort; niski koszt dzięki systemowi `.wpd`.
- **Wielojęzyczność (EN/DE)** — po co: goście zagraniczni w przewodnikach to naturalny pierwszy krok (przewodnik przed panelem!).
- **Głębsza synchronizacja kalendarzy** (dwukierunkowa, Google Calendar) — po co: dziś iCal import/eksport działa jednokierunkowo.
- **Wersjonowanie przewodników** — po co: cofnięcie zmian po pomyłce.
- **Aplikacja mobilna** — web-first; wracamy, gdy będą klienci, którzy o to proszą.

## Dług techniczny

- **Eksport CSV: nazwy z zewnątrz mogą zostać wykonane jako formuła w arkuszu** (zauważone 2026-08-13 przy smoke 4e). Nazwy gości przy rezerwacjach z portali biorą się z pola `SUMMARY` kalendarza iCal (`functions/index.js:713`), czyli **spoza naszej kontroli**, i trafiają do pliku CSV, który gospodarz wysyła **księgowemu**. Wartość zaczynająca się od `=`, `+`, `-` lub `@` bywa interpretowana przez Excela jako formuła, a nie tekst — cytowanie pól (`reportExport.js:64`) przed tym **nie chroni**, bo to inna klasa problemu niż średnik w treści. **Po co:** ten sam kształt sprawy co `javascript:` w łączach z audytu N5 — dane z zewnątrz lądują tam, gdzie coś je wykonuje, tyle że odbiorcą jest osoba trzecia. Ryzyko niskie (portale wpisują zwykle „Reserved - KOD"), koszt naprawy: prefiks apostrofa dla takich wartości w `csvField`. Reszta eksportu zweryfikowana i poprawna: separator `;`, przecinek dziesiętny, UTF-8 BOM, CRLF, podwajanie cudzysłowów.

- **Drobne z audytu X17 (rozbicie gości, 2026-07-24)** — po co: higiena, żadne nie blokuje. (1) Brak górnego ograniczenia liczb: literówka `1e20` w polu „Dorośli" zapisze się (reguły `optNum` przyjmują dowolną liczbę) i wyrenderuje absurd w szczegółach — najtaniej `max="99"` na trzech inputach; **uwaga:** ewentualne ograniczenie w regułach tylko dla `adults`/`children`/`pets`, **nie dla `guests`** bez ponownego przebiegu `validate-schema-n3.cjs` na produkcji (reguły walidują dokument po merge, więc jeden wykraczający rekord stałby się trwale nieedytowalny) i nie przez `is int` (SDK zapisuje liczby spoza safe-integer jako double). (2) Dwa różne predykaty „pole istnieje" w `ManagerApp.openEditModal` (`!== undefined` vs `??`) — dziś nieosiągalne, ale warto ujednolicić. (3) Rezerwacja z samymi zwierzętami renderuje się pod nagłówkiem „Goście" z ikoną `Users` jako „2 zwierzęta" — kosmetyka. (4) `plural(n, ['dorosły','dorosłych','dorosłych'])` świadomie używa dopełniacza w slocie 2–4 („2 dorosłych" jak na Booking) — dopisać komentarz, żeby ktoś tego nie „naprawił" na błąd.

- **Frontowe odbicie limitów walidacji N3** (finding przeglądu, 2026-07-10) — po co: reguły limitują m.in. 20 łączy strony opinii i 15000 znaków pól tekstowych, a front (ReviewBuilder, GuideBuilder) pozwala przekroczyć i pokazuje tylko ogólny toast błędu; dodać maxLength/limity w UI z czytelnym komunikatem.

- **Osierocone pliki Storage przewodników** (finding przeglądu N2, 2026-07-07) — po co: usunięcie przewodnika z panelu (`deleteDoc` w GuideBuilder) nie kasuje plików Storage — zostają publicznie czytelne pod starymi URL-ami; do tego gałąź `!exists` w storage.rules pozwala subskrybentowi hostować pliki pod nieistniejącymi guideId. Kierunki: kasowanie plików przy usuwaniu przewodnika (front lub Cloud Function, wzorzec jest w deleteUserAccount) + okresowe czyszczenie plików bez dokumentu-rodzica.

- **Retencja przy soft-delete kont** (finding 🟢 audytu N5, 2026-07-10) — po co: `cleanupUserData` (konta `canceled` po karencji) czyści rentals/settings/checkout_sessions, ale zostawia `guides`, `secrets/data`, pliki Storage i podpisy gości (imię + obraz podpisu = dane osobowe) — kasuje je dopiero pełne `deleteUserAccount`; wsad do części `legal` N5 (retencja/RODO).

- **Legacy przewodniki z enumerowalnym id** (audyt N5) — po co: stare id z `Date.now()` da się zgadywać; po migracji sekretów (audit-guides-n5 --fix) ekspozycja ogranicza się do treści publicznej, ale warto zachęcić do odtworzenia tych przewodników (nowy link/QR = decyzja gospodarza).

- **Fallback `Math.random()` w generatorach ID przewodnika/strony opinii** (poz. 9 raportu `legal` 2026-07-22; `GuideBuilder.jsx:62`, `ReviewBuilder.jsx:78`) — po co: fallback nie jest kryptograficzny; usunąć (twardy wymóg `crypto.randomUUID`) — łatwe, a domyka higienę „nieodgadywalnego linku".

- **Notka dla gościa przy akceptacji regulaminu** (N5 C.8 🟢 — `docs/legal/Uwagi-N5-dla-prawnika.md` sekcja C.8; poz. 8 raportu `legal` 2026-07-22) — po co: gość klikający „Odkryj dane dostępowe" nie widzi, że zapis akceptacji trafia do bazy i kto jest administratorem; krótka notka przy przycisku domyka obowiązek informacyjny gospodarza (art. 28 ust. 3 lit. e). Front-only, `GuestGuideView.jsx`.

- **Zakaz danych osobowych gości w treściach publicznych** (poz. 10 raportu `legal` 2026-07-22) — po co: gospodarz może wkleić dane osobowe w pola wolnego tekstu (`checkInInfo`, `message` strony opinii) widoczne po linku; zdanie w DPA/pomocy + ewentualne ostrzeżenie w edytorze (art. 5 ust. 1 lit. c). Agent: `legal` (brzmienie) + `support`/`dev` (umiejscowienie).

- **Domknięcie allowlisty guides** (po migracji) — po co: usunięcie `wifiNetwork/wifiPassword/doorPin` z `isValidGuestGuide` po potwierdzonym czystym audycie produkcji zamyka 🔴2 na poziomie reguł całkowicie.

- **Sanityzacja `propertyId` w Content-Disposition eksportu iCal** (finding 🟢 audytu N5) — po co: CRLF w nazwie obiektu = wyjątek 500; kosmetyka defense-in-depth.

- **DNS-rebinding w `isSafeUrl`** (residual 🟡3 audytu N5, 2026-07-10) — po co: walidacja hosta jest stringowa, więc domena rozwiązująca się na adres prywatny przechodzi; ryzyko niskie (treść odpowiedzi nie wraca do wywołującego, metadata GCP wymaga nagłówka). Hardening: rozwiązać DNS i sprawdzać IP, albo allowlista hostów iCal (booking/airbnb itd.).

- **Obsługa `auth/popup-blocked` przy reauth Google** (nit 🟢D z przeglądu RODO-UI, 2026-07-16) — po co: gdy przeglądarka zablokuje popup przy usuwaniu konta Google, użytkownik dostaje generyczny błąd zamiast wskazówki „odblokuj wyskakujące okna"; kosmetyka UX.

- **Sygnały z odświeżania bazy wiedzy X1** (2026-07-21, agent `support`; dwa poważne poszły do [[Known-Issues]] #10 i #11): dwie różne definicje „Zysk netto" w jednym module — „Przegląd" (`AnalyticsView`) nie wlicza kosztów stałych, a „Koszty i opłaty" i raport wliczają, więc sąsiednie zakładki pokazują różne kwoty za ten sam okres (ujednolicić albo napisać w kaflu, co wchodzi w skład); wiersz „Eksport dla księgowego / Wkrótce" (`FinanceHub.jsx:71-80`) chowa działający już eksport CSV z okna raportu; martwy status „Zaliczka wpłacona" (`isAdvancePaid` nie ma zapisu w UI); brak wyboru roku w zakładce „Koszty i opłaty" (rok zmienia się tylko z „Przeglądu"); komunikaty synchronizacji przez `alert()` zamiast toastów (`WynajemContext.jsx:146-159`) i brak ręcznej synchronizacji w mobilnym arkuszu „Więcej"; niespójna nazwa planu („Plan Gospodarz" w sidebarze vs „Plan Gospodarza" w modalu konta). — po co: spójność obietnic UI z zachowaniem.

- **Odświeżanie bazy wiedzy jako krok w checkliście zmian UI** (wniosek z X1, 2026-07-21) — po co: artykuły cytują etykiety 1:1, więc każdy deploy zmieniający panel je postarza; treść żyje w `docs/support/*.md` i jest generowana do aplikacji (`npm run help:build`), ale nikt nie przypomni o przejrzeniu jej po zmianie UI.

- **Drobne sygnały z pisania bazy wiedzy X1** (2026-07-10): `isAdvancePaid` tylko wyświetlane (nie da się ustawić w UI); przycisk „Eksport PDF" w Finansach otwiera modal raportu (mylące); źródło „Facebook" zeruje podatek/VAT/prowizję bez wyjaśnienia; na mobile brak ręcznej synchronizacji w arkuszu „Więcej" — po co: spójność obietnic UI z zachowaniem; decyzje produktowe przy dopieszczaniu.

- **TypeScript** — po co: mniej regresji przy rozbudowie; duży koszt migracji, decyzja świadoma.
- **Wydzielenie komponentów współdzielonych** — po co: mniej duplikacji między widokami panelu.
- **Szersze pokrycie e2e** — podstawowy zakres jest w roadmapie (X10); tu: reszta przepływów.
- **CI/CD** (build + lint + e2e na push) — po co: łapanie regresji przed deployem.
- **Monitoring wydajności** — najpierw ZMIERZYĆ (bundle, Lighthouse na produkcji), dopiero potem stawiać cele. Bez wróżenia liczb.
- **Indeksy/optymalizacja zapytań Firestore** — po co: koszty i szybkość przy większej liczbie wpisów.

## Pomysły biznesowe (analiza: `strategist`)

- Warianty cennika: liczba obiektów jako oś pakietów vs jedna cena — decyzja przed launchem (roadmapa: otwarte decyzje).
- Partnerstwa dystrybucyjne: księgowi rozliczający najem, grupy/portale dla wynajmujących.
- Marketplace (katalog obiektów, komunikacja z gośćmi end-to-end) — odległa wizja, nie MVP.

## Usunięte / nieaktualne (2026-07-02, porządek po audycie)

- ~~iCal token generation (P0)~~ i ~~storage leak (P0)~~ — **fałszywe alarmy**, zweryfikowane 29.06 ([[Known-Issues]]); wisiały tu jako „Current Sprint CRITICAL".
- ~~Guide Photos~~ — zrobione: kreator przewodników z uploadem do 10 MB (`dd4aec2`).
- ~~Analytics Dashboard~~ — w dużej mierze zrobione: widok Analityka z porównaniem YoY (`af4af47`); konkretne braki → nowy wpis z „po co".
- ~~Booking contract generation~~ — zrobione: generator umów najmu (`76f53ff`); przegląd prawny wzorców jest w roadmapie (N4/N5).
- ~~Prioritization Matrix / Roadmap by Quarter / estymaty godzinowe~~ — zastąpione przez [[Projects/Roadmap]].

**Related:** [[Projects/Roadmap]] · [[Known-Issues]] · [[Projects/Milestones]]
