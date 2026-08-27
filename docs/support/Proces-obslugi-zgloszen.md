# Proces obsługi zgłoszeń (support) — z odczytem przez Firebase MCP

> **Status:** infrastruktura gotowa 2026-08-10. **Bramka RODO zdjęta decyzją właściciela
> (2026-08-10)** — Anthropic dopisany do subprocesorów w Polityce §5 i DPA §7, klauzula przy
> formularzu uzupełniona, errata E7 dla prawnika wystawiona. Proces obowiązuje.
> Zastrzeżenie: ocena prawnika jest **nadal oczekiwana** (E7 zadaje trzy pytania) — jeśli
> odpowie inaczej, zakres trzeba będzie zawęzić.
>
> Ten plik opisuje **obsługę zgłoszeń**. Treści pomocy dla użytkowników są w pozostałych
> plikach `docs/support/` i generują się do aplikacji przez `npm run help:build`.

---

## 1. Skąd biorą się zgłoszenia

Jedyny kanał w aplikacji to formularz `/kontakt` ([ContactPage.jsx](../../src/pages/ContactPage.jsx)),
który od naprawy Known-Issues #6 (2026-07-16) zapisuje do kolekcji **`contact_messages`**.

**Kształt dokumentu** (wymuszony przez `firestore.rules:278-291`):

| Pole | Typ | Uwagi |
|---|---|---|
| `email` | string | ≤ 320 znaków, musi zawierać `@` i kropkę |
| `message` | string | 1–5000 znaków, **wolny tekst — może zawierać cokolwiek** |
| `createdAt` | timestamp | musi równać się `request.time` (nie da się podrobić daty) |
| `source` | string | opcjonalne, ≤ 50 znaków; formularz wysyła `'kontakt'` |

**Reguły dostępu:** `allow read, update, delete: if false`.
Czyli **żaden klient nie odczyta zgłoszeń** — ani panel, ani przeglądarka, ani gospodarz.
Odczyt jest możliwy wyłącznie ścieżką administracyjną (konsola Firebase albo Admin SDK/IAM),
bo reguły bezpieczeństwa nie obowiązują dostępu administracyjnego. **Na tym stoi cały ten
proces** — i to jest właściwy model: zgłoszenia są danymi Operatora, nie danymi aplikacji.

---

## 2. Podstawa prawna i granice zakresu

Odczyt zgłoszenia lub danych konta oznacza, że dane trafiają do **Anthropic** jako do
podmiotu przetwarzającego. Zostało to uregulowane 2026-08-10:

| Gdzie | Co dopisano |
|---|---|
| [Polityka §5](../legal/Polityka-prywatnosci.md) | Anthropic w tabeli subprocesorów (rola, zakres, stopniowanie, transfer do potwierdzenia) |
| [Polityka §2](../legal/Polityka-prywatnosci.md) | Wiersz `contact_messages` wskazuje odbiorcę |
| [DPA §7](../legal/DPA-powierzenie.md) | Anthropic na liście subprocesorów **danych powierzonych**, z zawężeniem zakresu |
| [ContactPage.jsx](../../src/pages/ContactPage.jsx) | Klauzula przy formularzu wymienia kategorię odbiorcy — art. 13 ust. 1 lit. e wymaga tego **przy zbieraniu**, sama Polityka nie wystarcza |
| [Raport dla prawnika](../legal/Raport-dla-prawnika-2026-07-22.md) | Errata **E7** z trzema pytaniami do oceny |

### Granica, o której trzeba pamiętać przy każdym zgłoszeniu

Dane w tej aplikacji dzielą się na dwie kategorie o **różnym reżimie prawnym**:

- **Dane Gospodarza** (konto, subskrypcja, ustawienia) — Operator jest **administratorem**.
  Podstawa: Polityka §5.
- **Dane Gości** (rezerwacje, zapisy akceptacji regulaminu, podpisy) — Operator jest
  **procesorem**, administratorem jest Gospodarz. Podstawa: **DPA §7**, a Gospodarzowi
  przysługuje prawo sprzeciwu wobec subprocesora.

Dlatego diagnostyka w sekcji 4 jest **stopniowana**: zaczyna od danych Gospodarza i schodzi
do danych Gości tylko wtedy, gdy zgłoszenie tego naprawdę wymaga. To nie jest formalność —
to realizacja zasady minimalizacji (art. 5 ust. 1 lit. c) i jedyny powód, dla którego
zakres wobec danych powierzonych dało się w DPA opisać jako warunkowy.

