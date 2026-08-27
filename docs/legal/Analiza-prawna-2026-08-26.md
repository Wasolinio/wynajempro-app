# Analiza prawna — odpowiedzi na pytania grup D i E bramki publikacji

**Data:** 2026-08-26 · **Autor:** agent (analiza własna) · **Mandat:** decyzja właściciela
z 2026-08-26 — pytania otwarte domykamy własną analizą, bez powrotu do prawnika (ADR-025).

> ⚠️ **Zastrzeżenie — przeczytaj przed akceptacją.** Autor nie jest adwokatem ani radcą
> prawnym, a ten dokument nie jest poradą prawną w rozumieniu ustawy. Jest to analiza
> na tekstach ustaw i oficjalnych dokumentach dostawców, z podaniem źródła i daty odczytu
> przy każdym ustaleniu. Poziomy pewności są oznaczone uczciwie: **[PEWNE]** — fakt
> sprawdzalny u źródła; **[MOCNE]** — utrwalona praktyka i jednoznaczny przepis;
> **[OCENA]** — interpretacja, którą prawnik mógłby postawić inaczej. Ryzyko rezydualne
> pozycji [OCENA] ponosi właściciel — świadomie, na mocy własnej decyzji.

---

## Część D — pytania „do prawnika"

### D-1. Platforma ODR i informacje o pozasądowym rozwiązywaniu sporów — **[MOCNE]**

**Stan prawny:** unijna platforma ODR została zlikwidowana rozporządzeniem (UE) 2024/3228
(uchylenie rozporządzenia 524/2013 ze skutkiem od **20 lipca 2025 r.**; skargi przestały być
przyjmowane 20 marca 2025 r.). UOKiK zaleca **całkowite usunięcie** odesłań do platformy
z regulaminów — link prowadzący donikąd może być uznany za wprowadzanie w błąd.
*(Źródła: prawo.pl — komunikaty UOKiK; tekst rozporządzenia 2024/3228; odczyt 2026-08-26.)*

**Co pozostaje obowiązkowe:** ustawa z 23.09.2016 o pozasądowym rozwiązywaniu sporów
konsumenckich. **Art. 31** nakłada obowiązek wskazania podmiotu ADR tylko na przedsiębiorcę,
który **zobowiązał się** albo jest **obowiązany** do korzystania z ADR — WynajemPRO się nie
zobowiązał, więc obowiązek wskazywania podmiotu nie zachodzi. **Art. 32**: po nieuwzględnionej
reklamacji przedsiębiorca składa konsumentowi na trwałym nośniku oświadczenie o zgodzie albo
odmowie udziału w ADR; **milczenie = zgoda**. *(Źródła: lexlege/arslege art. 31–32; odczyt
2026-08-26 — tekst nieurzędowy, treść przepisów zgodna w dwóch niezależnych serwisach.)*

**Naniesione (Regulamin §9 ust. 2):** brak odesłań do ODR; deklaracja, że Operator nie
zobowiązuje się z góry do ADR, oraz zobowiązanie do oświadczenia z art. 32 po nieuwzględnionej
reklamacji. Ogólna informacja o Inspekcji Handlowej, rzeczniku konsumentów i UOKiK (ust. 1)
zostaje bez zmian.

**Uwaga operacyjna dla właściciela:** milczenie po odrzuconej reklamacji oznacza z mocy ustawy
zgodę na ADR — odpowiedź na reklamację musi **zawsze** zawierać oświadczenie w tej sprawie.
Celowo NIE dopisano tego do `docs/support/Proces-obslugi-zgloszen.md` — proces obsługi zgłoszeń
to nie proces reklamacyjny; szablon odpowiedzi na reklamację z gotowym oświadczeniem odnotowany
w Roadmapie jako ogon F5.

### D-2. Znak towarowy „WynajemPRO" — **[PEWNE co do brzmienia, fakt do 1 kliknięcia]**

