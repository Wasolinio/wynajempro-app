// =============================================================================
// WSPÓLNE STAŁE APLIKACJI WynajemPRO
// Jedno źródło prawdy — importowane przez ManagerApp, useFirebaseData i inne moduły.
// =============================================================================

export const propColors = {
  blue: { bg: 'bg-blue-500', solid: 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20', advance: 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 border-[2px] border-solid font-bold', dashed: 'bg-blue-50 dark:bg-transparent border-blue-400 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 border-2 border-dashed' },
  emerald: { bg: 'bg-emerald-500', solid: 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20', advance: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 border-[2px] border-solid font-bold', dashed: 'bg-emerald-50 dark:bg-transparent border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 border-2 border-dashed' },
  violet: { bg: 'bg-violet-500', solid: 'bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-500/20', advance: 'bg-violet-50 dark:bg-violet-500/20 border-violet-500 text-violet-800 dark:text-violet-300 border-[2px] border-solid font-bold', dashed: 'bg-violet-50 dark:bg-transparent border-violet-400 dark:border-violet-500/50 text-violet-700 dark:text-violet-400 border-2 border-dashed' },
  amber: { bg: 'bg-amber-500', solid: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20', advance: 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-300 border-[2px] border-solid font-bold', dashed: 'bg-amber-50 dark:bg-transparent border-amber-400 dark:border-amber-500/50 text-amber-700 dark:text-amber-400 border-2 border-dashed' },
  rose: { bg: 'bg-rose-500', solid: 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20', advance: 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 border-[2px] border-solid font-bold', dashed: 'bg-rose-50 dark:bg-transparent border-rose-400 dark:border-rose-500/50 text-rose-700 dark:text-rose-400 border-2 border-dashed' },
  cyan: { bg: 'bg-cyan-500', solid: 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20', advance: 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-800 dark:text-cyan-300 border-[2px] border-solid font-bold', dashed: 'bg-cyan-50 dark:bg-transparent border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 border-2 border-dashed' },
  pink: { bg: 'bg-pink-500', solid: 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20', advance: 'bg-pink-50 dark:bg-pink-500/20 border-pink-500 text-pink-800 dark:text-pink-300 border-[2px] border-solid font-bold', dashed: 'bg-pink-50 dark:bg-transparent border-pink-400 dark:border-pink-500/50 text-pink-700 dark:text-pink-400 border-2 border-dashed' },
  slate: { bg: 'bg-slate-500', solid: 'bg-slate-600 border-slate-600 text-white shadow-md shadow-slate-500/20', advance: 'bg-slate-50 dark:bg-slate-500/20 border-slate-500 text-slate-800 dark:text-slate-300 border-[2px] border-solid font-bold', dashed: 'bg-slate-50 dark:bg-transparent border-slate-400 dark:border-slate-500/50 text-slate-700 dark:text-slate-400 border-2 border-dashed' },
};

export const availableColors = Object.keys(propColors);

export const DEFAULT_PROPERTIES = [
  { name: 'Domek nad Jeziorem', color: 'blue' },
  { name: 'Apartament Centrum', color: 'emerald' },
  { name: 'Domek w Górach', color: 'amber' }
];

export const DEFAULT_SOURCES = ['Booking.com', 'Airbnb', 'Facebook', 'Strona www', 'Z polecenia', 'Inne'];

export const DEFAULT_CATEGORIES = ['Prąd', 'Woda', 'Sprzątanie', 'Środki czystości', 'Naprawy', 'Gaz', 'Internet', 'Inne'];

export const DEFAULT_TEMPLATES = [
  { id: 'directions', text: 'Wyślij wskazówki dojazdu', shortName: 'Dojazd', daysBefore: 3, icon: 'Mail' },
  { id: 'keycode', text: 'Wyślij kod do drzwi', shortName: 'Kod', daysBefore: 1, icon: 'Key' },
  { id: 'cleaning', text: 'Zleć sprzątanie', shortName: 'Sprzątanie', daysBefore: 0, icon: 'CheckSquare' }
];

export const defaultTaxSettings = {
  taxForm: 'lump_sum',
  autoThreshold: true,
  rate: 8.5,
  isVatPayer: false,
  zusHealth: 0,
  zusSocial: 0,
  taxFreeAmount: 30000,
  includeZusInCosts: true
};

export const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

export const ITEMS_PER_PAGE = 15;
