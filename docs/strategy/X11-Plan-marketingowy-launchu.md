# X11 — Plan marketingowy launchu

> **Status:** ✅ plan gotowy (2026-08-18), z decyzjami właściciela z tego samego dnia: bramka bety
> **5–10 gospodarzy z pełnym cyklem**, model dostępu **founding members z ceną z góry**.
> ⏸ Otwarte i blokujące: warunki oferty founding members (3 liczby od właściciela), obsługa dostępu
> bety po stronie `dev` (7a.3) oraz zdarzenia aktywacyjne (sekcja 6) — **warunek wstępny reklamy**.
> Nadrzędny dokument strategiczny: [[strategy/Plan-wdrożenia-na-rynek]] (2026-07-03) — ten plik
> **domyka jego dwie świadome luki**: research konkurencji i potwierdzenie ICP.
> Stan planowania: [[Projects/Roadmap]] X11.

---

## 1. Co ten dokument rozstrzyga, a czego nie

**Rozstrzyga:** kto jest realną konkurencją i po ile, gdzie stoi nasz klin cenowo-funkcjonalny,
jakim jednym zdaniem opisujemy produkt, którymi kanałami wchodzimy i po czym poznamy, że kanał działa.

**Nie rozstrzyga:** daty launchu (zależy od prawnika — [[Projects/Roadmap]] N4) ani wydatków
reklamowych (decyzja właściciela; playbook zabrania agentom deklarowania budżetów).

⚠️ **Zasada dowodu.** Ceny i funkcje konkurentów pochodzą z ich własnych stron, z datą odczytu.
Nie przepisujemy opinii z porównywarek jako faktów o produkcie — one żyją z prowizji afiliacyjnych.
Wszystko poniżej sprawdzone **2026-08-18**; ceny się zmieniają, więc przed launchem warto rzut oka.

---

## 2. Konkurencja — mapa rynku (stan na 2026-08-18)

Rynek nie jest pusty, ale **dzieli się na trzy kategorie, z których żadna nie celuje dokładnie
w naszego gospodarza**. To jest nasza szansa i zarazem ostrzeżenie: nie wygramy liczbą funkcji.

### Kategoria A — międzynarodowe channel managery (Smoobu, Lodgify)

- **Model cenowy: za obiekt.** Smoobu: **26,10 €/mc** przy płatności rocznej + **0,9% prowizji
  od rezerwacji**, albo **31,50 €/mc** w wariancie bez prowizji; wyższy plan 49,50 €/mc.
- Przy kursie ~4,3 zł to **ok. 112–135 zł miesięcznie za JEDEN obiekt**. Gospodarz z dwoma
  domkami płaci 220–270 zł/mc, z trzema — ponad 330 zł.
- Mocne: dojrzała synchronizacja z portalami, strona rezerwacyjna, aplikacja mobilna.
- Słabe dla naszego ICP: **cena rośnie liniowo z liczbą obiektów**, interfejs i wsparcie
  po angielsku lub w tłumaczeniu, brak polskich realiów podatkowych (ryczałt, PIT-28).

### Kategoria B — polskie systemy „księgowo-rozliczeniowe" (MójWynajem, Rentumi)

- **MójWynajem: 26–29 zł/mc** dla pakietu 1–5 umów, 73–79 zł dla 6–20, 139–149 zł powyżej 20.
  Taniej przy zobowiązaniu rocznym, 2 miesiące testowe gratis.
- Rdzeń: **rozliczenia i księgowość** — faktury z integracją KSeF, ryczałt (8,5% / 17%),
  amortyzacja, odliczanie kosztów kredytu, rozliczanie mediów z liczników, wezwania do zapłaty.
- Obsługuje najem długoterminowy **i** krótkoterminowy, ale język produktu jest o **umowach
  i najemcach**, nie o gościach i pobytach.
- ⚠️ **To jest nasz najbliższy konkurent cenowo** — praktycznie ta sama półka co nasze 29,99 zł.
  Różnicy trzeba szukać w tym, co robimy lepiej, a nie w cenie.

