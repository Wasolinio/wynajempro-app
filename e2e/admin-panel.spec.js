import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock.js';

/*
  Panel administratora `/admin`.

  DLACZEGO TEN SPEC ISTNIEJE I CO WŁAŚCIWIE SPRAWDZA

  Panel nie czyta Firestore z przeglądarki — reguły zabraniają klientowi odczytu
  `contact_messages` i cudzych kont, i to zostaje. Wszystko idzie przez jedną funkcję
  `adminApi`. W testach podstawiamy tę funkcję i sprawdzamy DWIE rzeczy naraz:

  1. co panel POKAZUJE, gdy funkcja zwróci dane,
  2. **z jakimi parametrami panel funkcję woła** — bo to tam siedzą decyzje, które mają
     znaczenie: `includeTests: false` (zgłoszenia testowe ukryte), `level: 2` (osobne
     sięgnięcie po ustawienia), `revealTaxId` (odsłonięcie PESEL-u), `mode`/`days`
     przy nadawaniu dostępu. Gdyby ktoś kiedyś zmienił domyślną wartość któregoś z nich,
     panel dalej wyglądałby poprawnie — a zakres dostępu do danych osobowych byłby inny.

  Bramka uprawnień jest sprawdzana po stronie funkcji (`requireAdmin`) i tego ten spec
  nie testuje — testuje warstwę przeglądarki: brak sesji, brak claimu, obsługę odmowy.
*/

// ─── Fixtures ───────────────────────────────────────────────────────────────

const adminUser = {
  uid: 'uid-admin', email: 'admin@wynajempro.com', displayName: 'Właściciel',
  emailVerified: true, claims: { admin: true },
};
const zwyklyUser = {
  uid: 'uid-test', email: 'test@example.com', displayName: 'Zwykły gospodarz',
  emailVerified: true, claims: { stripeStatus: 'active' },
};

const dzien = (i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.getTime(); };

const wykres30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  return { date: d.toISOString().slice(0, 10), count: i === 20 ? 4 : (i % 3 === 0 ? 1 : 0) };
});

const OVERVIEW = {
  generatedAt: Date.now(), cached: false, truncated: false,
  accounts: { total: 37, byStatus: { trialing: 14, active: 9, past_due: 2, canceled: 12 }, verified: 28, unverified: 9, admins: 1 },
  registrations: { today: 2, d7: 8, d30: 24, prev7: 5, prev30: 12, chart: wykres30 },
  funnel: { registered: 37, verified: 28, profiled: 19, withBookings: 15, paying: 9 },
  trials: { active: 11, endingIn3: 2, endingIn7: 5, expired: 3 },
  revenue: { price: 49, interval: 'month', currency: 'PLN', mrr: 441, activeSubs: 9 },
  content: { rentals: 412, accountsWithData: 15, guides: 23, signatures: 87 },
  guests: { sessions: 129, staleDocs: 14 },
  messages: { total: 12, tests: 4, new: 3, open: 2, closed: 7, last7: 5 },
  newsletter: { total: 64, d30: 19 },
  risks: { pastDue: 2, scheduledDeletion: 1, unverifiedOlder7d: 4, missingDoc: 0, missingAuth: 0, staleGuestDocs: 14, messagesOverRetention: 0, retentionMonths: 12 },
};

const USERS = {
  total: 2, limit: 50, offset: 0,
  rows: [
    { uid: 'uid-anna', email: 'anna@example.com', name: 'Anna Kowalska', status: 'active', createdAt: dzien(120), trialEndsAt: null, lastSignInAt: dzien(1), rentals: 84, emailVerified: true, isAdmin: false },
    { uid: 'uid-marek', email: 'marek@example.com', name: 'Marek W.', status: 'trialing', createdAt: dzien(9), trialEndsAt: dzien(-5), lastSignInAt: dzien(2), rentals: 6, emailVerified: true, isAdmin: false },
  ],
};

