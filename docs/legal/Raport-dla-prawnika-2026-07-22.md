# WynajemPRO — raport dla prawnika

**Data:** 2026-07-22 · **Przygotowanie:** zespół WynajemPRO (materiał roboczy)
**Cel:** przekazanie kompletu dokumentów do oceny prawnej przed uruchomieniem sprzedaży.

> **Charakter materiału:** wszystkie dokumenty w tym pakiecie są **projektami**. Nie zostały
> opublikowane, nie obowiązują żadnego użytkownika i nie przyjęto dotąd żadnej płatności od
> klienta. Opisy funkcji aplikacji zostały zweryfikowane bezpośrednio w kodzie produkcyjnym —
> tam, gdzie czegoś nie dało się potwierdzić, jest to wyraźnie zaznaczone zamiast domysłu.

---

## 1. Czym jest WynajemPRO

Aplikacja internetowa (model SaaS) dla osób wynajmujących krótkoterminowo nieruchomości —
domki, apartamenty. Jeden użytkownik („Gospodarz") zarządza swoimi obiektami: kalendarzem
rezerwacji, kosztami, prostymi rozliczeniami podatkowymi.

**Adres:** https://wynajempro.com · **Model:** 14 dni bezpłatnego okresu próbnego (bez karty),
następnie subskrypcja 29,99 zł/mies. przez Stripe · **Skala:** przed startem sprzedaży,
działalność jednoosobowa, brak pracowników.

**Funkcja istotna prawnie:** Gospodarz tworzy w aplikacji **przewodnik dla gościa** — stronę
z instrukcjami pobytu, którą udostępnia linkiem. Przewodnik zawiera m.in. kod do drzwi i hasło
WiFi, ujawniane gościowi po elektronicznej akceptacji regulaminu obiektu. Oznacza to, że
**Gospodarz przetwarza w aplikacji dane swoich gości** — stąd potrzeba umowy powierzenia (DPA).

---

## 2. Co przekazujemy do oceny

| # | Dokument | Czego dotyczy | Stan |
|---|---|---|---|
| 1 | `Regulamin.md` | Regulamin świadczenia usług drogą elektroniczną | Projekt, zaktualizowany 2026-07-22 |
| 2 | `Polityka-prywatnosci.md` | Informacja o przetwarzaniu danych (art. 13 RODO) | Projekt, zaktualizowany 2026-07-22 |
| 3 | `DPA-powierzenie.md` | Umowa powierzenia (art. 28 RODO) — Gospodarz jako administrator danych gości | Projekt, zaktualizowany 2026-07-22 |
| 4 | `Bezpieczenstwo-kont-i-danych.md` | **Nowy** — opis zabezpieczeń kont, haseł i danych, z listą braków | Materiał informacyjny |
| 5 | `Ocena-linki-guide-opinie.md` | Analiza modelu „dostęp po linku" (strony dostępne bez logowania) | Analiza wewnętrzna |
| 6 | `Checklista-zgodnosci.md` | Lista kontrolna zgodności z podstawami prawnymi | Materiał roboczy |
| 7 | `Uwagi-N5-dla-prawnika.md` | Ustalenia z wewnętrznego audytu bezpieczeństwa i RODO | Materiał roboczy |

Dokumenty 1–3 są przeznaczone do publikacji po akceptacji. Dokumenty 4–7 to materiał
kontekstowy — pokazują, na jakiej podstawie sformułowano treści i jakie ryzyka rozpoznano.

---

## 3. Co zrobiliśmy sami przed tym spotkaniem

Żeby nie zajmować czasu prawnika kwestiami technicznymi, przed spotkaniem domknęliśmy warstwę
techniczną, od której zależy prawdziwość deklaracji w dokumentach:

- **Weryfikacja adresu e-mail** — wymagana, egzekwowana także po stronie serwera (nie tylko
  w interfejsie).
- **Kontrola dostępu do danych** — dane każdego konta odizolowane regułami bazy danych;
  udostępnianie publiczne ograniczone do świadomie wybranych stron.
- **Usuwanie danych (art. 17)** — pełna kasacja obejmuje dziś także treści przewodników, dane
  dostępowe gości, pliki oraz rekord klienta u operatora płatności; proces jest odporny na awarie
  (nieudany krok powoduje ponowienie, a nie ciche pominięcie).
- **Retencja** — zdefiniowana i zaimplementowana: 30 dni po anulowaniu subskrypcji, 90 dni po
  zakończeniu okresu próbnego, brak karencji przy usunięciu na żądanie.
- **Strony gości** — wyłączone z indeksowania przez wyszukiwarki na poziomie serwera; identyfikator
  linku nie jest przekazywany do narzędzia analitycznego.

**Zasada, którą się kierowaliśmy:** dokument nie deklaruje środka, którego kod nie egzekwuje.
Kilka zapisów było celowo wstrzymanych do czasu faktycznego wdrożenia.

---

## 4. Zagadnienia, w których prosimy o rozstrzygnięcie

### 4.1 Priorytet — bez tego nie ruszamy ze sprzedażą

1. **Prawo odstąpienia (Regulamin §7).** Model jest nietypowy: 14 dni okresu próbnego **bez
   pobrania płatności**, dopiero potem płatna subskrypcja. Odstąpienie od umowy o dostęp do
   okresu próbnego i odstąpienie od płatnej subskrypcji to dwie różne sytuacje. Prosimy
   o skonstruowanie klauzuli o zgodzie na rozpoczęcie świadczenia i utracie prawa odstąpienia,
   dopasowanej do tego przepływu, oraz o wskazanie, co musi zostać pokazane użytkownikowi
   w procesie płatności.
2. **Status „przedsiębiorcy na prawach konsumenta".** Większość gospodarzy prowadzi działalność
   gospodarczą, ale korzystanie z aplikacji może nie mieć dla nich charakteru zawodowego.
   Przesądzenie zakresu ochrony konsumenckiej wpływa na §7, §8 i §12 Regulaminu.
3. **Kompletność DPA (art. 28 ust. 3).** W szczególności: czy opis kanału „dostępu po linku"
   (§2 ust. 5) wystarczająco realizuje wymóg opisania charakteru przetwarzania, czy potrzebne
   jest odrębne oświadczenie Gospodarza o akceptacji tego kanału, oraz czy **Stripe jest
   subprocesorem danych powierzonych** (naszym zdaniem dotyczy relacji Operator–Gospodarz,
   nie danych gości — prosimy o potwierdzenie).
4. **Model „dostępu po linku" a art. 32 RODO.** Kluczowe pytanie tego pakietu, opisane
   w dokumencie nr 5: przewodnik z kodem do drzwi i hasłem WiFi jest dostępny dla **każdego, kto
   zna link** — bez logowania i bez weryfikacji tożsamości. Wdrożyliśmy środki ograniczające
   (nieodgadywalne adresy, brak możliwości listowania, wyłączenie z wyszukiwarek, ochrona przed
   wyciekiem adresu). Prosimy o ocenę, czy taki model jest obronny, oraz o wskazanie, czy
   konieczne jest wygasanie linków lub dodatkowy PIN. Zwracamy uwagę, że **kod do drzwi dotyczy
   bezpieczeństwa fizycznego nieruchomości**, a nie tylko danych osobowych.
5. **Zgodność deklarowanych zabezpieczeń ze stanem faktycznym.** Dokument nr 4 zawiera także
   listę braków (m.in. brak 2FA, hasło od 6 znaków, brak potwierdzonej konfiguracji kopii
   zapasowych). Prosimy o wskazanie, które z nich należy usunąć **przed** startem sprzedaży.

### 4.2 Ważne, ale nie blokujące startu

6. **Podstawa prawna publikacji kontaktu gospodarza** w przewodniku: wykonanie umowy (art. 6
   ust. 1 lit. b) czy zgoda (lit. a)? Publikacja jest opcjonalna i sterowana przełącznikiem.
7. **Reżim reklamacji i zgodności usługi cyfrowej** (rozdz. 5b ustawy o prawach konsumenta) —
   terminy i skutki milczenia; obecny zapis to 14 dni.
8. **Klauzule ograniczające odpowiedzialność** (Regulamin §12) pod kątem abuzywności — zwłaszcza
   w powiązaniu z §4 ust. 3 (odpowiedzialność Gospodarza za dystrybucję linku).
9. **Transfery danych poza EOG** dla Google/Firebase i Stripe — jaki mechanizm wskazać w DPA §7.
10. **Retencja zgłoszeń z formularza kontaktowego** — proponujemy 12 miesięcy; prosimy
    o potwierdzenie lub wskazanie właściwego okresu.
11. **Okres przechowywania dokumentacji rozliczeniowej** i zasady fakturowania (VAT albo podstawa
    zwolnienia) — do wpisania w Polityce i Regulaminie.
12. **Obowiązek informacyjny przy promocji „founding members"** — czy i jak stosować wymóg
    podania najniższej ceny z 30 dni (dyrektywa Omnibus).
13. **Nieodwracalne usunięcie konta bez „kosza"** — czy sposób ostrzeżenia użytkownika przed
    operacją jest wystarczający.
14. **Czy potrzebny jest Inspektor Ochrony Danych** przy tej skali działalności (nasza ocena
    robocza: nie, art. 37 RODO — prosimy o potwierdzenie).
15. **Aktualny stan obowiązków informacyjnych o pozasądowym rozwiązywaniu sporów** (unijna
    platforma ODR została wygaszona — co należy dziś podawać).

### 4.3 Do wypełnienia przez właściciela przed publikacją

W dokumentach pozostawiono oznaczone miejsca `[DO UZUPEŁNIENIA]` — dane rejestrowe firmy, adresy
kontaktowe, numer i data wersji, warunki oferty „founding members". Nie zostały wypełnione
celowo, żeby uniknąć wpisania danych niepotwierdzonych.

---

## 5. Funkcje wyłączone i świadomie odłożone

Dla porządku — czego aplikacja **dziś nie robi**, mimo że dokumenty mogą o tym wspominać:

- **Generator umów najmu** — funkcja wyłączona z interfejsu decyzją właściciela; nie jest
  oferowana użytkownikom. Regulamin §4 opisuje ją jako niedostępną, a zastrzeżenie o charakterze
  wzorców wraca razem z funkcją. Prosimy o ocenę, czy przy ewentualnym ponownym włączeniu samo
  udostępnianie wzorców nie rodzi odpowiedzialności Operatora.
- **Automatyczna wysyłka wiadomości do gości** — nieobecna; wszystkie linki gospodarz przekazuje
  ręcznie.
- **Wycofanie zgody na cookies** — banner pozwala zgodę wyrazić, ale nie ma jeszcze mechanizmu jej
  łatwego wycofania. Wiemy o tym; pozycja jest otwarta i zostanie wdrożona.

---

## 6. Nasza prośba

Prosimy o: (a) rozstrzygnięcie punktów z sekcji 4.1, (b) korektę brzmień w dokumentach 1–3,
(c) wskazanie, które braki z dokumentu nr 4 blokują start sprzedaży, oraz (d) informację, czy
potrzebują Państwo dostępu do dodatkowych materiałów technicznych — możemy przygotować dowolny
wycinek konfiguracji lub kodu.

---

*Materiał roboczy zespołu WynajemPRO. Opisy stanu aplikacji zweryfikowane w kodzie produkcyjnym
2026-07-22. Nie stanowi opinii prawnej ani deklaracji zgodności.*
