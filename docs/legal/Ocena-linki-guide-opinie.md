# Ocena prawna (RODO/prywatność): publiczny dostęp do stron gościa `/guide/:guideId` i `/opinie/:pageId`

**Status:** analiza robocza agenta `legal` (2026-07-22; zgłoszenie od `seo` przy X9, zlecenie właściciela). **To nie jest opinia prawna** — ustalenia i projekty zapisów wymagają weryfikacji prawnika-człowieka przed wdrożeniem. Nawiązuje do wcześniejszych analiz: [[Checklista-zgodnosci]] (N4) i [[Uwagi-N5-dla-prawnika]] (N5) — nie dubluje ich ustaleń, tylko odsyła.

---

## 1. Stan faktyczny z kodu (fakty, z plikami i liniami)

**Model dostępu — potwierdzony:**
- Obie trasy są publiczne, bez logowania: `src/App.jsx:134-135`. Gość dostaje anonimową sesję Firebase i czyta pojedynczy dokument (`GuestGuideView.jsx:39-55`, `ReviewPageView.jsx:26-42`).
- `firestore.rules:200` — `allow get: if true`: **każdy znający ID czyta CAŁY dokument bazowy** (reguły Firestore nie filtrują pól przy odczycie). `list` tylko dla właściciela (`firestore.rules:201`, naprawa N5-1). Minimalizację pól realizuje architektura, nie reguła odczytu: allowlista schematu (`firestore.rules:120-134`) + sekrety w subkolekcji.
- Publicznie czytelne pola przewodnika: `name`, `propertyId`, `coverImage`, `checkInInfo` (do 15 000 znaków — instrukcje dotarcia, w praktyce często adres obiektu), `houseRules`, `ppoRules`, `houseRulesFile` (URL), `mapLink` (precyzyjna pineska = lokalizacja), `attractions`, `hasSensitiveData`, `ownerId`. Na starych dokumentach reguły tolerują legacy `wifiNetwork/wifiPassword/doorPin` (`firestore.rules:123-125`), ale produkcja zaudytowana na zero takich przypadków (Uwagi-N5, sekcja A.2).
- `ownerId` jest publiczny i otwiera publiczny odczyt `users/{ownerId}/settings/publicContact` (`firestore.rules:175-176`): nazwa, telefon, e-mail gospodarza — renderowane w sekcji „Kontakt z gospodarzem" (`GuestGuideView.jsx:364-387`).
- **Sekrety (Wi-Fi, kod do drzwi):** `guides/{id}/secrets/data`, odczyt po istnieniu rekordu podpisu dla danej sesji (`firestore.rules:231-233`). Ale rekord podpisu tworzy sobie **każda anonimowa sesja sama**, klikając checkboxy i „Odkryj dane dostępowe" (`GuestGuideView.jsx:112-135`, `firestore.rules:246-254`). Bramka akceptacji to click-through, nie uwierzytelnienie — **efektywnie każdy posiadacz linku uzyskuje kod do drzwi**.
- **Brak wygasania — potwierdzony:** schemat przewodnika nie ma żadnego pola daty ważności, żaden kod nie sprawdza terminu; link działa do usunięcia przewodnika. Brak PIN-u pobytu, brak rotacji.
- Entropia ID: `guide_` + `crypto.randomUUID()` (~122 bity) — `GuideBuilder.jsx:58-76`; analogicznie `review_` w `ReviewBuilder.jsx:77-78`. Fallback `Math.random()` dla starych przeglądarek **nie jest kryptograficzny** (drobiazg).
- Pliki: `storage.rules:16-18` — `guides/{guideId}/**` publiczny odczyt (okładka, plik regulaminu obiektu).

**Warstwa X9 (SEO) — zweryfikowana:** `public/robots.txt:12-16` (`Disallow: /guide`, `/opinie`), `SeoTags.jsx:33,85-96` (`noindex, nofollow` przez JS). **Rozjazd deklaracja/stan:** komentarz `SeoTags.jsx:30-31` twierdzi, że w `firebase.json` jest lustrzany nagłówek `X-Robots-Tag` — **nie ma go** (`firebase.json:23-44`). `Referrer-Policy: strict-origin-when-cross-origin` jest globalnie (`firebase.json:36-38`), a linki wychodzące z obu stron mają `rel="noreferrer"`/`noopener noreferrer` (`GuestGuideView.jsx:271,287,302`; `ReviewPageView.jsx:104`) — pełny URL z tokenem nie wycieka przez referrer.

