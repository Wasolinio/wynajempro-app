# 📝 Activity Log

Project timeline and key milestones.

---

## 2026-08-13

### DEPLOY `hosting:app` (drugi tego dnia) — poprawka przewijania dialogów, Sentry, react-router
- 🎯 **Zakres**: cztery pliki `src` z trzech commitów — `styles.js` (przewijanie dialogów, zgłoszone przy smoke 4e), `monitoring.js` + `main.jsx` + `GlobalErrorBoundary.jsx` (Sentry, wyłączony) oraz podbicie `react-router` 7.15.0 → 7.18.2 z triage'u podatności.
- ✅ **Pre-flight**: lint 0, build OK, **e2e 134/134** (przebieg 13.08).
- ✅ **Cel `hosting:app`**: `git diff` potwierdził **zero zmian** w regułach, `functions/`, indeksach i `firebase.json`.
- ✅ **Weryfikacja live**: **smoke produkcji 8/8** — po raz pierwszy wdrożenie sprawdzone automatem, a nie ręcznym klikaniem. Przy okazji potwierdzony tryb service workera („prompt", nie „autoUpdate") i przekierowanie ze starej domeny.
- ✅ **Sentry NIE trafił do paczki**: pobrane 11 plików JS z produkcji, **zero** zawierających kod Sentry. Dynamiczny import za `VITE_SENTRY_DSN` działa zgodnie z założeniem — dopóki właściciel nie zdecyduje o podprocesorze, nic nie wychodzi na zewnątrz i nic nie waży.
- 📌 **Kanarek sesji gościa przeszedł również po ponownym włączeniu wymuszania App Check** — mierzy kod odpowiedzi, nie tekst na ekranie, więc odsiewanie botów go nie myli.