> **Moment wprowadzenia miał znaczenie.** Kanał dodano przed launchem, gdy jedynym Gospodarzem
> jest właściciel. Po launchu dodanie subprocesora uruchamia obowiązek powiadomienia każdego
> Gospodarza i obsłużenia sprzeciwów (DPA §7 ust. 2).

> Osobno, niezależnie od tej decyzji: **okres przechowywania `contact_messages` jest wciąż
> nierozstrzygnięty** ([DO DECYZJI] w §2 Polityki, propozycja kierunkowa 12 miesięcy).
> Wg stanowiska UODO okres musi być konkretny. To zadanie #31.

---

## 3. Jak odczytać zgłoszenia

Serwer MCP jest skonfigurowany w [`.mcp.json`](../../.mcp.json) i wystaje **wyłącznie 5
narzędzi odczytu** (`--tools` wyłącza auto-wykrywanie, więc `firestore_delete_document`,
`firestore_delete_database` i `firebase_deploy` w ogóle nie istnieją w tej sesji).
Druga warstwa — lista `deny` w [`.claude/settings.json`](../../.claude/settings.json).

Uwierzytelnienie: serwer używa **poświadczeń zalogowanego Firebase CLI** (`wasyl515@gmail.com`).
Nie ma tu żadnego klucza serwisowego do wygenerowania ani przechowywania.

### Najnowsze zgłoszenia

Narzędzie `firestore_query_collection`:
- `collection_path`: `contact_messages` — **bez ukośnika na końcu**
- `filters`: `[]` (wymagane, choć puste)
- `order`: po `createdAt` malejąco
- `limit`: np. 20

### ⚠️ NAJPIERW sprawdź pole `source` — odsiew zgłoszeń testowych

| `source` | Znaczenie | Co robisz |
|---|---|---|
| `kontakt` | zwykłe zgłoszenie z formularza | obsługujesz normalnie (sekcja 5) |
| `kontakt-test` | **wysłane świadomie jako test kanału** | **NIE diagnozujesz**; potwierdzasz właścicielowi, że wiadomość dotarła, i tyle |

Znacznik ustawia formularz otwarty jako `/kontakt?test=1` ([ContactPage.jsx](../../src/pages/ContactPage.jsx)).
Tryb jest niewidoczny dla klientów — parametr wymaga świadomego działania, więc zwykły
użytkownik nie oznaczy swojego prawdziwego zgłoszenia jako testu przez pomyłkę.
Regresja: [`e2e/contact-form.spec.js`](../../e2e/contact-form.spec.js) (4 testy, w tym
fail-safe: nierozpoznana wartość parametru daje zwykły `kontakt`).

Powód istnienia znacznika: 10.08.2026 zgłoszenie testowe z wymyśloną treścią uruchomiło
pełną diagnostykę awarii, której nie było ([[Known-Issues]] #12). **Filtrowanie po `source`
jest pierwszym krokiem odczytu, nie ostatnim** — inaczej znacznik nie zmienia niczego.

⚠️ **Poprawka 2026-08-10:** wcześniej stało tu `contact_messages/`. Ukośnik powoduje twardy
błąd `Collection id "contact_messages/" is invalid because it contains "/"`. Ukośnik jest
potrzebny wyłącznie w ścieżkach zagnieżdżonych (`parentCollection/parentDocument/collectionName`).

### Lista kolekcji (kontrola, że w ogóle jest się do czego łączyć)

Narzędzie `firestore_list_collections`, argument `parent`:
`projects/moje-domki-6c77d/databases/(default)/documents`

⚠️ **Pułapka:** `parent` to pełna ścieżka zasobu i jest **wymagany**. Wywołanie z pustym
obiektem zwraca mylące „Invalid resource field value in the request" — to błąd kształtu
żądania, **nie** problem z uprawnieniami. Nie diagnozuj tego jako braku dostępu.

### Kim jest zgłaszający

`auth_get_users` po adresie e-mail rozstrzyga, czy piszący ma konto — co zmienia odpowiedź
(użytkownik z wygasłym trialem vs osoba z zewnątrz). **Uwaga:** to odczyt danych konta,
więc obowiązuje stopniowanie zakresu z sekcji 2 i 4.

---

## 4. Diagnostyka konta po UID — „masz problem, oto identyfikator"

**Tryb docelowy pracy:** właściciel podaje UID konta (albo adres e-mail — `auth_get_users`
przyjmuje oba), a agent sam ustala, co się dzieje. Diagnostyka idzie **poziomami**: każdy
kolejny sięga po dane wrażliwsze, więc wchodzi się na niego tylko wtedy, gdy poprzedni
nie wyjaśnił sprawy.

### Poziom 1 — konto i subskrypcja (zawsze zaczynaj tutaj)

| Odczyt | Co daje |
|---|---|
| `auth_get_users` (UID lub e-mail) | czy konto istnieje, `emailVerified`, dostawca logowania (hasło vs Google), czy zablokowane, data utworzenia i ostatniego logowania |
| `firestore_get_document` → `users/{uid}` | `status` / `accountStatus`, `trialEndsAt`, `stripeStatus`, `stripeCustomerId`, `scheduledDeletionAt` |

**Rozstrzyga większość zgłoszeń — bez dotykania czyichkolwiek danych osobowych poza samym
Gospodarzem:**

- *„nie mogę wejść do panelu"* → `emailVerified: false` (weryfikacja e-mail działa
  trójwarstwowo, więc to najczęstsza przyczyna) albo wygasły trial,
