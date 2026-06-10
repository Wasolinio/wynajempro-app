import React from 'react';
import { Phone, Mail, MessageSquare, CalendarDays, ArrowDown, ArrowUp, CheckCircle, Edit, Trash2 } from 'lucide-react';

const DesktopBookingsTable = ({
  paginatedBookings,
  propColors,
  properties,
  bookingSortOrder,
  changeBookingSortOrder,
  taxSettings,
  toggleStatus,
  templates,
  toggleDynamicTask,
  openEditModal,
  handleDeleteClick
}) => {
  return (
    <div className="hidden md:block">
      <table className="w-full text-left min-w-[1100px]">
        <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th className="p-5 font-extrabold">Domek / Gość</th>
            <th className="p-5 font-extrabold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => changeBookingSortOrder(prev => prev === 'upcoming' ? 'desc' : prev === 'desc' ? 'asc' : 'upcoming')}>
               <div className="flex items-center gap-1">Termin {bookingSortOrder === 'upcoming' ? <CalendarDays className="w-3.5 h-3.5 text-blue-500"/> : bookingSortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5"/> : <ArrowUp className="w-3.5 h-3.5"/>}</div>
            </th>
            <th className="p-5 text-right font-extrabold">Przychód</th>
            <th className="p-5 text-right font-extrabold">Prowizja</th>
            {taxSettings.isVatPayer && <th className="p-5 text-right font-extrabold">VAT</th>}
            <th className="p-5 text-right font-extrabold">Podatek</th>
            <th className="p-5 text-right text-blue-600 dark:text-blue-400 font-extrabold">Zysk Netto</th>
            <th className="p-5 font-extrabold">Zadania</th>
            <th className="p-5 text-center font-extrabold">Status</th>
            <th className="p-5 text-center font-extrabold">Akcje</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {paginatedBookings.map(r => {
            const propColor = propColors[properties.find(p => p.name === r.property)?.color || 'slate'];
            return (
              <tr key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors group">
                <td className="p-5">
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${propColor?.bg}`}></div> 
                     {r.property}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-4 mt-1.5 flex items-center gap-2">
                     {r.guest} 
                     <span className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm px-1.5 py-0.5 rounded-md text-[10px] text-slate-500 dark:text-slate-300 font-bold">{r.source}</span>
                  </div>
                  {(r.email || r.phone) && (
                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 ml-4 flex flex-col gap-0.5">
                      {r.phone && <a href={`tel:${r.phone.replace(/\\s+/g, '')}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit flex items-center gap-1"><Phone className="w-3 h-3"/> {r.phone}</a>}
                      {r.email && <a href={`mailto:${r.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit flex items-center gap-1"><Mail className="w-3 h-3"/> {r.email}</a>}
                    </div>
                  )}
                  {r.guestNote && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 ml-4 p-2 bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-lg border border-amber-100/60 dark:border-amber-500/20 w-max max-w-xs font-medium shadow-sm flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{r.guestNote}</span>
                    </div>
                  )}
                </td>
                <td className="p-5 text-sm font-bold text-slate-700 dark:text-slate-300">{r.date} <br/><span className="text-xs font-medium text-slate-400 dark:text-slate-500">do {r.endDate}</span></td>
                <td className="p-5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{Number(r.income).toLocaleString('pl-PL')} zł {Number(r.advancePayment)>0 && <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 bg-indigo-50 dark:bg-indigo-500/10 inline-block px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20">zal. {Number(r.advancePayment).toLocaleString('pl-PL')} zł</div>}</td>
                <td className="p-5 text-right font-bold text-rose-500 dark:text-rose-400">{Number(r.commission).toLocaleString('pl-PL')} zł</td>
                {taxSettings.isVatPayer && <td className="p-5 text-right font-bold text-pink-500 dark:text-pink-400">{Number(r.vat).toLocaleString('pl-PL')} zł</td>}
                <td className="p-5 text-right font-bold text-violet-600 dark:text-violet-400">{Number(r.tax).toLocaleString('pl-PL')} zł</td>
                <td className="p-5 text-right font-black text-slate-900 dark:text-white text-base">{(Number(r.income) - Number(r.commission) - Number(r.tax) - Number(r.vat || 0)).toLocaleString('pl-PL')} zł</td>
                <td className="p-5">
                  <div className="flex flex-col gap-2.5 w-max">
                    {templates.map(t => {
                      const isCompleted = r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent);
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer group/task">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover/task:border-blue-400 dark:group-hover/task:border-blue-500'}`}>
                            {isCompleted && <CheckCircle className="w-3 h-3" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={isCompleted || false} onChange={() => toggleDynamicTask(r.id, t.id, isCompleted)} />
                          <span className={`text-[11px] font-bold transition-colors ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover/task:text-slate-800 dark:group-hover/task:text-slate-200'}`}>{t.shortName}</span>
                        </label>
                      );
                    })}
                  </div>
                </td>
                <td className="p-5 text-center flex flex-col gap-2 items-center justify-center">
                  <button onClick={() => toggleStatus(r.id, 'isPaid')} className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all shadow-sm w-full max-w-[100px] ${r.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}>Opłacone {r.isPaid ? '✔' : ''}</button>
                  {Number(r.advancePayment) > 0 && (
                     <button onClick={() => toggleStatus(r.id, 'isAdvancePaid')} className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all shadow-sm w-full max-w-[100px] ${r.isAdvancePaid ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}>Zaliczka {r.isAdvancePaid ? '✔' : ''}</button>
                  )}
                </td>
                <td className="p-5 text-center">
                   <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-xl transition-all shadow-sm"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(DesktopBookingsTable);
