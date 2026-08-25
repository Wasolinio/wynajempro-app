/**
 * PANEL ADMINISTRATORA — WARSTWA ODCZYTU.
 *
 * PO CO OSOBNY PLIK: tu mieszkają wszystkie zapytania do bazy i całe liczenie statystyk,
 * bez `HttpsError`, bez bramki uprawnień i bez `onCall`. Dzięki temu **dokładnie ten sam
 * kod** da się uruchomić poza Cloud Functions — skryptem `audit-admin-api.cjs` na danych
 * produkcyjnych, z kluczem serwisowym i wyłącznie do odczytu.
 *
 * To nie jest kosmetyka. W tym środowisku nie ma Javy, więc nie ma emulatora Firestore,
 * a więc nie da się przetestować zapytań przed wdrożeniem. Zastępnikiem jest lustrzany
 * tester na produkcji (procedura z `.claude/skills/reguly`) — a lustrzany tester ma
 * sens tylko wtedy, gdy **nie jest kopią** logiki, lecz jej wywołaniem. Kopia rozjeżdża
 * się z oryginałem przy pierwszej poprawce.
 *
 * Plik NIE eksportuje żadnej Cloud Function — nie może, bo wykrywanie funkcji przy
 * wdrożeniu traktuje eksportowane obiekty jak grupy funkcji.
 *
 * ⚠️ Wszystko tutaj jest TYLKO DO ODCZYTU. Zapisy (zmiana statusu, notatka przy
 * zgłoszeniu, wpis do dziennika) siedzą w `admin.js` — żeby przypadkowe uruchomienie
 * testera nie mogło niczego zmienić na produkcji.
 */
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const app = getApps().length ? getApps()[0] : initializeApp();
const db = getFirestore(app);

const TZ = "Europe/Warsaw";

// Propozycja kierunkowa okresu przechowywania zgłoszeń (zadanie #31, decyzja
// jeszcze nie zapadła). Panel tylko RAPORTUJE przekroczenie, nic nie kasuje.
const MESSAGE_RETENTION_MONTHS = 12;

// Limit bezpieczeństwa dla skanów całych kolekcji. Przy skali przedlaunchowej
// nieosiągalny; gdyby padł, odpowiedź niesie flagę `truncated` i panel to pokazuje.
const SCAN_LIMIT = 20000;

// =============================================================================
// POMOCNICZE — czas i formaty
// =============================================================================
const dayKey = (date) => new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(date);
const toMillis = (value) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

/** Maskuje identyfikator podatkowy: zostaje typ i trzy ostatnie znaki. */
const maskIdentifier = (value) => {
  if (!value) return null;
  const s = String(value);
  if (s.length <= 3) return "•".repeat(s.length);
  return "•".repeat(s.length - 3) + s.slice(-3);
};

/** Adres iCal bywa sekretem (zawiera token) — pokazujemy host i długość. */
const maskUrl = (value) => {
  try {
    const u = new URL(String(value));
    return `${u.host}/…(${String(value).length} zn.)`;
  } catch {
    return `…(${String(value || "").length} zn.)`;
  }
};

// =============================================================================
// ŹRÓDŁA DANYCH
// =============================================================================
async function listAllAuthUsers(max = 5000) {
  const out = [];
  let pageToken;
  do {
    const res = await getAuth().listUsers(1000, pageToken);
    out.push(...res.users);
    pageToken = res.pageToken;
  } while (pageToken && out.length < max);
  return out;
}

/**
 * Liczba rezerwacji per konto — JEDNYM zapytaniem collectionGroup z `select()`
 * (dokumenty bez pól, więc lecą same referencje). Alternatywa „licznik per konto"
 * to N zapytań; przy tej skali jedno zapytanie jest tańsze i prostsze.
 * ⚠️ To jedyne miejsce, które dotyka kolekcji `rentals` — i NIE czyta z niej
 * żadnego pola. Treść rezerwacji (dane Gości) nie opuszcza bazy.
 */
