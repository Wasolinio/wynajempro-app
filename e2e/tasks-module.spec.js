import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Moduł „Zadania" (E3, partia 1) — testy wg design_handoff_zadania/IMPLEMENTACJA.md §5
  (punkty 1–9). Suita chodzi na atrapie Firebase (e2e/firebase-mock.js), jak reszta e2e.

  Zegar jest PRZYPIĘTY przez page.clock.setFixedTime (fałszowana tylko data, timery
  i requestAnimationFrame zostają prawdziwe — sztuczne timery zabiłyby pętlę rAF
  przeciągania). Dzięki temu okno osi, sekcje i mini kalendarz są deterministyczne:
  „dziś" = niedziela 23 sierpnia 2026, dokładnie jak w prototypie.
*/

const TODAY = new Date('2026-08-23T10:00:00');

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

// pełny model dokumentu tasks (IMPLEMENTACJA.md §1) — fixture jest zarazem dokumentacją kształtu
const taskDoc = (over) => ({
  text: '', propertyName: null, rentalId: null, templateId: null,
  date: null, time: '', priority: 'normalny', note: '', subtasks: [],
  recurrence: null, photos: [], done: false, doneAt: null, ...over,
});

const baseDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': {
    items: [
      { name: 'Domek nad Jeziorem', color: 'blue', id: 'prop-1', secretToken: 'token1' },
      { name: 'Apartament Centrum', color: 'emerald', id: 'prop-2', secretToken: 'token2' },
    ],
  },
  'users/uid-test/settings/sources': { items: ['Booking.com', 'Airbnb'] },
  'users/uid-test/settings/categories': { items: ['Media'] },
  // pusta lista szablonów — bez niej weszłyby DEFAULT_TEMPLATES i zaśmieciły liczniki
  'users/uid-test/settings/reminders': { items: [] },

  // rezerwacje w oknie 23–29.08: Anna 3 noce (Apartament), Marek 5 nocy (Domek)
  'users/uid-test/rentals/r-anna': {
    id: 'r-anna', type: 'booking', property: 'Apartament Centrum', source: 'Airbnb',
    guest: 'Anna Nowak', date: '2026-08-23', endDate: '2026-08-26', income: 1350,
  },
  'users/uid-test/rentals/r-marek': {
    id: 'r-marek', type: 'booking', property: 'Domek nad Jeziorem', source: 'Booking.com',
    guest: 'Marek Zieliński', date: '2026-08-24', endDate: '2026-08-29', income: 1240,
  },
  // LEGACY: jednorazowe zadanie w rentals (odczyt zgodnościowy do migracji)
  'users/uid-test/rentals/task-legacy': {
    id: 'task-legacy', type: 'reminder', property: 'Domek nad Jeziorem',
    text: 'Stare zadanie z rentals', date: '2026-08-23', isCompleted: false,
  },

  // kolekcja tasks: 2 × skrzynka, zaległe, dziś, jutro
  'users/uid-test/tasks/t-inbox1': taskDoc({ text: 'Zawieźć klucze zapasowe do ekipy', priority: 'wysoki' }),
  'users/uid-test/tasks/t-inbox2': taskDoc({ text: 'Serwis kosiarki przed końcem sezonu', priority: 'niski' }),
  'users/uid-test/tasks/t-overdue': taskDoc({
    text: 'Wymienić żarówkę w sypialni', propertyName: 'Domek nad Jeziorem',
    date: '2026-08-20', priority: 'normalny', note: 'Ciepła barwa, E27.',
  }),
  'users/uid-test/tasks/t-today': taskDoc({
    text: 'Odczyt licznika prądu', propertyName: 'Domek nad Jeziorem',
    date: '2026-08-23', time: '18:00', priority: 'niski',
    subtasks: [{ text: 'Spisać stan', done: true }, { text: 'Wysłać do administracji', done: false }],
  }),
  'users/uid-test/tasks/t-tomorrow': taskDoc({
    text: 'Zamówić drewno do kominka', propertyName: 'Domek nad Jeziorem',
    date: '2026-08-24', priority: 'niski',
  }),
};

