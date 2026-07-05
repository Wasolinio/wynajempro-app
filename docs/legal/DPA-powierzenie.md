# PROJEKT — wymaga weryfikacji prawnika-człowieka przed publikacją

> **Status:** PROJEKT (draft). Przygotował agent `legal` w ramach blokera launchu **N4**.
> NIE jest to dokument wiążący. Struktura wg art. 28 RODO. Wdrożenie (np. jako akceptowany
> załącznik do Regulaminu / osobny dokument w panelu) — po akceptacji właściciela i prawnika,
> realizuje `dev`. Placeholdery `[DO UZUPEŁNIENIA: …]` = dane, których agent nie zmyśla.
> **Data projektu:** 2026-07-04 · **Weryfikacja podstaw:** 2026-07-04.
>
> **Podstawa struktury:** art. 28 ust. 3 RODO (obligatoryjne elementy powierzenia).
> **Model akceptacji (do decyzji właściciela + prawnik):** rekomendowane zawarcie DPA jako
> integralnej części Regulaminu akceptowanej przy rejestracji (art. 28 ust. 9 RODO dopuszcza
> formę elektroniczną). Alternatywnie — osobny dokument akceptowany w panelu.

---

# Umowa powierzenia przetwarzania danych osobowych (DPA)

zawierana pomiędzy:

- **Administratorem** — Użytkownikiem (Gospodarzem) korzystającym z Aplikacji WynajemPRO, który wprowadza do niej dane osobowe swoich Gości/Najemców, oraz
- **Podmiotem przetwarzającym (Procesorem)** — [DO UZUPEŁNIENIA: pełna firma Operatora, forma prawna, adres, NIP],

zwanymi łącznie „Stronami". Umowa stanowi wykonanie obowiązku z art. 28 ust. 3 RODO i wiąże się z korzystaniem przez Administratora z Aplikacji.

## §1. Definicje

Pojęcia „dane osobowe", „przetwarzanie", „administrator", „podmiot przetwarzający", „naruszenie ochrony danych" mają znaczenie nadane im w RODO (Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679).

## §2. Przedmiot i charakter powierzenia

1. Administrator powierza Procesorowi przetwarzanie danych osobowych w zakresie i celu niezbędnym do świadczenia usług Aplikacji WynajemPRO na rzecz Administratora.
2. **Cel przetwarzania:** umożliwienie Administratorowi zarządzania wynajmem, w tym prowadzenia rezerwacji, publikowania przewodników dla gości oraz udostępniania gościom danych dostępowych po elektronicznej akceptacji regulaminu.
3. **Charakter przetwarzania:** przechowywanie, utrwalanie, organizowanie, udostępnianie (gościom — na polecenie Administratora), usuwanie — w ramach infrastruktury Aplikacji.
4. Procesor przetwarza dane wyłącznie na udokumentowane polecenie Administratora, którym jest niniejsza Umowa oraz korzystanie z funkcji Aplikacji zgodnie z jej przeznaczeniem i Regulaminem.

## §3. Kategorie osób i kategorie danych

**Kategorie osób, których dane dotyczą:**
- Goście / Najemcy obiektów Administratora,
- inne osoby, których dane Administrator zdecyduje się wprowadzić do Aplikacji.

