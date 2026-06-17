import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LegalLayout({ title, subtitle, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do strony głównej
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
              Zarejestruj się
            </Link>
            <div className="flex items-center gap-2 font-black text-slate-800 text-lg tracking-tight">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Wynajem<span className="text-blue-600">PRO</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-slate-500 mb-2">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="text-sm font-medium text-slate-400">
              Ostatnia aktualizacja: {lastUpdated}
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-6">
          © {new Date().getFullYear()} WynajemPRO. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
