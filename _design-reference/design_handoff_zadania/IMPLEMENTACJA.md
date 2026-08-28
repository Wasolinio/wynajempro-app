# Implementacja w repo WynajemPRO

Kontekst techniczny odczytany z repozytorium: React 18 + Vite, Firebase (Auth, Firestore, Storage,
Functions), stan globalny w `src/context/WynajemContext.jsx` + `src/hooks/useFirebaseData.js`,
arkusz panelu w `src/pages/dashboard/styles.js` (namespace `.wpd`), ikony `lucide-react`,
testy Playwright w `e2e/`.

## 1. Model danych

Dziś zadania żyją w dwóch miejscach:

1. **z szablonów** — `users/{uid}/settings/reminders.items[]`
   (`{ id, text, shortName, anchor: 'arrival'|'departure', daysBefore, icon }`),
   termin liczy `src/utils/taskSchedule.js`, wykonanie zapisuje się w rezerwacji
   (`rentals.completedTasks[templateId]`, plus flagi `directionsSent` / `keycodeSent`);
2. **ręczne** — dokument w `users/{uid}/rentals` z `type: 'reminder'`, polami `date`, `text`
   i `isCompleted` (dodawane przez `AddEditEntryModal`, zakładka „Zadanie”).

Moduł potrzebuje pól, których ten model nie ma (priorytet, godzina, checklista, notatka,
zdjęcia, powtarzalność, jawny link do rezerwacji) oraz **zadań bez daty** (skrzynka).
Ostatnie jest twardym blokerem dla `rentals`: subskrypcja w `useFirebaseData.js` filtruje
`where('date','>=',yearStart)` i `where('date','<=',yearEnd)`, więc dokument bez `date`
nigdy się nie pobierze.

### Rekomendacja: osobna kolekcja `users/{uid}/tasks`

