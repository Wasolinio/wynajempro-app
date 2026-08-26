/**
 * PANEL ADMINISTRATORA — jedna funkcja wejściowa `adminApi`.
 *
 * DLACZEGO SERWEROWO, A NIE PRZEZ REGUŁY
 * `firestore.rules` celowo zabraniają odczytu `contact_messages` (`allow read: if false`)
 * i pozwalają czytać `users/{uid}` wyłącznie właścicielowi. Panel administratora mógłby
 * powstać przez dopisanie do reguł wyjątku `isAdmin()` — świadomie tego NIE robimy:
 * poszerzałoby to powierzchnię dostępu klienckiego do wszystkich danych wszystkich kont
 * na podstawie tokenu w przeglądarce. Zamiast tego czyta Admin SDK, którego reguły nie
 * dotyczą, a przeglądarka dostaje wyłącznie gotowe, zawężone odpowiedzi.
 *
 * DLACZEGO JEDNA FUNKCJA, A NIE OSIEM
 * Bramka uprawnień jest jedna (`requireAdmin`) i nie da się jej pominąć przy dopisywaniu
 * kolejnej akcji. Osiem osobnych callable = osiem miejsc, w których można zapomnieć
 * o sprawdzeniu claimu.
 *
 * UPRAWNIENIE
 * Custom claim `admin: true`, nadawany wyłącznie skryptem z kluczem serwisowym
 * (`functions/set-admin-claim.cjs`). Świadomie NIE jest to pole w Firestore — pole
 * dałoby się nadpisać z klienta lub przez lukę w regułach, claim nie.
 *
 * STOPNIOWANIE DOSTĘPU (RODO, art. 5 ust. 1 lit. c)
 * Ten sam podział, co w `docs/support/Proces-obslugi-zgloszen.md`:
 *   poziom 1 — konto i subskrypcja (domyślny),
 *   poziom 2 — `settings/*` (na żądanie, z wpisem do dziennika),
 *   poziom 3 — dane Gości (rezerwacje, podpisy) — panel ich NIE POKAZUJE, tylko liczy.
 * Identyfikator podatkowy (może być PESEL) wraca zamaskowany; odsłonięcie to osobna,
 * jawnie zapisana w dzienniku akcja.
 *
 * DZIENNIK
 * Do `admin_audit` (kolekcja zamknięta dla klientów w regułach) trafia:
 *   • KAŻDA akcja zmieniająca dane,
 *   • każdy CELOWANY odczyt danych osobowych — konkretne konto, poziom 2, odsłonięcie
 *     identyfikatora, wyszukanie zgłoszenia po frazie, eksport newslettera, raport
 *     „Porządek" (zwraca imienne listy).
 * NIE trafia samo wyświetlenie roboczej listy kont ani przewinięcie skrzynki zgłoszeń:
 * front woła je z opóźnieniem 300 ms przy każdej zmianie filtra, więc audytowanie
 * ich zasypywałoby dziennik wpisami bez wartości dowodowej i przykrywało te, które ją
 * mają. Granica przebiega po pytaniu „czy to zapytanie dotyczy KONKRETNEJ osoby".
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { mergeClaims } = require("./claims");
const { stripeSecretKey, PRICE_ID } = require("./params");

// Warstwa odczytu w osobnym module — ten sam kod uruchamia lustrzany tester
// `audit-admin-api.cjs` poza Cloud Functions. Patrz nagłówek admin-data.js.
const {
  db, SCAN_LIMIT, MESSAGE_RETENTION_MONTHS,
  toMillis, maskIdentifier, maskUrl, messageLastActivity,
  loadSources, invalidateSources, loadMessages,
  buildOverview, buildHealth,
} = require("./admin-data");

// Okres przechowywania dziennika dostępu — ZATWIERDZONY: 12 miesięcy od zapisu
// (decyzja właściciela 2026-08-26, wariant 24 mies. odrzucony; zapis w
// `docs/legal/Polityka-prywatnosci.md` §2). Pierwotnie propozycja z oceny
// `docs/legal/Ocena-panelu-administratora-2026-08-19.md`; mechanizm działał od
// początku, bo zbiór danych osobowych BEZ ŻADNEGO okresu narusza art. 5 ust. 1
// lit. e od pierwszego wpisu. Zmiana okresu = zmiana tej jednej liczby.
const AUDIT_RETENTION_MONTHS = 12;

// =============================================================================
// BRAMKA UPRAWNIEŃ
// =============================================================================
function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Wymagane logowanie.");
  }
  if (request.auth.token.admin !== true) {
    // Log celowo z UID — próba wejścia na panel administratora bez uprawnień
    // jest zdarzeniem bezpieczeństwa, nie zwykłym błędem 403.
    console.warn(`⛔ adminApi: odmowa dla ${request.auth.uid} (brak claimu admin)`);
    throw new HttpsError("permission-denied", "Brak uprawnień administratora.");
  }
  return request.auth.uid;
}

/**
 * Wpis do dziennika. Zwraca `true`, jeśli zapis się udał.
 *
 * Dla większości akcji brak wpisu nie może wywrócić samej akcji — dostępność panelu
 * jest ważniejsza niż kompletność logu. Wyjątkiem jest odsłonięcie identyfikatora
 * podatkowego: tam jest odwrotnie i dlatego ta funkcja zwraca wynik, zamiast go połykać.
 *
 * ⚠️ `details` celowo NIE niesie adresu e-mail. Dziennik przeżywa usunięcie konta,
 * więc e-mail zostawałby w nim po realizacji prawa do usunięcia danych (art. 17).
 * Sam UID wystarcza do powiązania wpisu ze sprawą, a po skasowaniu konta staje się
 * identyfikatorem, za którym nic już nie stoi.
 */
