import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';
import { PATCH_NOTES } from '../src/data/patchNotes.js';

/*
  E4: popup „Co nowego" (patch noty) w panelu /dashboard.

  Kryterium pokazania (ManagerApp): baseline = data z `lastSeenPatchNote` (pierwsze
  10 znaków id to 'RRRR-MM-DD'), a bez pola — data rejestracji konta
  (user.metadata.creationTime). Widoczne są wpisy z `date > baseline` (OSTRO,
  maks 5 najnowszych). Zamknięcie (X / tło / Escape / „Rozumiem") zapisuje
  `lastSeenPatchNote = PATCH_NOTES[0].id` w users/{uid}.

  Daty fixture'ów liczymy WZGLĘDEM WPISÓW z importowanego PATCH_NOTES, nigdy na
  sztywno — plik jest generowany i wpisy będą dochodzić (lekcja z panel-v2.spec).
  Atrapa auth (firebase-mock) przepuszcza obiekt usera 1:1 przez JSON, więc
  `metadata.creationTime` podajemy wprost w fixturze, w formacie UTC — dokładnie
  tak, jak wystawia go prawdziwe Firebase Auth. Użytkownicy pozostałych suit nie
  mają metadata ani lastSeenPatchNote → baseline null → popup się tam nie pokazuje.
*/

const NAJNOWSZY = PATCH_NOTES[0];
const NAJSTARSZY = PATCH_NOTES[PATCH_NOTES.length - 1];

// lokalny dzień z przesunięciem, godzina 12:00 — południe uodparnia konwersje
// lokalne↔UTC (creationTime jest stringiem UTC) na strefę czasową maszyny
const dzien = (dateStr, przesuniecie = 0) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d + przesuniecie, 12, 0, 0);
};
const TODAY = dzien(NAJNOWSZY.date, 2); // zegar przypięty: 2 dni po najnowszym wpisie

const uzytkownik = (creationTime) => ({
  uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true,
  metadata: { creationTime },
});

// hostProfile jest niezbędny — bez entityName ManagerApp pokazuje CompleteProfileScreen
const bazaDb = (profilExtra = {}) => ({
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com', ...profilExtra },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Wynajem'] },
  'users/uid-test/settings/reminders': { items: [] },
});

const popup = (page) => page.locator('.wpd-dialog', { hasText: 'Co nowego w panelu' });
const zapisaneId = (page) => page.evaluate(
  () => (window.__mockDbData || {})['users/uid-test']?.lastSeenPatchNote ?? null,
);

async function otworzPanel(page, { user, dbData }) {
  await setupFirebaseMocks(page, { user, dbData });
  await page.clock.setFixedTime(TODAY);
  await page.goto('/dashboard');
  await expect(page.locator('.wpd-side')).toBeVisible();
}

test('1. Konto z lastSeenPatchNote starszym niż najnowszy wpis widzi nowe wpisy; Escape zamyka i zapisuje', async ({ page }) => {
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJSTARSZY.date, -30).toUTCString()),
    dbData: bazaDb({ lastSeenPatchNote: NAJSTARSZY.id }),
  });

  const oczekiwane = PATCH_NOTES.filter((n) => n.date > NAJSTARSZY.date).slice(0, 5);
  expect(oczekiwane.length).toBeGreaterThan(0); // strażnik sensu fixture'a

  await expect(popup(page)).toBeVisible();
  await expect(popup(page).locator('.wpd-pn__sec')).toHaveCount(oczekiwane.length);
  await expect(popup(page)).toContainText(NAJNOWSZY.title);
  // wpis już widziany (baseline) nie wraca
  await expect(popup(page)).not.toContainText(NAJSTARSZY.title);

  // Escape idzie tym samym handlerem co „Rozumiem": zamyka i zapisuje id najnowszego
  await page.keyboard.press('Escape');
  await expect(popup(page)).toBeHidden();
  await expect.poll(() => zapisaneId(page)).toBe(NAJNOWSZY.id);
});

