// =============================================================================
// KALKULATOR PODATKÓW WynajemPRO v2
// Czysta logika (bez zależności od React).
//
// Eksporty:
//   1. calculateTaxes()        — per-rezerwacja, używany w modalu edycji
//   2. calculateMonthlyTaxes() — miesięczne podsumowanie podatkowe
//   3. generateMicroAccount()  — Indywidualny Mikrorachunek Podatkowy
//   4. generateTransferTitle() — tytuł przelewu podatkowego
// =============================================================================

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

  // ===== STAWKA LINIOWA / NIEREJESTROWANA =====
  } else {
    const rate = (Number(settings.rate) || 8.5) / 100;
    taxAmt = taxBase * rate;
  }

  return {
    vat: vatAmt > 0 ? vatAmt.toFixed(2) : '',
    tax: taxAmt > 0 ? taxAmt.toFixed(2) : '',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. MIESIĘCZNE PODSUMOWANIE PODATKOWE
//    Nowa funkcja wyliczająca podatek dochodowy + VAT-UE za dany miesiąc.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Oblicza pełne zobowiązania podatkowe za dany miesiąc.
 *
 * @param {Array}  allYearRentals   — WSZYSTKIE rezerwacje z danego roku (pełen rok)
 * @param {Object} taxProfile       — profil podatkowy użytkownika:
 *   {
 *     taxForm: 'lump_sum' | 'general' | 'nierejestrowana',
 *     autoThreshold: bool,          — prog 100k (ryczałt)
 *     rate: number,                  — stawka %
 *     isVatPayer: bool,              — czy czynny VAT
 *     taxFreeAmount: number,         — kwota wolna (skala)
 *     taxIdentifier: string,         — NIP lub PESEL
 *     identifierType: 'NIP' | 'PESEL',
 *     includeZusInCosts: bool,
 *     zusSocial: number,             — składka społeczna /mies.
 *     zusHealth: number,             — składka zdrowotna /mies.
 *   }
 * @param {number} month            — miesiąc (0-11)
 * @param {number} year             — rok
 * @returns {Object}                — wynik obliczeń
 */
export function calculateMonthlyTaxes(allYearRentals, taxProfile, month, year) {
  const bookings   = allYearRentals.filter(r => r.type === 'booking');
  const expenses   = allYearRentals.filter(r => r.type === 'utility');
  const isVatPayer = taxProfile.isVatPayer;

  // --- Filtruj rezerwacje i koszty wg miesiąca ---
  // Dla rezerwacji główną "datą sprzedaży" jest data wyjazdu (endDate)
  const monthBookings = bookings.filter(r => _isInMonth(r.endDate || r.date, month, year));
  const monthExpenses = expenses.filter(r => _isInMonth(r.date, month, year));

  // --- Przychód brutto i prowizje w danym miesiącu ---
  const monthlyGrossIncome   = _sum(monthBookings, 'income');
  const monthlyCommissions   = _sum(monthBookings, 'commission');
  const monthlyExpenseAmount = _sum(monthExpenses, 'utilities');

  // --- Przychód netto (po odliczeniu VAT krajowego 8%) ---
  const monthlyNetIncome = isVatPayer
    ? monthBookings.reduce((acc, r) => {
        const inc = Number(r.income) || 0;
        return acc + (inc / 1.08);
      }, 0)
    : monthlyGrossIncome;

  // ═══════════════════════════════════════════════════════════════════════
  //  VAT-UE (Import Usług) = 23% od sumy prowizji zagranicznych portali
  // ═══════════════════════════════════════════════════════════════════════
  const vatUE = monthlyCommissions * 0.23;

  // ═══════════════════════════════════════════════════════════════════════
  //  PODATEK DOCHODOWY — narastająco od początku roku (YTD)
  // ═══════════════════════════════════════════════════════════════════════

  // Dane narastające do KOŃCA bieżącego miesiąca włącznie
  const ytdBookings = bookings.filter(r => _isBeforeOrInMonth(r.endDate || r.date, month, year));
  const ytdExpenses = expenses.filter(r => _isBeforeOrInMonth(r.date, month, year));

  // Dane narastające do końca POPRZEDNIEGO miesiąca
  const prevBookings = bookings.filter(r => _isBeforeMonth(r.endDate || r.date, month, year));
  const prevExpenses = expenses.filter(r => _isBeforeMonth(r.date, month, year));

  let incomeTax = 0;
  let ytdGrossIncome = 0;

  // --- RYCZAŁT ---
  if (taxProfile.taxForm === 'lump_sum') {
    // Przychód netto YTD (do bieżącego miesiąca włącznie)
    const ytdNetNow  = _netIncomeSum(ytdBookings, isVatPayer);
    const ytdNetPrev = _netIncomeSum(prevBookings, isVatPayer);
    ytdGrossIncome = _sum(ytdBookings, 'income');

    if (taxProfile.autoThreshold) {
      const taxNow  = _lumpSumTax(ytdNetNow);
      const taxPrev = _lumpSumTax(ytdNetPrev);
      incomeTax = Math.max(0, taxNow - taxPrev);
    } else {
      const rate = (Number(taxProfile.rate) || 8.5) / 100;
      incomeTax = monthlyNetIncome * rate;
    }

  // --- ZASADY OGÓLNE (Skala 12/32%) / NIEREJESTROWANA ---
  } else {
    const zusMonthly = taxProfile.includeZusInCosts
      ? (Number(taxProfile.zusSocial) || 0)
      : 0;

    const ytdNetNow    = _netIncomeSum(ytdBookings, isVatPayer);
    const ytdCommNow   = _sum(ytdBookings, 'commission');
    const ytdExpNow    = _sum(ytdExpenses, 'utilities');
    const ytdZusNow    = zusMonthly * (month + 1);

    const ytdNetPrev   = _netIncomeSum(prevBookings, isVatPayer);
    const ytdCommPrev  = _sum(prevBookings, 'commission');
    const ytdExpPrev   = _sum(prevExpenses, 'utilities');
    const ytdZusPrev   = zusMonthly * month;

    ytdGrossIncome = _sum(ytdBookings, 'income');

    const taxFree = Number(taxProfile.taxFreeAmount) || 30000;

    if (taxProfile.taxForm === 'nierejestrowana') {
      // Działalność nierejestrowana — 12% od dochodu, bez kwoty wolnej w uproszczeniu
      const profitNow  = Math.max(0, ytdNetNow  - ytdCommNow  - ytdExpNow  - ytdZusNow);
      const profitPrev = Math.max(0, ytdNetPrev - ytdCommPrev - ytdExpPrev - ytdZusPrev);
      incomeTax = Math.max(0, (profitNow * 0.12) - (profitPrev * 0.12));
    } else {
      // Skala podatkowa z kwotą wolną i dwoma progami
      const profitNow  = Math.max(0, ytdNetNow  - ytdCommNow  - ytdExpNow  - ytdZusNow);
      const profitPrev = Math.max(0, ytdNetPrev - ytdCommPrev - ytdExpPrev - ytdZusPrev);

      const progressiveTax = (profit) => {
        if (profit <= taxFree) return 0;
        if (profit <= 120000) return (profit - taxFree) * 0.12;
        return ((120000 - taxFree) * 0.12) + ((profit - 120000) * 0.32);
      };

      incomeTax = Math.max(0, progressiveTax(profitNow) - progressiveTax(profitPrev));
    }
  }

  // --- Mikrorachunek i tytuły przelewów ---
  const microAccount = generateMicroAccount(
    taxProfile.taxIdentifier,
    taxProfile.identifierType
  );
  const incomeTaxTitle = generateTransferTitle(taxProfile.taxForm, year, month);
  const vatUETitle     = `VAT-I ${year}M${String(month + 1).padStart(2, '0')}`;

  return {
    // Kwoty miesięczne
    monthlyGrossIncome:   round2(monthlyGrossIncome),
    monthlyNetIncome:     round2(monthlyNetIncome),
    monthlyCommissions:   round2(monthlyCommissions),
    monthlyExpenses:      round2(monthlyExpenseAmount),

    // Podatki
    incomeTax:            round2(incomeTax),
    vatUE:                round2(vatUE),

    // Ryczałt: prog 100k
    ytdGrossIncome:       round2(ytdGrossIncome),
    thresholdProgress:    Math.min(100, round2((ytdGrossIncome / 100000) * 100)),
    thresholdRemaining:   round2(Math.max(0, 100000 - ytdGrossIncome)),

    // Dane do przelewów
    microAccount,
    incomeTaxTitle,
    vatUETitle,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERATOR INDYWIDUALNEGO MIKRORACHUNKU PODATKOWEGO
//    Format: PL + 2 cyfry kontrolne + 10100071222 + identyfikator (26 znaków)
//    Wzorzec: LK 10100071222 XXXXXXXXXXXXX
//    Identyfikator: NIP (10 cyfr) lub PESEL (11 cyfr), dopełniony zerami do 13.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generuje numer Indywidualnego Mikrorachunku Podatkowego.
 * @param {string} identifier    — NIP (10 cyfr) lub PESEL (11 cyfr)
 * @param {'NIP'|'PESEL'} type   — typ identyfikatora
 * @returns {string}             — pełny numer rachunku (26 cyfr) lub pusty string
 */
export function generateMicroAccount(identifier, type) {
  if (!identifier) return '';

  // Wyczyść: zostaw same cyfry
  const digits = identifier.replace(/\D/g, '');

  // Walidacja długości
  if (type === 'NIP' && digits.length !== 10) return '';
  if (type === 'PESEL' && digits.length !== 11) return '';

  // Stała część rachunku (NBP + identyfikator urzędu)
  const bankPart = '10100071222';

  // Dopełnij identyfikator zerami z lewej do 13 cyfr
  const paddedId = digits.padStart(13, '0');

  // BBAN = bankPart + paddedId (24 cyfry)
  const bban = bankPart + paddedId;

  // Oblicz sumę kontrolną IBAN (standard ISO 7064 mod 97-10)
  // Przenosimy "PL00" na koniec → numeryczny odpowiednik PL = 2521, + 00
  const numeric = bban + '252100';
  const checksum = 98n - _mod97(numeric);
  const checksumStr = checksum.toString().padStart(2, '0');

  return checksumStr + bban;
}


// ─────────────────────────────────────────────────────────────────────────────
// 4. GENERATOR TYTUŁU PRZELEWU
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {'lump_sum'|'general'|'nierejestrowana'} taxForm
 * @param {number} year
 * @param {number} month  — 0-indexed
 * @returns {string}
 */
export function generateTransferTitle(taxForm, year, month) {
  const mm = String(month + 1).padStart(2, '0');
  switch (taxForm) {
    case 'lump_sum':
      return `PPE ${year}M${mm}`;
    case 'general':
      return `PIT-36 ${year}M${mm}`;
    case 'nierejestrowana':
      return `PIT-36 ${year}M${mm}`;
    default:
      return `PIT ${year}M${mm}`;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// PRYWATNE HELPERY
// ─────────────────────────────────────────────────────────────────────────────

/** Zaokrąglenie do 2 miejsc po przecinku */
function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Suma wartości pola `field` z tablicy obiektów */
function _sum(arr, field) {
  if (field === 'commission') {
    return arr.reduce((acc, r) => acc + _getCommission(r), 0);
  }
  return arr.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
}

/** Pobiera kwotę prowizji uwzględniając nową strukturę obiektową (np. commission.amount) */
function _getCommission(rentalObj) {
  if (rentalObj.commissionAmount !== undefined) return Number(rentalObj.commissionAmount) || 0;
  if (rentalObj.commission && typeof rentalObj.commission === 'object' && rentalObj.commission.amount !== undefined) {
    return Number(rentalObj.commission.amount) || 0;
  }
  return Number(rentalObj.commission) || 0;
}

/** Suma przychodów netto (po odjęciu VAT 8% jeśli czynny płatnik) */
function _netIncomeSum(bookings, isVatPayer) {
  return bookings.reduce((acc, r) => {
    const inc = Number(r.income) || 0;
    return acc + (isVatPayer ? inc / 1.08 : inc);
  }, 0);
}

/** Podatek ryczałtowy z progiem 100k */
function _lumpSumTax(ytdNet) {
  if (ytdNet <= 100000) return ytdNet * 0.085;
  return (100000 * 0.085) + ((ytdNet - 100000) * 0.125);
}

/** Czy data (string YYYY-MM-DD) wypada w danym miesiącu */
function _isInMonth(dateStr, month, year) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month;
}

/** Czy data wypada W lub PRZED danym miesiącem (w tym samym roku) */
function _isBeforeOrInMonth(dateStr, month, year) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() <= month;
}

/** Czy data wypada PRZED danym miesiącem (w tym samym roku) */
function _isBeforeMonth(dateStr, month, year) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() < month;
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

/**
 * Oblicz modulo 97 dla bardzo długiego ciągu cyfr (BigInt).
 * Potrzebne do sumy kontrolnej IBAN.
 */
function _mod97(numericStr) {
  return BigInt(numericStr) % 97n;
}
