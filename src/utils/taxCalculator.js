// =============================================================================
// KALKULATOR PODATKÓW WynajemPRO v2
// Czysta logika (bez zależności od React).
//
// Eksporty:
//   1. calculateTaxes() — per-rezerwacja, używany w modalu edycji
//
// HISTORIA: plik miał kiedyś cztery eksporty. calculateMonthlyTaxes(),
// generateMicroAccount() i generateTransferTitle() zasilały widok „Podatki"
// (TaxSummaryPanel), który commit `fb8a00e` przeniósł do `_legacy/` i który nie
// dostał zastępnika w panelu v2. Przez dwa miesiące były martwym kodem trzymanym
// przy życiu wyłącznie przez import w teście e2e. Usunięte 2026-08-12 decyzją
// właściciela — patrz [[Decisions]]. Próg 100 000 zł dla ryczałtu żyje dalej,
// bo obsługuje go calculateTaxes() przy każdej rezerwacji.
// =============================================================================

// Stawka i limit liniowego z jednego źródła prawdy — limit odliczenia zdrowotnej
// zmienia się co roku (obwieszczenie MF), więc nie wolno go tu powielić na sztywno.
import { STAWKI_PODATKOWE } from './constants.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. OBLICZENIE PER-REZERWACJA (kompatybilność z modalem edycji)
//    Sygnatura i kształt zwracanego obiektu nie zmienione.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Oblicza podatek dochodowy i VAT dla pojedynczej rezerwacji.
 * Wywoływane w locie przy edycji formularza w ManagerApp (handleRentalChange).
 *
 * @param {Object} rentalObj       — rezerwacja (z bieżącym stanem formularza)
 * @param {Array}  allRentals      — wszystkie rezerwacje (do narastającego YTD)
 * @param {Object} settings        — ustawienia podatkowe (taxForm, rate, …)
 * @param {string|null} editingId  — ID edytowanej rezerwacji (wykluczona z YTD)
 * @returns {{ vat: string, tax: string }}
 */