### Kategoria C — systemy hotelowe z modułem gościa (Ekoncept, KWHotel, Guestivo)

- Meldunek online, klucze mobilne, kody PIN do zamków, komunikacja z gościem — czyli
  **funkcjonalnie najbliżej naszego przewodnika gościa**.
- Adresowane do **hoteli i obiektów z recepcją**; wdrożenie i cennik negocjowany.
- Dla gospodarza z dwoma domkami to armata na wróbla — i tak jest komunikowane.

### Kategoria D — polskie systemy dla apartamentów na wynajem krótkoterminowy

- Przykład: `najem-krotkoterminowy-system.pl` — synchronizacja iCal z Booking/Airbnb,
  grafiki dla sprzątających, powiadomienia SMS/e-mail, Przelewy24, raporty obłożenia.
- **Cennika nie ma na stronie** — kontakt telefoniczny i mailowy. To sygnał sprzedaży
  negocjowanej, nie samoobsługowej.
- **Brak przewodnika gościa** w opisie funkcji.

### Kategoria E — status quo, czyli realny konkurent numer jeden

**Excel, kalendarz Google, notatki w telefonie i pamięć.** Hipoteza z planu wdrożenia
(2026-07-03) pozostaje w mocy: większość gospodarzy z 1–5 obiektami nie płaci dziś nikomu.
Z nimi nie konkurujemy funkcjami, tylko **czasem wdrożenia i ceną pierwszego miesiąca**.

---

## 3. Nasza pozycja — gdzie jest klin

Trzy różnice, które wynikają z powyższej mapy i **dają się obronić faktami**, a nie hasłami:

1. **Płacisz za konto, nie za obiekt.** 29,99 zł miesięcznie niezależnie od tego, czy masz
   jeden domek, czy pięć. U channel managera piątka obiektów to koszt rzędu kilkuset złotych.
   To jest najostrzejsza, najłatwiejsza do sprawdzenia różnica — **i powinna stać w cenniku wprost**.
2. **Przewodnik gościa z danymi dostępowymi po akceptacji regulaminu.** Kod do drzwi i hasło WiFi
   pokazują się dopiero, gdy gość zaakceptuje regulamin, a akceptacja zostaje zapisana z podpisem.
   To nie jest wygoda — to **ochrona prawna gospodarza przy sporze**. Kategoria B tego nie ma,
   kategoria C ma, ale w cenie systemu hotelowego.
3. **Polskie realia rozliczeniowe w produkcie dla najmu krótkoterminowego.** Ryczałt, VAT,
   prowizje portali i koszty stałe w jednym raporcie, z eksportem dla księgowego.
   Kategoria A tego nie zna, kategoria B zna — ale mówi językiem umów najmu, nie pobytów.

**Czego NIE mówimy:** że jesteśmy „najlepszym channel managerem" (nie jesteśmy — mamy
synchronizację iCal, nie dwustronną integrację API) ani że „zastępujemy księgowego"
(nie zastępujemy — dajemy zestawienie, nie deklarację podatkową). Obietnice ponad stan
wracają jako churn w drugim miesiącu.

**Jedno zdanie do testu w komunikacji:**
> Jeden panel do wynajmu krótkoterminowego: kalendarz wszystkich obiektów, przewodnik dla gościa
> z kodem po akceptacji regulaminu i rozliczenie dla księgowego. Stała cena za konto, nie za obiekt.

---

## 4. ICP — POTWIERDZONE 2026-08-18

**ICP-A z planu wdrożenia potwierdzone, i to w najmocniejszy możliwy sposób: właściciel jest
instancją własnego ICP.** Prowadzi Domki Letniskowe Ruś, obsługuje gości sam, sprzedaje przez
Booking, Airbnb i Facebook, rozlicza się ryczałtem, działa na działalności nierejestrowanej.
Dokładnie ten profil opisuje hipoteza ICP-A — z tą różnicą, że nie trzeba go zgadywać.