const USER_POZIOM1 = {
  account: {
    uid: 'uid-marek', email: 'marek@example.com', name: 'Marek W.', status: 'trialing',
    createdAt: dzien(9), createdAtAuth: dzien(9), trialEndsAt: dzien(-5), lastSignInAt: dzien(2),
    emailVerified: true, provider: 'password', hasStripeCustomer: false, hasStripeSubscription: false,
    scheduledDeletionAt: null, missingDoc: false, missingAuth: false, claims: { stripeStatus: 'active' },
  },
  counts: { rentals: 6, guides: 1, settings: 4, hasHostProfile: true },
  mismatch: { claim: 'active', document: 'trialing' },
  settings: null,
};

const USER_POZIOM2 = {
  ...USER_POZIOM1,
  settings: {
    hostProfile: {
      entityName: 'Domki Marek', identifierType: 'PESEL',
      taxIdentifier: '········321', taxIdentifierRevealed: false,
      address: 'ul. Leśna 1', phone: '600100200', email: 'marek@example.com',
      publicEmail: null, showPublicContact: false,
    },
    properties: { count: 3 }, sources: { count: 4 }, recurringCosts: { count: 2 },
    tax: { rate: 8.5 },
    syncLinks: [{ key: 'Domek A', url: 'admin.booking.com/…(118 zn.)' }],
  },
};

const MESSAGES = {
  total: 2,
  counts: { new: 2, open: 1, closed: 7, tests: 4 },
  rows: [
    { id: 'm1', email: 'anna@example.com', message: 'Nie widzę rezerwacji z Booking.com w kalendarzu od trzech dni.', createdAt: dzien(0), source: 'kontakt', isTest: false, status: 'new', note: '', updatedAt: null },
    { id: 'm2', email: 'marek@example.com', message: 'Zapłaciłem, a panel dalej pokazuje ekran blokady.', createdAt: dzien(1), source: 'kontakt', isTest: false, status: 'new', note: '', updatedAt: null },
  ],
};

const NEWSLETTER = {
  total: 2,
  rows: [
    { id: 'n1', email: 'anna@example.com', subscribedAt: dzien(2), source: 'landing', consent: true, consentVersion: '2026-08-19' },
    { id: 'n2', email: 'stary@example.com', subscribedAt: dzien(300), source: null, consent: false, consentVersion: null },
  ],
};

const HEALTH = {
  generatedAt: Date.now(),
  scheduledDeletion: [{ uid: 'uid-x', email: 'rezygnacja@example.com', status: 'canceled', at: dzien(-21) }],
  pastDue: [], expiredTrials: [], unverified: [], missingDoc: [], missingAuth: [],
  revokedNoRetention: [{ uid: 'uid-odciete', email: 'odciete@example.com', canceledAt: dzien(40) }],
  staleGuestDocs: [{ uid: 'anon-abc123', pola: ['email', 'stripeId', 'stripeLink'], maEmail: true, createdAt: null }],
  orphanGuides: [{ id: 'g1', name: 'Domek nad jeziorem', ownerId: 'usuniete-konto', type: 'guide' }],
  messagesOverRetention: { months: 12, count: 0, oldest: dzien(300) },
};

const AUDIT = {
  rows: [
    { id: 'a1', at: dzien(0), adminUid: 'uid-admin', action: 'user.read.level2.taxId', details: { uid: 'uid-marek', email: 'marek@example.com' } },
    { id: 'a2', at: dzien(1), adminUid: 'uid-admin', action: 'access.trial', details: { uid: 'uid-marek', days: 14 } },
  ],
};

/**
 * Podstawia `adminApi` i ZAPISUJE każde wywołanie do `window.__adminCalls`.
 * To ten zapis jest właściwym przedmiotem połowy asercji w tym pliku.
 */
const otworzPanel = async (page, { user = adminUser, blad = null } = {}) => {
  await setupFirebaseMocks(page, {
    user,
    consentCookies: true,
    functions: {
      adminApi: () => ({}), // nadpisane niżej w addInitScript
    },
  });
  await page.addInitScript(({ overview, users, user1, user2, messages, newsletter, health, audit, blad: bl }) => {
    window.__adminCalls = [];
    window.__mockFunctions.adminApi = async (data) => {
      window.__adminCalls.push(data);
      if (bl && (!bl.action || bl.action === data.action)) {
        const err = new Error(bl.message);
        err.code = bl.code;
        throw err;
      }
      switch (data.action) {
        case 'overview': return overview;
        case 'users': return users;
        case 'user': return data.level === 2 ? user2 : user1;
        case 'messages': return messages;
        case 'messageUpdate': return { ok: true };
        case 'grantAccess': return { ok: true, status: 'trialing' };
        case 'newsletter': return newsletter;
        case 'health': return health;
        case 'audit': return audit;
        default: return {};
      }
    };
  }, {
    overview: OVERVIEW, users: USERS, user1: USER_POZIOM1, user2: USER_POZIOM2,
    messages: MESSAGES, newsletter: NEWSLETTER, health: HEALTH, audit: AUDIT, blad,
  });
  await page.goto('/admin');
};

