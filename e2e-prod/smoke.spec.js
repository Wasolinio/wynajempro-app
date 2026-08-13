import { test, expect } from '@playwright/test';

/*
  SMOKE PRODUKCJI — chodzi po żywym `wynajempro.com`, bez mocków.

  PO CO: 2026-08-13 wyszło, że strony gościa nie działają na produkcji, a suita e2e
  świeciła 133/133 — bo mockuje Firebase ([[Known-Issues]] #16). Te testy sprawdzają
  to, czego tamte z definicji nie mogą: czy użytkownik dostaje działającą aplikację.

  Zakres: wyłącznie ścieżki PUBLICZNE. Panel jest za logowaniem i konta testowego
  na produkcji świadomie nie zakładamy — to zostaje smoke testem właściciela.
*/

test.describe('Strony publiczne odpowiadają i mają treść', () => {
  test('Landing: nagłówek, CTA i nawigacja', async ({ page }) => {
    const odpowiedz = await page.goto('/');
    expect(odpowiedz.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /wypróbuj/i }).first()).toBeVisible();
    // Stopka niesie wejście do panelu zgód (RODO art. 7 ust. 3) — jego zniknięcie
    // byłoby regresją w mechanizmie, który był osobno raportowany prawnikowi.
    await expect(page.getByRole('button', { name: 'Ustawienia cookies' })).toBeAttached();
  });

  test('Centrum pomocy: strona i artykuł', async ({ page }) => {
    await page.goto('/pomoc');
    await expect(page.getByRole('heading', { name: /centrum pomocy/i })).toBeVisible();

    const pierwszyArtykul = page.locator('a[href^="/pomoc/"]').first();
    await expect(pierwszyArtykul).toBeVisible();
    await pierwszyArtykul.click();
    await expect(page).toHaveURL(/\/pomoc\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Kontakt: formularz zgłoszenia jest dostępny', async ({ page }) => {
    await page.goto('/kontakt');
    await expect(page.locator('form')).toBeVisible();
    // Nie `locator('textarea')` — reCAPTCHA wstrzykuje własne, ukryte pole tej nazwy
    // i selektor łapie dwa elementy naraz (strict mode). Celujemy w klasę marki.
    await expect(page.locator('textarea.wpb-textarea')).toBeVisible();
  });

  test('Logowanie: formularz się renderuje', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Polityka prywatności ma wejście do wycofania zgody', async ({ page }) => {
    await page.goto('/prywatnosc');
    await expect(page.getByRole('button', { name: /wycofaj zgodę na cookies/i })).toBeVisible();
  });
});

test('Service worker działa w trybie „prompt", nie „autoUpdate"', async ({ request }) => {
  // Decyzja ADR-014: nowa wersja wchodzi na klik użytkownika. Powrót do autoUpdate
  // byłby cofnięciem tej decyzji i widać go w wygenerowanym pliku sw.js.
  const sw = await request.get('/sw.js');
  expect(sw.status()).toBe(200);
  const tresc = await sw.text();
  expect(tresc).toContain('SKIP_WAITING');
  expect(tresc).not.toContain('clientsClaim');
});

test('Stara domena przekierowuje z zachowaniem ścieżki', async ({ page }) => {
  await page.goto('https://moje-domki-6c77d.web.app/pomoc');
  await expect(page).toHaveURL('https://wynajempro.com/pomoc');
});

/*
  KANAREK sesji gościa (dawne [[Known-Issues]] #16, zamknięte 2026-08-13).

  Strony `/guide/:id` i `/opinie/:id` logują gościa anonimowo, ZANIM pokażą treść — więc
  wyłączony dostawca „Anonymous" w konsoli kładzie całą gościnną połowę produktu, nie
  ruszając panelu właściciela. Dokładnie to się stało i przeleżało nie wiadomo jak długo,
  bo suita e2e mockuje Firebase i świeciła 133/133. Ten test pilnuje TEJ warstwy: czy
  sesja gościa w ogóle powstaje.

  ⚠️ CZEGO NIE SPRAWDZA: odczytu przewodnika z bazy. App Check jest dla Firestore
  **wymuszany** (99% ruchu zweryfikowane), a przeglądarka sterowana automatem tokenu nie
  dostaje i jest — słusznie — odcinana. Asercja celuje więc wyłącznie w komunikat o błędzie
  autoryzacji SESJI; „błąd ładowania przewodnika" jest tu stanem normalnym i oczekiwanym.
  Czy człowiek widzi treść, rozstrzyga wyłącznie otwarcie prawdziwego linku na telefonie.

  Identyfikatorów przewodników celowo nie ma w repozytorium — to one są jedyną barierą
  dostępu do strony (`Ocena-linki-guide-opinie.md`), a zmyślone id wystarczy: przy
  działającej sesji daje „nie istnieje", a nie „błąd autoryzacji sesji".
*/
test('Sesja gościa: logowanie anonimowe nie jest zablokowane', async ({ page }) => {
  // Celujemy w ODPOWIEDŹ SERWERA, nie w tekst na ekranie. Powód: komunikat „błąd
  // autoryzacji sesji" pojawia się przy KAŻDEJ nieudanej sesji, a automat bywa odbijany
  // z powodu, który jest w porządku (brak tokenu App Check). Rozróżnia je dopiero kod:
  //   400 ADMIN_ONLY_OPERATION  → dostawca „Anonymous" wyłączony w konsoli = REGRESJA
  //   401 App Check             → bot bez tokenu = stan normalny, nie alarmujemy
  const odmowyPolityki = [];
  page.on('response', async (odpowiedz) => {
    if (!odpowiedz.url().includes('identitytoolkit')) return;
    if (odpowiedz.status() !== 400) return;
    const tresc = await odpowiedz.text().catch(() => '');
    if (tresc.includes('ADMIN_ONLY_OPERATION')) odmowyPolityki.push(tresc.slice(0, 120));
  });

  // Bez `networkidle`: od kiedy sesja gościa działa, strona trzyma otwarty strumień
  // Firestore i sieć nigdy nie cichnie — czekamy na wyrenderowany panel.
  await page.goto('/guide/smoke-test-nieistniejacy');
  await expect(page.locator('.wpb-body').first()).toBeVisible({ timeout: 20000 });

  expect(odmowyPolityki, 'Logowanie anonimowe odbite przez politykę kont — patrz Zlecenia #9').toEqual([]);
});
