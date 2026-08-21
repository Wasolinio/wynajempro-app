# Feedback testera — 21.08.2026 (pierwsza tura)

> Źródło: `Obiekty.pages` od testera, 21.08.2026, dwa zdjęcia ekranu MacBooka.
> Cztery uwagi, wszystkie z panelu. Plan pracy trafia do [[Projects/Roadmap]] jako **X20–X23**;
> ten dokument zostaje jako analiza „co jest dziś i dlaczego tester zobaczył to, co zobaczył".

---

## Co przyszło

1. **„Zadanie do zrobienia kilka dni po rezerwacji, a nie tylko przed — czym są minus 2?"** (ze zdjęciem)
   Na zdjęciu ustawienia przypomnień: tester próbował ustawić prośbę o opinię **po pobycie** i jedyne,
   co miał do dyspozycji, to pole **„Dni przed"**, w które wpisał **-2**. Nie wiedział, co ta wartość zrobi.
2. **„Do posprzątania 0, mimo że jest na dzisiaj"** (ze zdjęciem pulpitu)
   Kafel **DO POSPRZĄTANIA: 0**, a niżej, w „Zadaniach na dziś", stoi **„Zleć sprzątanie · DOMEK MORZE · KUBA WOJ"**.
3. **„Czy można zrobić też rezerwację bezpośrednio z kalendarza?"**
4. **„Filtruj po obiekcie w kalendarzu"**

---

## Stan aktualny — co robi kod dziś

### 1. Terminy zadań są liczone WYŁĄCZNIE od daty przyjazdu

Szablon zadania (`users/{uid}/settings/reminders.items[]`) ma dziś jedno pole terminu: `daysBefore`.
Zadanie pokazuje się, gdy `diffDays <= daysBefore`, gdzie `diffDays` to liczba dni **do przyjazdu**
(`ManagerApp.jsx:194`). Kotwica jest zaszyta na sztywno — nie da się wskazać wyjazdu.

Co to znaczy w praktyce dla „-2" testera:

- **-2 działa**, ale odlicza od **przyjazdu**, nie od wyjazdu. Przy pobycie 7-dniowym prośba o opinię
  wyskoczy **piątego dnia pobytu gościa**, a nie po jego wyjeździe. Czyli: tester dostał funkcję,
  o którą prosił, tylko przypiętą do złej daty — i nie miał jak tego zobaczyć.
- Nazwa pola **„Dni przed"** przy wartości ujemnej nie znaczy już nic sensownego („minus dwa dni przed").
  Pytanie testera jest więc uzasadnione: interfejs nie mówi, co się stanie.
- Ten sam rozjazd jest w szczegółach rezerwacji: `BookingDetailView.jsx:200` wypisuje pod zadaniem
  „**{n} dni przed przyjazdem**" — przy `-2` wychodzi „**-2 dni przed przyjazdem**".

Domyślne szablony (`src/utils/constants.js`): dojazd D-3, kod do drzwi D-1, sprzątanie D-0 —
wszystkie od przyjazdu, bo innej możliwości nie było.

### 2. Kafel „Do posprzątania" liczy co innego niż lista zadań

Jedna linijka, `ManagerApp.jsx:325`:

```js
cleaning: dailyReport.departures.length
```

Kafel pokazuje **liczbę wyjazdów dzisiaj**. Zadanie „Zleć sprzątanie" pochodzi natomiast z szablonu
o kotwicy **przyjazd** (`daysBefore: 0`). Na zdjęciu testera: przyjazd jest (Kuba Woj, Domek Morze),
wyjazdu nie ma — więc lista zadań mówi „posprzątaj", a kafel mówi „0". **Oba wyliczenia są poprawne
każde ze swojej definicji i sprzeczne ze sobą na ekranie.** To nie jest błąd arytmetyki, tylko dwie
różne definicje słowa „sprzątanie" w jednym widoku.

Dodatkowo: kafel po kliknięciu przenosi do kalendarza, gdzie sprzątania w ogóle nie widać.

### 3. Kalendarz jest tylko do oglądania

