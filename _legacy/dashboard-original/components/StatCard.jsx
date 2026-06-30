import React from 'react';

const STAT_STYLES = {
  green: { bg: "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-500/30", text: "text-emerald-900 dark:text-emerald-100" },
  red: { bg: "bg-rose-50/50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20", iconBg: "bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-500/30", text: "text-rose-900 dark:text-rose-100" },
  purple: { bg: "bg-violet-50/50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20", iconBg: "bg-gradient-to-br from-violet-400 to-violet-500 shadow-violet-500/30", text: "text-violet-900 dark:text-violet-100" },
  blue: { bg: "bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30", text: "text-blue-900 dark:text-blue-100" },
};

/**
 * Karta statystyk (przychody, koszty, podatek, zysk).
 */
export default function StatCard({ icon, label, value, color, sub, onClick }) {
  const style = STAT_STYLES[color];
  return (
    <div onClick={onClick} className={`p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border bg-white dark:bg-slate-800 border-slate-100/60 dark:border-slate-700 group`}>
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl text-white shadow-lg ${style.iconBg} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold mb-1 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{Number(value).toLocaleString('pl-PL')} <span className="text-lg text-slate-400 dark:text-slate-500 font-bold">zł</span></p>
          {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
