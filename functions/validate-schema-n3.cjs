/*
  Lustrzany test walidacji schematu N3 — read-only.
  Implementuje w JS DOKŁADNIE te same predykaty co isValidRental/isValidSettings/
  isValidGuide w firestore.rules i przepuszcza przez nie WSZYSTKIE istniejące
  dokumenty produkcji (rentals, settings, guides). Zastępuje emulator (brak Javy):
  dowodzi, że po deployu walidacji „istniejące dane produkcyjne przechodzą"
  (kryterium N3 z roadmapy) — bo update dokumentu waliduje dokument PO merge'u.

  Uruchomienie: cd functions && GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node validate-schema-n3.cjs
*/
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'moje-domki-6c77d' });
const db = admin.firestore();

// ── Lustro helperów z firestore.rules ──
const isStr = (v) => typeof v === 'string';
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isBool = (v) => typeof v === 'boolean';
const isMap = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && typeof v.toDate !== 'function';
const isList = (v) => Array.isArray(v);
const optStr = (d, k, max) => !(k in d) || (isStr(d[k]) && d[k].length <= max);
const optNum = (d, k) => !(k in d) || isNum(d[k]);
const optBool = (d, k) => !(k in d) || isBool(d[k]);
const hasOnly = (d, allowed) => Object.keys(d).every((k) => allowed.includes(k));

// ── Lustro isValidRental ──
const RENTAL_KEYS = ['type', 'source', 'property', 'category', 'guest', 'email', 'phone',
  'guestNote', 'text', 'date', 'endDate', 'income', 'advancePayment', 'isAdvancePaid',
  'commission', 'utilities', 'tax', 'vat', 'isPaid', 'isCompleted', 'completedTasks',
  'syncId', 'directionsSent', 'keycodeSent', 'id'];
function whyInvalidRental(d) {
  if (!hasOnly(d, RENTAL_KEYS)) return `nieznane pola: ${Object.keys(d).filter((k) => !RENTAL_KEYS.includes(k)).join(',')}`;
  if (!['booking', 'utility', 'reminder'].includes(d.type ?? '')) return `type='${d.type}'`;
  if (!(isStr(d.date) && d.date.length <= 30)) return `date: ${typeof d.date}`;
  if (!optStr(d, 'endDate', 30)) return 'endDate';
  for (const [k, m] of [['source', 300], ['property', 300], ['category', 300], ['guest', 300], ['email', 320], ['phone', 50], ['guestNote', 5000], ['text', 5000], ['syncId', 300], ['id', 100]]) {
    if (!optStr(d, k, m)) return `${k}: ${typeof d[k]}${isStr(d[k]) ? ` (długość ${d[k].length})` : ''}`;
  }
  for (const k of ['income', 'advancePayment', 'commission', 'utilities', 'tax', 'vat']) {
    if (!optNum(d, k)) return `${k}: ${typeof d[k]} (${JSON.stringify(d[k])})`;
  }
  for (const k of ['isAdvancePaid', 'isPaid', 'isCompleted', 'directionsSent', 'keycodeSent']) {
    if (!optBool(d, k)) return `${k}: ${typeof d[k]}`;
  }
  if ('completedTasks' in d && !isMap(d.completedTasks)) return 'completedTasks nie jest mapą';
  return null;
}

// ── Lustro isValidSettings ──
const KNOWN_SETTINGS = ['reminders', 'properties', 'sources', 'categories', 'syncLinks', 'tax', 'hostProfile'];
function whyInvalidSettings(docId, d) {
  if (!KNOWN_SETTINGS.includes(docId)) return `nieznany docId '${docId}'`;
  if (['reminders', 'properties', 'sources', 'categories'].includes(docId) && 'items' in d && !isList(d.items)) return 'items nie jest listą';
  if (docId === 'syncLinks' && 'links' in d && !isMap(d.links)) return 'links nie jest mapą';
  if (docId === 'tax' && 'rate' in d && !isNum(d.rate)) return 'rate nie jest liczbą';
  if (docId === 'hostProfile') {
    const HP = ['entityName', 'identifierType', 'taxIdentifier', 'address', 'phone', 'email'];
    if (!hasOnly(d, HP)) return `hostProfile nieznane pola: ${Object.keys(d).filter((k) => !HP.includes(k)).join(',')}`;
    for (const [k, m] of [['entityName', 300], ['identifierType', 20], ['taxIdentifier', 30], ['address', 500], ['phone', 50], ['email', 320]]) {
      if (!optStr(d, k, m)) return `hostProfile.${k}: ${typeof d[k]}`;
    }
  }
  return null;
}

