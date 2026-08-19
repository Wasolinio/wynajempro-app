import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock.js';

/*
  Zapis do newslettera — zgoda marketingowa i dowód zgody.

  Powód istnienia tego speca (2026-08-19, z audytu copy landingu): formularz zapisywał
  adresy do `newsletter_subscribers` **bez pola zgody i bez klauzuli informacyjnej**,
  podczas gdy projekt Polityki prywatności deklarował dla newslettera podstawę
  „zgoda" (art. 6 ust. 1 lit. a). Dokument opisywał więc zgodę, której nigdy nie było —
  ten sam wzorzec rozjazdu deklaracji ze stanem faktycznym, co przy App Check i kopiach.

  Asercje celują w to, co FAKTYCZNIE trafia do Firestore, nie w widok checkboxa:
  reguła `firestore.rules` odrzuca dokument bez `consent: true`, więc gdyby front
  przestał je wysyłać, zapis padłby u prawdziwego użytkownika na produkcji.
*/

const otworzLanding = async (page) => {
  await setupFirebaseMocks(page, { consentCookies: true });
  await page.goto('/');
};

const zapisanyDokument = (page) => page.evaluate(() => {
  const wpisy = Object.entries(window.__mockDbData || {})
    .filter(([k]) => k.includes('newsletter_subscribers'));
  return wpisy.length ? wpisy[wpisy.length - 1][1] : null;
});

test('Bez zaznaczonej zgody adres NIE trafia do bazy', async ({ page }) => {
  await otworzLanding(page);

  await page.locator('.wp4-news__field input').fill('anna@example.com');
  await page.getByRole('button', { name: /Zapisz się/ }).click();

  // Użytkownik dostaje zrozumiały komunikat, a nie błąd uprawnień z Firestore.
  await expect(page.locator('.wp4-news__note--err')).toContainText('Zaznacz zgodę');
  expect(await zapisanyDokument(page)).toBeNull();
});

test('Ze zgodą zapisuje się adres wraz z dowodem zgody', async ({ page }) => {
  await otworzLanding(page);

  await page.locator('.wp4-news__field input').fill('anna@example.com');
  await page.locator('.wp4-news__consent input').check();
  await page.getByRole('button', { name: /Zapisz się/ }).click();

  await expect(page.locator('.wp4-news__note')).toContainText('Dziękujemy');

  const zapisany = await zapisanyDokument(page);
  expect(zapisany).toBeTruthy();
  expect(zapisany.email).toBe('anna@example.com');
  // Dowód zgody: bez tych dwóch pól reguła Firestore odrzuci dokument.
  expect(zapisany.consent).toBe(true);
  expect(zapisany.consentVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test('Klauzula informacyjna jest przy formularzu, nie tylko w Polityce', async ({ page }) => {
  await otworzLanding(page);

  // RODO art. 13 wymaga informacji w momencie ZBIERANIA danych — sam link do Polityki
  // gdzieś w stopce tego nie zastępuje. Ten sam wzorzec co pod formularzem /kontakt.
  const klauzula = page.locator('.wp4-news__clause');
  await expect(klauzula).toContainText('Administratorem adresu');
  await expect(klauzula).toContainText('wycofania zgody');
  await expect(klauzula.getByRole('link', { name: /Polityka prywatności/ })).toBeVisible();
});
