# PROJEKT — wsad dla prawnika, 2026-07-10

> **Status:** PROJEKT (uwagi robocze). Przygotował agent `legal` w ramach audytu N5
> (przepływy danych osobowych w kodzie); analiza domknięta 2026-07-15, podstawy prawne
> zweryfikowane u źródeł 2026-07-15. **To NIE jest opinia prawna** — dokument jest wsadem
> do przeglądu prowadzonego przez prawnika-człowieka i wymaga jego weryfikacji.
> Cztery dokumenty przekazane 2026-07-10 (`Regulamin.md`, `Polityka-prywatnosci.md`,
> `DPA-powierzenie.md`, `Checklista-zgodnosci.md`) **nie były edytowane** — wszystkie
> proponowane korekty są zebrane wyłącznie tutaj.
>
> **Wyjątek od zdania powyżej — patrz AKTUALIZACJA 2026-07-16 zaraz poniżej:** na wyraźne
> polecenie właściciela naniesiono minimalne, oznaczone korekty w `Regulamin.md` (§4 ust. 1)
> i `Checklista-zgodnosci.md` (sekcja E poz. 8), związane z wyłączeniem generatora umów.

---

## AKTUALIZACJA 2026-07-16 — GENERATOR UMÓW NAJMU TYMCZASOWO WYŁĄCZONY (priorytet: przeczytać jako pierwsze)

> **Dodane 2026-07-16 przez agenta `legal` na polecenie właściciela (X16). Zmiana późniejsza
> niż korpus uwag z 2026-07-15 — dlatego wydzielona na początku dokumentu, żeby była widoczna
> przy pierwszym otwarciu.**

**Fakt (ze stanu kodu, HEAD).** Decyzją właściciela generator umów najmu został **UKRYTY
z nawigacji panelu**. W `src/pages/dashboard/ManagerApp.jsx` pozycja menu „08 Generator umów"
została zakomentowana (tablica `NAV_ITEMS`); kod widoku `ContractGeneratorView.jsx` pozostaje
w repozytorium, ale **nie prowadzi do niego żadne wejście w interfejsie** (użytkownik nie ma
jak ustawić widoku `contracts`). W praktyce: **funkcja jest dziś NIEDOSTĘPNA dla użytkowników
i nie jest oferowana w ramach usługi.** Ma wrócić dopiero po akceptacji wzorców umów przez
prawnika (bloker N4).

*(Rozbieżność daty do odnotowania: właściciel podał datę wyłączenia 2026-07-16, komentarz
w kodzie `ManagerApp.jsx` cytuje 2026-07-15. Różnica jednego dnia bez znaczenia merytorycznego
— do ujednolicenia przy przeglądzie.)*

**Znaczenie dla oceny prawnej.** Dopóki funkcja jest wyłączona, generator umów najmu
**nie jest przedmiotem usługi na dziś** — nie trzeba go traktować jako aktywnego ryzyka
produkcyjnego. Punkt „generator umów najmu" z listy do bezwzględnej weryfikacji (Checklista,
sekcja E poz. 8) pozostaje otwarty, ale przechodzi w tryb „przed ewentualnym ponownym
włączeniem", a nie „przed launchem".

**Korekty naniesione w dokumentach (2026-07-16, wyraźnie oznaczone w treści znacznikiem
`[KOREKTA 2026-07-16]` / `[STATUS 2026-07-16]`):**
- **`Regulamin.md` §4 ust. 1** (opis przedmiotu usługi, wiersz ~54) — pozycja „generowanie
  projektów umów najmu" oznaczona jako **funkcja obecnie niedostępna / zostanie udostępniona
  po weryfikacji wzorców**. Disclaimer wysokiego ryzyka **NIE został usunięty** — pozostaje
  w treści i wraca razem z funkcją.
  *Uwaga terminologiczna:* właściciel w poleceniu wskazał „§5", jednak opis tej funkcji
  znajduje się w **§4 ust. 1** (§5 dotyczy Okresu próbnego). Korektę naniesiono we właściwym
  miejscu — do potwierdzenia przy przeglądzie.