const wywolania = (page, akcja) =>
  page.evaluate((a) => (window.__adminCalls || []).filter((c) => c.action === a), akcja);

// ─── 1. Bramka wejścia ──────────────────────────────────────────────────────

test('Bez sesji /admin przekierowuje na logowanie', async ({ page }) => {
  await setupFirebaseMocks(page, { user: null, consentCookies: true });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

test('Zalogowany BEZ claimu admin widzi odmowę, nie panel', async ({ page }) => {
  await otworzPanel(page, { user: zwyklyUser });

  await expect(page.getByRole('heading', { name: 'Brak uprawnień' })).toBeVisible();
  // Instrukcja nadania uprawnienia musi być na ekranie — inaczej właściciel utknie.
  await expect(page.locator('code')).toContainText('set-admin-claim.cjs');
  // Żadna sekcja panelu nie może się wyrenderować.
  await expect(page.getByRole('heading', { name: 'Przegląd' })).toHaveCount(0);
  // I — co najważniejsze — panel nie może nawet SPYTAĆ funkcji o dane.
  expect(await page.evaluate(() => window.__adminCalls.length)).toBe(0);
});

test('Odmowa z funkcji tłumaczy się na komunikat o odświeżeniu tokenu', async ({ page }) => {
  await otworzPanel(page, { blad: { code: 'functions/permission-denied', message: 'PERMISSION_DENIED' } });
  // Komunikat pada w dwóch miejscach naraz — w toaście (znika) i w panelu błędu
  // (zostaje). Sprawdzamy ten drugi: to on ma być czytelny minutę później.
  const panelBledu = page.getByRole('main');
  await expect(panelBledu.getByText(/Brak uprawnień administratora/)).toBeVisible();
  await expect(panelBledu.getByText(/wyloguj się i zaloguj ponownie/i)).toBeVisible();
});

// ─── 2. Przegląd ────────────────────────────────────────────────────────────

test('Przegląd pokazuje rejestracje, lejek i wykres 30 dni', async ({ page }) => {
  await otworzPanel(page);

  await expect(page.getByRole('heading', { name: 'Przegląd' })).toBeVisible();
  await expect(page.getByText('REJESTRACJE · 30 DNI')).toBeVisible();
  await expect(page.locator('.wpd-stat__value').first()).toHaveText('24');

  // Zmiana okresu do okresu liczona, nie przepisana: 24 vs 12 = +100%
  await expect(page.locator('.wpd-stat__delta').first()).toContainText('100%');

  // MRR z ceny Stripe × liczba aktywnych
  await expect(page.getByText(/MRR 441/)).toBeVisible();

  // Wykres ma DOKŁADNIE 30 kolumn — dni bez rejestracji też, inaczej kłamie o tempie
  await expect(page.locator('.wpa-chart30 .wpd-chart__col')).toHaveCount(30);

  // Lejek: pięć stopni, każdy z procentem względem rejestracji
  await expect(page.locator('.wpa-funnel__row')).toHaveCount(5);
  await expect(page.locator('.wpa-funnel__row').last()).toContainText('24%'); // 9 z 37
});

test('Panel „Wymaga uwagi” pokazuje tylko niezerowe pozycje', async ({ page }) => {
  await otworzPanel(page);
  const panel = page.locator('.wpd-panel', { has: page.getByRole('heading', { name: 'Wymaga uwagi' }) });

  await expect(panel.getByText('Zaległość w płatności')).toBeVisible();
  await expect(panel.getByText('Zaplanowane usunięcie danych')).toBeVisible();
  // messagesOverRetention: 0 i missingDoc: 0 — nie mają prawa się pokazać
  await expect(panel.getByText(/starsze niż/)).toHaveCount(0);
  await expect(panel.getByText('Login bez dokumentu w bazie')).toHaveCount(0);
});

// ─── 3. Nawigacja ───────────────────────────────────────────────────────────

test('Wszystkie sześć sekcji otwiera się i woła własną akcję', async ({ page }) => {
  await otworzPanel(page);

  // Czekamy na DANE każdej sekcji, nie na sam nagłówek. Konta i Zgłoszenia mają celowe
  // opóźnienie 300 ms przed wywołaniem funkcji (inaczej każde naciśnięcie klawisza
  // w wyszukiwarce byłoby osobnym żądaniem) — klikanie w kolejną sekcję bez czekania
  // anuluje to żądanie razem z odmontowanym widokiem.
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Konta', exact: true })).toBeVisible();
  await expect(page.getByText('anna@example.com').first()).toBeVisible();

  await page.getByRole('button', { name: /Zgłoszenia/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Zgłoszenia serwisowe' })).toBeVisible();
  await expect(page.getByText(/Nie widzę rezerwacji z Booking/)).toBeVisible();

  await page.getByRole('button', { name: /Newsletter/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Newsletter', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'stary@example.com' })).toBeVisible();

  await page.getByRole('button', { name: /Porządek/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Porządek w danych' })).toBeVisible();
  await expect(page.getByText('rezygnacja@example.com')).toBeVisible();

  await page.getByRole('button', { name: /Dziennik/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Dziennik administratora' })).toBeVisible();
  await expect(page.getByText('Przedłużenie trialu')).toBeVisible();

  for (const akcja of ['overview', 'users', 'messages', 'newsletter', 'health', 'audit']) {
    expect((await wywolania(page, akcja)).length, `brak wywołania akcji ${akcja}`).toBeGreaterThan(0);
  }
});

// ─── 4. Konta i stopniowanie dostępu ────────────────────────────────────────

test('Konta: wyszukiwanie trafia do funkcji jako parametr, nie filtruje w przeglądarce', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByPlaceholder('E-mail, nazwa albo UID…').fill('marek');

  await expect.poll(async () => (await wywolania(page, 'users')).some((c) => c.q === 'marek')).toBe(true);
});

test('Konta: szczegóły otwierają się na POZIOMIE 1 — ustawienia dopiero na żądanie', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  await expect(page.getByText('6 rezerwacji · 1 przewodników')).toBeVisible();

  // Pierwsze wywołanie NIE MOŻE nieść level: 2 — to jest cała istota stopniowania.
  const pierwsze = (await wywolania(page, 'user'))[0];
  expect(pierwsze.uid).toBe('uid-marek');
  expect(pierwsze.level).toBeUndefined();

  // Ustawienia są za przyciskiem, nie na ekranie
  await expect(page.getByText('ul. Leśna 1')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pokaż ustawienia' }).click();
  await expect(page.getByText('ul. Leśna 1')).toBeVisible();

  const zPoziomem2 = (await wywolania(page, 'user')).filter((c) => c.level === 2);
  expect(zPoziomem2.length).toBe(1);
  // Odsłonięcie identyfikatora to OSOBNA decyzja — nie może wejść razem z poziomem 2
  expect(zPoziomem2[0].revealTaxId).toBeFalsy();
});

test('Konta: identyfikator podatkowy przychodzi zamaskowany i ma osobne odsłonięcie', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();
  await page.getByRole('button', { name: 'Pokaż ustawienia' }).click();

  await expect(page.getByText(/PESEL ········321/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'odsłoń' })).toBeVisible();
});

test('Konta: rozjazd claim ↔ dokument jest wypisany wprost', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  await expect(page.getByText('Rozjazd uprawnień.')).toBeVisible();
  await expect(page.getByText(/Token mówi „active", dokument „trialing"/)).toBeVisible();
});

test('Konta: przedłużenie trialu wysyła tryb i liczbę dni', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  await page.getByLabel('Liczba dni trialu').fill('30');
  await page.getByRole('button', { name: 'Przedłuż trial' }).click();

  await expect.poll(async () => (await wywolania(page, 'grantAccess'))[0]).toMatchObject({
    uid: 'uid-marek', mode: 'trial', days: 30,
  });
});

test('Konta: nadanie i odebranie dostępu wymaga potwierdzenia', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  // Odrzucone potwierdzenie = brak wywołania. Nadanie dostępu bez pytania byłoby
  // jednym kliknięciem od zmiany statusu płatnego konta.
  page.once('dialog', (d) => d.dismiss());
  await page.getByRole('button', { name: 'Nadaj dostęp (beta)' }).click();
  expect((await wywolania(page, 'grantAccess')).length).toBe(0);

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Nadaj dostęp (beta)' }).click();
  await expect.poll(async () => (await wywolania(page, 'grantAccess'))[0]).toMatchObject({ mode: 'active' });
});

// ─── 5. Zgłoszenia serwisowe ────────────────────────────────────────────────

test('Zgłoszenia: testowe są ukryte domyślnie, przełącznik je włącza', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Zgłoszenia/ }).first().click();

  // Domyślne żądanie musi nieść includeTests: false — to jest zabezpieczenie przed
  // diagnozowaniem awarii, której nie było (Known-Issues #12).
  await expect.poll(async () => (await wywolania(page, 'messages'))[0]).toMatchObject({
    status: 'new', includeTests: false,
  });

  // Stopka MUSI mówić o stanie faktycznym. Wcześniej zdanie „testowe są ukryte" stało
  // bezwarunkowo, więc po włączeniu przełącznika panel dalej twierdził, że ukrywa —
  // i utwierdzał w przekonaniu, że coś nie działa (zgłoszenie właściciela 2026-08-25).
  // Test payloadu tego nie łapał, bo żądanie było poprawne; kłamał wyłącznie tekst.
  await expect(page.locator('.wpd-fhint')).toContainText('są ukryte');

  await page.getByRole('button', { name: /Testowe \(4\)/ }).click();
  await expect.poll(async () => (await wywolania(page, 'messages')).some((c) => c.includeTests === true)).toBe(true);

  await expect(page.locator('.wpd-fhint')).toContainText('są WŁĄCZONE');
  await expect(page.locator('.wpd-fhint')).not.toContainText('są ukryte');
});

test('Zgłoszenia: treść, odpowiedź mailto i zamknięcie sprawy', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Zgłoszenia/ }).first().click();
  await page.getByText(/Nie widzę rezerwacji z Booking/).click();

  await expect(page.locator('.wpa-msg')).toContainText('od trzech dni');
  await expect(page.getByRole('link', { name: 'Odpowiedz' }))
    .toHaveAttribute('href', /^mailto:anna@example\.com/);

  await page.getByRole('button', { name: 'Zamknij' }).click();
  await expect.poll(async () => (await wywolania(page, 'messageUpdate'))[0]).toMatchObject({
    id: 'm1', status: 'closed',
  });
});