async function openTasks(page, dbData = baseDb) {
  await setupFirebaseMocks(page, { user: mockUser, dbData });
  await page.clock.setFixedTime(TODAY);
  await page.goto('/dashboard');
  await page.locator('.wpd-nav__item', { hasText: 'Zadania' }).first().click();
  await expect(page.locator('h2', { hasText: 'Oś przypisania' })).toBeVisible();
}

const tasksDocs = (page) => page.evaluate(() => {
  const db = window.__mockDbData || {};
  return Object.entries(db)
    .filter(([k]) => k.startsWith('users/uid-test/tasks/'))
    .map(([k, v]) => ({ key: k, ...v }));
});

async function dragTo(page, source, target) {
  // kartka poniżej dolnej krawędzi okna nie dostanie pointerdown — najpierw w kadr
  await source.scrollIntoViewIfNeeded();
  const a = await source.boundingBox();
  const b = await target.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
}

test('1. Nawigacja 06 Zadania: oś, lista w kolejności Zaległe→Dziś→Jutro, skrzynka', async ({ page }) => {
  await openTasks(page, {
    ...baseDb,
    // jeden szablon sprzątania → zadanie „z szablonu" w dniu wyjazdu Anny (26.08, środa)
    'users/uid-test/settings/reminders': {
      items: [{ id: 'cleaning', text: 'Zleć sprzątanie', shortName: 'Sprzątanie', anchor: 'departure', daysBefore: 0, icon: 'CheckSquare' }],
    },
  });

  // pozycja 06 w sidebarze
  const nav = page.locator('.wpd-nav__item', { hasText: 'Zadania' }).first();
  await expect(nav.locator('.wpd-nav__num')).toHaveText('06');

  // sekcje w kolejności: Zaległe → Dziś → Jutro (dalej dni tygodnia)
  const titles = await page.locator('.wpd-tk-sec__title').allTextContents();
  expect(titles.slice(0, 3)).toEqual(['Zaległe', 'Dziś', 'Jutro']);

  // skrzynka z dwoma kartkami bez daty
  const inbox = page.locator('.wpd-tk-inbox');
  await expect(inbox).toContainText('Do przypisania');
  await expect(inbox.locator('[data-task]')).toHaveCount(2);

  // legacy-reminder z rentals widoczny w Dziś (odczyt zgodnościowy)
  await expect(page.locator('.wpd-tk-card', { hasText: 'Stare zadanie z rentals' })).toBeVisible();

  // zadania z szablonu (po jednym na rezerwację): tag „z szablonu"; OD PARTII 2 mają
  // uchwyt przeciągania (upuszczenie materializuje) — stary kontrakt --static wygasł
  const tpls = page.locator('.wpd-tk-card', { hasText: 'Zleć sprzątanie' });
  await expect(tpls).toHaveCount(2);
  await expect(tpls.first()).toContainText('z szablonu');
  await expect(tpls.first()).not.toHaveClass(/wpd-tk-card--static/);
  await expect(tpls.first().locator('.wpd-tk-card__grip')).toBeVisible();

  // oś: 7 dni, dzisiejsza kolumna wyróżniona, paski obu rezerwacji
  await expect(page.locator('.wpd-tk-axis__dnum')).toHaveCount(7);
  await expect(page.locator('.wpd-tk-axis__dnum--today b')).toHaveText('23');
  await expect(page.locator('[data-res="r-anna"]')).toContainText('Anna Nowak');
  await expect(page.locator('[data-res="r-marek"]')).toContainText('Marek Zieliński');
});

