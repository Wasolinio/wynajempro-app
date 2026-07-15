/*
  Audyt N5 (🔴2/🟡5) — inwentaryzacja i migracja legacy sekretów przewodników
  oraz publicznego kontaktu gospodarza.

  Domyślnie READ-ONLY (tylko raportuje). Z flagą --fix wykonuje migrację:
    guides: sekrety top-level (wifiNetwork/wifiPassword/doorPin) → secrets/data
            (bez nadpisywania już istniejących wartości) + usunięcie pól
            z publicznie czytelnego dokumentu
    users:  settings/publicContact (entityName/phone/email) z hostProfile,
            jeśli jeszcze nie istnieje

  Uruchomienie:
    cd functions && GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node audit-guides-n5.cjs
    (podgląd), potem to samo z flagą --fix (migracja).
*/
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'moje-domki-6c77d' });
const db = admin.firestore();

const FIX = process.argv.includes('--fix');
const SECRET_KEYS = ['wifiNetwork', 'wifiPassword', 'doorPin'];
const filled = (v) => typeof v === 'string' && v.trim() !== '';

(async () => {
  let findings = 0;
  console.log(`Tryb: ${FIX ? 'MIGRACJA (--fix)' : 'tylko odczyt'}\n\n— guides: legacy sekrety i format id —`);

  for (const g of (await db.collection('guides').get()).docs) {
    const d = g.data();
    const legacy = SECRET_KEYS.filter((k) => k in d);
    const legacyFilled = legacy.filter((k) => filled(d[k]));
    // nowe id: guide_/review_ + UUID; numeryczne = stare Date.now() (enumerowalne)
    const idStyle = /^(guide|review)_[0-9a-f-]{36}$/i.test(g.id)
      ? 'uuid' : (/^\d+$/.test(g.id) ? 'ENUMEROWALNY (Date.now)' : 'inny');
    const secretsSnap = await g.ref.collection('secrets').doc('data').get();

    if (legacy.length > 0 || idStyle !== 'uuid') {
      findings++;
      console.log(`• ${g.id} [${d.type === 'review' ? 'strona opinii' : 'przewodnik'}] id=${idStyle}`
        + (legacy.length ? ` | legacy pola: ${legacy.join(',')} (z wartością: ${legacyFilled.join(',') || 'żadne'})` : '')
        + ` | secrets/data: ${secretsSnap.exists ? 'jest' : 'brak'}`);
    }

    if (FIX && legacy.length > 0) {
      if (legacyFilled.length > 0) {
        const existing = secretsSnap.exists ? secretsSnap.data() : {};
        const merged = { ...existing };
        for (const k of legacyFilled) {
          if (!filled(merged[k])) merged[k] = d[k]; // istniejące wartości w secrets/data mają pierwszeństwo
        }
        await g.ref.collection('secrets').doc('data').set(merged, { merge: true });
      }
      await g.ref.update(Object.fromEntries(SECRET_KEYS.map((k) => [k, admin.firestore.FieldValue.delete()])));
      console.log(`  ✔ sekrety zmigrowane do secrets/data i usunięte z dokumentu`);
    }
  }

  console.log('\n— users: publiczny kontakt (publicContact) —');
  for (const u of (await db.collection('users').get()).docs) {
    const hp = await u.ref.collection('settings').doc('hostProfile').get();
    const pc = await u.ref.collection('settings').doc('publicContact').get();
    if (hp.exists && !pc.exists) {
      findings++;
      const h = hp.data();
      console.log(`• users/${u.id}: brak publicContact (hostProfile zawiera taxIdentifier: ${filled(h.taxIdentifier) ? 'TAK' : 'nie'})`);
      if (FIX) {
        await u.ref.collection('settings').doc('publicContact').set({
          entityName: h.entityName || '', phone: h.phone || '', email: h.email || '',
        });
        console.log(`  ✔ utworzono publicContact`);
      }
    }
  }

  console.log(`\n${findings === 0
    ? '✓ Czysto — brak legacy sekretów top-level i brak braków publicContact.'
    : `⚠ Pozycji: ${findings}${FIX
      ? ' — obsłużone powyżej (id ENUMEROWALNYCH nie da się zmienić skryptem: link/QR jest już u gości; rozważ odtworzenie tych przewodników w aplikacji)'
      : ' — uruchom ponownie z --fix, aby zmigrować sekrety i kontakt'}`}`);
  process.exit(findings === 0 ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