- *„zapłaciłem, a dalej widzę paywall"* → rozjazd `status` z rzeczywistością w Stripe;
  uwaga na dwa pola (`status` pisze webhook, `accountStatus` to dane historyczne),
- *„trial mi się skończył za wcześnie"* → `trialEndsAt` zapisany jako **string zamiast
  Timestampa** nie przedłuża trialu (reguły są fail-closed) — znany kształt błędu,
- *„usunąłem konto, a ono dalej jest"* → `scheduledDeletionAt` i karencja 30 dni,
- *„nie mogę usunąć konta"* → logowanie Google wymaga ponownego potwierdzenia przez popup;
  jeśli przeglądarka go zablokuje, komunikat jest generyczny (znany dług).

### Poziom 2 — konfiguracja konta (gdy poziom 1 nie wyjaśnia)

`firestore_list_documents` na `users/{uid}/settings`, potem `firestore_get_document` na
konkretnym dokumencie. Istniejące identyfikatory: `properties`, `syncLinks`, `sources`,
`categories`, `tax`, `recurringCosts`, `reminders`, `hostProfile`, `publicContact`.

- *„synchronizacja nie działa"* → `syncLinks`; **pamiętaj o kształcie danych**: kluczami są
  NAZWY OBIEKTÓW, a portale siedzą w wartościach (`{ booking, airbnb }`). Pomylenie tego było
  źródłem błędu #11,
- *„podatki liczą się źle"* → `tax` + `sources` (źródło „Facebook" celowo zeruje podatek,
  VAT i prowizję — to bywa brane za błąd),
- *„goście widzą mój prywatny e-mail"* → `publicContact` i przełącznik `showPublicContact`;
  stare konta mogą mieć zapisany adres logowania do czasu następnego zapisu profilu,
- *„zysk netto różni się między zakładkami"* → to nie awaria konta, tylko znany dług:
  „Przegląd" nie wlicza kosztów stałych, „Koszty i opłaty" i raport wliczają.

⚠️ **`hostProfile` czytaj tylko wtedy, gdy zgłoszenie dotyczy profilu lub faktur** — pole
`taxIdentifier` może zawierać PESEL (ustalenie audytu N5 🟡5).

### ⛔ KANAŁ ZAWIESZONY dla danych osobowych — do czasu umowy powierzenia (2026-08-26, wieczór)

> ⛔ **Właściciel potwierdził plan konsumencki (Max) — plany konsumenckie Claude nie zawierają
> umowy powierzenia (DPA).** Do czasu przejścia na ofertę objętą Commercial Terms (Team /
> Enterprise / klucz API) **agent nie czyta ŻADNYCH danych osobowych klientów**: ani treści
> `contact_messages`, ani danych kont (e-mail, UID, status subskrypcji, `settings/*`).
> Wpis o dostawcy modelu został wykreślony z opublikowanej Polityki §5 — kanał musi być tego
> wpisu wart.
> **Sygnał o nowych zgłoszeniach:** strażnik `scripts/check-messages.mjs` (LaunchAgent
> `com.wynajempro.msgcheck`, co 3 h w godz. 7–23) liczy nowe dokumenty **z maską pól
> `createdAt/source/adminStatus`** — zero danych osobowych z konstrukcji, nic nie idzie do
> żadnego modelu — i pokazuje właścicielowi natywne powiadomienie macOS. Log:
> `~/Library/Logs/wynajempro-msgcheck.log`.
> **Tryb przejściowy:** właściciel czyta zgłoszenia w panelu `/admin` (widok Zgłoszenia)
> i przekazuje agentowi treść problemu **bez danych identyfikujących** (bez adresu e-mail,
> bez UID, bez nazwisk); agent diagnozuje na kodzie i opisie. Po zawarciu DPA: poziomy 1–2
> wracają, wpis w Polityce §5 wraca w trybie sekcji 11 (e-mail + komunikat, 14 dni).