async function rentalCountsByUid() {
  const snap = await db.collectionGroup("rentals").select().limit(SCAN_LIMIT).get();
  const map = new Map();
  snap.docs.forEach((d) => {
    const uid = d.ref.parent.parent && d.ref.parent.parent.id;
    if (uid) map.set(uid, (map.get(uid) || 0) + 1);
  });
  return { map, total: snap.size, truncated: snap.size >= SCAN_LIMIT };
}

/** UID-y kont, które mają uzupełniony profil gospodarza (settings/hostProfile). */
async function profiledUids() {
  const snap = await db.collectionGroup("settings").select().limit(SCAN_LIMIT).get();
  const set = new Set();
  snap.docs.forEach((d) => {
    if (d.id !== "hostProfile") return;
    const uid = d.ref.parent.parent && d.ref.parent.parent.id;
    if (uid) set.add(uid);
  });
  // Obcięcie skanu musi wracać razem z wynikiem. Bez tego stopień „profil" w lejku
  // zaniżyłby się bez żadnego śladu — a zaniżona liczba, o której nikt nie wie,
  // jest gorsza od braku liczby.
  return { set, truncated: snap.size >= SCAN_LIMIT };
}

/**
 * Sesja gościa, nie konto.
 *
 * `/guide/:id` i `/opinie/:id` logują odwiedzającego przez `signInAnonymously`, bo reguły
 * wymagają `request.auth` do odczytu sekretów i do zapisania podpisu pod regulaminem.
 * Każde takie wejście zakłada użytkownika w Firebase Auth — bez adresu i bez dostawcy.
 *
 * ⚠️ To NIE są konta i nie wolno ich liczyć razem z gospodarzami. Wykryte przy pierwszym
 * uruchomieniu lustrzanego testera na produkcji 2026-08-20: ze 131 loginów Auth **129 było
 * sesjami gości**, a panel pokazywał „131 kont", lejek liczył od 131 i zgłaszał 115
 * nieistniejących rozjazdów Auth ↔ baza. Żadna z tych liczb nie była prawdziwa.
 */
const isGuestSession = (u) => (!u.providerData || u.providerData.length === 0) && !u.email;

/**
 * Scalony obraz kont: dokument Firestore + konto Auth.
 * Rozjazdy między nimi (sierota po jednej albo drugiej stronie) są SYGNAŁEM,
 * nie szumem — dlatego wracają jako osobne flagi, a nie znikają w scaleniu.
 *
 * Zwraca też to, co świadomie z kont WYŁĄCZONO: liczbę sesji gości oraz dokumenty
 * `users/*` należące do takich sesji (nie powinny istnieć — patrz `staleGuestDocs`).
 */
