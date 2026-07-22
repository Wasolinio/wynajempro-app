# Zabezpieczenie kont użytkowników i danych — WynajemPRO

> **Przeznaczenie:** materiał informacyjny dla prawnika oceniającego zgodność z art. 32 RODO
> (bezpieczeństwo przetwarzania) oraz podkład do opisu środków technicznych w Polityce
> Prywatności i DPA §6.
> **Stan na:** 2026-07-22 (stan produkcji po wydaniach z tego dnia).
> **Metoda:** każdy fakt zweryfikowany bezpośrednio w kodzie źródłowym lub w konfiguracji —
> przy każdym punkcie wskazano plik. Sekcja 9 zawiera **uczciwą listę ograniczeń i braków**;
> dokument celowo nie jest materiałem marketingowym.
> **Zastrzeżenie:** to opis stanu technicznego, nie opinia prawna ani deklaracja zgodności.

---

## 1. Streszczenie dla prawnika (jedna strona)

WynajemPRO jest aplikacją internetową opartą na infrastrukturze Google Firebase (Google Cloud).
Operator **nie prowadzi własnych serwerów** — dane są przechowywane i przetwarzane w usługach
zarządzanych Google, a płatności obsługuje Stripe.

Trzy fakty istotne dla oceny ryzyka:

1. **Operator nie przechowuje haseł użytkowników ani danych kart płatniczych** i nie ma do nich
   technicznego dostępu. Hasła obsługuje wyłącznie usługa Firebase Authentication (Google),
   dane kart — wyłącznie Stripe.
2. **Kontrola dostępu do danych jest egzekwowana po stronie serwera**, w regułach bazy danych,
   a nie tylko w interfejsie aplikacji. Oznacza to, że obejście interfejsu (np. bezpośrednie
   zapytanie do bazy) nie daje dostępu do cudzych danych.
3. **Świadomym wyjątkiem od zasady „dane tylko dla właściciela"** są publiczne strony przewodnika
   dla gościa i strony z prośbą o opinię, dostępne bez logowania pod nieodgadywalnym adresem.
   Model ten został odrębnie przeanalizowany — patrz `Ocena-linki-guide-opinie.md`.

---

## 2. Hasła i logowanie

| Mechanizm | Stan faktyczny | Dowód |
|---|---|---|
| Przechowywanie haseł | Operator **nigdy nie otrzymuje ani nie zapisuje hasła**. Hasło trafia bezpośrednio do usługi Firebase Authentication (Google), która przechowuje wyłącznie jego skrót kryptograficzny w swojej infrastrukturze. W kodzie aplikacji hasło występuje wyłącznie jako wartość przekazywana do funkcji SDK i nie jest nigdzie utrwalane. | `src/pages/landing/LoginPanel.jsx` |
| Metody logowania | E-mail + hasło albo konto Google (OAuth). | `LoginPanel.jsx` |
| Minimalna długość hasła | 6 znaków (domyślna polityka Firebase Authentication); komunikat błędu informuje użytkownika o wymogu. **Brak dodatkowych wymogów złożoności** — patrz sekcja 9. | `LoginPanel.jsx` (obsługa `auth/weak-password`) |
| Reset hasła | Samoobsługowy, przez link wysyłany na adres e-mail; obsługa pod trasą `/auth/action`. Operator nie ustawia i nie odczytuje nowego hasła. | `LoginPanel.jsx`, `ResetPassword.jsx`, `App.jsx` |
| Ochrona przed atakiem słownikowym | Mechanizmy po stronie Firebase Authentication (ograniczanie liczby prób, blokady adresów). Operator nie implementuje własnych — patrz sekcja 9. | — |

## 3. Weryfikacja adresu e-mail (trzy warstwy)

Wymóg potwierdzenia adresu jest egzekwowany **niezależnie w trzech miejscach**, w tym po stronie
serwera — samo obejście interfejsu nie wystarcza, by uzyskać dostęp do danych:

