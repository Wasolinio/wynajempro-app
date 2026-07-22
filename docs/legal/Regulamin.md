# PROJEKT — wymaga weryfikacji prawnika-człowieka przed publikacją

> **Status:** PROJEKT (draft). Przygotował agent `legal` w ramach blokera launchu **N4**.
> NIE jest to dokument wiążący. Przed publikacją i przed przyjęciem pierwszej płatności
> MUSI go zweryfikować prawnik-człowiek (patrz `Checklista-zgodnosci.md`).
> Wdrożenie do aplikacji (`src/pages/TermsPage.jsx`) wykonuje agent `dev` PO akceptacji
> właściciela i prawnika — nie agent `legal`.
>
> **Data projektu:** 2026-07-04 · **Weryfikacja podstaw prawnych:** 2026-07-04
> Placeholdery `[DO UZUPEŁNIENIA: …]` = dane, których agent NIE zmyśla (zakaz konfabulacji,
> Team-Playbook zasada 8). Uzupełnia właściciel / prawnik przed publikacją.
>
> **Aktualizacja 2026-07-22 (legal, ocena X9 — `Ocena-linki-guide-opinie.md`, decyzja
> właściciela):** dodano §4 ust. 3 — charakter „dostępu po linku" do przewodnika gościa
> i strony opinii oraz odpowiedzialność Gospodarza za dystrybucję linku. Zmiana oznaczona
> znacznikiem `[UZUPEŁNIENIE 2026-07-22]`.
>
> **PRZEGLĄD 2026-07-22 (przed spotkaniem z prawnikiem, na zlecenie właściciela):** pełna
> rewizja aktualności względem stanu kodu i produkcji z 2026-07-22. Wpisano domenę kanoniczną
> (`wynajempro.com`), potwierdzono wdrożenie weryfikacji e-mail i paywalla (wcześniej opisywane
> jako „stan docelowy" / blokery N1–N2 — obecnie działają na produkcji), zastąpiono nieokreśloną
> „karencję" faktycznymi okresami (30 dni po anulowaniu, 90 dni po okresie próbnym),
> doprecyzowano natychmiastowość usunięcia Konta na żądanie i pełny zakres usuwania danych
> oraz skorygowano zapis o danych kart płatniczych. Zmiany oznaczone `[PRZEGLĄD 2026-07-22]`.

---

# Regulamin świadczenia usług drogą elektroniczną — WynajemPRO

**Wersja:** [DO UZUPEŁNIENIA: numer wersji, np. 1.0] · **Obowiązuje od:** [DO UZUPEŁNIENIA: data]

## §1. Definicje

1. **Usługodawca / Operator** — [DO UZUPEŁNIENIA: pełna firma / nazwa, forma prawna (np. działalność gospodarcza, sp. z o.o.), adres siedziby, NIP, REGON, ewentualnie KRS i kapitał zakładowy]. Kontakt: [DO UZUPEŁNIENIA: adres e-mail kontaktowy, np. kontakt@wynajempro.pl].
2. **Aplikacja / Serwis** — aplikacja internetowa **WynajemPRO** dostępna pod adresem **https://wynajempro.com**, służąca do zarządzania wynajmem nieruchomości. **[PRZEGLĄD 2026-07-22]** *(Stan faktyczny: od 2026-07-22 `wynajempro.com` jest jedynym adresem kanonicznym serwisu; dotychczasowy adres techniczny w domenie dostawcy hostingu przekierowuje trwale (301) na adres kanoniczny. Uwaga dla prawnika/właściciela: adres e-mail podawany w §1 ust. 1 jest obecnie w domenie `.pl` — do ujednolicenia z domeną serwisu przed publikacją.)*
3. **Użytkownik / Gospodarz** — osoba fizyczna posiadająca pełną zdolność do czynności prawnych, osoba prawna lub jednostka organizacyjna, która założyła Konto i korzysta z Aplikacji w celu zarządzania własnym wynajmem.
4. **Konsument** — Użytkownik będący osobą fizyczną, dokonujący z Operatorem czynności prawnej niezwiązanej bezpośrednio z jego działalnością gospodarczą lub zawodową (art. 22¹ Kodeksu cywilnego).
5. **Przedsiębiorca na prawach konsumenta** — osoba fizyczna zawierająca umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści umowy wynika, że nie ma ona dla niej charakteru zawodowego (art. 7aa ustawy o prawach konsumenta oraz art. 385⁵, 556⁴, 556⁵, 5564 KC). *(Kwestia istotna dla WynajemPRO — większość gospodarzy prowadzi działalność, ale usługa może nie mieć dla nich charakteru zawodowego. Zakres ochrony wymaga potwierdzenia prawnika — patrz checklista.)*
6. **Gość / Najemca** — osoba trzecia, której dane Gospodarz wprowadza lub udostępnia w Aplikacji (np. w rezerwacjach, przewodniku dla gości). Operator nie ma z Gościem bezpośredniej relacji umownej. Zasady przetwarzania danych Gości reguluje **Umowa powierzenia przetwarzania (DPA)** — `DPA-powierzenie.md`.
7. **Okres próbny (Trial)** — 14-dniowy bezpłatny okres testowy uruchamiany automatycznie po rejestracji.
8. **Subskrypcja** — odpłatny, odnawialny dostęp do pełnej funkcjonalności Aplikacji.
9. **Operator płatności** — Stripe Payments Europe, Ltd. / Stripe, Inc. i podmioty powiązane, obsługujący płatności subskrypcyjne. *(Dokładna nazwa podmiotu kontraktującego wg umowy ze Stripe — do potwierdzenia, patrz checklista.)*
10. **Regulamin** — niniejszy dokument, stanowiący regulamin w rozumieniu art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.

## §2. Postanowienia ogólne

1. Regulamin określa zasady świadczenia przez Operatora usług drogą elektroniczną w ramach Aplikacji WynajemPRO, w tym warunki zawierania i rozwiązywania umowy o świadczenie usług, zasady okresu próbnego i subskrypcji oraz tryb reklamacji.
2. Warunkiem korzystania z Aplikacji jest akceptacja Regulaminu oraz zapoznanie się z Polityką Prywatności (`Polityka-prywatnosci.md`).
3. Usługa świadczona jest wyłącznie drogą elektroniczną, za pośrednictwem przeglądarki internetowej.
4. **Wymagania techniczne:** urządzenie z dostępem do Internetu, aktualna przeglądarka internetowa z włączoną obsługą JavaScript i plików cookies (dla działania sesji logowania). Do rejestracji wymagany jest aktywny adres e-mail; alternatywnie logowanie kontem Google.

## §3. Rejestracja i Konto

1. Rejestracja następuje przez podanie adresu e-mail i ustanowienie hasła albo przez logowanie kontem Google (Google OAuth).
2. Konto może założyć wyłącznie osoba pełnoletnia posiadająca pełną zdolność do czynności prawnych albo podmiot działający przez należycie umocowaną osobę.
3. Przy rejestracji adresem e-mail wymagane jest **potwierdzenie adresu** (weryfikacja e-mail) przed uzyskaniem dostępu do panelu. Konta zakładane przez logowanie Google nie wymagają odrębnego potwierdzenia — adres jest weryfikowany przez dostawcę logowania. **[PRZEGLĄD 2026-07-22]** *(Stan faktyczny zweryfikowany w kodzie: wymóg działa i jest egzekwowany trójwarstwowo — przy rejestracji konto jest natychmiast wylogowywane do czasu potwierdzenia (`LoginPanel.jsx`), logowanie niepotwierdzonego konta jest blokowane, a dostęp do panelu i do danych jest odcięty także po stronie serwera regułami bazy (`firestore.rules` — warunek `email_verified`). Wcześniejsza adnotacja opisująca to jako niewdrożony bloker N1 była nieaktualna.)*
4. Użytkownik zobowiązuje się podawać dane prawdziwe i aktualne oraz chronić dane dostępowe do Konta przed dostępem osób trzecich.
5. Zawarcie umowy o świadczenie usług drogą elektroniczną następuje z chwilą utworzenia Konta (uruchomienia okresu próbnego).

## §4. Przedmiot i zakres usługi

1. Aplikacja umożliwia Gospodarzowi w szczególności:
   - prowadzenie kalendarza rezerwacji wielu obiektów (dodawanie rezerwacji, kosztów, zadań),
   - import i eksport kalendarzy w formacie iCal (m.in. synchronizacja z zewnętrznymi portalami),
   - tworzenie i publikowanie przewodników dla gości (w tym udostępnianie danych dostępowych, np. kodu do drzwi i hasła WiFi, po elektronicznej akceptacji regulaminu przez gościa),
   - prowadzenie prostych rozliczeń podatkowych i eksportów księgowych,
   - generowanie projektów umów najmu — **[KOREKTA 2026-07-16 · legal] funkcja OBECNIE NIEDOSTĘPNA; zostanie udostępniona po weryfikacji wzorców umów przez prawnika.** Po jej włączeniu obowiązywać będzie disclaimer: **Generator umów udostępnia WZORCE robocze; nie stanowią one porady prawnej i przed użyciem wymagają samodzielnej weryfikacji przez Użytkownika, w razie potrzeby z pomocą prawnika. Operator nie odpowiada za skutki prawne zastosowania wygenerowanych wzorców.** *(KOREKTA 2026-07-16: generator ukryty z nawigacji panelu decyzją właściciela (X16) — funkcja nie jest dziś oferowana, więc Regulamin nie deklaruje jej jako aktywnej. Disclaimer wysokiego ryzyka ZACHOWANY — wraca razem z funkcją. Ostateczne brzmienie do potwierdzenia z prawnikiem. Kontekst i wariantowe rozwiązania: `Uwagi-N5-dla-prawnika.md`, aktualizacja na początku dokumentu.)*
2. Zakres funkcjonalny może się zmieniać wraz z rozwojem Aplikacji; zmiany istotnie ograniczające funkcjonalność płatną są komunikowane zgodnie z §10.
3. **[UZUPEŁNIENIE 2026-07-22 · legal] Dostęp do przewodnika i strony opinii („dostęp po linku").** Przewodnik dla gości oraz strona z prośbą o opinię są publikowane pod unikalnym, trudnym do odgadnięcia adresem internetowym (linkiem) i są dostępne **bez logowania dla każdej osoby dysponującej linkiem**; dane dostępowe (np. kod do drzwi, hasło WiFi) są ujawniane po elektronicznej akceptacji regulaminu obiektu przez osobę otwierającą link, bez weryfikacji jej tożsamości. **Gospodarz samodzielnie decyduje, komu udostępnia link, i odpowiada za jego dystrybucję; Operator nie kontroluje dalszego przekazywania linku przez osoby, którym Gospodarz go udostępnił.** Gospodarz powinien przekazywać link wyłącznie swoim gościom, nie publikować go (np. w ogłoszeniach) oraz aktualizować dane dostępowe w przewodniku po każdej zmianie kodów w obiekcie. *(Uwaga spójności: ostrzeżenie o tej samej treści w edytorze przewodnika wdraża `dev` — decyzja właściciela 2026-07-22, brzmienie w `Ocena-linki-guide-opinie.md`, sekcja 4a. Zakres odpowiedzialności Operatora za ten kanał — do oceny prawnika w powiązaniu z §12.)*

## §5. Okres próbny (Trial)

1. Po rejestracji Użytkownik otrzymuje **14-dniowy bezpłatny okres próbny** z dostępem do pełnej funkcjonalności.
2. Okres próbny nie wymaga podania danych karty płatniczej i nie przekształca się automatycznie w płatną Subskrypcję — po jego upływie dostęp do funkcji płatnych wymaga wykupienia Subskrypcji. **[PRZEGLĄD 2026-07-22]** *(Stan faktyczny: mechanizm jest wdrożony i egzekwowany po stronie serwera — po wygaśnięciu okresu próbnego bez opłaty reguły bazy odmawiają dostępu do danych, niezależnie od interfejsu. Wcześniejsza adnotacja opisująca to jako „stan docelowy / bloker N2" była nieaktualna. Jeśli model miałby się zmienić na trial z automatycznym pobraniem, zapisy §5–§6 wymagają istotnej przebudowy i dodatkowych obowiązków informacyjnych — decyzja właściciela + prawnik.)*
3. **[PRZEGLĄD 2026-07-22]** Po zakończeniu okresu próbnego bez wykupienia Subskrypcji dane Konta są przechowywane jeszcze przez **90 dni** od zakończenia okresu próbnego, a następnie trwale usuwane (§11 i Polityka Prywatności). Wykupienie Subskrypcji w tym czasie zachowuje dane.

## §6. Subskrypcja, płatności i ceny

1. Cena Subskrypcji wynosi **29,99 zł brutto miesięcznie** [DO UZUPEŁNIENIA/POTWIERDZENIA: czy kwota jest brutto z VAT; stawka VAT lub podstawa zwolnienia; ewentualny cennik roczny founding members]. *(Cennik zatwierdzony przez właściciela 2026-07-04: jedna cena 29,99 zł/mc + founding members. Kwestia VAT wymaga potwierdzenia — patrz checklista.)*
2. Płatności obsługuje Operator płatności (Stripe) w modelu subskrypcji z **automatycznym odnawianiem**. **[PRZEGLĄD 2026-07-22]** Dane karty płatniczej są podawane wyłącznie na stronie płatności Operatora płatności — **nie są przekazywane do Aplikacji ani w niej przechowywane w żadnym zakresie**; Aplikacja przechowuje jedynie identyfikatory rozliczeniowe i status subskrypcji. *(Poprzednie brzmienie — „nie przechowuje pełnych danych kart" — sugerowało przechowywanie danych częściowych, co nie odpowiada stanowi faktycznemu: proces płatności odbywa się przez przekierowanie do Stripe Checkout, a zarządzanie płatnościami przez Portal Klienta Stripe.)*
3. Opłata pobierana jest z góry za każdy cykl rozliczeniowy (miesięczny lub roczny, zależnie od wybranego planu).
4. **Automatyczne odnawianie i rezygnacja:** Subskrypcja odnawia się automatycznie na kolejny cykl, chyba że Użytkownik anuluje ją przed końcem bieżącego cyklu. Anulowanie następuje samodzielnie przez panel rozliczeniowy (Stripe Customer Portal) dostępny w ustawieniach Konta. Po anulowaniu dostęp do funkcji płatnych trwa do końca opłaconego cyklu.
5. **Founding members:** [DO UZUPEŁNIENIA: warunki oferty dla uczestników bety — kto się kwalifikuje, wysokość i typ rabatu (rabat roczny), okres obowiązywania, data zakończenia naboru]. **Jeśli oferta jest komunikowana jako obniżka ceny, przy jej prezentacji należy podać najniższą cenę z 30 dni przed obniżką (obowiązek z tzw. dyrektywy Omnibus — patrz checklista).** *(Sposób komunikacji rabatu ma znaczenie prawne — do ustalenia z prawnikiem/marketingiem.)*
6. Faktury / potwierdzenia płatności udostępniane są [DO UZUPEŁNIENIA: sposób — panel Stripe, e-mail]. [DO UZUPEŁNIENIA: czy i jak Operator wystawia faktury VAT].
7. Zmiana ceny Subskrypcji dla nowych cykli następuje w trybie zmiany Regulaminu (§10) z uprzednim powiadomieniem; zmiana nie wpływa na cykl już opłacony.

## §7. Prawo odstąpienia od umowy (Konsument i przedsiębiorca na prawach konsumenta)

> **⚠️ Sekcja szczególnie wrażliwa prawnie — bezwzględna weryfikacja prawnika (patrz checklista).**

1. Konsument (oraz przedsiębiorca na prawach konsumenta) zawierający umowę na odległość może od niej odstąpić bez podania przyczyny w terminie **14 dni** od zawarcia umowy (art. 27 ustawy z dnia 30 maja 2014 r. o prawach konsumenta).
2. Aby odstąpić, należy złożyć jednoznaczne oświadczenie, np. na adres e-mail: [DO UZUPEŁNIENIA: adres e-mail] lub korespondencyjny: [DO UZUPEŁNIENIA: adres]. Można skorzystać ze wzoru formularza stanowiącego załącznik nr [DO UZUPEŁNIENIA] (wzór ustawowy).
3. **Rozpoczęcie świadczenia przed upływem terminu na odstąpienie:** Jeżeli Użytkownik będący Konsumentem wyraźnie zażąda rozpoczęcia świadczenia usługi (dostępu do pełnej funkcjonalności) przed upływem 14-dniowego terminu na odstąpienie i zostanie poinformowany o utracie prawa odstąpienia, wówczas:
   - w przypadku usługi świadczonej za zapłatą — Konsument, który odstąpi w trakcie świadczenia, zapłaci za świadczenia spełnione do chwili odstąpienia (proporcjonalnie);
   - Konsument **traci prawo odstąpienia po pełnym wykonaniu usługi**, o ile świadczenie rozpoczęto za jego wyraźną i uprzednią zgodą oraz po przyjęciu do wiadomości informacji o utracie tego prawa (art. 38 pkt 1 ustawy o prawach konsumenta).
   *(Kluczowa niepewność: model WynajemPRO to trial 14 dni BEZ pobrania płatności, więc odstąpienie od umowy o dostęp do trialu i odstąpienie od PŁATNEJ subskrypcji to dwie różne sytuacje. Konstrukcja klauzuli o zgodzie na rozpoczęcie świadczenia i utracie prawa odstąpienia MUSI zostać dopasowana przez prawnika do faktycznego przepływu płatności w Stripe. Zapisy powyżej to szkielet, nie gotowa klauzula.)*
4. Wykonanie prawa odstąpienia wymaga, aby stosowna zgoda i informacja zostały Konsumentowi udostępnione przed zawarciem umowy oraz potwierdzone na trwałym nośniku. *(Wdrożeniowo — checkbox/zgoda w procesie checkout i e-mail potwierdzający; do zaprojektowania przez `dev` wg wskazań prawnika.)*

## §8. Reklamacje

1. Reklamacje dotyczące działania Aplikacji można składać na adres e-mail: [DO UZUPEŁNIENIA: adres] lub korespondencyjnie: [DO UZUPEŁNIENIA: adres].
2. Reklamacja powinna zawierać opis problemu, dane kontaktowe zgłaszającego oraz — w miarę możliwości — datę i okoliczności wystąpienia.
3. Operator rozpatruje reklamację w terminie **14 dni** od jej otrzymania. *(Uwaga: dla reklamacji konsumenckich dot. treści/usług cyfrowych ustawa o prawach konsumenta przewiduje własne terminy i skutki milczenia przedsiębiorcy — termin i tryb do potwierdzenia przez prawnika; obecne „14 dni roboczych" z kodu TermsPage jest ryzykowne i tu zmienione na 14 dni.)*
4. **Zgodność usługi cyfrowej:** Operator odpowiada wobec Konsumenta za zgodność świadczonej usługi cyfrowej z umową na zasadach określonych w rozdziale 5b ustawy o prawach konsumenta (art. 43h i nast.). *(Ten reżim zastąpił klasyczną „rękojmię" dla treści/usług cyfrowych od 2023 r. — szczegółowe brzmienie do potwierdzenia prawnika.)*

## §9. Pozasądowe rozwiązywanie sporów

1. Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, m.in. przed właściwym miejscowo Wojewódzkim Inspektoratem Inspekcji Handlowej oraz u powiatowego (miejskiego) rzecznika konsumentów. Informacje dostępne są na stronie UOKiK (uokik.gov.pl).
2. [DO UZUPEŁNIENIA/POTWIERDZENIA przez prawnika: aktualny status platformy ODR — unijna platforma ODR została wygaszona; sprawdzić, jakie informacje o pozasądowym rozwiązywaniu sporów są obecnie obowiązkowe.]

## §10. Zmiana Regulaminu

1. Operator może zmienić Regulamin z ważnych przyczyn (zmiana przepisów, zmiana zakresu lub sposobu świadczenia usług, względy bezpieczeństwa, zmiana cen dla przyszłych cykli).
2. O zmianie Operator informuje Użytkowników [DO UZUPEŁNIENIA: kanał — e-mail / komunikat w panelu] z wyprzedzeniem co najmniej [DO UZUPEŁNIENIA: liczba dni, np. 14] dni przed wejściem zmian w życie.
3. Użytkownik, który nie akceptuje zmian, może wypowiedzieć umowę / usunąć Konto przed dniem wejścia zmian w życie.

## §11. Rozwiązanie umowy i usunięcie Konta

1. **[PRZEGLĄD 2026-07-22]** Użytkownik może w każdej chwili rozwiązać umowę, usuwając Konto samodzielnie z poziomu Aplikacji (Konto → Usunięcie konta). Operacja wymaga ponownego potwierdzenia tożsamości (hasłem albo ponownym logowaniem Google) i jest **nieodwracalna oraz wykonywana niezwłocznie, bez okresu karencji**. Usunięcie obejmuje: przewodniki wraz z danymi dostępowymi, zapisami akceptacji gości i plikami, dane biznesowe (rezerwacje, koszty, zadania, ustawienia), rekord klienta u Operatora płatności, profil oraz konto uwierzytelniające.
2. **[PRZEGLĄD 2026-07-22]** Jeżeli umowa wygasa bez usunięcia Konta przez Użytkownika, dane są przechowywane przez okres: **30 dni** od anulowania Subskrypcji albo **90 dni** od zakończenia bezpłatnego okresu próbnego bez wykupienia Subskrypcji — po czym są trwale usuwane w takim samym zakresie jak w ust. 1. Opłacenie Subskrypcji w tym okresie zachowuje dane.
3. Operator może rozwiązać umowę lub zawiesić dostęp w przypadku istotnego naruszenia Regulaminu przez Użytkownika (m.in. korzystanie z Aplikacji niezgodnie z prawem, publikowanie treści bezprawnych w przewodnikach), po uprzednim wezwaniu, chyba że naruszenie ma charakter rażący.
4. Szczegółowe zasady i podstawy przetwarzania oraz usuwania danych opisano w Polityce Prywatności, a w zakresie danych Gości — w DPA. *(Do oceny prawnika: czy natychmiastowe, nieodwracalne usunięcie na żądanie — bez „kosza"/okresu wycofania — jest właściwie zakomunikowane Użytkownikowi przed wykonaniem operacji; ostrzeżenie o nieodwracalności jest prezentowane w Aplikacji przed potwierdzeniem.)*

## §12. Odpowiedzialność

1. Operator dokłada starań, aby Aplikacja działała nieprzerwanie, jednak nie gwarantuje ciągłości działania i nie odpowiada za przerwy wynikające z awarii dostawców zewnętrznych (Google Cloud / Firebase, Stripe) ani za skutki błędnej konfiguracji synchronizacji iCal po stronie zewnętrznych portali (np. zduplikowane rezerwacje wskutek opóźnień serwerów zewnętrznych).
2. **Wobec Konsumentów i przedsiębiorców na prawach konsumenta ograniczenia i wyłączenia odpowiedzialności obowiązują wyłącznie w zakresie dopuszczalnym przez bezwzględnie obowiązujące przepisy prawa; postanowienia niedozwolone (klauzule abuzywne) ich nie wiążą.** *(To zastrzeżenie jest konieczne — bez niego wyłączenia odpowiedzialności mogą być uznane za klauzule abuzywne. Zakres wyłączeń wobec przedsiębiorców — do ustalenia z prawnikiem.)*
3. Operator nie ponosi odpowiedzialności za treści wprowadzane przez Użytkownika (dane obiektów, przewodniki, dane gości) ani za skutki prawne umów najmu generowanych przy pomocy Aplikacji (§4 ust. 1).
4. Użytkownik odpowiada za zgodność z prawem przetwarzania danych swoich Gości/Najemców, w zakresie w jakim jest ich administratorem (patrz DPA).

## §13. Własność intelektualna

1. Aplikacja, jej kod, interfejs, nazwa i znaki WynajemPRO podlegają ochronie prawnej i pozostają własnością Operatora [DO UZUPEŁNIENIA: potwierdzić stan praw — czy zarejestrowany znak towarowy].
2. Użytkownik zachowuje prawa do wprowadzonych przez siebie treści i danych.

## §14. Postanowienia końcowe

1. W sprawach nieuregulowanych stosuje się prawo polskie, w szczególności Kodeks cywilny, ustawę o świadczeniu usług drogą elektroniczną, ustawę o prawach konsumenta oraz przepisy o ochronie danych osobowych (RODO). Wybór prawa nie pozbawia Konsumenta ochrony wynikającej z bezwzględnie obowiązujących przepisów państwa jego zwykłego pobytu.
2. Ewentualne spory z Użytkownikami niebędącymi Konsumentami rozstrzyga sąd właściwy dla siedziby Operatora. [DO POTWIERDZENIA przez prawnika.]
3. Regulamin dostępny jest nieodpłatnie w Aplikacji w formie umożliwiającej pozyskanie, odtwarzanie i utrwalanie jego treści.
4. Kontakt z Operatorem: [DO UZUPEŁNIENIA: e-mail, adres korespondencyjny].

---

*Projekt przygotowany na podstawie stanu faktycznego zweryfikowanego w kodzie (Agent-Process-Map, firestore.rules, functions/index.js, komponenty). Podstawy prawne i daty weryfikacji — patrz `Checklista-zgodnosci.md`. Dokument wymaga weryfikacji prawnika-człowieka przed publikacją.*