**NOWE USTALENIE — wyciek tokenu linku do Google Analytics:** `AnalyticsTracker` loguje `page_view` z `page_path = pathname + search` na **każdej** trasie, w tym `/guide/{guideId}` i `/opinie/{pageId}` (`src/App.jsx:59-72`, montaż linia 118). Baner cookie renderuje się globalnie, także na stronach gościa (`App.jsx:153`; `ConsentNotice.jsx` nie filtruje ścieżek). Po zgodzie gościa pełny „nieodgadywalny" identyfikator — jedyna bariera dostępu — jest systematycznie kopiowany do zewnętrznego systemu (GA/Google) i tam przechowywany.

**Identyfikowalność gościa:** na `/guide` i `/opinie` **żadne dane osobowe gościa nie są wyświetlane**. Rekord akceptacji jest pseudonimowy (UID sesji anonimowej, data, migawki regulaminów — `GuestGuideView.jsx:117-125`), czytelny tylko dla tej sesji i właściciela (`firestore.rules:245,257`). Ryzyko rezydualne: gospodarz może wkleić dane osobowe w pola wolnotekstowe (`checkInInfo`, `message` strony opinii) — odpowiedzialność gospodarza jako administratora, do zaadresowania ostrzeżeniem/edukacją.

**Dokumenty i UI:** ani działające strony (`src/pages/PrivacyPage.jsx:24` — jedna ogólnikowa wzmianka; `TermsPage.jsx` — brak), ani projekty (`docs/legal/Polityka-prywatnosci.md`, `Regulamin.md:52`, `DPA-powierzenie.md:32,45`) **nie mówią wprost, że link daje dostęp każdemu, kto go zna**. `GuideBuilder.jsx` przy „Udostępnij gościom" (linia 379) nie ma żadnego ostrzeżenia; `ReviewBuilder.jsx:253-254` ma („Strona jest publiczna i nie zawiera danych gościa") — wzorzec do przeniesienia.

---

## 2. Odpowiedzi na pytania (interpretacja prawna)

**Ad 1. Czy „nieodgadywalny link" wystarcza pod art. 32 RODO?** Interpretacja: **jako fundament — tak, obronny; w obecnym otoczeniu — jeszcze nie.** Art. 32 wymaga środków „odpowiednich do ryzyka" (podejście ryzykowe, nie katalog zamknięty; z art. 25 — privacy by design/default). Ekspozycja danych osobowych przez link jest ograniczona: głównie zminimalizowany kontakt gospodarza (`publicContact`), zero danych gościa. Capability-URL o entropii UUIDv4, bez listowania, z noindex i Referrer-Policy, z sekretami w oddzielnej subkolekcji — to poziom porównywalny z praktyką rynkową (kody i tak wysyła się mailem/SMS-em). **Ale** trzy rzeczy podważają dziś obronność: (1) token wycieka do GA (systemowe kopiowanie jedynej bariery do strony trzeciej), (2) nieograniczony czas życia linku **plus** ustalenie N5 C.1 (po czyszczeniu karencyjnym przewodniki z sekretami pozostają publiczne — art. 5 ust. 1 lit. e), (3) gospodarz nie jest poinformowany, że link to „token na okaziciela" — a to on, jako administrator, decyduje o tym kanale. **Kod do drzwi:** to przede wszystkim bezpieczeństwo fizyczne mienia, nie dane osobowe (kod odnosi się do nieruchomości, nie do zidentyfikowanej osoby). Ryzyko prawne leży tu głównie w KC (należyta staranność usługodawcy, odpowiedzialność kontraktowa/deliktowa przy włamaniu z użyciem wyciekłego kodu), nie w karze PUODO — ale zestaw „mapLink + checkInInfo + kod po click-through" ujawnia jednocześnie *gdzie* i *jak wejść*, więc środki uzupełniające (rotacja kodu, ograniczenie życia linku) są proporcjonalne i tanie.

**Ad 2. Audyt danych** — patrz sekcja 1. Kluczowe: reguła oddaje cały dokument, minimalizacja działa przez schemat + subkolekcję (dobra architektura po N5); gość nigdzie nie jest publicznie identyfikowalny; jedyne dane osobowe eksponowane po linku to dane gospodarza (`publicContact`) i ewentualne treści wolnotekstowe.