test('Zgłoszenia: notatka zapisuje się osobno od statusu', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Zgłoszenia/ }).first().click();
  await page.getByText(/Nie widzę rezerwacji z Booking/).click();

  const zapisz = page.getByRole('button', { name: 'Zapisz notatkę' });
  await expect(zapisz).toBeDisabled(); // nic nie zmieniono
  await page.getByPlaceholder(/Co ustalono/).fill('Sprawdzić linki iCal.');
  await zapisz.click();

  await expect.poll(async () => (await wywolania(page, 'messageUpdate'))[0]).toMatchObject({
    id: 'm1', note: 'Sprawdzić linki iCal.',
  });
});

// ─── 6. Newsletter ──────────────────────────────────────────────────────────

test('Newsletter: zapis bez dowodu zgody jest oznaczony i ostrzeżony', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Newsletter/ }).first().click();

  await expect(page.getByText(/bez dowodu zgody/)).toBeVisible();
  // Wersja klauzuli w KOMÓRCE tabeli — to ona jest dowodem z art. 7 ust. 1.
  // (Ta sama data pada też w ostrzeżeniu nad tabelą, stąd zawężenie do wiersza.)
  const wierszZeZgoda = page.getByRole('row', { name: /anna@example\.com/ });
  await expect(wierszZeZgoda.getByRole('cell', { name: '2026-08-19' })).toBeVisible();
  await expect(page.locator('.wpd-tag--cynober', { hasText: 'brak' })).toBeVisible();
});

