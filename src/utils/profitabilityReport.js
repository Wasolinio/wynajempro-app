/*
  Raport rentowności — całość obliczeń w jednym miejscu (X18 partia A+B, 2026-08-18).

  Powód wydzielenia: modal liczył agregaty u siebie, a eksport CSV budował rejestr
  pozycji osobno (`reportExport.js`). Dwa niezależne przebiegi po tych samych danych to
  gotowy rozjazd — wystarczy zmienić regułę w jednym miejscu. Teraz rejestr pochodzi
  z `profitabilityRows()`, czyli DOKŁADNIE z tego, co trafia do CSV dla księgowego,
  a agregaty liczy pętla przeniesiona z modalu **bez zmian merytorycznych** (świadomie:
  liczby w istniejących sekcjach nie mogą drgnąć przy tej rozbudowie).

  Nowe przekroje (wzorowane na raporcie, który właściciel dostał z zewnątrz i uznał za
  wzorcowy pod względem szczegółowości):
  - dwupoziomowa klasyfikacja kosztów (grupa → kategoria) z liczbą pozycji oraz udziałem
    w kosztach i w przychodach,
  - struktura przychodów wg źródła rezerwacji,
  - statystyki operacyjne (liczba i wartości rezerwacji, średnia prowizja, efektywna
    stawka podatku),
  - marża w ujęciu miesięcznym,
  - rejestr pozycji do wydruku.
*/

import { profitabilityRows } from './reportExport';

const propNameOf = (p) => (typeof p === 'object' ? p?.name : p) || '';
const monthIdx = (ym) => { const [y, m] = (ym || '').split('-').map(Number); return (y || 0) * 12 + ((m || 1) - 1); };

// Nazwy grup trzymamy w jednym miejscu — używa ich i klasyfikacja, i struktura kosztów.
export const GRUPY = {
  prowizje: 'Prowizje portali',
  podatki: 'Podatki',
  media: 'Media w rezerwacjach',
  wlasne: 'Koszty własne',
  stale: 'Koszty stałe',
};

const KOLORY_GRUP = {
  [GRUPY.prowizje]: 'var(--cynober)',
  [GRUPY.media]: 'var(--granat)',
  [GRUPY.wlasne]: 'var(--green)',
  [GRUPY.podatki]: 'var(--amber-ink)',
  [GRUPY.stale]: 'var(--brick)',
};