**Konsekwencja dla komunikacji:** produkt nie jest „rozwiązaniem dla branży", tylko narzędziem,
które gospodarz zbudował sobie, bo Excel przestał wystarczać. To jest historia, którą inni
gospodarze rozpoznają — i której nie da się podrobić w agencji.

**ICP-B (najem długoterminowy)** zostaje poza celowaniem. Uzasadnienie z sekcji 2: tam stoi
MójWynajem z językiem umów, najemców i KSeF-a — walka na jego terenie, o klienta, którego
nie rozumiemy z własnego doświadczenia.

---

## 5. Kanały wejścia — decyzja

Ramy z odpowiedzi właściciela (2026-08-18): **5–10 godzin tygodniowo**, **do 500 zł/mc**
na reklamę, **brak własnej sieci gospodarzy** do zaproszenia, **zgoda na case study
z Domków Ruś z liczbami i zdjęciami**.

Ten układ przesądza kolejność: skoro nie ma kogo zaprosić, **cichy start trzeba zrekrutować**,
a rekrutacja bierze się z obecności w miejscach, gdzie ci ludzie już są.

### K1 — społeczności wynajmujących (główny, start natychmiast)

Grupy na Facebooku dla gospodarzy najmu krótkoterminowego, fora, lokalne grupy turystyczne.
**Wchodzisz tam jako gospodarz z Rusi, nie jako sprzedawca oprogramowania** — odpowiadasz na
pytania o rozliczenia, obłożenie, obsługę gości. Produkt pojawia się wtedy, gdy jest odpowiedzią
na konkretne pytanie, a nie w każdym poście.

- **Dlaczego to, przy 5–10 h/tydz.:** to jedyny kanał, który przy zerowej sieci daje jednocześnie
  pierwszych testerów **i** zrozumienie, jakim językiem ci ludzie opisują swój problem.
  Tego nie kupi się za 500 zł.
- **Test (mierzalny, bez wróżenia):** przez 4 tygodnie — ile wartościowych odpowiedzi udzielono,
  ile z nich skończyło się kliknięciem w link z `utm_source`, ile rejestracją, ile ukończonym
  onboardingiem. **Kryterium kontynuacji ustala właściciel po pierwszym pomiarze** — nie
  wpisujemy tu wymyślonej liczby.
- **Ryzyko:** grupy nie znoszą autopromocji i potrafią wyprosić. Stąd zasada „najpierw pomoc,
  potem produkt" i **zero** postów sprzedażowych w pierwszych dwóch tygodniach.

### K2 — Google Ads na intencję (test płatny, po launchu)

Przy 500 zł/mc **wybieramy wyszukiwarkę, nie social**. Powód jest arytmetyczny: reklama
na Facebooku przy tym budżecie kupuje zasięg wśród ludzi, którzy niczego nie szukają,
a wyszukiwarka kupuje kliknięcia ludzi, którzy właśnie wpisali problem. Przy stawkach
rzędu kilku złotych za kliknięcie 500 zł to setki wejść z intencją — dość, żeby zmierzyć
konwersję, za mało, żeby cokolwiek przepalić.

- **Frazy long-tail**, nie ogólne: „program do zarządzania wynajmem krótkoterminowym",
  „kalendarz rezerwacji dla domków", „rozliczenie najmu krótkoterminowego ryczałt".
- **Warunek startu:** działający pomiar aktywacji (sekcja 6). Reklama bez tego to kupowanie
  rejestracji, o których nie wiemy, czy cokolwiek znaczą.

### K3 — SEO i blog (fundament, efekt odroczony)

X9 zostawił otwarty audyt indeksowalności SPA i plan treści. Przy 5–10 h/tydz. **nie jest to
kanał na start**, ale każdy tekst napisany teraz pracuje przez lata. Treści biorą się z K1:
piszemy o pytaniach, które realnie padają w grupach.

### Świadomie NIE robimy

Płatnego Facebooka i Instagrama (budżet za mały na testowanie kreacji), LinkedIna (nie ma tam
gospodarzy z dwoma domkami), programu partnerskiego dla księgowych (pomysł z Backlogu — dobry,
ale wymaga produktu z historią, a nie zapowiedzi).

