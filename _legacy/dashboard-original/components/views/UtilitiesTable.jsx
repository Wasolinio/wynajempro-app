import React from 'react';
import { ArrowDown, ArrowUp, Edit, Trash2 } from 'lucide-react';

const UtilitiesTable = ({
  paginatedUtilities,
  utilitySortOrder,
  changeUtilitySortOrder,
  openEditModal,
  handleDeleteClick
}) => {
  return (
    <table className="w-full text-left min-w-[600px]">
      <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
        <tr>
          <th className="p-5 font-extrabold">Opis Kosztu</th>
          <th 
            className="p-5 font-extrabold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
            onClick={() => changeUtilitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
             <div className="flex items-center gap-1">
               Data {utilitySortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5"/> : <ArrowUp className="w-3.5 h-3.5"/>}
             </div>
          </th>
          <th className="p-5 text-right font-extrabold">Kwota</th>
          <th className="p-5 text-center font-extrabold">Akcje</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
        {paginatedUtilities.map(r => (
          <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
            <td className="p-5">
              <span className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-lg mr-3 shadow-sm">{r.category}</span> 
              <span className="font-bold text-slate-800 dark:text-slate-200">{r.guest}</span> 
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5">{r.property}</div>
            </td>
            <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-300">{r.date}</td>
            <td className="p-5 text-right font-extrabold text-red-500 dark:text-rose-400">{Number(r.utilities).toLocaleString('pl-PL')} zł</td>
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

export default React.memo(UtilitiesTable);