test('Newsletter: eksport to osobne wywołanie z flagą export', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Newsletter/ }).first().click();
  await page.getByRole('button', { name: 'Eksport CSV' }).click();

  // Osobne wywołanie, bo eksport danych osobowych ma zostawić inny ślad w dzienniku
  // niż samo obejrzenie listy.
  await expect.poll(async () => (await wywolania(page, 'newsletter')).some((c) => c.export === true)).toBe(true);
});

// ─── 7. Porządek i dziennik ─────────────────────────────────────────────────

test('Porządek: przewodnik bez właściciela jest widoczny wraz z powodem', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Porządek/ }).first().click();

  await expect(page.getByText('Domek nad jeziorem')).toBeVisible();
  await expect(page.getByText(/podpisy gości i sekrety/)).toBeVisible();
  // Okres retencji ma być opisany jako propozycja, nie decyzja
  await expect(page.getByText(/propozycja kierunkowa/)).toBeVisible();
});

test('Dziennik: odsłonięcie identyfikatora jest w logu pod własną nazwą', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Dziennik/ }).first().click();

  await expect(page.getByText('Odsłonięcie identyfikatora podatkowego')).toBeVisible();
  await expect(page.getByText('Przedłużenie trialu')).toBeVisible();
});

// ─── 8. Wąski ekran ─────────────────────────────────────────────────────────

