# Zabezpieczenie kont użytkowników i danych — WynajemPRO

> **Przeznaczenie:** materiał informacyjny dla prawnika oceniającego zgodność z art. 32 RODO
> (bezpieczeństwo przetwarzania) oraz podkład do opisu środków technicznych w Polityce
> Prywatności i DPA §6.
> **Stan na:** 2026-07-24 (baza: stan produkcji z 2026-07-22 + wydanie z 2026-07-24).
> **[AKTUALIZACJA 2026-07-24]:** wydanie produkcyjne (deploy `hosting:app`, commit `495aace`,
> site `wynajempro` / domena `wynajempro.com`) domknęło **dwie** pozycje z sekcji 9:
> **wycofanie zgody na cookies** (N6.1 — przepływ przeklikany end-to-end na produkcji) oraz
> **zakres ostrzeżenia przy usuwaniu konta** (N6.2 — potwierdzone w kodzie, buildzie i testach;
> komunikat jest za logowaniem, więc nie był oglądany na produkcji). Obie pozycje przeniesiono
> z tabeli braków do wykazu pozycji domkniętych (sekcja 9.1). Pozostałe pozycje listy braków
> **pozostają otwarte**; reszta dokumentu opisuje stan produkcji z 2026-07-22.
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
Tabela poniżej zawiera **wyłącznie pozycje otwarte**. Pozycje domknięte (wdrożone na produkcję)
przeniesiono do sekcji 9.1 — nie znikają z dokumentu, ale nie udają braków.

| Obszar | Stan | Waga (ocena robocza) |
|---|---|---|
| **Uwierzytelnianie dwuskładnikowe (2FA)** | Brak. Dostępne jest jedynie logowanie Google, gdzie 2FA może być włączone po stronie konta Google użytkownika. | Do decyzji — dla mikro-SaaS bez danych szczególnych kategorii akceptowalne, ale warto rozważyć przy większych klientach |
| **Polityka haseł** | Minimum 6 znaków (ustawienie domyślne dostawcy), bez wymogu złożoności i bez sprawdzania haseł znanych z wycieków. **Decyzja właściciela z 2026-08-13: podniesienie do 8 znaków z wymogiem litery i cyfry** — dotyczy wyłącznie nowych haseł, istniejące konta działają dalej. Ustawienie wykonuje się w konsoli dostawcy, więc do czasu jego wprowadzenia obowiązuje stan dotychczasowy. | Niska–średnia; decyzja podjęta, wdrożenie w konsoli przed nami |
| **Rejestrowanie i alarmowanie** | Brak wydzielonego monitoringu bezpieczeństwa i alertów; dostępne są standardowe dzienniki platformy | Średnia |
| **Osierocone pliki z przeszłości** | Pliki przewodników usuniętych przed wdrożeniem kaskady mogą pozostawać dostępne pod starymi adresami; nowe przypadki są już wykluczone | Niska–średnia; wymaga jednorazowego czyszczenia |
| **Model „dostępu po linku"** | Świadomie przyjęty; pełna analiza i przyjęte środki — `Ocena-linki-guide-opinie.md` | Przyjęte ryzyko po wdrożeniu środków |
| **Weryfikacja adresów przy synchronizacji kalendarzy** | Zabezpieczenie przed wywołaniem adresów wewnętrznych działa na poziomie nazwy hosta; nie rozwiązuje nazw do adresów IP | Niska (treść odpowiedzi nie wraca do wywołującego) |

### 9.1 Pozycje domknięte — wdrożone na produkcję (nie są już brakami)

Sekcja prowadzona po to, by żadna wcześniej ujawniona pozycja nie zniknęła z dokumentu bez śladu.
Wspólny dowód wdrożenia: deploy `firebase deploy --only hosting:app` z **2026-07-24**,
commit `495aace`, site `wynajempro` (domena `wynajempro.com`); przed wdrożeniem lint bez uwag,
poprawny build i testy end-to-end 49/49.