`CalendarView.jsx` rysuje gantt (obiekty w wierszach, dni w kolumnach). Kliknąć da się **wyłącznie
pasek istniejącej rezerwacji** (`onEditRental`). Puste komórki dni (`.wpd-cal__daycell`) to czysta
grafika — bez zdarzeń. Nową rezerwację dodaje się tylko przyciskiem „+ Rezerwacja" w prawym górnym
rogu, a potem wpisuje obiekt i obie daty ręcznie, mimo że przed chwilą patrzyło się dokładnie na
tę wolną szczelinę w kalendarzu.

### 4. Kalendarz nie ma żadnego filtra

`properties.map(...)` rysuje **wszystkie** obiekty, zawsze. Przy trzech obiektach to jeszcze działa,
przy kilkunastu — kalendarz robi się nieczytelny. Metryki pod kalendarzem (rezerwacje, wolne noce,
średnia długość pobytu) też liczą się zawsze z całości.

---

## Co zmieniamy

### X20. Zadania z kotwicą: przyjazd albo wyjazd (uwaga 1)

**Decyzja modelu:** szablon dostaje **opcjonalne** pole `anchor: 'arrival' | 'departure'`
(brak = `'arrival'`, czyli stare szablony działają bez zmian). `daysBefore` zostaje i zachowuje znak:
dodatni = **przed** kotwicą, ujemny = **po**. Dzięki temu żadne zapisane dane nie wymagają migracji,
a `-2` testera dalej znaczy dokładnie to, co znaczyło.