**Ad 3. Dokumenty i role:** układ ról prawidłowo zaprojektowany w projektach N4: gospodarz = administrator danych gości i treści przewodnika; WynajemPRO = procesor (DPA) oraz **administrator** danych gospodarza (`publicContact`) i — uwaga — **administrator danych analitycznych gościa** na stronach publicznych (GA po zgodzie; ta rola nie jest nigdzie opisana). Luka wspólna wszystkich dokumentów: mechanizm „dostęp dla każdego z linkiem" nie jest opisany ani w Polityce (odbiorcy danych), ani w Regulaminie (odpowiedzialność gospodarza za dystrybucję linku), ani w DPA (charakterystyka przetwarzania, którą administrator świadomie akceptuje — art. 28 ust. 3). Do domknięcia razem z blokerem N4 (dokumenty i tak czekają na prawnika).

---

## 3. Tabela ustaleń

| # | Obszar | Stan obecny | Ryzyko | Priorytet | Rekomendacja | Podstawa |
|---|---|---|---|---|---|---|
| 1 | Token linku w GA | `App.jsx:59-72` wysyła pełny `/guide/{id}` do Google Analytics po zgodzie cookie | Jedyna bariera dostępu kopiowana do systemu strony trzeciej; osłabia obronność całego modelu z art. 32 | **BLOKER** | `dev`: maskować ID w `page_path` dla `/guide` i `/opinie` (np. `/guide/[id]`) — zmiana jednolinijkowa | art. 32, art. 25 RODO |
| 2 | Cykl życia linku vs retencja | Link bez wygasania + N5 C.1: po czyszczeniu karencyjnym przewodniki i sekrety zostają publiczne | Bezterminowy publiczny dostęp do instrukcji wejścia po ustaniu usługi | **BLOKER** (już otwarty w N5 C.1) | Domknąć C.1 (kaskada czyszczenia obejmuje `guides` + subkolekcje + Storage) | art. 5 ust. 1 lit. e, art. 28 ust. 3 lit. g, art. 32 RODO |
| 3 | Świadomość gospodarza | `GuideBuilder.jsx:379` — „Udostępnij gościom" bez ostrzeżenia | Administrator (gospodarz) nie wie, że link = dostęp dla każdego; podważa jego decyzję o kanale | **BLOKER** (koszt minimalny) | `dev`: notka przy linku — brzmienie w sekcji 4 | art. 24, 32 RODO (po stronie gospodarza); rzetelność wobec klienta |
| 4 | Opis mechanizmu w dokumentach | Polityka/Regulamin/DPA (projekty i live) nie opisują dostępu „po linku" | Niepełny obowiązek informacyjny; DPA nie charakteryzuje przetwarzania | **BLOKER** (w ramach N4, i tak otwartego) | Uzupełnić projekty przed wysyłką do prawnika — konkrety w sekcji 4 | art. 13, art. 28 ust. 3 RODO |
| 5 | Rola: analityka na stronach gościa | Baner cookie + GA na `/guide`, nieopisane w Polityce | Nienazwana rola administratora wobec gościa (analityka) | WAŻNE | Po wdrożeniu #1: jedno zdanie w Polityce o analityce na stronach publicznych | art. 13 RODO; art. 173 Pr. tel. |
| 6 | `X-Robots-Tag` | Komentarz `SeoTags.jsx:30-31` deklaruje nagłówek, którego nie ma w `firebase.json` | Rozjazd deklaracja/stan; boty bez JS nie widzą noindex | WAŻNE | `dev`: dodać nagłówek dla `/guide/**` i `/opinie/**` w `firebase.json` albo poprawić komentarz | zasada rozliczalności (art. 5 ust. 2) — spójność deklaracji |
| 7 | Kod do drzwi = bezpieczeństwo fizyczne | Click-through wystarcza do odczytu PIN; brak rotacji linku | Odpowiedzialność cywilna przy incydencie z wyciekłym kodem (spór, nie kara PUODO) | WAŻNE | Edukacja w pomocy (rotacja kodu między pobytami) + opcja „nowy link" — sekcja 4b | KC (należyta staranność); art. 32 wspierająco |
| 8 | Notka dla gościa przy akceptacji | Brak informacji, że zapis trafia do bazy (N5 C.8) | Obowiązek informacyjny gospodarza, Operator „pomaga" | WAŻNE (już w N5) | Jak N5 C.8 | art. 28 ust. 3 lit. e RODO |
| 9 | Fallback `Math.random()` | `GuideBuilder.jsx:62`, `ReviewBuilder.jsx:78` | Teoretycznie odgadywalne ID w archaicznych przeglądarkach | PORZĄDKOWE | Usunąć fallback (wymóg `crypto.randomUUID`) | art. 32 RODO |
| 10 | Wolny tekst = potencjalne dane osobowe | `checkInInfo`/`message` bez ograniczeń treści | Gospodarz może opublikować dane osobowe po linku | PORZĄDKOWE | Zdanie w pomocy/DPA: zakaz danych osobowych gości w treściach publicznych | art. 5 ust. 1 lit. c RODO |

