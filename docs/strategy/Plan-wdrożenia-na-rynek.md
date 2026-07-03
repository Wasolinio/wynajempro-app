# 🚀 Plan wdrożenia WynajemPRO na rynek

> **Status:** projekt do decyzji właściciela · **Data:** 2026-07-03
> **Przygotował:** koordynator wg metodyki `strategist` (agent `strategist` przerwany limitem sesji
> po fazie researchu — dokument spisany na podstawie vaulta i zweryfikowanego stanu repo).
> Plan NIE zastępuje [[Projects/Roadmap]] — odwołuje się do jej pozycji (N1–N5, X1–X11)
> i proponuje zmiany wyłącznie jako rekomendacje do decyzji właściciela.

---

## 1. Kontekst

Definicja launchu (przejęta wprost z [[Projects/Roadmap]]): **aplikacja może bezpiecznie
przyjmować płacących klientów — prawnie (regulamin, RODO), technicznie (weryfikacja,
paywall, walidacja danych) i operacyjnie (jest jak pomagać użytkownikom).**
Data launchu: decyzja właściciela po domknięciu sekcji NOW.

Stan faktyczny na 2026-07-03 (zweryfikowany w repo, nie z pamięci):

- V2 wdrożona produkcyjnie (Firebase Hosting `moje-domki-6c77d`), branch `main`.
- Model biznesowy: **trial 14 dni → subskrypcja Stripe** ([[Projects/WynajemPRO]]);
  checkout, billing portal i `PaywallScreen` istnieją w kodzie, są testy e2e paywalla
  (`e2e/stripe.spec.js`: trial_expired / canceled / past_due).
- **Ale:** egzekwowanie paywalla i weryfikacja e-mail są dziś WYŁĄCZONE (bypassy testowe)
  — aplikacja jest realnie darmowa i otwarta na fałszywe konta (N1, N2).
- Cena `29.99 zł/msc` widnieje w UI paywalla — to stan kodu, **nie zatwierdzony cennik**
  (otwarta decyzja nr 2 w roadmapie).