### Smoke testy właściciela 4a–4f — komplet zdany, cztery znaleziska po drodze
- 🎯 **Kontekst**: pierwsza tura smoke testów po wdrożeniach z 10 i 13.08. Prowadzone przez właściciela, bo wszystko siedzi za logowaniem — agent może tylko podawać kroki i czytać wyniki.
- ✅ **4c — wycofanie zgody u gościa: OK**. Test był **niewykonalny do dzisiaj**, bo strony gościa nie działały (#16); odblokował się dosłownie godzinę wcześniej.
- ✅ **4b — pułapka migracji `guests`→`adults`: OK**, i to jest najważniejszy wynik dnia. Stara rezerwacja pokazała „Dorośli 2", a po zapisie bez zmian liczba osób **dalej wynosi 2**. Odczyt z bazy maską pól (bez danych gościa) wykazał, że taka rezerwacja jest w tej bazie **jedna** — więc pułapka X17 jest zamknięta w całości, nie na próbce.
  📌 **Wpadka po mojej stronie**: podałem właścicielowi identyfikator dokumentu Firestore jako sposób odnalezienia rezerwacji w panelu. Wyszukiwarka panelu szuka po nazwisku gościa i obiekcie — wynik: zero rezultatów i zmarnowana minuta. Trafny namiar to obiekt + termin (Domek 1, 20–23.08), wyciągnięty maską bez czytania danych gościa.
- ✅ **4a — nowe pola gości: OK**. Rezerwacja 2 dorosłych + 2 dzieci + 1 zwierzę pokazuje **4 osoby**; zwierzę nie wchodzi do sumy, zgodnie z modelem X17.
- ✅ **4d — ostrzeżenie przy usuwaniu konta: OK**, komunikat pokrywa pełny zakres kasacji (przewodniki, sekrety, podpisy, pliki, dane biznesowe, Stripe, profil, konto). 🔥 **Przy okazji potwierdzona ścieżka usuwania konta Google** („Potwierdź przez Google i usuń konto") — zamknięta w lipcu jako finding F6, ale **nigdy nieoglądana na produkcji**. To zdejmuje zastrzeżenie „potwierdzone tylko w kodzie" z §9.1 dokumentu bezpieczeństwa i z erraty E3 pakietu dla prawnika.
- 🛑 **Znalezisko 1 — poziome przewijanie w dialogach** (4e). Modal „Edytuj koszt stały" rozpychał się i ucinał pole „Do miesiąca". Zmierzone na izolowanym przypadku: **siatka 384 px przy kontenerze 352 px — przepełnienie o 32 px**. Przyczyna: pola typu month/date mają dużą szerokość własną, a element siatki stoi domyślnie na `min-width:auto` i nie daje się ścisnąć. Naprawa (`e68b226`): `min-width:0` na elementach `.wpd-fgrid` i na polach — ten sam idiom co przy `.wpd-seg` 12.08. Dotyczy **wszystkich** dialogów z tą siatką (rezerwacje, ustawienia, konto), nie tylko kosztów. Regresja: nowy test w `ui-scaling` mierzy `scrollWidth` vs `clientWidth` każdej siatki w otwartym dialogu, z asercją „jest co najmniej jedna siatka", żeby nie zszedł po cichu do zera asercji ([[Known-Issues]] #14). **e2e 134/134.**
  📌 **Hook lintujący złapał mnie po drodze**: w `styles.js` CSS mieszka w szablonie JS, więc odwrócone apostrofy w moim komentarzu zamknęły ciąg znaków i rozwaliły plik. Ostrzeżenie dopisane w kodzie. Drugi raz tego dnia, gdy hook zatrzymał błąd, zanim poszedł dalej.
- 🛑 **Znalezisko 2 — raport rentowności w PDF wygląda źle** → nowa pozycja **X18** w [[Projects/Roadmap]], w kolejce **po smoke testach** (decyzja właściciela). Z pliku z produkcji: **pierwsza strona pusta**, tytuł dokumentu to hasło reklamowe ze strony („WynajemPRO - Prosty system do zarządzania…"), które trafia też do nazwy pliku, i trzy strony na raport, który powinien zmieścić się na jednej–dwóch. Podejrzenie co do pustej strony: technika druku oparta na `visibility:hidden` — ukryte elementy **nadal zajmują miejsce**, więc niewidzialna powłoka panelu spycha treść na kolejną stronę.
- ✅ **4e — eksport CSV: OK.** Polskie znaki (ą, ę, ł, ń, ó), przecinki dziesiętne, kolumny rozłożone poprawnie. Kod potwierdza to, co widać: separator `;` (konwencja Excela PL), UTF-8 BOM, CRLF, cytowanie pól ze średnikiem i podwajanie cudzysłowów (`src/utils/reportExport.js`).
  🛑 **Luka zauważona przy czytaniu tego kodu** → [[Projects/Backlog]]: nazwy gości przy rezerwacjach z portali pochodzą z pola `SUMMARY` kalendarza iCal (`functions/index.js:713`), czyli **spoza naszej kontroli**, i trafiają do pliku otwieranego przez **księgowego** w arkuszu. Wartość zaczynająca się od `=`, `+`, `-` lub `@` bywa wykonywana jako formuła; cytowanie pól przed tym nie chroni. Ten sam kształt sprawy co `javascript:` w łączach z audytu N5. Ryzyko niskie, naprawa trywialna — nie ruszane w trakcie serii testów.
- ✅ **4f — rejestracja i weryfikacja e-mail: OK.** Konto zakłada się, mail przychodzi, bez kliknięcia linku panel nie wpuszcza, po kliknięciu wpuszcza. **Domyka ogon N1 z lipca** — jedyny element tamtego zadania, którego nie dało się zweryfikować w środowisku agenta. Przy okazji potwierdzone, że **zakładanie kont działa**, co po dzisiejszym `ADMIN_ONLY_OPERATION` nie było oczywiste.
- 🛑 **Dwa zarzuty właściciela do przepływu 4f — oba trafione, jedna przyczyna** → [[Zlecenia-wlasciciela]] #10. Link weryfikacyjny prowadzi na `moje-domki-6c77d.firebaseapp.com` (domena bez związku z produktem — dla nowego klienta wygląda jak wyłudzenie), a ląduje on na **domyślnej stronie Google**: po angielsku, w niebieskim Material Design, bez naszej marki. 🔥 **A markowa strona istnieje i działa od 1 lipca** — `AuthActionHandler.jsx`, trasa `/auth/action`, obsługuje wszystkie trzy tryby; sprawdzona dziś na żywo (niepoprawny kod → markowy ekran z przyciskiem powrotu). Firebase nigdy nie dostał polecenia, żeby z niej korzystać: adres akcji w szablonach maili wskazuje domyślny handler. **To jedno pole w konsoli, nie przebudowa.**
  📌 Pozycja była już raz odnotowana — w zleceniu #2 jako „opcjonalna kosmetyka na kiedyś". Widzieliśmy wtedy tylko problem domeny i nie zauważyliśmy, że przez to **własna strona nigdy się nie pokazuje**. Waga podniesiona z 🟢 na 🟠. Wniosek: „kosmetyka" bywa etykietą przyklejaną rzeczy niedoobejrzanej.
- ✅ **SERIA 4a–4f ZAMKNIĘTA** — sześć punktów na sześć zdanych, cztery znaleziska po drodze (jedno naprawione, trzy zapisane).

### 🔥 Strony gościa naprawione — przyczyną wyłączony dostawca „Anonymous"
- 🎯 **Objaw**: każdy link do przewodnika i każda strona opinii kończyły się u gościa ekranem „Brak dostępu — Wystąpił błąd autoryzacji sesji". Wykryte przypadkiem przy weryfikacji deployu, nie przez monitoring.
- ✅ **Przyczyna i naprawa**: w konsoli Firebase → Authentication → Sign-in method dostawca **„Anonymous" był wyłączony**. Aplikacja zakłada gościom konto anonimowe, ZANIM pokaże treść (`GuestGuideView.jsx:31-51`), więc `signInAnonymously` wracało z `400 ADMIN_ONLY_OPERATION` i kod nigdy nie sięgał do Firestore. Właściciel włączył dostawcę; serwer zwraca `200 SignupNewUserResponse`, **przewodnik otwiera się na telefonie w trybie prywatnym**. Kiedy dostawca został wyłączony — nie wiadomo, w kodzie nic tego nie dotyka.
- 🔎 **Trzy blokady jedna na drugiej** — i to jest właściwa treść tego wpisu:
  1. `400 ADMIN_ONLY_OPERATION` — **prawdziwa przyczyna**, widoczna od pierwszego pomiaru rano.
  2. `401 app-check-token-is-invalid` — druga blokada **na wierzchu**, widoczna tylko dla klienta bez tokenu App Check. Pomiar z czystego Chromium pokazał ją zamiast pierwszej, więc wieczorem **uznałem poranną diagnozę za obaloną**. Była trafna; po prostu przykryta.
  3. `permission-denied` z Firestore — **stan normalny dla automatu**, nie awaria: App Check jest dla Firestore wymuszany i odsiewa nieatestowanych klientów zgodnie z zamysłem.
- 🛑 **Trzy moje błędy, po kolei**: (1) rano nazwałem to „cała gościnna połowa produktu leży" na podstawie dwóch pomiarów z przeglądarek sterowanych automatem; (2) wieczorem „skorygowałem" trafną diagnozę na podstawie warstwy przykrywającej; (3) na tej podstawie kazałem właścicielowi **zdjąć działające zabezpieczenie** (App Check dla Authentication), które z awarią nie miało nic wspólnego. Rozstrzygnął dopiero pomiar, którego sam nie mogłem wykonać: **właściciel otworzył link na telefonie**.
- ⚖️ **Wniosek metodologiczny**: identyczny komunikat na ekranie („Brak dostępu") towarzyszył wszystkim trzem stanom i nie niósł żadnej informacji. Rozróżniał je **wyłącznie kod odpowiedzi serwera**. Diagnostyka po tym, co widać na ekranie, prowadziła w kółko; po kodach — do celu w trzech krokach.
- ✅ **Kanarek przestawiony na kod, nie na tekst**: test w smoke'cie produkcji celuje teraz w odpowiedź `identitytoolkit` i alarmuje **wyłącznie przy `400 ADMIN_ONLY_OPERATION`** (wyłączony dostawca = regresja), a toleruje `401` (bot bez tokenu = stan normalny). Przy okazji wyszło, że `networkidle` przestało być użytecznym sygnałem — od kiedy sesja gościa działa, strona trzyma otwarty strumień Firestore i sieć nigdy nie cichnie. Smoke: **8/8**.
- ⏸ **Zostaje**: przywrócić „Enforce" dla Authentication (zdjęte przeze mnie w trakcie diagnostyki) + potwierdzić telefonem. Do czasu przywrócenia zdanie o ochronie przed nadużyciami w Polityce i DPA §6 jest dla logowania nieprawdziwe — pakiet jest u prawnika, więc pójdzie errata.

### 🛑 Sprostowanie: App Check 403 nigdy nie był awarią ([[Known-Issues]] #13 zamknięte)
- 🔥 **Zrzut z konsoli właściciela** (o który wystarczyło poprosić trzy dni temu): **Cloud Firestore — Enforced, 99% ruchu zweryfikowane**; Storage — Monitoring, 100%; Authentication — Monitoring, 73%; Functions — niewymuszane.
- 🛑 **Co upada**: oba twierdzenia pozycji #13 — „produkcja nie przechodzi atestacji" i „egzekwowanie jest wyłączone, więc nic to nie psuje". Produkcja przechodzi atestację dla 99% ruchu, a egzekwowanie dla Firestore działa **od dawna**. Obserwowany 403 dotyczy klientów, którym reCAPTCHA nie wystawia tokenu — czyli **narzędzi agenta**. To jest opis działającego App Checka, nie awarii.
- ⚖️ **Koszt tej pomyłki**: trzy dni pracy na fałszywej przesłance, ostrzeżenie „nie włączaj egzekwowania" w instrukcji dla właściciela (było już włączone) i chwilowe zdjęcie ochrony przy diagnostyce #16. **Obserwacja z jednego klienta nie jest stanem systemu** — a metryki po stronie dostawcy istniały przez cały czas.
- ✅ **Skutek pozytywny**: **pytanie prawnika 4.1 pkt 5 jest odpowiedziane** — po raz pierwszy mamy twarde dane o egzekwowaniu App Check per usługa, z dowodem. Wpisane do [[Projects/Zlecenia-wlasciciela]] #8 pkt 1; `legal` może zdjąć „do potwierdzenia przez właściciela" i wpisać stan faktyczny.
- ⏸ **Otwarta decyzja produktowa**: czy włączyć wymuszanie dla **Storage** (dziś Monitoring, 100% zweryfikowane) i **Functions**. Storage niesie okładki przewodników pokazywane gościom, więc wymaga weryfikacji na żywo po każdym kroku — osobne zadanie, nie przełącznik.

### CI, smoke produkcji i hooki — trzy siatki pod błędy, które już wystąpiły
- 🎯 **Powód**: pytanie właściciela „co jeszcze usprawnić". Odpowiedź wyprowadzona z awarii **tego tygodnia**, nie z listy dobrych praktyk: suita e2e miała 50 czerwonych i nikt tego nie widział; panel podatkowy zniknął na dwa miesiące, a testy to zgłaszały (ADR-013); test migracji zgnił po 6 dniach ([[Known-Issues]] #14); strony gościa okazały się niedostępne przy 133/133 na zielono (#16). Wspólny mianownik: **nikt nie uruchamiał tego, co miało ostrzegać**.
- ✅ **CI (`.github/workflows/ci.yml`)** — pierwszy przepływ w historii repozytorium (`.github` nie istniało). `lint` + `build` + pełna suita e2e na każdy push i PR do `main`, Node 22, artefakt z raportem przy porażce. Deklaracja „e2e N/N" przestaje starzeć się w dniu commita.
- ✅ **Smoke produkcji (`e2e-prod/` + `prod-smoke.yml`, co godzinę)** — osobna konfiguracja Playwrighta **bez mocków i bez dev servera**, celująca w żywy `wynajempro.com`. Pokrywa dokładnie tę lukę, przez którą #16 przeleżało nie wiadomo ile: landing, centrum pomocy z wejściem w artykuł, `/kontakt`, `/login`, `/prywatnosc`, przekierowanie ze starej domeny oraz **kontrola trybu service workera** (`sw.js` musi mieć `SKIP_WAITING` i nie mieć `clientsClaim` — powrót do `autoUpdate` cofnąłby ADR-014 po cichu). **8/8 na produkcji.** Alert to powiadomienie GitHuba o nieudanym przebiegu — świadomie bez dodatkowego dostawcy.
- 🛡️ **Kanarek #16 odwrócony** (`test.fail`, ten sam idiom co przy ukrytym pakiecie rocznym — #7): dopóki sesja gościa jest odbijana, test przechodzi i nie zasypuje nas czerwienią; gdy przestanie, Playwright zgłosi „spodziewano się porażki, a test przeszedł" i wymusi zdjęcie odwrócenia. Identyfikatora prawdziwego przewodnika **nie ma w repozytorium** — to on jest barierą dostępu do strony; zmyślone id wystarczy, bo przy działającej sesji daje inny komunikat.
- ✅ **Hooki (`.claude/hooks/`)**: ESLint na każdym zapisanym pliku `src/**` (wyjście 2 = uwagi wracają do agenta od razu, a nie przed commitem) oraz **twarda blokada `npm run deploy`** — to polecenie robi `firebase deploy` **bez `--only`**, czyli jednym ruchem wypycha hosting, reguły, functions i indeksy, omijając wszystkie bramki z N2/N3. Skill tego zakazywał, ale skill to tekst; teraz jest egzekwowanie. Oba przetestowane wstrzykniętym ładunkiem: lint łapie błąd i zwraca 2, blokada odrzuca `npm run deploy` i `npm run build && npm run deploy`, a przepuszcza `firebase deploy --only hosting:app`.
- 📌 **Uprawnienia**: 13 nowych reguł odczytu (`firebase functions:log`, `firestore:databases:get`, `git diff/log/show`, `npm run docs:docx`). Utrzymana wcześniejsza decyzja: `npx eslint *` **nie** wchodzi na listę (wildcard przepuszcza `--fix`) — dopisana wyłącznie forma dokładna.
- ⚖️ **Czego to nie łapie**: wszystkiego za logowaniem. Panel, migracja `guests`→`adults`, ekran usuwania konta — to zostaje smoke testem właściciela. Konta testowego na produkcji świadomie nie zakładamy.
- ✅ **Dependabot włączony** (`.github/dependabot.yml`, decyzja właściciela tego samego dnia): aplikacja i `functions/` co poniedziałek, akcje CI raz w miesiącu. Drobne podbicia **zgrupowane w jednym PR** (inaczej poniedziałek to dziesięć osobnych przeglądów tej samej zmiany), łatki bezpieczeństwa osobno. **Majory rdzenia wyłączone z automatu** — `firebase`, `react`, `react-dom`, `react-router-dom`, `firebase-admin`, `firebase-functions`: to biblioteki, na których stoi aplikacja i funkcje kasujące dane, więc taki PR ma powstawać decyzją człowieka. Sens ma dopiero teraz: bez CI nikt nie umiałby bezpiecznie zatwierdzić takiego PR-a.
- ⏸ **Jeden przełącznik zostaje właścicielowi**: GitHub → Settings → Code security → **Dependabot alerts** i **security updates**. Plik konfiguracyjny włącza aktualizacje *wersji*; alerty o nowo ogłoszonych podatnościach to osobne ustawienie repozytorium, a `gh` nie jest zainstalowany na tej maszynie.
- ✅ **Wypchnięte na GitHub** (`a5961de..5d62407`, 4 commity): oba przepływy i konfiguracja Dependabota są na zdalnym — potwierdzone `git ls-tree origin/main .github/`.

### 🛑 KOREKTA diagnozy #16 — to App Check, nie wyłączony dostawca „Anonymous"
- 🔎 **Jak wyszło**: przy budowie smoke'a produkcji ten sam adres sprawdzony **czystym Chromium** (Playwright) dał **inny błąd** niż rano przeglądarka wbudowana: `401 accounts:signUp` → **`auth/firebase-app-check-token-is-invalid`**, poprzedzone **403** przy wymianie tokenu App Check.
- 🔥 **Wniosek**: #16 i [[Known-Issues]] #13 to **jeden problem**. App Check jest **egzekwowany dla Authentication**, a klient nie umie zdobyć tokenu — czyli ten sam 403, który od 10.08 opisywaliśmy jako „przeszkodę przed włączeniem egzekwowania", **już dziś coś odcina**.
- 🛑 **Co odwołuję z porannego raportu**: zdanie „cała gościnna połowa produktu leży" było **za mocne wobec dowodów**. Obie moje przeglądarki są sterowane automatem, czyli dokładnie tym ruchem, który App Check ma odsiewać — niska ocena reCAPTCHA jest dla nich spodziewana. Nie mam pomiaru z prawdziwej przeglądarki człowieka i nie mogę go zrobić.
- ⏸ **Dlatego instrukcja dla właściciela zaczyna się teraz od KROKU 0**: otworzyć prawdziwy link do przewodnika na telefonie. 30 sekund, zero konsoli, a rozstrzyga między „pożar" a „dług". Dopiero potem konsola — i tam kolejność też się zmieniła: najpierw **wyłączyć egzekwowanie App Check dla Authentication** (natychmiast odblokowuje i kupuje czas), potem naprawiać reCAPTCHA (#13), a hipoteza „Anonymous/Enable create" spada na trzecie miejsce.
- 📌 **Skutek uboczny dla N6.4**: skoro dla Authentication egzekwowanie działa i odbija, to dołożenie go Firestore/Storage przy zepsutym tokenie **odcięłoby resztę aplikacji**. Ostrzeżenie w sekcji 1 instrukcji zyskało twardy dowód, nie domysł.
- ⚖️ **Lekcja metodologiczna**: dwa pomiary, dwa różne błędy, ta sama konkluzja „nie działa" — ale **inna przyczyna i inna naprawa**. Jedno narzędzie diagnostyczne to jedna perspektywa; przy awarii warto powtórzyć pomiar czymś innym, zanim nazwie się przyczynę.

### Zasada stała: dokument dla właściciela powstaje w `.md` i `.docx` naraz
- 🎯 **Powód**: po jednorazowej konwersji instrukcji właściciel podniósł to do reguły — „zawsze rób dwie wersje: `.md` dla Ciebie i agentów, `.docx` dla mnie".
- ✅ **Zapisane w trzech miejscach**, bo każde łapie inny moment: [[Team-Playbook]] → „Dokumenty dla właściciela" (pełna zasada z tabelą, komendami i granicami — czyta ją każdy agent zespołu), `CLAUDE.md` (skrót w instrukcjach projektu, ładuje się w każdej sesji), nagłówek `scripts/build-docx.mjs` (widzi go ten, kto dotknie generatora). Do tego wpis w pamięci głównego agenta.
- 🛡️ **Zakres celowo zawężony**: reguła dotyczy dokumentów pisanych **właścicielowi do czytania** (instrukcja, raport, analiza, podsumowanie, plan), a nie dokumentów roboczych zespołu — dziennik, backlog i notatki zostają w markdownie, bo nikt ich tak nie czyta. Inaczej `docs/docx/` zapełniłby się kopiami, których nikt nie otwiera, a przy każdej rozjechałoby się pytanie „która wersja jest aktualna".
- 📌 **Dwa warunki dopisane do zasady, żeby nie zgniła**: (1) generujesz **w tym samym zadaniu**, nie „następnym razem"; (2) **aktualizujesz dokument z listy → regenerujesz kopię**, bo nieaktualny `.docx` jest gorszy niż jego brak — właściciel czyta wtedy stary stan i nie ma jak tego zauważyć.

### Instrukcje właściciela mają drugą postać: `.docx` generowany z markdowna
- 🎯 **Powód**: właściciel czyta instrukcje, których nie edytuje — a markdown z tabelami, znacznikami i wikilinkami jest do czytania męczący. Prośba wprost: „zmień na docx".
- 🛡️ **Nie zamiana, tylko druga postać**: `.md` zostaje **źródłem prawdy**. Na nim stoi cały system — wikilinki vaulta, diffy w gicie, odesłania z [[Known-Issues]] i [[Activity-Log]], no i agenci czytają go bez konwersji. Zamiana plików na binarne `.docx` zabrałaby to wszystko naraz. Zamiast tego generator: `scripts/build-docx.mjs` + `npm run docs:docx`, plus nagłówek w obu dokumentach mówiący, gdzie się nanosi zmiany. Pierwsza strona każdego `.docx` powtarza to zdanie, żeby nikt nie poprawiał kopii.
- ✅ **Wygenerowane**: `docs/docx/Instrukcje-wlasciciela.docx` (23 kB) i `docs/docx/Zlecenia-wlasciciela.docx` (14 kB). Katalog w `.gitignore` — jak `dist`, bo to artefakt, nie źródło.
- ✅ **Obsługiwany podzbiór markdowna** dobrany pod te dokumenty: nagłówki, akapity z `**`/`*`/`` ` ``/linkami/wikilinkami, listy punktowane i numerowane z zagnieżdżeniem, listy zadań (`- [x]` → ☑), cytaty (u nas: ostrzeżenia), tabele, bloki kodu, linie oddzielające. Styl w tokenach identyfikacji v2 (ink/cynober/hairline), stopka z numeracją stron.
- 🔎 **Trzy usterki złapane dopiero na renderze**, nie w kodzie — podgląd `qlmanage` jako bramka: (1) **font Aptos podmieniał się na szeryfowy**, bo nie ma go na tym Macu → `Arial` + `Courier New`, ustawiane **na każdym fragmencie**, bo część czytników ignoruje domyślne style dokumentu; (2) **równe szerokości kolumn** łamały zdania w tabelach, gdzie sąsiednia kolumna ma dwa znaki → szerokość idzie za długością treści (pierwiastek jako tłumik, podłoga na wąskie kolumny); (3) **wikilink w pogrubieniu zostawał surowy** (`[[Projects/…]]`), a łamane linie punktów uciekały z listy jako osobne akapity → rekurencja w `**`/`*` i doklejanie wciętych kontynuacji do punktu.
- ⚖️ **Czego to nie robi**: wikilinki nie są w `.docx` klikalne (nie ma dokąd) — zostaje sama nazwa dokumentu kursywą; linki `http(s)` działają normalnie. Konwersja jest jednokierunkowa: zmiana w `.docx` przepada przy następnym `npm run docs:docx`.
- 📌 **Rozszerzanie**: lista `DOKUMENTY` w skrypcie; pojedynczy plik: `node scripts/build-docx.mjs docs/Projects/Roadmap.md`. Nowa zależność deweloperska: `docx` 9.7.1.

### Zadania właściciela przejęte przez agenta: kopie zapasowe (N6.3) i logi purge
- 🎯 **Powód**: właściciel zlecił przejęcie swojej części planu tygodnia. Okazało się, że dwie pozycje opisane w instrukcji jako „tylko Ty masz dostęp" **nie wymagają konsoli** — `firebase` CLI robi jedno i drugie.
- ✅ **N6.3 kopie zapasowe — WYKONANE**. Stan przed: PITR **wyłączone**, harmonogramów **zero**, `Version Retention Period` **3600 s**. Wykonane: `firestore:databases:update "(default)" --point-in-time-recovery ENABLED` oraz `firestore:backups:schedules:create --recurrence DAILY --retention 7d`. Weryfikacja **odczytem po zmianie**, nie samym „Successfully": `POINT_IN_TIME_RECOVERY_ENABLED`, retencja wersji **604800 s**, harmonogram `6f37fdce-77bc-4bbc-83a1-579b5cf6cdaf` DAILY / 604800 s. Decyzja zakresu należała do właściciela (wariant pełny: PITR + harmonogram) — obie rzeczy są płatne od rozmiaru danych.
- ⚖️ **Granica**: to **Firestore, nie Storage**. Pliki przewodników nadal nie mają siatki bezpieczeństwa — i dlatego bramką przy N6.5 zostaje DRY-RUN plus ludzki przegląd listy, a nie „w razie czego odtworzymy".
- ✅ **Logi nocnego purge — SPRAWDZONE** (`functions:log --only deleteExpiredAccountsData`): **14 przebiegów w oknie 31.07–13.08**, każdy zakończony, **zero** błędów i ostrzeżeń, w każdym „Konta canceled po karencji: 0" i „Porzucone triale: 0". Jedyna funkcja w projekcie, która sama kasuje dane klientów, chodzi od 22.07 i przez ostatnie dwa tygodnie **nie skasowała ani jednego rekordu**. To była dokładnie ta niepewność: czy coś po cichu nie znika.
- ✅ **Decyzja właściciela: polityka haseł** — **8 znaków + wymóg litery i cyfry** (odrzucone: 10 znaków ze znakiem specjalnym; odrzucone: zostawić domyślne 6). Dotyczy tylko nowych haseł. ⏸ Samo wprowadzenie zostaje w konsoli (Authentication → Settings) — CLI tego nie ustawia.
- 🔎 **Smoke test 4b rozstrzygnięty na danych, zanim ktokolwiek kliknął**: w rezerwacjach właściciela jest **dokładnie jedna** stara rezerwacja z samym `guests` i bez rozbicia — id `1784102958316` (`guests: 2`). Reszta wpisów albo ma pełne rozbicie (`adults/children/pets` — wpis z 25.07), albo nie ma liczby osób w ogóle. Kod migracji (`ManagerApp.jsx:341-345`) dla tego kształtu daje `adults = 2`, a zapis liczy `guests = 2` — pułapka z X17 **nie zadziała**. Odczyt maską pól (`guests/adults/children/pets/type`), więc bez dotykania danych osobowych gości. Właścicielowi zostaje jeden klik potwierdzający zamiast szukania „jakiejś starej rezerwacji".
- ⏸ **Czego agent nie ruszy** (i dlaczego): ① prawnik — cudzy zegar; ④ smoke testy — wszystko za logowaniem, a wpisywanie cudzych haseł jest poza zakresem; ⑤ App Check i #16 — konsola; ⑥ N6.5 — potrzebny świeży klucz serwisowy, którego nie ma na dysku (`gcloud` nie jest zainstalowany, brak ADC); ⑦ wprowadzenie polityki haseł — konsola.
- 📌 **Dokumenty**: [[Projects/Roadmap]] N6.3 ✅ i decyzja o hasłach w „Otwartych decyzjach"; [[Zlecenia-wlasciciela]] #8 pkt 2 odhaczony; [[Projects/Instrukcje-wlasciciela]] sekcje 2 i 5 oznaczone jako wykonane; `Bezpieczenstwo-kont-i-danych.md` — „Kopie zapasowe" przeniesione z §9 do §9.1, wiersz o hasłach zaktualizowany; **errata E8** w `Raport-dla-prawnika-2026-07-22.md` (pakiet jest u prawnika, więc dopisek zamiast przepisania) plus domknięcie **E2** po dzisiejszym deployu.

### DEPLOY `hosting:app` — poprawka RODO ekranów błędu + pasek „dostępna nowa wersja"
- 🎯 **Zakres**: druga paczka tego dnia, jedna decyzja właściciela („jeden deploy na obie poprawki"). Cztery pliki `src` z dwóch commitów: `GuestGuideView.jsx`, `ReviewPageView.jsx` (koniec „reszty luki" N6.1, `f442c42`), `App.jsx` + nowy `components/UpdatePrompt.jsx` i `vite.config.js` (#15, `79b95c7`).
- ✅ **Pre-flight**: `npm run lint` 0 (`--max-warnings 0`), build OK, **e2e 133/133** (przebieg 13.08 — deklaracja ważna na ten dzień).
- ✅ **Cel `hosting:app`**, świadomie bez reguł i functions: `git diff 7e94e08..HEAD` potwierdził **zero zmian** w `firestore.rules`, `storage.rules`, `functions/`, `firestore.indexes.json`, `firebase.json`. Deploy: **39 plików, 16 nowych, release OK**.
- ✅ **Weryfikacja live przez przeglądarkę** ([[Known-Issues]] #12): wyrejestrowanie starego SW i wyczyszczenie cache przed testem; `/`, `/kontakt`, `/pomoc`, `/dashboard`, `/prywatnosc` = **200**; 301 ze starej domeny **z zachowaniem ścieżki** (`moje-domki-6c77d.web.app/pomoc` → `wynajempro.com/pomoc`, `<h1>` „Centrum pomocy").
- ✅ **Poprawka RODO potwierdzona na produkcji**: `/opinie/<nieistniejące>` → „Nie znaleziono strony" **z przyciskiem „Ustawienia cookies"** i bez kredytu; klik otwiera baner ze statusem „zgoda udzielona"; „Wycofaj zgodę" → `cookie_consent` skasowane, `ga-disable-G-BZ0SJC201Z=true`, ciastka `_ga*` puste. `/guide/<nieistniejące>` → „Brak dostępu", jedyny przycisk na ekranie to „Ustawienia cookies". Luka „równej łatwości" zamknięta także na ślepych uliczkach.
- ✅ **Nowy tryb SW potwierdzony w serwowanym pliku**: `wynajempro.com/sw.js` ma nasłuch `SKIP_WAITING`, **nie ma** automatycznego `self.skipWaiting()` ani `clientsClaim` — czyli na produkcji leży wersja „prompt". ⚠️ Efektu jeszcze nikt nie zobaczy: użytkownicy z aktywnym **starym** SW dostali tę paczkę po staremu, pasek zadziała u nich dopiero przy **następnym** wydaniu.
- 🔴 **Przy okazji znalezione**: strony gościa nie działają na produkcji — osobny wpis wyżej i [[Known-Issues]] #16. Deploy tego nie spowodował i nie naprawia.
- ⏸ **Zostaje**: 6 commitów z dzisiejszej sesji niewypchniętych na GitHub (`git push` to decyzja właściciela) — wcześniejsze 11 z wpisu porannego jest już na zdalnym. App Check — patrz #16, obraz się zmienił.

### 🔴 Znalezione przy weryfikacji deployu: strony gościa nie działają na produkcji
- 🎯 **Jak wyszło**: krok „konsola bez błędów" ze skilla `deploy`. Sprawdzałem własną poprawkę na `/opinie/…` i `/guide/…`, a w konsoli siedziało `auth/admin-restricted-operation` — nie moje, nie z tej paczki.
- 🔥 **Skala**: `GuestGuideView` loguje gościa anonimowo **zanim** sięgnie po przewodnika (`GuestGuideView.jsx:31-51`). Skoro `signInAnonymously` odbija, kod nigdy nie dochodzi do Firestore — **każdy** link do przewodnika i każda strona opinii wysłana gościowi kończy się ekranem „Brak dostępu / Wystąpił błąd autoryzacji sesji". Cała gościnna połowa produktu jest niedostępna. Powtórzone w świeżej karcie, bez cache i bez service workera.
- 🔎 **Diagnostyka**: `POST identitytoolkit…/accounts:signUp` → **400**. To samo żądanie wysłane ręcznie **bez** tokenu App Check → **401 „Firebase App Check token is invalid"**. Wniosek podwójny: egzekwowanie App Check **dla Authentication jest włączone** (czego nie zakładał ani [[Known-Issues]] #13, ani N6.5/N6.4), a SDK aplikacji je **przechodzi** — odmowa zapada dopiero na polityce kont. `admin-restricted-operation` = zablokowane tworzenie kont: wyłączony dostawca „Anonymous" albo globalne „Prevent account creation".
- ⚠️ **Jeśli to drugie, nie działa też rejestracja nowych użytkowników.** Świadomie tego nie sprawdzałem — każda próba na produkcji to albo realne konto, albo śmieci w danych. To pytanie do konsoli.
- ⚖️ **Czego to NIE jest**: skutku deployu z dziś. Paczka nie tknęła `firebase.js`, warstwy auth ani reguł, a 400 przychodzi z serwera Google, nie z bundla. Kiedy się zaczęło — nie wiadomo; tej ścieżki nikt nie klikał na produkcji od czasu wdrożeń N5.
- ⚖️ **Czego nie złapie suita**: e2e mockuje Firebase, więc 133/133 świeci zielono niezależnie od stanu produkcji. Ten błąd był do zobaczenia wyłącznie w przeglądarce na żywo — dokładnie ta lekcja, którą skill `deploy` wynosi z 10.08.
- ⏸ **Do właściciela**: trzy pozycje do sprawdzenia w konsoli spisane w [[Known-Issues]] #16 (Anonymous, „Enable create (sign-up)", stan egzekwowania App Check dla Authentication). Po naprawie: otworzyć **prawdziwy** link do przewodnika, nie zmyślone id.

### Pasek „dostępna nowa wersja" — koniec cichej podmiany powłoki ([[Known-Issues]] #15)
- 🎯 **Powód**: przy `registerType:'autoUpdate'` nowy service worker instalował się w tle, ale przejmował stronę dopiero przy **kolejnym** wejściu. Po deployu użytkownik przez jakiś czas pracował na starym kodzie i **nikt go o tym nie informował** — zaobserwowane 10.08, gdy `curl` dostawał już nowy `index.html`, a przeglądarka serwowała stary.
- ✅ **Decyzja właściciela (13.08)**: komunikat zamiast automatu. `registerType: 'prompt'` + pasek `src/components/UpdatePrompt.jsx` z akcją „Odśwież". Odrzucone świadomie: `skipWaiting` z automatycznym przeładowaniem — potrafiłoby wypaść w środku wypełniania rezerwacji i skasować niezapisane dane. Odrzucone też „zostawiamy jak jest", bo problem jest realny i tani do naprawienia.
- ✅ **Wdrożone w kodzie** (`79b95c7`): pasek u **górnej** krawędzi — baner zgody (`.wpc`, dolna krawędź) i toasty (bottom-right) mają zajęty dół, a nakładanie się dwóch komunikatów naraz jest realnym scenariuszem (pierwsza wizyta zaraz po deployu). Namespace `.wpu` samowystarczalny, w tokenach marki, ikona lucide `RefreshCw` (zero emoji), `role="status"`, `aria-live="polite"`, animacja wyłączona przy `prefers-reduced-motion`, przycisk zamknięcia (pasek informuje, nie blokuje pracy). Do tego `registration.update()` co godzinę — bez tego długo otwarta karta panelu dowiaduje się o deployu dopiero przy odświeżeniu, czyli wtedy, gdy pasek przestaje być potrzebny.
- ✅ **Zweryfikowane na buildzie produkcyjnym, nie tylko w teście** (`vite preview`, nowa konfiguracja „Vite Preview (build produkcyjny)" w `.claude/launch.json`): karta **kontrolowana** przez stary SW + podłożony nowy build → SW wchodzi w stan `waiting`, pasek się pokazuje, a strona **nie przeładowuje się sama** (sonda `window.__probe` przeżywa). Klik „Odśwież" → sonda znika (nastąpił reload), `waiting` puste, a `index.html` z cache pochodzi z nowego buildu. To jest dokładnie ta różnica, o którą chodzi w #15.
- 🔎 **Pierwsze podejście do weryfikacji było fałszywie zielone** i warto to zapisać: przy **pierwszym** wejściu karta nie jest jeszcze kontrolowana przez SW (`navigator.serviceWorker.controller === null`), więc nowa wersja aktywuje się od razu, bez stanu `waiting` — pasek się pokazał, ale klik „Odśwież" nie miał czego pominąć i nic nie przeładował. Dopiero powtórka na **kontrolowanej** karcie testuje ten mechanizm naprawdę. Test PWA bez sprawdzenia `controller` mierzy co innego, niż się wydaje.
- ✅ **Regresja**: nowy `e2e/update-prompt.spec.js` **3/3** — pasek nie pokazuje się bez powodu, po wymuszeniu ma komunikat i akcję oraz daje się zamknąć, i nie zasłania banera zgody (asercja na współrzędne: dół paska nad górą banera + „Akceptuję" nadal klikalne). Suita **133/133** (przebieg 13.08), lint 0, build OK.
- 🛡️ **Szew testowy `wpu:show`**: w trybie deweloperskim service worker nie jest rejestrowany, więc `needRefresh` nigdy nie zapali się samo i paska nie da się ani zobaczyć, ani przetestować. Zdarzenie `wpu:show` pokazuje go na żądanie (ten sam idiom co `wpc:open`). W produkcji nieszkodliwe — najgorsze, co robi, to proponuje odświeżenie strony. Opisane w kodzie jako szew, żeby za pół roku nie wyglądało na przypadek.
- ⚖️ **Czego to NIE załatwia**: samo zachowanie service workera na produkcji potwierdzi się dopiero **po** deployu z tą zmianą — pierwszy deploy po niej użytkownicy z aktywnym starym SW dostaną jeszcze po staremu (starą powłokę podmienia stary mechanizm). Pasek zacznie działać dla nich od **kolejnego** wydania.
- ⏸ **Zostaje**: commit czeka na deploy razem z poprawką RODO (decyzja właściciela: jedna paczka). Na produkcji nadal stary mechanizm.
- 📌 **Dokumenty**: [[Known-Issues]] #15 zamknięte w części kodowej, [[Projects/Roadmap]] — tor `dev` tygodnia 11–17.08 odhaczony w całości.

### Wycofanie zgody na cookies działa też na ekranach błędu widoków gościa (koniec „reszty luki" N6.1)
- 🎯 **Powód**: ostatni otwarty fragment N6.1, zapisany przy przeglądzie 24.07 i od tamtej pory nietknięty. Baner zgody renderuje się globalnie (`App.jsx:162`), więc gość, który wszedł na **wygasły** link `/guide/:id` albo `/opinie/:id`, mógł na ekranie „Brak dostępu" / „Nie znaleziono strony" zgodę **wyrazić** — a wejście „Ustawienia cookies" siedziało wyłącznie przy kredycie „Stworzono za pomocą WynajemPRO", czyli w gałęzi z treścią. Ślepa uliczka: zgoda udzielona, wyjścia zero (RODO art. 7 ust. 3 — wycofanie „równie łatwe").
- ✅ **Wdrożone w kodzie** (`f442c42`): oba ekrany błędu (`GuestGuideView.jsx:160`, `ReviewPageView.jsx:69`) dostały przycisk „Ustawienia cookies" pod panelem — ten sam mechanizm zdarzenia `wpc:open` co w stopce landingu, na Polityce i przy kredycie. Kontener błędu przełączony na `flexDirection:'column'`, żeby przycisk usiadł pod panelem, a nie obok niego.
- 🛡️ **Bez kredytu, sam przycisk**: na ekranie „nie znaleziono" nie ma czego kredytować — „Stworzono za pomocą WynajemPRO" pod komunikatem o nieistniejącej stronie to zdanie o treści, której nie ma. Wyjście z cookies jest jedyną akcją, jaka na tym ekranie ma sens.
- ✅ **Regresja**: `e2e/cookie-consent.spec.js` **7/7** — dwa nowe testy (po jednym na widok) startują z **pustą bazą** w mocku, czyli realnie wchodzą w gałąź błędu, i asertują trzy rzeczy: nagłówek błędu jest, kredytu **nie ma**, a przycisk otwiera baner i wycofanie zdejmuje `cookie_consent` oraz zapala `ga-disable-*`. Pełna suita **130/130** (przebieg 13.08), lint 0, build OK.
- ✅ **Sprawdzone w przeglądarce**, nie tylko w teście: oba ekrany na dev serverze — `/opinie/…` i `/guide/…` z nieistniejącym id, klik otwiera baner z „Wycofaj zgodę", przycisk widoczny przy 375px, `body.scrollWidth` 375 (bez poziomego przewijania).
- ⏸ **Zostaje**: to jest **commit, nie deploy** — na produkcji luki jeszcze nie ma domkniętej. Wchodzi przy najbliższym `firebase deploy --only hosting:app`. Razem z tym commitem czeka teraz 12 commitów niewypchniętych na GitHub.
- 📌 **Dokumenty**: [[Projects/Roadmap]] N6.1 — pozycja „reszta luki" zamknięta w części kodowej; zostają tam dwie pozycje niezależne od tej zmiany (podstawa prawna cookies PKE art. 399/402 jako wsad dla prawnika, opcjonalna równowaga wizualna przycisków banera).
- ⚖️ **Czego to nie załatwia**: wszystkie pozostałe wejścia do banera pozostają bez zmian, a sam mechanizm zgody nie był ruszany — to domknięcie zasięgu, nie zmiana logiki.

### DEPLOY `hosting:app` — nawigacja mobilna, fix przewijania panelu, znacznik `?test=1`
- 🎯 **Zakres**: pierwszy deploy od 10.08. Paczka objęła **4 pliki `src`** z 11 commitów: `LandingPage.jsx` (nawigacja mobilna), `styles.js` (poziome przewijanie panelu), `taxCalculator.js` (usunięcie martwego kodu, ADR-013) oraz — **niezaplanowanie** — `ContactPage.jsx`.
- ⚠️ **Znacznik `/kontakt?test=1` czekał na deploy dwa dni.** Zmiana z 11.08 (`08f9961`) nigdy nie trafiła na produkcję; wyszło to przy ustalaniu zakresu (`git diff 69f05c3..HEAD`). Do dziś każde zgłoszenie testowe właściciela było na produkcji **nieodróżnialne** od prawdziwego — czyli mechanizm, który miał zapobiec powtórce z 10.08, nie działał tam, gdzie miał. Teraz działa: baner „Tryb testowy" potwierdzony na żywo.
- ✅ **Pre-flight**: lint 0, build OK, **e2e 128/128** (przebieg z 13.08 — deklaracja ważna na ten dzień).
- ✅ **Cel `hosting:app`**, świadomie bez reguł i functions: `git diff` potwierdził **zero zmian** w `firestore.rules`, `storage.rules`, `functions/`, `firestore.indexes.json` i `firebase.json`. Deploy: **39 plików, 23 nowe, release OK**.
- ✅ **Weryfikacja live przez przeglądarkę** (nie curlem — [[Known-Issues]] #12): twarde przeładowanie z aktualizacją service workera; `/`, `/kontakt`, `/pomoc`, `/dashboard` = **200**; **brak `Failed to fetch dynamically imported module`**, czyli objaw incydentu z 10.08 nie występuje; 301 ze starej domeny **z zachowaniem ścieżki** (`moje-domki-6c77d.web.app/pomoc` → `wynajempro.com/pomoc`).
- ✅ **Nawigacja mobilna przetestowana NA PRODUKCJI**, nie tylko lokalnie: przycisk widoczny, `.wp4-nav` ukryta, panel z 10 pozycjami, `aria-expanded=true`, blokada tła aktywna, `scrollWidth` 375, Escape zamyka i **oddaje fokus przyciskowi**.
- ✅ **Fix panelu potwierdzony bez sesji** metodą z 10.08: chunk `ManagerApp-CEDslQSv.js` pobrany z produkcji jest **bajt w bajt** identyczny z lokalnym buildem (267 292 B, ten sam SHA-256), a reguła `.wpd-seg{ … min-width:0; max-width:100%; overflow-x:auto; }` jest w nim obecna. Tak samo `LandingPage-BRTYVL8O.js`.
- 📌 **`npm run help:build` pominięty świadomie**: artykuły w `docs/support/` opisują menu **panelu**, nie landingu — zmiana ich nie dotyka.
- ⏸ **Zostaje**: 11 commitów niewypchniętych na GitHub (`git push` to decyzja właściciela). Konsola produkcji nadal zwraca **App Check 403** — stan znany i nieszkodliwy dopóki egzekwowanie jest wyłączone ([[Known-Issues]] #13); **nie włączać** bez naprawy.

---

## 2026-08-12

### Nawigacja mobilna landingu (≤900px)
- 🎯 **Powód**: luka wykryta przy naprawie e2e — poniżej 900px `.wp4-nav` znikała i **nic jej nie zastępowało**. Z nagłówka zostawało logo i CTA, a do Cennika, FAQ czy Bazy wiedzy trzeba było scrollować do stopki. Poniżej 560px chował się dodatkowo tekstowy „Zaloguj się", więc na małym telefonie nie było z nagłówka drogi do logowania.
- ✅ **Wdrożone** (`19eef00`): przycisk 40×40 (lucide `Menu`/`X`, ten sam idiom co ikony panelu) pojawia się dokładnie tam, gdzie znika nawigacja desktopowa. Panel rozwija się pod topbarem: 8 pozycji (sekcje landingu + [[support/README|Centrum pomocy]] i Kontakt, których nie było nawet w nawigacji desktopowej) plus stopka z „Zaloguj się" i „Wypróbuj za darmo".
- ✅ **Dostępność**: `aria-expanded` / `aria-controls`, fokus wchodzi do panelu przy otwarciu i **wraca na przycisk** po Escape, kurtyna zamyka kliknięciem, animacja wyłączona przy `prefers-reduced-motion`.
- 🛑 **Dwa błędy złapane dopiero w przeglądarce, nie w kodzie** — oba naprawione przed commitem:
  1. **Kurtyna musi leżeć poza `<header>`**: `.wp4-topbar` ma `backdrop-filter`, który tworzy blok zawierający dla `position:fixed`. Wewnątrz nagłówka kurtyna pozycjonowałaby się względem niego, a nie względem okna.
  2. **Blokada przewijania tła zostawała zamrożona na desktopie.** Inline `overflow:hidden` przeżywał przejście przez breakpoint, gdy zmiana viewportu nie wygenerowała zdarzenia (`resize` ani `matchMedia`) — strona stawała się nieprzewijalna. Przeniesione na klasę `body.wp4-lock` z regułą w **tym samym media query co panel**, więc powyżej 900px przestaje obowiązywać sama z siebie. Do tego pas bezpieczeństwa `@media (min-width:901px)` ukrywa panel i kurtynę niezależnie od stanu Reacta.
- 📌 **Wniosek**: obu tych błędów nie dało się zobaczyć w kodzie ani w e2e — wyszły z ręcznego sprawdzenia zachowania przy zmianie szerokości okna. Weryfikacja przez przeglądarkę na trzech szerokościach (375/768/1280) była tu bramką, nie formalnością.
- ✅ **Testy**: dwa testy `ui-scaling` opisywały dotąd **brak** menu (stan zapisany 12.08 jako świadomy) — przepisane na jego zachowanie. Obu dołożono `setupFirebaseMocks`: baner cookies jest `fixed` przy dolnej krawędzi i na ekranie 667px przechwytywał kliki w pozycje panelu. To **trzeci raz** tego dnia, gdy baner zgody okazał się przyczyną „niedziałającego" kliku.
- ✅ **Weryfikacja**: e2e **128/128**, lint 0, build OK.

### Suita e2e w całości zielona: 50 czerwonych → 0 (128/128)
- 🎯 **Powód**: pierwszy pełny przebieg od miesięcy dał **50 czerwonych ze 133**. Przyczyna nie leżała w testach — przebudowy V2 i X4 zmieniły treść i strukturę UI, a suity nigdy nie puszczano w całości. Przy X4 w tym dzienniku stoi „e2e 30/30" i „e2e zaufany zielony": trzydzieści ze stu trzydziestu trzech.
- ✅ **44 naprawione, 5 usuniętych, 1 odwrócony** (`aa232a8`). Dryf treści: „Zaakceptuj regulamin, aby odkryć" → „Dane dostępowe zablokowane", „Aktywuj subskrypcję i odzyskaj dane" → „Aktywuj i odzyskaj dane", `29.99` → `29,99` (polski przecinek), spinner `svg.lucide-loader-circle` → `span.wpb-spin`.
- 🔎 **Nie wszystko było selektorem.** Mocki przewodnika podawały `settings/hostProfile`, a widok czyta `settings/publicContact` od zmiany RODO-UI — dane testowe zostały przy modelu sprzed N5. Osobno: **trzecie wystąpienie** błędu z typograficznym wielokropkiem (po `ical_token` i placeholderze obiektu) — tym razem w „Ładowanie przewodnika…".
- 🛡️ **Jeden test ODWRÓCONY zamiast usunięty**: trzy testy sprawdzały pakiet roczny i przełącznik interwału. Oba są ukryte świadomie ([[Known-Issues]] #7 — backend ma jeden Price ID, klik „roczny" pobrałby opłatę miesięczną). Asercje pilnują teraz, że **nie wróciły**; gdyby ktoś przywrócił kartę bez drugiego Price ID, test złapie błąd rozliczeniowy przed klientem.
- 🔴 **Odkrycie: panel podatkowy wypadł z produktu i nikt tego nie zauważył.** `41383e7` (8.06) dodał `TaxSummaryPanel` (319 linii), `fb8a00e` przeniósł go do `_legacy/` i produkcyjny panel v2 nie dostał zastępnika. `taxCalculator.js` eksportował 4 funkcje, z czego **3 nie wołał żaden komponent** — przy życiu trzymał je import w teście. Decyzja właściciela: nie wraca → [[Decisions]] ADR-013. Usunięte 246 linii (462 → 166). ⚖️ Próg 100 000 zł **żyje dalej** w `calculateTaxes()`, więc obietnica z landingu pozostaje prawdziwa.
- 🛑 **Realny błąd UI znaleziony przy okazji, naprawiony** (`b7ed3ba`): panel przewijał się w poziomie na telefonie. Sonda Playwright (element po elemencie, prawa krawędź vs viewport) wskazała winowajcę — pasek filtrów `.wpd-seg` miał 437px przy ekranie 375px i rozpychał `body.scrollWidth` do 474. Tabela była niewinna: ma 788px, ale siedzi w `<div overflowX:auto>`. Fix to ten sam idiom, którego `.wpd-tabs` używa od X4: `min-width:0` + `overflow-x:auto`. **474 → 375.**
- ✅ **Ostatnie 6 domknięte** (`8e56f1e`) — każdy z inną przyczyną, żadna nie była selektorem: nawigacja panelu poniżej 980px przenosi się do `.wpd-bottombar` (testy klikały ukryty pasek boczny); **baner cookies przechwytywał klik w stopkę**, bo testy `ui-scaling` nie wołały `setupFirebaseMocks`; przycisk dodawania jest na telefonie ikonowy; eksport CSV przeniósł się przy X4 do Finanse → Raporty i jest `disabled` przy pustych danych; **rejestracja ma wymagany checkbox regulaminu**, którego test nie zaznaczał (input poza kanwą → `dispatchEvent`).
- 📌 **Wynik**: **128/128, exit 0, 1.4 min** (było 6.4 min — timeouty zjadały pięć minut). Lint 0, build OK.
- ⚖️ **Wniosek metodologiczny**: „e2e zielony" bez pełnego przebiegu nie jest dowodem. Przez dwa miesiące zniknęła funkcja, a suita to zgłaszała — tylko nikt jej nie uruchamiał. Zapisane w ADR-013 jako część decyzji.
- ⏸ **Do decyzji przed launchem**: landing **nie ma nawigacji mobilnej** — poniżej breakpointu `.wp4-nav` znika, hamburgera nie ma (zero wystąpień), a poniżej 560px chowa się też link „Zaloguj się". Z nagłówka zostaje logo i CTA „Wypróbuj". Test opisuje ten stan jako świadomy z adnotacją, że przy dodaniu menu trzeba go przepisać.

### Skille projektu, uprawnienia i porządek w repo
- 🎯 **Powód**: procedury zespołu żyły wyłącznie w dokumentach, które agent musiał *pamiętać*, żeby otworzyć. Lekcja z 10.08 („curl nie weryfikuje deployu PWA") wisiała w jednym akapicie dziennika i przy następnym deployu nikt by jej nie przeczytał.
- ✅ **Cztery skille w `.claude/skills/`** (`726e2a1`), ładują się same albo przez `/nazwa`: **deploy** (rytuał wydania + weryfikacja live przez przeglądarkę), **dziennik** (konwencja tego pliku, errata, synchronizacja Roadmapy), **reguly** (zmiana reguł bez emulatora — lustrzany tester, bramka deployu), **zgloszenie** (odsiew po `source`, poziomy 1–3, `taxIdentifier`).
- 🛑 **Pułapka znaleziona przy pisaniu skilla deploy**: `npm run deploy` w `package.json` to `vite build && firebase deploy` **bez `--only`** — jednym ruchem wypycha hosting, reguły, functions i indeksy naraz, omijając wszystkie bramki opisane przy N2 i N3. Skill tego zakazuje wprost; sam skrypt zostaje bez zmian (usunięcie go to osobna decyzja).
- ✅ **Uprawnienia**: 19 reguł odczytu w `.claude/settings.json`, wyprowadzonych z 3916 wywołań narzędzi w transkryptach. Świadomie odrzucone mimo wysokiej częstotliwości: `curl` (93 użycia — potrafi POST-ować), `npx eslint *` (64 — wildcard przepuszcza `--fix`), `node -e` i `npx *` (dowolne wykonanie kodu).
- ✅ **Repo odchudzone o 785 MB**: trzy worktree z 3 i 21 lipca, wszystkie scalone w main. Sprawdzone plik po pliku przed usunięciem — 19 z 20 „nieśledzonych" plików `unruffled` istnieje dziś w main, dwudziesty to `__CostsPreview.jsx` z komentarzem „TYMCZASOWY — DO USUNIĘCIA po weryfikacji". Łatki i tak zarchiwizowane na Pulpicie (`WynajemPRO-worktree-backup-2026-08-12`). `.claude`: 707 MB → 80 KB.
- ✅ **`.agents/` i `.codex/` usunięte** (decyzja właściciela — Codex nie jest używany): 78 MB, w tym 1586 skilli z hurtowej instalacji, których Claude i tak nigdy nie czytał (czyta `.claude/skills/` i `~/.claude/skills/`, nie `.agents/`). ⚠️ Obok skilli leżało 604 KB artefaktów z przebiegu wieloagentowego z **17.06** — to on wyprodukował suitę e2e i audyt (`ORIGINAL_REQUEST.md`, briefingi, raporty 27 agentów). Wynik tamtej pracy jest w repo (`e2e/*.spec.js`), notatki robocze nie były — dlatego trafiły do kopii na Pulcie, a nie do kosza. Lint po usunięciu: exit 0. Wpisy `.agents` w `.gitignore` i w `globalIgnores` ESLinta zostawione jako nieszkodliwe.
- ✅ **Dokumenty**: usunięty **pusty** `docs/Tech Stack.md`, na który wskazywał wikilink z [[Home]] — treść od zawsze była w [[Tech-Stack]]. Wersje w [[Tech-Stack]] doprowadzone do `package.json` (twierdził React 18+, jest 19.2). Kontrola całego vaulta: **261 wikilinków, zero zepsutych**.
- ✅ **Naprawiony test**: `ical_token.spec.js` dopasowywał placeholder po trzech kropkach, a pole ma typograficzny wielokropek „…" (U+2026). Dopasowanie prefiksem — `1/1`, lint czysty (`2a549a9`). To ten sam kształt błędu co zgniły `panel-v2` z 10.08: selektor rozjeżdża się z UI bez żadnego sygnału.
- ⚠️ **Zostaje do zrobienia ręcznie**: `.claude/settings.local.json` ma 32 martwe jednorazówki (konkretne treści commitów, wywołania z `~/Downloads`, instalatory). Zapis do tego pliku jest agentowi zablokowany przez harness — czyszczenie należy do właściciela.
- ⚖️ **Czego to nie załatwia**: skille opisują procedury, ale ich nie egzekwują. Nie ma CI (brak `.github`) ani żadnych hooków — po usunięciu `.codex/` w repo nie został ani jeden. Suita e2e ma **52 zastane awarie** ze 132 testów i to zostaje osobnym zadaniem; daty na sztywno wciąż siedzą w `ui-scaling.spec.js` (gnije po 25.12) i `costs-tasks.spec.js`.

---

## 2026-08-11

### Znacznik zgłoszeń testowych w formularzu `/kontakt`
- 🎯 **Powód**: zgłoszenie testowe z 10.08 było nieodróżnialne od prawdziwej awarii i uruchomiło pełną diagnostykę błędu, którego nie było ([[Known-Issues]] #12).
- ✅ **Mechanizm**: `/kontakt?test=1` zapisuje `source: 'kontakt-test'` zamiast `'kontakt'`. Widoczny baner potwierdza tryb — bez niego nie wiadomo, czy parametr zadziałał, a cała wartość znacznika polega na pewności, że się zapisał.
- ✅ **Zero zmian w `firestore.rules`**: reguły `contact_messages` dopuszczają dokładnie cztery klucze (`hasOnly`), a `source` jest wśród nich (opcjonalny string ≤50). Nowe pole wymagałoby zmiany reguł i osobnego deployu — świadomie ominięte, bo zmiana reguł to zawsze ryzyko po stronie bezpieczeństwa.
- 🛡️ **Decyzja projektowa — parametr URL, NIE widoczny checkbox**: formularz jest klientowski. Checkbox „to jest test" zaśmiecałby go wszystkim i dałoby się go kliknąć przypadkiem — a wtedy **prawdziwe** zgłoszenie zostałoby oznaczone jako test i zignorowane. To gorszy błąd niż ten, który naprawiamy. Parametr wymaga świadomego działania i jest niewidoczny dla klientów.
- ✅ **Fail-safe**: nierozpoznana wartość (`?test=xyz`) daje zwykły `kontakt`. Inaczej przypadkowy albo podrobiony link wyciszałby prawdziwe zgłoszenia.
- ✅ **Regresja**: nowy `e2e/contact-form.spec.js` — 4 testy, celujące w POLE `source` w zapisanym dokumencie, nie w sam baner (baner to kosmetyka, wartość diagnostyczną ma to, co trafia do Firestore). 4/4.
- 📌 **Strona odczytu**: proces supportu §3 dostał tabelę odsiewu — sprawdzenie `source` jest **pierwszym** krokiem odczytu. Sam znacznik bez tego nie zmienia niczego.
- ⚖️ **Czego znacznik NIE zastępuje** (§7): agent pyta o potwierdzenie, zanim uruchomi pełną diagnostykę, jeśli zgłoszenie opisuje awarię bez żadnego śladu w danych. Nieobecność danych nie jest dowodem awarii.

---

## 2026-08-10

### Pierwsze zgłoszenie z kanału `/kontakt` — TEST kanału, nie awaria

> ⚠️ **ERRATA 2026-08-11.** Właściciel potwierdził, że zgłoszenie z 10.08 **było testowe** —
> wysłał je, żeby sprawdzić, czy kanał działa, a treść („nie działa dodawanie rezerwacji")
> była wypełniaczem. **Awaria dodawania rezerwacji nigdy nie wystąpiła.** Poniższe punkty
> zostają w pierwotnym brzmieniu (konwencja pliku), ale czytaj je z tą poprawką: diagnostyka
> była pościgiem za nieistniejącym błędem. Co z tego przeżywa: kanał zgłoszeń działa (to było
> testowane i wyszło pozytywnie), a trzy ustalenia uboczne — debugowy handler, App Check 403,
> zgniły test — są realne i zweryfikowane niezależnie. Upada wyłącznie hipoteza o przyczynie
> awarii, w tym „poszlaka" o braku dokumentu w `rentals` (to był brak próby, nie ślad błędu).
> Szczegóły i wnioski: [[Known-Issues]] #12.

- ✅ **Kanał zgłoszeń DZIAŁA**: w `contact_messages` jest wiadomość z 13:45 o poprawnym kształcie. To **rozstrzyga wątpliwość z §7** [[support/Proces-obslugi-zgloszen]] — wariant (b), czyli cichy zapis w próżnię przy komunikacie o sukcesie (nawrót Known-Issues #6), jest **wykluczony**. Kolekcji wcześniej nie było, bo po prostu nikt nie pisał.
- 🔎 **Diagnostyka zgłoszenia — wszystko, co weryfikowalne, jest czyste**: konto (`emailVerified: true`, `status: 'active'` → obie bramki przechodzą); reguły (allowlista `isValidRental` ma `adults`/`children`/`pets`); kod zapisu (e2e „Dodanie rezerwacji" przechodzi — bez sentineli i pustych kwot); deploy (26/26 chunków HTTP 200, `ManagerApp-Df2hXFSw.js` **bajt w bajt** identyczny z lokalnym buildem); dane (rezerwacja z pełnym rozbiciem `2+2+1` istnieje w bazie od 25.07 — ścieżka zapisu na produkcji już raz zadziałała).
- ⚠️ **Błąd jest jednak realny**: w `users/{uid}/rentals` **nie powstał żaden dokument z 10.08** — ostatni jest z 25.07. Zgłoszenie nie jest pomyłką użytkownika.
- 🛑 **Znaleziony wzmacniacz objawu, usunięty**: `index.html` niósł globalny `window.onerror` + `onunhandledrejection`, które podmieniały `document.body` na czerwony ekran „Błąd JS!" ze stack tracem. Wszedł commitem `b4aeb4e` (29.06, „**easier V4 testing**") i **przeżył 6 tygodni na produkcji**; bypass weryfikacji e-mail z tego samego commita posprzątano przy N1, tego handlera nie. Każdy błąd JS — także w obcym skrypcie czy rozszerzeniu przeglądarki — kasował działającą stronę. To jest „strona wywala błąd" ze zgłoszenia. Błędy renderu i tak łapie `GlobalErrorBoundary` (markowy ekran + czyszczenie cache PWA), więc handler nie wnosił nic poza szkodą. Zamiast niego komentarz-ostrzeżenie w `index.html`, żeby nie wrócił.
- ✅ **Weryfikacja naprawy w przeglądarce (nie na słowo)**: wystrzelony nieobsłużony `throw` **i** odrzucony promise — strona **żyje** (`root` ma dzieci, brak czerwonego ekranu), a oba błędy trafiają do konsoli z pełnym stack tracem. Diagnostyka zachowana, destrukcja usunięta.
- ⏳ **Sprawa NIEDOMKNIĘTA**: przyczyna błędu wciąż nieznana. Bez sesji zalogowanej na produkcji nie da się jej odtworzyć (kanał MCP jest wyłącznie do odczytu). Po usunięciu handlera kolejna próba zostawi błąd w konsoli zamiast kasować stronę → [[Known-Issues]] #12.
- 🔴 **Odkrycie uboczne, blokujące zadanie właściciela**: produkcja zwraca `AppCheck: 403 error` (dobowy throttle). Dziś nieszkodliwe, bo egzekwowanie jest wyłączone — ale zadanie 1 z [[Projects/Instrukcje-wlasciciela]] każe je **włączyć**, co w tym stanie **odcięłoby całą aplikację od Firestore**. Instrukcja **skorygowana** (twierdziła, na podstawie X13 sprzed zmiany domeny 22.07, że produkcja atestację przechodzi): najpierw naprawa 403, potem egzekwowanie → [[Known-Issues]] #13.
- ✅ **Naprawiony zgniły test**: `panel-v2.spec.js` „Edycja starej rezerwacji" miał daty wpisane na sztywno (01–05.08); po 10.08 fixture wpadł do „Archiwum" (filtr `upcoming` = `endDate >= dziś`) i test przestał znajdować „Edytuj". To **jedyny** test pilnujący migracji `guests`→`adults`, bez której zapis starej rezerwacji zeruje liczbę osób — od 31.07 nie chronił niczego, bez żadnego sygnału. Daty liczone teraz względem dnia uruchomienia; `panel-v2` 7/7 → [[Known-Issues]] #14.
- ✅ **DEPLOY `hosting:app`** (39 plików, release OK) — commit `69f05c3`. Weryfikacja live: `index.html` na produkcji bez kodu handlera, z komentarzem-ostrzeżeniem; `/`, `/kontakt`, `/pomoc` = 200; 301 ze starej domeny z zachowaniem ścieżki. Test rozstrzygający **na żywej produkcji**: wystrzelony `throw` + odrzucony promise → strona żyje, brak czerwonego ekranu.
- 🔥 **ODKRYCIE PRZY WERYFIKACJI — hipoteza wiodąca dla zgłoszenia**: `curl` dostawał już czysty `index.html`, ale **przeglądarka z aktywnym service workerem serwowała STARY** — czerwony ekran wystąpił na produkcji **po** deployu, zniknął dopiero po przeładowaniu. To normalne dla `registerType: 'autoUpdate'`, ale tłumaczy zgłoszenie: deploy bloku A poszedł **10:59**, zgłoszenie przyszło **11:45**, więc właściciel pracował na **powłoce sprzed 16 dni**, gdy na serwerze leżały już chunki o nowych hashach. Gdy nowy SW czyści stary precache, leniwy `import()` `ManagerApp` prosi o **stary hash** → 404 → odrzucony promise → czerwony ekran. Jako jedyna hipoteza tłumaczy komplet faktów: ten sam kod działał 25.07, jest bajt w bajt na produkcji, a mimo to 10.08 nie powstał żaden dokument. **Niedowiedzione** (brak sesji właściciela) → [[Known-Issues]] #12.
- 📌 **Wniosek metodologiczny**: deklaracja „e2e N/N" w commicie jest prawdziwa **wyłącznie w dniu commita**. Drugi, świeższy: **`curl` nie weryfikuje deployu aplikacji PWA** — sprawdza serwer, nie to, co widzi użytkownik z service workerem. Weryfikacja live musi iść przez przeglądarkę. Pełny przebieg suity pokazał też **52 zastane awarie** (guest-guide, stripe, ui-scaling, links-buttons) — sprawdzone kontrolnie na `git stash`, że są niezależne od dzisiejszych zmian; wymagają osobnego przeglądu.

### Support: odczyt zgłoszeń przez Firebase MCP + diagnostyka konta po UID (zlecenie właściciela)
- 🔎 **Research**: oficjalny serwer Firebase MCP jest częścią `firebase-tools` (mamy 15.18.0 — zero nowych zależności), po GA z października 2025 komenda to `firebase mcp`. **Ustalenie krytyczne: nie ma trybu tylko-do-odczytu** — domyślnie wystawia 36 narzędzi, z czego 15 pisze lub kasuje, w tym `firestore_delete_database` i `firebase_deploy`. Popularna rada „ogranicz przez `--only firestore`" **nie wystarcza**: grupa `core` z tymi narzędziami i tak się dociąga (sprawdzone sondą, nie założone).
- ✅ **Wdrożenie z zawężeniem u źródła**: `--tools` z jawną listą **pięciu narzędzi odczytu** — destrukcyjne nie istnieją w sesji, zamiast być blokowane pytaniem o zgodę. Druga warstwa: lista `deny` w `.claude/settings.json` na wypadek przyszłego rozszerzenia. Poświadczenia = zalogowany Firebase CLI, **zero kluczy serwisowych**. Zweryfikowane sondą JSON-RPC PRZED zapisaniem konfiguracji: handshake OK (firebase 0.3.0), zawężenie do 5 narzędzi potwierdzone, realne wywołanie zwraca dane.
- 🔍 **Fundament, na którym to stoi**: `contact_messages` ma `allow read, update, delete: if false` — zgłoszeń nie odczyta ŻADEN klient. Działa wyłącznie ścieżka administracyjna, bo reguły nie obowiązują dostępu przez IAM.
- ⚠️ **ODKRYCIE**: baza ma kolekcje `artifacts`, `guides`, `users` — **`contact_messages` NIE ISTNIEJE**. Firestore nie tworzy pustych kolekcji, więc albo nikt nie napisał od naprawy formularza (2026-07-16), albo zapis cicho nie działa mimo komunikatu o sukcesie (nawrót Known-Issues #6). Podejrzany nr 1 przy wariancie drugim: egzekwowanie App Check przy zapisie z nieatestowanej sesji anonimowej. Rozstrzyga testowa wiadomość przez formularz — zadanie właściciela.
- ⚖️ **Warstwa prawna (decyzja właściciela: „dopisz Anthropic")** — sednem okazało się rozróżnienie **dwóch reżimów**: konto/subskrypcja/ustawienia to dane Gospodarza (Operator = administrator, wystarczy Polityka §5), ale rezerwacje i podpisy gości to **dane powierzone** (Operator = procesor, administrator = Gospodarz) → Anthropic wchodzi na listę **DPA §7**, wobec której Gospodarzowi przysługuje **prawo sprzeciwu**. Dlatego zakres wobec danych powierzonych opisano jako **warunkowy**, a diagnostykę stopniowano (art. 5 ust. 1 lit. c) — to jedyny powód, dla którego takie zawężenie da się w DPA obronić. Wprowadzone **przed launchem** świadomie: po launchu ta sama zmiana uruchamia obowiązek powiadomienia każdego Gospodarza (DPA §7 ust. 2).
- 🛑 **Złapany własny błąd**: pierwsza wersja wpisu do Polityki deklarowała „zalecenie niepodawania zbędnych danych wyświetlane przy formularzu" — **czego w kodzie nie było**. Zdanie poprawione na stan faktyczny, a samo zalecenie faktycznie dopisane do klauzuli F5, bo **art. 13 ust. 1 lit. e wymaga informacji o kategoriach odbiorców JUŻ PRZY ZBIERANIU** — odesłanie do §5 Polityki nie wystarcza. Dokładnie ten rodzaj rozjazdu, przed którym broni się ten projekt.
- ✅ **Errata**: nowa pozycja **E7** (subprocesor + 3 pytania: czy subprocesor danych powierzonych, czy art. 6 ust. 1 lit. f obejmuje takiego dostawcę, czy potrzebny LIA/DPIA). Przy okazji **zaktualizowane E2 i E6** — obie mówiły prawnikowi „przygotowane, ale NIEWDROŻONE", a od deployu z tego dnia są na produkcji; zostawienie ich wprowadzałoby go w błąd. Konwencja zachowana: pierwotnych sformułowań nie usunięto.
- ✅ **DEPLOY `hosting:app`** (klauzula przy formularzu). Weryfikacja live: chunk `ContactPage-BCA8ud2i.js` HTTP 200 i zawiera oba nowe zdania; `/kontakt` 200; regresja bez zmian (wejście do zgód u gości 200, `x-robots-tag` na `/guide/*`, 301 ze starej domeny z zachowaniem ścieżki).
- 📌 **Granica kanału**: wyłącznie odczyt — agent diagnozuje, wskazuje pole i wartość, proponuje poprawkę, ale **nie naprawia danych na produkcji**. Celowo: support to najgorszy moment na przypadkowy zapis do bazy.
- ⏸ **Braki, których MCP nie rozwiązuje** (powiadomienie o zgłoszeniu, status „obsłużone", ślad odpowiedzi) → [[Projects/Backlog]]; promocja do Roadmapy = decyzja właściciela.

### Odmrożenie po 15 dniach przerwy — push + deploy zaległej pracy (blok A)
- 🔍 **Stan zastany**: `main` **5 commitów przed `origin/main`** (praca z 24–25.07 nigdy nie wypchnięta na GitHub — 15 dni bez zdalnej kopii), a dwa commity z kodem produkcyjnym (`0660c1e`, `42472af`) nigdy nie trafiły na produkcję. Dziennik urywał się na 22.07, mimo że Roadmapa opisywała pracę do 25.07 — **plany i historia rozjechały się w drugą stronę niż zwykle** (tym razem to log był w tyle).
- ✅ **Push**: `cf2b915..42472af` na `origin/main`.
- ✅ **Kontrola przed deployem**: lint 0; `npm run help:build` **bez różnicy** wobec zacommitowanego `src/data/helpArticles.js` (generowana baza pomocy zgodna — sprawdzone, nie założone); build OK (PWA 32 wpisy).
- ⚠️ **Odkrycie przy deployu reguł**: `firebase deploy --only firestore:rules` zwrócił „latest version already up to date, skipping upload" — **reguły X17 były już wydane na produkcji**, a front nigdy za nimi nie poszedł. Bezpieczna strona rozjazdu (reguły są nadzbiorem starych, więc nic nie mogło oblać walidacji), ale przez 16 dni backend przyjmował pola, których panel nie miał. Wniosek na przyszłość: „reguły przed hostingiem" chroni przed awarią tylko wtedy, gdy **druga połowa deployu naprawdę następuje** — półwdrożenie jest ciche.
- ✅ **Deploy `hosting:app`** (39 plików, release OK). Weryfikacja live, nie na słowo CLI: `wynajempro.com` HTTP 200 i serwuje nowy `index-BwuxOfeE.js`; 301 ze starej domeny z zachowaniem ścieżki (`/pomoc`) działa; `x-robots-tag: noindex, nofollow` obecny na `/guide/*` i **nieobecny** na landingu; w serwowanym chunku `GuestGuideView` potwierdzone „Ustawienia cookies" + `wpc:open`, w `ManagerApp` pola „Dorośli/Dzieci/Zwierzęta".
- ✅ **Domknięte tym deployem**: luka N6.1 u gości (art. 7 ust. 3 — goście `/guide` i `/opinie` mogli zgodę wyrazić, ale nie wycofać) oraz **X17** (rozbicie liczby gości).
- ⏸ **Zostaje po stronie właściciela**: instrukcje krok po kroku w [[Projects/Instrukcje-wlasciciela]] (App Check, kopie zapasowe, N6.5, zaległe smoke testy, logi purge, ponaglenie prawnika).

---

## 2026-07-25

### X17 — rozbicie liczby gości na dorosłych, dzieci i zwierzęta (zlecenie właściciela)
- 🎯 Powód z życia: rodzina 2+2 z psem — dotąd dało się wpisać wyłącznie łączne „4".
- ✅ **Model**: trzy nowe **opcjonalne** pola liczbowe `adults`/`children`/`pets`; `guests` **zostaje** jako pole wyliczane (dorośli + dzieci) — na nim stoją istniejące rezerwacje i widok szczegółów. Zwierzęta nie są osobami i do sumy nie wchodzą. Jedno źródło prawdy sumy: `src/utils/guestCount.js`, używane i przez podgląd w formularzu, i przez zapis — nie mogą się rozjechać.
- ✅ **Zmiana schematu po obu stronach**: `firestore.rules` (`isValidRental`) **i** lustrzany tester `functions/validate-schema-n3.cjs`; parytet potwierdzony audytem (allowlisty 29 = 29 pól). Rozjazd tej pary to znany, powtarzalny błąd projektu (N3, X14).
- ✅ **Pułapka utraty danych obsłużona**: stare rezerwacje mają samo `guests` bez rozbicia, więc przy wyliczanym `guests` zapis wyzerowałby liczbę osób — `openEditModal` migruje `guests` → `adults` przy wczytaniu; e2e asertuje formularz **i** dokument po zapisie.
- ✅ **Baza wiedzy** (`support`): 3 artykuły + FAQ „Gdzie zniknęło pole »Liczba gości«?" i „Czy pies wlicza się do liczby osób?". Przy okazji zweryfikowane: rezerwacje z iCal nie mają ŻADNEJ liczby osób — `functions/index.js` tych pól nie zapisuje.
- ✅ **RODO** (`legal`): skład osobowy pobytu dopisany do Polityki §4, DPA §3 i erraty E6. Ekspozycja bez zmian — pola wyłącznie za `isOwnerAndVerified` + subskrypcja, brak ścieżki publicznego odczytu. Dopisane do kategorii DANYCH, nie OSÓB (z samej liczby dziecka nikogo nie zidentyfikujemy) — do potwierdzenia przez prawnika.
- ✅ **Przegląd `code-reviewer`**: diff bezpieczny, reguły bezpieczne (zmiana wyłącznie addytywna). Weryfikacja: lint 0, build OK, reguły `--dry-run`, e2e 39/39. Commit `42472af`. **Deploy nastąpił dopiero 2026-08-10.**

---

## 2026-07-24

### N6.1 + N6.2 na produkcji + luka wykryta przy przeglądzie brzmień
- ✅ **DEPLOY** `495aace` przez `--only hosting:app`. **Weryfikacja live na `wynajempro.com`**: akceptacja → `cookie_consent='true'`, `ga-disable-G-BZ0SJC201Z=false`, ciastka `_ga` utworzone; ponowne otwarcie z linku w stopce → baner z adaptacyjnym „Wycofaj zgodę"; wycofanie → flaga skasowana, `ga-disable=true`, **ciastka `_ga*` usunięte**. Oba wejścia (stopka landingu + strona Polityki) potwierdzone na żywo.
- ✅ **Brzmienia (`legal`)**: 4/5 tekstów OK; z banera usunięto nieprawdziwe „dostosowywać komunikaty" — aplikacja nie personalizuje, po zgodzie działa wyłącznie GA. Poprawił `dev`, e2e 3/3.
- ⚠️ **Luka wykryta przy tym przeglądzie** (`0660c1e`): baner renderuje się globalnie (`App.jsx:162`), więc gość na `/guide/:id` i `/opinie/:id` mógł zgodę **wyrazić**, ale te strony nie miały żadnego wejścia do jej wycofania — realna luka „równej łatwości" wobec akurat tej grupy, dla której Operator jest administratorem danych analitycznych. Naprawa: dyskretne „Ustawienia cookies" przy kredycie „Stworzono za pomocą WynajemPRO" (`GuestGuideView.jsx`, `ReviewPageView.jsx`, `.wpb-meta__btn`), ten sam mechanizm `wpc:open`. Lint 0, build OK, e2e 51/51. **Deploy nastąpił dopiero 2026-08-10.**
- ✅ **N6.2**: komunikat w `AccountModal` przepisany na realny zakres kasacji (przewodniki, sekrety WiFi/PIN, podpisy akceptacji, pliki, dane biznesowe, rekord klienta Stripe, profil, konto logowania) + „nieodwracalne, bez karencji". Obiecywał wcześniej mniej, niż `deleteUserAccount` faktycznie kasuje.
- ✅ **Dokumenty po deployu (`legal`, `d97e267`)**: §9 dokumentu bezpieczeństwa rozdzielone — tabela braków zawiera tylko pozycje OTWARTE, domknięte przeniesione do nowej **§9.1** z datami i dowodami; z Polityki zdjęte „oczekuje na deploy"; **errata E1–E5** w `Raport-dla-prawnika-2026-07-22.md` (pakiet był już u prawnika, więc pierwotne zdania zachowano jako cytat z datą, zamiast je przepisywać); pozycja „Wycofanie zgody cookie" zamknięta w Checkliście.
- ⏸ **Reszta luki (do decyzji)**: ekrany błędu obu widoków gościa („Nie znaleziono strony") renderują panel **bez kredytu**, a baner tam działa — gość z wygasłym linkiem, który kliknie „Akceptuję", znów nie ma wyjścia. Skala mała (ślepa uliczka), fix ~1 linijka na widok.
- ⏸ **Wsad do N4**: podstawa cookies „art. 173 Pr. tel." nieaktualna → **PKE art. 399/402** (od 2024-11-10); dotyczy Polityki, Checklisty i Oceny-linki — `legal` oznaczył w dokumentach.

---

## 2026-07-23

### N6 — kod wycofania zgody, zakres ostrzeżenia, skrypt czyszczenia sierot
- ✅ **N6.1 (`dev`)**: `src/firebase.js` — `disableAnalytics()` (`ga-disable-<ID>=true` + `setAnalyticsCollectionEnabled(false)` + kasowanie ciastek `_ga*`) / `enableAnalytics()`; `initAnalytics()` utwardzony tak, że **nie tworzy GA bez zapisanej zgody** — domyka bonusową lukę opt-in (zdarzenia z `LoginPanel` leciały do GA przed zgodą). Dwa wejścia „równie łatwo": link w stopce landingu + przycisk na stronie Polityki, oba przez zdarzenie `wpc:open` (bez przeładowania). Nowy `e2e/cookie-consent.spec.js`.
- ✅ **N6.5 skrypt (`dev` + przegląd `code-reviewer` w trybie F2)**: `functions/cleanup-orphan-guide-files-n6.cjs` na wzorcu `audit-guides-n5.cjs`. Bezpieczny z domyślnych ustawień: **domyślnie DRY-RUN** (kasowanie tylko po `--fix`), gwarda wieku 30 dni, **nieznany wiek pliku ⇒ pominięcie** (fail-safe chroniący świeżo wgraną okładkę szkicu, którą `storage.rules` dopuszcza gałęzią `!exists`), paginacja, idempotencja. Przegląd: DRY-RUN bezpieczny, `--fix` bez blokerów logiki. Nie jest Cloud Function — uruchamiany ręcznie, deploy go nie dotyczy.
- 📌 **N6.3 / N6.4 wyodrębnione jako pozycje konsolowe właściciela** (kopie zapasowe Firestore, egzekwowanie App Check) → [[Zlecenia-wlasciciela]] #8.

---

## 2026-07-22

### Pakiet dla prawnika — aktualizacja dokumentów + nowy opis zabezpieczeń (zlecenie właściciela)
- ⚠️ **Obaj agenci (`legal`, `code-reviewer`) padli na wyczerpaniu limitu Fable 5** — `legal` zdążył dokończyć Politykę (spójna, zachowana), reszta zrobiona bez delegowania.
- 🔍 **Dwa rozjazdy dokumentacji ze stanem faktycznym** (weryfikacja w kodzie, nie w pamięci): (1) **N1/N2/N3 są wdrożone od 2026-07-09/10**, a `CLAUDE.md` i część zapisów w dokumentach prawnych wciąż opisywały je jako blokery/„stan docelowy" — weryfikacja e-mail egzekwowana TRÓJWARSTWOWO (`LoginPanel.jsx:129-151`, `App.jsx:88-104`, `firestore.rules:9-16` — warunek `email_verified` po stronie serwera); (2) ostrzeżenie przy usuwaniu konta (`AccountModal.jsx:182`) wymienia węższy zakres niż faktyczna kasacja (pomija przewodniki, dane gości, pliki) — do poprawki.
- ✅ **Regulamin**: domena kanoniczna `wynajempro.com` wpisana (§1); §3 ust. 3 i §5 ust. 2 — usunięte adnotacje o „blokerach N1/N2", wpisany stan faktyczny; §5 ust. 3 i §11 — nieokreślona „karencja" zastąpiona faktycznymi okresami (30/90 dni) + natychmiastowość i pełny zakres usunięcia na żądanie; §6 ust. 2 — skorygowany zapis o kartach („nie przechowuje pełnych danych" sugerowało przechowywanie częściowych; faktycznie dane karty NIGDY nie trafiają do aplikacji).
- ✅ **DPA**: przeredagowana nieaktualna ramka bramki rozliczalności przy §6 (opisywała reguły jako zaślepione — status: SPEŁNIONA, z zastrzeżeniem App Check jako ustawienia konsoli); §9 — faktyczne okresy retencji, pełny zakres kasacji i opis odporności procesu (C.1/#32); §3 — obecny przepływ akceptacji NIE zbiera imienia ani podpisu gościa (starsze zapisy mogą); nowy §9 ust. 4 o zwrocie danych (CSV/iCal) z pytaniem o wystarczalność wobec art. 20.
- ✅ **Nowy `docs/legal/Bezpieczenstwo-kont-i-danych.md`** — inwentarz zabezpieczeń z dowodami plik:linia (hasła nigdy w naszym kodzie, weryfikacja e-mail trójwarstwowo, izolacja i rozdzielenie get/list, sekrety w subkolekcji, nagłówki, Stripe bez danych kart + podpis webhooka, usuwanie z odpornością) **plus uczciwa sekcja 9 „Ograniczenia i braki"**: brak 2FA, hasło od 6 znaków, **egzekwowanie App Check niepotwierdzalne z kodu (do sprawdzenia w konsoli)**, brak konfiguracji kopii zapasowych, brak wycofania zgody cookies, osierocone pliki historyczne. Sekcja 10: czego NIE dało się zweryfikować.
- ✅ **Nowy `docs/legal/Raport-dla-prawnika-2026-07-22.md`** — pakiet na spotkanie: czym jest produkt, spis 7 dokumentów, co domknęliśmy sami, **15 pytań w trzech priorytetach** (5 blokujących start: odstąpienie przy trialu bez karty, status przedsiębiorcy na prawach konsumenta, kompletność DPA + czy Stripe jest subprocesorem, obronność „dostępu po linku" pod art. 32, które braki blokują sprzedaż), funkcje wyłączone (generator umów), prośba końcowa.
- ✅ `CLAUDE.md` — odhaczone nieaktualne blokery N1–N3, wpisane realne pozostałe.

### #32 — klient Stripe w cyklicznym purge (tryb F2; zlecenie właściciela „zajmij się #32")
- 🔍 **Stan faktyczny (`dev`)**: `stripeCustomerId` przeżywa `cleanupUserData` (kasowane tylko `stripeSubscriptionId`/`paidAt`/`lastPaymentAt`) — tropiciel retry działa. ODKRYCIE przy badaniu 1d: webhook `customer.subscription.deleted` na nieistniejącym dokumencie users wpadał w pętlę NOT_FOUND→500→retry (Stripe ponawia dniami; ryzyko auto-wyłączenia endpointu płatności) — dokument wskrzesić nie mógł (`update()`, nie `set()`), ale pętla była realna.
- ✅ **Fix (`dev`, commit `ece7f73`)**: `purgeAccountCompletely` — `customers.del` ze świeżego `stripeCustomerId` TUŻ PRZED kasacją dokumentu users (kolejność uzasadniona wyścigiem: wcześniejszy Stripe + późniejsza awaria = webhook przestawia `scheduledDeletionAt` i wypycha konto z kwalifikacji na 30 dni); awaria Stripe → throw → dokument-tropiciel zostaje, retry następnej nocy; `resource_missing` = sukces; brak pola = skip. Binding `STRIPE_SECRET_KEY` do `deleteExpiredAccountsData` (legalność potwierdzona w typach firebase-functions 6.6.0). Guard webhooka: brak dokumentu (udany odczyt, `!exists`) → ack 200; wyjątek odczytu → nadal 500+retry (rozróżnione!); claims tolerują wyłącznie `auth/user-not-found`. Fallbackowe URL-e checkout/portal → `wynajempro.com` (martwe w praktyce — origin frontu nadpisuje; potwierdzone w `WynajemContext.jsx`); `UID:...@wynajempro.pl` w exportIcal celowo nietknięty (identyfikator — zmiana zdublowałaby rezerwacje w portalach). Zapytania i predykaty purge bajt-w-bajt nietknięte. Harness na realnym kodzie **32/32** (w tym: awaria Stripe → drugi przebieg dokańcza; webhook nie tworzy dokumentu; konta żywe nietknięte).
- ✅ **Przegląd `code-reviewer`: BEZPIECZNA DO COMMITA I DEPLOYU** — 0 blokerów, 0 ważnych, 2 informacyjne (oba bez działania); `resource_missing` zweryfikowany dla stripe-node 17.7.0; bonus: guard domyka też pre-existing pętlę 500 przy samoobsługowym `deleteUserAccount` z aktywną subskrypcją. RODO: nowe logi tylko uid/customer id.
- ⏸ **DEPLOY `--only functions` ZABLOKOWANY przez klasyfikator uprawnień sesji** (przy C.1 identyczna komenda przeszła) — czeka na wykonanie przez właściciela ([[Zlecenia-wlasciciela]]). Po deployu: obejrzeć logi nocnego przebiegu 02:00 (zalecenie reviewera).

### N5 C.1 DOMKNIĘTE (tryb F2) + deploy pakietu legal — decyzja właściciela „deploy i zajmij się N5 C.1"
- ✅ **DEPLOY hosting (pakiet legal)**: build + `--only hosting:app`; live zweryfikowane: `x-robots-tag: noindex, nofollow` na `/guide/...` i `/opinie/...` (landing BEZ nagłówka — poprawnie), maskowanie w bundlu produkcyjnym `index-H0dRMjbz.js` (`/(guide|opinie)/` → `/[id]`). Po deployu `legal` dopisał oba środki do katalogu §6 DPA i zdjął adnotację wdrożeniową w Polityce (ramka rozliczalności zaktualizowana, ślad audytowy zachowany).
- 🔍 **Ustalenie `dev` (krok 1 — stan faktyczny)**: C.1 z audytu 2026-07-10 był w rdzeniu NIEAKTUALNY po F1/F2 — `cleanupUserData` nie jest samodzielną ścieżką (tylko helper `purgeAccountCompletely` i `deleteUserAccount`), parytet kasacji przewodników istniał. REALNA luka: (a) awaria `bucket.deleteFiles` połykana + dokument przewodnika kasowany mimo żywych plików → publiczne pliki NA ZAWSZE bez tropiciela (`storage.rules` `allow read: if true`), (b) kolejność (biznesowe przed przewodnikami), (c) brak świeżego odczytu przed nieodwracalną kasacją (residual 🟢C z F2).
- ✅ **Fix (`dev`, `functions/index.js`, commit `1bcfce8`)**: `deleteGuideCompletely` — kolejność secrets→signatures→Storage→dokument, błąd Storage PROPAGUJE (dokument-tropiciel zostaje, retry dokańcza); `purgeAccountCompletely` — świeży odczyt + double-check `stillEligible` przed kasacją, przewodniki przed danymi biznesowymi; predykaty `canceledStillEligible`/`trialStillEligible` tylko ZAWĘŻAJĄ (zapytania i indeksy bajt-w-bajt nietknięte); `deleteGuide`/`deleteUserAccount` przy trwałej awarii Storage zwracają błąd zamiast cichego sukcesu (front gotowy: toasty, bez usunięcia z listy — zweryfikowane). Weryfikacja: harness na REALNYM kodzie (podmiana `Module._load`, in-memory admin SDK) **21/21 asercji** — żywe konta nietknięte, wyścig z webhookiem → skip, legacy stringi → skip, idempotencja po awarii; emulator Firestore niedostępny (Java — dowód, nie założenie).
- ✅ **Przegląd `code-reviewer` (obowiązkowy, tryb F2): BEZPIECZNA DO COMMITA I DEPLOYU** — 0 blokerów; wszystkie tezy deva zweryfikowane niezależnie (parytet wywołań grep-em, kierunek predykatów vs webhook Stripe, izolacja per-konto `Promise.allSettled`, stan po ubiciu w pół = dokańczalny). 3× 🟢 na przyszłość: re-check tuż przed `deleteUser` (residual C, okno ZAWĘŻONE tą zmianą), `timeoutSeconds` dla `deleteExpiredAccountsData` przy większej bazie (skutek najwyżej +1 doba), kolejność Stripe→guides w `deleteUserAccount` (pre-existing, samo-domykalne przez webhook).
- ✅ **DEPLOY `--only functions`** — `functions:list` potwierdza aktualizację. **Ostatni bloker legal przed launchem zamknięty**; z listy raportu legal zostaje tylko #32/🟡A (klient Stripe w cyklicznym purge — e-mail w Stripe, zadanie przed launchem).

### Decyzje legal ZREALIZOWANE wg rekomendacji (zlecenie właściciela) + GSC domknięte
- ✅ **GSC (właściciel)**: usługa domenowa `wynajempro.com` + sitemapa przyjęta. Pułapki odnotowane w [[Zlecenia-wlasciciela]] (zły URL → „mapa w formacie HTML"; usługa domenowa wymaga pełnego adresu mapy).
- ✅ **Kod (`dev`)**: (1) maskowanie tokenu w GA — `trackedPagePath()` w `App.jsx`: `/guide/*`→`/guide/[id]`, `/opinie/*`→`/opinie/[id]`, query odcięte, inne trasy bez zmian; (2) ostrzeżenie w GuideBuilderze przy „Udostępnij gościom" (brzmienie z raportu 4a, patern 1:1 z ReviewBuildera); (3) `X-Robots-Tag: noindex, nofollow` dla `/guide/**` i `/opinie/**` w targecie `app` + komentarz SeoTags doprecyzowany (nagłówek celowo tylko dla tras gościa). Weryfikacja: lint 0, build OK, e2e review+panel-v2+smoke **13/13**, maskowanie udowodnione na zbudowanej aplikacji (`dataLayer`: `/guide/test123?foo=bar` → `page_path=/guide/[id]`; kontrola `/blog?src=test` niezmieniona).
- ✅ **Dokumenty N4 (`legal`, znacznik `[UZUPEŁNIENIE 2026-07-22]`)**: Polityka — `hostProfile`/`publicContact` rozdzielone wg B1.1 (odbiorcy: „każda osoba dysponująca linkiem"), nowy akapit o mechanizmie „dostęp po linku" i o analityce na stronach publicznych; Regulamin — nowy **§4 ust. 3** (odpowiedzialność gospodarza za dystrybucję linku; styk z §12 do oceny prawnika); DPA — **§2 ust. 5** (charakterystyka kanału) + §6 katalog środków. Rozliczalność: X-Robots-Tag i maskowanie GA **celowo niewpisane do DPA** do czasu deployu (DPA nie deklaruje środków niewdrożonych) — dopisać po wydaniu.
- ✅ **Odłożone decyzją właściciela (wg rekomendacji)** → [[Projects/Backlog]]: „Wygeneruj nowy link" + artykuł o rotacji kodu (po launchu), wygasanie/PIN (Later), fallback `Math.random()` (dług).
- ⏳ **Pozostały bloker legal przed launchem: N5 C.1** (kaskada czyszczenia przewodników przy purge) — wymaga trybu F2 (review przed deployem), do zlecenia osobno.
- ⏸ **Deploy pakietu na słowo właściciela**: `firebase deploy --only hosting:app` ([[Zlecenia-wlasciciela]] poz. 1b).

### X9 (część 2) — 301 firebase → wynajempro.com: multi-site WDROŻONE (zlecenie właściciela „zajmij się tym")
- ✅ **Architektura**: nowy site **`wynajempro`** (ładny zapasowy adres `wynajempro.web.app`) serwuje aplikację; stary site `moje-domki-6c77d` został czystym redirectorem. `firebase.json`: `hosting` jako tablica targetów `app`/`redirect` (+ `.firebaserc` z `target:apply`), redirector z `public: redirect/` (zaślepka z meta-refresh, nigdy nieserwowana) i regułami 301: jawne `/` + `/:rest*` z zachowaniem ścieżki — **`/:rest*` NIE łapie gołego roota** (odkryte w weryfikacji: `/` zwracał 200 z zaślepką; naprawione drugą regułą).
- ✅ **Przepięcie domeny** (konsola przez Chrome właściciela + panel SEOHOST): (1) DNS microhost — TXT `hosting-site=moje-domki-6c77d` → `hosting-site=wynajempro`, TTL skrócony 86400→500; rekord A `199.36.158.100` bez zmian, `firebase=moje-domki-6c77d` (projekt) zostaje; (2) usunięcie domeny custom ze starego site'u; (3) dodanie na nowym — status **Connected** od ręki (DNS niezmieniony, domena zweryfikowana w projekcie), przerwa w działaniu praktycznie zerowa (stare mapowanie działało na edge'u do momentu podpięcia nowego). Pułapka: po skasowaniu domeny walidacja „This domain already exists" ≈ minutę (soft-delete w backendzie) — pierwszy submit jednak przeszedł, co wyszło po odświeżeniu listy.
- ✅ **Weryfikacja end-to-end**: `moje-domki-6c77d.web.app/` i `.firebaseapp.com/` → **301** na kanoniczną; `/blog`, `/regulamin`, `/pomoc/pierwsze-kroki` → 301 z zachowaniem ścieżki; follow kończy na `https://wynajempro.com/... (200)`; **`/__/auth/handler` zwraca 200 BEZ przekierowania** (rezerwowane `/__/*` ponad redirectami — linki auth bezpieczne, potwierdzone, nie założone); kanoniczna serwuje bundle `index-CxG5_cHP.js`.
- 📌 **Od teraz deploy aplikacji**: `firebase deploy --only hosting:app` (samo `--only hosting` wdroży też redirector — nieszkodliwe). Opcjonalny szlif: action URL w szablonach e-mail Auth (konsola) wciąż na domenie projektu — działa przez rezerwowane ścieżki, zmiana tylko eliminuje kosmetykę.

### Ocena `legal`: publiczny dostęp `/guide` i `/opinie` (zgłoszenie z X9)
- ✅ **Raport**: [[Ocena-linki-guide-opinie]] (docs/legal/). Werdykt: „nieodgadywalny link" (UUIDv4, bez listowania, sekrety w subkolekcji, noindex, Referrer-Policy) — obronny jako fundament pod art. 32, **ale nie w obecnym otoczeniu**: (1) **NOWE USTALENIE** — `AnalyticsTracker` (`App.jsx:59-72`) wysyła pełny `page_path` z tokenem `/guide/{id}` do Google Analytics po zgodzie cookie: jedyna bariera dostępu systematycznie kopiowana do systemu Google; (2) link bez wygasania + N5 C.1 (po czyszczeniu karencyjnym przewodniki z sekretami zostają publiczne); (3) gospodarz nieinformowany, że link = „token na okaziciela" (GuideBuilder bez ostrzeżenia; ReviewBuilder MA notkę — wzorzec).
- 📊 10 ustaleń w tabeli: 4 **BLOKERY przed launchem** (maskowanie ID w GA — fix jednolinijkowy; domknięcie N5 C.1; ostrzeżenie w GuideBuilderze; opis mechanizmu linku w Polityce/Regulaminie/DPA — w ramach otwartego N4), 4 WAŻNE (m.in. rozjazd: komentarz `SeoTags.jsx:30-31` deklaruje `X-Robots-Tag`, którego nie ma w `firebase.json`; kod do drzwi = ryzyko KC/bezpieczeństwo fizyczne, nie PUODO), 2 porządkowe (fallback `Math.random()` w generatorach ID, wolny tekst bez zastrzeżeń).
- ✅ Gość publicznie **nieidentyfikowalny** (rekord akceptacji pseudonimowy, czytelny tylko dla sesji i właściciela); jedyne dane osobowe po linku = `publicContact` gospodarza (zminimalizowane po RODO-UI).
- ⏸ **5 decyzji u właściciela** ([[Zlecenia-wlasciciela]] poz. 4): maskowanie GA, timing „nowego linku", brzmienie ostrzeżenia, warstwa opcjonalna (wygasanie/PIN — rekomendacja: Later), uzupełnienie projektów N4. Zero zmian w kodzie — zgodnie z zakresem agenta.

### X9 (część 1) — kanonizacja domeny: wynajempro.com jako jedyna domena kanoniczna (agent `seo`)
- 🎯 **Decyzje właściciela**: kanoniczna = `https://wynajempro.com` (bez www); 301 z domeny firebase — TAK, z zachowaniem ścieżki; praca w głównym katalogu obok WIP-u X1.
- ✅ **Kod (commit `8bda769`, na słowo właściciela)**: `public/sitemap.xml` — 14 adresów przepisanych na domenę kanoniczną, `lastmod` 2026-07-21, lista zweryfikowana 1:1 z trasami `App.jsx`; `public/robots.txt` — `Sitemap:` na kanoniczną + `Disallow` dla `/login`, `/reset-password`, `/auth`, `/guide`, `/opinie`; `index.html` — `og:url`/`og:image`/`twitter:image` na kanoniczną; `src/App.jsx` — montaż `<SeoTags />`. Nowy `src/components/SeoTags.jsx` (canonical + `og:url` per trasa przy routerze, normalizacja slash/query, `noindex,nofollow` na trasach wyłączonych) — wciągnięty do commita X1 `09d4503` przez pracę równoległą (martwy bez montażu w App.jsx; komplet domknięty w `8bda769`). Pułapka ominięta świadomie: statyczny canonical w `index.html` mówiłby Google, że każda trasa SPA to strona główna — stąd rozwiązanie per trasa.
- ⛔ **301 NIEWYKONALNE samą edycją `firebase.json`** (potwierdzone w docs Firebase, nie z pamięci): `redirects` dopasowuje tylko ścieżkę, bez warunku po hoście; obie domeny wskazują ten sam site (identyczny etag), więc `"source": "**"` = pętla na domenie kanonicznej. Poprawna droga = multi-site: `hosting:sites:create wynajempro-app` → przepięcie custom domeny w konsoli → stary site `moje-domki-6c77d` jako redirector (`/:rest*` → 301 na kanoniczną) → `target:apply` + `firebase.json` jako tablica. Reserved `/__/*` ma priorytet nad redirectami — handler auth bezpieczny. **Operacja konsolowa właściciela**; do tego czasu stan „canonical + sitemap + robots" jest bezpieczny sam w sobie.
- ✅ **Regresje sprawdzone, nie założone**: auth bez `actionCodeSettings` w kodzie (domena linków z szablonu w konsoli; `wynajempro.com` w `authorizedDomains`, `VITE_FIREBASE_AUTH_DOMAIN` już na kanonicznej); iCal na `cloudfunctions.net` — niezależny od hostingu, nietknięty.
- ✅ **Weryfikacja**: lint 0, build OK (PWA 32 wpisy); `dist/` bez śladu `moje-domki` w sitemap/robots/index; canonical/og:url/noindex potwierdzone runtime (Playwright na `vite preview`) na 8 trasach, w tym obcięcie query (`/blog?ref=fb`) i slasha (`/kontakt/`).
- ⚖️ **Do `legal`**: `/guide` (hasło WiFi, kod do drzwi) i `/opinie` wyłączone z indeksu (`Disallow` + `noindex`), ale model „publiczne po nieodgadywalnym linku" dla treści z sekretami wymaga oceny RODO szerszej niż SEO.
- ✅ **PUSH + DEPLOY hosting (2026-07-22, `--only hosting`, decyzja właściciela „push i deploy")**: commity `8bda769`+`e133e2f`+`0948414` wypchnięte, build świeży (PWA 32 wpisy), release OK. Weryfikacja live: sitemapa 14×`wynajempro.com` / 0×`moje-domki` (także serwowana z domeny firebase — dokładnie pożądany sygnał cross-domain), robots z kompletem `Disallow` i `Sitemap:` na kanonicznej, `og:url` na kanonicznej, logika canonical potwierdzona w bundlu `index-CxG5_cHP.js`, obie domeny HTTP 200. **Część 1 X9 live.** Następny ruch właściciela: GSC property + zgłoszenie sitemapy ([[Zlecenia-wlasciciela]]).
- 📌 **Otwarte**: rozjazd `wynajempro.pl` vs `.com` w fallbackach Stripe (`functions/index.js:154,410` — martwe w praktyce, nadpisywane originem frontu); reszta X9 = audyt indeksowalności SPA (initial HTML to pusty root — do decyzji prerender/SSG), meta/title per podstrona (SeoTags gotowy do rozbudowy), JSON-LD, wpisy bloga w sitemapie, plan treści.

## 2026-07-21

### X1 — centrum pomocy osadzone w aplikacji + naprawy #10/#11 z przeglądu treści
- ⚠️ **Bloker wykryty PRZED osadzeniem**: artykuły `docs/support/` pisane 10.07 opisywały panel sprzed X4/X14/X16/RODO-UI/F2. Zweryfikowane w kodzie nieprawdy: osobny widok „Analityka" (nie istnieje — `ManagerApp.NAV` ma Finanse 05 z podzakładkami), FAQ „raportu nie da się pobrać jako plik" (są druk A4→PDF i eksport CSV), „Generator umów" w nawigacji (X16 go zdjął), usuwanie konta Google mailem (F6 dał reauth przez popup), publikowanie e-maila logowania w przewodniku (RODO-UI: `publicContact` + przełącznik), brak „Liczby gości" (X14) i retencji 90/30 dni (F2). Wniosek: **artykuł cytujący UI 1:1 starzeje się z każdym deployem** → do backlogu jako krok w checkliście zmian UI.
- ✅ **Odświeżenie treści (agent `support`)**: wszystkie 9 plików przepisane pod obecny kod, każda etykieta z cytatu. `finanse-i-raporty` niemal w całości nowy. Świadomie nieopisane (niesprawdzalne w repo): ścieżki w extranetach Booking/Airbnb, czas zaciągania linku przez portale, konfiguracja faktur w Stripe, podłączenie Nocowania (brak pola).
- ✅ **Osadzenie (`dev`)**: publiczne trasy `/pomoc` i `/pomoc/:slug` (bez logowania — użytkownik odcięty paywallem też musi trafić do instrukcji), `HelpCenterPage` + `HelpArticlePage` na wzorcu bloga i `LegalLayout`, ikony per artykuł powtórzone z nawigacji panelu (`helpIcons.jsx`, lucide — „zero emoji"). Wejścia: stopka landingu, sidebar panelu i mobilny arkusz „Więcej" (nowa karta), odesłanie nad formularzem `/kontakt`. Sitemapa + 9 adresów.
- ✅ **Jedno źródło prawdy**: `scripts/build-help-articles.mjs` generuje `src/data/helpArticles.js` z markdownu (`npm run help:build`); plik danych oznaczony jako generowany. Ręczne przepisanie treści do JS-a odtworzyłoby rozjazd, który właśnie wykryliśmy. Parser miał błąd (pusta linia rozbijała FAQ na osobne bloki) — złapany i naprawiony przed użyciem.
- ✅ **Naprawa przy okazji**: Preflight Tailwinda zerował `list-style`, więc instrukcje „krok po kroku" renderowały się BEZ numeracji (reguła `li::marker` w `.wpb-prose` nie miała czego kolorować). Punktory i numery przywrócone jawnie — dotyczyło też bloga i stron prawnych.
- ✅ **#10 (🔴) wpisy kosztowe i jednorazowe zadania bez edycji/usuwania — NAPRAWIONE**: „Ostatnie koszty" dostały akcje + „Pokaż wszystkie" (bez tego koszt starszy niż 8 wpisów był nieosiągalny), zadania `type:'reminder'` dostały zakładkę „Zadania" w Rezerwacjach z odhaczaniem, edycją i usuwaniem. Front-only — `text`/`isCompleted` i `delete` były już w allowliście `isValidRental`, więc bez zmian reguł.
- ✅ **#11 (🟡) sygnalizator synchronizacji — NAPRAWIONY**: czytał KLUCZE `syncLinks` (nazwy obiektów) zamiast wartości (portale), więc przy wpiętych linkach zawsze świecił „—". Teraz sterowany danymi; „Nocowanie" usunięte, bo nie ma pola na jego link. Po naprawie zaktualizowane dwa fragmenty świeżo napisanych artykułów, które opisywały obejście („napisz do nas").
- ✅ **Weryfikacja**: lint 0, build OK, **46/46 e2e** (zaufane 34 + `help-center` 7 + `costs-tasks` 5), podgląd wizualny pomocy desktop+mobile, zrzuty panelu z akcjami kosztów i zakładką zadań.
- 🧹 Porządek w dokumentacji: odhaczone wdrożone X4/X14/X15/X16 („czeka na deploy" było nieaktualne od 16.07), zamknięte martwe ⬜ przy N1, Known-Issues #6/#7/#8 domknięte (#8 naprawił F6). Chip na osobną sesję: sitemapa wskazuje domenę firebase, choć serwis działa też pod `wynajempro.com` (pozycja do X9).

---

## 2026-07-17

### X2 v2 — apple-scroll demo z importu Claude Design („Wynajem Landing Scroll.dc.html")
- 📥 Import projektu przez **claude_design MCP** (DesignSync: get_project/list_files/get_file) — projekt „Apple scroll mockup aplikacji" właściciela. Silnik z `support.js` (osobny plik) + inline-komponent: dyskretny cross-fade sterowany indeksem scrolla (progress = (-rect.top)/(h−100vh), 5 etap), rail=progress×238px, winScale z ResizeObserver (min(w/1160,h/764,0.78)), highlight per etap, nav/dots per index.
- ✅ Wierny port do React: `LandingScrollDemo.jsx` — sticky 520vh, lewa szyna postępu + 5 bloków tekstu (Pulpit/Kalendarz/Obiekty/Rezerwacja/Finanse), prawa = okno przeglądarki z pełnym mockupem panelu przełączającym 5 ekranów z ruchomym highlightem. Statyczne ekrany przez `dangerouslySetInnerHTML` (markup 1:1 z projektu, autorski → bezpieczne). Dostępność: kropki/kroki jako przyciski (aria-label/aria-current), `data-view` hook, prefers-reduced-motion. Mobile (≤860px): sticky wyłączony, kroki klikalne, okno skalowane do szerokości slotu (skala ze stanu, nie z refa).
- ✅ Zastąpił prostszy PanelDemo z X2 v1 (usunięty wraz z CSS `.wp4-demo`); spec `e2e/landing-demo.spec.js` przepisany (4 testy: start/scroll→Finanse/klik-kropki→Rezerwacja/mobile) + zrzuty. Zaufany zestaw: **34/34**. Lint 0, build OK. Zweryfikowane wizualnie (desktop Pulpit, scroll→Finanse, mobile).
- ✅ **DEPLOY hosting (2026-07-21, `--only hosting`, decyzja właściciela „commit i deploy")**: kod X2/X2 v2 już zacommitowany i wypchnięty (`10e3cc5` + dziennik `35a0fd6`) — zbudowany (`npm run build`, PWA OK) i wydany. Net-new tego deployu = **dokładnie landing X2/X2 v2** (jedyne commity `src/` po deployu F2 `2910591`); reguły/functions nietknięte i zgodne z produkcją (reguły `c714fb1` wdrożone przy RODO, functions `2910591` przy F2 — zero zmian backendu po F2). Live: `moje-domki-6c77d.web.app` + `wynajempro.com` (oba HTTP 200; bundle `index-COAnap2s.js` potwierdzony na produkcji). **X2 DOMKNIĘTE** — apple-scroll demo panelu jest live na landingu.
- 🔧 **Poprawka ramek highlightu (2026-07-21, zgłoszenie właściciela: „ramki nie skalują się dobrze z treścią", zrzuty Finanse + Rezerwacja)**. Przyczyna: highlight pozycjonowany ręcznie dobranymi `hl:{top,left,width,height}` w procentach stałego pudełka treści (924×620) — procenty nie pokrywały realnych elementów, a naturalna wysokość treści jest mniejsza od pudełka. Zmierzone rozjazdy: Finanse top 22%=136px vs realne 167px (**31px za wysoko → ramka wchodziła w kafelki KPI**), Obiekty height 41%=254px vs 292px (38px za krótko), Pulpit 16%=99px vs 122px (23px za krótko), Rezerwacja kilka px offsetu. **Fix:** geometria liczona z realnego elementu oznaczonego `[data-hl]` w aktywnym ekranie (`offsetTop/Left/Width/Height` — niezależne od `transform:scale`, więc ramka trzyma się treści w KAŻDEJ skali), pozycjonowanie imperatywne przez `hlRef` (bez stanu → zero re-renderów przy pomiarze, przechodzi `react-hooks/set-state-in-effect` bez wyłączania reguły); pomiar w `useLayoutEffect` po zmianie etapu + ponownie po `document.fonts.ready` i przy resize. Martwe pola `hl` usunięte z `FEATURES`. Weryfikacja: lint 0, build OK, zero błędów konsoli, pomiary DOM w przeglądarce — środek ramki pokrywa się ze środkiem treści (Δx=Δy=0), rozmiar = treść + 6px oddechu, potwierdzone w desktopie i w trybie kompaktowym (oba elementy skalują się identycznie 0.603). Commit `1ed3f83` + **DEPLOY** `--only hosting`; live potwierdzony hashem chunku (`LandingPage-CNPOTz_Y.js`, zawiera `data-hl`), obie domeny HTTP 200.
- 📌 Dług otwarty (kosmetyka): martwe reguły CSS `.wp4-preview`/`.wp4-graphpaper` po starej sekcji (do sprzątnięcia przy najbliższym dotknięciu landingu).

### X2 — interaktywne demo panelu na landingu (scroll-demo)
- 🔍 Diagnoza: „demo nie działa" = link „Otwórz panel demo →" szedł do /login (obietnica bez pokrycia).
- ✅ Sekcja #panel przebudowana (skill impeccable, rejestr brand — identity-preservation wp4): 4 kroki po lewej + przyklejony mockup okna panelu po prawej; widoki Pulpit/Kalendarz/Finanse/Przewodnik przełączane środkiem viewportu (IntersectionObserver, pas −42%) lub klikiem; kroki to przyciski (aria-current), podpis „RYS. 2 … widok: X" z aria-live; prefers-reduced-motion = podmiana bez animacji. Mobile: mockup sticky NAD krokami (tło papieru — bez prześwitów; RYS. ukryty, semantyka w aria-label), nawigacja mockupu pozioma.
- ✅ Stały spec `e2e/landing-demo.spec.js` (render+Pulpit, klik→Finanse, scroll→Przewodnik, mobile) + zrzuty przez klatkę viewportu (element-screenshot Playwrighta sam scrolluje i odpalał observer w pół przejścia — udokumentowana pułapka). Zaufany zestaw: **34/34**. Lint 0, build OK.
- ⏱️ Po drodze: macOS odciął dostęp do plików (ochrona Pulpitu) — właściciel nadał uprawnienia, praca wznowiona bez strat.
- ⏸ Czeka: commit + deploy hosting na słowo właściciela.

## 2026-07-16

### F2 — retencja porzuconych triali: 90 dni (decyzja właściciela) + re-review
- ✅ **Kod**: `deleteExpiredAccountsData` z DWIEMA izolowanymi ścieżkami (canceled po karencji + NOWA: trialing z trialEndsAt ≤ now−90 dni), wspólny helper `purgeAccountCompletely` (parytet 1:1, Auth→dokument); potrójne zabezpieczenie żywych kont (filtr status, typowanie zakresu Timestamp — legacy stringi poza, double-check przed purge z warn-skip). Indeks złożony users(status, trialEndsAt) w firestore.indexes.json. PaywallScreen jawnie: „Dane konta przechowujemy jeszcze 90 dni…" (art. 13). Uwagi dla prawnika: retencja do Polityki §6/§2 (90 dni trial / 30 dni po anulowaniu).
- ✅ **Re-review: BEZPIECZNA DO COMMITA I DEPLOYU** — właściciel i wszystkie żywe/świeżo wygasłe konta DOWODLIWIE poza zakresem (podwójnie); fail-safe w każdym niepewnym przypadku (wątpliwość → BRAK usunięcia); parytet refaktoru 1:1; indeks właściwy; tekst paywalla zgodny z zachowaniem. 🟢D: indeksy wdrożyć przed 02:00 (zła kolejność = tylko opóźnienie czyszczenia o dobę, fail-safe).
- 🟡 **A (przed launchem, zadanie #32)**: cykliczny purge nie kasuje klienta Stripe (robi to tylko on-demand deleteUserAccount) — e-mail zostaje w Stripe (niepełny art. 17; pre-existing dla canceled). + 🟢C świeży odczyt przed purge, 🟢B jednorazowy check legacy trialEndsAt-stringów.
- ✅ **Commit (`2910591`) + push + DEPLOY** (decyzja właściciela): (1) `firestore:indexes` deployed (indeks zdąży się zbudować przed nocnym przebiegiem 02:00), (2) `functions` + `hosting` released; `functions:list` potwierdza deleteExpiredAccountsData/deleteGuide/deleteUserAccount v2. **F2 DOMKNIĘTE** — od teraz porzucone triale mają 90-dniową retencję z pełnym usunięciem.

### RODO-UI (#22) — klauzule F4/F5, usuwanie kont Google F6, generator w dokumentach
- ✅ **F6/#8** (dev): `AccountModal.handleDeleteAccount` rozgałęziony po providerze — konta Google reauth przez `reauthenticateWithPopup(GoogleAuthProvider)` zamiast hasła (dotąd niemożliwe → luka art. 17). UI pokazuje pole hasła albo przycisk „Potwierdź przez Google i usuń konto".
- ✅ **F5** (dev, brzmienie legal): klauzula warstwy pierwszej pod formularzem `/kontakt` (administrator, cel, link do `/prywatnosc`). Operator = „serwis WynajemPRO" (pełny podmiot w Polityce — dane firmy N4).
- ✅ **F4** (dev, brzmienie legal): mikrocopy przy danych kontaktowych w `CompleteProfileScreen` i `AccountModal` — nazwa/telefon/e-mail publiczne w przewodniku, adres/NIP/PESEL prywatne.
- ✅ **Generator umów w dokumentach** (agent `legal`): Regulamin §4 „OBECNIE NIEDOSTĘPNA; udostępniona po weryfikacji wzorców" (znacznik `[KOREKTA 2026-07-16]`, disclaimer nienaruszony), Checklista poz. 8 status WYŁĄCZONA, prominentna notatka w `Uwagi-N5-dla-prawnika.md`. (Rozbieżność: opis generatora jest w §4, nie §5 jak wskazał właściciel — naniesione w §4.)
- ✅ **Osobne pole publicznego e-maila + przełącznik „Pokazuj kontakt gościom"** (polecenie właściciela): model `hostProfile` += `publicEmail`, `showPublicContact` (reguły hasOnly + optBool, lustrzany tester, self-heal używa publicEmail zamiast e-maila logowania); saveAccount i onboarding zapisują publicContact tylko przy włączonym przełączniku (wyłączenie → deleteDoc). AccountModal: przełącznik + pole publicznego e-maila; onboarding: przełącznik (publiczny e-mail w koncie). Bug e2e: mock nie eksportował `reauthenticateWithPopup` → cały panel nie ładował się w testach → dodano export do firebase-mock; po tym e2e **30/30**.
- ⏸ **Otwarte decyzje** (zadanie #31, zawężone): retencja `contact_messages`, pełna nazwa Operatora. Weryfikacja: lint 0, build OK, reguły dry-run, tester, e2e 30/30 (podgląd lokalny niemożliwy — worktree bez `.env` Firebase).
- ✅ **Re-review (`code-reviewer`, commit `c714fb1`): BEZPIECZNA DO DEPLOYU** — F4/F5/F6 domknięte, zero wycieku adresu logowania (grep wszystkich pisarzy publicContact), brak ścieżki wskrzeszenia kontaktu po opt-out, klucze defaultHostProfile == allowlista reguł (8/8). Twardy warunek 🟡A: **reguły przed hostingiem** (nowy front pisze publicEmail/showPublicContact — stare reguły by odrzuciły zapis profilu). 🟡B: klauzula F5 w pełni zgodna z art. 13 dopiero gdy Polityka (N4) poda tożsamość administratora — bloker launchu, nie deployu. 🟢C: konta legacy default-on (bez e-maila — mniejsza ekspozycja niż dotąd). 🟢D nit: brak osobnej obsługi auth/popup-blocked.
- ✅ **DEPLOY w kolejności z warunku 🟡A** (autoryzacja warunkowa właściciela): (1) `firestore:rules` released, (2) build + `hosting` released. Functions nietknięte.

### X15 — ikony kategorii/źródeł (decyzja: lucide zamiast emoji)
- ⚠️ **Konflikt identyfikacyjny wychwycony**: właściciel prosił o emoji, ale design system ma udokumentowane „zero emoji" (`styles.js:5`, `LandingPage.jsx:22`), a podkreślił spójność jako priorytet. Zapytany → wybrał **ikony liniowe lucide** (zalecane): ten sam język 1px, kolor z tokenów, cel „lepszej czytelności" bez łamania zasady.
- ✅ `glyphs.js` (categoryIcon/sourceIcon — regexy po słowie kluczowym bez diakrytyków, więc łapią też kategorie własne i nietypowe źródła) + `SourceTag.jsx` (createElement, nie `<Ic/>` — czysty react-hooks/static-components). Rozdzielone na 2 pliki przez react-refresh/only-export-components.
- ✅ Wpięte: tagi źródeł w 4 widokach (Pulpit, Rezerwacje, Szczegóły rezerwacji, Generator umów) + CostsView (ikona przy kategorii w breakdown, ikona źródła w „Prowizje wg portalu", ikona kategorii w listach kosztów stałych i ostatnich kosztów). Lint 0, build OK.
- ✅ **Commit (`411302c`) + push + DEPLOY hosting** (decyzja właściciela „wrzucaj na hosting plus na githuba"): front-only, bez reguł/functions; e2e panel 8/8. Podgląd wizualny — smoke test właściciela (App Check blokuje zalogowany panel na localhost).

### DEPLOY wiszącej partii (decyzja właściciela „deploy na serwer oraz na githuba")
- ✅ **GitHub** (3 commity): `7c8ee78` feat(security) N5 F1/F3+A/B (functions+klient), `e211c8d` feat(dashboard) X4+X14+X16+reguły N3/N5, `2cbc1fc` docs. Push origin main.
- ✅ **Firebase deploy** (`firestore:rules,hosting,functions`): **nowa funkcja `deleteGuide` utworzona**, 9 funkcji zaktualizowanych (m.in. deleteExpiredAccountsData pełne usunięcie, deleteUserAccount kolejność Auth→dok), reguły released (guides delete:false, `guests`, `recurringCosts`), hosting released. storage.rules nietknięte → bez promptu IAM. Bramka: lint 0, build, e2e 30/30, reguły dry-run.
- ⏸ **Smoke testy właściciela**: (1) dodanie rezerwacji z liczbą gości, (2) dodanie/edycja/usunięcie kosztu stałego w Finansach, (3) Raport rentowności → **Drukuj/PDF** i **eksport CSV**, (4) usunięcie przewodnika (idzie teraz przez callable). Po deployu dane powierzone są faktycznie usuwane → odblokowana bramka publikacji dokumentów N4.

## 2026-07-15

### X4 partia 1 — fuzja Finanse+Analityka + zakładka „Koszty i opłaty" (skill impeccable)
- ✅ **`FinanceHub`**: jeden moduł „Finanse" (05) z podzakładkami Przegląd (=Analityka) · Koszty i opłaty · Raporty (`.wpd-tabs`). Dawna Analityka (06) wchłonięta; `FinanceView.jsx` usunięty jako zastąpiony; NAV przenumerowana (Przewodniki 06, Opinie 07), tablica search i VIEW_META zaktualizowane.
- ✅ **`CostsView`** (nowy): filtr zakres+obiekt, 4 KPI count-up (Koszty łącznie/Prowizje/Podatek+VAT/Operacyjne), rozbicie „Na co poszły pieniądze" (słupki `.wpd-hbar`, kategorie syntetyczne + własne), „Koszty wg obiektu", tabela „Ostatnie koszty". Nowe klasy: `.wpd-select--sm`, `.wpd-ctable` (grid-areas restacking na mobile).
- ✅ **Raporty**: surfacuje istniejący Raport rentowności + rząd „Eksport dla księgowego / Wkrótce" (uczciwie); naprawia mylącą etykietę „Eksport PDF" (sygnał support z X1).
- ✅ Weryfikacja impeccable: kontekst PRODUCT.md + rejestr product (earned familiarity, reużycie słownika komponentów, zero nowych idiomów); lint 0, build OK, e2e 30/30 (test X12 zaktualizowany — arkusz „Więcej" sprawdza Przewodniki zamiast wchłoniętej Analityki); zrzuty desktop/Raporty/mobile potwierdzają .wpd + AA + responsywność.

### X4 partia 2 — rozbudowane śledzenie finansów (skill impeccable)
- ✅ **Koszty stałe (cykliczne)** — decyzja właściciela „osobne koszty cykliczne": nowy model `settings/recurringCosts` {items:[{id,name,amount,category,property,startMonth,endMonth}]} przez cały łańcuch (useFirebaseData → WynajemContext → ManagerApp → FinanceHub → CostsView); reguły `isValidSettings` + lustrzany tester rozszerzone o `recurringCosts` (items is list). Kwota miesięczna liczona za PONIESIONE miesiące (rok bieżący = do bieżącego mies., bez projekcji niezapłaconej przyszłości — uczciwe śledzenie zysku).
- ✅ **CRUD** `RecurringCostModal` (dodaj/edytuj, walidacja zakresu miesięcy) + manager w zakładce Koszty i opłaty (lista + edycja + usuwanie, zapis do settings, onSnapshot odświeża).
- ✅ **CostsView przepisany**: KPI Koszty łącznie/zmienne/stałe/zysk netto (+marża), „na co poszły pieniądze" (koszty stałe wtopione w kategorie), **prowizje wg portalu**, **zysk wg obiektu** (income−cost, marża, kolor ujemnego), manager kosztów stałych. Nowe klasy `.wpd-ptable`.
- ✅ **Weryfikacja wizualna**: tymczasowa trasa podglądu z realnym komponentem i przykładowymi danymi w dev serverze (obejście: worktree okazał się starszy niż main → zsync src; App Check/overlay/`.env` wyciszone tylko na czas podglądu). Potwierdzone: wszystkie liczby spójne (łącznie=zmienne+stałe, zysk=przychód−koszty, zysk wg obiektu, prowizje per portal), zero błędów konsoli, kolorowanie ujemnego zysku, sortowanie. **Całe rusztowanie podglądu USUNIĘTE** (git checkout App.jsx/index.html, skasowany plik podglądu, sekrety z worktree wyczyszczone).
- ✅ lint 0, build OK, reguły dry-run, tester, e2e 30/30 na czystym main.
- ⏳ Partia 3 (następna): Raport Rentowności PDF + eksport dla księgowego (skill dataviz na wykresy).

### X4 — fuzja Finanse+Analityka + rozbudowa finansów (3 partie, dev + skille impeccable/dataviz)
- ✅ **Partia 1**: FinanceHub (zakładki Przegląd · Koszty i opłaty · Raporty), CostsView (rozbicie kosztów), FinanceView usunięty; jedna pozycja nawigacji.
- ✅ **Partia 2**: koszty stałe cykliczne — model settings/recurringCosts + reguły isValidSettings + lustrzany tester + useFirebaseData/WynajemContext mapping; RecurringCostModal (dodaj/edytuj); CostsView rozbudowany: KPI koszty łącznie/zmienne/stałe/zysk netto, prowizje wg portalu, zysk wg obiektu (wpd-ptable), manager kosztów stałych. Właściciel skorygował liczenie kosztów stałych bieżącego roku „do dziś" (uczciwy zysk).
- ✅ **Partia 3**: ProfitabilityReportModal przepisany na pełne P&L z kosztami stałymi + wykres zysku miesiąc-po-miesiącu i struktura kosztów (inline SVG, bez bibliotek — etos marki; skill dataviz: pasmo CVD 8-12 legalne dzięki etykietom na każdym słupku); druk A4→PDF (window.print + @media print) + eksport CSV dla księgowego (utils/reportExport.js: separator ;, przecinek dziesiętny, BOM, wiersz SUMA — przetestowany w node). Podgląd wizualny na realnym CSS panelu zatwierdzony (App Check blokuje lokalny dev, więc podgląd jako samodzielny artefakt).
- ✅ Weryfikacja całości: lint 0, build OK, reguły dry-run skompilowane, e2e zaufany zielony. **Czeka:** deploy reguł (recurringCosts) w wiszącej partii + test wydruku PDF właściciela. X5 „lepsze podsumowanie miesiąca" scalone z X4.

### Nowe zadania właściciela (X14–X16, X4 przepisane) + wykonanie X16 i X14
- 📋 Właściciel dorzucił listę zadań → roadmapa: **X4 przepisane** (fuzja Finanse+Analityka, ewidencja kosztów, prowizje per portal, zyski, zakładka „Koszty i opłaty", Raport Rentowności PDF + eksport dla księgowego; wchłania X5), **X14** liczba gości, **X15** emotikony, **X16** wyłączenie generatora umów. Kolejność ustalona: X16 → X14 → X4 partiami → X15 (po przemeblowaniu kosztów).
- ✅ **X16**: generator umów zdjęty z nawigacji (desktop + mobilne „Więcej" automatycznie), Opinie → 08, kod widoku zostaje z komentarzem przywracającym; powód: wzorce bez akceptacji prawnika (N4).
- ✅ **X14**: pole „Liczba gości" (opcjonalne) w formularzu rezerwacji obok dat; parsowanie liczbowe; `guests` w allowliście reguł + lustrzanym testerze; komórka „Goście" w szczegółach rezerwacji (odmiana przez util plural, grid 3→4). E2e rozszerzone o asercję `guests: 3`.
- ✅ Weryfikacja partii: lint 0, build OK, reguły dry-run skompilowane, e2e 30/30. Deploy wstrzymany decyzją właściciela („jeszcze popracujemy") — partia wisząca rośnie: F1/F3+🟡A/B, kontakt, paywall, X14, X16.

### #21 (F1+F3) — trwałe usuwanie danych powierzonych (dev, decyzja: pełne usunięcie konta)
- ✅ **F1**: `deleteExpiredAccountsData` (cykliczne, konta canceled po karencji) usuwał tylko dane biznesowe — przewodniki z sekretami i podpisami gości ZOSTAWAŁY bezterminowo mimo obietnicy „trwale usunięte". Teraz: `deleteUserGuides(uid)` (Storage+secrets+signatures+doc) + **pełne usunięcie konta** (Auth przed dokumentem, guard `auth/user-not-found`; decyzja właściciela 2026-07-15). Kolejność chroni przed osieroconym loginem + wskrzeszeniem trialu przez self-heal.
- ✅ **F3**: klienckie `deleteDoc` kasowało tylko dokument przewodnika → sekrety/podpisy/pliki osierocone. Nowy callable `deleteGuide` (owner-check, App Check, idempotentny) kasuje komplet serwerowo; GuideBuilder i ReviewBuilder (strony opinii żyją w tej samej kolekcji) podpięte.
- ✅ Wspólny helper `deleteGuideCompletely`/`deleteUserGuides` — `deleteUserAccount` zrefaktorowany na ten sam kod (parytet 1:1).
- ✅ **Re-review `code-reviewer`: BEZPIECZNE DO COMMITA** (parytet helpera 1:1, retry cyklicznego usuwania zbieżny bez podwójnego kasowania, `deleteGuide` bez path-traversal). Zgłosił 2×🟡 dot. tej samej obietnicy erasure — **oba domknięte od razu**:
  - 🟡A: `deleteUserAccount` (na żądanie) kasował dokument PRZED Auth → przy otwartej apce self-heal wskrzeszał trial; odwrócono kolejność (Auth→dokument, guard user-not-found) jak w F1.
  - 🟡B: `firestore.rules` `allow delete` na `guides` był otwarty dla klienta (obejście F3 przez bezpośredni deleteDoc) → `allow delete: if false` (kasowanie wyłącznie przez callable).
- ✅ Weryfikacja końcowa: node --check OK, lint 0, build OK, reguły dry-run skompilowane, e2e zaufany 30/30.
- 🟢 Residual (recenzent, `useFirebaseData` self-heal ↔ ~1 h ważność tokena po deleteUser): nawet kolejność Auth→dokument nie blokuje online-klienta w pełni — trwałe domknięcie po stronie self-heal (tombstone „deleted" + `revokeRefreshTokens`/wymuszony signOut) → zadanie #24, follow-up z `legal`/`dev`.
- ⏸ Czeka: commit + deploy (functions + rules + hosting) za zgodą właściciela. Po deployu domyka bramkę publikacji dokumentów N4 (dane powierzone faktycznie usuwane).

### Smoke test właściciela → bug uploadu odtworzony na żywo + raport legal N5
- 🐛→✅ **„W przewodnikach nie działa wgrywanie zdjęcia"** — odtworzone w sesji właściciela (Chrome, wstrzyknięty testowy PNG 70 B): `storage/unauthorized` na gałęzi `!exists` (nowy przewodnik). Eliminacja wskazała **brak roli cross-service** `firebaserules.firestoreServiceAgent` dla agenta Storage — **potwierdzone zrzutem z konsoli IAM** (agent miał tylko domyślną rolę); prompt CLI przy N2 nie zadziałał skutecznie; funkcja martwa od deployu storage.rules (09.07), niezauważona, bo smoke N2 nie objął uploadu. **NAPRAWIONE**: właściciel nadał rolę ręcznie w IAM → ponowny test na żywo (upload okładki) przeszedł, zero błędów w konsoli → [[Known-Issues]] #9 zamknięte. Przy okazji smoke test N3: dodanie/usunięcie rezerwacji z formularza zadziałało (świeżo naprawiona ścieżka create). Drobiazg: 1 testowy plik 70 B osierocony w Storage (przewodnik anulowany bez zapisu) → dług „osierocone pliki Storage" w Backlogu
- 📋 **Raport `legal` N5 (przepływy danych osobowych)**: dostęp OK po naprawach technicznych; cykl życia — 🔴 F1 czyszczenie karencyjne nie usuwa danych powierzonych (bloker publikacji dokumentów N4!), 🟡 F2–F7 (m.in. porzucone triale bez retencji, osierocone podpisy po skasowaniu przewodnika, klauzule informacyjne /kontakt i publicContact, rozjazdy dokumentów po 2026-07-10); wsad dla prawnika: `docs/legal/Uwagi-N5-dla-prawnika.md`; zadania #21 (F1+F3) i #22 (F4/F5/#8)

## 2026-07-10

### N4 u prawnika → start równoległych strumieni (N5-tech + X1)
- 📨 Właściciel: dokumenty prawne SĄ u prawnika-człowieka, czekamy na uwagi; pracujemy dalej — zgodnie z roadmapą NEXT działa „równolegle, gdy NOW czeka na prawnika"
- 🔄 **N5 część techniczna**: `code-reviewer` audytuje firestore.rules + storage.rules + functions/index.js + przepływy sekretów (wifi/PIN, `secretToken`, tokeny iCal) + publiczne strony (XSS) + wycieki w repo/buildzie; część `legal` (przepływy danych osobowych) po raporcie technicznym
- 🔄 **X1 baza wiedzy**: `support` pisze 8 artykułów + indeks do `docs/support/` (ugruntowane w realnym UI z kodu, ton marki); osadzenie w aplikacji (`dev`) osobnym krokiem po akceptacji właściciela

### N5-tech: audyt → naprawy tego samego dnia
- 🔍 **Audyt `code-reviewer`**: 2×🔴 + 3×🟡 + 4×🟢, werdykt „NIE wpuszczać płacących". Kluczowe: `allow read` na `guides` obejmował `list` (anonim mógł zrzucić CAŁĄ kolekcję — dane wszystkich klientów, instrukcje wejścia, mapy); legacy sekrety wifi/PIN żyły na publicznych dokumentach, a edycja ich nie czyściła (updateDoc merge'uje); SSRF w sync iCal (redirect follow bez re-walidacji + funkcja dostępna bez subskrypcji/weryfikacji); XSS `javascript:` przez href z danych gospodarza; publiczny `hostProfile` eksponował `taxIdentifier` (może być PESEL) + adres każdego gospodarza.
- 🔧 **Naprawy (kod, bez commita)**: reguły — `get`/`list` rozdzielone, sekrety w update tylko-do-usunięcia (`MapDiff.addedKeys/changedKeys`), `publicContact` z walidacją; front — migracja sekretów przy każdym zapisie (`deleteField`), czyszczenie `secrets/data`, `safeHref` na wszystkich publicznych href, normalizacja łączy, `publicContact` pisany z konta/onboardingu + samonaprawa w `useFirebaseData`, `GuestGuideView` czyta `publicContact`; functions — bramka verified+subskrypcja w `syncICalCalendars`, `fetchWithSafeRedirects` (manual, re-walidacja hopów, max 3), log hosta zamiast pełnego URL iCal (token!).
- 🧰 Nowe narzędzia: `src/utils/url.js` (normalizeUrl/safeHref), `functions/audit-guides-n5.cjs` (read-only inwentaryzacja legacy sekretów + `--fix` migracja; wymaga świeżego klucza od właściciela — poprzedni usunięty zgodnie z higieną).
- ✅ Weryfikacja: lint 0, build OK, `node --check` functions, `firebase deploy --only firestore:rules --dry-run` skompilowane (MapDiff OK), e2e zaufany zestaw **30/30**; powtórny przegląd `code-reviewer` (diff napraw) w toku.
- 📄 **X1 dostarczone równolegle**: 9 plików `docs/support/` (agent pisał w worktree — skopiowane do repo); sygnały produktowe → [[Known-Issues]] #6–8 i [[Projects/Backlog]].
- ✅ **Decyzje właściciela (ten sam dzień) + naprawy #6/#7**: pakiet roczny UKRYTY na paywallu (jedna karta 29,99; wraca z founding members po drugiej cenie w Stripe); formularz `/kontakt` podpięty do `contact_messages` (create-only z walidacją w regułach; odczyt w konsoli Firebase). Weryfikacja rundy 2: lint 0, build OK, dry-run reguł OK, e2e 30/30.
- ✅ **Commit (`f10b029` + chore `62f74c2` + docs `ba07cbb`) → DEPLOY (rules+hosting+functions, 9 funkcji) → MIGRACJA (decyzja właściciela)**: produkcja CZYSTA — zero legacy sekretów, zero enumerowalnych id (nic do odtwarzania), `publicContact` właściciela utworzony (`--fix`), kontrola „✓ Czysto", tester N3 20/20. **Część techniczna N5 domknięta**; uruchomiona część `legal` (wsad z audytu → uwagi dla prawnika)
- ✅ **Re-review diffa (`code-reviewer`): BEZPIECZNY DO COMMITA** — findingi domknięte bez regresji; potwierdzone: deleteField-no-op poza MapDiff, undici redirect:'manual' = 302+Location (test lokalny), brak pominiętych czytelników hostProfile. Bramka „płacący klienci" domyka się operacyjnie: `audit-guides-n5.cjs --fix` na produkcji + „✓ Czysto" + odtworzenie przewodników z enumerowalnym id. Nowe 🟢: DNS-rebinding → Backlog; usunięty martwy `WynajemContext.jsx.bak` (git rm).

### N3 — walidacja schematu danych (rules) + naprawiony bloker dodawania wpisów
- ✅ `firestore.rules`: realne `isValidRental` (24 pola, typy, limity), `isValidGuide` (przewodnik + strona opinii X13, legacy sekrety tylko w merge'u update), `isValidSettings`+hostProfile; hardening create przewodnika (odrzuca sekrety na publicznym dokumencie); helpery optStr/optNum/optBool
- 🐛 **Przegląd wykrył przedistniejący bloker produktowy** (był też w _legacy i na produkcji): ręczne DODANIE wpisu padało — `setDoc` (create) nie przyjmuje sentinela `deleteField()`, SDK rzuca przed regułami; dane właściciela pochodziły z synca iCal (backend), stąd niezauważone. Fix: create pomija puste pola liczbowe, update używa deleteField
- ✅ `functions/validate-schema-n3.cjs` — lustrzany tester walidacji na danych produkcyjnych (zamiennik emulatora); przegląd potwierdził zgodność z regułami i read-only
- ✅ Weryfikacja: lint+build 0, e2e 12/12; przegląd code-reviewer (werdykt: bezpieczne do commita, deploy warunkowy od wyniku testera)
- ✅ Nowy test regresyjny e2e (luka z przeglądu): dodanie rezerwacji z formularza → asercja czystego dokumentu w mocku (bez sentineli deleteField, kwoty jako liczby); panel-v2 6/6
- ✅ **Tester lustrzany na produkcji: 16/16 dokumentów przechodzi** (2 przebiegi): pierwszy wykrył 4 stare rezerwacje z legacy polem `id` w dokumencie (stare wersje aplikacji je pisały; obecna odcina) → dopuszczone w allowliście jak w guides, bez dotykania danych; hipoteza `property`-jako-mapa NIE potwierdziła się. Kryterium „istniejące dane przechodzą" — udowodnione
- ✅ **Commit (`beafb13`) + DEPLOY wykonane** (decyzja właściciela): firestore:rules (kompilacja czysta, bez warningów) + hosting z fixem dodawania wpisów (bez niego smoke test padłby na starym bugu). Czeka: smoke test właściciela

## 2026-07-07

### N2 — egzekwowanie subskrypcji w regułach (+ ogon N1)
- ✅ `firestore.rules`: realny `hasActiveSubscription` (claim `stripeStatus` → fallback dokumentowy z żywym trialem) + przywrócony `email_verified` w `isOwnerAndVerified`; wszystko fail-closed przez `.get()`
- ✅ `storage.rules`: bramka zapisu `guides/` (verified + subskrypcja przez cross-service + warunkowy owner-check) — TODO z linii 10 domknięty
- ✅ Przegląd `code-reviewer`: diff bezpieczny; naprawione odkryte bugi frontu (self-heal `status:'trialing'`, alias `status||accountStatus`) — bez nich deploy odmaskowałby blokadę starych kont i paywall dla płacących
- ✅ `functions/audit-users-n2.cjs` — audyt danych przed deployem (dla właściciela)
- ✅ Runda 2 przeglądu: storage.rules i poprawki potwierdzone; wzmocnienie id przewodników/stron opinii na `crypto.randomUUID()` (Date.now() był enumerowalny — okno uploadu przed zapisem); dług „osierocone pliki Storage" → Backlog
- ✅ Weryfikacja: lint+build 0, e2e 20/20 + 12/12 po wzmocnieniu UUID
- ✅ Diff reguł konsola↔repo wykonany (właściciel wkleił): **identyczne** — zero driftu; zagadka permission-denied z X13 = App Check (localhost bez atestacji), nie reguły
- ✅ **Audyt danych wykonany** (5 kont produkcyjnych): konto właściciela `wasyl515@gmail.com` = `status:'active'` → **dostęp bezterminowy** (string trialEndsAt 2028 nieszkodliwy, reguła nie czyta go przy active). 4 konta testowe/rodzinne stracą zapis: 2× wygasły trial (test@test.pl 2023, piotrwasyl4 2026-05 — blokada i tak poprawna), 2× brak pola `status` (szymonwasiak1, kamilwasyl1402). **Żadne legalne konto nie jest błędnie blokowane** (oba trialing-string są wygasłe, nie przyszłe).
- 🔧 Poprawiony `audit-users-n2.cjs` — pierwotna logika flagowała tylko „trialing bez Timestampa", przeoczyła konta bez `status`; teraz liczy faktyczny wynik reguły (active OR żywy trial-Timestamp) i wykrywa wszystkie 4.
- ✅ Diff `storage.rules` konsola↔repo: **identyczne** — oba pliki reguł bez driftu, deploy podmienia znany stan (rollback = deploy wersji z gita)
- ✅ **Decyzja właściciela + wykonanie (2026-07-09)**: 4 konta testowe usunięte w całości (Auth + Firestore z podkolekcjami; skrypt z bezpiecznikiem na konto właściciela; weryfikacja: została 1 para users/Auth = wasyl515, status active)
- ✅ **DEPLOY reguł wykonany** (`firebase deploy --only firestore:rules,storage`): obie pary skompilowane i released; 2 nieszkodliwe warningi (unused `data` w zaślepkach isValidRental/isValidGuide — znikną przy N3)
- ⚠️ **Incydent wdrożeniowy wykryty i obsłużony**: deploy w terminalu nieinteraktywnym POMIJA prompt CLI o cross-service IAM — weryfikacja polityki (REST getIamPolicy) wykazała BRAK roli `firebaserules.firestoreServiceAgent` dla agenta Storage → uploady przewodników chwilowo martwe (impact ~0: po usunięciu kont testowych jedyny gospodarz to właściciel). Programowe nadanie roli: 403 (Editor nie może setIamPolicy) → naprawa po stronie właściciela: `firebase deploy --only storage` w TTY z odpowiedzią `y` na prompt (albo IAM w konsoli GCP)
- ✅ Właściciel nadał rolę cross-service (deploy w TTY) i potwierdził smoke test: „wszystko działa" — **N2 DOMKNIĘTE** (paywall + email_verified live na backendzie)

### DEPLOY HOSTINGU — cały frontend z 2026-07-03→09 na produkcji
- ✅ Na polecenie właściciela: `npm run build` (z `89ed868`) + `firebase deploy --only hosting` — release complete
- ✅ Weryfikacja markerów w bundle'ach serwowanych z produkcji: X12 dolny pasek ✓, X6 przycisk konta ✓, X13 nawigacja Opinie ✓, count-up ✓, loader/toasty v2 ✓
- Zakres wydania: partie 1–4 audytu UI, mobilny nagłówek, X6 (konto pod imieniem), X12 (bottom bar), X13 (przewodnik opinii), count-up liczb, front N1 — wszystko, co zbudowano od ostatniego deployu (~2 lipca)

---

## 2026-07-06

### X6 — ustawienia konta pod imieniem gospodarza (rdzeń)
- ✅ Split SettingsModal (decyzja właściciela): nowy **AccountModal** — profil gospodarza + subskrypcja + usunięcie konta — otwierany kliknięciem w imię w sidebarze i z pozycji „Konto" w mobilnym arkuszu „Więcej"; zębatka zostaje jako „Ustawienia aplikacji" (6 zakładek)
- ✅ Bezpieczny zapis: konto zapisuje WYŁĄCZNIE `settings/hostProfile` — uniknięta pułapka `saveSettings` (zapis wszystkich nieseedowanych stanów `editing*` nadpisałby np. listę obiektów pustką)
- ✅ Blok tożsamości jako button (hover, focus-visible), logika usuwania konta przeniesiona 1:1
- ✅ Weryfikacja: lint+build 0; e2e 12/12 (nowy test X6: otwarcie z imienia, seed profilu, zakładka subskrypcji, Escape)
- ⬜ Zostaje w X6: zdjęcie profilowe (upload do Storage)

### Mobile header + count-up liczb w całym panelu (zgłoszenie właściciela, skill impeccable)
- ✅ Nagłówek panelu <640px: data ukryta (zawijała się na 3 linie), tytuł z pierwszeństwem miejsca i elipsą, search elastyczny (min. lupa 44px), „+ Rezerwacja" jako sam plus 40px — nic nie wystaje poza ekran (dowód: zrzuty Playwright 375px, krótki i najdłuższy tytuł)
- ✅ Animacja liczb z Analityki wyciągnięta do `src/pages/dashboard/useCountUp.js` (progress 0→1, 700ms ease-out cubic, wszystkie liczby finiszują razem, reduced-motion → natychmiast) i wdrożona: Pulpit (4 karty + pasek obłożenia), Finanse (4 KPI), Obiekty (rezerwacje/śr. cena/obłożenie), Kalendarz (rezerwacje/wolne doby); Analityka zrefaktorowana na wspólny hook
- ✅ PRODUCT.md utworzony (wymóg skilla impeccable; rejestr product, zasady v2)
- ✅ Weryfikacja: lint+build 0; e2e 29/29; zrzuty mobilne przed/po w scratchpadzie
- ℹ️ Świadomie pominięte: ceny w wierszach tabel (animacja przy paginacji/filtrach = szum, wzorzec Analityki dotyczy agregatów); `metrics.avg` w Kalendarzu (sformatowany string)
- ✅ Naniesione findingi przeglądu tonu: `Dziękujemy za pobyt` bez wykrzyknika (tytuł + fallback), bezosobowy DEFAULT_MESSAGE („Jeśli znajdzie się chwila…"), toast przy błędzie pobierania listy, toasty błędów ze wskazaniem akcji („…Spróbuj ponownie."), mikro-copy `To zajmie około minuty.` jako `wpb-meta`, kredyt ujednolicony z przewodnikiem („Stworzono za pomocą WynajemPRO", bez linku)
- ✅ Weryfikacja: lint+build 0; e2e 28/28 (review-pages 5 + panel-v2 4 + auth 13 + smoke 2 + spelling 4)
- ✅ Punkt Booking.com rozstrzygnięty przez właściciela: hint z zastrzeżeniem „Booking prosi o opinię własnym mailem" (finding nr 6 designera)
- ✅ Całość X13 zacommitowana: `f1c47ec`

---

## 2026-07-04

### Dopieszczanie UI — partia 3 (widoki)
- ✅ Kalendarz: naprawiona kolizja pasków rezerwacji back-to-back (gantt hotelowy — pasek kończy się przed dniem wyjazdu), czytelny tekst na paskach amber (`--ink`), legenda uzupełniona o kanał Nocowanie
- ✅ GuideBuilder: 6× `window.confirm`/`alert` zastąpione brandowym DeleteConfirmModal (sparametryzowany) i toastami v2
- ✅ Responsywność: generator umów i formularz przewodnika zwijają się do 1 kolumny <980px
- ✅ Newsletter (landing): stan błędu odróżniony kolorem (#E8836B, 6.9:1 na ciemnym tle) + `role=status` dla czytników
- Weryfikacja: lint+build, e2e panel-v2+smoke+spelling 9/9 → [[Design-Notes]] (statusy partii)

### X12 — dolny pasek nawigacji mobile (partia 4)
- ✅ Pasek <980px w tokenach `--side`: Pulpit · Kalendarz · Rezerwacje · Finanse + „Więcej" (podział zatwierdzony przez właściciela)
- ✅ Arkusz „Więcej": Obiekty, Analityka, Przewodniki, Generator umów + wylogowanie + status synchronizacji; Escape/fokus/aria przez `useDialogA11y`
- ✅ Zwinięte `.wpd-cells`/`.wpd-fgrid` <980px; treść z paddingiem pod pasek (safe-area); widget zadań podniesiony nad pasek
- ✅ Weryfikacja: lint+build, e2e panel-v2 (z nowym testem mobile 375px) + smoke 6/6

### Decyzje właściciela + kierunek prac (2026-07-04)
- ✅ **Cennik na launch rozstrzygnięty**: 29,99 zł/mc + founding members (rabat roczny dla bety); pakiety wg liczby obiektów odłożone. Zamyka otwartą decyzję nr 2 w [[Projects/Roadmap]].
- ✅ **Kierunek po N1**: najpierw tor prawny **N4** — `legal` przygotowuje projekty regulaminu, polityki prywatności i DPA (najdłuższy lead time u prawnika). Kod (N2 paywall) po torze prawnym.
- 💡 **Nowy pomysł właściciela → X13 „przewodnik opinii"**: strona podziękowania po pobycie z łączami do portali opinii (Google/Booking/Airbnb), na wzór przewodnika gościa. Decyzje: roadmapa NEXT (X13), MVP = strona per obiekt z ręcznym linkiem (bez danych osobowych, bez auto-wysyłki). Rozszerzenia odłożone w [[Projects/Backlog]].

### N1 — przywrócenie weryfikacji e-mail (bloker launchu, rozpoczęte Fable → dokończone Opus)
- ✅ Usunięty bypass z `b4aeb4e` w 3 miejscach: `App.jsx` (ProtectedRoute), `WynajemContext.jsx`, `LoginPanel.jsx`; wszystkie 3 TODO wycięte. Niezweryfikowane konto hasłowe nie wchodzi do panelu; Google pomija wymóg.
- ✅ Dowód pre-existing vs regresja: `auth.spec` padał 12/12 także BEZ zmian N1 (test na stashu) — porażki nie były regresją, tylko zastaną wadą mocka + stale selektorami.
- ✅ Naprawiony `e2e/firebase-mock.js`: dodane brakujące eksporty `firebase/auth` (`setPersistence`, `browserLocalPersistence`, `browserSessionPersistence`, `sendPasswordResetEmail`) — bez nich import ESM w LoginPanel padał i `/login` renderował pustą stronę (stąd 12 timeoutów).
- ✅ Zaktualizowane stale selektory pod v2: przełącznik trybu (`Rozpocznij 14-dniowy test` → zakładka `Rejestracja`), toggle hasła (ikona lucide → tekst `Pokaż`/`Ukryj`), akceptacja regulaminu (nowy wymóg v2 — klik `.wp4a-check__box` przed submitem rejestracji).
- ✅ **`auth.spec` 13/13** (było 0/12); pełna suita zaufana: auth 13 + panel-v2 4 + smoke 2 + spelling 4 = zielone. lint+build 0.
- ⏸ **Zostaje ręczny test właściciela** (real e-mail / emulator Auth) — bypass powstał przez App Check/403, runtime nie do sprawdzenia w środowisku agenta.

### X13 — „przewodnik opinii" zbudowany (MVP)
- ✅ Edytor w panelu (nawigacja 09 „Opinie"): szablon podziękowania + łącza do portali (presety Google/Booking/Airbnb/TripAdvisor/Facebook), kopiowanie publicznego linku, QR do wydruku w obiekcie
- ✅ Publiczna strona `/opinie/{id}` w identyfikacji v2 (.wpb, mobile-first) — podziękowanie przed prośbą, bez danych osobowych gościa
- ✅ Architektura: reużycie kolekcji `guides` z `type:'review'` → zero zmian w firestore.rules; GuideBuilder filtruje typy (przewodniki i strony opinii się nie mieszają)
- ✅ Publiczny odczyt przez anonimową sesję — dokładnie wzorzec GuestGuideView sprawdzony u gości na produkcji (odkrycie: reguły wdrożone mogą różnić się od repo → notatka przy N3)
- ✅ Weryfikacja: lint+build 0, e2e `review-pages.spec.js` 5/5 + regresja panel-v2/smoke 6/6; przegląd tonu `designer` w toku

### N4 — projekty dokumentów prawnych (agent `legal`)
- ✅ Cztery projekty w `docs/legal/`: `Regulamin.md`, `Polityka-prywatnosci.md`, `DPA-powierzenie.md`, `Checklista-zgodnosci.md` — oparte na kodzie (dwuwarstwowość danych, podpisy gości, sekrety, publiczny hostProfile) i źródłach oficjalnych (ISAP/UOKiK/UODO, linki w checkliście). Placeholdery zamiast zmyślonych danych firmy.
- ⚠️ **Kluczowe odkrycie (potwierdzone w kodzie):** `firestore.rules` ma zaślepione N1/N2/N3 — `isOwnerAndVerified` bez `email_verified` (`:9-13`), `hasActiveSubscription`→`true` (`:29-32`), `isValidRental/Guide`→`true` (`:38-62`). Nasze N1 działa na froncie, ale reguły backendu nie egzekwują ani weryfikacji, ani subskrypcji, ani schematu. Ujęte w roadmapie przy N1/N2/N3.
- 🔴 **Bramka legal**: dokumentów nie wolno publikować, dopóki N1–N3 nie wdrożone (rozliczalność RODO). Czeka: decyzje właściciela (dane firmy, VAT, founding members) + prawnik‑człowiek + wdrożenie `dev`.

---

## 2026-07-03

### Dopieszczanie UI — audyt i partia 1 (+ plan wdrożenia)
- ✅ `7e64c5a` + `9b4f363` — zielony `npm run lint`: scripts/archive + .agents/.claude w ignores ESLint, usunięty martwy `.eslintignore`
- ✅ `f2a6c17` — dopieszczenie v2: loader/toasty w tokenach, error boundary na `.wpb`, zero cieni (cookie bar, widget), press-scale, animacje modali i widoków
- ✅ Audyt UI (`designer`): 15 pozycji w 5 obszarach → [[Design-Notes]]; realizacja partiami 1–4
- ✅ `c89a3ce` — spelling.spec dogoniony do treści po `fb8a00e` (2 testy padały od reorganizacji, nie przez regresję)
- ✅ `0a7d12b` — **partia 1 audytu**: :focus-visible we wszystkich przestrzeniach, tokeny mikro-etykiet w WCAG AA (`--faint #716951`, `--label #746C54`, `--amber-ink #7E6119`), klasy widmowe, `.wpd-rotate`, spójne kolory kanałów (channelTone), `plural()` w utils, press-scale na landing/login, martwy App.css usunięty
- ✅ Plan wdrożenia na rynek → [[strategy/Plan-wdrożenia-na-rynek]] (strategist przerwany limitem — dokończony przez koordynatora)
- ✅ Partia 2 audytu (dostępność interakcji): hit-area ≥40px, klawiatura dla klikalnych kart/wierszy (`utils/a11y.js`), modale z Escape + fokus + `role=dialog` (`useDialogA11y`)
- ⚠️ Odkrycie: suita e2e w dużej mierze celuje w aplikację sprzed v2 (ui-scaling: Tailwind, teksty starego landinga) — pełny bieg to 33 passed / ~24 failed, wcześniejsze odczyty „33/33" błędne; plan naprawy: roadmapa X10, zalążek nowej suity `e2e/panel-v2.spec.js`
- 📋 Decyzje właściciela: partie 1–3 zatwierdzone · nawigacja mobilna = **dolny pasek** (roadmapa X12) · kontrast tokenów = minimalna korekta hexów (✅ w partii 1)

---

## 2026-07-02

### Zespół agentów + konsolidacja planowania
- ✅ Utworzono zespół 8 agentów w `.claude/agents/` (dev, code-reviewer, designer, seo, marketing, support, legal, strategist) + wspólna metodologia: [[Team-Playbook]]
- ✅ Konsolidacja planowania: [[Projects/Roadmap]] = jedyne źródło prawdy (NOW/NEXT/LATER); [[Projects/Milestones]] → sam widok dat; [[Projects/Backlog]] → poczekalnia pomysłów; „Do zrobienia w przyszłości" → wskaźnik na roadmapę
- ✅ Sprzątnięto nieaktualne dane planistyczne: fałszywe P0 w Backlogu (iCal token, storage leak), wróżone metryki (Lighthouse, godziny), 4 konkurujące listy „Next Steps"

### Aplikacja (commity 2026-06-30 → 2026-07-02)
- ✅ `76f53ff` — generator umów najmu (nawigacja 08)
- ✅ `ce2b80f` — przebudowa szczegółów rezerwacji: zadania zamiast przewodnika
- ✅ `af4af47` — widok Analityka: statystyki okresowe z porównaniem YoY
- ✅ `76a3059` — fix ujawniania danych dostępowych w przewodniku + restyl v2
- ✅ `c6f2975` — identyfikacja v2 na stronach publicznych i ekranach pobocznych
- ✅ `416b4cc` — baner zgody cookie w identyfikacji v2
- ✅ `fb8a00e` — porządek repo: jedna wersja produkcyjna (stare → `/_legacy`)
- ✅ `dd4aec2` — kreator przewodników V4 + limit uploadu 10 MB
- ⚠️ `b4aeb4e` — bypass weryfikacji e-mail dla testów V4 — **DO COFNIĘCIA przed launchem** (roadmapa N1)

---

## 2026-06-29

### Knowledge Base Expansion
- ✅ Created comprehensive Obsidian vault with 12+ documents
- ✅ Added critical Agent-Process-Map for fast code navigation
- ✅ Set up Projects tracking (Milestones, Backlog, WynajemPRO)
- ✅ Documented all features, architecture, tech stack
- ✅ Created debugging guide and performance optimization tips
- ✅ Added code patterns and best practices
- ✅ Setup resource library and glossary

**Impact**: Agents can now navigate code without grepping, saving 500+ tokens per session.

---

## 2026-06-28

### Firebase App Check Re-enabled
- ✅ Commit: 9f85a23 - "fix: Przywrócono App Check"
- Investigation: Was disabled for debugging (commit cbe1594)
- Status: Monitoring for issues

---

## 2026-06-25

### Google Login Loop Fixed
- ✅ Commit: 99cc65b - Fixed Google login redirect loop
- Issue: User got stuck in redirect after email verification
- Solution: Improved redirect logic in auth flow

---

## 2026-06-20

### X-Frame-Options Header Removed
- ✅ Commit: 2bad1ff - "fix: Zmiana X-Frame-Options na SAMEORIGIN"
- Issue: Header was blocking Firebase Auth iFrame
- Solution: Set to SAMEORIGIN to allow iframe from same origin

---

## 2026-06-15

### E2E Testing Infrastructure Completed
- ✅ Firebase Emulator configured
- ✅ Playwright setup complete
- ✅ Test scripts added to package.json
- ✅ Initial test files created

**Status**: Ready to write E2E tests

---

## 2026-06-10

### iCal Export Bug Discovered — later found FALSE
- 🔴 Reported: `secretToken` not generated on property create
- ✅ **2026-06-29 correction**: false alarm — `secretToken` IS generated in `ManagerApp.jsx` (create + legacy retrofit) and validated by `exportIcal`. No fix needed.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-06-05

### Storage Leak Bug Identified — later found FALSE
- 🔴 Reported: Guide files not deleted on account deletion
- ✅ **2026-06-29 correction**: false alarm — `deleteUserAccount` deletes Storage via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` before removing docs. No leak.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-05-20

### Project Setup Complete
- ✅ React + Vite scaffolding
- ✅ Firebase integration
- ✅ Stripe payments setup
- ✅ Initial UI components created

---

## 2026-01-20

### Real-time Data Hook Implemented
- ✅ `useFirebaseData.js` created
- ✅ Real-time Firestore listeners setup
- ✅ State synchronization working

---

## 2026-01-15

### Project Kickoff
- ✅ WynajemPRO project started
- ✅ Tech stack decided (React, Firebase, Stripe, Playwright)
- ✅ Architecture planned
- ✅ Initial Firebase setup

---

## Key Decisions Made

See: [[Decisions]] for detailed ADRs

1. **Firebase Backend-as-a-Service** (ADR-001)
2. **React + Vite Frontend** (ADR-002)
3. **Playwright E2E Testing** (ADR-003)
4. **Firestore Security Rules** (ADR-004)
5. **useFirebaseData Hook** (ADR-005)
6. **Guest Guide Signature Requirement** (ADR-006)
7. **iCal Export via Cloud Function** (ADR-007)
8. **Storage Organization** (ADR-008)
9. **Cloud Functions for Deletion** (ADR-009)
10. **Polish Language Default** (ADR-010)
11. **Email Verification Required** (ADR-011)
12. **Stripe for Payments** (ADR-012)

---

## Recent Commits

```
bd710e4 docs: Konfiguracja systemu pamięci i bazy wiedzy w Obsidian
9f85a23 fix: Przywrócono App Check
cbe1594 chore: Tymczasowe wyłączenie App Check w celu diagnozy błędu 401 logowania
2bad1ff fix: Usunięcie nagłówka X-Frame-Options, który blokował iframe autoryzacji Firebase
9aa1aa2 fix: Zmiana X-Frame-Options na SAMEORIGIN aby umożliwić działanie Firebase Auth iframe
```

See: `git log` for full history

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Commits | 20+ |
| E2E Tests Written | 8 |
| Documentation Pages | 16 |
| Known Bugs | 0 krytycznych (2 dawne = fałszywe alarmy, [[Known-Issues]]) |
| Features Working | 8+ |
| Time to Development | 6 months |

---

## Next Steps

➡️ **Przeniesione do [[Projects/Roadmap]]** (jedyne źródło prawdy planowania).
Log nie prowadzi własnej listy zadań — poprzednia natychmiast rozjechała się
z Milestones i Backlogiem. Tu zostaje wyłącznie historia.

---

## Lessons Learned

1. **Real-time data sync**: useFirebaseData hook essential for Firebase apps
2. **Security first**: Firestore rules catch bugs early
3. **Test early**: E2E tests would have caught bugs earlier
4. **Documentation matters**: Clear docs speed up development
5. **Polish language**: Important for target market

---

## Contributing

When adding updates:

1. Add entry at top of this file (most recent first)
2. Include date and description
3. Link to related issues/PRs/docs
4. Update commit sha if applicable

---

**Last Updated**: 2026-07-02  
**Maintained By**: Szymon + Claude

---

**Related**: [[Projects/Milestones]], [[Known-Issues]], [[Decisions]]

