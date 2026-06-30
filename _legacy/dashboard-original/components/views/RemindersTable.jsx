import React from 'react';
import { ArrowDown, ArrowUp, Edit, Trash2, Bell } from 'lucide-react';

const RemindersTable = ({
  paginatedReminders,
  utilitySortOrder,
  changeUtilitySortOrder,
  toggleStatus,
  openEditModal,
  handleDeleteClick
}) => {
  return (
    <table className="w-full text-left min-w-[600px]">
      <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
        <tr>
          <th className="p-5 font-extrabold">Zadanie</th>
          <th 
            className="p-5 font-extrabold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center" 
            onClick={() => changeUtilitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
             <div className="flex items-center justify-center gap-1">
               Termin {utilitySortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5"/> : <ArrowUp className="w-3.5 h-3.5"/>}
             </div>
          </th>
          <th className="p-5 text-center font-extrabold">Status</th>
          <th className="p-5 text-center font-extrabold">Akcje</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
        {paginatedReminders.map(r => (
          <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
            <td className="p-5 font-extrabold text-slate-800 dark:text-slate-200">
              <Bell className="inline w-4 h-4 text-amber-500 mr-2"/> {r.text}
            </td>
            <td className="p-5 text-center text-sm font-medium text-slate-600 dark:text-slate-300">{r.date}</td>
            <td className="p-5 text-center">
              <button 
                onClick={() => toggleStatus(r.id, 'isCompleted')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${r.isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'}`}
              >
                {r.isCompleted ? '✔ Wykonane' : 'Oczekuje'}
              </button>
            </td>
            <td className="p-5 text-center">
              <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteClick(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default React.memo(RemindersTable);