async function audit(adminUid, action, details) {
  try {
    await db.collection("admin_audit").add({
      at: Timestamp.now(),
      adminUid,
      action,
      details: details || {},
    });
    return true;
  } catch (err) {
    console.error("❌ Nie udało się zapisać wpisu do admin_audit:", err);
    return false;
  }
}

/**
 * Dławiony wpis dla ekranów przeglądowych (lista kont).
 *
 * Front woła je z opóźnieniem 300 ms przy każdej pauzie w pisaniu, więc wpis na
 * każde wywołanie zasypywałby dziennik i przykrywał zdarzenia, które mają wartość
 * dowodową. Zerowy audyt też nie jest odpowiedzią: sam fakt sięgnięcia po listę kont
 * powinien zostawiać ślad. Kompromis: jeden wpis na administratora na okno 15 minut,
 * z liczbą wywołań w tym oknie. Stan w instancji funkcji — jak `overviewCache`.
 */
const oknaPrzegladania = new Map();
const OKNO_MS = 15 * 60 * 1000;

async function auditThrottled(adminUid, action) {
  const klucz = `${adminUid}:${action}`;
  const teraz = Date.now();
  const okno = oknaPrzegladania.get(klucz);
  if (okno && teraz - okno.od < OKNO_MS) {
    okno.wywolan += 1;
    return;
  }
  if (okno) {
    await audit(adminUid, action, { wywolanWOknie: okno.wywolan, oknoMinut: 15 });
  }
  oknaPrzegladania.set(klucz, { od: teraz, wywolan: 1 });
  await audit(adminUid, action, { poczatekOkna: true });
}

// =============================================================================
// MRR ZE STRIPE (wymaga sekretu — dlatego zostaje po stronie funkcji)
// =============================================================================
/** Cena z Stripe → MRR. Awaria Stripe nie może wywrócić całego przeglądu. */
async function stripeMrr(activeCount) {
  try {
    const stripe = require("stripe")(stripeSecretKey.value().trim());
    const price = await stripe.prices.retrieve(PRICE_ID);
    const amount = (price.unit_amount || 0) / 100;
    const interval = price.recurring ? price.recurring.interval : "month";
    const monthly = interval === "year" ? amount / 12 : amount;
    return {
      price: amount,
      interval,
      currency: (price.currency || "pln").toUpperCase(),
      mrr: Math.round(monthly * activeCount * 100) / 100,
      activeSubs: activeCount,
    };
  } catch (err) {
    console.warn("⚠️ Nie udało się pobrać ceny ze Stripe:", err.message);
    return null;
  }
}