Wyszukiwanie nie ujawniło rejestracji znaku „WynajemPRO" (UPRP/EUIPO nie indeksują się
w wyszukiwarkach — pewność da tylko e-wyszukiwarka UPRP i TMview). Rejestracji **nie ma śladu**
w dokumentach projektu, a właściciel jej nie zlecał.

**Rozwiązanie odporne na oba stany:** brzmienie §13 nie twierdzi, że znak jest zarejestrowany —
powołuje ochronę z mocy prawa autorskiego i ustawy o zwalczaniu nieuczciwej konkurencji
(art. 3, 5, 10 u.z.n.k.), która przysługuje **bez rejestracji**. Gdy znak zostanie kiedyś
zarejestrowany, zdanie pozostanie prawdziwe. **Rejestracja znaku (890 zł, ~6 mies., UPRP) —
do rozważenia po launchu; do Backlogu.**

### D-3. Klauzula sądu właściwego (§14 ust. 2) — **[MOCNE]**

Pierwotne brzmienie obejmowało wszystkich „niebędących Konsumentami" — czyli także
**przedsiębiorców na prawach konsumenta** (art. 385⁵ KC), wobec których narzucenie sądu
Operatora może być klauzulą abuzywną (klauzule prorogacyjne to klasyka rejestru klauzul
niedozwolonych). **Naniesione:** klauzula zawężona do przedsiębiorców „pełnych"; konsumenci
i przedsiębiorcy na prawach konsumenta — właściwość ogólna.

### D-4. Czy Stripe jest subprocesorem danych powierzonych (danych Gości)? — **NIE. [MOCNE]**

Analiza przepływów w kodzie (`functions/index.js` — `createCheckoutSession`,
`stripeWebhook`): do Stripe trafiają wyłącznie identyfikatory i dane rozliczeniowe
**Gospodarza** (uid, e-mail, status subskrypcji). Dane Gości (rezerwacje, podpisy, dane
z przewodników) **nie są przekazywane Stripe w żadnym przepływie**. Stripe przetwarza dane,
których administratorem jest Operator — to relacja opisana w Polityce §5, nie podpowierzenie
z DPA. **Naniesione:** Stripe usunięty z listy subprocesorów w DPA §7 (z notą wyjaśniającą),
pozostaje w Polityce §5.

### D-5. Czy Anthropic jest subprocesorem danych powierzonych? — **TAK, warunkowo. [OCENA]**

Poziom 3 diagnostyki zgłoszeń obejmuje odczyt danych Gości (rezerwacje, zapisy akceptacji) —
skoro kanał **może** czytać dane powierzone, Anthropic jest subprocesorem danych powierzonych
w rozumieniu art. 28 ust. 2, niezależnie od tego, jak rzadko poziom 3 jest używany. Wąski,
stopniowany zakres obniża ryzyko, ale nie zmienia kwalifikacji. **Zostaje na liście w DPA §7.**

**Podmiot kontraktujący [PEWNE]:** wg Commercial Terms of Service Anthropic stroną umowy dla
klientów z EOG jest **Anthropic Ireland, Limited**; DPA (z SCC) jest włączone do tych warunków
przez odesłanie. *(Źródło: anthropic.com/legal/commercial-terms, odczyt 2026-08-26.)*

