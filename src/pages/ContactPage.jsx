import React, { useState } from 'react';
import LegalLayout from './LegalLayout';
import { Mail, ShieldCheck, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) return;
    setIsSubmitted(true);
    toast.success('Wiadomość została wysłana!');
    setEmail('');
    setMessage('');
  };

  return (
    <LegalLayout 
      title="Kontakt"
      subtitle="Chętnie pomożemy rozwiać Twoje wątpliwości"
    >
      <div className="flex flex-col md:flex-row gap-10 items-start">
        
        {/* Lewa kolumna: Informacje kontaktowe */}
        <div className="flex-1 space-y-6">
          <p className="text-lg text-slate-600 mb-4">
            Masz pytania dotyczące subskrypcji, zgłoszenie techniczne lub chcesz usunąć swoje konto wraz z danymi? Napisz do nas bezpośrednio na poniższy adres e-mail lub skorzystaj z formularza.
          </p>
          
          <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">E-mail Kontaktowy</p>
              <a href="mailto:kontakt@wynajempro.pl" className="text-xl font-black text-slate-800 hover:text-blue-600 transition-colors">
                kontakt@wynajempro.pl
              </a>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Czas odpowiedzi
            </h3>
            <p className="text-slate-500 text-sm">
              Staramy się odpowiadać na wszystkie zgłoszenia w ciągu 24 do 48 godzin roboczych.
            </p>
          </div>
        </div>

        {/* Prawa kolumna: Formularz kontaktowy */}
        <div className="flex-1 w-full bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" /> Formularz kontaktowy
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Adres e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Treść wiadomości
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="W czym możemy pomóc?"
                rows="4"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Wyślij wiadomość
            </button>
          </form>
          {isSubmitted && (
            <p className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center animate-pulse">
              Wiadomość została wysłana!
            </p>
          )}
        </div>

      </div>
    </LegalLayout>
  );
}