// =============================================================================
// PAMIĘĆ PODRĘCZNA PRZEGLĄDU
// =============================================================================
// Stan instancji funkcji, nie warstwy odczytu: pulpit odświeżany co kilkanaście
// sekund nie ma powodu skanować bazy za każdym razem. `fresh: true` omija cache.
let overviewCache = { at: 0, data: null };
const OVERVIEW_TTL_MS = 60_000;

// =============================================================================
// AKCJA: users / user
// =============================================================================
async function actionUsers(params) {
  const { accounts, rentals } = await loadSources();
  const q = String(params.q || "").trim().toLowerCase();
  const status = params.status || "all";

  let rows = accounts.map((a) => ({ ...a, rentals: rentals.map.get(a.uid) || 0 }));
  if (status !== "all") rows = rows.filter((a) => a.status === status);
  if (q) {
    rows = rows.filter((a) =>
      (a.email || "").toLowerCase().includes(q)
      || (a.name || "").toLowerCase().includes(q)
      || a.uid.toLowerCase().includes(q));
  }
  const total = rows.length;
  const limit = Math.min(Number(params.limit) || 50, 200);
  const offset = Math.max(Number(params.offset) || 0, 0);
  // `truncated` musi jechać razem z wierszami: przy obciętym skanie kolumna
  // „Rezerw." pokazywałaby po cichu zaniżone liczby, a panel wyglądałby poprawnie.
  return { rows: rows.slice(offset, offset + limit), total, limit, offset, truncated: rentals.truncated };
}

