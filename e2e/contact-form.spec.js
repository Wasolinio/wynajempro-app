import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock.js';

/*
  Formularz /kontakt — zapis do `contact_messages` i znacznik trybu testowego.

  Powód istnienia tego speca: 10.08.2026 właściciel wysłał zgłoszenie testowe z wymyśloną
  treścią, żeby sprawdzić, czy kanał w ogóle działa. Kanał nie miał czym odróżnić testu od
  prawdziwej awarii, więc wypełniacz uruchomił pełną diagnostykę błędu, którego nie było
  (Known-Issues #12). Znacznik `source: 'kontakt-test'` to zamyka — a ten test pilnuje,
  żeby oba warianty nie rozjechały się przy kolejnej zmianie formularza.

  Asercje celują w POLE `source` w zapisanym dokumencie, a nie w sam baner: baner jest
  kosmetyką, a wartość diagnostyczną ma wyłącznie to, co faktycznie trafia do Firestore.
*/

const wyslijFormularz = async (page, sciezka) => {
  await setupFirebaseMocks(page, { consentCookies: true });
  await page.goto(sciezka);

  await page.getByPlaceholder('twoj@email.com').fill('test@example.com');
  await page.getByPlaceholder('W czym możemy pomóc?').fill('Treść testowa zgłoszenia');
  await page.getByRole('button', { name: /Wyślij wiadomość/ }).click();

  await expect(page.locator('.wpb-note--ok')).toContainText('Wiadomość została wysłana!');

  return page.evaluate(() => {
    const wpisy = Object.entries(window.__mockDbData || {})
      .filter(([k]) => k.includes('contact_messages'));
    return wpisy.length ? wpisy[wpisy.length - 1][1] : null;
  });
};

test('Zwykłe zgłoszenie zapisuje się z source: kontakt', async ({ page }) => {
  const zapisany = await wyslijFormularz(page, '/kontakt');

  expect(zapisany).toBeTruthy();
  expect(zapisany.source).toBe('kontakt');
  expect(zapisany.email).toBe('test@example.com');
  expect(zapisany.message).toBe('Treść testowa zgłoszenia');
});

test('Tryb testowy (?test=1) zapisuje się z source: kontakt-test', async ({ page }) => {
  const zapisany = await wyslijFormularz(page, '/kontakt?test=1');

  expect(zapisany).toBeTruthy();
  expect(zapisany.source).toBe('kontakt-test');
  // reszta dokumentu bez zmian — znacznik NIE może modyfikować treści zgłoszenia
  expect(zapisany.email).toBe('test@example.com');
  expect(zapisany.message).toBe('Treść testowa zgłoszenia');
});

test('Baner trybu testowego pokazuje się TYLKO z parametrem', async ({ page }) => {
  await setupFirebaseMocks(page, { consentCookies: true });

  // Formularz klientowski musi zostać czysty — przypadkowe oznaczenie prawdziwego
  // zgłoszenia jako testu byłoby gorsze niż problem, który znacznik rozwiązuje.
  await page.goto('/kontakt');
  await expect(page.getByText('Tryb testowy')).toHaveCount(0);

  await page.goto('/kontakt?test=1');
  await expect(page.getByText('Tryb testowy')).toBeVisible();
  await expect(page.locator('.wpb-note--info')).toContainText('kontakt-test');
});

test('Nierozpoznana wartość parametru NIE włącza trybu testowego (fail-safe)', async ({ page }) => {
  // Gdyby `?test=cokolwiek` włączało tryb testowy, przypadkowy albo podrobiony link
  // wyciszałby prawdziwe zgłoszenia. Domyślnie zawsze zwykły kanał.
  const zapisany = await wyslijFormularz(page, '/kontakt?test=xyz');

  expect(zapisany.source).toBe('kontakt');
});