---

## 6. Metryki — i luka, którą trzeba domknąć PRZED reklamą

⚠️ **Stan faktyczny sprawdzony w kodzie 2026-08-18: mierzymy tylko `login`, `sign_up`
i `page_view`.** Nie wiemy więc, czy ktoś po rejestracji dodał obiekt, rezerwację albo
opublikował przewodnik — czyli **nie mierzymy aktywacji, tylko rejestracje**.

To jest bloker dla K2: puszczanie reklamy przy takim pomiarze oznacza płacenie za liczbę,
która nie mówi nic o wartości. Potrzebne zdarzenia (zadanie dla `dev`, sprzężone z X10):

| Zdarzenie | Co mierzy |
|---|---|
| `first_property_added` | czy użytkownik w ogóle zaczął konfigurację |
| `first_booking_added` | czy wprowadził realne dane, a nie tylko kliknął |
| `first_guide_published` | czy dotarł do funkcji, która jest naszym wyróżnikiem |
| `checkout_started` / `subscription_active` | czy trial przeszedł w płatność |

Do tego **`utm_source` przy rejestracji** — bez tego nie odróżnimy wejścia z grupy od wejścia
z reklamy. ⚠️ Uczciwe zastrzeżenie: analityka działa **po zgodzie na cookies**, więc część
ruchu pozostanie niepoliczona. Liczby będą zaniżone i tak trzeba je czytać.

**Pomiar bazowy przed celami.** Zgodnie z zasadą z [[Projects/WynajemPRO]]: najpierw miesiąc
zbierania danych, cele dopiero z tego, co wyjdzie.

---

## 7. Sekwencja i ryzyka

### Sekwencja

| Faza | Kiedy | Co się dzieje |
|---|---|---|
| **0. Dowód** | teraz, nie czeka na prawnika | Case study z Domków Ruś: realne zrzuty panelu, przewodnik gościa, raport rentowności za rok. Materiał na landing, do postów i do rozmów. **Jedyna rzecz, którą można zrobić w 100% przed launchem.** |
| **1. Rekrutacja cichego startu** | równolegle z fazą 0 | Obecność w K1 → zaproszenie 5–10 gospodarzy do bety z ofertą founding members. Cel: ktoś obcy przechodzi pełny cykl (rejestracja → obiekt → rezerwacja → przewodnik). |
| **2. Launch publiczny** | po odpowiedzi prawnika (N4) | Ogłoszenie w kanałach z fazy 1 + start testu K2. |

### Pre-mortem — „launch się nie udał, co zawiodło?"

1. **Solo-founder się zatkał.** 5–10 h na marketing + support + poprawki w produkcie + własny
   wynajem w sezonie. To najpoważniejsze ryzyko i nie znika przez dobre planowanie.
   Mitygacja: faza 1 celowo mała (5–10 osób), a nie „ilu się zgłosi".
2. **Cena nie jest przewagą.** MójWynajem stoi na 26–29 zł — praktycznie nasza półka.
   Jeśli komunikacja pójdzie w „tanio", przegramy z kimś, kto ma dłuższą historię.
   Mitygacja: komunikujemy **model** (za konto, nie za obiekt) i **przewodnik gościa**, nie cenę.
3. **Case study jednego obiektu wygląda jak jeden użytkownik.** Dopóki nie ma obcych głosów,
   dowód jest miękki. Mitygacja: faza 1 przed fazą 2, nie odwrotnie.
4. **Reklama ruszyła przed pomiarem aktywacji** i spaliła budżet na rejestracje-widma.
   Mitygacja: K2 ma twardy warunek wstępny z sekcji 6.
5. **Prawnik odpowiada później niż myślimy.** Marketing będzie gotowy wcześniej niż launch —
   i dobrze, ale nie wolno wtedy wydać budżetu „żeby coś się działo".

---

## 7a. Cichy start — zasady i pułapki (plan właściciela z 2026-08-18)

