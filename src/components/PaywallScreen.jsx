import React, { useState } from 'react';
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
  const [billingInterval, setBillingInterval] = useState('monthly');
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center p-3 sm:p-4 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 text-center border border-slate-100 dark:border-slate-700 relative z-10 max-h-[95vh] overflow-y-auto">
        <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-8 shadow-lg shadow-blue-500/30">
          {React.cloneElement(lockIcon, { className: 'w-6 h-6 md:w-10 md:h-10' })}
        </div>
        
        <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">{paywallTitle}</h2>
        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 font-medium mb-4 md:mb-8 leading-snug">
          {paywallDesc}
        </p>

        {showBanner && scheduledDeletionAt && (
          <div className="mb-4 md:mb-8 p-3 md:p-5 rounded-2xl md:rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col items-center gap-1.5 md:gap-3 text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold text-xs md:text-sm">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Planowana kasacja danych</span>
            </div>
            <p className="text-[10px] md:text-xs text-center leading-relaxed">
              Wszystkie Twoje rezerwacje, ustawienia i klienci zostaną trwale i bezpowrotnie usunięci dnia <strong>{scheduledDeletionAt.toLocaleDateString('pl-PL')}</strong>.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-[10px] md:text-xs font-bold mt-1 text-amber-900 dark:text-amber-200">
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>Pozostało: {daysRemaining} {daysRemaining === 1 ? 'dzień' : 'dni'}</span>
            </div>
          </div>
        )}

        {accountStatus === 'past_due' && (
          <div className="mb-4 md:mb-8 p-3 md:p-5 rounded-2xl md:rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col items-center gap-2 text-rose-800 dark:text-rose-300">
            <div className="flex items-center gap-2 font-bold text-xs md:text-sm">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Zaległość w płatności</span>
            </div>
            <p className="text-[10px] md:text-xs text-center leading-relaxed">
              Twoja karta odrzuciła płatność za kolejny cykl rozliczeniowy. Zaktualizuj kartę w panelu Stripe, aby odzyskać pełen dostęp.
            </p>
          </div>
        )}
        
        {/* Toggle okresu rozliczeniowego */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="bg-slate-100 dark:bg-slate-900 p-0.5 md:p-1 rounded-xl md:rounded-2xl flex gap-1">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all ${billingInterval === 'monthly' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Miesięcznie
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('yearly')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all ${billingInterval === 'yearly' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              Rocznie (Oszczędzasz 17%)
            </button>
          </div>
        </div>

        {/* Ceny pakietów */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 md:mb-8">
          <div className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${billingInterval === 'monthly' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-sm shadow-blue-100/50' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'}`}>
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-extrabold">Pakiet Miesięczny</p>
                {billingInterval === 'monthly' && <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">Wybór</span>}
              </div>
              <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">29.99 <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold">zł / msc</span></p>
              <p className="text-[9px] md:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Elastyczna subskrypcja.</p>
            </div>
            <button 
              onClick={() => onSubscribe('monthly')} 
              disabled={isCheckoutLoading}
              className="mt-3 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-xl shadow-md text-[11px] md:text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aktywuj subskrypcję i odzyskaj dane'}
            </button>
          </div>

          <div className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${billingInterval === 'yearly' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-sm shadow-blue-100/50' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'}`}>
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-extrabold">Pakiet Roczny</p>
                {billingInterval === 'yearly' && <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">Zalecany</span>}
              </div>
              {billingInterval === 'monthly' ? (
                <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">24.99 <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold">zł / msc</span></p>
              ) : (
                <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">299.90 <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold">zł / rok</span></p>
              )}
              <p className="text-[9px] md:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Dwa miesiące gratis.</p>
            </div>
            <button 
              onClick={() => onSubscribe('yearly')} 
              disabled={isCheckoutLoading}
              className="mt-3 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-xl shadow-md text-[11px] md:text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aktywuj subskrypcję i odzyskaj dane'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {(accountStatus === 'canceled' || accountStatus === 'past_due') && (
            <button 
              onClick={onManageSubscription} 
              disabled={isBillingPortalLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-xl text-xs transition-all"
            >
              {isBillingPortalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Otwórz panel zarządzania</>}
            </button>
          )}
        </div>
        
        <button 
          onClick={onLogout} 
          className="mt-4 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