test('Na telefonie sidebar znika, ale nawigacja zostaje', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await otworzPanel(page);

  await expect(page.locator('.wpd-side')).toBeHidden();
  const pasek = page.locator('.wpa-mnav');
  await expect(pasek).toBeVisible();

  // Wszystkie sześć pozycji jest osiągalnych (pasek przewija się w poziomie)
  await expect(pasek.locator('.wpa-mnav__item')).toHaveCount(6);
  await pasek.getByRole('button', { name: /Zgłoszenia/ }).click();
  await expect(page.getByRole('heading', { name: 'Zgłoszenia serwisowe' })).toBeVisible();
});

test('Panel nie przewija się w poziomie na 375 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await otworzPanel(page);

  const nadmiar = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(nadmiar).toBeLessThanOrEqual(1);
});

// ─── 9. Zabezpieczenia dodane po przeglądzie bezpieczeństwa ─────────────────

test('Odebranie dostępu kontu ze Stripe jest odrzucane, a powód widoczny', async ({ page }) => {
  // Panel odcina aplikację, ale NIE zatrzymuje płatności. Bez tej odmowy klient
  // płaciłby co miesiąc za produkt, do którego nie ma wstępu.
  await otworzPanel(page, {
    blad: {
      action: 'grantAccess',
      code: 'functions/failed-precondition',
      message: 'To konto ma aktywną subskrypcję Stripe. Odebranie dostępu tutaj odcięłoby aplikację, '
        + 'ale NIE zatrzymałoby płatności — klient płaciłby dalej za produkt, którego nie widzi. '
        + 'Anuluj subskrypcję w panelu Stripe: webhook sam ustawi status i 30-dniową karencję.',
    },
  });
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Odbierz' }).click();

  await expect(page.getByText(/NIE zatrzymałoby płatności/)).toBeVisible();
});

test('Konto bez loginu Auth ma wyłączone akcje dostępu i wyjaśnienie', async ({ page }) => {
  await otworzPanel(page);
  await page.addInitScript(() => {});
  // Podmieniamy odpowiedź dla szczegółów konta na wariant „dokument bez loginu"
  await page.evaluate(() => {
    const poprzednia = window.__mockFunctions.adminApi;
    window.__mockFunctions.adminApi = async (data) => {
      const wynik = await poprzednia(data);
      if (data.action === 'user') {
        return { ...wynik, account: { ...wynik.account, missingAuth: true } };
      }
      return wynik;
    };
  });
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  await expect(page.getByText(/nie ma loginu/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Przedłuż trial' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Nadaj dostęp (beta)' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Odbierz' })).toBeDisabled();
});

test('Puste pole dni wysyła 14, a nie zero', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Konta/ }).first().click();
  await page.getByText('marek@example.com').first().click();

  await page.getByLabel('Liczba dni trialu').fill('');
  await page.getByRole('button', { name: 'Przedłuż trial' }).click();

  await expect.poll(async () => (await wywolania(page, 'grantAccess'))[0]).toMatchObject({ days: 14 });
});

