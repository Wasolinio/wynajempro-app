# 📋 Backlog — poczekalnia pomysłów

> **Rola tego pliku:** tu leżą pomysły NIEZAPLANOWANE. Decyzje „co robimy" są w
> [[Projects/Roadmap]]. Pomysł przechodzi do roadmapy decyzją właściciela i dopiero
> wtedy dostaje opis „po co / gotowe, gdy / weryfikacja / agent".
>
> **Zasady wpisów:** bez estymat godzinowych (fikcja) i bez priorytetów P0–P3 (o kolejności
> decyduje roadmapa). Za to każdy pomysł ma jedno zdanie „po co" — pomysł, którego celu
> nie umiemy nazwać, kasujemy. Warto dopisywać źródło (kto/co go podsunęło).

## Funkcje

- **Powiadomienia e-mail** (potwierdzenie rezerwacji, tygodniowe podsumowanie) — po co: użytkownik nie musi zaglądać do panelu, żeby być na bieżąco.
- **Automatyczne wiadomości do gości** (link do przewodnika po rezerwacji, przypomnienie o zameldowaniu, prośba o opinię po wyjeździe) — po co: mniej ręcznej roboty gospodarza = główna obietnica produktu.
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

- **Frontowe odbicie limitów walidacji N3** (finding przeglądu, 2026-07-10) — po co: reguły limitują m.in. 20 łączy strony opinii i 15000 znaków pól tekstowych, a front (ReviewBuilder, GuideBuilder) pozwala przekroczyć i pokazuje tylko ogólny toast błędu; dodać maxLength/limity w UI z czytelnym komunikatem.

- **Osierocone pliki Storage przewodników** (finding przeglądu N2, 2026-07-07) — po co: usunięcie przewodnika z panelu (`deleteDoc` w GuideBuilder) nie kasuje plików Storage — zostają publicznie czytelne pod starymi URL-ami; do tego gałąź `!exists` w storage.rules pozwala subskrybentowi hostować pliki pod nieistniejącymi guideId. Kierunki: kasowanie plików przy usuwaniu przewodnika (front lub Cloud Function, wzorzec jest w deleteUserAccount) + okresowe czyszczenie plików bez dokumentu-rodzica.

- **Retencja przy soft-delete kont** (finding 🟢 audytu N5, 2026-07-10) — po co: `cleanupUserData` (konta `canceled` po karencji) czyści rentals/settings/checkout_sessions, ale zostawia `guides`, `secrets/data`, pliki Storage i podpisy gości (imię + obraz podpisu = dane osobowe) — kasuje je dopiero pełne `deleteUserAccount`; wsad do części `legal` N5 (retencja/RODO).

- **Legacy przewodniki z enumerowalnym id** (audyt N5) — po co: stare id z `Date.now()` da się zgadywać; po migracji sekretów (audit-guides-n5 --fix) ekspozycja ogranicza się do treści publicznej, ale warto zachęcić do odtworzenia tych przewodników (nowy link/QR = decyzja gospodarza).

- **Fallback `Math.random()` w generatorach ID przewodnika/strony opinii** (poz. 9 raportu `legal` 2026-07-22; `GuideBuilder.jsx:62`, `ReviewBuilder.jsx:78`) — po co: fallback nie jest kryptograficzny; usunąć (twardy wymóg `crypto.randomUUID`) — łatwe, a domyka higienę „nieodgadywalnego linku".

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
