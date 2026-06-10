import React from 'react';
import LegalLayout from './LegalLayout';
import { Mail, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <LegalLayout 
      title="Kontakt"
      subtitle="Chętnie pomożemy rozwiać Twoje wątpliwości"
    >
      <div className="flex flex-col md:flex-row gap-10 items-start">
        
        {/* Lewa kolumna: Informacje kontaktowe */}
        <div className="flex-1 space-y-6">
          <p className="text-lg text-slate-600 mb-4">
            Masz pytania dotyczące subskrypcji, zgłoszenie techniczne lub chcesz usunąć swoje konto wraz z danymi? Napisz do nas bezpośrednio na poniższy adres e-mail.
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
              Staramy się odpowiadać na wszystkie zgłoszenia w przeciągu 24 do 48 godzin roboczych.
            </p>
          </div>
        </div>

        {/* Prawa kolumna: FAQ / Hints */}
        <div className="flex-1 w-full bg-slate-800 text-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-400" /> Szybkie pytania
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-blue-300 mb-1">Gdzie mogę pobrać FV za subskrypcję?</h4>
              <p className="text-sm text-slate-300">
                Faktury VAT oraz zarządzanie subskrypcją znajduje się w "Ustawieniach konta" (ikona zębatki w panelu) pod przyciskiem zarządzania Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-blue-300 mb-1">Chcę całkowicie usunąć dane.</h4>
              <p className="text-sm text-slate-300">
                W panelu Ustawień znajduje się czerwony przycisk "Usuń trwale konto". Pamiętaj, że jest to operacja w 100% nieodwracalna. Możesz również napisać do nas na e-mail z żądaniem usunięcia (wymagane wysłanie ze skrzynki konta).
              </p>
            </div>
          </div>
        </div>

      </div>
    </LegalLayout>
  );
}