async function actionUser(adminUid, params) {
  const uid = String(params.uid || "").trim();
  if (!uid) throw new HttpsError("invalid-argument", "Brak UID.");

  const [docSnap, authUser] = await Promise.all([
    db.collection("users").doc(uid).get(),
    getAuth().getUser(uid).catch(() => null),
  ]);
  if (!docSnap.exists && !authUser) {
    throw new HttpsError("not-found", "Nie ma takiego konta — ani dokumentu, ani loginu.");
  }
  const d = docSnap.data() || {};

  const [rentalsCount, guidesSnap, settingsSnap] = await Promise.all([
    db.collection("users").doc(uid).collection("rentals").count().get(),
    db.collection("guides").where("ownerId", "==", uid).select("name").get(),
    db.collection("users").doc(uid).collection("settings").get(),
  ]);

  // Poziom 1 — konto i subskrypcja. To rozstrzyga większość zgłoszeń.
  const account = {
    uid,
    email: d.email || (authUser && authUser.email) || null,
    name: d.name || (authUser && authUser.displayName) || null,
    status: d.status || d.accountStatus || "none",
    statusLegacy: d.accountStatus && d.status && d.accountStatus !== d.status ? d.accountStatus : null,
    createdAt: toMillis(d.createdAt),
    trialEndsAt: toMillis(d.trialEndsAt),
    paidAt: toMillis(d.paidAt),
    lastPaymentAt: toMillis(d.lastPaymentAt),
    canceledAt: toMillis(d.canceledAt),
    scheduledDeletionAt: toMillis(d.scheduledDeletionAt),
    dataCleanedAt: toMillis(d.dataCleanedAt),
    hasStripeCustomer: Boolean(d.stripeCustomerId),
    hasStripeSubscription: Boolean(d.stripeSubscriptionId),
    missingDoc: !docSnap.exists,
    missingAuth: !authUser,
    emailVerified: authUser ? authUser.emailVerified : null,
    disabled: authUser ? authUser.disabled : null,
    provider: authUser && authUser.providerData[0] ? authUser.providerData[0].providerId : null,
    createdAtAuth: authUser ? Date.parse(authUser.metadata.creationTime) : null,
    lastSignInAt: authUser && authUser.metadata.lastSignInTime ? Date.parse(authUser.metadata.lastSignInTime) : null,
    claims: authUser ? (authUser.customClaims || {}) : null,
  };

  // Liczby, nie treść: ile danych ma konto — bez zaglądania w rezerwacje.
  const counts = {
    rentals: rentalsCount.data().count,
    guides: guidesSnap.size,
    settings: settingsSnap.size,
    hasHostProfile: settingsSnap.docs.some((s) => s.id === "hostProfile"),
  };

  // Rozjazd claim ↔ dokument to najczęstsza przyczyna „zapłaciłem, a widzę paywall".
  const claimStatus = account.claims ? (account.claims.stripeStatus || null) : null;
  const mismatch = claimStatus && claimStatus !== account.status
    ? { claim: claimStatus, document: account.status }
    : null;

  const result = { account, counts, mismatch, settings: null };

  // Poziom 2 — settings/*. Wyłącznie na jawne żądanie i z wpisem do dziennika.
  if (params.level === 2) {
    // ODSŁONIĘCIE IDENTYFIKATORA JEST FAIL-CLOSED: wpis do dziennika idzie PRZED
    // zbudowaniem odpowiedzi i jego niepowodzenie przerywa akcję. Dla pozostałych
    // odczytów kompromis jest odwrotny (dostępność ponad kompletność logu), ale tutaj
    // stawką jest numer, którym może być PESEL — a odsłonięcie bez śladu jest dokładnie
    // tym, przed czym dziennik ma chronić.
    if (params.revealTaxId) {
      const zapisano = await audit(adminUid, "user.read.level2.taxId", { uid });
      if (!zapisano) {
        throw new HttpsError(
          "unavailable",
          "Nie udało się zapisać wpisu do dziennika, więc identyfikator NIE został odsłonięty. "
          + "Odsłonięcie bez śladu w dzienniku jest wyłączone. Spróbuj ponownie."
        );
      }
    }
    const settings = {};
    settingsSnap.docs.forEach((s) => {
      const v = s.data() || {};
      if (s.id === "hostProfile") {
        settings.hostProfile = {
          entityName: v.entityName || null,
          identifierType: v.identifierType || null,
          taxIdentifier: params.revealTaxId ? (v.taxIdentifier || null) : maskIdentifier(v.taxIdentifier),
          taxIdentifierRevealed: Boolean(params.revealTaxId && v.taxIdentifier),
          address: v.address || null,
          phone: v.phone || null,
          email: v.email || null,
          publicEmail: v.publicEmail || null,
          showPublicContact: Boolean(v.showPublicContact),
        };
      } else if (s.id === "syncLinks") {
        // Adresy iCal bywają sekretami (token w URL) — host wystarczy do diagnozy.
        const links = v.links || {};
        settings.syncLinks = Object.keys(links).map((key) => ({ key, url: maskUrl(links[key]) }));
      } else if (s.id === "properties" || s.id === "sources" || s.id === "categories" || s.id === "recurringCosts") {
        settings[s.id] = { count: Array.isArray(v.items) ? v.items.length : 0 };
      } else if (s.id === "tax") {
        settings.tax = { rate: v.rate ?? null };
      } else if (s.id === "reminders") {
        settings.reminders = { count: Array.isArray(v.items) ? v.items.length : 0 };
      }
    });
    result.settings = settings;
    // Przy odsłonięciu identyfikatora wpis powstał już wyżej (fail-closed) i jest
    // mocniejszy — drugi, słabszy wpis o tym samym zdarzeniu tylko rozmywałby dziennik.
    if (!params.revealTaxId) await audit(adminUid, "user.read.level2", { uid });
  } else {
    await audit(adminUid, "user.read.level1", { uid });
  }

  return result;
}

