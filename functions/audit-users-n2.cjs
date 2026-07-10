/*
  Audyt danych PRZED deployem reguł N2 (firestore.rules + storage.rules).
  Szuka kont, które po deployu straciłyby dostęp (findingi przeglądu N2, 2026-07-07):
   1. users ze statusem 'trialing' i trialEndsAt niebędącym Timestampem (fail-closed → LOCKOUT),
   2. dokumenty z samym accountStatus, bez kanonicznego 'status',
   3. konta Auth bez dokumentu users (self-heal frontu naprawi je dopiero po wydaniu poprawki).

  Uruchomienie (wymaga uprawnień administratora projektu):
    cd functions && node audit-users-n2.cjs
  Poświadczenia — jedno z dwóch:
    - GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz-serwisowy.json
      (Konsola Firebase → Ustawienia projektu → Konta usługi → Wygeneruj nowy klucz prywatny)
    - albo: gcloud auth application-default login
*/
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'moje-domki-6c77d',
});
const db = admin.firestore();

(async () => {
  let issues = 0;

  const snap = await db.collection('users').get();
  console.log(`users: ${snap.size} dokumentów\n`);
  snap.forEach((d) => {
    const x = d.data();
    // Wierne odwzorowanie reguły hasActiveSubscription/checkFallbackSubscription:
    // status 'active' → wstęp; 'trialing' → tylko z żywym Timestampem.
    const status = x.status ?? x.accountStatus ?? 'none';
    const isTs = x.trialEndsAt && typeof x.trialEndsAt.toDate === 'function';
    const trialAlive = isTs && x.trialEndsAt.toDate().getTime() > Date.now();
    const wouldHaveAccess = status === 'active' || (status === 'trialing' && trialAlive);

    if (!wouldHaveAccess) {
      issues++;
      let why;
      if (status === 'none') why = "brak pola 'status' (ani 'accountStatus')";
      else if (status === 'trialing' && !isTs) why = `trialing, ale trialEndsAt to ${typeof x.trialEndsAt} (nie Timestamp): ${JSON.stringify(x.trialEndsAt)}`;
      else if (status === 'trialing') why = `trial wygasł: ${x.trialEndsAt.toDate().toISOString()}`;
      else why = `status='${status}' (nie active/trialing)`;
      console.log(`STRACI DOSTĘP: ${d.id} (${x.email || '?'}) — ${why}`);
    }
    // sygnał higieny: dokument używa tylko historycznego accountStatus
    if (!('status' in x) && 'accountStatus' in x) {
      console.log(`  ↳ higiena: dokument ma tylko 'accountStatus', brak kanonicznego 'status' — ${d.id}`);
    }
  });

  // Konta Auth bez dokumentu users — pomijamy anonimowych gości (podpisy przewodników)
  let nextPageToken;
  do {
    const res = await admin.auth().listUsers(1000, nextPageToken);
    for (const u of res.users) {
      if (u.providerData.length === 0) continue; // anonimowi
      const docSnap = await db.doc(`users/${u.uid}`).get();
      if (!docSnap.exists) {
        issues++;
        console.log(`BRAK DOKUMENTU users: ${u.uid} (${u.email || 'bez maila'})`);
      }
    }
    nextPageToken = res.pageToken;
  } while (nextPageToken);

  console.log(issues === 0
    ? '\n✓ Czysto — deploy reguł bezpieczny dla istniejących danych.'
    : `\n⚠ ${issues} problem(ów) — rozstrzygnij przed deployem (napraw pole/typ w konsoli albo świadomie zaakceptuj blokadę).`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