export function buildReport(rentals, recurringCosts, year) {
  const y = Number(year);
  const now = new Date();
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const months = Array.from({ length: 12 }, () => ({ income: 0, commission: 0, media: 0, own: 0, tax: 0, fixed: 0, active: false, profit: 0, margin: 0 }));
  const byProp = {};
  const bump = (name) => (byProp[name] || (byProp[name] = { income: 0, cost: 0 }));

  // Klasyfikacja: grupa -> kategoria -> { amount, count }
  const klas = {};
  const dolicz = (grupa, kategoria, kwota, sztuk = 1) => {
    if (!(Number(kwota) > 0)) return;
    const g = klas[grupa] || (klas[grupa] = { amount: 0, count: 0, kategorie: {} });
    const k = g.kategorie[kategoria] || (g.kategorie[kategoria] = { amount: 0, count: 0 });
    g.amount += kwota; g.count += sztuk;
    k.amount += kwota; k.count += sztuk;
  };

  const wgZrodla = {};
  const kwotyRezerwacji = [];
  let prowizjaSuma = 0, prowizjaPodstawa = 0;

  (rentals || []).forEach((r) => {
    if (!r.date) return;
    const d = new Date(r.date);
    if (isNaN(d.getTime()) || d.getFullYear() !== y) return;
    const mo = d.getMonth();
    const P = bump(propNameOf(r.property));
    if (r.type === 'booking') {
      const inc = Number(r.income) || 0, com = Number(r.commission) || 0, media = Number(r.utilities) || 0, tax = (Number(r.tax) || 0) + (Number(r.vat) || 0);
      months[mo].income += inc; months[mo].commission += com; months[mo].media += media; months[mo].tax += tax; months[mo].active = true;
      P.income += inc; P.cost += com + media + tax;

      const zrodlo = r.source || 'Bez źródła';
      if (inc > 0) {
        const z = wgZrodla[zrodlo] || (wgZrodla[zrodlo] = { amount: 0, count: 0 });
        z.amount += inc; z.count += 1;
        kwotyRezerwacji.push(inc);
      }
      dolicz(GRUPY.prowizje, zrodlo, com);
      if (com > 0 && inc > 0) { prowizjaSuma += com; prowizjaPodstawa += inc; }
      dolicz(GRUPY.media, 'Media przy rezerwacjach', media);
      dolicz(GRUPY.podatki, 'Podatek', Number(r.tax) || 0);
      dolicz(GRUPY.podatki, 'VAT', Number(r.vat) || 0);
    } else if (r.type === 'utility') {
      const amt = Number(r.utilities) || 0; if (amt <= 0) return;
      months[mo].own += amt; months[mo].active = true; P.cost += amt;
      dolicz(GRUPY.wlasne, r.category || 'Bez kategorii', amt);
    }
  });

  (recurringCosts || []).forEach((c) => {
    const start = monthIdx(c.startMonth); const end = c.endMonth ? monthIdx(c.endMonth) : Infinity;
    const from = Math.max(start, y * 12); const to = Math.min(end, y * 12 + 11, nowIdx);
    for (let mi = from; mi <= to; mi++) {
      const amt = Number(c.amount) || 0;
      months[mi % 12].fixed += amt; months[mi % 12].active = true;
      if (c.property) bump(c.property).cost += amt;
      dolicz(GRUPY.stale, c.name || c.category || 'Koszt stały', amt);
    }
  });

  months.forEach((m) => {
    m.profit = m.income - m.commission - m.media - m.own - m.tax - m.fixed;
    m.margin = m.income > 0 ? Math.round((m.profit / m.income) * 100) : null;
  });
  const T = months.reduce((a, m) => ({
    income: a.income + m.income, commission: a.commission + m.commission, media: a.media + m.media,
    own: a.own + m.own, tax: a.tax + m.tax, fixed: a.fixed + m.fixed,
  }), { income: 0, commission: 0, media: 0, own: 0, tax: 0, fixed: 0 });

  const variable = T.commission + T.media + T.own + T.tax;
  const totalCosts = variable + T.fixed;
  const profit = T.income - totalCosts;
  const margin = T.income > 0 ? Math.round((profit / T.income) * 100) : 0;

  const buckets = [
    { name: GRUPY.prowizje, amount: T.commission, color: KOLORY_GRUP[GRUPY.prowizje] },
    { name: GRUPY.media, amount: T.media, color: KOLORY_GRUP[GRUPY.media] },
    { name: GRUPY.wlasne, amount: T.own, color: KOLORY_GRUP[GRUPY.wlasne] },
    { name: GRUPY.podatki, amount: T.tax, color: KOLORY_GRUP[GRUPY.podatki] },
    { name: GRUPY.stale, amount: T.fixed, color: KOLORY_GRUP[GRUPY.stale] },
  ].filter((b) => b.amount > 0).sort((a, b) => b.amount - a.amount);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.amount));

  const objRows = Object.entries(byProp)
    .map(([name, v]) => ({ name, income: v.income, cost: v.cost, profit: v.income - v.cost, margin: v.income > 0 ? Math.round(((v.income - v.cost) / v.income) * 100) : 0 }))
    .filter((o) => o.income > 0 || o.cost > 0)
    .sort((a, b) => b.profit - a.profit);

  // Klasyfikacja kosztów: grupy posortowane kwotą, w każdej kategorie posortowane kwotą.
  const udzialK = (v) => (totalCosts > 0 ? v / totalCosts : 0);
  const udzialP = (v) => (T.income > 0 ? v / T.income : 0);
  const grupyKosztow = Object.entries(klas)
    .map(([nazwa, g]) => ({
      nazwa,
      amount: g.amount,
      count: g.count,
      color: KOLORY_GRUP[nazwa] || 'var(--muted)',
      udzialKoszt: udzialK(g.amount),
      udzialPrzychod: udzialP(g.amount),
      kategorie: Object.entries(g.kategorie)
        .map(([kn, k]) => ({ nazwa: kn, amount: k.amount, count: k.count, udzialKoszt: udzialK(k.amount) }))
        .sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.amount - a.amount);

  const zrodlaPrzychodu = Object.entries(wgZrodla)
    .map(([nazwa, z]) => ({ nazwa, amount: z.amount, count: z.count, udzial: T.income > 0 ? z.amount / T.income : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const statystyki = {
    rezerwacji: kwotyRezerwacji.length,
    srednia: kwotyRezerwacji.length ? T.income / kwotyRezerwacji.length : 0,
    najwyzsza: kwotyRezerwacji.length ? Math.max(...kwotyRezerwacji) : 0,
    najnizsza: kwotyRezerwacji.length ? Math.min(...kwotyRezerwacji) : 0,
    sredniaProwizja: prowizjaPodstawa > 0 ? prowizjaSuma / prowizjaPodstawa : null,
    efektywnaStawkaPodatku: T.income > 0 ? T.tax / T.income : null,
    kosztyDoPrzychodow: T.income > 0 ? totalCosts / T.income : null,
  };

  // Rejestr = dokładnie te wiersze, które trafiają do CSV dla księgowego.
  const rejestr = profitabilityRows(rentals, recurringCosts, y);

  return {
    y, months, T, variable, totalCosts, profit, margin, buckets, maxBucket, objRows,
    grupyKosztow, zrodlaPrzychodu, statystyki, rejestr, pozycji: rejestr.length,
  };
}