// =============================================================================
// AKCJA: grantAccess — nadanie/przedłużenie dostępu bez klucza serwisowego
// =============================================================================
// Powód istnienia: reguły słusznie zabraniają klientowi zmiany `status`
// i `trialEndsAt`, więc do 2026-08-19 nadanie dostępu testerowi bety było ręczną
// operacją Admin SDK na produkcji — bloker zaproszeń do bety z Roadmapy.
async function actionGrantAccess(adminUid, params) {
  const uid = String(params.uid || "").trim();
  const mode = params.mode;
  if (!uid) throw new HttpsError("invalid-argument", "Brak UID.");
  if (!["trial", "active", "revoke"].includes(mode)) {
    throw new HttpsError("invalid-argument", "Nieznany tryb.");
  }
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Konto nie ma dokumentu w bazie.");
  const before = snap.data() || {};

  // Login Auth sprawdzany PRZED zapisem dokumentu, nie po nim. Kolejność odwrotna
  // zostawiała konto w stanie połowicznym: dokument już zmieniony, claim nie — bo
  // `mergeClaims` rzuca `auth/user-not-found`, a właściciel widział surowy błąd
  // i nie wiedział, co się zapisało. Konta bez loginu panel sam pokazuje
  // w „Porządku" jako rozjazd Auth ↔ baza; tu po prostu odmawiamy.
  try {
    await getAuth().getUser(uid);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      throw new HttpsError(
        "failed-precondition",
        "To konto nie ma loginu — dokument został, ale użytkownik Auth już nie istnieje. "
        + "Zmiana dostępu nic by nie dała: nie ma komu wydać tokenu. Nic nie zostało zmienione."
      );
    }
    throw err;
  }

  if (mode === "trial") {
    const days = Math.min(Math.max(Number(params.days) || 14, 1), 365);
    // Przedłużamy od TERAZ albo od dotychczasowego końca, jeśli trial jeszcze trwa —
    // inaczej „przedłużenie" żywego trialu potrafiłoby go skrócić.
    const currentEnd = toMillis(before.trialEndsAt);
    const base = currentEnd && currentEnd > Date.now() ? new Date(currentEnd) : new Date();
    base.setDate(base.getDate() + days);
    await userRef.update({
      status: "trialing",
      trialEndsAt: Timestamp.fromDate(base),
      scheduledDeletionAt: FieldValue.delete(),
    });
    await mergeClaims(uid, { stripeStatus: "trialing", trialEndsAt: base.getTime() });
    await audit(adminUid, "access.trial", { uid, days, until: base.toISOString(), previousStatus: before.status || null });
    return { ok: true, status: "trialing", trialEndsAt: base.getTime() };
  }

  if (mode === "active") {
    // Dostęp bety / founding member — bez subskrypcji Stripe.
    // ⚠️ Na koncie z żywą subskrypcją webhook i tak nadpisze status przy
    // najbliższym zdarzeniu; zapisujemy to w dzienniku, żeby nie zdziwiło.
    await userRef.update({ status: "active", scheduledDeletionAt: FieldValue.delete() });
    await mergeClaims(uid, { stripeStatus: "active", trialEndsAt: null });
    await audit(adminUid, "access.active", {
      uid,
      previousStatus: before.status || null,
      note: params.note || null,
      stripeManaged: Boolean(before.stripeSubscriptionId),
    });
    return { ok: true, status: "active" };
  }

  // ── revoke — odcięcie dostępu ──

  // ⛔ Konto z ŻYWĄ subskrypcją Stripe: odmawiamy. Panel odcina dostęp w aplikacji,
  // ale NIE dotyka Stripe — subskrypcja żyłaby dalej i klient płaciłby co miesiąc
  // za produkt, do którego nie ma wstępu. To nie jest teoretyczne: to świadczenie
  // odpłatne bez świadczenia wzajemnego. Anulowanie idzie przez Stripe (wtedy webhook
  // sam ustawi `canceled` i 30-dniową karencję na usunięcie danych) — panel nie ma
  // prawa udawać, że zrobił to samo.
  if (before.stripeSubscriptionId) {
    await audit(adminUid, "access.revoke.odmowa", {
      uid, previousStatus: before.status || null, stripeManaged: true,
    });
    throw new HttpsError(
      "failed-precondition",
      "To konto ma aktywną subskrypcję Stripe. Odebranie dostępu tutaj odcięłoby aplikację, "
      + "ale NIE zatrzymałoby płatności — klient płaciłby dalej za produkt, którego nie widzi. "
      + "Anuluj subskrypcję w panelu Stripe: webhook sam ustawi status i 30-dniową karencję."
    );
  }

  // Świadomie NIE ustawia scheduledDeletionAt: cykliczne czyszczenie kasuje konta
  // z datą w przeszłości, a odebranie dostępu nie jest tym samym, co zgoda na
  // skasowanie danych. ⚠️ Skutek uboczny: takie konto nie wpada w ŻADNĄ ścieżkę
  // retencji (nocny purge wymaga `scheduledDeletionAt` albo statusu `trialing`),
  // więc zostaje w bazie bezterminowo. Dlatego `buildHealth` pokazuje je osobno
  // — decyzja o docelowym okresie należy do właściciela i prawnika.
  await userRef.update({ status: "canceled", canceledAt: Timestamp.now() });
  await mergeClaims(uid, { stripeStatus: "canceled", trialEndsAt: null });
  await audit(adminUid, "access.revoke", {
    uid, previousStatus: before.status || null, note: params.note || null, stripeManaged: false,
  });
  return { ok: true, status: "canceled" };
}

