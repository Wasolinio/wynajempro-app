# Post na Facebooka: aktualizacja po naborze testerów (2026-08-28)

Kontekst: kontynuacja posta naborowego z 21.08 w grupie „Wynajem krótkoterminowy /
Booking / Airbnb". Tamten post zebrał komentarze o iCal (Daniel: „ical to proszenie się
o problemy"), o podatkach (Joanna, Marta: „gdzie VAT, ZUS, import usług?") i deklarację
Marka („rzucę okiem zanim zacznę krytykować"). Ten post rozlicza się z feedbacku
i pokazuje, co weszło do aplikacji od tamtej pory.

Każdy fakt zweryfikowany w [[Activity-Log]] (X20–X23 z 21.08, X26 z 22–24.08,
X25 + eksport CSV z 25.08, E6 z 28.08, dokumenty prawne z 26.08).

Zasady: czysty tekst (Facebook nie renderuje markdownu), zero emoji (identyfikacja),
głos jak w pierwotnym poście właściciela. Grafika do posta: układ `#fb-post`
(1080 × 1080, tło `#F3EFE5`) z handoffu — do wyeksportowania w ramach C2.

⚠️ Uwaga prawna przy okazji (dla właściciela, nie do posta): pierwotny post z 21.08
obiecywał „gwarancję najniższej, stałej stawki na zawsze" — Regulamin §6 gwarantuje
cenę z dnia startu przez 12 miesięcy. W tym poście świadomie nie powtarzamy tamtej
obietnicy; przy kolejnych wypowiedziach publicznych trzymać się brzmienia §6.

---

## Treść posta (do skopiowania)

Cześć,

tydzień temu szukałem tu osób do testów WynajemPRO i napisałem, że produkt będzie się
zmieniał od feedbacku. Zebrało się go sporo, w komentarzach i wiadomościach, więc krótkie
rozliczenie z tego, co przez ten tydzień faktycznie weszło do aplikacji.

Synchronizacja z portalami — przepisana od zera. Padło tu, że iCal to proszenie się
o problemy, i co do faktów była to prawda. Stara wersja po anulowaniu na portalu
zostawiała zablokowany termin, a po zmianie dat tworzyła drugą rezerwację obok
pierwszej. Teraz silnik rozpoznaje rezerwację po jej identyfikatorze z portalu:
anulowanie przestaje blokować termin, zmiana dat aktualizuje istniejący wpis,
a synchronizacja chodzi co godzinę zamiast raz na dobę. Doszedł też alarm na pulpicie,
kiedy dwie rezerwacje nachodzą na te same noce. I dla jasności: iCal przenosi
dostępność, nie ceny ani wiadomości, więc nigdzie już nie nazywamy tego channel
managerem. Tempo odświeżania po stronie portali to ich ograniczenie, nie nasze —
piszemy o tym wprost.

Podatki. Pytaliście, gdzie VAT, ZUS i import usług. Uczciwa odpowiedź: aplikacja nie
zastępuje księgowej i nie udaje, że liczy wszystko. Panel liczy ryczałt 8,5% / 12,5%
z podziałem podstawy między stawki, pilnuje progu 100 000 zł, ogarnia skalę, VAT od
noclegów i współwłasność małżeńską. Do tego doszedł przycisk „Pobierz dla księgowej":
plik z rezerwacjami, prowizjami portali, kosztami i rozkładem miesięcznym. W nagłówku
pliku stoi czarno na białym, że prowizje Booking i Airbnb to import usług do rozliczenia
po stronie księgowej. Tego, czego nie liczymy, nie ukrywamy.

Zadania i przypomnienia. Termin zadania można teraz zaczepić o przyjazd albo o wyjazd
gościa, na przykład „prośba o opinię — dzień po wyjeździe". A od dziś każde zadanie
zapiszecie jednym kliknięciem w kalendarzu telefonu, z normalnym powiadomieniem.

Kalendarz. Rezerwację założycie klikając w wolną noc albo przeciągając po kilku.
Zajęte noce nie są klikalne, więc z kalendarza nie da się zrobić dubla. Doszedł też
filtr pojedynczego obiektu.

Poza samą aplikacją: regulamin i polityka prywatności są opublikowane na stronie,
więc testujecie na jasnych zasadach.

Testy dalej trwają i mam jeszcze kilka miejsc. Układ bez zmian: pełny darmowy dostęp
na czas testów, w zamian krótka opinia raz na dwa tygodnie. Ktoś chętny? Komentarz albo
wiadomość prywatna i zakładam konto.

Najwięcej zmieniły najostrzejsze komentarze pod tamtym postem, więc krytykujcie śmiało.
