import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Modal potwierdzenia usunięcia wpisu.
 * @param {{ onCancel: Function, onConfirm: Function }} props
 */
export default function DeleteConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center border border-white/50 dark:border-slate-700">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 className="w-10 h-10" /></div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Usuwanie wpisu</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">Czy na pewno chcesz bezpowrotnie usunąć ten wpis z bazy danych? Tej akcji nie da się cofnąć.</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 hover:bg-rose-700 transition-colors">Tak, usuń</button>
        </div>
      </div>
    </div>
  );
}