// =============================================================================
// AKCJA: messages / messageUpdate
// =============================================================================
async function actionMessages(adminUid, params) {
  const all = await loadMessages();
  const includeTests = Boolean(params.includeTests);
  const status = params.status || "all";
  const q = String(params.q || "").trim().toLowerCase();

  let rows = includeTests ? all : all.filter((m) => !m.isTest);
  if (status !== "all") rows = rows.filter((m) => m.status === status);
  if (q) rows = rows.filter((m) => (m.email || "").toLowerCase().includes(q) || m.message.toLowerCase().includes(q));

  const limit = Math.min(Number(params.limit) || 50, 200);
  // Audytujemy WYSZUKIWANIE, nie przewijanie listy — i to jest ta sama zasada,
  // co przy kontach. Front woła tę akcję z opóźnieniem 300 ms przy każdej zmianie
  // filtra i każdej pauzie w pisaniu; audytowanie każdego wywołania zasypywało
  // dziennik wpisami bez wartości dowodowej i przykrywało te, które ją mają
  // (odsłonięcie identyfikatora, zmiana dostępu). Zapytanie o konkretny adres
  // jest już celowanym pytaniem o osobę — i ono do dziennika trafia, wraz z frazą.
  if (q) await audit(adminUid, "messages.search", { fraza: q, trafien: rows.length });
  return {
    rows: rows.slice(0, limit),
    total: rows.length,
    counts: {
      new: all.filter((m) => !m.isTest && m.status === "new").length,
      open: all.filter((m) => !m.isTest && m.status === "open").length,
      closed: all.filter((m) => !m.isTest && m.status === "closed").length,
      tests: all.filter((m) => m.isTest).length,
    },
  };
}

async function actionMessageUpdate(adminUid, params) {
  const id = String(params.id || "").trim();
  if (!id) throw new HttpsError("invalid-argument", "Brak identyfikatora zgłoszenia.");
  const patch = { adminUpdatedAt: Timestamp.now(), adminUpdatedBy: adminUid };
  if (params.status) {
    if (!["new", "open", "closed"].includes(params.status)) {
      throw new HttpsError("invalid-argument", "Nieznany status zgłoszenia.");
    }
    patch.adminStatus = params.status;
  }
  if (typeof params.note === "string") patch.adminNote = params.note.slice(0, 5000);

  const ref = db.collection("contact_messages").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Zgłoszenie nie istnieje.");
  await ref.update(patch);
  await audit(adminUid, "message.update", { id, status: patch.adminStatus || null, hasNote: "adminNote" in patch });
  return { ok: true };
}

// =============================================================================
// AKCJA: newsletter — z dowodem zgody
// =============================================================================
async function actionNewsletter(adminUid, params) {
  const snap = await db.collection("newsletter_subscribers").orderBy("subscribedAt", "desc").limit(SCAN_LIMIT).get();
  const rows = snap.docs.map((d) => {
    const v = d.data() || {};
    return {
      id: d.id,
      email: v.email || null,
      subscribedAt: toMillis(v.subscribedAt),
      source: v.source || null,
      // Dowód zgody (RODO art. 7 ust. 1) — bez tego eksport listy jest bezużyteczny prawnie.
      consent: v.consent === true,
      consentVersion: v.consentVersion || null,
    };
  });
  await audit(adminUid, params.export ? "newsletter.export" : "newsletter.read", { count: rows.length });
  return { rows, total: rows.length };
}