🔴 **WARUNEK KRYTYCZNY — jedyna rzecz, którą musi sprawdzić właściciel:** Commercial Terms
**wyłączają** produkty konsumenckie („Services under these Terms are not for consumer use —
Claude.ai is governed by our Consumer Terms"). Plany konsumenckie (Free/Pro/Max) **nie mają
DPA**. Jeżeli kanał supportu działa na koncie konsumenckim, wpis „umowa powierzenia
z Anthropic" jest **nieprawdziwy** i przed publikacją dokumentów trzeba: **(a)** przejść na
ofertę objętą Commercial Terms (Team/Enterprise/API), albo **(b)** wykreślić Anthropic
z dokumentów i ograniczyć kanał supportu tak, by dane osobowe nie trafiały do modelu.
Sprawdzenie: `claude` → komenda `/status` (pokazuje typ planu) albo ustawienia konta na
claude.ai. **Do tego czasu wpisy o Anthropic są oznaczone jako warunkowe.**

> **Aktualizacja z tego samego dnia (decyzje właściciela, wieczór):** Anthropic został
> **wykreślony z DPA §7** — z dniem publikacji dokumentów kanał wsparcia przestaje czytać
> dane Gości (bramka F4a w Roadmapie), a do końca bety działa po staremu, z ryzykiem
> okresu przejściowego zaakceptowanym świadomie ([[Activity-Log]] 2026-08-26). Warunek
> planu z tego punktu dotyczy odtąd wyłącznie wpisu w Polityce §5 (zgłoszenia i dane
> konta Gospodarza). Konkluzja „zostaje na liście DPA" jest nieaktualna decyzją
> właściciela — kwalifikacja prawna z analizy pozostaje poprawna dla stanu sprzed decyzji.

### D-6. Ograniczenia odpowiedzialności w DPA §11 — **[MOCNE co do konstrukcji]**

Naniesiona konstrukcja: (1) wobec osób, których dane dotyczą, odpowiedzialności z art. 82 RODO
się nie ogranicza (bezwzględnie obowiązujące); (2) między Stronami — limit do sumy opłat
z 12 miesięcy poprzedzających zdarzenie; (3) limit nie obejmuje winy umyślnej (art. 473 § 2 KC
— odpowiedzialności za szkodę wyrządzoną umyślnie nie można wyłączyć); (4) lustro Regulaminu
§12 ust. 2: wobec Gospodarzy będących konsumentami lub przedsiębiorcami na prawach konsumenta
ograniczenia działają tylko w granicach przepisów bezwzględnie obowiązujących. Punkt (4) jest
istotny, bo Gospodarzem bywa osoba fizyczna na najmie prywatnym.

### D-7. Podstawa prawna dziennika `admin_audit`: lit. f czy lit. c — **lit. f. [MOCNE]**

Art. 6 ust. 1 lit. c wymaga **konkretnego obowiązku prawnego nakazującego dane przetwarzanie**;
art. 5 ust. 2 i art. 24 RODO to obowiązki ogólne (rozliczalność, środki organizacyjne), które
nie nakazują prowadzenia dziennika o tym kształcie — lit. c byłaby podstawą chwiejną.
Właściwa podstawa: **art. 6 ust. 1 lit. f** z udokumentowanym testem równowagi:

| Test równowagi (LIA) | Ocena |
|---|---|
| Interes Operatora | wykazanie legalności dostępu administracyjnego (art. 5 ust. 2, art. 24, art. 32); wykrywanie nadużyć uprawnienia — interes realny i konkretny |
| Niezbędność | brak łagodniejszego środka: bez dziennika nie da się wykazać, **że dostępu nie było**; zakres zminimalizowany u źródła (sam UID, bez e-maila i bez treści danych) |
| Balans wobec osób | wpis dotyczy czynności Operatora, nie aktywności użytkownika; rozsądne oczekiwania: użytkownik SaaS oczekuje raczej, że dostęp administracyjny JEST rejestrowany; ryzyko dla praw i wolności — niskie (identyfikator + typ czynności + data) |
| Wynik | interes przeważa; podstawa lit. f obroniona |

### D-8. Wpis w dzienniku po żądaniu usunięcia konta — art. 17 ust. 3 lit. e — **[OCENA]**

Zachowanie wpisu broni się na art. 17 ust. 3 lit. e (ustalenie, dochodzenie lub obrona
roszczeń): dziennik jest jedynym dowodem, że dostęp administracyjny do danych konta był
ograniczony do niezbędnego zakresu — usunięcie wpisów na żądanie unicestwiałoby jego funkcję
dowodową dokładnie wtedy, gdy jest potrzebna. Kluczowe okoliczności łagodzące: wpis **nigdy
nie zawiera e-maila ani treści danych** (minimalizacja u źródła, wymuszona w kodzie), po
usunięciu konta UID nie wskazuje na istniejące konto, retencja jest ograniczona (12 mies.)
i egzekwowana automatycznie. Ryzyko rezydualne: organ mógłby oczekiwać art. 17 ust. 3 lit. b —
ale wobec braku przepisu nakazującego prowadzenie dziennika lit. e jest uczciwsza. Wybór
udokumentowany tu i w Polityce §6.

### D-9. Mechanizmy legalizujące transfery poza EOG — **[PEWNE, u źródła]**

| Dostawca | Mechanizm | Źródło (odczyt 2026-08-26) |
|---|---|---|
| Google (Firebase/Cloud) | SCC w Cloud Data Processing Addendum **oraz** certyfikacja Google LLC w EU-US Data Privacy Framework (od 09.2023) | cloud.google.com/terms/data-processing-addendum; support.google.com/cloud/answer/6329727 |
| Stripe | Certyfikacja Stripe, Inc. w EU-US DPF (DPF ma pierwszeństwo); zapasowo SCC (Data Transfers Addendum) | stripe.com/legal/dpa; stripe.com/legal/dta |
| Anthropic | **SCC** włączone do DPA w Commercial Terms; Anthropic **nie figuruje** w DPF (stan wg źródła wtórnego 2026-08-26 — bez znaczenia praktycznego, bo podstawą i tak są SCC) | anthropic.com/legal/commercial-terms; compound.law (wtórne) |

---

## Część E — ustalenia u źródła

| # | Ustalenie | Wynik | Metoda |
|---|---|---|---|
| E-1 | Region Firestore/Storage | **eur3** (multiregion UE: Belgia/Holandia) — dane aplikacji w spoczynku w EOG. Uwaga: **Cloud Functions działają w us-central1** (USA), Auth i Analytics przetwarzają dane w USA — stąd mechanizmy z D-9 są konieczne mimo regionu UE | `firebase firestore:databases:get "(default)"` — odczyt 2026-08-26 [PEWNE] |
| E-2 | Mechanizm transferu Stripe | DPF (Stripe, Inc.) + SCC zapasowo | patrz D-9 [PEWNE] |
| E-3 | Podmiot kontraktujący Anthropic + mechanizm | Anthropic Ireland, Limited (EOG, Commercial Terms); SCC. 🔴 Warunek planu — patrz D-5 | patrz D-5 [PEWNE co do treści warunków] |
| E-4 | Lista subprocesorów | prowadzona w Polityce §5; zmiany komunikowane wg §11 (e-mail + komunikat, 14 dni) — bez zewnętrznego linku, jedna lista mniej do rozjechania | decyzja redakcyjna [PEWNE] |
| E-5 | Retencja logów technicznych | do **30 dni** (domyślna retencja Cloud Logging, kubeł `_Default`); dzienniki audytu administracyjnego dostawcy — do **400 dni** (`_Required`, niekonfigurowalne) | docs.cloud.google.com/logging — odczyt 2026-08-26 [PEWNE] |
| E-6 | Retencja Google Analytics | zapisano „**nie dłużej niż 14 miesięcy**" — prawdziwe przy obu możliwych ustawieniach bezpłatnego GA4 (2 albo 14 mies.); dane zagregowane w raportach Google przechowuje wg własnych zasad | support.google.com/analytics/answer/7667196 — odczyt 2026-08-26 [PEWNE] |

---

## Co pozostaje otwarte po tej analizie

1. 🔴 **Plan Anthropic** (D-5) — jedyny warunek blokujący; sprawdza właściciel (`/status`).
2. **Grupa C (księgowy):** VAT w cenie, faktury, potwierdzenie okresu 5 lat (wpisany
   z Ordynacji podatkowej, oznaczony do potwierdzenia).
3. **Data zakończenia naboru founding members** — decyzja właściciela (dwa warianty brzmienia
   przekazane w czacie).
4. Rejestr czynności przetwarzania (zalecenie z oceny 2026-08-19) — nie blokuje publikacji,
   w Backlogu.

**Related:** [[legal/Bramka-publikacji-2026-08-26]] · [[legal/Regulamin]] ·
[[legal/Polityka-prywatnosci]] · [[legal/DPA-powierzenie]] · [[Decisions]] (ADR-025)