**Interfejs (to jest właściwa odpowiedź na pytanie „czym są minus 2"):** zamiast pola „Dni przed"
— lista wyboru **kiedy** (przed przyjazdem · po przyjeździe · przed wyjazdem · po wyjeździe) plus
liczba dni bez znaku, a pod spodem **zdanie kontrolne** złożone z tego, co wybrano:
„_Zadanie pojawi się 2 dni po wyjeździe gościa_". Ujemnych liczb gospodarz już nie zobaczy.

**Jedno źródło prawdy terminu:** nowy `src/utils/taskSchedule.js` — termin i opis słowny liczy
jedna funkcja, używana przez pulpit, szczegóły rezerwacji i ustawienia (lekcja z X17: dwa niezależne
przebiegi po tych samych danych zawsze się w końcu rozjeżdżają).

**Gotowe, gdy:** da się ustawić zadanie „2 dni po wyjeździe", pojawia się we właściwym dniu,
a w ustawieniach i szczegółach rezerwacji jest opisane po polsku, nie liczbą ze znakiem.

### X21. „Do posprzątania" liczy sprzątania, nie wyjazdy (uwaga 2)

**Decyzja definicji:** kafel pokazuje **liczbę obiektów, które trzeba dziś posprzątać** =
wyjazdy dzisiaj **plus** otwarte zadania sprzątania, **każdy obiekt liczony raz**
(wyjazd i przyjazd tego samego dnia w tym samym domku to jedno sprzątanie, nie dwa).
„Otwarte zadania sprzątania" to dokładnie te, które widać niżej w „Zadaniach na dziś" —
kafel jest z tej listy wyliczany, więc **nie może już jej przeczyć**; na tym polegała uwaga.
Podpis kafla wymienia obiekty. Kliknięcie prowadzi do raportu dziennego (tam widać zadania),
a nie do kalendarza, gdzie sprzątania nie ma.

**Gotowe, gdy:** przy układzie ze zdjęcia testera kafel pokazuje **1 · DOMEK MORZE**, a nie 0.

### X22. Rezerwacja prosto z kalendarza (uwaga 3)

Klik w wolną komórkę = nowa rezerwacja w tym obiekcie na tę noc; przeciągnięcie po kilku komórkach
= rezerwacja na cały zaznaczony zakres. Formularz otwiera się z **wypełnionym obiektem i datami**
(data wyjazdu = dzień po ostatniej zaznaczonej nocy, zgodnie z tym, jak kalendarz rysuje paski:
dzień wyjazdu zostaje wolny pod przyjazd back-to-back).

Zajęte dni nie są klikalne — zaznaczenie nie przejedzie po istniejącej rezerwacji, więc z kalendarza
nie da się zrobić dubla. Dla klawiatury i czytników ekranu: przycisk „+" przy nazwie obiektu
(31 komórek × N obiektów jako osobne przystanki tabulatora byłoby lekarstwem gorszym od choroby).

### X23. Filtr obiektu w kalendarzu (uwaga 4)

Lista wyboru w nagłówku kalendarza: „Wszystkie obiekty" (domyślnie) albo jeden konkretny.
Filtr obejmuje **także trzy metryki pod kalendarzem** — inaczej po zawężeniu do jednego domku
„wolne noce" dalej liczyłyby się z całego portfela i kłamałyby.

---

## Kolejność pracy

① **X21** (jedna definicja, natychmiast widoczna na pulpicie) → ② **X20** (dotyka modelu danych,
więc porządnie: wspólny moduł terminów + interfejs) → ③ **X23** (filtr, mały) → ④ **X22**
(najwięcej nowego zachowania w kalendarzu, wchodzi na gotowy filtr).

**Weryfikacja całości:** `npm run lint` (0), `npm run build`, e2e na mockach Firebase —
nowe testy dla kafla sprzątania, kotwicy „po wyjeździe" i obu funkcji kalendarza.

---

## Czego ta tura nie rusza

- **Reguł Firestore nie trzeba zmieniać.** `isValidSettings` wymaga od dokumentu `reminders` tylko
  tego, żeby `items` było listą (`firestore.rules:91`) — nowe pole `anchor` przechodzi bez zmiany
  reguł, w przeciwieństwie do X14/X17, gdzie zmiana schematu rezerwacji wymagała ruchu po obu stronach.
- **Zapisanych szablonów nie migrujemy.** Sprzątanie testera zostaje tam, gdzie je ma (dzień przyjazdu);
  po zmianie zobaczy w ustawieniach zdanie „w dniu przyjazdu" i jednym kliknięciem przestawi na wyjazd.
  Zmieniamy tylko **domyślny zestaw dla nowych kont**: sprzątanie w dniu wyjazdu + nowe „Wyślij prośbę
  o opinię — 1 dzień po wyjeździe" (spina się z modułem Opinie, X13). ⚖️ **To decyzja produktowa
  właściciela — łatwa do cofnięcia, jedna linijka w `src/utils/constants.js`.**
- **Automatycznej wysyłki nadal nie ma** — zadanie po wyjeździe to przypomnienie dla gospodarza,
  nie e-mail do gościa. Wysyłka to osobny temat ([[Projects/Plan-automatycznych-wiadomosci]], X19).

---

## Stan wykonania (21.08.2026)

Wszystkie cztery uwagi **zamknięte w kodzie tego samego dnia**, w kolejności z planu.

| | Co zrobione | Pliki |
|---|---|---|
| X20 | Kotwica `anchor` + wspólny moduł terminów, lista „Kiedy" + „Ile dni" i zdanie kontrolne w Ustawieniach, opis terminu w szczegółach rezerwacji | `src/utils/taskSchedule.js` (nowy), `SettingsModal.jsx`, `BookingDetailView.jsx`, `ManagerApp.jsx`, `constants.js` |
| X21 | Kafel liczony z tej samej listy, co „Zadania na dziś"; obiekty bez powtórzeń; klik → raport dzienny | `ManagerApp.jsx`, `PulpitView.jsx` |
| X22 | Klik i przeciągnięcie po wolnych nocach, blokada zajętych, przycisk „+" przy obiekcie dla klawiatury | `CalendarView.jsx`, `ManagerApp.jsx`, `styles.js` |
| X23 | Filtr obiektu w nagłówku, obejmuje metryki pod kalendarzem | `CalendarView.jsx`, `ManagerApp.jsx` |

**Weryfikacja:** lint 0, build OK, **e2e 181/181** (7 nowych testów w `e2e/tasks-calendar.spec.js` —
każdy pilnuje jednej uwagi testera, łącznie z blokadą dubla na zajętej nocy).

🐛 **Złapane przez test, nie przez oko:** przy „0 dni" strony kotwicy są nierozróżnialne w danych
(0 dni przed = 0 dni po = ten sam dzień), więc lista wyboru wracała do „Przed…" i gubiła wybór
gospodarza w trakcie ustawiania. Wybór trzymany jest teraz lokalnie w formularzu, a `-0` nigdy
nie trafia do bazy.

⏸ **Zostaje deploy** — `firebase deploy --only hosting:app` (reguł ani funkcji ta tura nie rusza,
więc to pojedyncze wydanie frontu) i **potwierdzenie u testera**, że kafel i kalendarz zachowują
się tak, jak prosił.