**Plan właściciela:** działać na grupach facebookowych, dawać dostęp w zamian za feedback
co 2 tygodnie, cel — **20 osób stale użytkujących aplikację**.

Kierunek dobry i spójny z K1. Trzy rzeczy wymagają jednak rozstrzygnięcia, zanim ruszy.

### 1. Rozdzielić „kryterium wyjścia z bety" od „celu pierwszego etapu"

**20 stale użytkujących jako bramka przed publicznym launchem jest zbyt wysoko postawione.**
Żeby mieć 20 osób **używających**, trzeba pozyskać wielokrotnie więcej rejestracji — część nie
przejdzie onboardingu, część odpadnie po tygodniu. Przy 5–10 h tygodniowo w grupach to miesiące
pracy. W tym czasie prawnik może odpowiedzieć, a my dobrowolnie odkładalibyśmy start sprzedaży,
płacąc za infrastrukturę.

**✅ ROZSTRZYGNIĘTE przez właściciela 2026-08-18 — zgoda na rozdzielenie:**
- **Bramka przed publicznym launchem: 5–10 gospodarzy**, z których **każdy przeszedł pełny cykl**
  (rejestracja → obiekt → rezerwacja → opublikowany przewodnik gościa). To wystarczy, żeby
  wiedzieć, że onboarding nie jest zepsuty — a o to w becie chodzi.
- **20 stale użytkujących = cel pierwszego etapu PO launchu**, nie warunek jego rozpoczęcia.

### 2. Darmowy dostęp mierzy użycie, ale NIE mierzy gotowości do zapłaty

To jest najpoważniejsza uwaga do planu. Dwadzieścia zadowolonych osób korzystających za darmo
**nie jest dowodem, że ktokolwiek zapłaci 29,99 zł**. Klasyczna pułapka bety: produkt „się podoba",
a przy pierwszej fakturze okazuje się, że wartość była w tym, że nic nie kosztował.

**✅ ROZSTRZYGNIĘTE przez właściciela 2026-08-18: founding members z ceną podaną z góry.**
Oferta **founding members** (rozstrzygnięta w cenniku 2026-07-04) zamiast bezterminowego „za darmo": dostęp bezpłatny na czas bety, ale **z ceną podaną z góry** i jawną
datą, od której zaczyna obowiązywać, plus obiecany rabat dla uczestników. Wtedy z tej samej grupy
dostajesz dwa sygnały: czy używają **i** czy zostają, gdy trzeba zapłacić.
⚖️ Warunki oferty founding members to jedno z miejsc `[DO UZUPEŁNIENIA]` w Regulaminie §6 —
przed pierwszym zaproszeniem trzeba je opisać, bo to zobowiązanie wobec konsumenta.

### 3. Nadanie dostępu jest dziś operacją ręczną z kluczem serwisowym

Sprawdzone w `firestore.rules` i `functions/index.js` (2026-08-18):

- Dostęp reguluje `status` (`trialing` / `active`) i `trialEndsAt`. **Klient nie może zmienić
  żadnego z tych pól** — reguły blokują to jawnie (ochrona przed podniesieniem sobie uprawnień).
  To zabezpieczenie działa poprawnie i nie należy go osłabiać.
- Przedłużenie dostępu wymaga więc **Admin SDK**, czyli klucza serwisowego — tego samego, który
  zgodnie z naszą procedurą kasuje się zaraz po użyciu. **Dla 20 testerów to 20 ręcznych operacji
  z kluczem**, każda z tym samym ryzykiem, co N6.5.
- ⚠️ **Pułapka retencji:** gdy `trialEndsAt` minie, konto trafia do ścieżki „porzucone triale"
  w nocnym purge i po **90 dniach dane testera są kasowane bezpowrotnie**. Tester, który był
  z nami pół roku i nie zdążył zdecydować o płatności, straci wszystko, co wprowadził.
  To trzeba **powiedzieć mu wprost przy zaproszeniu** i pilnować dat.