// =============================================================================
// AKCJA: health — porządek w danych
// =============================================================================
// Audytowane, mimo że to ekran przeglądowy: `buildHealth` zwraca IMIENNE listy
// (adresy kont zaplanowanych do usunięcia, zalegających, niepotwierdzonych).
// To celowany raport o konkretnych osobach, nie robocza wyszukiwarka — inaczej
// niż lista kont, gdzie wyjątek od audytu jest opisany i uzasadniony.
async function actionHealth(adminUid) {
  const wynik = await buildHealth();
  await audit(adminUid, "health.read", {
    scheduledDeletion: wynik.scheduledDeletion.length,
    pastDue: wynik.pastDue.length,
    unverified: wynik.unverified.length,
    revokedNoRetention: wynik.revokedNoRetention.length,
    orphanGuides: wynik.orphanGuides.length,
  });
  return wynik;
}

// =============================================================================
// AKCJA: audit — dziennik działań administratora
// =============================================================================
async function actionAudit(params) {
  const limit = Math.min(Number(params.limit) || 100, 500);
  const snap = await db.collection("admin_audit").orderBy("at", "desc").limit(limit).get();
  return {
    rows: snap.docs.map((d) => {
      const v = d.data() || {};
      return { id: d.id, at: toMillis(v.at), adminUid: v.adminUid || null, action: v.action || null, details: v.details || {} };
    }),
  };
}

// =============================================================================
// WEJŚCIE
// =============================================================================
exports.adminApi = onCall(
  { secrets: [stripeSecretKey], enforceAppCheck: true, maxInstances: 3 },
  async (request) => {
    const adminUid = requireAdmin(request);
    const params = request.data || {};
    const action = params.action;

    switch (action) {
      case "overview": {
        const fresh = Boolean(params.fresh);
        if (!fresh && overviewCache.data && Date.now() - overviewCache.at < OVERVIEW_TTL_MS) {
          return { ...overviewCache.data, cached: true };
        }
        const data = await buildOverview({ mrr: stripeMrr });
        overviewCache = { at: Date.now(), data };
        return { ...data, cached: false };
      }
      case "users": {
        // Wpis dławiony: ślad zostaje, dziennik się nie zapycha (patrz auditThrottled).
        await auditThrottled(adminUid, "users.list");
        return actionUsers(params);
      }
      case "user": return actionUser(adminUid, params);
      case "grantAccess": {
        const res = await actionGrantAccess(adminUid, params);
        // Obie warstwy: payload pulpitu i wspólne źródło, z którego czyta też lista kont.
        // Bez tego drugiego lista pokazywałaby przez minutę status sprzed zmiany.
        overviewCache = { at: 0, data: null };
        invalidateSources();
        return res;
      }
      case "messages": return actionMessages(adminUid, params);
      case "messageUpdate": {
        const res = await actionMessageUpdate(adminUid, params);
        overviewCache = { at: 0, data: null };
        return res;
      }
      case "newsletter": return actionNewsletter(adminUid, params);
      case "health": return actionHealth(adminUid);
      case "audit": return actionAudit(params);
      default:
        throw new HttpsError("invalid-argument", `Nieznana akcja: ${action}`);
    }
  }
);

// =============================================================================
// RETENCJA DZIENNIKA DOSTĘPU
// =============================================================================
// Dziennik zapisuje, kto sięgnął po dane których kont — więc sam jest zbiorem danych
// osobowych i musi mieć okres przechowywania. Bez tej funkcji `admin_audit` rósłby
// bez końca: mechanizm bez deklaracji i bez granicy. To lustro błędu, który zespół
// naprawiał przy newsletterze (deklaracja bez mechanizmu) — tylko odwrócone.
//
// Kasuje wyłącznie wpisy starsze niż AUDIT_RETENTION_MONTHS. Nie dotyka niczego innego.
exports.cleanupAdminAudit = onSchedule(
  { schedule: "every day 03:15", timeZone: "Europe/Warsaw", maxInstances: 1 },
  async (_event) => {
    const granica = new Date();
    granica.setMonth(granica.getMonth() - AUDIT_RETENTION_MONTHS);
    const cutoff = Timestamp.fromDate(granica);

    let usuniete = 0;
    // Partiami po 300 — cała kolekcja naraz mogłaby przekroczyć limit zapisu w batchu.
    while (true) {
      const snap = await db.collection("admin_audit")
        .where("at", "<=", cutoff)
        .limit(300)
        .get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      usuniete += snap.size;
      if (snap.size < 300) break;
    }

    console.log(
      `🧹 admin_audit: usunięto ${usuniete} wpisów starszych niż ${AUDIT_RETENTION_MONTHS} mies. `
      + `(granica ${granica.toISOString()})`
    );
  }
);

