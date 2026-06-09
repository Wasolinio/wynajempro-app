import React, { useMemo, useState } from 'react';
import { Copy, CheckCircle, Landmark, Percent, TrendingUp, AlertTriangle, ChevronDown, Receipt, Download } from 'lucide-react';
import { calculateMonthlyTaxes } from '../utils/taxCalculator';
import { generateAccountingReportCSV } from '../utils/accountingExport';
import { monthNames } from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * TaxSummaryPanel — panel podsumowania podatkowego za wybrany miesiąc.
 * Wyświetla karty z podatkiem dochodowym, VAT-UE, mikrorachunkiem i paskiem progu 100k.
 *
 * Props:
 *   @param {Array}  rentals      — wszystkie rezerwacje z danego roku
 *   @param {Object} taxSettings  — profil podatkowy użytkownika
 *   @param {number} selectedYear — wybrany rok
 */
export default function TaxSummaryPanel({ year, rentals, taxSettings, hostProfile }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [copiedField, setCopiedField] = useState(null);

  // Obliczenia podatkowe
  const tax = useMemo(() => {
    return calculateMonthlyTaxes(rentals, taxSettings, hostProfile, selectedMonth, year);
  }, [rentals, taxSettings, hostProfile, selectedMonth, year]);

  // Helper kopiowania do schowka
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success('Skopiowano do schowka');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Nie udało się skopiować');
    }
  };

  const isRyczalt = taxSettings.taxForm === 'lump_sum';
  const formLabel = isRyczalt ? 'Ryczałt' : taxSettings.taxForm === 'general' ? 'Skala podatkowa' : 'Dział. nierejestrowana';

  const handleDownloadCSV = () => {
    generateAccountingReportCSV(year, selectedMonth, rentals, taxSettings, hostProfile);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

      {/* ── Nagłówek z selektorem miesiąca ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Podsumowanie Podatkowe</h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{formLabel} · {year}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer"
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm"
            title="Pobierz plik CSV dla biura rachunkowego"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Raport Księgowy</span>
          </button>
        </div>
      </div>

      {/* ── Podsumowanie przychodów/kosztów ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Przychód brutto" value={tax.monthlyGrossIncome} color="emerald" />
        <MiniStat label="Przychód netto" value={tax.monthlyNetIncome} color="blue" />
        <MiniStat label="Prowizje portali" value={tax.monthlyCommissions} color="rose" />
        <MiniStat label="Koszty ekspl." value={tax.monthlyExpenses} color="amber" />
      </div>

      {/* ── Karty podatkowe ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* KARTA: Podatek dochodowy */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Podatek Dochodowy</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{formLabel}</p>
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {tax.incomeTax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span className="text-sm font-bold">zł</span>
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Tytuł przelewu */}
            <CopyableField
              label="Tytuł przelewu"
              value={tax.incomeTaxTitle}
              fieldName="incomeTaxTitle"
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />

            {/* Mikrorachunek */}
            {tax.microAccount ? (
              tax.microAccount.startsWith('BŁĄD') ? (
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{tax.microAccount}</span>
                </div>
              ) : (
                <CopyableField
                  label="Nr Mikrorachunku Podatkowego"
                  value={formatAccountNumber(tax.microAccount)}
                  rawValue={tax.microAccount}
                  fieldName="microAccount"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">Uzupełnij NIP lub PESEL w ustawieniach, aby wygenerować mikrorachunek.</span>
              </div>
            )}
          </div>
        </div>

        {/* KARTA: VAT-UE (Import usług) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-500/5 dark:to-fuchsia-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">VAT-UE (Import Usług)</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">23% od prowizji portali</p>
                </div>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {tax.vatUE.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span className="text-sm font-bold">zł</span>
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Tytuł przelewu VAT */}
            <CopyableField
              label="Tytuł przelewu"
              value={tax.vatUETitle}
              fieldName="vatUETitle"
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />

            {/* Mikrorachunek (ten sam co dla PIT) */}
            {tax.microAccount ? (
              tax.microAccount.startsWith('BŁĄD') ? (
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{tax.microAccount}</span>
                </div>
              ) : (
                <CopyableField
                  label="Nr Mikrorachunku Podatkowego"
                  value={formatAccountNumber(tax.microAccount)}
                  rawValue={tax.microAccount}
                  fieldName="microAccountVat"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">Uzupełnij NIP lub PESEL w ustawieniach.</span>
              </div>
            )}

            {/* Szczegóły prowizji */}
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-medium">
              Suma prowizji w {monthNames[selectedMonth]}: <span className="font-extrabold text-slate-700 dark:text-slate-300">{tax.monthlyCommissions.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span> × 23% = <span className="font-extrabold text-purple-600 dark:text-purple-400">{tax.vatUE.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pasek progu 100k (tylko dla ryczałtu) ── */}
      {isRyczalt && taxSettings.autoThreshold && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Próg Ryczałtu 100 000 zł</h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                  Przychód narastająco w {year}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {tax.ytdGrossIncome.toLocaleString('pl-PL')} <span className="text-xs font-bold text-slate-400">zł</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                {tax.thresholdProgress < 100
                  ? `Brakuje ${tax.thresholdRemaining.toLocaleString('pl-PL')} zł`
                  : 'Próg przekroczony!'}
              </p>
            </div>
          </div>

          {/* Pasek postępu */}
          <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                tax.thresholdProgress >= 100
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : tax.thresholdProgress >= 80
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, tax.thresholdProgress)}%` }}
            />
            {/* Znacznik progu */}
            <div className="absolute inset-y-0 left-full -translate-x-px w-0.5 bg-slate-300 dark:bg-slate-500" style={{ left: '100%' }} />
          </div>

          <div className="flex justify-between mt-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span>0 zł · stawka 8.5%</span>
            <span>100 000 zł · stawka 12.5%</span>
          </div>

          {tax.thresholdProgress >= 100 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Przychód w {year} roku przekroczył próg 100 000 zł. Nadwyżka opodatkowana jest stawką 12.5%.
            </div>
          )}
        </div>
      )}

      {/* ── Łączne zobowiązanie ── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 shadow-2xl shadow-slate-900/20 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Łączne zobowiązanie w {monthNames[selectedMonth]}</p>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {(tax.incomeTax + tax.vatUE).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span className="text-lg font-bold text-slate-400">zł</span>
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PIT</p>
              <p className="font-extrabold text-blue-400">{tax.incomeTax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">VAT-UE</p>
              <p className="font-extrabold text-purple-400">{tax.vatUE.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// KOMPONENTY POMOCNICZE
// ═══════════════════════════════════════════════════════════════════════════

/** Mini-kafelek statystyczny */
function MiniStat({ label, value, color }) {
  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    blue:    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    rose:    'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
    amber:   'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  };

  return (
    <div className={`p-3.5 rounded-2xl border ${colorMap[color]} transition-colors`}>
      <p className="text-[9px] font-extrabold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-base font-black">{value.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span className="text-[10px] font-bold opacity-60">zł</span></p>
    </div>
  );
}

/** Pole z wartością i przyciskiem kopiowania */
function CopyableField({ label, value, rawValue, fieldName, copiedField, onCopy }) {
  const isCopied = copiedField === fieldName;

  return (
    <div>
      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-200 select-all truncate">
          {value}
        </div>
        <button
          onClick={() => onCopy(rawValue || value, fieldName)}
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            isCopied
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 dark:hover:border-blue-500/50'
          }`}
          title="Kopiuj"
        >
          {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/** Formatuj numer rachunku do czytelnej formy: XX XXXX XXXX XXXX XXXX XXXX XXXX */
function formatAccountNumber(raw) {
  if (!raw || raw.length < 26) return raw || '';
  return raw.replace(/(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6 $7');
}