test('Obcięty skan rezerwacji jest zgłoszony, a nie przemilczany', async ({ page }) => {
  await otworzPanel(page);
  await page.evaluate(() => {
    const poprzednia = window.__mockFunctions.adminApi;
    window.__mockFunctions.adminApi = async (data) => {
      const wynik = await poprzednia(data);
      return data.action === 'users' ? { ...wynik, truncated: true } : wynik;
    };
  });
  await page.getByRole('button', { name: /Konta/ }).first().click();

  await expect(page.getByText(/kolumna „Rezerw." pokazuje liczby zaniżone/)).toBeVisible();
});

test('Błąd pobrania przeglądu daje powód i przycisk ponowienia, nie wieczny spinner', async ({ page }) => {
  await otworzPanel(page, {
    blad: { action: 'overview', code: 'functions/internal', message: 'Zapytanie collectionGroup padło' },
  });

  await expect(page.getByRole('heading', { name: 'Nie udało się pobrać danych' })).toBeVisible();
  // Powód musi zostać na ekranie, nie tylko mignąć w toaście — pierwsze wejście
  // po wdrożeniu to najbardziej prawdopodobny moment na błąd.
  await expect(page.getByRole('main').getByText('Zapytanie collectionGroup padło')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Spróbuj ponownie' })).toBeVisible();
  await expect(page.locator('.wpd-spin')).toHaveCount(0);
});

test('Porządek pokazuje konta odcięte poza ścieżką retencji', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Porządek/ }).first().click();

  await expect(page.getByRole('heading', { name: 'Odcięte, ale bez daty usunięcia' })).toBeVisible();
  await expect(page.getByText('odciete@example.com')).toBeVisible();
  await expect(page.getByText(/nocne czyszczenie ich nie ruszy/i)).toBeVisible();
});

test('Ekran odmowy podaje komendę, która faktycznie zadziała', async ({ page }) => {
  await otworzPanel(page, { user: zwyklyUser });
  const kod = page.locator('code');

  // Bez `cd functions` polecenie kończy się „Cannot find module 'firebase-admin'",
  // bez zmiennej z kluczem — brakiem poświadczeń. Instrukcja, która nie działa,
  // jest gorsza od żadnej: wygląda na wyczerpującą.
  await expect(kod).toContainText('cd functions');
  await expect(kod).toContainText('GOOGLE_APPLICATION_CREDENTIALS');
  await expect(kod).toContainText('set-admin-claim.cjs');
});

// ─── 10. Sesje gości nie są kontami ────────────────────────────────────────

test('Sesje gości stoją osobno od kont i lejka', async ({ page }) => {
  // Regresja z produkcji (2026-08-20): panel liczył anonimowe sesje z przewodników
  // jako konta — ze 131 loginów Auth 129 było sesjami gości, więc „131 kont", lejek
  // od 131 i 115 nieistniejących rozjazdów Auth ↔ baza. Żadna liczba nie była prawdziwa.
  await otworzPanel(page);

  const kartaGosci = page.locator('.wpd-stat', { has: page.getByText('SESJE GOŚCI') });
  await expect(kartaGosci).toContainText('129');
  await expect(kartaGosci).toContainText('nie konta');

  // Lejek liczy od kont (37), nie od kont + sesji (166)
  const lejek = page.locator('.wpa-funnel__row').first();
  await expect(lejek).toContainText('37');
  await expect(lejek).not.toContainText('166');
});

test('Dokumenty-widma po sesjach gości są zgłoszone w Porządku', async ({ page }) => {
  await otworzPanel(page);
  await page.getByRole('button', { name: /Porządek/ }).first().click();

  await expect(page.getByRole('heading', { name: 'Dokumenty-widma po sesjach gości' })).toBeVisible();
  await expect(page.getByText('anon-abc123')).toBeVisible();
  await expect(page.getByText(/pola: email, stripeId, stripeLink/)).toBeVisible();
  await expect(page.getByText(/dane osobowe bez właściciela/)).toBeVisible();
});