| Obszar (dawna pozycja listy braków) | Stan po wdrożeniu | Dowód i zastrzeżenia |
|---|---|---|
| **Wycofanie zgody na cookies** (N6.1) | Mechanizm równie łatwego wycofania i zmiany zgody (art. 7 ust. 3 RODO) **działa na produkcji**. Dwa równorzędne wejścia: link „Ustawienia cookies" w stopce serwisu oraz przycisk „Zmień lub wycofaj zgodę na cookies" na stronie Polityki Prywatności — oba ponownie otwierają banner z symetrycznym wyborem „Akceptuję" / „Wycofaj zgodę" i linią statusu aktualnego wyboru. Wycofanie **realnie zatrzymuje** Analytics: ustawienie flagi opt-out `ga-disable-<measurementId>`, wyłączenie zbierania po stronie Firebase i skasowanie istniejących plików cookies `_ga*`. Ponadto bez zapisanej zgody nie powstaje instancja Analytics — zdarzenia logowania i rejestracji nie trafiają do GA przed akceptacją (model opt-in bez luk). | Pełny przepływ przeklikany **na produkcji 2026-07-24**: akceptacja → utworzenie plików cookies `_ga`; ponowne otwarcie panelu z obu wejść; wycofanie → flaga opt-out ustawiona, pliki cookies `_ga*` faktycznie usunięte. Testy `e2e/cookie-consent.spec.js` 3/3. Kod: `src/firebase.js`, `src/components/ConsentNotice.jsx`, `src/pages/PrivacyPage.jsx`, `src/pages/landing/LandingPage.jsx`. Por. `Polityka-prywatnosci.md` §9. **Uwaga:** domknięcie dotyczy wyłącznie mechanizmu — ocena **podstawy prawnej cookies** (nieaktualne odwołanie do Prawa telekomunikacyjnego zamiast Prawa komunikacji elektronicznej) pozostaje otwarta dla prawnika, patrz `Polityka-prywatnosci.md` §9. |
| **Ostrzeżenie przy usuwaniu konta** (N6.2) | Komunikat przed usunięciem konta wymienia **pełny faktyczny zakres kasacji**: przewodniki wraz z danymi dostępowymi gości (kody, WiFi) i podpisami akceptacji regulaminu, pliki, dane biznesowe (obiekty, rezerwacje, koszty, zadania), subskrypcję i rekord klienta Stripe, profil oraz konto logowania — z zastrzeżeniem, że operacja jest nieodwracalna i następuje bez okresu karencji. Zakres jest spójny z sekcją 8 (poprzednio komunikat wymieniał zakres węższy niż faktyczna kasacja). | Kod: `src/pages/dashboard/modals/AccountModal.jsx` (wydanie 2026-07-24). **Zastrzeżenie co do sposobu weryfikacji:** potwierdzone w kodzie, buildzie i testach; komunikat jest dostępny wyłącznie po zalogowaniu, więc **nie był oglądany na produkcji** — smoke test właściciela jeszcze się nie odbył. |
| **Kopie zapasowe bazy** (N6.3) | Baza ma włączone **odtwarzanie do punktu w czasie (PITR)** z oknem **7 dni** oraz niezależny **dzienny harmonogram kopii zapasowych z retencją 7 dni**. Zamyka to opisywaną wcześniej lukę: redundancja infrastruktury dostawcy chroni przed awarią sprzętu, ale nie przed omyłkowym skasowaniem danych przez aplikację lub skrypt — a w projekcie działa funkcja, której zadaniem jest kasowanie danych po okresie karencji. Od teraz istnieje ścieżka odtworzenia stanu sprzed takiego zdarzenia. | Wykonane 2026-08-13 na zlecenie właściciela. Stan potwierdzony odczytem konfiguracji bazy po zmianie: odtwarzanie do punktu w czasie **włączone**, okres przechowywania wersji **604800 s (7 dni)** (wcześniej 3600 s), harmonogram **dzienny**, retencja **604800 s**; przed zmianą harmonogramów było **zero**. Zastrzeżenie zakresu: mechanizm obejmuje **bazę danych**, nie pliki w magazynie plików. |
| **Egzekwowanie App Check** (N6.4) | Ochrona przed automatycznymi nadużyciami jest **realnie egzekwowana**, a nie tylko zainicjowana po stronie aplikacji. Stan per usługa: **baza danych (Cloud Firestore) — egzekwowanie włączone, 99% żądań zweryfikowanych**; **uwierzytelnianie — egzekwowanie włączone**; magazyn plików — tryb monitorowania (100% żądań zweryfikowanych, bez odrzucania); funkcje serwerowe — bez egzekwowania. Deklaracja z Polityki prywatności i DPA §6 odpowiada więc stanowi faktycznemu dla **bazy danych i logowania**, czyli warstw, w których przetwarzane są dane osobowe. | Potwierdzone 2026-08-13 odczytem panelu App Check w konsoli dostawcy (zrzut przekazany przez Operatora) oraz weryfikacją na żywo: po włączeniu egzekwowania dla uwierzytelniania strony gościa nadal działają. **Zastrzeżenie zakresu:** magazyn plików i funkcje serwerowe pozostają bez egzekwowania — decyzja o ich objęciu jest otwarta, a magazyn niesie materiały pokazywane Gościom, więc wymaga weryfikacji po zmianie. **Uwaga:** u dostawcy egzekwowanie dla uwierzytelniania jest oznaczone jako funkcja w wersji zapoznawczej (PREVIEW). |

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
Aktualizacja 2026-07-24: wydanie produkcyjne (commit `495aace`) domknęło dwie pozycje sekcji 9 —
wycofanie zgody na cookies (N6.1) oraz zakres ostrzeżenia przy usuwaniu konta (N6.2); przeniesiono
je do sekcji 9.1.
Aktualizacja 2026-08-13: skonfigurowano kopie zapasowe bazy (odtwarzanie do punktu w czasie
+ dzienny harmonogram, retencja 7 dni) — pozycja przeniesiona do sekcji 9.1; zapadła też decyzja
właściciela o polityce haseł (8 znaków, litera i cyfra), której wprowadzenie w konsoli jest przed nami.
Aktualizacja 2026-08-13 (wieczór): **egzekwowanie App Check potwierdzone i przeniesione do sekcji 9.1** —
z zastrzeżeniem zakresu (magazyn plików i funkcje serwerowe bez egzekwowania). Pozostałe pozycje listy
braków — w tym osierocone pliki z przeszłości — **pozostają otwarte**.
Nie stanowi opinii prawnej ani deklaracji zgodności — służy jako podkład do oceny przez prawnika.*