async function loadAccounts() {
  const [usersSnap, authUsers] = await Promise.all([
    db.collection("users").limit(SCAN_LIMIT).get(),
    listAllAuthUsers(),
  ]);

  const authByUid = new Map(authUsers.map((u) => [u.uid, u]));
  const guestUids = new Set(authUsers.filter(isGuestSession).map((u) => u.uid));
  const guestSessions = guestUids.size;
  const staleGuestDocs = [];
  const seen = new Set();
  const accounts = [];

  usersSnap.docs.forEach((docSnap) => {
    const d = docSnap.data() || {};
    const authUser = authByUid.get(docSnap.id);
    seen.add(docSnap.id);

    // Dokument `users/*` na identyfikatorze sesji gościa. Nie jest kontem i nigdy nim
    // nie będzie — trafia na osobną listę, bo niesie adres e-mail (dane osobowe) bez
    // żadnego właściciela ani ścieżki retencji. Na produkcji jest ich 14, wszystkie
    // z polami `stripeId`/`stripeLink` z nieużywanego już nazewnictwa (dziś:
    // `stripeCustomerId`/`stripeSubscriptionId`) — pozostałość po starszej wersji.
    if (guestUids.has(docSnap.id)) {
      staleGuestDocs.push({
        uid: docSnap.id,
        pola: Object.keys(d).sort(),
        maEmail: Boolean(d.email),
        createdAt: toMillis(d.createdAt),
      });
      return;
    }

    accounts.push({
      uid: docSnap.id,
      email: d.email || (authUser && authUser.email) || null,
      name: d.name || (authUser && authUser.displayName) || null,
      // 'status' jest kanoniczne; 'accountStatus' honorowane dla danych historycznych
      status: d.status || d.accountStatus || "none",
      createdAt: toMillis(d.createdAt) || (authUser ? Date.parse(authUser.metadata.creationTime) : null),
      trialEndsAt: toMillis(d.trialEndsAt),
      paidAt: toMillis(d.paidAt),
      lastPaymentAt: toMillis(d.lastPaymentAt),
      canceledAt: toMillis(d.canceledAt),
      scheduledDeletionAt: toMillis(d.scheduledDeletionAt),
      dataCleanedAt: toMillis(d.dataCleanedAt),
      hasStripeCustomer: Boolean(d.stripeCustomerId),
      hasStripeSubscription: Boolean(d.stripeSubscriptionId),
      emailVerified: authUser ? authUser.emailVerified : null,
      disabled: authUser ? authUser.disabled : null,
      lastSignInAt: authUser && authUser.metadata.lastSignInTime
        ? Date.parse(authUser.metadata.lastSignInTime) : null,
      provider: authUser && authUser.providerData[0] ? authUser.providerData[0].providerId : null,
      isAdmin: Boolean(authUser && authUser.customClaims && authUser.customClaims.admin),
      missingAuth: !authUser,
      missingDoc: false,
    });
  });

  // Konta Auth bez dokumentu: rejestracja przerwana w połowie albo skutek purge'u,
  // w którym Auth przetrwał. Takie konto nie wejdzie do panelu i nie zapłaci.
  // Sesje gości pomijamy — dla nich brak dokumentu jest stanem NORMALNYM, a nie usterką.
  authUsers.forEach((u) => {
    if (seen.has(u.uid) || isGuestSession(u)) return;
    accounts.push({
      uid: u.uid,
      email: u.email || null,
      name: u.displayName || null,
      status: "brak dokumentu",
      createdAt: Date.parse(u.metadata.creationTime),
      trialEndsAt: null, paidAt: null, lastPaymentAt: null, canceledAt: null,
      scheduledDeletionAt: null, dataCleanedAt: null,
      hasStripeCustomer: false, hasStripeSubscription: false,
      emailVerified: u.emailVerified,
      disabled: u.disabled,
      lastSignInAt: u.metadata.lastSignInTime ? Date.parse(u.metadata.lastSignInTime) : null,
      provider: u.providerData[0] ? u.providerData[0].providerId : null,
      isAdmin: Boolean(u.customClaims && u.customClaims.admin),
      missingAuth: false,
      missingDoc: true,
    });
  });

  accounts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return { accounts, guestSessions, staleGuestDocs };
}

async function loadMessages() {
  const snap = await db.collection("contact_messages").orderBy("createdAt", "desc").limit(SCAN_LIMIT).get();
  return snap.docs.map((d) => {
    const m = d.data() || {};
    return {
      id: d.id,
      email: m.email || null,
      message: m.message || "",
      createdAt: toMillis(m.createdAt),
      source: m.source || null,
      isTest: m.source === "kontakt-test",
      status: m.adminStatus || "new",
      note: m.adminNote || "",
      updatedAt: toMillis(m.adminUpdatedAt),
      updatedBy: m.adminUpdatedBy || null,
    };
  });
}

// =============================================================================
// WSPÓLNA PAMIĘĆ PODRĘCZNA ŹRÓDEŁ
// =============================================================================
// Powód: `users` woła te same trzy zapytania co `overview`, a front woła `users`
// z opóźnieniem 300 ms przy KAŻDEJ zmianie pola wyszukiwania. Bez cache wpisanie
// adresu z trzema pauzami to trzy pełne skany `users` + `listUsers` po całym Auth
// + do SCAN_LIMIT odczytów `collectionGroup('rentals')`. Dziś, przy kilkunastu
// kontach, to grosze. Po becie — nie.
// Cache żyje w instancji funkcji, więc różne instancje mogą mieć różny wiek danych;
// przy jednym administratorze to nie ma znaczenia, a `fresh` i tak go omija.
let zrodlaCache = { at: 0, data: null };
const ZRODLA_TTL_MS = 60_000;

