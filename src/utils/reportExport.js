/*
  Eksport danych finansowych dla księgowego (X4 partia 3).
  Czyste funkcje (bez DOM) — pobranie pliku robi komponent.
  CSV w formacie przyjaznym Excelowi PL: separator ';', przecinek dziesiętny,
  UTF-8 BOM (żeby polskie znaki nie rozjechały się przy otwarciu).
*/

const propNameOf = (p) => (typeof p === 'object' ? p?.name : p) || '';
const monthIdx = (ym) => { const [y, m] = (ym || '').split('-').map(Number); return (y || 0) * 12 + ((m || 1) - 1); };
const money = (n) => (Number.isFinite(Number(n)) && Number(n) !== 0 ? String(Number(n).toFixed(2)).replace('.', ',') : '');

const COLUMNS = ['Data', 'Typ', 'Obiekt', 'Źródło / kategoria', 'Opis', 'Przychód', 'Prowizja', 'Podatek', 'VAT', 'Media', 'Koszt'];

// Wiersze rozliczenia dla danego roku: rezerwacje, koszty jednorazowe (utility)
// oraz koszty stałe rozwinięte na każdy aktywny miesiąc roku (do bieżącego miesiąca
// dla roku bieżącego — spójnie z widokiem Koszty i opłaty).
export function profitabilityRows(rentals, recurringCosts, year) {
  const y = Number(year);
  const now = new Date();
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const rows = [];

  (rentals || []).forEach((r) => {
    if (!r.date) return;
    const d = new Date(r.date);
    if (isNaN(d.getTime()) || d.getFullYear() !== y) return;
    if (r.type === 'booking') {
      rows.push({
        Data: r.date, Typ: 'Rezerwacja', Obiekt: propNameOf(r.property),
        'Źródło / kategoria': r.source || '', Opis: r.guest || '',
        Przychód: Number(r.income) || 0, Prowizja: Number(r.commission) || 0,
        Podatek: Number(r.tax) || 0, VAT: Number(r.vat) || 0, Media: Number(r.utilities) || 0, Koszt: 0,
      });
    } else if (r.type === 'utility') {
      rows.push({
        Data: r.date, Typ: 'Koszt', Obiekt: propNameOf(r.property),
        'Źródło / kategoria': r.category || 'Inne', Opis: r.guest || '',
        Przychód: 0, Prowizja: 0, Podatek: 0, VAT: 0, Media: 0, Koszt: Number(r.utilities) || 0,
      });
    }
  });

  (recurringCosts || []).forEach((c) => {
    const start = monthIdx(c.startMonth);
    const end = c.endMonth ? monthIdx(c.endMonth) : Infinity;
    const from = Math.max(start, y * 12);
    const to = Math.min(end, y * 12 + 11, nowIdx);
    for (let mi = from; mi <= to; mi++) {
      const m = (mi % 12) + 1;
      rows.push({
        Data: `${y}-${String(m).padStart(2, '0')}-01`, Typ: 'Koszt stały',
        Obiekt: c.property || 'wszystkie obiekty', 'Źródło / kategoria': c.category || 'Inne',
        Opis: c.name || '', Przychód: 0, Prowizja: 0, Podatek: 0, VAT: 0, Media: 0, Koszt: Number(c.amount) || 0,
      });
    }
  });

  rows.sort((a, b) => (a.Data < b.Data ? -1 : a.Data > b.Data ? 1 : 0));
  return rows;
}

function csvField(v) {
  const s = String(v ?? '');
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows) {
  const numeric = new Set(['Przychód', 'Prowizja', 'Podatek', 'VAT', 'Media', 'Koszt']);
  const head = COLUMNS.map(csvField).join(';');
  const body = rows.map((r) => COLUMNS.map((c) => csvField(numeric.has(c) ? money(r[c]) : r[c])).join(';'));

  // wiersz SUMA — szybka kontrola dla księgowego
  const sum = (c) => rows.reduce((a, r) => a + (Number(r[c]) || 0), 0);
  const totals = ['SUMA', '', '', '', ''].concat(['Przychód', 'Prowizja', 'Podatek', 'VAT', 'Media', 'Koszt'].map((c) => money(sum(c))));

  return '﻿' + [head, ...body, '', totals.map(csvField).join(';')].join('\r\n');
}

export function profitabilityCsv(rentals, recurringCosts, year) {
  return toCsv(profitabilityRows(rentals, recurringCosts, year));
}
