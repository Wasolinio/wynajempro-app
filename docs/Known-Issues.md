# 🐛 Known Issues

## Critical Issues

### 18. CI na `main` czerwone od dnia założenia — brak konfiguracji Firebase w CI (2026-08-25)

**Objaw:** każdy zakończony przebieg `ci.yml` po pushu na `main` kończy się `failure`.
Sprawdzone przez API GitHuba 2026-08-25: przebiegi **#16 (13.08), #24 (21.08), #27 (22.08),
#31 i #33 (25.08)** — wszystkie czerwone, wszystkie na tym samym kroku. `ESLint` i
`Build produkcyjny` przechodzą za każdym razem; pada wyłącznie **`Testy e2e`**.
**CI nie było zielone ani razu od momentu powstania 13.08.**

**Czego to NIE jest — sprawdzone, nie założone:**
- ❌ nie jest zepsutym produktem: ta sama suita na tym samym commicie (`475a435`) przechodzi
  lokalnie **204/204 w 1,2 min**;
- ❌ nie są to flagi CI: powtórka z `CI=true` (czyli `workers: 1`, `retries: 2`) też daje
  **204/204, w 4,2 min**;
- ❌ nie jest to rozjazd zależności: `node_modules` zgadza się z `package-lock.json`
  (sprawdzone imiennie: firebase 12.12.0, react 19.2.5, lucide-react 1.14.0, vite 8.0.8,
  @playwright/test 1.61.0, react-router-dom 7.18.2);
- ❌ nie jest to awaria produkcji: przepływ „Smoke produkcji" jest **zielony** (#263–265,
  25.08 co godzinę).

**Log z CI (przekazany przez właściciela 2026-08-25) — co naprawdę pada:** **27 czerwonych,
177 zielonych, 13,7 min**. Wszystkie czerwone to **strony publiczne**: `cookie-consent` (6),
`help-center` (7), `landing-demo` (4), `smoke` (1), `spelling` (4), `ui-scaling` (5).
Zero czerwonych w panelu (`tax-panel`, `tax-settings`, `panel-v2`, `auth`, `update-prompt`).

**Objaw jest ostrzejszy niż „testy się sypią":**
```
Locator: locator('text=Wynajem').first()
Expected: visible
Error: element(s) not found
```
oraz `locator('div.wpc-bar')` — również „not found". 🔥 **To nie jest rozjazd układu, tylko
brak elementów w DOM — na CI strona publiczna po prostu się nie wyrenderowała.** Mocne
potwierdzenie: w `smoke.spec.js` test **`has title` PRZESZEDŁ**, a `has logo text` padł.
Tytuł siedzi statycznie w `index.html`, cała reszta to React — czyli **serwer oddał HTML,
ale aplikacja się nie zamontowała**.

**Hipotezy sprawdzone i ODRZUCONE 2026-08-25:**
- ❌ **czcionki Linuksa / rozjazd układu** — „element not found" to brak w DOM, nie inna szerokość;
- ❌ **brak mocków Firebase** — `cookie-consent`, `help-center` i `ui-scaling` **wołają**
  `setupFirebaseMocks`, a mimo to padają; `landing-demo`, `smoke` i `spelling` nie wołają
  i też padają. Mocki nie są linią podziału;
- ❌ **`VITE_USE_EMULATORS: 'true'` w `webServer` bez działających emulatorów** — kusząca,
  bo `src/firebase.js:52-54` woła `connectAuthEmulator` bez `try`, ale lokalnie ten sam
  układ (świeży serwer, brak emulatorów, `reuseExistingServer` wyłączone przez `CI=true`)
  daje **204/204**;
- ❌ **plik jako całość** — w `ui-scaling.spec.js` część testów pada (74, 96, 169, 179, 247),
  a część z tego samego pliku przechodzi (84, 106, 145, 190, 205, 221, 264, 295).

**Artefakt `playwright-report` pobrany i rozebrany 2026-08-25 — przyczyna ustalona.**

**27 czerwonych rozpada się na DWIE różne usterki, nie jedną:**

**(A) 21 testów — pusta strona.** `help-center` (7), `landing-demo` (4), `spelling` (4),
`ui-scaling` (5), `smoke` (1). Objawy z pliku `error-context.md`: brak sekcji „Page snapshot",
`element(s) not found`, przekroczenia czasu, `Cannot read properties of null (reading
'getBoundingClientRect')`.

**Dowód rozstrzygający — ze śladu `trace.zip`, snapshot DOM w chwili porażki:**
```
["BODY", {...}, ["DIV", {"id": "root"}]]
```
🔥 **`#root` jest PUSTY — bez jednego dziecka.** Do tego ze śladu: zero `pageerror`, zero
nieudanych żądań sieciowych, konsola ma tylko `[vite] connected` i komunikat React DevTools,
a cztery kolejne snapshoty DOM są identyczne (żadnej zmiany przez cały czas testu).

**Co z tego wynika — i dlaczego to NIE jest zawieszony `Suspense`:** `App.jsx:133` ma
`<Suspense fallback={<Loader />}>`, a `Loader` (`App.jsx:48`) renderuje **widoczny** spinner
z tłem `#F3EFE5`. Gdyby wisiał leniwy import trasy, w `#root` siedziałby ten spinner.
Skoro `#root` jest pusty, **`createRoot().render()` z `main.jsx` w ogóle nie zdążyło się
wykonać** — moduł czekał na swoje statyczne importy (`App.jsx` ciągnie firebase, konteksty
i style). Komunikat React DevTools tego nie podważa: drukuje go `react-dom` przy załadowaniu
modułu, nie przy renderze.

**Przyczyna:** w CI serwerem testowym jest **`vite dev`** (`playwright.config.js:21`), który
transformuje moduły na żądanie i przy odkryciu nowych zależności potrafi przeładować stronę.
Lokalnie graf jest ciepły (`node_modules/.vite`), więc trwa milisekundy; na runnerze jest
zimny przy każdym przebiegu i przekracza 5-sekundowe okno asercji. Stąd rozrzut po plikach
zamiast równego padania — decyduje to, która paczka akurat była zimna. 📌 Aplikacja ma zresztą
w `main.jsx` obsługę `vite:preloadError` z przeładowaniem strony, czyli ta klasa problemu była
już kiedyś widziana.

**(B) 6 testów `cookie-consent` — zupełnie inna sprawa.** Tu strona **wyrenderowała się
poprawnie** (snapshot pokazuje pełny nagłówek landingu: `img`, „Wynajem", „PRO", nawigację).
Padają na `expect(received).toBe(expected) — Expected: true, Received: false`, czyli na
asercji logicznej. **To trzeba diagnozować osobno** i nie wolno tego wrzucić do jednego worka
z (A) — inaczej naprawa serwera testowego „wyleczy" 21 testów i zostawi 6 czerwonych o
nieznanej przyczynie.

**Propozycja naprawy (A) — do decyzji właściciela:**
1. **Zalecane: w CI testować produkcyjny build** — `webServer.command` warunkowo:
   `vite preview` na zbudowanym `dist` zamiast `vite dev`. Znika transformacja na żądanie,
   a przy okazji **testujemy to, co realnie dostaje klient**, a nie wersję deweloperską.
   ⚠️ **Koszt, który trzeba znać z góry:** w buildzie produkcyjnym **rejestruje się service
   worker**, a `update-prompt.spec.js` jest napisany wprost na założeniu, że w trybie
   deweloperskim SW nie istnieje — te testy trzeba będzie przejrzeć.
