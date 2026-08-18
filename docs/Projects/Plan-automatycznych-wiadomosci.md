# Plan: automatyczne wiadomości do gości

> **Status:** ⏸ projekt techniczny do decyzji właściciela (2026-08-17).
> Pomysł leży w [[Projects/Backlog]] („Automatyczne wiadomości do gości"). Do
> [[Projects/Roadmap]] przechodzi dopiero Twoją decyzją — wtedy dostaje numer i pełny opis.
> **Po co:** dziś aplikacja **przypomina** o zadaniu, ale wiadomość i tak piszesz ręcznie.
> Celem jest, żeby dwa zadania — powitalne z przewodnikiem (tydzień przed) i kod do skrytki
> (dzień przed) — wychodziły same, z danych, które już są w rezerwacji.

---

## 1. Co już jest w kodzie (fakty, nie założenia)

| Element | Gdzie | Stan |
|---|---|---|
| Zadania z terminem „X dni przed" | `src/utils/constants.js:30-32`, edytor w `ManagerApp.jsx:446` | ✅ jest — `directions` (3 dni), `keycode` (1 dzień), `cleaning` (0) |
| Wyliczanie, co jest na dziś | `src/pages/dashboard/ManagerApp.jsx:177` (`dailyReport`) | ✅ jest, ale **liczy się w przeglądarce** — to tylko lista dla człowieka |
| Odhaczanie zadania | `completedTasks.{id}` w rezerwacji, `WynajemContext.jsx:71` | ✅ jest |
| E-mail i telefon gościa | pola `email`, `phone` w rezerwacji, `AddEditEntryModal.jsx:62,66` | ✅ jest |
| Przewodnik gościa + kod do drzwi | `guides/{id}`, sekrety w `guides/{id}/secrets/data`, publiczny `/guide/{id}` | ✅ jest |
| Powiązanie przewodnika z obiektem | `guides.propertyId` = **nazwa** obiektu, ta sama co `rentals.property` | ✅ jest — złączenie rezerwacja → przewodnik jest wykonalne bez zmian modelu |
| Zadanie uruchamiane co dobę | `functions/index.js:769` (`dailyICalSync`, 06:00 Europe/Warsaw) | ✅ wzorzec gotowy do skopiowania |
| Sekrety funkcji (klucze API) | `defineSecret`, `functions/index.js:16` | ✅ wzorzec gotowy |
| **Wysyłka jakiegokolwiek maila** | — | ❌ **nie ma. Zero.** Nawet formularz kontaktowy tylko zapisuje do Firestore |

**Wniosek:** logika „co i kiedy" jest już policzona — brakuje trzech rzeczy: przeniesienia jej
na serwer, kanału wysyłki i miejsca, w którym widać, co poszło.

---

## 2. Czego brakuje — uczciwie, zanim policzymy zyski

1. **Rezerwacje z portali nie mają e-maila.** Synchronizacja iCal zapisuje tylko daty i nazwę
   (`functions/index.js:713-743`, `guestNote: ""`). Airbnb i Booking **nie przekazują adresu
   w pliku iCal** — nie ma go skąd wziąć. Automat wyśle wiadomość tylko tam, gdzie adres
   wkleisz. To zamienia „napisz maila" (kilka minut) w „wklej adres" (kilkanaście sekund),
   ale nie zeruje roboty. Panel musi to pokazywać: *„2 rezerwacje bez adresu — automat nie wyśle"*.
2. **Aliasy pocztowe portali wygasają** po pobycie. Dla wiadomości przed przyjazdem to bez
   znaczenia, dla „prośby o opinię po wyjeździe" (faza 4) — istotne.
3. **Domena nadawcza nie jest przygotowana.** Bez SPF, DKIM i DMARC na `wynajempro.com` maile
   trafią do spamu i cała reszta pracy pójdzie na marne. To jest krok zerowy, nie kosmetyka.
4. **Nie ma śladu wysyłki.** Dziś „wysłane" = odhaczony checkbox. Automat musi zapisywać
   dowód: co, do kogo, kiedy, z jakim skutkiem — inaczej przy pierwszej reklamacji gościa
   („nic nie dostałem") nie masz czym odpowiedzieć.

---

## 3. Architektura — trzy warstwy, każda testowalna osobno

```
   [1] KONFIGURACJA                [2] PLANISTA                  [3] KOLEJKA + WYSYŁKA
   panel, ustawienia          Cloud Function, raz na dobę        Firestore + dostawca

  settings/reminders   ──┐
   (ile dni przed)        │      scheduleGuestMessages           outbox/{uid}_{rez}_{zadanie}
                          ├──►   07:00 Europe/Warsaw       ──►    status: queued
  settings/automations ──┘       (po synchronizacji iCal)         status: awaiting_approval
   (treść, włącz/wyłącz)                 │                        status: sent | error
                                         │                              │
                          czyta rezerwacje z okna                       ▼
                          + przewodnik obiektu               sendOutboxMessage (onCreate)
                          + sprawdza, czy już wysłane        ──► Resend / Brevo ──► gość
```

**Dlaczego kolejka, a nie wysyłka wprost z planisty:** identyfikator dokumentu w `outbox` jest
**deterministyczny** — `{uid}_{idRezerwacji}_{idZadania}`. Zapis robimy przez `create()`, które
**pada, jeśli dokument już istnieje**. To daje „dokładnie raz" nawet wtedy, gdy funkcja
uruchomi się dwa razy albo Google ją ponowi po błędzie. Podwójna wiadomość do gościa
to najgorszy możliwy błąd tej funkcji — kolejka go wyklucza konstrukcyjnie, nie „uważaniem".

### Warstwa 1 — konfiguracja

Nowy dokument `users/{uid}/settings/automations` (osobny, żeby nie ruszać istniejącego
`settings/reminders` i jego walidacji w regułach):

```javascript
{
  enabled: false,              // główny włącznik
  mode: 'approval',            // 'approval' | 'auto'  (patrz decyzja D3)
  testRecipient: '',           // jeśli ustawione — WSZYSTKO idzie tu, nie do gości
  fromName: 'Domki nad jeziorem',
  replyTo: 'wasyl@...',        // odpowiedzi gości trafiają do Ciebie
  rules: {
    directions: {              // klucz = id zadania z settings/reminders
      enabled: true,
      channel: 'email',
      subject: 'Twój pobyt w {{obiekt}} — wszystko, co trzeba wiedzieć',
      body: '...{{imie}}...{{link_do_przewodnika}}...',
      includeGuideLink: true,
      includeDoorPin: false
    },
    keycode: { enabled: true, channel: 'email', includeDoorPin: false, includeGuideLink: true, ... }
  }
}
```

**Termin zostaje tam, gdzie jest** — w `settings/reminders` (`daysBefore`). Jedno źródło prawdy:
zmieniasz „3 dni" na „7 dni" w ustawieniach zadań i automat od razu wysyła tydzień przed.

**Wypełniacze w treści:** `{{imie}}`, `{{obiekt}}`, `{{data_przyjazdu}}`, `{{data_wyjazdu}}`,
`{{liczba_nocy}}`, `{{link_do_przewodnika}}`, `{{kod_do_skrytki}}`, `{{wifi}}`, `{{gospodarz}}`.
Podstawianie **na serwerze**, z ucieczką HTML — treść wpisuje człowiek, więc musi być odporna
na przypadkowy `<` w tekście.

### Warstwa 2 — planista

`scheduleGuestMessages`, `onSchedule`, **07:00 Europe/Warsaw** (godzinę po `dailyICalSync`, żeby
świeżo zaimportowane rezerwacje weszły tego samego dnia). Dla każdego użytkownika `active`/`trialing`:

1. czyta `settings/automations` — jeśli `enabled: false`, kończy;
2. pobiera rezerwacje z okna `date >= dziś AND date <= dziś + max(daysBefore)`
   (`date` to `YYYY-MM-DD`, więc zwykły zakres tekstowy — bez nowego indeksu złożonego);
3. dla każdej pary rezerwacja × włączona reguła liczy `dzień wysyłki = przyjazd − daysBefore`;
4. **bramki (każda osobno logowana):**
   - `completedTasks[id] === true` → pomiń (odhaczyłeś ręcznie — automat nigdy nie dubluje człowieka);
   - brak `email` → pomiń i zapisz powód `brak-adresu` (zadanie zostaje na liście ręcznej);
   - `guest` zaczyna się od `Blokada (` → pomiń (to blokada z portalu, nie gość);
   - przyjazd w przeszłości → pomiń;
   - rezerwacja dodana **wewnątrz** okna (np. wpis na 3 dni przed przyjazdem, a mail ma iść
     7 dni przed) → wyślij raz, od razu — treść dalej jest przydatna;
   - `rental.automationOff === true` → pomiń (wyłącznik per rezerwacja);
5. tworzy dokument w `outbox` (`create()` — duplikat odpada sam);
6. ustawia `completedTasks[id] = true`, żeby zadanie zniknęło z Pulpitu — **automat i lista
   zadań to jeden mechanizm, nie dwa równoległe**.

### Warstwa 3 — kolejka i wysyłka

`sendOutboxMessage`, `onDocumentCreated('outbox/{id}')`: renderuje treść, woła API dostawcy,
zapisuje `status: 'sent'` + identyfikator wiadomości od dostawcy albo `status: 'error'` + treść błędu.
Do tego zamiatarka co 15 minut: ponawia `error` przy `attempts < 3` (mail nie może przepaść przez
jedną minutę awarii dostawcy).

W trybie `approval` planista tworzy dokument ze statusem `awaiting_approval`, a wysyłkę odpala
dopiero funkcja wywoływalna `approveOutboxMessage` (klient **nie pisze** do `outbox` bezpośrednio).

---

## 4. Bezpieczeństwo i reguły

- `outbox` — klient **czyta** wyłącznie swoje (`resource.data.uid == request.auth.uid`),
  **nie zapisuje nic**. Piszą tylko funkcje (Admin SDK omija reguły). Akcja „wyślij teraz"
  i „odrzuć" idą przez `onCall`, nie przez zapis do dokumentu.
- `settings/automations` — rozszerzenie `isValidSettings` w `firestore.rules`: lista dozwolonych
  pól + **twarde limity długości** `subject` i `body`. Treść trafia do maila wychodzącego
  w Twoim imieniu — to jest miejsce, w którym walidacja ma znaczenie, nie ozdobnik.
  Zmiana reguł idzie ścieżką ze skilla `reguly` (lustrzany tester w `functions/*.cjs`, bez emulatora).
- **Kod do skrytki w treści maila** — patrz decyzja D2. Dziś PIN jest chroniony: gość widzi go
  dopiero po zalogowaniu anonimowym i podpisaniu regulaminu (`GuestGuideView.jsx:103`,
  `firestore.rules:235`). Wysłanie PIN-u zwykłym mailem tę barierę **omija**.
- Retencja: `outbox` zawiera imię i adres gościa. Automatyczne kasowanie po ustalonym okresie
  (wzorzec jest — `deleteExpiredAccountsData`, `functions/index.js:509`).
- Wyłącznik awaryjny: dokument `config/automations` czytany przy każdym przebiegu — jedna zmiana
  w konsoli zatrzymuje wysyłkę u wszystkich, gdyby coś poszło nie tak.
- Limit dzienny per konto — ochrona przed sytuacją, w której błąd w danych generuje setki maili.

---

## 5. Decyzje, których nie podejmę za Ciebie

**D1. Dostawca poczty.** Wysyłka musi iść przez usługę transakcyjną — nie przez Gmaila.
Kandydaci: **Resend** (najprostsze API, region EU dostępny), **Brevo** (firma z UE — prostszy
załącznik podprzetwarzających do DPA), **Postmark** (najlepsza dostarczalność, bez darmowego
progu). Cenniki i limity darmowych progów **trzeba sprawdzić na dzień decyzji** — nie wpisuję
liczb z pamięci. Wybór wpływa na: DPA (nowy podprzetwarzający), konfigurację DNS, kod wysyłki (~80 linii).

**D2. Kod do skrytki — w treści maila czy za linkiem?**
- *(a) PIN w mailu* — najprościej dla gościa, ale kod zostaje na zawsze w jego skrzynce i w logach
  dostawcy, bez podpisu regulaminu.
- *(b) mail z linkiem do przewodnika, PIN po podpisaniu regulaminu* — **to już działa w aplikacji**,
  nic nie trzeba budować; przy okazji zbierasz podpis pod regulaminem, czyli dowód, gdyby doszło
  do sporu. Minus: gość musi kliknąć.
- **Rekomendacja: (b) domyślnie, (a) jako świadomie zaznaczany wyjątek.** Wariant (b) nie tylko
  jest bezpieczniejszy — sprzedaje przewodnik, który i tak zbudowałeś.

**D3. Tryb akceptacji na start czy od razu pełny automat?**
Rekomendacja: **`approval` przez 2–3 tygodnie na własnych rezerwacjach**. Panel pokazuje
„2 wiadomości czekają", widzisz podgląd, klikasz „wyślij". Jak przez kilkanaście rezerwacji
nic Cię nie zaskoczy — przełącznik na `auto`. Kosztuje jeden ekran więcej, kupuje pewność,
że pierwszy w pełni automatyczny mail do obcego człowieka nie będzie zawierał `{{imie}}`.

**D4. SMS — teraz czy później?** Telefon jest w rezerwacji, więc technicznie to ten sam mechanizm
z innym dostawcą (w Polsce np. SMSAPI — wymaga rejestracji nazwy nadawcy). Ale: SMS **kosztuje
za sztukę**, więc albo wchodzi do droższego pakietu, albo zjada marżę. **Rekomendacja: faza 4**,
i tylko dla kodu do skrytki (dzień przed = największa szansa, że mail utknie w spamie) lub jako
zapas, gdy adresu brak.

---

## 6. Fazy wdrożenia

**Faza 0 — domena nadawcza.** Konto u dostawcy, SPF + DKIM + DMARC na `wynajempro.com`, klucz
przez `defineSecret`. *Gotowe, gdy:* testowy mail z funkcji dociera na Gmail i Onet **do skrzynki
odbiorczej**, nagłówki pokazują `dkim=pass; spf=pass; dmarc=pass`. *Weryfikacja:* nagłówki
wiadomości. **Bez tego cała reszta jest bezużyteczna.** Agent: `dev`.

**Faza 1 — rdzeń bez UI.** `outbox` + `sendOutboxMessage` + `scheduleGuestMessages` + tryb testowy
(`testRecipient`). Konfiguracja wpisywana ręcznie w konsoli Firestore. *Gotowe, gdy:* sztuczna
rezerwacja z Twoim adresem generuje dwie wiadomości w prawidłowych terminach, a ponowne
uruchomienie funkcji **nie tworzy trzeciej**. *Weryfikacja:* wymuszony przebieg planisty na koncie
testowym + zawartość `outbox`. Agent: `dev`, przegląd `code-reviewer`.

**Faza 2 — panel.** Zakładka „Automatyczne wiadomości" w ustawieniach (włącznik, tryb, edytor
treści z podglądem i wypełniaczami, wysyłka testowa), oś czasu wysyłek w szczegółach rezerwacji,
znacznik „brak adresu" na Pulpicie. *Gotowe, gdy:* całość da się skonfigurować bez konsoli
Firebase. Agenci: `designer` (spójność `.wpd`) + `dev`.

**Faza 3 — produkcja na własnych rezerwacjach.** Tryb `approval`, obserwacja. *Gotowe, gdy:*
kilkanaście rezerwacji obsłużonych bez niespodzianki → przełączenie na `auto`.

**Faza 4 — rozszerzenia.** SMS dla kodu; wiadomość po wyjeździe z prośbą o opinię (**strona opinii
już istnieje — X13**, brakuje tylko wyzwalacza); przypomnienie o zaliczce.

---

## 7. Sprawy prawne — do agenta `legal` przed fazą 3

1. **Nowy podprzetwarzający** (dostawca poczty) — wpis do załącznika DPA i informacja dla
   gospodarzy. Konfiguracja: Ty jesteś procesorem, gospodarz administratorem danych swoich gości.
2. **Charakter wiadomości.** To komunikacja **transakcyjna** (wykonanie umowy najmu), nie marketing —
   i tak musi zostać. Jedno zdanie w stylu „a przy okazji zobacz nasz drugi domek" zamienia ją
   w marketing bezpośredni ze wszystkimi tego konsekwencjami. Edytor treści powinien to mówić wprost.
3. **Nadawca musi być rozpoznawalny.** Gość dostaje maila od gospodarza, nie od „WynajemPRO" —
   stopka musi identyfikować gospodarza. Technicznie: `From` na domenie `wynajempro.com`
   (własnej domeny gospodarza nie podpiszemy bez osobnej konfiguracji DNS u niego), nazwa
   wyświetlana i `Reply-To` gospodarza.
4. **Retencja `outbox`** — okres do ustalenia razem z nierozstrzygniętą retencją `contact_messages`
   (zadanie #31).
5. **PIN mailem** (jeśli D2 = wariant a) — ocena pod kątem adekwatności środków ochrony.

---

## 8. Ryzyka

| Ryzyko | Waga | Odpowiedź |
|---|---|---|
| Podwójna wysyłka do gościa | wysoka | deterministyczne ID + `create()` — wykluczone konstrukcyjnie |
| Mail z niepodstawionym `{{imie}}` | wysoka | tryb `approval` na start + wysyłka testowa do siebie |
| Maile w spamie | wysoka | faza 0 (SPF/DKIM/DMARC) jest bramką, nie dodatkiem |
| Brak adresu przy rezerwacjach z portali | **pewna, nie ryzyko** | zadanie zostaje na liście ręcznej + widoczny znacznik w panelu |
| Awaria dostawcy | średnia | kolejka + ponowienia + widoczny status `error` w panelu |
| Błąd w danych generuje lawinę maili | niska | limit dzienny + wyłącznik awaryjny w `config/automations` |
| Zły dzień wysyłki (strefa/zmiana czasu) | niska | wszystko liczone w `Europe/Warsaw` na datach `YYYY-MM-DD` |

---

## 9. Koszty

Do policzenia przy decyzji D1 — **nie wpisuję kwot z pamięci**, cenniki się zmieniają.
Rzędy wielkości: Cloud Functions przy jednym przebiegu dziennie to grosze; koszt poczty
transakcyjnej przy skali „jeden gospodarz, kilkaset rezerwacji rocznie" mieści się w darmowych
progach wszystkich trzech kandydatów. Realna decyzja kosztowa pojawia się przy SMS-ach (D4)
i przy wielu klientach — wtedy to argument za osobnym pakietem cenowym, nie funkcja gratis.

---

**Powiązane:** [[Projects/Backlog]] (pomysł źródłowy) · [[Projects/Roadmap]] (X13 — strona opinii,
naturalna faza 4) · [[Agent-Process-Map]] · `docs/legal/` (DPA — podprzetwarzający)
