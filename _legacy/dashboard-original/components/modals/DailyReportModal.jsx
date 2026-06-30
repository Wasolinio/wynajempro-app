import React from 'react';
import { Sun, XCircle, LogIn, LogOut, CheckSquare, Building, CheckCircle } from 'lucide-react';

const DailyReportModal = ({
  showDailyReportModal,
  setShowDailyReportModal,
  dailyReport,
  completeTask
}) => {
  if (!showDailyReportModal || !dailyReport) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 dark:border-slate-800 relative">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex gap-5 items-center">
            <div className="p-4 bg-white dark:bg-slate-800 shadow-xl shadow-indigo-500/20 dark:shadow-none rounded-2xl border border-slate-100 dark:border-slate-700">
              <Sun className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Raport Dnia</h2>
              <p className="text-sm font-semibold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-widest">{dailyReport.dateStr}</p>
            </div>
          </div>
          <button onClick={() => setShowDailyReportModal(false)} className="relative z-10 p-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 space-y-8 relative">
          
          {/* Przyjazdy */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-xl"><LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Przyjazdy ({dailyReport.arrivals.length})</h3>
            </div>
            {dailyReport.arrivals.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center text-slate-500 dark:text-slate-400 font-medium">Dzisiaj nikt nie przyjeżdża.</div>
            ) : (
              <div className="space-y-3">
                {dailyReport.arrivals.map(r => (
                  <div key={r.id} className="group bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-12 bg-emerald-400 dark:bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{r.guest}</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
                          <Building className="w-4 h-4" /> {r.propNameStr}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6 sm:pl-0">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${r.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'}`}>{r.isPaid ? 'Opłacone' : 'Do opłacenia'}</span>
                      {Number(r.advancePayment) > 0 && !r.isPaid && <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${r.isAdvancePaid ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{r.isAdvancePaid ? 'Zaliczka' : 'Brak zaliczki'}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Wyjazdy */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-rose-100 dark:bg-rose-500/20 p-2 rounded-xl"><LogOut className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Wyjazdy ({dailyReport.departures.length})</h3>
            </div>
            {dailyReport.departures.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center text-slate-500 dark:text-slate-400 font-medium">Brak wyjazdów na dzisiaj.</div>
            ) : (
              <div className="space-y-3">
                {dailyReport.departures.map(r => (
                  <div key={r.id} className="group bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-500/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-12 bg-rose-400 dark:bg-rose-500 rounded-full"></div>
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-lg group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{r.guest}</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
                          <Building className="w-4 h-4" /> {r.propNameStr}
                        </div>
                      </div>
                    </div>
                    <span className="ml-6 sm:ml-0 text-[11px] font-extrabold px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 tracking-wide">🧹 Sprzątanie</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Zadania na dziś */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl"><CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Zadania ({dailyReport.tasks.length})</h3>
            </div>
            {dailyReport.tasks.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center bg-white/50 dark:bg-slate-800/50">
                 <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Wszystko gotowe! Możesz odpocząć. ☕</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyReport.tasks.map(t => (
                  <div key={`${t.id}-${t.taskId}`} className="group bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
                        {t.icon}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{t.text}</p>
                        <p className="text-[13px] font-medium text-slate-500 mt-1 truncate max-w-[200px] sm:max-w-xs">{t.property} {t.guest ? `• ${t.guest}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => completeTask(t.id, t.taskId)} className="flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-white hover:bg-emerald-500 dark:hover:bg-emerald-500 p-3.5 rounded-2xl transition-all shadow-sm border border-transparent hover:shadow-emerald-500/30" title="Oznacz jako wykonane"><CheckCircle className="w-6 h-6" /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default React.memo(DailyReportModal);