test('2. „Rozumiem" zamyka, zapisuje id najnowszego wpisu i po odświeżeniu popup nie wraca', async ({ page }) => {
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJSTARSZY.date, -30).toUTCString()),
    dbData: bazaDb({ lastSeenPatchNote: NAJSTARSZY.id }),
  });

  await expect(popup(page)).toBeVisible();
  await popup(page).getByRole('button', { name: 'Rozumiem' }).click();
  await expect(popup(page)).toBeHidden();
  await expect.poll(() => zapisaneId(page)).toBe(NAJNOWSZY.id);

  // „Odświeżenie": atrapa wstrzykuje __mockDbData na nowo przy każdej nawigacji
  // (addInitScript), więc utrwalony stan symulujemy nowym setupem z zapisanym id —
  // dokładnie tym, którego zapis sprawdziliśmy wyżej.
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJSTARSZY.date, -30).toUTCString()),
    dbData: bazaDb({ lastSeenPatchNote: NAJNOWSZY.id }),
  });
  await expect(page.locator('.wpd-top__title h1')).toBeVisible();
  await page.waitForTimeout(250); // efekt pokazania odpala się tuż po loading=false
  await expect(popup(page)).toHaveCount(0);
});

test('3. Świeżo zarejestrowane konto (creationTime = dziś) nie widzi popupu', async ({ page }) => {
  await otworzPanel(page, {
    user: uzytkownik(TODAY.toUTCString()),
    dbData: bazaDb(), // bez lastSeenPatchNote
  });
  await expect(page.locator('.wpd-top__title h1')).toBeVisible();
  await page.waitForTimeout(250);
  await expect(popup(page)).toHaveCount(0);
});

test('4. Porównanie jest ostre: rejestracja w dniu najnowszego wpisu = bez popupu', async ({ page }) => {
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJNOWSZY.date).toUTCString()),
    dbData: bazaDb(),
  });
  await expect(page.locator('.wpd-top__title h1')).toBeVisible();
  await page.waitForTimeout(250);
  await expect(popup(page)).toHaveCount(0);
});

test('5. Konto bez pola lastSeen z rejestracją sprzed wpisów widzi popup (maks 5)', async ({ page }) => {
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJSTARSZY.date, -10).toUTCString()),
    dbData: bazaDb(),
  });

  const oczekiwane = PATCH_NOTES.slice(0, 5); // baseline sprzed wszystkich wpisów
  await expect(popup(page)).toBeVisible();
  await expect(popup(page).locator('.wpd-pn__sec')).toHaveCount(oczekiwane.length);
  await expect(popup(page)).toContainText(NAJNOWSZY.title);
});

test('6. Przycisk X i klik w tło zamykają popup tym samym handlerem (zapis id)', async ({ page }) => {
  // X — osobny element niż „Rozumiem", więc osobna asercja
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJSTARSZY.date, -30).toUTCString()),
    dbData: bazaDb({ lastSeenPatchNote: NAJSTARSZY.id }),
  });
  await expect(popup(page)).toBeVisible();
  await popup(page).getByRole('button', { name: 'Zamknij' }).click();
  await expect(popup(page)).toBeHidden();
  await expect.poll(() => zapisaneId(page)).toBe(NAJNOWSZY.id);

  // klik w tło — warunek e.target === e.currentTarget na overlayu, łatwy do zepsucia
  // przy zmianach struktury; klik w róg overlaya (poza dialogiem)
  await otworzPanel(page, {
    user: uzytkownik(dzien(NAJSTARSZY.date, -30).toUTCString()),
    dbData: bazaDb({ lastSeenPatchNote: NAJSTARSZY.id }),
  });
  await expect(popup(page)).toBeVisible();
  await page.locator('.wpd-overlay').last().click({ position: { x: 8, y: 8 } });
  await expect(popup(page)).toBeHidden();
  await expect.poll(() => zapisaneId(page)).toBe(NAJNOWSZY.id);
});
