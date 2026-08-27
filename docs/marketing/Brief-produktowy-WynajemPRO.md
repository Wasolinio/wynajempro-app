# WynajemPRO — brief produktowy do pisania tekstów

> **Do czego jest ten dokument:** materiał źródłowy dla osoby (albo modelu), która pisze teksty
> marketingowe — posty w mediach społecznościowych, opisy, maile. Zawiera to, czym produkt jest,
> dla kogo, po co, co dokładnie robi, oraz listę rzeczy, których **nie wolno obiecywać**.
> Stan na 2026-08-26. Źródła: [[strategy/X11-Plan-marketingowy-launchu]], artykuły z `docs/support/`,
> kod aplikacji.

---

## 1. Czym to jest, w jednym zdaniu

Jeden panel do obsługi wynajmu krótkoterminowego: kalendarz wszystkich obiektów, przewodnik dla
gościa z kodem odsłanianym po akceptacji regulaminu i rozliczenie gotowe dla księgowego.
Stała cena za konto, nie za obiekt.

Wersja dłuższa: WynajemPRO to aplikacja przeglądarkowa (działa też z telefonu, bez instalowania),
w której gospodarz prowadzi rezerwacje, koszty, podatki i komunikację informacyjną z gościem.
Zastępuje arkusz w Excelu, kalendarz Google i kartki z hasłem do Wi-Fi przyklejone w domku.

---

## 2. Dla kogo

**Gospodarz z jednym do pięciu obiektów, który obsługuje gości sam.** Domki letniskowe,
apartamenty, pokoje. Bez recepcji, bez działu operacyjnego, bez osoby od rozliczeń.
Sprzedaje przez Booking.com, Airbnb i bezpośrednio (Facebook, telefon, polecenia).
Rozlicza się najczęściej ryczałtem.

Dziś takich gospodarzy najczęściej **nie obsługuje żaden system** — prowadzą wynajem w Excelu,
kalendarzu w telefonie i w pamięci. To jest realny konkurent numer jeden.

**Kto nie jest odbiorcą:** hotele i obiekty z recepcją, firmy zarządzające dziesiątkami
apartamentów, wynajem długoterminowy (umowy, najemcy, media z liczników).

**Ważne dla wiarygodności:** autor aplikacji prowadzi Domki Letniskowe Ruś i sam obsługuje gości.
Produkt powstał, bo arkusz przestał nadążać za rezerwacjami z trzech kanałów. To jedyny dowód,
jakim naprawdę dysponujemy, i jest mocniejszy niż jakiekolwiek hasło.

---

## 3. Po co, czyli jakie problemy rozwiązuje

| Problem gospodarza | Co robi z tym WynajemPRO |
|---|---|
| Rezerwacje w trzech miejscach naraz, ryzyko podwójnej rezerwacji | Wszystkie terminy w jednym kalendarzu; import z portali przez iCal |
| „Ile ja na tym właściwie zarabiam?" | Zysk po prowizjach portali, kosztach stałych i podatku, w jednym zestawieniu |
| Ryczałt, progi, rozliczenie z księgowym | Podatek liczony przy rezerwacji, raport roczny do PDF, plik CSV dla księgowego |
| Telefony gościa o hasło do Wi-Fi, kod do drzwi i godzinę wymeldowania | Przewodnik gościa pod jednym linkiem albo kodem QR |
| Spór z gościem: „nie wiedziałem, że tak było w regulaminie" | Akceptacja regulaminu zapisana z datą i treścią z tego dnia |
| Rosnący koszt narzędzi przy drugim i trzecim obiekcie | Jedna cena za konto niezależnie od liczby obiektów |

---

## 4. Co dokładnie robi produkt

### Kalendarz i rezerwacje
Wszystkie obiekty na jednym widoku. Wpis może być rezerwacją gościa, kosztem albo zadaniem
do zrobienia. Przy rezerwacji: dane gościa, kwoty, kanał sprzedaży, oznaczenie opłacenia,
rozliczenie pobytu i zadania powiązane z pobytem.

### Synchronizacja z portalami (iCal)
Gospodarz wkleja linki iCal z Booking.com i Airbnb. Rezerwacje z portali wpadają do kalendarza
**automatycznie raz na dobę o 6 rano**, a poza tym w każdej chwili przyciskiem. W drugą stronę
aplikacja udostępnia własny link iCal, który portale odczytują u siebie, dzięki czemu rezerwacje
bezpośrednie blokują tam terminy.

### Finanse
Przychód, prowizje portali, koszty jednorazowe i koszty stałe cykliczne. Widok przeglądu,
zakładka kosztów, raporty. Raport roczny drukuje się do PDF, dane wychodzą plikiem CSV
dla księgowego.

### Podatki
Ryczałt, skala podatkowa i VAT. Podatek liczy się przy każdej rezerwacji. System pilnuje progu
100 000 zł i sam przechodzi ze stawki 8,5% na 12,5%. Osobne zestawienie dla księgowej.

### Przewodnik gościa
Strona internetowa dla gościa, otwierana z linku albo kodu QR, bez zakładania konta i bez
instalowania aplikacji. Zawiera podstawowe informacje o pobycie, dojazd, zasady i regulamin,
instrukcję bezpieczeństwa PPOŻ, polecane miejsca w okolicy oraz kontakt do gospodarza.