// ── Lustro isValidGuide (dwa kształty) ──
const REVIEW_KEYS = ['type', 'ownerId', 'property', 'title', 'message', 'links', 'createdAt', 'updatedAt'];
const GUIDE_KEYS = ['id', 'name', 'propertyId', 'coverImage', 'checkInInfo', 'houseRules',
  'houseRulesFile', 'ppoRules', 'mapLink', 'attractions', 'hasSensitiveData',
  'ownerId', 'createdAt', 'updatedAt', 'wifiNetwork', 'wifiPassword', 'doorPin'];
function whyInvalidGuide(d) {
  if ((d.type ?? '') === 'review') {
    if (!hasOnly(d, REVIEW_KEYS)) return `review nieznane pola: ${Object.keys(d).filter((k) => !REVIEW_KEYS.includes(k)).join(',')}`;
    if (!optStr(d, 'property', 300)) return 'review.property';
    if (!optStr(d, 'title', 300)) return 'review.title';
    if (!optStr(d, 'message', 5000)) return 'review.message';
    if (!(isList(d.links) && d.links.length <= 20)) return 'review.links';
    return null;
  }
  if (!hasOnly(d, GUIDE_KEYS)) return `guide nieznane pola: ${Object.keys(d).filter((k) => !GUIDE_KEYS.includes(k)).join(',')}`;
  if (!(isStr(d.name) && d.name.length > 0 && d.name.length <= 300)) return `guide.name: ${typeof d.name}`;
  for (const [k, m] of [['id', 100], ['propertyId', 300], ['coverImage', 2048], ['mapLink', 2048], ['checkInInfo', 15000], ['houseRules', 15000], ['ppoRules', 15000], ['wifiNetwork', 200], ['wifiPassword', 200], ['doorPin', 50]]) {
    if (!optStr(d, k, m)) return `guide.${k}: ${typeof d[k]}${isStr(d[k]) ? ` (długość ${d[k].length})` : ''}`;
  }
  if ('houseRulesFile' in d && d.houseRulesFile !== null && !isMap(d.houseRulesFile)) return 'guide.houseRulesFile';
  if ('attractions' in d && !(isList(d.attractions) && d.attractions.length <= 100)) return 'guide.attractions';
  if (!optBool(d, 'hasSensitiveData')) return 'guide.hasSensitiveData';
  return null;
}

(async () => {
  let checked = 0; let failed = 0;
  const report = (path, why) => { failed++; console.log(`✗ ${path} — ${why}`); };

  for (const u of (await db.collection('users').get()).docs) {
    for (const r of (await u.ref.collection('rentals').get()).docs) {
      checked++; const why = whyInvalidRental(r.data()); if (why) report(`users/${u.id}/rentals/${r.id}`, why);
    }
    for (const s of (await u.ref.collection('settings').get()).docs) {
      checked++; const why = whyInvalidSettings(s.id, s.data()); if (why) report(`users/${u.id}/settings/${s.id}`, why);
    }
  }
  for (const g of (await db.collection('guides').get()).docs) {
    checked++; const why = whyInvalidGuide(g.data()); if (why) report(`guides/${g.id}`, why);
  }

  console.log(`\nSprawdzono: ${checked} dokumentów. ${failed === 0
    ? '✓ WSZYSTKIE przechodzą walidację N3 — deploy bezpieczny dla istniejących danych.'
    : `⚠ ${failed} NIE przechodzi — dopasuj reguły albo napraw dane przed deployem.`}`);
  process.exit(failed === 0 ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
