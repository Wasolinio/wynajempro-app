import React from 'react';
import { Phone, Mail, MessageSquare, CalendarDays, Globe, DollarSign, TrendingUp, CheckCircle, Edit, Trash2 } from 'lucide-react';

const MobileBookingsList = ({
  paginatedBookings,
  propColors,
  properties,
  toggleStatus,
  templates,
  toggleDynamicTask,
  openEditModal,
  handleDeleteClick
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:hidden mb-2">
      {paginatedBookings.map(r => {
        const propColor = propColors[properties.find(p => p.name === r.property)?.color || 'slate'];
        const netProfit = Number(r.income) - Number(r.commission) - Number(r.tax) - Number(r.vat || 0);
        
        return (
          <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3 relative transition-colors">
            
            {/* Nagłówek: Gość + Badge Płatności */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${propColor?.bg}`}></div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm truncate">{r.property}</span>
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-[18px]">{r.guest}</p>
                {(r.email || r.phone) && (
                  <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5 ml-[18px] flex flex-col gap-0.5">
                    {r.phone && <a href={`tel:${r.phone.replace(/\\s+/g, '')}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit flex items-center gap-1"><Phone className="w-3 h-3"/> {r.phone}</a>}
                    {r.email && <a href={`mailto:${r.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit flex items-center gap-1"><Mail className="w-3 h-3"/> {r.email}</a>}
                  </div>
                )}
              </div>
              <button onClick={() => toggleStatus(r.id, 'isPaid')} className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${r.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'}`}>
                {r.isPaid ? '✔ Opłacone' : 'Nieopłacone'}
              </button>
            </div>

            {/* Notatka gościa */}
            {r.guestNote && (
              <div className="text-xs text-amber-700 dark:text-amber-400 p-2.5 bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-xl border border-amber-100/60 dark:border-amber-500/20 font-medium flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{r.guestNote}</span>
              </div>
            )}

            {/* Siatka danych */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm bg-slate-50/80 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100/80 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{r.date}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">do {r.endDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{r.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">{Number(r.income).toLocaleString('pl-PL')} zł</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="font-black text-slate-900 dark:text-white text-xs">{netProfit.toLocaleString('pl-PL')} zł</span>
              </div>
              {Number(r.advancePayment) > 0 && (
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20">
                    Zaliczka: {Number(r.advancePayment).toLocaleString('pl-PL')} zł
                  </span>
                  <button onClick={() => toggleStatus(r.id, 'isAdvancePaid')} className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${r.isAdvancePaid ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'}`}>
                    {r.isAdvancePaid ? '✔ Wpłacona' : 'Oczekuje'}
                  </button>
                </div>
              )}
            </div>

            {/* Zadania (checkboxy) */}
            {templates.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
                {templates.map(t => {
                  const isCompleted = r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent);
                  return (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer group/task">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover/task:border-blue-400 dark:group-hover/task:border-blue-500'}`}>
                        {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={isCompleted || false} onChange={() => toggleDynamicTask(r.id, t.id, isCompleted)} />
                      <span className={`text-xs font-bold transition-colors ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover/task:text-slate-800 dark:group-hover/task:text-slate-200'}`}>{t.shortName}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Akcje (Stopka karty) */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex gap-2">
              <button onClick={() => openEditModal(r)} className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl transition-all border border-blue-100 dark:border-blue-500/20">
                <Edit className="w-4 h-4" /> Edytuj
              </button>
              <button onClick={() => handleDeleteClick(r.id)} className="flex items-center justify-center gap-2 min-h-[44px] px-4 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 font-bold text-sm rounded-xl transition-all border border-rose-100 dark:border-rose-500/20">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(MobileBookingsList);