test('2. Przeciągnięcie kartki na pasek: rentalId + date, licznik skrzynki -1, Pozostało bez zmian', async ({ page }) => {
  // wyższy viewport: oś i skrzynka muszą być w kadrze naraz (przeciąganie idzie po pikselach)
  await page.setViewportSize({ width: 1280, height: 960 });
  await openTasks(page);

  const remainingBefore = await page.locator('.wpd-tk-roll').getAttribute('aria-label');
  await expect(page.locator('[data-testid="tk-count-inbox"]')).toHaveText('2');

  const card = page.locator('.wpd-tk-inbox [data-task]', { hasText: 'Zawieźć klucze zapasowe' });
  // punkt upuszczenia ZNANY co do dnia: środek kolumny 25.08 (x z komórki pod paskiem),
  // wysokość paska Anny — mapowanie x→indeks dnia musi trafić dokładnie w 25.08,
  // asercja samego „jest data" nie łapała pomyłki o jeden dzień (przegląd code-reviewera)
  await card.scrollIntoViewIfNeeded();
  const a = await card.boundingBox();
  const barBox = await page.locator('[data-res="r-anna"]').boundingBox();
  const cell25 = await page.locator('[data-prop="Apartament Centrum"][data-day="2026-08-25"]').boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(cell25.x + cell25.width / 2, barBox.y + barBox.height / 2, { steps: 12 });
  await page.mouse.up();

  // dokument w tasks dostaje rentalId i DOKŁADNIE dzień, na który spadła kartka
  await expect.poll(async () => {
    const docs = await tasksDocs(page);
    const doc = docs.find((d) => d.text === 'Zawieźć klucze zapasowe do ekipy');
    return doc ? { rentalId: doc.rentalId, date: doc.date, prop: doc.propertyName } : null;
  }, { timeout: 5000 }).toEqual({ rentalId: 'r-anna', date: '2026-08-25', prop: 'Apartament Centrum' });

  // kartka pojawia się w sekcji dnia z chipem gościa
  const assigned = page.locator('.wpd-tk-list .wpd-tk-card', { hasText: 'Zawieźć klucze zapasowe' });
  await expect(assigned).toBeVisible();
  await expect(assigned.locator('.wpd-tk-res__guest')).toHaveText('Anna Nowak');

  // licznik „Bez rezerwacji" -1, „Pozostało" bez zmian (przypisanie ≠ wykonanie)
  await expect(page.locator('[data-testid="tk-count-inbox"]')).toHaveText('1');
  await expect(page.locator('.wpd-tk-roll')).toHaveAttribute('aria-label', remainingBefore);
});

test('3. Przeciągnięcie na wolny dzień: rentalId=null, date i propertyName z komórki', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 960 });
  await openTasks(page);

  const card = page.locator('.wpd-tk-inbox [data-task]', { hasText: 'Serwis kosiarki' });
  // 23.08 to wolny dzień Domku (Marek przyjeżdża 24.08)
  const cell = page.locator('[data-drop="day"][data-prop="Domek nad Jeziorem"][data-day="2026-08-23"]');
  await dragTo(page, card, cell);

  await expect.poll(async () => {
    const docs = await tasksDocs(page);
    const doc = docs.find((d) => d.text === 'Serwis kosiarki przed końcem sezonu');
    return doc ? { rentalId: doc.rentalId, date: doc.date, prop: doc.propertyName } : null;
  }, { timeout: 5000 }).toEqual({ rentalId: null, date: '2026-08-23', prop: 'Domek nad Jeziorem' });

  const assigned = page.locator('.wpd-tk-list .wpd-tk-card', { hasText: 'Serwis kosiarki' });
  await expect(assigned).toBeVisible();
});

test('4. Klik w pasek: popover z gościem; puste pole nie zapisuje, z treścią tworzy dokument', async ({ page }) => {
  await openTasks(page);

  await page.locator('[data-res="r-anna"]').click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Anna Nowak · Apartament Centrum');

  const before = (await tasksDocs(page)).length;

  // puste pole treści → nic się nie zapisuje, fokus wraca do inputa, popover zostaje
  await dialog.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Treść zadania')).toBeFocused();
  expect((await tasksDocs(page)).length).toBe(before);

  await dialog.getByLabel('Treść zadania').fill('Dowieźć ręczniki');
  await dialog.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await expect(dialog).toBeHidden();

  await expect.poll(async () => {
    const docs = await tasksDocs(page);
    const doc = docs.find((d) => d.text === 'Dowieźć ręczniki');
    return doc ? { rentalId: doc.rentalId, date: doc.date } : null;
  }, { timeout: 5000 }).toEqual({ rentalId: 'r-anna', date: '2026-08-23' });
});