export function calculateTaxes(rentalObj, allRentals, settings, editingId) {
  const inc  = Number(rentalObj.income)     || 0;
  const comm = _getCommission(rentalObj);

  // --- VAT krajowy (dla czynnych płatników VAT, stawka 8% na noclegi) ---
  let vatAmt = 0;
  if (settings.isVatPayer) {
    vatAmt = inc - (inc / 1.08);
  }
  const netInc = inc - vatAmt;

  // --- Podstawa opodatkowania ---
  let taxBase = netInc;
  if (settings.taxForm === 'general') {
    taxBase = Math.max(0, netInc - comm);
  }

  let taxAmt = 0;

  // ===== RYCZAŁT Z AUTOMATYCZNYM PROGIEM 100 000 zł =====
  if (settings.taxForm === 'lump_sum' && settings.autoThreshold) {
    const { ytdNetIncome } = _calcYtdBookings(rentalObj, allRentals, settings, editingId);

    if (ytdNetIncome >= 100000) {
      taxAmt = taxBase * 0.125;
    } else if (ytdNetIncome + netInc <= 100000) {
      taxAmt = taxBase * 0.085;
    } else {
      const below = 100000 - ytdNetIncome;
      const above = netInc - below;
      taxAmt = (below * 0.085) + (above * 0.125);
    }

  // ===== ZASADY OGÓLNE (Skala 12% / 32%) =====
  } else if (settings.taxForm === 'general') {
    const { ytdNetIncome, ytdCosts, ytdZus } = _calcYtdAll(rentalObj, allRentals, settings, editingId);

    const taxFree = Number(settings.taxFreeAmount) || 30000;
    const oldProfit = Math.max(0, ytdNetIncome - ytdCosts - ytdZus);
    const newProfit = Math.max(0, ytdNetIncome + netInc - ytdCosts - comm - ytdZus);

    const progressiveTax = (profit) => {
      if (profit <= taxFree) return 0;
      if (profit <= 120000) return (profit - taxFree) * 0.12;
      return ((120000 - taxFree) * 0.12) + ((profit - 120000) * 0.32);
    };

    taxAmt = Math.max(0, progressiveTax(newProfit) - progressiveTax(oldProfit));

  // ===== PODATEK LINIOWY 19% (art. 30c PIT) =====
  // Ta sama konstrukcja przyrostowa co przy skali, tylko stawka płaska i bez kwoty
  // wolnej. Dochód od NETTO (u vatowca przychód podatkowy = kwota bez VAT należnego).
  // Społeczne odejmujemy zawsze (koszt albo odliczenie od dochodu — przy płaskiej
  // stawce ta sama kwota, raz); wpisaną zdrowotną do rocznego limitu z obwieszczenia
  // MF (art. 30c ust. 2 pkt 2). Mnożenie przez numer miesiąca to to samo przybliżenie
  // co w gałęzi skali. Roczne podsumowanie liczy `taxSummary.js` — ADR-027.
  } else if (settings.taxForm === 'linear') {
    const S = STAWKI_PODATKOWE.liniowy;
    const { ytdNetIncome, ytdCosts } = _calcYtdAll(rentalObj, allRentals, settings, editingId);

    const monthNum = new Date(rentalObj.date || new Date()).getMonth() + 1;
    const zusSpoleczne = (Number(settings.zusSocial) || 0) * monthNum;
    const zdrowotna = Math.min((Number(settings.zusHealth) || 0) * monthNum, S.limitOdliczeniaZdrowotnej);

    const oldProfit = Math.max(0, ytdNetIncome - ytdCosts - zusSpoleczne - zdrowotna);
    const newProfit = Math.max(0, ytdNetIncome + netInc - ytdCosts - comm - zusSpoleczne - zdrowotna);
    // Klamra jak przy skali: rezerwacja z prowizją większą niż przychód (anulowana
    // z zatrzymaną prowizją) obniża newProfit poniżej oldProfit — bez max(0, …)
    // zapisałaby UJEMNY podatek w polu `tax` (finding przeglądu 2026-08-28).
    taxAmt = Math.max(0, (newProfit - oldProfit) * S.stawka);

  // ===== RYCZAŁT ZE STAŁĄ STAWKĄ (automatyczny próg wyłączony) =====
  // Ta gałąź obsługiwała kiedyś także podatek liniowy i działalność nierejestrowaną,
  // licząc obie stawką z ustawień (domyślnie 8,5%) — bez podstawy prawnej. Usunięte
  // 2026-08-25 (ADR-020); liniowy wrócił 2026-08-28 z własną gałęzią wyżej (ADR-027),
  // nierejestrowana jest usunięta na stałe.
  } else if (settings.taxForm === 'lump_sum') {
    const rate = (Number(settings.rate) || 8.5) / 100;
    taxAmt = taxBase * rate;

  // Nieznana forma — zostawiamy pole podatku puste zamiast wpisywać liczbę policzoną
  // stawką wziętą z powietrza. Puste pole gospodarz zauważy; błędna kwota wygląda dobrze.
  } else {
    return { vat: vatAmt > 0 ? vatAmt.toFixed(2) : '', tax: '' };
  }

  return {
    vat: vatAmt > 0 ? vatAmt.toFixed(2) : '',
    tax: taxAmt > 0 ? taxAmt.toFixed(2) : '',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// PRYWATNE HELPERY
// ─────────────────────────────────────────────────────────────────────────────

/** Pobiera kwotę prowizji uwzględniając nową strukturę obiektową (np. commission.amount) */
function _getCommission(rentalObj) {
  if (rentalObj.commissionAmount !== undefined) return Number(rentalObj.commissionAmount) || 0;
  if (rentalObj.commission && typeof rentalObj.commission === 'object' && rentalObj.commission.amount !== undefined) {
    return Number(rentalObj.commission.amount) || 0;
  }
  return Number(rentalObj.commission) || 0;
}

/** Oblicz narastający przychód netto YTD (bookings) dla per-rental calc */
function _calcYtdBookings(rentalObj, allRentals, settings, editingId) {
  let ytdNetIncome = 0;
  const currentYear = new Date(rentalObj.date || new Date()).getFullYear();
  const currentDate = new Date(rentalObj.date || new Date()).getTime();
  const currIdNum   = Number(editingId || Date.now());

  allRentals.forEach(r => {
    if (r.type === 'booking' && r.id !== editingId && r.date) {
      const rDate = new Date(r.date);
      if (rDate.getFullYear() === currentYear) {
        const rTime = rDate.getTime();
        if (rTime < currentDate || (rTime === currentDate && Number(r.id) < currIdNum)) {
          const rInc = Number(r.income) || 0;
          const rVat = settings.isVatPayer ? (rInc - (rInc / 1.08)) : 0;
          ytdNetIncome += (rInc - rVat);
        }
      }
    }
  });

  return { ytdNetIncome };
}

/** Oblicz narastający przychód, koszty i ZUS (bookings + utilities) */
function _calcYtdAll(rentalObj, allRentals, settings, editingId) {
  let ytdNetIncome = 0;
  let ytdCosts     = 0;
  const currentYear = new Date(rentalObj.date || new Date()).getFullYear();
  const currentDate = new Date(rentalObj.date || new Date()).getTime();
  const currIdNum   = Number(editingId || Date.now());

  allRentals.forEach(r => {
    if (r.id !== editingId && r.date) {
      const rDate = new Date(r.date);
      if (rDate.getFullYear() === currentYear) {
        const rTime = rDate.getTime();
        if (rTime < currentDate || (rTime === currentDate && Number(r.id) < currIdNum)) {
          if (r.type === 'booking') {
            const rInc = Number(r.income) || 0;
            const rVat = settings.isVatPayer ? (rInc - (rInc / 1.08)) : 0;
            ytdNetIncome += (rInc - rVat);
            ytdCosts += _getCommission(r);
          } else if (r.type === 'utility') {
            ytdCosts += (Number(r.utilities) || 0);
          }
        }
      }
    }
  });

  let ytdZus = 0;
  if (settings.includeZusInCosts) {
    const monthNum = new Date(rentalObj.date || new Date()).getMonth() + 1;
    ytdZus = (Number(settings.zusSocial) || 0) * monthNum;
  }

  return { ytdNetIncome, ytdCosts, ytdZus };
}

