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
- **Konta zespołowe** (współzarządcy, role) — po co: więksi klienci; post-MVP.
- **Tryb ciemny** — po co: komfort; niski koszt dzięki systemowi `.wpd`.
- **Wielojęzyczność (EN/DE)** — po co: goście zagraniczni w przewodnikach to naturalny pierwszy krok (przewodnik przed panelem!).
- **Głębsza synchronizacja kalendarzy** (dwukierunkowa, Google Calendar) — po co: dziś iCal import/eksport działa jednokierunkowo.
- **Wersjonowanie przewodników** — po co: cofnięcie zmian po pomyłce.
- **Aplikacja mobilna** — web-first; wracamy, gdy będą klienci, którzy o to proszą.

## Dług techniczny

- **Osierocone pliki Storage przewodników** (finding przeglądu N2, 2026-07-07) — po co: usunięcie przewodnika z panelu (`deleteDoc` w GuideBuilder) nie kasuje plików Storage — zostają publicznie czytelne pod starymi URL-ami; do tego gałąź `!exists` w storage.rules pozwala subskrybentowi hostować pliki pod nieistniejącymi guideId. Kierunki: kasowanie plików przy usuwaniu przewodnika (front lub Cloud Function, wzorzec jest w deleteUserAccount) + okresowe czyszczenie plików bez dokumentu-rodzica.

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
