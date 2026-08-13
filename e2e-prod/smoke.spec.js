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
  KANAREK #16 — sesja gościa bez ważnego tokenu App Check.

  Strony `/guide/:id` i `/opinie/:id` logują gościa anonimowo, ZANIM pokażą treść.
  Dziś produkcja odbija to logowanie: `401 accounts:signUp` →
  `auth/firebase-app-check-token-is-invalid`. Czyli App Check jest **egzekwowany dla
  Authentication**, a klient nie umie zdobyć tokenu (403 przy wymianie — [[Known-Issues]] #13).
  Te dwie sprawy, prowadzone dotąd osobno, są jedną.

  ⚠️ CZEGO TEN TEST NIE ROZSTRZYGA: przeglądarka sterowana automatem to dokładnie ten ruch,
  który App Check ma odsiewać, więc niska ocena reCAPTCHA jest tu spodziewana. Ten kanarek
  mówi „gość BEZ ważnego tokenu App Check nie wejdzie" — i tyle. Czy wejdzie **człowiek
  z prawdziwej przeglądarki**, rozstrzyga wyłącznie otwarcie prawdziwego linku na telefonie.
  Nie zastępuj tym smoke testu właściciela.

  Test jest ODWRÓCONY (`test.fail`) — ten sam idiom co przy ukrytym pakiecie rocznym
  ([[Known-Issues]] #7): dopóki stan trwa, przechodzi i nie zasypuje nas czerwienią,
  a gdy przestanie, Playwright zgłosi „spodziewano się porażki, a test przeszedł".
  ⚠️ PO NAPRAWIE #16 zdejmij `test.fail()`.

  Identyfikatorów przewodników celowo nie ma w repozytorium — to one są jedyną barierą
  dostępu do strony (`Ocena-linki-guide-opinie.md`), a zmyślone id wystarczy: przy
  działającej sesji daje „nie istnieje", a nie „błąd autoryzacji sesji".
*/
test('Sesja gościa na stronach publicznych działa', async ({ page }) => {
  test.fail(true, 'Known-Issues #16 — App Check odbija logowanie anonimowe');

  // networkidle, bo komunikat pojawia się dopiero PO odbitym żądaniu do Auth —
  // asercja postawiona od razu po `load` przechodziła, zanim błąd zdążył się pokazać.
  await page.goto('/guide/smoke-test-nieistniejacy', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expect(page.getByText(/błąd autoryzacji sesji/i)).toHaveCount(0);
});