async function loadSources({ fresh = false } = {}) {
  if (!fresh && zrodlaCache.data && Date.now() - zrodlaCache.at < ZRODLA_TTL_MS) {
    return zrodlaCache.data;
  }
  const [konta, rentals, profiled] = await Promise.all([
    loadAccounts(), rentalCountsByUid(), profiledUids(),
  ]);
  const data = { ...konta, rentals, profiled };
  zrodlaCache = { at: Date.now(), data };
  return data;
}

/** Wołane po każdym zapisie zmieniającym stan konta — inaczej lista pokazywałaby
 *  przez minutę status sprzed zmiany, którą właściciel przed chwilą kliknął. */
function invalidateSources() {
  zrodlaCache = { at: 0, data: null };
}

// =============================================================================
// PRZEGLĄD — liczby na pulpit
// =============================================================================
// Pamięć podręczna w instancji funkcji: pulpit odświeżany co kilkanaście sekund
// nie ma powodu skanować bazy za każdym razem. `fresh: true` omija cache.
/**
 * Liczby na pulpit. `mrr` wstrzykiwane z zewnątrz (funkcja przyjmująca liczbę
 * aktywnych kont), bo wymaga sekretu Stripe, którego lustrzany tester nie ma
 * i mieć nie musi — wtedy dostaje `async () => null` i reszta liczb działa.
 */
