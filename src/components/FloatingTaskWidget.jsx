import React, { useState } from 'react';
import { Bell, X, CalendarClock } from 'lucide-react';

export default function FloatingTaskWidget({ tasks = [] }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || tasks.length === 0) return null;

  // Sortujemy od najpilniejszych (najmniejsza wartość days)
  const sortedTasks = [...tasks].sort((a, b) => a.days - b.days);
  const mostUrgent = sortedTasks[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 dark:border-slate-700/50 p-5 min-w-[280px] max-w-sm">
        
        {/* Pulsing Dot */}
        <div className="absolute -top-1.5 -left-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-800"></span>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Ukryj"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 p-2.5 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Zadania na dziś</h3>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
              Oczekujące zadania: {tasks.length}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Najpilniejsze:</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2">
              {mostUrgent.text}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400">
              <CalendarClock className="w-3.5 h-3.5" />
              <span className="truncate">{mostUrgent.property} {mostUrgent.guest ? `(${mostUrgent.guest})` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