- **`Checklista-zgodnosci.md` sekcja E, poz. 8** — status zmieniony na „funkcja WYŁĄCZONA;
  disclaimer do finalizacji przed ewentualnym włączeniem".

**Powiązany styk do rozważenia (NIE zmieniony — decyzja prawnika):** Regulamin **§12 ust. 3**
nadal wyłącza odpowiedzialność Operatora „za skutki prawne umów najmu generowanych przy pomocy
Aplikacji (§4 ust. 1)". Postanowienie dotyczy funkcji obecnie wyłączonej i odzyskuje pełne
znaczenie z chwilą jej przywrócenia; celowo pozostawione bez zmian (korekta miała być minimalna).
Do decyzji prawnika, czy na czas wyłączenia coś z nim robić.

**Do decyzji właściciela/prawnika:** czy do czasu powrotu funkcji usunąć wzmiankę o generatorze
z §4 Regulaminu całkowicie (wariant „czysty"), czy zostawić ją oznaczoną jako niedostępną
(wariant wybrany — regulamin nie deklaruje wtedy aktywnej funkcji, której nie ma, a jednocześnie
zapowiada jej powrót). Rekomendacja `legal`: wariant oznaczony — spójny z faktyczną mapą funkcji
i łatwiejszy do przywrócenia po akceptacji wzorców.

---

## A. Co zmieniło się w aplikacji PO wysłaniu dokumentów (produkcja, 2026-07-09/10)

1. **N1–N3 wdrożone na produkcję** (weryfikacja e-mail, egzekwowanie subskrypcji,
   walidacja schematu — wszystko w `firestore.rules` + `storage.rules`, deploy 2026-07-09/10).
   Skutek: ramka ostrzegawcza w **DPA §6** („N1–N3 zaślepione…") oraz wiersze o zaślepkach
   w **Checkliście (sekcje A i B)** są NIEAKTUALNE — deklarowane środki bezpieczeństwa są
   już egzekwowane przez backend. Warunek publikacji nr 3 z sekcji F checklisty — spełniony.
2. **Audyt bezpieczeństwa N5 + naprawy (2026-07-10, commit `f10b029`):**
   - publiczny pozostał tylko odczyt POJEDYNCZEGO przewodnika (`get`); listowanie kolekcji
     wyłącznie przez właściciela;
   - sekrety (PIN/WiFi) wyłącznie w subkolekcji `secrets/data` (produkcja zaudytowana:
     zero legacy sekretów na dokumentach publicznych);
   - **NOWE: `users/{uid}/settings/publicContact`** = {nazwa, telefon, e-mail} gospodarza,
     czytelne publicznie (kontakt dla gościa w przewodniku). Pełny `hostProfile`
     (NIP/PESEL, adres) **przestał być publiczny** — czytelny tylko dla właściciela.
3. **NOWA kolekcja `contact_messages`** — publiczny formularz `/kontakt` zapisuje
   {e-mail, treść, data, źródło} do Firestore (create-only; odczyt wyłącznie w konsoli
   Firebase przez właściciela).
4. **Pakiet roczny ukryty na paywallu** (Known-Issues #7) — na launch wyłącznie
   29,99 zł/mc; oferta roczna/founding members wróci po dodaniu drugiej ceny w Stripe.
5. **Baza wiedzy `docs/support/`** (9 artykułów, do osadzenia w aplikacji) — opisuje m.in.
   obejście usuwania konta dla kont Google: e-mail na kontakt@wynajempro.pl.
6. **Generator umów najmu WYŁĄCZONY (2026-07-16, X16)** — ukryty z nawigacji panelu;
   funkcja niedostępna dla użytkowników do czasu akceptacji wzorców przez prawnika.
   Pełen opis i korekty w dokumentach: patrz AKTUALIZACJA 2026-07-16 na początku tego pliku.

---

## B. Proponowane korekty w dokumentach (sekcja → problem → kierunek)

### B1. Polityka-prywatnosci.md

1. **§2 tabela, wiersz „Profil gospodarza (hostProfile)"** — opisuje stan sprzed naprawy
   (publiczny adres i telefon). Proponowany kierunek: rozbić na dwa wiersze:
   - *hostProfile* (NIEpubliczny): nazwa/imię i nazwisko, typ identyfikatora, NIP albo
     PESEL, adres, telefon, e-mail — cel: generator umów najmu i dokumenty; podstawa:
     art. 6 ust. 1 lit. b; dostęp: tylko Użytkownik;
   - *publicContact* (publiczny): nazwa, telefon, e-mail — cel: sekcja „Kontakt
     z gospodarzem" w publicznym przewodniku gościa; podstawa: art. 6 ust. 1 lit. b
     (element usługi konfigurowanej przez Gospodarza) — **do potwierdzenia przez
     prawnika** (alternatywa: zgoda); odbiorcy: każda osoba dysponująca linkiem
     przewodnika (dokument czytelny publicznie).
   Fakt z kodu do uwzględnienia: przy onboardingu e-mail LOGOWANIA jest automatycznie
   kopiowany do kontaktu publicznego, a każdy zapis profilu nadpisuje kontakt publiczny
   wartościami z profilu (brak dziś opcji „nie pokazuj kontaktu gościom") — patrz C.4.
2. **§2 — DODAĆ wiersz: formularz kontaktowy** (`contact_messages`): kategorie: adres
   e-mail, treść wiadomości; cel: obsługa zapytań i zgłoszeń; podstawa (propozycja):
   art. 6 ust. 1 lit. f (uzasadniony interes — komunikacja z osobą, która sama się
   zwraca) albo lit. b, gdy dotyczy umowy — **wybór podstawy do decyzji prawnika**;
   okres przechowywania: DO DECYZJI (propozycja kierunkowa: do 12 miesięcy od
   zakończenia korespondencji). Uwaga UODO: okres musi być określony konkretnie —
   „tak długo, jak to niezbędne" nie wystarcza (uodo.gov.pl/pl/676/4260).
3. **§6 okresy przechowywania** — placeholder karencji można wypełnić: **30 dni**
   (webhook `customer.subscription.deleted` ustawia `scheduledDeletionAt` = +30 dni;
   `functions/index.js`). ALE zdanie „Konta wygasłe (po zakończeniu trialu bez
   subskrypcji lub po anulowaniu) … są automatycznie usuwane" jest dziś NIEPRAWDZIWE
   w dwóch punktach:
   - wygasły trial **nigdy** nie dostaje daty usunięcia (czyszczenie łapie wyłącznie
     status `canceled` z webhooka Stripe) — dane trialowe leżą bezterminowo;
   - czyszczenie po karencji usuwa TYLKO rezerwacje/ustawienia/sesje checkout —
     **zostają**: przewodniki (nadal publicznie dostępne), sekrety, podpisy gości,
     pliki Storage, dokument `users/{uid}` (e-mail + imię) i konto Auth.
   Rekomendacja: naprawa kodu (patrz C.1/C.2) i utrzymanie obecnej treści §6;
   wariant awaryjny (opis stanu faktycznego) jest trudny do obrony na gruncie
   art. 5 ust. 1 lit. e i art. 28 ust. 3 lit. g — do oceny prawnika.
4. **§4 (dane Gości) — zakres podpisów**: obecny przepływ (`GuestGuideView.handleAccept`)
   NIE zbiera imienia ani obrazu podpisu — zapisuje: potwierdzenia akceptacji, datę,
   migawki zaakceptowanych regulaminów, nazwę/URL pliku regulaminu, pod identyfikatorem
   anonimowej sesji Firebase. Starsze rekordy mogą zawierać imię i zapis podpisu
   (reguły nadal honorują te pola). Proponowane doprecyzowanie: „rekord akceptacji
   (data, identyfikator sesji, migawka treści); w starszych zapisach także imię
   i odręczny podpis elektroniczny".
5. **§7 realizacja praw** — wpisać kanał: kontakt@wynajempro.pl (adres już publiczny
   na stronie /kontakt) + zastrzeżenie: do czasu naprawy Known-Issues #8 użytkownicy
   logujący się kontem Google usuwają konto przez ten kanał (weryfikacja tożsamości,
   realizacja w terminie z art. 12 ust. 3 — miesiąc).

### B2. DPA-powierzenie.md

1. **§6 ramka ostrzegawcza** („bloker N3 … WYŁĄCZONY") — do usunięcia/przeredagowania:
   środki są wdrożone na produkcji. Opis środków można rozszerzyć o stan faktyczny:
   rozdzielenie odczytu pojedynczego dokumentu od listowania kolekcji, walidacja
   schematu zapisów, zakaz zapisywania danych dostępowych na dokumencie publicznym,
   ochrona synchronizacji iCal przed SSRF.
2. **§9 ust. 2** — karencja: 30 dni. ALE mechanizm faktyczny po karencji NIE usuwa
   danych POWIERZONYCH (podpisy gości, sekrety, przewodniki) — usuwa je dopiero pełne
   `deleteUserAccount` na żądanie. Sprzeczność z art. 28 ust. 3 lit. g („po zakończeniu
   świadczenia usług … usuwa lub zwraca … oraz usuwa wszelkie istniejące kopie").
   Rekomendacja: naprawa kodu przed publikacją DPA (C.1), nie osłabianie §9.
3. **§9 ust. 3** — „Administrator może samodzielnie usuwać poszczególne przewodniki,
   sekrety i podpisy z poziomu Aplikacji" — dziś częściowo nieprawdziwe: (a) w panelu
   nie ma żadnego widoku/przycisku dla podpisów; (b) usunięcie przewodnika z panelu
   kasuje tylko dokument główny — podpisy i sekrety zostają osierocone w bazie
   (bez kaskady; późniejsze `deleteUserAccount` już ich nie odnajdzie) — patrz C.3.
   Skorygować brzmienie albo uzależnić od naprawy.
4. **§3 kategorie danych** — doprecyzowanie zakresu podpisów jak w B1.4.
5. Pytanie do prawnika: czy `publicContact` (dane samego Gospodarza, administrowane
   przez Operatora) wymaga wzmianki w DPA — wg naszej oceny nie (to nie są dane
   powierzone), ale wyświetla się w przewodniku gościa, więc styk warto nazwać.

### B3. Regulamin.md

1. **§6 ust. 3** — „(miesięczny lub roczny, zależnie od wybranego planu)": na launch
   istnieje wyłącznie plan miesięczny 29,99 zł (pakiet roczny ukryty — Known-Issues #7).
   Analogicznie **§6 ust. 5** (founding members) — oferta przyszła, nie startowa;
   ocena Omnibus z checklisty pozostaje aktualna na moment jej uruchomienia.
2. **§11 ust. 1** — zgodne z `deleteUserAccount` (kasuje przewodniki, sekrety, podpisy,
   pliki, konto). Dodać ścieżkę dla kont Google do czasu naprawy #8 (żądanie e-mail),
   spójnie z Polityką §7.
3. **§5 ust. 3** — „dane … przechowywane przez okres karencji, a następnie mogą zostać
   usunięte": dla wygasłych triali dziś NIE MA żadnego mechanizmu usuwania —
   zsynchronizować z decyzją retencyjną C.2.
4. Drobne: kontakt@wynajempro.pl działa publicznie — może wypełnić część placeholderów
   kontaktowych (decyzja właściciela, czy to docelowy adres do odstąpień/reklamacji).
5. **[KOREKTA WPROWADZONA 2026-07-16]** §4 ust. 1 (przedmiot usługi, wiersz ~54):
   generator umów najmu oznaczony jako „funkcja obecnie niedostępna" (ukryty z nawigacji
   panelu — X16). Disclaimer wysokiego ryzyka pozostawiony i wraca z funkcją. Powiązany
   styk: §12 ust. 3 nadal wyłącza odpowiedzialność za skutki umów z generatora — patrz
   AKTUALIZACJA 2026-07-16 na początku dokumentu (styk pozostawiony bez zmian, do decyzji
   prawnika).

### B4. Checklista-zgodnosci.md

1. Sekcja A: wiersze „hostProfile publiczny zawiera adres i telefon" oraz „N1/N2/N3
   zaślepione" — NIEAKTUALNE (patrz A.1–A.2).
2. Sekcja B: wiersz „hostProfile publiczny … 🟢" — zastąpiony ustaleniem C.4 (🟡):
   po rozdzieleniu na `publicContact` problemem nie jest już zakres (zminimalizowany),
   lecz brak informacji przy zbieraniu.
3. Nowe pozycje do checklisty: C.1–C.6 poniżej + synchronizacja treści bazy wiedzy
   `docs/support/` z ostatecznymi dokumentami (artykuły cytują procesy usuwania
   i retencji).
4. **[KOREKTA WPROWADZONA 2026-07-16]** Sekcja E, poz. 8 (generator umów najmu): status
   zmieniony na „funkcja WYŁĄCZONA; disclaimer do finalizacji przed ewentualnym włączeniem"
   — patrz AKTUALIZACJA 2026-07-16 na początku dokumentu.

---

## C. Nowe ustalenia audytu przepływów danych osobowych (do decyzji/naprawy)

**C.1 🔴 Retencja po anulowaniu subskrypcji.** `cleanupUserData` (uruchamiane po
30-dniowej karencji) usuwa rezerwacje/ustawienia/checkout, ale ZOSTAWIA: przewodniki
(nadal serwowane publicznie — w tym instrukcje dotarcia, które bywają adresem obiektu),
`secrets/data` (PIN do drzwi/WiFi — nadal czytelne dla wcześniejszych sesji gości,
bo rekordy podpisów zostają), podpisy gości (dane osobowe powierzone), pliki Storage,
dokument `users/{uid}` (e-mail + imię) i konto Auth. Ekran blokady obiecuje przy tym:
„Wszystkie rezerwacje, ustawienia i dane klientów zostaną trwale usunięte dnia …".
Sprzeczne z: art. 28 ust. 3 lit. g, art. 5 ust. 1 lit. e, art. 5 ust. 2 RODO oraz
z projektami Polityki §6 i DPA §9. **Rekomendacja:** `dev` rozszerza czyszczenie
o pętlę identyczną jak w `deleteUserAccount` (guides + subkolekcje + Storage);
decyzja dodatkowa: czy po karencji usuwać też dokument `users/{uid}` i konto Auth
(rekomendacja: tak, albo wprost opisać w Polityce, że samo konto trwa do usunięcia
przez użytkownika). Interpretacja przeciwna („usługa trwa, dopóki konto istnieje")
zmniejsza wagę zarzutu z art. 28, ale wymaga przepisania Polityki/DPA/ekranu blokady
i nadal nie broni bezterminowości — do rozstrzygnięcia przez prawnika.

**C.2 🟡 Wygasłe triale — brak ścieżki usunięcia.** `scheduledDeletionAt` ustawia
wyłącznie webhook anulowania subskrypcji; konto po wygaśnięciu trialu nie kwalifikuje
się do czyszczenia nigdy (query: `status == 'canceled'`). Dane porzuconych triali
(w tym dane gości wpisane w rezerwacjach) leżą bezterminowo, bez zdefiniowanych
kryteriów — wbrew art. 5 ust. 1 lit. e i stanowisku UODO o konkretności okresów.
**Rekomendacja:** decyzja właściciela o okresie (propozycja kierunkowa: 12 miesięcy
od końca trialu, z powiadomieniem e-mail przed usunięciem), wdrożenie `dev`,
i dopiero wtedy publikacja §6 Polityki w brzmieniu zgodnym z mechanizmem.

**C.3 🟡 Osierocone podpisy/sekrety po usunięciu przewodnika z panelu.**
`GuideBuilder.deleteGuide` wykonuje kliencki `deleteDoc` dokumentu głównego; Firestore
nie kasuje subkolekcji → `signatures/*` i `secrets/data` zostają (nieodczytywalne przez
reguły, ale istnieją), a `deleteUserAccount` ich później nie odnajdzie (szuka po
istniejących dokumentach `guides`). Skutek: dane osobowe gości niemożliwe do usunięcia
środkami produktu (problem także dla realizacji żądań z art. 17 kierowanych do
Gospodarza). **Rekomendacja:** `dev` — usuwanie przewodnika po stronie serwera
(callable/trigger: subkolekcje + prefiks Storage); do czasu naprawy skorygować DPA §9.3.

**C.4 🟡 publicContact — przejrzystość i ograniczenie celu.** Onboarding zbiera telefon
jako pole WYMAGANE z komunikatem „Aby w pełni korzystać z narzędzi księgowych, podaj
podstawowe dane swojej działalności" — bez słowa o publikacji; e-mail logowania jest
publikowany automatycznie; każdy zapis profilu nadpisuje kontakt publiczny (brak opcji
rezygnacji z sekcji kontaktu w przewodniku). Zakres danych po naprawie jest prawidłowo
zminimalizowany (bez NIP/PESEL/adresu), problemem jest moment informacyjny (art. 13
ust. 1 lit. c i e, art. 5 ust. 1 lit. a–b). **Rekomendacja:** `dev` — jedno zdanie
w onboardingu i w oknie konta („Nazwa, telefon i e-mail będą widoczne dla gości
w Twoich przewodnikach") + rozważyć przełącznik „pokazuj kontakt gościom"
(wyłączenie czyści dokument publiczny); Polityka §2 wg B1.1. Pytanie do prawnika:
czy art. 6 ust. 1 lit. b wystarcza, czy bezpieczniej oprzeć publikację na zgodzie.
**Brzmienia mikrocopy (F4) dostarczone 2026-07-16 do wdrożenia przez `dev`** —
przekazane osobno w odpowiedzi dla właściciela (wersja bazowa + wariant z przełącznikiem).

**C.5 🟡 Formularz /kontakt bez klauzuli informacyjnej i bez retencji.** Przy formularzu
(już aktywnym na produkcji) nie ma żadnej informacji o administratorze/celu ani linku
do Polityki; kolekcja nie ma okresu przechowywania. **Rekomendacja:** `dev` — warstwa
pierwsza pod przyciskiem, brzmienie kierunkowe: „Administratorem danych podanych
w formularzu jest [Operator]. Adres e-mail i treść wiadomości przetwarzamy, aby
odpowiedzieć na Twoje zgłoszenie. Szczegóły: Polityka prywatności [link]." +
wiersz w Polityce (B1.2) + procedura czyszczenia kolekcji po przyjętym okresie.
**Brzmienie klauzuli (F5) dostarczone 2026-07-16 do wdrożenia przez `dev`** — przekazane
osobno w odpowiedzi dla właściciela; do finalizacji podstawa prawna (lit. f vs lit. b)
i okres retencji.

**C.6 🟡 Known-Issues #8 — konta Google nie usuną konta z UI** (formularz wymaga hasła;
backendowa funkcja nie wymaga hasła — problem czysto interfejsowy). Ocena: art. 17
nie wymaga self-service; kanał e-mail opisany w bazie wiedzy wystarcza przejściowo,
POD WARUNKIEM obsługi żądań bez zbędnej zwłoki, najpóźniej w miesiąc (art. 12 ust. 3)
i weryfikacji tożsamości. Naprawa `dev` (re-autoryzacja popupem Google) zaplanowana —
rekomendowana przed launchem lub tuż po; do tego czasu Polityka §7 i Regulamin §11
powinny wymieniać kanał mailowy (B1.5, B3.2).

**C.7 🟢 Pola `name`/`signature` w regułach podpisów** — obecny front ich nie zbiera
(zapis minimalny), reguły dopuszczają je dla rekordów historycznych. Jeśli produkt
kiedyś przywróci zbieranie imienia/odręcznego podpisu gościa, trzeba będzie
zaprojektować z prawnikiem klauzulę informacyjną Gospodarza wobec gościa (administratorem
jest Gospodarz). Porządkowo: po potwierdzeniu braku legacy rekordów można zawęzić
allowlistę reguł.

**C.8 🟢 Informacja dla gościa przy akceptacji.** Gość zapisujący akceptację nie widzi,
że rekord trafia do bazy i kto jest administratorem. Obowiązek informacyjny ciąży na
Gospodarzu, ale Operator „pomaga" (art. 28 ust. 3 lit. e) — dobra praktyka produktowa:
krótka notka przy przycisku („Zapiszemy potwierdzenie akceptacji; administratorem danych
jest gospodarz obiektu") + wzór klauzuli dla gospodarzy w bazie wiedzy. Do decyzji.

---

## D. Fakty z kodu do wstawienia w placeholdery dokumentów

| Placeholder | Wartość z kodu (stan HEAD, 2026-07-15) |
|---|---|
| Okres karencji po anulowaniu | **30 dni** (`functions/index.js`, webhook `customer.subscription.deleted`) |
| Trial | 14 dni, bez karty |
| Zawartość `users/{uid}` | email, name, status, trialEndsAt, createdAt (+ pola Stripe po zakupie) |
| Po czyszczeniu karencyjnym zostaje | `stripeCustomerId` w dokumencie użytkownika; klient w Stripe usuwany dopiero przy pełnym usunięciu konta |
| Kanał kontaktu | kontakt@wynajempro.pl (publiczny na /kontakt); deklarowany czas odpowiedzi 24–48 h roboczych |
| Cena na launch | wyłącznie 29,99 zł/mc (pakiet roczny ukryty) |
| Generator umów najmu | **WYŁĄCZONY 2026-07-16 (X16)** — ukryty z nawigacji `ManagerApp.jsx`; `ContractGeneratorView.jsx` w repo, niedostępny z UI |

## E. Podstawy prawne przywołane w uwagach (weryfikacja: 2026-07-15)

- **RODO (2016/679):** art. 5 ust. 1 lit. a, b, c, e i ust. 2; art. 6 ust. 1 lit. a/b/f;
  art. 12 ust. 2–3 (miesiąc na realizację żądań); art. 13; art. 17; art. 28 ust. 3
  (zwł. lit. e i g). Brzmienie art. 5(1)(e) i 28(3)(g) potwierdzone 2026-07-15 w serwisach
  publikujących tekst rozporządzenia (lexlege.pl, gdpr.pl, arslege.pl — treść zbieżna);
  bezpośredni odczyt EUR-Lex w tej sesji niedostępny technicznie — **prawnik cytuje
  z własnego źródła urzędowego**.
- **UODO:** „Czy trzeba precyzyjnie określać okres przechowywania danych?"
  (uodo.gov.pl/pl/676/4260) — okres retencji musi być określony; ogólnik
  „tak długo, jak niezbędne" niewystarczający.
- Warstwowe spełnianie obowiązku informacyjnego (art. 13) przy formularzach —
  praktyka za wytycznymi o przejrzystości (pierwsza warstwa przy zbieraniu +
  odesłanie do pełnej klauzuli).

---

## AKTUALIZACJA 2026-07-16 — retencja porzuconych okresów próbnych ROZSTRZYGNIĘTA (F2)

Decyzja właściciela: konta z wygasłym, nigdy nieopłaconym okresem próbnym są **trwale
usuwane po 90 dniach od końca okresu próbnego** (pełne usunięcie: dane biznesowe,
przewodniki z danymi gości, dokument konta i login — ta sama ścieżka co po karencji
anulowanej subskrypcji). Wdrożone w `functions/index.js` (`deleteExpiredAccountsData`,
`TRIAL_RETENTION_DAYS = 90`). Ekran blokady po trialu informuje: „Dane konta
przechowujemy jeszcze 90 dni od zakończenia okresu próbnego — po tym czasie zostaną
trwale usunięte."

**Do ujęcia w Polityce prywatności (§6/§2):** okres przechowywania danych konta
z nieopłaconym trialem = 90 dni od końca okresu próbnego; po karencji anulowanej
subskrypcji = 30 dni od anulowania (bez zmian). To domyka rozjazd wskazany w F2
(poprzednio projekt Polityki deklarował usuwanie, którego kod nie wykonywał).

---

*Uwagi przygotowane na podstawie stanu faktycznego z kodu (firestore.rules,
functions/index.js, GuestGuideView.jsx, ContactPage.jsx, GuideBuilder.jsx,
CompleteProfileScreen.jsx, AccountModal.jsx, useFirebaseData.js, PaywallScreen.jsx,
ManagerApp.jsx, docs/support/). Ostateczna kwalifikacja prawna i brzmienie klauzul należą
do prawnika-człowieka. Wdrożenie zmian w kodzie i treściach — `dev`, po decyzji właściciela.*