async function buildOverview({ mrr } = {}) {
  const [zrodla, messages, newsletterSnap, guidesCount, signaturesCount] =
    await Promise.all([
      loadSources(),
      loadMessages(),
      db.collection("newsletter_subscribers").select("subscribedAt").limit(SCAN_LIMIT).get(),
      db.collection("guides").count().get(),
      db.collectionGroup("signatures").count().get(),
    ]);
  const { accounts, rentals, profiled, guestSessions, staleGuestDocs } = zrodla;

  const now = Date.now();
  const byStatus = {};
  accounts.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });

  const since = (days) => daysAgo(days).getTime();
  const registeredSince = (days) => accounts.filter((a) => a.createdAt && a.createdAt >= since(days)).length;
  const registeredBetween = (from, to) =>
    accounts.filter((a) => a.createdAt && a.createdAt >= since(from) && a.createdAt < since(to)).length;

  // Wykres 30 dni — dni bez rejestracji muszą być w serii, inaczej wykres kłamie o tempie.
  const chart = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = daysAgo(i);
    chart.push({ date: dayKey(d), count: 0 });
  }
  const chartIndex = new Map(chart.map((p, i) => [p.date, i]));
  accounts.forEach((a) => {
    if (!a.createdAt) return;
    const idx = chartIndex.get(dayKey(new Date(a.createdAt)));
    if (idx !== undefined) chart[idx].count += 1;
  });

  const todayKey = dayKey(new Date());
  const activeCount = byStatus.active || 0;
  // DWIE ROZNE LICZBY, celowo rozdzielone ([[Known-Issues]] #19).
  // `activeCount` to konta Z DOSTEPEM — status 'active' ustawia takze przycisk
  // „Nadaj dostep" w panelu, wiec kazdy tester bety tu wpada. `paidCount` to konta
  // OPLACONE, czyli takie, ktore maja subskrypcje po stronie Stripe. Do 2026-08-25
  // panel pokazywal `activeCount` jako „konta placace" i mnozyl przez nie cene
  // cennikowa — raportujac przychod, ktorego nie bylo (3 konta nadane recznie = 90 zl
  // przy niezaktywowanym Stripe). Rozjazd miedzy tymi liczbami jest teraz informacja:
  // ilu masz testerow, a ilu klientow.
  // Warunek jest PODWOJNY celowo: sama obecnosc `stripeSubscriptionId` nie wystarcza,
  // bo konto po anulowaniu subskrypcji moze to pole zachowac, a placacym juz nie jest.
  const paidCount = accounts.filter((a) => a.status === "active" && a.hasStripeSubscription).length;
  const trialing = accounts.filter((a) => a.status === "trialing");
  const withBookings = accounts.filter((a) => (rentals.map.get(a.uid) || 0) > 0);

  const messageStats = {
    total: messages.filter((m) => !m.isTest).length,
    tests: messages.filter((m) => m.isTest).length,
    new: messages.filter((m) => !m.isTest && m.status === "new").length,
    open: messages.filter((m) => !m.isTest && m.status === "open").length,
    closed: messages.filter((m) => !m.isTest && m.status === "closed").length,
    last7: messages.filter((m) => !m.isTest && m.createdAt && m.createdAt >= since(7)).length,
  };

  const newsletter = newsletterSnap.docs.map((d) => toMillis(d.data().subscribedAt));
  const retentionCutoff = new Date();
  retentionCutoff.setMonth(retentionCutoff.getMonth() - MESSAGE_RETENTION_MONTHS);

  return {
    generatedAt: now,
    truncated: rentals.truncated || profiled.truncated,
    accounts: {
      total: accounts.length,
      byStatus,
      verified: accounts.filter((a) => a.emailVerified === true).length,
      unverified: accounts.filter((a) => a.emailVerified === false).length,
      admins: accounts.filter((a) => a.isAdmin).length,
    },
    registrations: {
      today: accounts.filter((a) => a.createdAt && dayKey(new Date(a.createdAt)) === todayKey).length,
      d7: registeredSince(7),
      d30: registeredSince(30),
      prev7: registeredBetween(14, 7),
      prev30: registeredBetween(60, 30),
      chart,
    },
    // Lejek liczony na tych samych kontach, w kolejności, w jakiej użytkownik
    // faktycznie przez nie przechodzi — każdy stopień jest podzbiorem poprzedniego.
    funnel: {
      registered: accounts.length,
      verified: accounts.filter((a) => a.emailVerified === true).length,
      profiled: accounts.filter((a) => profiled.set.has(a.uid)).length,
      withBookings: withBookings.length,
      // Ostatni stopien lejka MUSI byc o pieniadzach, inaczej lejek konczy sie
      // na czynnosci administracyjnej i sam sobie zaprzecza.
      paying: paidCount,
      withAccess: activeCount,
    },
    trials: {
      active: trialing.filter((a) => a.trialEndsAt && a.trialEndsAt > now).length,
      endingIn3: trialing.filter((a) => a.trialEndsAt && a.trialEndsAt > now && a.trialEndsAt <= now + 3 * 86400000).length,
      endingIn7: trialing.filter((a) => a.trialEndsAt && a.trialEndsAt > now && a.trialEndsAt <= now + 7 * 86400000).length,
      expired: trialing.filter((a) => a.trialEndsAt && a.trialEndsAt <= now).length,
    },
    revenue: mrr ? await mrr(paidCount) : null,
    // Sesje gości NIE są kontami (patrz isGuestSession) — ale są miarą tego,
    // ilu odwiedzających otworzyło przewodniki. Osobna liczba, osobne znaczenie.
    guests: { sessions: guestSessions, staleDocs: staleGuestDocs.length },
    content: {
      rentals: rentals.total,
      accountsWithData: withBookings.length,
      guides: guidesCount.data().count,
      signatures: signaturesCount.data().count,
    },
    messages: messageStats,
    newsletter: {
      total: newsletter.length,
      d30: newsletter.filter((t) => t && t >= since(30)).length,
    },
    risks: {
      pastDue: byStatus.past_due || 0,
      scheduledDeletion: accounts.filter((a) => a.scheduledDeletionAt).length,
      unverifiedOlder7d: accounts.filter((a) => a.emailVerified === false && a.createdAt && a.createdAt < since(7)).length,
      missingDoc: accounts.filter((a) => a.missingDoc).length,
      missingAuth: accounts.filter((a) => a.missingAuth).length,
      staleGuestDocs: staleGuestDocs.length,
      messagesOverRetention: messages.filter((m) => m.createdAt && m.createdAt < retentionCutoff.getTime()).length,
      retentionMonths: MESSAGE_RETENTION_MONTHS,
    },
  };
}