```js
// users/{uid}/tasks/{taskId}
{
  text: 'Dowieźć ręczniki',
  propertyName: 'Domek nad jeziorem', // repo trzyma nazwę obiektu, nie id — zachować spójność
  rentalId: '1755900000000' | null,   // link do users/{uid}/rentals/{id}
  templateId: null,                   // tylko dla zadań zmaterializowanych z szablonu
  date: '2026-08-25' | null,          // null = skrzynka „do przypisania”
  time: '11:00' | '',
  priority: 'wysoki' | 'normalny' | 'niski',
  note: '',
  subtasks: [{ text: 'Pościel i ręczniki', done: true }],
  recurrence: null | { kind: 'weekly' | 'monthly' | 'afterCheckout', label: 'co miesiąc' },
  photos: [{ path: 'users/{uid}/tasks/{taskId}/1.jpg', url: '…' }],
  done: false,
  doneAt: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

Zasady:

- **Zadania z szablonów nie są zapisywane.** Pozostają wyliczane w locie z `templates × rentals`
  (jak dziś w `dailyReport`), dostają syntetyczne id `tpl:{rentalId}:{templateId}` i flagę
  `source: 'template'`. Odhaczenie takiego zadania nadal woła istniejące
  `toggleDynamicTask(rentalId, templateId, current)` z `WynajemContext`. Zero migracji,
  zero rozjazdu z `BookingDetailView` i `DailyReportModal`.
- **Zadanie z szablonu, które gospodarz przeciągnie na inną rezerwację lub dzień**, jest
  materializowane: powstaje dokument w `tasks` z `templateId` i przesuniętym `date`,
  a wyliczanie pomija ten `(rentalId, templateId)`. Pole `templateId` jest do tego kluczem.
- **Migracja `rentals type:'reminder'`** — jednorazowy skrypt (wzór: `scripts/`), mapowanie
  `text → text`, `date → date`, `isCompleted → done`, `property → propertyName`.
  Przez jedno wydanie czytać oba źródła (`tasks` + `rentals.type==='reminder'`),
  potem usunąć drugie i uprościć filtr `bookingFilter === 'tasks'` w `BookingsView`.
- **Indeks** w `firestore.indexes.json`: `tasks` — `done ASC, date ASC`
  (lista dzienna) oraz `rentalId ASC, done ASC` (zadania w szczegółach rezerwacji).
- **Reguły** w `firestore.rules` — skopiować blok `rentals` na `tasks` (właściciel = `uid`
  z ścieżki), dodać limit rozmiaru `subtasks` (np. 50) i `photos` (np. 10).
- **Storage** `storage.rules`: `users/{uid}/tasks/{taskId}/**` — zapis tylko dla właściciela,
  limit rozmiaru zdjęcia. Kasowanie razem z kontem (rozszerzyć `deleteUserAccount`
  w `functions/index.js`, tam gdzie dziś czyszczone są `guides/{guideId}/**`).

## 2. Pliki

### Nowe

| Plik | Zawartość |
|---|---|
| `src/pages/dashboard/views/TasksView.jsx` | widok: pasek liczników, oś, lista dzienna, skrzynka |
| `src/pages/dashboard/tasks/AssignAxis.jsx` | oś przypisania (7 dni × obiekty, paski, komórki-cele) |
| `src/pages/dashboard/tasks/TaskCard.jsx` | kartka zadania (lista i skrzynka, wariant `compact`) |
| `src/pages/dashboard/tasks/QuickTaskPopover.jsx` | szybkie zadanie (kontekst rezerwacji, chipy, priorytet, godzina) |
| `src/pages/dashboard/tasks/useTaskDrag.js` | hook przeciągania: klon, rAF, plakietka, hit-test, lot do celu |
| `src/pages/dashboard/tasks/useTasksBoard.js` | selektor: scalenie `tasks` + zadań z szablonów, sekcje dni, podgrupy obiektów, liczniki |
| `src/components/WpdSelect.jsx` | custom select (zamiennik `.wpd-select`) |
| `src/components/WpdDatePicker.jsx` | kalendarz z zajętością obiektu (na razie w popoverze; potem pola przyjazd/wyjazd) |
| `src/utils/taskRecurrence.js` | rozwijanie powtarzalności na kolejne terminy |

### Modyfikowane

| Plik | Zmiana |
|---|---|
| `src/pages/dashboard/styles.js` | dopisać blok z `tokens-zadania.css` na końcu `DASHBOARD_CSS`, przed sekcją responsywności; nowe klasy dodać też do bloku `prefers-reduced-motion` |
| `src/pages/dashboard/ManagerApp.jsx` | pozycja `06 Zadania` w `wpd-nav` i w `.wpd-bottombar`, routing widoku (`changeView('tasks')`, `key` dla animacji wejścia), przekazanie akcji zadań |
| `src/context/WynajemContext.jsx` | subskrypcja `tasks` + akcje: `addTask`, `updateTask`, `assignTask(taskId, { date, rentalId, propertyName })`, `toggleTaskDone`, `toggleSubtask`, `deleteTask` — wzór jak `toggleStatus` / `toggleDynamicTask` (`updateDoc`, `useCallback`, `toast`) |
| `src/hooks/useFirebaseData.js` | `onSnapshot` na `users/{uid}/tasks` (bez filtra roku), stan `tasks` |
| `src/components/FloatingTaskWidget.jsx` | „Zobacz wszystkie” → `changeView('tasks')`; źródłem danych to samo `useTasksBoard` |
| `src/pages/dashboard/views/BookingDetailView.jsx` | sekcja „Zadania i przypomnienia” czyta też `tasks` z `rentalId` tej rezerwacji |
| `src/pages/dashboard/modals/AddEditEntryModal.jsx` | zakładka „Zadanie” pisze do `tasks` (pola: priorytet, godzina, notatka); pola daty na `WpdDatePicker`, `<select>` na `WpdSelect` |
| `firestore.rules`, `firestore.indexes.json`, `storage.rules` | jak w pkt 1 |
| `src/README.md`, `docs/Features.md`, `docs/Schema.md`, `docs/Activity-Log.md`, `docs/Decisions.md` | konwencja repo: opis modułu, schemat `tasks`, wpis w logu, decyzja o osobnej kolekcji |

## 3. Kolejność wdrożenia

1. **Dane** — kolekcja `tasks`, reguły, indeksy, subskrypcja, akcje w kontekście. Bez UI.
2. **CSS** — wklejenie `tokens-zadania.css`, uzupełnienie bloku `prefers-reduced-motion`.
3. **Widok statyczny** — `TasksView` z listą dzienną i skrzynką (bez przeciągania),
   nawigacja `06 Zadania`. Od tego momentu moduł jest użyteczny.
4. **Oś przypisania** — `AssignAxis` z paskami i celami, klik w pasek → `QuickTaskPopover`.
5. **Przeciąganie** — `useTaskDrag` (klon, plakietka, snap, lot do celu, błysk po zapisie)
   plus ścieżka klawiaturowa (przycisk `+` w wierszu, „Przypisz” na kartce).
6. **Materializacja zadań z szablonów** przy przeciągnięciu + `taskRecurrence`.
7. **Zdjęcia** (Storage) — na końcu, to jedyna część dotykająca reguł Storage.
8. **Migracja** `rentals type:'reminder'` → `tasks`, potem usunięcie odczytu zgodnościowego.

Punkty 1–4 dają wdrażalny moduł; 5 jest tym, co użytkownik zamawiał jako sposób przypisywania,
więc nie należy go odkładać za 6–8.

## 4. Kontrakty komponentów

```jsx
<AssignAxis
  days={days}                 // [{ key:'2026-08-23', num:'23', dow:'ND', today:true, weekend:true }]
  rows={rows}                 // [{ property, bars:[{ rentalId, guest, source, left, width, radius }], busy:Set }]
  onBarClick={(rentalId, el) => void}      // otwiera popover, `el` do pozycjonowania
  onCellAdd={(propertyName, dayKey, el) => void}  // ścieżka klawiaturowa
  dropApi={dropApi}           // z useTaskDrag: rejestracja celów + podświetlenia
/>

<TaskCard
  task={task}                 // znormalizowane zadanie (patrz useTasksBoard)
  compact={false}             // wariant skrzynki
  onToggleDone={(task) => void}          // tasks → updateDoc; template → toggleDynamicTask
  onToggleSubtask={(task, index) => void}
  onOpenChecklist={(taskId) => void}
  onDragStart={(event, task) => void}     // useTaskDrag().begin
/>

<QuickTaskPopover
  anchor={{ top, left, maxHeight }}
  context={{ rentalId, guest, propertyName, arrival, departure }}  // null = bez rezerwacji
  occupancy={occupancy}       // do kalendarza: [{ day, guest, nights, price }]
  onSubmit={(draft) => void}  // { text, date, time, priority }
  onClose={() => void}
/>
```

`useTasksBoard()` zwraca:

```js
{
  sections,     // [{ id, label, sub, tone:'overdue'|'normal', count, groups:[{ property, tasks }] }]
  inbox,        // zadania bez daty
  counters,     // { remaining, overdue, today, inbox, done }
  axis,         // { days, rows }
  occupancy,    // zajętość per obiekt na potrzeby kalendarza
}
```

## 5. Testy

Rozszerzyć `e2e/tasks-calendar.spec.js` albo dodać `e2e/tasks-module.spec.js`
(emulator Firebase, `VITE_USE_EMULATORS=true`, wzór z `e2e/costs-tasks.spec.js`):

1. Nawigacja `06 Zadania` renderuje oś, listę i skrzynkę; sekcje w kolejności
   Zaległe → Dziś → Jutro.
2. **Przypisanie przeciągnięciem**: `mouse.down` na kartce skrzynki → `mouse.move` nad pasek
   rezerwacji → `mouse.up`; kartka pojawia się w sekcji dnia z chipem gościa, licznik
   „Pozostało” bez zmian, licznik „Bez rezerwacji” −1, dokument w `tasks` ma `rentalId` i `date`.
3. **Przypisanie na wolny dzień**: `rentalId === null`, `date` i `propertyName` z komórki.
4. **Klik w pasek** otwiera popover z gościem w podtytule; „Dodaj zadanie” bez treści nie zapisuje;
   z treścią tworzy dokument i zamyka popover.
5. **Kalendarz w popoverze**: dzień zajęty ma `title` z liczbą nocy i kwotą, odmiana
   „3 noce” / „5 nocy”; 15.08 w kolorze świątecznym.
6. **Odhaczenie** zostawia zadanie na liście z przekreśleniem; licznik przewija się o 1;
   ponowny klik przywraca.
7. **Popover przy dolnej krawędzi ekranu** (viewport 1280×720, klik w pasek w ostatnim wierszu,
   otwarty kalendarz) — przycisk „Dodaj zadanie” w `viewport` (regresja: stopka wychodziła poza ekran).
8. **Kontrast mikro-etykiet** — sprawdzenie jak w `e2e/ui-scaling.spec.js`: żadna etykieta
   priorytetu nie używa `#DDD5C3` jako koloru tekstu.
9. `prefers-reduced-motion: reduce` — brak `animation` na pasku priorytetu zaległego zadania.

## 6. Ryzyka i pułapki

- **`elementFromPoint` + klon** — klon musi mieć `pointer-events: none`, inaczej hit-test
  trafia w niego samego.
- **Brak `setState` w pętli przeciągania** — jedno przerysowanie na ruch myszy zabija płynność
  na liście kilkudziesięciu zadań. Podświetlenia celów ustawiać imperatywnie na elemencie.
- **Przewijanie strony w trakcie przeciągania** — pozycje celów cache'ować przy starcie,
  ale odświeżać na `scroll` (albo blokować przewijanie na czas przeciągania).
- **`Date.now().toString()` jako id** (konwencja repo dla `rentals`) — dwa zadania dodane
  w tej samej milisekundzie nadpiszą się; dla `tasks` użyć `addDoc` lub `crypto.randomUUID()`.
- **Strefa czasowa** — daty jako `'YYYY-MM-DD'` z lokalnego czasu (`ManagerApp` liczy to już
  ręcznie przez `getFullYear/getMonth/getDate`, nie przez `toISOString`).
- **`type: 'reminder'` w rentals** — dopóki trwa okres zgodnościowy, zadanie może istnieć
  w dwóch miejscach; klucz deduplikacji: `text + date + propertyName`.
- **Wydruk** (`@media print` w `styles.js`) — moduł nie ma wydruku; upewnić się, że nowe klasy
  nie łapią się w regułach raportu ani umowy (oba bloki są zakresowane, ale warto sprawdzić).

## 7. Poza zakresem tej partii

- Nowy `WpdDatePicker` na polach **przyjazd/wyjazd** w `AddEditEntryModal` (dwa miesiące obok
  siebie, liczba nocy, blokada zajętych nocy, cena) — wzorzec gotowy w popoverze.
- Zamiana pozostałych `.wpd-select` na `WpdSelect`: źródło rezerwacji, kategoria kosztu,
  sortowanie, wybór roku, filtry pasków narzędzi.
- Widok mobilny modułu (< 980 px) — wytyczne w `README.md`, sekcja „Responsywność”.