// =============================================================================
// RETENCJA ZGŁOSZEŃ Z FORMULARZA KONTAKTOWEGO
// =============================================================================
// Polityka prywatności §2 deklaruje: „12 miesięcy od zakończenia korespondencji"
// (decyzja właściciela B-5, 2026-08-26). Ta funkcja jest mechanizmem tej deklaracji —
// bez niej Polityka obiecywałaby kasowanie, którego nie ma (wzorzec „deklaracja bez
// mechanizmu", naprawiany już przy newsletterze i `admin_audit`; Roadmapa F7,
// warunek publikacji Polityki).
//
// REGUŁA — operacjonalizacja „zakończenia korespondencji" w `messageLastActivity`
// (admin-data.js, tam pełny opis): koniec korespondencji = późniejsza z dat
// `createdAt` i `adminUpdatedAt`. Czyli: zamknięte → 12 mies. od zamknięcia;
// nigdy nieobsłużone → 12 mies. od utworzenia; otwarte z niedawną czynnością
// administratora → zostają, aż minie 12 mies. od tej czynności. Zgłoszenia
// testowe właściciela (source: 'kontakt-test') — ta sama reguła, bez wyjątków.
//
// Zapytanie filtruje po `createdAt` (warunek konieczny: skoro koniec korespondencji
// to max(createdAt, adminUpdatedAt), każdy dokument do skasowania ma createdAt za
// granicą), a warunek dokładny dokłada kod — Firestore nie porówna max() dwóch pól
// w zapytaniu. Paginacja po `startAfter`, nie „kasuj aż pusto" jak w admin_audit:
// tu strona może w całości składać się z dokumentów zatrzymanych (stare createdAt,
// świeże adminUpdatedAt) i pętla bez kursora nigdy by się nie przesunęła.
exports.cleanupContactMessages = onSchedule(
  { schedule: "every day 03:45", timeZone: "Europe/Warsaw", maxInstances: 1 },
  async (_event) => {
    const granica = new Date();
    granica.setMonth(granica.getMonth() - MESSAGE_RETENTION_MONTHS);
    const cutoff = Timestamp.fromDate(granica);

    let usuniete = 0;
    let zatrzymane = 0;
    let ostatni = null;
    while (true) {
      let zapytanie = db.collection("contact_messages")
        .where("createdAt", "<=", cutoff)
        .orderBy("createdAt")
        .limit(300);
      if (ostatni) zapytanie = zapytanie.startAfter(ostatni);
      const snap = await zapytanie.get();
      if (snap.empty) break;

      const doSkasowania = snap.docs.filter((d) => {
        const m = d.data() || {};
        const koniec = messageLastActivity(toMillis(m.createdAt), toMillis(m.adminUpdatedAt));
        return koniec !== null && koniec <= granica.getTime();
      });
      if (doSkasowania.length) {
        const batch = db.batch();
        doSkasowania.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        usuniete += doSkasowania.length;
      }
      zatrzymane += snap.size - doSkasowania.length;
      ostatni = snap.docs[snap.docs.length - 1];
      if (snap.size < 300) break;
    }

    // Ślad rozliczalności (art. 5 ust. 2): sam fakt i liczba, zero danych osobowych.
    // Wpis tylko gdy coś skasowano — puste przebiegi zostają w logach konsoli.
    if (usuniete > 0) {
      await audit("system", "retention.cleanup", { collection: "contact_messages", deleted: usuniete });
    }
    console.log(
      `🧹 contact_messages: usunięto ${usuniete} zgłoszeń zakończonych przed `
      + `${granica.toISOString()} (${MESSAGE_RETENTION_MONTHS} mies.); `
      + `zatrzymane mimo starego createdAt: ${zatrzymane}`
    );
  }
);