// =============================================================================
// PORZĄDEK — stan danych i zobowiązania RODO
// =============================================================================
async function buildHealth() {
  const [{ accounts, staleGuestDocs }, guidesSnap, messages] = await Promise.all([
    loadAccounts(),
    db.collection("guides").select("ownerId", "name", "type").limit(SCAN_LIMIT).get(),
    loadMessages(),
  ]);
  const now = Date.now();
  const knownUids = new Set(accounts.filter((a) => !a.missingDoc).map((a) => a.uid));

  const retentionCutoff = new Date();
  retentionCutoff.setMonth(retentionCutoff.getMonth() - MESSAGE_RETENTION_MONTHS);

  return {
    generatedAt: now,
    scheduledDeletion: accounts
      .filter((a) => a.scheduledDeletionAt)
      .map((a) => ({ uid: a.uid, email: a.email, status: a.status, at: a.scheduledDeletionAt }))
      .sort((x, y) => x.at - y.at),
    pastDue: accounts.filter((a) => a.status === "past_due")
      .map((a) => ({ uid: a.uid, email: a.email, since: a.lastPaymentAt })),
    expiredTrials: accounts
      .filter((a) => a.status === "trialing" && a.trialEndsAt && a.trialEndsAt <= now)
      .map((a) => ({ uid: a.uid, email: a.email, endedAt: a.trialEndsAt })),
    unverified: accounts
      .filter((a) => a.emailVerified === false)
      .map((a) => ({ uid: a.uid, email: a.email, createdAt: a.createdAt })),
    // Konta anulowane BEZ daty usunięcia — najczęściej odcięte ręcznie z panelu.
    // Nocny purge ich nie ruszy: pierwsza ścieżka wymaga `scheduledDeletionAt`
    // (zapytanie zakresowe pomija dokumenty bez tego pola), druga statusu `trialing`.
    // Zostają więc bezterminowo razem z rezerwacjami, przewodnikami i podpisami gości.
    // Panel ich nie kasuje — pokazuje, żeby decyzja o okresie była świadoma.
    revokedNoRetention: accounts
      .filter((a) => a.status === "canceled" && !a.scheduledDeletionAt)
      .map((a) => ({ uid: a.uid, email: a.email, canceledAt: a.canceledAt })),
    missingDoc: accounts.filter((a) => a.missingDoc).map((a) => ({ uid: a.uid, email: a.email, createdAt: a.createdAt })),
    missingAuth: accounts.filter((a) => a.missingAuth).map((a) => ({ uid: a.uid, email: a.email, status: a.status })),
    // Przewodnik bez żywego właściciela = dane Gości (podpisy, sekrety) bez administratora.
    orphanGuides: guidesSnap.docs
      .filter((g) => !knownUids.has((g.data() || {}).ownerId))
      .map((g) => ({ id: g.id, name: (g.data() || {}).name || null, ownerId: (g.data() || {}).ownerId || null, type: (g.data() || {}).type || "guide" })),
    staleGuestDocs,
    messagesOverRetention: {
      months: MESSAGE_RETENTION_MONTHS,
      count: messages.filter((m) => m.createdAt && m.createdAt < retentionCutoff.getTime()).length,
      oldest: messages.length ? messages[messages.length - 1].createdAt : null,
    },
  };
}

module.exports = {
  db, TZ, MESSAGE_RETENTION_MONTHS, SCAN_LIMIT,
  dayKey, toMillis, daysAgo, maskIdentifier, maskUrl,
  listAllAuthUsers, rentalCountsByUid, profiledUids, loadAccounts, loadMessages, isGuestSession,
  loadSources, invalidateSources,
  buildOverview, buildHealth,
};
