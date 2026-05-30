import React from 'react';
import { Lock, Clock, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Ekran blokady dostępu (paywall).
 * Wyświetlany gdy trial wygasł, subskrypcja jest anulowana lub zaległa.
 */
export default function PaywallScreen({ 
  accountStatus, 
  scheduledDeletionAt, 
  onSubscribe, 
  isCheckoutLoading, 
  onManageSubscription, 
  isBillingPortalLoading, 
  onLogout 
}) {
  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const diffTime = targetDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = scheduledDeletionAt ? getDaysRemaining(scheduledDeletionAt) : 0;

  let paywallTitle = "Koniec okresu próbnego";
  let paywallDesc = "Twój darmowy 14-dniowy dostęp do WynajemPro dobiegł końca. Odblokuj pełen panel zarządzania rezerwacjami, integracje z kalendarzami i automatyczne raporty księgowe.";
  let lockIcon = <Lock className="w-10 h-10" />;
  let showBanner = false;

  if (accountStatus === 'canceled') {
    paywallTitle = "Subskrypcja wygasła";
    paywallDesc = "Dostęp do panelu WynajemPro został zablokowany, ponieważ Twoja subskrypcja wygasła. Twoje dane biznesowe zostały zamrożone i są bezpieczne.";
    lockIcon = <Clock className="w-10 h-10" />;
    showBanner = true;
  } else if (accountStatus === 'past_due') {
    paywallTitle = "Zaległa płatność";
    paywallDesc = "Nie mogliśmy automatycznie odnowić Twojej subskrypcji. Prawdopodobnie wystąpił problem z Twoją kartą płatniczą. Zaktualizuj dane płatności w bezpiecznym panelu Stripe, aby natychmiast przywrócić dostęp.";
    lockIcon = <AlertTriangle className="w-10 h-10 text-amber-500" />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 text-center border border-slate-100 dark:border-slate-700 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30">
          {lockIcon}
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{paywallTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          {paywallDesc}
        </p>

        {showBanner && scheduledDeletionAt && (
          <div className="mb-8 p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col items-center gap-3 text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Planowana kasacja danych</span>
            </div>
            <p className="text-xs text-center leading-relaxed">
              Wszystkie Twoje rezerwacje, ustawienia i klienci zostaną trwale i bezpowrotnie usunięci dnia <strong>{scheduledDeletionAt.toLocaleDateString('pl-PL')}</strong>.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-bold mt-1 text-amber-900 dark:text-amber-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Pozostało: {daysRemaining} {daysRemaining === 1 ? 'dzień' : 'dni'}</span>
            </div>
          </div>
        )}

        {accountStatus === 'past_due' && (
          <div className="mb-8 p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col items-center gap-2 text-rose-800 dark:text-rose-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Zaległość w płatności</span>
            </div>
            <p className="text-xs text-center leading-relaxed">
              Twoja karta odrzuciła płatność za kolejny cykl rozliczeniowy. Zaktualizuj kartę w panelu Stripe, aby odzyskać pełen dostęp.
            </p>
          </div>
        )}
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 mb-8">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Plan Gospodarza</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">29.99 <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">zł / msc</span></p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onSubscribe} 
            disabled={isCheckoutLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCheckoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aktywuj subskrypcję i odzyskaj dane'}
          </button>

          {(accountStatus === 'canceled' || accountStatus === 'past_due') && (
            <button 
              onClick={onManageSubscription} 
              disabled={isBillingPortalLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-6 rounded-2xl transition-all"
            >
              {isBillingPortalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Otwórz panel zarządzania</>}
            </button>
          )}
        </div>
        
        <button 
          onClick={onLogout} 
          className="mt-6 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
