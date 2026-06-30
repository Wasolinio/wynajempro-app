import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { propColors } from '../utils/constants';

/**
 * CalendarView — komponent siatki kalendarzowej z wizualizacją rezerwacji.
 * Wydzielony z ManagerApp.jsx (dawniej useMemo `calendarView`).
 * React.memo zapobiega zbędnym renderom — rerender tylko przy zmianie props.
 */
const CalendarView = ({ calendarDate, rentals, properties, onChangeMonth, onSetToday, onEditRental }) => {
  // Obliczenia pomocnicze dla siatki miesiąca
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      {/* Nagłówek kalendarza — nawigacja miesiącami */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 capitalize tracking-wide">{calendarDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
        <div className="flex gap-2">
          <button onClick={() => onChangeMonth(-1)} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={onSetToday} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm">Dzisiaj</button>
          <button onClick={() => onChangeMonth(1)} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Siatka dni miesiąca */}
      <div className="p-5 overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px] border-t border-l border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          {/* Nagłówki dni tygodnia */}
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(d => <div key={d} className="bg-slate-50/80 dark:bg-slate-800/80 p-3 text-center text-[11px] font-extrabold text-slate-500 dark:text-slate-400 border-r border-b border-slate-100 dark:border-slate-700 uppercase tracking-widest">{d}</div>)}

          {/* Puste komórki przed pierwszym dniem miesiąca */}
          {blanks.map((_, i) => <div key={`b-${i}`} className="bg-slate-50/30 dark:bg-slate-900/30 border-r border-b border-slate-100 dark:border-slate-700 min-h-[140px]"></div>)}

          {/* Komórki poszczególnych dni */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayStart = new Date(year, month, i + 1).setHours(0,0,0,0);
            const isToday = new Date().setHours(0,0,0,0) === dayStart;
            const dayRentals = rentals.filter(r => r.type === 'booking' && r.date && r.endDate && dayStart >= new Date(r.date).setHours(0,0,0,0) && dayStart <= new Date(r.endDate).setHours(0,0,0,0));

            return (
              <div key={i} className={`bg-white dark:bg-slate-800 min-h-[140px] p-2.5 flex flex-col gap-1.5 border-r border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${isToday ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''}`}>
                <span className={`text-xs font-extrabold self-end mb-1 ${isToday ? 'bg-blue-600 dark:bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30' : 'text-slate-400 dark:text-slate-500'}`}>{i + 1}</span>
                <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
                  {dayRentals.map(r => {
                    const col = propColors[properties.find(p => p.name === r.property)?.color || 'slate'];
                    const isStart = dayStart === new Date(r.date).setHours(0,0,0,0);
                    const isEnd = dayStart === new Date(r.endDate).setHours(0,0,0,0);
                    const timeLabel = (isStart && isEnd) ? '(1 d.)' : isStart ? '↘ Przyj.' : isEnd ? '↖ Wyj.' : '';
                    return (
                      <div key={r.id} onClick={() => onEditRental(r)} className={`text-[10px] px-2 py-1.5 rounded-lg cursor-pointer leading-tight transition-all hover:opacity-80 hover:scale-[1.02] ${r.isPaid ? col.solid : r.isAdvancePaid ? col.advance : col.dashed}`}>
                        <span className="font-extrabold truncate block">{r.property}</span>
                        <div className="flex justify-between items-center gap-1 mt-1">
                          <span className="truncate font-medium opacity-90">{r.guest}</span>
                          {timeLabel && <span className="bg-black/15 dark:bg-black/30 px-1.5 py-0.5 rounded-md font-bold">{timeLabel}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarView);