---

## 4. Rekomendacje wg wdrażalności (proporcjonalne do mikro-SaaS)

**(a) Wymagane przed launchem** — pozycje 1–4 z tabeli. Konkrety:
- **Mikrocopy do GuideBuildera** (projekt, do akceptacji): *„Każdy, kto zna ten link, może otworzyć przewodnik, a po zaakceptowaniu regulaminu zobaczyć też hasło Wi-Fi i kod do drzwi. Wysyłaj go tylko gościom i nie publikuj go w ogłoszeniach."*
- **Polityka prywatności** (do wiersza o przewodnikach): odbiorcy = „każda osoba dysponująca linkiem przewodnika" (spójnie z propozycją Uwagi-N5 B1.1 dla `publicContact`).
- **Regulamin** (§4 lub §8): gospodarz odpowiada za to, komu udostępnia link przewodnika; Operator nie kontroluje dalszej dystrybucji linku.
- **DPA** (§2/§6): charakter przetwarzania obejmuje publikację treści przewodnika pod nieodgadywalnym adresem URL dostępnym bez uwierzytelnienia; opis środków (separacja sekretów, brak listowania, noindex, Referrer-Policy).

**(b) Zalecane (po launchu, niski koszt):** przycisk „Wygeneruj nowy link" w GuideBuilderze (nowy ID dokumentu z przeniesieniem treści — unieważnia stare linki po sezonie/gościu); artykuł w bazie wiedzy o rotacji kodu do drzwi między pobytami; `X-Robots-Tag` (poz. 6); usunięcie fallbacku `Math.random` (poz. 9); notka dla gościa (poz. 8).

**(c) Opcjonalne (tylko jeśli rynek o to poprosi):** data ważności linku ustawiana przez gospodarza (pole + walidacja w regułach), opcjonalny PIN pobytu, link per pobyt zamiast per obiekt. Nierekomendowane na start — łamią prostotę produktu, a ryzyko rezydualne po (a)+(b) ocenione jako akceptowalne i porównywalne z praktyką rynkową (ocena do potwierdzenia przez prawnika).

---

## 5. Decyzje wymagające właściciela

1. Akceptacja maskowania ID w GA (utrata rozróżnienia odsłon per przewodnik w analityce — zostaje zbiorcze `/guide/[id]`).
2. Czy wdrażać „Wygeneruj nowy link" przed launchem, czy po (rekomendacja: po).
3. Brzmienie ostrzeżenia w GuideBuilderze (projekt wyżej) — do przekazania `dev`.
4. Czy warstwa (c) w ogóle wchodzi na roadmapę (rekomendacja: Later / na żądanie rynku).
5. Zgoda na uzupełnienie projektów N4 (Polityka/Regulamin/DPA) o opis mechanizmu linku przed wysyłką do prawnika.

**Podstawy prawne i źródła:** artykuły RODO przywołane w ślad za weryfikacjami u źródeł z 2026-07-04 i 2026-07-15 (sekcje C/E w [[Checklista-zgodnosci]] i [[Uwagi-N5-dla-prawnika]]). Próba bezpośredniego odczytu EUR-Lex i podstrony UODO o art. 32 (2026-07-22) nie powiodła się technicznie (404/pusta treść) — **dokładne brzmienie przepisów potwierdza prawnik z własnego źródła urzędowego**. Brak publikowanej decyzji PUODO oceniającej wprost model „dostępu po nieodgadywalnym linku" — kwalifikacja z sekcji 2 pkt 1 to interpretacja oparta na ryzykowym charakterze art. 32 i wymaga potwierdzenia przez prawnika.

Źródła: [UODO — wyszukiwarka orzeczeń](https://orzeczenia.uodo.gov.pl/search) · [UODO — udostępnienie danych](https://uodo.gov.pl/pl/352/1019)

**Disclaimer:** Materiał roboczy compliance przygotowany przez agenta `legal` na podstawie stanu kodu z 2026-07-22. Nie stanowi porady prawnej. Wszystkie oceny, kwalifikacje i projekty zapisów wymagają weryfikacji prawnika-człowieka przed wiążącym użyciem.