- Blokery launchu **N1–N5: wszystkie ⬜** (żaden nie rozpoczęty).
- W toku: dopieszczanie UI panelu (niezacommitowane zmiany w `src/`).
- Higiena: lint zielony, brak otwartych bugów krytycznych ([[Known-Issues]] — dwa dawne
  „krytyczne" to zweryfikowane fałszywe alarmy).

## 2. Diagnoza wąskiego gardła

**Dziś wąskim gardłem nie jest dystrybucja, tylko zdolność produktu do bezpiecznego
przyjęcia pieniędzy i danych klientów** (N1–N5). Każda złotówka i godzina włożona w
marketing przed domknięciem NOW kupuje ruch, którego nie wolno (prawnie) i nie ma jak
(paywall wyłączony) skonwertować na przychód.

Po domknięciu NOW wąskie gardło przesunie się na **dystrybucję i konwersję** (landing bez
działającego demo — X2, brak fundamentu SEO — X9, niezweryfikowany ICP — X11). Plan
przewiduje to przesunięcie z wyprzedzeniem: prace o długim czasie oczekiwania (prawnik,
research kanałów) startują równolegle do techniki.

## 3. Ścieżka do gotowości launchowej (sekwencja, bez estymat godzinowych)

Zasada: **jedna zmienna naraz w kodzie, długie zewnętrzne procesy równolegle.**

### Faza 0 — start natychmiast, równolegle (nie blokuje niczego)
1. **N4 do prawnika** — najdłuższy i jedyny w pełni zewnętrzny czas oczekiwania na
   ścieżce krytycznej. `legal` przygotowuje projekty (regulamin, polityka prywatności,
   DPA — gospodarze przetwarzają dane SWOICH najemców), właściciel wybiera kancelarię
   (otwarta decyzja nr 4) i wysyła do weryfikacji. **Każdy dzień zwłoki tu = dzień
   przesunięcia launchu.**
2. Dokończenie bieżącego dopieszczania UI (zamknąć WIP w `src/`, żeby N1–N3 szły na
   czystym drzewie).
3. Decyzja cennikowa (sekcja 4 niżej) — przed N2, bo paywall powinien od razu
   egzekwować właściwą cenę i pakiet.

### Faza 1 — technika (dev + code-reviewer, sekwencyjnie)
Kolejność: **N1 → N2 → N3.** Uzasadnienie: N1 (weryfikacja e-mail) domyka furtkę
fałszywych kont i jest warunkiem sensownego testowania N2; N2 (paywall) włącza przychód;
N3 (walidacja schematu) musi wejść zanim pojawią się dane prawdziwych klientów, bo
migracja wadliwych zapisów po fakcie jest wielokrotnie droższa. Weryfikacja każdego
kroku zgodnie z wpisami roadmapy (e2e na emulatorach + konto testowe Stripe); to
naturalnie realizuje część X10 (rozszerzenie e2e) — nie planować X10 osobno przed launchem.

### Faza 2 — gotowość operacyjna (równolegle z fazą 1, inni agenci)
- **X1 baza pomocy** (`support` → `dev`) — definicja launchu wymaga „jest jak pomagać
  użytkownikom", więc X1 jest de facto blokerem. **Rekomendacja zmiany roadmapy
  (decyzja właściciela): przenieść X1 z NEXT do NOW.**
- **X8 audyt językowy** (`marketing` + `designer`) — pierwsze wrażenie płacących
  klientów; tani, niezależny strumień.
- **X11 plan marketingowy launchu** (`marketing` + `strategist`) — research konkurencji
  i kanałów ZE ŹRÓDŁAMI (sekcja 6–7 niżej to hipotezy do zweryfikowania w X11).

### Faza 3 — bramka końcowa
**N5 audyt przedlaunchowy** (`code-reviewer` + `legal`) po wdrożeniu N1–N3 i dokumentów
z N4. Wszystkie 🔴 findingi rozwiązane → właściciel wyznacza datę (otwarta decyzja nr 1).

### Faza 4 — wejście na rynek (opcje w sekcji 5)
Cichy start (beta) → publiczny launch. Przed publicznym launchem mocno wskazane:
**X2 demo panelu na landingu** (pokazanie produktu bez rejestracji = konwersja) i
**X9 fundament SEO** (efekty SEO przychodzą z opóźnieniem — im wcześniej audyt, tym lepiej).

## 4. Cennik — opcje do decyzji właściciela

Fakty: w UI jest 29.99 zł/msc; trial 14 dni; oś pakietów „liczba obiektów" leży w
[[Projects/Backlog]] jako pomysł do analizy. Koszty zmienne przy małej skali: Firebase
w darmowych limitach (ADR-001 w [[Decisions]]; monitoring kosztów po launchu — backlog),
prowizja Stripe to procent transakcji + opłata stała — **dokładnych stawek nie wpisuję,
do potwierdzenia u źródła przy X11**; przy cenie rzędu 30 zł/msc prowizja to pojedyncze
złote, więc marża brutto jest wysoka, a realnym kosztem jest **czas właściciela**.

| Opcja | Opis | Za | Przeciw |
|---|---|---|---|
| **A. Jedna cena** (stan kodu: 29.99 zł/msc + trial 14 dni) | zero dodatkowej roboty przed launchem | najprostszy przekaz i paywall; jedna zmienna mniej przy testowaniu popytu | zostawia pieniądze na stole przy gospodarzach z wieloma obiektami |
| **B. Pakiety wg liczby obiektów** | np. 1–3 / 4–10 / 10+ | skaluje cenę z wartością; oś zgodna z backlogiem | trzeba przebudować paywall/Stripe przed N2; więcej decyzji przed launchem |
| **C. A + oferta founding members** | jedna cena + rabat roczny dla pierwszych klientów z bety | nagradza wczesnych, ułatwia prośbę o feedback/opinie | wymaga zdefiniowania limitu i komunikacji „do kiedy" |

**Rekomendacja:** **A na launch, C jako dźwignia do bety** (rabat roczny dla uczestników
cichego startu), **B dopiero po sygnałach od realnych klientów** (gdy wiemy, ilu ma >3
obiekty — dziś to niewiadoma). Zmiana cennika po launchu jest tania; opóźnienie launchu
o przebudowę pakietów — nie. **Decyzja: Wasyl.**

## 5. Go-to-market

### ICP — hipoteza (do potwierdzenia z właścicielem w X11)
- **ICP-A (główna):** polski gospodarz 1–10 obiektów krótkoterminowych (domki,
  apartamenty), obsługuje gości samodzielnie; dziś: Excel/kalendarz papierowy/kilka
  niepowiązanych narzędzi. Ból: chaos operacyjny (kody, przewodniki, rezerwacje,
  podatki w wielu miejscach). Obietnica produktu: „mniej ręcznej roboty gospodarza"
  ([[Projects/Backlog]] nazywa to wprost główną obietnicą).
- **ICP-B (poboczna):** drobny wynajmujący długoterminowo — przyciągają go generator
  umów najmu i rozliczenia (ryczałt/skala/VAT). Nie celować aktywnie przed
  potwierdzeniem ICP-A; obserwować, kto przychodzi sam.

### Komunikacja wartości (szkic pod X8/X11)
Jeden panel zamiast czterech narzędzi: kalendarz wielu obiektów + przewodnik gościa
z kodami po podpisie (ochrona prawna gospodarza) + umowy + podatki. Przekaz „policzalny
spokój", nie „kolejny channel manager".

### Kanały na start — opcje (test = najtańszy dowód, bez budżetu reklamowego)
1. **Społeczności wynajmujących (grupy FB/fora)** — tam siedzi ICP-A; koszt: czas.
   Test: ustalona liczba wartościowych interakcji → ile rejestracji z linku.
2. **Partnerstwa: księgowi rozliczający najem + portale branżowe** (pomysł już w
   [[Projects/Backlog]]) — dźwignia zaufania; dłuższy cykl. Test: 3–5 rozmów, czy
   temat rezonuje, zanim powstanie jakikolwiek program partnerski.
3. **SEO long-tail (X9)** — fundament pod trwały ruch; efekt odroczony, więc start
   audytu wcześnie, oczekiwania na ruch — po miesiącach, nie dniach.
4. **Płatne reklamy — świadomie NIE na starcie:** bez zmierzonej aktywacji i konwersji
   trial→płatny to palenie pieniędzy; wydatki to decyzja właściciela (playbook).

### Sekwencja wejścia — opcje
| Opcja | Opis | Za | Przeciw |
|---|---|---|---|
| **Cichy start → publiczny launch** | zaproszenie 5–15 gospodarzy (sieć właściciela + społeczności), iteracja, potem szeroko | pierwsi użytkownicy przechodzą onboarding pod okiem właściciela; feedback zanim zobaczy go rynek; materiał na opinie/case | wolniejszy „moment launchu"; wymaga dyscypliny, żeby beta nie trwała wiecznie |
| **Od razu publicznie** | ogłoszenie szeroko po domknięciu NOW | szybciej; jeden moment komunikacyjny | pierwsi klienci trafiają na nieprzetestowany onboarding; solo-founder może nie udźwignąć supportu w szczycie |

**Rekomendacja: cichy start** z jasnym kryterium wyjścia (np. „beta kończy się, gdy N
gospodarzy przeszło pełny cykl: rejestracja → obiekt → rezerwacja → przewodnik gościa —
wartość N ustala właściciel"), połączony z ofertą founding members (opcja C cennika).

## 6. Konkurencja — ⚠️ HIPOTEZY, wymagają researchu ze źródłami (X11)

Zgodnie z zasadą playbooka (zakaz konfabulacji) NIE wpisuję tu nazw, cen ani funkcji
konkurentów — vault ich nie zawiera, a research z linkami do źródeł to zadanie X11
(`marketing` + `strategist`, WebSearch). Do zweryfikowania trzy kategorie:
1. globalne channel managery / PMS-y dostępne w PL (hipoteza: cięższe i droższe niż
   potrzebuje ICP-A — to byłby nasz klin pozycjonowania),
2. polskie narzędzia dla wynajmujących (hipoteza: istnieją, różny zakres),
3. **status quo — Excel, kalendarz papierowy, brak narzędzia** (hipoteza: to główny
   realny konkurent; wygrywamy prostotą wdrożenia, nie liczbą funkcji).

## 7. Metryki launchu (AARRR na miarę; bez wymyślonych wartości docelowych)

Zgodnie z [[Projects/WynajemPRO]]: najpierw pomiar bazowy, cele dopiero z danych.
- **Acquisition:** wejścia na landing wg źródła (kanał 1 vs 2 vs organik).
- **Activation:** rejestracja → pierwszy obiekt → pierwsza rezerwacja → pierwszy
  przewodnik gościa (to pełna pętla wartości).
- **Retention:** aktywni w kolejnych tygodniach trialu; powroty po 30 dniach.
- **Revenue:** konwersja trial→płatny, MRR, churn.
- **Referral:** później; w becie zastępczo — „czy poleciłbyś" w rozmowach 1:1.

**Luka do domknięcia przed launchem:** aplikacja nie ma dziś warstwy pomiaru produktu
(analityka użycia figuruje w [[Known-Issues]] jako future improvement). Minimalny zakres
na launch: liczniki zdarzeń aktywacji + źródło rejestracji. Wybór narzędzia ma wymiar
RODO → konsultacja `legal` (nowa pozycja do [[Projects/Backlog]], decyzja właściciela).

## 8. Pre-mortem: „launch się nie udał — co zawiodło?"

| Ryzyko | Przeciwdziałanie w planie |
|---|---|
| Dokumenty prawne utknęły u prawnika → launch wisi | N4 startuje w fazie 0, przed całą techniką; wybór kancelarii = pierwsza decyzja |
| Paywall przecieka (bypassy zostały, webhook gubi status) → użytkownicy są, przychodu nie ma | N2 z testami e2e wszystkich stanów subskrypcji; bramka N5 sprawdza bypassy |
| Incydent z danymi gości (sekrety, podpisy) w pierwszych tygodniach | N3 walidacja + N5 audyt jako twarda bramka; dziennik dostępu do sekretów leży w backlogu na po launchu |
| Launch „w ciszę" — zero rejestracji | cichy start weryfikuje kanały na małych liczbach ZANIM ogłosimy szeroko; X2 demo przed publicznym launchem |
| Pierwsi użytkownicy toną, solo-founder nie nadąża z pomocą | X1 baza pomocy przeniesiona do NOW (rekomendacja); beta ograniczona liczbowo |
| Nie wiemy, czy launch działa (brak danych) | minimalna instrumentacja aktywacji przed launchem (sekcja 7) |
| Zmiana cennika tuż po launchu psuje zaufanie founding members | decyzja cenowa w fazie 0, przed N2; warunki founding members spisane przy ofercie |

## 9. Otwarte decyzje właściciela (spójne z sekcją ⏸ roadmapy)

1. **Data launchu** — po domknięciu NOW (bez zmian).
2. **Cennik** — wybór opcji A/B/C z sekcji 4 (rekomendacja: A + C).
3. **Kancelaria do N4** — pierwsza decyzja fazy 0.
4. **Przeniesienie X1 (i ew. X8) z NEXT do NOW** — rekomendacja tego planu.
5. **Zgoda na cichy start + kryterium wyjścia z bety** (liczba gospodarzy N).
6. **Potwierdzenie ICP-A** jako celu komunikacji (warunek startu X11).
7. **Instrumentacja analityki** (zakres minimalny + narzędzie, po opinii `legal`).

## 10. Następne kroki per agent (po decyzjach 2–4)

- `legal` — projekty dokumentów N4 (od zaraz).
- `dev` — zamknięcie WIP UI, potem N1 → N2 → N3 (z `code-reviewer` po każdym).
- `support` — artykuły X1 pod onboarding bety.
- `marketing` + `strategist` — X11: research konkurencji ZE ŹRÓDŁAMI, weryfikacja ICP,
  przygotowanie testu kanału 1 (społeczności) i rozmów partnerskich (kanał 2).
- `seo` — audyt X9 (może iść w tle).
- `designer` + `dev` — X2 demo na landing przed publicznym launchem.
- `code-reviewer` + `legal` — N5 jako bramka końcowa.

---

**Related:** [[Projects/Roadmap]] · [[Projects/WynajemPRO]] · [[Projects/Backlog]] ·
[[Team-Playbook]] · [[Known-Issues]] · [[Projects/Milestones]]
