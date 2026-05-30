// =============================================================================
// KALKULATOR PODATKÓW WynajemPRO
// Czysta funkcja bez zależności od React.
// Obsługuje: ryczałt (z progiem 100k), skalę podatkową (z kwotą wolną), stawkę liniową.
// =============================================================================

/**
 * Oblicza podatek dochodowy i VAT dla danej rezerwacji.
 * 
 * @param {Object} rentalObj - Rezerwacja, dla której obliczamy podatek
 * @param {Array} allRentals - Wszystkie rezerwacje (do obliczeń narastających YTD)
 * @param {Object} settings - Ustawienia podatkowe użytkownika
 * @param {string|null} currentEditingId - ID aktualnie edytowanej rezerwacji (do wykluczenia z YTD)
 * @returns {{ vat: string, tax: string }} - Kwoty jako stringi z 2 miejscami po przecinku lub ''
 */
export function calculateTaxes(rentalObj, allRentals, settings, currentEditingId) {
  const inc = Number(rentalObj.income) || 0;
  const comm = Number(rentalObj.commission) || 0;

  // --- VAT ---
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

  // ===== RYCZAŁT Z AUTOMATYCZNYM PROGIEM 100K =====
  if (settings.taxForm === 'lump_sum' && settings.autoThreshold) {
    let ytdNetInc = 0;
    const currentYear = new Date(rentalObj.date || new Date()).getFullYear();
    const currentDate = new Date(rentalObj.date || new Date()).getTime();
    const currIdNum = Number(currentEditingId || Date.now());

    allRentals.forEach(r => {
      if (r.type === 'booking' && r.id !== currentEditingId) {
        if (!r.date) return;
        const rDateObj = new Date(r.date);
        if (rDateObj.getFullYear() === currentYear) {
          const rTime = rDateObj.getTime();
          if (rTime < currentDate || (rTime === currentDate && Number(r.id) < currIdNum)) {
            const rInc = Number(r.income) || 0;
            const rVat = settings.isVatPayer ? (rInc - (rInc / 1.08)) : 0;
            ytdNetInc += (rInc - rVat);
          }
        }
      }
    });

    if (ytdNetInc >= 100000) {
      taxAmt = taxBase * 0.125;
    } else if (ytdNetInc + netInc <= 100000) {
      taxAmt = taxBase * 0.085;
    } else {
      const belowThreshold = 100000 - ytdNetInc;
      const aboveThreshold = netInc - belowThreshold;
      taxAmt = (belowThreshold * 0.085) + (aboveThreshold * 0.125);
    }

  // ===== SKALA PODATKOWA (ogólna) =====
  } else if (settings.taxForm === 'general') {
    let ytdNetIncome = 0;
    let ytdCosts = 0;
    const currentYear = new Date(rentalObj.date || new Date()).getFullYear();
    const currentDate = new Date(rentalObj.date || new Date()).getTime();
    const currIdNum = Number(currentEditingId || Date.now());

    allRentals.forEach(r => {
      if (r.id !== currentEditingId && r.date) {
        const rDateObj = new Date(r.date);
        if (rDateObj.getFullYear() === currentYear) {
          const rTime = rDateObj.getTime();
          if (rTime < currentDate || (rTime === currentDate && Number(r.id) < currIdNum)) {
            if (r.type === 'booking') {
              const rInc = Number(r.income) || 0;
              const rVat = settings.isVatPayer ? (rInc - (rInc / 1.08)) : 0;
              ytdNetIncome += (rInc - rVat);
              ytdCosts += (Number(r.commission) || 0);
            } else if (r.type === 'utility') {
              ytdCosts += (Number(r.utilities) || 0);
            }
          }
        }
      }
    });

    // Odliczenie ZUS (narastająco do miesiąca rezerwacji)
    let yearlyZusDeduction = 0;
    if (settings.includeZusInCosts) {
      const monthNum = new Date(rentalObj.date || new Date()).getMonth() + 1;
      yearlyZusDeduction = (Number(settings.zusSocial) || 0) * monthNum;
    }

    const currentCumulativeProfit = Math.max(0, ytdNetIncome - ytdCosts - yearlyZusDeduction);
    const newCumulativeProfit = Math.max(0, ytdNetIncome + netInc - ytdCosts - comm - yearlyZusDeduction);

    const taxFree = Number(settings.taxFreeAmount) || 30000;
    let oldTax = 0;
    let newTax = 0;

    if (currentCumulativeProfit > taxFree) {
      if (currentCumulativeProfit <= 120000) oldTax = (currentCumulativeProfit - taxFree) * 0.12;
      else oldTax = ((120000 - taxFree) * 0.12) + ((currentCumulativeProfit - 120000) * 0.32);
    }
    if (newCumulativeProfit > taxFree) {
      if (newCumulativeProfit <= 120000) newTax = (newCumulativeProfit - taxFree) * 0.12;
      else newTax = ((120000 - taxFree) * 0.12) + ((newCumulativeProfit - 120000) * 0.32);
    }
    taxAmt = Math.max(0, newTax - oldTax);

  // ===== STAWKA LINIOWA (np. 19%) =====
  } else {
    taxAmt = taxBase * (Number(settings.rate) / 100);
  }

  return {
    vat: vatAmt > 0 ? vatAmt.toFixed(2) : '',
    tax: taxAmt > 0 ? taxAmt.toFixed(2) : ''
  };
}
