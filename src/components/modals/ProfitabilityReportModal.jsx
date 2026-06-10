import React from 'react';
import { BarChart3, CalendarDays, XCircle } from 'lucide-react';
import { monthNames } from '../../utils/constants';

const ProfitabilityReportModal = ({
  showStatsModal,
  setShowStatsModal,
  selectedYear,
  handleYearChange,
  availableYears,
  currentYearData
}) => {
  if (!showStatsModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] border border-white/50 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-[2rem] shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Raport Rentowności</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Zestawienie przychodów i kosztów</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedYear} 
              onChange={(e) => handleYearChange(e.target.value)} 
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
              {availableYears.map(year => <option key={year} value={year}>Rok {year}</option>)}
            </select>
            <button 
              onClick={() => setShowStatsModal(false)} 
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-emerald-50/50 dark:bg-emerald-500/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
              <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Przychód</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{currentYearData.total.income.toLocaleString('pl-PL')} zł</p>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-500/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20">
              <p className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Koszty</p>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-300">{currentYearData.total.costs.toLocaleString('pl-PL')} zł</p>
            </div>
            <div className="bg-violet-50/50 dark:bg-violet-500/10 p-5 rounded-3xl border border-violet-100 dark:border-violet-500/20">
              <p className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">Podatek</p>
              <p className="text-2xl font-black text-violet-700 dark:text-violet-300">{currentYearData.total.tax.toLocaleString('pl-PL')} zł</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-500/30">
              <p className="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest mb-1">Zysk Netto</p>
              <p className="text-2xl font-black text-white">{currentYearData.total.profit.toLocaleString('pl-PL')} zł</p>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500" /> Miesiąc po miesiącu
          </h3>
          <div className="border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-extrabold">Miesiąc</th>
                  <th className="p-4 font-extrabold text-right">Przychód</th>
                  <th className="p-4 font-extrabold text-right">Koszty</th>
                  <th className="p-4 font-extrabold text-right">Podatek</th>
                  <th className="p-4 font-extrabold text-right text-blue-600 dark:text-blue-400">Zysk Netto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {currentYearData.months.map((m, i) => (
                  <tr key={i} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${!m.active ? 'opacity-40 bg-slate-50/30 dark:bg-slate-900/30' : ''}`}>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{monthNames[i]}</td>
                    <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{m.income > 0 ? `${m.income.toLocaleString('pl-PL')} zł` : '-'}</td>
                    <td className="p-4 text-right font-bold text-rose-500 dark:text-rose-400">{m.costs > 0 ? `${m.costs.toLocaleString('pl-PL')} zł` : '-'}</td>
                    <td className="p-4 text-right font-bold text-violet-600 dark:text-violet-400">{m.tax > 0 ? `${m.tax.toLocaleString('pl-PL')} zł` : '-'}</td>
                    <td className="p-4 text-right font-black text-slate-900 dark:text-white text-base">{m.profit !== 0 ? `${m.profit.toLocaleString('pl-PL')} zł` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfitabilityReportModal);