| Warstwa | Działanie | Dowód |
|---|---|---|
| Rejestracja | Po utworzeniu konta wysyłany jest link weryfikacyjny, a użytkownik jest **natychmiast wylogowywany** do czasu potwierdzenia. | `LoginPanel.jsx:141-151` |
| Logowanie | Po zalogowaniu następuje odświeżenie stanu konta i sprawdzenie potwierdzenia; konto niepotwierdzone jest wylogowywane z komunikatem. | `LoginPanel.jsx:129-136` |
| Dostęp do panelu | Trasa chroniona odrzuca konta hasłowe bez potwierdzonego adresu. | `src/App.jsx:88-104` |
| **Warstwa serwerowa (kluczowa)** | Reguły bazy danych wymagają oświadczenia `email_verified` w tokenie dostępowym dla wszystkich operacji na danych właściciela (`isOwnerAndVerified`), z zachowaniem zasady „przy braku informacji — odmowa". | `firestore.rules:9-16` |

Konta zakładane przez Google są zwolnione z odrębnego potwierdzenia — adres jest weryfikowany
przez dostawcę logowania.

## 4. Sesje i uprawnienia

| Mechanizm | Stan faktyczny | Dowód |
|---|---|---|
| Trwałość sesji | Wybór użytkownika przy logowaniu: „zapamiętaj mnie" = sesja trwała, w przeciwnym razie sesja wygasa z zamknięciem przeglądarki. | `LoginPanel.jsx:126` |
| Zarządzanie tokenami | Realizowane przez Firebase Authentication (krótkotrwałe tokeny dostępowe odświeżane automatycznie). Operator nie implementuje własnego mechanizmu sesji. | `src/firebase.js:36` |
| Uprawnienia subskrypcyjne | Status subskrypcji rozstrzygany na podstawie oświadczenia w tokenie (szybka ścieżka) lub dokumentu konta; okres próbny honorowany wyłącznie z prawidłowym znacznikiem czasu — dane zapisane w starszym formacie **nie przedłużają dostępu** (zasada „przy wątpliwości — odmowa"). | `firestore.rules:20-45` |
| Sesje gości | Goście otwierający przewodnik korzystają z sesji anonimowej o minimalnych uprawnieniach: odczyt konkretnego przewodnika i zapis własnego rekordu akceptacji. Nie dają dostępu do żadnych danych panelu. | `firestore.rules:196-258` |
| Operacje wrażliwe | Usunięcie konta wymaga **ponownego potwierdzenia tożsamości** — hasłem (konta e-mail) albo ponownym logowaniem Google (konta Google). | `src/pages/dashboard/modals/AccountModal.jsx:40-50` |

## 5. Izolacja i kontrola dostępu do danych

| Mechanizm | Stan faktyczny | Dowód |
|---|---|---|
| Izolacja kont | Dostęp do danych ograniczony do właściciela (porównanie identyfikatora konta), egzekwowany w regułach bazy — niezależnie od interfejsu. | `firestore.rules` |
| Rozdzielenie odczytu i listowania | Publiczny jest wyłącznie odczyt **pojedynczego, znanego** przewodnika; listowanie kolekcji przysługuje tylko właścicielowi. Wyklucza to masowe pobranie danych wszystkich klientów. | `firestore.rules:200-201` |
| Dane dostępowe gości (kod do drzwi, hasło WiFi) | Przechowywane w **odrębnej subkolekcji**, nie w publicznie czytelnym dokumencie przewodnika; ujawniane dopiero po zapisaniu rekordu akceptacji regulaminu. | `firestore.rules:231-233` |
| Walidacja zapisów | Reguły weryfikują kształt danych: dozwolone pola (allowlisty), typy i limity długości; zapis danych dostępowych do dokumentu publicznego jest zabroniony. | `firestore.rules:86-134` |
| Kontakt publiczny gospodarza | Publikowany jest wyłącznie odrębnie wskazany adres publiczny — **e-mail logowania nie jest publikowany**; publikację można wyłączyć przełącznikiem. | `firestore.rules:172-176` |
| Pliki (magazyn) | Zapis wymaga: zalogowania, potwierdzonego adresu, aktywnej subskrypcji oraz bycia właścicielem przewodnika; limit **10 MB**; dozwolone wyłącznie obrazy, PDF i dokumenty Word. Odczyt plików przewodnika jest publiczny (goście muszą je otworzyć). | `storage.rules` |

## 6. Transmisja i konfiguracja serwera

| Nagłówek / mechanizm | Wartość | Dowód |
|---|---|---|
| HTTPS | Wymuszony przez hosting; ruch szyfrowany (TLS) | `firebase.json` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` — wymusza HTTPS na rok | `firebase.json` |
| `X-Content-Type-Options` | `nosniff` | `firebase.json` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` — zapobiega wyciekowi pełnego adresu (istotne dla linków przewodnika) | `firebase.json` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` — blokada dostępu do urządzeń | `firebase.json` |
| `X-Robots-Tag` | `noindex, nofollow` dla tras `/guide/**` i `/opinie/**` | `firebase.json` |
| Domena kanoniczna | `wynajempro.com`; adres techniczny dostawcy przekierowuje trwale (301) | `firebase.json` |

## 7. Płatności

| Mechanizm | Stan faktyczny | Dowód |
|---|---|---|
| Dane kart | **Nigdy nie trafiają do aplikacji.** Płatność odbywa się przez przekierowanie na stronę Stripe (Checkout), a zarządzanie subskrypcją przez Portal Klienta Stripe. Aplikacja przechowuje wyłącznie identyfikatory rozliczeniowe i status. | `functions/index.js` |
| Weryfikacja powiadomień o płatnościach | Każde powiadomienie od Stripe jest weryfikowane podpisem kryptograficznym przed przetworzeniem — podrobione żądanie zostaje odrzucone. | `functions/index.js:194-200` |
| Klucz dostępowy Stripe | Przechowywany w menedżerze sekretów platformy, **nie w kodzie i nie w repozytorium**; dołączany do funkcji, które go potrzebują. | `functions/index.js:16` |
| Klucze w repozytorium | Kontrola nie wykazała żadnych kluczy prywatnych w kodzie; pliki konfiguracyjne ze zmiennymi środowiskowymi są wyłączone z repozytorium. | `.gitignore:27-30` |

## 8. Usuwanie danych (art. 17 RODO)

| Ścieżka | Zakres i tryb | Dowód |
|---|---|---|
| Na żądanie użytkownika | Samoobsługowe w aplikacji, po ponownym potwierdzeniu tożsamości. Nieodwracalne, **bez okresu karencji**. Obejmuje: przewodniki z danymi dostępowymi i zapisami akceptacji, pliki, dane biznesowe, rekord klienta Stripe, profil i konto uwierzytelniające. | `functions/index.js` (`deleteUserAccount`) |
| Automatyczna, po wygaśnięciu | Codzienny proces usuwa w tym samym pełnym zakresie konta: **30 dni** po anulowaniu subskrypcji, **90 dni** po zakończeniu okresu próbnego bez opłaty. | `functions/index.js` (`deleteExpiredAccountsData`, `TRIAL_RETENTION_DAYS = 90`) |
| Odporność procesu | Kasowanie od danych najwrażliwszych do dokumentu konta (usuwanego ostatnim, jako znacznik). Niepowodzenie kroku przerywa operację i pozostawia konto do ponowienia następnej nocy; proces jest idempotentny. Wyklucza to przetrwanie publicznych treści przewodnika po usunięciu konta. | `functions/index.js` (wydanie 2026-07-22) |
| Ochrona przed omyłkowym usunięciem | Przed każdą nieodwracalną operacją następuje ponowny odczyt stanu konta i powtórne sprawdzenie warunków; przy jakiejkolwiek wątpliwości operacja jest **pomijana, nie wykonywana**. Konta opłacone w międzyczasie są z tego powodu chronione. | `functions/index.js` (wydanie 2026-07-22) |

## 9. Ograniczenia, braki i przyjęte ryzyka (świadomie ujawnione)

Ta sekcja istnieje po to, by prawnik oceniał stan rzeczywisty, a nie wyidealizowany.

| Obszar | Stan | Waga (ocena robocza) |
|---|---|---|
| **Uwierzytelnianie dwuskładnikowe (2FA)** | Brak. Dostępne jest jedynie logowanie Google, gdzie 2FA może być włączone po stronie konta Google użytkownika. | Do decyzji — dla mikro-SaaS bez danych szczególnych kategorii akceptowalne, ale warto rozważyć przy większych klientach |
| **Polityka haseł** | Minimum 6 znaków (ustawienie domyślne dostawcy), bez wymogu złożoności i bez sprawdzania haseł znanych z wycieków | Niska–średnia; podniesienie wymogu jest tanie |
| **Egzekwowanie App Check** | Mechanizm jest zainicjowany w aplikacji (reCAPTCHA v3), ale **samo egzekwowanie po stronie usług konfiguruje się w konsoli dostawcy** — nie da się tego potwierdzić z kodu. Wymaga sprawdzenia przez właściciela w konsoli Firebase. | **Do pilnego potwierdzenia** — od tego zależy, czy deklaracja o ochronie przed nadużyciami jest prawdziwa |
| **Kopie zapasowe** | W repozytorium brak konfiguracji kopii zapasowych bazy (harmonogram eksportu / odtwarzanie do punktu w czasie). Dane leżą na infrastrukturze Google z jej wbudowaną redundancją, ale **redundancja nie chroni przed omyłkowym skasowaniem danych przez aplikację**. | **Średnia–wysoka; rekomendowane do wdrożenia przed launchem** |
| **Rejestrowanie i alarmowanie** | Brak wydzielonego monitoringu bezpieczeństwa i alertów; dostępne są standardowe dzienniki platformy | Średnia |
| **Wycofanie zgody na cookies** | Banner pozwala wyrazić zgodę, ale **brak mechanizmu jej łatwego wycofania** (wymóg równej łatwości — art. 7 ust. 3 RODO) | **Do wdrożenia — pozycja otwarta w Polityce, sekcja 9** |
| **Ostrzeżenie przy usuwaniu konta** | Komunikat wymienia węższy zakres („konto, subskrypcja, nieruchomości, historia rezerwacji") niż faktyczna kasacja (obejmuje też przewodniki, dane gości i pliki) | Niska, ale łatwa do poprawienia — rzetelność informacji |
| **Osierocone pliki z przeszłości** | Pliki przewodników usuniętych przed wdrożeniem kaskady mogą pozostawać dostępne pod starymi adresami; nowe przypadki są już wykluczone | Niska–średnia; wymaga jednorazowego czyszczenia |
| **Model „dostępu po linku"** | Świadomie przyjęty; pełna analiza i przyjęte środki — `Ocena-linki-guide-opinie.md` | Przyjęte ryzyko po wdrożeniu środków |
| **Weryfikacja adresów przy synchronizacji kalendarzy** | Zabezpieczenie przed wywołaniem adresów wewnętrznych działa na poziomie nazwy hosta; nie rozwiązuje nazw do adresów IP | Niska (treść odpowiedzi nie wraca do wywołującego) |

## 10. Ograniczenia samej weryfikacji

Uczciwość materiału wymaga wskazania, czego **nie dało się potwierdzić z kodu**:

- **Ustawienia konsoli dostawcy** (egzekwowanie App Check, konfiguracja kopii zapasowych, polityka
  haseł ustawiona po stronie projektu Firebase, treść szablonów e-maili) — wymagają sprawdzenia
  przez właściciela w panelu Firebase.
- **Umowy i mechanizmy transferu danych poza EOG** dla Google i Stripe — do zweryfikowania
  u źródła (dokumentacja dostawców), nie da się ich wyprowadzić z kodu.
- **Testy penetracyjne** nie były wykonywane. Przeprowadzono natomiast wewnętrzne audyty
  bezpieczeństwa kodu i reguł dostępu (N5 i kolejne przeglądy), których ustalenia opisano
  w `Uwagi-N5-dla-prawnika.md`.

---

*Dokument przygotowany na podstawie bezpośredniej weryfikacji kodu produkcyjnego 2026-07-22
(`src/firebase.js`, `src/App.jsx`, `src/pages/landing/LoginPanel.jsx`, `src/pages/dashboard/modals/AccountModal.jsx`,
`firestore.rules`, `storage.rules`, `firebase.json`, `functions/index.js`, `.gitignore`).
Nie stanowi opinii prawnej ani deklaracji zgodności — służy jako podkład do oceny przez prawnika.*