**Kategorie danych** (ustalone na podstawie faktycznego modelu danych Aplikacji — Agent-Process-Map, `GuestGuideView.jsx`, `firestore.rules`):
- dane rezerwacji: nazwa obiektu, daty pobytu, kwoty oraz ewentualne dane identyfikacyjne/kontaktowe gościa wpisane przez Administratora,
- **dane akceptacji regulaminu (podpisy):** data akceptacji, opcjonalnie imię/nazwa gościa oraz zapis podpisu, migawka zaakceptowanej treści regulaminu — przechowywane w `guides/{id}/signatures`,
- **dane dostępowe udostępniane gościom:** kod do drzwi (PIN), hasło WiFi — przechowywane w `guides/{id}/secrets/data` (dane wrażliwe operacyjnie; nie są „szczególnymi kategoriami" w rozumieniu art. 9 RODO, ale wymagają podwyższonej ochrony).

> **Uwaga:** Aplikacja nie jest przeznaczona do przetwarzania szczególnych kategorii danych
> (art. 9 RODO). Administrator zobowiązuje się nie wprowadzać takich danych. *(Do potwierdzenia
> przez prawnika, czy potrzebne dodatkowe zastrzeżenie umowne.)*

## §4. Czas trwania

Powierzenie trwa przez okres obowiązywania umowy o świadczenie usług (posiadania aktywnego Konta) i kończy się z chwilą usunięcia Konta lub rozwiązania umowy, z zastrzeżeniem zasad usuwania danych z §9.

## §5. Obowiązki Procesora (art. 28 ust. 3 RODO)

Procesor zobowiązuje się:
1. **przetwarzać dane wyłącznie na udokumentowane polecenie Administratora** (w tym co do transferów poza EOG), chyba że obowiązek wynika z prawa UE lub państwa członkowskiego — wówczas informuje o tym Administratora przed przetwarzaniem, o ile prawo tego nie zakazuje (art. 28 ust. 3 lit. a);
2. **zapewnić zobowiązanie do zachowania poufności** osób upoważnionych do przetwarzania danych (art. 28 ust. 3 lit. b);
3. **stosować środki bezpieczeństwa** wymagane art. 32 RODO (patrz §6) (art. 28 ust. 3 lit. c);
4. **przestrzegać warunków korzystania z subprocesorów** (§7) (art. 28 ust. 3 lit. d);
5. **pomagać Administratorowi** — w miarę możliwości i za pomocą odpowiednich środków technicznych — w realizacji żądań osób, których dane dotyczą (prawa z rozdziału III RODO) (art. 28 ust. 3 lit. e);
6. **pomagać Administratorowi** w wypełnianiu obowiązków z art. 32–36 RODO (bezpieczeństwo, zgłaszanie naruszeń, ocena skutków) (art. 28 ust. 3 lit. f);
7. **po zakończeniu świadczenia usług usunąć lub zwrócić dane** zgodnie z §9 (art. 28 ust. 3 lit. g);
8. **udostępniać Administratorowi informacje** niezbędne do wykazania spełnienia obowiązków oraz umożliwiać audyty/inspekcje i przyczyniać się do nich (art. 28 ust. 3 lit. h) — na zasadach z §8;
9. **niezwłocznie informować Administratora**, jeżeli jego polecenie stanowi naruszenie RODO lub innych przepisów o ochronie danych.

## §6. Bezpieczeństwo (art. 32 RODO)

Procesor wdraża środki techniczne i organizacyjne odpowiednie do ryzyka, w szczególności (odzwierciedlają rzeczywistą architekturę Aplikacji):
- kontrolę dostępu opartą na regułach bazy danych (Firestore Security Rules) ograniczających dostęp do danych do właściciela konta i — w przypadku sekretów — ujawnianie ich gościowi dopiero po zapisaniu autoryzowanego podpisu,
- **oddzielne przechowywanie danych dostępowych** (PIN/WiFi) w wydzielonej kolekcji z warunkowym dostępem,
- szyfrowanie transmisji (HTTPS/TLS),
- zabezpieczenia przed automatycznymi nadużyciami (App Check / reCAPTCHA),
- korzystanie z certyfikowanej infrastruktury chmurowej (Google Cloud / Firebase).

> **⚠️ Do weryfikacji przez `code-reviewer` w ramach N5 i przez prawnika:** deklarowane środki
> muszą odpowiadać stanowi faktycznemu na produkcji. W szczególności bloker **N3** (walidacja
> schematu w regułach) jest dziś WYŁĄCZONY (`isValidRental/Guide` zwracają `true`, weryfikacja
> e-mail i sprawdzanie subskrypcji zaślepione — patrz `firestore.rules`). **DPA nie powinno
> deklarować środków, których kod nie egzekwuje** — przed publikacją N1–N3 muszą być wdrożone,
> albo opis środków dostosowany do stanu faktycznego.

## §7. Podpowierzenie (subprocesorzy) — art. 28 ust. 2 i 4 RODO

1. Administrator udziela Procesorowi **ogólnej zgody** na korzystanie z subprocesorów niezbędnych do świadczenia usługi. Na dzień zawarcia Umowy są to:
   - **Google / Firebase (Google Cloud EMEA Ltd. / Google Ireland Ltd.)** — infrastruktura (Auth, Firestore, Storage, Functions, hosting),
   - **Stripe (Stripe Payments Europe, Ltd. / Stripe, Inc.)** — w zakresie, w jakim dane rozliczeniowe mogą się wiązać z rezerwacjami [DO POTWIERDZENIA zakresu — Stripe dotyczy głównie relacji Operator↔Gospodarz, nie danych Gości; prawnik ustali, czy Stripe jest subprocesorem danych powierzonych],
   - **Google (OAuth)** — w zakresie logowania.
2. Procesor **informuje Administratora o zamierzonych zmianach** dotyczących dodania lub zastąpienia subprocesorów, dając możliwość wyrażenia sprzeciwu. [DO UZUPEŁNIENIA: kanał i termin informowania, np. e-mail / aktualizacja listy subprocesorów z 14-dniowym wyprzedzeniem.]
3. Procesor nakłada na subprocesorów obowiązki ochrony danych co najmniej równoważne obowiązkom z niniejszej Umowy (art. 28 ust. 4).
4. **Transfery poza EOG:** [DO UZUPEŁNIENIA/POTWIERDZENIA: mechanizm legalizujący (SCC / EU-US DPF) dla każdego subprocesora przekazującego dane poza EOG — do zweryfikowania u źródła, nie wpisywać „z pamięci".]

## §8. Prawo do audytu i informacji

1. Procesor udostępnia Administratorowi informacje niezbędne do wykazania zgodności z art. 28 RODO.
2. Administrator ma prawo do audytu; z uwagi na charakter usługi (współdzielona infrastruktura SaaS, wielu administratorów) audyt realizowany jest przede wszystkim przez [DO UZUPEŁNIENIA: udostępnienie dokumentacji / certyfikatów / raportów; warunki ewentualnej inspekcji na miejscu — częstotliwość, uprzedzenie, poufność, koszty]. *(Zakres i tryb audytu w SaaS to typowy przedmiot negocjacji — do ustalenia z prawnikiem.)*

## §9. Usunięcie / zwrot danych po zakończeniu

1. Po zakończeniu świadczenia usług Procesor, zależnie od decyzji Administratora, usuwa lub zwraca dane powierzone oraz usuwa istniejące kopie, chyba że prawo nakazuje przechowywanie.
2. **Mechanizm faktyczny (do odzwierciedlenia i potwierdzenia):** usunięcie Konta uruchamia usunięcie przewodników, plików (Storage) i danych z nimi związanych (`deleteUserAccount`); konta wygasłe są usuwane po okresie karencji (`deleteExpiredAccountsData`). Okres karencji: [DO UZUPEŁNIENIA: wartość z `functions/index.js` — do zweryfikowania w kodzie].
3. Administrator może samodzielnie usuwać poszczególne przewodniki, sekrety i podpisy z poziomu Aplikacji.

## §10. Zgłaszanie naruszeń

Procesor bez zbędnej zwłoki, po stwierdzeniu naruszenia ochrony danych powierzonych, zgłasza je Administratorowi [DO UZUPEŁNIENIA: kanał kontaktu, np. e-mail administratora] wraz z informacjami umożliwiającymi Administratorowi wywiązanie się z obowiązku z art. 33 RODO. *(RODO nie wyznacza procesorowi sztywnego terminu godzinowego — „bez zbędnej zwłoki". Ewentualny termin umowny do ustalenia z prawnikiem.)*

## §11. Odpowiedzialność

Odpowiedzialność Stron reguluje RODO (art. 82) oraz [DO UZUPEŁNIENIA: ewentualne postanowienia umowne — ograniczenia odpowiedzialności między przedsiębiorcami, w granicach prawa; do ustalenia z prawnikiem, w spójności z Regulaminem §12].

## §12. Postanowienia końcowe

1. W sprawach nieuregulowanych stosuje się RODO i prawo polskie.
2. Umowa wiąże z chwilą [DO UZUPEŁNIENIA: akceptacji Regulaminu przy rejestracji / odrębnej akceptacji w panelu].
3. W razie sprzeczności między Umową a Regulaminem w zakresie ochrony danych powierzonych — pierwszeństwo ma niniejsza Umowa.

---

*Projekt oparty na faktycznym modelu danych Aplikacji (Agent-Process-Map, `firestore.rules`, `functions/index.js`, `GuestGuideView.jsx`) i strukturze art. 28 RODO. Podstawy prawne i daty — patrz `Checklista-zgodnosci.md`. Wymaga weryfikacji prawnika-człowieka przed publikacją.*