test('5. Kalendarz w popoverze: zajętość z odmianą nocy, 15.08 świąteczne', async ({ page }) => {
  await openTasks(page);

  // Apartament Centrum: Anna, 3 noce
  await page.locator('[data-res="r-anna"]').click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.getByRole('button', { name: 'Kalendarz' }).click();
  const cal = dialog.locator('.wpd-tk-cal');
  await expect(cal).toBeVisible();
  await expect(cal.locator('.wpd-tk-cal__day--busy').first()).toHaveAttribute('title', /Anna Nowak · 3 noce ·/);
  // 15 sierpnia w kolorze świątecznym
  await expect(cal.locator('.wpd-tk-cal__day--holiday')).toHaveText('15');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  // Domek nad Jeziorem: Marek, 5 nocy — odmiana „nocy"
  await page.locator('[data-res="r-marek"]').click();
  await dialog.getByRole('button', { name: 'Kalendarz' }).click();
  await expect(dialog.locator('.wpd-tk-cal__day--busy').first()).toHaveAttribute('title', /Marek Zieliński · 5 nocy ·/);
});

test('6. Odhaczenie zostawia zadanie na liście z przekreśleniem; licznik przewija o 1; powrót działa', async ({ page }) => {
  await openTasks(page);

  // 6 niewykonanych: 2 × skrzynka + zaległe + dziś + jutro + legacy
  const roll = page.locator('.wpd-tk-roll');
  await expect(roll).toHaveAttribute('aria-label', 'Pozostało 6');

  const card = page.locator('.wpd-tk-card', { hasText: 'Odczyt licznika prądu' });
  await card.locator('.wpd-tk-check').click();

  await expect(card).toHaveClass(/wpd-tk-card--done/);
  await expect(card.locator('.wpd-tk-card__strike')).toBeVisible();
  await expect(roll).toHaveAttribute('aria-label', 'Pozostało 5');

  // ponowny klik przywraca
  await card.locator('.wpd-tk-check').click();
  await expect(card).not.toHaveClass(/wpd-tk-card--done/);
  await expect(roll).toHaveAttribute('aria-label', 'Pozostało 6');
});

test('7. Popover przy dolnej krawędzi: stopka „Dodaj zadanie" nie wychodzi poza ekran', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openTasks(page);

  // ostatni wiersz osi = Apartament Centrum; klik w jego pasek przy dole widoku
  await page.locator('[data-res="r-anna"]').scrollIntoViewIfNeeded();
  await page.locator('[data-res="r-anna"]').click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.getByRole('button', { name: 'Kalendarz' }).click();
  await expect(dialog.locator('.wpd-tk-cal')).toBeVisible();

  const btn = dialog.getByRole('button', { name: 'Dodaj zadanie' });
  await expect(btn).toBeVisible();
  const box = await btn.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(720);
});

test('8. Kontrast mikro-etykiet: żadna etykieta priorytetu nie używa #DDD5C3 jako koloru tekstu', async ({ page }) => {
  await openTasks(page);
  const colors = await page.evaluate(() => (
    [...document.querySelectorAll('.wpd-tk-prio')].map((el) => getComputedStyle(el).color)
  ));
  expect(colors.length).toBeGreaterThan(0);
  for (const c of colors) expect(c).not.toBe('rgb(221, 213, 195)');
});

test('9. prefers-reduced-motion: pasek priorytetu zaległego zadania nie pulsuje', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openTasks(page);

  const overdueCard = page.locator('.wpd-tk-card', { hasText: 'Wymienić żarówkę' });
  await expect(overdueCard).toBeVisible();
  const anim = await overdueCard.locator('.wpd-tk-card__prio').evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe('none');
});

/* ═══ PARTIA 2 ═══════════════════════════════════════════════════════════════ */