2. **Lżejsze obejście:** zostać przy `vite dev`, ale rozgrzać optymalizator (`optimizeDeps.entries`
   obejmujące trasy publiczne) i podnieść czas asercji. Tańsze, ale leczy objaw.

🔴 **Dlaczego to jest pilne mimo że produkt działa:** bramka, która miała pilnować jakości,
jest czerwona niezależnie od zawartości commita, więc **prawdziwa regresja przeszłaby
niezauważona**. To ta sama pułapka, przed którą ostrzega komentarz w `ci.yml` („suita miała
50 czerwonych ze 133 i nikt tego nie widział"), tylko piętro wyżej: testy się puszczają,
ale wynik jest zawsze czerwony, więc przestaje cokolwiek znaczyć.

📌 **Jak zdobyto dowody, na przyszłość:** endpoint logów CI wymaga autoryzacji (`403` bez
tokena), a `gh` nie jest zainstalowany na maszynie właściciela (brak Homebrew). Zadziałała
droga bez instalowania czegokolwiek: **właściciel pobrał artefakt `playwright-report`
z dołu strony przebiegu** (sekcja „Artifacts"), a agent rozpakował go lokalnie i przeczytał
`error-context.md` oraz `trace.zip`. Ta sama droga zadziała przy kolejnym czerwonym CI.

📌 **Przy okazji, do naprawy niezależnie:** CI zgłasza, że `actions/checkout@v4`,
`actions/setup-node@v4` i `actions/upload-artifact@v4` celują w wycofywany Node 20 i są
wymuszane na Node 24. Naprawiają to otwarte PR-y dependabota **#1, #2, #3**.

---

## Naprawa wdrożona 2026-08-25 — czeka na dowód z CI

**🛑 Wariant zalecany (produkcyjny build w CI) ODPADŁ — sprawdzony i cofnięty.**
Przełączenie `webServer` na `npm run build && vite preview` wywróciło `admin-panel`
natychmiast: testy lądowały na ekranie logowania zamiast w panelu. Przyczyna jest
fundamentalna — **cała atrapa `e2e/firebase-mock.js` przechwytuje osiem adresów
`**/node_modules/.vite/deps/firebase_*.js`, które istnieją WYŁĄCZNIE pod serwerem
deweloperskim**. W buildzie moduły siedzą w paczkach z haszem, żadna trasa nie łapie, rusza
prawdziwy SDK. Dotknęłoby to `auth`, `panel-v2`, `admin-panel`, `tax-*`, `guest-guide`,
`review-pages` i `cookie-consent`. ⚠️ **Ostrzeżenie wpisane wprost w `playwright.config.js`**,
żeby nikt nie stracił godziny na ten sam pomysł. Przejście na build wymaga najpierw
przepisania atrapy tak, by nie zależała od adresów Vite — osobne zadanie, nie poprawka.

**Co weszło zamiast tego:**
- **(A)** `vite.config.js` → `server.warmup.clientFiles` (`main.jsx`, `App.jsx`,
  `src/pages/**/*.jsx`): Vite mieli graf tras od razu po starcie, zamiast czekać na pierwszego
  klienta. Do tego `playwright.config.js` → `expect.timeout` **15 s w CI** (5 s lokalnie);
  domyślne 5 s było strojone pod ciepłą maszynę.
- **(B)** `playwright.config.js` → `webServer.env.VITE_FIREBASE_MEASUREMENT_ID = 'G-TESTTEST00'`.

**Prawdziwa przyczyna (B), ustalona 2026-08-25:** `src/firebase.js:99` i `:112` ustawiają flagę
opt-out `window['ga-disable-<id>']` **tylko `if (measurementId)`**, a identyfikator pochodzi
z `.env.local` — pliku w `.gitignore`, istniejącego **wyłącznie na maszynie właściciela**.
`ci.yml` nie ustawia ani jednej zmiennej środowiskowej. Stąd asymetria: lokalnie flaga się
ustawia i testy przechodzą, w CI nie ustawia się nigdy. 🔥 **To ta sama przyczyna źródłowa
co (A): środowisko testowe lokalnie nie było tym samym, co w CI.**

**Weryfikacja 2026-08-25:**
- ✅ **e2e 204/204** (`CI=true`, 4,3 min) — w tym komplet `cookie-consent`.
- ✅ **Pierwszeństwo zmiennych potwierdzone empirycznie**, bo od niego zależy wartość
  powyższego przebiegu: serwer podniesiony z atrapą serwuje `src/firebase.js` zawierający
  `G-TESTTEST00`, a prawdziwego identyfikatora z `.env.local` **nie zawiera** (0 wystąpień).
  Czyli przebieg testował warunek z CI, a nie lokalny.
- ✅ `npm run lint` 0 błędów, `npm run build` OK.

⏳ **Czego ten dowód NIE obejmuje — grupy (A).** Pusty `#root` **nigdy nie odtworzył się na
maszynie właściciela** (204/204 przed poprawką, dwa razy, w tym `CI=true`), więc lokalny
zielony przebieg nie jest dowodem, że rozgrzewka pomogła. Naprawa jest wycelowana w przyczynę
odczytaną ze śladu, ale **dowodem będzie dopiero zielony przebieg na GitHubie**. Do tego czasu
(A) pozostaje hipotezą popartą śladem, nie faktem.


**⚠️ Pierwsza próba naprawy NIE zadziałała — przebieg #35 (`d15c21c`, 2026-08-25) ANULOWANY.**
e2e szło **19 min 22 s** i dobiło do `timeout-minutes: 20`. Dwie rzeczy poszły źle naraz:
1. **Podniesienie okna asercji do 15 s potroiło koszt każdej porażki** (przy `retries: 2`
   każdy czerwony test to trzy podejścia). Czerwony przebieg urósł z 13,7 min do ponad 19.
   Skutków dla workflow nie skompensowano — to błąd w ocenie, nie niespodzianka.
2. **Krok „Raport z nieudanego przebiegu" miał `if: failure()`, a `failure()` NIE obejmuje
   anulowania.** Przebieg ubity limitem czasu to dokładnie ten przypadek, w którym raport
   jest najbardziej potrzebny — a został pominięty. Zostaliśmy bez danych do diagnozy.

🔥 **Obserwacja, która PODWAŻA hipotezę o zimnej transformacji:** przy `retries: 2` każdy test
szedł **trzy razy**, po 5 s każde podejście — i za trzecim razem strona **dalej była pusta**.
Gdyby chodziło wyłącznie o to, że Vite transformuje moduł na żądanie, druga próba trafiłaby
już w ciepły moduł i przeszła. Nie przeszła. Przyczyna (A) jest więc **nadal nieustalona**,
a `server.warmup` i dłuższe okno mogły co najwyżej pomóc częściowo. ⚖️ Nie wykluczam też,
że **rozgrzewka pogorszyła sprawę**: mieli graf ~50 modułów na dwurdzeniowym runnerze,
konkurując o procesor z Chromium.

**Poprawki w `ci.yml` (2026-08-25), żeby następny przebieg w ogóle coś powiedział:**
`timeout-minutes` 20 → **30**; raport `if: failure()` → **`if: failure() || cancelled()`**.
**Następny krok:** przeczytać artefakt z pierwszego przebiegu, który dobiegnie końca.


---

## 🔥 PRZYCZYNA USTALONA 2026-08-25 — brak konfiguracji Firebase w CI

> ⚠️ **ERRATA do całej diagnozy powyżej.** Hipoteza „zimna transformacja `vite dev`" była
> **BŁĘDNA**. Poniższe akapity zostają w pierwotnym brzmieniu (konwencja pliku), ale czytaj
> je z tą poprawką. **Co przeżywa:** podział na dwie grupy usterek, opis objawu (pusty `#root`),
> ustalenie, że `(B)` to brak `measurementId`, oraz wniosek nadrzędny — środowisko testowe
> lokalnie nie było tym samym co w CI. **Co upada:** wyjaśnienie grupy `(A)` przez powolność
> serwera deweloperskiego i obie oparte na nim poprawki (`server.warmup`, okno asercji 15 s).

**Dowód — wyjątek ze śladu przebiegu #36** (`gh run download`, pierwszy raz mieliśmy artefakt):
```
Firebase: Error (auth/invalid-api-key)
```
`getAuth(app)` rzuca ten wyjątek **przy wykonywaniu modułu `src/firebase.js`**, bo
`VITE_FIREBASE_API_KEY` jest w CI `undefined`. Wyjątek wywraca cały graf importów `main.jsx`,
`createRoot().render()` nigdy się nie wykonuje i test widzi **pusty `#root`**. Zgadza się to
z każdą wcześniejszą obserwacją: brak wpisu `pageerror` w krótkim śladzie, obecny komunikat
React DevTools (drukuje go `react-dom` przy załadowaniu modułu, nie przy renderze) i brak
jakiegokolwiek żądania sieciowego do Firebase.

**Korelacja co do sztuki — to ona przesądziła:**

| plik | testów bez `setupFirebaseMocks` | porażek w #36 |
|---|---|---|
| `help-center` | 7 | 7 |
| `ui-scaling` | 6 | 6 |
| `landing-demo` | 4 | 4 |
| `spelling` | 4 | 4 |
| `smoke` | 2 | 1 |
| `cookie-consent` | 0 | 0 |

**Każdy czerwony test to test, który NIE woła atrapy Firebase'a.** Atrapa podmienia moduły
`firebase_*`, więc testom mockowanym klucz nie był do niczego potrzebny. Jedyny wyjątek —
`smoke › has title` — przechodzi, bo sprawdza tytuł, a ten siedzi w statycznym `index.html`
i nie wymaga Reacta. **To ta sama przyczyna co grupa (B)**, tylko o skutku brutalniejszym:
tam brakowało `measurementId` i psuło jedną asercję, tu brakuje `apiKey` i nie startuje
aplikacja.

**Dlaczego nie odtwarzało się lokalnie:** `.env.local` na maszynie właściciela dostarcza
prawdziwy klucz. Dlatego dwa pełne przebiegi lokalne (w tym `CI=true`) dawały 204/204 —
sprawdzały warunek, którego na runnerze nigdy nie było.

**Odtworzone lokalnie 2026-08-25, żeby diagnoza nie została wnioskiem:** serwer podniesiony
z `VITE_FIREBASE_API_KEY=` (pusty) → `smoke › has logo text` **PADA**, `smoke › has title`
**PRZECHODZI**. Dokładnie sygnatura z CI.

**Naprawa:** komplet atrap `VITE_FIREBASE_*` w `webServer.env` w `playwright.config.js`.
Wartości są jawnie fałszywe i takie mają zostać — `VITE_USE_EMULATORS` kieruje SDK na
localhost, a testy stron publicznych nie wykonują żadnego zapytania do Firebase; potrzebują
wyłącznie tego, żeby inicjalizacja nie rzuciła wyjątkiem.

**Wycofane jako oparte na obalonej hipotezie:** `server.warmup` w `vite.config.js` oraz
`expect.timeout` 15 s. To drugie realnie zaszkodziło — potroiło koszt czerwonego przebiegu
i doprowadziło do anulowania #35 limitem czasu. **Zostają** poprawki `ci.yml`
(`timeout-minutes: 30`, raport przy `cancelled()`), bo są słuszne niezależnie od przyczyny:
to dzięki nim przebieg #36 w ogóle zostawił artefakt.

📌 **Wniosek metodyczny, wart więcej niż sama naprawa:** trzy razy z rzędu uznałem hipotezę
za obaloną, bo „lokalnie przechodzi" — a lokalnie było inne środowisko. Dopóki nie
odtworzysz warunku z CI u siebie, „u mnie działa" nie jest dowodem na nic.

### 17. `syncICalCalendars` odrzucana na bramce Cloud Run — przycisk „Synchronizacja" nie działa (2026-08-24, OTWARTE)

**Objaw:** kliknięcie „Synchronizacja" w panelu kończy się komunikatem „Wystąpił błąd podczas
synchronizacji kalendarzy". W logach funkcji:

```
W syncicalcalendars: The request was not authenticated.
   Empty Authorization header value.
```

**Diagnoza:** żądanie **nie dociera do kodu funkcji**. Odpowiedź serwuje `Google Frontend`
(HTML 403, „Your client does not have permission to get URL / from this server"), a nie
protokół callable. Usługa Cloud Run `syncicalcalendars` **straciła uprawnienie
`roles/run.invoker` dla `allUsers`**, którego protokół callable wymaga.

**Porównanie, które to rozstrzyga** — wszystkie pozostałe funkcje callable są zdrowe:

| Funkcja | Odpowiedź | Znaczenie |
|---|---|---|
| `syncICalCalendars` | **403**, HTML od Google Frontend | odrzucenie na bramce |
| `createCheckoutSession` | 401, JSON `UNAUTHENTICATED` | dociera do funkcji |
| `createBillingPortalSession` | 401, JSON | dociera |
| `deleteUserAccount` | 401, JSON | dociera |
| `deleteGuide` | 401, JSON | dociera |
| `adminApi` | 401, JSON | dociera |

⚠️ **To NIE jest skutek wdrożenia X26.** Pierwsze odrzucenie w logach: **2026-08-24 08:29 UTC**,
czyli **godzinę przed** wydaniem X26 (09:28). W oknie retencji logów nie ma ani jednego
udanego wywołania tej funkcji przez użytkownika. Ponowne wdrożenie samej funkcji
(`firebase deploy --only functions:syncICalCalendars`) **nie przywraca** uprawnienia.

**Skutek:** ręczna synchronizacja nie działa. Automatyczna (`dailyICalSync`) **działa**, bo
wywołuje ją Cloud Scheduler kontem serwisowym, a nie ruchem publicznym.

**Naprawa** — jedna z dwóch, wymaga uprawnień właściciela do projektu Google Cloud:

```
gcloud run services add-iam-policy-binding syncicalcalendars \
  --region=us-central1 --member=allUsers --role=roles/run.invoker \
  --project=moje-domki-6c77d
```

albo w konsoli: **Cloud Run → syncicalcalendars → Security → Authentication →
„Allow unauthenticated invocations"**.

🛡️ **Dlaczego to jest bezpieczne, mimo nazwy `allUsers`.** To uprawnienie oznacza wyłącznie
„żądanie dociera do funkcji", dokładnie tak jak w pięciu pozostałych funkcjach callable.
Cała kontrola dostępu zostaje w kodzie i jest nietknięta: `enforceAppCheck: true`,
wymóg zalogowania, weryfikacji e-maila i aktywnej subskrypcji lub trwającego okresu próbnego
(audyt N5 🟡3). Bez tego uprawnienia protokół callable nie może działać w ogóle.

✅ **NAPRAWIONE 2026-08-24** przez właściciela w konsoli (Cloud Run → syncicalcalendars →
Zabezpieczenia → „Zezwól na dostęp publiczny"). Ekran potwierdził diagnozę: zaznaczone było
„Wymagaj uwierzytelnienia". Po zmianie funkcja zwraca **401 z JSON-em protokołu callable**,
czyli tak samo jak pozostałe pięć.

📌 **Rozstrzygnięte pytanie o nawrót:** uprawnienie **PRZEŻYWA ponowne wdrożenie** — sprawdzone
tego samego dnia po `firebase deploy --only functions:syncICalCalendars,functions:dailyICalSync`
(nadal 401). Polityka organizacji nie jest więc podejrzana; przyczyną było najpewniej
jednorazowe zdjęcie uprawnienia. Warto po każdym wydaniu functions przebiec test porównawczy z tabeli wyżej — kod 403
z HTML-em zamiast 401 z JSON-em oznacza ten sam problem.


> **None outstanding.** The two "critical bugs" previously listed here were investigated on 2026-06-29 and found to be **false** — both behaviours are already implemented in the code. Kept below as RESOLVED/NOT-A-BUG so nobody re-opens them.

### 1. iCal Token Not Generated — ❌ NOT A BUG (verified 2026-06-29)
**Status**: ✅ RESOLVED (was never broken)  
**Claim**: `secretToken` not initialized on property create → iCal export 403.

**Reality**: `secretToken` **is** generated with `window.crypto.randomUUID()` in `src/ManagerApp.jsx` — on create (`ManagerApp.jsx:463-475`) and as a retrofit for legacy properties lacking one (`ManagerApp.jsx:403-412`). Properties live in `users/{uid}/settings/properties.items`, not a top-level `properties` collection. `functions/index.js` `exportIcal` validates the token (`:985`). Export works.

---

### 2. Storage Leak on Account Deletion — ❌ NOT A BUG (verified 2026-06-29)
**Status**: ✅ RESOLVED (was never broken)  
**Claim**: `deleteUserAccount` leaves guide files in Storage.

**Reality**: `functions/index.js` `exports.deleteUserAccount` (`:902`) deletes, per owned guide, the Storage files via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` (`:933-937`), then the guide doc (`:944`), then the Auth user. No leak. (`exports.deleteExpiredAccountsData` handles scheduled cleanup of expired accounts.)

---

### 3. App Check Issue
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 9f85a23)  
**Issue**: App Check was disabled for debugging, now re-enabled.

**Status**: Monitoring for issues.

---

## Minor Issues

### 4. Firebase Auth iFrame Blocking
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 2bad1ff)  
**Issue**: X-Frame-Options header was blocking Firebase Auth iFrame.

**Fix Applied**: Removed restrictive header, now allows SAMEORIGIN.

---

### 5. Google Login Loop
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 99cc65b)  
**Issue**: Google login redirect loop on email verification.

**Fix Applied**: Improved redirect logic post-verification.

---

## Otwarte (2026-07-10 — sygnały z X1 i audytu N5)

### 6. Formularz /kontakt nie wysyła wiadomości
**Severity**: 🔴 przed launchem · **Status**: ✅ ZAMKNIĘTE — wdrożone na produkcję 2026-07-16 (deploy wiszącej partii: `firestore:rules,hosting,functions`)
`ContactPage.jsx` `handleSubmit` pokazywał tylko toast — treść NIGDZIE nie trafiała. **Decyzja właściciela: zapis do Firestore.** Wdrożone: `addDoc` do `contact_messages` (limity 320/5000, toast błędu z adresem awaryjnym), reguły create-only z walidacją kształtu (odczyt wyłącznie w konsoli Firebase). Pamiętać: zaglądać do kolekcji `contact_messages` w konsoli.

### 7. Paywall oferuje „Pakiet roczny", którego backend nie obsługuje
**Severity**: 🔴 sprzedażowe · **Status**: ✅ ZAMKNIĘTE — wdrożone na produkcję 2026-07-16 (pakiet roczny ukryty; wraca z drugą ceną w Stripe + parametrem planu)
`PaywallScreen` pokazywał 24,99/mc (299,90/rok), ale `createCheckoutSession` ma zaszyty JEDEN Price ID — klik „roczny" kupowałby miesięczny. **Decyzja właściciela: pakiet UKRYTY** do czasu wdrożenia (jedna karta 29,99 zł/mc, przełącznik okresu usunięty). Wraca razem z ofertą founding members po dodaniu drugiej ceny w Stripe + parametru planu.

### 9. Upload do przewodników: storage/unauthorized — brak roli cross-service (nawrót incydentu N2)
**Severity**: 🔴 funkcja martwa · **Status**: ✅ ROZWIĄZANE 2026-07-15 (właściciel nadał rolę w IAM; potwierdzone testem na żywo — upload okładki przechodzi, zero błędów w konsoli)
Zgłoszone przez właściciela 2026-07-15, odtworzone na żywo w jego sesji: `Firebase Storage: User does not have permission… (storage/unauthorized)` przy wgrywaniu okładki NOWEGO przewodnika. Eliminacja: panel działa (dokument `users` i subskrypcja OK w regułach Firestore), plik 70 B image/png, gałąź `!exists` — jedyny różniący czynnik to `firestore.get/exists` w `storage.rules` → **rola `roles/firebaserules.firestoreServiceAgent` dla agenta Storage (`service-379384522806@gcp-sa-firebasestorage…`) nie jest skutecznie nadana** (prompt CLI przy N2 najwyraźniej nie zadziałał). Naprawa: `firebase deploy --only storage` w TTY z odpowiedzią `y` na prompt o uprawnieniach cross-service ALBO nadanie roli w konsoli GCP (IAM). Weryfikacja: ponowny upload okładki.
**Update 2026-07-15**: TTY deploy właściciela NIE nadał roli (prawdopodobnie prompt się nie pojawił). **Potwierdzone zrzutem z konsoli IAM** (widok z rolami agentów Google, filtr „firebasestorage"): agent ma wyłącznie domyślną rolę „Agent usługi Cloud Storage dla Firebase" — brak `roles/firebaserules.firestoreServiceAgent`. Właściciel nadaje rolę ręcznie w IAM (ołówek → Dodaj kolejną rolę → filtr „firebaserules" → Firebase Rules Firestore Service Agent → Zapisz).

### 8. Konta Google nie mogą usunąć konta z poziomu aplikacji
**Severity**: 🟡 RODO · **Status**: ✅ ZAMKNIĘTE 2026-07-16 (finding F6 toru RODO-UI, commit `c714fb1`, wdrożone rules→hosting)
Formularz „Usunięcie konta" wymagał hasła (`EmailAuthProvider.credential`), którego konto Google nie posiada. Naprawione: `AccountModal` rozgałęzia się po providerze — konta Google przechodzą przez `reauthenticateWithPopup(GoogleAuthProvider)` („Potwierdź przez Google i usuń konto"). Domyka art. 17 dla kont Google; obejście mailowe z artykułu supportu jest nieaktualne.
Dług (kosmetyka, [[Projects/Backlog]]): brak osobnej obsługi `auth/popup-blocked`.

---

## Otwarte (2026-07-21 — sygnały z odświeżania bazy wiedzy X1)

> Wyszły przy przepisywaniu artykułów pod obecny UI (agent `support`). Obie pozycje
> **zweryfikowane w kodzie** przez głównego Claude'a, nie przyjęte na słowo.

### 10. Wpisów typu „Koszty" i jednorazowych zadań nie da się edytować ani usunąć
**Severity**: 🔴 integralność danych (psuje zysk i CSV dla księgowego) · **Status**: ✅ NAPRAWIONE 2026-07-21 (front-only, bez zmian reguł — `text`/`isCompleted` i `delete` były już w allowliście `isValidRental`)
**Naprawa:** „Ostatnie koszty" w `CostsView` dostały kolumnę akcji (edycja przez istniejący `openEditModal`, usuwanie przez `handleDeleteClick`) oraz przełącznik „Pokaż wszystkie" — bez niego koszt starszy niż 8 ostatnich wpisów pozostawał nieosiągalny. Wiersz niesie teraz referencję do oryginalnego wpisu (`entry`). Jednorazowe zadania (`type: 'reminder'`) dostały zakładkę „Zadania" w widoku Rezerwacje (`remindersList` wpięty w `displayedBookings`) z odhaczaniem, edycją i usuwaniem; przełącznik sortowania celowo pominięty, bo zadania sortuje `utilitySortOrder`, więc byłby martwym przyciskiem. Regresja: `e2e/costs-tasks.spec.js`.
**Stan pierwotny (do historii):**
`ManagerApp.jsx:239` **liczy** `utilitiesList` (`type === 'utility'`), ale destrukturyzacja w `:222` go nie odbiera — lista nigdzie nie trafia. Żaden widok nie pokazuje wpisów kosztowych z akcjami: `BookingsView` (jedyne miejsce z `openEditModal`/`handleDeleteClick`) renderuje wyłącznie rezerwacje, a „Ostatnie koszty" w `CostsView.jsx:344-359` to wiersze **bez przycisków** (Edytuj/Usuń w tym widoku należą do kosztów STAŁYCH z `settings/recurringCosts` — inny model).
To samo dotyczy `type === 'reminder'`: `remindersList` zasila tylko pływający widget „Zadania na dziś" (`:274`), gdzie zadanie można odhaczyć, ale nie poprawić ani skasować.
**Skutek:** literówka w kwocie kosztu zostaje w danych na zawsze i zaniża zysk netto oraz eksport dla księgowego. Gospodarz nie ma żadnej ścieżki naprawy poza kontaktem z nami.

### 11. Sygnalizator synchronizacji w sidebarze zawsze pokazuje „—"
**Severity**: 🟡 wprowadza w błąd (gospodarz uzna, że integracja nie działa) · **Status**: ✅ NAPRAWIONE 2026-07-21
**Naprawa:** `syncRows` czyta teraz WARTOŚCI `syncLinks` (portale), nie klucze (nazwy obiektów). Lista jest sterowana danymi: „Booking.com" i „Airbnb" pokazujemy zawsze, bo Ustawienia mają na nie pola; każdy inny portal pojawi się sam, gdy trafi do danych. „Nocowanie" zniknęło — nie ma pola na jego link, więc wiersz nie mógł nigdy zapalić się na „OK" (decyzja produktowa o dodaniu tego kanału pozostaje otwarta). Regresja: `e2e/costs-tasks.spec.js`.
**Stan pierwotny (do historii):**
`ManagerApp.jsx:471-475` buduje `syncRows`, sprawdzając `Object.keys(syncLinks)` pod kątem słów „airbnb"/„booking"/„nocowanie". Tymczasem **kluczami `syncLinks` są NAZWY OBIEKTÓW**, a nazwy portali siedzą w wartościach: `SettingsModal.jsx:184,189` zapisuje `editingSyncLinks[p.name] = { booking, airbnb }`, `ManagerApp.jsx:399` utrwala to jako `{ links: editingSyncLinks }`, a `useFirebaseData.js:94` czyta z powrotem `data.links`.
**Skutek:** przy poprawnie wklejonych linkach wszystkie trzy kanały świecą „—". Naprawa: sprawdzać wartości (`Object.values(syncLinks).some((v) => v?.booking)` itd.), nie klucze. Uwaga: „Nocowanie" nie ma w ogóle pola na link w Ustawieniach, choć widnieje w sygnalizatorze — do rozstrzygnięcia produktowego.

### 12. Debugowy handler błędów kasował stronę na produkcji — ✅ NAPRAWIONE 2026-08-10/11
**Severity**: 🟠 psuł UX każdego błędu i pokazywał użytkownikom stack trace · **Status**: ✅ NAPRAWIONE (commit `69f05c3`, wdrożone)

> ⚠️ **ERRATA 2026-08-11 — ten wpis został przeklasyfikowany.** Pierwotnie brzmiał
> „Nie działa dodawanie rezerwacji. Strona wywala błąd — PRZYCZYNA NIEUSTALONA" i miał
> severity 🔴. **Zgłoszenie z 10.08 było testowe** — właściciel wysłał je, żeby sprawdzić,
> czy kanał `/kontakt` w ogóle działa, a treść była wypełniaczem. **Awaria dodawania
> rezerwacji nigdy nie wystąpiła i nie ma dla niej żadnych dowodów.** Zgodnie z konwencją
> tego pliku pierwotnego sformułowania nie kasujemy — patrz „Czego to uczy" niżej.

**Realny problem, który przy tym wyszedł i został naprawiony (`index.html`):** globalny
`window.onerror` + `window.onunhandledrejection` podmieniały `document.body` na czerwony ekran
„Błąd JS!" ze stack tracem. Wszedł commitem `b4aeb4e` (29.06, „bypass email verification and add
cleanup TODOs for **easier V4 testing**") i **przeżył na produkcji 6 tygodni**. Bypass weryfikacji
z tego samego commita posprzątano przy N1 — tego handlera nie. Skutek: KAŻDY błąd JS, także
w obcym skrypcie albo rozszerzeniu przeglądarki, kasował działającą stronę. Błędy renderu i tak
łapie `src/GlobalErrorBoundary.jsx` (markowy ekran + czyszczenie cache PWA), więc handler nie
wnosił nic poza szkodą. Zweryfikowane po wdrożeniu na żywej produkcji: nieobsłużony `throw`
i odrzucony promise → strona żyje, błędy trafiają do konsoli ze stack tracem.

**Audyt ścieżki dodawania rezerwacji (przeprowadzony przy okazji — wynik: ZDROWA).**
Robiony pod fałszywym założeniem, że jest awaria, ale ustalenia są prawdziwe i zostają
jako potwierdzenie stanu produkcji na 10.08:
- konto: `emailVerified: true`, `status: 'active'` → `isOwnerAndVerified` + `hasActiveSubscription` przechodzą;
- `firestore.rules`: allowlista `isValidRental` zawiera `adults`/`children`/`pets`, zmiana addytywna;
- kod zapisu: e2e „Dodanie rezerwacji zapisuje czysty dokument" **przechodzi**;
- deploy: 26/26 chunków HTTP 200, `ManagerApp-Df2hXFSw.js` **bajt w bajt** identyczny z lokalnym buildem;
- dane: rezerwacja z rozbiciem (`adults:2, children:2, pets:1, guests:4`) istnieje w bazie od 25.07;
- App Check: egzekwowanie wyłączone → nie blokuje zapisu (ale patrz #13).

**Czego to uczy — i dlaczego zostaje w rejestrze:**
1. **„Brak dokumentu w `rentals` z 10.08" wziąłem za poszlakę potwierdzającą awarię.** To był
   brak próby, nie ślad błędu. Nieobecność danych nie jest dowodem — o ile nie wiadomo, że
   ktoś naprawdę próbował.
2. **Zgłoszenie testowe jest nieodróżnialne od prawdziwego.** Kanał nie ma pola statusu ani
   typu, więc nic nie odsiewa wypełniaczy — to zaostrza istniejący brak z §6
   [[support/Proces-obslugi-zgloszen]] („Brak statusu zgłoszenia"). Przy testach warto pisać
   wprost „TEST — proszę zignorować".
3. Pościg za nieistniejącym błędem wyprodukował mimo to trzy realne ustalenia (#13, #14, #15) —
   ale to szczęśliwy skutek uboczny, nie metoda.

---

### 16. 🔴 Strony gościa nie działały — wyłączony dostawca „Anonymous"
**Severity**: 🔴 cała gościnna połowa produktu · **Status**: ✅ **ROZWIĄZANE 2026-08-13** (właściciel włączył logowanie anonimowe; potwierdzone na telefonie i kanarkiem w smoke'cie produkcji)

> ✅ **PRZYCZYNA USTALONA I USUNIĘTA.** W konsoli Firebase → Authentication → Sign-in method
> dostawca **„Anonymous" był WYŁĄCZONY**. Aplikacja zakłada gościom konta anonimowe, zanim
> pokaże przewodnik, więc `signInAnonymously` wracało z `400 ADMIN_ONLY_OPERATION`
> („tworzenie konta tylko dla administratora") i kod nigdy nie dochodził do Firestore.
> Po włączeniu dostawcy: `200 SignupNewUserResponse`, a przewodnik **otwiera się na
> telefonie właściciela**. Kiedy dostawca został wyłączony — nie wiadomo; w kodzie nic
> tego nie dotyka.
>
> **Trzy warstwy, w których się zaplątaliśmy** (warto zapamiętać kolejność):
> 1. `400 ADMIN_ONLY_OPERATION` — prawdziwa przyczyna, widoczna od pierwszego pomiaru.
> 2. `401 app-check-token-is-invalid` — **druga blokada NA WIERZCHU**, widoczna tylko dla
>    klienta bez tokenu App Check (czyli dla moich narzędzi). Przez nią pomiar z czystego
>    Chromium pokazał inny błąd niż pomiar z przeglądarki wbudowanej i uznałem pierwszą
>    diagnozę za obaloną. Była trafna.
> 3. `permission-denied` z Firestore — **stan normalny dla automatu**: App Check jest dla
>    Firestore wymuszany (99% ruchu zweryfikowane), więc nieatestowany klient jest odcinany
>    zgodnie z zamysłem. To NIE była awaria.
>
> ⚖️ **Lekcja**: dwa narzędzia diagnostyczne dały dwa różne błędy dla tej samej awarii, bo
> blokady były ułożone jedna na drugiej. Zdejmowanie ich po kolei — i sprawdzanie po każdym
> kroku, co się zmieniło w KODZIE odpowiedzi — było jedyną drogą. Sam komunikat na ekranie
> („Brak dostępu") był identyczny na każdym etapie i nie niósł żadnej informacji.
>
> ✅ **Domknięte w całości 2026-08-13, wieczorem**: właściciel przywrócił **„Enforce" dla
> Authentication**, a przewodnik **nadal otwiera się na telefonie**. Stan końcowy: ochrona
> App Check działa dla Firestore i Authentication, goście wchodzą, deklaracja z Polityki
> i DPA §6 jest prawdziwa. Kanarek w smoke'cie produkcji przeszedł również po ponownym
> włączeniu wymuszania — potwierdza to, że alarmuje na wyłączony dostawca, a nie na
> odsiewanie botów (8/8).
**Zaobserwowane 2026-08-13** przy weryfikacji live deployu (znalezione przypadkiem, nie szukane).

> ⚠️ **KOREKTA 2026-08-13, ta sama sesja — kilka godzin po pierwszym zapisie.** Pomiar
> powtórzony w **czystym Chromium** (Playwright, przy budowie smoke'a produkcji) dał **inny
> błąd** niż przeglądarka wbudowana: `401 accounts:signUp` → **`auth/firebase-app-check-token-is-invalid`**,
> poprzedzone **403** przy wymianie tokenu App Check. To znaczy: (1) **App Check jest
> egzekwowany dla Authentication**, (2) klient nie umie zdobyć tokenu — czyli to **ten sam
> 403 co w #13**. Obie pozycje, prowadzone dotąd osobno, opisują **jeden problem**.
>
> **Co upada z pierwotnego zapisu:** teza „wyłączony dostawca Anonymous albo zablokowane
> tworzenie kont" jako przyczyna główna — `admin-restricted-operation` zaobserwowany
> w przeglądarce wbudowanej zostaje jako fakt, ale nie jest już wyjaśnieniem pierwszego wyboru.
> **Co przeżywa:** strony gościa nie wczytują się **dla klienta bez ważnego tokenu App Check**;
> ścieżka kodu (`signInAnonymously` przed odczytem) i skutek są opisane poprawnie.
>
> 🛑 **Czego NIE wiemy, a twierdziłem inaczej:** że „cała gościnna połowa produktu leży dla
> wszystkich". Obie moje przeglądarki są **sterowane automatem** — czyli dokładnie ten ruch,
> który App Check ma odsiewać. Niska ocena reCAPTCHA jest dla nich spodziewana. **Czy
> człowiek z prawdziwej przeglądarki wejdzie, rozstrzyga jedno otwarcie prawdziwego linku
> na telefonie** — i to jest teraz pierwszy krok, przed czymkolwiek w konsoli.

**Objaw:** wejście na `https://wynajempro.com/guide/<cokolwiek>` kończy się ekranem
**„Brak dostępu — Wystąpił błąd autoryzacji sesji. Odśwież stronę."**, a `/opinie/<cokolwiek>`
ekranem „Nie znaleziono strony". W konsoli:
```
POST identitytoolkit.googleapis.com/v1/accounts:signUp → 400
Błąd autentykacji anonimowej: auth/admin-restricted-operation
```
Powtórzone w **świeżej karcie**, bez cache i bez service workera.

**Dlaczego to kładzie funkcję, a nie tylko psuje wygląd:** `GuestGuideView.jsx:31-51`
najpierw loguje gościa anonimowo, a dopiero potem czyta przewodnika. Gdy `signInAnonymously`
rzuci, kod ustawia `error` i **nigdy nie sięga do Firestore** — nieważne, czy przewodnik
istnieje. To samo w `ReviewPageView`. Czyli: **każdy link do przewodnika i każda strona opinii
wysłana gościowi kończy się komunikatem o błędzie.**

**To nie jest skutek deployu z 13.08:** paczka nie tknęła `firebase.js`, `App.jsx` w części
auth ani reguł — 400 przychodzi z serwera Google, nie z bundla. Kiedy się zaczęło, nie wiadomo;
nikt tej ścieżki nie sprawdzał na produkcji od czasu wdrożeń N5.

**Poszlaka co do przyczyny (do potwierdzenia w konsoli):** to samo żądanie wysłane **bez**
tokenu App Check dostaje `401 „Firebase App Check token is invalid"`. Z tego wynikają dwie
rzeczy: (1) **egzekwowanie App Check dla Authentication jest WŁĄCZONE** — czego nie zakładał
ani #13, ani N6.4; (2) SDK aplikacji **przechodzi** App Check (dostaje 400, nie 401), więc
odmowa zapada dalej, na poziomie polityki kont. `admin-restricted-operation` zwracany jest,
gdy zablokowane jest **tworzenie kont**: albo wyłączony dostawca „Anonymous", albo globalne
„Prevent account creation" w ustawieniach Authentication.

⚠️ **Jeśli to drugie — nie działa też rejestracja nowych użytkowników.** Nie sprawdzałem tego
na produkcji świadomie: każda próba to albo realne konto, albo hałas w danych. To pytanie do
konsoli, nie do agenta.

**Co zrobić, w tej kolejności:**
0. **NAJPIERW, 30 sekund, bez konsoli:** otwórz **prawdziwy** link do swojego przewodnika
   na telefonie, w oknie prywatnym. To jedyny pomiar rozstrzygający, czy problem dotyka
   ludzi, czy tylko klientów bez ważnego tokenu App Check. Od wyniku zależy, czy to pożar,
   czy dług.
1. **App Check → Authentication (Identity Platform)** — stan egzekwowania. Jeśli włączone,
   a 403 z #13 nadal trwa, **wyłączenie egzekwowania dla tej jednej usługi** natychmiast
   odblokowuje strony gościa i kupuje czas na naprawę reCAPTCHA. Zdejmuje też ryzyko przy
   N6.4: dziś wiemy, że dla Authentication egzekwowanie **działa**, więc dołożenie go
   Firestore/Storage przy zepsutym tokenie odcięłoby resztę aplikacji.
2. **Napraw źródło (#13):** konsola reCAPTCHA → lista dozwolonych domen (czy jest
   `wynajempro.com`, a nie tylko stara `moje-domki-6c77d.web.app`) i rejestracja aplikacji
   webowej w App Check tym samym kluczem. Po naprawie doba throttle.
3. **Dopiero gdyby to nie pomogło** — pierwotna hipoteza: Authentication → Sign-in method →
   **Anonymous** (czy włączone) oraz Settings → User actions → **„Enable create (sign-up)"**.
   ⚠️ Gdyby to drugie było zablokowane, **nie działa też rejestracja nowych użytkowników**.

**Po naprawie:** otworzyć **prawdziwy** link do przewodnika (nie zmyślone id) i potwierdzić,
że gość widzi treść. Regresja e2e tego nie złapie — suita mockuje Firebase, więc świeci
zielono niezależnie od stanu produkcji. Od 2026-08-13 pilnuje tego osobny smoke produkcji
(`e2e-prod/smoke.spec.js`, przepływ `prod-smoke.yml`, co godzinę) — z zastrzeżeniem, że
**kanarek sesji gościa mierzy klienta bez tokenu App Check**, a nie człowieka z przeglądarki.

---

### 15. Każdy deploy zostawia użytkowników na starej powłoce (service worker)
**Severity**: 🟡 opóźnia dotarcie poprawek, mylące przy weryfikacji · **Status**: ✅ ROZWIĄZANE 2026-08-13 (`79b95c7`, wdrożone `hosting:app`)
**Zaobserwowane 2026-08-10** przy weryfikacji wdrożenia `69f05c3`, niezależnie od zgłoszenia:
`curl` dostawał już **czysty** `index.html`, a przeglądarka z aktywnym service workerem nadal
serwowała **stary** — czerwony ekran z usuniętego handlera pojawił się na produkcji **po**
deployu. Dopiero jedno przeładowanie podmieniło powłokę.

To poprawne zachowanie `registerType: 'autoUpdate'` (`vite.config.js:10`), nie awaria. Ale ma
dwie konsekwencje:
- **poprawka dociera do użytkownika dopiero przy kolejnym wejściu/przeładowaniu**, o czym nikt
  go nie informuje;
- **`curl` NIE weryfikuje deployu aplikacji PWA** — sprawdza serwer, nie to, co widzi użytkownik.
  Weryfikacja live musi iść przez przeglądarkę. To najtrwalszy wniosek z tej sesji.

**Rozwiązanie (decyzja właściciela 2026-08-13):** komunikat, nie automat. `registerType`
zmieniony na `'prompt'` (`vite.config.js`), nowy pasek `src/components/UpdatePrompt.jsx`
u górnej krawędzi: „Dostępna nowa wersja aplikacji. Odśwież, żeby z niej korzystać."
Przeładowanie następuje **wyłącznie po kliknięciu** — automatyczne `skipWaiting` odrzucone
świadomie, bo mogłoby wypaść w środku wypełniania rezerwacji. Do tego `registration.update()`
co godzinę, żeby długo otwarta karta panelu w ogóle dowiedziała się o wydaniu.
Weryfikacja na buildzie produkcyjnym (`vite preview`): kontrolowana karta + nowy build →
SW `waiting`, pasek widoczny, **brak samoistnego przeładowania**; klik „Odśwież" → reload
z nowej wersji. e2e `update-prompt.spec.js` 3/3, suita 133/133.
⚠️ **Pierwszy deploy po tej zmianie jeszcze tego nie pokaże** — użytkownicy z aktywnym
starym SW dostaną go po staremu; pasek zacznie działać dla nich od kolejnego wydania.
⚠️ Wniosek o `curl` **zostaje w mocy**: weryfikacja deployu PWA idzie przez przeglądarkę.

> Wcześniejsza wersja tego wpisu wiązała nieświeży SW z rzekomą awarią dodawania rezerwacji
> (404 leniwego chunku → odrzucony promise → czerwony ekran). **Ta hipoteza jest wycofana** —
> tłumaczyła zdarzenie, które nigdy nie zaszło. Sam mechanizm nieświeżej powłoki jest realny
> i zaobserwowany; jego rzekomy skutek nie.

---

### 13. App Check 403 — ❌ NIE JEST AWARIĄ (sprostowane 2026-08-13)
**Severity**: 🟢 zjawisko normalne · **Status**: ✅ ZAMKNIĘTE jako fałszywy alarm

> 🛑 **CAŁA TA POZYCJA STAŁA NA FAŁSZYWYM ZAŁOŻENIU.** Twierdziła, że „produkcja nie
> przechodzi atestacji" i że „egzekwowanie jest w konsoli wyłączone, więc dziś nic to nie
> psuje". **Oba zdania są nieprawdziwe.** Zrzut z konsoli (2026-08-13) pokazuje:
>
> | Usługa | Zweryfikowane | Stan |
> |---|---|---|
> | Cloud Firestore | **99%** | **Enforced** |
> | Storage | 100% | Monitoring |
> | Authentication (PREVIEW) | 73% | Monitoring |
> | Functions | — | niewymuszane |
>
> Produkcja **przechodzi** atestację dla 99% ruchu, a egzekwowanie dla Firestore jest
> włączone **od dawna** i działa. Obserwowany 403 dotyczy klientów, którym reCAPTCHA nie
> wystawia tokenu — czyli **przeglądarek sterowanych automatem**: moich narzędzi
> diagnostycznych. To jest dokładnie to, do czego App Check służy.
>
> **Skąd wziął się błąd:** 403 zaobserwowano 10.08 w narzędziu agenta i uznano za stan
> produkcji, nie sprawdzając metryk w konsoli. Ta pomyłka przez trzy dni kierowała pracę
> w złą stronę — kosztowała też błędne zalecenie „nie włączaj egzekwowania" (już było
> włączone) i chwilowe zdjęcie ochrony przy diagnostyce #16.
>
> ⚖️ **Wniosek**: obserwacja z jednego klienta nie jest stanem systemu. Metryki po stronie
> dostawcy istniały przez cały czas — wystarczyło o nie poprosić właściciela.
**Objaw (zaobserwowany na żywo 10.08 na `wynajempro.com`):**
```
@firebase/app-check: AppCheck: 403 error. Attempts allowed again after 01d:00m:00s (appCheck/initial-throttle)
```
Klucz reCAPTCHA v3 jest poprawnie wbudowany w bundle (`src/firebase.js:31`, `VITE_RECAPTCHA_SITE_KEY`), ale wymiana tokenu na token App Check jest odbijana. Po 403 SDK wchodzi w **dobowy throttle** i przestaje próbować.

**Dlaczego dziś nic nie psuje:** egzekwowanie App Check jest w konsoli **wyłączone**, więc Firestore przyjmuje żądania bez ważnego tokenu.

**Dlaczego to jest pilne:** zadanie 1 w [[Projects/Instrukcje-wlasciciela]] to właśnie **włączenie egzekwowania**. Zrobione przy obecnym 403 **odetnie cały ruch aplikacji do Firestore** — dokładnie to, przed czym ostrzega notatka „odcięcie ruchu" w instrukcji. Kolejność jest odwrotna niż zapisana: najpierw naprawić 403, potwierdzić w konsoli, że token się wystawia, dopiero potem włączać egzekwowanie.

**Podejrzany numer jeden:** zmiana domeny kanonicznej na `wynajempro.com` (22.07) — klucz reCAPTCHA i/lub rejestracja aplikacji w App Check mogą nadal wskazywać starą domenę `moje-domki-6c77d`. Do sprawdzenia w konsoli reCAPTCHA (lista dozwolonych domen) i Firebase → App Check (czy aplikacja webowa jest zarejestrowana z tym kluczem).

---

### 14. Test e2e migracji `guests`→`adults` zgnił po 6 dniach — bezgłośnie
**Severity**: 🟡 fałszywe poczucie pokrycia · **Status**: ✅ NAPRAWIONE 2026-08-10
**Problem:** `e2e/panel-v2.spec.js` „Edycja starej rezerwacji (samo `guests`)" miał fixture z datami wpisanymi na sztywno (`2026-08-01`–`2026-08-05`). Lista rezerwacji domyślnie filtruje `upcoming` (`ManagerApp.jsx:240`: `endDate >= dziś`), więc **10.08 fixture wpadł do „Archiwum"**, test przestał znajdować przycisk „Edytuj" i wywalał się na timeoucie.
**Dlaczego to bolało:** to jedyny test pilnujący pułapki utraty danych z X17 — migracji `guests`→`adults`, bez której zapis starej rezerwacji **zeruje liczbę osób**. Commit X17 zdał go 25.07 („e2e 39/39") i od 31.07 test nie chronił już niczego, nie dając żadnego sygnału.
**Naprawa:** daty fixture'ów liczone względem dnia uruchomienia (`isoInDays()`), z komentarzem zakazującym powrotu do dat na sztywno. Po poprawce `panel-v2.spec.js` przechodzi 7/7.
**Wniosek ogólny:** deklaracja „e2e N/N" w commicie jest prawdziwa wyłącznie w dniu commita.

---

## Future Improvements (Not Bugs)

- [ ] Add dark mode
- [ ] Implement guide versioning
- [ ] Add email notifications
- [ ] Optimize Firestore queries
- [ ] Add analytics
- [ ] Improve mobile UX
- [ ] Add property photos/gallery

---

## Testing Status

| Issue | E2E Test | Manual Test | Fix Status |
|-------|----------|-------------|-----------|
| iCal Token | n/a | ✅ OK | NOT A BUG (generated in ManagerApp.jsx) |
| Storage Leak | n/a | ✅ OK | NOT A BUG (deleteUserAccount clears Storage) |
| App Check | ✅ PASS | ✅ OK | FIXED |
| Auth iFrame | ✅ PASS | ✅ OK | FIXED |
| Google Loop | ✅ PASS | ✅ OK | FIXED |

---

## How to Report Issues

1. Create failing E2E test in `e2e/` folder
2. Run test to confirm bug
3. Document in this file
4. Create branch: `fix/issue-name`
5. Fix + test + commit
6. Push PR

---

**Related**: [[Development]], [[Features]], [[Architecture]]

---

### 17. Przejściowa awaria App Check blokuje logowanie
**Severity**: 🟡 MEDIUM (występuje losowo, mija po odświeżeniu)
**Status**: ⏸ ŁAGODZONE, przyczyna systemowa zostaje
**Zaobserwowane**: 2026-08-21, konto właściciela, logowanie przez Google.

**Objaw**: „Błąd podczas logowania przez Google" mimo w pełni sprawnego konta
(niewyłączone, adres potwierdzony, dostawca `google.com`, poprawne claimy, udane
logowanie kilka godzin wcześniej). **Odświeżenie strony rozwiązuje problem.**

**Przyczyna**: App Check jest w trybie `ENFORCED` dla **`identitytoolkit.googleapis.com`**,
czyli dla samej usługi logowania (obok `firestore` i `firebasestorage`). Token App Check
ma krótki czas życia i odnawia się sam; gdy odnowienie chwilowo się nie powiedzie —
potknięcie reCAPTCHA, sieć — **każde żądanie logowania jest odrzucane** do czasu zdobycia
nowego tokenu. Przeładowanie strony wymusza świeży token i dlatego pomaga.

**Co zrobiono**: `LoginPanel` rozpoznaje teraz ten przypadek (`auth/firebase-app-check-token-is-invalid`,
`auth/internal-error`, `auth/network-request-failed`, „app check" w treści) i mówi wprost
**„Odśwież stronę"**. Poprzedni komunikat radził „spróbuj ponownie", czyli dokładnie to,
co przy nieważnym tokenie NIE działa — kliknięcie tego samego przycisku odbija dalej.

**Czego NIE rozwiązano**: samego kompromisu. Wymuszanie App Check na logowaniu jest realnym
zabezpieczeniem przed botami zakładającymi konta, ale czyni z reCAPTCHA **pojedynczy punkt
awarii dla wejścia do produktu**. Przy jednym użytkowniku to niedogodność; przy stu — zgłoszenia
„nie mogę się zalogować", których przyczyny nie widać w danych konta.

⚠️ **To jest PIERWSZE miejsce do sprawdzenia przy zgłoszeniu „nie mogę się zalogować"**,
gdy konto w bazie wygląda poprawnie. Tryby egzekwowania:
`https://console.firebase.google.com/project/moje-domki-6c77d/appcheck/apis`
