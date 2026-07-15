// Wspólne narzędzia dla łączy podawanych przez gospodarza (przewodnik, strona opinii).

// Gospodarze wklejają adresy z paska bez protokołu — uzupełniamy https://
export function normalizeUrl(url) {
  const u = (url || '').trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

// Twarda bramka przy renderze na stronach publicznych: do href trafia wyłącznie
// http(s). Inne schematy (javascript:, data:) = stored XSS na gościu — audyt N5 🟡4.
export function safeHref(url) {
  const u = (url || '').trim();
  return /^https?:\/\//i.test(u) ? u : null;
}
