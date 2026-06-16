import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieBanner({ onAccept }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie_consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
    if (onAccept) onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Dekoracyjne tło */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hidden sm:block shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 flex items-center gap-2">
              Szanujemy Twoją prywatność <span className="sm:hidden text-blue-500"><Cookie className="w-5 h-5"/></span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
              Używamy plików cookies, aby zapewnić Ci najlepsze doświadczenia, analizować ruch na stronie oraz dostosowywać komunikaty marketingowe. Klikając „Akceptuję”, wyrażasz zgodę na używanie cookies (w tym Google Analytics). Więcej informacji znajdziesz w naszej <Link to="/prywatnosc" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Polityce Prywatności</Link>.
            </p>
          </div>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3 shrink-0 relative z-10">
          <button 
            onClick={handleAccept}
            className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Akceptuję
          </button>
        </div>
        
        {/* Minimalistyczny X do zamknięcia (opcjonalny, zamyka ale nie wyraża zgody) */}
        <button 
          onClick={() => setIsVisible(false)} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
