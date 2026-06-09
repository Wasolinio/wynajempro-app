import { calculateMonthlyTaxes } from './taxCalculator';
import { monthNames } from './constants';

/**
 * Zwraca prowizję z zachowaniem kompatybilności wstecznej
 */
function getCommissionAmount(rentalObj) {
  if (rentalObj.commissionAmount !== undefined) return Number(rentalObj.commissionAmount) || 0;
  if (rentalObj.commission && typeof rentalObj.commission === 'object' && rentalObj.commission.amount !== undefined) {
    return Number(rentalObj.commission.amount) || 0;
  }
  return Number(rentalObj.commission) || 0;
}

/**
 * Bezpiecznie ucieka znaki CSV (cudzysłowy i przecinki)
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Konwertuje kwoty na format z przecinkiem, co ułatwia import do polskiego Excela
 */
function formatNumber(num) {
  return Number(num).toFixed(2).replace('.', ',');
}

export function generateAccountingReportCSV(allYearRentals, taxSettings, hostProfile, month, year) {
  const monthName = monthNames[month];
  
  // Pobieramy dane z kalkulatora (wyliczone podatki i VAT-UE dla miesiąca)
  const taxSummary = calculateMonthlyTaxes(allYearRentals, taxSettings, hostProfile, month, year);

  // Filtrujemy dane podobnie jak w kalkulatorze
  const bookings = allYearRentals.filter(r => r.type === 'booking');
  const expenses = allYearRentals.filter(r => r.type === 'utility');

  // Dla rezerwacji główną "datą sprzedaży" jest data wyjazdu (endDate)
  const monthBookings = bookings.filter(r => {
    const dStr = r.endDate || r.date;
    if (!dStr) return false;
    const d = new Date(dStr);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a, b) => new Date(a.endDate || a.date).getTime() - new Date(b.endDate || b.date).getTime());

  const monthExpenses = expenses.filter(r => {
    const dStr = r.date;
    if (!dStr) return false;
    const d = new Date(dStr);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // === BUDOWA ZAWARTOŚCI CSV ===
  const lines = [];

  // ==========================================
  // SEKCJA 1: PRZYCHODY
  // ==========================================
  lines.push(`RAPORT KSIĘGOWY: WynajemPRO`);
  lines.push(`Miesiąc:,${monthName} ${year}`);
  lines.push(`Wygenerowano:,${new Date().toLocaleDateString('pl-PL')}`);
  lines.push('');
  lines.push('--- REJESTR PRZYCHODÓW ---');
  lines.push(['Data Sprzedaży', 'Obiekt', 'Gość / Tytuł', 'Kwota Brutto', 'VAT Krajowy', 'Kwota Netto', 'Opłacone (Tak/Nie)'].map(escapeCSV).join(','));

  monthBookings.forEach(r => {
    const inc = Number(r.income) || 0;
    const vat = taxSettings.isVatPayer ? (inc - (inc / 1.08)) : 0;
    const net = inc - vat;
    const dateOfSale = r.endDate || r.date || '';
    
    lines.push([
      dateOfSale,
      r.property || '',
      r.guest || '',
      formatNumber(inc),
      formatNumber(vat),
      formatNumber(net),
      r.isPaid ? 'Tak' : 'Nie'
    ].map(escapeCSV).join(','));
  });

  if (monthBookings.length === 0) {
    lines.push('Brak przychodów w tym miesiącu,,,,,,');
  } else {
    // Podsumowanie przychodów
    lines.push([
      'SUMA PRZYCHODÓW:', '', '',
      formatNumber(taxSummary.grossIncome),
      taxSettings.isVatPayer ? formatNumber(taxSummary.grossIncome - taxSummary.netIncome) : '0,00',
      formatNumber(taxSummary.netIncome),
      ''
    ].map(escapeCSV).join(','));
  }

  lines.push('');
  lines.push('');

  // ==========================================
  // SEKCJA 2: KOSZTY OPERACYJNE
  // ==========================================
  lines.push('--- REJESTR KOSZTÓW ---');
  lines.push(['Data Poniesienia', 'Kategoria', 'Tytuł Kosztu', 'Kwota Kosztu'].map(escapeCSV).join(','));

  let totalExpenses = 0;
  monthExpenses.forEach(r => {
    const cost = Number(r.utilities) || 0;
    totalExpenses += cost;
    lines.push([
      r.date || '',
      r.category || '',
      r.guest || r.guestNote || '',
      formatNumber(cost)
    ].map(escapeCSV).join(','));
  });

  if (monthExpenses.length === 0) {
    lines.push('Brak kosztów w tym miesiącu,,,');
  } else {
    lines.push(['SUMA KOSZTÓW:', '', '', formatNumber(totalExpenses)].map(escapeCSV).join(','));
  }

  lines.push('');
  lines.push('');

  // ==========================================
  // SEKCJA 3: PROWIZJE I IMPORT USŁUG (VAT-UE)
  // ==========================================
  lines.push('--- REJESTR PROWIZJI (ZAGRANICZNE PORTALE) ---');
  lines.push(['Data Sprzedaży', 'Obiekt', 'Platforma / Źródło', 'Gość', 'Kwota Prowizji'].map(escapeCSV).join(','));

  const commissionsItems = monthBookings.filter(r => getCommissionAmount(r) > 0);
  
  commissionsItems.forEach(r => {
    const comm = getCommissionAmount(r);
    lines.push([
      r.endDate || r.date || '',
      r.property || '',
      r.source || 'Inne',
      r.guest || '',
      formatNumber(comm)
    ].map(escapeCSV).join(','));
  });

  if (commissionsItems.length === 0) {
    lines.push('Brak prowizji w tym miesiącu,,,,');
  } else {
    lines.push(['SUMA PROWIZJI:', '', '', '', formatNumber(taxSummary.commissionsTotal)].map(escapeCSV).join(','));
  }

  lines.push('');
  lines.push('');

  // ==========================================
  // SEKCJA 4: PODSUMOWANIE PODATKOWE
  // ==========================================
  lines.push('--- PODSUMOWANIE PODATKOWE (WYNIKI KALKULATORA) ---');
  lines.push(`Forma Opodatkowania:,${taxSettings.taxForm === 'lump_sum' ? 'Ryczałt ewidencjonowany' : taxSettings.taxForm === 'general' ? 'Zasady ogólne (Skala)' : 'Działalność Nierejestrowana'}`);
  if (taxSettings.taxForm === 'lump_sum') {
    lines.push(`Próg 100k PLN przekroczony:,${taxSummary.isOver100kThreshold ? 'TAK (Stawka 12.5%)' : 'NIE (Stawka 8.5%)'}`);
  }
  lines.push(`Podatek Dochodowy do zapłaty:,${formatNumber(taxSummary.incomeTax)} PLN`);
  lines.push(`VAT-UE (Import Usług) do zapłaty:,${formatNumber(taxSummary.vatUE)} PLN (23% od sumy prowizji)`);
  
  if (hostProfile && hostProfile.taxIdentifier) {
    lines.push(`Dane Gospodarza:,${hostProfile.entityName || ''} (Tel: ${hostProfile.phone || ''}, Email: ${hostProfile.email || ''})`);
    lines.push(`Adres:,${hostProfile.address || ''}`);
    lines.push(`Identyfikator podatnika (${hostProfile.identifierType}):,${hostProfile.taxIdentifier}`);
    lines.push(`Indywidualny Mikrorachunek Podatkowy:,${taxSummary.microAccount || 'Brak danych'}`);
  } else {
    lines.push(`Dane Gospodarza:,Brak danych w profilu`);
    lines.push(`Identyfikator podatnika:,Brak NIP/PESEL w profilu`);
  }

  // Budowa pełnego stringa CSV z BOM (Byte Order Mark), by polski Excel dobrze widział kodowanie UTF-8
  const csvContent = '\uFEFF' + lines.join('\n');
  
  // Pobieranie pliku
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Raport_Ksiegowy_WynajemPRO_${month < 9 ? '0'+(month+1) : month+1}_${year}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