### Poziom 3 — ⛔ ZNIESIONY z dniem publikacji dokumentów (2026-08-26)

> ⛔ **Bramka F4a wykonana przy publikacji dokumentów 2026-08-26** (Anthropic wykreślony
> z DPA §7, DPA opublikowane — od tej chwili deklaracja musi być prawdziwa): **agent NIE
> czyta danych Gości w ogóle** — `users/{uid}/rentals/`, `guides/`, `signatures/` ani
> `secrets/data` są poza kanałem, niezależnie od treści zgłoszenia. Gdy diagnostyka wymaga
> zajrzenia w rezerwacje lub przewodnik, agent kończy na poziomie 2 i przekazuje
> właścicielowi dokładną ścieżkę dokumentu do samodzielnego otwarcia w konsoli Firebase,
> z opisem, czego w nim szukać. Dawne zasady poziomu 3 zostają niżej wyłącznie jako opis
> historyczny (obowiązywały do publikacji; okres przejściowy bety — [[Activity-Log]] 2026-08-26).


| Odczyt | Zawiera dane osobowe Gości |
|---|---|
| `firestore_query_collection` → `users/{uid}/rentals/` | imiona/nazwiska gości, kontakt, skład osobowy pobytu |
| `firestore_query_collection` → `guides/` z filtrem `ownerId == {uid}` | treść przewodnika; sekrety są w podkolekcji `secrets/data` |
| `guides/{id}/signatures/` | **imię gościa + obraz podpisu** |

**Zasady tego poziomu:**
1. Wejdź tu tylko wtedy, gdy problem naprawdę dotyczy konkretnej rezerwacji lub przewodnika.
2. Czytaj **wąsko** — pojedynczy dokument, nie całą kolekcję, jeśli znasz identyfikator.
3. **Nie czytaj `secrets/data`** (hasło WiFi, kod do drzwi), chyba że zgłoszenie dotyczy
   wprost tego, że sekrety się nie wyświetlają. To dane dostępowe do czyjegoś mieszkania.
4. Odnotuj w odpowiedzi, że sięgnięcie po dane Gości było potrzebne i dlaczego.

### Czego agent NIE zrobi

Kanał jest **wyłącznie do odczytu** — nie ma narzędzi zapisu, więc agent **nie naprawi konta
w bazie**. Może: ustalić przyczynę, wskazać dokładne pole i wartość, przygotować treść
odpowiedzi i zaproponować poprawkę w kodzie. Zmiana danych na produkcji zostaje operacją
właściciela (konsola) albo osobnym, świadomie napisanym skryptem po przeglądzie.

To ograniczenie jest celowe: diagnostyka support to najgorszy możliwy moment na przypadkowy
zapis do bazy produkcyjnej.

---

## 5. Ścieżka obsługi pojedynczego zgłoszenia

1. **Odczytaj** zgłoszenie (data, źródło, treść).
2. **Sprawdź, czy odpowiedź już istnieje** w `docs/support/` — Centrum pomocy powstało po to,
   żeby nie odpisywać w kółko to samo. Jeśli artykuł odpowiada: odeślij link do `/pomoc/<slug>`.