**Rekomendacja:** zanim zaprosisz pierwszą osobę, potrzebny jest prosty sposób nadawania
i przedłużania dostępu bety — skrypt jednorazowy albo pole `betaUntil` obsługiwane przez funkcję.
Zadanie dla `dev`, małe, ale blokujące proces. Bez tego 20 zaproszeń to 20 okazji do pomyłki
na produkcji.

### 4. Feedback co 2 tygodnie — żeby nie skończył się na „fajne, działa"

Kadencja dobra. Bez struktury zbierzesz jednak same uprzejmości. Proponowany szkielet, ten sam
dla wszystkich, żeby odpowiedzi dawały się porównać:

1. **Co zrobiłeś w aplikacji od ostatniego razu?** (fakty, nie wrażenia)
2. **Co Cię zirytowało albo czego nie znalazłeś?**
3. **Co nadal robisz poza aplikacją** — w Excelu, w kalendarzu, w głowie? (to pytanie mówi
   najwięcej o tym, czego brakuje w produkcie)
4. Raz na dwa cykle: **czy zapłaciłbyś 29,99 zł miesięcznie? Jeśli nie, w jakiej cenie tak?**

Kanał: formularz `/kontakt` (zgłoszenia lądują w `contact_messages`) — do rozważenia marker
`?beta=1` na wzór istniejącego `?test=1`, żeby dało się je odsiać od zwykłych zgłoszeń.

---

## 8. Co dalej — podział pracy

- **Właściciel:** materiały do case study z Rusi (zrzuty, zgoda na liczby), wejście do 2–3 grup
  i obserwacja, o co ludzie realnie pytają.
- **`dev`:** zdarzenia aktywacyjne + `utm_source` z sekcji 6 — **przed** jakąkolwiek reklamą.
- **`marketing`:** teksty case study i szkielet postów pod K1, po zebraniu pierwszych pytań z grup.
- **`seo`:** plan treści z pytań zebranych w K1 (K3).
- ✅ **Rozstrzygnięte 2026-08-18:** bramka wyjścia z bety = **5–10 gospodarzy z pełnym cyklem**
  (20 stale użytkujących zostaje celem pierwszego etapu **po** launchu); model dostępu =
  **founding members z ceną podaną z góry**, nie bezterminowo za darmo.
- ⏸ **Kolejna decyzja właściciela — warunki oferty founding members**: wysokość i typ rabatu,
  jak długo obowiązuje, do kiedy trwa nabór. Bez tych trzech liczb nie da się wysłać pierwszego
  zaproszenia, bo to zobowiązanie wobec konsumenta (Regulamin §6, dziś `[DO UZUPEŁNIENIA]`).
- **`dev` (blokuje zaproszenia):** sposób nadawania i przedłużania dostępu bety bez ręcznego
  grzebania kluczem serwisowym w produkcji (7a.3).
- **`legal`:** warunki oferty founding members — dziś `[DO UZUPEŁNIENIA]` w Regulaminie §6.

---

## Źródła

- Smoobu — cennik (Professional Flex / Pre-paid / Teams Pro+), odczyt 2026-08-18: <https://www.smoobu.com/>
- MójWynajem — funkcje i cennik pakietów, odczyt 2026-08-18: <https://mojwynajem.pl/>
- Rentumi — aplikacja oparta o MójWynajem: <https://sklep.rentumi.pl/produkt/aplikacja-rentumi/>
- System do obsługi najmu krótkoterminowego — funkcje, brak cennika: <https://najem-krotkoterminowy-system.pl/>
- Ekoncept — PMS i recepcja online dla obiektów noclegowych: <https://ekoncept.pl/baza-wiedzy/news/wynajem-krotkoterminowy/>
- KWHotel — odprawa online dla gości: <https://kwhotel.com/pl/produkty/odprawa-online-dla-gosci-hotelowych/>
- Guestivo — porównanie oprogramowania do check-in online: <https://guestivo.pl/pl/blog/najlepsze-oprogramowanie-online-check-in-2026>

**Related:** [[strategy/Plan-wdrożenia-na-rynek]] · [[Projects/Roadmap]] · [[Projects/Backlog]]