test('P2 materializacja: drag kartki szablonowej tworzy dokument z templateId, duplikat wyliczany znika', async ({ page }) => {
  // kartka szablonowa leży nisko (sekcja Środa), a cel to komórka osi u góry —
  // oba końce przeciągania muszą być w kadrze naraz, stąd wysoki viewport
  await page.setViewportSize({ width: 1280, height: 1600 });
  // tylko rezerwacja Anny + szablon sprzątania → dokładnie jedna kartka szablonowa
  const db = { ...baseDb };
  delete db['users/uid-test/rentals/r-marek'];
  db['users/uid-test/settings/reminders'] = {
    items: [{ id: 'cleaning', text: 'Zleć sprzątanie', shortName: 'Sprzątanie', anchor: 'departure', daysBefore: 0, icon: 'CheckSquare' }],
  };
  await openTasks(page, db);

  const tpl = page.locator('.wpd-tk-card', { hasText: 'Zleć sprzątanie' });
  await expect(tpl).toHaveCount(1);

  // 27.08 to wolny dzień Apartamentu (Anna wyjeżdża 26.08). Ciągniemy za UCHWYT —
  // geometryczny środek tej kartki trafia w odsłaniany hoverem przycisk „Przypisz"
  // (data-nodrag), który słusznie nie zaczyna przeciągania
  await dragTo(page, tpl.locator('.wpd-tk-card__grip'),
    page.locator('[data-drop="day"][data-prop="Apartament Centrum"][data-day="2026-08-27"]'));

  await expect.poll(async () => {
    const docs = await tasksDocs(page);
    const doc = docs.find((d) => d.templateId === 'cleaning');
    return doc ? { rentalId: doc.rentalId, date: doc.date, done: doc.done } : null;
  }, { timeout: 5000 }).toEqual({ rentalId: 'r-anna', date: '2026-08-27', done: false });

  // wyliczana para (r-anna, cleaning) jest odtąd pomijana — kartka jest JEDNA
  // (zmaterializowana, już bez taga „z szablonu") i niesie chip gościa z pobytu-matki
  await expect(tpl).toHaveCount(1);
  await expect(tpl).not.toContainText('z szablonu');
  await expect(tpl.locator('.wpd-tk-res__guest')).toHaveText('Anna Nowak');
});

test('P2 powtarzalność: odhaczenie tworzy następne wystąpienie tydzień później', async ({ page }) => {
  await openTasks(page, {
    ...baseDb,
    'users/uid-test/tasks/t-rec': taskDoc({
      text: 'Podlać kwiaty na tarasie', propertyName: 'Domek nad Jeziorem',
      date: '2026-08-23', priority: 'niski', recurrence: { kind: 'weekly', label: 'co tydzień' },
    }),
  });

  const card = page.locator('.wpd-tk-card', { hasText: 'Podlać kwiaty' }).first();
  await expect(card).toContainText('co tydzień');
  await card.locator('.wpd-tk-check').click();

  await expect.poll(async () => {
    const docs = (await tasksDocs(page)).filter((d) => d.text === 'Podlać kwiaty na tarasie');
    return docs.map((d) => ({ date: d.date, done: d.done })).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, { timeout: 5000 }).toEqual([
    { date: '2026-08-23', done: true },
    { date: '2026-08-30', done: false }, // +7 dni, powtarzalność jedzie dalej
  ]);
});

test('P2 konsumenci: zadanie z kolekcji widać na pulpicie, w raporcie dziennym i w zakładce Zadania', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.clock.setFixedTime(TODAY);
  await page.goto('/dashboard');

  // Pulpit „Zadania na dziś": kolekcja tasks (t-today) i legacy obok siebie
  const pulpit = page.locator('.wpd-panel', { hasText: 'Zadania na dziś' });
  await expect(pulpit).toContainText('Odczyt licznika prądu');
  await expect(pulpit).toContainText('Stare zadanie z rentals');

  // Raport dnia (dzwonek): to samo źródło; odhaczenie z raportu pisze do tasks
  await page.locator('button[title="Raport dzienny"]').click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toContainText('Odczyt licznika prądu');
  await dialog.locator('.wpd-rep__item', { hasText: 'Odczyt licznika prądu' })
    .getByTitle('Oznacz jako wykonane').click();
  await expect.poll(async () => {
    const docs = await tasksDocs(page);
    return docs.find((d) => d.text === 'Odczyt licznika prądu')?.done ?? null;
  }, { timeout: 5000 }).toBe(true);
  await expect(dialog).not.toContainText('Odczyt licznika prądu');
  await page.keyboard.press('Escape');

  // Rezerwacje → Zadania: legacy + kolekcja (także skrzynka, z pustym terminem)
  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).first().click();
  await page.locator('.wpd-seg__btn', { hasText: 'Zadania' }).click();
  await expect(page.locator('tr', { hasText: 'Stare zadanie z rentals' })).toBeVisible();
  await expect(page.locator('tr', { hasText: 'Odczyt licznika prądu' })).toBeVisible();
  await expect(page.locator('tr', { hasText: 'Zawieźć klucze zapasowe' })).toBeVisible();
});