3. **Zakwalifikuj:**
   - *pytanie* → odpowiedź + ewentualnie nowe FAQ w artykule,
   - *błąd* → weryfikacja w kodzie (nigdy „na słowo"), wpis do [[Known-Issues]],
   - *żądanie RODO* (usunięcie danych, dostęp) → ścieżka z Polityki §6, **termin miesiąca**,
   - *pomysł* → [[Projects/Backlog]] z jednym zdaniem „po co".
4. **Odpisz z własnej skrzynki** (`kontakt@wynajempro.com`). Aplikacja nie ma kanału wysyłki —
   agent przygotowuje treść, wysyłasz Ty.
5. **Odnotuj** — dopóki nie ma pola statusu (sekcja 6), rejestr obsłużonych zgłoszeń
   prowadzimy w [[Activity-Log]] przy okazji zmian, które z nich wynikły.
6. **Jeśli zgłoszenie zmieniło UI** → odśwież artykuły i uruchom `npm run help:build`.
   Artykuły cytują etykiety 1:1, więc starzeją się z każdym deployem (wniosek z X1).

---

## 6. Czego ten proces jeszcze NIE ma

Firebase MCP rozwiązuje **odczyt**. Nie rozwiązuje reszty — te braki idą do
[[Projects/Backlog]] i czekają na decyzję właściciela:

| Brak | Skutek dziś |
|---|---|
| **Brak powiadomienia o nowym zgłoszeniu** | Nikt się nie dowiaduje, że coś przyszło — trzeba pamiętać, żeby sprawdzić |
| **Brak statusu zgłoszenia** | `hasOnly` w regułach dopuszcza 4 pola, `update` zabroniony — nie da się oznaczyć „obsłużone". Przy dwóch zgłoszeniach nieistotne, przy dwudziestu bolesne |
| **Brak kanału odpowiedzi** | Odpowiedź wychodzi ręcznie ze skrzynki, poza jakimkolwiek śladem |
| **Nierozstrzygnięta retencja** | Zgłoszenia leżą bezterminowo wbrew wymogowi konkretnego okresu (zadanie #31) |

---

## 7. Weryfikacja przed pierwszym prawdziwym użyciem — ✅ ZAMKNIĘTA 2026-08-10

**Rozstrzygnięte: kanał działa.** Wątpliwość brzmiała tak — w bazie były kolekcje `artifacts`,
`guides`, `users`, ale **`contact_messages` nie istniała**, co mogło znaczyć albo (a) że nikt
nie napisał, albo (b) że zapis cicho nie działa mimo komunikatu „Wiadomość została wysłana!"
(nawrót Known-Issues #6).

Tego samego dnia właściciel wysłał wiadomość przez formularz na produkcji. Kolekcja
**pojawiła się**, dokument ma poprawny kształt (`email`, `message`, `source`, `createdAt`
równe czasowi serwera). **Wariant (b) wykluczony — obowiązuje (a):** przez cztery tygodnie
od naprawy formularza po prostu nikt nie pisał, co przed launchem jest normalne.

Przy okazji odpadł jeden podejrzany: zapis przeszedł z nieatestowanej sesji, więc
**egzekwowanie App Check jest wyłączone** dla Firestore. Uwaga — to nie znaczy, że App Check
jest zdrowy: produkcja zwraca `403` przy wymianie tokenu i **włączenie egzekwowania w tym
stanie odcięłoby aplikację** ([[Known-Issues]] #13).

> **Pierwsze zgłoszenie było TESTEM kanału, nie awarią.** Właściciel wysłał je, żeby sprawdzić,
> czy formularz działa; treść („nie działa dodawanie rezerwacji") była wypełniaczem, a agent
> potraktował ją jak prawdziwe zgłoszenie i przeprowadził pełną diagnostykę. Wynik audytu:
> ścieżka dodawania rezerwacji jest **zdrowa** ([[Known-Issues]] #12).
>
> **Wniosek dla tego procesu — wdrożony 2026-08-11.** Kanał nie miał pola typu, więc zgłoszenie
> testowe było nieodróżnialne od prawdziwego. Naprawione: **`/kontakt?test=1` zapisuje
> `source: 'kontakt-test'`** (sekcja 3 — odsiew jest pierwszym krokiem odczytu). Obok tego
> obowiązuje zasada, której żaden znacznik nie zastąpi:
>
> **Agent pyta o potwierdzenie, zanim uruchomi pełną diagnostykę**, jeśli zgłoszenie opisuje
> awarię, po której **nie ma żadnego śladu w danych** (brak dokumentu, brak nieudanego zapisu).
> Nieobecność danych **nie jest** dowodem awarii — równie dobrze znaczy, że nikt nie próbował.
> To był właściwy błąd rozumowania z 10.08: brak rezerwacji z tego dnia potraktowano jako
> poszlakę potwierdzającą, a był to brak próby.

**Related:** [[Projects/Instrukcje-wlasciciela]] · [[Known-Issues]] · [[Projects/Backlog]] · [[Projects/Roadmap]]