**Rzecz, która nas wyróżnia:** hasło do Wi-Fi i kod do drzwi są ukryte i odsłaniają się dopiero
wtedy, gdy gość potwierdzi regulamin i instrukcję PPOŻ. Potwierdzenie zapisuje się razem z datą
i treścią regulaminu obowiązującą tego dnia. Przy sporze gospodarz ma ślad, że gość znał zasady,
zanim dostał kod. Zmiana hasła Wi-Fi nie wymaga wysyłania nowego linku.

### Strona opinii
Osobna strona z odnośnikami do portali z opiniami, wysyłana gościowi po pobycie.

### Konto
Rejestracja przez Google albo adresem e-mail. Profil gospodarza z danymi widocznymi dla gości.
Okres próbny, subskrypcja, anulowanie i całkowite usunięcie konta razem z danymi.

---

## 5. Cena i model

- **29,99 zł miesięcznie za konto**, niezależnie od tego, czy obiektów jest jeden, czy pięć.
- **Bez prowizji od rezerwacji.**
- **14 dni testów bez podawania karty.**
- Pierwsi klienci (founding members) mają cenę startową gwarantowaną przez **12 miesięcy od
  pierwszej płatności**. Potem cena bieżąca, z uprzedzeniem 30 dni.

⚠️ Warunków founding members **nie wolno komunikować jako „rabatu" ani „promocji"** — to nie
przecena, tylko cena startowa z gwarancją okresu. Wynika to z obowiązków informacyjnych
o cenach (dyrektywa Omnibus).

**Porównanie, które warto pokazywać:** zagraniczne channel managery liczą sobie za obiekt.
Przy pięciu obiektach koszt idzie w setki złotych miesięcznie. U nas cena się nie zmienia.

---

## 6. Czego NIE wolno obiecywać

To jest najważniejsza sekcja tego briefu. Każde z poniższych zdań pojawiało się już w tekstach
i każde jest nieprawdziwe. Obietnica ponad stan wraca jako zwrot pieniędzy w drugim miesiącu.

| Nie piszemy | Bo naprawdę jest tak |
|---|---|
| „Synchronizacja w czasie rzeczywistym", „natychmiast blokuje termin" | Import raz na dobę o 6:00 albo ręcznie; portale odświeżają nasz link od kilku do kilkunastu godzin |
| „Dwukierunkowa integracja", „channel manager" | To iCal, nie integracja przez API |
| „Kod wysłany automatycznie w dniu przyjazdu", „automatyczne wiadomości" | Aplikacja **nie wysyła gościom niczego**. Link wysyła gospodarz. Kod odsłania się po akceptacji regulaminu, nie o godzinie |
| „Zastępuje księgowego", „koniec ze strachem przed kontrolą" | To zestawienie pomocnicze dla Ciebie i dla księgowego, nie deklaracja podatkowa |
| „Nasz zespół wsparcia", „właściciele wybierają" | Za produktem stoi jeden człowiek; nie mamy jeszcze bazy klientów, na którą można się powołać |
| „Premium", „profesjonalny", „nowoczesny" jako argument | Puste przymiotniki. Zamiast nich konkret: mechanizm, liczba, sytuacja |
| Wymyślone kwoty pokazane jak wynik klienta | Liczby w makietach podpisujemy jako dane przykładowe albo bierzemy realne z Domków Ruś |

---

## 7. Ton i język

- Zwracamy się na „Ty", do jednej osoby.
- Zero emoji. To zasada identyfikacji marki, nie preferencja.
- Krótkie zdania, bez wykrzykników i bez żargonu branżowego.
- Mówimy o sytuacji czytelnika, nie o cechach oprogramowania: nie „intuicyjny interfejs",
  tylko „dodajesz rezerwację między jednym przyjazdem a drugim".
- Nie deklarujemy własnego stylu („mówimy wprost", „bez lania wody"). Po prostu piszemy tak.
- Unikamy wyliczeń trójkowych i konstrukcji „X, nie Y" wielokrotnie pod rząd — po polsku
  brzmią jak tekst z generatora.

**Słowa, których szukają klienci** (przydatne w tekstach i opisach): program do zarządzania
wynajmem krótkoterminowym, rozliczenie najmu krótkoterminowego ryczałt, kalendarz rezerwacji
domków, synchronizacja Booking Airbnb.

---

## 8. Gotowe do użycia w postach

Sytuacje, które ICP rozpozna od razu:

- Gość dzwoni o 22:00 z pytaniem o kod do skrytki.
- Ta sama data zapisana w dwóch miejscach i telefon z Booking.com.
- Koniec roku i pytanie księgowej o zestawienie, którego nie ma.
- Trzy różne kartki z hasłem Wi-Fi w trzech domkach, każda z innym hasłem.
- Pytanie „ile właściwie zostało po prowizjach", na które Excel nie odpowiada.

Fakty, które można powtarzać bez ryzyka:

- 29,99 zł za konto, nie za obiekt. Bez prowizji od rezerwacji.
- 14 dni bez karty.
- Kod do drzwi dopiero po akceptacji regulaminu, z zapisaną datą.
- Import rezerwacji z Booking.com i Airbnb co rano, plus ręcznie w każdej chwili.
- Próg ryczałtu 100 000 zł pilnowany automatycznie, przejście z 8,5% na 12,5%.
- Raport roczny do PDF, plik CSV dla księgowego.
- Napisane przez gospodarza, który sam prowadzi Domki Letniskowe Ruś.