test('P2 szczegóły rezerwacji: zadanie przypięte do rezerwacji widać i można odhaczyć', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/tasks/t-linked': taskDoc({
        text: 'Sprawdzić ręczniki przed przyjazdem', propertyName: 'Apartament Centrum',
        rentalId: 'r-anna', date: '2026-08-23', priority: 'wysoki',
      }),
    },
  });
  await page.clock.setFixedTime(TODAY);
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).first().click();
  await page.locator('tr', { hasText: 'Anna Nowak' }).click();

  const panel = page.locator('.wpd-panel', { hasText: 'Zadania i przypomnienia' });
  await expect(panel).toContainText('Sprawdzić ręczniki przed przyjazdem');

  await panel.locator('.wpd-row', { hasText: 'Sprawdzić ręczniki' })
    .getByTitle('Oznacz jako wykonane').click();
  await expect.poll(async () => {
    const docs = await tasksDocs(page);
    return docs.find((d) => d.text === 'Sprawdzić ręczniki przed przyjazdem')?.done ?? null;
  }, { timeout: 5000 }).toBe(true);
});

test('P2 mobile 375: skrzynka nad listą, oś przewijana poziomo, popover jako arkusz od dołu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.clock.setFixedTime(TODAY);
  await page.goto('/dashboard');

  // nawigacja mobilna: Zadania żyją w arkuszu „Więcej" (MOBILE_BAR = 4 pozycje, X12)
  await page.locator('.wpd-bottombar__item', { hasText: 'Więcej' }).click();
  await page.locator('.wpd-sheet .wpd-nav__item', { hasText: 'Zadania' }).click();
  await expect(page.locator('h2', { hasText: 'Oś przypisania' })).toBeVisible();

  // oś przewija się u siebie (min-width 720 przy oknie 375), strona stoi
  const scroll = await page.locator('.wpd-tk-axis__scroll').evaluate((el) => ({
    scrollable: el.scrollWidth > el.clientWidth,
  }));
  expect(scroll.scrollable).toBe(true);

  // skrzynka „Do przypisania" NAD listą (order:-1), jako poziomy pasek
  const inboxBox = await page.locator('.wpd-tk-inbox').boundingBox();
  const listBox = await page.locator('.wpd-tk-list').boundingBox();
  expect(inboxBox.y).toBeLessThan(listBox.y);

  // klik w pasek rezerwacji → popover jako arkusz od dołu (przyklejony do dołu ekranu)
  await page.locator('[data-res="r-anna"]').scrollIntoViewIfNeeded();
  await page.locator('[data-res="r-anna"]').click();
  const pop = page.locator('.wpd-tk-pop');
  await expect(pop).toBeVisible();
  // poll: wejście arkusza animuje translateY (wpd-sheet-in) — pomiar dopiero po dojechaniu
  await expect.poll(async () => {
    const b = await pop.boundingBox();
    return { x: Math.round(b.x), w: Math.round(b.width), bottom: Math.round(b.y + b.height) };
  }, { timeout: 3000 }).toEqual({ x: 0, w: 375, bottom: 812 });
  const radius = await pop.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { top: cs.borderTopLeftRadius, bottom: cs.borderBottomLeftRadius };
  });
  expect(radius).toEqual({ top: '4px', bottom: '0px' });
});

test('Zrzuty do przeglądu: desktop i 375 px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openTasks(page);
  await page.waitForTimeout(600); // koniec animacji wejścia — zrzut ma być ostry, nie w pół klatki
  await page.screenshot({ path: testInfo.outputPath('zadania-desktop.png'), fullPage: true });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: testInfo.outputPath('zadania-mobile-375.png'), fullPage: true });
});
